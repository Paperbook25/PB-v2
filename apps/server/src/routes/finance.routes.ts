import { Router } from 'express'
import * as financeController from '../controllers/finance.controller.js'
import { authMiddleware, rbacMiddleware, validate, auditMiddleware } from '../middleware/index.js'
import * as studentFeeService from '../services/student-fee.service.js'
import * as financeExtrasService from '../services/finance-extras.service.js'
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
router.get('/student-fees', readRoles, financeController.listStudentFees)
router.get('/student-fees/:id', readRoles, financeController.getStudentFee)
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
router.get('/receipts/:receiptNumber/download', studentSelfRoles, async (req, res, next) => {
  try {
    const schoolId = req.user!.organizationId!
    const receipt = await studentFeeService.getReceiptByNumber(schoolId, String(req.params.receiptNumber))
    const itemRows = receipt.items.map((item: any) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${item.feeType}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">₹${Number(item.amount).toLocaleString('en-IN')}</td>
      </tr>`).join('')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt ${receipt.receiptNumber}</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:32px;color:#1a1a1a}
.header{text-align:center;margin-bottom:24px}.logo{font-size:22px;font-weight:700;color:#6366f1}
.subtitle{font-size:13px;color:#666;margin-top:4px}.divider{border:none;border-top:2px solid #6366f1;margin:16px 0}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
.info-item label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.05em}
.info-item p{font-size:14px;font-weight:500;margin:2px 0}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
thead th{background:#f9f9ff;padding:10px 12px;font-size:12px;text-align:left;border-bottom:2px solid #e5e7eb}
.total-row td{padding:10px 12px;font-weight:700;font-size:15px;border-top:2px solid #6366f1}
.footer{text-align:center;font-size:12px;color:#999;margin-top:24px}
@media print{body{padding:16px}}</style></head>
<body>
<div class="header"><div class="logo">PaperBook</div><div class="subtitle">Fee Receipt</div></div>
<hr class="divider">
<div class="info-grid">
  <div class="info-item"><label>Receipt No</label><p>${receipt.receiptNumber}</p></div>
  <div class="info-item"><label>Date</label><p>${receipt.collectedAt ? new Date(receipt.collectedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</p></div>
  <div class="info-item"><label>Student Name</label><p>${receipt.studentName}</p></div>
  <div class="info-item"><label>Admission No</label><p>${receipt.admissionNumber || '—'}</p></div>
  <div class="info-item"><label>Class / Section</label><p>${[receipt.class, receipt.section].filter(Boolean).join(' / ') || '—'}</p></div>
  <div class="info-item"><label>Payment Mode</label><p>${receipt.paymentMode}</p></div>
  ${receipt.transactionRef ? `<div class="info-item"><label>Transaction Ref</label><p>${receipt.transactionRef}</p></div>` : ''}
  ${receipt.collectedBy ? `<div class="info-item"><label>Collected By</label><p>${receipt.collectedBy}</p></div>` : ''}
</div>
<table>
  <thead><tr><th>Fee Type</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${itemRows}</tbody>
  <tfoot><tr class="total-row"><td>Total Paid</td><td style="text-align:right">₹${Number(receipt.totalAmount).toLocaleString('en-IN')}</td></tr></tfoot>
</table>
<div class="footer">This is a computer-generated receipt. Thank you for your payment.</div>
</body></html>`
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${receipt.receiptNumber}.html"`)
    res.send(html)
  } catch (err) { next(err) }
})
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

// ==================== Concessions ====================

router.get('/concessions', adminRoles, async (req, res, next) => {
  try {
    const { status, studentId, page, limit } = req.query
    const result = await financeExtrasService.listConcessions(req.schoolId!, {
      status: status as string | undefined,
      studentId: studentId as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
})
router.post('/concessions', adminRoles, async (req, res, next) => {
  try {
    const data = await financeExtrasService.createConcession(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.patch('/concessions/:id/approve', adminRoles, async (req, res, next) => {
  try {
    const user = (req as any).user
    const data = await financeExtrasService.approveConcession(
      req.schoolId!, req.params.id,
      user?.userId ?? 'unknown', user?.name ?? 'Unknown',
      req.body.remarks
    )
    res.json({ data })
  } catch (err) { next(err) }
})
router.patch('/concessions/:id/reject', adminRoles, async (req, res, next) => {
  try {
    const data = await financeExtrasService.rejectConcession(req.schoolId!, req.params.id, req.body.remarks)
    res.json({ data })
  } catch (err) { next(err) }
})

// ==================== Discount Rules ====================

router.get('/discount-rules', adminRoles, async (req, res, next) => {
  try {
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
    const data = await financeExtrasService.listDiscountRules(req.schoolId!, { isActive })
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/discount-rules', adminRoles, async (req, res, next) => {
  try {
    const data = await financeExtrasService.createDiscountRule(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.put('/discount-rules/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await financeExtrasService.updateDiscountRule(req.schoolId!, req.params.id, req.body)
    res.json({ data })
  } catch (err) { next(err) }
})
router.patch('/discount-rules/:id/toggle', adminRoles, async (req, res, next) => {
  try {
    const data = await financeExtrasService.toggleDiscountRule(req.schoolId!, req.params.id)
    res.json({ data })
  } catch (err) { next(err) }
})
router.delete('/discount-rules/:id', adminRoles, async (req, res, next) => {
  try {
    const result = await financeExtrasService.deleteDiscountRule(req.schoolId!, req.params.id)
    res.json(result)
  } catch (err) { next(err) }
})
router.get('/applied-discounts', adminRoles, async (req, res, next) => {
  try {
    const data = await financeExtrasService.listAppliedDiscounts(req.schoolId!, {
      studentId: req.query.studentId as string | undefined,
    })
    res.json({ data })
  } catch (err) { next(err) }
})

// ==================== Installment Plans ====================

router.get('/installment-plans', adminRoles, async (req, res, next) => {
  try {
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
    const data = await financeExtrasService.listInstallmentPlans(req.schoolId!, { isActive })
    res.json({ data })
  } catch (err) { next(err) }
})
router.get('/installment-plans/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await financeExtrasService.getInstallmentPlan(req.schoolId!, req.params.id)
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/installment-plans', adminRoles, async (req, res, next) => {
  try {
    const data = await financeExtrasService.createInstallmentPlan(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.patch('/installment-plans/:id/toggle', adminRoles, async (req, res, next) => {
  try {
    const data = await financeExtrasService.toggleInstallmentPlan(req.schoolId!, req.params.id)
    res.json({ data })
  } catch (err) { next(err) }
})
router.delete('/installment-plans/:id', adminRoles, async (req, res, next) => {
  try {
    const result = await financeExtrasService.deleteInstallmentPlan(req.schoolId!, req.params.id)
    res.json(result)
  } catch (err) { next(err) }
})

// ==================== Reports & Stats ====================

router.get('/reports/collection', adminRoles, financeController.getCollectionReport)
router.get('/reports/dues', adminRoles, financeController.getDueReport)
router.get('/reports/financial-summary', adminRoles, financeController.getFinancialSummary)
// Frontend uses /reports/summary (alias)
router.get('/reports/summary', adminRoles, financeController.getFinancialSummary)
router.get('/stats', adminRoles, financeController.getFinanceStats)

export default router
