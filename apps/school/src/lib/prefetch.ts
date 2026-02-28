import { QueryClient } from '@tanstack/react-query'
import { apiGet } from './api-client'

// Singleton query client instance for prefetching
let queryClient: QueryClient | null = null

export function setQueryClient(client: QueryClient) {
  queryClient = client
}

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    throw new Error('QueryClient not initialized. Call setQueryClient first.')
  }
  return queryClient
}

// Student prefetching
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...studentKeys.lists(), filters] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
}

export async function prefetchStudent(id: string) {
  const client = getQueryClient()
  await client.prefetchQuery({
    queryKey: studentKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/students/${id}`)
      const json = await res.json()
      return json.data
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Staff prefetching
export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...staffKeys.lists(), filters] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
}

export async function prefetchStaff(id: string) {
  const client = getQueryClient()
  await client.prefetchQuery({
    queryKey: staffKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/staff/${id}`)
      const json = await res.json()
      return json.data
    },
    staleTime: 15 * 60 * 1000,
  })
}

// Course prefetching
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
}

export async function prefetchCourse(id: string) {
  const client = getQueryClient()
  await client.prefetchQuery({
    queryKey: courseKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/lms/courses/${id}`)
      const json = await res.json()
      return json.data
    },
    staleTime: 15 * 60 * 1000,
  })
}

// Dashboard data prefetching
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  feeCollection: () => [...dashboardKeys.all, 'fee-collection'] as const,
  attendance: () => [...dashboardKeys.all, 'attendance'] as const,
  quickStats: () => [...dashboardKeys.all, 'quick-stats'] as const,
}

export async function prefetchDashboardData() {
  const client = getQueryClient()

  // Prefetch all dashboard data in parallel
  await Promise.all([
    client.prefetchQuery({
      queryKey: dashboardKeys.stats(),
      queryFn: async () => {
        const json = await apiGet<{ data: any }>('/api/dashboard/stats')
        return json.data
      },
      staleTime: 15 * 60 * 1000,
    }),
    client.prefetchQuery({
      queryKey: dashboardKeys.quickStats(),
      queryFn: async () => {
        const json = await apiGet<{ data: any }>('/api/dashboard/quick-stats')
        return json.data
      },
      staleTime: 15 * 60 * 1000,
    }),
  ])
}
