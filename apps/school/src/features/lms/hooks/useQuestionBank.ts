import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchQuestions,
  fetchQuestion,
  fetchQuestionBankStats,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestions,
  fetchOnlineExams,
  fetchOnlineExam,
  createOnlineExam,
  updateOnlineExam,
  deleteOnlineExam,
  startOnlineExam,
  submitOnlineExam,
  fetchExamAttempts,
  fetchMyAttempts,
  reportSecurityViolation,
  type OnlineExamFilters,
  type SubmitExamRequest,
} from '../api/question-bank.api'
import type {
  QuestionFilters,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ImportQuestionsRequest,
  OnlineExamConfig,
} from '../types/question-bank.types'

// ==================== QUERY KEYS ====================

export const questionBankKeys = {
  all: ['question-bank'] as const,
  lists: () => [...questionBankKeys.all, 'list'] as const,
  list: (filters: QuestionFilters) => [...questionBankKeys.lists(), filters] as const,
  details: () => [...questionBankKeys.all, 'detail'] as const,
  detail: (id: string) => [...questionBankKeys.details(), id] as const,
  stats: () => [...questionBankKeys.all, 'stats'] as const,
}

export const onlineExamKeys = {
  all: ['online-exams'] as const,
  lists: () => [...onlineExamKeys.all, 'list'] as const,
  list: (filters: OnlineExamFilters) => [...onlineExamKeys.lists(), filters] as const,
  details: () => [...onlineExamKeys.all, 'detail'] as const,
  detail: (id: string) => [...onlineExamKeys.details(), id] as const,
  attempts: (examId: string) => [...onlineExamKeys.all, 'attempts', examId] as const,
  myAttempts: (studentId: string) => [...onlineExamKeys.all, 'my-attempts', studentId] as const,
}

// ==================== QUESTION BANK HOOKS ====================

export function useQuestions(filters?: QuestionFilters) {
  return useQuery({
    queryKey: questionBankKeys.list(filters || {}),
    queryFn: () => fetchQuestions(filters),
  })
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: questionBankKeys.detail(id),
    queryFn: () => fetchQuestion(id),
    enabled: !!id,
  })
}

export function useQuestionBankStats() {
  return useQuery({
    queryKey: questionBankKeys.stats(),
    queryFn: fetchQuestionBankStats,
  })
}

export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuestionRequest) => createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() })
      queryClient.invalidateQueries({ queryKey: questionBankKeys.stats() })
    },
  })
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuestionRequest }) =>
      updateQuestion(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() })
      queryClient.invalidateQueries({ queryKey: questionBankKeys.detail(id) })
    },
  })
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() })
      queryClient.invalidateQueries({ queryKey: questionBankKeys.stats() })
    },
  })
}

export function useImportQuestions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ImportQuestionsRequest) => importQuestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.lists() })
      queryClient.invalidateQueries({ queryKey: questionBankKeys.stats() })
    },
  })
}

// ==================== ONLINE EXAM HOOKS ====================

export function useOnlineExams(filters?: OnlineExamFilters) {
  return useQuery({
    queryKey: onlineExamKeys.list(filters || {}),
    queryFn: () => fetchOnlineExams(filters),
  })
}

export function useOnlineExam(id: string) {
  return useQuery({
    queryKey: onlineExamKeys.detail(id),
    queryFn: () => fetchOnlineExam(id),
    enabled: !!id,
  })
}

export function useCreateOnlineExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<OnlineExamConfig>) => createOnlineExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onlineExamKeys.lists() })
    },
  })
}

export function useUpdateOnlineExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OnlineExamConfig> }) =>
      updateOnlineExam(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: onlineExamKeys.lists() })
      queryClient.invalidateQueries({ queryKey: onlineExamKeys.detail(id) })
    },
  })
}

export function useDeleteOnlineExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteOnlineExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onlineExamKeys.lists() })
    },
  })
}

// ==================== EXAM ATTEMPT HOOKS ====================

export function useStartOnlineExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      examId,
      studentId,
      studentName,
    }: {
      examId: string
      studentId: string
      studentName: string
    }) => startOnlineExam(examId, studentId, studentName),
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: onlineExamKeys.attempts(examId) })
    },
  })
}

export function useSubmitOnlineExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ examId, data }: { examId: string; data: SubmitExamRequest }) =>
      submitOnlineExam(examId, data),
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: onlineExamKeys.attempts(examId) })
      queryClient.invalidateQueries({ queryKey: onlineExamKeys.all })
    },
  })
}

export function useExamAttempts(examId: string, studentId?: string) {
  return useQuery({
    queryKey: onlineExamKeys.attempts(examId),
    queryFn: () => fetchExamAttempts(examId, studentId),
    enabled: !!examId,
  })
}

export function useMyExamAttempts(studentId: string) {
  return useQuery({
    queryKey: onlineExamKeys.myAttempts(studentId),
    queryFn: () => fetchMyAttempts(studentId),
    enabled: !!studentId,
  })
}

export function useReportViolation() {
  return useMutation({
    mutationFn: ({
      examId,
      attemptId,
      type,
    }: {
      examId: string
      attemptId: string
      type: 'tab_switch' | 'copy_attempt' | 'right_click' | 'fullscreen_exit'
    }) => reportSecurityViolation(examId, attemptId, type),
  })
}
