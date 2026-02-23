import type { Request, Response, NextFunction } from 'express'
import * as attendanceService from '../services/attendance.service.js'
import {
  getDailyAttendanceSchema, getStudentsSchema, attendanceHistorySchema,
  attendanceReportSchema, attendanceSummarySchema, studentAttendanceSchema,
  getPeriodAttendanceSchema, periodSummarySchema,
} from '../validators/attendance.validators.js'
import type { MarkDailyAttendanceInput, MarkPeriodAttendanceInput, UpdatePeriodDefinitionInput } from '../validators/attendance.validators.js'

// ==================== Student Daily Attendance ====================

export async function getStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getStudentsSchema.parse(req.query)
    const result = await attendanceService.getStudentsForAttendance(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function markDailyAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const markedBy = req.user?.name || 'Unknown'
    const result = await attendanceService.markDailyAttendance(req.body as MarkDailyAttendanceInput, markedBy)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function getDailyAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getDailyAttendanceSchema.parse(req.query)
    const result = await attendanceService.getDailyAttendanceForDate(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getAttendanceHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const query = attendanceHistorySchema.parse(req.query)
    const result = await attendanceService.getAttendanceHistory(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getAttendanceReport(req: Request, res: Response, next: NextFunction) {
  try {
    const query = attendanceReportSchema.parse(req.query)
    const result = await attendanceService.getAttendanceReport(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getAttendanceSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const query = attendanceSummarySchema.parse(req.query)
    const result = await attendanceService.getAttendanceSummary(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStudentAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const query = studentAttendanceSchema.parse(req.query)
    const result = await attendanceService.getStudentAttendanceHistory(String(req.params.studentId), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getMyAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await attendanceService.getMyAttendance(req.user!.userId)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getMyChildrenAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await attendanceService.getMyChildrenAttendance(req.user!.userId)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Period Attendance ====================

export async function getPeriodDefinitions(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await attendanceService.getPeriodDefinitions()
    res.json(result)
  } catch (err) { next(err) }
}

export async function updatePeriodDefinition(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await attendanceService.updatePeriodDefinition(
      String(req.params.id), req.body as UpdatePeriodDefinitionInput
    )
    res.json(result)
  } catch (err) { next(err) }
}

export async function markPeriodAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await attendanceService.markPeriodAttendance(req.body as MarkPeriodAttendanceInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function getPeriodAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getPeriodAttendanceSchema.parse(req.query)
    const result = await attendanceService.getPeriodAttendance(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getPeriodSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const query = periodSummarySchema.parse(req.query)
    const result = await attendanceService.getPeriodSummary(query)
    res.json(result)
  } catch (err) { next(err) }
}
