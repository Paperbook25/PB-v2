import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import type { PlanTier, BillingCycle, SubscriptionStatus } from '@prisma/client'

// ==================== List Subscriptions ====================

export async function listSubscriptions(query: {
  page?: number; limit?: number; status?: string; planTier?: string; search?: string
}) {
  const page = query.page || 1
  const limit = query.limit || 20
  const where: any = {}

  if (query.status) where.status = query.status
  if (query.planTier) where.planTier = query.planTier
  if (query.search) {
    where.school = { name: { contains: query.search, mode: 'insensitive' } }
  }

  const [total, subscriptions] = await Promise.all([
    prisma.platformSubscription.count({ where }),
    prisma.platformSubscription.findMany({
      where,
      include: { school: { select: { id: true, name: true, email: true, status: true, city: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: subscriptions.map((s) => ({
      id: s.id,
      schoolId: s.schoolId,
      schoolName: s.school.name,
      schoolEmail: s.school.email,
      schoolCity: s.school.city,
      planTier: s.planTier,
      status: s.status,
      billingCycle: s.billingCycle,
      amount: Number(s.amount),
      currency: s.currency,
      trialEndsAt: s.trialEndsAt?.toISOString() || null,
      currentPeriodEnd: s.currentPeriodEnd?.toISOString() || null,
      nextBillingDate: s.nextBillingDate?.toISOString() || null,
      createdAt: s.createdAt.toISOString(),
    })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Get Subscription ====================

export async function getSubscription(id: string) {
  const sub = await prisma.platformSubscription.findUnique({
    where: { id },
    include: {
      school: { select: { id: true, name: true, email: true, status: true, city: true, phone: true } },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { payments: true },
      },
    },
  })
  if (!sub) throw AppError.notFound('Subscription not found')

  return {
    ...formatSubscription(sub),
    school: sub.school,
    invoices: sub.invoices.map(formatInvoice),
    trialStartedAt: sub.trialStartedAt?.toISOString() || null,
    cancelledAt: sub.cancelledAt?.toISOString() || null,
    cancelReason: sub.cancelReason,
    notes: sub.notes,
  }
}

// ==================== Create Subscription ====================

export async function createSubscription(input: {
  schoolId: string
  planTier: string
  billingCycle?: string
  amount: number
  isTrial?: boolean
  trialDays?: number
  notes?: string
}) {
  // Check school exists
  const school = await prisma.schoolProfile.findUnique({ where: { id: input.schoolId } })
  if (!school) throw AppError.notFound('School not found')

  // Check for existing active subscription
  const existing = await prisma.platformSubscription.findFirst({
    where: { schoolId: input.schoolId, status: { in: ['sub_active', 'sub_trial'] } },
  })
  if (existing) throw AppError.conflict('School already has an active subscription')

  const now = new Date()
  const isTrial = input.isTrial ?? false
  const trialDays = input.trialDays || 14

  const trialEndsAt = isTrial ? new Date(now.getTime() + trialDays * 86400000) : null
  const periodEnd = calculatePeriodEnd(now, (input.billingCycle || 'monthly') as BillingCycle)

  const sub = await prisma.platformSubscription.create({
    data: {
      schoolId: input.schoolId,
      planTier: input.planTier as PlanTier,
      status: isTrial ? 'sub_trial' : 'sub_active',
      billingCycle: (input.billingCycle || 'monthly') as BillingCycle,
      amount: input.amount,
      trialStartedAt: isTrial ? now : null,
      trialEndsAt,
      currentPeriodStart: now,
      currentPeriodEnd: isTrial ? trialEndsAt : periodEnd,
      nextBillingDate: isTrial ? trialEndsAt : periodEnd,
      notes: input.notes,
    },
  })

  // Sync school plan tier
  await prisma.schoolProfile.update({
    where: { id: input.schoolId },
    data: {
      planTier: input.planTier as PlanTier,
      status: isTrial ? 'trial' : 'active',
      trialEndsAt,
    },
  })

  return sub
}

// ==================== Update Subscription ====================

export async function updateSubscription(id: string, input: {
  planTier?: string
  billingCycle?: string
  amount?: number
  notes?: string
}) {
  const sub = await prisma.platformSubscription.findUnique({ where: { id } })
  if (!sub) throw AppError.notFound('Subscription not found')

  const data: any = {}
  if (input.planTier) data.planTier = input.planTier as PlanTier
  if (input.billingCycle) data.billingCycle = input.billingCycle as BillingCycle
  if (input.amount !== undefined) data.amount = input.amount
  if (input.notes !== undefined) data.notes = input.notes

  const updated = await prisma.platformSubscription.update({ where: { id }, data })

  // Sync school plan tier
  if (input.planTier) {
    await prisma.schoolProfile.update({
      where: { id: sub.schoolId },
      data: { planTier: input.planTier as PlanTier },
    })
  }

  return updated
}

// ==================== Cancel Subscription ====================

export async function cancelSubscription(id: string, reason?: string) {
  const sub = await prisma.platformSubscription.findUnique({ where: { id } })
  if (!sub) throw AppError.notFound('Subscription not found')

  await prisma.platformSubscription.update({
    where: { id },
    data: { status: 'sub_cancelled', cancelledAt: new Date(), cancelReason: reason || null },
  })

  return { success: true }
}

// ==================== Expiring Trials ====================

export async function getExpiringTrials(daysAhead: number = 14) {
  const now = new Date()
  const cutoff = new Date(now.getTime() + daysAhead * 86400000)

  const trials = await prisma.platformSubscription.findMany({
    where: {
      status: 'sub_trial',
      trialEndsAt: { lte: cutoff },
    },
    include: { school: { select: { id: true, name: true, email: true, city: true } } },
    orderBy: { trialEndsAt: 'asc' },
  })

  return trials.map((t) => ({
    id: t.id,
    schoolId: t.schoolId,
    schoolName: t.school.name,
    schoolEmail: t.school.email,
    planTier: t.planTier,
    trialEndsAt: t.trialEndsAt?.toISOString() || null,
    daysRemaining: t.trialEndsAt ? Math.max(0, Math.ceil((t.trialEndsAt.getTime() - now.getTime()) / 86400000)) : 0,
  }))
}

// ==================== Analytics ====================

export async function getSubscriptionAnalytics() {
  const allSubs = await prisma.platformSubscription.findMany({
    select: { status: true, planTier: true, amount: true, billingCycle: true, createdAt: true, cancelledAt: true },
  })

  const activeSubs = allSubs.filter((s) => s.status === 'sub_active')
  const trialSubs = allSubs.filter((s) => s.status === 'sub_trial')
  const cancelledSubs = allSubs.filter((s) => s.status === 'sub_cancelled')

  // MRR: normalize all active subscriptions to monthly
  const mrr = activeSubs.reduce((sum, s) => {
    const monthly = normalizeToMonthly(Number(s.amount), s.billingCycle)
    return sum + monthly
  }, 0)

  // Churn rate (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  const recentCancellations = cancelledSubs.filter(
    (s) => s.cancelledAt && s.cancelledAt >= thirtyDaysAgo
  ).length
  const activeAtStart = activeSubs.length + recentCancellations
  const churnRate = activeAtStart > 0 ? (recentCancellations / activeAtStart) * 100 : 0

  // Plan distribution
  const planCounts: Record<string, number> = {}
  const totalActive = activeSubs.length + trialSubs.length
  for (const s of [...activeSubs, ...trialSubs]) {
    planCounts[s.planTier] = (planCounts[s.planTier] || 0) + 1
  }
  const planDistribution = Object.entries(planCounts).map(([plan, count]) => ({
    plan,
    count,
    percentage: totalActive > 0 ? Math.round((count / totalActive) * 100) : 0,
  }))

  // Trial conversion (all time)
  const totalTrialsExpired = allSubs.filter(
    (s) => s.status !== 'sub_trial' // was a trial that moved to another state
  ).length
  const convertedTrials = allSubs.filter(
    (s) => s.status === 'sub_active' // currently active (may have been trial before)
  ).length
  const trialConversionRate = totalTrialsExpired > 0
    ? Math.round((convertedTrials / Math.max(totalTrialsExpired, convertedTrials)) * 100)
    : 0

  // ARPU
  const arpu = activeSubs.length > 0 ? mrr / activeSubs.length : 0

  // MRR trend (last 6 months, simplified)
  const mrrTrend = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthName = date.toLocaleString('default', { month: 'short' })
    // Simplified: use current MRR scaled by subscription age
    const subsAtMonth = allSubs.filter((s) => s.createdAt <= date && s.status !== 'sub_cancelled').length
    mrrTrend.push({ month: monthName, mrr: Math.round(mrr * (subsAtMonth / Math.max(activeSubs.length, 1))) })
  }

  return {
    mrr: Math.round(mrr),
    arr: Math.round(mrr * 12),
    activeCount: activeSubs.length,
    trialCount: trialSubs.length,
    churnRate: Math.round(churnRate * 10) / 10,
    trialConversionRate,
    arpu: Math.round(arpu),
    planDistribution,
    mrrTrend,
  }
}

// ==================== Helpers ====================

function normalizeToMonthly(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly': return amount
    case 'quarterly': return amount / 3
    case 'semi_annual': return amount / 6
    case 'annual': return amount / 12
    default: return amount
  }
}

function calculatePeriodEnd(start: Date, cycle: BillingCycle): Date {
  const end = new Date(start)
  switch (cycle) {
    case 'monthly': end.setMonth(end.getMonth() + 1); break
    case 'quarterly': end.setMonth(end.getMonth() + 3); break
    case 'semi_annual': end.setMonth(end.getMonth() + 6); break
    case 'annual': end.setFullYear(end.getFullYear() + 1); break
  }
  return end
}

function formatSubscription(s: any) {
  return {
    id: s.id,
    schoolId: s.schoolId,
    planTier: s.planTier,
    status: s.status,
    billingCycle: s.billingCycle,
    amount: Number(s.amount),
    currency: s.currency,
    trialEndsAt: s.trialEndsAt?.toISOString() || null,
    currentPeriodStart: s.currentPeriodStart?.toISOString() || null,
    currentPeriodEnd: s.currentPeriodEnd?.toISOString() || null,
    nextBillingDate: s.nextBillingDate?.toISOString() || null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }
}

function formatInvoice(inv: any) {
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    status: inv.status,
    totalAmount: Number(inv.totalAmount),
    dueDate: inv.dueDate.toISOString(),
    paidAt: inv.paidAt?.toISOString() || null,
    createdAt: inv.createdAt.toISOString(),
    paymentCount: inv.payments?.length || 0,
  }
}
