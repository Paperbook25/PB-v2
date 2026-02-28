import { Router } from 'express'
import * as financeController from '../controllers/finance.controller.js'
import { authMiddleware, rbacMiddleware, validate, auditMiddleware } from '../middleware/index.js'
import {
  createFeeTypeSchema, updateFeeTypeSchema,
  createFeeStructureSchema, updateFeeStructureSchema, assignFeeStructureSchema,
  updateStudentFeeSchema, bulkAssignSchema, collectPaymentSchema,
  createExpenseSchema, updateExpenseSchema, rejectExpenseSchema, markExpensePaidSchema,
} from '../validators/finance.validators.js'

const router = Router()

// All finance routes require auth
router.use(authMiddleware)

// RBAC groups
const adminRoles = rbacMiddleware('admin', 'principal', 'accountant')
const readRoles = rbacMiddleware('admin', 'principal', 'accountant', 'teacher')
const studentSelfRoles = rbacMiddleware('admin', 'principal', 'accountant', 'student', 'parent')
const anyAuthRole = rbacMiddleware('admin', 'principal', 'accountant', 'teacher', 'student', 'parent')

// Audit middleware
const audit = auditMiddleware({ module: 'finance', entityType: 'finance' })

// ==================== User-scoped Endpoints ====================
// (must be before parameterized routes)

router.get('/my-fees', anyAuthRole, financeController.getMyFees)
router.get('/my-children-fees', anyAuthRole, financeController.getMyChildrenFees)
router.get('/my-payments', anyAuthRole, financeController.getMyPayments)

// ==================== Fee Types ====================

router.get('/fee-types', readRoles, financeController.listFeeTypes)
router.get('/fee-types/:id', readRoles, financeController.getFeeType)
router.post('/fee-types', adminRoles, validate(createFeeTypeSchema), audit, financeController.createFeeType)
router.put('/fee-types/:id', adminRoles, validate(updateFeeTypeSchema), audit, financeController.updateFeeType)
router.patch('/fee-types/:id/toggle', adminRoles, audit, financeController.toggleFeeType)
router.delete('/fee-types/:id', adminRoles, audit, financeController.deleteFeeType)

// ==================== Fee Structures ====================

router.get('/fee-structures', readRoles, financeController.listFeeStructures)
router.get('/fee-structures/:id', readRoles, financeController.getFeeStructure)
router.post('/fee-structures', adminRoles, validate(createFeeStructureSchema), audit, financeController.createFeeStructure)
router.put('/fee-structures/:id', adminRoles, validate(updateFeeStructureSchema), audit, financeController.updateFeeStructure)
router.patch('/fee-structures/:id/toggle', adminRoles, audit, financeController.toggleFeeStructure)
router.delete('/fee-structures/:id', adminRoles, audit, financeController.deleteFeeStructure)
router.post('/fee-structures/:id/assign', adminRoles, validate(assignFeeStructureSchema), audit, financeController.assignFeeStructure)

// ==================== Student Fees ====================

// Static routes first
router.post('/student-fees/bulk-assign', adminRoles, validate(bulkAssignSchema), audit, financeController.bulkAssignFees)
router.get('/student-fees', adminRoles, financeController.listStudentFees)
router.get('/student-fees/:id', adminRoles, financeController.getStudentFee)
router.put('/student-fees/:id', adminRoles, validate(updateStudentFeeSchema), audit, financeController.updateStudentFee)
router.patch('/student-fees/:id/waive', adminRoles, audit, financeController.waiveStudentFee)
router.delete('/student-fees/:id', adminRoles, audit, financeController.deleteStudentFee)

// Student's own fees (student/parent self-view)
router.get('/students/:studentId/fees', studentSelfRoles, financeController.getStudentFees)
router.get('/students/:studentId/payments', studentSelfRoles, financeController.getStudentPayments)
router.get('/students/:studentId/receipts', studentSelfRoles, financeController.getStudentReceipts)

// ==================== Payments & Receipts ====================

router.post('/payments/collect', adminRoles, validate(collectPaymentSchema), audit, financeController.collectPayment)
router.get('/payments', adminRoles, financeController.listPayments)
router.get('/payments/:id', adminRoles, financeController.getPayment)
router.post('/payments/:id/cancel', adminRoles, audit, financeController.cancelPayment)
router.get('/receipts/:receiptNumber', studentSelfRoles, financeController.getReceipt)
router.delete('/receipts/:receiptNumber', adminRoles, audit, financeController.deleteReceipt)

// ==================== Outstanding Dues ====================
// Frontend uses /outstanding (alias for /outstanding-dues)

router.get('/outstanding/summary', adminRoles, financeController.getOutstandingSummary)
router.get('/outstanding', adminRoles, financeController.getOutstandingDues)
router.get('/outstanding/:studentId', studentSelfRoles, financeController.getStudentOutstandingDues)
// Also keep old paths for backward compat
router.get('/outstanding-dues', adminRoles, financeController.getOutstandingDues)
router.get('/outstanding-dues/:studentId', studentSelfRoles, financeController.getStudentOutstandingDues)
router.post('/outstanding-dues/send-reminders', adminRoles, audit, financeController.sendReminders)

// Frontend uses /reminders/send
router.post('/reminders/send', adminRoles, audit, financeController.sendReminders)

// ==================== Expenses ====================

router.get('/expenses', adminRoles, financeController.listExpenses)
router.get('/expenses/:id', adminRoles, financeController.getExpense)
router.post('/expenses', adminRoles, validate(createExpenseSchema), audit, financeController.createExpense)
router.put('/expenses/:id', adminRoles, validate(updateExpenseSchema), audit, financeController.updateExpense)
router.patch('/expenses/:id/approve', adminRoles, audit, financeController.approveExpense)
router.patch('/expenses/:id/reject', adminRoles, validate(rejectExpenseSchema), audit, financeController.rejectExpense)
router.patch('/expenses/:id/mark-paid', adminRoles, audit, financeController.markExpensePaid)
router.delete('/expenses/:id', adminRoles, audit, financeController.deleteExpense)

// ==================== Ledger ====================

// Static routes first
router.get('/ledger/balance', adminRoles, financeController.getLedgerBalance)
router.get('/ledger', adminRoles, financeController.listLedgerEntries)
router.get('/ledger/:id', adminRoles, financeController.getLedgerEntry)
router.delete('/ledger/:id', adminRoles, financeController.deleteLedgerEntry)

// ==================== Reports & Stats ====================

router.get('/reports/collection', adminRoles, financeController.getCollectionReport)
router.get('/reports/dues', adminRoles, financeController.getDueReport)
router.get('/reports/financial-summary', adminRoles, financeController.getFinancialSummary)
// Frontend uses /reports/summary (alias)
router.get('/reports/summary', adminRoles, financeController.getFinancialSummary)
router.get('/stats', adminRoles, financeController.getFinanceStats)

export default router
