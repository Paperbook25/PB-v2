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
