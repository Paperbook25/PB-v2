import { prisma } from '../config/db.js'

// ============================================================================
// Helpers
// ============================================================================

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function monthLabel(d: Date): string {
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

// ============================================================================
// Service Methods
// ============================================================================

/**
 * Get high-level platform statistics for the super admin dashboard.
 */
export async function getStats() {
  const [
    totalSchools,
    totalUsers,
    totalStudents,
    totalStaff,
    totalAddons,
    enabledAddonLinks,
  ] = await Promise.all([
    prisma.schoolProfile.count(),
    prisma.user.count(),
    prisma.student.count({ where: { status: 'active' } }),
    prisma.staff.count({ where: { status: 'active' } }),
    prisma.addon.count(),
    prisma.schoolAddon.count({ where: { enabled: true } }),
  ])

  // Active schools: schools that have at least one enabled addon
  const activeSchoolIds = await prisma.schoolAddon.findMany({
    where: { enabled: true },
    select: { schoolId: true },
    distinct: ['schoolId'],
  })

  return {
    totalSchools,
    activeSchools: activeSchoolIds.length,
    totalUsers,
    activeUsers: await prisma.user.count({ where: { isActive: true } }),
    totalStudents,
    totalStaff,
    totalAddons,
    enabledAddonLinks,
    // Revenue is a placeholder until billing is integrated
    monthlyRevenue: 0,
    annualRevenue: 0,
  }
}

/**
 * Get school creation trends over the last 12 months.
 */
export async function getGrowth() {
  const now = new Date()
  const months: { month: string; schools: number; users: number }[] = []

  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const label = monthLabel(monthStart)

    const [schoolCount, userCount] = await Promise.all([
      prisma.schoolProfile.count({
        where: {
          createdAt: { gte: monthStart, lt: monthEnd },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: monthStart, lt: monthEnd },
        },
      }),
    ])

    months.push({
      month: label,
      schools: schoolCount,
      users: userCount,
    })
  }

  // Calculate cumulative totals
  let cumulativeSchools = 0
  let cumulativeUsers = 0

  // Get counts before the 12-month window
  const windowStart = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const [preSchools, preUsers] = await Promise.all([
    prisma.schoolProfile.count({ where: { createdAt: { lt: windowStart } } }),
    prisma.user.count({ where: { createdAt: { lt: windowStart } } }),
  ])

  cumulativeSchools = preSchools
  cumulativeUsers = preUsers

  return months.map((m) => {
    cumulativeSchools += m.schools
    cumulativeUsers += m.users
    return {
      ...m,
      cumulativeSchools,
      cumulativeUsers,
    }
  })
}

/**
 * Get the most popular addons across all schools.
 */
export async function getAddonPopularity() {
  const addons = await prisma.addon.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      schoolAddons: {
        where: { enabled: true },
        select: { id: true },
      },
      _count: {
        select: { schoolAddons: true },
      },
    },
  })

  const totalSchools = await prisma.schoolProfile.count()

  return addons
    .map((addon) => ({
      id: addon.id,
      slug: addon.slug,
      name: addon.name,
      icon: addon.icon,
      category: addon.category,
      isCore: addon.isCore,
      enabledCount: addon.schoolAddons.length,
      totalAssignments: addon._count.schoolAddons,
      adoptionRate: totalSchools > 0
        ? Math.round((addon.schoolAddons.length / totalSchools) * 100)
        : 0,
    }))
    .sort((a, b) => b.enabledCount - a.enabledCount)
}

/**
 * Get recent audit log activity across the platform.
 */
export async function getRecentActivity() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return logs.map((log) => ({
    id: log.id,
    userId: log.userId,
    userName: log.userName,
    userRole: log.userRole,
    action: log.action,
    module: log.module,
    entityType: log.entityType,
    entityId: log.entityId,
    entityName: log.entityName,
    description: log.description,
    ipAddress: log.ipAddress,
    timestamp: log.createdAt.toISOString(),
  }))
}
