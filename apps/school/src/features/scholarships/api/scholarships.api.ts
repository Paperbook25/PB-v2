import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  Scholarship,
  ScholarshipFilters,
  CreateScholarshipRequest,
  UpdateScholarshipRequest,
  EligibilityCriteria,
  CreateEligibilityCriteriaRequest,
  EligibilityResult,
  ScholarshipApplication,
  ApplicationFilters,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  SelectionCommittee,
  CreateCommitteeRequest,
  UpdateCommitteeRequest,
  ReviewScore,
  CreateReviewScoreRequest,
  ApplicationReviewSummary,
  DisbursementSchedule,
  CreateDisbursementScheduleRequest,
  Disbursement,
  DisbursementFilters,
  ProcessDisbursementRequest,
  RenewalCriteria,
  CreateRenewalCriteriaRequest,
  RenewalApplication,
  RenewalFilters,
  ScholarshipStats,
  StudentScholarshipSummary,
} from '../types/scholarships.types'

const API_BASE = '/api/scholarships'

// ==================== SCHOLARSHIPS CRUD ====================

export async function fetchScholarships(
  filters: ScholarshipFilters = {}
): Promise<PaginatedResponse<Scholarship>> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.academicYear) params.set('academicYear', filters.academicYear)
  if (filters.fundingSource && filters.fundingSource !== 'all') {
    params.set('fundingSource', filters.fundingSource)
  }

  return apiGet<PaginatedResponse<Scholarship>>(`${API_BASE}?${params.toString()}`)
}

export async function fetchScholarship(id: string): Promise<{ data: Scholarship }> {
  return apiGet<{ data: Scholarship }>(`${API_BASE}/${id}`)
}

export async function createScholarship(
  data: CreateScholarshipRequest
): Promise<{ data: Scholarship }> {
  return apiPost<{ data: Scholarship }>(`${API_BASE}`, data)
}

export async function updateScholarship(
  id: string,
  data: UpdateScholarshipRequest
): Promise<{ data: Scholarship }> {
  return apiPut<{ data: Scholarship }>(`${API_BASE}/${id}`, data)
}

export async function deleteScholarship(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/${id}`)
}

// ==================== ELIGIBILITY CRITERIA ====================

export async function fetchEligibilityCriteria(
  scholarshipId: string
): Promise<{ data: EligibilityCriteria[] }> {
  return apiGet<{ data: EligibilityCriteria[] }>(`${API_BASE}/${scholarshipId}/criteria`)
}

export async function createEligibilityCriteria(
  data: CreateEligibilityCriteriaRequest
): Promise<{ data: EligibilityCriteria }> {
  return apiPost<{ data: EligibilityCriteria }>(
    `${API_BASE}/${data.scholarshipId}/criteria`,
    data
  )
}

export async function updateEligibilityCriteria(
  id: string,
  data: Partial<CreateEligibilityCriteriaRequest>
): Promise<{ data: EligibilityCriteria }> {
  return apiPatch<{ data: EligibilityCriteria }>(`${API_BASE}/criteria/${id}`, data)
}

export async function deleteEligibilityCriteria(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/criteria/${id}`)
}

export async function checkStudentEligibility(
  scholarshipId: string,
  studentId: string
): Promise<{ data: EligibilityResult }> {
  return apiGet<{ data: EligibilityResult }>(
    `${API_BASE}/${scholarshipId}/check-eligibility/${studentId}`
  )
}

export async function batchCheckEligibility(
  scholarshipId: string,
  studentIds: string[]
): Promise<{ data: EligibilityResult[] }> {
  return apiPost<{ data: EligibilityResult[] }>(
    `${API_BASE}/${scholarshipId}/batch-check-eligibility`,
    { studentIds }
  )
}

// ==================== APPLICATIONS ====================

export async function fetchApplications(
  filters: ApplicationFilters = {}
): Promise<PaginatedResponse<ScholarshipApplication>> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.scholarshipId) params.set('scholarshipId', filters.scholarshipId)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.studentClass) params.set('studentClass', filters.studentClass)
  if (filters.fromDate) params.set('fromDate', filters.fromDate)
  if (filters.toDate) params.set('toDate', filters.toDate)

  return apiGet<PaginatedResponse<ScholarshipApplication>>(
    `${API_BASE}/applications?${params.toString()}`
  )
}

export async function fetchApplication(id: string): Promise<{ data: ScholarshipApplication }> {
  return apiGet<{ data: ScholarshipApplication }>(`${API_BASE}/applications/${id}`)
}

export async function createApplication(
  data: CreateApplicationRequest
): Promise<{ data: ScholarshipApplication }> {
  return apiPost<{ data: ScholarshipApplication }>(`${API_BASE}/applications`, data)
}

export async function updateApplication(
  id: string,
  data: UpdateApplicationRequest
): Promise<{ data: ScholarshipApplication }> {
  return apiPatch<{ data: ScholarshipApplication }>(`${API_BASE}/applications/${id}`, data)
}

export async function submitApplication(id: string): Promise<{ data: ScholarshipApplication }> {
  return apiPost<{ data: ScholarshipApplication }>(`${API_BASE}/applications/${id}/submit`)
}

export async function withdrawApplication(id: string): Promise<{ data: ScholarshipApplication }> {
  return apiPost<{ data: ScholarshipApplication }>(`${API_BASE}/applications/${id}/withdraw`)
}

export async function updateApplicationStatus(
  id: string,
  status: string,
  data?: { reviewNotes?: string; rejectionReason?: string; approvedAmount?: number }
): Promise<{ data: ScholarshipApplication }> {
  return apiPatch<{ data: ScholarshipApplication }>(`${API_BASE}/applications/${id}/status`, {
    status,
    ...data,
  })
}

export async function uploadApplicationDocument(
  applicationId: string,
  document: { name: string; type: string; url: string }
): Promise<{ data: ScholarshipApplication }> {
  return apiPost<{ data: ScholarshipApplication }>(
    `${API_BASE}/applications/${applicationId}/documents`,
    document
  )
}

// ==================== SELECTION COMMITTEE ====================

export async function fetchCommittees(
  filters: { academicYear?: string; isActive?: boolean; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<SelectionCommittee>> {
  const params = new URLSearchParams()

  if (filters.academicYear) params.set('academicYear', filters.academicYear)
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive))
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<SelectionCommittee>>(
    `${API_BASE}/committees?${params.toString()}`
  )
}

export async function fetchCommittee(id: string): Promise<{ data: SelectionCommittee }> {
  return apiGet<{ data: SelectionCommittee }>(`${API_BASE}/committees/${id}`)
}

export async function createCommittee(
  data: CreateCommitteeRequest
): Promise<{ data: SelectionCommittee }> {
  return apiPost<{ data: SelectionCommittee }>(`${API_BASE}/committees`, data)
}

export async function updateCommittee(
  id: string,
  data: UpdateCommitteeRequest
): Promise<{ data: SelectionCommittee }> {
  return apiPut<{ data: SelectionCommittee }>(`${API_BASE}/committees/${id}`, data)
}

export async function deleteCommittee(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/committees/${id}`)
}

export async function addCommitteeMember(
  committeeId: string,
  member: { staffId: string; role: string; canVote: boolean }
): Promise<{ data: SelectionCommittee }> {
  return apiPost<{ data: SelectionCommittee }>(
    `${API_BASE}/committees/${committeeId}/members`,
    member
  )
}

export async function removeCommitteeMember(
  committeeId: string,
  memberId: string
): Promise<{ data: SelectionCommittee }> {
  return apiDelete<{ data: SelectionCommittee }>(
    `${API_BASE}/committees/${committeeId}/members/${memberId}`
  )
}

// ==================== REVIEW SCORES ====================

export async function fetchReviewScores(
  applicationId: string
): Promise<{ data: ReviewScore[] }> {
  return apiGet<{ data: ReviewScore[] }>(`${API_BASE}/applications/${applicationId}/reviews`)
}

export async function createReviewScore(
  data: CreateReviewScoreRequest
): Promise<{ data: ReviewScore }> {
  return apiPost<{ data: ReviewScore }>(
    `${API_BASE}/applications/${data.applicationId}/reviews`,
    data
  )
}

export async function updateReviewScore(
  id: string,
  data: Partial<CreateReviewScoreRequest>
): Promise<{ data: ReviewScore }> {
  return apiPatch<{ data: ReviewScore }>(`${API_BASE}/reviews/${id}`, data)
}

export async function fetchApplicationReviewSummary(
  applicationId: string
): Promise<{ data: ApplicationReviewSummary }> {
  return apiGet<{ data: ApplicationReviewSummary }>(
    `${API_BASE}/applications/${applicationId}/review-summary`
  )
}

export async function makeFinalDecision(
  applicationId: string,
  decision: { status: string; approvedAmount?: number; notes?: string }
): Promise<{ data: ApplicationReviewSummary }> {
  return apiPost<{ data: ApplicationReviewSummary }>(
    `${API_BASE}/applications/${applicationId}/final-decision`,
    decision
  )
}

// ==================== DISBURSEMENTS ====================

export async function fetchDisbursementSchedules(
  filters: DisbursementFilters = {}
): Promise<PaginatedResponse<DisbursementSchedule>> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.scholarshipId) params.set('scholarshipId', filters.scholarshipId)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.fromDate) params.set('fromDate', filters.fromDate)
  if (filters.toDate) params.set('toDate', filters.toDate)
  if (filters.studentClass) params.set('studentClass', filters.studentClass)

  return apiGet<PaginatedResponse<DisbursementSchedule>>(
    `${API_BASE}/disbursement-schedules?${params.toString()}`
  )
}

export async function fetchDisbursementSchedule(
  id: string
): Promise<{ data: DisbursementSchedule }> {
  return apiGet<{ data: DisbursementSchedule }>(`${API_BASE}/disbursement-schedules/${id}`)
}

export async function createDisbursementSchedule(
  data: CreateDisbursementScheduleRequest
): Promise<{ data: DisbursementSchedule }> {
  return apiPost<{ data: DisbursementSchedule }>(`${API_BASE}/disbursement-schedules`, data)
}

export async function fetchDisbursements(
  filters: DisbursementFilters = {}
): Promise<PaginatedResponse<Disbursement>> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.scholarshipId) params.set('scholarshipId', filters.scholarshipId)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.fromDate) params.set('fromDate', filters.fromDate)
  if (filters.toDate) params.set('toDate', filters.toDate)
  if (filters.studentClass) params.set('studentClass', filters.studentClass)

  return apiGet<PaginatedResponse<Disbursement>>(
    `${API_BASE}/disbursements?${params.toString()}`
  )
}

export async function fetchDisbursement(id: string): Promise<{ data: Disbursement }> {
  return apiGet<{ data: Disbursement }>(`${API_BASE}/disbursements/${id}`)
}

export async function processDisbursement(
  data: ProcessDisbursementRequest
): Promise<{ data: Disbursement }> {
  return apiPost<{ data: Disbursement }>(
    `${API_BASE}/disbursements/${data.disbursementId}/process`,
    data
  )
}

export async function cancelDisbursement(
  id: string,
  reason: string
): Promise<{ data: Disbursement }> {
  return apiPost<{ data: Disbursement }>(`${API_BASE}/disbursements/${id}/cancel`, { reason })
}

// ==================== RENEWALS ====================

export async function fetchRenewalCriteria(
  scholarshipId: string
): Promise<{ data: RenewalCriteria[] }> {
  return apiGet<{ data: RenewalCriteria[] }>(`${API_BASE}/${scholarshipId}/renewal-criteria`)
}

export async function createRenewalCriteria(
  data: CreateRenewalCriteriaRequest
): Promise<{ data: RenewalCriteria }> {
  return apiPost<{ data: RenewalCriteria }>(
    `${API_BASE}/${data.scholarshipId}/renewal-criteria`,
    data
  )
}

export async function updateRenewalCriteria(
  id: string,
  data: Partial<CreateRenewalCriteriaRequest>
): Promise<{ data: RenewalCriteria }> {
  return apiPatch<{ data: RenewalCriteria }>(`${API_BASE}/renewal-criteria/${id}`, data)
}

export async function deleteRenewalCriteria(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/renewal-criteria/${id}`)
}

export async function fetchRenewalApplications(
  filters: RenewalFilters = {}
): Promise<PaginatedResponse<RenewalApplication>> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.scholarshipId) params.set('scholarshipId', filters.scholarshipId)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.academicYear) params.set('academicYear', filters.academicYear)
  if (filters.studentClass) params.set('studentClass', filters.studentClass)

  return apiGet<PaginatedResponse<RenewalApplication>>(
    `${API_BASE}/renewals?${params.toString()}`
  )
}

export async function fetchRenewalApplication(
  id: string
): Promise<{ data: RenewalApplication }> {
  return apiGet<{ data: RenewalApplication }>(`${API_BASE}/renewals/${id}`)
}

export async function processRenewal(
  id: string,
  data: {
    renewalStatus: string
    renewedAmount?: number
    changeReason?: string
    reviewNotes?: string
  }
): Promise<{ data: RenewalApplication }> {
  return apiPost<{ data: RenewalApplication }>(`${API_BASE}/renewals/${id}/process`, data)
}

export async function initiateRenewalReview(
  scholarshipId: string,
  academicYear: string
): Promise<{ data: { initiated: number; skipped: number } }> {
  return apiPost<{ data: { initiated: number; skipped: number } }>(
    `${API_BASE}/${scholarshipId}/initiate-renewal`,
    { academicYear }
  )
}

// ==================== STATISTICS ====================

export async function fetchScholarshipStats(): Promise<{ data: ScholarshipStats }> {
  return apiGet<{ data: ScholarshipStats }>(`${API_BASE}/stats`)
}

export async function fetchStudentScholarshipSummary(
  studentId: string
): Promise<{ data: StudentScholarshipSummary }> {
  return apiGet<{ data: StudentScholarshipSummary }>(`${API_BASE}/student/${studentId}/summary`)
}
