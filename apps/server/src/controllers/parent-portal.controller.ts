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

// Verify the parent has access to the specified student
async function verifyParentOwnership(req: Request, studentId: string): Promise<void> {
  // Admins/principals bypass ownership check
  if (req.user?.role === 'admin' || req.user?.role === 'principal') return

  const student = await parentPortalService.verifyParentStudent(
    getSchoolId(req),
    getParentEmail(req),
    studentId
  )
  if (!student) {
    throw AppError.forbidden('You do not have access to this student\'s data')
  }
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
    const studentId = String(req.params.studentId)
    await verifyParentOwnership(req, studentId)
    const { month, year } = req.query
    const data = await parentPortalService.getChildAttendance(
      getSchoolId(req),
      studentId,
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
    const studentId = String(req.params.studentId)
    await verifyParentOwnership(req, studentId)
    const data = await parentPortalService.getChildFees(
      getSchoolId(req),
      studentId
    )
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== Child Marks ====================

export async function getChildMarks(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = String(req.params.studentId)
    await verifyParentOwnership(req, studentId)
    const data = await parentPortalService.getChildMarks(
      getSchoolId(req),
      studentId
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
