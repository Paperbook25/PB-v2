import { prisma } from '../config/db.js'

// ==================== In-Memory Unique IP Tracking ====================

// Map: "schoolId:date:pageSlug" -> Set<ip>
const dailyUniqueIps = new Map<string, Set<string>>()
let lastResetDate = new Date().toISOString().slice(0, 10)

function resetIfNewDay() {
  const today = new Date().toISOString().slice(0, 10)
  if (today !== lastResetDate) {
    dailyUniqueIps.clear()
    lastResetDate = today
  }
}

function getIpSetKey(schoolId: string, pageSlug: string): string {
  const today = new Date().toISOString().slice(0, 10)
  return `${schoolId}:${today}:${pageSlug}`
}

// ==================== Track Page View ====================

export async function trackPageView(schoolId: string, pageSlug: string, ip: string) {
  resetIfNewDay()

  const key = getIpSetKey(schoolId, pageSlug)
  let ipSet = dailyUniqueIps.get(key)
  if (!ipSet) {
    ipSet = new Set()
    dailyUniqueIps.set(key, ipSet)
  }

  const isNewIp = !ipSet.has(ip)
  ipSet.add(ip)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.websiteAnalytics.upsert({
    where: {
      organizationId_date_pageSlug: {
        organizationId: schoolId,
        date: today,
        pageSlug,
      },
    },
    create: {
      organizationId: schoolId,
      date: today,
      pageSlug,
      views: 1,
      uniqueIps: 1,
    },
    update: {
      views: { increment: 1 },
      ...(isNewIp ? { uniqueIps: { increment: 1 } } : {}),
    },
  })
}

// ==================== Get Analytics (date range) ====================

export interface AnalyticsQuery {
  startDate?: string
  endDate?: string
  pageSlug?: string
}

export async function getAnalytics(schoolId: string, query: AnalyticsQuery) {
  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.startDate || query.endDate) {
    const dateFilter: Record<string, Date> = {}
    if (query.startDate) dateFilter.gte = new Date(query.startDate)
    if (query.endDate) dateFilter.lte = new Date(query.endDate)
    where.date = dateFilter
  }

  if (query.pageSlug) {
    where.pageSlug = query.pageSlug
  }

  const data = await prisma.websiteAnalytics.findMany({
    where,
    orderBy: { date: 'asc' },
  })

  return { data }
}

// ==================== Get Analytics Summary ====================

export async function getAnalyticsSummary(schoolId: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get all records for last 30 days
  const last30d = await prisma.websiteAnalytics.findMany({
    where: {
      organizationId: schoolId,
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: 'asc' },
  })

  // Calculate totals
  const views7d = last30d
    .filter(r => r.date >= sevenDaysAgo)
    .reduce((sum, r) => sum + r.views, 0)

  const views30d = last30d.reduce((sum, r) => sum + r.views, 0)

  // Calculate daily average (last 30 days)
  const avgDailyViews = views30d > 0 ? Math.round(views30d / 30) : 0

  // Top pages (aggregated over 30 days)
  const pageMap = new Map<string, number>()
  for (const record of last30d) {
    pageMap.set(record.pageSlug, (pageMap.get(record.pageSlug) || 0) + record.views)
  }

  const topPages = Array.from(pageMap.entries())
    .map(([slug, views]) => ({
      pageSlug: slug,
      views,
      percentage: views30d > 0 ? Math.round((views / views30d) * 100) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  // Daily views trend (last 30 days, grouped by date)
  const dailyMap = new Map<string, number>()
  for (const record of last30d) {
    const dateKey = record.date.toISOString().slice(0, 10)
    dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + record.views)
  }

  const trend: Array<{ date: string; views: number }> = []
  for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().slice(0, 10)
    trend.push({ date: dateKey, views: dailyMap.get(dateKey) || 0 })
  }

  return {
    views7d,
    views30d,
    avgDailyViews,
    topPage: topPages[0]?.pageSlug || null,
    topPages,
    trend,
  }
}
