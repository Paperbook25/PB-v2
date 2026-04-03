import type { Request, Response, NextFunction } from 'express'
import * as attendanceService from '../services/attendance.service.js'
import { AppError } from '../utils/errors.js'
import {
  getDailyAttendanceSchema, getStudentsSchema, attendanceHistorySchema,
  attendanceReportSchema, attendanceSummarySchema, studentAttendanceSchema,
  getPeriodAttendanceSchema, periodSummarySchema,
} from '../validators/attendance.validators.js'
import type { MarkDailyAttendanceInput, MarkPeriodAttendanceInput, UpdatePeriodDefinitionInput } from '../validators/attendance.validators.js'

// Helper: extract and validate schoolId from tenant middleware
function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Attendance operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Student Daily Attendance ====================

export async function getStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getStudentsSchema.parse(req.query)
    const result = await attendanceService.getStudentsForAttendance(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function markDailyAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const markedBy = req.user?.name || 'Unknown'
    const result = await attendanceService.markDailyAttendance(getSchoolId(req), req.body as MarkDailyAttendanceInput, markedBy)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function getDailyAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getDailyAttendanceSchema.parse(req.query)
    const result = await attendanceService.getDailyAttendanceForDate(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getAttendanceHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const query = attendanceHistorySchema.parse(req.query)
    const result = await attendanceService.getAttendanceHistory(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getAttendanceReport(req: Request, res: Response, next: NextFunction) {
  try {
    const query = attendanceReportSchema.parse(req.query)
    const result = await attendanceService.getAttendanceReport(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getAttendanceSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const query = attendanceSummarySchema.parse(req.query)
    const result = await attendanceService.getAttendanceSummary(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStudentAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const query = studentAttendanceSchema.parse(req.query)
    const result = await attendanceService.getStudentAttendanceHistory(getSchoolId(req), String(req.params.studentId), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getMyAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await attendanceService.getMyAttendance(getSchoolId(req), req.user!.userId)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getMyChildrenAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await attendanceService.getMyChildrenAttendance(getSchoolId(req), req.user!.userId)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Period Attendance ====================

export async function getPeriodDefinitions(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await attendanceService.getPeriodDefinitions(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}

export async function updatePeriodDefinition(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await attendanceService.updatePeriodDefinition(
      getSchoolId(req), String(req.params.id), req.body as UpdatePeriodDefinitionInput
    )
    res.json(result)
  } catch (err) { next(err) }
}

export async function markPeriodAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await attendanceService.markPeriodAttendance(getSchoolId(req), req.body as MarkPeriodAttendanceInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function getPeriodAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getPeriodAttendanceSchema.parse(req.query)
    const result = await attendanceService.getPeriodAttendance(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getPeriodSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const query = periodSummarySchema.parse(req.query)
    const result = await attendanceService.getPeriodSummary(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Attendance Policy ====================

export async function getAttendancePolicy(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await attendanceService.getAttendancePolicy(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function updateAttendancePolicy(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await attendanceService.updateAttendancePolicy(getSchoolId(req), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function listAttendanceAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await attendanceService.listAttendanceAlerts(getSchoolId(req), req.query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function acknowledgeAttendanceAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await attendanceService.acknowledgeAlert(String(req.params.id), req.user?.name || 'Unknown')
    res.json({ data })
  } catch (err) { next(err) }
}
