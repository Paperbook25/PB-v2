import type { Request, Response, NextFunction } from 'express'
import * as parentPortalService from '../services/parent-portal.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Parent portal operations require a school subdomain.')
  }
  return req.schoolId
}

function getParentEmail(req: Request): string {
  if (!req.user?.email) {
    throw AppError.unauthorized('Parent authentication required')
  }
  return req.user.email
}

// ==================== Child Overview ====================

export async function getChildOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await parentPortalService.getChildOverview(
      getSchoolId(req),
      getParentEmail(req)
    )
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== Child Attendance ====================

export async function getChildAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const { month, year } = req.query
    const data = await parentPortalService.getChildAttendance(
      getSchoolId(req),
      String(req.params.studentId),
      {
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
      }
    )
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== Child Fees ====================

export async function getChildFees(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await parentPortalService.getChildFees(
      getSchoolId(req),
      String(req.params.studentId)
    )
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== Child Marks ====================

export async function getChildMarks(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await parentPortalService.getChildMarks(
      getSchoolId(req),
      String(req.params.studentId)
    )
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== Announcements ====================

export async function getAnnouncements(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await parentPortalService.getAnnouncements(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}
