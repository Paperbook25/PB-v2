import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  Student,
  StudentFilters,
  CreateStudentRequest,
  UpdateStudentRequest,
  TimelineEvent,
  StudentDocument,
  PromotionRequest,
  PromotionResult,
  StudentHealthRecord,
  IDCardData,
  BulkImportResult,
} from '../types/student.types'

const API_BASE = '/api/students'

// ==================== CRUD ====================

export async function fetchStudents(
  filters: StudentFilters = {}
): Promise<PaginatedResponse<Student>> {
  const params = new URLSearchParams()

  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.search) params.set('search', filters.search)
  if (filters.class) params.set('class', filters.class)
  if (filters.section) params.set('section', filters.section)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)

  return apiGet<PaginatedResponse<Student>>(`${API_BASE}?${params.toString()}`)
}

export async function fetchStudent(id: string): Promise<{ data: Student }> {
  return apiGet<{ data: Student }>(`${API_BASE}/${id}`)
}

export async function createStudent(data: CreateStudentRequest): Promise<{ data: Student }> {
  return apiPost<{ data: Student }>(API_BASE, data)
}

export async function updateStudent(
  id: string,
  data: UpdateStudentRequest
): Promise<{ data: Student }> {
  return apiPut<{ data: Student }>(`${API_BASE}/${id}`, data)
}

export async function deleteStudent(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/${id}`)
}

// ==================== TIMELINE ====================

export async function fetchStudentTimeline(id: string): Promise<{ data: TimelineEvent[] }> {
  return apiGet<{ data: TimelineEvent[] }>(`${API_BASE}/${id}/timeline`)
}

// ==================== DOCUMENTS ====================

export async function fetchStudentDocuments(id: string): Promise<{ data: StudentDocument[] }> {
  return apiGet<{ data: StudentDocument[] }>(`${API_BASE}/${id}/documents`)
}

export async function uploadStudentDocument(
  studentId: string,
  data: { type: string; name: string; fileName: string; fileSize: number; mimeType: string }
): Promise<{ data: StudentDocument }> {
  return apiPost<{ data: StudentDocument }>(`${API_BASE}/${studentId}/documents`, data)
}

export async function deleteStudentDocument(
  studentId: string,
  docId: string
): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/${studentId}/documents/${docId}`)
}

export async function verifyStudentDocument(
  studentId: string,
  docId: string
): Promise<{ data: StudentDocument }> {
  return apiPatch<{ data: StudentDocument }>(`${API_BASE}/${studentId}/documents/${docId}/verify`)
}

// ==================== PROMOTION ====================

export async function promoteStudents(
  data: PromotionRequest
): Promise<{ data: PromotionResult }> {
  return apiPost<{ data: PromotionResult }>(`${API_BASE}/promote`, data)
}

// ==================== SIBLINGS ====================

export async function fetchStudentSiblings(
  id: string
): Promise<{ data: { id: string; name: string; class: string; section: string; rollNumber: number; photoUrl: string }[] }> {
  return apiGet<{ data: { id: string; name: string; class: string; section: string; rollNumber: number; photoUrl: string }[] }>(`${API_BASE}/${id}/siblings`)
}

export async function linkSibling(
  studentId: string,
  siblingId: string
): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/${studentId}/siblings`, { siblingId })
}

export async function unlinkSibling(
  studentId: string,
  siblingId: string
): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/${studentId}/siblings/${siblingId}`)
}

// ==================== HEALTH RECORDS ====================

export async function fetchStudentHealth(
  id: string
): Promise<{ data: StudentHealthRecord | null }> {
  return apiGet<{ data: StudentHealthRecord | null }>(`${API_BASE}/${id}/health`)
}

export async function updateStudentHealth(
  id: string,
  data: StudentHealthRecord
): Promise<{ data: StudentHealthRecord }> {
  return apiPut<{ data: StudentHealthRecord }>(`${API_BASE}/${id}/health`, data)
}

// ==================== ID CARD ====================

export async function fetchIDCardData(id: string): Promise<{ data: IDCardData }> {
  return apiGet<{ data: IDCardData }>(`${API_BASE}/${id}/id-card`)
}

// ==================== BULK IMPORT/EXPORT ====================

export async function bulkImportStudents(
  rows: Record<string, string>[]
): Promise<{ data: BulkImportResult }> {
  return apiPost<{ data: BulkImportResult }>(`${API_BASE}/bulk-import`, { rows })
}

export async function exportStudents(
  filters?: { class?: string; section?: string }
): Promise<{ data: Record<string, string | number>[] }> {
  const params = new URLSearchParams()
  if (filters?.class) params.set('class', filters.class)
  if (filters?.section) params.set('section', filters.section)
  return apiGet<{ data: Record<string, string | number>[] }>(`${API_BASE}/export?${params}`)
}

// ==================== MESSAGING ====================

export async function sendParentMessage(
  studentId: string,
  data: { channel: 'sms' | 'email' | 'whatsapp' | 'all'; subject?: string; message: string }
): Promise<{ data: { success: boolean; sentVia: string[] } }> {
  return apiPost<{ data: { success: boolean; sentVia: string[] } }>(`${API_BASE}/${studentId}/message-parent`, data)
}

// ==================== CROSS-MODULE LOOKUPS ====================

import type { RoomAllocation } from '@/features/hostel/types/hostel.types'
import type { Alumni } from '@/features/alumni/types/alumni.types'

export async function fetchStudentHostelAllocation(
  studentId: string
): Promise<{ data: RoomAllocation | null }> {
  return apiGet<{ data: RoomAllocation | null }>(`${API_BASE}/${studentId}/hostel`)
}

export async function fetchStudentAlumniRecord(
  studentId: string
): Promise<{ data: Alumni | null }> {
  return apiGet<{ data: Alumni | null }>(`${API_BASE}/${studentId}/alumni`)
}

// ==================== PORTFOLIO & SKILLS ====================

import type {
  StudentPortfolio,
  StudentSkill,
  PortfolioItem,
  LearningStyleAssessment,
  LearningPreferences,
  StudentRiskProfile,
  RiskIndicator,
  RiskIntervention,
  StudentGraduationProgress,
  PromotionHistory,
  StudentTeacherRelationship,
  TeacherFeedback,
  MentorshipRecord,
} from '../types/student.types'

export async function fetchStudentPortfolio(
  studentId: string
): Promise<{ data: StudentPortfolio }> {
  return apiGet<{ data: StudentPortfolio }>(`${API_BASE}/${studentId}/portfolio`)
}

export async function updateStudentPortfolio(
  studentId: string,
  data: Partial<StudentPortfolio>
): Promise<{ data: StudentPortfolio }> {
  return apiPut<{ data: StudentPortfolio }>(`${API_BASE}/${studentId}/portfolio`, data)
}

export async function addStudentSkill(
  studentId: string,
  skill: Omit<StudentSkill, 'id' | 'studentId'>
): Promise<{ data: StudentSkill }> {
  return apiPost<{ data: StudentSkill }>(`${API_BASE}/${studentId}/skills`, skill)
}

export async function updateStudentSkill(
  studentId: string,
  skillId: string,
  data: Partial<StudentSkill>
): Promise<{ data: StudentSkill }> {
  return apiPut<{ data: StudentSkill }>(`${API_BASE}/${studentId}/skills/${skillId}`, data)
}

export async function deleteStudentSkill(
  studentId: string,
  skillId: string
): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/${studentId}/skills/${skillId}`)
}

export async function addPortfolioItem(
  studentId: string,
  item: Omit<PortfolioItem, 'id' | 'studentId'>
): Promise<{ data: PortfolioItem }> {
  return apiPost<{ data: PortfolioItem }>(`${API_BASE}/${studentId}/portfolio/items`, item)
}

export async function updatePortfolioItem(
  studentId: string,
  itemId: string,
  data: Partial<PortfolioItem>
): Promise<{ data: PortfolioItem }> {
  return apiPut<{ data: PortfolioItem }>(`${API_BASE}/${studentId}/portfolio/items/${itemId}`, data)
}

export async function deletePortfolioItem(
  studentId: string,
  itemId: string
): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/${studentId}/portfolio/items/${itemId}`)
}

// ==================== LEARNING STYLE ASSESSMENT ====================

export async function fetchLearningStyleAssessments(
  studentId: string
): Promise<{ data: LearningStyleAssessment[] }> {
  return apiGet<{ data: LearningStyleAssessment[] }>(`${API_BASE}/${studentId}/learning-style`)
}

export async function createLearningStyleAssessment(
  studentId: string,
  data: Omit<LearningStyleAssessment, 'id' | 'studentId'>
): Promise<{ data: LearningStyleAssessment }> {
  return apiPost<{ data: LearningStyleAssessment }>(`${API_BASE}/${studentId}/learning-style`, data)
}

export async function fetchLearningPreferences(
  studentId: string
): Promise<{ data: LearningPreferences | null }> {
  return apiGet<{ data: LearningPreferences | null }>(`${API_BASE}/${studentId}/learning-preferences`)
}

export async function updateLearningPreferences(
  studentId: string,
  data: Omit<LearningPreferences, 'studentId'>
): Promise<{ data: LearningPreferences }> {
  return apiPut<{ data: LearningPreferences }>(`${API_BASE}/${studentId}/learning-preferences`, data)
}

// ==================== RISK INDICATORS ====================

export async function fetchStudentRiskProfile(
  studentId: string
): Promise<{ data: StudentRiskProfile }> {
  return apiGet<{ data: StudentRiskProfile }>(`${API_BASE}/${studentId}/risk-profile`)
}

export async function createRiskIndicator(
  studentId: string,
  data: Omit<RiskIndicator, 'id' | 'studentId' | 'interventions'>
): Promise<{ data: RiskIndicator }> {
  return apiPost<{ data: RiskIndicator }>(`${API_BASE}/${studentId}/risk-indicators`, data)
}

export async function updateRiskIndicator(
  studentId: string,
  indicatorId: string,
  data: Partial<RiskIndicator>
): Promise<{ data: RiskIndicator }> {
  return apiPut<{ data: RiskIndicator }>(`${API_BASE}/${studentId}/risk-indicators/${indicatorId}`, data)
}

export async function addRiskIntervention(
  studentId: string,
  indicatorId: string,
  data: Omit<RiskIntervention, 'id' | 'riskId'>
): Promise<{ data: RiskIntervention }> {
  return apiPost<{ data: RiskIntervention }>(
    `${API_BASE}/${studentId}/risk-indicators/${indicatorId}/interventions`,
    data
  )
}

export async function updateRiskIntervention(
  studentId: string,
  indicatorId: string,
  interventionId: string,
  data: Partial<RiskIntervention>
): Promise<{ data: RiskIntervention }> {
  return apiPut<{ data: RiskIntervention }>(
    `${API_BASE}/${studentId}/risk-indicators/${indicatorId}/interventions/${interventionId}`,
    data
  )
}

export async function fetchAtRiskStudents(
  filters?: { level?: string; category?: string }
): Promise<{ data: { studentId: string; studentName: string; riskProfile: StudentRiskProfile }[] }> {
  const params = new URLSearchParams()
  if (filters?.level) params.set('level', filters.level)
  if (filters?.category) params.set('category', filters.category)
  return apiGet<{ data: { studentId: string; studentName: string; riskProfile: StudentRiskProfile }[] }>(
    `${API_BASE}/at-risk?${params.toString()}`
  )
}

// ==================== GRADUATION & PROMOTION TRACKING ====================

export async function fetchGraduationProgress(
  studentId: string
): Promise<{ data: StudentGraduationProgress }> {
  return apiGet<{ data: StudentGraduationProgress }>(`${API_BASE}/${studentId}/graduation-progress`)
}

export async function updateGraduationProgress(
  studentId: string,
  data: Partial<StudentGraduationProgress>
): Promise<{ data: StudentGraduationProgress }> {
  return apiPut<{ data: StudentGraduationProgress }>(`${API_BASE}/${studentId}/graduation-progress`, data)
}

export async function fetchPromotionHistory(
  studentId: string
): Promise<{ data: PromotionHistory[] }> {
  return apiGet<{ data: PromotionHistory[] }>(`${API_BASE}/${studentId}/promotion-history`)
}

export async function fetchGraduationDashboard(
  filters?: { class?: string; year?: string }
): Promise<{
  data: {
    totalStudents: number
    onTrack: number
    atRisk: number
    graduated: number
    byClass: { class: string; total: number; onTrack: number; atRisk: number }[]
  }
}> {
  const params = new URLSearchParams()
  if (filters?.class) params.set('class', filters.class)
  if (filters?.year) params.set('year', filters.year)
  return apiGet(`${API_BASE}/graduation-dashboard?${params.toString()}`)
}

// ==================== STUDENT-TEACHER RELATIONSHIPS ====================

export async function fetchStudentTeacherRelationships(
  studentId: string
): Promise<{ data: StudentTeacherRelationship[] }> {
  return apiGet<{ data: StudentTeacherRelationship[] }>(`${API_BASE}/${studentId}/teachers`)
}

export async function addStudentTeacherRelationship(
  studentId: string,
  data: Omit<StudentTeacherRelationship, 'id' | 'studentId'>
): Promise<{ data: StudentTeacherRelationship }> {
  return apiPost<{ data: StudentTeacherRelationship }>(`${API_BASE}/${studentId}/teachers`, data)
}

export async function updateStudentTeacherRelationship(
  studentId: string,
  relationshipId: string,
  data: Partial<StudentTeacherRelationship>
): Promise<{ data: StudentTeacherRelationship }> {
  return apiPut<{ data: StudentTeacherRelationship }>(
    `${API_BASE}/${studentId}/teachers/${relationshipId}`,
    data
  )
}

export async function fetchTeacherFeedback(
  studentId: string,
  filters?: { term?: string; academicYear?: string }
): Promise<{ data: TeacherFeedback[] }> {
  const params = new URLSearchParams()
  if (filters?.term) params.set('term', filters.term)
  if (filters?.academicYear) params.set('academicYear', filters.academicYear)
  return apiGet<{ data: TeacherFeedback[] }>(`${API_BASE}/${studentId}/teacher-feedback?${params.toString()}`)
}

export async function createTeacherFeedback(
  studentId: string,
  data: Omit<TeacherFeedback, 'id' | 'studentId'>
): Promise<{ data: TeacherFeedback }> {
  return apiPost<{ data: TeacherFeedback }>(`${API_BASE}/${studentId}/teacher-feedback`, data)
}

export async function fetchMentorship(
  studentId: string
): Promise<{ data: MentorshipRecord | null }> {
  return apiGet<{ data: MentorshipRecord | null }>(`${API_BASE}/${studentId}/mentorship`)
}

export async function updateMentorship(
  studentId: string,
  data: Partial<MentorshipRecord>
): Promise<{ data: MentorshipRecord }> {
  return apiPut<{ data: MentorshipRecord }>(`${API_BASE}/${studentId}/mentorship`, data)
}

export async function addMentorshipSession(
  studentId: string,
  session: MentorshipRecord['sessions'][0]
): Promise<{ data: MentorshipRecord }> {
  return apiPost<{ data: MentorshipRecord }>(`${API_BASE}/${studentId}/mentorship/sessions`, session)
}
