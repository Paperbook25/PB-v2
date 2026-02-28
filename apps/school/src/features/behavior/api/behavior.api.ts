import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import { PaginatedResponse } from '@/types/common.types'
import {
  Incident,
  IncidentFilters,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  DisciplinaryAction,
  ActionFilters,
  CreateActionRequest,
  UpdateActionRequest,
  BehaviorPoint,
  BehaviorPointFilters,
  CreateBehaviorPointRequest,
  Detention,
  DetentionFilters,
  CreateDetentionRequest,
  UpdateDetentionRequest,
  BehaviorStats,
  StudentBehaviorSummary,
} from '../types/behavior.types'

const API_BASE = '/api/behavior'

// ===== Incidents =====
export async function fetchIncidents(
  filters: IncidentFilters = {}
): Promise<PaginatedResponse<Incident>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.category) params.set('category', filters.category)
  if (filters.severity) params.set('severity', filters.severity)
  if (filters.status) params.set('status', filters.status)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<Incident>>(
    `${API_BASE}/incidents?${params.toString()}`
  )
}

export async function fetchIncident(id: string): Promise<{ data: Incident }> {
  return apiGet<{ data: Incident }>(`${API_BASE}/incidents/${id}`)
}

export async function createIncident(
  data: CreateIncidentRequest
): Promise<{ data: Incident }> {
  return apiPost<{ data: Incident }>(`${API_BASE}/incidents`, data)
}

export async function updateIncident(
  id: string,
  data: UpdateIncidentRequest
): Promise<{ data: Incident }> {
  return apiPut<{ data: Incident }>(`${API_BASE}/incidents/${id}`, data)
}

export async function deleteIncident(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/incidents/${id}`)
}

export async function notifyParent(id: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/incidents/${id}/notify-parent`)
}

// ===== Disciplinary Actions =====
export async function fetchActions(
  filters: ActionFilters = {}
): Promise<PaginatedResponse<DisciplinaryAction>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.type) params.set('type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<DisciplinaryAction>>(
    `${API_BASE}/actions?${params.toString()}`
  )
}

export async function fetchAction(id: string): Promise<{ data: DisciplinaryAction }> {
  return apiGet<{ data: DisciplinaryAction }>(`${API_BASE}/actions/${id}`)
}

export async function createAction(
  data: CreateActionRequest
): Promise<{ data: DisciplinaryAction }> {
  return apiPost<{ data: DisciplinaryAction }>(`${API_BASE}/actions`, data)
}

export async function updateAction(
  id: string,
  data: UpdateActionRequest
): Promise<{ data: DisciplinaryAction }> {
  return apiPut<{ data: DisciplinaryAction }>(`${API_BASE}/actions/${id}`, data)
}

export async function submitAppeal(
  id: string,
  reason: string
): Promise<{ data: DisciplinaryAction }> {
  return apiPost<{ data: DisciplinaryAction }>(`${API_BASE}/actions/${id}/appeal`, { reason })
}

// ===== Behavior Points =====
export async function fetchBehaviorPoints(
  filters: BehaviorPointFilters = {}
): Promise<PaginatedResponse<BehaviorPoint>> {
  const params = new URLSearchParams()
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.type) params.set('type', filters.type)
  if (filters.category) params.set('category', filters.category)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<BehaviorPoint>>(
    `${API_BASE}/points?${params.toString()}`
  )
}

export async function createBehaviorPoint(
  data: CreateBehaviorPointRequest
): Promise<{ data: BehaviorPoint }> {
  return apiPost<{ data: BehaviorPoint }>(`${API_BASE}/points`, data)
}

export async function fetchStudentBehaviorSummary(
  studentId: string
): Promise<{ data: StudentBehaviorSummary }> {
  return apiGet<{ data: StudentBehaviorSummary }>(
    `${API_BASE}/students/${studentId}/summary`
  )
}

export async function fetchLeaderboard(
  type: 'positive' | 'negative' | 'all' = 'positive',
  limit = 10
): Promise<{
  data: { id: string; name: string; class: string; total: number }[]
}> {
  return apiGet(`${API_BASE}/leaderboard?type=${type}&limit=${limit}`)
}

// ===== Detentions =====
export async function fetchDetentions(
  filters: DetentionFilters = {}
): Promise<PaginatedResponse<Detention>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.status) params.set('status', filters.status)
  if (filters.supervisorId) params.set('supervisorId', filters.supervisorId)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<Detention>>(
    `${API_BASE}/detentions?${params.toString()}`
  )
}

export async function createDetention(
  data: CreateDetentionRequest
): Promise<{ data: Detention }> {
  return apiPost<{ data: Detention }>(`${API_BASE}/detentions`, data)
}

export async function updateDetention(
  id: string,
  data: UpdateDetentionRequest
): Promise<{ data: Detention }> {
  return apiPut<{ data: Detention }>(`${API_BASE}/detentions/${id}`, data)
}

export async function deleteDetention(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/detentions/${id}`)
}

// ===== Stats =====
export async function fetchBehaviorStats(): Promise<{ data: BehaviorStats }> {
  return apiGet<{ data: BehaviorStats }>(`${API_BASE}/stats`)
}
