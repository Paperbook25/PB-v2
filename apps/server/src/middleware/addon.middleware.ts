import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/db.js'
import { isModuleInPlan, type PlanTier } from '../config/plan-tiers.js'

// Cache addon status per school (5 min TTL)
const addonCache = new Map<string, { slugs: Set<string>; expiresAt: number }>()
const ADDON_CACHE_TTL = 5 * 60 * 1000

// Cache plan tier per school (5 min TTL)
const planCache = new Map<string, { tier: PlanTier; expiresAt: number }>()
const PLAN_CACHE_TTL = 5 * 60 * 1000

async function getSchoolPlanTier(schoolId: string): Promise<PlanTier> {
  const cached = planCache.get(schoolId)
  if (cached && cached.expiresAt > Date.now()) return cached.tier

  const profile = await prisma.schoolProfile.findFirst({
    where: { id: schoolId },
    select: { planTier: true },
  })
  const tier = (profile?.planTier || 'free') as PlanTier
  planCache.set(schoolId, { tier, expiresAt: Date.now() + PLAN_CACHE_TTL })
  return tier
}

async function getEnabledAddons(schoolId: string): Promise<Set<string>> {
  const cached = addonCache.get(schoolId)
  if (cached && cached.expiresAt > Date.now()) return cached.slugs

  const addons = await prisma.schoolAddon.findMany({
    where: { schoolId, enabled: true },
    include: { addon: { select: { slug: true } } },
  })
  const slugs = new Set(addons.map(a => a.addon.slug))
  addonCache.set(schoolId, { slugs, expiresAt: Date.now() + ADDON_CACHE_TTL })
  return slugs
}

/**
 * Middleware factory: checks if a specific addon is enabled for the current school.
 * Usage: router.use(requireAddon('library'))
 */
export function requireAddon(addonSlug: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.schoolId) {
      return next() // Let tenant middleware handle this
    }

    try {
      // Check plan tier first — module must be included in the school's plan
      const planTier = await getSchoolPlanTier(req.schoolId)
      if (!isModuleInPlan(planTier, addonSlug)) {
        return _res.status(403).json({
          error: 'Plan upgrade required',
          message: `The "${addonSlug}" module requires a higher plan. Current plan: ${planTier}.`,
          code: 'PLAN_UPGRADE_REQUIRED',
          currentPlan: planTier,
        })
      }

      // Then check if the addon is enabled by the school admin
      const enabled = await getEnabledAddons(req.schoolId)
      if (!enabled.has(addonSlug)) {
        return _res.status(403).json({
          error: 'Module not enabled',
          message: `The "${addonSlug}" module is not enabled for your school. Contact your administrator.`,
          code: 'ADDON_DISABLED',
        })
      }
      next()
    } catch {
      next() // Don't block on addon check failures
    }
  }
}

/** Clear addon cache for a school (call after toggle) */
export function clearAddonCache(schoolId: string) {
  addonCache.delete(schoolId)
}

/** Clear plan tier cache for a school (call after plan change) */
export function clearPlanCache(schoolId: string) {
  planCache.delete(schoolId)
}
