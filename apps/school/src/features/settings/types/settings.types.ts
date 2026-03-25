// School Profile
export interface SchoolProfile {
  id: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  website?: string
  logo?: string
  principalName: string
  establishedYear: number
  affiliationNumber?: string
  affiliationBoard?: 'CBSE' | 'ICSE' | 'State' | 'IB' | 'Other'
}

// Academic Year
export interface AcademicYear {
  id: string
  name: string // e.g., "2024-25"
  startDate: string
  endDate: string
  isCurrent: boolean
  status: 'active' | 'completed' | 'upcoming'
}

// Class & Section
export interface ClassSection {
  id: string
  className: string // e.g., "Class 1", "Class 2"
  sections: string[] // e.g., ["A", "B", "C"]
  classTeacherId?: string
  classTeacherName?: string
}

// User Management
export type UserRole = 'admin' | 'principal' | 'teacher' | 'accountant' | 'librarian' | 'receptionist'

export interface SystemUser {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

// Notification Settings
export interface NotificationPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  feeReminders: boolean
  attendanceAlerts: boolean
  examResults: boolean
  generalAnnouncements: boolean
}

// Backup Settings
export interface BackupConfig {
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  lastBackupAt?: string
  backupRetentionDays: number
}

// Theme Settings
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  accentColor: string
}

// Request/Update types
export interface UpdateSchoolProfileRequest {
  name?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  principalName?: string
  establishedYear?: number
  affiliationNumber?: string
  affiliationBoard?: 'CBSE' | 'ICSE' | 'State' | 'IB' | 'Other'
}

export interface CreateAcademicYearRequest {
  name: string
  startDate: string
  endDate: string
}

export interface UpdateAcademicYearRequest {
  name?: string
  startDate?: string
  endDate?: string
  status?: 'active' | 'completed' | 'upcoming'
}

export interface CreateClassSectionRequest {
  className: string
  sections: string[]
  classTeacherId?: string
}

export interface UpdateClassSectionRequest {
  className?: string
  sections?: string[]
  classTeacherId?: string
}

export interface CreateUserRequest {
  email: string
  name: string
  role: UserRole
  password: string
}

export interface UpdateUserRequest {
  email?: string
  name?: string
  role?: UserRole
  isActive?: boolean
}

export interface UpdateNotificationPreferencesRequest {
  emailNotifications?: boolean
  smsNotifications?: boolean
  feeReminders?: boolean
  attendanceAlerts?: boolean
  examResults?: boolean
  generalAnnouncements?: boolean
}

export interface UpdateBackupConfigRequest {
  autoBackup?: boolean
  backupFrequency?: 'daily' | 'weekly' | 'monthly'
  backupRetentionDays?: number
}

export interface UpdateThemeConfigRequest {
  mode?: 'light' | 'dark' | 'system'
  primaryColor?: string
  accentColor?: string
}

// ==================== AUDIT LOG ====================

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'status_change'
export type AuditModule = 'students' | 'staff' | 'admissions' | 'attendance' | 'finance' | 'library' | 'exams' | 'transport' | 'settings' | 'auth'

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  login: 'Logged In',
  logout: 'Logged Out',
  export: 'Exported',
  import: 'Imported',
  status_change: 'Status Changed',
}

export const AUDIT_MODULE_LABELS: Record<AuditModule, string> = {
  students: 'Students',
  staff: 'Staff',
  admissions: 'Admissions',
  attendance: 'Attendance',
  finance: 'Finance',
  library: 'Library',
  exams: 'Exams',
  transport: 'Transport',
  settings: 'Settings',
  auth: 'Authentication',
}

export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  userRole: string
  action: AuditAction
  module: AuditModule
  entityType: string
  entityId: string
  entityName: string
  description: string
  changes?: { field: string; oldValue: string; newValue: string }[]
  ipAddress: string
  timestamp: string
}

// ==================== ACADEMIC CALENDAR ====================

export type CalendarEventType = 'holiday' | 'exam' | 'ptm' | 'sports' | 'cultural' | 'workshop' | 'vacation' | 'other'

export const CALENDAR_EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  holiday: 'Holiday',
  exam: 'Examination',
  ptm: 'Parent-Teacher Meeting',
  sports: 'Sports Event',
  cultural: 'Cultural Event',
  workshop: 'Workshop / Training',
  vacation: 'Vacation',
  other: 'Other',
}

export interface CalendarEvent {
  id: string
  title: string
  description: string
  type: CalendarEventType
  startDate: string
  endDate: string
  isRecurring: boolean
  appliesToClasses: string[] // empty = all classes
  createdAt: string
}

export interface CreateCalendarEventRequest {
  title: string
  description: string
  type: CalendarEventType
  startDate: string
  endDate: string
  isRecurring: boolean
  appliesToClasses: string[]
}

// ==================== EMAIL TEMPLATES ====================

export type TemplateCategory = 'fee' | 'attendance' | 'exam' | 'admission' | 'general' | 'transport'

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  fee: 'Fee & Payment',
  attendance: 'Attendance',
  exam: 'Exams & Results',
  admission: 'Admissions',
  general: 'General',
  transport: 'Transport',
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: TemplateCategory
  variables: string[] // Available placeholders: {{student_name}}, {{class}}, etc.
  isActive: boolean
  lastModified: string
  createdAt: string
}

export interface CreateEmailTemplateRequest {
  name: string
  subject: string
  body: string
  category: TemplateCategory
}

export interface UpdateEmailTemplateRequest {
  name?: string
  subject?: string
  body?: string
  category?: TemplateCategory
  isActive?: boolean
}

// ==================== SETTINGS SECTIONS ====================

export type SettingsSection = 'general' | 'communication' | 'integrations' | 'modules' | 'permissions' | 'subscription'
export type GeneralTab = 'school' | 'academic' | 'calendar' | 'classes' | 'users' | 'templates' | 'notifications' | 'audit' | 'backup' | 'appearance' | 'campuses' | 'retention' | 'compliance' | 'health' | 'feature-flags'
export type CommunicationTab = 'dashboard' | 'announcements' | 'messages' | 'circulars' | 'surveys' | 'emergency' | 'events'
export type IntegrationsTab = 'sms' | 'email' | 'payment' | 'whatsapp' | 'biometric' | 'webhooks' | 'api-keys'

// ==================== MULTI-BRANCH/CAMPUS SUPPORT ====================

export type CampusStatus = 'active' | 'inactive' | 'under_construction'

export interface Campus {
  id: string
  name: string
  code: string // Short code like "MAIN", "NORTH", "SOUTH"
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  principalId?: string
  principalName?: string
  status: CampusStatus
  studentCapacity: number
  currentEnrollment: number
  establishedYear: number
  createdAt: string
  updatedAt: string
}

export interface Branch {
  id: string
  name: string
  campusId: string
  campusName: string
  type: 'primary' | 'secondary' | 'senior_secondary' | 'pre_primary'
  classRange: { from: string; to: string } // e.g., { from: "Class 1", to: "Class 5" }
  headTeacherId?: string
  headTeacherName?: string
  isActive: boolean
  createdAt: string
}

export interface CampusConfig {
  id: string
  campusId: string
  allowCrossEnrollment: boolean
  shareLibraryResources: boolean
  shareTransport: boolean
  unifiedFeeStructure: boolean
  centralizedAdmissions: boolean
  sharedStaffPool: boolean
  timezone: string
  academicCalendarId?: string
}

export interface CreateCampusRequest {
  name: string
  code: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  principalId?: string
  studentCapacity: number
  establishedYear: number
}

export interface UpdateCampusRequest {
  name?: string
  code?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  email?: string
  principalId?: string
  status?: CampusStatus
  studentCapacity?: number
}

export interface CreateBranchRequest {
  name: string
  campusId: string
  type: Branch['type']
  classRange: { from: string; to: string }
  headTeacherId?: string
}

export interface UpdateBranchRequest {
  name?: string
  type?: Branch['type']
  classRange?: { from: string; to: string }
  headTeacherId?: string
  isActive?: boolean
}

export interface UpdateCampusConfigRequest {
  allowCrossEnrollment?: boolean
  shareLibraryResources?: boolean
  shareTransport?: boolean
  unifiedFeeStructure?: boolean
  centralizedAdmissions?: boolean
  sharedStaffPool?: boolean
  timezone?: string
  academicCalendarId?: string
}

// ==================== DATA RETENTION POLICIES ====================

export type DataCategory =
  | 'student_records'
  | 'staff_records'
  | 'financial_records'
  | 'attendance_records'
  | 'exam_records'
  | 'library_records'
  | 'transport_records'
  | 'communication_logs'
  | 'audit_logs'
  | 'system_backups'

export const DATA_CATEGORY_LABELS: Record<DataCategory, string> = {
  student_records: 'Student Records',
  staff_records: 'Staff Records',
  financial_records: 'Financial Records',
  attendance_records: 'Attendance Records',
  exam_records: 'Examination Records',
  library_records: 'Library Records',
  transport_records: 'Transport Records',
  communication_logs: 'Communication Logs',
  audit_logs: 'Audit Logs',
  system_backups: 'System Backups',
}

export type RetentionAction = 'archive' | 'anonymize' | 'delete' | 'export_and_delete'

export const RETENTION_ACTION_LABELS: Record<RetentionAction, string> = {
  archive: 'Archive',
  anonymize: 'Anonymize',
  delete: 'Permanently Delete',
  export_and_delete: 'Export & Delete',
}

export interface RetentionPolicy {
  id: string
  name: string
  description: string
  dataCategory: DataCategory
  retentionPeriodDays: number
  action: RetentionAction
  isActive: boolean
  lastExecutedAt?: string
  nextScheduledAt?: string
  createdAt: string
  updatedAt: string
}

export interface RetentionSchedule {
  id: string
  policyId: string
  policyName: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  time: string // HH:mm format
  isEnabled: boolean
  lastRunAt?: string
  lastRunStatus?: 'success' | 'failed' | 'partial'
  lastRunRecordsProcessed?: number
  createdAt: string
}

export interface CreateRetentionPolicyRequest {
  name: string
  description: string
  dataCategory: DataCategory
  retentionPeriodDays: number
  action: RetentionAction
}

export interface UpdateRetentionPolicyRequest {
  name?: string
  description?: string
  retentionPeriodDays?: number
  action?: RetentionAction
  isActive?: boolean
}

export interface CreateRetentionScheduleRequest {
  policyId: string
  frequency: RetentionSchedule['frequency']
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
}

export interface UpdateRetentionScheduleRequest {
  frequency?: RetentionSchedule['frequency']
  dayOfWeek?: number
  dayOfMonth?: number
  time?: string
  isEnabled?: boolean
}

// ==================== GDPR/COMPLIANCE TOOLS ====================

export type ComplianceFramework = 'gdpr' | 'ccpa' | 'ferpa' | 'coppa' | 'local_education_act'

export const COMPLIANCE_FRAMEWORK_LABELS: Record<ComplianceFramework, string> = {
  gdpr: 'GDPR (EU)',
  ccpa: 'CCPA (California)',
  ferpa: 'FERPA (US Education)',
  coppa: 'COPPA (Children\'s Privacy)',
  local_education_act: 'Local Education Act',
}

export type ComplianceRuleStatus = 'compliant' | 'non_compliant' | 'partial' | 'not_applicable'

export interface ComplianceRule {
  id: string
  framework: ComplianceFramework
  name: string
  description: string
  requirement: string
  status: ComplianceRuleStatus
  lastAuditedAt?: string
  nextAuditDue?: string
  notes?: string
  evidenceDocumentIds: string[]
  createdAt: string
  updatedAt: string
}

export type GDPRRequestType = 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection'

export const GDPR_REQUEST_TYPE_LABELS: Record<GDPRRequestType, string> = {
  access: 'Data Access Request',
  rectification: 'Data Rectification',
  erasure: 'Right to Erasure',
  portability: 'Data Portability',
  restriction: 'Restriction of Processing',
  objection: 'Right to Object',
}

export type GDPRRequestStatus = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'expired'

export interface GDPRRequest {
  id: string
  requestType: GDPRRequestType
  status: GDPRRequestStatus
  requestorName: string
  requestorEmail: string
  requestorRelation: 'self' | 'parent' | 'guardian' | 'legal_representative'
  subjectId: string // Student or staff ID
  subjectType: 'student' | 'staff' | 'parent'
  subjectName: string
  description: string
  submittedAt: string
  acknowledgedAt?: string
  completedAt?: string
  deadline: string // GDPR requires response within 30 days
  assignedTo?: string
  assignedToName?: string
  responseNotes?: string
  attachmentIds: string[]
}

export type ConsentType =
  | 'data_processing'
  | 'photo_video'
  | 'third_party_sharing'
  | 'marketing'
  | 'research'
  | 'medical_emergency'
  | 'field_trips'
  | 'online_learning'

export const CONSENT_TYPE_LABELS: Record<ConsentType, string> = {
  data_processing: 'General Data Processing',
  photo_video: 'Photo/Video Usage',
  third_party_sharing: 'Third-Party Data Sharing',
  marketing: 'Marketing Communications',
  research: 'Research & Analytics',
  medical_emergency: 'Medical Emergency Contact',
  field_trips: 'Field Trip Participation',
  online_learning: 'Online Learning Platforms',
}

export interface ConsentRecord {
  id: string
  subjectId: string
  subjectType: 'student' | 'staff'
  subjectName: string
  consentType: ConsentType
  consentGivenBy: string // Parent/Guardian name for students
  consentGivenByRelation: 'self' | 'parent' | 'guardian'
  isGranted: boolean
  grantedAt?: string
  revokedAt?: string
  expiresAt?: string
  ipAddress?: string
  documentId?: string // Signed consent form
  version: string // Policy version
  createdAt: string
  updatedAt: string
}

export interface CreateGDPRRequestRequest {
  requestType: GDPRRequestType
  requestorName: string
  requestorEmail: string
  requestorRelation: GDPRRequest['requestorRelation']
  subjectId: string
  subjectType: GDPRRequest['subjectType']
  description: string
}

export interface UpdateGDPRRequestRequest {
  status?: GDPRRequestStatus
  assignedTo?: string
  responseNotes?: string
}

export interface UpdateConsentRequest {
  isGranted: boolean
  consentGivenBy?: string
  consentGivenByRelation?: ConsentRecord['consentGivenByRelation']
}

// ==================== SYSTEM HEALTH MONITORING ====================

export type ServiceName =
  | 'api_server'
  | 'database'
  | 'cache'
  | 'file_storage'
  | 'email_service'
  | 'sms_gateway'
  | 'payment_gateway'
  | 'backup_service'
  | 'search_service'
  | 'notification_service'

export const SERVICE_NAME_LABELS: Record<ServiceName, string> = {
  api_server: 'API Server',
  database: 'Database',
  cache: 'Cache (Redis)',
  file_storage: 'File Storage',
  email_service: 'Email Service',
  sms_gateway: 'SMS Gateway',
  payment_gateway: 'Payment Gateway',
  backup_service: 'Backup Service',
  search_service: 'Search Service',
  notification_service: 'Notification Service',
}

export type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown'

export interface ServiceHealth {
  name: ServiceName
  status: ServiceStatus
  responseTimeMs?: number
  lastCheckedAt: string
  uptime: number // percentage
  lastIncidentAt?: string
  message?: string
}

export type MetricType = 'cpu' | 'memory' | 'disk' | 'network' | 'requests' | 'errors' | 'latency'

export interface PerformanceMetric {
  id: string
  type: MetricType
  name: string
  value: number
  unit: string
  threshold?: number
  status: 'normal' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  history: { timestamp: string; value: number }[]
  lastUpdatedAt: string
}

export interface SystemHealth {
  overallStatus: ServiceStatus
  services: ServiceHealth[]
  metrics: PerformanceMetric[]
  activeUsers: number
  activeConnections: number
  lastUpdatedAt: string
  alerts: SystemAlert[]
}

export interface SystemAlert {
  id: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  service?: ServiceName
  metric?: MetricType
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  createdAt: string
}

export interface AcknowledgeAlertRequest {
  alertId: string
}

export interface ResolveAlertRequest {
  alertId: string
  resolution?: string
}

// ==================== FEATURE FLAGS MANAGEMENT ====================

export type FlagEnvironment = 'development' | 'staging' | 'production'

export type FlagConditionType =
  | 'user_role'
  | 'user_id'
  | 'campus_id'
  | 'percentage'
  | 'date_range'
  | 'user_attribute'

export interface FlagCondition {
  id: string
  type: FlagConditionType
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: string | string[] | number | boolean
  attribute?: string // For user_attribute type
}

export interface FlagOverride {
  id: string
  flagId: string
  targetType: 'user' | 'campus' | 'role'
  targetId: string
  targetName: string
  enabled: boolean
  createdAt: string
  createdBy: string
}

export interface FeatureFlag {
  id: string
  key: string // Unique identifier like "new_dashboard", "beta_reports"
  name: string
  description: string
  enabled: boolean
  environments: {
    development: boolean
    staging: boolean
    production: boolean
  }
  conditions: FlagCondition[]
  overrides: FlagOverride[]
  rolloutPercentage: number // 0-100
  createdAt: string
  updatedAt: string
  createdBy: string
  lastModifiedBy: string
}

export interface CreateFeatureFlagRequest {
  key: string
  name: string
  description: string
  enabled?: boolean
  environments?: Partial<FeatureFlag['environments']>
  rolloutPercentage?: number
}

export interface UpdateFeatureFlagRequest {
  name?: string
  description?: string
  enabled?: boolean
  environments?: Partial<FeatureFlag['environments']>
  rolloutPercentage?: number
}

export interface CreateFlagConditionRequest {
  flagId: string
  type: FlagConditionType
  operator: FlagCondition['operator']
  value: FlagCondition['value']
  attribute?: string
}

export interface CreateFlagOverrideRequest {
  flagId: string
  targetType: FlagOverride['targetType']
  targetId: string
  targetName: string
  enabled: boolean
}

export interface EvaluateFlagRequest {
  flagKey: string
  userId?: string
  userRole?: string
  campusId?: string
  environment?: FlagEnvironment
}

export interface EvaluateFlagResponse {
  flagKey: string
  enabled: boolean
  reason: 'default' | 'condition_match' | 'override' | 'rollout' | 'environment_disabled'
}
