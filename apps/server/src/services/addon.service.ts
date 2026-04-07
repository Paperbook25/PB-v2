import { prisma } from '../config/db.js'
import { clearAddonCache, clearPlanCache } from '../middleware/addon.middleware.js'
import { isModuleInPlan, type PlanTier } from '../config/plan-tiers.js'
import { AppError } from '../utils/errors.js'

// Billing cycles that allow paid addons
const LONG_TERM_CYCLES = ['semi_annual', 'annual', 'multi_year']

// All available addons with their definitions and monthly prices
const ADDON_DEFINITIONS = [
  { slug: 'library',        name: 'Library',        description: 'Book management, issuing, returns, and digital library',                                        icon: 'BookOpen',          category: 'academic',       isCore: false, sortOrder: 1,  monthlyPrice: 499  },
  { slug: 'lms',            name: 'LMS',             description: 'Learning management with courses, assignments, and live classes',                               icon: 'GraduationCap',     category: 'academic',       isCore: false, sortOrder: 2,  monthlyPrice: 1499 },
  { slug: 'exams',          name: 'Exams',           description: 'Exam scheduling, marks entry, grade scales, and report cards',                                  icon: 'ClipboardCheck',    category: 'academic',       isCore: false, sortOrder: 3,  monthlyPrice: 599  },
  { slug: 'transport',      name: 'Transport',       description: 'Vehicle management, routes, drivers, and live tracking',                                        icon: 'Bus',               category: 'operations',     isCore: false, sortOrder: 4,  monthlyPrice: 799  },
  { slug: 'hostel',         name: 'Hostel',          description: 'Room allocation, mess management, and hostel attendance',                                       icon: 'Building2',         category: 'operations',     isCore: false, sortOrder: 5,  monthlyPrice: 999  },
  { slug: 'operations',     name: 'Operations',      description: 'Inventory, assets, and facility management',                                                   icon: 'Warehouse',         category: 'operations',     isCore: false, sortOrder: 6,  monthlyPrice: 499  },
  { slug: 'documents',      name: 'Documents',       description: 'Document storage, folders, and file management',                                               icon: 'FolderOpen',        category: 'operations',     isCore: false, sortOrder: 7,  monthlyPrice: 299  },
  { slug: 'clubs',          name: 'Clubs',           description: 'Extracurricular clubs and activity management',                                                 icon: 'Trophy',            category: 'extras',         isCore: false, sortOrder: 8,  monthlyPrice: 399  },
  { slug: 'alumni',         name: 'Alumni',          description: 'Alumni network and engagement tracking',                                                        icon: 'Users',             category: 'extras',         isCore: false, sortOrder: 9,  monthlyPrice: 399  },
  { slug: 'scholarships',   name: 'Scholarships',    description: 'Scholarship programs and applications',                                                         icon: 'Award',             category: 'extras',         isCore: false, sortOrder: 10, monthlyPrice: 499  },
  { slug: 'complaints',     name: 'Complaints',      description: 'Complaint tracking and resolution',                                                             icon: 'MessageSquareWarning', category: 'communication', isCore: false, sortOrder: 11, monthlyPrice: 299 },
  { slug: 'visitors',       name: 'Visitors',        description: 'Visitor management and gate passes',                                                            icon: 'UserCheck',         category: 'communication',  isCore: false, sortOrder: 12, monthlyPrice: 299  },
  { slug: 'school-website', name: 'School Website',  description: 'Public-facing school website builder with customizable sections and AI content generation',    icon: 'Globe',             category: 'communication',  isCore: false, sortOrder: 13, monthlyPrice: 299  },
  { slug: 'behavior',       name: 'Behavior',        description: 'Student behavior tracking, incidents, detentions, and point systems',                          icon: 'Shield',            category: 'academic',       isCore: false, sortOrder: 14, monthlyPrice: 499  },
]

export async function seedAddons() {
  for (const def of ADDON_DEFINITIONS) {
    await prisma.addon.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        description: def.description,
        icon: def.icon,
        category: def.category,
        isCore: def.isCore,
        sortOrder: def.sortOrder,
        monthlyPrice: def.monthlyPrice,
      },
      create: def,
    })
  }
}

export async function listAddons(schoolId: string, planTier?: string) {
  const addons = await prisma.addon.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      schoolAddons: {
        where: { schoolId },
        select: {
          enabled: true,
          enabledAt: true,
          billingStatus: true,
          trialStartedAt: true,
          trialEndsAt: true,
          billingStartedAt: true,
          monthlyPrice: true,
        },
      },
    },
  })

  return addons.map(addon => {
    const sa = addon.schoolAddons[0]
    const includedInPlan = planTier ? isModuleInPlan(planTier as PlanTier, addon.slug) : false

    return {
      id: addon.id,
      slug: addon.slug,
      name: addon.name,
      description: addon.description,
      icon: addon.icon,
      category: addon.category,
      isCore: addon.isCore,
      sortOrder: addon.sortOrder,
      monthlyPrice: addon.monthlyPrice ? Number(addon.monthlyPrice) : null,
      includedInPlan,
      enabled: sa ? sa.enabled : false,
      enabledAt: sa ? sa.enabledAt : null,
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

export async function toggleAddon(schoolId: string, slug: string, enabled: boolean, userId: string) {
  const addon = await prisma.addon.findUnique({ where: { slug } })
  if (!addon) throw AppError.notFound(`Addon not found: ${slug}`)
  if (addon.isCore) throw AppError.badRequest(`Cannot toggle core module: ${slug}`)

  if (!enabled) {
    // Disabling: clear billing state
    await prisma.schoolAddon.upsert({
      where: { schoolId_addonId: { schoolId, addonId: addon.id } },
      update: {
        enabled: false,
        billingStatus: 'inactive',
        trialStartedAt: null,
        trialEndsAt: null,
        billingStartedAt: null,
      },
      create: {
        schoolId,
        addonId: addon.id,
        enabled: false,
        enabledBy: userId,
        billingStatus: 'inactive',
      },
    })
    clearAddonCache(schoolId)
    return { slug, enabled: false, billingStatus: 'inactive' }
  }

  // Enabling: determine if this addon is included in the school's plan
  const school = await prisma.schoolProfile.findUnique({
    where: { id: schoolId },
    select: { planTier: true },
  })
  const tier = (school?.planTier || 'free') as PlanTier
  const includedInPlan = isModuleInPlan(tier, slug)

  let billingData: Record<string, unknown> = { billingStatus: 'free' }

  if (!includedInPlan && addon.monthlyPrice) {
    // Paid addon — check billing cycle eligibility
    const sub = await prisma.platformSubscription.findFirst({
      where: { schoolId },
      select: { billingCycle: true },
    })
    const cycle = sub?.billingCycle || 'monthly'

    if (!LONG_TERM_CYCLES.includes(cycle)) {
      throw AppError.badRequest(
        'Paid add-ons require a semi-annual or longer subscription. Switch to an annual plan to unlock individual modules.'
      )
    }

    const now = new Date()
    billingData = {
      billingStatus: 'trial',
      trialStartedAt: now,
      trialEndsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      billingStartedAt: null,
    }
  }

  await prisma.schoolAddon.upsert({
    where: { schoolId_addonId: { schoolId, addonId: addon.id } },
    update: { enabled: true, enabledBy: userId, ...billingData },
    create: { schoolId, addonId: addon.id, enabled: true, enabledBy: userId, ...billingData },
  })

  clearAddonCache(schoolId)
  return { slug, enabled: true, ...billingData }
}

/**
 * Transitions trial addons to active billing once trial period has ended.
 * Run on server startup and daily via cron.
 */
export async function activateTrialEndedAddons() {
  const expired = await prisma.schoolAddon.findMany({
    where: { billingStatus: 'trial', trialEndsAt: { lte: new Date() } },
    select: { id: true, schoolId: true },
  })

  for (const sa of expired) {
    await prisma.schoolAddon.update({
      where: { id: sa.id },
      data: { billingStatus: 'active', billingStartedAt: new Date() },
    })
    clearAddonCache(sa.schoolId)
  }

  return { activated: expired.length }
}

/**
 * Auto-provision (enable) all addons included in a plan tier for a school.
 * Upserts SchoolAddon records so existing enabled addons are preserved.
 * Call this when a school is created or its plan tier changes.
 */
export async function provisionAddonsForPlan(
  schoolId: string,
  planTier: PlanTier,
  enabledBy?: string | null,
  tx?: any, // Prisma transaction client
) {
  const db = tx || prisma
  const config = (await import('../config/plan-tiers.js')).PLAN_CONFIGS[planTier]
  const isUnlimited = config.modules.includes('*')

  // Enterprise ('*') gets ALL addons; other tiers get their listed modules
  const addons = isUnlimited
    ? await db.addon.findMany({ select: { id: true, slug: true } })
    : await db.addon.findMany({
        where: { slug: { in: config.modules } },
        select: { id: true, slug: true },
      })

  if (addons.length === 0) return

  for (const addon of addons) {
    await db.schoolAddon.upsert({
      where: { schoolId_addonId: { schoolId, addonId: addon.id } },
      update: { enabled: true, enabledBy: enabledBy || undefined },
      create: {
        schoolId,
        addonId: addon.id,
        enabled: true,
        enabledBy: enabledBy || undefined,
        billingStatus: 'free', // provisioned by plan = always free
      },
    })
  }

  // Invalidate caches so middleware picks up changes immediately
  clearAddonCache(schoolId)
  clearPlanCache(schoolId)
}

export async function getEnabledAddonSlugs(schoolId: string): Promise<string[]> {
  const schoolAddons = await prisma.schoolAddon.findMany({
    where: { schoolId, enabled: true },
    include: { addon: { select: { slug: true } } },
  })
  return schoolAddons.map(sa => sa.addon.slug)
}
