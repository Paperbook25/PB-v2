const API_BASE = '/api/subscription'

function fetchWithAuth(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, { ...options, credentials: 'include' })
}

export interface PlanConfig {
  id: string
  name: string
  maxStudents: number
  maxStaff: number
  maxUsers: number
  modules: string[]
  features: string[]
  price: { monthly: number; annual: number }
}

export interface AddonCharge {
  slug: string
  name: string
  monthlyPrice: number
  billingStatus: 'free' | 'trial' | 'active' | 'inactive'
  trialEndsAt: string | null
  billingStartedAt: string | null
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

export interface UpgradeResult {
  success: boolean
  plan: PlanConfig
  autoEnabledModules: string[]
}

export async function fetchCurrentPlan(): Promise<{ data: SubscriptionInfo }> {
  const response = await fetchWithAuth(`${API_BASE}/current`)
  if (!response.ok) throw new Error('Failed to fetch current plan')
  return response.json()
}

export async function fetchAvailablePlans(): Promise<{ data: PlanConfig[] }> {
  const response = await fetchWithAuth(`${API_BASE}/plans`)
  if (!response.ok) throw new Error('Failed to fetch available plans')
  return response.json()
}

export async function upgradePlan(tier: string): Promise<{ data: UpgradeResult }> {
  const response = await fetchWithAuth(`${API_BASE}/upgrade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upgrade plan')
  }
  return response.json()
}

export async function fetchPlanLimits(
  resource: 'students' | 'staff' | 'users'
): Promise<{ data: { allowed: boolean; current: number; limit: number } }> {
  const response = await fetchWithAuth(`${API_BASE}/limits?resource=${resource}`)
  if (!response.ok) throw new Error('Failed to check plan limits')
  return response.json()
}
