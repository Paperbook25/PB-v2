import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchClassAttendance,
  fetchStudentsForAttendance,
  markAttendance,
  fetchAttendanceHistory,
  fetchStudentAttendance,
  fetchMyAttendance,
  fetchMyChildrenAttendance,
  fetchAttendanceReport,
  fetchClassAttendanceSummary,
  fetchLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  fetchStudentLeaves,
  fetchPeriodDefinitions,
  fetchPeriodAttendance,
  markPeriodAttendance,
  fetchStudentPeriodSummary,
  fetchAttendanceThresholds,
  updateAttendanceThresholds,
  fetchAttendanceAlerts,
  acknowledgeAlert,
  fetchLatePolicy,
  updateLatePolicy,
  fetchLateRecords,
  fetchLatePatterns,
  fetchNotificationConfig,
  updateNotificationConfig,
  fetchNotificationHistory,
  fetchNotificationStats,
  sendTestNotification,
  fetchBiometricDevices,
  registerBiometricDevice,
  updateBiometricDevice,
  fetchBiometricSyncLogs,
  triggerBiometricSync,
} from '../api/attendance.api'
import type {
  MarkAttendanceRequest,
  AttendanceFilters,
  LeaveRequestCreate,
  LeaveRequestUpdate,
  PeriodNumber,
  MarkPeriodAttendanceRequest,
  UpdateThresholdRequest,
  UpdateLatePolicyRequest,
  UpdateNotificationConfigRequest,
  NotificationChannel,
  RegisterDeviceRequest,
  BiometricDevice,
} from '../types/attendance.types'

// ==================== QUERY KEYS ====================

export const attendanceKeys = {
  all: ['attendance'] as const,

  // Class attendance
  classAttendance: (date: string, className: string, section: string) =>
    [...attendanceKeys.all, 'class', date, className, section] as const,
  studentsForAttendance: (className: string, section: string, date: string) =>
    [...attendanceKeys.all, 'students', className, section, date] as const,

  // History
  history: (filters: AttendanceFilters) =>
    [...attendanceKeys.all, 'history', filters] as const,

  // Student attendance
  studentAttendance: (studentId: string, academicYear?: string) =>
    [...attendanceKeys.all, 'student', studentId, academicYear] as const,
  myAttendance: (academicYear?: string) =>
    [...attendanceKeys.all, 'my', academicYear] as const,
  myChildrenAttendance: (academicYear?: string) =>
    [...attendanceKeys.all, 'my-children', academicYear] as const,

  // Reports
  report: (className: string, section: string, startDate: string, endDate: string) =>
    [...attendanceKeys.all, 'report', className, section, startDate, endDate] as const,
  summary: (className: string, section: string, month: string, year: string) =>
    [...attendanceKeys.all, 'summary', className, section, month, year] as const,

  // Leaves
  leaves: (filters?: { status?: string; className?: string; section?: string }) =>
    [...attendanceKeys.all, 'leaves', filters] as const,
  studentLeaves: (studentId: string) =>
    [...attendanceKeys.all, 'student-leaves', studentId] as const,

  // Period-wise
  periodDefinitions: (className: string, section: string) =>
    [...attendanceKeys.all, 'period-definitions', className, section] as const,
  periodAttendance: (date: string, className: string, section: string, period: PeriodNumber) =>
    [...attendanceKeys.all, 'period', date, className, section, period] as const,
  periodSummary: (className: string, section: string) =>
    [...attendanceKeys.all, 'period-summary', className, section] as const,

  // Shortage alerts
  thresholds: () => [...attendanceKeys.all, 'thresholds'] as const,
  alerts: (filters?: { severity?: string; type?: string }) =>
    [...attendanceKeys.all, 'alerts', filters] as const,

  // Late detection
  latePolicy: () => [...attendanceKeys.all, 'late-policy'] as const,
  lateRecords: (filters?: { className?: string; date?: string }) =>
    [...attendanceKeys.all, 'late-records', filters] as const,
  latePatterns: () => [...attendanceKeys.all, 'late-patterns'] as const,

  // Notifications
  notificationConfig: () => [...attendanceKeys.all, 'notification-config'] as const,
  notificationHistory: (filters?: { channel?: string; eventType?: string }) =>
    [...attendanceKeys.all, 'notification-history', filters] as const,
  notificationStats: () => [...attendanceKeys.all, 'notification-stats'] as const,

  // Biometric
  biometricDevices: () => [...attendanceKeys.all, 'biometric-devices'] as const,
  biometricSyncLogs: (deviceId?: string) =>
    [...attendanceKeys.all, 'biometric-sync-logs', deviceId] as const,
}

// ==================== ATTENDANCE HOOKS ====================

export function useClassAttendance(date: string, className: string, section: string) {
  return useQuery({
    queryKey: attendanceKeys.classAttendance(date, className, section),
    queryFn: () => fetchClassAttendance(date, className, section),
    enabled: !!date && !!className && !!section,
  })
}

export function useStudentsForAttendance(className: string, section: string, date: string) {
  return useQuery({
    queryKey: attendanceKeys.studentsForAttendance(className, section, date),
    queryFn: () => fetchStudentsForAttendance(className, section, date),
    enabled: !!className && !!section && !!date,
  })
}

export function useMarkAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MarkAttendanceRequest) => markAttendance(data),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.classAttendance(
          variables.date,
          variables.className,
          variables.section
        ),
      })
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.studentsForAttendance(
          variables.className,
          variables.section,
          variables.date
        ),
      })
    },
  })
}

export function useAttendanceHistory(filters: AttendanceFilters) {
  return useQuery({
    queryKey: attendanceKeys.history(filters),
    queryFn: () => fetchAttendanceHistory(filters),
  })
}

// ==================== STUDENT ATTENDANCE HOOKS ====================

export function useStudentAttendance(studentId: string, academicYear?: string) {
  return useQuery({
    queryKey: attendanceKeys.studentAttendance(studentId, academicYear),
    queryFn: () => fetchStudentAttendance(studentId, academicYear),
    enabled: !!studentId,
  })
}

export function useMyAttendance(academicYear?: string) {
  return useQuery({
    queryKey: attendanceKeys.myAttendance(academicYear),
    queryFn: () => fetchMyAttendance(academicYear),
  })
}

export function useMyChildrenAttendance(academicYear?: string) {
  return useQuery({
    queryKey: attendanceKeys.myChildrenAttendance(academicYear),
    queryFn: () => fetchMyChildrenAttendance(academicYear),
  })
}

// ==================== REPORT HOOKS ====================

export function useAttendanceReport(
  className: string,
  section: string,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: attendanceKeys.report(className, section, startDate, endDate),
    queryFn: () => fetchAttendanceReport(className, section, startDate, endDate),
    enabled: !!className && !!section && !!startDate && !!endDate,
  })
}

export function useClassAttendanceSummary(
  className: string,
  section: string,
  month: string,
  year: string
) {
  return useQuery({
    queryKey: attendanceKeys.summary(className, section, month, year),
    queryFn: () => fetchClassAttendanceSummary(className, section, month, year),
    enabled: !!className && !!section && !!month && !!year,
  })
}

// ==================== LEAVE HOOKS ====================

export function useLeaveRequests(filters?: {
  status?: string
  className?: string
  section?: string
}) {
  return useQuery({
    queryKey: attendanceKeys.leaves(filters),
    queryFn: () => fetchLeaveRequests(filters),
  })
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LeaveRequestCreate) => createLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'leaves'] })
    },
  })
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeaveRequestUpdate }) =>
      updateLeaveRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'leaves'] })
    },
  })
}

export function useStudentLeaves(studentId: string) {
  return useQuery({
    queryKey: attendanceKeys.studentLeaves(studentId),
    queryFn: () => fetchStudentLeaves(studentId),
    enabled: !!studentId,
  })
}

// ==================== PERIOD-WISE ATTENDANCE HOOKS ====================

export function usePeriodDefinitions(className: string, section: string) {
  return useQuery({
    queryKey: attendanceKeys.periodDefinitions(className, section),
    queryFn: () => fetchPeriodDefinitions(className, section),
    enabled: !!className && !!section,
  })
}

export function usePeriodAttendance(
  date: string,
  className: string,
  section: string,
  period: PeriodNumber
) {
  return useQuery({
    queryKey: attendanceKeys.periodAttendance(date, className, section, period),
    queryFn: () => fetchPeriodAttendance(date, className, section, period),
    enabled: !!date && !!className && !!section && !!period,
  })
}

export function useMarkPeriodAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MarkPeriodAttendanceRequest) => markPeriodAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'period'] })
    },
  })
}

export function useStudentPeriodSummary(className: string, section: string) {
  return useQuery({
    queryKey: attendanceKeys.periodSummary(className, section),
    queryFn: () => fetchStudentPeriodSummary(className, section),
    enabled: !!className && !!section,
  })
}

// ==================== SHORTAGE ALERTS HOOKS ====================

export function useAttendanceThresholds() {
  return useQuery({
    queryKey: attendanceKeys.thresholds(),
    queryFn: fetchAttendanceThresholds,
  })
}

export function useUpdateAttendanceThresholds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateThresholdRequest) => updateAttendanceThresholds(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.thresholds() })
    },
  })
}

export function useAttendanceAlerts(filters?: { severity?: string; type?: string }) {
  return useQuery({
    queryKey: attendanceKeys.alerts(filters),
    queryFn: () => fetchAttendanceAlerts(filters),
  })
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => acknowledgeAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'alerts'] })
    },
  })
}

// ==================== LATE DETECTION HOOKS ====================

export function useLatePolicy() {
  return useQuery({
    queryKey: attendanceKeys.latePolicy(),
    queryFn: fetchLatePolicy,
  })
}

export function useUpdateLatePolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateLatePolicyRequest) => updateLatePolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.latePolicy() })
    },
  })
}

export function useLateRecords(filters?: { className?: string; date?: string }) {
  return useQuery({
    queryKey: attendanceKeys.lateRecords(filters),
    queryFn: () => fetchLateRecords(filters),
  })
}

export function useLatePatterns() {
  return useQuery({
    queryKey: attendanceKeys.latePatterns(),
    queryFn: fetchLatePatterns,
  })
}

// ==================== NOTIFICATION HOOKS ====================

export function useNotificationConfig() {
  return useQuery({
    queryKey: attendanceKeys.notificationConfig(),
    queryFn: fetchNotificationConfig,
  })
}

export function useUpdateNotificationConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ channel, data }: { channel: NotificationChannel; data: UpdateNotificationConfigRequest }) =>
      updateNotificationConfig(channel, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.notificationConfig() })
    },
  })
}

export function useNotificationHistory(filters?: { channel?: string; eventType?: string }) {
  return useQuery({
    queryKey: attendanceKeys.notificationHistory(filters),
    queryFn: () => fetchNotificationHistory(filters),
  })
}

export function useNotificationStats() {
  return useQuery({
    queryKey: attendanceKeys.notificationStats(),
    queryFn: fetchNotificationStats,
  })
}

export function useSendTestNotification() {
  return useMutation({
    mutationFn: ({ channel, recipient }: { channel: NotificationChannel; recipient: string }) =>
      sendTestNotification(channel, recipient),
  })
}

// ==================== BIOMETRIC DEVICE HOOKS ====================

export function useBiometricDevices() {
  return useQuery({
    queryKey: attendanceKeys.biometricDevices(),
    queryFn: fetchBiometricDevices,
  })
}

export function useRegisterBiometricDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterDeviceRequest) => registerBiometricDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.biometricDevices() })
    },
  })
}

export function useUpdateBiometricDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BiometricDevice> }) =>
      updateBiometricDevice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.biometricDevices() })
    },
  })
}

export function useBiometricSyncLogs(deviceId?: string) {
  return useQuery({
    queryKey: attendanceKeys.biometricSyncLogs(deviceId),
    queryFn: () => fetchBiometricSyncLogs(deviceId),
  })
}

export function useTriggerBiometricSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (deviceId: string) => triggerBiometricSync(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'biometric-devices'] })
      queryClient.invalidateQueries({ queryKey: ['attendance', 'biometric-sync-logs'] })
    },
  })
}
