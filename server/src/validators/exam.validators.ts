import { z } from 'zod'

const examTypeEnum = z.enum([
  'unit_test', 'mid_term', 'quarterly', 'half_yearly', 'annual', 'practical', 'online',
])

const examStatusEnum = z.enum(['scheduled', 'ongoing', 'completed', 'results_published'])

const coScholasticAreaEnum = z.enum([
  'art', 'music', 'dance', 'sports', 'yoga', 'discipline', 'work_education', 'health_education',
])

const paperDifficultyEnum = z.enum(['easy', 'medium', 'hard'])

// ==================== Exam CRUD ====================

export const createExamSchema = z.object({
  name: z.string().min(1),
  type: examTypeEnum,
  academicYear: z.string().min(1),
  term: z.string().min(1),
  applicableClasses: z.array(z.string()),
  subjects: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    code: z.string(),
    maxMarks: z.number().positive(),
    passingMarks: z.number().optional(),
  })),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
})
export type CreateExamInput = z.infer<typeof createExamSchema>

export const updateExamSchema = createExamSchema.partial()
export type UpdateExamInput = z.infer<typeof updateExamSchema>

export const listExamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: z.string().optional(),
  status: z.string().optional(),
  academicYear: z.string().optional(),
  className: z.string().optional(),
  search: z.string().optional(),
})
export type ListExamsInput = z.infer<typeof listExamsSchema>

// ==================== Marks ====================

export const submitMarksSchema = z.object({
  subjectId: z.string().min(1),
  className: z.string().min(1),
  section: z.string().min(1),
  marks: z.array(z.object({
    studentId: z.string().min(1),
    marksObtained: z.number(),
    isAbsent: z.boolean().optional().default(false),
    remarks: z.string().optional(),
  })),
})
export type SubmitMarksInput = z.infer<typeof submitMarksSchema>

// ==================== Grade Scales ====================

export const createGradeScaleSchema = z.object({
  name: z.string().min(1),
  ranges: z.array(z.object({
    grade: z.string(),
    minPercentage: z.number(),
    maxPercentage: z.number(),
    gradePoint: z.number().optional(),
    description: z.string().optional(),
  })),
  isDefault: z.boolean().optional().default(false),
})
export type CreateGradeScaleInput = z.infer<typeof createGradeScaleSchema>

export const updateGradeScaleSchema = createGradeScaleSchema.partial()
export type UpdateGradeScaleInput = z.infer<typeof updateGradeScaleSchema>

// ==================== Report Cards ====================

export const generateReportCardsSchema = z.object({
  examId: z.string().min(1),
  classId: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
})
export type GenerateReportCardsInput = z.infer<typeof generateReportCardsSchema>

// ==================== Exam Timetable ====================

export const createExamSlotSchema = z.object({
  subjectId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  room: z.string().min(1),
  invigilator: z.string().min(1),
  applicableClasses: z.array(z.string()).optional(),
})
export type CreateExamSlotInput = z.infer<typeof createExamSlotSchema>

// ==================== Co-Scholastic ====================

export const submitCoScholasticSchema = z.object({
  studentId: z.string().min(1),
  term: z.string().min(1),
  records: z.array(z.object({
    area: coScholasticAreaEnum,
    grade: z.string().min(1).max(2),
    remarks: z.string().optional(),
  })),
})
export type SubmitCoScholasticInput = z.infer<typeof submitCoScholasticSchema>

export const listCoScholasticSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  studentId: z.string().optional(),
  term: z.string().optional(),
  area: z.string().optional(),
})
export type ListCoScholasticInput = z.infer<typeof listCoScholasticSchema>

// ==================== Question Papers ====================

export const createQuestionPaperSchema = z.object({
  examId: z.string().optional(),
  subjectId: z.string().min(1),
  subjectName: z.string().min(1),
  subjectCode: z.string().min(1),
  className: z.string().min(1),
  academicYear: z.string().min(1),
  term: z.string().min(1),
  totalMarks: z.number().int().positive(),
  duration: z.string().min(1),
  difficulty: paperDifficultyEnum.optional().default('medium'),
  sections: z.array(z.any()),
})
export type CreateQuestionPaperInput = z.infer<typeof createQuestionPaperSchema>
