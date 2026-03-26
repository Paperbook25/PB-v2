import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import type { InvoiceStatus, PlatformPaymentMethod } from '@prisma/client'

// ==================== List Invoices ====================

export async function listInvoices(query: {
  page?: number; limit?: number; status?: string; schoolId?: string; search?: string
  from?: string; to?: string
}) {
  const page = query.page || 1
  const limit = query.limit || 20
  const where: any = {}

  if (query.status) where.status = query.status
  if (query.schoolId) where.schoolId = query.schoolId
  if (query.search) {
    where.OR = [
      { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
      { school: { name: { contains: query.search, mode: 'insensitive' } } },
    ]
  }
  if (query.from || query.to) {
    where.createdAt = {}
    if (query.from) where.createdAt.gte = new Date(query.from)
    if (query.to) where.createdAt.lte = new Date(query.to)
  }

  const [total, invoices] = await Promise.all([
    prisma.platformInvoice.count({ where }),
    prisma.platformInvoice.findMany({
      where,
      include: {
        school: { select: { id: true, name: true, email: true } },
        payments: { select: { id: true, amount: true, paidAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: invoices.map(formatInvoice),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Get Invoice ====================

export async function getInvoice(id: string) {
  const inv = await prisma.platformInvoice.findUnique({
    where: { id },
    include: {
      school: { select: { id: true, name: true, email: true, phone: true, address: true, city: true, state: true } },
      subscription: { select: { id: true, planTier: true, billingCycle: true, status: true } },
      payments: { orderBy: { paidAt: 'desc' } },
    },
  })
  if (!inv) throw AppError.notFound('Invoice not found')

  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    subscriptionId: inv.subscriptionId,
    schoolId: inv.schoolId,
    status: inv.status,
    subtotal: Number(inv.subtotal),
    taxAmount: Number(inv.taxAmount),
    taxRate: Number(inv.taxRate),
    discount: Number(inv.discount),
    totalAmount: Number(inv.totalAmount),
    currency: inv.currency,
    dueDate: inv.dueDate.toISOString(),
    paidAt: inv.paidAt?.toISOString() || null,
    notes: inv.notes,
    lineItems: inv.lineItems || [],
    billingPeriodStart: inv.billingPeriodStart?.toISOString() || null,
    billingPeriodEnd: inv.billingPeriodEnd?.toISOString() || null,
    createdAt: inv.createdAt.toISOString(),
    school: inv.school,
    subscription: inv.subscription,
    payments: inv.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod,
      transactionRef: p.transactionRef,
      paidAt: p.paidAt.toISOString(),
      notes: p.notes,
      recordedBy: p.recordedBy,
    })),
  }
}

// ==================== Create Invoice ====================

export async function createInvoice(input: {
  schoolId: string
  subscriptionId?: string
  lineItems: Array<{ description: string; quantity: number; unitPrice: number }>
  taxRate?: number
  discount?: number
  dueDate: string
  notes?: string
  billingPeriodStart?: string
  billingPeriodEnd?: string
}) {
  const school = await prisma.schoolProfile.findUnique({ where: { id: input.schoolId } })
  if (!school) throw AppError.notFound('School not found')

  if (!input.lineItems || input.lineItems.length === 0) {
    throw AppError.badRequest('At least one line item is required')
  }

  // Calculate totals
  const lineItems = input.lineItems.map((item) => ({
    ...item,
    amount: item.quantity * item.unitPrice,
  }))
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxRate = input.taxRate || 0
  const taxAmount = subtotal * (taxRate / 100)
  const discount = input.discount || 0
  const totalAmount = subtotal + taxAmount - discount

  // Generate invoice number: INV-YYYYMM-NNNN
  const now = new Date()
  const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastInvoice = await prisma.platformInvoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: 'desc' },
    select: { invoiceNumber: true },
  })
  const seq = lastInvoice
    ? parseInt(lastInvoice.invoiceNumber.split('-')[2] || '0') + 1
    : 1
  const invoiceNumber = `${prefix}-${String(seq).padStart(4, '0')}`

  const invoice = await prisma.platformInvoice.create({
    data: {
      invoiceNumber,
      schoolId: input.schoolId,
      subscriptionId: input.subscriptionId || null,
      status: 'inv_draft',
      subtotal,
      taxAmount,
      taxRate,
      discount,
      totalAmount,
      dueDate: new Date(input.dueDate),
      notes: input.notes || null,
      lineItems,
      billingPeriodStart: input.billingPeriodStart ? new Date(input.billingPeriodStart) : null,
      billingPeriodEnd: input.billingPeriodEnd ? new Date(input.billingPeriodEnd) : null,
    },
  })

  return invoice
}

// ==================== Update Invoice (draft only) ====================

export async function updateInvoice(id: string, input: {
  lineItems?: Array<{ description: string; quantity: number; unitPrice: number }>
  taxRate?: number
  discount?: number
  dueDate?: string
  notes?: string
}) {
  const inv = await prisma.platformInvoice.findUnique({ where: { id } })
  if (!inv) throw AppError.notFound('Invoice not found')
  if (inv.status !== 'inv_draft') throw AppError.badRequest('Only draft invoices can be edited')

  const data: any = {}
  if (input.notes !== undefined) data.notes = input.notes
  if (input.dueDate) data.dueDate = new Date(input.dueDate)

  if (input.lineItems) {
    const lineItems = input.lineItems.map((item) => ({ ...item, amount: item.quantity * item.unitPrice }))
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
    const taxRate = input.taxRate ?? Number(inv.taxRate)
    const taxAmount = subtotal * (taxRate / 100)
    const discount = input.discount ?? Number(inv.discount)
    data.lineItems = lineItems
    data.subtotal = subtotal
    data.taxRate = taxRate
    data.taxAmount = taxAmount
    data.discount = discount
    data.totalAmount = subtotal + taxAmount - discount
  }

  return prisma.platformInvoice.update({ where: { id }, data })
}

// ==================== Send Invoice ====================

export async function sendInvoice(id: string) {
  const inv = await prisma.platformInvoice.findUnique({ where: { id } })
  if (!inv) throw AppError.notFound('Invoice not found')
  if (inv.status !== 'inv_draft') throw AppError.badRequest('Only draft invoices can be sent')

  await prisma.platformInvoice.update({
    where: { id },
    data: { status: 'inv_sent' },
  })

  return { success: true }
}

// ==================== Cancel Invoice ====================

export async function cancelInvoice(id: string) {
  const inv = await prisma.platformInvoice.findUnique({ where: { id } })
  if (!inv) throw AppError.notFound('Invoice not found')
  if (inv.status === 'inv_paid') throw AppError.badRequest('Paid invoices cannot be cancelled')

  await prisma.platformInvoice.update({
    where: { id },
    data: { status: 'inv_cancelled' },
  })

  return { success: true }
}

// ==================== Record Payment ====================

export async function recordPayment(invoiceId: string, input: {
  amount: number
  paymentMethod: string
  transactionRef?: string
  paidAt?: string
  notes?: string
  recordedBy?: string
}) {
  const inv = await prisma.platformInvoice.findUnique({
    where: { id: invoiceId },
    include: { payments: { select: { amount: true } } },
  })
  if (!inv) throw AppError.notFound('Invoice not found')
  if (inv.status === 'inv_cancelled') throw AppError.badRequest('Cannot pay cancelled invoice')

  const payment = await prisma.platformPayment.create({
    data: {
      invoiceId,
      amount: input.amount,
      paymentMethod: input.paymentMethod as PlatformPaymentMethod,
      transactionRef: input.transactionRef || null,
      paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
      notes: input.notes || null,
      recordedBy: input.recordedBy || null,
    },
  })

  // Check if fully paid
  const totalPaid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0) + input.amount
  if (totalPaid >= Number(inv.totalAmount)) {
    await prisma.platformInvoice.update({
      where: { id: invoiceId },
      data: { status: 'inv_paid', paidAt: new Date() },
    })
  } else if (inv.status === 'inv_draft') {
    await prisma.platformInvoice.update({
      where: { id: invoiceId },
      data: { status: 'inv_sent' },
    })
  }

  return payment
}

// ==================== Revenue Summary ====================

export async function getRevenueSummary() {
  const allInvoices = await prisma.platformInvoice.findMany({
    where: { status: { not: 'inv_cancelled' } },
    select: { status: true, totalAmount: true, paidAt: true, createdAt: true },
  })
  const allPayments = await prisma.platformPayment.findMany({
    select: { amount: true, paidAt: true },
  })

  const totalRevenue = allPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const outstandingAmount = allInvoices
    .filter((i) => i.status !== 'inv_paid' && i.status !== 'inv_cancelled')
    .reduce((sum, i) => sum + Number(i.totalAmount), 0)

  const totalInvoiced = allInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0)
  const collectionRate = totalInvoiced > 0 ? Math.round((totalRevenue / totalInvoiced) * 100) : 0

  // This month's revenue
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const revenueThisMonth = allPayments
    .filter((p) => p.paidAt >= startOfMonth)
    .reduce((sum, p) => sum + Number(p.amount), 0)

  // Monthly breakdown (last 12 months)
  const monthlyRevenue = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' })

    const invoiced = allInvoices
      .filter((inv) => inv.createdAt >= date && inv.createdAt < nextMonth)
      .reduce((sum, inv) => sum + Number(inv.totalAmount), 0)
    const collected = allPayments
      .filter((p) => p.paidAt >= date && p.paidAt < nextMonth)
      .reduce((sum, p) => sum + Number(p.amount), 0)

    monthlyRevenue.push({ month: monthName, invoiced: Math.round(invoiced), collected: Math.round(collected) })
  }

  return {
    totalRevenue: Math.round(totalRevenue),
    revenueThisMonth: Math.round(revenueThisMonth),
    outstandingAmount: Math.round(outstandingAmount),
    collectionRate,
    monthlyRevenue,
  }
}

// ==================== List Payments ====================

export async function listPayments(query: { page?: number; limit?: number; search?: string }) {
  const page = query.page || 1
  const limit = query.limit || 20
  const where: any = {}

  if (query.search) {
    where.invoice = {
      OR: [
        { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
        { school: { name: { contains: query.search, mode: 'insensitive' } } },
      ],
    }
  }

  const [total, payments] = await Promise.all([
    prisma.platformPayment.count({ where }),
    prisma.platformPayment.findMany({
      where,
      include: {
        invoice: {
          select: { invoiceNumber: true, school: { select: { name: true } } },
        },
      },
      orderBy: { paidAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: payments.map((p) => ({
      id: p.id,
      invoiceId: p.invoiceId,
      invoiceNumber: p.invoice.invoiceNumber,
      schoolName: p.invoice.school.name,
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod,
      transactionRef: p.transactionRef,
      paidAt: p.paidAt.toISOString(),
      notes: p.notes,
    })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Helpers ====================

function formatInvoice(inv: any) {
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    schoolId: inv.schoolId,
    schoolName: inv.school?.name || '',
    schoolEmail: inv.school?.email || '',
    status: inv.status,
    subtotal: Number(inv.subtotal),
    totalAmount: Number(inv.totalAmount),
    currency: inv.currency,
    dueDate: inv.dueDate.toISOString(),
    paidAt: inv.paidAt?.toISOString() || null,
    createdAt: inv.createdAt.toISOString(),
    paidAmount: inv.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0,
  }
}
