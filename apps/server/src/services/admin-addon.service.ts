import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ============================================================================
// Types
// ============================================================================

interface UpdateAddonData {
  name?: string
  description?: string
  icon?: string
  category?: string
  isCore?: boolean
  sortOrder?: number
}

// ============================================================================
// Service Methods
// ============================================================================

/**
 * List all addons with usage counts (how many schools have each addon enabled).
 */
export async function listAddons() {
  const addons = await prisma.addon.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: {
          schoolAddons: true,
        },
      },
      schoolAddons: {
        where: { enabled: true },
        select: { id: true },
      },
    },
  })

  return addons.map((addon) => ({
    id: addon.id,
    slug: addon.slug,
    name: addon.name,
    description: addon.description,
    icon: addon.icon,
    category: addon.category,
    isCore: addon.isCore,
    sortOrder: addon.sortOrder,
    totalSchools: addon._count.schoolAddons,
    enabledSchools: addon.schoolAddons.length,
    createdAt: addon.createdAt.toISOString(),
    updatedAt: addon.updatedAt.toISOString(),
  }))
}

/**
 * Update an addon's details (name, description, icon, category, tier availability).
 */
export async function updateAddon(id: string, data: UpdateAddonData) {
  const existing = await prisma.addon.findUnique({ where: { id } })
  if (!existing) {
    throw AppError.notFound('Addon not found')
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.category !== undefined) updateData.category = data.category
  if (data.isCore !== undefined) updateData.isCore = data.isCore
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder

  const addon = await prisma.addon.update({
    where: { id },
    data: updateData,
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      userName: 'System',
      userRole: 'admin',
      action: 'update',
      module: 'addons',
      entityType: 'Addon',
      entityId: addon.id,
      entityName: addon.name,
      description: `Addon "${addon.name}" updated`,
      changes: JSON.stringify(
        Object.keys(updateData).map((field) => ({
          field,
          oldValue: (existing as any)[field],
          newValue: updateData[field],
        }))
      ),
    },
  })

  return {
    id: addon.id,
    slug: addon.slug,
    name: addon.name,
    description: addon.description,
    icon: addon.icon,
    category: addon.category,
    isCore: addon.isCore,
    sortOrder: addon.sortOrder,
    createdAt: addon.createdAt.toISOString(),
    updatedAt: addon.updatedAt.toISOString(),
  }
}

/**
 * Get usage details for a specific addon: which schools have it enabled.
 */
export async function getAddonUsage(id: string) {
  const addon = await prisma.addon.findUnique({ where: { id } })
  if (!addon) {
    throw AppError.notFound('Addon not found')
  }

  const schoolAddons = await prisma.schoolAddon.findMany({
    where: { addonId: id },
    include: {
      school: {
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
        },
      },
    },
    orderBy: { enabledAt: 'desc' },
  })

  return {
    addon: {
      id: addon.id,
      slug: addon.slug,
      name: addon.name,
    },
    totalSchools: schoolAddons.length,
    enabledSchools: schoolAddons.filter((sa) => sa.enabled).length,
    disabledSchools: schoolAddons.filter((sa) => !sa.enabled).length,
    schools: schoolAddons.map((sa) => ({
      schoolId: sa.school.id,
      schoolName: sa.school.name,
      city: sa.school.city,
      state: sa.school.state,
      enabled: sa.enabled,
      enabledAt: sa.enabledAt.toISOString(),
      enabledBy: sa.enabledBy,
    })),
  }
}
