import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  AddDocumentRequest,
  AddNoteRequest,
  Application,
  ApplicationDocument,
  ApplicationFilters,
  ApplicationNote,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  UpdateStatusRequest,
  WaitlistEntry,
  ClassCapacity,
  EntranceExamSchedule,
  ExamResult,
  ScheduleExamRequest,
  RecordExamScoreRequest,
  CommunicationLog,
  CommunicationTemplate,
  SendCommunicationRequest,
  AdmissionPayment,
  RecordPaymentRequest,
  AdmissionAnalytics,
  // CRM Lead types
  Lead,
  LeadFilters,
  CreateLeadRequest,
  UpdateLeadRequest,
  AddLeadActivityRequest,
  LeadActivity,
  // Marketing Campaign types
  MarketingCampaign,
  CampaignFilters,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  // Interview Feedback types
  InterviewFeedback,
  CreateInterviewFeedbackRequest,
  UpdateInterviewFeedbackRequest,
  // Admission Plan types
  AdmissionPlan,
  CreateAdmissionPlanRequest,
  UpdateAdmissionPlanRequest,
  // Referral types
  ReferralTracking,
  ReferralFilters,
  CreateReferralRequest,
  UpdateReferralRequest,
} from '../types/admission.types'

const API_BASE = '/api/admissions'

interface ApplicationsResponse extends PaginatedResponse<Application> {}

interface ApplicationStatsResponse {
  data: {
    total: number
    byStatus: Record<string, number>
    byClass: Record<string, number>
    thisMonth: number
    pendingReview: number
  }
}

export async function fetchApplications(
  filters: ApplicationFilters & { page?: number; limit?: number } = {}
): Promise<ApplicationsResponse> {
  const params = new URLSearchParams()

  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.search) params.set('search', filters.search)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.class) params.set('class', filters.class)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)

  return apiGet<ApplicationsResponse>(`${API_BASE}?${params.toString()}`)
}

export async function fetchApplicationStats(): Promise<ApplicationStatsResponse> {
  return apiGet<ApplicationStatsResponse>(`${API_BASE}/stats`)
}

export async function fetchApplication(id: string): Promise<{ data: Application }> {
  return apiGet<{ data: Application }>(`${API_BASE}/${id}`)
}

export async function createApplication(data: CreateApplicationRequest): Promise<{ data: Application }> {
  return apiPost<{ data: Application }>(API_BASE, data)
}

export async function updateApplication(
  id: string,
  data: UpdateApplicationRequest
): Promise<{ data: Application }> {
  return apiPut<{ data: Application }>(`${API_BASE}/${id}`, data)
}

export async function updateApplicationStatus(
  id: string,
  data: UpdateStatusRequest
): Promise<{ data: Application }> {
  return apiPatch<{ data: Application }>(`${API_BASE}/${id}/status`, data)
}

export async function addDocument(
  applicationId: string,
  data: AddDocumentRequest
): Promise<{ data: ApplicationDocument }> {
  return apiPost<{ data: ApplicationDocument }>(`${API_BASE}/${applicationId}/documents`, data)
}

export async function updateDocumentStatus(
  applicationId: string,
  documentId: string,
  data: { status: 'verified' | 'rejected'; rejectionReason?: string }
): Promise<{ data: ApplicationDocument }> {
  return apiPatch<{ data: ApplicationDocument }>(`${API_BASE}/${applicationId}/documents/${documentId}`, data)
}

export async function addNote(applicationId: string, data: AddNoteRequest): Promise<{ data: ApplicationNote }> {
  return apiPost<{ data: ApplicationNote }>(`${API_BASE}/${applicationId}/notes`, data)
}

export async function scheduleInterview(
  applicationId: string,
  interviewDate: string
): Promise<{ data: Application }> {
  return apiPatch<{ data: Application }>(`${API_BASE}/${applicationId}/interview`, { interviewDate })
}

export async function scheduleEntranceExam(
  applicationId: string,
  entranceExamDate: string
): Promise<{ data: Application }> {
  return apiPatch<{ data: Application }>(`${API_BASE}/${applicationId}/entrance-exam`, { entranceExamDate })
}

export async function deleteApplication(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/${id}`)
}

// ==================== WAITLIST API ====================

export async function fetchWaitlist(cls?: string): Promise<{ data: WaitlistEntry[] }> {
  const params = new URLSearchParams()
  if (cls) params.set('class', cls)
  return apiGet<{ data: WaitlistEntry[] }>(`${API_BASE}/waitlist?${params}`)
}

export async function fetchClassCapacity(): Promise<{ data: ClassCapacity[] }> {
  return apiGet<{ data: ClassCapacity[] }>(`${API_BASE}/class-capacity`)
}

// ==================== ENTRANCE EXAM API ====================

export async function fetchExamSchedules(): Promise<{ data: EntranceExamSchedule[] }> {
  return apiGet<{ data: EntranceExamSchedule[] }>(`${API_BASE}/exam-schedules`)
}

export async function createExamSchedule(data: ScheduleExamRequest): Promise<{ data: EntranceExamSchedule }> {
  return apiPost<{ data: EntranceExamSchedule }>(`${API_BASE}/exam-schedules`, data)
}

export async function fetchExamResults(filters?: { class?: string; scheduleId?: string }): Promise<{ data: ExamResult[] }> {
  const params = new URLSearchParams()
  if (filters?.class) params.set('class', filters.class)
  if (filters?.scheduleId) params.set('scheduleId', filters.scheduleId)
  return apiGet<{ data: ExamResult[] }>(`${API_BASE}/exam-results?${params}`)
}

export async function recordExamScore(applicationId: string, data: Omit<RecordExamScoreRequest, 'applicationId'>): Promise<{ data: Application }> {
  return apiPost<{ data: Application }>(`${API_BASE}/${applicationId}/exam-score`, data)
}

// ==================== COMMUNICATION API ====================

export async function fetchCommunicationLogs(filters?: { applicationId?: string; type?: string }): Promise<{ data: CommunicationLog[] }> {
  const params = new URLSearchParams()
  if (filters?.applicationId) params.set('applicationId', filters.applicationId)
  if (filters?.type) params.set('type', filters.type)
  return apiGet<{ data: CommunicationLog[] }>(`${API_BASE}/communications?${params}`)
}

export async function fetchCommunicationTemplates(): Promise<{ data: CommunicationTemplate[] }> {
  return apiGet<{ data: CommunicationTemplate[] }>(`${API_BASE}/communication-templates`)
}

export async function sendCommunication(data: SendCommunicationRequest): Promise<{ count: number }> {
  return apiPost<{ count: number }>(`${API_BASE}/send-communication`, data)
}

// ==================== PAYMENT API ====================

export async function fetchAdmissionPayments(status?: string): Promise<{ data: AdmissionPayment[] }> {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  return apiGet<{ data: AdmissionPayment[] }>(`${API_BASE}/payments?${params}`)
}

export async function fetchApplicationPayment(applicationId: string): Promise<{ data: AdmissionPayment }> {
  return apiGet<{ data: AdmissionPayment }>(`${API_BASE}/${applicationId}/payment`)
}

export async function recordPayment(data: RecordPaymentRequest): Promise<{ data: AdmissionPayment }> {
  return apiPost<{ data: AdmissionPayment }>(`${API_BASE}/${data.applicationId}/payment`, data)
}

// ==================== ANALYTICS API ====================

export async function fetchAdmissionAnalytics(): Promise<{ data: AdmissionAnalytics }> {
  return apiGet<{ data: AdmissionAnalytics }>(`${API_BASE}/analytics`)
}

// ==================== PUBLIC API ====================

export async function submitPublicApplication(data: CreateApplicationRequest & { source?: string }): Promise<{ data: { applicationNumber: string; message: string } }> {
  return apiPost<{ data: { applicationNumber: string; message: string } }>('/api/public/admissions/apply', data)
}

// ==================== EXPORT ====================

export async function exportApplications(
  filters?: { status?: string; class?: string }
): Promise<{ data: Record<string, string | number>[] }> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.class) params.set('class', filters.class)
  return apiGet<{ data: Record<string, string | number>[] }>(`${API_BASE}/export?${params}`)
}

// ==================== CRM LEAD API ====================

export async function fetchLeads(
  filters: LeadFilters & { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<Lead>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.search) params.set('search', filters.search)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.source && filters.source !== 'all') params.set('source', filters.source)
  if (filters.assignedTo) params.set('assignedTo', filters.assignedTo)
  if (filters.campaignId) params.set('campaignId', filters.campaignId)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  return apiGet<PaginatedResponse<Lead>>(`${API_BASE}/leads?${params}`)
}

export async function fetchLead(id: string): Promise<{ data: Lead }> {
  return apiGet<{ data: Lead }>(`${API_BASE}/leads/${id}`)
}

export async function createLead(data: CreateLeadRequest): Promise<{ data: Lead }> {
  return apiPost<{ data: Lead }>(`${API_BASE}/leads`, data)
}

export async function updateLead(id: string, data: UpdateLeadRequest): Promise<{ data: Lead }> {
  return apiPut<{ data: Lead }>(`${API_BASE}/leads/${id}`, data)
}

export async function deleteLead(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/leads/${id}`)
}

export async function addLeadActivity(
  leadId: string,
  data: AddLeadActivityRequest
): Promise<{ data: LeadActivity }> {
  return apiPost<{ data: LeadActivity }>(`${API_BASE}/leads/${leadId}/activities`, data)
}

export async function convertLeadToApplication(
  leadId: string,
  applicationData: CreateApplicationRequest
): Promise<{ data: { lead: Lead; application: Application } }> {
  return apiPost<{ data: { lead: Lead; application: Application } }>(
    `${API_BASE}/leads/${leadId}/convert`,
    applicationData
  )
}

export async function fetchLeadStats(): Promise<{
  data: {
    total: number
    byStatus: Record<string, number>
    bySource: Record<string, number>
    conversionRate: number
    avgFollowUps: number
  }
}> {
  return apiGet(`${API_BASE}/leads/stats`)
}

// ==================== MARKETING CAMPAIGN API ====================

export async function fetchCampaigns(
  filters: CampaignFilters & { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<MarketingCampaign>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.search) params.set('search', filters.search)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  return apiGet<PaginatedResponse<MarketingCampaign>>(`${API_BASE}/campaigns?${params}`)
}

export async function fetchCampaign(id: string): Promise<{ data: MarketingCampaign }> {
  return apiGet<{ data: MarketingCampaign }>(`${API_BASE}/campaigns/${id}`)
}

export async function createCampaign(data: CreateCampaignRequest): Promise<{ data: MarketingCampaign }> {
  return apiPost<{ data: MarketingCampaign }>(`${API_BASE}/campaigns`, data)
}

export async function updateCampaign(
  id: string,
  data: UpdateCampaignRequest
): Promise<{ data: MarketingCampaign }> {
  return apiPut<{ data: MarketingCampaign }>(`${API_BASE}/campaigns/${id}`, data)
}

export async function deleteCampaign(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/campaigns/${id}`)
}

export async function fetchCampaignAnalytics(): Promise<{
  data: {
    totalCampaigns: number
    activeCampaigns: number
    totalSpent: number
    totalLeads: number
    totalEnrollments: number
    avgRoi: number
    topPerformingCampaigns: MarketingCampaign[]
  }
}> {
  return apiGet(`${API_BASE}/campaigns/analytics`)
}

// ==================== INTERVIEW FEEDBACK API ====================

export async function fetchInterviewFeedbacks(
  filters?: { applicationId?: string; recommendation?: string }
): Promise<{ data: InterviewFeedback[] }> {
  const params = new URLSearchParams()
  if (filters?.applicationId) params.set('applicationId', filters.applicationId)
  if (filters?.recommendation) params.set('recommendation', filters.recommendation)
  return apiGet<{ data: InterviewFeedback[] }>(`${API_BASE}/interview-feedbacks?${params}`)
}

export async function fetchInterviewFeedback(id: string): Promise<{ data: InterviewFeedback }> {
  return apiGet<{ data: InterviewFeedback }>(`${API_BASE}/interview-feedbacks/${id}`)
}

export async function fetchApplicationInterviewFeedback(
  applicationId: string
): Promise<{ data: InterviewFeedback | null }> {
  return apiGet<{ data: InterviewFeedback | null }>(
    `${API_BASE}/${applicationId}/interview-feedback`
  )
}

export async function createInterviewFeedback(
  data: CreateInterviewFeedbackRequest
): Promise<{ data: InterviewFeedback }> {
  return apiPost<{ data: InterviewFeedback }>(`${API_BASE}/interview-feedbacks`, data)
}

export async function updateInterviewFeedback(
  id: string,
  data: UpdateInterviewFeedbackRequest
): Promise<{ data: InterviewFeedback }> {
  return apiPut<{ data: InterviewFeedback }>(`${API_BASE}/interview-feedbacks/${id}`, data)
}

export async function deleteInterviewFeedback(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/interview-feedbacks/${id}`)
}

// ==================== ADMISSION PLAN API ====================

export async function fetchAdmissionPlans(
  filters?: { academicYear?: string; status?: string }
): Promise<{ data: AdmissionPlan[] }> {
  const params = new URLSearchParams()
  if (filters?.academicYear) params.set('academicYear', filters.academicYear)
  if (filters?.status) params.set('status', filters.status)
  return apiGet<{ data: AdmissionPlan[] }>(`${API_BASE}/plans?${params}`)
}

export async function fetchAdmissionPlan(id: string): Promise<{ data: AdmissionPlan }> {
  return apiGet<{ data: AdmissionPlan }>(`${API_BASE}/plans/${id}`)
}

export async function fetchCurrentAdmissionPlan(): Promise<{ data: AdmissionPlan | null }> {
  return apiGet<{ data: AdmissionPlan | null }>(`${API_BASE}/plans/current`)
}

export async function createAdmissionPlan(
  data: CreateAdmissionPlanRequest
): Promise<{ data: AdmissionPlan }> {
  return apiPost<{ data: AdmissionPlan }>(`${API_BASE}/plans`, data)
}

export async function updateAdmissionPlan(
  id: string,
  data: UpdateAdmissionPlanRequest
): Promise<{ data: AdmissionPlan }> {
  return apiPut<{ data: AdmissionPlan }>(`${API_BASE}/plans/${id}`, data)
}

export async function approveAdmissionPlan(id: string): Promise<{ data: AdmissionPlan }> {
  return apiPatch<{ data: AdmissionPlan }>(`${API_BASE}/plans/${id}/approve`, {})
}

export async function updatePlanMilestone(
  planId: string,
  milestoneId: string,
  data: { status: string; completedDate?: string }
): Promise<{ data: AdmissionPlan }> {
  return apiPatch<{ data: AdmissionPlan }>(
    `${API_BASE}/plans/${planId}/milestones/${milestoneId}`,
    data
  )
}

export async function deleteAdmissionPlan(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/plans/${id}`)
}

// ==================== REFERRAL TRACKING API ====================

export async function fetchReferrals(
  filters: ReferralFilters & { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<ReferralTracking>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.search) params.set('search', filters.search)
  if (filters.referralType && filters.referralType !== 'all')
    params.set('referralType', filters.referralType)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  return apiGet<PaginatedResponse<ReferralTracking>>(`${API_BASE}/referrals?${params}`)
}

export async function fetchReferral(id: string): Promise<{ data: ReferralTracking }> {
  return apiGet<{ data: ReferralTracking }>(`${API_BASE}/referrals/${id}`)
}

export async function fetchApplicationReferral(
  applicationId: string
): Promise<{ data: ReferralTracking | null }> {
  return apiGet<{ data: ReferralTracking | null }>(`${API_BASE}/${applicationId}/referral`)
}

export async function createReferral(data: CreateReferralRequest): Promise<{ data: ReferralTracking }> {
  return apiPost<{ data: ReferralTracking }>(`${API_BASE}/referrals`, data)
}

export async function updateReferral(
  id: string,
  data: UpdateReferralRequest
): Promise<{ data: ReferralTracking }> {
  return apiPatch<{ data: ReferralTracking }>(`${API_BASE}/referrals/${id}`, data)
}

export async function verifyReferral(
  id: string,
  data: { verificationNotes?: string }
): Promise<{ data: ReferralTracking }> {
  return apiPatch<{ data: ReferralTracking }>(`${API_BASE}/referrals/${id}/verify`, data)
}

export async function applyReferralReward(
  id: string,
  reward: {
    type: 'discount' | 'cashback' | 'fee_waiver' | 'gift'
    value: number
    description: string
  }
): Promise<{ data: ReferralTracking }> {
  return apiPatch<{ data: ReferralTracking }>(`${API_BASE}/referrals/${id}/reward`, reward)
}

export async function deleteReferral(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/referrals/${id}`)
}

export async function fetchReferralStats(): Promise<{
  data: {
    total: number
    byType: Record<string, number>
    byStatus: Record<string, number>
    totalRewardsGiven: number
    siblingApplications: number
    conversionRate: number
  }
}> {
  return apiGet(`${API_BASE}/referrals/stats`)
}

export async function searchSiblings(
  query: string
): Promise<{ data: { studentId: string; studentName: string; class: string; section: string; rollNumber: string; admissionNumber: string }[] }> {
  return apiGet(`${API_BASE}/referrals/search-siblings?query=${encodeURIComponent(query)}`)
}

export async function searchAlumni(
  query: string
): Promise<{ data: { alumniId: string; name: string; batchYear: string; currentOrganization?: string }[] }> {
  return apiGet(`${API_BASE}/referrals/search-alumni?query=${encodeURIComponent(query)}`)
}
