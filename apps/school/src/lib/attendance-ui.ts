/**
 * Unified Attendance UI System
 * Provides consistent colors and badge variants across all attendance modules:
 * - Student Day Attendance
 * - Period-wise Attendance
 * - Staff Attendance
 * - Hostel Attendance
 */

export const ATTENDANCE_COLORS = {
  present: {
    border: 'border-l-green-500',
    bgSolid: 'bg-green-500',
    text: 'text-green-600 dark:text-green-200',
    bgLight: 'bg-green-100',
    bgDark: 'dark:bg-green-800',
  },
  absent: {
    border: 'border-l-red-500',
    bgSolid: 'bg-red-500',
    text: 'text-red-600 dark:text-red-200',
    bgLight: 'bg-red-100',
    bgDark: 'dark:bg-red-800',
  },
  late: {
    border: 'border-l-orange-500',
    bgSolid: 'bg-orange-500',
    text: 'text-orange-600 dark:text-orange-200',
    bgLight: 'bg-orange-100',
    bgDark: 'dark:bg-orange-800',
  },
  half_day: {
    border: 'border-l-yellow-500',
    bgSolid: 'bg-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-200',
    bgLight: 'bg-yellow-100',
    bgDark: 'dark:bg-yellow-800',
  },
  excused: {
    border: 'border-l-blue-500',
    bgSolid: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-200',
    bgLight: 'bg-blue-100',
    bgDark: 'dark:bg-blue-800',
  },
  // Aliases for module-specific status names
  on_leave: {
    border: 'border-l-blue-500',
    bgSolid: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-200',
    bgLight: 'bg-blue-100',
    bgDark: 'dark:bg-blue-800',
  },
  leave: {
    border: 'border-l-blue-500',
    bgSolid: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-200',
    bgLight: 'bg-blue-100',
    bgDark: 'dark:bg-blue-800',
  },
} as const

export type AttendanceColorStatus = keyof typeof ATTENDANCE_COLORS

export const ATTENDANCE_BADGE_VARIANT = {
  present: 'success',
  absent: 'destructive',
  late: 'warning',
  half_day: 'secondary',
  excused: 'outline',
  on_leave: 'outline',
  leave: 'outline',
} as const

export type AttendanceBadgeVariant = (typeof ATTENDANCE_BADGE_VARIANT)[keyof typeof ATTENDANCE_BADGE_VARIANT]

/**
 * Get the border color class for a given attendance status
 */
export function getAttendanceBorderColor(status: string): string {
  const colors = ATTENDANCE_COLORS[status as AttendanceColorStatus]
  return colors?.border ?? 'border-l-gray-300'
}

/**
 * Get the badge variant for a given attendance status
 */
export function getAttendanceBadgeVariant(
  status: string
): 'success' | 'destructive' | 'warning' | 'secondary' | 'outline' {
  const variant = ATTENDANCE_BADGE_VARIANT[status as keyof typeof ATTENDANCE_BADGE_VARIANT]
  return variant ?? 'secondary'
}

/**
 * Get the text color class for a given attendance status
 */
export function getAttendanceTextColor(status: string): string {
  const colors = ATTENDANCE_COLORS[status as AttendanceColorStatus]
  return colors?.text ?? 'text-gray-600'
}

/**
 * Get the solid background color class for a given attendance status
 */
export function getAttendanceBgSolid(status: string): string {
  const colors = ATTENDANCE_COLORS[status as AttendanceColorStatus]
  return colors?.bgSolid ?? 'bg-gray-500'
}
