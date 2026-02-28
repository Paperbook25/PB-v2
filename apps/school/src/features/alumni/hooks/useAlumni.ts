import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/alumni.api'
import type {
  AlumniFilters,
  AchievementFilters,
  ContributionFilters,
  EventFilters,
  CreateAlumniPayload,
  UpdateAlumniPayload,
  CreateAchievementPayload,
  CreateContributionPayload,
  CreateEventPayload,
  ContributionStatus,
  EventStatus,
  AlumniEvent,
  AlumniAchievement,
} from '../types/alumni.types'
import type { GraduateStudentPayload, BatchGraduationPayload } from '../api/alumni.api'

// Query keys
export const alumniKeys = {
  all: ['alumni'] as const,
  stats: () => [...alumniKeys.all, 'stats'] as const,
  batchStats: () => [...alumniKeys.all, 'batch-stats'] as const,
  lists: () => [...alumniKeys.all, 'list'] as const,
  list: (filters?: AlumniFilters & { page?: number; limit?: number }) =>
    [...alumniKeys.lists(), filters] as const,
  details: () => [...alumniKeys.all, 'detail'] as const,
  detail: (id: string) => [...alumniKeys.details(), id] as const,
  achievements: () => [...alumniKeys.all, 'achievements'] as const,
  achievementsList: (filters?: AchievementFilters) =>
    [...alumniKeys.achievements(), 'list', filters] as const,
  contributions: () => [...alumniKeys.all, 'contributions'] as const,
  contributionsList: (filters?: ContributionFilters) =>
    [...alumniKeys.contributions(), 'list', filters] as const,
  events: () => [...alumniKeys.all, 'events'] as const,
  eventsList: (filters?: EventFilters) => [...alumniKeys.events(), 'list', filters] as const,
  eventDetail: (id: string) => [...alumniKeys.events(), 'detail', id] as const,
  eventRegistrations: (eventId: string) =>
    [...alumniKeys.events(), 'registrations', eventId] as const,
  eligibleForGraduation: () => [...alumniKeys.all, 'eligible-for-graduation'] as const,
}

// Stats hooks
export function useAlumniStats() {
  return useQuery({
    queryKey: alumniKeys.stats(),
    queryFn: api.getAlumniStats,
  })
}

export function useBatchStats() {
  return useQuery({
    queryKey: alumniKeys.batchStats(),
    queryFn: api.getBatchStats,
  })
}

// Alumni CRUD hooks
export function useAlumni(filters?: AlumniFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: alumniKeys.list(filters),
    queryFn: () => api.getAlumni(filters),
  })
}

export function useAlumnus(id: string) {
  return useQuery({
    queryKey: alumniKeys.detail(id),
    queryFn: () => api.getAlumnusById(id),
    enabled: !!id,
  })
}

export function useCreateAlumni() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAlumniPayload) => api.createAlumni(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.lists() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.batchStats() })
    },
  })
}

export function useUpdateAlumni() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAlumniPayload }) =>
      api.updateAlumni(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: alumniKeys.lists() })
    },
  })
}

export function useVerifyAlumni() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.verifyAlumni(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: alumniKeys.lists() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.batchStats() })
    },
  })
}

export function useDeleteAlumni() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteAlumni(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.lists() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.batchStats() })
    },
  })
}

// Achievement hooks
export function useAchievements(filters?: AchievementFilters) {
  return useQuery({
    queryKey: alumniKeys.achievementsList(filters),
    queryFn: () => api.getAchievements(filters),
  })
}

export function useCreateAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAchievementPayload) => api.createAchievement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.achievements() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.batchStats() })
    },
  })
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AlumniAchievement> }) =>
      api.updateAchievement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.achievements() })
    },
  })
}

export function usePublishAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      api.publishAchievement(id, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.achievements() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
    },
  })
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteAchievement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.achievements() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.batchStats() })
    },
  })
}

// Contribution hooks
export function useContributions(filters?: ContributionFilters) {
  return useQuery({
    queryKey: alumniKeys.contributionsList(filters),
    queryFn: () => api.getContributions(filters),
  })
}

export function useCreateContribution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateContributionPayload) => api.createContribution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.contributions() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.batchStats() })
    },
  })
}

export function useUpdateContributionStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      acknowledgement,
    }: {
      id: string
      status: ContributionStatus
      acknowledgement?: string
    }) => api.updateContributionStatus(id, status, acknowledgement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.contributions() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
    },
  })
}

export function useDeleteContribution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteContribution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.contributions() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.batchStats() })
    },
  })
}

// Event hooks
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: alumniKeys.eventsList(filters),
    queryFn: () => api.getEvents(filters),
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: alumniKeys.eventDetail(id),
    queryFn: () => api.getEventById(id),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEventPayload) => api.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.events() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AlumniEvent> }) =>
      api.updateEvent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.eventDetail(id) })
      queryClient.invalidateQueries({ queryKey: alumniKeys.events() })
    },
  })
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
      api.updateEventStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.eventDetail(id) })
      queryClient.invalidateQueries({ queryKey: alumniKeys.events() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.events() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
    },
  })
}

// Event registration hooks
export function useEventRegistrations(eventId: string) {
  return useQuery({
    queryKey: alumniKeys.eventRegistrations(eventId),
    queryFn: () => api.getEventRegistrations(eventId),
    enabled: !!eventId,
  })
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, alumniId }: { eventId: string; alumniId: string }) =>
      api.registerForEvent(eventId, alumniId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.eventRegistrations(eventId) })
      queryClient.invalidateQueries({ queryKey: alumniKeys.eventDetail(eventId) })
      queryClient.invalidateQueries({ queryKey: alumniKeys.events() })
    },
  })
}

export function useCancelEventRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, alumniId }: { eventId: string; alumniId: string }) =>
      api.cancelEventRegistration(eventId, alumniId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.eventRegistrations(eventId) })
      queryClient.invalidateQueries({ queryKey: alumniKeys.eventDetail(eventId) })
      queryClient.invalidateQueries({ queryKey: alumniKeys.events() })
    },
  })
}

// ==================== GRADUATION HOOKS ====================

export function useEligibleForGraduation() {
  return useQuery({
    queryKey: alumniKeys.eligibleForGraduation(),
    queryFn: api.getEligibleForGraduation,
  })
}

export function useGraduateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: GraduateStudentPayload) => api.graduateStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.lists() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.batchStats() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.eligibleForGraduation() })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useGraduateBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BatchGraduationPayload) => api.graduateBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alumniKeys.lists() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.stats() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.batchStats() })
      queryClient.invalidateQueries({ queryKey: alumniKeys.eligibleForGraduation() })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
