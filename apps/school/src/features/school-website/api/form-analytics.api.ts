import { useQuery } from '@tanstack/react-query'

const BASE = '/api/form-analytics'

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const json = await res.json()
  return json.data ?? json
}

// ==================== Types ====================

export interface FormStats {
  totalStarts: number
  totalCompletes: number
  totalAbandoned: number
  completionRate: number
  mostAbandonedField: string | null
  uniqueSessions: number
}

export interface FieldDropoff {
  fieldName: string
  starts: number
  completes: number
  completionRate: number
  dropoffRate: number
}

export interface FunnelStep {
  step: string
  count: number
  percentage: number
}

export interface FormTrendPoint {
  date: string
  submissions: number
}

// ==================== Hooks ====================

export function useFormStats(formType = 'contact', dateRange?: { startDate?: string; endDate?: string }) {
  const params = new URLSearchParams()
  params.set('formType', formType)
  if (dateRange?.startDate) params.set('startDate', dateRange.startDate)
  if (dateRange?.endDate) params.set('endDate', dateRange.endDate)

  return useQuery<FormStats>({
    queryKey: ['form-analytics-stats', formType, dateRange],
    queryFn: () => apiFetch(`${BASE}/stats?${params}`),
  })
}

export function useConversionFunnel(dateRange?: { startDate?: string; endDate?: string }) {
  const params = new URLSearchParams()
  if (dateRange?.startDate) params.set('startDate', dateRange.startDate)
  if (dateRange?.endDate) params.set('endDate', dateRange.endDate)
  const qs = params.toString()

  return useQuery<{ funnel: FunnelStep[] }>({
    queryKey: ['form-analytics-funnel', dateRange],
    queryFn: () => apiFetch(`${BASE}/funnel${qs ? `?${qs}` : ''}`),
  })
}

export function useFieldDropoffs(formType = 'contact', dateRange?: { startDate?: string; endDate?: string }) {
  const params = new URLSearchParams()
  params.set('formType', formType)
  if (dateRange?.startDate) params.set('startDate', dateRange.startDate)
  if (dateRange?.endDate) params.set('endDate', dateRange.endDate)

  return useQuery<{ fields: FieldDropoff[] }>({
    queryKey: ['form-analytics-dropoffs', formType, dateRange],
    queryFn: () => apiFetch(`${BASE}/dropoffs?${params}`),
  })
}

export function useFormTrends(formType = 'contact', dateRange?: { startDate?: string; endDate?: string }) {
  const params = new URLSearchParams()
  params.set('formType', formType)
  if (dateRange?.startDate) params.set('startDate', dateRange.startDate)
  if (dateRange?.endDate) params.set('endDate', dateRange.endDate)

  return useQuery<{ trend: FormTrendPoint[] }>({
    queryKey: ['form-analytics-trends', formType, dateRange],
    queryFn: () => apiFetch(`${BASE}/trends?${params}`),
  })
}
