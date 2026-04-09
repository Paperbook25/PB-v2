import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import * as leadService from '../../services/admin-lead.service.js'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await leadService.listLeads({
      page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 50,
      status: req.query.status as string, source: req.query.source as string,
      search: req.query.search as string, assignedTo: req.query.assignedTo as string,
    })
    res.json(result)
  } catch (err) { next(err) }
})

router.get('/pipeline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await leadService.getPipelineView()
    res.json({ data })
  } catch (err) { next(err) }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await leadService.getLead(String(req.params.id))
    res.json({ data })
  } catch (err) { next(err) }
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await leadService.createLead(req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await leadService.updateLead(String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
})

router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await leadService.updateLeadStatus(String(req.params.id), req.body.status, req.user?.userId)
    res.json(result)
  } catch (err) { next(err) }
})

router.post('/:id/activities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await leadService.addLeadActivity(String(req.params.id), {
      ...req.body, createdBy: req.user?.userId,
    })
    res.status(201).json({ data })
  } catch (err) { next(err) }
})

router.post('/:id/send-activation', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sentByName = (req.user as any)?.name || (req.user as any)?.email || 'Gravity Admin'
    const result = await leadService.sendActivationLink(String(req.params.id), sentByName)
    res.json(result)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await leadService.deleteLead(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
})

export default router
