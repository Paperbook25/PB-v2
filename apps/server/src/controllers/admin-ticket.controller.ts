import type { Request, Response, NextFunction } from 'express'
import * as ticketService from '../services/admin-ticket.service.js'

export async function listTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ticketService.listTickets(req.query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ticketService.getTicket(String(req.params.id))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ticketService.createTicket(req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ticketService.updateTicket(String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function addResponse(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ticketService.addResponse(String(req.params.id), {
      ...req.body,
      authorId: req.user?.userId || req.user?.email || 'unknown',
      authorName: req.user?.name || 'Admin',
      authorType: 'gravity_admin',
    })
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function getTicketStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ticketService.getTicketStats()
    res.json({ data })
  } catch (err) { next(err) }
}
