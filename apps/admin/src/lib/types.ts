// ─── Core Entity Types ───────────────────────────────────────────────

export interface School {
  id: string
  name: string
  slug: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo: string | null
  principalName: string | null
  establishedYear: number | null
  affiliationNumber: string | null
  affiliationBoard: string | null
  status: 'active' | 'suspended' | 'trial' | 'churned'
  planTier: 'free' | 'starter' | 'professional' | 'enterprise'
  maxUsers: number
  maxStudents: number
  trialEndsAt: string | null
  suspendedAt: string | null
  suspendReason: string | null
  onboardedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  addonCount?: number
}

export interface SchoolDetail extends School {
  stats: { userCount: number; studentCount: number; addonCount: number }
  addons: { slug: string; name: string }[]
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  avatar: string | null
  isActive: boolean
  createdAt: string
}

export interface Addon {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  category: string | null
  isCore: boolean
  enabled?: boolean
  enabledAt?: string | null
  enabledBy?: string | null
  schoolCount?: number
}

// ─── API Response Types ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export interface DashboardStats {
  totalSchools: number
  activeSchools: number
  totalUsers: number
  totalStudents: number
  schoolsTrend?: number
  usersTrend?: number
  activeTrend?: number
  monthlyGrowth?: number
  growthTrend?: number
}

export interface GrowthData {
  month: string
  schools: number
  users: number
}

export interface AddonPopularity {
  name: string
  slug: string
  schoolCount: number
  percentage: number
}

export interface ActivityItem {
  id: string
  action: string
  module: string
  entityType: string
  entityName: string | null
  description: string | null
  userName: string
  createdAt: string
}

// ─── Mutation Payloads ───────────────────────────────────────────────

export interface CreateSchoolPayload {
  name: string
  slug?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  email?: string
  website?: string
  principalName?: string
  establishedYear?: number
  affiliationNumber?: string
  affiliationBoard?: string
  planTier?: School['planTier']
  maxUsers?: number
  maxStudents?: number
  notes?: string
  // Admin user for the school
  adminName: string
  adminEmail: string
  adminPassword: string
}

export interface UpdateSchoolPayload extends Partial<CreateSchoolPayload> {
  status?: School['status']
}

export interface UpdateAddonPayload {
  name?: string
  description?: string
  icon?: string
  category?: string
  isCore?: boolean
}

// ─── Addon Usage ─────────────────────────────────────────────────────

export interface AddonUsage {
  addon: Addon
  schools: { id: string; name: string; enabledAt: string }[]
}

// ─── Impersonation ───────────────────────────────────────────────────

export interface ImpersonateResponse {
  url: string
  token: string
}

// ─── Generic message response ────────────────────────────────────────

export interface MessageResponse {
  message: string
}
