import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  Club,
  CreateClubRequest,
  UpdateClubRequest,
  ClubFilters,
  ClubMembership,
  CreateMembershipRequest,
  UpdateMembershipRequest,
  MembershipFilters,
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityFilters,
  Achievement,
  CreateAchievementRequest,
  UpdateAchievementRequest,
  AchievementFilters,
  ExtracurricularCredit,
  CreateCreditRequest,
  UpdateCreditRequest,
  CreditFilters,
  CreditSummary,
  Competition,
  CreateCompetitionRequest,
  UpdateCompetitionRequest,
  CompetitionFilters,
  CompetitionRegistration,
  ClubStats,
} from '../types/clubs.types'

const API_BASE = '/api/clubs'

// ==================== CLUBS ====================

export async function fetchClubs(
  filters: ClubFilters = {}
): Promise<PaginatedResponse<Club>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.advisorId) params.set('advisorId', filters.advisorId)
  return apiGet(`${API_BASE}?${params}`)
}

export async function fetchClub(id: string): Promise<{ data: Club }> {
  return apiGet(`${API_BASE}/${id}`)
}

export async function createClub(data: CreateClubRequest): Promise<{ data: Club }> {
  return apiPost(API_BASE, data)
}

export async function updateClub(id: string, data: UpdateClubRequest): Promise<{ data: Club }> {
  return apiPut(`${API_BASE}/${id}`, data)
}

export async function deleteClub(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/${id}`)
}

// ==================== MEMBERSHIPS ====================

export async function fetchMemberships(
  filters: MembershipFilters = {}
): Promise<PaginatedResponse<ClubMembership>> {
  const params = new URLSearchParams()
  if (filters.clubId) params.set('clubId', filters.clubId)
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.role && filters.role !== 'all') params.set('role', filters.role)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  return apiGet(`${API_BASE}/memberships?${params}`)
}

export async function fetchMembership(id: string): Promise<{ data: ClubMembership }> {
  return apiGet(`${API_BASE}/memberships/${id}`)
}

export async function createMembership(data: CreateMembershipRequest): Promise<{ data: ClubMembership }> {
  return apiPost(`${API_BASE}/memberships`, data)
}

export async function updateMembership(id: string, data: UpdateMembershipRequest): Promise<{ data: ClubMembership }> {
  return apiPatch(`${API_BASE}/memberships/${id}`, data)
}

export async function deleteMembership(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/memberships/${id}`)
}

// ==================== ACTIVITIES ====================

export async function fetchActivities(
  filters: ActivityFilters = {}
): Promise<PaginatedResponse<Activity>> {
  const params = new URLSearchParams()
  if (filters.clubId) params.set('clubId', filters.clubId)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  return apiGet(`${API_BASE}/activities?${params}`)
}

export async function fetchActivity(id: string): Promise<{ data: Activity }> {
  return apiGet(`${API_BASE}/activities/${id}`)
}

export async function createActivity(data: CreateActivityRequest): Promise<{ data: Activity }> {
  return apiPost(`${API_BASE}/activities`, data)
}

export async function updateActivity(id: string, data: UpdateActivityRequest): Promise<{ data: Activity }> {
  return apiPut(`${API_BASE}/activities/${id}`, data)
}

export async function deleteActivity(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/activities/${id}`)
}

// ==================== ACHIEVEMENTS ====================

export async function fetchAchievements(
  filters: AchievementFilters = {}
): Promise<PaginatedResponse<Achievement>> {
  const params = new URLSearchParams()
  if (filters.clubId) params.set('clubId', filters.clubId)
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.level && filters.level !== 'all') params.set('level', filters.level)
  if (filters.isVerified !== undefined) params.set('isVerified', String(filters.isVerified))
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  return apiGet(`${API_BASE}/achievements?${params}`)
}

export async function fetchAchievement(id: string): Promise<{ data: Achievement }> {
  return apiGet(`${API_BASE}/achievements/${id}`)
}

export async function createAchievement(data: CreateAchievementRequest): Promise<{ data: Achievement }> {
  return apiPost(`${API_BASE}/achievements`, data)
}

export async function updateAchievement(id: string, data: UpdateAchievementRequest): Promise<{ data: Achievement }> {
  return apiPut(`${API_BASE}/achievements/${id}`, data)
}

export async function deleteAchievement(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/achievements/${id}`)
}

export async function verifyAchievement(id: string): Promise<{ data: Achievement }> {
  return apiPatch(`${API_BASE}/achievements/${id}/verify`)
}

// ==================== EXTRACURRICULAR CREDITS ====================

export async function fetchCredits(
  filters: CreditFilters = {}
): Promise<PaginatedResponse<ExtracurricularCredit>> {
  const params = new URLSearchParams()
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.clubId) params.set('clubId', filters.clubId)
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.academicYear) params.set('academicYear', filters.academicYear)
  if (filters.semester) params.set('semester', filters.semester)
  return apiGet(`${API_BASE}/credits?${params}`)
}

export async function fetchCredit(id: string): Promise<{ data: ExtracurricularCredit }> {
  return apiGet(`${API_BASE}/credits/${id}`)
}

export async function createCredit(data: CreateCreditRequest): Promise<{ data: ExtracurricularCredit }> {
  return apiPost(`${API_BASE}/credits`, data)
}

export async function updateCredit(id: string, data: UpdateCreditRequest): Promise<{ data: ExtracurricularCredit }> {
  return apiPatch(`${API_BASE}/credits/${id}`, data)
}

export async function deleteCredit(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/credits/${id}`)
}

export async function fetchCreditSummary(studentId: string): Promise<{ data: CreditSummary }> {
  return apiGet(`${API_BASE}/credits/summary/${studentId}`)
}

export async function approveCredit(id: string): Promise<{ data: ExtracurricularCredit }> {
  return apiPatch(`${API_BASE}/credits/${id}/approve`)
}

export async function rejectCredit(id: string, reason: string): Promise<{ data: ExtracurricularCredit }> {
  return apiPatch(`${API_BASE}/credits/${id}/reject`, { reason })
}

// ==================== COMPETITIONS ====================

export async function fetchCompetitions(
  filters: CompetitionFilters = {}
): Promise<PaginatedResponse<Competition>> {
  const params = new URLSearchParams()
  if (filters.clubId) params.set('clubId', filters.clubId)
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.level && filters.level !== 'all') params.set('level', filters.level)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  return apiGet(`${API_BASE}/competitions?${params}`)
}

export async function fetchCompetition(id: string): Promise<{ data: Competition }> {
  return apiGet(`${API_BASE}/competitions/${id}`)
}

export async function createCompetition(data: CreateCompetitionRequest): Promise<{ data: Competition }> {
  return apiPost(`${API_BASE}/competitions`, data)
}

export async function updateCompetition(id: string, data: UpdateCompetitionRequest): Promise<{ data: Competition }> {
  return apiPut(`${API_BASE}/competitions/${id}`, data)
}

export async function deleteCompetition(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/competitions/${id}`)
}

// ==================== COMPETITION REGISTRATIONS ====================

export async function fetchCompetitionRegistrations(
  competitionId: string
): Promise<{ data: CompetitionRegistration[] }> {
  return apiGet(`${API_BASE}/competitions/${competitionId}/registrations`)
}

export async function registerForCompetition(
  competitionId: string,
  data: { studentId: string; teamName?: string; teamMembers?: { studentId: string }[] }
): Promise<{ data: CompetitionRegistration }> {
  return apiPost(`${API_BASE}/competitions/${competitionId}/register`, data)
}

export async function updateRegistration(
  id: string,
  data: { status?: CompetitionRegistration['status']; paymentStatus?: CompetitionRegistration['paymentStatus'] }
): Promise<{ data: CompetitionRegistration }> {
  return apiPatch(`${API_BASE}/registrations/${id}`, data)
}

export async function withdrawRegistration(id: string): Promise<{ success: boolean }> {
  return apiPatch(`${API_BASE}/registrations/${id}/withdraw`)
}

// ==================== STATISTICS ====================

export async function fetchClubStats(): Promise<{ data: ClubStats }> {
  return apiGet(`${API_BASE}/stats`)
}

export async function fetchClubDetailStats(clubId: string): Promise<{ data: ClubStats }> {
  return apiGet(`${API_BASE}/${clubId}/stats`)
}

// ==================== UTILITY ====================

export async function fetchAvailableStudents(clubId?: string): Promise<{ data: { id: string; name: string; class: string; section: string }[] }> {
  const params = new URLSearchParams()
  if (clubId) params.set('excludeClubId', clubId)
  return apiGet(`${API_BASE}/students?${params}`)
}

export async function fetchAvailableAdvisors(): Promise<{ data: { id: string; name: string; department: string }[] }> {
  return apiGet(`${API_BASE}/advisors`)
}
