import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchApplications,
  fetchApplication,
  fetchApplicationStats,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  addDocument,
  updateDocumentStatus,
  addNote,
  scheduleInterview,
  scheduleEntranceExam,
  deleteApplication,
  fetchWaitlist,
  fetchClassCapacity,
  fetchExamSchedules,
  createExamSchedule,
  fetchExamResults,
  recordExamScore,
  fetchCommunicationLogs,
  fetchCommunicationTemplates,
  sendCommunication,
  fetchAdmissionPayments,
  fetchApplicationPayment,
  recordPayment,
  fetchAdmissionAnalytics,
  submitPublicApplication,
} from '../api/admissions.api'
import type {
  ApplicationFilters,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  UpdateStatusRequest,
  AddDocumentRequest,
  AddNoteRequest,
  ScheduleExamRequest,
  RecordExamScoreRequest,
  SendCommunicationRequest,
  RecordPaymentRequest,
} from '../types/admission.types'

// Query keys
export const admissionsKeys = {
  all: ['admissions'] as const,
  lists: () => [...admissionsKeys.all, 'list'] as const,
  list: (filters: ApplicationFilters & { page?: number; limit?: number }) =>
    [...admissionsKeys.lists(), filters] as const,
  details: () => [...admissionsKeys.all, 'detail'] as const,
  detail: (id: string) => [...admissionsKeys.details(), id] as const,
  stats: () => [...admissionsKeys.all, 'stats'] as const,
  waitlist: (cls?: string) => [...admissionsKeys.all, 'waitlist', cls] as const,
  classCapacity: () => [...admissionsKeys.all, 'class-capacity'] as const,
  examSchedules: () => [...admissionsKeys.all, 'exam-schedules'] as const,
  examResults: (filters?: { class?: string; scheduleId?: string }) => [...admissionsKeys.all, 'exam-results', filters] as const,
  communications: (filters?: { applicationId?: string; type?: string }) => [...admissionsKeys.all, 'communications', filters] as const,
  communicationTemplates: () => [...admissionsKeys.all, 'communication-templates'] as const,
  payments: (status?: string) => [...admissionsKeys.all, 'payments', status] as const,
  applicationPayment: (id: string) => [...admissionsKeys.all, 'payment', id] as const,
  analytics: () => [...admissionsKeys.all, 'analytics'] as const,
}

// Fetch applications list with filters
export function useApplications(filters: ApplicationFilters & { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: admissionsKeys.list(filters),
    queryFn: () => fetchApplications(filters),
  })
}

// Fetch single application
export function useApplication(id: string) {
  return useQuery({
    queryKey: admissionsKeys.detail(id),
    queryFn: () => fetchApplication(id),
    enabled: !!id,
  })
}

// Fetch application stats
export function useApplicationStats() {
  return useQuery({
    queryKey: admissionsKeys.stats(),
    queryFn: fetchApplicationStats,
  })
}

// Create application mutation
export function useCreateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateApplicationRequest) => createApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: admissionsKeys.stats() })
    },
  })
}

// Update application mutation
export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationRequest }) => updateApplication(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: admissionsKeys.lists() })
    },
  })
}

// Update status mutation
export function useUpdateStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatusRequest }) => updateApplicationStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: admissionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: admissionsKeys.stats() })
    },
  })
}

// Add document mutation
export function useAddDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: AddDocumentRequest }) =>
      addDocument(applicationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(variables.applicationId) })
    },
  })
}

// Update document status mutation
export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      documentId,
      data,
    }: {
      applicationId: string
      documentId: string
      data: { status: 'verified' | 'rejected'; rejectionReason?: string }
    }) => updateDocumentStatus(applicationId, documentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(variables.applicationId) })
    },
  })
}

// Add note mutation
export function useAddNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: AddNoteRequest }) =>
      addNote(applicationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(variables.applicationId) })
    },
  })
}

// Schedule interview mutation
export function useScheduleInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicationId, interviewDate }: { applicationId: string; interviewDate: string }) =>
      scheduleInterview(applicationId, interviewDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(variables.applicationId) })
      queryClient.invalidateQueries({ queryKey: admissionsKeys.lists() })
    },
  })
}

// Schedule entrance exam mutation
export function useScheduleEntranceExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicationId, entranceExamDate }: { applicationId: string; entranceExamDate: string }) =>
      scheduleEntranceExam(applicationId, entranceExamDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(variables.applicationId) })
      queryClient.invalidateQueries({ queryKey: admissionsKeys.lists() })
    },
  })
}

// Delete application mutation
export function useDeleteApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: admissionsKeys.stats() })
    },
  })
}

// ==================== WAITLIST HOOKS ====================

export function useWaitlist(cls?: string) {
  return useQuery({
    queryKey: admissionsKeys.waitlist(cls),
    queryFn: () => fetchWaitlist(cls),
  })
}

export function useClassCapacity() {
  return useQuery({
    queryKey: admissionsKeys.classCapacity(),
    queryFn: fetchClassCapacity,
  })
}

// ==================== ENTRANCE EXAM HOOKS ====================

export function useExamSchedules() {
  return useQuery({
    queryKey: admissionsKeys.examSchedules(),
    queryFn: fetchExamSchedules,
  })
}

export function useCreateExamSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ScheduleExamRequest) => createExamSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.examSchedules() })
    },
  })
}

export function useExamResults(filters?: { class?: string; scheduleId?: string }) {
  return useQuery({
    queryKey: admissionsKeys.examResults(filters),
    queryFn: () => fetchExamResults(filters),
  })
}

export function useRecordExamScore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: Omit<RecordExamScoreRequest, 'applicationId'> }) =>
      recordExamScore(applicationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(variables.applicationId) })
      queryClient.invalidateQueries({ queryKey: admissionsKeys.examResults() })
    },
  })
}

// ==================== COMMUNICATION HOOKS ====================

export function useCommunicationLogs(filters?: { applicationId?: string; type?: string }) {
  return useQuery({
    queryKey: admissionsKeys.communications(filters),
    queryFn: () => fetchCommunicationLogs(filters),
  })
}

export function useCommunicationTemplates() {
  return useQuery({
    queryKey: admissionsKeys.communicationTemplates(),
    queryFn: fetchCommunicationTemplates,
  })
}

export function useSendCommunication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendCommunicationRequest) => sendCommunication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.communications() })
    },
  })
}

// ==================== PAYMENT HOOKS ====================

export function useAdmissionPayments(status?: string) {
  return useQuery({
    queryKey: admissionsKeys.payments(status),
    queryFn: () => fetchAdmissionPayments(status),
  })
}

export function useApplicationPayment(applicationId: string) {
  return useQuery({
    queryKey: admissionsKeys.applicationPayment(applicationId),
    queryFn: () => fetchApplicationPayment(applicationId),
    enabled: !!applicationId,
  })
}

export function useRecordPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RecordPaymentRequest) => recordPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.applicationPayment(variables.applicationId) })
      queryClient.invalidateQueries({ queryKey: admissionsKeys.payments() })
      queryClient.invalidateQueries({ queryKey: admissionsKeys.detail(variables.applicationId) })
    },
  })
}

// ==================== ANALYTICS HOOKS ====================

export function useAdmissionAnalytics() {
  return useQuery({
    queryKey: admissionsKeys.analytics(),
    queryFn: fetchAdmissionAnalytics,
  })
}

// ==================== PUBLIC HOOKS ====================

export function useSubmitPublicApplication() {
  return useMutation({
    mutationFn: (data: CreateApplicationRequest & { source?: string }) => submitPublicApplication(data),
  })
}
