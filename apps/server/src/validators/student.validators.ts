import { z } from 'zod'

const genderEnum = z.enum(['male', 'female', 'other'])
const studentStatusEnum = z.enum(['active', 'inactive', 'graduated', 'transferred'])
const documentTypeEnum = z.enum([
  'birth_certificate', 'aadhar_card', 'transfer_certificate', 'photo',
  'address_proof', 'marksheet', 'medical_certificate', 'caste_certificate',
  'income_certificate', 'other',
])
const skillCategoryEnum = z.enum(['academic', 'sports', 'arts', 'leadership', 'technical', 'communication', 'other'])
const portfolioItemTypeEnum = z.enum(['project', 'achievement', 'certificate', 'publication', 'competition', 'other'])
const portfolioVisibilityEnum = z.enum(['public', 'school', 'private'])

// ==================== Student CRUD ====================

export const createStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).default(''),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(), // ISO date string
  gender: genderEnum.optional(),
  bloodGroup: z.string().optional(),
  class: z.string().min(1, 'Class is required'), // class name string
  section: z.string().min(1, 'Section is required'), // section name string
  rollNumber: z.number().int().positive().optional(),
  admissionDate: z.string().optional(), // ISO date string
  photoUrl: z.string().url().optional().or(z.literal('')),
  status: studentStatusEnum.optional(),
  // Nested address
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
  // Nested parent
  parent: z.object({
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    guardianPhone: z.string().optional(),
    guardianEmail: z.string().email().optional().or(z.literal('')),
    occupation: z.string().optional(),
  }).optional(),
})

export const updateStudentSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: genderEnum.optional(),
  bloodGroup: z.string().optional(),
  class: z.string().optional(),
  section: z.string().optional(),
  rollNumber: z.number().int().positive().optional().nullable(),
  admissionDate: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  status: studentStatusEnum.optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
  parent: z.object({
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    guardianPhone: z.string().optional(),
    guardianEmail: z.string().email().optional().or(z.literal('')),
    occupation: z.string().optional(),
  }).optional(),
})

export const listStudentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10).transform(n => Math.min(n, 500)),
  search: z.string().optional(),
  class: z.string().optional(),
  section: z.string().optional(),
  status: studentStatusEnum.optional().catch(undefined),
  gender: genderEnum.optional().catch(undefined),
})

// ==================== Documents ====================

export const createDocumentSchema = z.object({
  type: documentTypeEnum,
  name: z.string().min(1, 'Document name is required'),
  fileName: z.string().min(1),
  fileSize: z.number().int().optional(),
  mimeType: z.string().optional(),
  url: z.string().min(1, 'Document URL is required'),
})

// ==================== Health ====================

export const upsertHealthRecordSchema = z.object({
  allergies: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
  bloodGroup: z.string().optional(),
  height: z.union([z.number(), z.string()]).optional(),
  weight: z.union([z.number(), z.string()]).optional(),
  visionLeft: z.string().optional(),
  visionRight: z.string().optional(),
  lastCheckupDate: z.string().optional(),
  insuranceProvider: z.string().optional(),
  notes: z.string().optional(),
})

// ==================== Skills ====================

export const createSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: skillCategoryEnum,
  proficiencyLevel: z.number().int().min(1).max(5).default(1),
  certifications: z.array(z.string()).optional(),
  endorsedBy: z.array(z.string()).optional(),
  acquiredDate: z.string().optional(),
  notes: z.string().optional(),
})

export const updateSkillSchema = z.object({
  name: z.string().min(1).optional(),
  category: skillCategoryEnum.optional(),
  proficiencyLevel: z.number().int().min(1).max(5).optional(),
  certifications: z.array(z.string()).optional(),
  endorsedBy: z.array(z.string()).optional(),
  acquiredDate: z.string().optional(),
  notes: z.string().optional(),
})

// ==================== Portfolio ====================

export const createPortfolioItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: portfolioItemTypeEnum,
  description: z.string().optional(),
  date: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  visibility: portfolioVisibilityEnum.optional(),
  featured: z.boolean().optional(),
})

export const updatePortfolioItemSchema = z.object({
  title: z.string().min(1).optional(),
  type: portfolioItemTypeEnum.optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  visibility: portfolioVisibilityEnum.optional(),
  featured: z.boolean().optional(),
})

// ==================== Siblings ====================

export const linkSiblingSchema = z.object({
  siblingId: z.string().uuid('Invalid sibling ID'),
})

// ==================== Promotion ====================

export const promoteStudentsSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1),
  toClass: z.string().min(1, 'Target class is required'),
  toSection: z.string().min(1, 'Target section is required'),
})

// ==================== Bulk Import ====================

export const bulkImportStudentsSchema = z.object({
  students: z.array(createStudentSchema).min(1).max(500),
})

// ==================== Type exports ====================

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
export type ListStudentsInput = z.infer<typeof listStudentsSchema>
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
export type UpsertHealthRecordInput = z.infer<typeof upsertHealthRecordSchema>
export type CreateSkillInput = z.infer<typeof createSkillSchema>
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>
export type CreatePortfolioItemInput = z.infer<typeof createPortfolioItemSchema>
export type UpdatePortfolioItemInput = z.infer<typeof updatePortfolioItemSchema>
export type LinkSiblingInput = z.infer<typeof linkSiblingSchema>
export type PromoteStudentsInput = z.infer<typeof promoteStudentsSchema>
export type BulkImportStudentsInput = z.infer<typeof bulkImportStudentsSchema>
