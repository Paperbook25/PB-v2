import { z } from 'zod'

const admissionStatusEnum = z.enum([
  'applied', 'under_review', 'document_verification', 'entrance_exam',
  'interview', 'approved', 'waitlisted', 'rejected', 'enrolled', 'withdrawn',
])

const admDocTypeEnum = z.enum([
  'birth_certificate', 'previous_marksheet', 'transfer_certificate',
  'address_proof', 'photo', 'parent_id', 'medical_certificate', 'other',
])

const admDocStatusEnum = z.enum(['pending', 'verified', 'rejected'])

const admSourceEnum = z.enum([
  'website', 'referral', 'advertisement', 'walk_in', 'social_media', 'other',
])

const commTypeEnum = z.enum(['email', 'sms', 'whatsapp'])

const commTriggerEnum = z.enum([
  'application_received', 'status_change', 'exam_scheduled',
  'interview_scheduled', 'approved', 'rejected', 'waitlisted',
  'payment_due', 'custom',
])

// ==================== Application CRUD ====================

export const createApplicationSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
  applyingForClass: z.string().min(1, 'Class is required'),
  applyingForSection: z.string().optional(),
  previousSchool: z.string().min(1),
  previousClass: z.string().min(1),
  previousMarks: z.number(),
  fatherName: z.string().min(1),
  motherName: z.string().min(1),
  guardianPhone: z.string().min(1),
  guardianEmail: z.string().email(),
  guardianOccupation: z.string().optional(),
  source: admSourceEnum.optional(),
  referredBy: z.string().optional(),
  photoUrl: z.string().optional(),
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>

export const updateApplicationSchema = createApplicationSchema.partial()
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>

export const listApplicationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  class: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export type ListApplicationsInput = z.infer<typeof listApplicationsSchema>

// ==================== Status Change ====================

export const changeStatusSchema = z.object({
  status: admissionStatusEnum,
  note: z.string().optional(),
})
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>

// ==================== Documents ====================

export const addDocumentSchema = z.object({
  type: admDocTypeEnum,
  name: z.string().min(1),
  url: z.string().min(1),
})
export type AddDocumentInput = z.infer<typeof addDocumentSchema>

export const updateDocumentSchema = z.object({
  status: admDocStatusEnum,
  rejectionReason: z.string().optional(),
})
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>

// ==================== Notes ====================

export const addNoteSchema = z.object({
  content: z.string().min(1),
})
export type AddNoteInput = z.infer<typeof addNoteSchema>

// ==================== Interview & Exam ====================

export const updateInterviewSchema = z.object({
  interviewDate: z.string().min(1),
  interviewScore: z.number().optional(),
  interviewNotes: z.string().optional(),
})
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>

export const updateEntranceExamSchema = z.object({
  entranceExamDate: z.string().min(1),
  entranceExamScore: z.number().optional(),
})
export type UpdateEntranceExamInput = z.infer<typeof updateEntranceExamSchema>

// ==================== Exam Schedule ====================

export const createExamScheduleSchema = z.object({
  class: z.string().min(1),
  examDate: z.string().min(1),
  examTime: z.string().min(1),
  venue: z.string().min(1),
  duration: z.number().int().positive(),
  totalMarks: z.number().int().positive(),
  passingMarks: z.number().int().positive(),
  subjects: z.array(z.string()),
})
export type CreateExamScheduleInput = z.infer<typeof createExamScheduleSchema>

// ==================== Exam Score ====================

export const recordExamScoreSchema = z.object({
  marksObtained: z.number(),
  subjectWiseMarks: z.array(z.object({
    subject: z.string(),
    marks: z.number(),
    total: z.number(),
  })).optional(),
})
export type RecordExamScoreInput = z.infer<typeof recordExamScoreSchema>

// ==================== Communication ====================

export const sendCommunicationSchema = z.object({
  applicationIds: z.array(z.string()).min(1),
  type: commTypeEnum,
  subject: z.string().min(1),
  message: z.string().min(1),
})
export type SendCommunicationInput = z.infer<typeof sendCommunicationSchema>

// ==================== Payment ====================

export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.string().min(1),
  transactionId: z.string().optional(),
})
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>
