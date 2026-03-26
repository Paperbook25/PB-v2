import type { Request, Response, NextFunction } from 'express'
import * as billingService from '../services/admin-billing.service.js'

export async function listInvoices(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await billingService.listInvoices({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status as string,
      schoolId: req.query.schoolId as string,
      search: req.query.search as string,
      from: req.query.from as string,
      to: req.query.to as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await billingService.getInvoice(String(req.params.id))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await billingService.createInvoice(req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await billingService.updateInvoice(String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function sendInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await billingService.sendInvoice(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function cancelInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await billingService.cancelInvoice(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function recordPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await billingService.recordPayment(String(req.params.id), {
      ...req.body,
      recordedBy: req.user?.userId,
    })
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function getRevenueSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await billingService.getRevenueSummary()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function listPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await billingService.listPayments({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      search: req.query.search as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}
