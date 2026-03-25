import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import * as staffService from '../../services/staff.service.js'
import type { AgentTool, Role } from '../types.js'

const allowedRoles: Role[] = ['admin', 'principal']

const listStaffTool = tool(
  async (input) => {
    const result = await staffService.listStaff('', {
      search: input.search,
      department: input.department,
      designation: input.designation,
      status: input.status as 'active' | 'on_leave' | 'resigned' | undefined,
      page: input.page,
      limit: input.limit || 10,
    })
    return JSON.stringify(result)
  },
  {
    name: 'list_staff',
    description:
      'List staff members with optional filters. Returns paginated list with name, department, designation, and contact info.',
    schema: z.object({
      search: z.string().optional().describe('Search by staff name or employee ID'),
      department: z.string().optional().describe('Filter by department name'),
      designation: z.string().optional().describe('Filter by designation'),
      status: z.string().optional().describe('Filter by status: active, inactive, on_leave, terminated'),
      page: z.number().optional().default(1).describe('Page number'),
      limit: z.number().optional().default(10).describe('Results per page (max 20)'),
    }),
  },
)

const getStaffDetailsTool = tool(
  async (input) => {
    const result = await staffService.getStaffById('', input.staffId)
    return JSON.stringify(result)
  },
  {
    name: 'get_staff_details',
    description:
      'Get detailed information about a specific staff member by their ID. Includes qualifications, address, and bank details.',
    schema: z.object({
      staffId: z.string().describe('The UUID of the staff member'),
    }),
  },
)

export const staffTools: AgentTool[] = [
  { tool: listStaffTool, classification: 'READ_ONLY', allowedRoles },
  { tool: getStaffDetailsTool, classification: 'READ_ONLY', allowedRoles },
]
