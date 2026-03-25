import { z } from 'zod'

// ==================== Pages ====================

export const createPageSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  title: z.string().min(1).max(200),
  sortOrder: z.number().int().optional(),
})

export const updatePageSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1).max(200).optional(),
  sortOrder: z.number().int().optional(),
})

export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>

// ==================== Sections ====================

export const sectionTypeEnum = z.enum([
  'hero', 'about', 'stats', 'admissions', 'faculty', 'gallery',
  'testimonials', 'events', 'news', 'contact', 'custom_html',
  'courses', 'results', 'fee_structure', 'accreditation', 'infrastructure',
  'placements', 'leadership', 'downloads', 'faq', 'transport',
  'student_life', 'safety', 'alumni', 'virtual_tour', 'cta_banner',
])

export const createSectionSchema = z.object({
  type: sectionTypeEnum,
  title: z.string().max(200).optional(),
  content: z.record(z.unknown()).default({}),
  sortOrder: z.number().int().optional(),
})

export const updateSectionSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.record(z.unknown()).optional(),
  isVisible: z.boolean().optional(),
})

export const reorderSectionsSchema = z.object({
  sections: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int(),
  })),
})

export type CreateSectionInput = z.infer<typeof createSectionSchema>
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>

// ==================== Settings ====================

export const updateSettingsSchema = z.object({
  template: z.enum([
    // Legacy values (backward compatibility)
    'classic', 'modern', 'minimal',
    // School templates
    'school-classic', 'school-modern', 'school-vibrant', 'school-minimal',
    // College templates
    'college-academic', 'college-campus', 'college-tech', 'college-minimal',
    // Coaching templates
    'coaching-results', 'coaching-professional', 'coaching-dynamic', 'coaching-clean',
  ]).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  fontFamily: z.string().max(100).optional(),
  customDomain: z.string().max(255).optional().nullable(),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  socialLinks: z.record(z.string()).optional(),
  headerHtml: z.string().optional().nullable(),
  footerHtml: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  institutionType: z.enum(['school', 'college', 'coaching']).optional(),
  admissionFormEnabled: z.boolean().optional(),
  ogDefaultImage: z.string().optional().nullable(),
  announcementText: z.string().max(500).optional().nullable(),
  announcementLink: z.string().max(500).optional().nullable(),
  announcementEnabled: z.boolean().optional(),
  whatsappNumber: z.string().max(20).optional().nullable(),
  whatsappDefaultMessage: z.string().max(500).optional().nullable(),
  gaTrackingId: z.string().max(50).optional().nullable(),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>

// ==================== Media ====================

export const uploadMediaSchema = z.object({
  fileName: z.string().min(1).max(255),
  url: z.string().min(1),
  mimeType: z.string().optional(),
  fileSize: z.number().int().optional(),
  altText: z.string().max(500).optional(),
})

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>

// ==================== Media File Upload ====================

export const uploadMediaFileSchema = z.object({
  fileName: z.string().min(1).max(255),
  data: z.string().min(1), // base64 encoded file data
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  altText: z.string().max(500).optional(),
})

export type UploadMediaFileInput = z.infer<typeof uploadMediaFileSchema>

// ==================== AI Generate ====================

export const generatePageSchema = z.object({
  pageSlug: z.string().min(1),
  template: z.enum([
    'classic', 'modern', 'minimal',
    'school-classic', 'school-modern', 'school-vibrant', 'school-minimal',
    'college-academic', 'college-campus', 'college-tech', 'college-minimal',
    'coaching-results', 'coaching-professional', 'coaching-dynamic', 'coaching-clean',
  ]).default('school-modern'),
})

export type GeneratePageInput = z.infer<typeof generatePageSchema>
