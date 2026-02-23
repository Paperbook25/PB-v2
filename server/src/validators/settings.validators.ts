import { z } from 'zod'

// ==================== SCHOOL PROFILE ====================

export const updateSchoolProfileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().min(1).max(500).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  pincode: z.string().min(1).max(10).optional(),
  phone: z.string().min(1).max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().optional(),
  principalName: z.string().min(1).max(200).optional(),
  establishedYear: z.number().int().min(1800).max(2100).optional(),
  affiliationNumber: z.string().optional(),
  affiliationBoard: z.enum(['CBSE', 'ICSE', 'State', 'IB', 'Other']).optional(),
})

// ==================== ACADEMIC YEARS ====================

export const createAcademicYearSchema = z.object({
  name: z.string().min(1).max(20),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
})

export const updateAcademicYearSchema = z.object({
  name: z.string().min(1).max(20).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['active', 'completed', 'upcoming']).optional(),
})

// ==================== CLASSES ====================

export const createClassSchema = z.object({
  className: z.string().min(1).max(50),
  sections: z.array(z.string().min(1).max(10)).min(1),
  classTeacherId: z.string().optional(),
})

export const updateClassSchema = z.object({
  className: z.string().min(1).max(50).optional(),
  sections: z.array(z.string().min(1).max(10)).optional(),
  classTeacherId: z.string().optional().nullable(),
})

// ==================== SUBJECTS ====================

export const createSubjectSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  type: z.enum(['theory', 'practical', 'both']).optional(),
  maxMarks: z.number().int().positive().optional(),
  passingMarks: z.number().int().positive().optional(),
})

export const updateSubjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(20).optional(),
  type: z.enum(['theory', 'practical', 'both']).optional(),
  maxMarks: z.number().int().positive().optional(),
  passingMarks: z.number().int().positive().optional(),
})

// ==================== NOTIFICATIONS ====================

export const updateNotificationPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  feeReminders: z.boolean().optional(),
  attendanceAlerts: z.boolean().optional(),
  examResults: z.boolean().optional(),
  generalAnnouncements: z.boolean().optional(),
})

// ==================== BACKUP ====================

export const updateBackupConfigSchema = z.object({
  autoBackup: z.boolean().optional(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  backupRetentionDays: z.number().int().min(1).max(365).optional(),
})

// ==================== THEME ====================

export const updateThemeConfigSchema = z.object({
  mode: z.enum(['light', 'dark', 'system']).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

// ==================== CALENDAR EVENTS ====================

export const createCalendarEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['holiday', 'exam', 'ptm', 'sports', 'cultural', 'workshop', 'vacation', 'other']),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  isRecurring: z.boolean().optional(),
  appliesToClasses: z.array(z.string()).optional(),
})

export const updateCalendarEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  type: z.enum(['holiday', 'exam', 'ptm', 'sports', 'cultural', 'workshop', 'vacation', 'other']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isRecurring: z.boolean().optional(),
  appliesToClasses: z.array(z.string()).optional(),
})

// ==================== EMAIL TEMPLATES ====================

export const createEmailTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  category: z.enum(['fee', 'attendance', 'exam', 'admission', 'general', 'transport']),
})

export const updateEmailTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  subject: z.string().min(1).max(500).optional(),
  body: z.string().min(1).optional(),
  category: z.enum(['fee', 'attendance', 'exam', 'admission', 'general', 'transport']).optional(),
  isActive: z.boolean().optional(),
})
