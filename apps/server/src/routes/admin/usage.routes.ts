import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import * as usageService from '../../services/admin-usage.service.js'

const router = Router()

router.get('/overview', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await usageService.getOverview() }) } catch (err) { next(err) }
})

router.get('/schools', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await usageService.getSchoolUsage() }) } catch (err) { next(err) }
})

router.get('/schools/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await usageService.getSchoolUsageDetail(String(req.params.id)) }) } catch (err) { next(err) }
})

export default router
