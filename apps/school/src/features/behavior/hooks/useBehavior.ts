import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIncidents,
  fetchIncident,
  createIncident,
  updateIncident,
  deleteIncident,
  notifyParent,
  fetchActions,
  fetchAction,
  createAction,
  updateAction,
  submitAppeal,
  fetchBehaviorPoints,
  createBehaviorPoint,
  fetchStudentBehaviorSummary,
  fetchLeaderboard,
  fetchDetentions,
  createDetention,
  updateDetention,
  deleteDetention,
  fetchBehaviorStats,
} from '../api/behavior.api'
import {
  IncidentFilters,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  ActionFilters,
  CreateActionRequest,
  UpdateActionRequest,
  BehaviorPointFilters,
  CreateBehaviorPointRequest,
  DetentionFilters,
  CreateDetentionRequest,
  UpdateDetentionRequest,
} from '../types/behavior.types'

// ===== Query Keys =====
export const behaviorKeys = {
  all: ['behavior'] as const,
  stats: () => [...behaviorKeys.all, 'stats'] as const,
  // Incidents
  incidents: () => [...behaviorKeys.all, 'incidents'] as const,
  incidentList: (filters: IncidentFilters) =>
    [...behaviorKeys.incidents(), 'list', filters] as const,
  incidentDetail: (id: string) =>
    [...behaviorKeys.incidents(), 'detail', id] as const,
  // Actions
  actions: () => [...behaviorKeys.all, 'actions'] as const,
  actionList: (filters: ActionFilters) =>
    [...behaviorKeys.actions(), 'list', filters] as const,
  actionDetail: (id: string) =>
    [...behaviorKeys.actions(), 'detail', id] as const,
  // Points
  points: () => [...behaviorKeys.all, 'points'] as const,
  pointList: (filters: BehaviorPointFilters) =>
    [...behaviorKeys.points(), 'list', filters] as const,
  studentSummary: (studentId: string) =>
    [...behaviorKeys.all, 'summary', studentId] as const,
  leaderboard: (type: string) =>
    [...behaviorKeys.all, 'leaderboard', type] as const,
  // Detentions
  detentions: () => [...behaviorKeys.all, 'detentions'] as const,
  detentionList: (filters: DetentionFilters) =>
    [...behaviorKeys.detentions(), 'list', filters] as const,
}

// ===== Stats Hook =====
export function useBehaviorStats() {
  return useQuery({
    queryKey: behaviorKeys.stats(),
    queryFn: fetchBehaviorStats,
  })
}

// ===== Incidents Hooks =====
export function useIncidents(filters: IncidentFilters = {}) {
  return useQuery({
    queryKey: behaviorKeys.incidentList(filters),
    queryFn: () => fetchIncidents(filters),
  })
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: behaviorKeys.incidentDetail(id),
    queryFn: () => fetchIncident(id),
    enabled: !!id,
  })
}

export function useCreateIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateIncidentRequest) => createIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: behaviorKeys.incidents() })
      queryClient.invalidateQueries({ queryKey: behaviorKeys.stats() })
    },
  })
}

export function useUpdateIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncidentRequest }) =>
      updateIncident(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: behaviorKeys.incidentDetail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: behaviorKeys.incidents() })
      queryClient.invalidateQueries({ queryKey: behaviorKeys.stats() })
    },
  })
}

export function useDeleteIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteIncident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: behaviorKeys.incidents() })
      queryClient.invalidateQueries({ queryKey: behaviorKeys.stats() })
    },
  })
}

export function useNotifyParent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notifyParent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: behaviorKeys.incidents() })
    },
  })
}

// ===== Actions Hooks =====
export function useActions(filters: ActionFilters = {}) {
  return useQuery({
    queryKey: behaviorKeys.actionList(filters),
    queryFn: () => fetchActions(filters),
  })
}

export function useAction(id: string) {
  return useQuery({
    queryKey: behaviorKeys.actionDetail(id),
    queryFn: () => fetchAction(id),
    enabled: !!id,
  })
}

export function useCreateAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateActionRequest) => createAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: behaviorKeys.actions() })
      queryClient.invalidateQueries({ queryKey: behaviorKeys.incidents() })
      queryClient.invalidateQueries({ queryKey: behaviorKeys.stats() })
    },
  })
}

export function useUpdateAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActionRequest }) =>
      updateAction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: behaviorKeys.actionDetail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: behaviorKeys.actions() })
      queryClient.invalidateQueries({ queryKey: behaviorKeys.stats() })
    },
  })
}

export function useSubmitAppeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      submitAppeal(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: behaviorKeys.actions() })
    },
  })
}

// ===== Points Hooks =====
export function useBehaviorPoints(filters: BehaviorPointFilters = {}) {
  return useQuery({
    queryKey: behaviorKeys.pointList(filters),
    queryFn: () => fetchBehaviorPoints(filters),
  })
}

export function useCreateBehaviorPoint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBehaviorPointRequest) => createBehaviorPoint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: behaviorKeys.points() })
      queryClient.invalidateQueries({ queryKey: behaviorKeys.stats() })
    },
  })
}

export function useStudentBehaviorSummary(studentId: string) {
  return useQuery({
    queryKey: behaviorKeys.studentSummary(studentId),
    queryFn: () => fetchStudentBehaviorSummary(studentId),
    enabled: !!studentId,
  })
}

export function useLeaderboard(type: 'positive' | 'negative' | 'all' = 'positive', limit = 10) {
  return useQuery({
    queryKey: behaviorKeys.leaderboard(type),
    queryFn: () => fetchLeaderboard(type, limit),
  })
}

// ===== Detentions Hooks =====
export function useDetentions(filters: DetentionFilters = {}) {
  return useQuery({
    queryKey: behaviorKeys.detentionList(filters),
    queryFn: () => fetchDetentions(filters),
  })
}

export function useCreateDetention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDetentionRequest) => createDetention(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: behaviorKeys.detentions() })
      queryClient.invalidateQueries({ queryKey: behaviorKeys.stats() })
    },
  })
}

export function useUpdateDetention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDetentionRequest }) =>
      updateDetention(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: behaviorKeys.detentions() })
      queryClient.invalidateQueries({ queryKey: behaviorKeys.stats() })
    },
  })
}

export function useDeleteDetention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDetention(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: behaviorKeys.detentions() })
      queryClient.invalidateQueries({ queryKey: behaviorKeys.stats() })
    },
  })
}
