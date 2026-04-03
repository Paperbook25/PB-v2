import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

const msgStatusFromDb: Record<string, string> = {
  msg_sent: 'sent', msg_delivered: 'delivered', msg_read: 'read',
}

// ==================== Conversations ====================

export async function listConversations(schoolId: string, userId: string, filters: { studentId?: string; search?: string; page?: string; limit?: string }) {
  const page = parseInt(filters.page || '1')
  const limit = parseInt(filters.limit || '20')
  const skip = (page - 1) * limit

  // Find conversations where this user is a participant
  const participantRecords = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true },
  })
  const conversationIds = participantRecords.map(p => p.conversationId)

  if (conversationIds.length === 0) return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } }

  const where: any = { id: { in: conversationIds }, organizationId: schoolId }
  if (filters.studentId) where.studentId = filters.studentId

  const [data, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      include: {
        student: { select: { firstName: true, lastName: true, classId: true, sectionId: true } },
        participants: true,
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
      skip,
      take: limit,
    }),
    prisma.conversation.count({ where }),
  ])

  const formatted = data.map(c => {
    const myParticipant = c.participants.find(p => p.userId === userId)
    return {
      id: c.id,
      studentId: c.studentId,
      studentName: `${c.student.firstName} ${c.student.lastName}`.trim(),
      studentClass: c.student.classId,
      studentSection: c.student.sectionId,
      participants: c.participants.map(p => ({
        id: p.userId,
        name: p.name,
        type: p.type,
        avatar: p.avatar,
      })),
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt,
      lastMessageSenderId: c.lastSenderId,
      unreadCount: myParticipant?.unreadCount || 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }
  })

  return { data: formatted, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function createConversation(schoolId: string, userId: string, userName: string, userType: string, input: { studentId: string; participantIds: string[]; initialMessage?: string }) {
  const student = await prisma.student.findFirst({
    where: { id: input.studentId, organizationId: schoolId },
    select: { id: true, firstName: true, lastName: true },
  })
  if (!student) throw AppError.notFound('Student not found')

  const conversation = await prisma.conversation.create({
    data: {
      organizationId: schoolId,
      studentId: input.studentId,
      lastMessage: input.initialMessage || null,
      lastMessageAt: input.initialMessage ? new Date() : null,
      lastSenderId: input.initialMessage ? userId : null,
      participants: {
        create: [
          { userId, name: userName, type: userType },
          // Add other participants — resolve their names from user table
          ...await Promise.all(input.participantIds.filter(id => id !== userId).map(async (pId) => {
            const user = await prisma.user.findUnique({ where: { id: pId }, select: { name: true, role: true } })
            return { userId: pId, name: user?.name || 'Unknown', type: user?.role || 'teacher' }
          })),
        ],
      },
    },
    include: { participants: true, student: { select: { firstName: true, lastName: true } } },
  })

  // Send initial message if provided
  if (input.initialMessage) {
    await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        senderName: userName,
        senderType: userType,
        content: input.initialMessage,
      },
    })
  }

  return { data: { id: conversation.id, studentName: `${student.firstName} ${student.lastName}`.trim() } }
}

// ==================== Messages ====================

export async function listMessages(conversationId: string, userId: string, filters: { page?: string; limit?: string }) {
  const page = parseInt(filters.page || '1')
  const limit = parseInt(filters.limit || '50')
  const skip = (page - 1) * limit

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  })
  if (!participant) throw AppError.forbidden('Not a participant of this conversation')

  const [data, total] = await Promise.all([
    prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.conversationMessage.count({ where: { conversationId } }),
  ])

  // Mark as read — reset unread count for this user
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { unreadCount: 0 },
  })

  return {
    data: data.reverse().map(m => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.senderName,
      senderType: m.senderType,
      content: m.content,
      status: msgStatusFromDb[m.status] || m.status,
      createdAt: m.createdAt,
      readAt: m.readAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function sendMessage(conversationId: string, userId: string, userName: string, userType: string, content: string) {
  // Verify user is participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  })
  if (!participant) throw AppError.forbidden('Not a participant of this conversation')

  const message = await prisma.conversationMessage.create({
    data: {
      conversationId,
      senderId: userId,
      senderName: userName,
      senderType: userType,
      content,
    },
  })

  // Update conversation last message
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessage: content, lastMessageAt: new Date(), lastSenderId: userId },
  })

  // Increment unread count for other participants
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId: { not: userId } },
    data: { unreadCount: { increment: 1 } },
  })

  return {
    data: {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName: message.senderName,
      senderType: message.senderType,
      content: message.content,
      status: 'sent',
      createdAt: message.createdAt,
    },
  }
}
