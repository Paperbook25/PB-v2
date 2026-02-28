import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  Complaint,
  ComplaintFilters,
  CreateComplaintRequest,
  UpdateComplaintRequest,
  ComplaintComment,
  CreateCommentRequest,
  ComplaintStats,
  ComplaintTrend,
  CategoryAnalytics,
  StatusChange,
  TicketHistory,
  Resolution,
  CreateResolutionRequest,
  SLAConfig,
  SLABreach,
  AssignmentRule,
  EscalationRequest,
  SatisfactionSurvey,
  SurveyResponse,
  SurveyAnalytics,
  AnonymousFeedback,
  CreateAnonymousFeedbackRequest,
  AnonymousFeedbackLookup,
  ComplaintCategory,
  ComplaintPriority,
} from '../types/complaints.types'

const API_BASE = '/api/complaints'

// ==================== COMPLAINTS CRUD ====================

export async function fetchComplaints(
  filters: ComplaintFilters = {}
): Promise<PaginatedResponse<Complaint>> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.priority && filters.priority !== 'all') params.set('priority', filters.priority)
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.assignedTo) params.set('assignedTo', filters.assignedTo)
  if (filters.complainantType && filters.complainantType !== 'all') {
    params.set('complainantType', filters.complainantType)
  }
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.slaBreached !== undefined) params.set('slaBreached', String(filters.slaBreached))
  if (filters.isAnonymous !== undefined) params.set('isAnonymous', String(filters.isAnonymous))
  if (filters.isSensitive !== undefined) params.set('isSensitive', String(filters.isSensitive))
  if (filters.requiresFollowUp !== undefined) {
    params.set('requiresFollowUp', String(filters.requiresFollowUp))
  }

  return apiGet<PaginatedResponse<Complaint>>(`${API_BASE}?${params.toString()}`)
}

export async function fetchComplaint(id: string): Promise<{ data: Complaint }> {
  return apiGet<{ data: Complaint }>(`${API_BASE}/${id}`)
}

export async function createComplaint(
  data: CreateComplaintRequest
): Promise<{ data: Complaint }> {
  return apiPost<{ data: Complaint }>(`${API_BASE}`, data)
}

export async function updateComplaint(
  id: string,
  data: UpdateComplaintRequest
): Promise<{ data: Complaint }> {
  return apiPatch<{ data: Complaint }>(`${API_BASE}/${id}`, data)
}

export async function deleteComplaint(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/${id}`)
}

// ==================== COMPLAINT ASSIGNMENT & ESCALATION ====================

export async function assignComplaint(
  id: string,
  assignedTo: string
): Promise<{ data: Complaint }> {
  return apiPatch<{ data: Complaint }>(`${API_BASE}/${id}/assign`, { assignedTo })
}

export async function escalateComplaint(
  id: string,
  data: EscalationRequest
): Promise<{ data: Complaint }> {
  return apiPost<{ data: Complaint }>(`${API_BASE}/${id}/escalate`, data)
}

export async function acknowledgeComplaint(id: string): Promise<{ data: Complaint }> {
  return apiPatch<{ data: Complaint }>(`${API_BASE}/${id}/acknowledge`)
}

export async function reopenComplaint(
  id: string,
  reason: string
): Promise<{ data: Complaint }> {
  return apiPatch<{ data: Complaint }>(`${API_BASE}/${id}/reopen`, { reason })
}

export async function closeComplaint(
  id: string,
  notes?: string
): Promise<{ data: Complaint }> {
  return apiPatch<{ data: Complaint }>(`${API_BASE}/${id}/close`, { notes })
}

// ==================== COMPLAINT COMMENTS ====================

export async function fetchComplaintComments(
  complaintId: string
): Promise<{ data: ComplaintComment[] }> {
  return apiGet<{ data: ComplaintComment[] }>(`${API_BASE}/${complaintId}/comments`)
}

export async function createComplaintComment(
  data: CreateCommentRequest
): Promise<{ data: ComplaintComment }> {
  return apiPost<{ data: ComplaintComment }>(
    `${API_BASE}/${data.complaintId}/comments`,
    data
  )
}

export async function updateComplaintComment(
  complaintId: string,
  commentId: string,
  content: string
): Promise<{ data: ComplaintComment }> {
  return apiPatch<{ data: ComplaintComment }>(
    `${API_BASE}/${complaintId}/comments/${commentId}`,
    { content }
  )
}

export async function deleteComplaintComment(
  complaintId: string,
  commentId: string
): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(
    `${API_BASE}/${complaintId}/comments/${commentId}`
  )
}

// ==================== TICKET HISTORY & STATUS CHANGES ====================

export async function fetchTicketHistory(
  complaintId: string
): Promise<{ data: TicketHistory[] }> {
  return apiGet<{ data: TicketHistory[] }>(`${API_BASE}/${complaintId}/history`)
}

export async function fetchStatusChanges(
  complaintId: string
): Promise<{ data: StatusChange[] }> {
  return apiGet<{ data: StatusChange[] }>(`${API_BASE}/${complaintId}/status-changes`)
}

// ==================== RESOLUTION ====================

export async function fetchResolution(
  complaintId: string
): Promise<{ data: Resolution }> {
  return apiGet<{ data: Resolution }>(`${API_BASE}/${complaintId}/resolution`)
}

export async function createResolution(
  data: CreateResolutionRequest
): Promise<{ data: Resolution }> {
  return apiPost<{ data: Resolution }>(
    `${API_BASE}/${data.complaintId}/resolution`,
    data
  )
}

export async function updateResolution(
  complaintId: string,
  data: Partial<CreateResolutionRequest>
): Promise<{ data: Resolution }> {
  return apiPut<{ data: Resolution }>(`${API_BASE}/${complaintId}/resolution`, data)
}

export async function submitResolution(complaintId: string): Promise<{ data: Resolution }> {
  return apiPatch<{ data: Resolution }>(`${API_BASE}/${complaintId}/resolution/submit`)
}

export async function verifyResolution(complaintId: string): Promise<{ data: Resolution }> {
  return apiPatch<{ data: Resolution }>(`${API_BASE}/${complaintId}/resolution/verify`)
}

export async function rejectResolution(
  complaintId: string,
  reason: string
): Promise<{ data: Resolution }> {
  return apiPatch<{ data: Resolution }>(`${API_BASE}/${complaintId}/resolution/reject`, {
    reason,
  })
}

// ==================== SLA CONFIGURATION ====================

export async function fetchSLAConfigs(): Promise<{ data: SLAConfig[] }> {
  return apiGet<{ data: SLAConfig[] }>(`${API_BASE}/sla-configs`)
}

export async function fetchSLAConfig(id: string): Promise<{ data: SLAConfig }> {
  return apiGet<{ data: SLAConfig }>(`${API_BASE}/sla-configs/${id}`)
}

export async function createSLAConfig(
  data: Omit<SLAConfig, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ data: SLAConfig }> {
  return apiPost<{ data: SLAConfig }>(`${API_BASE}/sla-configs`, data)
}

export async function updateSLAConfig(
  id: string,
  data: Partial<Omit<SLAConfig, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<{ data: SLAConfig }> {
  return apiPut<{ data: SLAConfig }>(`${API_BASE}/sla-configs/${id}`, data)
}

export async function deleteSLAConfig(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/sla-configs/${id}`)
}

export async function toggleSLAConfig(id: string): Promise<{ data: SLAConfig }> {
  return apiPatch<{ data: SLAConfig }>(`${API_BASE}/sla-configs/${id}/toggle`)
}

// ==================== SLA BREACHES ====================

export async function fetchSLABreaches(
  filters: {
    complaintId?: string
    breachType?: string
    status?: string
    page?: number
    limit?: number
  } = {}
): Promise<PaginatedResponse<SLABreach>> {
  const params = new URLSearchParams()

  if (filters.complaintId) params.set('complaintId', filters.complaintId)
  if (filters.breachType && filters.breachType !== 'all') {
    params.set('breachType', filters.breachType)
  }
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<SLABreach>>(
    `${API_BASE}/sla-breaches?${params.toString()}`
  )
}

export async function addressSLABreach(
  id: string,
  reason?: string
): Promise<{ data: SLABreach }> {
  return apiPatch<{ data: SLABreach }>(`${API_BASE}/sla-breaches/${id}/address`, {
    reason,
  })
}

export async function excuseSLABreach(
  id: string,
  reason: string
): Promise<{ data: SLABreach }> {
  return apiPatch<{ data: SLABreach }>(`${API_BASE}/sla-breaches/${id}/excuse`, {
    reason,
  })
}

// ==================== ASSIGNMENT RULES ====================

export async function fetchAssignmentRules(): Promise<{ data: AssignmentRule[] }> {
  return apiGet<{ data: AssignmentRule[] }>(`${API_BASE}/assignment-rules`)
}

export async function fetchAssignmentRule(id: string): Promise<{ data: AssignmentRule }> {
  return apiGet<{ data: AssignmentRule }>(`${API_BASE}/assignment-rules/${id}`)
}

export async function createAssignmentRule(
  data: Omit<AssignmentRule, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ data: AssignmentRule }> {
  return apiPost<{ data: AssignmentRule }>(`${API_BASE}/assignment-rules`, data)
}

export async function updateAssignmentRule(
  id: string,
  data: Partial<Omit<AssignmentRule, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<{ data: AssignmentRule }> {
  return apiPut<{ data: AssignmentRule }>(`${API_BASE}/assignment-rules/${id}`, data)
}

export async function deleteAssignmentRule(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/assignment-rules/${id}`)
}

export async function toggleAssignmentRule(id: string): Promise<{ data: AssignmentRule }> {
  return apiPatch<{ data: AssignmentRule }>(`${API_BASE}/assignment-rules/${id}/toggle`)
}

export async function reorderAssignmentRules(
  ruleIds: string[]
): Promise<{ data: AssignmentRule[] }> {
  return apiPatch<{ data: AssignmentRule[] }>(`${API_BASE}/assignment-rules/reorder`, {
    ruleIds,
  })
}

// ==================== SATISFACTION SURVEYS ====================

export async function fetchSurveys(
  filters: {
    status?: string
    complaintId?: string
    page?: number
    limit?: number
  } = {}
): Promise<PaginatedResponse<SatisfactionSurvey>> {
  const params = new URLSearchParams()

  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.complaintId) params.set('complaintId', filters.complaintId)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<SatisfactionSurvey>>(
    `${API_BASE}/surveys?${params.toString()}`
  )
}

export async function fetchSurvey(id: string): Promise<{ data: SatisfactionSurvey }> {
  return apiGet<{ data: SatisfactionSurvey }>(`${API_BASE}/surveys/${id}`)
}

export async function sendSurvey(complaintId: string): Promise<{ data: SatisfactionSurvey }> {
  return apiPost<{ data: SatisfactionSurvey }>(`${API_BASE}/surveys/send`, {
    complaintId,
  })
}

export async function sendSurveyReminder(
  surveyId: string
): Promise<{ data: SatisfactionSurvey }> {
  return apiPost<{ data: SatisfactionSurvey }>(
    `${API_BASE}/surveys/${surveyId}/reminder`
  )
}

export async function fetchSurveyResponse(
  surveyId: string
): Promise<{ data: SurveyResponse }> {
  return apiGet<{ data: SurveyResponse }>(`${API_BASE}/surveys/${surveyId}/response`)
}

export async function submitSurveyResponse(
  surveyId: string,
  data: Omit<SurveyResponse, 'id' | 'surveyId' | 'complaintId' | 'respondedAt'>
): Promise<{ data: SurveyResponse }> {
  return apiPost<{ data: SurveyResponse }>(
    `${API_BASE}/surveys/${surveyId}/response`,
    data
  )
}

export async function fetchSurveyAnalytics(): Promise<{ data: SurveyAnalytics }> {
  return apiGet<{ data: SurveyAnalytics }>(`${API_BASE}/surveys/analytics`)
}

// ==================== ANONYMOUS FEEDBACK ====================

export async function fetchAnonymousFeedback(
  filters: {
    status?: string
    category?: string
    page?: number
    limit?: number
  } = {}
): Promise<PaginatedResponse<AnonymousFeedback>> {
  const params = new URLSearchParams()

  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.category && filters.category !== 'all') {
    params.set('category', filters.category)
  }
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<AnonymousFeedback>>(
    `${API_BASE}/anonymous?${params.toString()}`
  )
}

export async function fetchAnonymousFeedbackById(
  id: string
): Promise<{ data: AnonymousFeedback }> {
  return apiGet<{ data: AnonymousFeedback }>(`${API_BASE}/anonymous/${id}`)
}

export async function createAnonymousFeedback(
  data: CreateAnonymousFeedbackRequest
): Promise<{ data: AnonymousFeedback; feedbackToken: string }> {
  return apiPost<{ data: AnonymousFeedback; feedbackToken: string }>(
    `${API_BASE}/anonymous`,
    data
  )
}

export async function lookupAnonymousFeedback(
  token: string
): Promise<{ data: AnonymousFeedbackLookup }> {
  return apiGet<{ data: AnonymousFeedbackLookup }>(
    `${API_BASE}/anonymous/lookup/${token}`
  )
}

export async function updateAnonymousFeedback(
  id: string,
  data: {
    assignedTo?: string
    internalNotes?: string
    status?: string
    isVerified?: boolean
  }
): Promise<{ data: AnonymousFeedback }> {
  return apiPatch<{ data: AnonymousFeedback }>(`${API_BASE}/anonymous/${id}`, data)
}

export async function postAnonymousFeedbackResponse(
  id: string,
  publicResponse: string
): Promise<{ data: AnonymousFeedback }> {
  return apiPost<{ data: AnonymousFeedback }>(`${API_BASE}/anonymous/${id}/respond`, {
    publicResponse,
  })
}

// ==================== STATISTICS & ANALYTICS ====================

export async function fetchComplaintStats(): Promise<{ data: ComplaintStats }> {
  return apiGet<{ data: ComplaintStats }>(`${API_BASE}/stats`)
}

export async function fetchComplaintTrends(
  filters: {
    dateFrom?: string
    dateTo?: string
    interval?: 'day' | 'week' | 'month'
  } = {}
): Promise<{ data: ComplaintTrend[] }> {
  const params = new URLSearchParams()

  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.interval) params.set('interval', filters.interval)

  return apiGet<{ data: ComplaintTrend[] }>(
    `${API_BASE}/trends?${params.toString()}`
  )
}

export async function fetchCategoryAnalytics(): Promise<{ data: CategoryAnalytics[] }> {
  return apiGet<{ data: CategoryAnalytics[] }>(`${API_BASE}/analytics/categories`)
}

// ==================== UTILITY ENDPOINTS ====================

export async function fetchAssignableStaff(
  category?: ComplaintCategory
): Promise<{ data: { id: string; name: string; role: string; department?: string }[] }> {
  const params = new URLSearchParams()
  if (category) params.set('category', category)

  return apiGet<{ data: { id: string; name: string; role: string; department?: string }[] }>(
    `${API_BASE}/assignable-staff?${params.toString()}`
  )
}

export async function fetchComplaintsByStudent(
  studentId: string
): Promise<{ data: Complaint[] }> {
  return apiGet<{ data: Complaint[] }>(`${API_BASE}/students/${studentId}`)
}

export async function fetchMyComplaints(): Promise<{ data: Complaint[] }> {
  return apiGet<{ data: Complaint[] }>(`${API_BASE}/my-complaints`)
}

export async function fetchMyChildrenComplaints(): Promise<{
  data: {
    studentId: string
    studentName: string
    complaints: Complaint[]
  }[]
}> {
  return apiGet<{
    data: {
      studentId: string
      studentName: string
      complaints: Complaint[]
    }[]
  }>(`${API_BASE}/my-children-complaints`)
}
