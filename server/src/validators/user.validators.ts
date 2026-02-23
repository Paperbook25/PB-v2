import { z } from 'zod'

const roleEnum = z.enum([
  'admin', 'principal', 'teacher', 'accountant',
  'librarian', 'transport_manager', 'student', 'parent',
])

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  role: roleEnum,
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  // Student-specific
  studentId: z.string().optional(),
  class: z.string().optional(),
  section: z.string().optional(),
  rollNumber: z.number().int().positive().optional(),
  // Parent-specific
  childIds: z.array(z.string()).optional(),
})

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
  role: roleEnum.optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
  // Student-specific
  studentId: z.string().optional(),
  class: z.string().optional(),
  section: z.string().optional(),
  rollNumber: z.number().int().positive().optional(),
  // Parent-specific
  childIds: z.array(z.string()).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
