// ==================== COMPLAINT STATUS & PRIORITY ====================

export type ComplaintStatus =
  | 'submitted'
  | 'acknowledged'
  | 'in_progress'
  | 'pending_info'
  | 'escalated'
  | 'resolved'
  | 'closed'
  | 'reopened'

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical'

export type ComplaintCategory =
  | 'academic'
  | 'administrative'
  | 'facilities'
  | 'transport'
  | 'cafeteria'
  | 'safety'
  | 'bullying'
  | 'fees'
  | 'staff_behavior'
  | 'communication'
  | 'other'

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  submitted: 'Submitted',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  pending_info: 'Pending Information',
  escalated: 'Escalated',
  resolved: 'Resolved',
  closed: 'Closed',
  reopened: 'Reopened',
}

export const COMPLAINT_PRIORITY_LABELS: Record<ComplaintPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  academic: 'Academic Issues',
  administrative: 'Administrative',
  facilities: 'Facilities & Infrastructure',
  transport: 'Transport',
  cafeteria: 'Cafeteria',
  safety: 'Safety & Security',
  bullying: 'Bullying / Harassment',
  fees: 'Fees & Payments',
  staff_behavior: 'Staff Behavior',
  communication: 'Communication',
  other: 'Other',
}

// ==================== TICKET HISTORY & STATUS CHANGES ====================

export interface StatusChange {
  id: string
  complaintId: string
  fromStatus: ComplaintStatus
  toStatus: ComplaintStatus
  changedBy: string
  changedByName: string
  changedAt: string
  reason?: string
  notes?: string
}

export interface TicketHistory {
  id: string
  complaintId: string
  action:
    | 'created'
    | 'status_changed'
    | 'assigned'
    | 'reassigned'
    | 'escalated'
    | 'comment_added'
    | 'attachment_added'
    | 'priority_changed'
    | 'sla_breach'
    | 'resolved'
    | 'reopened'
    | 'closed'
  description: string
  performedBy: string
  performedByName: string
  performedAt: string
  metadata?: Record<string, unknown>
}

// ==================== SLA CONFIGURATION & TRACKING ====================

export interface SLAConfig {
  id: string
  category: ComplaintCategory
  priority: ComplaintPriority
  acknowledgeWithinHours: number
  resolveWithinHours: number
  escalateAfterHours: number
  autoEscalate: boolean
  escalateTo: string // Role or specific user ID
  notifyOnBreach: boolean
  notificationRecipients: string[] // User IDs or roles
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SLABreach {
  id: string
  complaintId: string
  ticketNumber: string
  breachType: 'acknowledgement' | 'resolution' | 'response'
  expectedBy: string // ISO datetime
  breachedAt: string // ISO datetime
  breachDurationHours: number
  assignedTo: string
  assignedToName: string
  escalatedTo?: string
  escalatedToName?: string
  status: 'open' | 'addressed' | 'excused'
  reason?: string
  addressedAt?: string
  addressedBy?: string
}

export interface SLAStatus {
  isAcknowledged: boolean
  isResolved: boolean
  acknowledgementDue: string
  resolutionDue: string
  acknowledgementBreached: boolean
  resolutionBreached: boolean
  hoursToAcknowledge: number
  hoursToResolve: number
  timeRemainingAcknowledge?: number // In hours, negative if breached
  timeRemainingResolve?: number // In hours, negative if breached
}

// ==================== RESOLUTION WORKFLOW ====================

export type ResolutionStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked'

export interface ResolutionStep {
  id: string
  resolutionId: string
  stepNumber: number
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  status: ResolutionStepStatus
  startedAt?: string
  completedAt?: string
  completedBy?: string
  completedByName?: string
  notes?: string
  blockedReason?: string
  estimatedHours?: number
  actualHours?: number
}

export interface Resolution {
  id: string
  complaintId: string
  summary: string
  detailedDescription: string
  rootCause?: string
  actionsTaken: string[]
  preventiveMeasures?: string[]
  steps: ResolutionStep[]
  resolvedBy: string
  resolvedByName: string
  resolvedAt: string
  verifiedBy?: string
  verifiedByName?: string
  verifiedAt?: string
  satisfactionScore?: number // 1-5
  reopenCount: number
  totalResolutionHours: number
  status: 'draft' | 'submitted' | 'verified' | 'rejected'
  rejectionReason?: string
}

export interface CreateResolutionRequest {
  complaintId: string
  summary: string
  detailedDescription: string
  rootCause?: string
  actionsTaken: string[]
  preventiveMeasures?: string[]
  steps?: Omit<ResolutionStep, 'id' | 'resolutionId'>[]
}

// ==================== SATISFACTION SURVEY ====================

export type SurveyStatus = 'pending' | 'sent' | 'completed' | 'expired' | 'declined'

export interface SatisfactionSurvey {
  id: string
  complaintId: string
  ticketNumber: string
  complainantId: string
  complainantName: string
  complainantEmail?: string
  complainantPhone?: string
  sentAt?: string
  completedAt?: string
  expiresAt: string
  status: SurveyStatus
  remindersSent: number
  lastReminderAt?: string
  responseToken?: string // For anonymous URL-based surveys
  createdAt: string
}

export interface SurveyResponse {
  id: string
  surveyId: string
  complaintId: string
  overallSatisfaction: number // 1-5
  resolutionQuality: number // 1-5
  responseTime: number // 1-5
  staffProfessionalism: number // 1-5
  communicationClarity: number // 1-5
  wouldRecommend: boolean
  additionalComments?: string
  improvements?: string
  respondedAt: string
  isAnonymous: boolean
}

export interface SurveyAnalytics {
  totalSurveysSent: number
  totalResponses: number
  responseRate: number
  averageOverallSatisfaction: number
  averageResolutionQuality: number
  averageResponseTime: number
  averageStaffProfessionalism: number
  averageCommunicationClarity: number
  recommendationRate: number
  categoryBreakdown: {
    category: ComplaintCategory
    averageSatisfaction: number
    responseCount: number
  }[]
  trendData: {
    month: string
    averageSatisfaction: number
    responseCount: number
  }[]
}

// ==================== ANONYMOUS FEEDBACK ====================

export interface AnonymousFeedback {
  id: string
  feedbackToken: string // Unique token for tracking without identification
  category: ComplaintCategory
  subject: string
  description: string
  priority: ComplaintPriority
  attachments?: {
    id: string
    filename: string
    fileSize: number
    mimeType: string
    uploadedAt: string
    url: string
  }[]
  submittedAt: string
  ipHash?: string // Hashed IP for abuse prevention, not identification
  status: ComplaintStatus
  assignedTo?: string
  assignedToName?: string
  internalNotes?: string
  isVerified: boolean // Admin verified as genuine
  responsePosted: boolean
  publicResponse?: string // Response visible via token lookup
  responsePostedAt?: string
  responsePostedBy?: string
}

export interface CreateAnonymousFeedbackRequest {
  category: ComplaintCategory
  subject: string
  description: string
  priority?: ComplaintPriority
}

export interface AnonymousFeedbackLookup {
  feedbackToken: string
  status: ComplaintStatus
  category: ComplaintCategory
  subject: string
  submittedAt: string
  publicResponse?: string
  responsePostedAt?: string
}

// ==================== MAIN COMPLAINT TYPE ====================

export interface Complaint {
  id: string
  ticketNumber: string // e.g., "CMP-2024-00123"

  // Complainant info
  complainantType: 'parent' | 'student' | 'staff' | 'anonymous'
  complainantId?: string
  complainantName?: string
  complainantEmail?: string
  complainantPhone?: string
  studentId?: string
  studentName?: string
  studentClass?: string
  studentSection?: string

  // Complaint details
  category: ComplaintCategory
  subcategory?: string
  subject: string
  description: string
  priority: ComplaintPriority
  status: ComplaintStatus

  // Attachments
  attachments?: {
    id: string
    filename: string
    fileSize: number
    mimeType: string
    uploadedAt: string
    url: string
  }[]

  // Assignment & routing
  assignedTo?: string
  assignedToName?: string
  assignedDepartment?: string
  escalatedTo?: string
  escalatedToName?: string
  escalatedAt?: string
  escalationReason?: string

  // SLA tracking
  slaStatus: SLAStatus

  // Resolution
  resolution?: Resolution

  // Communication
  internalNotes?: string
  lastResponseAt?: string
  responseCount: number

  // Dates
  createdAt: string
  acknowledgedAt?: string
  firstResponseAt?: string
  resolvedAt?: string
  closedAt?: string
  reopenedAt?: string
  updatedAt: string

  // Additional metadata
  source: 'web' | 'mobile' | 'email' | 'phone' | 'in_person'
  tags?: string[]
  relatedTickets?: string[]
  isAnonymous: boolean
  isSensitive: boolean // For bullying, harassment, etc.
  requiresFollowUp: boolean
  followUpDate?: string
  followUpNotes?: string
}

export interface CreateComplaintRequest {
  complainantType: 'parent' | 'student' | 'staff'
  complainantId: string
  studentId?: string
  category: ComplaintCategory
  subcategory?: string
  subject: string
  description: string
  priority?: ComplaintPriority
  source?: 'web' | 'mobile' | 'email' | 'phone' | 'in_person'
  isSensitive?: boolean
}

export interface UpdateComplaintRequest {
  status?: ComplaintStatus
  priority?: ComplaintPriority
  assignedTo?: string
  internalNotes?: string
  tags?: string[]
  isSensitive?: boolean
  requiresFollowUp?: boolean
  followUpDate?: string
  followUpNotes?: string
}

// ==================== COMPLAINT COMMENT ====================

export interface ComplaintComment {
  id: string
  complaintId: string
  authorId: string
  authorName: string
  authorRole: string
  content: string
  isInternal: boolean // Internal notes vs visible to complainant
  attachments?: {
    id: string
    filename: string
    fileSize: number
    mimeType: string
    url: string
  }[]
  createdAt: string
  updatedAt?: string
  editedBy?: string
}

export interface CreateCommentRequest {
  complaintId: string
  content: string
  isInternal: boolean
}

// ==================== FILTERS & ANALYTICS ====================

export interface ComplaintFilters {
  search?: string
  status?: ComplaintStatus | 'all'
  priority?: ComplaintPriority | 'all'
  category?: ComplaintCategory | 'all'
  assignedTo?: string
  complainantType?: 'parent' | 'student' | 'staff' | 'anonymous' | 'all'
  dateFrom?: string
  dateTo?: string
  slaBreached?: boolean
  isAnonymous?: boolean
  isSensitive?: boolean
  requiresFollowUp?: boolean
}

export interface ComplaintStats {
  total: number
  byStatus: Record<ComplaintStatus, number>
  byPriority: Record<ComplaintPriority, number>
  byCategory: Record<ComplaintCategory, number>
  openTickets: number
  resolvedThisMonth: number
  averageResolutionHours: number
  slaBreachCount: number
  slaComplianceRate: number
  pendingFollowUps: number
  satisfactionScore: number
}

export interface ComplaintTrend {
  date: string
  submitted: number
  resolved: number
  escalated: number
}

export interface CategoryAnalytics {
  category: ComplaintCategory
  total: number
  resolved: number
  pending: number
  averageResolutionHours: number
  slaComplianceRate: number
  satisfactionScore: number
}

// ==================== ASSIGNMENT & ROUTING ====================

export interface AssignmentRule {
  id: string
  name: string
  description?: string
  category: ComplaintCategory
  priority?: ComplaintPriority
  assignTo: string // User ID or role
  assignToName: string
  escalateTo?: string
  escalateToName?: string
  autoAcknowledge: boolean
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface EscalationRequest {
  complaintId: string
  escalateTo: string
  reason: string
  notes?: string
}

// ==================== CONSTANTS ====================

export const COMPLAINT_SOURCES = [
  { value: 'web', label: 'Web Portal' },
  { value: 'mobile', label: 'Mobile App' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'in_person', label: 'In Person' },
] as const

export const COMPLAINANT_TYPES = [
  { value: 'parent', label: 'Parent' },
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
  { value: 'anonymous', label: 'Anonymous' },
] as const

export const DEFAULT_SLA_CONFIG: Partial<SLAConfig> = {
  acknowledgeWithinHours: 24,
  resolveWithinHours: 72,
  escalateAfterHours: 48,
  autoEscalate: true,
  notifyOnBreach: true,
  isActive: true,
}
