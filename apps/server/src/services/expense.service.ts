import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { createLedgerEntry } from './ledger.service.js'
import type {
  CreateExpenseInput, UpdateExpenseInput, RejectExpenseInput, MarkExpensePaidInput,
} from '../validators/finance.validators.js'

// ==================== Enum Mapping ====================

const expenseCategoryMap: Record<string, string> = {
  salary: 'exp_salary',
  utilities: 'exp_utilities',
  maintenance: 'exp_maintenance',
  supplies: 'exp_supplies',
  infrastructure: 'exp_infrastructure',
  events: 'exp_events',
  other: 'exp_other',
}

const expenseCategoryReverse: Record<string, string> = Object.fromEntries(
  Object.entries(expenseCategoryMap).map(([k, v]) => [v, k])
)

const expenseStatusMap: Record<string, string> = {
  pending_approval: 'es_pending_approval',
  approved: 'es_approved',
  rejected: 'es_rejected',
  paid: 'es_paid',
}

const expenseStatusReverse: Record<string, string> = Object.fromEntries(
  Object.entries(expenseStatusMap).map(([k, v]) => [v, k])
)

// ==================== Helpers ====================

function formatExpense(e: any) {
  return {
    id: e.id,
    expenseNumber: e.expenseNumber,
    category: expenseCategoryReverse[e.category] || e.category,
    description: e.description,
    amount: Number(e.amount),
    vendorName: e.vendorName,
    invoiceNumber: e.invoiceNumber,
    invoiceDate: e.invoiceDate,
    status: expenseStatusReverse[e.status] || e.status,
    requestedBy: e.requestedBy,
    requestedAt: e.requestedAt,
    approvedBy: e.approvedBy,
    approvedAt: e.approvedAt,
    rejectedBy: e.rejectedBy,
    rejectedAt: e.rejectedAt,
    rejectedReason: e.rejectedReason,
    paidAt: e.paidAt,
    paidBy: e.paidBy,
    paidRef: e.paidRef,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }
}

async function generateExpenseNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const prefix = `EXP-${dateStr}-`

  const last = await prisma.expense.findFirst({
    where: { expenseNumber: { startsWith: prefix } },
    orderBy: { expenseNumber: 'desc' },
    select: { expenseNumber: true },
  })

  let seq = 1
  if (last) {
    const parts = last.expenseNumber.split('-')
    seq = parseInt(parts[parts.length - 1], 10) + 1
  }

  return `${prefix}${String(seq).padStart(4, '0')}`
}

// ==================== CRUD ====================

export async function listExpenses(query: {
  page?: number
  limit?: number
  category?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  const page = query.page || 1
  const limit = query.limit || 20
  const where: any = {}

  if (query.category && expenseCategoryMap[query.category]) {
    where.category = expenseCategoryMap[query.category]
  }
  if (query.status && expenseStatusMap[query.status]) {
    where.status = expenseStatusMap[query.status]
  }
  if (query.startDate || query.endDate) {
    where.requestedAt = {}
    if (query.startDate) where.requestedAt.gte = new Date(query.startDate)
    if (query.endDate) where.requestedAt.lte = new Date(query.endDate + 'T23:59:59.999Z')
  }

  const [total, expenses] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: expenses.map(formatExpense),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getExpenseById(id: string) {
  const e = await prisma.expense.findUnique({ where: { id } })
  if (!e) throw AppError.notFound('Expense not found')
  return formatExpense(e)
}

export async function createExpense(input: CreateExpenseInput, requestedBy: string) {
  const category = expenseCategoryMap[input.category]
  if (!category) throw AppError.badRequest('Invalid expense category')

  const expenseNumber = await generateExpenseNumber()

  const e = await prisma.expense.create({
    data: {
      expenseNumber,
      category: category as any,
      description: input.description,
      amount: input.amount,
      vendorName: input.vendorName || null,
      invoiceNumber: input.invoiceNumber || null,
      invoiceDate: input.invoiceDate ? new Date(input.invoiceDate) : null,
      status: 'es_pending_approval',
      requestedBy,
      requestedAt: new Date(),
    },
  })

  return formatExpense(e)
}

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  const existing = await prisma.expense.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Expense not found')

  if (existing.status !== 'es_pending_approval') {
    throw AppError.badRequest('Only pending expenses can be updated')
  }

  const data: any = {}
  if (input.category !== undefined) data.category = expenseCategoryMap[input.category]
  if (input.description !== undefined) data.description = input.description
  if (input.amount !== undefined) data.amount = input.amount
  if (input.vendorName !== undefined) data.vendorName = input.vendorName
  if (input.invoiceNumber !== undefined) data.invoiceNumber = input.invoiceNumber
  if (input.invoiceDate !== undefined) {
    data.invoiceDate = input.invoiceDate ? new Date(input.invoiceDate) : null
  }

  const e = await prisma.expense.update({ where: { id }, data })
  return formatExpense(e)
}

export async function approveExpense(id: string, approvedBy: string) {
  const existing = await prisma.expense.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Expense not found')

  if (existing.status !== 'es_pending_approval') {
    throw AppError.badRequest('Only pending expenses can be approved')
  }

  const e = await prisma.expense.update({
    where: { id },
    data: {
      status: 'es_approved',
      approvedBy,
      approvedAt: new Date(),
    },
  })

  return formatExpense(e)
}

export async function rejectExpense(id: string, rejectedBy: string, input: RejectExpenseInput) {
  const existing = await prisma.expense.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Expense not found')

  if (existing.status !== 'es_pending_approval') {
    throw AppError.badRequest('Only pending expenses can be rejected')
  }

  const e = await prisma.expense.update({
    where: { id },
    data: {
      status: 'es_rejected',
      rejectedBy,
      rejectedAt: new Date(),
      rejectedReason: input.reason,
    },
  })

  return formatExpense(e)
}

export async function markExpensePaid(id: string, paidBy: string, input: MarkExpensePaidInput) {
  const existing = await prisma.expense.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Expense not found')

  if (existing.status !== 'es_approved') {
    throw AppError.badRequest('Only approved expenses can be marked as paid')
  }

  const e = await prisma.$transaction(async (tx) => {
    const updated = await tx.expense.update({
      where: { id },
      data: {
        status: 'es_paid',
        paidAt: new Date(),
        paidBy,
        paidRef: input.paidRef || null,
      },
    })

    // Create debit ledger entry
    await createLedgerEntry({
      type: 'debit',
      category: 'expense_payment',
      referenceId: updated.id,
      referenceNumber: updated.expenseNumber,
      description: `Expense payment: ${existing.description} (${updated.expenseNumber})`,
      amount: Number(existing.amount),
    }, tx)

    return updated
  })

  return formatExpense(e)
}

export async function deleteExpense(id: string) {
  const existing = await prisma.expense.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Expense not found')

  if (existing.status !== 'es_pending_approval') {
    throw AppError.badRequest('Only pending expenses can be deleted')
  }

  await prisma.expense.delete({ where: { id } })
  return { success: true }
}

export { expenseCategoryMap, expenseCategoryReverse, expenseStatusMap, expenseStatusReverse }
