import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const createSchoolSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  adminEmail: emailSchema,
  adminName: z.string().min(2, 'Admin name must be at least 2 characters'),
  adminPassword: passwordSchema,
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  principalName: z.string().optional(),
  planTier: z.enum(['free', 'starter', 'professional', 'enterprise']).default('free'),
})

export const updateSchoolSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  principalName: z.string().optional(),
  planTier: z.enum(['free', 'starter', 'professional', 'enterprise']).optional(),
  maxUsers: z.number().int().positive().optional(),
  maxStudents: z.number().int().positive().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
