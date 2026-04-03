import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

const statusFromDb: Record<string, string> = {
  ticket_open: 'open', ticket_in_progress: 'in_progress',
  ticket_waiting: 'waiting', ticket_resolved: 'resolved', ticket_closed: 'closed',
}
const statusToDb: Record<string, string> = {
  open: 'ticket_open', in_progress: 'ticket_in_progress',
  waiting: 'ticket_waiting', resolved: 'ticket_resolved', closed: 'ticket_closed',
}
const priorityFromDb: Record<string, string> = {
  ticket_low: 'low', ticket_medium: 'medium', ticket_high: 'high', ticket_urgent: 'urgent',
}

function formatTicket(t: any) {
  return {
    id: t.id, schoolId: t.schoolId, schoolName: t.schoolName,
    subject: t.subject, description: t.description, category: t.category,
    priority: priorityFromDb[t.priority] || t.priority,
    status: statusFromDb[t.status] || t.status,
    assignedTo: t.assignedTo, assignedName: t.assignedName,
    reportedBy: t.reportedBy,
    resolvedAt: t.resolvedAt, closedAt: t.closedAt,
    createdAt: t.createdAt, updatedAt: t.updatedAt,
    responseCount: t._count?.responses || t.responses?.length || 0,
  }
}

export async function listTickets(filters: {
  status?: string; priority?: string; schoolId?: string;
  assignedTo?: string; category?: string;
  page?: string; limit?: string;
}) {
  const page = parseInt(filters.page || '1')
  const limit = parseInt(filters.limit || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (filters.status && statusToDb[filters.status]) where.status = statusToDb[filters.status]
  if (filters.priority) where.priority = `ticket_${filters.priority}`
  if (filters.schoolId) where.schoolId = filters.schoolId
  if (filters.assignedTo) where.assignedTo = filters.assignedTo
  if (filters.category) where.category = filters.category

  const [data, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where, include: { _count: { select: { responses: true } } },
      orderBy: { createdAt: 'desc' }, skip, take: limit,
    }),
    prisma.supportTicket.count({ where }),
  ])

  return {
    data: data.map(formatTicket),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getTicket(id: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: { responses: { orderBy: { createdAt: 'asc' } } },
  })
  if (!ticket) throw AppError.notFound('Ticket not found')

  return {
    ...formatTicket(ticket),
    responses: ticket.responses.map(r => ({
      id: r.id, authorId: r.authorId, authorName: r.authorName,
      authorType: r.authorType, content: r.content,
      isInternal: r.isInternal, createdAt: r.createdAt,
    })),
  }
}

export async function createTicket(input: {
  schoolId: string; schoolName: string; subject: string;
  description: string; category?: string; priority?: string; reportedBy?: string;
}) {
  return prisma.supportTicket.create({
    data: {
      schoolId: input.schoolId, schoolName: input.schoolName,
      subject: input.subject, description: input.description,
      category: input.category || 'general',
      priority: (`ticket_${input.priority || 'medium'}`) as any,
      reportedBy: input.reportedBy,
    },
  })
}

export async function updateTicket(id: string, input: {
  status?: string; priority?: string; assignedTo?: string; assignedName?: string;
}) {
  const data: any = {}
  if (input.status) {
    data.status = statusToDb[input.status] || input.status
    if (input.status === 'resolved') data.resolvedAt = new Date()
    if (input.status === 'closed') data.closedAt = new Date()
  }
  if (input.priority) data.priority = `ticket_${input.priority}`
  if (input.assignedTo !== undefined) { data.assignedTo = input.assignedTo; data.assignedName = input.assignedName }

  return prisma.supportTicket.update({ where: { id }, data })
}

export async function addResponse(ticketId: string, input: {
  authorId: string; authorName: string; authorType: string;
  content: string; isInternal?: boolean;
}) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
  if (!ticket) throw AppError.notFound('Ticket not found')

  const response = await prisma.ticketResponse.create({
    data: {
      ticketId, authorId: input.authorId, authorName: input.authorName,
      authorType: input.authorType, content: input.content,
      isInternal: input.isInternal ?? false,
    },
  })

  // Auto-update ticket status if gravity admin responds
  if (input.authorType === 'gravity_admin' && ticket.status === 'ticket_open') {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'ticket_in_progress' },
    })
  }

  return response
}

export async function getTicketStats() {
  const [open, inProgress, waiting, resolved, total] = await Promise.all([
    prisma.supportTicket.count({ where: { status: 'ticket_open' } }),
    prisma.supportTicket.count({ where: { status: 'ticket_in_progress' } }),
    prisma.supportTicket.count({ where: { status: 'ticket_waiting' } }),
    prisma.supportTicket.count({ where: { status: 'ticket_resolved' } }),
    prisma.supportTicket.count(),
  ])

  // Avg resolution time (for resolved tickets in last 30 days)
  const recentResolved = await prisma.supportTicket.findMany({
    where: { status: { in: ['ticket_resolved', 'ticket_closed'] }, resolvedAt: { not: null } },
    select: { createdAt: true, resolvedAt: true },
    take: 100,
    orderBy: { resolvedAt: 'desc' },
  })

  const avgResolutionHours = recentResolved.length > 0
    ? recentResolved.reduce((sum, t) => {
        const hours = (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60)
        return sum + hours
      }, 0) / recentResolved.length
    : 0

  return { open, inProgress, waiting, resolved, total, avgResolutionHours: Math.round(avgResolutionHours) }
}
