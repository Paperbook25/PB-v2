export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise'

export interface PlanConfig {
  id: PlanTier
  name: string
  maxStudents: number
  maxStaff: number
  maxUsers: number
  modules: string[] // addon slugs included in this plan
  features: string[] // feature flags
  price: { monthly: number; annual: number } // in INR
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    maxStudents: 50,
    maxStaff: 10,
    maxUsers: 15,
    modules: ['school-website'],
    features: ['basic_reports', 'email_notifications'],
    price: { monthly: 0, annual: 0 },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    maxStudents: 500,
    maxStaff: 50,
    maxUsers: 100,
    modules: [
      'school-website', 'library', 'transport', 'documents',
      'visitors', 'complaints',
    ],
    features: [
      'basic_reports', 'email_notifications', 'sms_notifications',
      'custom_domain',
    ],
    price: { monthly: 2999, annual: 29990 },
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    maxStudents: 2000,
    maxStaff: 200,
    maxUsers: 500,
    modules: [
      'school-website', 'library', 'transport', 'documents',
      'visitors', 'complaints', 'lms', 'hostel', 'operations', 'behavior',
      'exams', 'alumni', 'clubs', 'scholarships',
    ],
    features: [
      'advanced_reports', 'email_notifications', 'sms_notifications',
      'custom_domain', 'api_access', 'whatsapp_integration',
      'ai_chatbot', 'email_campaigns',
    ],
    price: { monthly: 7999, annual: 79990 },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    maxStudents: -1, // unlimited
    maxStaff: -1,
    maxUsers: -1,
    modules: ['*'], // all modules
    features: ['*'], // all features
    price: { monthly: 14999, annual: 149990 },
  },
}

/** All known module slugs (union of all plan modules across all tiers). */
const ALL_MODULE_SLUGS = [
  ...new Set(
    Object.values(PLAN_CONFIGS)
      .flatMap(c => c.modules)
      .filter(m => m !== '*')
  ),
]

/**
 * Returns the list of module slugs available for a given plan tier.
 * Enterprise returns all known modules.
 */
export function getModulesForPlan(tier: PlanTier): string[] {
  const config = PLAN_CONFIGS[tier]
  if (config.modules.includes('*')) {
    return [...ALL_MODULE_SLUGS]
  }
  return config.modules
}

/** Check if a specific module slug is included in a plan tier. */
export function isModuleInPlan(tier: PlanTier, moduleSlug: string): boolean {
  const config = PLAN_CONFIGS[tier]
  return config.modules.includes('*') || config.modules.includes(moduleSlug)
}

/** Check if a specific feature flag is included in a plan tier. */
export function isFeatureInPlan(tier: PlanTier, feature: string): boolean {
  const config = PLAN_CONFIGS[tier]
  return config.features.includes('*') || config.features.includes(feature)
}

/** Get the plan config for a given tier, defaulting to 'free' for unknown values. */
export function getPlanConfig(tier: string): PlanConfig {
  if (tier in PLAN_CONFIGS) {
    return PLAN_CONFIGS[tier as PlanTier]
  }
  return PLAN_CONFIGS.free
}
