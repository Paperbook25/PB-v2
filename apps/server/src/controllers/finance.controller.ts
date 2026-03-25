import type { Request, Response, NextFunction } from 'express'
import * as feeTypeService from '../services/fee-type.service.js'
import * as feeStructureService from '../services/fee-structure.service.js'
import * as studentFeeService from '../services/student-fee.service.js'
import * as expenseService from '../services/expense.service.js'
import * as ledgerService from '../services/ledger.service.js'
import * as financeReportsService from '../services/finance-reports.service.js'
import { AppError } from '../utils/errors.js'
import type {
  CreateFeeTypeInput, UpdateFeeTypeInput,
  CreateFeeStructureInput, UpdateFeeStructureInput, AssignFeeStructureInput,
  UpdateStudentFeeInput, BulkAssignInput, CollectPaymentInput,
  CreateExpenseInput, UpdateExpenseInput, RejectExpenseInput, MarkExpensePaidInput,
} from '../validators/finance.validators.js'

// Helper: extract and validate schoolId from tenant middleware
function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Finance operations require a school subdomain.')
  }
  return req.schoolId
}

/**
 * BOLA/IDOR protection: verify the requesting user can access the given student's data.
 * - Admin/principal/accountant/teacher roles can access any student in their school.
 * - Students can only access their own data.
 * - Parents can only access their children's data.
 */
async function verifyStudentAccess(req: Request, studentId: string): Promise<void> {
  const role = req.user?.role
  // Staff roles have broad access (already scoped by tenant)
  if (role === 'admin' || role === 'principal' || role === 'accountant' || role === 'teacher') {
    return
  }

  const userId = req.user?.userId
  if (!userId) throw AppError.unauthorized('Authentication required')

  const { prisma } = await import('../config/db.js')
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { studentId: true, childIds: true },
  })
  if (!user) throw AppError.unauthorized('User not found')

  // Student: can only access own data
  if (role === 'student') {
    if (user.studentId !== studentId) {
      throw AppError.forbidden('You can only access your own fee data')
    }
    return
  }

  // Parent: can only access their children's data
  if (role === 'parent') {
    let childStudentIds: string[] = []
    if (user.childIds) {
      try {
        const childUserIds: string[] = JSON.parse(user.childIds)
        const childUsers = await prisma.user.findMany({
          where: { id: { in: childUserIds } },
          select: { studentId: true },
        })
        childStudentIds = childUsers.map((u: { studentId: string | null }) => u.studentId).filter((sid: string | null): sid is string => !!sid)
      } catch { /* ignore parse errors */ }
    }
    if (!childStudentIds.includes(studentId)) {
      throw AppError.forbidden('You can only access your children\'s fee data')
    }
    return
  }

  // Unknown role — deny by default
  throw AppError.forbidden('Insufficient permissions')
}

// ==================== Fee Types ====================

export async function listFeeTypes(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeTypeService.listFeeTypes(getSchoolId(req), req.query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getFeeType(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeTypeService.getFeeTypeById(getSchoolId(req), String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function createFeeType(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeTypeService.createFeeType(getSchoolId(req), req.body as CreateFeeTypeInput)
    res.status(201).json({ data: result })
  } catch (err) { next(err) }
}

export async function updateFeeType(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeTypeService.updateFeeType(getSchoolId(req), String(req.params.id), req.body as UpdateFeeTypeInput)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function toggleFeeType(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeTypeService.toggleFeeType(getSchoolId(req), String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function deleteFeeType(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeTypeService.deleteFeeType(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Fee Structures ====================

export async function listFeeStructures(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      ...req.query,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    }
    const result = await feeStructureService.listFeeStructures(getSchoolId(req), query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getFeeStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeStructureService.getFeeStructureById(getSchoolId(req), String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function createFeeStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeStructureService.createFeeStructure(getSchoolId(req), req.body as CreateFeeStructureInput)
    res.status(201).json({ data: result })
  } catch (err) { next(err) }
}

export async function updateFeeStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeStructureService.updateFeeStructure(getSchoolId(req), String(req.params.id), req.body as UpdateFeeStructureInput)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function toggleFeeStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeStructureService.toggleFeeStructure(getSchoolId(req), String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function deleteFeeStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeStructureService.deleteFeeStructure(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function assignFeeStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeStructureService.assignFeeStructure(getSchoolId(req), String(req.params.id), req.body as AssignFeeStructureInput)
    res.status(201).json({ data: result })
  } catch (err) { next(err) }
}

// ==================== Student Fees ====================

export async function listStudentFees(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      ...req.query,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    }
    const result = await studentFeeService.listStudentFees(getSchoolId(req), query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStudentFee(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.getStudentFeeById(getSchoolId(req), String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getStudentFees(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = String(req.params.studentId)
    await verifyStudentAccess(req, studentId)
    const result = await studentFeeService.getStudentFees(getSchoolId(req), studentId)
    res.json(result)
  } catch (err) { next(err) }
}

export async function updateStudentFee(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.updateStudentFee(getSchoolId(req), String(req.params.id), req.body as UpdateStudentFeeInput)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function waiveStudentFee(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.waiveStudentFee(getSchoolId(req), String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function deleteStudentFee(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.deleteStudentFee(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function bulkAssignFees(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.bulkAssignFees(getSchoolId(req), req.body as BulkAssignInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

// ==================== Payments & Receipts ====================

export async function collectPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const collectedBy = req.user?.name || 'Unknown'
    const collectedById = req.user?.userId || ''
    const result = await studentFeeService.collectPayment(schoolId, req.body as CollectPaymentInput, collectedBy, collectedById)
    // Frontend expects { data: Receipt, payments: Payment[] }
    res.status(201).json({
      data: {
        receiptNumber: result.receiptNumber,
        studentId: result.studentId,
        studentName: result.studentName,
        class: result.class,
        section: result.section,
        totalAmount: result.totalPaid,
        paymentMode: result.paymentMode,
        transactionRef: result.transactionRef,
        collectedBy: result.collectedBy,
        collectedAt: result.collectedAt,
        items: result.payments.map((p: any) => ({
          feeType: p.studentFeeId,
          amount: p.amount,
        })),
      },
      payments: result.payments,
    })
  } catch (err) { next(err) }
}

export async function listPayments(req: Request, res: Response, next: NextFunction) {
  try {
    // Map frontend dateFrom/dateTo to backend startDate/endDate
    const query = {
      ...req.query,
      startDate: (req.query.dateFrom || req.query.startDate) as string | undefined,
      endDate: (req.query.dateTo || req.query.endDate) as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    }
    const result = await studentFeeService.listPayments(getSchoolId(req), query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.getPaymentById(getSchoolId(req), String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getReceipt(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.getReceiptByNumber(getSchoolId(req), String(req.params.receiptNumber))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function deleteReceipt(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    // Find payment(s) by receipt number and cancel them
    await studentFeeService.getReceiptByNumber(schoolId, String(req.params.receiptNumber))
    const cancelledBy = req.user?.name || 'Unknown'
    const payments = await studentFeeService.listPayments(schoolId, { receiptNumber: String(req.params.receiptNumber) } as any)
    if (payments.data && payments.data.length > 0) {
      for (const p of payments.data) {
        await studentFeeService.cancelPayment(schoolId, p.id, cancelledBy)
      }
    }
    res.json({ success: true })
  } catch (err) { next(err) }
}

export async function getStudentPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = String(req.params.studentId)
    await verifyStudentAccess(req, studentId)
    const result = await studentFeeService.getStudentPayments(getSchoolId(req), studentId)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStudentReceipts(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = String(req.params.studentId)
    await verifyStudentAccess(req, studentId)
    const result = await studentFeeService.getStudentReceipts(getSchoolId(req), studentId)
    res.json(result)
  } catch (err) { next(err) }
}

export async function cancelPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const cancelledBy = req.user?.name || 'Unknown'
    const result = await studentFeeService.cancelPayment(getSchoolId(req), String(req.params.id), cancelledBy)
    res.json({ data: result })
  } catch (err) { next(err) }
}

// ==================== Outstanding Dues ====================

export async function getOutstandingDues(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      ...req.query,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    }
    const result = await studentFeeService.getOutstandingDues(getSchoolId(req), query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getOutstandingSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    // Get all outstanding dues without pagination to compute summary
    const result = await studentFeeService.getOutstandingDues(schoolId, { page: 1, limit: 10000 })
    const dues = result?.data || []
    const totalStudents = result?.meta?.total || dues.length
    const totalOutstanding = dues.reduce((sum: number, d: any) => sum + (d.totalDue || 0), 0)
    const avgDays = totalStudents > 0
      ? Math.round(dues.reduce((sum: number, d: any) => sum + (d.daysOverdue || 0), 0) / totalStudents)
      : 0
    res.json({
      data: {
        totalOutstanding,
        totalStudents,
        averageOverdueDays: avgDays,
      },
    })
  } catch (err) { next(err) }
}

export async function getStudentOutstandingDues(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = String(req.params.studentId)
    await verifyStudentAccess(req, studentId)
    const result = await studentFeeService.getStudentOutstandingDues(getSchoolId(req), studentId)
    res.json(result)
  } catch (err) { next(err) }
}

export async function sendReminders(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.sendReminders(getSchoolId(req))
    res.json({ success: true, count: result.overdueCount })
  } catch (err) { next(err) }
}

// ==================== User-scoped endpoints ====================

export async function getMyFees(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const { prisma } = await import('../config/db.js')
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.studentId) {
      res.json({ data: { fees: [], summary: { totalFees: 0, totalPaid: 0, totalDiscount: 0, totalPending: 0 } } })
      return
    }
    const feesResult = await studentFeeService.getStudentFees(schoolId, user.studentId)
    const fees = feesResult.data
    const summary = {
      totalFees: fees.reduce((s: number, f: any) => s + f.totalAmount, 0),
      totalPaid: fees.reduce((s: number, f: any) => s + f.paidAmount, 0),
      totalDiscount: fees.reduce((s: number, f: any) => s + f.discountAmount, 0),
      totalPending: 0,
    }
    summary.totalPending = summary.totalFees - summary.totalPaid - summary.totalDiscount
    res.json({ data: { fees, summary } })
  } catch (err) { next(err) }
}

export async function getMyPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const { prisma } = await import('../config/db.js')
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.studentId) {
      res.json({ data: [] })
      return
    }
    const result = await studentFeeService.getStudentPayments(schoolId, user.studentId)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getMyChildrenFees(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const { prisma } = await import('../config/db.js')
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) { res.status(401).json({ message: 'Unauthorized' }); return }

    let childUserIds: string[] = []
    if (user.childIds) {
      try { childUserIds = JSON.parse(user.childIds) } catch { childUserIds = [] }
    }

    const childUsers = await prisma.user.findMany({
      where: { id: { in: childUserIds } },
      select: { studentId: true },
    })
    const studentIdentifiers = childUsers.map((u: { studentId: string | null }) => u.studentId).filter((sid: string | null): sid is string => !!sid)

    const students = studentIdentifiers.length > 0
      ? await prisma.student.findMany({
          where: {
            OR: [
              { admissionNumber: { in: studentIdentifiers } },
              { id: { in: studentIdentifiers } },
            ],
          },
          include: { class: true, section: true },
        })
      : []
    const childrenData = []
    for (const student of students) {
      const feesResult = await studentFeeService.getStudentFees(schoolId, student.id)
      const fees = feesResult.data
      const summary = {
        totalFees: fees.reduce((s: number, f: any) => s + f.totalAmount, 0),
        totalPaid: fees.reduce((s: number, f: any) => s + f.paidAmount, 0),
        totalDiscount: fees.reduce((s: number, f: any) => s + f.discountAmount, 0),
        totalPending: 0,
      }
      summary.totalPending = summary.totalFees - summary.totalPaid - summary.totalDiscount
      childrenData.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        studentClass: student.class?.name || '',
        studentSection: student.section?.name || '',
        fees,
        summary,
      })
    }
    res.json({ data: childrenData })
  } catch (err) { next(err) }
}

// ==================== Expenses ====================

export async function listExpenses(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      ...req.query,
      startDate: (req.query.dateFrom || req.query.startDate) as string | undefined,
      endDate: (req.query.dateTo || req.query.endDate) as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    }
    const result = await expenseService.listExpenses(getSchoolId(req), query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await expenseService.getExpenseById(getSchoolId(req), String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function createExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const requestedBy = req.user?.name || 'Unknown'
    const result = await expenseService.createExpense(getSchoolId(req), req.body as CreateExpenseInput, requestedBy)
    res.status(201).json({ data: result })
  } catch (err) { next(err) }
}

export async function updateExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await expenseService.updateExpense(getSchoolId(req), String(req.params.id), req.body as UpdateExpenseInput)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function approveExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const approvedBy = req.user?.name || 'Unknown'
    const result = await expenseService.approveExpense(getSchoolId(req), String(req.params.id), approvedBy)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function rejectExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const rejectedBy = req.user?.name || 'Unknown'
    const result = await expenseService.rejectExpense(getSchoolId(req), String(req.params.id), rejectedBy, req.body as RejectExpenseInput)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function markExpensePaid(req: Request, res: Response, next: NextFunction) {
  try {
    const paidBy = req.user?.name || 'Unknown'
    const result = await expenseService.markExpensePaid(getSchoolId(req), String(req.params.id), paidBy, req.body as MarkExpensePaidInput)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function deleteExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await expenseService.deleteExpense(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Ledger ====================

export async function listLedgerEntries(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      ...req.query,
      startDate: (req.query.dateFrom || req.query.startDate) as string | undefined,
      endDate: (req.query.dateTo || req.query.endDate) as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    }
    const result = await ledgerService.listLedgerEntries(getSchoolId(req), query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getLedgerBalance(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ledgerService.getBalanceSummary(getSchoolId(req), req.query as any)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getLedgerEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ledgerService.getLedgerEntryById(getSchoolId(req), String(req.params.id))
    if (!result) {
      res.status(404).json({ message: 'Ledger entry not found' })
      return
    }
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function deleteLedgerEntry(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(400).json({ message: 'Ledger entries cannot be deleted directly' })
  } catch (err) { next(err) }
}

// ==================== Reports & Stats ====================

export async function getCollectionReport(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      ...req.query,
      startDate: (req.query.dateFrom || req.query.startDate) as string | undefined,
      endDate: (req.query.dateTo || req.query.endDate) as string | undefined,
    }
    const result = await financeReportsService.getCollectionReport(getSchoolId(req), query as any)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getDueReport(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await financeReportsService.getDueReport(getSchoolId(req), req.query as any)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getFinancialSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await financeReportsService.getFinancialSummary(getSchoolId(req), req.query as any)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getFinanceStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await financeReportsService.getFinanceStats(getSchoolId(req))
    res.json({ data: result })
  } catch (err) { next(err) }
}
