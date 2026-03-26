import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import * as annService from '../../services/admin-announcement.service.js'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await annService.listAnnouncements({
      page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20,
      status: req.query.status as string,
    })
    res.json(result)
  } catch (err) { next(err) }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await annService.getAnnouncement(String(req.params.id))
    res.json({ data })
  } catch (err) { next(err) }
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await annService.createAnnouncement({ ...req.body, createdBy: req.user?.userId })
    res.status(201).json({ data })
  } catch (err) { next(err) }
})

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await annService.updateAnnouncement(String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
})

router.post('/:id/send', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await annService.sendAnnouncement(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await annService.deleteAnnouncement(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
})

export default router
