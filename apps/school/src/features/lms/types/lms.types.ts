// ==================== STATUS & TYPE UNIONS ====================

export type CourseStatus = 'draft' | 'published' | 'archived'
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type LessonType = 'video' | 'live_class' | 'document' | 'quiz' | 'assignment'
export type VideoProvider = 'youtube' | 'vimeo' | 'upload'
export type LiveClassStatus = 'scheduled' | 'live' | 'completed' | 'cancelled'
export type EnrollmentStatus = 'active' | 'completed' | 'dropped'
export type SubmissionStatus = 'not_submitted' | 'submitted' | 'graded'
export type QuizQuestionType = 'mcq' | 'true_false' | 'short_answer'

// ==================== CONSTANTS ====================

export const COURSE_CATEGORIES = [
  'mathematics',
  'science',
  'english',
  'social_studies',
  'computer_science',
  'arts',
  'physical_education',
  'languages',
  'general',
] as const

export type CourseCategory = (typeof COURSE_CATEGORIES)[number]

export const COURSE_CATEGORY_LABELS: Record<CourseCategory, string> = {
  mathematics: 'Mathematics',
  science: 'Science',
  english: 'English',
  social_studies: 'Social Studies',
  computer_science: 'Computer Science',
  arts: 'Arts',
  physical_education: 'Physical Education',
  languages: 'Languages',
  general: 'General',
}

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: 'Video',
  live_class: 'Live Class',
  document: 'Document',
  quiz: 'Quiz',
  assignment: 'Assignment',
}

export const LIVE_CLASS_STATUS_LABELS: Record<LiveClassStatus, string> = {
  scheduled: 'Scheduled',
  live: 'Live Now',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  dropped: 'Dropped',
}

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  not_submitted: 'Not Submitted',
  submitted: 'Submitted',
  graded: 'Graded',
}

// ==================== INTERFACES ====================

export interface Instructor {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  expertise: string[]
  coursesCount: number
  rating: number
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  category: CourseCategory
  level: CourseLevel
  instructorId: string
  instructorName: string
  price: number
  status: CourseStatus
  duration: number // hours
  enrollmentCount: number
  rating: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CourseModule {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  duration: number // minutes
}

export interface Lesson {
  id: string
  moduleId: string
  courseId: string
  title: string
  type: LessonType
  order: number
  duration: number // minutes
  contentUrl: string
  videoProvider?: VideoProvider
  isFree: boolean
}

export interface LiveClass {
  id: string
  courseId: string
  courseName: string
  title: string
  instructorId: string
  instructorName: string
  scheduledAt: string
  duration: number // minutes
  meetingLink: string
  meetingId?: string
  meetingPassword?: string
  status: LiveClassStatus
  attendanceCount: number
  recordingUrl?: string
}

export interface Enrollment {
  id: string
  courseId: string
  courseName: string
  studentId: string
  studentName: string
  enrolledAt: string
  status: EnrollmentStatus
  progress: number // percentage
  lessonsCompleted: number
  totalLessons: number
}

export interface Assignment {
  id: string
  lessonId: string
  courseId: string
  courseName: string
  title: string
  instructions: string
  maxScore: number
  dueDate: string
  submissionCount: number
  createdAt: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  submittedAt: string
  submissionText: string
  attachmentUrl?: string
  score: number | null
  feedback: string
  status: SubmissionStatus
}

export interface QuizQuestion {
  id: string
  question: string
  type: QuizQuestionType
  options: string[]
  correctAnswer: string
  points: number
  explanation?: string
}

export interface Quiz {
  id: string
  lessonId: string
  courseId: string
  courseName: string
  title: string
  description: string
  duration: number // minutes, 0 = no limit
  passingScore: number // percentage
  maxAttempts: number
  questions: QuizQuestion[]
  totalPoints: number
  createdAt: string
}

export interface QuizAttempt {
  id: string
  quizId: string
  quizTitle: string
  studentId: string
  studentName: string
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
  answers: { questionId: string; answer: string; correct: boolean }[]
  submittedAt: string
}

// ==================== STATS ====================

export interface LmsStats {
  totalCourses: number
  publishedCourses: number
  totalStudents: number
  activeEnrollments: number
  liveClassesToday: number
  avgCompletionRate: number
  totalInstructors: number
  totalRevenue: number
}

export interface InstructorStats {
  totalCourses: number
  totalStudents: number
  avgRating: number
  liveClassesThisWeek: number
  pendingGrading: number
}

export interface StudentLmsStats {
  enrolledCourses: number
  completedCourses: number
  avgProgress: number
  upcomingLiveClasses: number
  pendingAssignments: number
  quizzesTaken: number
}

// ==================== FILTER TYPES ====================

export interface CourseFilters {
  search?: string
  category?: CourseCategory
  level?: CourseLevel
  status?: CourseStatus
  instructorId?: string
  page?: number
  limit?: number
}

export interface LiveClassFilters {
  search?: string
  courseId?: string
  instructorId?: string
  status?: LiveClassStatus
  page?: number
  limit?: number
}

export interface EnrollmentFilters {
  search?: string
  courseId?: string
  status?: EnrollmentStatus
  page?: number
  limit?: number
}

// ==================== REQUEST TYPES ====================

export interface CreateCourseRequest {
  title: string
  description: string
  thumbnail?: string
  category: CourseCategory
  level: CourseLevel
  instructorId: string
  price: number
  status: CourseStatus
  tags: string[]
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

export interface CreateModuleRequest {
  courseId: string
  title: string
  description: string
  order: number
}

export interface CreateLessonRequest {
  moduleId: string
  courseId: string
  title: string
  type: LessonType
  order: number
  duration: number
  contentUrl: string
  videoProvider?: VideoProvider
  isFree: boolean
}

export interface CreateLiveClassRequest {
  courseId: string
  title: string
  instructorId: string
  scheduledAt: string
  duration: number
  meetingLink: string
  meetingId?: string
  meetingPassword?: string
}

export interface CreateEnrollmentRequest {
  courseId: string
  studentId: string
}

export interface CreateAssignmentRequest {
  lessonId: string
  courseId: string
  title: string
  instructions: string
  maxScore: number
  dueDate: string
}

export interface CreateSubmissionRequest {
  assignmentId: string
  studentId: string
  submissionText: string
  attachmentUrl?: string
}

export interface GradeSubmissionRequest {
  score: number
  feedback: string
}

export interface CreateQuizRequest {
  lessonId: string
  courseId: string
  title: string
  description: string
  duration: number
  passingScore: number
  maxAttempts: number
  questions: Omit<QuizQuestion, 'id'>[]
}

export interface SubmitQuizRequest {
  studentId: string
  answers: { questionId: string; answer: string }[]
}

export interface LessonProgressRequest {
  studentId: string
  enrollmentId: string
  completed: boolean
}

// ==================== CERTIFICATES ====================

export type CertificateType = 'completion' | 'achievement' | 'excellence'

export interface Certificate {
  id: string
  enrollmentId: string
  courseId: string
  courseName: string
  studentId: string
  studentName: string
  instructorName: string
  type: CertificateType
  issueDate: string
  certificateNumber: string
  completionPercentage: number
  grade?: string
  hoursCompleted: number
  skills: string[]
  verificationUrl: string
}

export interface CertificateTemplate {
  id: string
  name: string
  type: CertificateType
  backgroundColor: string
  borderColor: string
  logoUrl?: string
  signatureUrl?: string
  isDefault: boolean
}

export interface GenerateCertificateRequest {
  enrollmentId: string
  type?: CertificateType
  templateId?: string
}

// ==================== SCORM/xAPI COMPLIANCE ====================

export type SCORMVersion = '1.2' | '2004'
export type SCORMStatus = 'not_attempted' | 'incomplete' | 'completed' | 'passed' | 'failed'

export interface SCORMPackage {
  id: string
  courseId: string
  courseName: string
  title: string
  version: SCORMVersion
  manifestUrl: string
  launchUrl: string
  fileSize: number // in bytes
  uploadedAt: string
  uploadedBy: string
  status: 'processing' | 'ready' | 'error'
  errorMessage?: string
  metadata: {
    description?: string
    keywords?: string[]
    duration?: number // estimated minutes
    masteryScore?: number
  }
}

export interface SCORMProgress {
  id: string
  packageId: string
  studentId: string
  studentName: string
  status: SCORMStatus
  score?: number
  maxScore?: number
  timeSpent: number // seconds
  completionPercentage: number
  lastAccessed: string
  attemptCount: number
  suspendData?: string
  bookmarkLocation?: string
}

export interface xAPIStatement {
  id: string
  actor: {
    mbox: string
    name: string
    objectType: 'Agent'
  }
  verb: {
    id: string
    display: { 'en-US': string }
  }
  object: {
    id: string
    objectType: 'Activity'
    definition: {
      name: { 'en-US': string }
      description?: { 'en-US': string }
      type: string
    }
  }
  result?: {
    score?: { scaled?: number; raw?: number; min?: number; max?: number }
    success?: boolean
    completion?: boolean
    duration?: string // ISO 8601 duration
  }
  context?: {
    registration?: string
    instructor?: { name: string; mbox: string }
    contextActivities?: {
      parent?: { id: string; objectType: 'Activity' }[]
      grouping?: { id: string; objectType: 'Activity' }[]
    }
  }
  timestamp: string
  stored: string
}

export interface xAPIFilters {
  actorEmail?: string
  verbId?: string
  activityId?: string
  since?: string
  until?: string
  limit?: number
}

// ==================== ADAPTIVE LEARNING PATHS ====================

export type PathNodeType = 'lesson' | 'quiz' | 'assignment' | 'milestone' | 'branch'
export type PathStatus = 'draft' | 'active' | 'archived'
export type PathProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked'

export interface LearningPath {
  id: string
  title: string
  description: string
  courseId: string
  courseName: string
  thumbnail?: string
  estimatedDuration: number // minutes
  difficulty: CourseLevel
  status: PathStatus
  nodes: PathNode[]
  createdBy: string
  createdAt: string
  updatedAt: string
  enrollmentCount: number
  completionRate: number
}

export interface PathNode {
  id: string
  pathId: string
  type: PathNodeType
  title: string
  description?: string
  contentId?: string // lessonId, quizId, or assignmentId
  order: number
  requiredScore?: number // minimum score to proceed (for quiz/assignment)
  prerequisites: string[] // array of node IDs
  isOptional: boolean
  estimatedDuration: number // minutes
  xpReward: number
  branches?: PathBranch[] // for branch nodes
}

export interface PathBranch {
  id: string
  condition: {
    type: 'score_range' | 'quiz_result' | 'time_spent' | 'preference'
    minScore?: number
    maxScore?: number
    quizPassed?: boolean
    selectedOption?: string
  }
  targetNodeId: string
  label: string
}

export interface PathProgress {
  id: string
  pathId: string
  pathTitle: string
  studentId: string
  studentName: string
  status: PathProgressStatus
  currentNodeId: string
  completedNodes: string[]
  nodeProgress: Record<string, {
    status: PathProgressStatus
    score?: number
    timeSpent: number
    completedAt?: string
    attempts: number
  }>
  totalXpEarned: number
  startedAt: string
  lastActivityAt: string
  completedAt?: string
  overallProgress: number // percentage
}

export interface LearningPathFilters {
  search?: string
  courseId?: string
  status?: PathStatus
  difficulty?: CourseLevel
  page?: number
  limit?: number
}

export interface CreateLearningPathRequest {
  title: string
  description: string
  courseId: string
  thumbnail?: string
  difficulty: CourseLevel
  nodes: Omit<PathNode, 'id' | 'pathId'>[]
}

export interface UpdateLearningPathRequest extends Partial<CreateLearningPathRequest> {
  status?: PathStatus
}

// ==================== VIDEO CONFERENCING INTEGRATION ====================

export type ConferenceProvider = 'zoom' | 'google_meet' | 'microsoft_teams'
export type ConferenceStatus = 'scheduled' | 'waiting' | 'in_progress' | 'ended' | 'cancelled'
export type ParticipantRole = 'host' | 'co_host' | 'participant' | 'viewer'

export interface VideoConference {
  id: string
  provider: ConferenceProvider
  title: string
  description?: string
  courseId: string
  courseName: string
  hostId: string
  hostName: string
  scheduledAt: string
  duration: number // minutes
  timezone: string
  status: ConferenceStatus
  meetingUrl: string
  joinUrl: string
  hostUrl?: string
  meetingId: string
  passcode?: string
  settings: ConferenceSettings
  recordingEnabled: boolean
  recordingUrl?: string
  attendees: ConferenceAttendee[]
  maxParticipants: number
  actualStartTime?: string
  actualEndTime?: string
  createdAt: string
}

export interface ConferenceSettings {
  waitingRoom: boolean
  muteOnEntry: boolean
  allowScreenShare: boolean
  allowChat: boolean
  allowRaiseHand: boolean
  allowBreakoutRooms: boolean
  autoRecording: boolean
  requireAuthentication: boolean
}

export interface ConferenceAttendee {
  id: string
  conferenceId: string
  participantId: string
  participantName: string
  participantEmail: string
  role: ParticipantRole
  joinedAt?: string
  leftAt?: string
  totalDuration?: number // seconds
  status: 'invited' | 'joined' | 'left' | 'declined'
}

export interface ConferenceFilters {
  search?: string
  courseId?: string
  hostId?: string
  provider?: ConferenceProvider
  status?: ConferenceStatus
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}

export interface CreateConferenceRequest {
  provider: ConferenceProvider
  title: string
  description?: string
  courseId: string
  hostId: string
  scheduledAt: string
  duration: number
  timezone?: string
  settings?: Partial<ConferenceSettings>
  recordingEnabled?: boolean
  maxParticipants?: number
  invitees?: { participantId: string; participantEmail: string; role?: ParticipantRole }[]
}

export interface UpdateConferenceRequest extends Partial<Omit<CreateConferenceRequest, 'provider'>> {
  status?: ConferenceStatus
}

// ==================== PLAGIARISM DETECTION ====================

export type PlagiarismStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type SimilarityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface PlagiarismReport {
  id: string
  submissionId: string
  assignmentId: string
  assignmentTitle: string
  studentId: string
  studentName: string
  status: PlagiarismStatus
  similarityScore: number // percentage 0-100
  similarityLevel: SimilarityLevel
  matches: SimilarityMatch[]
  wordCount: number
  characterCount: number
  processedAt?: string
  createdAt: string
  documentUrl: string
  highlightedDocumentUrl?: string
}

export interface SimilarityMatch {
  id: string
  reportId: string
  sourceType: 'web' | 'database' | 'student_submission' | 'publication'
  sourceTitle: string
  sourceUrl?: string
  sourceAuthor?: string
  matchedText: string
  originalText: string
  similarityPercentage: number
  startPosition: number
  endPosition: number
  matchedStudentId?: string // for matches with other student submissions
  matchedSubmissionId?: string
}

export interface PlagiarismSettings {
  id: string
  courseId?: string // null for global settings
  enabled: boolean
  minimumSimilarityThreshold: number // below this, considered acceptable
  excludeQuotes: boolean
  excludeBibliography: boolean
  excludeSmallMatches: boolean
  smallMatchWordCount: number
  checkAgainstWeb: boolean
  checkAgainstDatabase: boolean
  checkAgainstStudentSubmissions: boolean
  autoCheckOnSubmission: boolean
}

export interface PlagiarismFilters {
  assignmentId?: string
  studentId?: string
  status?: PlagiarismStatus
  minSimilarity?: number
  maxSimilarity?: number
  similarityLevel?: SimilarityLevel
  page?: number
  limit?: number
}

export interface CheckPlagiarismRequest {
  submissionId: string
  options?: {
    excludeQuotes?: boolean
    excludeBibliography?: boolean
    checkSources?: ('web' | 'database' | 'student_submission')[]
  }
}

// ==================== PEER REVIEW ASSIGNMENTS ====================

export type PeerReviewStatus = 'pending' | 'in_progress' | 'submitted' | 'expired'
export type ReviewVisibility = 'anonymous' | 'named' | 'after_grading'

export interface PeerReviewAssignment {
  id: string
  assignmentId: string
  assignmentTitle: string
  courseId: string
  courseName: string
  title: string
  instructions: string
  criteria: ReviewCriteria[]
  reviewsPerSubmission: number // how many reviews each submission should receive
  submissionsPerReviewer: number // how many submissions each student should review
  reviewDeadline: string
  visibility: ReviewVisibility
  allowSelfAssessment: boolean
  rubricId?: string
  status: 'draft' | 'active' | 'closed'
  createdAt: string
  createdBy: string
}

export interface ReviewCriteria {
  id: string
  name: string
  description: string
  maxScore: number
  weight: number // percentage weight in final score
  rubricLevels?: {
    score: number
    label: string
    description: string
  }[]
}

export interface PeerReview {
  id: string
  peerReviewAssignmentId: string
  reviewerId: string
  reviewerName: string
  submissionId: string
  submissionStudentId: string
  submissionStudentName?: string // only shown if visibility allows
  status: PeerReviewStatus
  scores: {
    criteriaId: string
    score: number
    feedback: string
  }[]
  overallFeedback: string
  totalScore: number
  maxScore: number
  qualityRating?: number // rating of this review's quality by instructor
  submittedAt?: string
  assignedAt: string
  deadline: string
}

export interface PeerReviewSummary {
  submissionId: string
  studentId: string
  studentName: string
  receivedReviewsCount: number
  completedReviewsCount: number
  averageScore: number
  scores: {
    criteriaId: string
    criteriaName: string
    averageScore: number
    maxScore: number
  }[]
  reviews: PeerReview[]
}

export interface PeerReviewFilters {
  peerReviewAssignmentId?: string
  reviewerId?: string
  submissionStudentId?: string
  status?: PeerReviewStatus
  page?: number
  limit?: number
}

export interface CreatePeerReviewAssignmentRequest {
  assignmentId: string
  title: string
  instructions: string
  criteria: Omit<ReviewCriteria, 'id'>[]
  reviewsPerSubmission: number
  submissionsPerReviewer: number
  reviewDeadline: string
  visibility: ReviewVisibility
  allowSelfAssessment?: boolean
}

export interface SubmitPeerReviewRequest {
  scores: { criteriaId: string; score: number; feedback: string }[]
  overallFeedback: string
}

// ==================== DISCUSSION FORUMS ====================

export type ForumStatus = 'active' | 'locked' | 'archived'
export type ThreadStatus = 'open' | 'closed' | 'pinned' | 'answered'
export type PostStatus = 'visible' | 'hidden' | 'flagged' | 'deleted'

export interface DiscussionForum {
  id: string
  courseId: string
  courseName: string
  title: string
  description: string
  status: ForumStatus
  threadCount: number
  postCount: number
  lastActivityAt: string
  moderators: string[] // user IDs
  settings: ForumSettings
  createdAt: string
  createdBy: string
}

export interface ForumSettings {
  allowAnonymousPosts: boolean
  requireApproval: boolean
  allowAttachments: boolean
  maxAttachmentSize: number // bytes
  allowedFileTypes: string[]
  allowPolls: boolean
  enableUpvotes: boolean
  enableMarkAsAnswer: boolean
  notifyOnNewThread: boolean
  notifyOnReply: boolean
}

export interface ForumThread {
  id: string
  forumId: string
  forumTitle: string
  title: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  isAnonymous: boolean
  status: ThreadStatus
  isPinned: boolean
  isLocked: boolean
  viewCount: number
  replyCount: number
  upvoteCount: number
  lastReplyAt?: string
  lastReplyBy?: string
  tags: string[]
  attachments: ForumAttachment[]
  poll?: ForumPoll
  answeredPostId?: string
  createdAt: string
  updatedAt: string
}

export interface ForumPost {
  id: string
  threadId: string
  parentPostId?: string // for nested replies
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  isAnonymous: boolean
  status: PostStatus
  upvoteCount: number
  downvoteCount: number
  isAnswer: boolean
  isEdited: boolean
  editedAt?: string
  attachments: ForumAttachment[]
  mentions: string[] // user IDs mentioned in the post
  reactions: { emoji: string; count: number; userIds: string[] }[]
  createdAt: string
}

export interface ForumAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedAt: string
}

export interface ForumPoll {
  id: string
  question: string
  options: { id: string; text: string; voteCount: number }[]
  totalVotes: number
  allowMultiple: boolean
  endsAt?: string
  voterIds: string[] // to prevent double voting
}

export interface ForumFilters {
  courseId?: string
  status?: ForumStatus
  search?: string
  page?: number
  limit?: number
}

export interface ThreadFilters {
  forumId: string
  status?: ThreadStatus
  authorId?: string
  search?: string
  tags?: string[]
  sortBy?: 'recent' | 'popular' | 'unanswered'
  page?: number
  limit?: number
}

export interface PostFilters {
  threadId: string
  authorId?: string
  status?: PostStatus
  page?: number
  limit?: number
}

export interface CreateForumRequest {
  courseId: string
  title: string
  description: string
  moderators?: string[]
  settings?: Partial<ForumSettings>
}

export interface CreateThreadRequest {
  forumId: string
  title: string
  content: string
  isAnonymous?: boolean
  tags?: string[]
  attachments?: { fileName: string; fileUrl: string; fileSize: number; mimeType: string }[]
  poll?: { question: string; options: string[]; allowMultiple?: boolean; endsAt?: string }
}

export interface CreatePostRequest {
  threadId: string
  parentPostId?: string
  content: string
  isAnonymous?: boolean
  attachments?: { fileName: string; fileUrl: string; fileSize: number; mimeType: string }[]
  mentions?: string[]
}

// ==================== GAMIFICATION ====================

export type BadgeCategory = 'achievement' | 'milestone' | 'skill' | 'participation' | 'special'
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface Badge {
  id: string
  name: string
  description: string
  category: BadgeCategory
  rarity: BadgeRarity
  iconUrl: string
  criteria: BadgeCriteria
  xpValue: number
  isSecret: boolean // hidden until earned
  maxEarners?: number // limited edition badges
  earnedCount: number
  createdAt: string
}

export interface BadgeCriteria {
  type: 'course_completion' | 'quiz_score' | 'assignment_streak' | 'forum_participation' | 'learning_hours' | 'custom'
  courseId?: string
  minScore?: number
  minCount?: number
  minHours?: number
  streakDays?: number
  customCondition?: string // JSON condition for complex criteria
}

export interface UserBadge {
  id: string
  badgeId: string
  badge: Badge
  userId: string
  userName: string
  earnedAt: string
  courseId?: string
  courseName?: string
  notified: boolean
}

export interface Leaderboard {
  id: string
  name: string
  description: string
  type: 'global' | 'course' | 'weekly' | 'monthly' | 'custom'
  courseId?: string
  courseName?: string
  metric: 'xp' | 'badges' | 'courses_completed' | 'quiz_average' | 'streak'
  entries: LeaderboardEntry[]
  lastUpdated: string
  resetPeriod?: 'weekly' | 'monthly' | 'never'
  startDate?: string
  endDate?: string
}

export interface LeaderboardEntry {
  rank: number
  previousRank?: number
  userId: string
  userName: string
  userAvatar?: string
  score: number
  change: number // change from previous period
  badges?: number
  coursesCompleted?: number
}

export interface Achievement {
  id: string
  userId: string
  userName: string
  type: 'level_up' | 'badge_earned' | 'course_completed' | 'streak_milestone' | 'leaderboard_rank'
  title: string
  description: string
  iconUrl?: string
  xpEarned: number
  metadata: Record<string, unknown>
  createdAt: string
  isRead: boolean
}

export interface GamificationProfile {
  userId: string
  userName: string
  userAvatar?: string
  level: number
  currentXp: number
  xpToNextLevel: number
  totalXp: number
  badges: UserBadge[]
  badgeCount: number
  currentStreak: number
  longestStreak: number
  coursesCompleted: number
  quizzesPassed: number
  forumPostCount: number
  helpfulAnswers: number
  rank: number
  title: string // e.g., "Novice Learner", "Expert Scholar"
  recentAchievements: Achievement[]
}

export interface GamificationStats {
  totalUsers: number
  totalXpAwarded: number
  totalBadgesAwarded: number
  topBadge: Badge
  averageLevel: number
  activeStreaks: number
}

export interface LeaderboardFilters {
  type?: Leaderboard['type']
  courseId?: string
  metric?: Leaderboard['metric']
  limit?: number
}

export interface BadgeFilters {
  category?: BadgeCategory
  rarity?: BadgeRarity
  earnedByUser?: string
  search?: string
  page?: number
  limit?: number
}

export interface AchievementFilters {
  userId?: string
  type?: Achievement['type']
  isRead?: boolean
  page?: number
  limit?: number
}

export interface CreateBadgeRequest {
  name: string
  description: string
  category: BadgeCategory
  rarity: BadgeRarity
  iconUrl: string
  criteria: BadgeCriteria
  xpValue: number
  isSecret?: boolean
  maxEarners?: number
}

export interface AwardBadgeRequest {
  badgeId: string
  userId: string
  courseId?: string
}

export interface UpdateXpRequest {
  userId: string
  xpAmount: number
  reason: string
  sourceType: 'course' | 'quiz' | 'assignment' | 'forum' | 'achievement' | 'admin'
  sourceId?: string
}
