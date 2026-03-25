import { prisma } from '../config/db.js'
import { feeCategoryReverse } from './fee-type.service.js'
import { paymentModeReverse, paymentStatusReverse } from './student-fee.service.js'

// ==================== Collection Report ====================

export async function getCollectionReport(schoolId: string, query: {
  startDate?: string
  endDate?: string
  academicYear?: string
}) {
  const where: any = { organizationId: schoolId }
  if (query.startDate || query.endDate) {
    where.collectedAt = {}
    if (query.startDate) where.collectedAt.gte = new Date(query.startDate)
    if (query.endDate) where.collectedAt.lte = new Date(query.endDate + 'T23:59:59.999Z')
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      student: { include: { class: true } },
      studentFee: {
        include: { feeStructure: { include: { feeType: true } } },
      },
    },
  })

  // By payment mode
  const byPaymentMode: Record<string, { count: number; total: number }> = {}
  // By fee type
  const byFeeType: Record<string, { count: number; total: number }> = {}
  // By class
  const byClass: Record<string, { count: number; total: number }> = {}
  // By date (daily)
  const byDate: Record<string, { count: number; total: number }> = {}

  let totalAmount = 0
  let totalCount = payments.length

  for (const p of payments) {
    const amount = Number(p.amount)
    totalAmount += amount

    // By payment mode
    const mode = paymentModeReverse[p.paymentMode] || p.paymentMode
    if (!byPaymentMode[mode]) byPaymentMode[mode] = { count: 0, total: 0 }
    byPaymentMode[mode].count++
    byPaymentMode[mode].total += amount

    // By fee type
    const feeTypeName = p.studentFee?.feeStructure?.feeType?.name || 'Unknown'
    if (!byFeeType[feeTypeName]) byFeeType[feeTypeName] = { count: 0, total: 0 }
    byFeeType[feeTypeName].count++
    byFeeType[feeTypeName].total += amount

    // By class
    const className = p.student?.class?.name || 'Unknown'
    if (!byClass[className]) byClass[className] = { count: 0, total: 0 }
    byClass[className].count++
    byClass[className].total += amount

    // By date
    const dateStr = p.collectedAt.toISOString().slice(0, 10)
    if (!byDate[dateStr]) byDate[dateStr] = { count: 0, total: 0 }
    byDate[dateStr].count++
    byDate[dateStr].total += amount
  }

  // Build byPaymentMode as Record<string, number> for frontend
  const byPaymentModeRecord: Record<string, number> = {}
  for (const [mode, data] of Object.entries(byPaymentMode)) {
    byPaymentModeRecord[mode] = data.total
  }

  return {
    totalCollected: totalAmount,
    totalCount,
    dateRange: {
      from: query.startDate || '',
      to: query.endDate || '',
    },
    byPaymentMode: byPaymentModeRecord,
    byFeeType: Object.entries(byFeeType).map(([name, data]) => ({
      feeTypeName: name, amount: data.total,
    })),
    byClass: Object.entries(byClass).map(([name, data]) => ({
      className: name, amount: data.total,
    })),
    dailyCollections: Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, amount: data.total })),
  }
}

// ==================== Due Report ====================

export async function getDueReport(schoolId: string, query: {
  academicYear?: string
}) {
  const where: any = {
    organizationId: schoolId,
    status: { in: ['fps_pending', 'fps_partial', 'fps_overdue'] },
  }
  if (query.academicYear) where.academicYear = query.academicYear

  const fees = await prisma.studentFee.findMany({
    where,
    include: {
      student: { include: { class: true, section: true, parent: true } },
      feeStructure: { include: { feeType: true } },
    },
  })

  // By class
  const byClass: Record<string, { studentCount: Set<string>; totalDue: number; totalPaid: number; outstanding: number }> = {}
  // Ageing buckets
  const ageingBuckets = {
    current: { count: 0, amount: 0 },       // not yet due
    '1-30': { count: 0, amount: 0 },        // 1-30 days overdue
    '31-60': { count: 0, amount: 0 },       // 31-60 days
    '61-90': { count: 0, amount: 0 },       // 61-90 days
    '90+': { count: 0, amount: 0 },         // 90+ days
  }
  // Top defaulters — collect full OutstandingDue shape
  const studentDues: Record<string, {
    studentName: string
    studentClass: string
    studentSection: string
    admissionNumber: string
    totalDue: number
    oldestDueDate: Date | null
    feeBreakdown: { feeTypeName: string; amount: number; dueDate: Date }[]
    parentPhone: string
    parentEmail: string
  }> = {}

  const now = Date.now()
  let totalOutstanding = 0
  const studentsWithDues = new Set<string>()

  for (const fee of fees) {
    const due = Number(fee.totalAmount) - Number(fee.discountAmount)
    const outstanding = due - Number(fee.paidAmount)
    const className = fee.student?.class?.name || 'Unknown'

    totalOutstanding += outstanding
    studentsWithDues.add(fee.studentId)

    // By class
    if (!byClass[className]) {
      byClass[className] = { studentCount: new Set(), totalDue: 0, totalPaid: 0, outstanding: 0 }
    }
    byClass[className].studentCount.add(fee.studentId)
    byClass[className].totalDue += due
    byClass[className].totalPaid += Number(fee.paidAmount)
    byClass[className].outstanding += outstanding

    // Ageing
    const daysOverdue = Math.floor((now - new Date(fee.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    if (daysOverdue <= 0) {
      ageingBuckets.current.count++
      ageingBuckets.current.amount += outstanding
    } else if (daysOverdue <= 30) {
      ageingBuckets['1-30'].count++
      ageingBuckets['1-30'].amount += outstanding
    } else if (daysOverdue <= 60) {
      ageingBuckets['31-60'].count++
      ageingBuckets['31-60'].amount += outstanding
    } else if (daysOverdue <= 90) {
      ageingBuckets['61-90'].count++
      ageingBuckets['61-90'].amount += outstanding
    } else {
      ageingBuckets['90+'].count++
      ageingBuckets['90+'].amount += outstanding
    }

    // Top defaulters
    if (!studentDues[fee.studentId]) {
      studentDues[fee.studentId] = {
        studentName: fee.student ? `${fee.student.firstName} ${fee.student.lastName}` : 'Unknown',
        studentClass: className,
        studentSection: (fee.student as any)?.section?.name || '',
        admissionNumber: fee.student?.admissionNumber || '',
        totalDue: 0,
        oldestDueDate: null,
        feeBreakdown: [],
        parentPhone: (fee.student as any)?.parent?.guardianPhone || '',
        parentEmail: (fee.student as any)?.parent?.guardianEmail || '',
      }
    }
    const entry = studentDues[fee.studentId]
    entry.totalDue += outstanding
    entry.feeBreakdown.push({
      feeTypeName: fee.feeStructure?.feeType?.name || 'Unknown',
      amount: outstanding,
      dueDate: fee.dueDate,
    })
    if (!entry.oldestDueDate || fee.dueDate < entry.oldestDueDate) {
      entry.oldestDueDate = fee.dueDate
    }
  }

  const topDefaulters = Object.entries(studentDues)
    .map(([id, data]) => ({
      id,
      studentId: id,
      studentName: data.studentName,
      studentClass: data.studentClass,
      studentSection: data.studentSection,
      admissionNumber: data.admissionNumber,
      totalDue: data.totalDue,
      daysOverdue: data.oldestDueDate
        ? Math.max(0, Math.floor((now - new Date(data.oldestDueDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 0,
      feeBreakdown: data.feeBreakdown,
      parentPhone: data.parentPhone,
      parentEmail: data.parentEmail,
      lastReminderSentAt: null,
    }))
    .sort((a, b) => b.totalDue - a.totalDue)
    .slice(0, 10)

  return {
    totalOutstanding,
    totalStudentsWithDues: studentsWithDues.size,
    byClass: Object.entries(byClass).map(([name, data]) => ({
      className: name,
      amount: data.outstanding,
      count: data.studentCount.size,
    })),
    byAgeingBucket: Object.entries(ageingBuckets).map(([bucket, data]) => ({
      bucket, ...data,
    })),
    topDefaulters,
  }
}

// ==================== Financial Summary ====================

export async function getFinancialSummary(schoolId: string, query: {
  academicYear?: string
  startDate?: string
  endDate?: string
}) {
  // Collections (payments)
  const paymentWhere: any = { organizationId: schoolId }
  if (query.startDate || query.endDate) {
    paymentWhere.collectedAt = {}
    if (query.startDate) paymentWhere.collectedAt.gte = new Date(query.startDate)
    if (query.endDate) paymentWhere.collectedAt.lte = new Date(query.endDate + 'T23:59:59.999Z')
  }

  const payments = await prisma.payment.findMany({
    where: paymentWhere,
    select: { amount: true, collectedAt: true },
  })

  // Expenses
  const expenseWhere: any = { organizationId: schoolId, status: 'es_paid' }
  if (query.startDate || query.endDate) {
    expenseWhere.paidAt = {}
    if (query.startDate) expenseWhere.paidAt.gte = new Date(query.startDate)
    if (query.endDate) expenseWhere.paidAt.lte = new Date(query.endDate + 'T23:59:59.999Z')
  }

  const expenses = await prisma.expense.findMany({
    where: expenseWhere,
    select: { amount: true, paidAt: true },
  })

  const totalCollections = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  // Monthly trend
  const monthlyData: Record<string, { collections: number; expenses: number }> = {}

  for (const p of payments) {
    const month = p.collectedAt.toISOString().slice(0, 7) // YYYY-MM
    if (!monthlyData[month]) monthlyData[month] = { collections: 0, expenses: 0 }
    monthlyData[month].collections += Number(p.amount)
  }

  for (const e of expenses) {
    if (e.paidAt) {
      const month = e.paidAt.toISOString().slice(0, 7)
      if (!monthlyData[month]) monthlyData[month] = { collections: 0, expenses: 0 }
      monthlyData[month].expenses += Number(e.amount)
    }
  }

  const monthlyTrend = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      collections: data.collections,
      expenses: data.expenses,
      net: data.collections - data.expenses,
    }))

  return {
    totalCollections,
    totalExpenses,
    netIncome: totalCollections - totalExpenses,
    monthlyTrend,
  }
}

// ==================== Dashboard Stats ====================

export async function getFinanceStats(schoolId: string) {
  // thisMonthCollection: payments where collectedAt >= start of current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalStudentFees,
    pendingFees,
    overdueFees,
    totalPayments,
    pendingExpenses,
    thisMonthPayments,
    overdueStudentCount,
  ] = await Promise.all([
    prisma.studentFee.aggregate({ where: { organizationId: schoolId }, _sum: { totalAmount: true } }),
    prisma.studentFee.aggregate({
      where: { organizationId: schoolId, status: { in: ['fps_pending', 'fps_partial'] } },
      _sum: { totalAmount: true, paidAmount: true, discountAmount: true },
    }),
    prisma.studentFee.aggregate({
      where: { organizationId: schoolId, status: 'fps_overdue' },
      _sum: { totalAmount: true, paidAmount: true, discountAmount: true },
    }),
    prisma.payment.aggregate({ where: { organizationId: schoolId }, _sum: { amount: true } }),
    prisma.expense.count({ where: { organizationId: schoolId, status: 'es_pending_approval' } }),
    prisma.payment.aggregate({
      where: { organizationId: schoolId, collectedAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.studentFee.groupBy({
      by: ['studentId'],
      where: { organizationId: schoolId, status: 'fps_overdue' },
    }),
  ])

  const totalFeeAmount = Number(totalStudentFees._sum.totalAmount || 0)
  const totalCollected = Number(totalPayments._sum.amount || 0)

  const pendingAmount = Number(pendingFees._sum.totalAmount || 0) -
    Number(pendingFees._sum.paidAmount || 0) -
    Number(pendingFees._sum.discountAmount || 0)

  const overdueAmount = Number(overdueFees._sum.totalAmount || 0) -
    Number(overdueFees._sum.paidAmount || 0) -
    Number(overdueFees._sum.discountAmount || 0)

  return {
    totalCollected,
    totalPending: pendingAmount + overdueAmount,
    thisMonthCollection: Number(thisMonthPayments._sum.amount || 0),
    collectionRate: totalFeeAmount > 0 ? Math.round((totalCollected / totalFeeAmount) * 100) : 0,
    pendingExpenseApprovals: pendingExpenses,
    overdueStudentsCount: overdueStudentCount.length,
  }
}
