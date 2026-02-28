import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import type {
  Exam,
  CreateExamRequest,
  UpdateExamRequest,
  ExamFilters,
  StudentMark,
  SubmitMarksRequest,
  ReportCard,
  GenerateReportCardsRequest,
  GradeScale,
  CreateGradeScaleRequest,
  UpdateGradeScaleRequest,
  MarksEntryStudent,
  ExamTimetable,
  ExamSlot,
  CreateExamSlotRequest,
  ClassAnalytics,
  StudentProgress,
  CoScholasticRecord,
  SubmitCoScholasticRequest,
  QuestionPaper,
  CreateQuestionPaperRequest,
  // Proctoring
  ProctoringSession,
  ProctoringConfig,
  ProctoringViolation,
  CreateProctoringSessionRequest,
  UpdateProctoringSessionRequest,
  ReportViolationRequest,
  ReviewViolationRequest,
  // Adaptive Testing
  AdaptiveTestConfig,
  AdaptiveTestAttempt,
  CreateAdaptiveTestConfigRequest,
  UpdateAdaptiveTestConfigRequest,
  SubmitAdaptiveAnswerRequest,
  AdaptiveQuestion,
  // Peer Comparison
  PeerComparison,
  RankingData,
  PeerComparisonFilters,
  // Subject Trends
  SubjectTrend,
  YearlyAnalysis,
  SubjectTrendFilters,
  YearlyAnalysisFilters,
  // Revaluation
  RevaluationRequest,
  RevaluationFilters,
  RevaluationSummary,
  CreateRevaluationRequestRequest,
  UpdateRevaluationStatusRequest,
} from '../types/exams.types'

const API_BASE = '/api'

// ==================== USER-SCOPED TYPES ====================

export interface ExamMarksGroup {
  examId: string
  examName: string
  marks: StudentMark[]
}

export interface ChildMarksData {
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  exams: ExamMarksGroup[]
}

// ==================== USER-SCOPED ENDPOINTS ====================

export async function fetchMyMarks(academicYear?: string): Promise<{ data: ExamMarksGroup[] }> {
  const params = new URLSearchParams()
  if (academicYear) params.set('academicYear', academicYear)
  return apiGet(`${API_BASE}/exams/my-marks?${params.toString()}`)
}

export async function fetchMyChildrenMarks(academicYear?: string): Promise<{ data: ChildMarksData[] }> {
  const params = new URLSearchParams()
  if (academicYear) params.set('academicYear', academicYear)
  return apiGet(`${API_BASE}/exams/my-children-marks?${params.toString()}`)
}

export async function fetchMyReportCard(examId?: string): Promise<{ data: ReportCard }> {
  const params = new URLSearchParams()
  if (examId) params.set('examId', examId)
  return apiGet(`${API_BASE}/exams/my-report-card?${params.toString()}`)
}

// ==================== EXAMS ====================

export async function fetchExams(filters: ExamFilters = {}): Promise<{
  data: Exam[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}> {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.academicYear) params.set('academicYear', filters.academicYear)
  if (filters.className) params.set('className', filters.className)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet(`${API_BASE}/exams?${params.toString()}`)
}

export async function fetchExam(id: string): Promise<{ data: Exam }> {
  return apiGet(`${API_BASE}/exams/${id}`)
}

export async function createExam(data: CreateExamRequest): Promise<{ data: Exam }> {
  return apiPost(`${API_BASE}/exams`, data)
}

export async function updateExam(id: string, data: UpdateExamRequest): Promise<{ data: Exam }> {
  return apiPut(`${API_BASE}/exams/${id}`, data)
}

export async function deleteExam(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/exams/${id}`)
}

export async function publishExamResults(id: string): Promise<{ data: Exam }> {
  return apiPost(`${API_BASE}/exams/${id}/publish`)
}

// ==================== MARKS ====================

export async function fetchExamMarks(
  examId: string,
  subjectId?: string,
  classId?: string
): Promise<{ data: StudentMark[] }> {
  const params = new URLSearchParams()
  if (subjectId) params.set('subjectId', subjectId)
  if (classId) params.set('classId', classId)

  return apiGet(`${API_BASE}/exams/${examId}/marks?${params.toString()}`)
}

export async function fetchStudentsForMarksEntry(
  examId: string,
  subjectId: string,
  className: string,
  section: string
): Promise<{ data: MarksEntryStudent[] }> {
  const params = new URLSearchParams({
    subjectId,
    className,
    section,
  })

  return apiGet(`${API_BASE}/exams/${examId}/students?${params.toString()}`)
}

export async function submitMarks(data: SubmitMarksRequest): Promise<{ success: boolean; marksSubmitted: number }> {
  return apiPost(`${API_BASE}/exams/${data.examId}/marks`, data)
}

export async function fetchStudentMarks(studentId: string, academicYear?: string): Promise<{ data: StudentMark[] }> {
  const params = new URLSearchParams()
  if (academicYear) params.set('academicYear', academicYear)

  return apiGet(`${API_BASE}/students/${studentId}/marks?${params.toString()}`)
}

// ==================== REPORT CARDS ====================

export async function fetchReportCards(examId: string, classId?: string): Promise<{ data: ReportCard[] }> {
  const params = new URLSearchParams()
  if (classId) params.set('classId', classId)

  return apiGet(`${API_BASE}/exams/${examId}/report-cards?${params.toString()}`)
}

export async function fetchStudentReportCard(studentId: string, examId?: string): Promise<{ data: ReportCard }> {
  const params = new URLSearchParams()
  if (examId) params.set('examId', examId)

  return apiGet(`${API_BASE}/students/${studentId}/report-card?${params.toString()}`)
}

export async function generateReportCards(
  data: GenerateReportCardsRequest
): Promise<{ success: boolean; generatedCount: number }> {
  return apiPost(`${API_BASE}/report-cards/generate`, data)
}

export async function deleteReportCard(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/report-cards/${id}`)
}

// ==================== GRADE SCALES ====================

export async function fetchGradeScales(): Promise<{ data: GradeScale[] }> {
  return apiGet(`${API_BASE}/grade-scales`)
}

export async function fetchGradeScale(id: string): Promise<{ data: GradeScale }> {
  return apiGet(`${API_BASE}/grade-scales/${id}`)
}

export async function createGradeScale(data: CreateGradeScaleRequest): Promise<{ data: GradeScale }> {
  return apiPost(`${API_BASE}/grade-scales`, data)
}

export async function updateGradeScale(id: string, data: UpdateGradeScaleRequest): Promise<{ data: GradeScale }> {
  return apiPut(`${API_BASE}/grade-scales/${id}`, data)
}

export async function deleteGradeScale(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/grade-scales/${id}`)
}

// ==================== EXAM TIMETABLE ====================

export async function fetchExamTimetable(examId: string): Promise<{ data: ExamTimetable }> {
  return apiGet(`${API_BASE}/exams/${examId}/timetable`)
}

export async function createExamSlot(examId: string, data: CreateExamSlotRequest): Promise<{ data: ExamSlot }> {
  return apiPost(`${API_BASE}/exams/${examId}/timetable`, data)
}

// ==================== CLASS ANALYTICS ====================

export async function fetchClassAnalytics(
  examId: string,
  className?: string,
  section?: string
): Promise<{ data: ClassAnalytics }> {
  const params = new URLSearchParams()
  if (className) params.set('class', className)
  if (section) params.set('section', section)
  return apiGet(`${API_BASE}/exams/${examId}/analytics?${params.toString()}`)
}

// ==================== STUDENT PROGRESS ====================

export async function fetchStudentProgress(studentId: string): Promise<{ data: StudentProgress }> {
  return apiGet(`${API_BASE}/students/${studentId}/progress`)
}

// ==================== CO-SCHOLASTIC ====================

export async function fetchCoScholasticRecords(
  filters: { studentId?: string; term?: string; area?: string; page?: number; limit?: number } = {}
): Promise<{ data: CoScholasticRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const params = new URLSearchParams()
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.term) params.set('term', filters.term)
  if (filters.area && filters.area !== 'all') params.set('area', filters.area)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  return apiGet(`${API_BASE}/exams/co-scholastic?${params.toString()}`)
}

export async function submitCoScholastic(data: SubmitCoScholasticRequest): Promise<{ data: CoScholasticRecord[] }> {
  return apiPost(`${API_BASE}/exams/co-scholastic`, data)
}

// ==================== QUESTION PAPERS ====================

export async function fetchQuestionPapers(
  filters: { examId?: string; subjectId?: string; className?: string } = {}
): Promise<{ data: QuestionPaper[] }> {
  const params = new URLSearchParams()
  if (filters.examId) params.set('examId', filters.examId)
  if (filters.subjectId) params.set('subjectId', filters.subjectId)
  if (filters.className) params.set('className', filters.className)
  return apiGet(`${API_BASE}/exams/question-papers?${params.toString()}`)
}

export async function fetchQuestionPaper(id: string): Promise<{ data: QuestionPaper }> {
  return apiGet(`${API_BASE}/exams/question-papers/${id}`)
}

export async function createQuestionPaper(data: CreateQuestionPaperRequest): Promise<{ data: QuestionPaper }> {
  return apiPost(`${API_BASE}/exams/question-papers`, data)
}

export async function deleteQuestionPaper(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/exams/question-papers/${id}`)
}

// ==================== PROCTORING ====================

export async function fetchProctoringConfig(examId: string): Promise<{ data: ProctoringConfig }> {
  return apiGet(`${API_BASE}/exams/${examId}/proctoring/config`)
}

export async function updateProctoringConfig(
  examId: string,
  data: Partial<ProctoringConfig>
): Promise<{ data: ProctoringConfig }> {
  return apiPut(`${API_BASE}/exams/${examId}/proctoring/config`, data)
}

export async function fetchProctoringSessions(
  examId: string,
  filters: { status?: string; studentId?: string } = {}
): Promise<{ data: ProctoringSession[] }> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.studentId) params.set('studentId', filters.studentId)
  return apiGet(`${API_BASE}/exams/${examId}/proctoring/sessions?${params.toString()}`)
}

export async function fetchProctoringSession(sessionId: string): Promise<{ data: ProctoringSession }> {
  return apiGet(`${API_BASE}/proctoring/sessions/${sessionId}`)
}

export async function createProctoringSession(
  data: CreateProctoringSessionRequest
): Promise<{ data: ProctoringSession }> {
  return apiPost(`${API_BASE}/proctoring/sessions`, data)
}

export async function updateProctoringSession(
  sessionId: string,
  data: UpdateProctoringSessionRequest
): Promise<{ data: ProctoringSession }> {
  return apiPut(`${API_BASE}/proctoring/sessions/${sessionId}`, data)
}

export async function reportProctoringViolation(
  data: ReportViolationRequest
): Promise<{ data: ProctoringViolation }> {
  return apiPost(`${API_BASE}/proctoring/violations`, data)
}

export async function reviewProctoringViolation(
  violationId: string,
  data: ReviewViolationRequest
): Promise<{ data: ProctoringViolation }> {
  return apiPut(`${API_BASE}/proctoring/violations/${violationId}/review`, data)
}

export async function fetchProctoringViolations(
  sessionId: string
): Promise<{ data: ProctoringViolation[] }> {
  return apiGet(`${API_BASE}/proctoring/sessions/${sessionId}/violations`)
}

// ==================== ADAPTIVE TESTING ====================

export async function fetchAdaptiveTestConfig(examId: string): Promise<{ data: AdaptiveTestConfig }> {
  return apiGet(`${API_BASE}/exams/${examId}/adaptive/config`)
}

export async function createAdaptiveTestConfig(
  data: CreateAdaptiveTestConfigRequest
): Promise<{ data: AdaptiveTestConfig }> {
  return apiPost(`${API_BASE}/adaptive/config`, data)
}

export async function updateAdaptiveTestConfig(
  configId: string,
  data: UpdateAdaptiveTestConfigRequest
): Promise<{ data: AdaptiveTestConfig }> {
  return apiPut(`${API_BASE}/adaptive/config/${configId}`, data)
}

export async function fetchAdaptiveTestAttempts(
  examId: string,
  studentId?: string
): Promise<{ data: AdaptiveTestAttempt[] }> {
  const params = new URLSearchParams()
  if (studentId) params.set('studentId', studentId)
  return apiGet(`${API_BASE}/exams/${examId}/adaptive/attempts?${params.toString()}`)
}

export async function fetchAdaptiveTestAttempt(attemptId: string): Promise<{ data: AdaptiveTestAttempt }> {
  return apiGet(`${API_BASE}/adaptive/attempts/${attemptId}`)
}

export async function startAdaptiveTest(examId: string): Promise<{ data: AdaptiveTestAttempt }> {
  return apiPost(`${API_BASE}/exams/${examId}/adaptive/start`)
}

export async function fetchNextAdaptiveQuestion(attemptId: string): Promise<{ data: AdaptiveQuestion }> {
  return apiGet(`${API_BASE}/adaptive/attempts/${attemptId}/next-question`)
}

export async function submitAdaptiveAnswer(
  data: SubmitAdaptiveAnswerRequest
): Promise<{ data: { isCorrect: boolean; newAbilityEstimate: number; standardError: number; isComplete: boolean } }> {
  return apiPost(`${API_BASE}/adaptive/attempts/${data.attemptId}/answer`, data)
}

export async function completeAdaptiveTest(attemptId: string): Promise<{ data: AdaptiveTestAttempt }> {
  return apiPost(`${API_BASE}/adaptive/attempts/${attemptId}/complete`)
}

// ==================== PEER COMPARISON ANALYTICS ====================

export async function fetchPeerComparison(filters: PeerComparisonFilters): Promise<{ data: PeerComparison }> {
  const params = new URLSearchParams()
  params.set('examId', filters.examId)
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.className) params.set('className', filters.className)
  if (filters.section) params.set('section', filters.section)
  if (filters.subjectId) params.set('subjectId', filters.subjectId)
  return apiGet(`${API_BASE}/exams/analytics/peer-comparison?${params.toString()}`)
}

export async function fetchRankingData(
  examId: string,
  className?: string,
  section?: string
): Promise<{ data: RankingData }> {
  const params = new URLSearchParams()
  if (className) params.set('className', className)
  if (section) params.set('section', section)
  return apiGet(`${API_BASE}/exams/${examId}/analytics/rankings?${params.toString()}`)
}

export async function fetchClassRankings(
  examId: string,
  className: string,
  section?: string
): Promise<{ data: RankingData }> {
  const params = new URLSearchParams()
  params.set('className', className)
  if (section) params.set('section', section)
  return apiGet(`${API_BASE}/exams/${examId}/rankings?${params.toString()}`)
}

// ==================== SUBJECT-WISE TREND ANALYSIS ====================

export async function fetchSubjectTrends(filters: SubjectTrendFilters): Promise<{ data: SubjectTrend[] }> {
  const params = new URLSearchParams()
  params.set('studentId', filters.studentId)
  if (filters.subjectId) params.set('subjectId', filters.subjectId)
  if (filters.academicYear) params.set('academicYear', filters.academicYear)
  if (filters.fromDate) params.set('fromDate', filters.fromDate)
  if (filters.toDate) params.set('toDate', filters.toDate)
  return apiGet(`${API_BASE}/exams/analytics/subject-trends?${params.toString()}`)
}

export async function fetchYearlyAnalysis(filters: YearlyAnalysisFilters): Promise<{ data: YearlyAnalysis }> {
  const params = new URLSearchParams()
  params.set('studentId', filters.studentId)
  if (filters.academicYear) params.set('academicYear', filters.academicYear)
  if (filters.includeYearComparison) params.set('includeYearComparison', 'true')
  return apiGet(`${API_BASE}/exams/analytics/yearly?${params.toString()}`)
}

export async function fetchStudentSubjectTrend(
  studentId: string,
  subjectId: string
): Promise<{ data: SubjectTrend }> {
  return apiGet(`${API_BASE}/students/${studentId}/subjects/${subjectId}/trend`)
}

// ==================== REVALUATION REQUESTS ====================

export async function fetchRevaluationRequests(
  filters: RevaluationFilters = {}
): Promise<{
  data: RevaluationRequest[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}> {
  const params = new URLSearchParams()
  if (filters.examId) params.set('examId', filters.examId)
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.subjectId) params.set('subjectId', filters.subjectId)
  if (filters.status) params.set('status', filters.status)
  if (filters.type) params.set('type', filters.type)
  if (filters.fromDate) params.set('fromDate', filters.fromDate)
  if (filters.toDate) params.set('toDate', filters.toDate)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  return apiGet(`${API_BASE}/revaluation/requests?${params.toString()}`)
}

export async function fetchRevaluationRequest(id: string): Promise<{ data: RevaluationRequest }> {
  return apiGet(`${API_BASE}/revaluation/requests/${id}`)
}

export async function createRevaluationRequest(
  data: CreateRevaluationRequestRequest
): Promise<{ data: RevaluationRequest }> {
  return apiPost(`${API_BASE}/revaluation/requests`, data)
}

export async function updateRevaluationStatus(
  id: string,
  data: UpdateRevaluationStatusRequest
): Promise<{ data: RevaluationRequest }> {
  return apiPut(`${API_BASE}/revaluation/requests/${id}/status`, data)
}

export async function withdrawRevaluationRequest(id: string): Promise<{ data: RevaluationRequest }> {
  return apiPost(`${API_BASE}/revaluation/requests/${id}/withdraw`)
}

export async function fetchRevaluationSummary(
  examId?: string
): Promise<{ data: RevaluationSummary }> {
  const params = new URLSearchParams()
  if (examId) params.set('examId', examId)
  return apiGet(`${API_BASE}/revaluation/summary?${params.toString()}`)
}

export async function fetchMyRevaluationRequests(
  filters: { status?: string; page?: number; limit?: number } = {}
): Promise<{
  data: RevaluationRequest[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  return apiGet(`${API_BASE}/revaluation/my-requests?${params.toString()}`)
}

export async function processRevaluationPayment(
  id: string,
  paymentData: { paymentId: string; amount: number }
): Promise<{ data: RevaluationRequest }> {
  return apiPost(`${API_BASE}/revaluation/requests/${id}/payment`, paymentData)
}
