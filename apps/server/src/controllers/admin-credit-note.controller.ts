import type { Request, Response, NextFunction } from 'express'
import * as creditNoteService from '../services/admin-credit-note.service.js'

export async function listCreditNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await creditNoteService.listCreditNotes(req.query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function createCreditNote(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await creditNoteService.createCreditNote(req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function issueCreditNote(req: Request, res: Response, next: NextFunction) {
  try {
    const issuedBy = req.user?.name || 'Admin'
    const data = await creditNoteService.issueCreditNote(String(req.params.id), issuedBy)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function applyCreditNote(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await creditNoteService.applyCreditNote(String(req.params.id))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function cancelCreditNote(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await creditNoteService.cancelCreditNote(String(req.params.id))
    res.json({ data })
  } catch (err) { next(err) }
}
