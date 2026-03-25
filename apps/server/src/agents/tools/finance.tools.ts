import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import * as feeStructureService from '../../services/fee-structure.service.js'
import * as financeReportsService from '../../services/finance-reports.service.js'
import * as expenseService from '../../services/expense.service.js'
import type { AgentTool, Role } from '../types.js'

const allowedRoles: Role[] = ['admin', 'principal', 'accountant']

export function createFinanceTools(schoolId: string): AgentTool[] {
  const listFeeStructuresTool = tool(
    async (input) => {
      const result = await feeStructureService.listFeeStructures(schoolId, {
        academicYear: input.academicYear,
        className: input.className,
        isActive: input.isActive !== undefined ? String(input.isActive) : undefined,
        page: input.page,
        limit: input.limit || 20,
      })
      return JSON.stringify(result)
    },
    {
      name: 'list_fee_structures',
      description:
        'List fee structures with optional filters. Returns fee types, amounts, frequency, applicable classes, and due dates.',
      schema: z.object({
        academicYear: z.string().optional().describe('Academic year (e.g., "2024-25")'),
        className: z.string().optional().describe('Filter by class name'),
        isActive: z.boolean().optional().describe('Filter by active/inactive status'),
        page: z.number().optional().default(1).describe('Page number'),
        limit: z.number().optional().default(20).describe('Results per page'),
      }),
    },
  )

  const getFeeCollectionSummaryTool = tool(
    async (input) => {
      const result = await financeReportsService.getCollectionReport(schoolId, {
        startDate: input.startDate,
        endDate: input.endDate,
        academicYear: input.academicYear,
      })
      return JSON.stringify(result)
    },
    {
      name: 'get_fee_collection_summary',
      description:
        'Get fee collection summary report. Returns total amount collected, breakdown by payment mode, fee type, class, and daily totals.',
      schema: z.object({
        startDate: z.string().optional().describe('Start date (YYYY-MM-DD)'),
        endDate: z.string().optional().describe('End date (YYYY-MM-DD)'),
        academicYear: z.string().optional().describe('Academic year (e.g., "2024-25")'),
      }),
    },
  )

  const listExpensesTool = tool(
    async (input) => {
      const result = await expenseService.listExpenses(schoolId, {
        category: input.category,
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
        page: input.page,
        limit: input.limit || 20,
      })
      return JSON.stringify(result)
    },
    {
      name: 'list_expenses',
      description:
        'List school expenses with optional filters. Returns expense number, category, amount, vendor, status, and dates.',
      schema: z.object({
        category: z.string().optional().describe('Expense category'),
        status: z.string().optional().describe('Status: pending_approval, approved, rejected, paid'),
        startDate: z.string().optional().describe('Start date (YYYY-MM-DD)'),
        endDate: z.string().optional().describe('End date (YYYY-MM-DD)'),
        page: z.number().optional().default(1).describe('Page number'),
        limit: z.number().optional().default(20).describe('Results per page'),
      }),
    },
  )

  return [
    { tool: listFeeStructuresTool, classification: 'READ_ONLY', allowedRoles },
    { tool: getFeeCollectionSummaryTool, classification: 'READ_ONLY', allowedRoles },
    { tool: listExpensesTool, classification: 'READ_ONLY', allowedRoles },
  ]
}

// Backward-compatible static export (uses empty schoolId — callers should migrate to createFinanceTools)
export const financeTools: AgentTool[] = createFinanceTools('')
