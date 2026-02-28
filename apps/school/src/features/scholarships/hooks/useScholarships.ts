import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchScholarships,
  fetchScholarship,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  fetchEligibilityCriteria,
  createEligibilityCriteria,
  updateEligibilityCriteria,
  deleteEligibilityCriteria,
  checkStudentEligibility,
  batchCheckEligibility,
  fetchApplications,
  fetchApplication,
  createApplication,
  updateApplication,
  submitApplication,
  withdrawApplication,
  updateApplicationStatus,
  uploadApplicationDocument,
  fetchCommittees,
  fetchCommittee,
  createCommittee,
  updateCommittee,
  deleteCommittee,
  addCommitteeMember,
  removeCommitteeMember,
  fetchReviewScores,
  createReviewScore,
  updateReviewScore,
  fetchApplicationReviewSummary,
  makeFinalDecision,
  fetchDisbursementSchedules,
  fetchDisbursementSchedule,
  createDisbursementSchedule,
  fetchDisbursements,
  fetchDisbursement,
  processDisbursement,
  cancelDisbursement,
  fetchRenewalCriteria,
  createRenewalCriteria,
  updateRenewalCriteria,
  deleteRenewalCriteria,
  fetchRenewalApplications,
  fetchRenewalApplication,
  processRenewal,
  initiateRenewalReview,
  fetchScholarshipStats,
  fetchStudentScholarshipSummary,
} from '../api/scholarships.api'
import type {
  ScholarshipFilters,
  CreateScholarshipRequest,
  UpdateScholarshipRequest,
  CreateEligibilityCriteriaRequest,
  ApplicationFilters,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  CreateCommitteeRequest,
  UpdateCommitteeRequest,
  CreateReviewScoreRequest,
  DisbursementFilters,
  CreateDisbursementScheduleRequest,
  ProcessDisbursementRequest,
  CreateRenewalCriteriaRequest,
  RenewalFilters,
} from '../types/scholarships.types'

// ==================== QUERY KEYS ====================

export const scholarshipKeys = {
  all: ['scholarships'] as const,
  // Scholarships
  scholarships: () => [...scholarshipKeys.all, 'list'] as const,
  scholarshipList: (filters: ScholarshipFilters) =>
    [...scholarshipKeys.scholarships(), filters] as const,
  scholarshipDetail: (id: string) => [...scholarshipKeys.all, 'detail', id] as const,
  // Eligibility
  eligibility: () => [...scholarshipKeys.all, 'eligibility'] as const,
  eligibilityCriteria: (scholarshipId: string) =>
    [...scholarshipKeys.eligibility(), 'criteria', scholarshipId] as const,
  eligibilityCheck: (scholarshipId: string, studentId: string) =>
    [...scholarshipKeys.eligibility(), 'check', scholarshipId, studentId] as const,
  // Applications
  applications: () => [...scholarshipKeys.all, 'applications'] as const,
  applicationList: (filters: ApplicationFilters) =>
    [...scholarshipKeys.applications(), 'list', filters] as const,
  applicationDetail: (id: string) => [...scholarshipKeys.applications(), 'detail', id] as const,
  applicationReviews: (id: string) => [...scholarshipKeys.applications(), 'reviews', id] as const,
  applicationReviewSummary: (id: string) =>
    [...scholarshipKeys.applications(), 'review-summary', id] as const,
  // Committees
  committees: () => [...scholarshipKeys.all, 'committees'] as const,
  committeeList: (filters: Record<string, unknown>) =>
    [...scholarshipKeys.committees(), 'list', filters] as const,
  committeeDetail: (id: string) => [...scholarshipKeys.committees(), 'detail', id] as const,
  // Disbursements
  disbursements: () => [...scholarshipKeys.all, 'disbursements'] as const,
  disbursementList: (filters: DisbursementFilters) =>
    [...scholarshipKeys.disbursements(), 'list', filters] as const,
  disbursementDetail: (id: string) => [...scholarshipKeys.disbursements(), 'detail', id] as const,
  disbursementSchedules: () => [...scholarshipKeys.all, 'disbursement-schedules'] as const,
  disbursementScheduleList: (filters: DisbursementFilters) =>
    [...scholarshipKeys.disbursementSchedules(), 'list', filters] as const,
  disbursementScheduleDetail: (id: string) =>
    [...scholarshipKeys.disbursementSchedules(), 'detail', id] as const,
  // Renewals
  renewals: () => [...scholarshipKeys.all, 'renewals'] as const,
  renewalList: (filters: RenewalFilters) =>
    [...scholarshipKeys.renewals(), 'list', filters] as const,
  renewalDetail: (id: string) => [...scholarshipKeys.renewals(), 'detail', id] as const,
  renewalCriteria: (scholarshipId: string) =>
    [...scholarshipKeys.renewals(), 'criteria', scholarshipId] as const,
  // Stats
  stats: () => [...scholarshipKeys.all, 'stats'] as const,
  studentSummary: (studentId: string) =>
    [...scholarshipKeys.all, 'student-summary', studentId] as const,
}

// ==================== SCHOLARSHIP HOOKS ====================

export function useScholarships(filters: ScholarshipFilters = {}) {
  return useQuery({
    queryKey: scholarshipKeys.scholarshipList(filters),
    queryFn: () => fetchScholarships(filters),
  })
}

export function useScholarship(id: string) {
  return useQuery({
    queryKey: scholarshipKeys.scholarshipDetail(id),
    queryFn: () => fetchScholarship(id),
    enabled: !!id,
  })
}

export function useCreateScholarship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateScholarshipRequest) => createScholarship(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.scholarships() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.stats() })
    },
  })
}

export function useUpdateScholarship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScholarshipRequest }) =>
      updateScholarship(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.scholarshipDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.scholarships() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.stats() })
    },
  })
}

export function useDeleteScholarship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteScholarship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.scholarships() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.stats() })
    },
  })
}

// ==================== ELIGIBILITY HOOKS ====================

export function useEligibilityCriteria(scholarshipId: string) {
  return useQuery({
    queryKey: scholarshipKeys.eligibilityCriteria(scholarshipId),
    queryFn: () => fetchEligibilityCriteria(scholarshipId),
    enabled: !!scholarshipId,
  })
}

export function useCreateEligibilityCriteria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEligibilityCriteriaRequest) => createEligibilityCriteria(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.eligibilityCriteria(variables.scholarshipId),
      })
    },
  })
}

export function useUpdateEligibilityCriteria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
      scholarshipId,
    }: {
      id: string
      data: Partial<CreateEligibilityCriteriaRequest>
      scholarshipId: string
    }) => updateEligibilityCriteria(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.eligibilityCriteria(variables.scholarshipId),
      })
    },
  })
}

export function useDeleteEligibilityCriteria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, scholarshipId }: { id: string; scholarshipId: string }) =>
      deleteEligibilityCriteria(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.eligibilityCriteria(variables.scholarshipId),
      })
    },
  })
}

export function useCheckStudentEligibility(scholarshipId: string, studentId: string) {
  return useQuery({
    queryKey: scholarshipKeys.eligibilityCheck(scholarshipId, studentId),
    queryFn: () => checkStudentEligibility(scholarshipId, studentId),
    enabled: !!scholarshipId && !!studentId,
  })
}

export function useBatchCheckEligibility() {
  return useMutation({
    mutationFn: ({ scholarshipId, studentIds }: { scholarshipId: string; studentIds: string[] }) =>
      batchCheckEligibility(scholarshipId, studentIds),
  })
}

// ==================== APPLICATION HOOKS ====================

export function useApplications(filters: ApplicationFilters = {}) {
  return useQuery({
    queryKey: scholarshipKeys.applicationList(filters),
    queryFn: () => fetchApplications(filters),
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: scholarshipKeys.applicationDetail(id),
    queryFn: () => fetchApplication(id),
    enabled: !!id,
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateApplicationRequest) => createApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.applications() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.scholarships() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.stats() })
    },
  })
}

export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationRequest }) =>
      updateApplication(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.applicationDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.applications() })
    },
  })
}

export function useSubmitApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => submitApplication(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.applicationDetail(id) })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.applications() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.stats() })
    },
  })
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => withdrawApplication(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.applicationDetail(id) })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.applications() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.scholarships() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.stats() })
    },
  })
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
      data,
    }: {
      id: string
      status: string
      data?: { reviewNotes?: string; rejectionReason?: string; approvedAmount?: number }
    }) => updateApplicationStatus(id, status, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.applicationDetail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.applications() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.scholarships() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.stats() })
    },
  })
}

export function useUploadApplicationDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      document,
    }: {
      applicationId: string
      document: { name: string; type: string; url: string }
    }) => uploadApplicationDocument(applicationId, document),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.applicationDetail(variables.applicationId),
      })
    },
  })
}

// ==================== COMMITTEE HOOKS ====================

export function useCommittees(
  filters: { academicYear?: string; isActive?: boolean; page?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: scholarshipKeys.committeeList(filters),
    queryFn: () => fetchCommittees(filters),
  })
}

export function useCommittee(id: string) {
  return useQuery({
    queryKey: scholarshipKeys.committeeDetail(id),
    queryFn: () => fetchCommittee(id),
    enabled: !!id,
  })
}

export function useCreateCommittee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommitteeRequest) => createCommittee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.committees() })
    },
  })
}

export function useUpdateCommittee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommitteeRequest }) =>
      updateCommittee(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.committeeDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.committees() })
    },
  })
}

export function useDeleteCommittee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCommittee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.committees() })
    },
  })
}

export function useAddCommitteeMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      committeeId,
      member,
    }: {
      committeeId: string
      member: { staffId: string; role: string; canVote: boolean }
    }) => addCommitteeMember(committeeId, member),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.committeeDetail(variables.committeeId),
      })
    },
  })
}

export function useRemoveCommitteeMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ committeeId, memberId }: { committeeId: string; memberId: string }) =>
      removeCommitteeMember(committeeId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.committeeDetail(variables.committeeId),
      })
    },
  })
}

// ==================== REVIEW HOOKS ====================

export function useReviewScores(applicationId: string) {
  return useQuery({
    queryKey: scholarshipKeys.applicationReviews(applicationId),
    queryFn: () => fetchReviewScores(applicationId),
    enabled: !!applicationId,
  })
}

export function useCreateReviewScore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReviewScoreRequest) => createReviewScore(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.applicationReviews(variables.applicationId),
      })
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.applicationReviewSummary(variables.applicationId),
      })
    },
  })
}

export function useUpdateReviewScore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
      applicationId,
    }: {
      id: string
      data: Partial<CreateReviewScoreRequest>
      applicationId: string
    }) => updateReviewScore(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.applicationReviews(variables.applicationId),
      })
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.applicationReviewSummary(variables.applicationId),
      })
    },
  })
}

export function useApplicationReviewSummary(applicationId: string) {
  return useQuery({
    queryKey: scholarshipKeys.applicationReviewSummary(applicationId),
    queryFn: () => fetchApplicationReviewSummary(applicationId),
    enabled: !!applicationId,
  })
}

export function useMakeFinalDecision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      decision,
    }: {
      applicationId: string
      decision: { status: string; approvedAmount?: number; notes?: string }
    }) => makeFinalDecision(applicationId, decision),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.applicationDetail(variables.applicationId),
      })
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.applicationReviewSummary(variables.applicationId),
      })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.applications() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.scholarships() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.stats() })
    },
  })
}

// ==================== DISBURSEMENT HOOKS ====================

export function useDisbursementSchedules(filters: DisbursementFilters = {}) {
  return useQuery({
    queryKey: scholarshipKeys.disbursementScheduleList(filters),
    queryFn: () => fetchDisbursementSchedules(filters),
  })
}

export function useDisbursementSchedule(id: string) {
  return useQuery({
    queryKey: scholarshipKeys.disbursementScheduleDetail(id),
    queryFn: () => fetchDisbursementSchedule(id),
    enabled: !!id,
  })
}

export function useCreateDisbursementSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDisbursementScheduleRequest) => createDisbursementSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.disbursementSchedules() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.disbursements() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.stats() })
    },
  })
}

export function useDisbursements(filters: DisbursementFilters = {}) {
  return useQuery({
    queryKey: scholarshipKeys.disbursementList(filters),
    queryFn: () => fetchDisbursements(filters),
  })
}

export function useDisbursement(id: string) {
  return useQuery({
    queryKey: scholarshipKeys.disbursementDetail(id),
    queryFn: () => fetchDisbursement(id),
    enabled: !!id,
  })
}

export function useProcessDisbursement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProcessDisbursementRequest) => processDisbursement(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.disbursementDetail(variables.disbursementId),
      })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.disbursements() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.disbursementSchedules() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.stats() })
    },
  })
}

export function useCancelDisbursement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelDisbursement(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.disbursementDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.disbursements() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.disbursementSchedules() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.stats() })
    },
  })
}

// ==================== RENEWAL HOOKS ====================

export function useRenewalCriteria(scholarshipId: string) {
  return useQuery({
    queryKey: scholarshipKeys.renewalCriteria(scholarshipId),
    queryFn: () => fetchRenewalCriteria(scholarshipId),
    enabled: !!scholarshipId,
  })
}

export function useCreateRenewalCriteria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRenewalCriteriaRequest) => createRenewalCriteria(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.renewalCriteria(variables.scholarshipId),
      })
    },
  })
}

export function useUpdateRenewalCriteria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
      scholarshipId,
    }: {
      id: string
      data: Partial<CreateRenewalCriteriaRequest>
      scholarshipId: string
    }) => updateRenewalCriteria(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.renewalCriteria(variables.scholarshipId),
      })
    },
  })
}

export function useDeleteRenewalCriteria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, scholarshipId }: { id: string; scholarshipId: string }) =>
      deleteRenewalCriteria(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.renewalCriteria(variables.scholarshipId),
      })
    },
  })
}

export function useRenewalApplications(filters: RenewalFilters = {}) {
  return useQuery({
    queryKey: scholarshipKeys.renewalList(filters),
    queryFn: () => fetchRenewalApplications(filters),
  })
}

export function useRenewalApplication(id: string) {
  return useQuery({
    queryKey: scholarshipKeys.renewalDetail(id),
    queryFn: () => fetchRenewalApplication(id),
    enabled: !!id,
  })
}

export function useProcessRenewal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: {
        renewalStatus: string
        renewedAmount?: number
        changeReason?: string
        reviewNotes?: string
      }
    }) => processRenewal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.renewalDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.renewals() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.applications() })
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.stats() })
    },
  })
}

export function useInitiateRenewalReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      scholarshipId,
      academicYear,
    }: {
      scholarshipId: string
      academicYear: string
    }) => initiateRenewalReview(scholarshipId, academicYear),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.renewals() })
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.scholarshipDetail(variables.scholarshipId),
      })
    },
  })
}

// ==================== STATS HOOKS ====================

export function useScholarshipStats() {
  return useQuery({
    queryKey: scholarshipKeys.stats(),
    queryFn: fetchScholarshipStats,
  })
}

export function useStudentScholarshipSummary(studentId: string) {
  return useQuery({
    queryKey: scholarshipKeys.studentSummary(studentId),
    queryFn: () => fetchStudentScholarshipSummary(studentId),
    enabled: !!studentId,
  })
}
