import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchComplaints,
  fetchComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  assignComplaint,
  escalateComplaint,
  acknowledgeComplaint,
  reopenComplaint,
  closeComplaint,
  fetchComplaintComments,
  createComplaintComment,
  updateComplaintComment,
  deleteComplaintComment,
  fetchTicketHistory,
  fetchStatusChanges,
  fetchResolution,
  createResolution,
  updateResolution,
  submitResolution,
  verifyResolution,
  rejectResolution,
  fetchSLAConfigs,
  fetchSLAConfig,
  createSLAConfig,
  updateSLAConfig,
  deleteSLAConfig,
  toggleSLAConfig,
  fetchSLABreaches,
  addressSLABreach,
  excuseSLABreach,
  fetchAssignmentRules,
  fetchAssignmentRule,
  createAssignmentRule,
  updateAssignmentRule,
  deleteAssignmentRule,
  toggleAssignmentRule,
  reorderAssignmentRules,
  fetchSurveys,
  fetchSurvey,
  sendSurvey,
  sendSurveyReminder,
  fetchSurveyResponse,
  submitSurveyResponse,
  fetchSurveyAnalytics,
  fetchAnonymousFeedback,
  fetchAnonymousFeedbackById,
  createAnonymousFeedback,
  lookupAnonymousFeedback,
  updateAnonymousFeedback,
  postAnonymousFeedbackResponse,
  fetchComplaintStats,
  fetchComplaintTrends,
  fetchCategoryAnalytics,
  fetchAssignableStaff,
  fetchComplaintsByStudent,
  fetchMyComplaints,
  fetchMyChildrenComplaints,
} from '../api/complaints.api'
import type {
  ComplaintFilters,
  CreateComplaintRequest,
  UpdateComplaintRequest,
  CreateCommentRequest,
  CreateResolutionRequest,
  EscalationRequest,
  SLAConfig,
  AssignmentRule,
  SurveyResponse,
  CreateAnonymousFeedbackRequest,
  ComplaintCategory,
} from '../types/complaints.types'

// ==================== QUERY KEYS ====================

export const complaintsKeys = {
  all: ['complaints'] as const,
  // Complaints
  lists: () => [...complaintsKeys.all, 'list'] as const,
  list: (filters: ComplaintFilters) => [...complaintsKeys.lists(), filters] as const,
  details: () => [...complaintsKeys.all, 'detail'] as const,
  detail: (id: string) => [...complaintsKeys.details(), id] as const,
  // Comments
  comments: (complaintId: string) =>
    [...complaintsKeys.all, 'comments', complaintId] as const,
  // History
  history: (complaintId: string) =>
    [...complaintsKeys.all, 'history', complaintId] as const,
  statusChanges: (complaintId: string) =>
    [...complaintsKeys.all, 'status-changes', complaintId] as const,
  // Resolution
  resolution: (complaintId: string) =>
    [...complaintsKeys.all, 'resolution', complaintId] as const,
  // SLA
  slaConfigs: () => [...complaintsKeys.all, 'sla-configs'] as const,
  slaConfig: (id: string) => [...complaintsKeys.slaConfigs(), id] as const,
  slaBreaches: () => [...complaintsKeys.all, 'sla-breaches'] as const,
  slaBreachList: (filters: Record<string, unknown>) =>
    [...complaintsKeys.slaBreaches(), filters] as const,
  // Assignment Rules
  assignmentRules: () => [...complaintsKeys.all, 'assignment-rules'] as const,
  assignmentRule: (id: string) => [...complaintsKeys.assignmentRules(), id] as const,
  // Surveys
  surveys: () => [...complaintsKeys.all, 'surveys'] as const,
  surveyList: (filters: Record<string, unknown>) =>
    [...complaintsKeys.surveys(), filters] as const,
  survey: (id: string) => [...complaintsKeys.surveys(), id] as const,
  surveyResponse: (surveyId: string) =>
    [...complaintsKeys.all, 'survey-response', surveyId] as const,
  surveyAnalytics: () => [...complaintsKeys.all, 'survey-analytics'] as const,
  // Anonymous Feedback
  anonymous: () => [...complaintsKeys.all, 'anonymous'] as const,
  anonymousList: (filters: Record<string, unknown>) =>
    [...complaintsKeys.anonymous(), filters] as const,
  anonymousDetail: (id: string) => [...complaintsKeys.anonymous(), id] as const,
  anonymousLookup: (token: string) =>
    [...complaintsKeys.all, 'anonymous-lookup', token] as const,
  // Stats & Analytics
  stats: () => [...complaintsKeys.all, 'stats'] as const,
  trends: (filters: Record<string, unknown>) =>
    [...complaintsKeys.all, 'trends', filters] as const,
  categoryAnalytics: () => [...complaintsKeys.all, 'category-analytics'] as const,
  // Utility
  assignableStaff: (category?: ComplaintCategory) =>
    [...complaintsKeys.all, 'assignable-staff', category] as const,
  studentComplaints: (studentId: string) =>
    [...complaintsKeys.all, 'student', studentId] as const,
  myComplaints: () => [...complaintsKeys.all, 'my-complaints'] as const,
  myChildrenComplaints: () => [...complaintsKeys.all, 'my-children-complaints'] as const,
}

// ==================== COMPLAINTS HOOKS ====================

export function useComplaints(filters: ComplaintFilters = {}) {
  return useQuery({
    queryKey: complaintsKeys.list(filters),
    queryFn: () => fetchComplaints(filters),
  })
}

export function useComplaint(id: string) {
  return useQuery({
    queryKey: complaintsKeys.detail(id),
    queryFn: () => fetchComplaint(id),
    enabled: !!id,
  })
}

export function useCreateComplaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateComplaintRequest) => createComplaint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.stats() })
    },
  })
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateComplaintRequest }) =>
      updateComplaint(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.stats() })
    },
  })
}

export function useDeleteComplaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteComplaint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.stats() })
    },
  })
}

export function useAssignComplaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) =>
      assignComplaint(id, assignedTo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.history(variables.id) })
    },
  })
}

export function useEscalateComplaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EscalationRequest }) =>
      escalateComplaint(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.history(variables.id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.stats() })
    },
  })
}

export function useAcknowledgeComplaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => acknowledgeComplaint(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.history(id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.stats() })
    },
  })
}

export function useReopenComplaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reopenComplaint(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.history(variables.id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.stats() })
    },
  })
}

export function useCloseComplaint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      closeComplaint(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.history(variables.id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.stats() })
    },
  })
}

// ==================== COMMENTS HOOKS ====================

export function useComplaintComments(complaintId: string) {
  return useQuery({
    queryKey: complaintsKeys.comments(complaintId),
    queryFn: () => fetchComplaintComments(complaintId),
    enabled: !!complaintId,
  })
}

export function useCreateComplaintComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => createComplaintComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.comments(variables.complaintId),
      })
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.history(variables.complaintId),
      })
    },
  })
}

export function useUpdateComplaintComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      complaintId,
      commentId,
      content,
    }: {
      complaintId: string
      commentId: string
      content: string
    }) => updateComplaintComment(complaintId, commentId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.comments(variables.complaintId),
      })
    },
  })
}

export function useDeleteComplaintComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      complaintId,
      commentId,
    }: {
      complaintId: string
      commentId: string
    }) => deleteComplaintComment(complaintId, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.comments(variables.complaintId),
      })
    },
  })
}

// ==================== HISTORY HOOKS ====================

export function useTicketHistory(complaintId: string) {
  return useQuery({
    queryKey: complaintsKeys.history(complaintId),
    queryFn: () => fetchTicketHistory(complaintId),
    enabled: !!complaintId,
  })
}

export function useStatusChanges(complaintId: string) {
  return useQuery({
    queryKey: complaintsKeys.statusChanges(complaintId),
    queryFn: () => fetchStatusChanges(complaintId),
    enabled: !!complaintId,
  })
}

// ==================== RESOLUTION HOOKS ====================

export function useResolution(complaintId: string) {
  return useQuery({
    queryKey: complaintsKeys.resolution(complaintId),
    queryFn: () => fetchResolution(complaintId),
    enabled: !!complaintId,
  })
}

export function useCreateResolution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateResolutionRequest) => createResolution(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.resolution(variables.complaintId),
      })
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.detail(variables.complaintId),
      })
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.history(variables.complaintId),
      })
    },
  })
}

export function useUpdateResolution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      complaintId,
      data,
    }: {
      complaintId: string
      data: Partial<CreateResolutionRequest>
    }) => updateResolution(complaintId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.resolution(variables.complaintId),
      })
    },
  })
}

export function useSubmitResolution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (complaintId: string) => submitResolution(complaintId),
    onSuccess: (_, complaintId) => {
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.resolution(complaintId),
      })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.detail(complaintId) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.history(complaintId) })
    },
  })
}

export function useVerifyResolution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (complaintId: string) => verifyResolution(complaintId),
    onSuccess: (_, complaintId) => {
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.resolution(complaintId),
      })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.detail(complaintId) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.history(complaintId) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.stats() })
    },
  })
}

export function useRejectResolution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ complaintId, reason }: { complaintId: string; reason: string }) =>
      rejectResolution(complaintId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.resolution(variables.complaintId),
      })
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.detail(variables.complaintId),
      })
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.history(variables.complaintId),
      })
    },
  })
}

// ==================== SLA CONFIG HOOKS ====================

export function useSLAConfigs() {
  return useQuery({
    queryKey: complaintsKeys.slaConfigs(),
    queryFn: fetchSLAConfigs,
  })
}

export function useSLAConfig(id: string) {
  return useQuery({
    queryKey: complaintsKeys.slaConfig(id),
    queryFn: () => fetchSLAConfig(id),
    enabled: !!id,
  })
}

export function useCreateSLAConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<SLAConfig, 'id' | 'createdAt' | 'updatedAt'>) =>
      createSLAConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.slaConfigs() })
    },
  })
}

export function useUpdateSLAConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<Omit<SLAConfig, 'id' | 'createdAt' | 'updatedAt'>>
    }) => updateSLAConfig(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.slaConfig(variables.id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.slaConfigs() })
    },
  })
}

export function useDeleteSLAConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSLAConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.slaConfigs() })
    },
  })
}

export function useToggleSLAConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleSLAConfig(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.slaConfig(id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.slaConfigs() })
    },
  })
}

// ==================== SLA BREACH HOOKS ====================

export function useSLABreaches(
  filters: {
    complaintId?: string
    breachType?: string
    status?: string
    page?: number
    limit?: number
  } = {}
) {
  return useQuery({
    queryKey: complaintsKeys.slaBreachList(filters),
    queryFn: () => fetchSLABreaches(filters),
  })
}

export function useAddressSLABreach() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      addressSLABreach(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.slaBreaches() })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.stats() })
    },
  })
}

export function useExcuseSLABreach() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      excuseSLABreach(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.slaBreaches() })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.stats() })
    },
  })
}

// ==================== ASSIGNMENT RULE HOOKS ====================

export function useAssignmentRules() {
  return useQuery({
    queryKey: complaintsKeys.assignmentRules(),
    queryFn: fetchAssignmentRules,
  })
}

export function useAssignmentRule(id: string) {
  return useQuery({
    queryKey: complaintsKeys.assignmentRule(id),
    queryFn: () => fetchAssignmentRule(id),
    enabled: !!id,
  })
}

export function useCreateAssignmentRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<AssignmentRule, 'id' | 'createdAt' | 'updatedAt'>) =>
      createAssignmentRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.assignmentRules() })
    },
  })
}

export function useUpdateAssignmentRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<Omit<AssignmentRule, 'id' | 'createdAt' | 'updatedAt'>>
    }) => updateAssignmentRule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.assignmentRule(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.assignmentRules() })
    },
  })
}

export function useDeleteAssignmentRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAssignmentRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.assignmentRules() })
    },
  })
}

export function useToggleAssignmentRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleAssignmentRule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.assignmentRule(id) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.assignmentRules() })
    },
  })
}

export function useReorderAssignmentRules() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleIds: string[]) => reorderAssignmentRules(ruleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.assignmentRules() })
    },
  })
}

// ==================== SURVEY HOOKS ====================

export function useSurveys(
  filters: {
    status?: string
    complaintId?: string
    page?: number
    limit?: number
  } = {}
) {
  return useQuery({
    queryKey: complaintsKeys.surveyList(filters),
    queryFn: () => fetchSurveys(filters),
  })
}

export function useSurvey(id: string) {
  return useQuery({
    queryKey: complaintsKeys.survey(id),
    queryFn: () => fetchSurvey(id),
    enabled: !!id,
  })
}

export function useSendSurvey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (complaintId: string) => sendSurvey(complaintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.surveys() })
    },
  })
}

export function useSendSurveyReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (surveyId: string) => sendSurveyReminder(surveyId),
    onSuccess: (_, surveyId) => {
      queryClient.invalidateQueries({ queryKey: complaintsKeys.survey(surveyId) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.surveys() })
    },
  })
}

export function useSurveyResponse(surveyId: string) {
  return useQuery({
    queryKey: complaintsKeys.surveyResponse(surveyId),
    queryFn: () => fetchSurveyResponse(surveyId),
    enabled: !!surveyId,
  })
}

export function useSubmitSurveyResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      surveyId,
      data,
    }: {
      surveyId: string
      data: Omit<SurveyResponse, 'id' | 'surveyId' | 'complaintId' | 'respondedAt'>
    }) => submitSurveyResponse(surveyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.surveyResponse(variables.surveyId),
      })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.survey(variables.surveyId) })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.surveys() })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.surveyAnalytics() })
    },
  })
}

export function useSurveyAnalytics() {
  return useQuery({
    queryKey: complaintsKeys.surveyAnalytics(),
    queryFn: fetchSurveyAnalytics,
  })
}

// ==================== ANONYMOUS FEEDBACK HOOKS ====================

export function useAnonymousFeedback(
  filters: {
    status?: string
    category?: string
    page?: number
    limit?: number
  } = {}
) {
  return useQuery({
    queryKey: complaintsKeys.anonymousList(filters),
    queryFn: () => fetchAnonymousFeedback(filters),
  })
}

export function useAnonymousFeedbackById(id: string) {
  return useQuery({
    queryKey: complaintsKeys.anonymousDetail(id),
    queryFn: () => fetchAnonymousFeedbackById(id),
    enabled: !!id,
  })
}

export function useCreateAnonymousFeedback() {
  return useMutation({
    mutationFn: (data: CreateAnonymousFeedbackRequest) => createAnonymousFeedback(data),
  })
}

export function useLookupAnonymousFeedback(token: string) {
  return useQuery({
    queryKey: complaintsKeys.anonymousLookup(token),
    queryFn: () => lookupAnonymousFeedback(token),
    enabled: !!token,
  })
}

export function useUpdateAnonymousFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: {
        assignedTo?: string
        internalNotes?: string
        status?: string
        isVerified?: boolean
      }
    }) => updateAnonymousFeedback(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.anonymousDetail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.anonymous() })
    },
  })
}

export function usePostAnonymousFeedbackResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, publicResponse }: { id: string; publicResponse: string }) =>
      postAnonymousFeedbackResponse(id, publicResponse),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: complaintsKeys.anonymousDetail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: complaintsKeys.anonymous() })
    },
  })
}

// ==================== STATS & ANALYTICS HOOKS ====================

export function useComplaintStats() {
  return useQuery({
    queryKey: complaintsKeys.stats(),
    queryFn: fetchComplaintStats,
  })
}

export function useComplaintTrends(
  filters: {
    dateFrom?: string
    dateTo?: string
    interval?: 'day' | 'week' | 'month'
  } = {}
) {
  return useQuery({
    queryKey: complaintsKeys.trends(filters),
    queryFn: () => fetchComplaintTrends(filters),
  })
}

export function useCategoryAnalytics() {
  return useQuery({
    queryKey: complaintsKeys.categoryAnalytics(),
    queryFn: fetchCategoryAnalytics,
  })
}

// ==================== UTILITY HOOKS ====================

export function useAssignableStaff(category?: ComplaintCategory) {
  return useQuery({
    queryKey: complaintsKeys.assignableStaff(category),
    queryFn: () => fetchAssignableStaff(category),
  })
}

export function useComplaintsByStudent(studentId: string) {
  return useQuery({
    queryKey: complaintsKeys.studentComplaints(studentId),
    queryFn: () => fetchComplaintsByStudent(studentId),
    enabled: !!studentId,
  })
}

export function useMyComplaints() {
  return useQuery({
    queryKey: complaintsKeys.myComplaints(),
    queryFn: fetchMyComplaints,
  })
}

export function useMyChildrenComplaints() {
  return useQuery({
    queryKey: complaintsKeys.myChildrenComplaints(),
    queryFn: fetchMyChildrenComplaints,
  })
}
