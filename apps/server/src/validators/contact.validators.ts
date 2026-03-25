import { z } from 'zod'

export const submitContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10).max(2000),
  pageSlug: z.string().optional(),
})

export type SubmitContactInput = z.infer<typeof submitContactSchema>

export const updateContactSchema = z.object({
  status: z.enum(['new', 'contacted', 'converted', 'closed']).optional(),
  notes: z.string().optional(),
})

export type UpdateContactInput = z.infer<typeof updateContactSchema>

export const listContactsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  source: z.string().optional(),
  search: z.string().optional(),
})

export type ListContactsInput = z.infer<typeof listContactsSchema>
