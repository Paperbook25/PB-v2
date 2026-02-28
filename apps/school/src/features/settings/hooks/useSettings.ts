import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchSchoolProfile,
  updateSchoolProfile,
  fetchAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  setCurrentAcademicYear,
  fetchClasses,
  createClass,
  updateClass,
  deleteClass,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  fetchNotificationPreferences,
  updateNotificationPreferences,
  fetchBackupConfig,
  updateBackupConfig,
  triggerBackup,
  fetchThemeConfig,
  updateThemeConfig,
  fetchAuditLogs,
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  fetchEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from '../api/settings.api'
import type {
  UpdateSchoolProfileRequest,
  CreateAcademicYearRequest,
  UpdateAcademicYearRequest,
  CreateClassSectionRequest,
  UpdateClassSectionRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateNotificationPreferencesRequest,
  UpdateBackupConfigRequest,
  UpdateThemeConfigRequest,
  CreateCalendarEventRequest,
  CalendarEvent,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
} from '../types/settings.types'

// ==================== QUERY KEYS ====================

export const settingsKeys = {
  all: ['settings'] as const,
  schoolProfile: () => [...settingsKeys.all, 'school-profile'] as const,
  academicYears: () => [...settingsKeys.all, 'academic-years'] as const,
  classes: () => [...settingsKeys.all, 'classes'] as const,
  users: () => [...settingsKeys.all, 'users'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
  backup: () => [...settingsKeys.all, 'backup'] as const,
  theme: () => [...settingsKeys.all, 'theme'] as const,
  auditLog: (params?: Record<string, string>) => [...settingsKeys.all, 'audit-log', params] as const,
  calendar: (params?: Record<string, string>) => [...settingsKeys.all, 'calendar', params] as const,
  emailTemplates: (params?: Record<string, string>) => [...settingsKeys.all, 'email-templates', params] as const,
}

// ==================== SCHOOL PROFILE ====================

export function useSchoolProfile() {
  return useQuery({
    queryKey: settingsKeys.schoolProfile(),
    queryFn: fetchSchoolProfile,
  })
}

export function useUpdateSchoolProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSchoolProfileRequest) => updateSchoolProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.schoolProfile() })
    },
  })
}

// ==================== ACADEMIC YEARS ====================

export function useAcademicYears() {
  return useQuery({
    queryKey: settingsKeys.academicYears(),
    queryFn: fetchAcademicYears,
  })
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAcademicYearRequest) => createAcademicYear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.academicYears() })
    },
  })
}

export function useUpdateAcademicYear() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAcademicYearRequest }) =>
      updateAcademicYear(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.academicYears() })
    },
  })
}

export function useDeleteAcademicYear() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.academicYears() })
    },
  })
}

export function useSetCurrentAcademicYear() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => setCurrentAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.academicYears() })
    },
  })
}

// ==================== CLASSES ====================

export function useClasses() {
  return useQuery({
    queryKey: settingsKeys.classes(),
    queryFn: fetchClasses,
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClassSectionRequest) => createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.classes() })
    },
  })
}

export function useUpdateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassSectionRequest }) =>
      updateClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.classes() })
    },
  })
}

export function useDeleteClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.classes() })
    },
  })
}

// ==================== USERS ====================

export function useUsers() {
  return useQuery({
    queryKey: settingsKeys.users(),
    queryFn: fetchUsers,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.users() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.users() })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.users() })
    },
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.users() })
    },
  })
}

// ==================== NOTIFICATIONS ====================

export function useNotificationPreferences() {
  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: fetchNotificationPreferences,
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateNotificationPreferencesRequest) => updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() })
    },
  })
}

// ==================== BACKUP ====================

export function useBackupConfig() {
  return useQuery({
    queryKey: settingsKeys.backup(),
    queryFn: fetchBackupConfig,
  })
}

export function useUpdateBackupConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateBackupConfigRequest) => updateBackupConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.backup() })
    },
  })
}

export function useTriggerBackup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => triggerBackup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.backup() })
    },
  })
}

// ==================== THEME ====================

export function useThemeConfig() {
  return useQuery({
    queryKey: settingsKeys.theme(),
    queryFn: fetchThemeConfig,
  })
}

export function useUpdateThemeConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateThemeConfigRequest) => updateThemeConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.theme() })
    },
  })
}

// ==================== AUDIT LOG ====================

export function useAuditLogs(params?: { module?: string; action?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: settingsKeys.auditLog(params as Record<string, string>),
    queryFn: () => fetchAuditLogs(params),
  })
}

// ==================== ACADEMIC CALENDAR ====================

export function useCalendarEvents(params?: { type?: string; month?: string }) {
  return useQuery({
    queryKey: settingsKeys.calendar(params as Record<string, string>),
    queryFn: () => fetchCalendarEvents(params),
  })
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCalendarEventRequest) => createCalendarEvent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.calendar() }),
  })
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CalendarEvent> }) => updateCalendarEvent(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.calendar() }),
  })
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCalendarEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.calendar() }),
  })
}

// ==================== EMAIL TEMPLATES ====================

export function useEmailTemplates(params?: { category?: string }) {
  return useQuery({
    queryKey: settingsKeys.emailTemplates(params as Record<string, string>),
    queryFn: () => fetchEmailTemplates(params),
  })
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEmailTemplateRequest) => createEmailTemplate(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.emailTemplates() }),
  })
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmailTemplateRequest }) => updateEmailTemplate(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.emailTemplates() }),
  })
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEmailTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.emailTemplates() }),
  })
}
