import type { Request, Response, NextFunction } from 'express'
import * as studentLeaveService from '../services/student-leave.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) throw AppError.badRequest('No school context')
  return req.schoolId
}

// Student/parent applies for leave
export async function createLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const appliedBy = req.user?.email || req.user?.name || 'Unknown'
    const result = await studentLeaveService.createStudentLeaveRequest(
      getSchoolId(req),
      String(req.params.studentId),
      appliedBy,
      req.body
    )
    res.status(201).json(result)
  } catch (err) { next(err) }
}

// Admin/principal/teacher lists all leave requests
export async function listLeaveRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentLeaveService.listStudentLeaveRequests(getSchoolId(req), req.query as any)
    res.json(result)
  } catch (err) { next(err) }
}

// Parent views own children's leave requests
export async function getMyChildrenLeaveRequests(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.email) throw AppError.unauthorized('Authentication required')
    const result = await studentLeaveService.getMyChildrenLeaveRequests(getSchoolId(req), req.user.email)
    res.json(result)
  } catch (err) { next(err) }
}

// Admin/principal approves or rejects
export async function reviewLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const reviewedBy = req.user?.name || 'Unknown'
    const result = await studentLeaveService.updateStudentLeaveRequest(String(req.params.id), reviewedBy, req.body)
    res.json(result)
  } catch (err) { next(err) }
}

// Student/parent cancels own request
export async function cancelLeaveRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const cancelledBy = req.user?.email || 'Unknown'
    const result = await studentLeaveService.cancelStudentLeaveRequest(String(req.params.id), cancelledBy)
    res.json(result)
  } catch (err) { next(err) }
}
