import type { Request, Response, NextFunction } from 'express'
import * as feeTypeService from '../services/fee-type.service.js'
import * as feeStructureService from '../services/fee-structure.service.js'
import * as studentFeeService from '../services/student-fee.service.js'
import * as expenseService from '../services/expense.service.js'
import * as ledgerService from '../services/ledger.service.js'
import * as financeReportsService from '../services/finance-reports.service.js'
import type {
  CreateFeeTypeInput, UpdateFeeTypeInput,
  CreateFeeStructureInput, UpdateFeeStructureInput, AssignFeeStructureInput,
  UpdateStudentFeeInput, BulkAssignInput, CollectPaymentInput,
  CreateExpenseInput, UpdateExpenseInput, RejectExpenseInput, MarkExpensePaidInput,
} from '../validators/finance.validators.js'

// ==================== Fee Types ====================

export async function listFeeTypes(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeTypeService.listFeeTypes(req.query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getFeeType(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeTypeService.getFeeTypeById(String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function createFeeType(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeTypeService.createFeeType(req.body as CreateFeeTypeInput)
    res.status(201).json({ data: result })
  } catch (err) { next(err) }
}

export async function updateFeeType(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeTypeService.updateFeeType(String(req.params.id), req.body as UpdateFeeTypeInput)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function toggleFeeType(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeTypeService.toggleFeeType(String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function deleteFeeType(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeTypeService.deleteFeeType(String(req.params.id))
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
    const result = await feeStructureService.listFeeStructures(query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getFeeStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeStructureService.getFeeStructureById(String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function createFeeStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeStructureService.createFeeStructure(req.body as CreateFeeStructureInput)
    res.status(201).json({ data: result })
  } catch (err) { next(err) }
}

export async function updateFeeStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeStructureService.updateFeeStructure(String(req.params.id), req.body as UpdateFeeStructureInput)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function toggleFeeStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeStructureService.toggleFeeStructure(String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function deleteFeeStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeStructureService.deleteFeeStructure(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function assignFeeStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await feeStructureService.assignFeeStructure(String(req.params.id), req.body as AssignFeeStructureInput)
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
    const result = await studentFeeService.listStudentFees(query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStudentFee(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.getStudentFeeById(String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getStudentFees(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.getStudentFees(String(req.params.studentId))
    res.json(result)
  } catch (err) { next(err) }
}

export async function updateStudentFee(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.updateStudentFee(String(req.params.id), req.body as UpdateStudentFeeInput)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function waiveStudentFee(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.waiveStudentFee(String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function deleteStudentFee(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.deleteStudentFee(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function bulkAssignFees(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.bulkAssignFees(req.body as BulkAssignInput)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

// ==================== Payments & Receipts ====================

export async function collectPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const collectedBy = req.user?.name || 'Unknown'
    const collectedById = req.user?.userId || ''
    const result = await studentFeeService.collectPayment(req.body as CollectPaymentInput, collectedBy, collectedById)
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
    const result = await studentFeeService.listPayments(query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.getPaymentById(String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getReceipt(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.getReceiptByNumber(String(req.params.receiptNumber))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function deleteReceipt(req: Request, res: Response, next: NextFunction) {
  try {
    // Find payment(s) by receipt number and cancel them
    const receipt = await studentFeeService.getReceiptByNumber(String(req.params.receiptNumber))
    // Cancel via the first payment - the service handles the reversal
    const cancelledBy = req.user?.name || 'Unknown'
    // We need the payment ID. Find it by receipt number.
    const payments = await studentFeeService.listPayments({ receiptNumber: String(req.params.receiptNumber) } as any)
    if (payments.data && payments.data.length > 0) {
      for (const p of payments.data) {
        await studentFeeService.cancelPayment(p.id, cancelledBy)
      }
    }
    res.json({ success: true })
  } catch (err) { next(err) }
}

export async function getStudentPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.getStudentPayments(String(req.params.studentId))
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStudentReceipts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.getStudentReceipts(String(req.params.studentId))
    res.json(result)
  } catch (err) { next(err) }
}

export async function cancelPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const cancelledBy = req.user?.name || 'Unknown'
    const result = await studentFeeService.cancelPayment(String(req.params.id), cancelledBy)
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
    const result = await studentFeeService.getOutstandingDues(query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getOutstandingSummary(req: Request, res: Response, next: NextFunction) {
  try {
    // Get all outstanding dues without pagination to compute summary
    const result = await studentFeeService.getOutstandingDues({ page: 1, limit: 10000 })
    const totalStudents = result.meta.total
    const totalOutstanding = result.data.reduce((sum: number, d: any) => sum + d.outstandingAmount, 0)
    const avgDays = totalStudents > 0
      ? Math.round(result.data.reduce((sum: number, d: any) => sum + d.daysOverdue, 0) / totalStudents)
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
    const result = await studentFeeService.getStudentOutstandingDues(String(req.params.studentId))
    res.json(result)
  } catch (err) { next(err) }
}

export async function sendReminders(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentFeeService.sendReminders()
    res.json({ success: true, count: result.overdueCount })
  } catch (err) { next(err) }
}

// ==================== User-scoped endpoints ====================

export async function getMyFees(req: Request, res: Response, next: NextFunction) {
  try {
    // Get fees for the logged-in user's student record
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    // Find student linked to this user
    const { prisma } = await import('../config/db.js')
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.studentId) {
      res.json({ data: { fees: [], summary: { totalFees: 0, totalPaid: 0, totalDiscount: 0, totalPending: 0 } } })
      return
    }
    const feesResult = await studentFeeService.getStudentFees(user.studentId)
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
    const result = await studentFeeService.getStudentPayments(user.studentId)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getMyChildrenFees(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const { prisma } = await import('../config/db.js')
    // Find students linked to this parent via user's childIds
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) { res.status(401).json({ message: 'Unauthorized' }); return }

    let childUserIds: string[] = []
    if (user.childIds) {
      try { childUserIds = JSON.parse(user.childIds) } catch { childUserIds = [] }
    }

    // Resolve child user IDs to student IDs
    const childUsers = await prisma.user.findMany({
      where: { id: { in: childUserIds } },
      select: { studentId: true },
    })
    const studentIdentifiers = childUsers.map(u => u.studentId).filter((id): id is string => !!id)

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
      const feesResult = await studentFeeService.getStudentFees(student.id)
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
    // Map frontend dateFrom/dateTo to backend startDate/endDate
    const query = {
      ...req.query,
      startDate: (req.query.dateFrom || req.query.startDate) as string | undefined,
      endDate: (req.query.dateTo || req.query.endDate) as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    }
    const result = await expenseService.listExpenses(query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await expenseService.getExpenseById(String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function createExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const requestedBy = req.user?.name || 'Unknown'
    const result = await expenseService.createExpense(req.body as CreateExpenseInput, requestedBy)
    res.status(201).json({ data: result })
  } catch (err) { next(err) }
}

export async function updateExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await expenseService.updateExpense(String(req.params.id), req.body as UpdateExpenseInput)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function approveExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const approvedBy = req.user?.name || 'Unknown'
    const result = await expenseService.approveExpense(String(req.params.id), approvedBy)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function rejectExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const rejectedBy = req.user?.name || 'Unknown'
    const result = await expenseService.rejectExpense(String(req.params.id), rejectedBy, req.body as RejectExpenseInput)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function markExpensePaid(req: Request, res: Response, next: NextFunction) {
  try {
    const paidBy = req.user?.name || 'Unknown'
    const result = await expenseService.markExpensePaid(String(req.params.id), paidBy, req.body as MarkExpensePaidInput)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function deleteExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await expenseService.deleteExpense(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Ledger ====================

export async function listLedgerEntries(req: Request, res: Response, next: NextFunction) {
  try {
    // Map frontend dateFrom/dateTo to backend startDate/endDate
    const query = {
      ...req.query,
      startDate: (req.query.dateFrom || req.query.startDate) as string | undefined,
      endDate: (req.query.dateTo || req.query.endDate) as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    }
    const result = await ledgerService.listLedgerEntries(query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getLedgerBalance(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ledgerService.getBalanceSummary(req.query as any)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getLedgerEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ledgerService.getLedgerEntryById(String(req.params.id))
    if (!result) {
      res.status(404).json({ message: 'Ledger entry not found' })
      return
    }
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function deleteLedgerEntry(req: Request, res: Response, next: NextFunction) {
  try {
    // Ledger entries shouldn't normally be deleted, but frontend expects this endpoint
    res.status(400).json({ message: 'Ledger entries cannot be deleted directly' })
  } catch (err) { next(err) }
}

// ==================== Reports & Stats ====================

export async function getCollectionReport(req: Request, res: Response, next: NextFunction) {
  try {
    // Map frontend dateFrom/dateTo to backend startDate/endDate
    const query = {
      ...req.query,
      startDate: (req.query.dateFrom || req.query.startDate) as string | undefined,
      endDate: (req.query.dateTo || req.query.endDate) as string | undefined,
    }
    const result = await financeReportsService.getCollectionReport(query as any)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getDueReport(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await financeReportsService.getDueReport(req.query as any)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getFinancialSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await financeReportsService.getFinancialSummary(req.query as any)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getFinanceStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await financeReportsService.getFinanceStats()
    res.json({ data: result })
  } catch (err) { next(err) }
}
