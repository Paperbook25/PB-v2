import { prisma } from '../config/db.js'

export async function getOverview() {
  const [
    totalSchools, activeSchools, trialSchools, churnedSchools,
    totalStudents, totalStaff, totalAddonsEnabled,
  ] = await Promise.all([
    prisma.schoolProfile.count(),
    prisma.schoolProfile.count({ where: { status: 'active' } }),
    prisma.schoolProfile.count({ where: { status: 'trial' } }),
    prisma.schoolProfile.count({ where: { status: 'churned' } }),
    prisma.student.count(),
    prisma.staff.count(),
    prisma.schoolAddon.count({ where: { enabled: true } }),
  ])

  const avgStudentsPerSchool = totalSchools > 0 ? Math.round(totalStudents / totalSchools) : 0
  const avgStaffPerSchool = totalSchools > 0 ? Math.round(totalStaff / totalSchools) : 0

  // Top 5 schools by student count
  const topSchoolsByStudents = await prisma.student.groupBy({
    by: ['organizationId'],
    _count: true,
    orderBy: { _count: { organizationId: 'desc' } },
    take: 5,
  })

  const topSchoolIds = topSchoolsByStudents.map((s) => s.organizationId).filter(Boolean) as string[]
  const topSchoolProfiles = await prisma.schoolProfile.findMany({
    where: { id: { in: topSchoolIds } },
    select: { id: true, name: true, city: true, planTier: true },
  })

  const topSchools = topSchoolsByStudents.map((s) => {
    const profile = topSchoolProfiles.find((p) => p.id === s.organizationId)
    return { schoolId: s.organizationId, schoolName: profile?.name || 'Unknown', city: profile?.city, planTier: profile?.planTier, studentCount: s._count }
  })

  // Most popular addon
  const addonPopularity = await prisma.schoolAddon.groupBy({
    by: ['addonId'],
    where: { enabled: true },
    _count: true,
    orderBy: { _count: { addonId: 'desc' } },
    take: 1,
  })
  let mostPopularAddon = 'N/A'
  if (addonPopularity.length > 0) {
    const addon = await prisma.addon.findUnique({ where: { id: addonPopularity[0].addonId }, select: { name: true } })
    mostPopularAddon = addon?.name || 'N/A'
  }

  return {
    totalSchools, activeSchools, trialSchools, churnedSchools,
    totalStudents, totalStaff, totalAddonsEnabled,
    avgStudentsPerSchool, avgStaffPerSchool,
    mostPopularAddon,
    topSchools,
  }
}

export async function getFeatureAdoption() {
  const addons = await prisma.addon.findMany({
    select: { id: true, name: true, slug: true, category: true },
    orderBy: { sortOrder: 'asc' },
  })

  const totalSchools = await prisma.schoolProfile.count({ where: { status: { in: ['active', 'trial'] } } })

  const addonUsage = await prisma.schoolAddon.groupBy({
    by: ['addonId'],
    where: { enabled: true },
    _count: true,
  })

  const usageMap = new Map(addonUsage.map((u) => [u.addonId, u._count]))

  // Per plan tier adoption
  const planTierAdoption = await prisma.schoolAddon.findMany({
    where: { enabled: true },
    select: { addonId: true, school: { select: { planTier: true } } },
  })

  const tierMap: Record<string, Record<string, number>> = {}
  for (const entry of planTierAdoption) {
    const tier = entry.school.planTier
    if (!tierMap[entry.addonId]) tierMap[entry.addonId] = {}
    tierMap[entry.addonId][tier] = (tierMap[entry.addonId][tier] || 0) + 1
  }

  return addons.map((addon) => ({
    id: addon.id,
    name: addon.name,
    slug: addon.slug,
    category: addon.category,
    schoolsUsing: usageMap.get(addon.id) || 0,
    adoptionRate: totalSchools > 0 ? Math.round(((usageMap.get(addon.id) || 0) / totalSchools) * 100) : 0,
    byTier: tierMap[addon.id] || {},
  }))
}

export async function getBenchmarks() {
  // Get all active schools with their stats
  const schools = await prisma.schoolProfile.findMany({
    where: { status: { in: ['active', 'trial'] } },
    select: { id: true, name: true, city: true, planTier: true, status: true },
  })

  const results = await Promise.all(schools.map(async (school) => {
    const [studentCount, staffCount, addonCount] = await Promise.all([
      prisma.student.count({ where: { organizationId: school.id } }),
      prisma.staff.count({ where: { organizationId: school.id } }),
      prisma.schoolAddon.count({ where: { schoolId: school.id, enabled: true } }),
    ])

    return {
      schoolId: school.id,
      schoolName: school.name,
      city: school.city,
      planTier: school.planTier,
      status: school.status,
      studentCount,
      staffCount,
      studentStaffRatio: staffCount > 0 ? Math.round((studentCount / staffCount) * 10) / 10 : 0,
      addonsEnabled: addonCount,
    }
  }))

  // Sort by student count descending
  results.sort((a, b) => b.studentCount - a.studentCount)

  return results
}

export async function getTrends() {
  const now = new Date()
  const months = []

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    const monthLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' })

    const [newSchools, newStudents] = await Promise.all([
      prisma.schoolProfile.count({
        where: { createdAt: { gte: date, lt: nextMonth } },
      }),
      prisma.student.count({
        where: { createdAt: { gte: date, lt: nextMonth } },
      }),
    ])

    months.push({ month: monthLabel, newSchools, newStudents })
  }

  return months
}

/**
 * Cohort analysis: group schools by signup month, track retention.
 */
export async function getCohortAnalysis() {
  const schools = await prisma.schoolProfile.findMany({
    select: { id: true, status: true, createdAt: true },
  })

  // Group by signup month
  const cohorts: Record<string, { total: number; active: number; churned: number; trial: number }> = {}

  for (const school of schools) {
    const monthKey = `${school.createdAt.getFullYear()}-${String(school.createdAt.getMonth() + 1).padStart(2, '0')}`
    if (!cohorts[monthKey]) cohorts[monthKey] = { total: 0, active: 0, churned: 0, trial: 0 }
    cohorts[monthKey].total++
    if (school.status === 'active') cohorts[monthKey].active++
    else if (school.status === 'churned') cohorts[monthKey].churned++
    else if (school.status === 'trial') cohorts[monthKey].trial++
  }

  return Object.entries(cohorts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      ...data,
      retentionRate: data.total > 0 ? Math.round((data.active / data.total) * 100) : 0,
    }))
}

/**
 * Funnel analysis: trial → active → churned conversion.
 */
export async function getFunnelAnalysis() {
  const [totalSignups, trialStarted, activatedFromTrial, churned] = await Promise.all([
    prisma.schoolProfile.count(),
    prisma.platformSubscription.count({ where: { trialStartedAt: { not: null } } }),
    prisma.platformSubscription.count({ where: { status: 'sub_active', trialStartedAt: { not: null } } }),
    prisma.platformSubscription.count({ where: { status: 'sub_cancelled' } }),
  ])

  // Direct activations (no trial)
  const directActivations = await prisma.platformSubscription.count({
    where: { status: 'sub_active', trialStartedAt: null },
  })

  const totalActive = activatedFromTrial + directActivations

  return {
    stages: [
      { name: 'Signed Up', count: totalSignups, percentage: 100 },
      { name: 'Started Trial', count: trialStarted, percentage: totalSignups > 0 ? Math.round((trialStarted / totalSignups) * 100) : 0 },
      { name: 'Activated', count: totalActive, percentage: totalSignups > 0 ? Math.round((totalActive / totalSignups) * 100) : 0 },
      { name: 'Churned', count: churned, percentage: totalSignups > 0 ? Math.round((churned / totalSignups) * 100) : 0 },
    ],
    conversionRates: {
      signupToTrial: totalSignups > 0 ? Math.round((trialStarted / totalSignups) * 100) : 0,
      trialToActive: trialStarted > 0 ? Math.round((activatedFromTrial / trialStarted) * 100) : 0,
      overallConversion: totalSignups > 0 ? Math.round((totalActive / totalSignups) * 100) : 0,
    },
  }
}

/**
 * LTV (Lifetime Value) calculation per plan tier.
 */
export async function getLtvAnalysis() {
  // Get total payments grouped by school
  const schoolPayments = await prisma.platformPayment.groupBy({
    by: ['invoiceId'],
    _sum: { amount: true },
  })

  // Map invoices to schools
  const invoiceIds = schoolPayments.map(p => p.invoiceId)
  const invoices = await prisma.platformInvoice.findMany({
    where: { id: { in: invoiceIds } },
    select: { id: true, schoolId: true },
  })
  const invoiceSchoolMap = new Map(invoices.map(i => [i.id, i.schoolId]))

  // Aggregate by school
  const schoolRevenue: Record<string, number> = {}
  for (const p of schoolPayments) {
    const schoolId = invoiceSchoolMap.get(p.invoiceId)
    if (schoolId) {
      schoolRevenue[schoolId] = (schoolRevenue[schoolId] || 0) + Number(p._sum.amount || 0)
    }
  }

  // Get school plan tiers
  const schoolIds = Object.keys(schoolRevenue)
  const schoolProfiles = await prisma.schoolProfile.findMany({
    where: { id: { in: schoolIds } },
    select: { id: true, planTier: true, createdAt: true },
  })

  // Group by plan tier
  const tierData: Record<string, { totalRevenue: number; count: number; totalMonths: number }> = {}
  const now = new Date()

  for (const school of schoolProfiles) {
    const tier = school.planTier
    if (!tierData[tier]) tierData[tier] = { totalRevenue: 0, count: 0, totalMonths: 0 }
    tierData[tier].totalRevenue += schoolRevenue[school.id] || 0
    tierData[tier].count++
    const months = Math.max(1, Math.round((now.getTime() - school.createdAt.getTime()) / (30 * 86400000)))
    tierData[tier].totalMonths += months
  }

  return Object.entries(tierData).map(([tier, data]) => ({
    planTier: tier,
    schoolCount: data.count,
    totalRevenue: Math.round(data.totalRevenue),
    avgRevenuePerSchool: data.count > 0 ? Math.round(data.totalRevenue / data.count) : 0,
    avgMonthlyRevenue: data.totalMonths > 0 ? Math.round(data.totalRevenue / data.totalMonths) : 0,
    estimatedLtv12m: data.totalMonths > 0 ? Math.round((data.totalRevenue / data.totalMonths) * 12) : 0,
  }))
}
