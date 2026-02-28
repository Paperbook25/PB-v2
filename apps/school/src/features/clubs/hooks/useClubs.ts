import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  ClubFilters,
  CreateClubRequest,
  UpdateClubRequest,
  MembershipFilters,
  CreateMembershipRequest,
  UpdateMembershipRequest,
  ActivityFilters,
  CreateActivityRequest,
  UpdateActivityRequest,
  AchievementFilters,
  CreateAchievementRequest,
  UpdateAchievementRequest,
  CreditFilters,
  CreateCreditRequest,
  UpdateCreditRequest,
  CompetitionFilters,
  CreateCompetitionRequest,
  UpdateCompetitionRequest,
  CompetitionRegistration,
} from '../types/clubs.types'
import * as api from '../api/clubs.api'

// ==================== QUERY KEYS ====================

export const clubsKeys = {
  all: ['clubs'] as const,
  lists: () => [...clubsKeys.all, 'list'] as const,
  list: (filters: ClubFilters) => [...clubsKeys.lists(), filters] as const,
  details: () => [...clubsKeys.all, 'detail'] as const,
  detail: (id: string) => [...clubsKeys.details(), id] as const,
  stats: () => [...clubsKeys.all, 'stats'] as const,
  clubStats: (id: string) => [...clubsKeys.stats(), id] as const,
  // Memberships
  memberships: () => [...clubsKeys.all, 'memberships'] as const,
  membershipList: (filters: MembershipFilters) => [...clubsKeys.memberships(), filters] as const,
  membershipDetail: (id: string) => [...clubsKeys.memberships(), id] as const,
  // Activities
  activities: () => [...clubsKeys.all, 'activities'] as const,
  activityList: (filters: ActivityFilters) => [...clubsKeys.activities(), filters] as const,
  activityDetail: (id: string) => [...clubsKeys.activities(), id] as const,
  // Achievements
  achievements: () => [...clubsKeys.all, 'achievements'] as const,
  achievementList: (filters: AchievementFilters) => [...clubsKeys.achievements(), filters] as const,
  achievementDetail: (id: string) => [...clubsKeys.achievements(), id] as const,
  // Credits
  credits: () => [...clubsKeys.all, 'credits'] as const,
  creditList: (filters: CreditFilters) => [...clubsKeys.credits(), filters] as const,
  creditDetail: (id: string) => [...clubsKeys.credits(), id] as const,
  creditSummary: (studentId: string) => [...clubsKeys.credits(), 'summary', studentId] as const,
  // Competitions
  competitions: () => [...clubsKeys.all, 'competitions'] as const,
  competitionList: (filters: CompetitionFilters) => [...clubsKeys.competitions(), filters] as const,
  competitionDetail: (id: string) => [...clubsKeys.competitions(), id] as const,
  competitionRegistrations: (id: string) => [...clubsKeys.competitions(), id, 'registrations'] as const,
  // Utility
  availableStudents: (clubId?: string) => [...clubsKeys.all, 'available-students', clubId] as const,
  availableAdvisors: () => [...clubsKeys.all, 'available-advisors'] as const,
}

// ==================== CLUBS ====================

export function useClubs(filters: ClubFilters = {}) {
  return useQuery({
    queryKey: clubsKeys.list(filters),
    queryFn: () => api.fetchClubs(filters),
  })
}

export function useClub(id: string) {
  return useQuery({
    queryKey: clubsKeys.detail(id),
    queryFn: () => api.fetchClub(id),
    enabled: !!id,
  })
}

export function useCreateClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateClubRequest) => api.createClub(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.stats() })
    },
  })
}

export function useUpdateClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClubRequest }) => api.updateClub(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.detail(id) })
    },
  })
}

export function useDeleteClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteClub(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.stats() })
    },
  })
}

// ==================== MEMBERSHIPS ====================

export function useMemberships(filters: MembershipFilters = {}) {
  return useQuery({
    queryKey: clubsKeys.membershipList(filters),
    queryFn: () => api.fetchMemberships(filters),
  })
}

export function useMembership(id: string) {
  return useQuery({
    queryKey: clubsKeys.membershipDetail(id),
    queryFn: () => api.fetchMembership(id),
    enabled: !!id,
  })
}

export function useCreateMembership() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMembershipRequest) => api.createMembership(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.memberships() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.stats() })
    },
  })
}

export function useUpdateMembership() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMembershipRequest }) => api.updateMembership(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.memberships() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.membershipDetail(id) })
    },
  })
}

export function useDeleteMembership() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteMembership(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.memberships() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.stats() })
    },
  })
}

// ==================== ACTIVITIES ====================

export function useActivities(filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: clubsKeys.activityList(filters),
    queryFn: () => api.fetchActivities(filters),
  })
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: clubsKeys.activityDetail(id),
    queryFn: () => api.fetchActivity(id),
    enabled: !!id,
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateActivityRequest) => api.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.activities() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.stats() })
    },
  })
}

export function useUpdateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActivityRequest }) => api.updateActivity(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.activities() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.activityDetail(id) })
    },
  })
}

export function useDeleteActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.activities() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.stats() })
    },
  })
}

// ==================== ACHIEVEMENTS ====================

export function useAchievements(filters: AchievementFilters = {}) {
  return useQuery({
    queryKey: clubsKeys.achievementList(filters),
    queryFn: () => api.fetchAchievements(filters),
  })
}

export function useAchievement(id: string) {
  return useQuery({
    queryKey: clubsKeys.achievementDetail(id),
    queryFn: () => api.fetchAchievement(id),
    enabled: !!id,
  })
}

export function useCreateAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAchievementRequest) => api.createAchievement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.achievements() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.stats() })
    },
  })
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAchievementRequest }) => api.updateAchievement(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.achievements() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.achievementDetail(id) })
    },
  })
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteAchievement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.achievements() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.stats() })
    },
  })
}

export function useVerifyAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.verifyAchievement(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.achievements() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.achievementDetail(id) })
    },
  })
}

// ==================== CREDITS ====================

export function useCredits(filters: CreditFilters = {}) {
  return useQuery({
    queryKey: clubsKeys.creditList(filters),
    queryFn: () => api.fetchCredits(filters),
  })
}

export function useCredit(id: string) {
  return useQuery({
    queryKey: clubsKeys.creditDetail(id),
    queryFn: () => api.fetchCredit(id),
    enabled: !!id,
  })
}

export function useCreditSummary(studentId: string) {
  return useQuery({
    queryKey: clubsKeys.creditSummary(studentId),
    queryFn: () => api.fetchCreditSummary(studentId),
    enabled: !!studentId,
  })
}

export function useCreateCredit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCreditRequest) => api.createCredit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.credits() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.stats() })
    },
  })
}

export function useUpdateCredit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCreditRequest }) => api.updateCredit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.credits() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.creditDetail(id) })
    },
  })
}

export function useDeleteCredit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCredit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.credits() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.stats() })
    },
  })
}

export function useApproveCredit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.approveCredit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.credits() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.creditDetail(id) })
    },
  })
}

export function useRejectCredit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.rejectCredit(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.credits() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.creditDetail(id) })
    },
  })
}

// ==================== COMPETITIONS ====================

export function useCompetitions(filters: CompetitionFilters = {}) {
  return useQuery({
    queryKey: clubsKeys.competitionList(filters),
    queryFn: () => api.fetchCompetitions(filters),
  })
}

export function useCompetition(id: string) {
  return useQuery({
    queryKey: clubsKeys.competitionDetail(id),
    queryFn: () => api.fetchCompetition(id),
    enabled: !!id,
  })
}

export function useCreateCompetition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCompetitionRequest) => api.createCompetition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.competitions() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.stats() })
    },
  })
}

export function useUpdateCompetition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompetitionRequest }) => api.updateCompetition(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.competitions() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.competitionDetail(id) })
    },
  })
}

export function useDeleteCompetition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCompetition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.competitions() })
      queryClient.invalidateQueries({ queryKey: clubsKeys.stats() })
    },
  })
}

// ==================== COMPETITION REGISTRATIONS ====================

export function useCompetitionRegistrations(competitionId: string) {
  return useQuery({
    queryKey: clubsKeys.competitionRegistrations(competitionId),
    queryFn: () => api.fetchCompetitionRegistrations(competitionId),
    enabled: !!competitionId,
  })
}

export function useRegisterForCompetition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      competitionId,
      data,
    }: {
      competitionId: string
      data: { studentId: string; teamName?: string; teamMembers?: { studentId: string }[] }
    }) => api.registerForCompetition(competitionId, data),
    onSuccess: (_, { competitionId }) => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.competitionRegistrations(competitionId) })
      queryClient.invalidateQueries({ queryKey: clubsKeys.competitionDetail(competitionId) })
    },
  })
}

export function useUpdateRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { status?: CompetitionRegistration['status']; paymentStatus?: CompetitionRegistration['paymentStatus'] }
    }) => api.updateRegistration(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.competitions() })
    },
  })
}

export function useWithdrawRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.withdrawRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubsKeys.competitions() })
    },
  })
}

// ==================== STATISTICS ====================

export function useClubStats() {
  return useQuery({
    queryKey: clubsKeys.stats(),
    queryFn: () => api.fetchClubStats(),
  })
}

export function useClubDetailStats(clubId: string) {
  return useQuery({
    queryKey: clubsKeys.clubStats(clubId),
    queryFn: () => api.fetchClubDetailStats(clubId),
    enabled: !!clubId,
  })
}

// ==================== UTILITY ====================

export function useAvailableStudents(clubId?: string) {
  return useQuery({
    queryKey: clubsKeys.availableStudents(clubId),
    queryFn: () => api.fetchAvailableStudents(clubId),
  })
}

export function useAvailableAdvisors() {
  return useQuery({
    queryKey: clubsKeys.availableAdvisors(),
    queryFn: () => api.fetchAvailableAdvisors(),
  })
}
