import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  schoolProfile,
  academicYears,
  classSections,
  systemUsers,
  notificationPreferences,
  backupConfig,
  themeConfig,
  auditLogs,
  calendarEvents,
  emailTemplates,
} from '../data/settings.data'
import { staff } from '../data/staff.data'
import type {
  SchoolProfile,
  AcademicYear,
  ClassSection,
  SystemUser,
  NotificationPreferences,
  BackupConfig,
  ThemeConfig,
  CalendarEvent,
  EmailTemplate,
  AuditLogEntry,
  AuditAction,
  AuditModule,
} from '@/features/settings/types/settings.types'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

export const settingsHandlers = [
  // ==================== SCHOOL PROFILE ====================

  http.get('/api/settings/school-profile', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: schoolProfile })
  }),

  http.put('/api/settings/school-profile', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Partial<SchoolProfile>

    Object.assign(schoolProfile, body)

    return HttpResponse.json({ data: schoolProfile })
  }),

  // ==================== ACADEMIC YEARS ====================

  http.get('/api/settings/academic-years', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: academicYears })
  }),

  http.post('/api/settings/academic-years', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as { name: string; startDate: string; endDate: string }

    const newYear: AcademicYear = {
      id: generateId(),
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
      isCurrent: false,
      status: 'upcoming',
    }

    academicYears.push(newYear)

    return HttpResponse.json({ data: newYear }, { status: 201 })
  }),

  http.put('/api/settings/academic-years/:id', async ({ params, request }) => {
    await mockDelay('read')
    const yearIndex = academicYears.findIndex((y) => y.id === params.id)

    if (yearIndex === -1) {
      return HttpResponse.json({ error: 'Academic year not found' }, { status: 404 })
    }

    const body = await request.json() as Partial<AcademicYear>
    academicYears[yearIndex] = { ...academicYears[yearIndex], ...body }

    return HttpResponse.json({ data: academicYears[yearIndex] })
  }),

  http.delete('/api/settings/academic-years/:id', async ({ params }) => {
    await mockDelay('read')
    const yearIndex = academicYears.findIndex((y) => y.id === params.id)

    if (yearIndex === -1) {
      return HttpResponse.json({ error: 'Academic year not found' }, { status: 404 })
    }

    if (academicYears[yearIndex].isCurrent) {
      return HttpResponse.json({ error: 'Cannot delete current academic year' }, { status: 400 })
    }

    academicYears.splice(yearIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  http.patch('/api/settings/academic-years/:id/set-current', async ({ params }) => {
    await mockDelay('read')
    const yearIndex = academicYears.findIndex((y) => y.id === params.id)

    if (yearIndex === -1) {
      return HttpResponse.json({ error: 'Academic year not found' }, { status: 404 })
    }

    // Remove current flag from all years
    academicYears.forEach((y) => {
      y.isCurrent = false
    })

    // Set the selected year as current
    academicYears[yearIndex].isCurrent = true
    academicYears[yearIndex].status = 'active'

    return HttpResponse.json({ data: academicYears[yearIndex] })
  }),

  // ==================== CLASSES ====================

  http.get('/api/settings/classes', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: classSections })
  }),

  http.post('/api/settings/classes', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as { className: string; sections: string[]; classTeacherId?: string }

    const teacher = body.classTeacherId ? staff.find((s) => s.id === body.classTeacherId) : null

    const newClass: ClassSection = {
      id: generateId(),
      className: body.className,
      sections: body.sections,
      classTeacherId: body.classTeacherId,
      classTeacherName: teacher?.name,
    }

    classSections.push(newClass)

    return HttpResponse.json({ data: newClass }, { status: 201 })
  }),

  http.put('/api/settings/classes/:id', async ({ params, request }) => {
    await mockDelay('read')
    const classIndex = classSections.findIndex((c) => c.id === params.id)

    if (classIndex === -1) {
      return HttpResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const body = await request.json() as Partial<ClassSection>
    const teacher = body.classTeacherId ? staff.find((s) => s.id === body.classTeacherId) : null

    classSections[classIndex] = {
      ...classSections[classIndex],
      ...body,
      classTeacherName: teacher?.name || classSections[classIndex].classTeacherName,
    }

    return HttpResponse.json({ data: classSections[classIndex] })
  }),

  http.delete('/api/settings/classes/:id', async ({ params }) => {
    await mockDelay('read')
    const classIndex = classSections.findIndex((c) => c.id === params.id)

    if (classIndex === -1) {
      return HttpResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    classSections.splice(classIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== USERS ====================

  http.get('/api/settings/users', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: systemUsers })
  }),

  http.post('/api/settings/users', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as { email: string; name: string; role: SystemUser['role']; password: string }

    // Check if email already exists
    if (systemUsers.some((u) => u.email === body.email)) {
      return HttpResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const newUser: SystemUser = {
      id: generateId(),
      email: body.email,
      name: body.name,
      role: body.role,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    systemUsers.push(newUser)

    return HttpResponse.json({ data: newUser }, { status: 201 })
  }),

  http.put('/api/settings/users/:id', async ({ params, request }) => {
    await mockDelay('read')
    const userIndex = systemUsers.findIndex((u) => u.id === params.id)

    if (userIndex === -1) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json() as Partial<SystemUser>
    systemUsers[userIndex] = { ...systemUsers[userIndex], ...body }

    return HttpResponse.json({ data: systemUsers[userIndex] })
  }),

  http.delete('/api/settings/users/:id', async ({ params }) => {
    await mockDelay('read')
    const userIndex = systemUsers.findIndex((u) => u.id === params.id)

    if (userIndex === -1) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting admin
    if (systemUsers[userIndex].role === 'admin') {
      return HttpResponse.json({ error: 'Cannot delete admin user' }, { status: 400 })
    }

    systemUsers.splice(userIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  http.patch('/api/settings/users/:id/toggle-status', async ({ params }) => {
    await mockDelay('read')
    const userIndex = systemUsers.findIndex((u) => u.id === params.id)

    if (userIndex === -1) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deactivating admin
    if (systemUsers[userIndex].role === 'admin' && systemUsers[userIndex].isActive) {
      return HttpResponse.json({ error: 'Cannot deactivate admin user' }, { status: 400 })
    }

    systemUsers[userIndex].isActive = !systemUsers[userIndex].isActive

    return HttpResponse.json({ data: systemUsers[userIndex] })
  }),

  // ==================== NOTIFICATIONS ====================

  http.get('/api/settings/notifications', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: notificationPreferences })
  }),

  http.put('/api/settings/notifications', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Partial<NotificationPreferences>

    Object.assign(notificationPreferences, body)

    return HttpResponse.json({ data: notificationPreferences })
  }),

  // ==================== BACKUP ====================

  http.get('/api/settings/backup', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: backupConfig })
  }),

  http.put('/api/settings/backup', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Partial<BackupConfig>

    Object.assign(backupConfig, body)

    return HttpResponse.json({ data: backupConfig })
  }),

  http.post('/api/settings/backup/trigger', async () => {
    await mockDelay('heavy') // Simulate backup process
    backupConfig.lastBackupAt = new Date().toISOString()

    return HttpResponse.json({
      success: true,
      message: 'Backup completed successfully',
      lastBackupAt: backupConfig.lastBackupAt,
    })
  }),

  // ==================== THEME ====================

  http.get('/api/settings/theme', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: themeConfig })
  }),

  http.put('/api/settings/theme', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Partial<ThemeConfig>

    Object.assign(themeConfig, body)

    return HttpResponse.json({ data: themeConfig })
  }),

  // ==================== AUDIT LOG ====================

  http.get('/api/settings/audit-log', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const module = url.searchParams.get('module')
    const action = url.searchParams.get('action')
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filtered = [...auditLogs]
    if (module) filtered = filtered.filter((l) => l.module === module)
    if (action) filtered = filtered.filter((l) => l.action === action)
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter((l) =>
        l.description.toLowerCase().includes(s) ||
        l.userName.toLowerCase().includes(s) ||
        l.entityType.toLowerCase().includes(s)
      )
    }

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  }),

  // Create new audit log entry
  http.post('/api/settings/audit-log', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as {
      action: AuditAction
      module: AuditModule
      entityType: string
      entityId: string
      entityName: string
      description: string
      changes?: { field: string; oldValue: string; newValue: string }[]
    }

    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      userId: 'current-user',
      userName: 'Current User',
      userRole: 'admin',
      action: body.action,
      module: body.module,
      entityType: body.entityType,
      entityId: body.entityId,
      entityName: body.entityName,
      description: body.description,
      changes: body.changes,
      ipAddress: '192.168.1.1',
      timestamp: new Date().toISOString(),
    }

    auditLogs.unshift(newEntry)

    return HttpResponse.json({ data: newEntry }, { status: 201 })
  }),

  // ==================== ACADEMIC CALENDAR ====================

  http.get('/api/settings/calendar', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const month = url.searchParams.get('month') // YYYY-MM

    let filtered = [...calendarEvents]
    if (type) filtered = filtered.filter((e) => e.type === type)
    if (month) {
      filtered = filtered.filter((e) => {
        const start = e.startDate.substring(0, 7)
        const end = e.endDate.substring(0, 7)
        return start <= month && end >= month
      })
    }

    filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  http.post('/api/settings/calendar', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Record<string, unknown>

    const newEvent: CalendarEvent = {
      id: `ce-${Date.now()}`,
      title: body.title as string,
      description: body.description as string || '',
      type: body.type as CalendarEvent['type'],
      startDate: body.startDate as string,
      endDate: body.endDate as string,
      isRecurring: body.isRecurring as boolean || false,
      appliesToClasses: body.appliesToClasses as string[] || [],
      createdAt: new Date().toISOString(),
    }

    calendarEvents.push(newEvent)
    return HttpResponse.json({ data: newEvent }, { status: 201 })
  }),

  http.put('/api/settings/calendar/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = calendarEvents.findIndex((e) => e.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const body = await request.json() as Partial<CalendarEvent>
    calendarEvents[index] = { ...calendarEvents[index], ...body }
    return HttpResponse.json({ data: calendarEvents[index] })
  }),

  http.delete('/api/settings/calendar/:id', async ({ params }) => {
    await mockDelay('read')
    const index = calendarEvents.findIndex((e) => e.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    calendarEvents.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== EMAIL TEMPLATES ====================

  http.get('/api/settings/email-templates', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const category = url.searchParams.get('category')

    let filtered = [...emailTemplates]
    if (category) filtered = filtered.filter((t) => t.category === category)

    return HttpResponse.json({ data: filtered })
  }),

  http.get('/api/settings/email-templates/:id', async ({ params }) => {
    await mockDelay('read')
    const template = emailTemplates.find((t) => t.id === params.id)
    if (!template) {
      return HttpResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: template })
  }),

  http.post('/api/settings/email-templates', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Record<string, unknown>

    // Extract variables from body using {{...}} pattern
    const bodyText = (body.body as string) || ''
    const subjectText = (body.subject as string) || ''
    const combinedText = bodyText + subjectText
    const variableMatches = combinedText.match(/\{\{(\w+)\}\}/g) || []
    const variables = [...new Set(variableMatches.map((m: string) => m.replace(/\{\{|\}\}/g, '')))]

    const newTemplate: EmailTemplate = {
      id: `et-${Date.now()}`,
      name: body.name as string,
      subject: subjectText,
      body: bodyText,
      category: body.category as EmailTemplate['category'],
      variables,
      isActive: true,
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    emailTemplates.push(newTemplate)
    return HttpResponse.json({ data: newTemplate }, { status: 201 })
  }),

  http.put('/api/settings/email-templates/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = emailTemplates.findIndex((t) => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    const body = await request.json() as Partial<EmailTemplate>

    // Re-extract variables if body or subject changed
    if (body.body || body.subject) {
      const bodyText = body.body || emailTemplates[index].body
      const subjectText = body.subject || emailTemplates[index].subject
      const combinedText = bodyText + subjectText
      const variableMatches = combinedText.match(/\{\{(\w+)\}\}/g) || []
      body.variables = [...new Set(variableMatches.map((m: string) => m.replace(/\{\{|\}\}/g, '')))]
    }

    emailTemplates[index] = { ...emailTemplates[index], ...body, lastModified: new Date().toISOString() }
    return HttpResponse.json({ data: emailTemplates[index] })
  }),

  http.delete('/api/settings/email-templates/:id', async ({ params }) => {
    await mockDelay('read')
    const index = emailTemplates.findIndex((t) => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    emailTemplates.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),
]
