import type { Request, Response, NextFunction } from 'express'
import * as reportService from '../services/report.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Report operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Student Report ====================

export async function getStudentReport(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reportService.getStudentReport(getSchoolId(req), String(req.params.studentId))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Class Report ====================

export async function getClassReport(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reportService.getClassReport(getSchoolId(req), String(req.params.classId))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Exam Report ====================

export async function getExamReport(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reportService.getExamReport(getSchoolId(req), String(req.params.examId))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Attendance Report ====================

export async function getAttendanceReport(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      classId: req.query.classId as string | undefined,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    }
    if (!query.startDate || !query.endDate) {
      throw AppError.badRequest('startDate and endDate are required')
    }
    const result = await reportService.getAttendanceReport(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Fee Collection Report ====================

export async function getFeeCollectionReport(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      academicYear: req.query.academicYear as string | undefined,
    }
    const result = await reportService.getFeeCollectionReport(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== School Overview Report ====================

export async function getSchoolOverviewReport(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reportService.getSchoolOverviewReport(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}
