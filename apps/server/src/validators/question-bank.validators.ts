import { z } from 'zod'

const questionTypeEnum = z.enum(['mcq', 'true_false', 'short_answer'])
const questionDifficultyEnum = z.enum(['easy', 'medium', 'hard'])
const questionStatusEnum = z.enum(['draft', 'active', 'archived'])
const onlineExamStatusEnum = z.enum(['draft', 'scheduled', 'active', 'completed'])

// ==================== Questions ====================

export const createQuestionSchema = z.object({
  question: z.string().min(1),
  type: questionTypeEnum,
  options: z.array(z.string()).default([]),
  correctAnswer: z.string().min(1),
  points: z.number().int().positive().optional().default(1),
  explanation: z.string().optional(),
  subject: z.string().min(1),
  topic: z.string().min(1),
  difficulty: questionDifficultyEnum,
  tags: z.array(z.string()).optional().default([]),
  negativeMarks: z.number().optional(),
  status: questionStatusEnum.optional(),
})
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>

export const updateQuestionSchema = createQuestionSchema.partial()
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>

export const listQuestionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  subject: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  tags: z.string().optional(),
})
export type ListQuestionsInput = z.infer<typeof listQuestionsSchema>

export const importQuestionsSchema = z.object({
  questions: z.array(z.object({
    question: z.string().optional(),
    type: questionTypeEnum.optional().default('mcq'),
    options: z.array(z.string()).optional().default([]),
    correctAnswer: z.string().optional(),
    points: z.number().optional().default(1),
    explanation: z.string().optional(),
    subject: z.string().optional(),
    topic: z.string().optional().default('general'),
    difficulty: questionDifficultyEnum.optional().default('medium'),
    tags: z.array(z.string()).optional().default([]),
    negativeMarks: z.number().optional(),
  })),
  subject: z.string().optional(),
})
export type ImportQuestionsInput = z.infer<typeof importQuestionsSchema>

// ==================== Online Exams ====================

export const createOnlineExamSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  questionIds: z.array(z.string()).optional(),
  questionBankIds: z.array(z.string()).optional(),
  randomQuestionCount: z.number().int().optional(),
  duration: z.number().int().positive().optional().default(30),
  passingScore: z.number().int().optional().default(40),
  maxAttempts: z.number().int().positive().optional().default(1),
  negativeMarkingEnabled: z.boolean().optional().default(false),
  schedule: z.object({
    startTime: z.string(),
    endTime: z.string(),
    timezone: z.string().optional(),
  }).optional(),
  security: z.object({
    shuffleQuestions: z.boolean().optional().default(true),
    shuffleOptions: z.boolean().optional().default(true),
    preventCopyPaste: z.boolean().optional().default(true),
    preventRightClick: z.boolean().optional().default(true),
    detectTabSwitch: z.boolean().optional().default(true),
    maxTabSwitches: z.number().int().optional(),
    fullScreenRequired: z.boolean().optional().default(false),
    showRemainingTime: z.boolean().optional().default(true),
    autoSubmitOnTimeUp: z.boolean().optional().default(true),
  }).optional(),
  linkedExamId: z.string().optional(),
  courseId: z.string().optional(),
})
export type CreateOnlineExamInput = z.infer<typeof createOnlineExamSchema>

export const updateOnlineExamSchema = createOnlineExamSchema.partial()
export type UpdateOnlineExamInput = z.infer<typeof updateOnlineExamSchema>

export const listOnlineExamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.string().optional(),
  search: z.string().optional(),
})
export type ListOnlineExamsInput = z.infer<typeof listOnlineExamsSchema>

// ==================== Attempts ====================

export const startAttemptSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(1),
})
export type StartAttemptInput = z.infer<typeof startAttemptSchema>

export const submitAttemptSchema = z.object({
  attemptId: z.string().min(1),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
  })),
  timeSpent: z.number().int(),
  tabSwitchCount: z.number().int().optional().default(0),
  securityViolations: z.array(z.object({
    type: z.string(),
    timestamp: z.string(),
  })).optional().default([]),
  autoSubmit: z.boolean().optional().default(false),
})
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>

export const reportViolationSchema = z.object({
  attemptId: z.string().min(1),
  type: z.enum(['tab_switch', 'copy_attempt', 'right_click', 'fullscreen_exit']),
})
export type ReportViolationInput = z.infer<typeof reportViolationSchema>
