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
  updateUserRole: (id: string, role: string) => adminFetch<any>(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  deleteUser: (id: string) => adminFetch<any>(`/users/${id}`, { method: 'DELETE' }),

  // Audit
  getAuditLog: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return adminFetch<PaginatedResponse<ActivityItem>>(`/audit${qs}`)
  },

  // Subscriptions
  listSubscriptions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return adminFetch<any>(`/subscriptions${qs}`)
  },
  getSubscription: (id: string) => adminFetch<any>(`/subscriptions/${id}`).then((r: any) => r.data),
  createSubscription: (data: any) => adminFetch<any>('/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
  updateSubscription: (id: string, data: any) => adminFetch<any>(`/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelSubscription: (id: string, reason?: string) => adminFetch<any>(`/subscriptions/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  getSubscriptionAnalytics: () => adminFetch<any>('/subscriptions/analytics').then((r: any) => r.data),
  getExpiringTrials: (days?: number) => adminFetch<any>(`/subscriptions/trials?days=${days || 14}`).then((r: any) => r.data),

  // Billing
  listInvoices: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return adminFetch<any>(`/billing/invoices${qs}`)
  },
  getInvoice: (id: string) => adminFetch<any>(`/billing/invoices/${id}`).then((r: any) => r.data),
  createInvoice: (data: any) => adminFetch<any>('/billing/invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateInvoice: (id: string, data: any) => adminFetch<any>(`/billing/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  sendInvoice: (id: string) => adminFetch<any>(`/billing/invoices/${id}/send`, { method: 'PATCH' }),
  cancelInvoice: (id: string) => adminFetch<any>(`/billing/invoices/${id}/cancel`, { method: 'PATCH' }),
  recordPayment: (invoiceId: string, data: any) => adminFetch<any>(`/billing/invoices/${invoiceId}/payment`, { method: 'POST', body: JSON.stringify(data) }),
  getRevenueSummary: () => adminFetch<any>('/billing/revenue').then((r: any) => r.data),
  listPayments: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return adminFetch<any>(`/billing/payments${qs}`)
  },
  generateInvoices: () => adminFetch<any>('/billing/generate-invoices', { method: 'POST' }),

  // Leads (CRM)
  listLeads: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return adminFetch<any>(`/leads${qs}`)
  },
  getLeadPipeline: () => adminFetch<any>('/leads/pipeline').then((r: any) => r.data),
  getLead: (id: string) => adminFetch<any>(`/leads/${id}`).then((r: any) => r.data),
  createLead: (data: any) => adminFetch<any>('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id: string, data: any) => adminFetch<any>(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateLeadStatus: (id: string, status: string) => adminFetch<any>(`/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  addLeadActivity: (id: string, data: any) => adminFetch<any>(`/leads/${id}/activities`, { method: 'POST', body: JSON.stringify(data) }),
  deleteLead: (id: string) => adminFetch<any>(`/leads/${id}`, { method: 'DELETE' }),

  // Announcements
  listAnnouncements: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return adminFetch<any>(`/announcements${qs}`)
  },
  getAnnouncement: (id: string) => adminFetch<any>(`/announcements/${id}`).then((r: any) => r.data),
  createAnnouncement: (data: any) => adminFetch<any>('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  updateAnnouncement: (id: string, data: any) => adminFetch<any>(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  sendAnnouncement: (id: string) => adminFetch<any>(`/announcements/${id}/send`, { method: 'POST' }),
  deleteAnnouncement: (id: string) => adminFetch<any>(`/announcements/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalyticsOverview: () => adminFetch<any>('/analytics/overview').then((r: any) => r.data),
  getFeatureAdoption: () => adminFetch<any>('/analytics/feature-adoption').then((r: any) => r.data),
  getBenchmarks: () => adminFetch<any>('/analytics/benchmarks').then((r: any) => r.data),
  getAnalyticsTrends: () => adminFetch<any>('/analytics/trends').then((r: any) => r.data),
  getCohortAnalysis: () => adminFetch<any>('/analytics/cohort').then((r: any) => r.data),
  getFunnelAnalysis: () => adminFetch<any>('/analytics/funnel').then((r: any) => r.data),
  getLtvAnalysis: () => adminFetch<any>('/analytics/ltv').then((r: any) => r.data),

  // Usage Tracking
  getUsageOverview: () => adminFetch<any>('/usage/overview').then((r: any) => r.data),
  getSchoolUsage: () => adminFetch<any>('/usage/schools').then((r: any) => r.data),
  getSchoolUsageDetail: (id: string) => adminFetch<any>(`/usage/schools/${id}`).then((r: any) => r.data),

  // System Health
  getHealthStatus: () => adminFetch<any>('/health/status').then((r: any) => r.data),
  getHealthMetrics: (period?: string) => adminFetch<any>(`/health/metrics${period ? `?period=${period}` : ''}`).then((r: any) => r.data),
  getHealthAlerts: () => adminFetch<any>('/health/alerts').then((r: any) => r.data),
  resolveAlert: (id: string) => adminFetch<any>(`/health/alerts/${id}/resolve`, { method: 'PATCH' }),
  createAlert: (data: any) => adminFetch<any>('/health/alerts', { method: 'POST', body: JSON.stringify(data) }),

  // Security
  listGravityAdmins: () => adminFetch<any>('/security/admins').then((r: any) => r.data),
  createGravityAdmin: (data: any) => adminFetch<any>('/security/admins', { method: 'POST', body: JSON.stringify(data) }),
  updateGravityAdmin: (id: string, data: any) => adminFetch<any>(`/security/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeGravityAdmin: (id: string) => adminFetch<any>(`/security/admins/${id}`, { method: 'DELETE' }),
  getComplianceStatus: () => adminFetch<any>('/security/compliance').then((r: any) => r.data),
  getLoginHistory: () => adminFetch<any>('/security/login-history').then((r: any) => r.data),

  // Support Tickets
  getTicketStats: () => adminFetch<any>('/tickets/stats').then((r: any) => r.data),
  listTickets: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return adminFetch<any>(`/tickets${qs}`)
  },
  getTicket: (id: string) => adminFetch<any>(`/tickets/${id}`).then((r: any) => r.data),
  createTicket: (data: any) => adminFetch<any>('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  updateTicket: (id: string, data: any) => adminFetch<any>(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  addTicketResponse: (id: string, data: any) => adminFetch<any>(`/tickets/${id}/responses`, { method: 'POST', body: JSON.stringify(data) }),

  // Credit Notes
  listCreditNotes: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return adminFetch<any>(`/credit-notes${qs}`)
  },
  createCreditNote: (data: any) => adminFetch<any>('/credit-notes', { method: 'POST', body: JSON.stringify(data) }),
  issueCreditNote: (id: string) => adminFetch<any>(`/credit-notes/${id}/issue`, { method: 'PATCH' }),
  applyCreditNote: (id: string) => adminFetch<any>(`/credit-notes/${id}/apply`, { method: 'PATCH' }),
  cancelCreditNote: (id: string) => adminFetch<any>(`/credit-notes/${id}/cancel`, { method: 'PATCH' }),

  // Communication Log
  listCommunicationLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return adminFetch<any>(`/communication-log${qs}`)
  },
  logCommunication: (data: any) => adminFetch<any>('/communication-log', { method: 'POST', body: JSON.stringify(data) }),

  // Feature Usage
  backfillFeatureUsage: () => adminFetch<any>('/feature-usage/backfill', { method: 'POST' }),

  // Addons - Create & Delete
  createAddon: (data: any) => adminFetch<any>('/addons', { method: 'POST', body: JSON.stringify(data) }),
  deleteAddon: (id: string) => adminFetch<any>(`/addons/${id}`, { method: 'DELETE' }),

  // Dashboard Widgets
  listWidgets: () => adminFetch<any>('/dashboard-widgets').then((r: any) => Array.isArray(r) ? r : r.data || []),
  createWidget: (data: any) => adminFetch<any>('/dashboard-widgets', { method: 'POST', body: JSON.stringify(data) }),
  updateWidget: (id: string, data: any) => adminFetch<any>(`/dashboard-widgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWidget: (id: string) => adminFetch<any>(`/dashboard-widgets/${id}`, { method: 'DELETE' }),
  reorderWidgets: (widgetIds: string[]) => adminFetch<any>('/dashboard-widgets/reorder', { method: 'POST', body: JSON.stringify({ widgetIds }) }),
}
