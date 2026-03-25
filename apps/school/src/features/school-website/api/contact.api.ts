import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const BASE = '/api/contact'

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

export interface ContactSubmission {
  id: string
  organizationId: string | null
  name: string
  email: string
  phone: string | null
  message: string
  source: string
  pageSlug: string | null
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ContactStats {
  total: number
  byStatus: Record<string, number>
  bySource: Record<string, number>
}

export interface ContactListQuery {
  page?: number
  limit?: number
  status?: string
  source?: string
  search?: string
}

export interface ContactListResult {
  data: ContactSubmission[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ==================== Hooks ====================

export function useContactSubmissions(query: ContactListQuery = {}) {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.status) params.set('status', query.status)
  if (query.source) params.set('source', query.source)
  if (query.search) params.set('search', query.search)
  const qs = params.toString()

  return useQuery<ContactListResult>({
    queryKey: ['contact-submissions', query],
    queryFn: () => apiFetch(`${BASE}${qs ? `?${qs}` : ''}`),
  })
}

export function useContactStats() {
  return useQuery<ContactStats>({
    queryKey: ['contact-stats'],
    queryFn: () => apiFetch(`${BASE}/stats`),
  })
}

export function useUpdateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status?: string; notes?: string }) =>
      apiFetch(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact-submissions'] })
      qc.invalidateQueries({ queryKey: ['contact-stats'] })
    },
  })
}
