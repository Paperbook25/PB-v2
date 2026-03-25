import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const BASE = '/api/blog'
const PUBLIC_BASE = '/api/public/blog'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

// ==================== Types ====================

export interface BlogPost {
  id: string
  organizationId: string | null
  slug: string
  title: string
  excerpt: string | null
  body: string
  coverImage: string | null
  authorId: string | null
  authorName: string
  category: string | null
  tags: string[]
  status: 'draft' | 'published'
  publishedAt: string | null
  metaTitle: string | null
  metaDescription: string | null
  ogImage: string | null
  jsonLd: unknown | null
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface BlogPostListItem {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  authorName: string
  category: string | null
  tags: string[]
  publishedAt: string | null
  viewCount: number
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface BlogQuery {
  page?: number
  limit?: number
  status?: string
  category?: string
  search?: string
}

// ==================== Admin Hooks ====================

export function useBlogPosts(query: BlogQuery = {}) {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.status) params.set('status', query.status)
  if (query.category) params.set('category', query.category)
  if (query.search) params.set('search', query.search)
  const qs = params.toString()

  return useQuery<PaginatedResponse<BlogPost>>({
    queryKey: ['blog-posts', query],
    queryFn: () => apiFetch(`${BASE}${qs ? `?${qs}` : ''}`),
  })
}

export function useBlogPost(id: string | null) {
  return useQuery<{ data: BlogPost }>({
    queryKey: ['blog-post', id],
    queryFn: () => apiFetch(`${BASE}/${id}`),
    enabled: !!id,
    select: (res) => res,
  })
}

export function useCreateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string
      body: string
      excerpt?: string
      coverImage?: string
      category?: string
      tags?: string[]
      status?: 'draft' | 'published'
    }) => apiFetch<{ data: BlogPost }>(`${BASE}`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog-posts'] }),
  })
}

export function useUpdateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: string
      title?: string
      body?: string
      excerpt?: string | null
      coverImage?: string | null
      category?: string | null
      tags?: string[]
      status?: 'draft' | 'published'
      metaTitle?: string | null
      metaDescription?: string | null
      ogImage?: string | null
    }) => apiFetch<{ data: BlogPost }>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['blog-post'] })
    },
  })
}

export function usePublishBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ data: BlogPost }>(`${BASE}/${id}/publish`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['blog-post'] })
    },
  })
}

export function useUnpublishBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ data: BlogPost }>(`${BASE}/${id}/unpublish`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['blog-post'] })
    },
  })
}

export function useDeleteBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`${BASE}/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog-posts'] }),
  })
}

export function useBlogCategories() {
  return useQuery<{ data: string[] }>({
    queryKey: ['blog-categories'],
    queryFn: () => apiFetch(`${BASE}/categories`),
  })
}

// ==================== Public Hooks ====================

export function usePublicBlogPosts(query: { page?: number; limit?: number; category?: string } = {}) {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.category) params.set('category', query.category)
  const qs = params.toString()

  return useQuery<PaginatedResponse<BlogPostListItem>>({
    queryKey: ['public-blog-posts', query],
    queryFn: () => apiFetch(`${PUBLIC_BASE}${qs ? `?${qs}` : ''}`),
  })
}

export function usePublicBlogPost(slug: string) {
  return useQuery<{ data: BlogPost }>({
    queryKey: ['public-blog-post', slug],
    queryFn: () => apiFetch(`${PUBLIC_BASE}/${slug}`),
    enabled: !!slug,
  })
}
