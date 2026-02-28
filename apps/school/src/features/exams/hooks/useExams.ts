import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchMyMarks,
  fetchMyChildrenMarks,
  fetchMyReportCard,
  fetchExams,
  fetchExam,
  createExam,
  updateExam,
  deleteExam,
  publishExamResults,
  fetchExamMarks,
  fetchStudentsForMarksEntry,
  submitMarks,
  fetchStudentMarks,
  fetchReportCards,
  fetchStudentReportCard,
  generateReportCards,
  deleteReportCard,
  fetchGradeScales,
  fetchGradeScale,
  createGradeScale,
  updateGradeScale,
  deleteGradeScale,
  fetchExamTimetable,
  createExamSlot,
  fetchClassAnalytics,
  fetchStudentProgress,
  fetchCoScholasticRecords,
  submitCoScholastic,
  fetchQuestionPapers,
  fetchQuestionPaper,
  createQuestionPaper,
  deleteQuestionPaper,
} from '../api/exams.api'
import type {
  CreateExamRequest,
  UpdateExamRequest,
  ExamFilters,
  SubmitMarksRequest,
  GenerateReportCardsRequest,
  CreateGradeScaleRequest,
  UpdateGradeScaleRequest,
  CreateExamSlotRequest,
  SubmitCoScholasticRequest,
  CreateQuestionPaperRequest,
} from '../types/exams.types'

// ==================== QUERY KEYS ====================

export const examKeys = {
  all: ['exams'] as const,

  // User-scoped
  myMarks: (academicYear?: string) => [...examKeys.all, 'my-marks', academicYear] as const,
  myChildrenMarks: (academicYear?: string) => [...examKeys.all, 'my-children-marks', academicYear] as const,
  myReportCard: (examId?: string) => [...examKeys.all, 'my-report-card', examId] as const,

  // Exams
  exams: () => [...examKeys.all, 'list'] as const,
  examsList: (filters: ExamFilters) => [...examKeys.exams(), filters] as const,
  exam: (id: string) => [...examKeys.all, 'detail', id] as const,

  // Marks
  marks: () => [...examKeys.all, 'marks'] as const,
  examMarks: (examId: string, subjectId?: string, classId?: string) =>
    [...examKeys.marks(), examId, { subjectId, classId }] as const,
  studentMarks: (studentId: string, academicYear?: string) =>
    [...examKeys.marks(), 'student', studentId, academicYear] as const,
  marksEntryStudents: (examId: string, subjectId: string, className: string, section: string) =>
    [...examKeys.marks(), 'entry', examId, subjectId, className, section] as const,

  // Report Cards
  reportCards: () => [...examKeys.all, 'report-cards'] as const,
  examReportCards: (examId: string, classId?: string) =>
    [...examKeys.reportCards(), examId, classId] as const,
  studentReportCard: (studentId: string, examId?: string) =>
    [...examKeys.reportCards(), 'student', studentId, examId] as const,

  // Grade Scales
  gradeScales: () => [...examKeys.all, 'grade-scales'] as const,
  gradeScale: (id: string) => [...examKeys.gradeScales(), id] as const,

  // Timetable
  timetable: (examId: string) => [...examKeys.all, 'timetable', examId] as const,

  // Analytics
  analytics: (examId: string, className?: string, section?: string) =>
    [...examKeys.all, 'analytics', examId, className, section] as const,

  // Progress
  progress: (studentId: string) => [...examKeys.all, 'progress', studentId] as const,

  // Co-Scholastic
  coScholastic: () => [...examKeys.all, 'co-scholastic'] as const,
  coScholasticList: (filters: Record<string, unknown>) =>
    [...examKeys.coScholastic(), 'list', filters] as const,

  // Question Papers
  questionPapers: () => [...examKeys.all, 'question-papers'] as const,
  questionPaperList: (filters: Record<string, unknown>) =>
    [...examKeys.questionPapers(), 'list', filters] as const,
  questionPaper: (id: string) => [...examKeys.questionPapers(), 'detail', id] as const,
}

// ==================== USER-SCOPED HOOKS ====================

export function useMyMarks(academicYear?: string) {
  return useQuery({
    queryKey: examKeys.myMarks(academicYear),
    queryFn: () => fetchMyMarks(academicYear),
  })
}

export function useMyChildrenMarks(academicYear?: string) {
  return useQuery({
    queryKey: examKeys.myChildrenMarks(academicYear),
    queryFn: () => fetchMyChildrenMarks(academicYear),
  })
}

export function useMyReportCard(examId?: string) {
  return useQuery({
    queryKey: examKeys.myReportCard(examId),
    queryFn: () => fetchMyReportCard(examId),
  })
}

// ==================== EXAM HOOKS ====================

export function useExams(filters: ExamFilters = {}) {
  return useQuery({
    queryKey: examKeys.examsList(filters),
    queryFn: () => fetchExams(filters),
  })
}

export function useExam(id: string) {
  return useQuery({
    queryKey: examKeys.exam(id),
    queryFn: () => fetchExam(id),
    enabled: !!id,
  })
}

export function useCreateExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExamRequest) => createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.exams() })
    },
  })
}

export function useUpdateExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExamRequest }) => updateExam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examKeys.exam(variables.id) })
      queryClient.invalidateQueries({ queryKey: examKeys.exams() })
    },
  })
}

export function useDeleteExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.exams() })
    },
  })
}

export function usePublishExamResults() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => publishExamResults(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: examKeys.exam(id) })
      queryClient.invalidateQueries({ queryKey: examKeys.exams() })
    },
  })
}

// ==================== MARKS HOOKS ====================

export function useExamMarks(examId: string, subjectId?: string, classId?: string) {
  return useQuery({
    queryKey: examKeys.examMarks(examId, subjectId, classId),
    queryFn: () => fetchExamMarks(examId, subjectId, classId),
    enabled: !!examId,
  })
}

export function useStudentsForMarksEntry(
  examId: string,
  subjectId: string,
  className: string,
  section: string
) {
  return useQuery({
    queryKey: examKeys.marksEntryStudents(examId, subjectId, className, section),
    queryFn: () => fetchStudentsForMarksEntry(examId, subjectId, className, section),
    enabled: !!examId && !!subjectId && !!className && !!section,
  })
}

export function useSubmitMarks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubmitMarksRequest) => submitMarks(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examKeys.marks() })
      queryClient.invalidateQueries({ queryKey: examKeys.exam(variables.examId) })
    },
  })
}

export function useStudentMarks(studentId: string, academicYear?: string) {
  return useQuery({
    queryKey: examKeys.studentMarks(studentId, academicYear),
    queryFn: () => fetchStudentMarks(studentId, academicYear),
    enabled: !!studentId,
  })
}

// ==================== REPORT CARD HOOKS ====================

export function useExamReportCards(examId: string, classId?: string) {
  return useQuery({
    queryKey: examKeys.examReportCards(examId, classId),
    queryFn: () => fetchReportCards(examId, classId),
    enabled: !!examId,
  })
}

export function useStudentReportCard(studentId: string, examId?: string) {
  return useQuery({
    queryKey: examKeys.studentReportCard(studentId, examId),
    queryFn: () => fetchStudentReportCard(studentId, examId),
    enabled: !!studentId,
  })
}

export function useGenerateReportCards() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GenerateReportCardsRequest) => generateReportCards(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examKeys.reportCards() })
      queryClient.invalidateQueries({ queryKey: examKeys.examReportCards(variables.examId) })
    },
  })
}

export function useDeleteReportCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteReportCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.reportCards() })
    },
  })
}

// ==================== GRADE SCALE HOOKS ====================

export function useGradeScales() {
  return useQuery({
    queryKey: examKeys.gradeScales(),
    queryFn: fetchGradeScales,
  })
}

export function useGradeScale(id: string) {
  return useQuery({
    queryKey: examKeys.gradeScale(id),
    queryFn: () => fetchGradeScale(id),
    enabled: !!id,
  })
}

export function useCreateGradeScale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGradeScaleRequest) => createGradeScale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.gradeScales() })
    },
  })
}

export function useUpdateGradeScale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGradeScaleRequest }) =>
      updateGradeScale(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examKeys.gradeScale(variables.id) })
      queryClient.invalidateQueries({ queryKey: examKeys.gradeScales() })
    },
  })
}

export function useDeleteGradeScale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteGradeScale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.gradeScales() })
    },
  })
}

// ==================== TIMETABLE HOOKS ====================

export function useExamTimetable(examId: string) {
  return useQuery({
    queryKey: examKeys.timetable(examId),
    queryFn: () => fetchExamTimetable(examId),
    enabled: !!examId,
  })
}

export function useCreateExamSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ examId, data }: { examId: string; data: CreateExamSlotRequest }) =>
      createExamSlot(examId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examKeys.timetable(variables.examId) })
    },
  })
}

// ==================== ANALYTICS HOOKS ====================

export function useClassAnalytics(examId: string, className?: string, section?: string) {
  return useQuery({
    queryKey: examKeys.analytics(examId, className, section),
    queryFn: () => fetchClassAnalytics(examId, className, section),
    enabled: !!examId,
  })
}

// ==================== PROGRESS HOOKS ====================

export function useStudentProgress(studentId: string) {
  return useQuery({
    queryKey: examKeys.progress(studentId),
    queryFn: () => fetchStudentProgress(studentId),
    enabled: !!studentId,
  })
}

// ==================== CO-SCHOLASTIC HOOKS ====================

export function useCoScholasticRecords(
  filters: { studentId?: string; term?: string; area?: string; page?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: examKeys.coScholasticList(filters),
    queryFn: () => fetchCoScholasticRecords(filters),
  })
}

export function useSubmitCoScholastic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SubmitCoScholasticRequest) => submitCoScholastic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.coScholastic() })
    },
  })
}

// ==================== QUESTION PAPER HOOKS ====================

export function useQuestionPapers(
  filters: { examId?: string; subjectId?: string; className?: string } = {}
) {
  return useQuery({
    queryKey: examKeys.questionPaperList(filters),
    queryFn: () => fetchQuestionPapers(filters),
  })
}

export function useQuestionPaper(id: string) {
  return useQuery({
    queryKey: examKeys.questionPaper(id),
    queryFn: () => fetchQuestionPaper(id),
    enabled: !!id,
  })
}

export function useCreateQuestionPaper() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateQuestionPaperRequest) => createQuestionPaper(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.questionPapers() })
    },
  })
}

export function useDeleteQuestionPaper() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteQuestionPaper(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.questionPapers() })
    },
  })
}
