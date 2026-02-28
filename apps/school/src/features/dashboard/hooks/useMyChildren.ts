import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api-client'

export interface Child {
  id: string
  name: string
  class: string
  section: string
  rollNumber: number
  avatar: string
  attendance: {
    percentage: number
    presentDays: number
    absentDays: number
    totalDays: number
  }
  pendingFees: number
  libraryBooks: number
}

async function fetchMyChildren(): Promise<{ data: Child[] }> {
  return apiGet('/api/users/my-children')
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
  myChildren: () => [...dashboardKeys.all, 'my-children'] as const,
}

export function useMyChildren() {
  return useQuery({
    queryKey: dashboardKeys.myChildren(),
    queryFn: fetchMyChildren,
  })
}
