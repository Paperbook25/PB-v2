import { prisma } from '../config/db.js'

// ==================== Types ====================

export interface TrackEventInput {
  formType: string
  sessionId: string
  fieldName: string
  action: 'started' | 'completed' | 'abandoned'
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface DateRange {
  startDate?: string
  endDate?: string
}

// ==================== Track Events (bulk insert) ====================

export async function trackEvents(schoolId: string, events: TrackEventInput[]) {
  if (events.length === 0) return { inserted: 0 }

  // Cap batch size to prevent abuse
  const capped = events.slice(0, 100)

  const data = capped.map((evt) => ({
    organizationId: schoolId,
    formType: sanitizeString(evt.formType, 50),
    sessionId: sanitizeString(evt.sessionId, 64),
    fieldName: sanitizeString(evt.fieldName, 100),
    action: sanitizeAction(evt.action),
    timestamp: new Date(evt.timestamp || Date.now()),
    metadata: (evt.metadata ?? null) as any,
  }))

  await prisma.formAnalytics.createMany({ data })

  return { inserted: data.length }
}

// ==================== Form Stats ====================

export async function getFormStats(schoolId: string, formType: string, dateRange: DateRange) {
  const where = buildWhere(schoolId, formType, dateRange)

  // Get all events for this form type in the date range
  const events = await prisma.formAnalytics.findMany({
    where,
    select: {
      sessionId: true,
      fieldName: true,
      action: true,
    },
  })

  // Group by session
  const sessions = new Map<string, Set<string>>()
  for (const evt of events) {
    if (!sessions.has(evt.sessionId)) {
      sessions.set(evt.sessionId, new Set())
    }
    sessions.get(evt.sessionId)!.add(evt.action)
  }

  let totalStarts = 0
  let totalCompletes = 0
  let totalAbandoned = 0

  for (const actions of sessions.values()) {
    if (actions.has('started')) totalStarts++
    if (actions.has('completed') && actions.has('started')) totalCompletes++
    if (actions.has('abandoned') && !actions.has('completed')) totalAbandoned++
  }

  // Filter for completed forms — look for _form completed events
  const formCompleted = events.filter(e => e.fieldName === '_form' && e.action === 'completed')
  const uniqueCompleteSessions = new Set(formCompleted.map(e => e.sessionId))

  const completionRate = totalStarts > 0
    ? Math.round((uniqueCompleteSessions.size / totalStarts) * 100)
    : 0

  // Find most abandoned field
  const fieldAbandons = new Map<string, number>()
  for (const evt of events) {
    if (evt.action === 'started' && evt.fieldName !== '_form') {
      fieldAbandons.set(evt.fieldName, (fieldAbandons.get(evt.fieldName) || 0) + 1)
    }
  }
  const fieldCompletes = new Map<string, number>()
  for (const evt of events) {
    if (evt.action === 'completed' && evt.fieldName !== '_form') {
      fieldCompletes.set(evt.fieldName, (fieldCompletes.get(evt.fieldName) || 0) + 1)
    }
  }

  let mostAbandonedField: string | null = null
  let worstDropRate = 0
  for (const [fieldName, starts] of fieldAbandons) {
    const completes = fieldCompletes.get(fieldName) || 0
    const dropRate = starts > 0 ? ((starts - completes) / starts) * 100 : 0
    if (dropRate > worstDropRate) {
      worstDropRate = dropRate
      mostAbandonedField = fieldName
    }
  }

  return {
    totalStarts,
    totalCompletes: uniqueCompleteSessions.size,
    totalAbandoned,
    completionRate,
    mostAbandonedField,
    uniqueSessions: sessions.size,
  }
}

// ==================== Field Drop-offs ====================

export async function getFieldDropoffs(schoolId: string, formType: string, dateRange: DateRange) {
  const where = buildWhere(schoolId, formType, dateRange)

  const events = await prisma.formAnalytics.findMany({
    where: {
      ...where,
      fieldName: { not: '_form' },
    },
    select: {
      fieldName: true,
      action: true,
      sessionId: true,
    },
  })

  // Count unique sessions per field per action
  const fieldStarts = new Map<string, Set<string>>()
  const fieldCompletes = new Map<string, Set<string>>()

  for (const evt of events) {
    if (evt.action === 'started') {
      if (!fieldStarts.has(evt.fieldName)) fieldStarts.set(evt.fieldName, new Set())
      fieldStarts.get(evt.fieldName)!.add(evt.sessionId)
    }
    if (evt.action === 'completed') {
      if (!fieldCompletes.has(evt.fieldName)) fieldCompletes.set(evt.fieldName, new Set())
      fieldCompletes.get(evt.fieldName)!.add(evt.sessionId)
    }
  }

  const fields: Array<{
    fieldName: string
    starts: number
    completes: number
    completionRate: number
    dropoffRate: number
  }> = []

  for (const [fieldName, startSessions] of fieldStarts) {
    const starts = startSessions.size
    const completes = fieldCompletes.get(fieldName)?.size || 0
    const completionRate = starts > 0 ? Math.round((completes / starts) * 100) : 0
    fields.push({
      fieldName,
      starts,
      completes,
      completionRate,
      dropoffRate: 100 - completionRate,
    })
  }

  // Sort by worst completion rate first
  fields.sort((a, b) => a.completionRate - b.completionRate)

  return { fields }
}

// ==================== Conversion Funnel ====================

export async function getConversionFunnel(schoolId: string, dateRange: DateRange) {
  const dateFilter = buildDateFilter(dateRange)

  // Step 1: Page views from WebsiteAnalytics
  const pageViewsAgg = await prisma.websiteAnalytics.aggregate({
    where: {
      organizationId: schoolId,
      ...(dateFilter.timestamp ? { date: dateFilter.timestamp } : {}),
    },
    _sum: { views: true },
  })
  const pageViews = pageViewsAgg._sum.views || 0

  // Step 2: Form starts (unique sessions with 'started' action)
  const formStartEvents = await prisma.formAnalytics.findMany({
    where: {
      organizationId: schoolId,
      action: 'started',
      ...dateFilter,
    },
    select: { sessionId: true },
    distinct: ['sessionId'],
  })
  const formStarts = formStartEvents.length

  // Step 3: Form completes (unique sessions with _form completed)
  const formCompleteEvents = await prisma.formAnalytics.findMany({
    where: {
      organizationId: schoolId,
      fieldName: '_form',
      action: 'completed',
      ...dateFilter,
    },
    select: { sessionId: true },
    distinct: ['sessionId'],
  })
  const formCompletes = formCompleteEvents.length

  // Step 4: Admission applications (from AdmissionApplication model)
  let admissionApplications = 0
  let enrolled = 0
  try {
    const admWhere: Record<string, unknown> = { organizationId: schoolId }
    if (dateFilter.timestamp) {
      admWhere.createdAt = dateFilter.timestamp
    }

    admissionApplications = await prisma.admissionApplication.count({
      where: admWhere,
    })

    enrolled = await prisma.admissionApplication.count({
      where: {
        ...admWhere,
        status: 'adm_enrolled',
      },
    })
  } catch {
    // AdmissionApplication model may not exist in all environments
  }

  const funnel = [
    { step: 'Page Views', count: pageViews, percentage: 100 },
    {
      step: 'Form Opens',
      count: formStarts,
      percentage: pageViews > 0 ? Math.round((formStarts / pageViews) * 100) : 0,
    },
    {
      step: 'Form Completes',
      count: formCompletes,
      percentage: formStarts > 0 ? Math.round((formCompletes / formStarts) * 100) : 0,
    },
    {
      step: 'Applications',
      count: admissionApplications,
      percentage: formCompletes > 0 ? Math.round((admissionApplications / formCompletes) * 100) : 0,
    },
    {
      step: 'Enrolled',
      count: enrolled,
      percentage: admissionApplications > 0 ? Math.round((enrolled / admissionApplications) * 100) : 0,
    },
  ]

  return { funnel }
}

// ==================== Form Trends ====================

export async function getFormTrends(schoolId: string, formType: string, dateRange: DateRange) {
  const where = buildWhere(schoolId, formType, dateRange)

  // Get completed form submissions
  const events = await prisma.formAnalytics.findMany({
    where: {
      ...where,
      fieldName: '_form',
      action: 'completed',
    },
    select: {
      timestamp: true,
    },
    orderBy: { timestamp: 'asc' },
  })

  // Group by day
  const dailyMap = new Map<string, number>()
  for (const evt of events) {
    const dateKey = evt.timestamp.toISOString().slice(0, 10)
    dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1)
  }

  // Fill in missing days for the last 30 days
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const trend: Array<{ date: string; submissions: number }> = []
  for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().slice(0, 10)
    trend.push({ date: dateKey, submissions: dailyMap.get(dateKey) || 0 })
  }

  return { trend }
}

// ==================== Helpers ====================

function sanitizeString(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return ''
  return val.slice(0, maxLen).replace(/[^\w\s._@-]/gi, '')
}

function sanitizeAction(val: unknown): string {
  const allowed = ['started', 'completed', 'abandoned']
  if (typeof val === 'string' && allowed.includes(val)) return val
  return 'started'
}

function buildDateFilter(dateRange: DateRange) {
  const filter: Record<string, unknown> = {}
  if (dateRange.startDate || dateRange.endDate) {
    const dateFilter: Record<string, Date> = {}
    if (dateRange.startDate) dateFilter.gte = new Date(dateRange.startDate)
    if (dateRange.endDate) dateFilter.lte = new Date(dateRange.endDate)
    filter.timestamp = dateFilter
  }
  return filter
}

function buildWhere(schoolId: string, formType: string, dateRange: DateRange) {
  const where: Record<string, unknown> = {
    organizationId: schoolId,
    formType,
  }
  if (dateRange.startDate || dateRange.endDate) {
    const dateFilter: Record<string, Date> = {}
    if (dateRange.startDate) dateFilter.gte = new Date(dateRange.startDate)
    if (dateRange.endDate) dateFilter.lte = new Date(dateRange.endDate)
    where.timestamp = dateFilter
  }
  return where
}
