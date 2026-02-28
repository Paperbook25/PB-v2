import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchLmsStats,
  fetchInstructors,
  fetchCourses,
  fetchCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  fetchCourseModules,
  createModule,
  updateModule,
  deleteModule,
  fetchModuleLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  fetchLiveClasses,
  fetchLiveClass,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass,
  fetchEnrollments,
  createEnrollment,
  updateEnrollment,
  fetchAssignments,
  fetchAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  fetchSubmissions,
  createSubmission,
  gradeSubmission,
  fetchQuizzes,
  fetchQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  fetchQuizAttempts,
  updateLessonProgress,
  fetchCertificates,
  fetchCertificate,
  fetchCertificateTemplates,
  verifyCertificate,
  generateCertificate,
} from '../api/lms.api'
import type {
  CourseFilters,
  LiveClassFilters,
  EnrollmentFilters,
  CreateCourseRequest,
  UpdateCourseRequest,
  CreateModuleRequest,
  CourseModule,
  Lesson,
  CreateLessonRequest,
  CreateLiveClassRequest,
  LiveClass,
  Enrollment,
  CreateEnrollmentRequest,
  CreateAssignmentRequest,
  Assignment,
  CreateSubmissionRequest,
  GradeSubmissionRequest,
  CreateQuizRequest,
  Quiz,
  SubmitQuizRequest,
  LessonProgressRequest,
  GenerateCertificateRequest,
} from '../types/lms.types'

export const lmsKeys = {
  all: ['lms'] as const,
  stats: () => [...lmsKeys.all, 'stats'] as const,
  instructors: () => [...lmsKeys.all, 'instructors'] as const,
  courses: () => [...lmsKeys.all, 'courses'] as const,
  courseList: (params?: Record<string, unknown>) => [...lmsKeys.courses(), 'list', params] as const,
  courseDetail: (id: string) => [...lmsKeys.courses(), 'detail', id] as const,
  modules: (courseId: string) => [...lmsKeys.all, 'modules', courseId] as const,
  lessons: (moduleId: string) => [...lmsKeys.all, 'lessons', moduleId] as const,
  liveClasses: () => [...lmsKeys.all, 'live-classes'] as const,
  liveClassList: (params?: Record<string, unknown>) => [...lmsKeys.liveClasses(), 'list', params] as const,
  liveClassDetail: (id: string) => [...lmsKeys.liveClasses(), 'detail', id] as const,
  enrollments: () => [...lmsKeys.all, 'enrollments'] as const,
  enrollmentList: (params?: Record<string, unknown>) => [...lmsKeys.enrollments(), 'list', params] as const,
  assignments: () => [...lmsKeys.all, 'assignments'] as const,
  assignmentList: (params?: Record<string, unknown>) => [...lmsKeys.assignments(), 'list', params] as const,
  assignmentDetail: (id: string) => [...lmsKeys.assignments(), 'detail', id] as const,
  submissions: (assignmentId: string) => [...lmsKeys.all, 'submissions', assignmentId] as const,
  quizzes: () => [...lmsKeys.all, 'quizzes'] as const,
  quizList: (params?: Record<string, unknown>) => [...lmsKeys.quizzes(), 'list', params] as const,
  quizDetail: (id: string) => [...lmsKeys.quizzes(), 'detail', id] as const,
  quizAttempts: (quizId: string) => [...lmsKeys.all, 'quiz-attempts', quizId] as const,
  certificates: () => [...lmsKeys.all, 'certificates'] as const,
  certificateList: (params?: Record<string, unknown>) => [...lmsKeys.certificates(), 'list', params] as const,
  certificateDetail: (id: string) => [...lmsKeys.certificates(), 'detail', id] as const,
  certificateTemplates: () => [...lmsKeys.certificates(), 'templates'] as const,
}

// ==================== STATS ====================

export function useLmsStats() {
  return useQuery({
    queryKey: lmsKeys.stats(),
    queryFn: fetchLmsStats,
  })
}

export function useInstructors() {
  return useQuery({
    queryKey: lmsKeys.instructors(),
    queryFn: fetchInstructors,
  })
}

// ==================== COURSES ====================

export function useCourses(params?: CourseFilters) {
  return useQuery({
    queryKey: lmsKeys.courseList(params as Record<string, unknown>),
    queryFn: () => fetchCourses(params),
  })
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: lmsKeys.courseDetail(id),
    queryFn: () => fetchCourse(id),
    enabled: !!id,
  })
}

export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCourseRequest) => createCourse(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.courses() }),
  })
}

export function useUpdateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseRequest }) => updateCourse(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.courses() }),
  })
}

export function useDeleteCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.courses() }),
  })
}

// ==================== MODULES ====================

export function useCourseModules(courseId: string) {
  return useQuery({
    queryKey: lmsKeys.modules(courseId),
    queryFn: () => fetchCourseModules(courseId),
    enabled: !!courseId,
  })
}

export function useCreateModule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateModuleRequest) => createModule(data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: lmsKeys.modules(variables.courseId) })
    },
  })
}

export function useUpdateModule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CourseModule> }) => updateModule(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.all }),
  })
}

export function useDeleteModule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteModule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.all }),
  })
}

// ==================== LESSONS ====================

export function useModuleLessons(moduleId: string) {
  return useQuery({
    queryKey: lmsKeys.lessons(moduleId),
    queryFn: () => fetchModuleLessons(moduleId),
    enabled: !!moduleId,
  })
}

export function useCreateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLessonRequest) => createLesson(data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: lmsKeys.lessons(variables.moduleId) })
    },
  })
}

export function useUpdateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lesson> }) => updateLesson(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.all }),
  })
}

export function useDeleteLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLesson(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.all }),
  })
}

// ==================== LIVE CLASSES ====================

export function useLiveClasses(params?: LiveClassFilters) {
  return useQuery({
    queryKey: lmsKeys.liveClassList(params as Record<string, unknown>),
    queryFn: () => fetchLiveClasses(params),
  })
}

export function useLiveClass(id: string) {
  return useQuery({
    queryKey: lmsKeys.liveClassDetail(id),
    queryFn: () => fetchLiveClass(id),
    enabled: !!id,
  })
}

export function useCreateLiveClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLiveClassRequest) => createLiveClass(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.liveClasses() }),
  })
}

export function useUpdateLiveClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LiveClass> }) => updateLiveClass(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.liveClasses() }),
  })
}

export function useDeleteLiveClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLiveClass(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.liveClasses() }),
  })
}

// ==================== ENROLLMENTS ====================

export function useEnrollments(params?: EnrollmentFilters) {
  return useQuery({
    queryKey: lmsKeys.enrollmentList(params as Record<string, unknown>),
    queryFn: () => fetchEnrollments(params),
  })
}

export function useCreateEnrollment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEnrollmentRequest) => createEnrollment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.enrollments() })
      qc.invalidateQueries({ queryKey: lmsKeys.courses() })
      qc.invalidateQueries({ queryKey: lmsKeys.stats() })
    },
  })
}

export function useUpdateEnrollment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Enrollment> }) => updateEnrollment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.enrollments() }),
  })
}

// ==================== ASSIGNMENTS ====================

export function useAssignments(params?: { courseId?: string; search?: string }) {
  return useQuery({
    queryKey: lmsKeys.assignmentList(params as Record<string, unknown>),
    queryFn: () => fetchAssignments(params),
  })
}

export function useAssignment(id: string) {
  return useQuery({
    queryKey: lmsKeys.assignmentDetail(id),
    queryFn: () => fetchAssignment(id),
    enabled: !!id,
  })
}

export function useCreateAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) => createAssignment(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.assignments() }),
  })
}

export function useUpdateAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Assignment> }) => updateAssignment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.assignments() }),
  })
}

export function useDeleteAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAssignment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.assignments() }),
  })
}

export function useSubmissions(assignmentId: string) {
  return useQuery({
    queryKey: lmsKeys.submissions(assignmentId),
    queryFn: () => fetchSubmissions(assignmentId),
    enabled: !!assignmentId,
  })
}

export function useCreateSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSubmissionRequest) => createSubmission(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.assignments() }),
  })
}

export function useGradeSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GradeSubmissionRequest }) => gradeSubmission(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.all }),
  })
}

// ==================== QUIZZES ====================

export function useQuizzes(params?: { courseId?: string; search?: string }) {
  return useQuery({
    queryKey: lmsKeys.quizList(params as Record<string, unknown>),
    queryFn: () => fetchQuizzes(params),
  })
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: lmsKeys.quizDetail(id),
    queryFn: () => fetchQuiz(id),
    enabled: !!id,
  })
}

export function useCreateQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateQuizRequest) => createQuiz(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.quizzes() }),
  })
}

export function useUpdateQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quiz> }) => updateQuiz(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.quizzes() }),
  })
}

export function useDeleteQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteQuiz(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.quizzes() }),
  })
}

export function useSubmitQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: SubmitQuizRequest }) => submitQuiz(quizId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lmsKeys.all }),
  })
}

export function useQuizAttempts(quizId: string) {
  return useQuery({
    queryKey: lmsKeys.quizAttempts(quizId),
    queryFn: () => fetchQuizAttempts(quizId),
    enabled: !!quizId,
  })
}

// ==================== LESSON PROGRESS ====================

export function useUpdateLessonProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: LessonProgressRequest }) => updateLessonProgress(lessonId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.enrollments() })
      qc.invalidateQueries({ queryKey: lmsKeys.stats() })
    },
  })
}

// ==================== CERTIFICATES ====================

export function useCertificates(params?: { studentId?: string; courseId?: string }) {
  return useQuery({
    queryKey: lmsKeys.certificateList(params as Record<string, unknown>),
    queryFn: () => fetchCertificates(params),
  })
}

export function useCertificate(id: string) {
  return useQuery({
    queryKey: lmsKeys.certificateDetail(id),
    queryFn: () => fetchCertificate(id),
    enabled: !!id,
  })
}

export function useCertificateTemplates() {
  return useQuery({
    queryKey: lmsKeys.certificateTemplates(),
    queryFn: fetchCertificateTemplates,
  })
}

export function useVerifyCertificate(certNumber: string) {
  return useQuery({
    queryKey: [...lmsKeys.certificates(), 'verify', certNumber],
    queryFn: () => verifyCertificate(certNumber),
    enabled: !!certNumber,
  })
}

export function useGenerateCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: GenerateCertificateRequest) => generateCertificate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.certificates() })
      qc.invalidateQueries({ queryKey: lmsKeys.enrollments() })
    },
  })
}
