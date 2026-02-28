import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  conversations,
  messages,
  meetings,
  ptmSlots,
  progressReports,
  getParentPortalStats,
} from '../data/parent-portal.data'
import type {
  Conversation,
  Message,
  Meeting,
} from '@/features/parent-portal/types/parent-portal.types'

export const parentPortalHandlers = [
  // ==================== STATS ====================
  http.get('/api/parent-portal/stats', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const parentId = url.searchParams.get('parentId') || undefined
    return HttpResponse.json({ data: getParentPortalStats(parentId) })
  }),

  // ==================== CONVERSATIONS ====================
  http.get('/api/parent-portal/conversations', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const search = url.searchParams.get('search')?.toLowerCase()
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...conversations]

    if (studentId) {
      filtered = filtered.filter((c) => c.studentId === studentId)
    }
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.studentName.toLowerCase().includes(search) ||
          c.participants.some((p) => p.name.toLowerCase().includes(search))
      )
    }

    // Sort by most recent message
    filtered.sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return dateB - dateA
    })

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  }),

  http.get('/api/parent-portal/conversations/:id', async ({ params }) => {
    await mockDelay('read')
    const conversation = conversations.find((c) => c.id === params.id)
    if (!conversation) {
      return HttpResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: conversation })
  }),

  http.post('/api/parent-portal/conversations', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as Record<string, unknown>

    const newConv: Conversation = {
      id: `CONV${Date.now()}`,
      studentId: body.studentId as string,
      studentName: body.studentName as string || '',
      studentClass: body.studentClass as string || '',
      studentSection: body.studentSection as string || '',
      participants: body.participants as Conversation['participants'] || [],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    conversations.unshift(newConv)

    // Add initial message if provided
    if (body.initialMessage) {
      const initialMsg: Message = {
        id: `MSG${newConv.id}-001`,
        conversationId: newConv.id,
        senderId: body.senderId as string,
        senderName: body.senderName as string || '',
        senderType: body.senderType as Message['senderType'] || 'parent',
        content: body.initialMessage as string,
        status: 'sent',
        createdAt: new Date().toISOString(),
      }
      messages.push(initialMsg)
      newConv.lastMessage = initialMsg.content
      newConv.lastMessageAt = initialMsg.createdAt
      newConv.lastMessageSenderId = initialMsg.senderId
    }

    return HttpResponse.json({ data: newConv }, { status: 201 })
  }),

  // ==================== MESSAGES ====================
  http.get('/api/parent-portal/conversations/:convId/messages', async ({ params, request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    const convMessages = messages
      .filter((m) => m.conversationId === params.convId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    const total = convMessages.length
    const start = (page - 1) * limit
    const paginated = convMessages.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  }),

  http.post('/api/parent-portal/conversations/:convId/messages', async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Record<string, unknown>

    const newMessage: Message = {
      id: `MSG${params.convId}-${Date.now()}`,
      conversationId: params.convId as string,
      senderId: body.senderId as string,
      senderName: body.senderName as string || '',
      senderType: body.senderType as Message['senderType'] || 'parent',
      senderAvatar: body.senderAvatar as string,
      content: body.content as string,
      status: 'sent',
      createdAt: new Date().toISOString(),
    }

    messages.push(newMessage)

    // Update conversation
    const conv = conversations.find((c) => c.id === params.convId)
    if (conv) {
      conv.lastMessage = newMessage.content
      conv.lastMessageAt = newMessage.createdAt
      conv.lastMessageSenderId = newMessage.senderId
      conv.updatedAt = new Date().toISOString()
    }

    return HttpResponse.json({ data: newMessage }, { status: 201 })
  }),

  http.patch('/api/parent-portal/messages/:id/read', async ({ params }) => {
    await mockDelay('read')
    const message = messages.find((m) => m.id === params.id)
    if (message) {
      message.status = 'read'
      message.readAt = new Date().toISOString()
    }
    return HttpResponse.json({ success: true })
  }),

  http.patch('/api/parent-portal/conversations/:convId/read', async ({ params }) => {
    await mockDelay('read')
    const conv = conversations.find((c) => c.id === params.convId)
    if (conv) {
      conv.unreadCount = 0
    }
    // Mark all messages in conversation as read
    messages
      .filter((m) => m.conversationId === params.convId)
      .forEach((m) => {
        m.status = 'read'
        m.readAt = m.readAt || new Date().toISOString()
      })
    return HttpResponse.json({ success: true })
  }),

  // ==================== MEETINGS ====================
  http.get('/api/parent-portal/meetings', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const status = url.searchParams.get('status')
    const type = url.searchParams.get('type')
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...meetings]

    if (studentId) {
      filtered = filtered.filter((m) => m.studentId === studentId)
    }
    if (status) {
      filtered = filtered.filter((m) => m.status === status)
    }
    if (type) {
      filtered = filtered.filter((m) => m.type === type)
    }
    if (dateFrom) {
      filtered = filtered.filter((m) => new Date(m.scheduledAt) >= new Date(dateFrom))
    }
    if (dateTo) {
      filtered = filtered.filter((m) => new Date(m.scheduledAt) <= new Date(dateTo))
    }

    // Sort by scheduled date (upcoming first)
    filtered.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  }),

  http.get('/api/parent-portal/meetings/:id', async ({ params }) => {
    await mockDelay('read')
    const meeting = meetings.find((m) => m.id === params.id)
    if (!meeting) {
      return HttpResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: meeting })
  }),

  http.post('/api/parent-portal/meetings', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as Record<string, unknown>

    const newMeeting: Meeting = {
      id: `MTG${Date.now()}`,
      studentId: body.studentId as string,
      studentName: body.studentName as string || '',
      studentClass: body.studentClass as string || '',
      studentSection: body.studentSection as string || '',
      parentId: body.parentId as string,
      parentName: body.parentName as string || '',
      teacherId: body.teacherId as string,
      teacherName: body.teacherName as string || '',
      type: body.type as Meeting['type'],
      subject: body.subject as string,
      description: body.description as string,
      scheduledAt: body.scheduledAt as string,
      duration: body.duration as number || 30,
      status: 'scheduled',
      venue: body.venue as string,
      meetingLink: body.meetingLink as string,
      parentNotes: body.parentNotes as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    meetings.push(newMeeting)
    return HttpResponse.json({ data: newMeeting }, { status: 201 })
  }),

  http.put('/api/parent-portal/meetings/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = meetings.findIndex((m) => m.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    const body = (await request.json()) as Partial<Meeting>
    meetings[index] = { ...meetings[index], ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json({ data: meetings[index] })
  }),

  http.patch('/api/parent-portal/meetings/:id/confirm', async ({ params }) => {
    await mockDelay('read')
    const index = meetings.findIndex((m) => m.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    meetings[index].status = 'confirmed'
    meetings[index].confirmedAt = new Date().toISOString()
    meetings[index].updatedAt = new Date().toISOString()
    return HttpResponse.json({ data: meetings[index] })
  }),

  http.patch('/api/parent-portal/meetings/:id/cancel', async ({ params, request }) => {
    await mockDelay('read')
    const index = meetings.findIndex((m) => m.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    const body = (await request.json()) as { reason?: string }
    meetings[index].status = 'cancelled'
    meetings[index].cancelledAt = new Date().toISOString()
    meetings[index].cancelReason = body.reason
    meetings[index].updatedAt = new Date().toISOString()
    return HttpResponse.json({ data: meetings[index] })
  }),

  http.patch('/api/parent-portal/meetings/:id/complete', async ({ params, request }) => {
    await mockDelay('read')
    const index = meetings.findIndex((m) => m.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    const body = (await request.json()) as { teacherNotes?: string }
    meetings[index].status = 'completed'
    meetings[index].completedAt = new Date().toISOString()
    meetings[index].teacherNotes = body.teacherNotes
    meetings[index].updatedAt = new Date().toISOString()
    return HttpResponse.json({ data: meetings[index] })
  }),

  http.delete('/api/parent-portal/meetings/:id', async ({ params }) => {
    await mockDelay('read')
    const index = meetings.findIndex((m) => m.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    meetings.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== PTM SLOTS ====================
  http.get('/api/parent-portal/ptm-slots', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const teacherId = url.searchParams.get('teacherId')
    const date = url.searchParams.get('date')
    const availableOnly = url.searchParams.get('availableOnly') === 'true'

    let filtered = [...ptmSlots]

    if (teacherId) {
      filtered = filtered.filter((s) => s.teacherId === teacherId)
    }
    if (date) {
      filtered = filtered.filter((s) => s.date === date)
    }
    if (availableOnly) {
      filtered = filtered.filter((s) => s.isAvailable)
    }

    return HttpResponse.json({ data: filtered })
  }),

  http.post('/api/parent-portal/ptm-slots/:slotId/book', async ({ params, request }) => {
    await mockDelay('write')
    const slot = ptmSlots.find((s) => s.id === params.slotId)
    if (!slot) {
      return HttpResponse.json({ error: 'Slot not found' }, { status: 404 })
    }
    if (!slot.isAvailable) {
      return HttpResponse.json({ error: 'Slot is not available' }, { status: 400 })
    }

    const body = (await request.json()) as Record<string, unknown>

    // Create a meeting from the slot booking
    const newMeeting: Meeting = {
      id: `MTG${Date.now()}`,
      studentId: body.studentId as string,
      studentName: body.studentName as string || '',
      studentClass: body.studentClass as string || '',
      studentSection: body.studentSection as string || '',
      parentId: body.parentId as string,
      parentName: body.parentName as string || '',
      teacherId: slot.teacherId,
      teacherName: slot.teacherName,
      type: 'ptm',
      subject: 'Parent-Teacher Meeting',
      scheduledAt: `${slot.date}T${slot.startTime}:00`,
      duration: 30,
      status: 'scheduled',
      parentNotes: body.parentNotes as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    meetings.push(newMeeting)

    // Update slot availability
    slot.currentBookings++
    if (slot.currentBookings >= slot.maxBookings) {
      slot.isAvailable = false
    }

    return HttpResponse.json({ data: newMeeting }, { status: 201 })
  }),

  // ==================== PROGRESS REPORTS ====================
  http.get('/api/parent-portal/progress-reports', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')

    let filtered = [...progressReports]

    if (studentId) {
      filtered = filtered.filter((r) => r.studentId === studentId)
    }

    return HttpResponse.json({ data: filtered })
  }),

  http.get('/api/parent-portal/progress-reports/:id', async ({ params }) => {
    await mockDelay('read')
    const report = progressReports.find((r) => r.id === params.id)
    if (!report) {
      return HttpResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: report })
  }),
]
