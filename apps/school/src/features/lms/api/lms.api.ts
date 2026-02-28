import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type {
  Course,
  CourseModule,
  Lesson,
  LiveClass,
  Enrollment,
  Assignment,
  AssignmentSubmission,
  Quiz,
  QuizAttempt,
  Instructor,
  LmsStats,
  CourseFilters,
  LiveClassFilters,
  EnrollmentFilters,
  CreateCourseRequest,
  UpdateCourseRequest,
  CreateModuleRequest,
  CreateLessonRequest,
  CreateLiveClassRequest,
  CreateEnrollmentRequest,
  CreateAssignmentRequest,
  CreateSubmissionRequest,
  GradeSubmissionRequest,
  CreateQuizRequest,
  SubmitQuizRequest,
  LessonProgressRequest,
  Certificate,
  CertificateTemplate,
  GenerateCertificateRequest,
  // SCORM/xAPI
  SCORMPackage,
  SCORMProgress,
  xAPIStatement,
  xAPIFilters,
  // Learning Paths
  LearningPath,
  LearningPathFilters,
  CreateLearningPathRequest,
  UpdateLearningPathRequest,
  PathProgress,
  // Video Conferencing
  VideoConference,
  ConferenceFilters,
  CreateConferenceRequest,
  UpdateConferenceRequest,
  ConferenceAttendee,
  // Plagiarism
  PlagiarismReport,
  PlagiarismFilters,
  CheckPlagiarismRequest,
  PlagiarismSettings,
  // Peer Review
  PeerReviewAssignment,
  CreatePeerReviewAssignmentRequest,
  PeerReview,
  PeerReviewFilters,
  SubmitPeerReviewRequest,
  PeerReviewSummary,
  // Discussion Forums
  DiscussionForum,
  ForumFilters,
  CreateForumRequest,
  ForumThread,
  ThreadFilters,
  CreateThreadRequest,
  ForumPost,
  PostFilters,
  CreatePostRequest,
  // Gamification
  Badge,
  BadgeFilters,
  CreateBadgeRequest,
  UserBadge,
  AwardBadgeRequest,
  Leaderboard,
  LeaderboardFilters,
  LeaderboardEntry,
  Achievement,
  AchievementFilters,
  GamificationProfile,
  GamificationStats,
  UpdateXpRequest,
} from '../types/lms.types'
import type { PaginatedResponse } from '@/types/common.types'

const BASE = '/api/lms'

// ==================== STATS ====================

export async function fetchLmsStats(): Promise<{ data: LmsStats }> {
  return apiGet(`${BASE}/stats`)
}

export async function fetchInstructors(): Promise<{ data: Instructor[] }> {
  return apiGet(`${BASE}/instructors`)
}

// ==================== COURSES ====================

export async function fetchCourses(params?: CourseFilters): Promise<PaginatedResponse<Course>> {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  if (params?.category) qs.set('category', params.category)
  if (params?.level) qs.set('level', params.level)
  if (params?.status) qs.set('status', params.status)
  if (params?.instructorId) qs.set('instructorId', params.instructorId)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/courses?${qs}`)
}

export async function fetchCourse(id: string): Promise<{ data: Course }> {
  return apiGet(`${BASE}/courses/${id}`)
}

export async function createCourse(data: CreateCourseRequest): Promise<{ data: Course }> {
  return apiPost(`${BASE}/courses`, data)
}

export async function updateCourse(id: string, data: UpdateCourseRequest): Promise<{ data: Course }> {
  return apiPut(`${BASE}/courses/${id}`, data)
}

export async function deleteCourse(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/courses/${id}`)
}

// ==================== MODULES ====================

export async function fetchCourseModules(courseId: string): Promise<{ data: CourseModule[] }> {
  return apiGet(`${BASE}/courses/${courseId}/modules`)
}

export async function createModule(data: CreateModuleRequest): Promise<{ data: CourseModule }> {
  return apiPost(`${BASE}/modules`, data)
}

export async function updateModule(id: string, data: Partial<CourseModule>): Promise<{ data: CourseModule }> {
  return apiPut(`${BASE}/modules/${id}`, data)
}

export async function deleteModule(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/modules/${id}`)
}

// ==================== LESSONS ====================

export async function fetchModuleLessons(moduleId: string): Promise<{ data: Lesson[] }> {
  return apiGet(`${BASE}/modules/${moduleId}/lessons`)
}

export async function createLesson(data: CreateLessonRequest): Promise<{ data: Lesson }> {
  return apiPost(`${BASE}/lessons`, data)
}

export async function updateLesson(id: string, data: Partial<Lesson>): Promise<{ data: Lesson }> {
  return apiPut(`${BASE}/lessons/${id}`, data)
}

export async function deleteLesson(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/lessons/${id}`)
}

// ==================== LIVE CLASSES ====================

export async function fetchLiveClasses(params?: LiveClassFilters): Promise<PaginatedResponse<LiveClass>> {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  if (params?.courseId) qs.set('courseId', params.courseId)
  if (params?.instructorId) qs.set('instructorId', params.instructorId)
  if (params?.status) qs.set('status', params.status)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/live-classes?${qs}`)
}

export async function fetchLiveClass(id: string): Promise<{ data: LiveClass }> {
  return apiGet(`${BASE}/live-classes/${id}`)
}

export async function createLiveClass(data: CreateLiveClassRequest): Promise<{ data: LiveClass }> {
  return apiPost(`${BASE}/live-classes`, data)
}

export async function updateLiveClass(id: string, data: Partial<LiveClass>): Promise<{ data: LiveClass }> {
  return apiPut(`${BASE}/live-classes/${id}`, data)
}

export async function deleteLiveClass(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/live-classes/${id}`)
}

// ==================== ENROLLMENTS ====================

export async function fetchEnrollments(params?: EnrollmentFilters): Promise<PaginatedResponse<Enrollment>> {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  if (params?.courseId) qs.set('courseId', params.courseId)
  if (params?.status) qs.set('status', params.status)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/enrollments?${qs}`)
}

export async function createEnrollment(data: CreateEnrollmentRequest): Promise<{ data: Enrollment }> {
  return apiPost(`${BASE}/enrollments`, data)
}

export async function updateEnrollment(id: string, data: Partial<Enrollment>): Promise<{ data: Enrollment }> {
  return apiPatch(`${BASE}/enrollments/${id}`, data)
}

export async function fetchEnrollmentProgress(
  id: string
): Promise<{ data: { enrollmentId: string; completedLessonIds: string[] } }> {
  return apiGet(`${BASE}/enrollments/${id}/progress`)
}

// ==================== ASSIGNMENTS ====================

export async function fetchAssignments(params?: { courseId?: string; search?: string }): Promise<{ data: Assignment[] }> {
  const qs = new URLSearchParams()
  if (params?.courseId) qs.set('courseId', params.courseId)
  if (params?.search) qs.set('search', params.search)
  return apiGet(`${BASE}/assignments?${qs}`)
}

export async function fetchAssignment(id: string): Promise<{ data: Assignment }> {
  return apiGet(`${BASE}/assignments/${id}`)
}

export async function createAssignment(data: CreateAssignmentRequest): Promise<{ data: Assignment }> {
  return apiPost(`${BASE}/assignments`, data)
}

export async function updateAssignment(id: string, data: Partial<Assignment>): Promise<{ data: Assignment }> {
  return apiPut(`${BASE}/assignments/${id}`, data)
}

export async function deleteAssignment(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/assignments/${id}`)
}

export async function fetchSubmissions(assignmentId: string): Promise<{ data: AssignmentSubmission[] }> {
  return apiGet(`${BASE}/assignments/${assignmentId}/submissions`)
}

export async function createSubmission(data: CreateSubmissionRequest): Promise<{ data: AssignmentSubmission }> {
  return apiPost(`${BASE}/submissions`, data)
}

export async function gradeSubmission(id: string, data: GradeSubmissionRequest): Promise<{ data: AssignmentSubmission }> {
  return apiPost(`${BASE}/submissions/${id}/grade`, data)
}

// ==================== QUIZZES ====================

export async function fetchQuizzes(params?: { courseId?: string; search?: string }): Promise<{ data: Quiz[] }> {
  const qs = new URLSearchParams()
  if (params?.courseId) qs.set('courseId', params.courseId)
  if (params?.search) qs.set('search', params.search)
  return apiGet(`${BASE}/quizzes?${qs}`)
}

export async function fetchQuiz(id: string): Promise<{ data: Quiz }> {
  return apiGet(`${BASE}/quizzes/${id}`)
}

export async function createQuiz(data: CreateQuizRequest): Promise<{ data: Quiz }> {
  return apiPost(`${BASE}/quizzes`, data)
}

export async function updateQuiz(id: string, data: Partial<Quiz>): Promise<{ data: Quiz }> {
  return apiPut(`${BASE}/quizzes/${id}`, data)
}

export async function deleteQuiz(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/quizzes/${id}`)
}

export async function submitQuiz(quizId: string, data: SubmitQuizRequest): Promise<{ data: QuizAttempt }> {
  return apiPost(`${BASE}/quizzes/${quizId}/submit`, data)
}

export async function fetchQuizAttempts(quizId: string): Promise<{ data: QuizAttempt[] }> {
  return apiGet(`${BASE}/quizzes/${quizId}/attempts`)
}

// ==================== LESSON PROGRESS ====================

export async function updateLessonProgress(
  lessonId: string,
  data: LessonProgressRequest
): Promise<{ data: { lessonId: string; completed: boolean } }> {
  return apiPost(`${BASE}/lessons/${lessonId}/progress`, data)
}

// ==================== CERTIFICATES ====================

export async function fetchCertificateTemplates(): Promise<{ data: CertificateTemplate[] }> {
  return apiGet(`${BASE}/certificates/templates`)
}

export async function fetchCertificates(params?: {
  studentId?: string
  courseId?: string
}): Promise<{ data: Certificate[] }> {
  const qs = new URLSearchParams()
  if (params?.studentId) qs.set('studentId', params.studentId)
  if (params?.courseId) qs.set('courseId', params.courseId)
  return apiGet(`${BASE}/certificates?${qs}`)
}

export async function fetchCertificate(id: string): Promise<{ data: Certificate }> {
  return apiGet(`${BASE}/certificates/${id}`)
}

export async function verifyCertificate(
  certNumber: string
): Promise<{ data: { valid: boolean; certificate?: Certificate; message: string } }> {
  return apiGet(`${BASE}/certificates/verify/${certNumber}`)
}

export async function generateCertificate(
  data: GenerateCertificateRequest
): Promise<{ data: Certificate }> {
  return apiPost(`${BASE}/certificates/generate`, data)
}

// ==================== SCORM/xAPI COMPLIANCE ====================

export async function fetchSCORMPackages(params?: {
  courseId?: string
  status?: string
}): Promise<{ data: SCORMPackage[] }> {
  const qs = new URLSearchParams()
  if (params?.courseId) qs.set('courseId', params.courseId)
  if (params?.status) qs.set('status', params.status)
  return apiGet(`${BASE}/scorm/packages?${qs}`)
}

export async function fetchSCORMPackage(id: string): Promise<{ data: SCORMPackage }> {
  return apiGet(`${BASE}/scorm/packages/${id}`)
}

export async function uploadSCORMPackage(data: {
  courseId: string
  title: string
  version: SCORMPackage['version']
  file: File
}): Promise<{ data: SCORMPackage }> {
  const formData = new FormData()
  formData.append('courseId', data.courseId)
  formData.append('title', data.title)
  formData.append('version', data.version)
  formData.append('file', data.file)
  return apiPost(`${BASE}/scorm/packages/upload`, formData)
}

export async function deleteSCORMPackage(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/scorm/packages/${id}`)
}

export async function fetchSCORMProgress(params: {
  packageId?: string
  studentId?: string
}): Promise<{ data: SCORMProgress[] }> {
  const qs = new URLSearchParams()
  if (params.packageId) qs.set('packageId', params.packageId)
  if (params.studentId) qs.set('studentId', params.studentId)
  return apiGet(`${BASE}/scorm/progress?${qs}`)
}

export async function updateSCORMProgress(
  id: string,
  data: Partial<SCORMProgress>
): Promise<{ data: SCORMProgress }> {
  return apiPatch(`${BASE}/scorm/progress/${id}`, data)
}

export async function launchSCORMPackage(
  packageId: string,
  studentId: string
): Promise<{ data: { launchUrl: string; token: string } }> {
  return apiPost(`${BASE}/scorm/packages/${packageId}/launch`, { studentId })
}

export async function fetchXAPIStatements(params?: xAPIFilters): Promise<{ data: xAPIStatement[] }> {
  const qs = new URLSearchParams()
  if (params?.actorEmail) qs.set('actorEmail', params.actorEmail)
  if (params?.verbId) qs.set('verbId', params.verbId)
  if (params?.activityId) qs.set('activityId', params.activityId)
  if (params?.since) qs.set('since', params.since)
  if (params?.until) qs.set('until', params.until)
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/xapi/statements?${qs}`)
}

export async function postXAPIStatement(statement: Omit<xAPIStatement, 'id' | 'stored'>): Promise<{ data: xAPIStatement }> {
  return apiPost(`${BASE}/xapi/statements`, statement)
}

// ==================== ADAPTIVE LEARNING PATHS ====================

export async function fetchLearningPaths(params?: LearningPathFilters): Promise<PaginatedResponse<LearningPath>> {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  if (params?.courseId) qs.set('courseId', params.courseId)
  if (params?.status) qs.set('status', params.status)
  if (params?.difficulty) qs.set('difficulty', params.difficulty)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/learning-paths?${qs}`)
}

export async function fetchLearningPath(id: string): Promise<{ data: LearningPath }> {
  return apiGet(`${BASE}/learning-paths/${id}`)
}

export async function createLearningPath(data: CreateLearningPathRequest): Promise<{ data: LearningPath }> {
  return apiPost(`${BASE}/learning-paths`, data)
}

export async function updateLearningPath(id: string, data: UpdateLearningPathRequest): Promise<{ data: LearningPath }> {
  return apiPut(`${BASE}/learning-paths/${id}`, data)
}

export async function deleteLearningPath(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/learning-paths/${id}`)
}

export async function fetchPathProgress(params: {
  pathId?: string
  studentId?: string
}): Promise<{ data: PathProgress[] }> {
  const qs = new URLSearchParams()
  if (params.pathId) qs.set('pathId', params.pathId)
  if (params.studentId) qs.set('studentId', params.studentId)
  return apiGet(`${BASE}/learning-paths/progress?${qs}`)
}

export async function enrollInPath(pathId: string, studentId: string): Promise<{ data: PathProgress }> {
  return apiPost(`${BASE}/learning-paths/${pathId}/enroll`, { studentId })
}

export async function updateNodeProgress(
  pathId: string,
  nodeId: string,
  data: { studentId: string; score?: number; completed: boolean }
): Promise<{ data: PathProgress }> {
  return apiPost(`${BASE}/learning-paths/${pathId}/nodes/${nodeId}/progress`, data)
}

// ==================== VIDEO CONFERENCING INTEGRATION ====================

export async function fetchVideoConferences(params?: ConferenceFilters): Promise<PaginatedResponse<VideoConference>> {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  if (params?.courseId) qs.set('courseId', params.courseId)
  if (params?.hostId) qs.set('hostId', params.hostId)
  if (params?.provider) qs.set('provider', params.provider)
  if (params?.status) qs.set('status', params.status)
  if (params?.fromDate) qs.set('fromDate', params.fromDate)
  if (params?.toDate) qs.set('toDate', params.toDate)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/conferences?${qs}`)
}

export async function fetchVideoConference(id: string): Promise<{ data: VideoConference }> {
  return apiGet(`${BASE}/conferences/${id}`)
}

export async function createVideoConference(data: CreateConferenceRequest): Promise<{ data: VideoConference }> {
  return apiPost(`${BASE}/conferences`, data)
}

export async function updateVideoConference(id: string, data: UpdateConferenceRequest): Promise<{ data: VideoConference }> {
  return apiPut(`${BASE}/conferences/${id}`, data)
}

export async function deleteVideoConference(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/conferences/${id}`)
}

export async function startConference(id: string): Promise<{ data: VideoConference }> {
  return apiPost(`${BASE}/conferences/${id}/start`, {})
}

export async function endConference(id: string): Promise<{ data: VideoConference }> {
  return apiPost(`${BASE}/conferences/${id}/end`, {})
}

export async function joinConference(id: string, participantId: string): Promise<{ data: { joinUrl: string } }> {
  return apiPost(`${BASE}/conferences/${id}/join`, { participantId })
}

export async function fetchConferenceAttendees(conferenceId: string): Promise<{ data: ConferenceAttendee[] }> {
  return apiGet(`${BASE}/conferences/${conferenceId}/attendees`)
}

export async function getConferenceRecording(id: string): Promise<{ data: { recordingUrl: string; expiresAt: string } }> {
  return apiGet(`${BASE}/conferences/${id}/recording`)
}

// ==================== PLAGIARISM DETECTION ====================

export async function fetchPlagiarismReports(params?: PlagiarismFilters): Promise<PaginatedResponse<PlagiarismReport>> {
  const qs = new URLSearchParams()
  if (params?.assignmentId) qs.set('assignmentId', params.assignmentId)
  if (params?.studentId) qs.set('studentId', params.studentId)
  if (params?.status) qs.set('status', params.status)
  if (params?.minSimilarity) qs.set('minSimilarity', String(params.minSimilarity))
  if (params?.maxSimilarity) qs.set('maxSimilarity', String(params.maxSimilarity))
  if (params?.similarityLevel) qs.set('similarityLevel', params.similarityLevel)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/plagiarism/reports?${qs}`)
}

export async function fetchPlagiarismReport(id: string): Promise<{ data: PlagiarismReport }> {
  return apiGet(`${BASE}/plagiarism/reports/${id}`)
}

export async function checkPlagiarism(data: CheckPlagiarismRequest): Promise<{ data: PlagiarismReport }> {
  return apiPost(`${BASE}/plagiarism/check`, data)
}

export async function fetchPlagiarismSettings(courseId?: string): Promise<{ data: PlagiarismSettings }> {
  const qs = courseId ? `?courseId=${courseId}` : ''
  return apiGet(`${BASE}/plagiarism/settings${qs}`)
}

export async function updatePlagiarismSettings(
  data: Partial<PlagiarismSettings> & { courseId?: string }
): Promise<{ data: PlagiarismSettings }> {
  return apiPut(`${BASE}/plagiarism/settings`, data)
}

export async function rerunPlagiarismCheck(reportId: string): Promise<{ data: PlagiarismReport }> {
  return apiPost(`${BASE}/plagiarism/reports/${reportId}/rerun`, {})
}

// ==================== PEER REVIEW ASSIGNMENTS ====================

export async function fetchPeerReviewAssignments(params?: {
  courseId?: string
  assignmentId?: string
  status?: string
}): Promise<{ data: PeerReviewAssignment[] }> {
  const qs = new URLSearchParams()
  if (params?.courseId) qs.set('courseId', params.courseId)
  if (params?.assignmentId) qs.set('assignmentId', params.assignmentId)
  if (params?.status) qs.set('status', params.status)
  return apiGet(`${BASE}/peer-reviews/assignments?${qs}`)
}

export async function fetchPeerReviewAssignment(id: string): Promise<{ data: PeerReviewAssignment }> {
  return apiGet(`${BASE}/peer-reviews/assignments/${id}`)
}

export async function createPeerReviewAssignment(data: CreatePeerReviewAssignmentRequest): Promise<{ data: PeerReviewAssignment }> {
  return apiPost(`${BASE}/peer-reviews/assignments`, data)
}

export async function updatePeerReviewAssignment(
  id: string,
  data: Partial<PeerReviewAssignment>
): Promise<{ data: PeerReviewAssignment }> {
  return apiPut(`${BASE}/peer-reviews/assignments/${id}`, data)
}

export async function deletePeerReviewAssignment(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/peer-reviews/assignments/${id}`)
}

export async function distributePeerReviews(peerReviewAssignmentId: string): Promise<{ data: { assignedCount: number } }> {
  return apiPost(`${BASE}/peer-reviews/assignments/${peerReviewAssignmentId}/distribute`, {})
}

export async function fetchPeerReviews(params?: PeerReviewFilters): Promise<PaginatedResponse<PeerReview>> {
  const qs = new URLSearchParams()
  if (params?.peerReviewAssignmentId) qs.set('peerReviewAssignmentId', params.peerReviewAssignmentId)
  if (params?.reviewerId) qs.set('reviewerId', params.reviewerId)
  if (params?.submissionStudentId) qs.set('submissionStudentId', params.submissionStudentId)
  if (params?.status) qs.set('status', params.status)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/peer-reviews?${qs}`)
}

export async function fetchPeerReview(id: string): Promise<{ data: PeerReview }> {
  return apiGet(`${BASE}/peer-reviews/${id}`)
}

export async function submitPeerReview(id: string, data: SubmitPeerReviewRequest): Promise<{ data: PeerReview }> {
  return apiPost(`${BASE}/peer-reviews/${id}/submit`, data)
}

export async function fetchPeerReviewSummary(params: {
  peerReviewAssignmentId: string
  submissionId?: string
  studentId?: string
}): Promise<{ data: PeerReviewSummary[] }> {
  const qs = new URLSearchParams()
  qs.set('peerReviewAssignmentId', params.peerReviewAssignmentId)
  if (params.submissionId) qs.set('submissionId', params.submissionId)
  if (params.studentId) qs.set('studentId', params.studentId)
  return apiGet(`${BASE}/peer-reviews/summary?${qs}`)
}

export async function ratePeerReview(
  id: string,
  qualityRating: number
): Promise<{ data: PeerReview }> {
  return apiPost(`${BASE}/peer-reviews/${id}/rate`, { qualityRating })
}

// ==================== DISCUSSION FORUMS ====================

export async function fetchForums(params?: ForumFilters): Promise<PaginatedResponse<DiscussionForum>> {
  const qs = new URLSearchParams()
  if (params?.courseId) qs.set('courseId', params.courseId)
  if (params?.status) qs.set('status', params.status)
  if (params?.search) qs.set('search', params.search)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/forums?${qs}`)
}

export async function fetchForum(id: string): Promise<{ data: DiscussionForum }> {
  return apiGet(`${BASE}/forums/${id}`)
}

export async function createForum(data: CreateForumRequest): Promise<{ data: DiscussionForum }> {
  return apiPost(`${BASE}/forums`, data)
}

export async function updateForum(id: string, data: Partial<DiscussionForum>): Promise<{ data: DiscussionForum }> {
  return apiPut(`${BASE}/forums/${id}`, data)
}

export async function deleteForum(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/forums/${id}`)
}

export async function fetchThreads(params: ThreadFilters): Promise<PaginatedResponse<ForumThread>> {
  const qs = new URLSearchParams()
  qs.set('forumId', params.forumId)
  if (params.status) qs.set('status', params.status)
  if (params.authorId) qs.set('authorId', params.authorId)
  if (params.search) qs.set('search', params.search)
  if (params.tags) qs.set('tags', params.tags.join(','))
  if (params.sortBy) qs.set('sortBy', params.sortBy)
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/forums/threads?${qs}`)
}

export async function fetchThread(id: string): Promise<{ data: ForumThread }> {
  return apiGet(`${BASE}/forums/threads/${id}`)
}

export async function createThread(data: CreateThreadRequest): Promise<{ data: ForumThread }> {
  return apiPost(`${BASE}/forums/threads`, data)
}

export async function updateThread(id: string, data: Partial<ForumThread>): Promise<{ data: ForumThread }> {
  return apiPut(`${BASE}/forums/threads/${id}`, data)
}

export async function deleteThread(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/forums/threads/${id}`)
}

export async function pinThread(id: string, isPinned: boolean): Promise<{ data: ForumThread }> {
  return apiPost(`${BASE}/forums/threads/${id}/pin`, { isPinned })
}

export async function lockThread(id: string, isLocked: boolean): Promise<{ data: ForumThread }> {
  return apiPost(`${BASE}/forums/threads/${id}/lock`, { isLocked })
}

export async function fetchPosts(params: PostFilters): Promise<PaginatedResponse<ForumPost>> {
  const qs = new URLSearchParams()
  qs.set('threadId', params.threadId)
  if (params.authorId) qs.set('authorId', params.authorId)
  if (params.status) qs.set('status', params.status)
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/forums/posts?${qs}`)
}

export async function fetchPost(id: string): Promise<{ data: ForumPost }> {
  return apiGet(`${BASE}/forums/posts/${id}`)
}

export async function createPost(data: CreatePostRequest): Promise<{ data: ForumPost }> {
  return apiPost(`${BASE}/forums/posts`, data)
}

export async function updatePost(id: string, data: Partial<ForumPost>): Promise<{ data: ForumPost }> {
  return apiPut(`${BASE}/forums/posts/${id}`, data)
}

export async function deletePost(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/forums/posts/${id}`)
}

export async function upvotePost(id: string): Promise<{ data: ForumPost }> {
  return apiPost(`${BASE}/forums/posts/${id}/upvote`, {})
}

export async function downvotePost(id: string): Promise<{ data: ForumPost }> {
  return apiPost(`${BASE}/forums/posts/${id}/downvote`, {})
}

export async function markAsAnswer(threadId: string, postId: string): Promise<{ data: ForumThread }> {
  return apiPost(`${BASE}/forums/threads/${threadId}/answer`, { postId })
}

export async function votePoll(threadId: string, optionIds: string[]): Promise<{ data: ForumThread }> {
  return apiPost(`${BASE}/forums/threads/${threadId}/poll/vote`, { optionIds })
}

// ==================== GAMIFICATION ====================

export async function fetchBadges(params?: BadgeFilters): Promise<PaginatedResponse<Badge>> {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  if (params?.rarity) qs.set('rarity', params.rarity)
  if (params?.earnedByUser) qs.set('earnedByUser', params.earnedByUser)
  if (params?.search) qs.set('search', params.search)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/gamification/badges?${qs}`)
}

export async function fetchBadge(id: string): Promise<{ data: Badge }> {
  return apiGet(`${BASE}/gamification/badges/${id}`)
}

export async function createBadge(data: CreateBadgeRequest): Promise<{ data: Badge }> {
  return apiPost(`${BASE}/gamification/badges`, data)
}

export async function updateBadge(id: string, data: Partial<Badge>): Promise<{ data: Badge }> {
  return apiPut(`${BASE}/gamification/badges/${id}`, data)
}

export async function deleteBadge(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${BASE}/gamification/badges/${id}`)
}

export async function awardBadge(data: AwardBadgeRequest): Promise<{ data: UserBadge }> {
  return apiPost(`${BASE}/gamification/badges/award`, data)
}

export async function fetchUserBadges(userId: string): Promise<{ data: UserBadge[] }> {
  return apiGet(`${BASE}/gamification/users/${userId}/badges`)
}

export async function fetchLeaderboards(params?: LeaderboardFilters): Promise<{ data: Leaderboard[] }> {
  const qs = new URLSearchParams()
  if (params?.type) qs.set('type', params.type)
  if (params?.courseId) qs.set('courseId', params.courseId)
  if (params?.metric) qs.set('metric', params.metric)
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/gamification/leaderboards?${qs}`)
}

export async function fetchLeaderboard(id: string): Promise<{ data: Leaderboard }> {
  return apiGet(`${BASE}/gamification/leaderboards/${id}`)
}

export async function fetchGamificationProfile(userId: string): Promise<{ data: GamificationProfile }> {
  return apiGet(`${BASE}/gamification/users/${userId}/profile`)
}

export async function updateXp(data: UpdateXpRequest): Promise<{ data: GamificationProfile }> {
  return apiPost(`${BASE}/gamification/xp`, data)
}

export async function fetchAchievements(params?: AchievementFilters): Promise<PaginatedResponse<Achievement>> {
  const qs = new URLSearchParams()
  if (params?.userId) qs.set('userId', params.userId)
  if (params?.type) qs.set('type', params.type)
  if (params?.isRead !== undefined) qs.set('isRead', String(params.isRead))
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet(`${BASE}/gamification/achievements?${qs}`)
}

export async function markAchievementRead(id: string): Promise<{ data: Achievement }> {
  return apiPost(`${BASE}/gamification/achievements/${id}/read`, {})
}

export async function fetchGamificationStats(): Promise<{ data: GamificationStats }> {
  return apiGet(`${BASE}/gamification/stats`)
}
