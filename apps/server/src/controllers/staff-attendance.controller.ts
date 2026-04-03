import type { Request, Response, NextFunction } from 'express'
import * as staffAttendanceService from '../services/staff-attendance.service.js'
import * as leaveService from '../services/leave.service.js'
import { AppError } from '../utils/errors.js'
import {
  getStaffAttendanceSchema, staffAttendanceHistorySchema,
  staffAttendanceSummarySchema, listLeaveRequestsSchema,
} from '../validators/staff-attendance.validators.js'
import type {
  MarkStaffAttendanceInput, CreateLeaveRequestInput, UpdateLeaveRequestInput,
} from '../validators/staff-attendance.validators.js'

// ==================== Staff Attendance ====================

export async function markStaffAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const markedBy = req.user?.name || 'Unknown'
    const result = await staffAttendanceService.markStaffAttendance(req.body as MarkStaffAttendanceInput, markedBy)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function getStaffDailyAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getStaffAttendanceSchema.parse(req.query)
    const result = await staffAttendanceService.getStaffDailyAttendance(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStaffAttendanceHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const query = staffAttendanceHistorySchema.parse(req.query)
    const result = await staffAttendanceService.getStaffAttendanceHistory(String(req.params.id), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStaffAttendanceSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const query = staffAttendanceSummarySchema.parse(req.query)
    const result = await staffAttendanceService.getStaffAttendanceSummary(String(req.params.id), query)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Leave ====================

export async function getLeaveBalance(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await staffAttendanceService.getLeaveBalance(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function listAllLeaveRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listLeaveRequestsSchema.parse(req.query)
    const result = await staffAttendanceService.listAllLeaveRequests(query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function listStaffLeaveRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await staffAttendanceService.listStaffLeaveRequests(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function createLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await staffAttendanceService.createLeaveRequest(
      String(req.params.id), req.body as CreateLeaveRequestInput
    )
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function updateLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const reviewedBy = req.user?.name || 'Unknown'
    const result = await staffAttendanceService.updateLeaveRequest(
      String(req.params.id), req.body as UpdateLeaveRequestInput, reviewedBy
    )
    res.json(result)
  } catch (err) { next(err) }
}

export async function cancelLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.schoolId) throw AppError.badRequest('No school context')
    const result = await leaveService.cancelLeave(req.schoolId, String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}
