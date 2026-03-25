import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import * as studentService from '../../services/student.service.js'
import { prisma } from '../../config/db.js'
import type { AgentTool, Role } from '../types.js'

const allRoles: Role[] = ['admin', 'principal', 'teacher', 'accountant', 'parent']
const detailRoles: Role[] = ['admin', 'principal', 'teacher', 'parent']
const countRoles: Role[] = ['admin', 'principal', 'teacher', 'accountant']

const searchStudentsTool = tool(
  async (input) => {
    const result = await studentService.listStudents('', {
      search: input.search,
      class: input.className,
      section: input.section,
      status: input.status as 'active' | 'inactive' | 'graduated' | 'transferred' | undefined,
      page: input.page,
      limit: input.limit || 10,
    })
    return JSON.stringify(result)
  },
  {
    name: 'search_students',
    description:
      'Search for students by name, class, section, or status. Returns paginated list with student basic info.',
    schema: z.object({
      search: z.string().optional().describe('Search by student name or admission number'),
      className: z.string().optional().describe('Filter by class name (e.g., "Class 10")'),
      section: z.string().optional().describe('Filter by section (e.g., "A")'),
      status: z.string().optional().describe('Filter by status: active, inactive, graduated, transferred'),
      page: z.number().optional().default(1).describe('Page number'),
      limit: z.number().optional().default(10).describe('Results per page (max 20)'),
    }),
  },
)

const getStudentDetailsTool = tool(
  async (input) => {
    const result = await studentService.getStudentById('', input.studentId)
    return JSON.stringify(result)
  },
  {
    name: 'get_student_details',
    description:
      'Get detailed information about a specific student by their ID. Includes address, parent info, and class details.',
    schema: z.object({
      studentId: z.string().describe('The UUID of the student'),
    }),
  },
)

const getStudentCountTool = tool(
  async (input) => {
    const where: Record<string, unknown> = {}
    if (input.status) where.status = input.status
    if (input.classId) where.classId = input.classId
    const count = await prisma.student.count({ where })
    return JSON.stringify({ count })
  },
  {
    name: 'get_student_count',
    description: 'Get the total count of students, optionally filtered by status or class.',
    schema: z.object({
      status: z.string().optional().describe('Filter by status: active, inactive, graduated, transferred'),
      classId: z.string().optional().describe('Filter by class ID'),
    }),
  },
)

export const studentTools: AgentTool[] = [
  { tool: searchStudentsTool, classification: 'READ_ONLY', allowedRoles: allRoles },
  { tool: getStudentDetailsTool, classification: 'READ_ONLY', allowedRoles: detailRoles },
  { tool: getStudentCountTool, classification: 'READ_ONLY', allowedRoles: countRoles },
]
