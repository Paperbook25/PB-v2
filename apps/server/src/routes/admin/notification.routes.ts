import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import * as notificationService from '../../services/admin-notification.service.js'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.getNotifications(req.user!.userId)
    res.json(result)
  } catch (err) { next(err) }
})

router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAsRead(String(req.params.id))
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.post('/mark-all-read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllAsRead(req.user!.userId)
    res.json({ success: true })
  } catch (err) { next(err) }
})

export default router
