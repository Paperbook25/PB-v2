import { prisma } from '../config/db.js'

// Aggregate audit logs into feature usage metrics (run daily)
export async function aggregateUsage(date?: Date) {
  const targetDate = date || new Date()
  targetDate.setHours(0, 0, 0, 0)
  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)

  // Get all audit logs for the date, grouped by schoolId + module + action
  const logs = await prisma.auditLog.groupBy({
    by: ['schoolId', 'module', 'action'],
    where: {
      createdAt: { gte: targetDate, lt: nextDay },
      schoolId: { not: null },
    },
    _count: true,
  })

  // Upsert into FeatureUsageAggregate
  for (const log of logs) {
    if (!log.schoolId) continue
    await prisma.featureUsageAggregate.upsert({
      where: {
        schoolId_module_action_date: {
          schoolId: log.schoolId,
          module: log.module,
          action: log.action,
          date: targetDate,
        },
      },
      update: { count: log._count },
      create: {
        schoolId: log.schoolId,
        module: log.module,
        action: log.action,
        count: log._count,
        date: targetDate,
      },
    })
  }

  return { aggregated: logs.length, date: targetDate }
}

// Get platform-wide feature usage summary
export async function getFeatureUsageSummary(days: number = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const aggregates = await prisma.featureUsageAggregate.groupBy({
    by: ['module'],
    where: { date: { gte: since } },
    _sum: { count: true },
  })

  const schoolCounts = await prisma.featureUsageAggregate.groupBy({
    by: ['module'],
    where: { date: { gte: since } },
    _count: { schoolId: true },
  })

  // Merge
  return aggregates.map(a => {
    const sc = schoolCounts.find(s => s.module === a.module)
    return {
      module: a.module,
      totalActions: a._sum.count || 0,
      activeSchools: sc?._count?.schoolId || 0,
    }
  }).sort((a, b) => (b.totalActions || 0) - (a.totalActions || 0))
}

// Get per-school feature usage
export async function getSchoolFeatureUsage(schoolId: string, days: number = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const aggregates = await prisma.featureUsageAggregate.groupBy({
    by: ['module', 'action'],
    where: { schoolId, date: { gte: since } },
    _sum: { count: true },
  })

  // Group by module
  const byModule: Record<string, { total: number; actions: Record<string, number> }> = {}
  for (const a of aggregates) {
    if (!byModule[a.module]) byModule[a.module] = { total: 0, actions: {} }
    byModule[a.module].total += a._sum.count || 0
    byModule[a.module].actions[a.action] = a._sum.count || 0
  }

  return Object.entries(byModule).map(([module, data]) => ({
    module,
    totalActions: data.total,
    actions: data.actions,
  })).sort((a, b) => b.totalActions - a.totalActions)
}

// Get feature usage trends (daily for last N days)
export async function getFeatureUsageTrends(days: number = 30, module?: string) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const where: any = { date: { gte: since } }
  if (module) where.module = module

  const aggregates = await prisma.featureUsageAggregate.groupBy({
    by: ['date', 'module'],
    where,
    _sum: { count: true },
  })

  return aggregates.map(a => ({
    date: a.date,
    module: a.module,
    count: a._sum.count || 0,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Churn risk: schools with declining usage
export async function getChurnRiskSchools() {
  const now = new Date()
  const last30 = new Date(now)
  last30.setDate(last30.getDate() - 30)
  const prev30 = new Date(last30)
  prev30.setDate(prev30.getDate() - 30)

  // Current period usage
  const current = await prisma.featureUsageAggregate.groupBy({
    by: ['schoolId'],
    where: { date: { gte: last30 } },
    _sum: { count: true },
  })

  // Previous period usage
  const previous = await prisma.featureUsageAggregate.groupBy({
    by: ['schoolId'],
    where: { date: { gte: prev30, lt: last30 } },
    _sum: { count: true },
  })

  const prevMap = new Map(previous.map(p => [p.schoolId, p._sum.count || 0]))

  const atRisk = current
    .map(c => {
      const prevCount = prevMap.get(c.schoolId) || 0
      const currentCount = c._sum.count || 0
      const changePercent = prevCount > 0 ? ((currentCount - prevCount) / prevCount) * 100 : 0
      return { schoolId: c.schoolId, currentUsage: currentCount, previousUsage: prevCount, changePercent }
    })
    .filter(s => s.changePercent < -30) // 30%+ decline
    .sort((a, b) => a.changePercent - b.changePercent)

  // Get school names
  const schoolIds = atRisk.map(s => s.schoolId)
  const schools = await prisma.schoolProfile.findMany({
    where: { id: { in: schoolIds } },
    select: { id: true, name: true, planTier: true, status: true },
  })
  const schoolMap = new Map(schools.map(s => [s.id, s]))

  return atRisk.map(r => ({
    ...r,
    schoolName: schoolMap.get(r.schoolId)?.name || 'Unknown',
    planTier: schoolMap.get(r.schoolId)?.planTier || 'free',
    status: schoolMap.get(r.schoolId)?.status || 'unknown',
  }))
}
