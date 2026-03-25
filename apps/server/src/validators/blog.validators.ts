import { z } from 'zod'

// ==================== Create Blog Post ====================

export const createBlogPostSchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>

// ==================== Update Blog Post ====================

export const updateBlogPostSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  body: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  coverImage: z.string().optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(['draft', 'published']).optional(),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  ogImage: z.string().optional().nullable(),
})

export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>

// ==================== List Blog Posts ====================

export const listBlogPostsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['draft', 'published']).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
})

export type ListBlogPostsInput = z.infer<typeof listBlogPostsSchema>
