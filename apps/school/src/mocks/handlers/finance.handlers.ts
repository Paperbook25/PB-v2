import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  feeTypes,
  feeStructures,
  studentFees,
  payments,
  receipts,
  expenses,
  ledgerEntries,
  getOutstandingDues,
  getFinanceStats,
  getLedgerBalance,
  getCollectionReport,
  getDueReport,
  getFinancialSummary,
  getStudentsForFeeCollection,
  installmentPlans,
  discountRules,
  appliedDiscounts,
  concessionRequests,
  escalationConfig,
  reminderLogs,
  onlinePaymentConfig,
  onlinePaymentOrders,
  getParentFeeDashboard,
} from '../data/finance.data'
import { getUserContext, isStudent, isParent } from '../utils/auth-context'
import type {
  FeeType,
  FeeStructure,
  StudentFee,
  Payment,
  Receipt,
  Expense,
  LedgerEntry,
  CreateFeeTypeRequest,
  UpdateFeeTypeRequest,
  CreateFeeStructureRequest,
  UpdateFeeStructureRequest,
  CollectPaymentRequest,
  SendReminderRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ApproveExpenseRequest,
  RejectExpenseRequest,
  MarkExpensePaidRequest,
  CreateInstallmentPlanRequest,
  CreateDiscountRuleRequest,
  DiscountRule,
  CreateConcessionRequest,
  ConcessionRequest,
  UpdateEscalationConfigRequest,
  CreatePaymentOrderRequest,
  OnlinePaymentOrder,
  InstallmentPlan,
  Installment,
} from '@/features/finance/types/finance.types'

// Helper to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

// Helper to generate receipt numbers
let receiptCounter = 2000
function generateReceiptNumber(): string {
  return `RCP202425${String(receiptCounter++).padStart(5, '0')}`
}

// Helper to generate expense numbers
let expenseCounter = 200
function generateExpenseNumber(): string {
  return `EXP202425${String(expenseCounter++).padStart(4, '0')}`
}

export const financeHandlers = [
  // ==================== USER-SCOPED HANDLERS ====================

  // Get student's own fees
  http.get('/api/finance/my-fees', async ({ request }) => {
    await mockDelay('read')

    const context = getUserContext(request)

    if (!context || !isStudent(context) || !context.studentId) {
      return HttpResponse.json({ error: 'Unauthorized - Student access required' }, { status: 403 })
    }

    const fees = studentFees.filter((sf) => sf.studentId === context.studentId)

    // Calculate summary
    const totalFees = fees.reduce((sum, f) => sum + f.totalAmount, 0)
    const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0)
    const totalDiscount = fees.reduce((sum, f) => sum + f.discountAmount, 0)
    const totalPending = totalFees - totalPaid - totalDiscount

    return HttpResponse.json({
      data: {
        fees,
        summary: {
          totalFees,
          totalPaid,
          totalDiscount,
          totalPending,
        },
      },
    })
  }),

  // Get parent's children fees
  http.get('/api/finance/my-children-fees', async ({ request }) => {
    await mockDelay('read')

    const context = getUserContext(request)

    if (!context || !isParent(context)) {
      return HttpResponse.json({ error: 'Unauthorized - Parent access required' }, { status: 403 })
    }

    if (!context.childIds || context.childIds.length === 0) {
      return HttpResponse.json({ error: 'No children linked to account' }, { status: 404 })
    }

    // Group fees by child
    const childrenFees = context.childIds.map((childId) => {
      const fees = studentFees.filter((sf) => sf.studentId === childId)
      const totalFees = fees.reduce((sum, f) => sum + f.totalAmount, 0)
      const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0)
      const totalDiscount = fees.reduce((sum, f) => sum + f.discountAmount, 0)
      const totalPending = totalFees - totalPaid - totalDiscount

      // Get student name from first fee
      const studentName = fees[0]?.studentName || `Student ${childId}`
      const studentClass = fees[0]?.studentClass || ''
      const studentSection = fees[0]?.studentSection || ''

      return {
        studentId: childId,
        studentName,
        studentClass,
        studentSection,
        fees,
        summary: {
          totalFees,
          totalPaid,
          totalDiscount,
          totalPending,
        },
      }
    })

    return HttpResponse.json({ data: childrenFees })
  }),

  // Get student/parent payment history
  http.get('/api/finance/my-payments', async ({ request }) => {
    await mockDelay('read')

    const context = getUserContext(request)

    if (!context) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    let studentIds: string[] = []

    if (isStudent(context) && context.studentId) {
      studentIds = [context.studentId]
    } else if (isParent(context) && context.childIds) {
      studentIds = context.childIds
    } else {
      return HttpResponse.json({ error: 'Unauthorized - Student or Parent access required' }, { status: 403 })
    }

    const userPayments = payments.filter((p) => studentIds.includes(p.studentId))

    // Sort by date descending
    userPayments.sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime())

    return HttpResponse.json({ data: userPayments })
  }),

  // ==================== FEE TYPE HANDLERS ====================

  // Get all fee types
  http.get('/api/finance/fee-types', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: feeTypes.filter(ft => ft.isActive) })
  }),

  // Get single fee type
  http.get('/api/finance/fee-types/:id', async ({ params }) => {
    await mockDelay('read')
    const feeType = feeTypes.find(ft => ft.id === params.id)

    if (!feeType) {
      return HttpResponse.json({ error: 'Fee type not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: feeType })
  }),

  // Create fee type
  http.post('/api/finance/fee-types', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as CreateFeeTypeRequest

    const newFeeType: FeeType = {
      id: generateId(),
      name: body.name,
      category: body.category,
      description: body.description,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    feeTypes.unshift(newFeeType)

    return HttpResponse.json({ data: newFeeType }, { status: 201 })
  }),

  // Update fee type
  http.put('/api/finance/fee-types/:id', async ({ params, request }) => {
    await mockDelay('read')
    const feeTypeIndex = feeTypes.findIndex(ft => ft.id === params.id)

    if (feeTypeIndex === -1) {
      return HttpResponse.json({ error: 'Fee type not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateFeeTypeRequest
    const updatedFeeType: FeeType = {
      ...feeTypes[feeTypeIndex],
      ...body,
    }

    feeTypes[feeTypeIndex] = updatedFeeType

    return HttpResponse.json({ data: updatedFeeType })
  }),

  // Delete fee type
  http.delete('/api/finance/fee-types/:id', async ({ params }) => {
    await mockDelay('read')
    const feeTypeIndex = feeTypes.findIndex(ft => ft.id === params.id)

    if (feeTypeIndex === -1) {
      return HttpResponse.json({ error: 'Fee type not found' }, { status: 404 })
    }

    // Check if fee type is used in any structure
    const hasStructures = feeStructures.some(fs => fs.feeTypeId === params.id)
    if (hasStructures) {
      return HttpResponse.json(
        { error: 'Cannot delete fee type with existing fee structures' },
        { status: 400 }
      )
    }

    feeTypes.splice(feeTypeIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== FEE STRUCTURE HANDLERS ====================

  // Get fee structures
  http.get('/api/finance/fee-structures', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const academicYear = url.searchParams.get('academicYear')
    const feeTypeId = url.searchParams.get('feeTypeId')
    const className = url.searchParams.get('className')
    const isActive = url.searchParams.get('isActive')

    let filtered = [...feeStructures]

    if (academicYear) {
      filtered = filtered.filter(fs => fs.academicYear === academicYear)
    }

    if (feeTypeId) {
      filtered = filtered.filter(fs => fs.feeTypeId === feeTypeId)
    }

    if (className) {
      filtered = filtered.filter(fs => fs.applicableClasses.includes(className))
    }

    if (isActive !== null) {
      filtered = filtered.filter(fs => fs.isActive === (isActive === 'true'))
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Create fee structure
  http.post('/api/finance/fee-structures', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as CreateFeeStructureRequest

    const feeType = feeTypes.find(ft => ft.id === body.feeTypeId)
    if (!feeType) {
      return HttpResponse.json({ error: 'Fee type not found' }, { status: 404 })
    }

    const newStructure: FeeStructure = {
      id: generateId(),
      feeTypeId: body.feeTypeId,
      feeTypeName: feeType.name,
      academicYear: body.academicYear,
      applicableClasses: body.applicableClasses,
      amount: body.amount,
      frequency: body.frequency,
      dueDay: body.dueDay || 10,
      isOptional: body.isOptional || false,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    feeStructures.unshift(newStructure)

    return HttpResponse.json({ data: newStructure }, { status: 201 })
  }),

  // Update fee structure
  http.put('/api/finance/fee-structures/:id', async ({ params, request }) => {
    await mockDelay('read')
    const structureIndex = feeStructures.findIndex(fs => fs.id === params.id)

    if (structureIndex === -1) {
      return HttpResponse.json({ error: 'Fee structure not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateFeeStructureRequest
    let feeTypeName = feeStructures[structureIndex].feeTypeName

    if (body.feeTypeId) {
      const feeType = feeTypes.find(ft => ft.id === body.feeTypeId)
      if (feeType) {
        feeTypeName = feeType.name
      }
    }

    const updatedStructure: FeeStructure = {
      ...feeStructures[structureIndex],
      ...body,
      feeTypeName,
    }

    feeStructures[structureIndex] = updatedStructure

    return HttpResponse.json({ data: updatedStructure })
  }),

  // Delete fee structure
  http.delete('/api/finance/fee-structures/:id', async ({ params }) => {
    await mockDelay('read')
    const structureIndex = feeStructures.findIndex(fs => fs.id === params.id)

    if (structureIndex === -1) {
      return HttpResponse.json({ error: 'Fee structure not found' }, { status: 404 })
    }

    feeStructures.splice(structureIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== STUDENT FEE HANDLERS ====================

  // Get student fees
  http.get('/api/finance/student-fees', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const academicYear = url.searchParams.get('academicYear')
    const feeTypeId = url.searchParams.get('feeTypeId')
    const className = url.searchParams.get('className')
    const section = url.searchParams.get('section')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...studentFees]

    if (studentId) {
      filtered = filtered.filter(sf => sf.studentId === studentId)
    }

    if (academicYear) {
      filtered = filtered.filter(sf => sf.academicYear === academicYear)
    }

    if (feeTypeId) {
      filtered = filtered.filter(sf => sf.feeTypeId === feeTypeId)
    }

    if (className) {
      filtered = filtered.filter(sf => sf.studentClass === className)
    }

    if (section) {
      filtered = filtered.filter(sf => sf.studentSection === section)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(sf => sf.status === status)
    }

    if (search) {
      filtered = filtered.filter(
        sf =>
          sf.studentName.toLowerCase().includes(search) ||
          sf.admissionNumber.toLowerCase().includes(search) ||
          sf.feeTypeName.toLowerCase().includes(search)
      )
    }

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedData = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get student fees by student ID
  http.get('/api/finance/students/:id/fees', async ({ params }) => {
    await mockDelay('read')
    const filtered = studentFees.filter(sf => sf.studentId === params.id)
    return HttpResponse.json({ data: filtered })
  }),

  // ==================== PAYMENT HANDLERS ====================

  // Get payments
  http.get('/api/finance/payments', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')
    const paymentMode = url.searchParams.get('paymentMode')
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...payments]

    if (studentId) {
      filtered = filtered.filter(p => p.studentId === studentId)
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filtered = filtered.filter(p => new Date(p.collectedAt) >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      filtered = filtered.filter(p => new Date(p.collectedAt) <= toDate)
    }

    if (paymentMode && paymentMode !== 'all') {
      filtered = filtered.filter(p => p.paymentMode === paymentMode)
    }

    if (search) {
      filtered = filtered.filter(
        p =>
          p.studentName.toLowerCase().includes(search) ||
          p.receiptNumber.toLowerCase().includes(search) ||
          p.admissionNumber.toLowerCase().includes(search)
      )
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime())

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedData = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: { page, limit, total, totalPages },
    })
  }),

  // Collect payment
  http.post('/api/finance/payments/collect', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CollectPaymentRequest

    if (!body.payments || body.payments.length === 0) {
      return HttpResponse.json({ error: 'No payments provided' }, { status: 400 })
    }

    const receiptNumber = generateReceiptNumber()
    const collectedAt = new Date().toISOString()
    const collectedBy = 'Current User'

    const newPayments: Payment[] = []
    const receiptPayments: { feeTypeName: string; amount: number }[] = []
    let totalAmount = 0

    // Get student info from first fee
    const firstFee = studentFees.find(sf => sf.id === body.payments[0].studentFeeId)
    if (!firstFee) {
      return HttpResponse.json({ error: 'Student fee not found' }, { status: 404 })
    }

    for (const paymentItem of body.payments) {
      const feeIndex = studentFees.findIndex(sf => sf.id === paymentItem.studentFeeId)
      if (feeIndex === -1) {
        continue
      }

      const fee = studentFees[feeIndex]
      const remainingDue = fee.totalAmount - fee.discountAmount - fee.paidAmount

      if (paymentItem.amount > remainingDue) {
        return HttpResponse.json(
          { error: `Payment amount exceeds due amount for ${fee.feeTypeName}` },
          { status: 400 }
        )
      }

      // Create payment record
      const payment: Payment = {
        id: generateId(),
        receiptNumber,
        studentId: fee.studentId,
        studentName: fee.studentName,
        studentClass: fee.studentClass,
        studentSection: fee.studentSection,
        admissionNumber: fee.admissionNumber,
        studentFeeId: fee.id,
        feeTypeName: fee.feeTypeName,
        amount: paymentItem.amount,
        paymentMode: body.paymentMode,
        transactionRef: body.transactionRef,
        remarks: body.remarks,
        collectedBy,
        collectedAt,
      }

      payments.unshift(payment)
      newPayments.push(payment)
      receiptPayments.push({ feeTypeName: fee.feeTypeName, amount: paymentItem.amount })
      totalAmount += paymentItem.amount

      // Update student fee
      studentFees[feeIndex].paidAmount += paymentItem.amount
      const newRemainingDue = fee.totalAmount - fee.discountAmount - studentFees[feeIndex].paidAmount
      if (newRemainingDue <= 0) {
        studentFees[feeIndex].status = 'paid'
      } else if (studentFees[feeIndex].paidAmount > 0) {
        studentFees[feeIndex].status = 'partial'
      }

      // Add ledger entry
      const currentBalance = ledgerEntries.length > 0 ? ledgerEntries[0].balance : 1000000
      ledgerEntries.unshift({
        id: generateId(),
        date: collectedAt,
        type: 'credit',
        category: 'Fee Collection',
        referenceId: payment.id,
        referenceNumber: receiptNumber,
        description: `${fee.feeTypeName} - ${fee.studentName}`,
        amount: paymentItem.amount,
        balance: currentBalance + paymentItem.amount,
      })
    }

    // Create receipt
    const receipt: Receipt = {
      id: generateId(),
      receiptNumber,
      studentId: firstFee.studentId,
      studentName: firstFee.studentName,
      studentClass: firstFee.studentClass,
      studentSection: firstFee.studentSection,
      admissionNumber: firstFee.admissionNumber,
      payments: receiptPayments,
      totalAmount,
      paymentMode: body.paymentMode,
      transactionRef: body.transactionRef,
      remarks: body.remarks,
      generatedBy: collectedBy,
      generatedAt: collectedAt,
    }

    receipts.unshift(receipt)

    return HttpResponse.json({ data: receipt, payments: newPayments }, { status: 201 })
  }),

  // Get receipt
  http.get('/api/finance/receipts/:number', async ({ params }) => {
    await mockDelay('read')
    const receipt = receipts.find(r => r.receiptNumber === params.number)

    if (!receipt) {
      return HttpResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: receipt })
  }),

  // Delete receipt
  http.delete('/api/finance/receipts/:number', async ({ params }) => {
    await mockDelay('write')
    const index = receipts.findIndex(r => r.receiptNumber === params.number)

    if (index === -1) {
      return HttpResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    receipts.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== OUTSTANDING DUES HANDLERS ====================

  // Get outstanding dues
  http.get('/api/finance/outstanding', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const className = url.searchParams.get('className')
    const section = url.searchParams.get('section')
    const minDaysOverdue = url.searchParams.get('minDaysOverdue')
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let outstanding = getOutstandingDues()

    if (className) {
      outstanding = outstanding.filter(o => o.studentClass === className)
    }

    if (section) {
      outstanding = outstanding.filter(o => o.studentSection === section)
    }

    if (minDaysOverdue) {
      const minDays = parseInt(minDaysOverdue)
      outstanding = outstanding.filter(o => o.daysOverdue >= minDays)
    }

    if (search) {
      outstanding = outstanding.filter(
        o =>
          o.studentName.toLowerCase().includes(search) ||
          o.admissionNumber.toLowerCase().includes(search)
      )
    }

    // Pagination
    const total = outstanding.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedData = outstanding.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get outstanding summary
  http.get('/api/finance/outstanding/summary', async () => {
    await mockDelay('read')
    const outstanding = getOutstandingDues()
    const totalOutstanding = outstanding.reduce((sum, o) => sum + o.totalDue, 0)
    const totalStudents = outstanding.length
    const averageOverdueDays =
      totalStudents > 0
        ? Math.round(outstanding.reduce((sum, o) => sum + o.daysOverdue, 0) / totalStudents)
        : 0

    return HttpResponse.json({
      data: { totalOutstanding, totalStudents, averageOverdueDays },
    })
  }),

  // Send reminders
  http.post('/api/finance/reminders/send', async ({ request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as SendReminderRequest

    // Simulate sending reminders
    const outstanding = getOutstandingDues()
    let count = 0

    for (const studentId of body.studentIds) {
      const due = outstanding.find(o => o.studentId === studentId)
      if (due) {
        due.lastReminderSentAt = new Date().toISOString()
        count++
      }
    }

    return HttpResponse.json({ success: true, count })
  }),

  // ==================== EXPENSE HANDLERS ====================

  // Get expenses
  http.get('/api/finance/expenses', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...expenses]

    if (category && category !== 'all') {
      filtered = filtered.filter(e => e.category === category)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(e => e.status === status)
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filtered = filtered.filter(e => new Date(e.requestedAt) >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      filtered = filtered.filter(e => new Date(e.requestedAt) <= toDate)
    }

    if (search) {
      filtered = filtered.filter(
        e =>
          e.description.toLowerCase().includes(search) ||
          e.expenseNumber.toLowerCase().includes(search) ||
          (e.vendorName && e.vendorName.toLowerCase().includes(search))
      )
    }

    // Sort by requested date descending
    filtered.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedData = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get single expense
  http.get('/api/finance/expenses/:id', async ({ params }) => {
    await mockDelay('read')
    const expense = expenses.find(e => e.id === params.id)

    if (!expense) {
      return HttpResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: expense })
  }),

  // Create expense
  http.post('/api/finance/expenses', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as CreateExpenseRequest

    const newExpense: Expense = {
      id: generateId(),
      expenseNumber: generateExpenseNumber(),
      category: body.category,
      description: body.description,
      amount: body.amount,
      vendorName: body.vendorName,
      invoiceNumber: body.invoiceNumber,
      invoiceDate: body.invoiceDate,
      status: 'pending_approval',
      requestedBy: 'Current User',
      requestedAt: new Date().toISOString(),
    }

    expenses.unshift(newExpense)

    return HttpResponse.json({ data: newExpense }, { status: 201 })
  }),

  // Update expense
  http.put('/api/finance/expenses/:id', async ({ params, request }) => {
    await mockDelay('read')
    const expenseIndex = expenses.findIndex(e => e.id === params.id)

    if (expenseIndex === -1) {
      return HttpResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    if (expenses[expenseIndex].status !== 'pending_approval') {
      return HttpResponse.json(
        { error: 'Cannot update expense that is not pending approval' },
        { status: 400 }
      )
    }

    const body = (await request.json()) as UpdateExpenseRequest
    const updatedExpense: Expense = {
      ...expenses[expenseIndex],
      ...body,
    }

    expenses[expenseIndex] = updatedExpense

    return HttpResponse.json({ data: updatedExpense })
  }),

  // Approve expense
  http.patch('/api/finance/expenses/:id/approve', async ({ params, request }) => {
    await mockDelay('read')
    const expenseIndex = expenses.findIndex(e => e.id === params.id)

    if (expenseIndex === -1) {
      return HttpResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    if (expenses[expenseIndex].status !== 'pending_approval') {
      return HttpResponse.json(
        { error: 'Expense is not pending approval' },
        { status: 400 }
      )
    }

    expenses[expenseIndex] = {
      ...expenses[expenseIndex],
      status: 'approved',
      approvedBy: 'Current User',
      approvedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: expenses[expenseIndex] })
  }),

  // Reject expense
  http.patch('/api/finance/expenses/:id/reject', async ({ params, request }) => {
    await mockDelay('read')
    const expenseIndex = expenses.findIndex(e => e.id === params.id)

    if (expenseIndex === -1) {
      return HttpResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    if (expenses[expenseIndex].status !== 'pending_approval') {
      return HttpResponse.json(
        { error: 'Expense is not pending approval' },
        { status: 400 }
      )
    }

    const body = (await request.json()) as RejectExpenseRequest

    expenses[expenseIndex] = {
      ...expenses[expenseIndex],
      status: 'rejected',
      rejectedBy: 'Current User',
      rejectedAt: new Date().toISOString(),
      rejectionReason: body.reason,
    }

    return HttpResponse.json({ data: expenses[expenseIndex] })
  }),

  // Mark expense as paid
  http.patch('/api/finance/expenses/:id/mark-paid', async ({ params, request }) => {
    await mockDelay('read')
    const expenseIndex = expenses.findIndex(e => e.id === params.id)

    if (expenseIndex === -1) {
      return HttpResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    if (expenses[expenseIndex].status !== 'approved') {
      return HttpResponse.json(
        { error: 'Expense must be approved before marking as paid' },
        { status: 400 }
      )
    }

    const body = (await request.json()) as MarkExpensePaidRequest
    const paidAt = new Date().toISOString()

    expenses[expenseIndex] = {
      ...expenses[expenseIndex],
      status: 'paid',
      paidAt,
      paidBy: 'Current User',
      paymentRef: body.paymentRef,
    }

    // Add ledger entry for expense
    const currentBalance = ledgerEntries.length > 0 ? ledgerEntries[0].balance : 1000000
    ledgerEntries.unshift({
      id: generateId(),
      date: paidAt,
      type: 'debit',
      category: expenses[expenseIndex].category,
      referenceId: expenses[expenseIndex].id,
      referenceNumber: expenses[expenseIndex].expenseNumber,
      description: expenses[expenseIndex].description,
      amount: expenses[expenseIndex].amount,
      balance: currentBalance - expenses[expenseIndex].amount,
    })

    return HttpResponse.json({ data: expenses[expenseIndex] })
  }),

  // Delete expense
  http.delete('/api/finance/expenses/:id', async ({ params }) => {
    await mockDelay('read')
    const expenseIndex = expenses.findIndex(e => e.id === params.id)

    if (expenseIndex === -1) {
      return HttpResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    if (expenses[expenseIndex].status === 'paid') {
      return HttpResponse.json(
        { error: 'Cannot delete paid expense' },
        { status: 400 }
      )
    }

    expenses.splice(expenseIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== LEDGER HANDLERS ====================

  // Get ledger entries
  http.get('/api/finance/ledger', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filtered = [...ledgerEntries]

    if (type && type !== 'all') {
      filtered = filtered.filter(e => e.type === type)
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filtered = filtered.filter(e => new Date(e.date) >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      filtered = filtered.filter(e => new Date(e.date) <= toDate)
    }

    // Already sorted by date descending
    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedData = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get ledger balance
  http.get('/api/finance/ledger/balance', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: getLedgerBalance() })
  }),

  // Delete ledger entry
  http.delete('/api/finance/ledger/:id', async ({ params }) => {
    await mockDelay('write')
    const index = ledgerEntries.findIndex(e => e.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Ledger entry not found' }, { status: 404 })
    }

    ledgerEntries.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== REPORT HANDLERS ====================

  // Collection report
  http.get('/api/finance/reports/collection', async ({ request }) => {
    await mockDelay('write')
    const url = new URL(request.url)
    const dateFrom = url.searchParams.get('dateFrom') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const dateTo = url.searchParams.get('dateTo') || new Date().toISOString()

    return HttpResponse.json({ data: getCollectionReport(dateFrom, dateTo) })
  }),

  // Due report
  http.get('/api/finance/reports/dues', async () => {
    await mockDelay('write')
    return HttpResponse.json({ data: getDueReport() })
  }),

  // Financial summary
  http.get('/api/finance/reports/summary', async ({ request }) => {
    await mockDelay('write')
    const url = new URL(request.url)
    const academicYear = url.searchParams.get('academicYear') || '2024-25'

    return HttpResponse.json({ data: getFinancialSummary(academicYear) })
  }),

  // ==================== STATS & UTILITY HANDLERS ====================

  // Get finance stats
  http.get('/api/finance/stats', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: getFinanceStats() })
  }),

  // Get students for fee collection dropdown
  http.get('/api/finance/students', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''

    let students = getStudentsForFeeCollection()

    if (search) {
      students = students.filter(
        s =>
          s.name.toLowerCase().includes(search) ||
          s.admissionNumber.toLowerCase().includes(search)
      )
    }

    return HttpResponse.json({ data: students.slice(0, 50) })
  }),

  // ==================== INSTALLMENT PLAN HANDLERS ====================

  // Get installment plans
  http.get('/api/finance/installment-plans', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const academicYear = url.searchParams.get('academicYear')

    let filtered = [...installmentPlans]
    if (academicYear) {
      filtered = filtered.filter(p => p.academicYear === academicYear)
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single installment plan
  http.get('/api/finance/installment-plans/:id', async ({ params }) => {
    await mockDelay('read')
    const plan = installmentPlans.find(p => p.id === params.id)
    if (!plan) {
      return HttpResponse.json({ error: 'Installment plan not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: plan })
  }),

  // Create installment plan
  http.post('/api/finance/installment-plans', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as CreateInstallmentPlanRequest

    const structure = feeStructures.find(fs => fs.id === body.feeStructureId)
    if (!structure) {
      return HttpResponse.json({ error: 'Fee structure not found' }, { status: 404 })
    }

    const installmentAmount = Math.round(structure.amount / body.numberOfInstallments)
    const installments: Installment[] = body.installmentDates.map((date, i) => ({
      id: `inst_${generateId()}_${i}`,
      installmentNumber: i + 1,
      amount: installmentAmount,
      dueDate: date,
      status: 'pending' as const,
      paidAmount: 0,
    }))

    const newPlan: InstallmentPlan = {
      id: generateId(),
      name: body.name,
      feeStructureId: body.feeStructureId,
      feeTypeName: structure.feeTypeName,
      totalAmount: structure.amount,
      numberOfInstallments: body.numberOfInstallments,
      installments,
      isActive: true,
      academicYear: structure.academicYear,
      applicableClasses: structure.applicableClasses,
      createdAt: new Date().toISOString(),
    }

    installmentPlans.unshift(newPlan)
    return HttpResponse.json({ data: newPlan }, { status: 201 })
  }),

  // Toggle installment plan active status
  http.patch('/api/finance/installment-plans/:id/toggle', async ({ params }) => {
    await mockDelay('read')
    const plan = installmentPlans.find(p => p.id === params.id)
    if (!plan) {
      return HttpResponse.json({ error: 'Installment plan not found' }, { status: 404 })
    }
    plan.isActive = !plan.isActive
    return HttpResponse.json({ data: plan })
  }),

  // Delete installment plan
  http.delete('/api/finance/installment-plans/:id', async ({ params }) => {
    await mockDelay('read')
    const idx = installmentPlans.findIndex(p => p.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ error: 'Installment plan not found' }, { status: 404 })
    }
    installmentPlans.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== DISCOUNT RULE HANDLERS ====================

  // Get discount rules
  http.get('/api/finance/discount-rules', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: discountRules })
  }),

  // Get single discount rule
  http.get('/api/finance/discount-rules/:id', async ({ params }) => {
    await mockDelay('read')
    const rule = discountRules.find(r => r.id === params.id)
    if (!rule) {
      return HttpResponse.json({ error: 'Discount rule not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: rule })
  }),

  // Create discount rule
  http.post('/api/finance/discount-rules', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as CreateDiscountRuleRequest

    const newRule: DiscountRule = {
      id: generateId(),
      ...body,
      isActive: true,
      academicYear: '2024-25',
      createdAt: new Date().toISOString(),
    }

    discountRules.unshift(newRule)
    return HttpResponse.json({ data: newRule }, { status: 201 })
  }),

  // Update discount rule
  http.put('/api/finance/discount-rules/:id', async ({ params, request }) => {
    await mockDelay('read')
    const idx = discountRules.findIndex(r => r.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ error: 'Discount rule not found' }, { status: 404 })
    }

    const body = (await request.json()) as Partial<CreateDiscountRuleRequest>
    discountRules[idx] = { ...discountRules[idx], ...body }
    return HttpResponse.json({ data: discountRules[idx] })
  }),

  // Toggle discount rule active
  http.patch('/api/finance/discount-rules/:id/toggle', async ({ params }) => {
    await mockDelay('read')
    const rule = discountRules.find(r => r.id === params.id)
    if (!rule) {
      return HttpResponse.json({ error: 'Discount rule not found' }, { status: 404 })
    }
    rule.isActive = !rule.isActive
    return HttpResponse.json({ data: rule })
  }),

  // Delete discount rule
  http.delete('/api/finance/discount-rules/:id', async ({ params }) => {
    await mockDelay('read')
    const idx = discountRules.findIndex(r => r.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ error: 'Discount rule not found' }, { status: 404 })
    }
    discountRules.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // Get applied discounts
  http.get('/api/finance/applied-discounts', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const ruleId = url.searchParams.get('ruleId')

    let filtered = [...appliedDiscounts]
    if (studentId) filtered = filtered.filter(d => d.studentId === studentId)
    if (ruleId) filtered = filtered.filter(d => d.discountRuleId === ruleId)

    return HttpResponse.json({ data: filtered })
  }),

  // ==================== CONCESSION REQUEST HANDLERS ====================

  // Get concession requests
  http.get('/api/finance/concessions', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let filtered = [...concessionRequests]
    if (status && status !== 'all') {
      filtered = filtered.filter(c => c.status === status)
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single concession request
  http.get('/api/finance/concessions/:id', async ({ params }) => {
    await mockDelay('read')
    const req = concessionRequests.find(c => c.id === params.id)
    if (!req) {
      return HttpResponse.json({ error: 'Concession request not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: req })
  }),

  // Create concession request
  http.post('/api/finance/concessions', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as CreateConcessionRequest

    const student = studentFees.find(sf => sf.studentId === body.studentId)

    const newConcession: ConcessionRequest = {
      id: generateId(),
      studentId: body.studentId,
      studentName: student?.studentName || 'Unknown Student',
      studentClass: student?.studentClass || '',
      section: student?.studentSection || '',
      admissionNumber: student?.admissionNumber || '',
      parentName: 'Parent',
      feeTypes: body.feeTypes,
      concessionType: body.concessionType,
      concessionValue: body.concessionValue,
      reason: body.reason,
      status: 'pending',
      requestedBy: 'Current User',
      requestedAt: new Date().toISOString(),
      validFrom: body.validFrom,
      validTo: body.validTo,
      totalConcessionAmount: body.concessionValue,
    }

    concessionRequests.unshift(newConcession)
    return HttpResponse.json({ data: newConcession }, { status: 201 })
  }),

  // Approve concession request
  http.patch('/api/finance/concessions/:id/approve', async ({ params }) => {
    await mockDelay('read')
    const idx = concessionRequests.findIndex(c => c.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ error: 'Concession request not found' }, { status: 404 })
    }
    if (concessionRequests[idx].status !== 'pending') {
      return HttpResponse.json({ error: 'Concession is not pending' }, { status: 400 })
    }

    concessionRequests[idx] = {
      ...concessionRequests[idx],
      status: 'approved',
      approvedBy: 'Current User',
      approvedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: concessionRequests[idx] })
  }),

  // Reject concession request
  http.patch('/api/finance/concessions/:id/reject', async ({ params, request }) => {
    await mockDelay('read')
    const idx = concessionRequests.findIndex(c => c.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ error: 'Concession request not found' }, { status: 404 })
    }
    if (concessionRequests[idx].status !== 'pending') {
      return HttpResponse.json({ error: 'Concession is not pending' }, { status: 400 })
    }

    const body = (await request.json()) as { reason: string }

    concessionRequests[idx] = {
      ...concessionRequests[idx],
      status: 'rejected',
      rejectedBy: 'Current User',
      rejectedAt: new Date().toISOString(),
      rejectionReason: body.reason,
    }

    return HttpResponse.json({ data: concessionRequests[idx] })
  }),

  // ==================== ESCALATION CONFIG HANDLERS ====================

  // Get escalation config
  http.get('/api/finance/escalation-config', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: escalationConfig })
  }),

  // Update escalation config
  http.put('/api/finance/escalation-config', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateEscalationConfigRequest

    escalationConfig.enabled = body.enabled
    escalationConfig.rules = body.rules.map((rule, i) => ({
      ...rule,
      id: `esc_${String(i + 1).padStart(3, '0')}`,
    }))

    return HttpResponse.json({ data: escalationConfig })
  }),

  // Get reminder logs
  http.get('/api/finance/reminder-logs', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const channel = url.searchParams.get('channel')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filtered = [...reminderLogs]
    if (channel && channel !== 'all') {
      filtered = filtered.filter(l => l.channel === channel)
    }
    if (status && status !== 'all') {
      filtered = filtered.filter(l => l.status === status)
    }

    filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedData = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: { page, limit, total, totalPages },
    })
  }),

  // ==================== ONLINE PAYMENT HANDLERS ====================

  // Get online payment config
  http.get('/api/finance/online-payment/config', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: onlinePaymentConfig })
  }),

  // Update online payment config
  http.put('/api/finance/online-payment/config', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Partial<typeof onlinePaymentConfig>
    Object.assign(onlinePaymentConfig, body)
    return HttpResponse.json({ data: onlinePaymentConfig })
  }),

  // Get online payment orders
  http.get('/api/finance/online-payment/orders', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...onlinePaymentOrders]
    if (status && status !== 'all') {
      filtered = filtered.filter(o => o.status === status)
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedData = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: { page, limit, total, totalPages },
    })
  }),

  // Create payment order (generate payment link)
  http.post('/api/finance/online-payment/orders', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreatePaymentOrderRequest

    const student = studentFees.find(sf => sf.studentId === body.studentId)
    const totalAmount = body.feeIds.reduce((sum, feeId) => {
      const fee = studentFees.find(sf => sf.id === feeId)
      return sum + (fee ? fee.totalAmount - fee.discountAmount - fee.paidAmount : 0)
    }, 0)

    const newOrder: OnlinePaymentOrder = {
      id: generateId(),
      orderId: `order_${generateId()}`,
      studentId: body.studentId,
      studentName: student?.studentName || 'Unknown',
      amount: totalAmount,
      feeIds: body.feeIds,
      gateway: body.gateway || 'razorpay',
      status: 'created',
      paymentLink: `https://rzp.io/i/${generateId().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    }

    onlinePaymentOrders.unshift(newOrder)
    return HttpResponse.json({ data: newOrder }, { status: 201 })
  }),

  // ==================== PARENT FEE DASHBOARD ====================

  // Get parent fee dashboard
  http.get('/api/finance/parent-dashboard', async ({ request }) => {
    await mockDelay('read')

    const context = getUserContext(request)
    let childIds: string[] = []

    if (context && isStudent(context) && context.studentId) {
      // Student viewing their own fees
      childIds = [context.studentId]
    } else if (context && isParent(context) && context.childIds) {
      // Parent viewing their children's fees
      childIds = context.childIds
    } else {
      // For testing / admin viewing parent dashboard, use first 2 students
      const activeStudentIds = studentFees
        .map(sf => sf.studentId)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 2)
      childIds = activeStudentIds
    }

    return HttpResponse.json({ data: getParentFeeDashboard(childIds) })
  }),
]
