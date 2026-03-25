import type { Request, Response, NextFunction } from 'express'
import * as leaveService from '../services/leave.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Leave operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== List Leave Requests ====================

export async function listLeaveRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
      status: req.query.status as 'pending' | 'approved' | 'rejected' | 'cancelled' | undefined,
      staffId: req.query.staffId as string | undefined,
    }
    const result = await leaveService.listAllLeaveRequests(query)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Get Leave Request By ID ====================

export async function getLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await leaveService.getLeaveRequestById(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Apply Leave ====================

export async function applyLeave(req: Request, res: Response, next: NextFunction) {
  try {
    const staffId = req.body.staffId || req.params.staffId
    if (!staffId) throw AppError.badRequest('staffId is required')
    const result = await leaveService.createLeaveRequest(staffId, req.body)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

// ==================== Approve Leave ====================

export async function approveLeave(req: Request, res: Response, next: NextFunction) {
  try {
    const approvedBy = req.user?.name || 'Unknown'
    const result = await leaveService.approveLeave(getSchoolId(req), String(req.params.id), approvedBy)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Reject Leave ====================

export async function rejectLeave(req: Request, res: Response, next: NextFunction) {
  try {
    const rejectedBy = req.user?.name || 'Unknown'
    const reason = req.body.reason as string | undefined
    const result = await leaveService.rejectLeave(getSchoolId(req), String(req.params.id), rejectedBy, reason)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Cancel Leave ====================

export async function cancelLeave(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await leaveService.cancelLeave(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Get Leave Balance ====================

export async function getLeaveBalance(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await leaveService.getLeaveBalance(String(req.params.staffId))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Get Staff Leave Requests ====================

export async function getStaffLeaveRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await leaveService.listStaffLeaveRequests(String(req.params.staffId))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Leave Stats ====================

export async function getLeaveStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await leaveService.getLeaveStats(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}
