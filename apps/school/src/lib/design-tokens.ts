/**
 * Design Token Constants
 *
 * Centralized color token references for the Paperbook design system.
 * These reference CSS variables defined in src/styles/globals.css.
 *
 * Usage:
 * - Import specific tokens: import { statusColors, moduleColors } from '@/lib/design-tokens'
 * - Use in inline styles: style={{ color: statusColors.success }}
 * - Use in component configs: fill={chartColors[0]}
 */

// ============================================
// Status Colors
// ============================================
export const statusColors = {
  success: 'var(--color-status-success)',
  successLight: 'var(--color-status-success-light)',
  warning: 'var(--color-status-warning)',
  warningLight: 'var(--color-status-warning-light)',
  error: 'var(--color-status-error)',
  errorLight: 'var(--color-status-error-light)',
  info: 'var(--color-status-info)',
  infoLight: 'var(--color-status-info-light)',
  pending: 'var(--color-status-pending)',
  pendingLight: 'var(--color-status-pending-light)',
  maintenance: 'var(--color-status-maintenance)',
  maintenanceLight: 'var(--color-status-maintenance-light)',
  overdue: 'var(--color-status-overdue)',
  overdueLight: 'var(--color-status-overdue-light)',
  inactive: 'var(--color-status-inactive)',
  inactiveLight: 'var(--color-status-inactive-light)',
} as const

// ============================================
// Module Colors
// ============================================
export const moduleColors = {
  academic: 'var(--color-module-academic)',
  academicLight: 'var(--color-module-academic-light)',
  students: 'var(--color-module-students)',
  studentsLight: 'var(--color-module-students-light)',
  staff: 'var(--color-module-staff)',
  staffLight: 'var(--color-module-staff-light)',
  admissions: 'var(--color-module-admissions)',
  admissionsLight: 'var(--color-module-admissions-light)',
  finance: 'var(--color-module-finance)',
  financeLight: 'var(--color-module-finance-light)',
  attendance: 'var(--color-module-attendance)',
  attendanceLight: 'var(--color-module-attendance-light)',
  lms: 'var(--color-module-lms)',
  lmsLight: 'var(--color-module-lms-light)',
  library: 'var(--color-module-library)',
  libraryLight: 'var(--color-module-library-light)',
  operations: 'var(--color-module-operations)',
  operationsLight: 'var(--color-module-operations-light)',
  exams: 'var(--color-module-exams)',
  examsLight: 'var(--color-module-exams-light)',
  transport: 'var(--color-module-transport)',
  transportLight: 'var(--color-module-transport-light)',
  behavior: 'var(--color-module-behavior)',
  behaviorLight: 'var(--color-module-behavior-light)',
  communication: 'var(--color-module-communication)',
  communicationLight: 'var(--color-module-communication-light)',
  reports: 'var(--color-module-reports)',
  reportsLight: 'var(--color-module-reports-light)',
  parentPortal: 'var(--color-module-parent-portal)',
  parentPortalLight: 'var(--color-module-parent-portal-light)',
  hostel: 'var(--color-module-hostel)',
  hostelLight: 'var(--color-module-hostel-light)',
  inventory: 'var(--color-module-inventory)',
  inventoryLight: 'var(--color-module-inventory-light)',
  alumni: 'var(--color-module-alumni)',
  alumniLight: 'var(--color-module-alumni-light)',
  documents: 'var(--color-module-documents)',
  documentsLight: 'var(--color-module-documents-light)',
  settings: 'var(--color-module-settings)',
  settingsLight: 'var(--color-module-settings-light)',
  visitors: 'var(--color-module-visitors)',
  visitorsLight: 'var(--color-module-visitors-light)',
  integrations: 'var(--color-module-integrations)',
  integrationsLight: 'var(--color-module-integrations-light)',
  timetable: 'var(--color-module-timetable)',
  timetableLight: 'var(--color-module-timetable-light)',
  management: 'var(--color-module-management)',
  managementLight: 'var(--color-module-management-light)',
  dashboard: 'var(--color-module-dashboard)',
  dashboardLight: 'var(--color-module-dashboard-light)',
  people: 'var(--color-module-people)',
  peopleLight: 'var(--color-module-people-light)',
} as const

// ============================================
// Chart Colors
// ============================================
export const chartColors = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
  'var(--color-chart-7)',
  'var(--color-chart-8)',
] as const

// ============================================
// Grade Colors
// ============================================
export const gradeColors = {
  'A+': statusColors.success,
  A: statusColors.success,
  'A-': statusColors.success,
  'B+': statusColors.info,
  B: statusColors.info,
  'B-': statusColors.info,
  'C+': statusColors.warning,
  C: statusColors.warning,
  'C-': statusColors.warning,
  D: statusColors.pending,
  F: statusColors.error,
} as const

/**
 * Get grade color for a given grade string
 * @param grade - The grade string (e.g., 'A', 'B+', 'C', 'D', 'F')
 * @returns CSS variable for the grade color
 */
export function getGradeColor(grade: string): string {
  // Handle exact matches first
  if (grade in gradeColors) {
    return gradeColors[grade as keyof typeof gradeColors]
  }

  // Handle prefix matches
  if (grade.startsWith('A')) return statusColors.success
  if (grade.startsWith('B')) return statusColors.info
  if (grade.startsWith('C')) return statusColors.warning
  if (grade === 'D') return statusColors.pending
  return statusColors.error
}

// ============================================
// MetricCard Variant Styles
// ============================================
export const metricCardVariants = {
  amber: {
    bg: 'var(--color-status-warning-light)',
    border: 'var(--color-status-warning)',
    text: 'var(--color-status-warning)',
    iconBg: 'var(--color-status-warning)',
  },
  rose: {
    bg: 'var(--color-status-error-light)',
    border: 'var(--color-status-error)',
    text: 'var(--color-status-error)',
    iconBg: 'var(--color-status-error)',
  },
  green: {
    bg: 'var(--color-status-success-light)',
    border: 'var(--color-status-success)',
    text: 'var(--color-status-success)',
    iconBg: 'var(--color-status-success)',
  },
  blue: {
    bg: 'var(--color-status-info-light)',
    border: 'var(--color-status-info)',
    text: 'var(--color-status-info)',
    iconBg: 'var(--color-status-info)',
  },
  purple: {
    bg: 'var(--color-primary-light)',
    border: 'var(--color-primary)',
    text: 'var(--color-primary)',
    iconBg: 'var(--color-primary)',
  },
} as const

// ============================================
// Quick Stats Icon Colors (Dashboard)
// ============================================
export const quickStatColors = {
  birthdays: moduleColors.parentPortal,
  leaveRequests: moduleColors.finance,
  overdueBooks: statusColors.error,
  exams: moduleColors.students,
} as const

// ============================================
// Trend Indicator Colors
// ============================================
export const trendColors = {
  up: statusColors.success,
  down: statusColors.error,
} as const

// ============================================
// Detention Status Config
// ============================================
export const detentionStatusColors = {
  scheduled: {
    backgroundColor: 'var(--color-status-info-light)',
    color: 'var(--color-status-info)',
  },
  attended: {
    backgroundColor: 'var(--color-status-success-light)',
    color: 'var(--color-status-success)',
  },
  missed: {
    backgroundColor: 'var(--color-status-error-light)',
    color: 'var(--color-status-error)',
  },
  excused: {
    backgroundColor: 'var(--color-status-warning-light)',
    color: 'var(--color-status-warning)',
  },
  cancelled: {
    backgroundColor: 'var(--color-status-inactive-light)',
    color: 'var(--color-status-inactive)',
  },
} as const

// ============================================
// Finance Stats Icon Box Styles
// ============================================
export const financeStatColors = {
  collected: {
    bg: 'var(--color-status-success-light)',
    icon: 'var(--color-status-success)',
  },
  pending: {
    bg: 'var(--color-status-error-light)',
    icon: 'var(--color-status-error)',
  },
  thisMonth: {
    bg: 'var(--color-status-info-light)',
    icon: 'var(--color-status-info)',
  },
  expenses: {
    bg: 'var(--color-status-warning-light)',
    icon: 'var(--color-status-warning)',
  },
  overdue: {
    bg: 'var(--color-module-students-light)',
    icon: 'var(--color-module-students)',
  },
} as const

// ============================================
// Timeline Event Colors
// ============================================
export const timelineColors = {
  feePaid: statusColors.success,
  feePaidLight: statusColors.successLight,
  attendanceMarked: statusColors.info,
  attendanceMarkedLight: statusColors.infoLight,
  bookIssued: moduleColors.library,
  bookIssuedLight: moduleColors.libraryLight,
  examScheduled: moduleColors.exams,
  examScheduledLight: moduleColors.examsLight,
  behaviorIncident: moduleColors.behavior,
  behaviorIncidentLight: moduleColors.behaviorLight,
  documentUploaded: moduleColors.documents,
  documentUploadedLight: moduleColors.documentsLight,
  gradeUpdated: moduleColors.academic,
  gradeUpdatedLight: moduleColors.academicLight,
  default: statusColors.info,
  defaultLight: statusColors.infoLight,
} as const

// ============================================
// Medal/Rank Colors
// ============================================
export const medalColors = {
  gold: 'var(--color-saffron)',
  goldLight: 'var(--color-status-warning-light)',
  silver: statusColors.inactive,
  silverLight: statusColors.inactiveLight,
  bronze: moduleColors.behavior,
  bronzeLight: moduleColors.behaviorLight,
} as const

// ============================================
// Difficulty/Level Colors
// ============================================
export const difficultyColors = {
  easy: {
    bg: statusColors.successLight,
    text: statusColors.success,
  },
  medium: {
    bg: statusColors.warningLight,
    text: statusColors.warning,
  },
  hard: {
    bg: statusColors.errorLight,
    text: statusColors.error,
  },
} as const

// ============================================
// Live Class Status Colors
// ============================================
export const liveClassStatusColors = {
  scheduled: {
    bg: statusColors.infoLight,
    text: statusColors.info,
  },
  live: {
    bg: statusColors.successLight,
    text: statusColors.success,
  },
  completed: {
    bg: statusColors.inactiveLight,
    text: statusColors.inactive,
  },
  cancelled: {
    bg: statusColors.errorLight,
    text: statusColors.error,
  },
} as const

// ============================================
// Subject/Course Colors (for Timetable)
// ============================================
export const subjectColors = {
  mathematics: {
    bg: moduleColors.examsLight,
    text: moduleColors.exams,
  },
  english: {
    bg: moduleColors.lmsLight,
    text: moduleColors.lms,
  },
  science: {
    bg: moduleColors.attendanceLight,
    text: moduleColors.attendance,
  },
  history: {
    bg: moduleColors.financeLight,
    text: moduleColors.finance,
  },
  geography: {
    bg: moduleColors.libraryLight,
    text: moduleColors.library,
  },
  physics: {
    bg: moduleColors.communicationLight,
    text: moduleColors.communication,
  },
  chemistry: {
    bg: moduleColors.behaviorLight,
    text: moduleColors.behavior,
  },
  biology: {
    bg: moduleColors.alumniLight,
    text: moduleColors.alumni,
  },
  computerScience: {
    bg: moduleColors.integrationsLight,
    text: moduleColors.integrations,
  },
  art: {
    bg: moduleColors.parentPortalLight,
    text: moduleColors.parentPortal,
  },
  music: {
    bg: moduleColors.visitorsLight,
    text: moduleColors.visitors,
  },
  physicalEducation: {
    bg: moduleColors.transportLight,
    text: moduleColors.transport,
  },
  default: {
    bg: moduleColors.academicLight,
    text: moduleColors.academic,
  },
} as const

/**
 * Get subject colors by subject name (case-insensitive fuzzy match)
 */
export function getSubjectColors(subject: string): { bg: string; text: string } {
  const normalized = subject.toLowerCase().replace(/[^a-z]/g, '')

  if (normalized.includes('math')) return subjectColors.mathematics
  if (normalized.includes('english') || normalized.includes('language')) return subjectColors.english
  if (normalized.includes('science') && !normalized.includes('computer')) return subjectColors.science
  if (normalized.includes('history') || normalized.includes('social')) return subjectColors.history
  if (normalized.includes('geography') || normalized.includes('geo')) return subjectColors.geography
  if (normalized.includes('physics')) return subjectColors.physics
  if (normalized.includes('chemistry') || normalized.includes('chem')) return subjectColors.chemistry
  if (normalized.includes('biology') || normalized.includes('bio')) return subjectColors.biology
  if (normalized.includes('computer') || normalized.includes('cs') || normalized.includes('programming')) return subjectColors.computerScience
  if (normalized.includes('art') || normalized.includes('drawing')) return subjectColors.art
  if (normalized.includes('music')) return subjectColors.music
  if (normalized.includes('pe') || normalized.includes('physical') || normalized.includes('sports')) return subjectColors.physicalEducation

  return subjectColors.default
}

// ============================================
// Star Rating Color
// ============================================
export const ratingColors = {
  star: 'var(--color-saffron)',
  starEmpty: statusColors.inactive,
} as const

// ============================================
// Concession Status Colors
// ============================================
export const concessionStatusColors = {
  active: {
    bg: statusColors.successLight,
    text: statusColors.success,
  },
  approved: {
    bg: statusColors.successLight,
    text: statusColors.success,
  },
  pending: {
    bg: statusColors.warningLight,
    text: statusColors.warning,
  },
  expired: {
    bg: statusColors.errorLight,
    text: statusColors.error,
  },
  rejected: {
    bg: statusColors.inactiveLight,
    text: statusColors.inactive,
  },
} as const

// ============================================
// Course/LMS Status Colors
// ============================================
export const courseStatusColors = {
  published: {
    bg: statusColors.successLight,
    text: statusColors.success,
  },
  draft: {
    bg: statusColors.warningLight,
    text: statusColors.warning,
  },
  archived: {
    bg: statusColors.inactiveLight,
    text: statusColors.inactive,
  },
  notStarted: {
    bg: statusColors.infoLight,
    text: statusColors.info,
  },
  inProgress: {
    bg: statusColors.warningLight,
    text: statusColors.warning,
  },
  completed: {
    bg: statusColors.successLight,
    text: statusColors.success,
  },
} as const

// ============================================
// Substitution Status Colors
// ============================================
export const substitutionStatusColors = {
  pending: {
    bg: statusColors.warningLight,
    text: statusColors.warning,
  },
  approved: {
    bg: statusColors.successLight,
    text: statusColors.success,
  },
  rejected: {
    bg: statusColors.errorLight,
    text: statusColors.error,
  },
  completed: {
    bg: statusColors.inactiveLight,
    text: statusColors.inactive,
  },
} as const

// ============================================
// Communication Quick Action Colors
// ============================================
export const communicationActionColors = {
  sms: moduleColors.communication,
  email: moduleColors.reports,
  whatsapp: statusColors.success,
  notification: moduleColors.behavior,
} as const
