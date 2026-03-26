import { prisma } from '../config/db.js'
import type { Role } from '@prisma/client'

// ============================================================================
// Permission Definitions
// ============================================================================

export const PERMISSION_DEFINITIONS = [
  // Students module
  { slug: 'students.view', name: 'View Students', module: 'students', action: 'view', sortOrder: 1 },
  { slug: 'students.create', name: 'Create Students', module: 'students', action: 'create', sortOrder: 2 },
  { slug: 'students.edit', name: 'Edit Students', module: 'students', action: 'edit', sortOrder: 3 },
  { slug: 'students.delete', name: 'Delete Students', module: 'students', action: 'delete', sortOrder: 4 },
  { slug: 'students.export', name: 'Export Students', module: 'students', action: 'export', sortOrder: 5 },

  // Staff module
  { slug: 'staff.view', name: 'View Staff', module: 'staff', action: 'view', sortOrder: 10 },
  { slug: 'staff.create', name: 'Create Staff', module: 'staff', action: 'create', sortOrder: 11 },
  { slug: 'staff.edit', name: 'Edit Staff', module: 'staff', action: 'edit', sortOrder: 12 },
  { slug: 'staff.delete', name: 'Delete Staff', module: 'staff', action: 'delete', sortOrder: 13 },

  // Admissions
  { slug: 'admissions.view', name: 'View Admissions', module: 'admissions', action: 'view', sortOrder: 20 },
  { slug: 'admissions.create', name: 'Create Applications', module: 'admissions', action: 'create', sortOrder: 21 },
  { slug: 'admissions.edit', name: 'Edit Applications', module: 'admissions', action: 'edit', sortOrder: 22 },
  { slug: 'admissions.approve', name: 'Approve/Reject Applications', module: 'admissions', action: 'approve', sortOrder: 23 },

  // Attendance
  { slug: 'attendance.view', name: 'View Attendance', module: 'attendance', action: 'view', sortOrder: 30 },
  { slug: 'attendance.mark', name: 'Mark Attendance', module: 'attendance', action: 'create', sortOrder: 31 },
  { slug: 'attendance.edit', name: 'Edit Attendance', module: 'attendance', action: 'edit', sortOrder: 32 },

  // Finance
  { slug: 'finance.view', name: 'View Finance', module: 'finance', action: 'view', sortOrder: 40 },
  { slug: 'finance.collect', name: 'Collect Fees', module: 'finance', action: 'create', sortOrder: 41 },
  { slug: 'finance.manage', name: 'Manage Fee Structure', module: 'finance', action: 'edit', sortOrder: 42 },
  { slug: 'finance.approve', name: 'Approve Expenses', module: 'finance', action: 'approve', sortOrder: 43 },
  { slug: 'finance.export', name: 'Export Financial Data', module: 'finance', action: 'export', sortOrder: 44 },

  // Calendar / Timetable
  { slug: 'calendar.view', name: 'View Calendar', module: 'calendar', action: 'view', sortOrder: 50 },
  { slug: 'calendar.create', name: 'Create Events', module: 'calendar', action: 'create', sortOrder: 51 },
  { slug: 'calendar.edit', name: 'Edit Events', module: 'calendar', action: 'edit', sortOrder: 52 },

  // Communication
  { slug: 'communication.view', name: 'View Announcements', module: 'communication', action: 'view', sortOrder: 60 },
  { slug: 'communication.create', name: 'Create Announcements', module: 'communication', action: 'create', sortOrder: 61 },

  // Reports
  { slug: 'reports.view', name: 'View Reports', module: 'reports', action: 'view', sortOrder: 70 },
  { slug: 'reports.generate', name: 'Generate Reports', module: 'reports', action: 'create', sortOrder: 71 },
  { slug: 'reports.export', name: 'Export Reports', module: 'reports', action: 'export', sortOrder: 72 },

  // Settings
  { slug: 'settings.view', name: 'View Settings', module: 'settings', action: 'view', sortOrder: 80 },
  { slug: 'settings.edit', name: 'Edit Settings', module: 'settings', action: 'edit', sortOrder: 81 },
  { slug: 'settings.users', name: 'Manage Users', module: 'settings', action: 'admin', sortOrder: 82 },
  { slug: 'settings.roles', name: 'Manage Role Permissions', module: 'settings', action: 'admin', sortOrder: 83 },
] as const

// ============================================================================
// Default Permissions per Role
// ============================================================================

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: PERMISSION_DEFINITIONS.map(p => p.slug),
  principal: PERMISSION_DEFINITIONS.map(p => p.slug),
  teacher: [
    'students.view', 'attendance.view', 'attendance.mark', 'attendance.edit',
    'calendar.view', 'communication.view', 'reports.view',
  ],
  accountant: [
    'finance.view', 'finance.collect', 'finance.manage', 'finance.export',
    'students.view', 'reports.view', 'reports.generate', 'reports.export',
  ],
  librarian: ['students.view', 'calendar.view', 'communication.view'],
  transport_manager: ['students.view', 'calendar.view', 'communication.view'],
  student: ['attendance.view', 'calendar.view', 'communication.view'],
  parent: ['students.view', 'attendance.view', 'calendar.view', 'communication.view', 'finance.view'],
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Seed all permission definitions and default role assignments.
 * Uses upsert so it's safe to run multiple times.
 */
export async function seedPermissions(): Promise<void> {
  // Log at info level only in dev
  if (process.env.NODE_ENV === 'development') console.log('[Permissions] Seeding permission definitions...')

  // Upsert all permission definitions
  for (const perm of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: {
        name: perm.name,
        module: perm.module,
        action: perm.action,
        sortOrder: perm.sortOrder,
      },
      create: {
        slug: perm.slug,
        name: perm.name,
        module: perm.module,
        action: perm.action,
        sortOrder: perm.sortOrder,
      },
    })
  }
  if (process.env.NODE_ENV === 'development') console.log(`[Permissions] Upserted ${PERMISSION_DEFINITIONS.length} permission definitions`)

  // Fetch all permissions for lookup
  const allPermissions = await prisma.permission.findMany()
  const permBySlug = new Map(allPermissions.map(p => [p.slug, p.id]))

  // Seed default role permissions
  const roles = Object.keys(DEFAULT_ROLE_PERMISSIONS) as Role[]
  for (const role of roles) {
    const grantedSlugs = DEFAULT_ROLE_PERMISSIONS[role] || []

    for (const slug of grantedSlugs) {
      const permissionId = permBySlug.get(slug)
      if (!permissionId) continue

      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role, permissionId } },
        update: { granted: true },
        create: {
          role,
          permissionId,
          granted: true,
          grantedBy: 'system',
        },
      })
    }
  }
  if (process.env.NODE_ENV === 'development') console.log(`[Permissions] Seeded default role permissions for ${roles.length} roles`)
}

/**
 * Get all permissions with granted status for a specific role.
 * Returns every permission with a `granted` boolean for the given role.
 */
export async function getPermissionsForRole(role: Role) {
  const allPermissions = await prisma.permission.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  const rolePerms = await prisma.rolePermission.findMany({
    where: { role },
    select: { permissionId: true, granted: true },
  })

  const grantedMap = new Map(rolePerms.map(rp => [rp.permissionId, rp.granted]))

  return allPermissions.map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    module: p.module,
    action: p.action,
    sortOrder: p.sortOrder,
    granted: grantedMap.get(p.id) ?? false,
  }))
}

/**
 * Get all permissions grouped by module.
 */
export async function getAllPermissions() {
  const permissions = await prisma.permission.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  const grouped: Record<string, typeof permissions> = {}
  for (const perm of permissions) {
    if (!grouped[perm.module]) {
      grouped[perm.module] = []
    }
    grouped[perm.module].push(perm)
  }

  return grouped
}

/**
 * Bulk update permissions for a role.
 */
export async function updateRolePermissions(
  role: Role,
  permissions: { slug: string; granted: boolean }[],
  grantedBy?: string
) {
  // Fetch permission IDs by slug
  const slugs = permissions.map(p => p.slug)
  const permRecords = await prisma.permission.findMany({
    where: { slug: { in: slugs } },
  })
  const permBySlug = new Map(permRecords.map(p => [p.slug, p.id]))

  // Upsert each role-permission
  const results = []
  for (const perm of permissions) {
    const permissionId = permBySlug.get(perm.slug)
    if (!permissionId) continue

    const result = await prisma.rolePermission.upsert({
      where: { role_permissionId: { role, permissionId } },
      update: {
        granted: perm.granted,
        grantedBy: grantedBy || null,
        grantedAt: new Date(),
      },
      create: {
        role,
        permissionId,
        granted: perm.granted,
        grantedBy: grantedBy || null,
      },
    })
    results.push(result)
  }

  return results
}

/**
 * Get just the granted permission slugs for a role (used at login).
 */
export async function getRolePermissionSlugs(role: Role): Promise<string[]> {
  const rolePerms = await prisma.rolePermission.findMany({
    where: { role, granted: true },
    include: { permission: { select: { slug: true } } },
  })

  return rolePerms.map(rp => rp.permission.slug)
}
