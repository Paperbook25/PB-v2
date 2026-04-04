import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import * as analyticsService from '../../services/admin-analytics.service.js'

const router = Router()

router.get('/overview', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await analyticsService.getOverview() }) } catch (err) { next(err) }
})

router.get('/feature-adoption', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await analyticsService.getFeatureAdoption() }) } catch (err) { next(err) }
})

router.get('/benchmarks', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await analyticsService.getBenchmarks() }) } catch (err) { next(err) }
})

router.get('/trends', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await analyticsService.getTrends() }) } catch (err) { next(err) }
})

router.get('/cohort', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await analyticsService.getCohortAnalysis() }) } catch (err) { next(err) }
})

router.get('/funnel', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await analyticsService.getFunnelAnalysis() }) } catch (err) { next(err) }
})

router.get('/ltv', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await analyticsService.getLtvAnalysis() }) } catch (err) { next(err) }
})

export default router
