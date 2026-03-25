import type { Request, Response, NextFunction } from 'express'
import * as analyticsService from '../services/analytics.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Analytics operations require a school subdomain.')
  }
  return req.schoolId
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const query = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      pageSlug: req.query.pageSlug as string | undefined,
    }
    const result = await analyticsService.getAnalytics(schoolId, query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getAnalyticsSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const summary = await analyticsService.getAnalyticsSummary(schoolId)
    res.json({ data: summary })
  } catch (err) { next(err) }
}
