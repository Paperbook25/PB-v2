import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import {
  getLeaveBalance as _getLeaveBalance,
  listAllLeaveRequests as _listAllLeaveRequests,
  listStaffLeaveRequests as _listStaffLeaveRequests,
  createLeaveRequest as _createLeaveRequest,
  updateLeaveRequest as _updateLeaveRequest,
} from './staff-attendance.service.js'

// ==================== Enum Mappers ====================

const leaveStatusFromDb: Record<string, string> = {
  leave_pending: 'pending',
  leave_approved: 'approved',
  leave_rejected: 'rejected',
  leave_cancelled: 'cancelled',
}

// ==================== Re-exported from staff-attendance ====================

export const getLeaveBalance = _getLeaveBalance
export const listAllLeaveRequests = _listAllLeaveRequests
export const listStaffLeaveRequests = _listStaffLeaveRequests
export const createLeaveRequest = _createLeaveRequest

// ==================== Get Leave Request By ID ====================

export async function getLeaveRequestById(schoolId: string, id: string) {
  const request = await prisma.leaveRequest.findFirst({
    where: { id, organizationId: schoolId },
    include: {
      staff: { select: { firstName: true, lastName: true, employeeId: true } },
    },
  })
  if (!request) throw AppError.notFound('Leave request not found')

  return {
    data: {
      id: request.id,
      staffId: request.staffId,
      staffName: `${request.staff.firstName} ${request.staff.lastName}`.trim(),
      employeeId: request.staff.employeeId,
      type: request.type,
      startDate: request.startDate,
      endDate: request.endDate,
      days: request.days,
      reason: request.reason,
      status: leaveStatusFromDb[request.status] || request.status,
      reviewedBy: request.reviewedBy,
      reviewRemarks: request.reviewRemarks,
      reviewedAt: request.reviewedAt,
      createdAt: request.createdAt,
    },
  }
}

// ==================== Approve Leave ====================

export async function approveLeave(schoolId: string, id: string, approvedBy: string) {
  return _updateLeaveRequest(id, { status: 'approved' }, approvedBy)
}

// ==================== Reject Leave ====================

export async function rejectLeave(schoolId: string, id: string, rejectedBy: string, reason?: string) {
  return _updateLeaveRequest(id, { status: 'rejected', reviewRemarks: reason }, rejectedBy)
}

// ==================== Cancel Leave ====================

export async function cancelLeave(schoolId: string, id: string) {
  const request = await prisma.leaveRequest.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!request) throw AppError.notFound('Leave request not found')

  if (request.status !== 'leave_pending' && request.status !== 'leave_approved') {
    throw AppError.badRequest('Can only cancel pending or approved leave requests')
  }

  // If it was approved, restore the leave balance
  if (request.status === 'leave_approved') {
    const academicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true, organizationId: schoolId },
    })
    if (academicYear) {
      await prisma.leaveBalance.updateMany({
        where: {
          staffId: request.staffId,
          type: request.type,
          academicYearId: academicYear.id,
        },
        data: { used: { decrement: request.days } },
      })
    }
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: { status: 'leave_cancelled' },
    include: {
      staff: { select: { firstName: true, lastName: true, employeeId: true } },
    },
  })

  return {
    data: {
      id: updated.id,
      staffId: updated.staffId,
      staffName: `${updated.staff.firstName} ${updated.staff.lastName}`.trim(),
      type: updated.type,
      startDate: updated.startDate,
      endDate: updated.endDate,
      days: updated.days,
      reason: updated.reason,
      status: 'cancelled',
      createdAt: updated.createdAt,
    },
  }
}

// ==================== Leave Stats ====================

export async function getLeaveStats(schoolId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [pendingCount, approvedToday, totalOnLeaveToday] = await Promise.all([
    prisma.leaveRequest.count({
      where: { organizationId: schoolId, status: 'leave_pending' },
    }),
    prisma.leaveRequest.count({
      where: {
        organizationId: schoolId,
        status: 'leave_approved',
        reviewedAt: { gte: today, lt: tomorrow },
      },
    }),
    prisma.leaveRequest.count({
      where: {
        organizationId: schoolId,
        status: 'leave_approved',
        startDate: { lte: today },
        endDate: { gte: today },
      },
    }),
  ])

  return {
    data: {
      pendingCount,
      approvedToday,
      totalOnLeaveToday,
    },
  }
}
