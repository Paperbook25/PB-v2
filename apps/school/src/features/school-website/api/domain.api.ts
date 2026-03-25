import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const BASE = '/api/domains'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }
  const json = await res.json()
  return json.data ?? json
}

export interface DomainMapping {
  id: string
  organizationId: string
  domain: string
  isVerified: boolean
  verifyToken: string
  verifiedAt: string | null
  sslStatus: string
  createdAt: string
  updatedAt: string
}

export interface VerifyResult {
  verified: boolean
  message: string
}

export function useDomains() {
  return useQuery<DomainMapping[]>({
    queryKey: ['domains'],
    queryFn: () => apiFetch(`${BASE}`),
  })
}

export function useAddDomain() {
  const qc = useQueryClient()
  return useMutation<DomainMapping, Error, { domain: string }>({
    mutationFn: (data) =>
      apiFetch(`${BASE}`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  })
}

export function useVerifyDomain() {
  const qc = useQueryClient()
  return useMutation<VerifyResult, Error, string>({
    mutationFn: (id) =>
      apiFetch(`${BASE}/${id}/verify`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  })
}

export function useDeleteDomain() {
  const qc = useQueryClient()
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id) =>
      apiFetch(`${BASE}/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  })
}
