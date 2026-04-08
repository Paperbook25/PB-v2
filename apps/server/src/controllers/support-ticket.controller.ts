import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/db.js'

const statusFromDb: Record<string, string> = {
  ticket_open: 'open',
  ticket_in_progress: 'in_progress',
  ticket_waiting: 'waiting',
  ticket_resolved: 'resolved',
  ticket_closed: 'closed',
}

function mapTicket(t: any) {
  return {
    ...t,
    status: statusFromDb[t.status] || t.status,
    priority: String(t.priority).replace('ticket_', ''),
    // Filter out internal notes from school-side view
    responses: (t.responses || []).filter((r: any) => !r.isInternal),
  }
}

export async function listMyTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.user!.organizationId!
    const tickets = await prisma.supportTicket.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      include: { responses: { where: { isInternal: false }, orderBy: { createdAt: 'asc' }, take: 1 } },
    })
    const stats = {
      open: tickets.filter(t => t.status === 'ticket_open').length,
      inProgress: tickets.filter(t => t.status === 'ticket_in_progress').length,
      waiting: tickets.filter(t => t.status === 'ticket_waiting').length,
      resolved: tickets.filter(t => ['ticket_resolved', 'ticket_closed'].includes(t.status)).length,
    }
    res.json({ data: tickets.map(mapTicket), stats })
  } catch (err) { next(err) }
}

export async function getMyTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.user!.organizationId!
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: String(req.params.id) },
      include: { responses: { where: { isInternal: false }, orderBy: { createdAt: 'asc' } } },
    })
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' })
    if (ticket.schoolId !== schoolId) return res.status(403).json({ error: 'Access denied' })
    res.json({ data: mapTicket(ticket) })
  } catch (err) { next(err) }
}

export async function createMyTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.user!.organizationId!
    const { subject, description, category, priority } = req.body
    if (!subject?.trim() || !description?.trim()) {
      return res.status(400).json({ error: 'Subject and description are required' })
    }
    const org = await prisma.organization.findUnique({ where: { id: schoolId }, select: { name: true } })
    const ticket = await prisma.supportTicket.create({
      data: {
        schoolId,
        schoolName: org?.name || '',
        subject: String(subject).trim(),
        description: String(description).trim(),
        category: category || 'general',
        priority: `ticket_${priority || 'medium'}` as any,
        status: 'ticket_open',
        reportedBy: req.user!.email || req.user!.userId,
      },
    })
    res.status(201).json({ data: mapTicket(ticket) })
  } catch (err) { next(err) }
}

export async function addMyResponse(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.user!.organizationId!
    const ticketId = String(req.params.id)
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' })
    if (ticket.schoolId !== schoolId) return res.status(403).json({ error: 'Access denied' })

    const response = await (prisma as any).ticketResponse.create({
      data: {
        ticketId,
        content: req.body.content,
        authorId: req.user!.userId,
        authorName: req.user!.name || req.user!.email || 'School User',
        authorType: 'school_user',
        isInternal: false,
      },
    })
    // Re-open if ticket was resolved/closed so admin sees the new reply
    if (['ticket_resolved', 'ticket_closed'].includes(ticket.status)) {
      await prisma.supportTicket.update({ where: { id: ticketId }, data: { status: 'ticket_open' } })
    }
    res.status(201).json({ data: response })
  } catch (err) { next(err) }
}
