import { faker } from '@faker-js/faker'
import { students } from './students.data'
import type {
  FeeType,
  FeeCategory,
  FeeStructure,
  FeeFrequency,
  StudentFee,
  PaymentStatus,
  Payment,
  PaymentMode,
  Receipt,
  OutstandingDue,
  Expense,
  ExpenseCategory,
  ExpenseStatus,
  LedgerEntry,
  LedgerEntryType,
  FinanceStats,
  LedgerBalance,
  CollectionReport,
  DueReport,
  FinancialSummary,
  InstallmentPlan,
  Installment,
  DiscountRule,
  DiscountType,
  DiscountApplicability,
  AppliedDiscount,
  ConcessionRequest,
  ConcessionStatus,
  ReminderEscalationRule,
  ReminderEscalationConfig,
  ReminderLog,
  ReminderChannel,
  OnlinePaymentConfig,
  OnlinePaymentOrder,
  ParentFeeDashboard,
  ChildFeeOverview,
  UpcomingDue,
  ReceiptSummary,
} from '@/features/finance/types/finance.types'

// ==================== CONSTANTS ====================

const CURRENT_ACADEMIC_YEAR = '2024-25'

const FEE_TYPE_DATA: {
  name: string
  category: FeeCategory
  description: string
  amount: number
  frequency: FeeFrequency
  applicableClasses: string[]
  isOptional: boolean
}[] = [
  {
    name: 'Tuition Fee',
    category: 'tuition',
    description: 'Core academic tuition fee',
    amount: 50000,
    frequency: 'annual',
    applicableClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    isOptional: false,
  },
  {
    name: 'Development Fee',
    category: 'development',
    description: 'Infrastructure and development charges',
    amount: 10000,
    frequency: 'annual',
    applicableClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    isOptional: false,
  },
  {
    name: 'Lab Fee',
    category: 'lab',
    description: 'Science and computer lab usage',
    amount: 5000,
    frequency: 'annual',
    applicableClasses: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    isOptional: false,
  },
  {
    name: 'Library Fee',
    category: 'library',
    description: 'Library access and resources',
    amount: 2000,
    frequency: 'annual',
    applicableClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    isOptional: false,
  },
  {
    name: 'Sports Fee',
    category: 'sports',
    description: 'Sports activities and equipment',
    amount: 3000,
    frequency: 'annual',
    applicableClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    isOptional: false,
  },
  {
    name: 'Computer Fee',
    category: 'computer',
    description: 'Computer lab and IT resources',
    amount: 5000,
    frequency: 'annual',
    applicableClasses: ['Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    isOptional: false,
  },
  {
    name: 'Transport Fee',
    category: 'transport',
    description: 'School bus transportation',
    amount: 15000,
    frequency: 'annual',
    applicableClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    isOptional: true,
  },
  {
    name: 'Examination Fee',
    category: 'examination',
    description: 'Board and internal examination charges',
    amount: 2500,
    frequency: 'annual',
    applicableClasses: ['Class 10', 'Class 12'],
    isOptional: false,
  },
]

const PAYMENT_MODES: PaymentMode[] = ['cash', 'upi', 'bank_transfer', 'cheque', 'dd', 'online']

const EXPENSE_DATA: { category: ExpenseCategory; description: string; minAmount: number; maxAmount: number }[] = [
  { category: 'salary', description: 'Monthly Staff Salaries', minAmount: 500000, maxAmount: 800000 },
  { category: 'utilities', description: 'Electricity Bill', minAmount: 20000, maxAmount: 50000 },
  { category: 'utilities', description: 'Water Bill', minAmount: 5000, maxAmount: 15000 },
  { category: 'maintenance', description: 'Building Maintenance', minAmount: 10000, maxAmount: 30000 },
  { category: 'maintenance', description: 'Equipment Repair', minAmount: 5000, maxAmount: 20000 },
  { category: 'supplies', description: 'Office Supplies', minAmount: 5000, maxAmount: 15000 },
  { category: 'supplies', description: 'Cleaning Supplies', minAmount: 3000, maxAmount: 8000 },
  { category: 'infrastructure', description: 'Furniture Purchase', minAmount: 20000, maxAmount: 100000 },
  { category: 'infrastructure', description: 'Computer Equipment', minAmount: 50000, maxAmount: 200000 },
  { category: 'events', description: 'Annual Day Celebration', minAmount: 50000, maxAmount: 150000 },
  { category: 'events', description: 'Sports Day Event', minAmount: 20000, maxAmount: 50000 },
  { category: 'other', description: 'Miscellaneous Expenses', minAmount: 5000, maxAmount: 25000 },
]

const VENDOR_NAMES = [
  'ABC Suppliers',
  'XYZ Electronics',
  'City Maintenance Services',
  'State Power Board',
  'Municipal Water Works',
  'Office Mart India',
  'Clean Pro Services',
  'Furniture World',
  'Tech Solutions Ltd',
  'Event Masters',
]

// ==================== FEE TYPES ====================

export const feeTypes: FeeType[] = FEE_TYPE_DATA.map((data, index) => ({
  id: faker.string.uuid(),
  name: data.name,
  category: data.category,
  description: data.description,
  isActive: true,
  createdAt: faker.date.past({ years: 2 }).toISOString(),
}))

// ==================== FEE STRUCTURES ====================

export const feeStructures: FeeStructure[] = []

FEE_TYPE_DATA.forEach((data, index) => {
  const feeType = feeTypes[index]

  feeStructures.push({
    id: faker.string.uuid(),
    feeTypeId: feeType.id,
    feeTypeName: feeType.name,
    academicYear: CURRENT_ACADEMIC_YEAR,
    applicableClasses: data.applicableClasses,
    amount: data.amount,
    frequency: data.frequency,
    dueDay: 10, // 10th of the month
    isOptional: data.isOptional,
    isActive: true,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  })
})

// ==================== STUDENT FEES ====================

export const studentFees: StudentFee[] = []

const activeStudents = students.filter(s => s.status === 'active')

activeStudents.forEach(student => {
  // Get applicable fee structures for this student's class
  const applicableStructures = feeStructures.filter(
    fs => fs.applicableClasses.includes(student.class) && fs.isActive
  )

  applicableStructures.forEach(structure => {
    // Skip optional fees for ~60% of students
    if (structure.isOptional && faker.datatype.boolean({ probability: 0.6 })) {
      return
    }

    // Determine payment status with weights
    // More pending/partial fees to have data for fee collection testing
    const statusWeight = faker.helpers.weightedArrayElement([
      { value: 'paid' as const, weight: 30 },
      { value: 'partial' as const, weight: 30 },
      { value: 'pending' as const, weight: 30 },
      { value: 'overdue' as const, weight: 10 },
    ])

    let paidAmount = 0
    let discountAmount = 0

    // Some students get discounts (scholarship, sibling, etc.)
    if (faker.datatype.boolean({ probability: 0.15 })) {
      discountAmount = Math.round(structure.amount * faker.helpers.arrayElement([0.1, 0.15, 0.2, 0.25, 0.5]))
    }

    const effectiveAmount = structure.amount - discountAmount

    switch (statusWeight) {
      case 'paid':
        paidAmount = effectiveAmount
        break
      case 'partial':
        paidAmount = Math.round(effectiveAmount * faker.number.float({ min: 0.3, max: 0.8 }))
        break
      case 'pending':
      case 'overdue':
        paidAmount = 0
        break
    }

    // Calculate due date based on frequency
    const now = new Date()
    let dueDate: Date

    if (structure.frequency === 'annual') {
      dueDate = new Date(now.getFullYear(), 5, structure.dueDay) // June 10
      if (dueDate < now && statusWeight === 'pending') {
        // If due date passed and still pending, mark as overdue
      }
    } else if (structure.frequency === 'quarterly') {
      const currentQuarter = Math.floor(now.getMonth() / 3)
      dueDate = new Date(now.getFullYear(), currentQuarter * 3 + 1, structure.dueDay)
    } else {
      dueDate = new Date(now.getFullYear(), now.getMonth(), structure.dueDay)
    }

    // Adjust status if due date passed
    let finalStatus: PaymentStatus = statusWeight
    if (dueDate < now && (statusWeight === 'pending' || statusWeight === 'partial')) {
      finalStatus = 'overdue'
    }

    studentFees.push({
      id: faker.string.uuid(),
      studentId: student.id,
      studentName: student.name,
      studentClass: student.class,
      studentSection: student.section,
      admissionNumber: student.admissionNumber,
      feeStructureId: structure.id,
      feeTypeId: structure.feeTypeId,
      feeTypeName: structure.feeTypeName,
      academicYear: CURRENT_ACADEMIC_YEAR,
      totalAmount: structure.amount,
      paidAmount,
      discountAmount,
      dueDate: dueDate.toISOString(),
      status: finalStatus,
      createdAt: faker.date.past({ years: 1 }).toISOString(),
    })
  })
})

// ==================== PAYMENTS ====================

export const payments: Payment[] = []
export const receipts: Receipt[] = []

let receiptCounter = 1000

// Generate payments for paid/partial student fees
const paidOrPartialFees = studentFees.filter(sf => sf.paidAmount > 0)

paidOrPartialFees.forEach(fee => {
  const student = students.find(s => s.id === fee.studentId)
  if (!student) return

  const receiptNumber = `RCP${CURRENT_ACADEMIC_YEAR.replace('-', '')}${String(receiptCounter++).padStart(5, '0')}`
  const paymentMode = faker.helpers.arrayElement(PAYMENT_MODES)
  const collectedAt = faker.date.between({
    from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
    to: new Date(),
  })

  const payment: Payment = {
    id: faker.string.uuid(),
    receiptNumber,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    admissionNumber: student.admissionNumber,
    studentFeeId: fee.id,
    feeTypeName: fee.feeTypeName,
    amount: fee.paidAmount,
    paymentMode,
    transactionRef: paymentMode !== 'cash' ? faker.string.alphanumeric(12).toUpperCase() : undefined,
    collectedBy: faker.person.fullName(),
    collectedAt: collectedAt.toISOString(),
  }

  payments.push(payment)

  // Create receipt
  const receipt: Receipt = {
    id: faker.string.uuid(),
    receiptNumber,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    admissionNumber: student.admissionNumber,
    payments: [{ feeTypeName: fee.feeTypeName, amount: fee.paidAmount }],
    totalAmount: fee.paidAmount,
    paymentMode,
    transactionRef: payment.transactionRef,
    generatedBy: payment.collectedBy,
    generatedAt: collectedAt.toISOString(),
  }

  receipts.push(receipt)
})

// Sort payments by date descending
payments.sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime())

// ==================== OUTSTANDING DUES ====================

export function getOutstandingDues(): OutstandingDue[] {
  const overdueFeesMap = new Map<string, StudentFee[]>()

  studentFees
    .filter(sf => sf.status === 'overdue' || (sf.status === 'partial' && sf.paidAmount < sf.totalAmount - sf.discountAmount))
    .forEach(sf => {
      const existing = overdueFeesMap.get(sf.studentId) || []
      existing.push(sf)
      overdueFeesMap.set(sf.studentId, existing)
    })

  const outstandingDues: OutstandingDue[] = []

  overdueFeesMap.forEach((fees, studentId) => {
    const student = students.find(s => s.id === studentId)
    if (!student) return

    const totalDue = fees.reduce((sum, f) => sum + (f.totalAmount - f.discountAmount - f.paidAmount), 0)
    const oldestDueDate = fees.reduce((oldest, f) => {
      const date = new Date(f.dueDate)
      return date < oldest ? date : oldest
    }, new Date())
    const daysOverdue = Math.max(0, Math.floor((Date.now() - oldestDueDate.getTime()) / (1000 * 60 * 60 * 24)))

    outstandingDues.push({
      id: faker.string.uuid(),
      studentId: student.id,
      studentName: student.name,
      studentClass: student.class,
      studentSection: student.section,
      admissionNumber: student.admissionNumber,
      parentPhone: student.parent.guardianPhone,
      parentEmail: student.parent.guardianEmail,
      totalDue,
      daysOverdue,
      oldestDueDate: oldestDueDate.toISOString(),
      feeBreakdown: fees.map(f => ({
        feeTypeName: f.feeTypeName,
        amount: f.totalAmount - f.discountAmount - f.paidAmount,
        dueDate: f.dueDate,
      })),
      lastReminderSentAt: faker.datatype.boolean({ probability: 0.4 })
        ? faker.date.recent({ days: 14 }).toISOString()
        : undefined,
    })
  })

  return outstandingDues.sort((a, b) => b.totalDue - a.totalDue)
}

// ==================== EXPENSES ====================

export const expenses: Expense[] = []

let expenseCounter = 100

// Generate 25+ expenses
for (let i = 0; i < 25; i++) {
  const expenseData = faker.helpers.arrayElement(EXPENSE_DATA)
  const status = faker.helpers.weightedArrayElement([
    { value: 'pending_approval' as const, weight: 20 },
    { value: 'approved' as const, weight: 30 },
    { value: 'rejected' as const, weight: 10 },
    { value: 'paid' as const, weight: 40 },
  ])

  const requestedAt = faker.date.between({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
    to: new Date(),
  })

  const expense: Expense = {
    id: faker.string.uuid(),
    expenseNumber: `EXP${CURRENT_ACADEMIC_YEAR.replace('-', '')}${String(expenseCounter++).padStart(4, '0')}`,
    category: expenseData.category,
    description: expenseData.description,
    amount: faker.number.int({ min: expenseData.minAmount, max: expenseData.maxAmount }),
    vendorName: faker.helpers.arrayElement(VENDOR_NAMES),
    invoiceNumber: `INV-${faker.string.alphanumeric(8).toUpperCase()}`,
    invoiceDate: faker.date.recent({ days: 30 }).toISOString(),
    status,
    requestedBy: faker.person.fullName(),
    requestedAt: requestedAt.toISOString(),
  }

  if (status === 'approved' || status === 'paid') {
    expense.approvedBy = faker.person.fullName()
    expense.approvedAt = faker.date.between({
      from: requestedAt,
      to: new Date(),
    }).toISOString()
  }

  if (status === 'rejected') {
    expense.rejectedBy = faker.person.fullName()
    expense.rejectedAt = faker.date.between({
      from: requestedAt,
      to: new Date(),
    }).toISOString()
    expense.rejectionReason = faker.helpers.arrayElement([
      'Budget exceeded',
      'Invalid invoice',
      'Not approved by management',
      'Duplicate request',
      'Vendor not verified',
    ])
  }

  if (status === 'paid') {
    expense.paidAt = faker.date.between({
      from: new Date(expense.approvedAt!),
      to: new Date(),
    }).toISOString()
    expense.paidBy = faker.person.fullName()
    expense.paymentRef = `TXN${faker.string.alphanumeric(10).toUpperCase()}`
  }

  expenses.push(expense)
}

// Sort expenses by requested date descending
expenses.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())

// ==================== LEDGER ====================

export const ledgerEntries: LedgerEntry[] = []

let runningBalance = 1000000 // Opening balance of 10 lakhs

// Add payment entries (credits)
payments.forEach(payment => {
  runningBalance += payment.amount
  ledgerEntries.push({
    id: faker.string.uuid(),
    date: payment.collectedAt,
    type: 'credit',
    category: 'Fee Collection',
    referenceId: payment.id,
    referenceNumber: payment.receiptNumber,
    description: `${payment.feeTypeName} - ${payment.studentName}`,
    amount: payment.amount,
    balance: runningBalance,
  })
})

// Add paid expense entries (debits)
expenses.filter(e => e.status === 'paid').forEach(expense => {
  runningBalance -= expense.amount
  ledgerEntries.push({
    id: faker.string.uuid(),
    date: expense.paidAt!,
    type: 'debit',
    category: expense.category,
    referenceId: expense.id,
    referenceNumber: expense.expenseNumber,
    description: expense.description,
    amount: expense.amount,
    balance: runningBalance,
  })
})

// Sort ledger by date descending
ledgerEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

// Recalculate balances after sorting
let balance = 1000000
const sortedByDateAsc = [...ledgerEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
sortedByDateAsc.forEach(entry => {
  if (entry.type === 'credit') {
    balance += entry.amount
  } else {
    balance -= entry.amount
  }
  entry.balance = balance
})

// Re-sort descending for display
ledgerEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

// ==================== HELPER FUNCTIONS ====================

export function getFinanceStats(): FinanceStats {
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalExpected = studentFees.reduce((sum, sf) => sum + (sf.totalAmount - sf.discountAmount), 0)
  const totalPending = studentFees
    .filter(sf => sf.status !== 'paid' && sf.status !== 'waived')
    .reduce((sum, sf) => sum + (sf.totalAmount - sf.discountAmount - sf.paidAmount), 0)

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthCollection = payments
    .filter(p => new Date(p.collectedAt) >= thisMonthStart)
    .reduce((sum, p) => sum + p.amount, 0)

  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0

  const pendingExpenseApprovals = expenses.filter(e => e.status === 'pending_approval').length

  const overdueStudentsCount = new Set(
    studentFees.filter(sf => sf.status === 'overdue').map(sf => sf.studentId)
  ).size

  return {
    totalCollected,
    totalPending,
    thisMonthCollection,
    collectionRate,
    pendingExpenseApprovals,
    overdueStudentsCount,
  }
}

export function getLedgerBalance(): LedgerBalance {
  const openingBalance = 1000000
  const totalCredits = ledgerEntries
    .filter(e => e.type === 'credit')
    .reduce((sum, e) => sum + e.amount, 0)
  const totalDebits = ledgerEntries
    .filter(e => e.type === 'debit')
    .reduce((sum, e) => sum + e.amount, 0)
  const closingBalance = openingBalance + totalCredits - totalDebits

  return {
    openingBalance,
    totalCredits,
    totalDebits,
    closingBalance,
    asOfDate: new Date().toISOString(),
  }
}

export function getCollectionReport(dateFrom: string, dateTo: string): CollectionReport {
  const fromDate = new Date(dateFrom)
  const toDate = new Date(dateTo)

  const filteredPayments = payments.filter(p => {
    const date = new Date(p.collectedAt)
    return date >= fromDate && date <= toDate
  })

  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0)

  const byPaymentMode: Record<PaymentMode, number> = {
    cash: 0,
    upi: 0,
    bank_transfer: 0,
    cheque: 0,
    dd: 0,
    online: 0,
  }
  filteredPayments.forEach(p => {
    byPaymentMode[p.paymentMode] += p.amount
  })

  const feeTypeMap = new Map<string, number>()
  filteredPayments.forEach(p => {
    feeTypeMap.set(p.feeTypeName, (feeTypeMap.get(p.feeTypeName) || 0) + p.amount)
  })
  const byFeeType = Array.from(feeTypeMap.entries()).map(([feeTypeName, amount]) => ({
    feeTypeName,
    amount,
  }))

  const classMap = new Map<string, number>()
  filteredPayments.forEach(p => {
    classMap.set(p.studentClass, (classMap.get(p.studentClass) || 0) + p.amount)
  })
  const byClass = Array.from(classMap.entries()).map(([className, amount]) => ({
    className,
    amount,
  }))

  // Daily collections
  const dailyMap = new Map<string, number>()
  filteredPayments.forEach(p => {
    const date = new Date(p.collectedAt).toISOString().split('T')[0]
    dailyMap.set(date, (dailyMap.get(date) || 0) + p.amount)
  })
  const dailyCollections = Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    dateRange: { from: dateFrom, to: dateTo },
    totalCollected,
    byPaymentMode,
    byFeeType,
    byClass,
    dailyCollections,
  }
}

export function getDueReport(): DueReport {
  const outstandingDues = getOutstandingDues()

  const totalOutstanding = outstandingDues.reduce((sum, d) => sum + d.totalDue, 0)
  const totalStudentsWithDues = outstandingDues.length

  const classMap = new Map<string, { amount: number; count: number }>()
  outstandingDues.forEach(d => {
    const existing = classMap.get(d.studentClass) || { amount: 0, count: 0 }
    classMap.set(d.studentClass, {
      amount: existing.amount + d.totalDue,
      count: existing.count + 1,
    })
  })
  const byClass = Array.from(classMap.entries()).map(([className, data]) => ({
    className,
    amount: data.amount,
    count: data.count,
  }))

  // Ageing buckets
  const buckets = [
    { label: '0-30 days', min: 0, max: 30 },
    { label: '31-60 days', min: 31, max: 60 },
    { label: '61-90 days', min: 61, max: 90 },
    { label: '90+ days', min: 91, max: Infinity },
  ]

  const byAgeingBucket = buckets.map(bucket => {
    const matching = outstandingDues.filter(
      d => d.daysOverdue >= bucket.min && d.daysOverdue <= bucket.max
    )
    return {
      bucket: bucket.label,
      amount: matching.reduce((sum, d) => sum + d.totalDue, 0),
      count: matching.length,
    }
  })

  const topDefaulters = outstandingDues.slice(0, 10)

  return {
    totalOutstanding,
    totalStudentsWithDues,
    byClass,
    byAgeingBucket,
    topDefaulters,
  }
}

export function getFinancialSummary(academicYear: string): FinancialSummary {
  const totalFeeExpected = studentFees
    .filter(sf => sf.academicYear === academicYear)
    .reduce((sum, sf) => sum + (sf.totalAmount - sf.discountAmount), 0)

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)

  const totalPending = studentFees
    .filter(sf => sf.academicYear === academicYear && sf.status !== 'paid' && sf.status !== 'waived')
    .reduce((sum, sf) => sum + (sf.totalAmount - sf.discountAmount - sf.paidAmount), 0)

  const totalExpenses = expenses
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0)

  const netBalance = totalCollected - totalExpenses

  const collectionRate = totalFeeExpected > 0 ? Math.round((totalCollected / totalFeeExpected) * 100) : 0

  // Monthly trend
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  const monthlyTrend = months.map((month, index) => {
    const monthNum = (index + 3) % 12 // April is month 3
    const year = monthNum < 3 ? 2025 : 2024 // Jan-Mar are in next year

    const monthPayments = payments.filter(p => {
      const date = new Date(p.collectedAt)
      return date.getMonth() === monthNum && date.getFullYear() === year
    })

    const monthExpenses = expenses.filter(e => {
      if (e.status !== 'paid' || !e.paidAt) return false
      const date = new Date(e.paidAt)
      return date.getMonth() === monthNum && date.getFullYear() === year
    })

    return {
      month,
      collected: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    }
  })

  return {
    academicYear,
    totalFeeExpected,
    totalCollected,
    totalPending,
    totalExpenses,
    netBalance,
    collectionRate,
    monthlyTrend,
  }
}

// Export function to get student options for search
export function getStudentsForFeeCollection() {
  return students
    .filter(s => s.status === 'active')
    .map(s => ({
      id: s.id,
      name: s.name,
      className: s.class,
      section: s.section,
      admissionNumber: s.admissionNumber,
    }))
}

// ==================== INSTALLMENT PLANS ====================

const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36)

export const installmentPlans: InstallmentPlan[] = feeStructures.slice(0, 3).map((fs, idx) => {
  const numInstallments = [3, 4, 2][idx]
  const installmentAmount = Math.round(fs.amount / numInstallments)
  const installments: Installment[] = Array.from({ length: numInstallments }, (_, i) => {
    const dueDate = new Date(2024, 3 + i * Math.floor(12 / numInstallments), 10)
    const isPaid = i < Math.floor(numInstallments / 2)
    return {
      id: `inst_${idx}_${i}`,
      installmentNumber: i + 1,
      amount: installmentAmount,
      dueDate: dueDate.toISOString().split('T')[0],
      status: (isPaid ? 'paid' : i === Math.floor(numInstallments / 2) ? 'partial' : 'pending') as PaymentStatus,
      paidAmount: isPaid ? installmentAmount : i === Math.floor(numInstallments / 2) ? Math.round(installmentAmount * 0.5) : 0,
      paidDate: isPaid ? faker.date.recent({ days: 30 }).toISOString().split('T')[0] : undefined,
    }
  })

  return {
    id: `iplan_${String(idx + 1).padStart(3, '0')}`,
    name: `${fs.feeTypeName} - ${numInstallments} Installments`,
    feeStructureId: fs.id,
    feeTypeName: fs.feeTypeName,
    totalAmount: fs.amount,
    numberOfInstallments: numInstallments,
    installments,
    isActive: true,
    academicYear: CURRENT_ACADEMIC_YEAR,
    applicableClasses: fs.applicableClasses,
    createdAt: faker.date.past().toISOString(),
  }
})

// ==================== DISCOUNT RULES ====================

export const discountRules: DiscountRule[] = [
  {
    id: 'disc_001',
    name: 'Sibling Discount - 2nd Child',
    type: 'percentage',
    value: 10,
    applicability: 'sibling',
    applicableFeeTypes: feeTypes.map(f => f.id),
    applicableClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    isActive: true,
    academicYear: CURRENT_ACADEMIC_YEAR,
    description: '10% discount on all fees for the second child from the same family',
    createdAt: faker.date.past().toISOString(),
  },
  {
    id: 'disc_002',
    name: 'Sibling Discount - 3rd Child',
    type: 'percentage',
    value: 20,
    applicability: 'sibling',
    applicableFeeTypes: feeTypes.map(f => f.id),
    applicableClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    isActive: true,
    academicYear: CURRENT_ACADEMIC_YEAR,
    description: '20% discount on all fees for the third child from the same family',
    createdAt: faker.date.past().toISOString(),
  },
  {
    id: 'disc_003',
    name: 'Academic Merit Scholarship',
    type: 'percentage',
    value: 50,
    applicability: 'scholarship',
    applicableFeeTypes: [feeTypes[0].id],
    applicableClasses: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    maxDiscount: 50000,
    minPercentage: 90,
    isActive: true,
    academicYear: CURRENT_ACADEMIC_YEAR,
    description: '50% tuition fee scholarship for students scoring above 90% in previous year',
    createdAt: faker.date.past().toISOString(),
  },
  {
    id: 'disc_004',
    name: 'Staff Ward Discount',
    type: 'percentage',
    value: 100,
    applicability: 'staff_ward',
    applicableFeeTypes: [feeTypes[0].id],
    applicableClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    isActive: true,
    academicYear: CURRENT_ACADEMIC_YEAR,
    description: 'Full tuition fee waiver for children of school staff',
    createdAt: faker.date.past().toISOString(),
  },
  {
    id: 'disc_005',
    name: 'Early Bird Discount',
    type: 'fixed_amount',
    value: 5000,
    applicability: 'early_bird',
    applicableFeeTypes: [feeTypes[0].id, feeTypes[1].id],
    applicableClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    isActive: true,
    academicYear: CURRENT_ACADEMIC_YEAR,
    description: '₹5,000 off on tuition + development fees if paid before April 30',
    createdAt: faker.date.past().toISOString(),
  },
]

export const appliedDiscounts: AppliedDiscount[] = Array.from({ length: 15 }, (_, i) => {
  const rule = faker.helpers.arrayElement(discountRules)
  const student = faker.helpers.arrayElement(students.filter(s => s.status === 'active'))
  const originalAmount = faker.number.int({ min: 10000, max: 80000 })
  const discountAmount = rule.type === 'percentage'
    ? Math.round(originalAmount * rule.value / 100)
    : rule.value

  return {
    id: `adisc_${String(i + 1).padStart(3, '0')}`,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    discountRuleId: rule.id,
    discountRuleName: rule.name,
    feeTypeName: faker.helpers.arrayElement(feeTypes).name,
    originalAmount,
    discountAmount: Math.min(discountAmount, originalAmount),
    finalAmount: originalAmount - Math.min(discountAmount, originalAmount),
    appliedAt: faker.date.recent({ days: 60 }).toISOString(),
    appliedBy: 'Admin User',
  }
})

// ==================== CONCESSION REQUESTS ====================

export const concessionRequests: ConcessionRequest[] = [
  {
    id: 'conc_001',
    studentId: students[0]?.id || 'STU001',
    studentName: students[0]?.name || 'Rahul Kumar',
    studentClass: students[0]?.class || 'Class 10',
    section: students[0]?.section || 'A',
    admissionNumber: students[0]?.admissionNumber || 'ADM001',
    parentName: 'Suresh Kumar',
    feeTypes: ['Tuition Fee', 'Development Fee'],
    concessionType: 'percentage',
    concessionValue: 25,
    reason: 'Father lost job due to factory closure. Family facing financial hardship.',
    status: 'pending',
    requestedBy: 'Suresh Kumar (Parent)',
    requestedAt: faker.date.recent({ days: 5 }).toISOString(),
    validFrom: '2024-04-01',
    validTo: '2025-03-31',
    totalConcessionAmount: 25000,
  },
  {
    id: 'conc_002',
    studentId: students[1]?.id || 'STU002',
    studentName: students[1]?.name || 'Priya Sharma',
    studentClass: students[1]?.class || 'Class 9',
    section: students[1]?.section || 'B',
    admissionNumber: students[1]?.admissionNumber || 'ADM002',
    parentName: 'Ramesh Sharma',
    feeTypes: ['Tuition Fee'],
    concessionType: 'fixed_amount',
    concessionValue: 15000,
    reason: 'Single parent household. Student has excellent academic record (95% last year).',
    status: 'approved',
    requestedBy: 'Ramesh Sharma (Parent)',
    requestedAt: faker.date.recent({ days: 30 }).toISOString(),
    approvedBy: 'Dr. Sharma (Principal)',
    approvedAt: faker.date.recent({ days: 25 }).toISOString(),
    validFrom: '2024-04-01',
    validTo: '2025-03-31',
    totalConcessionAmount: 15000,
  },
  {
    id: 'conc_003',
    studentId: students[2]?.id || 'STU003',
    studentName: students[2]?.name || 'Amit Singh',
    studentClass: students[2]?.class || 'Class 8',
    section: students[2]?.section || 'A',
    admissionNumber: students[2]?.admissionNumber || 'ADM003',
    parentName: 'Vikram Singh',
    feeTypes: ['Tuition Fee', 'Lab Fee', 'Sports Fee'],
    concessionType: 'percentage',
    concessionValue: 50,
    reason: 'Student is a national-level sports player. Requesting sports and academic fee concession.',
    status: 'rejected',
    requestedBy: 'Vikram Singh (Parent)',
    requestedAt: faker.date.recent({ days: 20 }).toISOString(),
    rejectedBy: 'Admin',
    rejectedAt: faker.date.recent({ days: 15 }).toISOString(),
    rejectionReason: 'Sports scholarship already covers sports fee. Lab fee concession not applicable under current policy.',
    validFrom: '2024-04-01',
    validTo: '2025-03-31',
    totalConcessionAmount: 35000,
  },
]

// ==================== AUTO-REMINDER ESCALATION ====================

export const escalationConfig: ReminderEscalationConfig = {
  enabled: true,
  rules: [
    {
      id: 'esc_001',
      name: 'First Reminder - SMS',
      daysAfterDue: 7,
      channel: 'sms',
      recipient: 'parent',
      messageTemplate: 'Dear Parent, fee of ₹{amount} for {student} is overdue by {days} days. Please pay at the earliest.',
      isActive: true,
    },
    {
      id: 'esc_002',
      name: 'Second Reminder - Email',
      daysAfterDue: 14,
      channel: 'email',
      recipient: 'parent',
      messageTemplate: 'Dear Parent, this is a reminder that fee of ₹{amount} for {student} is overdue by {days} days.',
      isActive: true,
    },
    {
      id: 'esc_003',
      name: 'Third Reminder - WhatsApp + SMS',
      daysAfterDue: 30,
      channel: 'whatsapp',
      recipient: 'parent',
      messageTemplate: 'URGENT: Fee of ₹{amount} for {student} is overdue by {days} days. Please settle immediately to avoid penalty.',
      isActive: true,
    },
    {
      id: 'esc_004',
      name: 'Principal Notification',
      daysAfterDue: 45,
      channel: 'email',
      recipient: 'principal',
      messageTemplate: 'Student {student} has fee overdue of ₹{amount} for {days} days. Requires intervention.',
      isActive: true,
    },
  ],
}

export const reminderLogs: ReminderLog[] = Array.from({ length: 20 }, (_, i) => {
  const student = faker.helpers.arrayElement(students.filter(s => s.status === 'active'))
  const rule = faker.helpers.arrayElement(escalationConfig.rules)
  return {
    id: `rlog_${String(i + 1).padStart(3, '0')}`,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    channel: rule.channel,
    recipient: faker.internet.email(),
    message: rule.messageTemplate
      .replace('{amount}', String(faker.number.int({ min: 5000, max: 50000 })))
      .replace('{student}', student.name)
      .replace('{days}', String(faker.number.int({ min: 7, max: 60 }))),
    escalationLevel: escalationConfig.rules.indexOf(rule) + 1,
    daysOverdue: faker.number.int({ min: 7, max: 90 }),
    sentAt: faker.date.recent({ days: 30 }).toISOString(),
    status: faker.helpers.arrayElement(['sent', 'delivered', 'failed'] as const),
    amount: faker.number.int({ min: 5000, max: 50000 }),
  }
})

// ==================== ONLINE PAYMENT CONFIG ====================

export const onlinePaymentConfig: OnlinePaymentConfig = {
  gateway: 'razorpay',
  isEnabled: true,
  testMode: true,
  merchantId: 'rzp_test_xxxxxxxxxxxx',
}

export const onlinePaymentOrders: OnlinePaymentOrder[] = Array.from({ length: 10 }, (_, i) => {
  const student = faker.helpers.arrayElement(students.filter(s => s.status === 'active'))
  const status = faker.helpers.arrayElement(['created', 'processing', 'completed', 'failed'] as const)

  return {
    id: `opay_${String(i + 1).padStart(3, '0')}`,
    orderId: `order_${faker.string.alphanumeric(16)}`,
    studentId: student.id,
    studentName: student.name,
    amount: faker.number.int({ min: 5000, max: 100000 }),
    feeIds: [faker.helpers.arrayElement(studentFees).id],
    gateway: 'razorpay',
    status,
    paymentLink: status === 'created' ? `https://rzp.io/i/${faker.string.alphanumeric(8)}` : undefined,
    transactionId: status === 'completed' ? `pay_${faker.string.alphanumeric(14)}` : undefined,
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
    completedAt: status === 'completed' ? faker.date.recent({ days: 15 }).toISOString() : undefined,
  }
})

// ==================== PARENT FINANCIAL DASHBOARD ====================

export function getParentFeeDashboard(childIds: string[]): ParentFeeDashboard {
  const children: ChildFeeOverview[] = childIds.map(childId => {
    const student = students.find(s => s.id === childId)
    const fees = studentFees.filter(f => f.studentId === childId)
    const totalFees = fees.reduce((sum, f) => sum + f.totalAmount, 0)
    const paidAmount = fees.reduce((sum, f) => sum + f.paidAmount, 0)
    const discountAmount = fees.reduce((sum, f) => sum + f.discountAmount, 0)
    const pendingAmount = totalFees - paidAmount - discountAmount

    return {
      studentId: childId,
      studentName: student?.name || 'Unknown Student',
      className: student?.class || 'Unknown',
      section: student?.section || 'A',
      totalFees,
      paidAmount,
      pendingAmount: Math.max(0, pendingAmount),
      discountAmount,
      paymentPercentage: totalFees > 0 ? Math.round((paidAmount / totalFees) * 100) : 0,
      fees,
    }
  })

  const totalPending = children.reduce((sum, c) => sum + c.pendingAmount, 0)
  const totalPaid = children.reduce((sum, c) => sum + c.paidAmount, 0)

  const upcomingDues: UpcomingDue[] = children.flatMap(c =>
    c.fees
      .filter(f => f.status === 'pending' || f.status === 'partial')
      .map(f => {
        const dueDate = new Date(f.dueDate)
        const today = new Date()
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return {
          feeTypeName: f.feeTypeName,
          studentName: c.studentName,
          amount: f.totalAmount - f.paidAmount - f.discountAmount,
          dueDate: f.dueDate,
          daysUntilDue,
        }
      })
  ).sort((a, b) => a.daysUntilDue - b.daysUntilDue).slice(0, 5)

  const recentPayments = payments
    .filter(p => childIds.includes(p.studentId))
    .sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime())
    .slice(0, 10)

  const downloadableReceipts: ReceiptSummary[] = receipts
    .filter(r => childIds.includes(r.studentId))
    .map(r => ({
      receiptNumber: r.receiptNumber,
      date: r.generatedAt,
      amount: r.totalAmount,
      studentName: r.studentName,
    }))
    .slice(0, 10)

  return {
    children,
    totalPending,
    totalPaid,
    upcomingDues,
    recentPayments,
    downloadableReceipts,
  }
}
