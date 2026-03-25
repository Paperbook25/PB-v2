import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import * as calendarService from '../../services/calendar.service.js'
import type { AgentTool, Role } from '../types.js'

const classRoles: Role[] = ['admin', 'principal', 'teacher', 'parent']
const teacherRoles: Role[] = ['admin', 'principal', 'teacher']

const getClassTimetableTool = tool(
  async (input) => {
    const result = await calendarService.getClassSchedule('', input.classId, input.sectionId)
    return JSON.stringify(result)
  },
  {
    name: 'get_class_timetable',
    description:
      'Get the weekly timetable for a class. Returns a schedule with periods, subjects, teachers, and rooms for each day.',
    schema: z.object({
      classId: z.string().describe('Class UUID'),
      sectionId: z.string().optional().describe('Section UUID (optional, to narrow to a section)'),
    }),
  },
)

const getTeacherTimetableTool = tool(
  async (input) => {
    const result = await calendarService.getTeacherSchedule('', input.teacherId)
    return JSON.stringify(result)
  },
  {
    name: 'get_teacher_timetable',
    description:
      'Get the weekly timetable for a specific teacher. Returns all their class assignments across the week.',
    schema: z.object({
      teacherId: z.string().describe('Teacher (staff) UUID'),
    }),
  },
)

export const timetableTools: AgentTool[] = [
  { tool: getClassTimetableTool, classification: 'READ_ONLY', allowedRoles: classRoles },
  { tool: getTeacherTimetableTool, classification: 'READ_ONLY', allowedRoles: teacherRoles },
]
