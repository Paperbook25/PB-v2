import type { Request, Response, NextFunction } from 'express'
import * as formAnalyticsService from '../services/form-analytics.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Form analytics operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Public: Track Events ====================

export async function trackEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const { events } = req.body

    if (!Array.isArray(events) || events.length === 0) {
      throw AppError.badRequest('events must be a non-empty array')
    }

    if (events.length > 100) {
      throw AppError.badRequest('Maximum 100 events per batch')
    }

    // Validate each event has required fields
    for (const evt of events) {
      if (!evt.formType || !evt.sessionId || !evt.fieldName || !evt.action) {
        throw AppError.badRequest('Each event must have formType, sessionId, fieldName, and action')
      }
    }

    const result = await formAnalyticsService.trackEvents(schoolId, events)
    res.status(201).json({ data: result })
  } catch (err) { next(err) }
}

// ==================== Admin: Get Form Stats ====================

export async function getFormStats(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const formType = (req.query.formType as string) || 'contact'
    const dateRange = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    }

    const stats = await formAnalyticsService.getFormStats(schoolId, formType, dateRange)
    res.json({ data: stats })
  } catch (err) { next(err) }
}

// ==================== Admin: Get Conversion Funnel ====================

export async function getConversionFunnel(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const dateRange = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    }

    const funnel = await formAnalyticsService.getConversionFunnel(schoolId, dateRange)
    res.json({ data: funnel })
  } catch (err) { next(err) }
}

// ==================== Admin: Get Field Drop-offs ====================

export async function getFieldDropoffs(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const formType = (req.query.formType as string) || 'contact'
    const dateRange = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    }

    const dropoffs = await formAnalyticsService.getFieldDropoffs(schoolId, formType, dateRange)
    res.json({ data: dropoffs })
  } catch (err) { next(err) }
}

// ==================== Admin: Get Form Trends ====================

export async function getFormTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const formType = (req.query.formType as string) || 'contact'
    const dateRange = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    }

    const trends = await formAnalyticsService.getFormTrends(schoolId, formType, dateRange)
    res.json({ data: trends })
  } catch (err) { next(err) }
}
