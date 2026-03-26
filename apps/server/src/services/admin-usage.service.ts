import { prisma } from '../config/db.js'

export async function getOverview() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)

  const [todayApiCalls, todayActiveUsers, totalStorage] = await Promise.all([
    prisma.usageMetric.aggregate({
      where: { metricType: 'api_calls', recordedAt: { gte: today } },
      _sum: { value: true },
    }),
    prisma.usageMetric.aggregate({
      where: { metricType: 'active_users', recordedAt: { gte: today } },
      _sum: { value: true },
    }),
    prisma.usageMetric.aggregate({
      where: { metricType: 'storage_mb', period: 'daily', recordedAt: { gte: thirtyDaysAgo } },
      _sum: { value: true },
    }),
  ])

  const totalSchools = await prisma.schoolProfile.count({ where: { status: { in: ['active', 'trial'] } } })

  return {
    apiCallsToday: Number(todayApiCalls._sum.value || 0),
    activeUsersToday: Number(todayActiveUsers._sum.value || 0),
    totalStorageMb: Number(totalStorage._sum.value || 0),
    avgApiCallsPerSchool: totalSchools > 0 ? Math.round(Number(todayApiCalls._sum.value || 0) / totalSchools) : 0,
    totalSchools,
  }
}

export async function getSchoolUsage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

  // Get per-school aggregates
  const apiCalls = await prisma.usageMetric.groupBy({
    by: ['schoolId'],
    where: { metricType: 'api_calls', recordedAt: { gte: thirtyDaysAgo } },
    _sum: { value: true },
  })

  const activeUsers = await prisma.usageMetric.groupBy({
    by: ['schoolId'],
    where: { metricType: 'active_users', recordedAt: { gte: thirtyDaysAgo } },
    _sum: { value: true },
  })

  const storage = await prisma.usageMetric.groupBy({
    by: ['schoolId'],
    where: { metricType: 'storage_mb' },
    _sum: { value: true },
  })

  // Get school names
  const schoolIds = [...new Set([
    ...apiCalls.map((a) => a.schoolId),
    ...activeUsers.map((a) => a.schoolId),
    ...storage.map((a) => a.schoolId),
  ])]

  const schools = await prisma.schoolProfile.findMany({
    where: { id: { in: schoolIds } },
    select: { id: true, name: true, planTier: true, status: true },
  })

  // If no usage data, return all schools with zeros
  if (schoolIds.length === 0) {
    const allSchools = await prisma.schoolProfile.findMany({
      where: { status: { in: ['active', 'trial'] } },
      select: { id: true, name: true, planTier: true, status: true },
    })
    return allSchools.map((s) => ({
      schoolId: s.id, schoolName: s.name, planTier: s.planTier, status: s.status,
      apiCalls30d: 0, activeUsers30d: 0, storageMb: 0,
    }))
  }

  const apiMap = new Map(apiCalls.map((a) => [a.schoolId, Number(a._sum.value || 0)]))
  const userMap = new Map(activeUsers.map((a) => [a.schoolId, Number(a._sum.value || 0)]))
  const storageMap = new Map(storage.map((a) => [a.schoolId, Number(a._sum.value || 0)]))

  return schools.map((s) => ({
    schoolId: s.id,
    schoolName: s.name,
    planTier: s.planTier,
    status: s.status,
    apiCalls30d: apiMap.get(s.id) || 0,
    activeUsers30d: userMap.get(s.id) || 0,
    storageMb: Math.round(storageMap.get(s.id) || 0),
  })).sort((a, b) => b.apiCalls30d - a.apiCalls30d)
}

export async function getSchoolUsageDetail(schoolId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

  const metrics = await prisma.usageMetric.findMany({
    where: { schoolId, recordedAt: { gte: thirtyDaysAgo } },
    orderBy: { recordedAt: 'asc' },
  })

  const grouped: Record<string, Array<{ value: number; date: string }>> = {}
  for (const m of metrics) {
    if (!grouped[m.metricType]) grouped[m.metricType] = []
    grouped[m.metricType].push({ value: Number(m.value), date: m.recordedAt.toISOString().split('T')[0] })
  }

  const school = await prisma.schoolProfile.findUnique({
    where: { id: schoolId },
    select: { id: true, name: true, planTier: true, status: true },
  })

  return { school, metrics: grouped }
}
