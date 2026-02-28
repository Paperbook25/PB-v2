import { z } from 'zod'

const attendanceStatusEnum = z.enum(['present', 'absent', 'late', 'half_day', 'excused'])

// ==================== Student Daily Attendance ====================

export const markDailyAttendanceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  classId: z.string().uuid('Invalid class ID').optional(),
  sectionId: z.string().uuid('Invalid section ID').optional(),
  className: z.string().optional(),
  section: z.string().optional(),
  records: z.array(z.object({
    studentId: z.string().uuid('Invalid student ID'),
    status: attendanceStatusEnum,
    remarks: z.string().optional(),
  })).min(1, 'At least one record is required'),
})

export type MarkDailyAttendanceInput = z.infer<typeof markDailyAttendanceSchema>

export const getDailyAttendanceSchema = z.object({
  date: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  // Also accept className/section from frontend
  className: z.string().optional(),
  section: z.string().optional(),
})

export type GetDailyAttendanceInput = z.infer<typeof getDailyAttendanceSchema>

export const getStudentsSchema = z.object({
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  // Also accept className/section from frontend
  className: z.string().optional(),
  section: z.string().optional(),
  date: z.string().optional(),
})

export type GetStudentsInput = z.infer<typeof getStudentsSchema>

export const attendanceHistorySchema = z.object({
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  className: z.string().optional(),
  section: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  studentId: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export type AttendanceHistoryInput = z.infer<typeof attendanceHistorySchema>

export const attendanceReportSchema = z.object({
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  className: z.string().optional(),
  section: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type AttendanceReportInput = z.infer<typeof attendanceReportSchema>

export const attendanceSummarySchema = z.object({
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  className: z.string().optional(),
  section: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
})

export type AttendanceSummaryInput = z.infer<typeof attendanceSummarySchema>

export const studentAttendanceSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  academicYear: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export type StudentAttendanceInput = z.infer<typeof studentAttendanceSchema>

// ==================== Period Attendance ====================

export const markPeriodAttendanceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  classId: z.string().uuid('Invalid class ID'),
  sectionId: z.string().uuid('Invalid section ID'),
  periodId: z.string().uuid('Invalid period ID'),
  subjectId: z.string().uuid().optional(),
  teacherId: z.string().optional(),
  records: z.array(z.object({
    studentId: z.string().uuid('Invalid student ID'),
    status: attendanceStatusEnum,
    remarks: z.string().optional(),
  })).min(1, 'At least one record is required'),
})

export type MarkPeriodAttendanceInput = z.infer<typeof markPeriodAttendanceSchema>

export const getPeriodAttendanceSchema = z.object({
  date: z.string(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  className: z.string().optional(),
  section: z.string().optional(),
})

export type GetPeriodAttendanceInput = z.infer<typeof getPeriodAttendanceSchema>

export const periodSummarySchema = z.object({
  studentId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type PeriodSummaryInput = z.infer<typeof periodSummarySchema>

export const updatePeriodDefinitionSchema = z.object({
  name: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: z.enum(['class', 'break', 'lunch', 'assembly', 'activity']).optional(),
  isActive: z.boolean().optional(),
})

export type UpdatePeriodDefinitionInput = z.infer<typeof updatePeriodDefinitionSchema>
