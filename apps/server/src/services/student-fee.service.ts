import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { feeCategoryReverse } from './fee-type.service.js'
import { frequencyReverse } from './fee-structure.service.js'
import { createLedgerEntry } from './ledger.service.js'
import type { UpdateStudentFeeInput, CollectPaymentInput, BulkAssignInput } from '../validators/finance.validators.js'

// ==================== Enum Mapping ====================

const paymentStatusMap: Record<string, string> = {
  pending: 'fps_pending',
  partial: 'fps_partial',
  paid: 'fps_paid',
  overdue: 'fps_overdue',
  waived: 'fps_waived',
}

const paymentStatusReverse: Record<string, string> = Object.fromEntries(
  Object.entries(paymentStatusMap).map(([k, v]) => [v, k])
)

const paymentModeMap: Record<string, string> = {
  cash: 'pm_cash',
  upi: 'pm_upi',
  bank_transfer: 'pm_bank_transfer',
  cheque: 'pm_cheque',
  dd: 'pm_dd',
  online: 'pm_online',
}

const paymentModeReverse: Record<string, string> = Object.fromEntries(
  Object.entries(paymentModeMap).map(([k, v]) => [v, k])
)

// ==================== Helpers ====================

const studentFeeInclude = {
  student: {
    include: { class: true, section: true },
  },
  feeStructure: {
    include: { feeType: true },
  },
}

function formatStudentFee(sf: any) {
  return {
    id: sf.id,
    studentId: sf.studentId,
    student: sf.student ? {
      id: sf.student.id,
      name: `${sf.student.firstName} ${sf.student.lastName}`.trim(),
      admissionNumber: sf.student.admissionNumber,
      class: sf.student.class?.name,
      section: sf.student.section?.name,
    } : undefined,
    feeStructureId: sf.feeStructureId,
    feeType: sf.feeStructure?.feeType ? {
      id: sf.feeStructure.feeType.id,
      name: sf.feeStructure.feeType.name,
      category: feeCategoryReverse[sf.feeStructure.feeType.category] || sf.feeStructure.feeType.category,
    } : undefined,
    feeTypeId: sf.feeTypeId,
    academicYear: sf.academicYear,
    totalAmount: Number(sf.totalAmount),
    paidAmount: Number(sf.paidAmount),
    discountAmount: Number(sf.discountAmount),
    dueDate: sf.dueDate,
    status: paymentStatusReverse[sf.status] || sf.status,
    frequency: sf.feeStructure ? frequencyReverse[sf.feeStructure.frequency] || sf.feeStructure.frequency : undefined,
    createdAt: sf.createdAt,
    updatedAt: sf.updatedAt,
  }
}

function formatPayment(p: any) {
  return {
    id: p.id,
    receiptNumber: p.receiptNumber,
    studentId: p.studentId,
    student: p.student ? {
      id: p.student.id,
      name: `${p.student.firstName} ${p.student.lastName}`.trim(),
      admissionNumber: p.student.admissionNumber,
      class: p.student.class?.name,
      section: p.student.section?.name,
    } : undefined,
    studentFeeId: p.studentFeeId,
    amount: Number(p.amount),
    paymentMode: paymentModeReverse[p.paymentMode] || p.paymentMode,
    transactionRef: p.transactionRef,
    remarks: p.remarks,
    collectedBy: p.collectedBy,
    collectedById: p.collectedById,
    collectedAt: p.collectedAt,
    createdAt: p.createdAt,
  }
}

async function generateReceiptNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const prefix = `RCP-${dateStr}-`

  const lastPayment = await prisma.payment.findFirst({
    where: { receiptNumber: { startsWith: prefix } },
    orderBy: { receiptNumber: 'desc' },
    select: { receiptNumber: true },
  })

  let seq = 1
  if (lastPayment) {
    const parts = lastPayment.receiptNumber.split('-')
    seq = parseInt(parts[parts.length - 1], 10) + 1
  }

  return `${prefix}${String(seq).padStart(4, '0')}`
}

// ==================== Student Fee CRUD ====================

export async function listStudentFees(query: {
  page?: number
  limit?: number
  studentId?: string
  feeStructureId?: string
  status?: string
  academicYear?: string
  className?: string
}) {
  const page = query.page || 1
  const limit = query.limit || 20
  const where: any = {}

  if (query.studentId) where.studentId = query.studentId
  if (query.feeStructureId) where.feeStructureId = query.feeStructureId
  if (query.status && paymentStatusMap[query.status]) {
    where.status = paymentStatusMap[query.status]
  }
  if (query.academicYear) where.academicYear = query.academicYear
  if (query.className) {
    const cls = await prisma.class.findFirst({ where: { name: query.className } })
    if (cls) {
      where.student = { classId: cls.id }
    }
  }

  const [total, fees] = await Promise.all([
    prisma.studentFee.count({ where }),
    prisma.studentFee.findMany({
      where,
      include: studentFeeInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: fees.map(formatStudentFee),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getStudentFeeById(id: string) {
  const sf = await prisma.studentFee.findUnique({
    where: { id },
    include: studentFeeInclude,
  })
  if (!sf) throw AppError.notFound('Student fee not found')
  return formatStudentFee(sf)
}

export async function getStudentFees(studentId: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) throw AppError.notFound('Student not found')

  const fees = await prisma.studentFee.findMany({
    where: { studentId },
    include: studentFeeInclude,
    orderBy: { dueDate: 'asc' },
  })

  return { data: fees.map(formatStudentFee) }
}

export async function updateStudentFee(id: string, input: UpdateStudentFeeInput) {
  const existing = await prisma.studentFee.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Student fee not found')

  const data: any = {}
  if (input.totalAmount !== undefined) data.totalAmount = input.totalAmount
  if (input.discountAmount !== undefined) data.discountAmount = input.discountAmount
  if (input.dueDate !== undefined) data.dueDate = new Date(input.dueDate)
  if (input.status !== undefined && paymentStatusMap[input.status]) {
    data.status = paymentStatusMap[input.status]
  }

  const sf = await prisma.studentFee.update({
    where: { id },
    data,
    include: studentFeeInclude,
  })

  return formatStudentFee(sf)
}

export async function waiveStudentFee(id: string) {
  const existing = await prisma.studentFee.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Student fee not found')

  if (existing.status === 'fps_paid') {
    throw AppError.badRequest('Cannot waive an already paid fee')
  }

  const sf = await prisma.studentFee.update({
    where: { id },
    data: { status: 'fps_waived' },
    include: studentFeeInclude,
  })

  return formatStudentFee(sf)
}

export async function deleteStudentFee(id: string) {
  const existing = await prisma.studentFee.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Student fee not found')

  if (Number(existing.paidAmount) > 0) {
    throw AppError.badRequest('Cannot delete a fee with payments. Use waive instead.')
  }

  await prisma.studentFee.delete({ where: { id } })
  return { success: true }
}

export async function bulkAssignFees(input: BulkAssignInput) {
  const fs = await prisma.feeStructure.findUnique({
    where: { id: input.feeStructureId },
    include: { feeType: true },
  })
  if (!fs) throw AppError.notFound('Fee structure not found')

  let studentIds: string[] = []

  if (input.studentIds && input.studentIds.length > 0) {
    studentIds = input.studentIds
  } else {
    const whereClause: any = { status: 'active' }
    if (input.className) {
      const cls = await prisma.class.findFirst({ where: { name: input.className } })
      if (!cls) throw AppError.badRequest(`Class '${input.className}' not found`)
      whereClause.classId = cls.id
    }
    if (input.sectionName && input.className) {
      const cls = await prisma.class.findFirst({ where: { name: input.className } })
      if (cls) {
        const section = await prisma.section.findFirst({
          where: { classId: cls.id, name: input.sectionName },
        })
        if (section) whereClause.sectionId = section.id
      }
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      select: { id: true },
    })
    studentIds = students.map((s) => s.id)
  }

  if (studentIds.length === 0) {
    return { created: 0, skipped: 0 }
  }

  // Compute due date
  const year = parseInt(fs.academicYear.split('-')[0], 10) || new Date().getFullYear()
  const day = Math.min(fs.dueDay, 28)
  const dueDate = new Date(year, 3, day) // April of academic year

  let created = 0
  let skipped = 0

  for (const studentId of studentIds) {
    const existing = await prisma.studentFee.findFirst({
      where: { studentId, feeStructureId: input.feeStructureId },
    })
    if (existing) {
      skipped++
      continue
    }

    await prisma.studentFee.create({
      data: {
        studentId,
        feeStructureId: input.feeStructureId,
        feeTypeId: fs.feeTypeId,
        academicYear: fs.academicYear,
        totalAmount: fs.amount,
        paidAmount: 0,
        discountAmount: 0,
        dueDate,
        status: 'fps_pending',
      },
    })
    created++
  }

  return { created, skipped }
}

// ==================== Payment Collection ====================

export async function collectPayment(input: CollectPaymentInput, collectedBy: string, collectedById: string) {
  // Verify student exists
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
    include: { class: true, section: true },
  })
  if (!student) throw AppError.notFound('Student not found')

  const paymentMode = paymentModeMap[input.paymentMode]
  if (!paymentMode) throw AppError.badRequest('Invalid payment mode')

  const receiptNumber = await generateReceiptNumber()

  const result = await prisma.$transaction(async (tx) => {
    const paymentRecords: any[] = []
    let totalPaid = 0

    for (const item of input.payments) {
      const sf = await tx.studentFee.findUnique({ where: { id: item.studentFeeId } })
      if (!sf) throw AppError.badRequest(`Student fee ${item.studentFeeId} not found`)
      if (sf.studentId !== input.studentId) {
        throw AppError.badRequest(`Student fee ${item.studentFeeId} does not belong to this student`)
      }

      const remaining = Number(sf.totalAmount) - Number(sf.discountAmount) - Number(sf.paidAmount)
      if (item.amount > remaining) {
        throw AppError.badRequest(
          `Payment amount ${item.amount} exceeds remaining balance ${remaining} for fee ${item.studentFeeId}`
        )
      }

      // Create payment
      const payment = await tx.payment.create({
        data: {
          receiptNumber,
          studentId: input.studentId,
          studentFeeId: item.studentFeeId,
          amount: item.amount,
          paymentMode: paymentMode as any,
          transactionRef: input.transactionRef || null,
          remarks: input.remarks || null,
          collectedBy,
          collectedById,
          collectedAt: new Date(),
        },
      })

      // Update student fee
      const newPaid = Number(sf.paidAmount) + item.amount
      const totalDue = Number(sf.totalAmount) - Number(sf.discountAmount)
      const newStatus = newPaid >= totalDue ? 'fps_paid' : 'fps_partial'

      await tx.studentFee.update({
        where: { id: item.studentFeeId },
        data: {
          paidAmount: newPaid,
          status: newStatus as any,
        },
      })

      paymentRecords.push(payment)
      totalPaid += item.amount
    }

    // Create single ledger credit entry
    await createLedgerEntry({
      type: 'credit',
      category: 'fee_collection',
      referenceId: paymentRecords[0]?.id,
      referenceNumber: receiptNumber,
      description: `Fee collection from ${student.firstName} ${student.lastName} (${student.admissionNumber})`,
      amount: totalPaid,
    }, tx)

    return { payments: paymentRecords, receiptNumber, totalPaid }
  })

  return {
    receiptNumber: result.receiptNumber,
    studentId: input.studentId,
    studentName: `${student.firstName} ${student.lastName}`,
    class: student.class?.name,
    section: student.section?.name,
    totalPaid: result.totalPaid,
    paymentMode: input.paymentMode,
    transactionRef: input.transactionRef,
    payments: result.payments.map(formatPayment),
    collectedBy,
    collectedAt: new Date(),
  }
}

// ==================== Payment Queries ====================

export async function listPayments(query: {
  page?: number
  limit?: number
  studentId?: string
  paymentMode?: string
  startDate?: string
  endDate?: string
}) {
  const page = query.page || 1
  const limit = query.limit || 20
  const where: any = {}

  if (query.studentId) where.studentId = query.studentId
  if (query.paymentMode && paymentModeMap[query.paymentMode]) {
    where.paymentMode = paymentModeMap[query.paymentMode]
  }
  if (query.startDate || query.endDate) {
    where.collectedAt = {}
    if (query.startDate) where.collectedAt.gte = new Date(query.startDate)
    if (query.endDate) where.collectedAt.lte = new Date(query.endDate + 'T23:59:59.999Z')
  }

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: {
        student: { include: { class: true, section: true } },
      },
      orderBy: { collectedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: payments.map(formatPayment),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getPaymentById(id: string) {
  const p = await prisma.payment.findUnique({
    where: { id },
    include: {
      student: { include: { class: true, section: true } },
    },
  })
  if (!p) throw AppError.notFound('Payment not found')
  return formatPayment(p)
}

export async function getReceiptByNumber(receiptNumber: string) {
  const payments = await prisma.payment.findMany({
    where: { receiptNumber },
    include: {
      student: { include: { class: true, section: true } },
      studentFee: {
        include: {
          feeStructure: { include: { feeType: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  if (payments.length === 0) throw AppError.notFound('Receipt not found')

  const first = payments[0]
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  return {
    receiptNumber,
    studentId: first.studentId,
    studentName: first.student ? `${first.student.firstName} ${first.student.lastName}` : '',
    class: first.student?.class?.name,
    section: first.student?.section?.name,
    admissionNumber: first.student?.admissionNumber,
    totalAmount,
    paymentMode: paymentModeReverse[first.paymentMode] || first.paymentMode,
    transactionRef: first.transactionRef,
    collectedBy: first.collectedBy,
    collectedAt: first.collectedAt,
    items: payments.map((p) => ({
      feeType: p.studentFee?.feeStructure?.feeType?.name || 'Unknown',
      feeCategory: p.studentFee?.feeStructure?.feeType
        ? feeCategoryReverse[p.studentFee.feeStructure.feeType.category] || p.studentFee.feeStructure.feeType.category
        : 'unknown',
      amount: Number(p.amount),
    })),
  }
}

export async function getStudentPayments(studentId: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) throw AppError.notFound('Student not found')

  const payments = await prisma.payment.findMany({
    where: { studentId },
    include: {
      student: { include: { class: true, section: true } },
    },
    orderBy: { collectedAt: 'desc' },
  })

  return { data: payments.map(formatPayment) }
}

export async function getStudentReceipts(studentId: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) throw AppError.notFound('Student not found')

  const payments = await prisma.payment.findMany({
    where: { studentId },
    include: {
      student: { include: { class: true, section: true } },
      studentFee: {
        include: {
          feeStructure: { include: { feeType: true } },
        },
      },
    },
    orderBy: { collectedAt: 'desc' },
  })

  // Group by receipt number
  const receiptMap = new Map<string, any[]>()
  for (const p of payments) {
    const existing = receiptMap.get(p.receiptNumber) || []
    existing.push(p)
    receiptMap.set(p.receiptNumber, existing)
  }

  const receipts = Array.from(receiptMap.entries()).map(([receiptNum, items]) => {
    const first = items[0]
    return {
      receiptNumber: receiptNum,
      totalAmount: items.reduce((sum, p) => sum + Number(p.amount), 0),
      paymentMode: paymentModeReverse[first.paymentMode] || first.paymentMode,
      collectedBy: first.collectedBy,
      collectedAt: first.collectedAt,
      itemCount: items.length,
    }
  })

  return { data: receipts }
}

export async function cancelPayment(id: string, cancelledBy: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { student: true },
  })
  if (!payment) throw AppError.notFound('Payment not found')

  await prisma.$transaction(async (tx) => {
    // Reverse student fee paidAmount
    const sf = await tx.studentFee.findUnique({ where: { id: payment.studentFeeId } })
    if (sf) {
      const newPaid = Math.max(0, Number(sf.paidAmount) - Number(payment.amount))
      const totalDue = Number(sf.totalAmount) - Number(sf.discountAmount)
      const newStatus = newPaid <= 0 ? 'fps_pending' : (newPaid < totalDue ? 'fps_partial' : 'fps_paid')

      await tx.studentFee.update({
        where: { id: sf.id },
        data: { paidAmount: newPaid, status: newStatus as any },
      })
    }

    // Delete the payment
    await tx.payment.delete({ where: { id } })

    // Create debit ledger entry
    await createLedgerEntry({
      type: 'debit',
      category: 'fee_refund',
      referenceId: id,
      referenceNumber: payment.receiptNumber,
      description: `Payment cancelled/reversed for ${payment.student?.firstName} ${payment.student?.lastName} by ${cancelledBy}`,
      amount: Number(payment.amount),
    }, tx)
  })

  return { success: true, refundedAmount: Number(payment.amount) }
}

// ==================== Outstanding Dues ====================

export async function getOutstandingDues(query: {
  page?: number
  limit?: number
  className?: string
  academicYear?: string
}) {
  const page = query.page || 1
  const limit = query.limit || 20

  const where: any = {
    status: { in: ['fps_pending', 'fps_partial', 'fps_overdue'] },
  }
  if (query.academicYear) where.academicYear = query.academicYear
  if (query.className) {
    const cls = await prisma.class.findFirst({ where: { name: query.className } })
    if (cls) where.student = { classId: cls.id }
  }

  const fees = await prisma.studentFee.findMany({
    where,
    include: {
      student: { include: { class: true, section: true, parent: true } },
      feeStructure: { include: { feeType: true } },
    },
    orderBy: { dueDate: 'asc' },
  })

  // Group by student
  const studentMap = new Map<string, any>()
  for (const fee of fees) {
    const sid = fee.studentId
    if (!studentMap.has(sid)) {
      studentMap.set(sid, {
        studentId: sid,
        studentName: fee.student ? `${fee.student.firstName} ${fee.student.lastName}` : '',
        admissionNumber: fee.student?.admissionNumber,
        class: fee.student?.class?.name,
        section: fee.student?.section?.name,
        parentPhone: fee.student?.parent?.guardianPhone,
        parentEmail: fee.student?.parent?.guardianEmail,
        totalDue: 0,
        totalPaid: 0,
        outstandingAmount: 0,
        fees: [],
        oldestDueDate: null as Date | null,
      })
    }

    const entry = studentMap.get(sid)
    const due = Number(fee.totalAmount) - Number(fee.discountAmount)
    const outstanding = due - Number(fee.paidAmount)

    entry.totalDue += due
    entry.totalPaid += Number(fee.paidAmount)
    entry.outstandingAmount += outstanding
    entry.fees.push({
      id: fee.id,
      feeType: fee.feeStructure?.feeType?.name || 'Unknown',
      totalAmount: Number(fee.totalAmount),
      paidAmount: Number(fee.paidAmount),
      discountAmount: Number(fee.discountAmount),
      outstanding,
      dueDate: fee.dueDate,
      status: paymentStatusReverse[fee.status] || fee.status,
    })

    if (!entry.oldestDueDate || fee.dueDate < entry.oldestDueDate) {
      entry.oldestDueDate = fee.dueDate
    }
  }

  const allStudents = Array.from(studentMap.values()).map((s) => ({
    ...s,
    daysOverdue: s.oldestDueDate
      ? Math.max(0, Math.floor((Date.now() - new Date(s.oldestDueDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 0,
  }))

  // Sort by outstanding amount desc
  allStudents.sort((a, b) => b.outstandingAmount - a.outstandingAmount)

  const total = allStudents.length
  const paginated = allStudents.slice((page - 1) * limit, page * limit)

  return {
    data: paginated,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getStudentOutstandingDues(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true, section: true },
  })
  if (!student) throw AppError.notFound('Student not found')

  const fees = await prisma.studentFee.findMany({
    where: {
      studentId,
      status: { in: ['fps_pending', 'fps_partial', 'fps_overdue'] },
    },
    include: {
      feeStructure: { include: { feeType: true } },
    },
    orderBy: { dueDate: 'asc' },
  })

  let totalDue = 0
  let totalPaid = 0

  const feeItems = fees.map((fee) => {
    const due = Number(fee.totalAmount) - Number(fee.discountAmount)
    const outstanding = due - Number(fee.paidAmount)
    totalDue += due
    totalPaid += Number(fee.paidAmount)

    return {
      id: fee.id,
      feeType: fee.feeStructure?.feeType?.name || 'Unknown',
      category: fee.feeStructure?.feeType
        ? feeCategoryReverse[fee.feeStructure.feeType.category] || fee.feeStructure.feeType.category
        : 'unknown',
      totalAmount: Number(fee.totalAmount),
      paidAmount: Number(fee.paidAmount),
      discountAmount: Number(fee.discountAmount),
      outstanding,
      dueDate: fee.dueDate,
      status: paymentStatusReverse[fee.status] || fee.status,
    }
  })

  return {
    studentId,
    studentName: `${student.firstName} ${student.lastName}`,
    class: student.class?.name,
    section: student.section?.name,
    totalDue,
    totalPaid,
    outstandingAmount: totalDue - totalPaid,
    fees: feeItems,
  }
}

export async function sendReminders() {
  // Stub — in future this would send email/SMS reminders
  const overdue = await prisma.studentFee.count({
    where: { status: { in: ['fps_pending', 'fps_overdue'] } },
  })
  return { message: 'Reminders queued', overdueCount: overdue }
}

export { paymentStatusMap, paymentStatusReverse, paymentModeMap, paymentModeReverse }
