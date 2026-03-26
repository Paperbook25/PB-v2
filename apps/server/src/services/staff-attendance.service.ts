import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import type {
  MarkStaffAttendanceInput, GetStaffAttendanceInput,
  StaffAttendanceHistoryInput, StaffAttendanceSummaryInput,
  CreateLeaveRequestInput, UpdateLeaveRequestInput, ListLeaveRequestsInput,
} from '../validators/staff-attendance.validators.js'

// ==================== Enum Mappers ====================

const staffStatusToDb: Record<string, string> = {
  present: 'staff_present', absent: 'staff_absent',
  half_day: 'staff_half_day', on_leave: 'staff_on_leave',
}
const staffStatusFromDb: Record<string, string> = {
  staff_present: 'present', staff_absent: 'absent',
  staff_half_day: 'half_day', staff_on_leave: 'on_leave',
}

const leaveStatusToDb: Record<string, string> = {
  pending: 'leave_pending', approved: 'leave_approved',
  rejected: 'leave_rejected', cancelled: 'leave_cancelled',
}
const leaveStatusFromDb: Record<string, string> = {
  leave_pending: 'pending', leave_approved: 'approved',
  leave_rejected: 'rejected', leave_cancelled: 'cancelled',
}

function formatStaffAttendance(r: any) {
  return {
    id: r.id,
    date: r.date,
    staffId: r.staffId,
    staffName: r.staff ? `${r.staff.firstName} ${r.staff.lastName}`.trim() : undefined,
    employeeId: r.staff?.employeeId,
    department: r.staff?.department?.name,
    status: staffStatusFromDb[r.status] || r.status,
    checkInTime: r.checkInTime,
    checkOutTime: r.checkOutTime,
    remarks: r.remarks,
    markedBy: r.markedBy,
  }
}

// ==================== Staff Attendance ====================

export async function markStaffAttendance(input: MarkStaffAttendanceInput, markedBy: string) {
  const date = new Date(input.date)

  const results = []
  for (const r of input.records) {
    const staff = await prisma.staff.findUnique({ where: { id: r.staffId } })
    if (!staff) throw AppError.notFound(`Staff ${r.staffId} not found`)

    const record = await prisma.staffDailyAttendance.upsert({
      where: {
        date_staffId: { date, staffId: r.staffId },
      },
      create: {
        date,
        staffId: r.staffId,
        status: staffStatusToDb[r.status] as any,
        checkInTime: r.checkInTime || null,
        checkOutTime: r.checkOutTime || null,
        remarks: r.remarks || null,
        markedBy,
      },
      update: {
        status: staffStatusToDb[r.status] as any,
        checkInTime: r.checkInTime || null,
        checkOutTime: r.checkOutTime || null,
        remarks: r.remarks || null,
        markedBy,
      },
      include: {
        staff: {
          select: {
            firstName: true, lastName: true, employeeId: true,
            department: { select: { name: true } },
          },
        },
      },
    })
    results.push(formatStaffAttendance(record))
  }

  return { data: results }
}

export async function getStaffDailyAttendance(input: GetStaffAttendanceInput) {
  const date = input.date ? new Date(input.date) : new Date()
  const dateOnly = new Date(date.toISOString().split('T')[0])

  const records = await prisma.staffDailyAttendance.findMany({
    where: { date: dateOnly },
    include: {
      staff: {
        select: {
          firstName: true, lastName: true, employeeId: true,
          department: { select: { name: true } },
        },
      },
    },
    orderBy: { staff: { firstName: 'asc' } },
  })

  return { data: records.map(formatStaffAttendance) }
}

export async function getStaffAttendanceHistory(staffId: string, input: StaffAttendanceHistoryInput) {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } })
  if (!staff) throw AppError.notFound('Staff not found')

  const page = parseInt(input.page || '1')
  const limit = parseInt(input.limit || '20')
  const skip = (page - 1) * limit

  const where: any = { staffId }
  if (input.startDate && input.endDate) {
    where.date = { gte: new Date(input.startDate), lte: new Date(input.endDate) }
  } else if (input.startDate) {
    where.date = { gte: new Date(input.startDate) }
  } else if (input.endDate) {
    where.date = { lte: new Date(input.endDate) }
  }

  const [records, total] = await Promise.all([
    prisma.staffDailyAttendance.findMany({
      where,
      include: {
        staff: {
          select: {
            firstName: true, lastName: true, employeeId: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.staffDailyAttendance.count({ where }),
  ])

  return {
    data: records.map(formatStaffAttendance),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getStaffAttendanceSummary(staffId: string, input: StaffAttendanceSummaryInput) {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } })
  if (!staff) throw AppError.notFound('Staff not found')

  const now = new Date()
  const month = parseInt(input.month || String(now.getMonth() + 1))
  const year = parseInt(input.year || String(now.getFullYear()))

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  const records = await prisma.staffDailyAttendance.findMany({
    where: {
      staffId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'asc' },
  })

  const counts = { present: 0, absent: 0, half_day: 0, on_leave: 0 }
  for (const r of records) {
    const status = staffStatusFromDb[r.status] || r.status
    if (status in counts) counts[status as keyof typeof counts]++
  }

  return {
    data: {
      staffId,
      staffName: `${staff.firstName} ${staff.lastName}`.trim(),
      month,
      year,
      totalDays: records.length,
      ...counts,
      attendancePercentage: records.length > 0
        ? Math.round((counts.present / records.length) * 100 * 100) / 100
        : 0,
    },
  }
}

// ==================== Leave Balance ====================

const DEFAULT_LEAVE_BALANCES: Record<string, number> = {
  EL: 15, CL: 12, SL: 12, PL: 7,
}

export async function getLeaveBalance(staffId: string) {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } })
  if (!staff) throw AppError.notFound('Staff not found')

  const academicYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true, organizationId: staff.organizationId },
  })
  if (!academicYear) throw AppError.notFound('No active academic year found')

  // Auto-initialize if no balances exist
  const existing = await prisma.leaveBalance.findMany({
    where: { staffId, academicYearId: academicYear.id },
  })

  if (existing.length === 0) {
    for (const [type, total] of Object.entries(DEFAULT_LEAVE_BALANCES)) {
      await prisma.leaveBalance.create({
        data: {
          staffId,
          type: type as any,
          academicYearId: academicYear.id,
          total,
          used: 0,
        },
      })
    }
  }

  const balances = await prisma.leaveBalance.findMany({
    where: { staffId, academicYearId: academicYear.id },
    include: { academicYear: { select: { name: true } } },
  })

  return {
    data: balances.map(b => ({
      id: b.id,
      type: b.type,
      total: b.total,
      used: b.used,
      remaining: b.total - b.used,
      academicYear: b.academicYear.name,
    })),
  }
}

// ==================== Leave Requests ====================

export async function listAllLeaveRequests(input: ListLeaveRequestsInput) {
  const page = parseInt(input.page || '1')
  const limit = parseInt(input.limit || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (input.status) where.status = leaveStatusToDb[input.status] || input.status
  if (input.staffId) where.staffId = input.staffId

  const [requests, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      include: {
        staff: {
          select: { firstName: true, lastName: true, employeeId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.leaveRequest.count({ where }),
  ])

  return {
    data: requests.map(r => ({
      id: r.id,
      staffId: r.staffId,
      staffName: `${r.staff.firstName} ${r.staff.lastName}`.trim(),
      employeeId: r.staff.employeeId,
      type: r.type,
      startDate: r.startDate,
      endDate: r.endDate,
      days: r.days,
      reason: r.reason,
      status: leaveStatusFromDb[r.status] || r.status,
      reviewedBy: r.reviewedBy,
      reviewRemarks: r.reviewRemarks,
      reviewedAt: r.reviewedAt,
      createdAt: r.createdAt,
    })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function listStaffLeaveRequests(staffId: string) {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } })
  if (!staff) throw AppError.notFound('Staff not found')

  const requests = await prisma.leaveRequest.findMany({
    where: { staffId },
    orderBy: { createdAt: 'desc' },
  })

  return {
    data: requests.map(r => ({
      id: r.id,
      staffId: r.staffId,
      type: r.type,
      startDate: r.startDate,
      endDate: r.endDate,
      days: r.days,
      reason: r.reason,
      status: leaveStatusFromDb[r.status] || r.status,
      reviewedBy: r.reviewedBy,
      reviewRemarks: r.reviewRemarks,
      reviewedAt: r.reviewedAt,
      createdAt: r.createdAt,
    })),
  }
}

export async function createLeaveRequest(staffId: string, input: CreateLeaveRequestInput) {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } })
  if (!staff) throw AppError.notFound('Staff not found')

  const academicYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true, organizationId: staff.organizationId },
  })
  if (!academicYear) throw AppError.notFound('No active academic year found')

  // Check balance
  const balance = await prisma.leaveBalance.findUnique({
    where: {
      staffId_type_academicYearId: {
        staffId,
        type: input.type as any,
        academicYearId: academicYear.id,
      },
    },
  })

  if (!balance) {
    // Auto-init balance
    await prisma.leaveBalance.create({
      data: {
        staffId,
        type: input.type as any,
        academicYearId: academicYear.id,
        total: DEFAULT_LEAVE_BALANCES[input.type] || 0,
        used: 0,
      },
    })
  }

  const currentBalance = balance ? balance.total - balance.used : DEFAULT_LEAVE_BALANCES[input.type] || 0

  // Count pending leave days
  const pendingRequests = await prisma.leaveRequest.findMany({
    where: { staffId, type: input.type as any, status: 'leave_pending' },
  })
  const pendingDays = pendingRequests.reduce((sum, r) => sum + r.days, 0)

  if (currentBalance - pendingDays < input.days) {
    throw AppError.badRequest(`Insufficient ${input.type} leave balance. Available: ${currentBalance - pendingDays}, Requested: ${input.days}`)
  }

  const request = await prisma.leaveRequest.create({
    data: {
      staffId,
      type: input.type as any,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      days: input.days,
      reason: input.reason || null,
      status: 'leave_pending',
    },
    include: {
      staff: { select: { firstName: true, lastName: true, employeeId: true } },
    },
  })

  return {
    data: {
      id: request.id,
      staffId: request.staffId,
      staffName: `${request.staff.firstName} ${request.staff.lastName}`.trim(),
      type: request.type,
      startDate: request.startDate,
      endDate: request.endDate,
      days: request.days,
      reason: request.reason,
      status: leaveStatusFromDb[request.status] || request.status,
      createdAt: request.createdAt,
    },
  }
}

export async function updateLeaveRequest(id: string, input: UpdateLeaveRequestInput, reviewedBy: string) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id },
    include: { staff: true },
  })
  if (!request) throw AppError.notFound('Leave request not found')
  if (request.status !== 'leave_pending') {
    throw AppError.badRequest('Can only approve/reject pending requests')
  }

  const newStatus = leaveStatusToDb[input.status] as any

  // If approving, update leave balance
  if (input.status === 'approved') {
    const academicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true, organizationId: request.staff.organizationId },
    })
    if (academicYear) {
      await prisma.leaveBalance.updateMany({
        where: {
          staffId: request.staffId,
          type: request.type,
          academicYearId: academicYear.id,
        },
        data: { used: { increment: request.days } },
      })
    }
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: newStatus,
      reviewedBy,
      reviewRemarks: input.reviewRemarks || null,
      reviewedAt: new Date(),
    },
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
      status: leaveStatusFromDb[updated.status] || updated.status,
      reviewedBy: updated.reviewedBy,
      reviewRemarks: updated.reviewRemarks,
      reviewedAt: updated.reviewedAt,
      createdAt: updated.createdAt,
    },
  }
}
