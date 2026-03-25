import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  WebsitePage, WebsiteSection, WebsiteSettings, WebsiteMedia, SectionType,
} from '../types/school-website.types'

const BASE = '/api/school-website'

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

// ==================== Pages ====================

export function usePages() {
  return useQuery<WebsitePage[]>({
    queryKey: ['website-pages'],
    queryFn: () => apiFetch(`${BASE}/pages`),
  })
}

export function usePage(id: string | null) {
  return useQuery<WebsitePage>({
    queryKey: ['website-page', id],
    queryFn: () => apiFetch(`${BASE}/pages/${id}`),
    enabled: !!id,
  })
}

export function useCreatePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { slug: string; title: string; sortOrder?: number }) =>
      apiFetch(`${BASE}/pages`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website-pages'] }),
  })
}

export function useUpdatePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; slug?: string; title?: string; sortOrder?: number }) =>
      apiFetch(`${BASE}/pages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['website-pages'] })
      qc.invalidateQueries({ queryKey: ['website-page'] })
    },
  })
}

export function useDeletePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`${BASE}/pages/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website-pages'] }),
  })
}

export function usePublishPage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`${BASE}/pages/${id}/publish`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['website-pages'] })
      qc.invalidateQueries({ queryKey: ['website-page'] })
    },
  })
}

export function useUnpublishPage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`${BASE}/pages/${id}/unpublish`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['website-pages'] })
      qc.invalidateQueries({ queryKey: ['website-page'] })
    },
  })
}

// ==================== Sections ====================

export function useAddSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pageId, ...data }: { pageId: string; type: SectionType; title?: string; content?: Record<string, unknown> }) =>
      apiFetch(`${BASE}/pages/${pageId}/sections`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['website-pages'] })
      qc.invalidateQueries({ queryKey: ['website-page'] })
    },
  })
}

export function useUpdateSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; content?: Record<string, unknown>; isVisible?: boolean }) =>
      apiFetch(`${BASE}/sections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['website-pages'] })
      qc.invalidateQueries({ queryKey: ['website-page'] })
    },
  })
}

export function useDeleteSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`${BASE}/sections/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['website-pages'] })
      qc.invalidateQueries({ queryKey: ['website-page'] })
    },
  })
}

export function useReorderSections() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pageId, sections }: { pageId: string; sections: Array<{ id: string; sortOrder: number }> }) =>
      apiFetch(`${BASE}/pages/${pageId}/sections/reorder`, { method: 'PUT', body: JSON.stringify({ sections }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['website-pages'] })
      qc.invalidateQueries({ queryKey: ['website-page'] })
    },
  })
}

// ==================== Settings ====================

export function useWebsiteSettings() {
  return useQuery<WebsiteSettings>({
    queryKey: ['website-settings'],
    queryFn: () => apiFetch(`${BASE}/settings`),
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<WebsiteSettings>) =>
      apiFetch(`${BASE}/settings`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website-settings'] }),
  })
}

// ==================== Media ====================

export function useMediaLibrary() {
  return useQuery<WebsiteMedia[]>({
    queryKey: ['website-media'],
    queryFn: () => apiFetch(`${BASE}/media`),
  })
}

export function useUploadMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { fileName: string; url: string; mimeType?: string; fileSize?: number; altText?: string }) =>
      apiFetch(`${BASE}/media`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website-media'] }),
  })
}

export function useUploadMediaFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { fileName: string; data: string; mimeType: string; altText?: string }) =>
      apiFetch(`${BASE}/media/upload`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website-media'] }),
  })
}

export function useDeleteMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`${BASE}/media/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website-media'] }),
  })
}

// ==================== Public API ====================

export function usePublicPage(slug: string) {
  return useQuery<WebsitePage>({
    queryKey: ['public-website-page', slug],
    queryFn: () => apiFetch(`/api/public/school-website/pages/${slug}`),
    enabled: !!slug,
  })
}

export function usePublicPages() {
  return useQuery<Array<{ id: string; slug: string; title: string; sortOrder: number }>>({
    queryKey: ['public-website-pages'],
    queryFn: () => apiFetch('/api/public/school-website/pages'),
  })
}

export function usePublicSettings() {
  return useQuery<Partial<WebsiteSettings>>({
    queryKey: ['public-website-settings'],
    queryFn: () => apiFetch('/api/public/school-website/settings'),
  })
}
