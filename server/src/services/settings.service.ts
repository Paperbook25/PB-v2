import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== SCHOOL PROFILE ====================

export async function getSchoolProfile() {
  const profile = await prisma.schoolProfile.findFirst()
  if (!profile) throw AppError.notFound('School profile not configured')
  return {
    id: profile.id,
    name: profile.name,
    address: profile.address,
    city: profile.city,
    state: profile.state,
    pincode: profile.pincode,
    phone: profile.phone,
    email: profile.email,
    website: profile.website,
    logo: profile.logo,
    principalName: profile.principalName,
    establishedYear: profile.establishedYear,
    affiliationNumber: profile.affiliationNumber,
    affiliationBoard: profile.affiliationBoard,
  }
}

export async function updateSchoolProfile(data: Record<string, unknown>) {
  const existing = await prisma.schoolProfile.findFirst()
  if (!existing) throw AppError.notFound('School profile not configured')

  const profile = await prisma.schoolProfile.update({
    where: { id: existing.id },
    data: data as Parameters<typeof prisma.schoolProfile.update>[0]['data'],
  })

  return {
    id: profile.id,
    name: profile.name,
    address: profile.address,
    city: profile.city,
    state: profile.state,
    pincode: profile.pincode,
    phone: profile.phone,
    email: profile.email,
    website: profile.website,
    logo: profile.logo,
    principalName: profile.principalName,
    establishedYear: profile.establishedYear,
    affiliationNumber: profile.affiliationNumber,
    affiliationBoard: profile.affiliationBoard,
  }
}

// ==================== ACADEMIC YEARS ====================

export async function listAcademicYears() {
  const years = await prisma.academicYear.findMany({
    orderBy: { startDate: 'desc' },
  })
  return years.map((y) => ({
    id: y.id,
    name: y.name,
    startDate: y.startDate.toISOString().split('T')[0],
    endDate: y.endDate.toISOString().split('T')[0],
    isCurrent: y.isCurrent,
    status: y.status,
  }))
}

export async function createAcademicYear(data: { name: string; startDate: string; endDate: string }) {
  const year = await prisma.academicYear.create({
    data: {
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isCurrent: false,
      status: 'upcoming',
    },
  })
  return {
    id: year.id,
    name: year.name,
    startDate: year.startDate.toISOString().split('T')[0],
    endDate: year.endDate.toISOString().split('T')[0],
    isCurrent: year.isCurrent,
    status: year.status,
  }
}

export async function updateAcademicYear(id: string, data: Record<string, unknown>) {
  const existing = await prisma.academicYear.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Academic year not found')

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate as string)
  if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate as string)
  if (data.status !== undefined) updateData.status = data.status

  const year = await prisma.academicYear.update({ where: { id }, data: updateData })
  return {
    id: year.id,
    name: year.name,
    startDate: year.startDate.toISOString().split('T')[0],
    endDate: year.endDate.toISOString().split('T')[0],
    isCurrent: year.isCurrent,
    status: year.status,
  }
}

export async function deleteAcademicYear(id: string) {
  const existing = await prisma.academicYear.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Academic year not found')
  if (existing.isCurrent) throw AppError.badRequest('Cannot delete current academic year')

  await prisma.academicYear.delete({ where: { id } })
  return { success: true }
}

export async function setCurrentAcademicYear(id: string) {
  const existing = await prisma.academicYear.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Academic year not found')

  await prisma.$transaction([
    prisma.academicYear.updateMany({ data: { isCurrent: false } }),
    prisma.academicYear.update({
      where: { id },
      data: { isCurrent: true, status: 'active' },
    }),
  ])

  const year = await prisma.academicYear.findUnique({ where: { id } })
  return {
    id: year!.id,
    name: year!.name,
    startDate: year!.startDate.toISOString().split('T')[0],
    endDate: year!.endDate.toISOString().split('T')[0],
    isCurrent: year!.isCurrent,
    status: year!.status,
  }
}

// ==================== CLASSES + SECTIONS ====================

export async function listClasses() {
  const classes = await prisma.class.findMany({
    include: {
      sections: {
        include: { classTeacher: true },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return classes.map((c) => ({
    id: c.id,
    className: c.name,
    sections: c.sections.map((s) => s.name),
    classTeacherId: c.sections[0]?.classTeacherId || undefined,
    classTeacherName: c.sections[0]?.classTeacher?.name || undefined,
  }))
}

export async function createClass(data: { className: string; sections: string[]; classTeacherId?: string }) {
  const cls = await prisma.class.create({
    data: {
      name: data.className,
      sortOrder: await getNextClassSortOrder(),
      sections: {
        create: data.sections.map((name) => ({
          name,
          classTeacherId: data.classTeacherId || null,
        })),
      },
    },
    include: {
      sections: {
        include: { classTeacher: true },
        orderBy: { name: 'asc' },
      },
    },
  })

  return {
    id: cls.id,
    className: cls.name,
    sections: cls.sections.map((s) => s.name),
    classTeacherId: cls.sections[0]?.classTeacherId || undefined,
    classTeacherName: cls.sections[0]?.classTeacher?.name || undefined,
  }
}

export async function updateClass(id: string, data: { className?: string; sections?: string[]; classTeacherId?: string | null }) {
  const existing = await prisma.class.findUnique({
    where: { id },
    include: { sections: true },
  })
  if (!existing) throw AppError.notFound('Class not found')

  const updateData: Record<string, unknown> = {}
  if (data.className !== undefined) updateData.name = data.className

  // Update class first
  if (Object.keys(updateData).length > 0) {
    await prisma.class.update({ where: { id }, data: updateData })
  }

  // Sync sections if provided
  if (data.sections !== undefined) {
    const existingNames = existing.sections.map((s) => s.name)
    const newNames = data.sections

    // Delete removed sections
    const toDelete = existingNames.filter((n) => !newNames.includes(n))
    if (toDelete.length > 0) {
      await prisma.section.deleteMany({
        where: { classId: id, name: { in: toDelete } },
      })
    }

    // Add new sections
    const toAdd = newNames.filter((n) => !existingNames.includes(n))
    if (toAdd.length > 0) {
      await prisma.section.createMany({
        data: toAdd.map((name) => ({
          name,
          classId: id,
          classTeacherId: data.classTeacherId !== undefined ? data.classTeacherId : existing.sections[0]?.classTeacherId || null,
        })),
      })
    }
  }

  // Update class teacher on all sections if specified
  if (data.classTeacherId !== undefined) {
    await prisma.section.updateMany({
      where: { classId: id },
      data: { classTeacherId: data.classTeacherId },
    })
  }

  const updated = await prisma.class.findUnique({
    where: { id },
    include: {
      sections: {
        include: { classTeacher: true },
        orderBy: { name: 'asc' },
      },
    },
  })

  return {
    id: updated!.id,
    className: updated!.name,
    sections: updated!.sections.map((s) => s.name),
    classTeacherId: updated!.sections[0]?.classTeacherId || undefined,
    classTeacherName: updated!.sections[0]?.classTeacher?.name || undefined,
  }
}

export async function deleteClass(id: string) {
  const existing = await prisma.class.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Class not found')

  await prisma.class.delete({ where: { id } })
  return { success: true }
}

async function getNextClassSortOrder(): Promise<number> {
  const last = await prisma.class.findFirst({ orderBy: { sortOrder: 'desc' } })
  return (last?.sortOrder || 0) + 1
}

// ==================== SUBJECTS ====================

export async function listSubjects() {
  const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } })
  return subjects.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    type: s.type,
    maxMarks: s.maxMarks,
    passingMarks: s.passingMarks,
  }))
}

export async function createSubject(data: { name: string; code: string; type?: string; maxMarks?: number; passingMarks?: number }) {
  const existing = await prisma.subject.findUnique({ where: { code: data.code } })
  if (existing) throw AppError.conflict('A subject with this code already exists')

  const subject = await prisma.subject.create({
    data: {
      name: data.name,
      code: data.code,
      type: data.type || 'theory',
      maxMarks: data.maxMarks || 100,
      passingMarks: data.passingMarks || 33,
    },
  })
  return { id: subject.id, name: subject.name, code: subject.code, type: subject.type, maxMarks: subject.maxMarks, passingMarks: subject.passingMarks }
}

export async function updateSubject(id: string, data: Record<string, unknown>) {
  const existing = await prisma.subject.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Subject not found')

  if (data.code && data.code !== existing.code) {
    const codeTaken = await prisma.subject.findUnique({ where: { code: data.code as string } })
    if (codeTaken) throw AppError.conflict('A subject with this code already exists')
  }

  const subject = await prisma.subject.update({ where: { id }, data })
  return { id: subject.id, name: subject.name, code: subject.code, type: subject.type, maxMarks: subject.maxMarks, passingMarks: subject.passingMarks }
}

export async function deleteSubject(id: string) {
  const existing = await prisma.subject.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Subject not found')
  await prisma.subject.delete({ where: { id } })
  return { success: true }
}

// ==================== NOTIFICATION PREFERENCES ====================

export async function getNotificationPreferences() {
  const prefs = await prisma.notificationPreference.findFirst()
  if (!prefs) throw AppError.notFound('Notification preferences not configured')
  return {
    emailNotifications: prefs.emailNotifications,
    smsNotifications: prefs.smsNotifications,
    feeReminders: prefs.feeReminders,
    attendanceAlerts: prefs.attendanceAlerts,
    examResults: prefs.examResults,
    generalAnnouncements: prefs.generalAnnouncements,
  }
}

export async function updateNotificationPreferences(data: Record<string, unknown>) {
  const existing = await prisma.notificationPreference.findFirst()
  if (!existing) throw AppError.notFound('Notification preferences not configured')

  const prefs = await prisma.notificationPreference.update({
    where: { id: existing.id },
    data,
  })
  return {
    emailNotifications: prefs.emailNotifications,
    smsNotifications: prefs.smsNotifications,
    feeReminders: prefs.feeReminders,
    attendanceAlerts: prefs.attendanceAlerts,
    examResults: prefs.examResults,
    generalAnnouncements: prefs.generalAnnouncements,
  }
}

// ==================== BACKUP CONFIG ====================

export async function getBackupConfig() {
  const config = await prisma.backupConfig.findFirst()
  if (!config) throw AppError.notFound('Backup configuration not configured')
  return {
    autoBackup: config.autoBackup,
    backupFrequency: config.backupFrequency,
    lastBackupAt: config.lastBackupAt?.toISOString() || undefined,
    backupRetentionDays: config.backupRetentionDays,
  }
}

export async function updateBackupConfig(data: Record<string, unknown>) {
  const existing = await prisma.backupConfig.findFirst()
  if (!existing) throw AppError.notFound('Backup configuration not configured')

  const config = await prisma.backupConfig.update({
    where: { id: existing.id },
    data,
  })
  return {
    autoBackup: config.autoBackup,
    backupFrequency: config.backupFrequency,
    lastBackupAt: config.lastBackupAt?.toISOString() || undefined,
    backupRetentionDays: config.backupRetentionDays,
  }
}

export async function triggerBackup() {
  const existing = await prisma.backupConfig.findFirst()
  if (!existing) throw AppError.notFound('Backup configuration not configured')

  const now = new Date()
  await prisma.backupConfig.update({
    where: { id: existing.id },
    data: { lastBackupAt: now },
  })

  return {
    success: true,
    message: 'Backup completed successfully',
    lastBackupAt: now.toISOString(),
  }
}

// ==================== THEME CONFIG ====================

export async function getThemeConfig() {
  const config = await prisma.themeConfig.findFirst()
  if (!config) throw AppError.notFound('Theme configuration not configured')
  return {
    mode: config.mode,
    primaryColor: config.primaryColor,
    accentColor: config.accentColor,
  }
}

export async function updateThemeConfig(data: Record<string, unknown>) {
  const existing = await prisma.themeConfig.findFirst()
  if (!existing) throw AppError.notFound('Theme configuration not configured')

  const config = await prisma.themeConfig.update({
    where: { id: existing.id },
    data,
  })
  return {
    mode: config.mode,
    primaryColor: config.primaryColor,
    accentColor: config.accentColor,
  }
}

// ==================== CALENDAR EVENTS ====================

export async function listCalendarEvents(params: { type?: string; month?: string }) {
  const where: Record<string, unknown> = {}

  if (params.type) {
    where.type = params.type
  }

  let events = await prisma.calendarEvent.findMany({
    where,
    orderBy: { startDate: 'asc' },
  })

  // Filter by month if provided
  if (params.month) {
    const [year, month] = params.month.split('-').map(Number)
    events = events.filter((e) => {
      const startMonth = `${e.startDate.getFullYear()}-${String(e.startDate.getMonth() + 1).padStart(2, '0')}`
      const endMonth = `${e.endDate.getFullYear()}-${String(e.endDate.getMonth() + 1).padStart(2, '0')}`
      const target = `${year}-${String(month).padStart(2, '0')}`
      return startMonth <= target && endMonth >= target
    })
  }

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    type: e.type,
    startDate: e.startDate.toISOString().split('T')[0],
    endDate: e.endDate.toISOString().split('T')[0],
    isRecurring: e.isRecurring,
    appliesToClasses: (e.appliesToClasses as string[]) || [],
    createdAt: e.createdAt.toISOString(),
  }))
}

export async function createCalendarEvent(data: {
  title: string
  description?: string
  type: string
  startDate: string
  endDate: string
  isRecurring?: boolean
  appliesToClasses?: string[]
}) {
  const event = await prisma.calendarEvent.create({
    data: {
      title: data.title,
      description: data.description || '',
      type: data.type as 'holiday' | 'exam' | 'ptm' | 'sports' | 'cultural' | 'workshop' | 'vacation' | 'other',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isRecurring: data.isRecurring || false,
      appliesToClasses: data.appliesToClasses || [],
    },
  })

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    type: event.type,
    startDate: event.startDate.toISOString().split('T')[0],
    endDate: event.endDate.toISOString().split('T')[0],
    isRecurring: event.isRecurring,
    appliesToClasses: (event.appliesToClasses as string[]) || [],
    createdAt: event.createdAt.toISOString(),
  }
}

export async function updateCalendarEvent(id: string, data: Record<string, unknown>) {
  const existing = await prisma.calendarEvent.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Event not found')

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.type !== undefined) updateData.type = data.type
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate as string)
  if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate as string)
  if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring
  if (data.appliesToClasses !== undefined) updateData.appliesToClasses = data.appliesToClasses

  const event = await prisma.calendarEvent.update({ where: { id }, data: updateData })
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    type: event.type,
    startDate: event.startDate.toISOString().split('T')[0],
    endDate: event.endDate.toISOString().split('T')[0],
    isRecurring: event.isRecurring,
    appliesToClasses: (event.appliesToClasses as string[]) || [],
    createdAt: event.createdAt.toISOString(),
  }
}

export async function deleteCalendarEvent(id: string) {
  const existing = await prisma.calendarEvent.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Event not found')
  await prisma.calendarEvent.delete({ where: { id } })
  return { success: true }
}

// ==================== EMAIL TEMPLATES ====================

function extractTemplateVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) || []
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))]
}

export async function listEmailTemplates(params: { category?: string }) {
  const where: Record<string, unknown> = {}
  if (params.category) where.category = params.category

  const templates = await prisma.emailTemplate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return templates.map((t) => ({
    id: t.id,
    name: t.name,
    subject: t.subject,
    body: t.body,
    category: t.category,
    variables: t.variables as string[],
    isActive: t.isActive,
    lastModified: t.lastModified.toISOString(),
    createdAt: t.createdAt.toISOString(),
  }))
}

export async function getEmailTemplate(id: string) {
  const t = await prisma.emailTemplate.findUnique({ where: { id } })
  if (!t) throw AppError.notFound('Template not found')
  return {
    id: t.id,
    name: t.name,
    subject: t.subject,
    body: t.body,
    category: t.category,
    variables: t.variables as string[],
    isActive: t.isActive,
    lastModified: t.lastModified.toISOString(),
    createdAt: t.createdAt.toISOString(),
  }
}

export async function createEmailTemplate(data: { name: string; subject: string; body: string; category: string }) {
  const variables = extractTemplateVariables(data.subject + data.body)

  const t = await prisma.emailTemplate.create({
    data: {
      name: data.name,
      subject: data.subject,
      body: data.body,
      category: data.category as 'fee' | 'attendance' | 'exam' | 'admission' | 'general' | 'transport',
      variables,
      isActive: true,
      lastModified: new Date(),
    },
  })

  return {
    id: t.id,
    name: t.name,
    subject: t.subject,
    body: t.body,
    category: t.category,
    variables: t.variables as string[],
    isActive: t.isActive,
    lastModified: t.lastModified.toISOString(),
    createdAt: t.createdAt.toISOString(),
  }
}

export async function updateEmailTemplate(id: string, data: Record<string, unknown>) {
  const existing = await prisma.emailTemplate.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Template not found')

  const updateData: Record<string, unknown> = { lastModified: new Date() }
  if (data.name !== undefined) updateData.name = data.name
  if (data.subject !== undefined) updateData.subject = data.subject
  if (data.body !== undefined) updateData.body = data.body
  if (data.category !== undefined) updateData.category = data.category
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  // Re-extract variables if body or subject changed
  if (data.body !== undefined || data.subject !== undefined) {
    const subject = (data.subject as string) || existing.subject
    const body = (data.body as string) || existing.body
    updateData.variables = extractTemplateVariables(subject + body)
  }

  const t = await prisma.emailTemplate.update({ where: { id }, data: updateData })
  return {
    id: t.id,
    name: t.name,
    subject: t.subject,
    body: t.body,
    category: t.category,
    variables: t.variables as string[],
    isActive: t.isActive,
    lastModified: t.lastModified.toISOString(),
    createdAt: t.createdAt.toISOString(),
  }
}

export async function deleteEmailTemplate(id: string) {
  const existing = await prisma.emailTemplate.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Template not found')
  await prisma.emailTemplate.delete({ where: { id } })
  return { success: true }
}
