import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const BASE = '/api/email-campaigns'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const json = await res.json()
  return json.data ?? json
}

// ==================== Types ====================

export interface EmailCampaign {
  id: string
  organizationId: string | null
  name: string
  description: string | null
  trigger: string
  status: string
  targetAudience: string
  createdAt: string
  updatedAt: string
  stepsCount?: number
  logsCount?: number
  stats?: Record<string, number>
  steps?: EmailCampaignStep[]
}

export interface EmailCampaignStep {
  id: string
  campaignId: string
  sortOrder: number
  delayDays: number
  subject: string
  body: string
  createdAt: string
}

export interface CampaignListQuery {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export interface CampaignListResult {
  data: EmailCampaign[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CampaignStats {
  pending: number
  sent: number
  failed: number
  opened: number
  clicked: number
  total: number
}

// ==================== Hooks ====================

export function useCampaigns(query: CampaignListQuery = {}) {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.status) params.set('status', query.status)
  if (query.search) params.set('search', query.search)
  const qs = params.toString()

  return useQuery<CampaignListResult>({
    queryKey: ['email-campaigns', query],
    queryFn: () => apiFetch(`${BASE}${qs ? `?${qs}` : ''}`),
  })
}

export function useCampaign(id: string | null) {
  return useQuery<EmailCampaign>({
    queryKey: ['email-campaign', id],
    queryFn: () => apiFetch(`${BASE}/${id}`),
    enabled: !!id,
  })
}

export function useCampaignStats(id: string | null) {
  return useQuery<CampaignStats>({
    queryKey: ['email-campaign-stats', id],
    queryFn: () => apiFetch(`${BASE}/${id}/stats`),
    enabled: !!id,
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description?: string; trigger?: string; targetAudience?: string }) =>
      apiFetch(`${BASE}`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-campaigns'] })
    },
  })
}

export function useUpdateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string; trigger?: string; targetAudience?: string }) =>
      apiFetch(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-campaigns'] })
      qc.invalidateQueries({ queryKey: ['email-campaign'] })
    },
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`${BASE}/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-campaigns'] })
    },
  })
}

export function useActivateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`${BASE}/${id}/activate`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-campaigns'] })
      qc.invalidateQueries({ queryKey: ['email-campaign'] })
    },
  })
}

export function usePauseCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`${BASE}/${id}/pause`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-campaigns'] })
      qc.invalidateQueries({ queryKey: ['email-campaign'] })
    },
  })
}

export function useExecuteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ sent: number; failed: number; total: number }>(`${BASE}/${id}/execute`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-campaigns'] })
      qc.invalidateQueries({ queryKey: ['email-campaign'] })
      qc.invalidateQueries({ queryKey: ['email-campaign-stats'] })
    },
  })
}

export function useAddStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ campaignId, ...data }: { campaignId: string; subject: string; body: string; delayDays?: number }) =>
      apiFetch(`${BASE}/${campaignId}/steps`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-campaign'] })
      qc.invalidateQueries({ queryKey: ['email-campaigns'] })
    },
  })
}

export function useUpdateStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ stepId, ...data }: { stepId: string; subject?: string; body?: string; delayDays?: number }) =>
      apiFetch(`${BASE}/steps/${stepId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-campaign'] })
    },
  })
}

export function useDeleteStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (stepId: string) =>
      apiFetch(`${BASE}/steps/${stepId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-campaign'] })
      qc.invalidateQueries({ queryKey: ['email-campaigns'] })
    },
  })
}
