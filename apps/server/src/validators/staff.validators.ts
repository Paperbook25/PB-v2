import { z } from 'zod'

const genderEnum = z.enum(['male', 'female', 'other'])
const staffStatusEnum = z.enum(['active', 'on_leave', 'resigned'])
const pdTypeEnum = z.enum(['certification', 'workshop', 'seminar', 'training', 'conference', 'course'])
const pdStatusEnum = z.enum(['upcoming', 'in_progress', 'completed', 'expired'])
const reviewPeriodEnum = z.enum(['Q1', 'Q2', 'Q3', 'Q4', 'annual'])
const reviewStatusEnum = z.enum(['draft', 'submitted', 'acknowledged'])
const staffSkillCategoryEnum = z.enum(['technical', 'soft', 'domain', 'tool', 'language'])
const skillProficiencyEnum = z.enum(['beginner', 'intermediate', 'advanced', 'expert'])
const certificationCategoryEnum = z.enum(['teaching', 'technical', 'safety', 'compliance', 'professional', 'other_cert'])
const certificationStatusEnum = z.enum(['active_cert', 'expired_cert', 'revoked'])
const separationTypeEnum = z.enum(['resignation', 'termination', 'retirement', 'contract_end', 'layoff', 'death'])
const exitInterviewStatusEnum = z.enum(['scheduled', 'exit_completed', 'cancelled'])
const handoverStatusEnum = z.enum(['handover_not_started', 'handover_in_progress', 'handover_completed'])
const fnfStatusEnum = z.enum(['fnf_pending', 'fnf_processed', 'fnf_paid'])
const onboardingStatusEnum = z.enum(['not_started', 'onboarding_in_progress', 'onboarding_completed', 'on_hold'])

// ==================== Staff CRUD ====================

export const createStaffSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: genderEnum.optional(),
  department: z.string().min(1, 'Department is required'), // name string → findOrCreate
  designation: z.string().min(1, 'Designation is required'), // name string → findOrCreate
  joiningDate: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  specialization: z.string().optional(),
  salary: z.number().optional(),
  status: staffStatusEnum.optional(),
  userId: z.string().uuid().optional(),
  qualification: z.array(z.string()).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
  bankDetails: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    accountHolderName: z.string().optional(),
  }).optional(),
})

export const updateStaffSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: genderEnum.optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  specialization: z.string().optional(),
  salary: z.number().optional(),
  status: staffStatusEnum.optional(),
  userId: z.string().uuid().optional().nullable(),
  qualification: z.array(z.string()).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
  bankDetails: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    accountHolderName: z.string().optional(),
  }).optional(),
})

export const listStaffSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  status: staffStatusEnum.optional(),
  gender: genderEnum.optional(),
})

// ==================== Professional Development ====================

export const createPDSchema = z.object({
  type: pdTypeEnum,
  title: z.string().min(1, 'Title is required'),
  provider: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: pdStatusEnum.optional(),
  certificateUrl: z.string().url().optional().or(z.literal('')),
  hours: z.number().optional(),
  cost: z.number().optional(),
})

export const updatePDSchema = z.object({
  type: pdTypeEnum.optional(),
  title: z.string().min(1).optional(),
  provider: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: pdStatusEnum.optional(),
  certificateUrl: z.string().url().optional().or(z.literal('')),
  hours: z.number().optional(),
  cost: z.number().optional(),
})

// ==================== Performance Reviews ====================

export const createReviewSchema = z.object({
  staffId: z.string().uuid('Invalid staff ID'),
  reviewerId: z.string().uuid('Invalid reviewer ID'),
  period: reviewPeriodEnum,
  year: z.number().int().min(2000).max(2100),
  ratings: z.record(z.number()).optional(),
  overallRating: z.number().min(0).max(5).optional(),
  strengths: z.string().optional(),
  areasOfImprovement: z.string().optional(),
  goals: z.string().optional(),
  status: reviewStatusEnum.optional(),
})

// ==================== Skills ====================

export const createStaffSkillSchema = z.object({
  skillName: z.string().min(1, 'Skill name is required'),
  category: staffSkillCategoryEnum,
  proficiency: skillProficiencyEnum.optional(),
  yearsOfExperience: z.number().optional(),
  selfAssessed: z.boolean().optional(),
})

export const updateStaffSkillSchema = z.object({
  skillName: z.string().min(1).optional(),
  category: staffSkillCategoryEnum.optional(),
  proficiency: skillProficiencyEnum.optional(),
  yearsOfExperience: z.number().optional(),
  selfAssessed: z.boolean().optional(),
  verifiedBy: z.string().optional(),
})

// ==================== Certifications ====================

export const createCertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuingOrganization: z.string().optional(),
  credentialId: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  doesNotExpire: z.boolean().optional(),
  status: certificationStatusEnum.optional(),
  category: certificationCategoryEnum.optional(),
})

export const updateCertificationSchema = z.object({
  name: z.string().min(1).optional(),
  issuingOrganization: z.string().optional(),
  credentialId: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  doesNotExpire: z.boolean().optional(),
  status: certificationStatusEnum.optional(),
  category: certificationCategoryEnum.optional(),
})

// ==================== Onboarding ====================

export const createOnboardingSchema = z.object({
  assignedHR: z.string().optional(),
  assignedManager: z.string().optional(),
})

export const updateOnboardingTaskSchema = z.object({
  completed: z.boolean(),
  completedDate: z.string().optional(),
  notes: z.string().optional(),
})

// ==================== Exit Interview ====================

export const createExitInterviewSchema = z.object({
  lastWorkingDate: z.string().optional(),
  separationType: separationTypeEnum.optional(),
  interviewDate: z.string().optional(),
})

export const updateExitInterviewSchema = z.object({
  lastWorkingDate: z.string().optional(),
  separationType: separationTypeEnum.optional(),
  interviewDate: z.string().optional(),
  ratings: z.record(z.number()).optional(),
  reasonForLeaving: z.array(z.string()).optional(),
  handoverStatus: handoverStatusEnum.optional(),
  fnfStatus: fnfStatusEnum.optional(),
  status: exitInterviewStatusEnum.optional(),
})

export const updateClearanceSchema = z.object({
  status: z.enum(['pending', 'cleared', 'not_applicable']),
  clearedBy: z.string().optional(),
  clearedDate: z.string().optional(),
  remarks: z.string().optional(),
})

// ==================== Bulk ====================

export const bulkImportStaffSchema = z.object({
  staff: z.array(createStaffSchema).min(1).max(500),
})

// ==================== Type exports ====================

export type CreateStaffInput = z.infer<typeof createStaffSchema>
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>
export type ListStaffInput = z.infer<typeof listStaffSchema>
export type CreatePDInput = z.infer<typeof createPDSchema>
export type UpdatePDInput = z.infer<typeof updatePDSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type CreateStaffSkillInput = z.infer<typeof createStaffSkillSchema>
export type UpdateStaffSkillInput = z.infer<typeof updateStaffSkillSchema>
export type CreateCertificationInput = z.infer<typeof createCertificationSchema>
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>
export type CreateOnboardingInput = z.infer<typeof createOnboardingSchema>
export type UpdateOnboardingTaskInput = z.infer<typeof updateOnboardingTaskSchema>
export type CreateExitInterviewInput = z.infer<typeof createExitInterviewSchema>
export type UpdateExitInterviewInput = z.infer<typeof updateExitInterviewSchema>
export type UpdateClearanceInput = z.infer<typeof updateClearanceSchema>
export type BulkImportStaffInput = z.infer<typeof bulkImportStaffSchema>
