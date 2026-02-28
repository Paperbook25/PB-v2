import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  PeriodDefinition,
  Subject,
  Room,
  Timetable,
  TimetableEntry,
  Substitution,
  TimetableStats,
  TimetableFilters,
  SubstitutionFilters,
  CreateTimetableRequest,
  CreateTimetableEntryRequest,
  CreateSubstitutionRequest,
  UpdatePeriodDefinitionRequest,
} from '../types/timetable.types'

const API_BASE = '/api/timetable'

// ==================== STATS ====================

export async function fetchTimetableStats(): Promise<{ data: TimetableStats }> {
  return apiGet(`${API_BASE}/stats`)
}

// ==================== PERIOD DEFINITIONS ====================

export async function fetchPeriodDefinitions(): Promise<{ data: PeriodDefinition[] }> {
  return apiGet(`${API_BASE}/periods`)
}

export async function updatePeriodDefinition(
  id: string,
  data: UpdatePeriodDefinitionRequest
): Promise<{ data: PeriodDefinition }> {
  return apiPut(`${API_BASE}/periods/${id}`, data)
}

// ==================== SUBJECTS ====================

export async function fetchSubjects(): Promise<{ data: Subject[] }> {
  return apiGet(`${API_BASE}/subjects`)
}

// ==================== ROOMS ====================

export async function fetchRooms(): Promise<{ data: Room[] }> {
  return apiGet(`${API_BASE}/rooms`)
}

// ==================== TIMETABLES ====================

export async function fetchTimetables(
  filters: TimetableFilters = {}
): Promise<PaginatedResponse<Timetable>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.classId) params.set('classId', filters.classId)
  if (filters.status) params.set('status', filters.status)
  if (filters.academicYear) params.set('academicYear', filters.academicYear)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet(`${API_BASE}/timetables?${params}`)
}

export async function fetchTimetable(id: string): Promise<{ data: Timetable }> {
  return apiGet(`${API_BASE}/timetables/${id}`)
}

export async function createTimetable(
  data: CreateTimetableRequest
): Promise<{ data: Timetable }> {
  return apiPost(`${API_BASE}/timetables`, data)
}

export async function updateTimetable(
  id: string,
  data: Partial<Timetable>
): Promise<{ data: Timetable }> {
  return apiPut(`${API_BASE}/timetables/${id}`, data)
}

export async function publishTimetable(id: string): Promise<{ data: Timetable }> {
  return apiPatch(`${API_BASE}/timetables/${id}/publish`)
}

export async function deleteTimetable(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/timetables/${id}`)
}

// ==================== TIMETABLE ENTRIES ====================

export async function createTimetableEntry(
  timetableId: string,
  data: Omit<CreateTimetableEntryRequest, 'timetableId'>
): Promise<{ data: TimetableEntry }> {
  return apiPost(`${API_BASE}/timetables/${timetableId}/entries`, data)
}

export async function deleteTimetableEntry(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/entries/${id}`)
}

// ==================== TEACHER TIMETABLE ====================

export async function fetchTeacherTimetable(
  teacherId: string
): Promise<{ data: { teacherId: string; entries: TimetableEntry[] } }> {
  return apiGet(`${API_BASE}/teachers/${teacherId}/timetable`)
}

// ==================== ROOM TIMETABLE ====================

export async function fetchRoomTimetable(
  roomId: string
): Promise<{ data: { roomId: string; entries: TimetableEntry[] } }> {
  return apiGet(`${API_BASE}/rooms/${roomId}/timetable`)
}

// ==================== SUBSTITUTIONS ====================

export async function fetchSubstitutions(
  filters: SubstitutionFilters = {}
): Promise<PaginatedResponse<Substitution>> {
  const params = new URLSearchParams()
  if (filters.date) params.set('date', filters.date)
  if (filters.status) params.set('status', filters.status)
  if (filters.teacherId) params.set('teacherId', filters.teacherId)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet(`${API_BASE}/substitutions?${params}`)
}

export async function createSubstitution(
  data: CreateSubstitutionRequest
): Promise<{ data: Substitution }> {
  return apiPost(`${API_BASE}/substitutions`, data)
}

export async function approveSubstitution(id: string): Promise<{ data: Substitution }> {
  return apiPatch(`${API_BASE}/substitutions/${id}/approve`)
}

export async function rejectSubstitution(id: string): Promise<{ data: Substitution }> {
  return apiPatch(`${API_BASE}/substitutions/${id}/reject`)
}

export async function deleteSubstitution(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/substitutions/${id}`)
}
