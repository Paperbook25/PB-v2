import type {
  School,
  SchoolDetail,
  AdminUser,
  Addon,
  PaginatedResponse,
  DashboardStats,
  GrowthData,
  AddonPopularity,
  ActivityItem,
  AddonUsage,
  ImpersonateResponse,
  MessageResponse,
  CreateSchoolPayload,
  UpdateSchoolPayload,
  UpdateAddonPayload,
} from './types'

const API_BASE = '/api/admin'

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const adminApi = {
  // Dashboard — server wraps responses in { data }, so unwrap here
  getStats: () => adminFetch<{ data: DashboardStats }>('/dashboard/stats').then(r => r.data),
  getGrowth: () => adminFetch<{ data: GrowthData[] }>('/dashboard/growth').then(r => r.data),
  getAddonPopularity: () => adminFetch<{ data: AddonPopularity[] }>('/dashboard/addons').then(r => r.data),
  getActivity: () => adminFetch<{ data: ActivityItem[] }>('/dashboard/activity').then(r => r.data),

  // Schools
  listSchools: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return adminFetch<PaginatedResponse<School>>(`/schools${qs}`)
  },
  getSchool: (id: string) => adminFetch<SchoolDetail>(`/schools/${id}`),
  createSchool: (data: CreateSchoolPayload) => adminFetch<School>('/schools', { method: 'POST', body: JSON.stringify(data) }),
  updateSchool: (id: string, data: UpdateSchoolPayload) => adminFetch<School>(`/schools/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  suspendSchool: (id: string) => adminFetch<MessageResponse>(`/schools/${id}/suspend`, { method: 'PATCH' }),
  activateSchool: (id: string) => adminFetch<MessageResponse>(`/schools/${id}/activate`, { method: 'PATCH' }),
  deleteSchool: (id: string) => adminFetch<MessageResponse>(`/schools/${id}`, { method: 'DELETE' }),
  getSchoolUsers: (id: string) => adminFetch<{ data: AdminUser[] }>(`/schools/${id}/users`).then(r => r.data),
  getSchoolAddons: (id: string) => adminFetch<{ data: Addon[] }>(`/schools/${id}/addons`).then(r => r.data),
  toggleSchoolAddon: (id: string, slug: string) => adminFetch<MessageResponse>(`/schools/${id}/addons/${slug}`, { method: 'PATCH' }),

  // Addons
  listAddons: () => adminFetch<{ data: Addon[] }>('/addons').then(r => r.data),
  updateAddon: (id: string, data: UpdateAddonPayload) => adminFetch<Addon>(`/addons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAddonUsage: (id: string) => adminFetch<AddonUsage>(`/addons/${id}/usage`),

  // Users
  listUsers: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return adminFetch<PaginatedResponse<AdminUser>>(`/users${qs}`)
  },
  getUser: (id: string) => adminFetch<AdminUser>(`/users/${id}`),
  banUser: (id: string) => adminFetch<MessageResponse>(`/users/${id}/ban`, { method: 'PATCH' }),
  unbanUser: (id: string) => adminFetch<MessageResponse>(`/users/${id}/unban`, { method: 'PATCH' }),
  impersonate: (userId: string) => adminFetch<ImpersonateResponse>('/impersonate', { method: 'POST', body: JSON.stringify({ userId }) }),

  // Audit
  getAuditLog: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return adminFetch<PaginatedResponse<ActivityItem>>(`/audit${qs}`)
  },
}
