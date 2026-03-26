import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import * as healthService from '../../services/admin-health.service.js'

const router = Router()

router.get('/status', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await healthService.getStatus() }) } catch (err) { next(err) }
})

router.get('/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await healthService.getMetrics({ period: req.query.period as string }) }) } catch (err) { next(err) }
})

router.get('/alerts', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await healthService.getAlerts() }) } catch (err) { next(err) }
})

router.patch('/alerts/:id/resolve', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await healthService.resolveAlert(String(req.params.id), req.user?.userId)) } catch (err) { next(err) }
})

router.post('/alerts', async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json({ data: await healthService.createAlert(req.body) }) } catch (err) { next(err) }
})

export default router
