import type {
  BankQuestion,
  QuestionsResponse,
  QuestionResponse,
  QuestionFilters,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ImportQuestionsRequest,
  ImportQuestionsResult,
  QuestionBankStats,
  OnlineExamConfig,
  OnlineExamAttempt,
} from '../types/question-bank.types'

const API_BASE = '/api/question-bank'
const ONLINE_EXAM_API = '/api/online-exams'

// ==================== QUESTION BANK API ====================

export async function fetchQuestions(
  filters?: QuestionFilters
): Promise<QuestionsResponse> {
  const params = new URLSearchParams()

  if (filters?.search) params.append('search', filters.search)
  if (filters?.subject) params.append('subject', filters.subject)
  if (filters?.topic) params.append('topic', filters.topic)
  if (filters?.difficulty) params.append('difficulty', filters.difficulty)
  if (filters?.type) params.append('type', filters.type)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.tags?.length) params.append('tags', filters.tags.join(','))
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.limit) params.append('limit', String(filters.limit))

  const response = await fetch(`${API_BASE}?${params}`)
  if (!response.ok) throw new Error('Failed to fetch questions')
  return response.json()
}

export async function fetchQuestion(id: string): Promise<QuestionResponse> {
  const response = await fetch(`${API_BASE}/${id}`)
  if (!response.ok) throw new Error('Failed to fetch question')
  return response.json()
}

export async function fetchQuestionBankStats(): Promise<{ data: QuestionBankStats }> {
  const response = await fetch(`${API_BASE}/stats`)
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}

export async function createQuestion(
  data: CreateQuestionRequest
): Promise<QuestionResponse> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create question')
  return response.json()
}

export async function updateQuestion(
  id: string,
  data: UpdateQuestionRequest
): Promise<QuestionResponse> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update question')
  return response.json()
}

export async function deleteQuestion(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete question')
  return response.json()
}

export async function importQuestions(
  data: ImportQuestionsRequest
): Promise<{ data: ImportQuestionsResult }> {
  const response = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to import questions')
  return response.json()
}

// ==================== ONLINE EXAM API ====================

export interface OnlineExamFilters {
  search?: string
  status?: OnlineExamConfig['status']
  page?: number
  limit?: number
}

export interface OnlineExamsResponse {
  data: OnlineExamConfig[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface OnlineExamWithQuestions extends OnlineExamConfig {
  questions: BankQuestion[]
}

export async function fetchOnlineExams(
  filters?: OnlineExamFilters
): Promise<OnlineExamsResponse> {
  const params = new URLSearchParams()

  if (filters?.search) params.append('search', filters.search)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.limit) params.append('limit', String(filters.limit))

  const response = await fetch(`${ONLINE_EXAM_API}?${params}`)
  if (!response.ok) throw new Error('Failed to fetch online exams')
  return response.json()
}

export async function fetchOnlineExam(
  id: string
): Promise<{ data: OnlineExamWithQuestions }> {
  const response = await fetch(`${ONLINE_EXAM_API}/${id}`)
  if (!response.ok) throw new Error('Failed to fetch online exam')
  return response.json()
}

export async function createOnlineExam(
  data: Partial<OnlineExamConfig>
): Promise<{ data: OnlineExamConfig }> {
  const response = await fetch(ONLINE_EXAM_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create online exam')
  return response.json()
}

export async function updateOnlineExam(
  id: string,
  data: Partial<OnlineExamConfig>
): Promise<{ data: OnlineExamConfig }> {
  const response = await fetch(`${ONLINE_EXAM_API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update online exam')
  return response.json()
}

export async function deleteOnlineExam(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${ONLINE_EXAM_API}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete online exam')
  return response.json()
}

// ==================== EXAM ATTEMPT API ====================

export interface StartExamResponse {
  data: {
    attempt: OnlineExamAttempt
    exam: OnlineExamConfig & {
      questions: Array<{
        id: string
        question: string
        type: string
        options: string[]
        points: number
      }>
    }
  }
}

export interface SubmitExamRequest {
  attemptId: string
  answers: { questionId: string; answer: string }[]
  timeSpent: number
  tabSwitchCount: number
  securityViolations: { type: string; timestamp: string }[]
  autoSubmit?: boolean
}

export interface SubmitExamResponse {
  data: {
    attempt: OnlineExamAttempt
    questions: BankQuestion[]
  }
}

export async function startOnlineExam(
  examId: string,
  studentId: string,
  studentName: string
): Promise<StartExamResponse> {
  const response = await fetch(`${ONLINE_EXAM_API}/${examId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, studentName }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to start exam')
  }
  return response.json()
}

export async function submitOnlineExam(
  examId: string,
  data: SubmitExamRequest
): Promise<SubmitExamResponse> {
  const response = await fetch(`${ONLINE_EXAM_API}/${examId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to submit exam')
  return response.json()
}

export async function fetchExamAttempts(
  examId: string,
  studentId?: string
): Promise<{ data: OnlineExamAttempt[] }> {
  const params = new URLSearchParams()
  if (studentId) params.append('studentId', studentId)

  const response = await fetch(`${ONLINE_EXAM_API}/${examId}/attempts?${params}`)
  if (!response.ok) throw new Error('Failed to fetch attempts')
  return response.json()
}

export async function fetchMyAttempts(
  studentId: string
): Promise<{ data: OnlineExamAttempt[] }> {
  const params = new URLSearchParams({ studentId })
  const response = await fetch(`${ONLINE_EXAM_API}/my-attempts?${params}`)
  if (!response.ok) throw new Error('Failed to fetch attempts')
  return response.json()
}

export async function reportSecurityViolation(
  examId: string,
  attemptId: string,
  type: 'tab_switch' | 'copy_attempt' | 'right_click' | 'fullscreen_exit'
): Promise<{ data: { shouldAutoSubmit?: boolean; reason?: string; recorded?: boolean } }> {
  const response = await fetch(`${ONLINE_EXAM_API}/${examId}/report-violation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attemptId, type }),
  })
  if (!response.ok) throw new Error('Failed to report violation')
  return response.json()
}
