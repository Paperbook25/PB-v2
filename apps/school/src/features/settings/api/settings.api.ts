import type {
  SchoolProfile,
  UpdateSchoolProfileRequest,
  AcademicYear,
  CreateAcademicYearRequest,
  UpdateAcademicYearRequest,
  ClassSection,
  CreateClassSectionRequest,
  UpdateClassSectionRequest,
  SystemUser,
  CreateUserRequest,
  UpdateUserRequest,
  NotificationPreferences,
  UpdateNotificationPreferencesRequest,
  BackupConfig,
  UpdateBackupConfigRequest,
  ThemeConfig,
  UpdateThemeConfigRequest,
  AuditLogEntry,
  CalendarEvent,
  CreateCalendarEventRequest,
  EmailTemplate,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  // Multi-campus
  Campus,
  CreateCampusRequest,
  UpdateCampusRequest,
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest,
  CampusConfig,
  UpdateCampusConfigRequest,
  // Data Retention
  RetentionPolicy,
  CreateRetentionPolicyRequest,
  UpdateRetentionPolicyRequest,
  RetentionSchedule,
  CreateRetentionScheduleRequest,
  UpdateRetentionScheduleRequest,
  // GDPR/Compliance
  ComplianceRule,
  GDPRRequest,
  CreateGDPRRequestRequest,
  UpdateGDPRRequestRequest,
  ConsentRecord,
  UpdateConsentRequest,
  // System Health
  SystemHealth,
  SystemAlert,
  AcknowledgeAlertRequest,
  ResolveAlertRequest,
  // Feature Flags
  FeatureFlag,
  CreateFeatureFlagRequest,
  UpdateFeatureFlagRequest,
  FlagCondition,
  CreateFlagConditionRequest,
  FlagOverride,
  CreateFlagOverrideRequest,
  EvaluateFlagRequest,
  EvaluateFlagResponse,
} from '../types/settings.types'

const API_BASE = '/api/settings'

// ==================== SCHOOL PROFILE ====================

export async function fetchSchoolProfile(): Promise<{ data: SchoolProfile }> {
  const response = await fetch(`${API_BASE}/school-profile`)
  if (!response.ok) {
    throw new Error('Failed to fetch school profile')
  }
  return response.json()
}

export async function updateSchoolProfile(
  data: UpdateSchoolProfileRequest
): Promise<{ data: SchoolProfile }> {
  const response = await fetch(`${API_BASE}/school-profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update school profile')
  }
  return response.json()
}

// ==================== ACADEMIC YEARS ====================

export async function fetchAcademicYears(): Promise<{ data: AcademicYear[] }> {
  const response = await fetch(`${API_BASE}/academic-years`)
  if (!response.ok) {
    throw new Error('Failed to fetch academic years')
  }
  return response.json()
}

export async function createAcademicYear(
  data: CreateAcademicYearRequest
): Promise<{ data: AcademicYear }> {
  const response = await fetch(`${API_BASE}/academic-years`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to create academic year')
  }
  return response.json()
}

export async function updateAcademicYear(
  id: string,
  data: UpdateAcademicYearRequest
): Promise<{ data: AcademicYear }> {
  const response = await fetch(`${API_BASE}/academic-years/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update academic year')
  }
  return response.json()
}

export async function deleteAcademicYear(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/academic-years/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete academic year')
  }
  return response.json()
}

export async function setCurrentAcademicYear(id: string): Promise<{ data: AcademicYear }> {
  const response = await fetch(`${API_BASE}/academic-years/${id}/set-current`, {
    method: 'PATCH',
  })
  if (!response.ok) {
    throw new Error('Failed to set current academic year')
  }
  return response.json()
}

// ==================== CLASSES ====================

export async function fetchClasses(): Promise<{ data: ClassSection[] }> {
  const response = await fetch(`${API_BASE}/classes`)
  if (!response.ok) {
    throw new Error('Failed to fetch classes')
  }
  return response.json()
}

export async function createClass(
  data: CreateClassSectionRequest
): Promise<{ data: ClassSection }> {
  const response = await fetch(`${API_BASE}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to create class')
  }
  return response.json()
}

export async function updateClass(
  id: string,
  data: UpdateClassSectionRequest
): Promise<{ data: ClassSection }> {
  const response = await fetch(`${API_BASE}/classes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update class')
  }
  return response.json()
}

export async function deleteClass(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/classes/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete class')
  }
  return response.json()
}

// ==================== USERS ====================

export async function fetchUsers(): Promise<{ data: SystemUser[] }> {
  const response = await fetch(`${API_BASE}/users`)
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return response.json()
}

export async function createUser(data: CreateUserRequest): Promise<{ data: SystemUser }> {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create user')
  }
  return response.json()
}

export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<{ data: SystemUser }> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update user')
  }
  return response.json()
}

export async function deleteUser(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete user')
  }
  return response.json()
}

export async function toggleUserStatus(id: string): Promise<{ data: SystemUser }> {
  const response = await fetch(`${API_BASE}/users/${id}/toggle-status`, {
    method: 'PATCH',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to toggle user status')
  }
  return response.json()
}

// ==================== NOTIFICATIONS ====================

export async function fetchNotificationPreferences(): Promise<{ data: NotificationPreferences }> {
  const response = await fetch(`${API_BASE}/notifications`)
  if (!response.ok) {
    throw new Error('Failed to fetch notification preferences')
  }
  return response.json()
}

export async function updateNotificationPreferences(
  data: UpdateNotificationPreferencesRequest
): Promise<{ data: NotificationPreferences }> {
  const response = await fetch(`${API_BASE}/notifications`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update notification preferences')
  }
  return response.json()
}

// ==================== BACKUP ====================

export async function fetchBackupConfig(): Promise<{ data: BackupConfig }> {
  const response = await fetch(`${API_BASE}/backup`)
  if (!response.ok) {
    throw new Error('Failed to fetch backup configuration')
  }
  return response.json()
}

export async function updateBackupConfig(
  data: UpdateBackupConfigRequest
): Promise<{ data: BackupConfig }> {
  const response = await fetch(`${API_BASE}/backup`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update backup configuration')
  }
  return response.json()
}

export async function triggerBackup(): Promise<{
  success: boolean
  message: string
  lastBackupAt: string
}> {
  const response = await fetch(`${API_BASE}/backup/trigger`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error('Failed to trigger backup')
  }
  return response.json()
}

// ==================== THEME ====================

export async function fetchThemeConfig(): Promise<{ data: ThemeConfig }> {
  const response = await fetch(`${API_BASE}/theme`)
  if (!response.ok) {
    throw new Error('Failed to fetch theme configuration')
  }
  return response.json()
}

export async function updateThemeConfig(
  data: UpdateThemeConfigRequest
): Promise<{ data: ThemeConfig }> {
  const response = await fetch(`${API_BASE}/theme`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update theme configuration')
  }
  return response.json()
}

// ==================== AUDIT LOG ====================

export async function fetchAuditLogs(params?: {
  module?: string
  action?: string
  search?: string
  page?: number
  limit?: number
}): Promise<{ data: AuditLogEntry[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
  const qs = new URLSearchParams()
  if (params?.module) qs.set('module', params.module)
  if (params?.action) qs.set('action', params.action)
  if (params?.search) qs.set('search', params.search)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  const response = await fetch(`${API_BASE}/audit-log?${qs}`)
  if (!response.ok) throw new Error('Failed to fetch audit logs')
  return response.json()
}

// ==================== ACADEMIC CALENDAR ====================

export async function fetchCalendarEvents(params?: {
  type?: string
  month?: string
}): Promise<{ data: CalendarEvent[] }> {
  const qs = new URLSearchParams()
  if (params?.type) qs.set('type', params.type)
  if (params?.month) qs.set('month', params.month)
  const response = await fetch(`${API_BASE}/calendar?${qs}`)
  if (!response.ok) throw new Error('Failed to fetch calendar events')
  return response.json()
}

export async function createCalendarEvent(
  data: CreateCalendarEventRequest
): Promise<{ data: CalendarEvent }> {
  const response = await fetch(`${API_BASE}/calendar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create calendar event')
  return response.json()
}

export async function updateCalendarEvent(
  id: string,
  data: Partial<CalendarEvent>
): Promise<{ data: CalendarEvent }> {
  const response = await fetch(`${API_BASE}/calendar/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update calendar event')
  return response.json()
}

export async function deleteCalendarEvent(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/calendar/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete calendar event')
  return response.json()
}

// ==================== EMAIL TEMPLATES ====================

export async function fetchEmailTemplates(params?: {
  category?: string
}): Promise<{ data: EmailTemplate[] }> {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  const response = await fetch(`${API_BASE}/email-templates?${qs}`)
  if (!response.ok) throw new Error('Failed to fetch email templates')
  return response.json()
}

export async function fetchEmailTemplate(id: string): Promise<{ data: EmailTemplate }> {
  const response = await fetch(`${API_BASE}/email-templates/${id}`)
  if (!response.ok) throw new Error('Failed to fetch email template')
  return response.json()
}

export async function createEmailTemplate(
  data: CreateEmailTemplateRequest
): Promise<{ data: EmailTemplate }> {
  const response = await fetch(`${API_BASE}/email-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create email template')
  return response.json()
}

export async function updateEmailTemplate(
  id: string,
  data: UpdateEmailTemplateRequest
): Promise<{ data: EmailTemplate }> {
  const response = await fetch(`${API_BASE}/email-templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update email template')
  return response.json()
}

export async function deleteEmailTemplate(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/email-templates/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete email template')
  return response.json()
}
