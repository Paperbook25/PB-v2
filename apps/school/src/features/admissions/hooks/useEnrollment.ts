import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { enrollStudent, getNextRollNumber } from '../api/enrollment.api'
import type { EnrollStudentRequest } from '../types/enrollment.types'
import { admissionsKeys } from './useAdmissions'

// Query keys
export const enrollmentKeys = {
  all: ['enrollment'] as const,
  nextRollNumber: (className: string, section: string) =>
    [...enrollmentKeys.all, 'nextRollNumber', className, section] as const,
}

// Fetch next roll number
export function useNextRollNumber(className: string, section: string) {
  return useQuery({
    queryKey: enrollmentKeys.nextRollNumber(className, section),
    queryFn: () => getNextRollNumber(className, section),
    enabled: !!className && !!section,
  })
}

// Enroll student mutation
export function useEnrollStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EnrollStudentRequest) => enrollStudent(data),
    onSuccess: (_, variables) => {
      // Invalidate application queries
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(variables.applicationId) })
      queryClient.invalidateQueries({ queryKey: admissionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: admissionsKeys.stats() })
      // Invalidate students list
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
