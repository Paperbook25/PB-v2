// ==================== EXAM TYPE ENUMS ====================

export type ExamType = 'unit_test' | 'mid_term' | 'quarterly' | 'half_yearly' | 'annual' | 'practical' | 'online'

export type ExamStatus = 'scheduled' | 'ongoing' | 'completed' | 'results_published'

export type SubjectType = 'theory' | 'practical' | 'both'

// ==================== SUBJECT ====================

export interface Subject {
  id: string
  name: string
  code: string
  type: SubjectType
  maxMarks: number
  passingMarks: number
}

// ==================== EXAM ====================

export interface Exam {
  id: string
  name: string
  type: ExamType
  academicYear: string
  term: string
  applicableClasses: string[]
  subjects: Subject[]
  startDate: string
  endDate: string
  status: ExamStatus
  createdAt: string
  updatedAt: string
}

export interface CreateExamRequest {
  name: string
  type: ExamType
  academicYear: string
  term: string
  applicableClasses: string[]
  subjects: Omit<Subject, 'id'>[]
  startDate: string
  endDate: string
}

export interface UpdateExamRequest {
  name?: string
  type?: ExamType
  applicableClasses?: string[]
  subjects?: Omit<Subject, 'id'>[]
  startDate?: string
  endDate?: string
  status?: ExamStatus
}

export interface ExamFilters {
  type?: ExamType
  status?: ExamStatus
  academicYear?: string
  className?: string
  search?: string
  page?: number
  limit?: number
}

// ==================== STUDENT MARKS ====================

export interface StudentMark {
  id: string
  examId: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  admissionNumber: string
  subjectId: string
  subjectName: string
  marksObtained: number
  maxMarks: number
  grade?: string
  isAbsent: boolean
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface SubmitMarksRequest {
  examId: string
  subjectId: string
  className: string
  section: string
  marks: {
    studentId: string
    marksObtained: number
    isAbsent: boolean
    remarks?: string
  }[]
}

export interface MarksEntryStudent {
  id: string
  name: string
  admissionNumber: string
  class: string
  section: string
  rollNumber: number
  marksObtained?: number
  isAbsent?: boolean
  remarks?: string
}

// ==================== REPORT CARD ====================

export interface ReportCardSubject {
  subjectName: string
  subjectCode: string
  maxMarks: number
  marksObtained: number
  grade: string
  gradePoint?: number
  remarks?: string
}

export interface ReportCard {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  admissionNumber: string
  rollNumber: number
  academicYear: string
  term: string
  examName: string
  subjects: ReportCardSubject[]
  totalMarks: number
  totalObtained: number
  percentage: number
  grade: string
  rank?: number
  attendance?: {
    totalDays: number
    presentDays: number
    percentage: number
  }
  remarks?: string
  generatedAt: string
}

export interface GenerateReportCardsRequest {
  examId: string
  classId?: string
  studentIds?: string[]
}

// ==================== GRADE SCALE ====================

export interface GradeRange {
  minPercentage: number
  maxPercentage: number
  grade: string
  gradePoint?: number
  description?: string
}

export interface GradeScale {
  id: string
  name: string
  isDefault: boolean
  ranges: GradeRange[]
  createdAt: string
  updatedAt: string
}

export interface CreateGradeScaleRequest {
  name: string
  ranges: Omit<GradeRange, 'id'>[]
  isDefault?: boolean
}

export interface UpdateGradeScaleRequest {
  name?: string
  ranges?: Omit<GradeRange, 'id'>[]
  isDefault?: boolean
}

// ==================== CONSTANTS ====================

export const EXAM_TYPES: ExamType[] = [
  'unit_test',
  'mid_term',
  'quarterly',
  'half_yearly',
  'annual',
  'practical',
  'online',
]

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  unit_test: 'Unit Test',
  mid_term: 'Mid Term',
  quarterly: 'Quarterly',
  half_yearly: 'Half Yearly',
  annual: 'Annual',
  practical: 'Practical',
  online: 'Online Exam',
}

export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  scheduled: 'Scheduled',
  ongoing: 'Ongoing',
  completed: 'Completed',
  results_published: 'Results Published',
}

export const SUBJECT_TYPE_LABELS: Record<SubjectType, string> = {
  theory: 'Theory',
  practical: 'Practical',
  both: 'Theory + Practical',
}

export const TERMS = ['Term 1', 'Term 2', 'Term 3']

export const ACADEMIC_YEARS = ['2024-25', '2023-24', '2022-23']

export const CLASSES = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
]

export const SECTIONS = ['A', 'B', 'C', 'D']

export const DEFAULT_SUBJECTS: Omit<Subject, 'id'>[] = [
  { name: 'English', code: 'ENG', type: 'theory', maxMarks: 100, passingMarks: 35 },
  { name: 'Hindi', code: 'HIN', type: 'theory', maxMarks: 100, passingMarks: 35 },
  { name: 'Mathematics', code: 'MATH', type: 'theory', maxMarks: 100, passingMarks: 35 },
  { name: 'Science', code: 'SCI', type: 'both', maxMarks: 100, passingMarks: 35 },
  { name: 'Social Studies', code: 'SST', type: 'theory', maxMarks: 100, passingMarks: 35 },
  { name: 'Computer Science', code: 'CS', type: 'both', maxMarks: 100, passingMarks: 35 },
  { name: 'Physical Education', code: 'PE', type: 'practical', maxMarks: 100, passingMarks: 35 },
]

export const DEFAULT_GRADE_SCALE: GradeRange[] = [
  { minPercentage: 90, maxPercentage: 100, grade: 'A+', gradePoint: 10, description: 'Outstanding' },
  { minPercentage: 80, maxPercentage: 89.99, grade: 'A', gradePoint: 9, description: 'Excellent' },
  { minPercentage: 70, maxPercentage: 79.99, grade: 'B+', gradePoint: 8, description: 'Very Good' },
  { minPercentage: 60, maxPercentage: 69.99, grade: 'B', gradePoint: 7, description: 'Good' },
  { minPercentage: 50, maxPercentage: 59.99, grade: 'C+', gradePoint: 6, description: 'Above Average' },
  { minPercentage: 40, maxPercentage: 49.99, grade: 'C', gradePoint: 5, description: 'Average' },
  { minPercentage: 33, maxPercentage: 39.99, grade: 'D', gradePoint: 4, description: 'Pass' },
  { minPercentage: 0, maxPercentage: 32.99, grade: 'F', gradePoint: 0, description: 'Fail' },
]

export const EXAMS_PER_PAGE = 10
export const MARKS_PER_PAGE = 50

// ==================== EXAM TIMETABLE ====================

export interface ExamSlot {
  id: string
  examId: string
  subjectId: string
  subjectName: string
  subjectCode: string
  date: string
  startTime: string
  endTime: string
  room: string
  invigilator: string
  applicableClasses: string[]
}

export interface ExamTimetable {
  examId: string
  examName: string
  slots: ExamSlot[]
}

export interface CreateExamSlotRequest {
  examId: string
  subjectId: string
  date: string
  startTime: string
  endTime: string
  room: string
  invigilator: string
  applicableClasses: string[]
}

// ==================== MARKS ANALYTICS ====================

export interface SubjectAnalytics {
  subjectId: string
  subjectName: string
  totalStudents: number
  appeared: number
  absent: number
  passed: number
  failed: number
  passPercentage: number
  average: number
  highest: number
  lowest: number
  median: number
  toppers: { studentId: string; studentName: string; marks: number }[]
}

export interface ClassAnalytics {
  className: string
  section: string
  totalStudents: number
  classAverage: number
  passPercentage: number
  gradeDistribution: { grade: string; count: number }[]
  subjectWise: SubjectAnalytics[]
  toppers: { rank: number; studentId: string; studentName: string; percentage: number; grade: string }[]
}

// ==================== PROGRESS TRACKING ====================

export interface TermProgress {
  term: string
  examName: string
  examId: string
  percentage: number
  grade: string
  rank?: number
  subjectWise: { subjectName: string; marks: number; maxMarks: number; percentage: number }[]
}

export interface StudentProgress {
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  terms: TermProgress[]
  overallTrend: 'improving' | 'declining' | 'stable'
  improvementPercentage: number
}

// ==================== CO-SCHOLASTIC (CCE/CBSE) ====================

export type CoScholasticArea = 'art' | 'music' | 'dance' | 'sports' | 'yoga' | 'discipline' | 'work_education' | 'health_education'
export type CoScholasticGrade = 'A' | 'B' | 'C'

export interface CoScholasticRecord {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  academicYear: string
  term: string
  area: CoScholasticArea
  grade: CoScholasticGrade
  remarks: string
  assessedBy: string
  assessedAt: string
}

export interface SubmitCoScholasticRequest {
  studentId: string
  term: string
  records: { area: CoScholasticArea; grade: CoScholasticGrade; remarks: string }[]
}

export const CO_SCHOLASTIC_AREA_LABELS: Record<CoScholasticArea, string> = {
  art: 'Art & Craft',
  music: 'Music',
  dance: 'Dance',
  sports: 'Sports & Games',
  yoga: 'Yoga',
  discipline: 'Discipline',
  work_education: 'Work Education',
  health_education: 'Health & Physical Education',
}

export const CO_SCHOLASTIC_GRADE_LABELS: Record<CoScholasticGrade, string> = {
  A: 'Outstanding',
  B: 'Very Good',
  C: 'Fair',
}

// ==================== QUESTION PAPER MANAGEMENT ====================

export type PaperDifficulty = 'easy' | 'medium' | 'hard'

export interface QuestionPaper {
  id: string
  examId?: string
  examName?: string
  subjectId: string
  subjectName: string
  subjectCode: string
  className: string
  academicYear: string
  term: string
  totalMarks: number
  duration: string
  difficulty: PaperDifficulty
  sections: PaperSection[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PaperSection {
  name: string
  instructions: string
  questionCount: number
  marksPerQuestion: number
  totalMarks: number
}

export interface CreateQuestionPaperRequest {
  examId?: string
  subjectId: string
  subjectName: string
  subjectCode: string
  className: string
  academicYear: string
  term: string
  totalMarks: number
  duration: string
  difficulty: PaperDifficulty
  sections: PaperSection[]
}

export const PAPER_DIFFICULTY_LABELS: Record<PaperDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

// ==================== ONLINE EXAM INTEGRATION ====================

/**
 * Links a traditional exam entry to an online exam from the LMS
 */
export interface OnlineExamLink {
  examId: string // Traditional exam ID
  onlineExamId: string // LMS online exam ID
  syncMarks: boolean // Whether to auto-sync marks from online exam
  createdAt: string
}

/**
 * Online exam summary for display in exams list
 */
export interface OnlineExamSummary {
  id: string
  title: string
  description: string
  questionCount: number
  duration: number // minutes
  passingScore: number
  maxAttempts: number
  status: 'draft' | 'scheduled' | 'active' | 'completed'
  isScheduled: boolean
  scheduleStart?: string
  scheduleEnd?: string
  totalAttempts: number
  avgScore?: number
  linkedExamId?: string
}

// ==================== ONLINE EXAM PROCTORING ====================

export type ProctoringViolationType =
  | 'face_not_detected'
  | 'multiple_faces'
  | 'tab_switch'
  | 'browser_blur'
  | 'copy_paste'
  | 'screen_share'
  | 'external_device'
  | 'suspicious_audio'
  | 'phone_detected'

export type ProctoringStatus = 'pending' | 'active' | 'paused' | 'completed' | 'terminated'

export interface ProctoringViolation {
  id: string
  sessionId: string
  type: ProctoringViolationType
  timestamp: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  screenshot?: string
  reviewed: boolean
  reviewedBy?: string
  reviewedAt?: string
  action?: 'ignored' | 'warning_issued' | 'exam_terminated'
}

export interface ProctoringSession {
  id: string
  examId: string
  studentId: string
  studentName: string
  startTime: string
  endTime?: string
  status: ProctoringStatus
  violations: ProctoringViolation[]
  violationCount: number
  warningCount: number
  isTerminated: boolean
  terminationReason?: string
  browserInfo?: string
  ipAddress?: string
  location?: string
  webcamEnabled: boolean
  screenShareEnabled: boolean
  trustScore: number // 0-100 score based on violations
}

export interface ProctoringConfig {
  id: string
  examId: string
  webcamRequired: boolean
  screenShareRequired: boolean
  lockdownBrowser: boolean
  allowTabSwitch: boolean
  maxViolations: number
  autoTerminateOnCritical: boolean
  recordSession: boolean
  aiProctoringEnabled: boolean
  faceVerificationRequired: boolean
  idVerificationRequired: boolean
}

export interface CreateProctoringSessionRequest {
  examId: string
  studentId: string
}

export interface UpdateProctoringSessionRequest {
  status?: ProctoringStatus
  endTime?: string
  isTerminated?: boolean
  terminationReason?: string
}

export interface ReportViolationRequest {
  sessionId: string
  type: ProctoringViolationType
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  screenshot?: string
}

export interface ReviewViolationRequest {
  action: 'ignored' | 'warning_issued' | 'exam_terminated'
}

export const PROCTORING_VIOLATION_LABELS: Record<ProctoringViolationType, string> = {
  face_not_detected: 'Face Not Detected',
  multiple_faces: 'Multiple Faces Detected',
  tab_switch: 'Tab/Window Switch',
  browser_blur: 'Browser Lost Focus',
  copy_paste: 'Copy/Paste Attempt',
  screen_share: 'Unauthorized Screen Share',
  external_device: 'External Device Detected',
  suspicious_audio: 'Suspicious Audio',
  phone_detected: 'Phone/Mobile Device Detected',
}

export const PROCTORING_STATUS_LABELS: Record<ProctoringStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  terminated: 'Terminated',
}

// ==================== ADAPTIVE TESTING ====================

export type QuestionDifficulty = 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard'

export interface AdaptiveQuestion {
  id: string
  questionBankId: string
  difficulty: QuestionDifficulty
  difficultyScore: number // IRT difficulty parameter (-3 to +3)
  discriminationIndex: number // IRT discrimination parameter
  guessingParameter: number // IRT guessing parameter
  expectedTime: number // seconds
  topicId: string
  topicName: string
  subjectId: string
  subjectName: string
}

export interface AdaptiveTestConfig {
  id: string
  examId: string
  enabled: boolean
  algorithm: 'irt_3pl' | 'irt_2pl' | 'simple_adaptive' // Item Response Theory models
  initialDifficulty: QuestionDifficulty
  minQuestions: number
  maxQuestions: number
  targetReliability: number // e.g., 0.85
  terminationCriteria: 'fixed_length' | 'standard_error' | 'confidence_interval'
  standardErrorThreshold?: number
  questionPoolSize: number
  allowBacktracking: boolean
  showDifficultyIndicator: boolean
}

export interface AdaptiveTestAttempt {
  id: string
  examId: string
  studentId: string
  studentName: string
  startTime: string
  endTime?: string
  status: 'in_progress' | 'completed' | 'abandoned'
  currentAbilityEstimate: number // theta in IRT
  standardError: number
  questionsAnswered: number
  correctAnswers: number
  questionHistory: AdaptiveQuestionResponse[]
  finalScore?: number
  percentileRank?: number
  abilityLevel?: QuestionDifficulty
}

export interface AdaptiveQuestionResponse {
  questionId: string
  difficulty: QuestionDifficulty
  difficultyScore: number
  isCorrect: boolean
  timeTaken: number // seconds
  abilityEstimateAfter: number
  standardErrorAfter: number
}

export interface CreateAdaptiveTestConfigRequest {
  examId: string
  algorithm: 'irt_3pl' | 'irt_2pl' | 'simple_adaptive'
  initialDifficulty: QuestionDifficulty
  minQuestions: number
  maxQuestions: number
  targetReliability: number
  terminationCriteria: 'fixed_length' | 'standard_error' | 'confidence_interval'
  standardErrorThreshold?: number
  allowBacktracking: boolean
  showDifficultyIndicator: boolean
}

export interface UpdateAdaptiveTestConfigRequest {
  enabled?: boolean
  algorithm?: 'irt_3pl' | 'irt_2pl' | 'simple_adaptive'
  initialDifficulty?: QuestionDifficulty
  minQuestions?: number
  maxQuestions?: number
  targetReliability?: number
  terminationCriteria?: 'fixed_length' | 'standard_error' | 'confidence_interval'
  standardErrorThreshold?: number
  allowBacktracking?: boolean
  showDifficultyIndicator?: boolean
}

export interface SubmitAdaptiveAnswerRequest {
  attemptId: string
  questionId: string
  answerId: string
  timeTaken: number
}

export const QUESTION_DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  very_easy: 'Very Easy',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  very_hard: 'Very Hard',
}

export const ADAPTIVE_ALGORITHM_LABELS: Record<string, string> = {
  irt_3pl: '3-Parameter IRT',
  irt_2pl: '2-Parameter IRT',
  simple_adaptive: 'Simple Adaptive',
}

// ==================== PEER COMPARISON ANALYTICS ====================

export interface PeerComparison {
  studentId: string
  studentName: string
  examId: string
  examName: string
  className: string
  section: string
  studentScore: number
  studentPercentage: number
  studentGrade: string
  studentRank: number
  totalStudents: number
  classAverage: number
  classHighest: number
  classLowest: number
  classMedian: number
  percentile: number
  standardDeviation: number
  zScore: number
  performanceCategory: 'top_10' | 'above_average' | 'average' | 'below_average' | 'bottom_10'
  subjectWiseComparison: SubjectPeerComparison[]
}

export interface SubjectPeerComparison {
  subjectId: string
  subjectName: string
  studentMarks: number
  maxMarks: number
  studentPercentage: number
  classAverage: number
  classHighest: number
  classLowest: number
  studentRank: number
  percentile: number
  performanceCategory: 'top_10' | 'above_average' | 'average' | 'below_average' | 'bottom_10'
}

export interface RankingData {
  examId: string
  examName: string
  className: string
  section: string
  rankings: StudentRanking[]
  statisticalSummary: {
    mean: number
    median: number
    mode: number
    standardDeviation: number
    variance: number
    range: number
    skewness: number
    kurtosis: number
  }
  gradeDistribution: { grade: string; count: number; percentage: number }[]
  percentileDistribution: { percentile: number; score: number }[]
}

export interface StudentRanking {
  rank: number
  studentId: string
  studentName: string
  admissionNumber: string
  totalMarks: number
  maxMarks: number
  percentage: number
  grade: string
  previousRank?: number
  rankChange?: number // positive = improved, negative = declined
}

export interface PeerComparisonFilters {
  examId: string
  studentId?: string
  className?: string
  section?: string
  subjectId?: string
}

// ==================== SUBJECT-WISE TREND ANALYSIS ====================

export interface SubjectTrend {
  subjectId: string
  subjectName: string
  subjectCode: string
  dataPoints: SubjectTrendDataPoint[]
  overallTrend: 'improving' | 'declining' | 'stable' | 'fluctuating'
  averageScore: number
  highestScore: number
  lowestScore: number
  improvementRate: number // percentage change from first to last
  consistency: number // 0-100 score based on standard deviation
}

export interface SubjectTrendDataPoint {
  examId: string
  examName: string
  examType: ExamType
  academicYear: string
  term: string
  date: string
  marksObtained: number
  maxMarks: number
  percentage: number
  grade: string
  classAverage: number
  classRank: number
}

export interface YearlyAnalysis {
  academicYear: string
  studentId: string
  studentName: string
  className: string
  section: string
  overallPercentage: number
  overallGrade: string
  overallRank?: number
  examCount: number
  subjectTrends: SubjectTrend[]
  termWiseSummary: TermSummary[]
  yearOverYearComparison?: YearComparison[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export interface TermSummary {
  term: string
  examCount: number
  averagePercentage: number
  grade: string
  rank?: number
  attendance?: number
  subjectAverages: { subjectId: string; subjectName: string; average: number; grade: string }[]
}

export interface YearComparison {
  academicYear: string
  overallPercentage: number
  overallGrade: string
  rank?: number
  changeFromPrevious?: number
}

export interface SubjectTrendFilters {
  studentId: string
  subjectId?: string
  academicYear?: string
  fromDate?: string
  toDate?: string
}

export interface YearlyAnalysisFilters {
  studentId: string
  academicYear?: string
  includeYearComparison?: boolean
}

// ==================== REVALUATION REQUEST WORKFLOW ====================

export type RevaluationStatus =
  | 'draft'
  | 'submitted'
  | 'payment_pending'
  | 'payment_completed'
  | 'under_review'
  | 'revaluation_in_progress'
  | 'completed'
  | 'rejected'
  | 'withdrawn'

export type RevaluationType = 'rechecking' | 'revaluation' | 'photocopy_request'

export interface RevaluationRequest {
  id: string
  examId: string
  examName: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  admissionNumber: string
  subjectId: string
  subjectName: string
  subjectCode: string
  type: RevaluationType
  status: RevaluationStatus
  originalMarks: number
  maxMarks: number
  originalGrade: string
  revisedMarks?: number
  revisedGrade?: string
  marksChanged: boolean
  changeAmount?: number
  reason: string
  supportingDocuments?: string[]
  fee: number
  paymentId?: string
  paymentStatus: 'pending' | 'completed' | 'refunded' | 'waived'
  paymentDate?: string
  submittedAt: string
  submittedBy: string
  reviewedBy?: string
  reviewedAt?: string
  reviewRemarks?: string
  evaluatorId?: string
  evaluatorName?: string
  evaluationStartedAt?: string
  evaluationCompletedAt?: string
  evaluatorRemarks?: string
  completedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface CreateRevaluationRequestRequest {
  examId: string
  subjectId: string
  type: RevaluationType
  reason: string
  supportingDocuments?: string[]
}

export interface UpdateRevaluationStatusRequest {
  status: RevaluationStatus
  reviewRemarks?: string
  rejectionReason?: string
  evaluatorId?: string
  revisedMarks?: number
  evaluatorRemarks?: string
}

export interface RevaluationFilters {
  examId?: string
  studentId?: string
  subjectId?: string
  status?: RevaluationStatus
  type?: RevaluationType
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}

export interface RevaluationFeeStructure {
  id: string
  type: RevaluationType
  fee: number
  description: string
  refundable: boolean
  refundCondition?: string
}

export interface RevaluationSummary {
  total: number
  pending: number
  inProgress: number
  completed: number
  rejected: number
  marksIncreased: number
  marksDecreased: number
  noChange: number
  averageProcessingDays: number
  totalFeesCollected: number
  totalRefunds: number
}

export const REVALUATION_STATUS_LABELS: Record<RevaluationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  payment_pending: 'Payment Pending',
  payment_completed: 'Payment Completed',
  under_review: 'Under Review',
  revaluation_in_progress: 'Revaluation In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const REVALUATION_TYPE_LABELS: Record<RevaluationType, string> = {
  rechecking: 'Rechecking (Totaling Verification)',
  revaluation: 'Full Revaluation',
  photocopy_request: 'Answer Sheet Photocopy',
}

export const REVALUATION_FEES: RevaluationFeeStructure[] = [
  {
    id: 'fee_001',
    type: 'rechecking',
    fee: 300,
    description: 'Verification of marks totaling',
    refundable: true,
    refundCondition: 'Marks change after rechecking',
  },
  {
    id: 'fee_002',
    type: 'revaluation',
    fee: 1000,
    description: 'Full answer sheet revaluation by different evaluator',
    refundable: true,
    refundCondition: 'Marks increase by 10% or more',
  },
  {
    id: 'fee_003',
    type: 'photocopy_request',
    fee: 500,
    description: 'Certified photocopy of answer sheet',
    refundable: false,
  },
]
