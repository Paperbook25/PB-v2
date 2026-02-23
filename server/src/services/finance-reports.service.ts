import { prisma } from '../config/db.js'
import { feeCategoryReverse } from './fee-type.service.js'
import { paymentModeReverse, paymentStatusReverse } from './student-fee.service.js'

// ==================== Collection Report ====================

export async function getCollectionReport(query: {
  startDate?: string
  endDate?: string
  academicYear?: string
}) {
  const where: any = {}
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

  return {
    totalAmount,
    totalCount,
    byPaymentMode: Object.entries(byPaymentMode).map(([mode, data]) => ({
      paymentMode: mode, ...data,
    })),
    byFeeType: Object.entries(byFeeType).map(([name, data]) => ({
      feeType: name, ...data,
    })),
    byClass: Object.entries(byClass).map(([name, data]) => ({
      class: name, ...data,
    })),
    daily: Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data })),
  }
}

// ==================== Due Report ====================

export async function getDueReport(query: {
  academicYear?: string
}) {
  const where: any = {
    status: { in: ['fps_pending', 'fps_partial', 'fps_overdue'] },
  }
  if (query.academicYear) where.academicYear = query.academicYear

  const fees = await prisma.studentFee.findMany({
    where,
    include: {
      student: { include: { class: true } },
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
  // Top defaulters
  const studentDues: Record<string, { name: string; class: string; outstanding: number }> = {}

  const now = Date.now()

  for (const fee of fees) {
    const due = Number(fee.totalAmount) - Number(fee.discountAmount)
    const outstanding = due - Number(fee.paidAmount)
    const className = fee.student?.class?.name || 'Unknown'

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
        name: fee.student ? `${fee.student.firstName} ${fee.student.lastName}` : 'Unknown',
        class: className,
        outstanding: 0,
      }
    }
    studentDues[fee.studentId].outstanding += outstanding
  }

  const topDefaulters = Object.entries(studentDues)
    .map(([id, data]) => ({ studentId: id, ...data }))
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 10)

  return {
    byClass: Object.entries(byClass).map(([name, data]) => ({
      class: name,
      studentCount: data.studentCount.size,
      totalDue: data.totalDue,
      totalPaid: data.totalPaid,
      outstanding: data.outstanding,
    })),
    byAgeingBucket: Object.entries(ageingBuckets).map(([bucket, data]) => ({
      bucket, ...data,
    })),
    topDefaulters,
  }
}

// ==================== Financial Summary ====================

export async function getFinancialSummary(query: {
  academicYear?: string
  startDate?: string
  endDate?: string
}) {
  // Collections (payments)
  const paymentWhere: any = {}
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
  const expenseWhere: any = { status: 'es_paid' }
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

export async function getFinanceStats() {
  const [
    totalStudentFees,
    paidFees,
    pendingFees,
    overdueFees,
    totalPayments,
    totalExpenses,
    pendingExpenses,
  ] = await Promise.all([
    prisma.studentFee.aggregate({ _sum: { totalAmount: true } }),
    prisma.studentFee.aggregate({
      where: { status: 'fps_paid' },
      _sum: { paidAmount: true },
      _count: true,
    }),
    prisma.studentFee.aggregate({
      where: { status: { in: ['fps_pending', 'fps_partial'] } },
      _sum: { totalAmount: true, paidAmount: true, discountAmount: true },
      _count: true,
    }),
    prisma.studentFee.aggregate({
      where: { status: 'fps_overdue' },
      _sum: { totalAmount: true, paidAmount: true, discountAmount: true },
      _count: true,
    }),
    prisma.payment.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.expense.aggregate({
      where: { status: 'es_paid' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.count({ where: { status: 'es_pending_approval' } }),
  ])

  const totalFeeAmount = Number(totalStudentFees._sum.totalAmount || 0)
  const totalCollected = Number(totalPayments._sum.amount || 0)
  const totalExpenseAmount = Number(totalExpenses._sum.amount || 0)

  const pendingAmount = Number(pendingFees._sum.totalAmount || 0) -
    Number(pendingFees._sum.paidAmount || 0) -
    Number(pendingFees._sum.discountAmount || 0)

  const overdueAmount = Number(overdueFees._sum.totalAmount || 0) -
    Number(overdueFees._sum.paidAmount || 0) -
    Number(overdueFees._sum.discountAmount || 0)

  return {
    totalFeeAmount,
    totalCollected,
    totalExpenseAmount,
    netIncome: totalCollected - totalExpenseAmount,
    collectionRate: totalFeeAmount > 0 ? Math.round((totalCollected / totalFeeAmount) * 100) : 0,
    pendingAmount,
    pendingCount: pendingFees._count || 0,
    overdueAmount,
    overdueCount: overdueFees._count || 0,
    totalPaymentCount: totalPayments._count || 0,
    totalExpenseCount: totalExpenses._count || 0,
    pendingExpenseCount: pendingExpenses,
  }
}
