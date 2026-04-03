import type { Request, Response, NextFunction } from 'express'
import * as featureUsageService from '../services/admin-feature-usage.service.js'
import { backfillUsageAggregation } from '../jobs/feature-usage-aggregation.js'

export async function aggregateUsage(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await featureUsageService.aggregateUsage()
    res.json(result)
  } catch (err) { next(err) }
}

export async function backfillAggregation(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await backfillUsageAggregation()
    res.json({ success: true, ...result })
  } catch (err) { next(err) }
}

export async function getFeatureUsageSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(req.query.days as string) || 30
    const data = await featureUsageService.getFeatureUsageSummary(days)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getSchoolFeatureUsage(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(req.query.days as string) || 30
    const data = await featureUsageService.getSchoolFeatureUsage(String(req.params.schoolId), days)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getFeatureUsageTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(req.query.days as string) || 30
    const module = req.query.module as string | undefined
    const data = await featureUsageService.getFeatureUsageTrends(days, module)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getChurnRiskSchools(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await featureUsageService.getChurnRiskSchools()
    res.json({ data })
  } catch (err) { next(err) }
}
