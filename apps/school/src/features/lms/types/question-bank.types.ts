import { QuizQuestionType, CourseCategory } from './lms.types'

// ==================== STATUS & TYPE UNIONS ====================

export type QuestionDifficulty = 'easy' | 'medium' | 'hard'
export type QuestionStatus = 'draft' | 'active' | 'archived'

// ==================== CONSTANTS ====================

export const QUESTION_DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export const QUESTION_STATUS_LABELS: Record<QuestionStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
}

export const QUESTION_TYPE_LABELS: Record<QuizQuestionType, string> = {
  mcq: 'Multiple Choice',
  true_false: 'True/False',
  short_answer: 'Short Answer',
}

// Common topics organized by subject
export const SUBJECT_TOPICS: Record<CourseCategory, string[]> = {
  mathematics: [
    'algebra',
    'geometry',
    'trigonometry',
    'calculus',
    'statistics',
    'arithmetic',
    'number_theory',
    'probability',
  ],
  science: [
    'physics',
    'chemistry',
    'biology',
    'environmental_science',
    'astronomy',
    'earth_science',
  ],
  english: [
    'grammar',
    'vocabulary',
    'reading_comprehension',
    'writing',
    'literature',
    'poetry',
  ],
  social_studies: [
    'history',
    'geography',
    'civics',
    'economics',
    'political_science',
  ],
  computer_science: [
    'programming',
    'algorithms',
    'data_structures',
    'databases',
    'networking',
    'web_development',
  ],
  arts: ['drawing', 'painting', 'music_theory', 'art_history', 'design'],
  physical_education: [
    'fitness',
    'sports_rules',
    'health',
    'nutrition',
    'first_aid',
  ],
  languages: [
    'hindi',
    'sanskrit',
    'french',
    'spanish',
    'german',
    'vocabulary',
    'grammar',
  ],
  general: ['general_knowledge', 'current_affairs', 'reasoning', 'aptitude'],
}

// ==================== INTERFACES ====================

export interface QuestionTag {
  id: string
  name: string
  color?: string
}

export interface BankQuestion {
  id: string
  question: string
  type: QuizQuestionType
  options: string[] // For MCQ/True-False
  correctAnswer: string
  points: number
  explanation?: string

  // Categorization
  subject: CourseCategory
  topic: string
  difficulty: QuestionDifficulty
  tags: string[] // Free-form tags

  // Metadata
  status: QuestionStatus
  usageCount: number // How many times used in quizzes/exams
  createdBy: string
  createdAt: string
  updatedAt: string

  // Optional: For negative marking support
  negativeMarks?: number
}

export interface QuestionBank {
  id: string
  name: string
  description: string
  subject: CourseCategory
  questionsCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

// ==================== FILTER TYPES ====================

export interface QuestionFilters {
  search?: string
  subject?: CourseCategory
  topic?: string
  difficulty?: QuestionDifficulty
  type?: QuizQuestionType
  status?: QuestionStatus
  tags?: string[]
  page?: number
  limit?: number
}

// ==================== REQUEST TYPES ====================

export interface CreateQuestionRequest {
  question: string
  type: QuizQuestionType
  options: string[]
  correctAnswer: string
  points: number
  explanation?: string
  subject: CourseCategory
  topic: string
  difficulty: QuestionDifficulty
  tags?: string[]
  negativeMarks?: number
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  status?: QuestionStatus
}

export interface ImportQuestionsRequest {
  questions: CreateQuestionRequest[]
  subject: CourseCategory
}

export interface ImportQuestionsResult {
  imported: number
  failed: number
  errors: { index: number; error: string }[]
}

// ==================== EXAM MODE TYPES ====================

export interface ExamSchedule {
  startTime: string // ISO datetime
  endTime: string // ISO datetime
  timezone?: string
}

export interface ExamSecuritySettings {
  shuffleQuestions: boolean
  shuffleOptions: boolean
  preventCopyPaste: boolean
  preventRightClick: boolean
  detectTabSwitch: boolean
  maxTabSwitches?: number // Auto-submit after N tab switches
  fullScreenRequired: boolean
  showRemainingTime: boolean
  autoSubmitOnTimeUp: boolean
}

export interface OnlineExamConfig {
  id: string
  title: string
  description: string

  // Question source
  questionBankIds?: string[] // Pull from question banks
  questionIds?: string[] // Or specific questions
  randomQuestionCount?: number // How many random questions to pick

  // Exam settings
  duration: number // minutes
  passingScore: number // percentage
  maxAttempts: number
  negativeMarkingEnabled: boolean

  // Scheduling
  schedule?: ExamSchedule
  isScheduled: boolean

  // Security
  security: ExamSecuritySettings

  // Linking
  linkedExamId?: string // Link to traditional exam for marks sync
  courseId?: string // Optional course association

  // Metadata
  status: 'draft' | 'scheduled' | 'active' | 'completed'
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface OnlineExamAttempt {
  id: string
  examId: string
  examTitle: string
  studentId: string
  studentName: string
  startedAt: string
  submittedAt?: string
  timeSpent: number // seconds
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
  answers: {
    questionId: string
    answer: string
    correct: boolean
    pointsEarned: number
  }[]

  // Security tracking
  tabSwitchCount: number
  securityViolations: {
    type: 'tab_switch' | 'copy_attempt' | 'right_click' | 'fullscreen_exit'
    timestamp: string
  }[]

  status: 'in_progress' | 'submitted' | 'auto_submitted' | 'timed_out'
}

// ==================== RESPONSE TYPES ====================

export interface QuestionsResponse {
  data: BankQuestion[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface QuestionResponse {
  data: BankQuestion
}

// ==================== STATS ====================

export interface QuestionBankStats {
  totalQuestions: number
  bySubject: Record<CourseCategory, number>
  byDifficulty: Record<QuestionDifficulty, number>
  byType: Record<QuizQuestionType, number>
  recentlyAdded: number // Last 7 days
  mostUsedTopics: { topic: string; count: number }[]
}
