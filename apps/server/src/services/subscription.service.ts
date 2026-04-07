import { prisma } from '../config/db.js'
import {
  PLAN_CONFIGS,
  getPlanConfig,
  getModulesForPlan,
  isModuleInPlan,
  isFeatureInPlan,
  type PlanTier,
  type PlanConfig,
} from '../config/plan-tiers.js'
import { clearPlanCache, clearAddonCache } from '../middleware/addon.middleware.js'
import { evictTenantCache } from '../middleware/tenant.middleware.js'

const LONG_TERM_CYCLES = ['semi_annual', 'annual', 'multi_year']

export interface AddonCharge {
  slug: string
  name: string
  monthlyPrice: number
  billingStatus: string
  trialEndsAt: Date | null
  billingStartedAt: Date | null
}

export interface SubscriptionInfo {
  plan: PlanConfig
  usage: {
    students: { current: number; limit: number }
    staff: { current: number; limit: number }
    users: { current: number; limit: number }
  }
  includedModules: string[]
  enabledModules: string[]
  availableFeatures: string[]
  canEnablePaidAddons: boolean
  addonCharges: AddonCharge[]
  totalAddonCharges: number
}

/**
 * Get the current subscription plan info and usage stats for a school.
 */
export async function getCurrentPlan(schoolId: string): Promise<SubscriptionInfo> {
  const profile = await prisma.schoolProfile.findFirst({
    where: { id: schoolId },
    select: { planTier: true },
  })

  const tier = (profile?.planTier || 'free') as PlanTier
  const plan = getPlanConfig(tier)

  // Count current usage
  const [studentCount, staffCount, userCount, enabledAddons, sub] = await Promise.all([
    prisma.student.count({ where: { organizationId: schoolId } }),
    prisma.staff.count({ where: { organizationId: schoolId } }),
    prisma.orgMember.count({ where: { organizationId: schoolId } }),
    prisma.schoolAddon.findMany({
      where: { schoolId, enabled: true },
      include: {
        addon: {
          select: { slug: true, name: true, monthlyPrice: true },
        },
      },
    }),
    prisma.platformSubscription.findFirst({
      where: { schoolId },
      select: { billingCycle: true },
    }),
  ])

  const includedModules = getModulesForPlan(tier)
  const enabledModules = enabledAddons.map(a => a.addon.slug)
  const canEnablePaidAddons = LONG_TERM_CYCLES.includes(sub?.billingCycle || '')

  const addonCharges: AddonCharge[] = enabledAddons
    .filter(sa => ['active', 'trial'].includes(sa.billingStatus))
    .map(sa => ({
      slug: sa.addon.slug,
      name: sa.addon.name,
      monthlyPrice: Number(sa.monthlyPrice ?? sa.addon.monthlyPrice ?? 0),
      billingStatus: sa.billingStatus,
      trialEndsAt: sa.trialEndsAt,
      billingStartedAt: sa.billingStartedAt,
    }))

  const totalAddonCharges = addonCharges
    .filter(a => a.billingStatus === 'active')
    .reduce((sum, a) => sum + a.monthlyPrice, 0)

  return {
    plan,
    usage: {
      students: { current: studentCount, limit: plan.maxStudents },
      staff: { current: staffCount, limit: plan.maxStaff },
      users: { current: userCount, limit: plan.maxUsers },
    },
    includedModules,
    enabledModules,
    availableFeatures: plan.features.includes('*')
      ? Object.values(PLAN_CONFIGS)
          .flatMap(p => p.features)
          .filter((f, i, arr) => f !== '*' && arr.indexOf(f) === i)
      : plan.features,
    canEnablePaidAddons,
    addonCharges,
    totalAddonCharges,
  }
}

/**
 * Returns all plan configs for display in a comparison table.
 * Prices and badge are overridden from DB if a matching planTier is set in PricingPlan.
 * Modules, features, and limits always come from plan-tiers.ts (code is authoritative).
 */
export async function getAvailablePlans() {
  const plans = Object.values(PLAN_CONFIGS)

  // Overlay DB prices where planTier matches — safe fallback to hardcoded if no DB plans set
  const dbPricing = await prisma.pricingPlan.findMany({
    where: { isActive: true, planTier: { not: null } },
    select: { planTier: true, monthlyPrice: true, yearlyPrice: true, badge: true },
  })

  const dbByTier = Object.fromEntries(
    dbPricing.map(p => [p.planTier as string, p])
  )

  return plans.map(plan => {
    const dbPlan = dbByTier[plan.id]
    return {
      ...plan,
      price: dbPlan
        ? { monthly: dbPlan.monthlyPrice, annual: dbPlan.yearlyPrice }
        : plan.price,
      badge: dbPlan?.badge || undefined,
    }
  })
}

/**
 * Upgrade (or downgrade) a school's plan tier.
 * Auto-enables modules that are included in the new plan.
 */
export async function upgradePlan(
  schoolId: string,
  newTier: PlanTier,
  userId: string
): Promise<{ success: boolean; plan: PlanConfig; autoEnabledModules: string[] }> {
  const validTiers: PlanTier[] = ['free', 'starter', 'professional', 'enterprise']
  if (!validTiers.includes(newTier)) {
    throw new Error(`Invalid plan tier: ${newTier}`)
  }

  const plan = getPlanConfig(newTier)

  // Update the plan tier in SchoolProfile
  await prisma.schoolProfile.update({
    where: { id: schoolId },
    data: {
      planTier: newTier,
      maxStudents: plan.maxStudents === -1 ? 999999 : plan.maxStudents,
      maxUsers: plan.maxUsers === -1 ? 999999 : plan.maxUsers,
    },
  })

  // Auto-enable modules that are included in the new plan
  const planModules = getModulesForPlan(newTier)
  const autoEnabledModules: string[] = []

  for (const moduleSlug of planModules) {
    const addon = await prisma.addon.findUnique({ where: { slug: moduleSlug } })
    if (!addon) continue

    const existing = await prisma.schoolAddon.findUnique({
      where: { schoolId_addonId: { schoolId, addonId: addon.id } },
    })

    // Only auto-enable if the addon record doesn't exist yet
    // (don't override if admin explicitly disabled it)
    if (!existing) {
      await prisma.schoolAddon.create({
        data: {
          schoolId,
          addonId: addon.id,
          enabled: true,
          enabledBy: userId,
        },
      })
      autoEnabledModules.push(moduleSlug)
    }
  }

  // Clear all relevant caches
  clearPlanCache(schoolId)
  clearAddonCache(schoolId)

  // Evict tenant cache by slug (requires org lookup)
  const org = await prisma.organization.findUnique({
    where: { id: schoolId },
    select: { slug: true },
  })
  if (org?.slug) {
    evictTenantCache(org.slug)
  }

  return { success: true, plan, autoEnabledModules }
}

/**
 * Check if the school can still add more students/staff/users under the plan limits.
 */
export async function checkPlanLimits(
  schoolId: string,
  resource: 'students' | 'staff' | 'users'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const profile = await prisma.schoolProfile.findFirst({
    where: { id: schoolId },
    select: { planTier: true },
  })

  const tier = (profile?.planTier || 'free') as PlanTier
  const plan = getPlanConfig(tier)

  let current = 0
  let limit = 0

  switch (resource) {
    case 'students':
      current = await prisma.student.count({ where: { organizationId: schoolId } })
      limit = plan.maxStudents
      break
    case 'staff':
      current = await prisma.staff.count({ where: { organizationId: schoolId } })
      limit = plan.maxStaff
      break
    case 'users':
      current = await prisma.orgMember.count({ where: { organizationId: schoolId } })
      limit = plan.maxUsers
      break
  }

  // -1 means unlimited
  const allowed = limit === -1 || current < limit

  return { allowed, current, limit }
}

export { isModuleInPlan, isFeatureInPlan }
