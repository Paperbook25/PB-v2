import { z } from 'zod'

// ==================== Enum Schemas ====================

export const feeCategoryEnum = z.enum([
  'tuition', 'development', 'lab', 'library', 'sports', 'computer', 'transport', 'examination', 'other',
])

export const feeFrequencyEnum = z.enum([
  'monthly', 'quarterly', 'half_yearly', 'annual', 'one_time',
])

export const feePaymentStatusEnum = z.enum([
  'pending', 'partial', 'paid', 'overdue', 'waived',
])

export const paymentModeEnum = z.enum([
  'cash', 'upi', 'bank_transfer', 'cheque', 'dd', 'online',
])

export const expenseCategoryEnum = z.enum([
  'salary', 'utilities', 'maintenance', 'supplies', 'infrastructure', 'events', 'other',
])

export const expenseStatusEnum = z.enum([
  'pending_approval', 'approved', 'rejected', 'paid',
])

// ==================== Fee Type Schemas ====================

export const createFeeTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  category: feeCategoryEnum,
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const updateFeeTypeSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: feeCategoryEnum.optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

// ==================== Fee Structure Schemas ====================

export const createFeeStructureSchema = z.object({
  feeTypeId: z.string().uuid('Invalid fee type ID'),
  academicYear: z.string().min(1, 'Academic year is required'),
  applicableClasses: z.array(z.string()).min(1, 'At least one class is required'),
  amount: z.number().positive('Amount must be positive'),
  frequency: feeFrequencyEnum,
  dueDay: z.number().int().min(1).max(28).optional(),
  isOptional: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const updateFeeStructureSchema = z.object({
  feeTypeId: z.string().uuid().optional(),
  academicYear: z.string().optional(),
  applicableClasses: z.array(z.string()).optional(),
  amount: z.number().positive().optional(),
  frequency: feeFrequencyEnum.optional(),
  dueDay: z.number().int().min(1).max(28).optional(),
  isOptional: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const assignFeeStructureSchema = z.object({
  studentIds: z.array(z.string().uuid()).optional(),
  className: z.string().optional(),
  sectionName: z.string().optional(),
})

// ==================== Student Fee Schemas ====================

export const updateStudentFeeSchema = z.object({
  totalAmount: z.number().positive().optional(),
  discountAmount: z.number().min(0).optional(),
  status: feePaymentStatusEnum.optional(),
  dueDate: z.string().optional(),
})

export const bulkAssignSchema = z.object({
  feeStructureId: z.string().uuid('Invalid fee structure ID'),
  className: z.string().optional(),
  sectionName: z.string().optional(),
  studentIds: z.array(z.string().uuid()).optional(),
})

// ==================== Payment Schemas ====================

export const collectPaymentSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  paymentMode: paymentModeEnum,
  transactionRef: z.string().optional(),
  remarks: z.string().optional(),
  payments: z.array(z.object({
    studentFeeId: z.string().uuid('Invalid student fee ID'),
    amount: z.number().positive('Amount must be positive'),
  })).min(1, 'At least one payment is required'),
})

// ==================== Expense Schemas ====================

export const createExpenseSchema = z.object({
  category: expenseCategoryEnum,
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  vendorName: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(),
})

export const updateExpenseSchema = z.object({
  category: expenseCategoryEnum.optional(),
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  vendorName: z.string().optional().nullable(),
  invoiceNumber: z.string().optional().nullable(),
  invoiceDate: z.string().optional().nullable(),
})

export const rejectExpenseSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
})

export const markExpensePaidSchema = z.object({
  paidRef: z.string().optional(),
})

// ==================== Type Exports ====================

export type CreateFeeTypeInput = z.infer<typeof createFeeTypeSchema>
export type UpdateFeeTypeInput = z.infer<typeof updateFeeTypeSchema>
export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>
export type UpdateFeeStructureInput = z.infer<typeof updateFeeStructureSchema>
export type AssignFeeStructureInput = z.infer<typeof assignFeeStructureSchema>
export type UpdateStudentFeeInput = z.infer<typeof updateStudentFeeSchema>
export type BulkAssignInput = z.infer<typeof bulkAssignSchema>
export type CollectPaymentInput = z.infer<typeof collectPaymentSchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
export type RejectExpenseInput = z.infer<typeof rejectExpenseSchema>
export type MarkExpensePaidInput = z.infer<typeof markExpensePaidSchema>
