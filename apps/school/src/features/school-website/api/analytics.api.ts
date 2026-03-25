import { useQuery } from '@tanstack/react-query'

const BASE = '/api/school-website'

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const json = await res.json()
  return json.data ?? json
}

// ==================== Analytics ====================

export interface AnalyticsSummary {
  views7d: number
  views30d: number
  avgDailyViews: number
  topPage: string | null
  topPages: Array<{ pageSlug: string; views: number; percentage: number }>
  trend: Array<{ date: string; views: number }>
}

export interface AnalyticsRecord {
  id: string
  organizationId: string
  date: string
  pageSlug: string
  views: number
  uniqueIps: number
}

export interface AnalyticsQuery {
  startDate?: string
  endDate?: string
  pageSlug?: string
}

export function useAnalyticsSummary() {
  return useQuery<AnalyticsSummary>({
    queryKey: ['website-analytics-summary'],
    queryFn: () => apiFetch(`${BASE}/analytics/summary`),
  })
}

export function useAnalytics(query: AnalyticsQuery = {}) {
  const params = new URLSearchParams()
  if (query.startDate) params.set('startDate', query.startDate)
  if (query.endDate) params.set('endDate', query.endDate)
  if (query.pageSlug) params.set('pageSlug', query.pageSlug)
  const qs = params.toString()

  return useQuery<{ data: AnalyticsRecord[] }>({
    queryKey: ['website-analytics', query],
    queryFn: () => apiFetch(`${BASE}/analytics${qs ? `?${qs}` : ''}`),
  })
}
