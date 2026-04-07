import { hashPassword } from 'better-auth/crypto'
import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { evictTenantCache } from '../middleware/tenant.middleware.js'
import { provisionAddonsForPlan } from './addon.service.js'
import { sendWelcomeEmail } from './admin-email.service.js'
import type { PlanTier } from '../config/plan-tiers.js'

// ============================================================================
// Types
// ============================================================================

interface ListSchoolsParams {
  page?: number
  limit?: number
  status?: string
  planTier?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface CreateSchoolData {
  name: string
  slug?: string // subdomain slug (auto-generated from name if not provided)
  address?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  principalName?: string
  establishedYear?: number
  affiliationNumber?: string
  affiliationBoard?: string
  planTier?: string
  // Admin user for the school
  adminName: string
  adminEmail: string
  adminPassword: string
}

interface UpdateSchoolData {
  name?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  principalName?: string
  establishedYear?: number
  affiliationNumber?: string
  affiliationBoard?: string
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate a URL-safe slug from a school name.
 * "Delhi Public School" → "delhi-public-school"
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-')          // spaces → hyphens
    .replace(/-+/g, '-')           // collapse multiple hyphens
    .replace(/^-|-$/g, '')         // trim leading/trailing hyphens
    .slice(0, 63)                  // DNS label max length
}

/**
 * Ensure a slug is unique by appending a numeric suffix if needed.
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let attempt = 0

  while (true) {
    const existing = await prisma.organization.findUnique({ where: { slug } })
    if (!existing) return slug
    attempt++
    slug = `${baseSlug}-${attempt}`
    if (attempt > 100) throw new Error('Unable to generate unique slug')
  }
}

function formatSchool(school: any) {
  return {
    id: school.id,
    name: school.name,
    slug: school.organization?.slug || null,
    address: school.address,
    city: school.city,
    state: school.state,
    pincode: school.pincode,
    phone: school.phone,
    email: school.email,
    website: school.website,
    logo: school.logo,
    principalName: school.principalName,
    establishedYear: school.establishedYear,
    affiliationNumber: school.affiliationNumber,
    affiliationBoard: school.affiliationBoard,
    status: school.status || 'active',
    planTier: school.planTier || 'free',
    maxUsers: school.maxUsers || 100,
    maxStudents: school.maxStudents || 500,
    trialEndsAt: school.trialEndsAt?.toISOString() || null,
    suspendedAt: school.suspendedAt?.toISOString() || null,
    suspendReason: school.suspendReason || null,
    onboardedAt: school.onboardedAt?.toISOString() || null,
    notes: school.notes || null,
    createdAt: school.createdAt.toISOString(),
    updatedAt: school.updatedAt.toISOString(),
  }
}

// ============================================================================
// Service Methods
// ============================================================================

/**
 * List schools with pagination and filters.
 */
export async function listSchools(params: ListSchoolsParams) {
  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
      { city: { contains: params.search, mode: 'insensitive' } },
      { principalName: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  if (params.status) {
    where.status = params.status
  }

  if (params.planTier) {
    where.planTier = params.planTier
  }

  const SCHOOL_SORT_FIELDS = new Set(['createdAt', 'updatedAt', 'name', 'email', 'city', 'status', 'planTier'])
  const sortField = SCHOOL_SORT_FIELDS.has(params.sortBy || '') ? params.sortBy! : 'createdAt'
  const sortDir = params.sortOrder === 'asc' ? 'asc' : 'desc'
  const orderBy: Record<string, string> = { [sortField]: sortDir }

  const [schools, total] = await Promise.all([
    prisma.schoolProfile.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        organization: { select: { slug: true } },
        schoolAddons: {
          where: { enabled: true },
          select: { id: true },
        },
      },
    }),
    prisma.schoolProfile.count({ where }),
  ])

  return {
    data: schools.map((school) => ({
      ...formatSchool(school),
      addonCount: school.schoolAddons.length,
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Get a single school's details with aggregate stats.
 */
export async function getSchool(id: string) {
  const school = await prisma.schoolProfile.findUnique({
    where: { id },
    include: {
      organization: { select: { slug: true } },
      schoolAddons: {
        where: { enabled: true },
        include: { addon: { select: { slug: true, name: true } } },
      },
    },
  })

  if (!school) {
    throw AppError.notFound('School not found')
  }

  // Gather stats — scoped to this school's organization
  const [userCount, studentCount] = await Promise.all([
    prisma.orgMember.count({ where: { organizationId: id } }),
    prisma.student.count({ where: { status: 'active' } }), // Keep as-is until schoolId added to Student model
  ])

  return {
    ...formatSchool(school),
    stats: {
      userCount,
      studentCount,
      addonCount: school.schoolAddons.length,
    },
    addons: school.schoolAddons.map((sa) => ({
      slug: sa.addon.slug,
      name: sa.addon.name,
    })),
  }
}

/**
 * Create a new school.
 * Creates the SchoolProfile record, creates an admin User as the school owner,
 * and seeds default addons.
 */
export async function createSchool(data: CreateSchoolData) {
  // Validate no duplicate school email (if provided)
  if (data.email) {
    const existingSchool = await prisma.schoolProfile.findFirst({
      where: { email: data.email },
    })
    if (existingSchool) {
      throw AppError.conflict('A school with this email already exists')
    }
  }

  // Validate no duplicate admin user email (check BetterAuthUser table)
  const existingUser = await prisma.betterAuthUser.findUnique({
    where: { email: data.adminEmail },
  })
  if (existingUser) {
    throw AppError.conflict('A user with this admin email already exists')
  }

  // Generate and validate slug for subdomain routing
  const baseSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.name)
  if (!baseSlug) {
    throw AppError.badRequest('Cannot generate a valid slug from the school name. Provide a custom slug.')
  }
  const slug = await ensureUniqueSlug(baseSlug)

  const hashedPassword = await hashPassword(data.adminPassword)

  // Use a transaction to create org + school + admin user + seed addons atomically
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Organization (better-auth org — used for subdomain routing)
    const org = await tx.organization.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        slug,
        logo: data.logo || null,
      },
    })

    // 2. Create SchoolProfile linked to the organization (same ID)
    const school = await tx.schoolProfile.create({
      data: {
        id: org.id, // Link SchoolProfile.id = Organization.id
        name: data.name,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        logo: data.logo || null,
        principalName: data.principalName || null,
        establishedYear: data.establishedYear || null,
        affiliationNumber: data.affiliationNumber || null,
        affiliationBoard: data.affiliationBoard as any || null,
        planTier: (data.planTier as any) || 'free',
      },
    })

    // 3. Create admin user for this school (in BetterAuthUser + BetterAuthAccount)
    const adminUser = await tx.betterAuthUser.create({
      data: {
        id: crypto.randomUUID(),
        email: data.adminEmail,
        name: data.adminName,
        emailVerified: true,
        role: 'user', // School-level user (not platform admin)
      },
    })

    // 4. Create BetterAuthAccount with credential password
    await tx.betterAuthAccount.create({
      data: {
        id: crypto.randomUUID(),
        accountId: adminUser.id,
        providerId: 'credential',
        userId: adminUser.id,
        password: hashedPassword,
      },
    })

    // 5. Create OrgMember linking admin to the organization
    await tx.orgMember.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: org.id,
        userId: adminUser.id,
        role: 'owner',
      },
    })

    // 6. Auto-enable all addons included in the school's plan tier
    await provisionAddonsForPlan(
      school.id,
      (data.planTier || 'free') as PlanTier,
      adminUser.id,
      tx,
    )

    // 7. Auto-create platform subscription record
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)
    await tx.platformSubscription.create({
      data: {
        schoolId: school.id,
        planTier: (data.planTier || 'free') as any,
        status: 'sub_trial',
        billingCycle: 'monthly',
        amount: 0,
        trialStartedAt: new Date(),
        trialEndsAt,
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndsAt,
        nextBillingDate: trialEndsAt,
      },
    })

    // 8. Create an audit log entry
    await tx.auditLog.create({
      data: {
        userId: null,
        userName: 'System',
        userRole: 'admin',
        action: 'create',
        module: 'schools',
        entityType: 'SchoolProfile',
        entityId: school.id,
        entityName: school.name,
        description: `School "${school.name}" created (slug: ${slug}) with admin user ${data.adminEmail}`,
      },
    })

    return { school, org, adminUser }
  })

  // Send welcome email (non-blocking)
  sendWelcomeEmail(result.school.id).catch(() => {})

  return {
    school: {
      ...formatSchool(result.school),
      slug: result.org.slug,
    },
    adminUser: {
      id: result.adminUser.id,
      email: result.adminUser.email,
      name: result.adminUser.name,
      role: 'owner',
    },
  }
}

/**
 * Update a school's profile fields.
 */
export async function updateSchool(id: string, data: UpdateSchoolData) {
  const existing = await prisma.schoolProfile.findUnique({ where: { id } })
  if (!existing) {
    throw AppError.notFound('School not found')
  }

  // Check email uniqueness if changing
  if (data.email && data.email !== existing.email) {
    const emailTaken = await prisma.schoolProfile.findFirst({
      where: { email: data.email, id: { not: id } },
    })
    if (emailTaken) {
      throw AppError.conflict('A school with this email already exists')
    }
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.address !== undefined) updateData.address = data.address
  if (data.city !== undefined) updateData.city = data.city
  if (data.state !== undefined) updateData.state = data.state
  if (data.pincode !== undefined) updateData.pincode = data.pincode
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.email !== undefined) updateData.email = data.email
  if (data.website !== undefined) updateData.website = data.website || null
  if (data.logo !== undefined) updateData.logo = data.logo || null
  if (data.principalName !== undefined) updateData.principalName = data.principalName
  if (data.establishedYear !== undefined) updateData.establishedYear = data.establishedYear
  if (data.affiliationNumber !== undefined) updateData.affiliationNumber = data.affiliationNumber || null
  if (data.affiliationBoard !== undefined) updateData.affiliationBoard = data.affiliationBoard as any || null

  const school = await prisma.schoolProfile.update({
    where: { id },
    data: updateData,
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      userName: 'System',
      userRole: 'admin',
      action: 'update',
      module: 'schools',
      entityType: 'SchoolProfile',
      entityId: school.id,
      entityName: school.name,
      description: `School "${school.name}" updated`,
      changes: JSON.stringify(
        Object.keys(updateData).map((field) => ({
          field,
          oldValue: (existing as any)[field],
          newValue: updateData[field],
        }))
      ),
    },
  })

  return formatSchool(school)
}

/**
 * Suspend a school. Since the schema does not have a status column on
 * SchoolProfile — updates status, suspendedAt, suspendReason columns.
 */
export async function suspendSchool(id: string, reason?: string) {
  const school = await prisma.schoolProfile.findUnique({
    where: { id },
    include: { organization: { select: { slug: true } } },
  })
  if (!school) {
    throw AppError.notFound('School not found')
  }

  const updated = await prisma.schoolProfile.update({
    where: { id },
    data: {
      status: 'suspended',
      suspendedAt: new Date(),
      suspendReason: reason || null,
    },
  })

  // Evict cache so subdomain sees the suspended status immediately
  if (school.organization?.slug) {
    evictTenantCache(school.organization.slug)
  }

  await prisma.auditLog.create({
    data: {
      userName: 'System',
      userRole: 'admin',
      action: 'status_change',
      module: 'admin',
      entityType: 'SchoolProfile',
      entityId: school.id,
      entityName: school.name,
      description: `School "${school.name}" suspended${reason ? `: ${reason}` : ''}`,
      changes: JSON.stringify([
        { field: 'status', oldValue: school.status, newValue: 'suspended' },
      ]),
    },
  })

  return formatSchool(updated)
}

/**
 * Activate a previously suspended school.
 */
export async function activateSchool(id: string) {
  const school = await prisma.schoolProfile.findUnique({
    where: { id },
    include: { organization: { select: { slug: true } } },
  })
  if (!school) {
    throw AppError.notFound('School not found')
  }

  const updated = await prisma.schoolProfile.update({
    where: { id },
    data: {
      status: 'active',
      suspendedAt: null,
      suspendReason: null,
    },
  })

  // Evict cache so subdomain picks up the active status
  if (school.organization?.slug) {
    evictTenantCache(school.organization.slug)
  }

  await prisma.auditLog.create({
    data: {
      userName: 'System',
      userRole: 'admin',
      action: 'status_change',
      module: 'admin',
      entityType: 'SchoolProfile',
      entityId: school.id,
      entityName: school.name,
      description: `School "${school.name}" activated`,
      changes: JSON.stringify([
        { field: 'status', oldValue: school.status, newValue: 'active' },
      ]),
    },
  })

  return formatSchool(updated)
}

/**
 * Soft-delete a school by marking it as churned.
 */
export async function deleteSchool(id: string) {
  const school = await prisma.schoolProfile.findUnique({
    where: { id },
    include: { organization: { select: { slug: true } } },
  })
  if (!school) {
    throw AppError.notFound('School not found')
  }

  const updated = await prisma.schoolProfile.update({
    where: { id },
    data: { status: 'churned' },
  })

  // Evict from tenant cache so subdomain immediately returns 404
  if (school.organization?.slug) {
    evictTenantCache(school.organization.slug)
  }

  await prisma.auditLog.create({
    data: {
      userName: 'System',
      userRole: 'admin',
      action: 'delete',
      module: 'admin',
      entityType: 'SchoolProfile',
      entityId: school.id,
      entityName: school.name,
      description: `School "${school.name}" soft-deleted (status → churned)`,
      changes: JSON.stringify([
        { field: 'status', oldValue: school.status, newValue: 'churned' },
      ]),
    },
  })

  return formatSchool(updated)
}

/**
 * Get all users belonging to a specific school (via OrgMember).
 * Scoped by organizationId to prevent cross-tenant data leakage.
 */
export async function getSchoolUsers(schoolId: string) {
  // Verify school exists
  const school = await prisma.schoolProfile.findUnique({ where: { id: schoolId } })
  if (!school) {
    throw AppError.notFound('School not found')
  }

  const members = await prisma.orgMember.findMany({
    where: { organizationId: schoolId },
    select: {
      id: true,
      role: true,
      createdAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          image: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return members.map((m) => ({
    id: m.user.id,
    email: m.user.email,
    name: m.user.name,
    role: m.role || m.user.role || 'member',
    phone: null,
    avatar: m.user.image,
    isActive: true,
    createdAt: m.user.createdAt.toISOString(),
  }))
}

/**
 * Get all addons for a specific school with their enabled status.
 */
export async function getSchoolAddons(schoolId: string) {
  const school = await prisma.schoolProfile.findUnique({ where: { id: schoolId } })
  if (!school) {
    throw AppError.notFound('School not found')
  }

  const { isModuleInPlan } = await import('../config/plan-tiers.js')
  const tier = (school.planTier || 'free') as any

  const addons = await prisma.addon.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      schoolAddons: {
        where: { schoolId },
        select: {
          enabled: true,
          enabledAt: true,
          enabledBy: true,
          billingStatus: true,
          trialStartedAt: true,
          trialEndsAt: true,
          billingStartedAt: true,
          monthlyPrice: true,
        },
      },
    },
  })

  return addons.map((addon) => {
    const sa = addon.schoolAddons[0]
    const includedInPlan = isModuleInPlan(tier, addon.slug)
    return {
      id: addon.id,
      slug: addon.slug,
      name: addon.name,
      description: addon.description,
      icon: addon.icon,
      category: addon.category,
      isCore: addon.isCore,
      monthlyPrice: addon.monthlyPrice ? Number(addon.monthlyPrice) : null,
      includedInPlan,
      enabled: sa ? sa.enabled : false,
      enabledAt: sa ? sa.enabledAt : null,
      enabledBy: sa ? sa.enabledBy : null,
      billingStatus: sa ? sa.billingStatus : 'inactive',
      trialStartedAt: sa ? sa.trialStartedAt : null,
      trialEndsAt: sa ? sa.trialEndsAt : null,
      billingStartedAt: sa ? sa.billingStartedAt : null,
      effectiveMonthlyPrice: sa?.monthlyPrice
        ? Number(sa.monthlyPrice)
        : addon.monthlyPrice
          ? Number(addon.monthlyPrice)
          : null,
    }
  })
}

/**
 * Toggle an addon for a specific school.
 * Admin version: no billing cycle restriction; paid addons go straight to active (no trial).
 */
export async function toggleSchoolAddon(schoolId: string, addonSlug: string, forcedEnabled?: boolean) {
  const school = await prisma.schoolProfile.findUnique({ where: { id: schoolId } })
  if (!school) {
    throw AppError.notFound('School not found')
  }

  const addon = await prisma.addon.findUnique({ where: { slug: addonSlug } })
  if (!addon) {
    throw AppError.notFound(`Addon "${addonSlug}" not found`)
  }

  if (addon.isCore) {
    throw AppError.badRequest(`Cannot toggle core addon "${addonSlug}"`)
  }

  const { isModuleInPlan } = await import('../config/plan-tiers.js')
  const tier = (school.planTier || 'free') as any

  // Check current state
  const existing = await prisma.schoolAddon.findUnique({
    where: { schoolId_addonId: { schoolId, addonId: addon.id } },
  })

  const newEnabled = forcedEnabled !== undefined ? forcedEnabled : (existing ? !existing.enabled : true)

  let billingData: Record<string, unknown> = {}
  if (newEnabled) {
    const includedInPlan = isModuleInPlan(tier, addonSlug)
    if (!includedInPlan && addon.monthlyPrice) {
      // Admin enables paid addon → immediately active (no trial)
      billingData = { billingStatus: 'active', billingStartedAt: new Date() }
    } else {
      billingData = { billingStatus: 'free' }
    }
  } else {
    billingData = {
      billingStatus: 'inactive',
      trialStartedAt: null,
      trialEndsAt: null,
      billingStartedAt: null,
    }
  }

  await prisma.schoolAddon.upsert({
    where: { schoolId_addonId: { schoolId, addonId: addon.id } },
    update: { enabled: newEnabled, ...billingData },
    create: {
      schoolId,
      addonId: addon.id,
      enabled: newEnabled,
      ...billingData,
    },
  })

  // Clear addon cache
  const { clearAddonCache } = await import('../middleware/addon.middleware.js')
  clearAddonCache(schoolId)

  // Audit log
  await prisma.auditLog.create({
    data: {
      userName: 'System',
      userRole: 'admin',
      action: 'update',
      module: 'addons',
      entityType: 'SchoolAddon',
      entityId: addon.id,
      entityName: addon.name,
      description: `Addon "${addon.name}" ${newEnabled ? 'enabled' : 'disabled'} for school "${school.name}"`,
    },
  })

  return {
    schoolId,
    addonSlug,
    addonName: addon.name,
    enabled: newEnabled,
    billingStatus: billingData.billingStatus as string,
  }
}

/**
 * Bulk suspend multiple schools.
 */
export async function bulkSuspendSchools(schoolIds: string[], reason?: string) {
  let suspended = 0
  for (const id of schoolIds) {
    try {
      await suspendSchool(id, reason)
      suspended++
    } catch (err) {
      console.error(`Failed to suspend school ${id}:`, err)
    }
  }
  return { suspended, total: schoolIds.length }
}

/**
 * Bulk change plan tier for multiple schools.
 */
export async function bulkChangePlan(schoolIds: string[], planTier: string) {
  let updated = 0
  for (const id of schoolIds) {
    try {
      await prisma.schoolProfile.update({
        where: { id },
        data: { planTier: planTier as any },
      })
      // Also update subscription if exists
      const sub = await prisma.platformSubscription.findFirst({
        where: { schoolId: id, status: { in: ['sub_active', 'sub_trial'] } },
      })
      if (sub) {
        await prisma.platformSubscription.update({
          where: { id: sub.id },
          data: { planTier: planTier as any },
        })
      }
      updated++
    } catch (err) {
      console.error(`Failed to change plan for school ${id}:`, err)
    }
  }
  return { updated, total: schoolIds.length }
}
