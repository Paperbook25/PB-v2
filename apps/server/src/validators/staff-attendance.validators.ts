import { z } from 'zod'

const staffAttendanceStatusEnum = z.enum(['present', 'absent', 'half_day', 'on_leave'])
const leaveTypeEnum = z.enum(['EL', 'CL', 'SL', 'PL'])
const leaveStatusEnum = z.enum(['pending', 'approved', 'rejected', 'cancelled'])

// ==================== Staff Attendance ====================

export const markStaffAttendanceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  records: z.array(z.object({
    staffId: z.string().uuid('Invalid staff ID'),
    status: staffAttendanceStatusEnum,
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    remarks: z.string().optional(),
  })).min(1, 'At least one record is required'),
})

export type MarkStaffAttendanceInput = z.infer<typeof markStaffAttendanceSchema>

export const getStaffAttendanceSchema = z.object({
  date: z.string().optional(),
})

export type GetStaffAttendanceInput = z.infer<typeof getStaffAttendanceSchema>

export const staffAttendanceHistorySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export type StaffAttendanceHistoryInput = z.infer<typeof staffAttendanceHistorySchema>

export const staffAttendanceSummarySchema = z.object({
  month: z.string().optional(),
  year: z.string().optional(),
})

export type StaffAttendanceSummaryInput = z.infer<typeof staffAttendanceSummarySchema>

// ==================== Leave ====================

export const createLeaveRequestSchema = z.object({
  type: leaveTypeEnum,
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  days: z.number().positive('Days must be positive'),
  reason: z.string().optional(),
})

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>

export const updateLeaveRequestSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewRemarks: z.string().optional(),
})

export type UpdateLeaveRequestInput = z.infer<typeof updateLeaveRequestSchema>

export const listLeaveRequestsSchema = z.object({
  status: leaveStatusEnum.optional(),
  staffId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export type ListLeaveRequestsInput = z.infer<typeof listLeaveRequestsSchema>

// ==================== Leave Policy ====================

export const updateLeavePolicySchema = z.object({
  defaultEL: z.number().min(0).max(60).optional(),
  defaultCL: z.number().min(0).max(60).optional(),
  defaultSL: z.number().min(0).max(60).optional(),
  defaultPL: z.number().min(0).max(60).optional(),
  maxCarryForwardDays: z.number().min(0).max(30).optional(),
  carryForwardExpiryMonths: z.number().min(0).max(12).optional(),
  minNoticeDays: z.number().min(0).max(30).optional(),
  maxConsecutiveDays: z.number().min(1).max(90).optional(),
  sandwichLeaveEnabled: z.boolean().optional(),
  probationLeaveFactor: z.number().min(0).max(1).optional(),
})

export type UpdateLeavePolicyInput = z.infer<typeof updateLeavePolicySchema>

export const createCustomLeaveTypeSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(10).toUpperCase(),
  isPaid: z.boolean().optional(),
  maxDaysPerYear: z.number().min(1).max(365).optional(),
  requiresApproval: z.boolean().optional(),
})

export type CreateCustomLeaveTypeInput = z.infer<typeof createCustomLeaveTypeSchema>

export const createBlackoutDateSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().min(1).max(500),
  appliesTo: z.enum(['all_staff', 'teachers_only', 'non_teaching']).optional(),
})

export type CreateBlackoutDateInput = z.infer<typeof createBlackoutDateSchema>
