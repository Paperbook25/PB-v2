import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type {
  Alumni,
  AlumniAchievement,
  AlumniContribution,
  AlumniEvent,
  EventRegistration,
  AlumniStats,
  BatchStats,
  CreateAlumniPayload,
  UpdateAlumniPayload,
  CreateAchievementPayload,
  CreateContributionPayload,
  CreateEventPayload,
  AlumniFilters,
  AchievementFilters,
  ContributionFilters,
  EventFilters,
  ContributionStatus,
  EventStatus,
} from '../types/alumni.types'

// Stats
export const getAlumniStats = () => apiGet<{ data: AlumniStats }>('/api/alumni/stats')

export const getBatchStats = () => apiGet<{ data: BatchStats[] }>('/api/alumni/batches/stats')

// Alumni CRUD
export const getAlumni = (filters?: AlumniFilters & { page?: number; limit?: number }) => {
  const params = new URLSearchParams()
  if (filters?.batch) params.append('batch', filters.batch)
  if (filters?.isVerified !== undefined) params.append('isVerified', String(filters.isVerified))
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.limit) params.append('limit', String(filters.limit))
  const query = params.toString()
  return apiGet<{ data: Alumni[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
    `/api/alumni${query ? `?${query}` : ''}`
  )
}

export const getAlumnusById = (id: string) => apiGet<{ data: Alumni }>(`/api/alumni/${id}`)

export const createAlumni = (data: CreateAlumniPayload) => apiPost<{ data: Alumni }>('/api/alumni', data)

export const updateAlumni = (id: string, data: UpdateAlumniPayload) =>
  apiPut<{ data: Alumni }>(`/api/alumni/${id}`, data)

export const verifyAlumni = (id: string) => apiPatch<{ data: Alumni }>(`/api/alumni/${id}/verify`, {})

export const deleteAlumni = (id: string) => apiDelete(`/api/alumni/${id}`)

// Achievements
export const getAchievements = (filters?: AchievementFilters) => {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.isPublished !== undefined) params.append('isPublished', String(filters.isPublished))
  if (filters?.alumniId) params.append('alumniId', filters.alumniId)
  const query = params.toString()
  return apiGet<{ data: AlumniAchievement[] }>(`/api/alumni/achievements${query ? `?${query}` : ''}`)
}

export const createAchievement = (data: CreateAchievementPayload) =>
  apiPost<{ data: AlumniAchievement }>('/api/alumni/achievements', data)

export const updateAchievement = (id: string, data: Partial<AlumniAchievement>) =>
  apiPut<{ data: AlumniAchievement }>(`/api/alumni/achievements/${id}`, data)

export const publishAchievement = (id: string, isPublished: boolean) =>
  apiPatch<{ data: AlumniAchievement }>(`/api/alumni/achievements/${id}/publish`, { isPublished })

export const deleteAchievement = (id: string) => apiDelete(`/api/alumni/achievements/${id}`)

// Contributions
export const getContributions = (filters?: ContributionFilters) => {
  const params = new URLSearchParams()
  if (filters?.type) params.append('type', filters.type)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.alumniId) params.append('alumniId', filters.alumniId)
  const query = params.toString()
  return apiGet<{ data: AlumniContribution[] }>(`/api/alumni/contributions${query ? `?${query}` : ''}`)
}

export const createContribution = (data: CreateContributionPayload) =>
  apiPost<{ data: AlumniContribution }>('/api/alumni/contributions', data)

export const updateContributionStatus = (
  id: string,
  status: ContributionStatus,
  acknowledgement?: string
) =>
  apiPatch<{ data: AlumniContribution }>(`/api/alumni/contributions/${id}/status`, {
    status,
    acknowledgement,
  })

export const deleteContribution = (id: string) => apiDelete(`/api/alumni/contributions/${id}`)

// Events
export const getEvents = (filters?: EventFilters) => {
  const params = new URLSearchParams()
  if (filters?.type) params.append('type', filters.type)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.batch) params.append('batch', filters.batch)
  const query = params.toString()
  return apiGet<{ data: AlumniEvent[] }>(`/api/alumni/events${query ? `?${query}` : ''}`)
}

export const getEventById = (id: string) => apiGet<{ data: AlumniEvent }>(`/api/alumni/events/${id}`)

export const createEvent = (data: CreateEventPayload) =>
  apiPost<{ data: AlumniEvent }>('/api/alumni/events', data)

export const updateEvent = (id: string, data: Partial<AlumniEvent>) =>
  apiPut<{ data: AlumniEvent }>(`/api/alumni/events/${id}`, data)

export const updateEventStatus = (id: string, status: EventStatus) =>
  apiPatch<{ data: AlumniEvent }>(`/api/alumni/events/${id}/status`, { status })

export const deleteEvent = (id: string) => apiDelete(`/api/alumni/events/${id}`)

// Event Registrations
export const getEventRegistrations = (eventId: string) =>
  apiGet<{ data: EventRegistration[] }>(`/api/alumni/events/${eventId}/registrations`)

export const registerForEvent = (eventId: string, alumniId: string) =>
  apiPost<{ data: EventRegistration }>(`/api/alumni/events/${eventId}/register`, { alumniId })

export const cancelEventRegistration = (eventId: string, alumniId: string) =>
  apiDelete(`/api/alumni/events/${eventId}/register/${alumniId}`)

// ==================== GRADUATION ====================

export interface GraduateStudentPayload {
  studentId: string
  batchYear: string
  occupation?: string
  company?: string
  currentCity?: string
  currentCountry?: string
}

export interface GraduationResult {
  alumni: Alumni
  student: { id: string; name: string; status: string }
}

export interface BatchGraduationPayload {
  studentIds: string[]
  batchYear: string
}

export interface BatchGraduationResult {
  total: number
  graduated: number
  failed: number
  results: Array<{
    studentId: string
    studentName: string
    success: boolean
    alumniId?: string
    error?: string
  }>
}

export interface EligibleForGraduation {
  id: string
  name: string
  class: string
  section: string
  rollNumber: number
  admissionNumber: string
  photoUrl: string
}

export const graduateStudent = (data: GraduateStudentPayload) =>
  apiPost<{ data: GraduationResult }>('/api/alumni/graduate', data)

export const graduateBatch = (data: BatchGraduationPayload) =>
  apiPost<{ data: BatchGraduationResult }>('/api/alumni/graduate-batch', data)

export const getEligibleForGraduation = () =>
  apiGet<{ data: EligibleForGraduation[] }>('/api/alumni/eligible-for-graduation')
