import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import * as settingsService from '../../services/admin-platform-settings.service.js'

const router = Router()

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.getAllSettings()
    res.json({ data: settings })
  } catch (err) { next(err) }
})

router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await settingsService.updateSettings(req.body, req.user?.name || 'Admin')
    res.json({ data: result })
  } catch (err) { next(err) }
})

export default router
