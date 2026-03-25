import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import * as attendanceService from '../../services/attendance.service.js'
import * as staffAttendanceService from '../../services/staff-attendance.service.js'
import type { AgentTool, Role } from '../types.js'

const summaryRoles: Role[] = ['admin', 'principal', 'teacher']
const studentAttRoles: Role[] = ['admin', 'principal', 'teacher', 'parent']
const staffAttRoles: Role[] = ['admin', 'principal']

const getAttendanceSummaryTool = tool(
  async (input) => {
    const result = await attendanceService.getAttendanceSummary('', {
      classId: input.classId,
      className: input.className,
      sectionId: input.sectionId,
      section: input.section,
      month: input.month != null ? String(input.month) : undefined,
      year: input.year != null ? String(input.year) : undefined,
    })
    return JSON.stringify(result)
  },
  {
    name: 'get_attendance_summary',
    description:
      'Get attendance summary for a class/section over a month. Returns total students, average attendance percentage, and daily breakdown.',
    schema: z.object({
      classId: z.string().optional().describe('Class UUID'),
      className: z.string().optional().describe('Class name (e.g., "Class 10")'),
      sectionId: z.string().optional().describe('Section UUID'),
      section: z.string().optional().describe('Section name (e.g., "A")'),
      month: z.number().optional().describe('Month number (1-12)'),
      year: z.number().optional().describe('Year (e.g., 2025)'),
    }),
  },
)

const getStudentAttendanceTool = tool(
  async (input) => {
    const result = await attendanceService.getStudentAttendanceHistory('', input.studentId, {
      startDate: input.startDate,
      endDate: input.endDate,
    })
    return JSON.stringify(result)
  },
  {
    name: 'get_student_attendance',
    description:
      'Get attendance history for a specific student. Returns summary with present/absent/late counts and monthly breakdown.',
    schema: z.object({
      studentId: z.string().describe('Student UUID'),
      startDate: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('End date (YYYY-MM-DD)'),
    }),
  },
)

const getStaffAttendanceTool = tool(
  async (input) => {
    const result = await staffAttendanceService.getStaffAttendanceSummary(input.staffId, {
      month: input.month != null ? String(input.month) : undefined,
      year: input.year != null ? String(input.year) : undefined,
    })
    return JSON.stringify(result)
  },
  {
    name: 'get_staff_attendance',
    description: 'Get attendance summary for a specific staff member over a month.',
    schema: z.object({
      staffId: z.string().describe('Staff UUID'),
      month: z.number().optional().describe('Month number (1-12)'),
      year: z.number().optional().describe('Year (e.g., 2025)'),
    }),
  },
)

export const attendanceTools: AgentTool[] = [
  { tool: getAttendanceSummaryTool, classification: 'READ_ONLY', allowedRoles: summaryRoles },
  { tool: getStudentAttendanceTool, classification: 'READ_ONLY', allowedRoles: studentAttRoles },
  { tool: getStaffAttendanceTool, classification: 'READ_ONLY', allowedRoles: staffAttRoles },
]
