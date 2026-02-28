// ==================== STATUS & TYPE UNIONS ====================

export type DocumentType = 'file' | 'folder'
export type DocumentCategory =
  | 'academic'
  | 'administrative'
  | 'student_records'
  | 'staff_records'
  | 'financial'
  | 'circulars'
  | 'policies'
  | 'forms'
  | 'reports'
  | 'other'

export type FileType = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'jpg' | 'png' | 'txt' | 'csv' | 'other'

export type AccessLevel = 'public' | 'staff_only' | 'admin_only' | 'restricted'

// ==================== CONSTANTS ====================

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string; icon: string }[] = [
  { value: 'academic', label: 'Academic', icon: '📚' },
  { value: 'administrative', label: 'Administrative', icon: '📋' },
  { value: 'student_records', label: 'Student Records', icon: '👨‍🎓' },
  { value: 'staff_records', label: 'Staff Records', icon: '👔' },
  { value: 'financial', label: 'Financial', icon: '💰' },
  { value: 'circulars', label: 'Circulars', icon: '📢' },
  { value: 'policies', label: 'Policies', icon: '📜' },
  { value: 'forms', label: 'Forms', icon: '📝' },
  { value: 'reports', label: 'Reports', icon: '📊' },
  { value: 'other', label: 'Other', icon: '📁' },
]

export const ACCESS_LEVELS: { value: AccessLevel; label: string; description: string }[] = [
  { value: 'public', label: 'Public', description: 'Accessible to all users' },
  { value: 'staff_only', label: 'Staff Only', description: 'Only visible to staff members' },
  { value: 'admin_only', label: 'Admin Only', description: 'Restricted to administrators' },
  { value: 'restricted', label: 'Restricted', description: 'Only specific users can access' },
]

// ==================== INTERFACES ====================

export interface Document {
  id: string
  name: string
  type: DocumentType
  category?: DocumentCategory
  description?: string
  // File properties
  fileType?: FileType
  fileSize?: number // in bytes
  fileUrl?: string
  thumbnailUrl?: string
  // Hierarchy
  parentId?: string
  path: string // Full path like /Academic/2024/Reports
  // Access control
  accessLevel: AccessLevel
  allowedRoles?: string[]
  allowedUserIds?: string[]
  // Metadata
  tags?: string[]
  version?: number
  isArchived?: boolean
  isStarred?: boolean
  // Timestamps
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  lastAccessedAt?: string
}

export interface Folder extends Document {
  type: 'folder'
  childCount: number
  totalSize: number // Sum of all files in folder
}

export interface File extends Document {
  type: 'file'
  fileType: FileType
  fileSize: number
  fileUrl: string
  downloadCount: number
}

export interface DocumentVersion {
  id: string
  documentId: string
  version: number
  fileUrl: string
  fileSize: number
  uploadedBy: string
  uploadedByName: string
  uploadedAt: string
  changeNote?: string
}

export interface DocumentShare {
  id: string
  documentId: string
  sharedWith: string // userId or roleId
  sharedWithType: 'user' | 'role'
  sharedWithName: string
  permissions: SharePermissions
  sharedBy: string
  sharedByName: string
  sharedAt: string
  expiresAt?: string
}

export interface SharePermissions {
  canView: boolean
  canDownload: boolean
  canEdit: boolean
  canDelete: boolean
  canShare: boolean
}

export interface DocumentActivity {
  id: string
  documentId: string
  documentName: string
  action: 'created' | 'viewed' | 'downloaded' | 'updated' | 'deleted' | 'shared' | 'moved' | 'renamed'
  userId: string
  userName: string
  timestamp: string
  details?: string
}

export interface DocumentStats {
  totalDocuments: number
  totalFolders: number
  totalFiles: number
  totalSize: number // in bytes
  recentUploads: number
  sharedDocuments: number
  categoryBreakdown: { category: DocumentCategory; count: number }[]
}

// ==================== FILTER TYPES ====================

export interface DocumentFilters {
  search?: string
  parentId?: string
  category?: DocumentCategory
  fileType?: FileType
  accessLevel?: AccessLevel
  isArchived?: boolean
  isStarred?: boolean
  createdBy?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

// ==================== REQUEST TYPES ====================

export interface CreateFolderRequest {
  name: string
  parentId?: string
  category?: DocumentCategory
  description?: string
  accessLevel: AccessLevel
  allowedRoles?: string[]
  tags?: string[]
}

export interface UploadFileRequest {
  name: string
  parentId?: string
  category?: DocumentCategory
  description?: string
  accessLevel: AccessLevel
  allowedRoles?: string[]
  tags?: string[]
  file: globalThis.File
}

export interface UpdateDocumentRequest {
  name?: string
  description?: string
  category?: DocumentCategory
  accessLevel?: AccessLevel
  allowedRoles?: string[]
  tags?: string[]
  isArchived?: boolean
  isStarred?: boolean
}

export interface MoveDocumentRequest {
  targetFolderId?: string // null for root
}

export interface ShareDocumentRequest {
  sharedWith: string
  sharedWithType: 'user' | 'role'
  permissions: SharePermissions
  expiresAt?: string
}

// ==================== DOCUMENT TEMPLATES ====================

export type TemplateCategory =
  | 'certificate'
  | 'letter'
  | 'report'
  | 'form'
  | 'notice'
  | 'id_card'
  | 'other'

export type TemplateFieldType =
  | 'text'
  | 'date'
  | 'number'
  | 'select'
  | 'image'
  | 'signature'
  | 'qr_code'
  | 'barcode'

export interface TemplateField {
  id: string
  name: string
  label: string
  type: TemplateFieldType
  placeholder?: string
  defaultValue?: string
  required: boolean
  options?: string[] // For select type
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  style?: {
    fontSize?: number
    fontWeight?: 'normal' | 'bold'
    fontFamily?: string
    color?: string
    textAlign?: 'left' | 'center' | 'right'
  }
}

export interface DocumentTemplate {
  id: string
  name: string
  description?: string
  category: TemplateCategory
  thumbnail?: string
  content: string // HTML/template content
  fields: TemplateField[]
  paperSize: 'A4' | 'Letter' | 'A5' | 'Custom'
  orientation: 'portrait' | 'landscape'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  headerHtml?: string
  footerHtml?: string
  isActive: boolean
  isDefault?: boolean
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'certificate', label: 'Certificate' },
  { value: 'letter', label: 'Letter' },
  { value: 'report', label: 'Report' },
  { value: 'form', label: 'Form' },
  { value: 'notice', label: 'Notice' },
  { value: 'id_card', label: 'ID Card' },
  { value: 'other', label: 'Other' },
]

// ==================== DIGITAL SIGNATURES ====================

export type SignatureStatus = 'pending' | 'signed' | 'rejected' | 'expired'

export interface DigitalSignature {
  id: string
  documentId: string
  documentName: string
  signerId: string
  signerName: string
  signerEmail: string
  signerRole: string
  signatureImageUrl?: string
  signatureData?: string // Base64 signature or certificate data
  signedAt?: string
  ipAddress?: string
  userAgent?: string
  status: SignatureStatus
  reason?: string // Reason for rejection
  expiresAt?: string
  createdAt: string
}

export interface SignatureRequest {
  id: string
  documentId: string
  documentName: string
  requesterId: string
  requesterName: string
  signers: SignatureRequestSigner[]
  message?: string
  dueDate?: string
  status: 'draft' | 'sent' | 'in_progress' | 'completed' | 'cancelled'
  completedSignatures: number
  totalSignatures: number
  createdAt: string
  updatedAt: string
}

export interface SignatureRequestSigner {
  signerId: string
  signerName: string
  signerEmail: string
  order: number // Signing order (1 = first, etc.)
  status: SignatureStatus
  signedAt?: string
}

export interface SignatureVerification {
  isValid: boolean
  documentId: string
  documentName: string
  signatureId: string
  signerName: string
  signedAt: string
  certificateInfo?: {
    issuer: string
    serialNumber: string
    validFrom: string
    validTo: string
  }
  verifiedAt: string
  message: string
}

// ==================== BULK DOCUMENT GENERATION ====================

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface BulkGenerationJob {
  id: string
  name: string
  templateId: string
  templateName: string
  status: GenerationStatus
  totalRecords: number
  processedRecords: number
  successCount: number
  failedCount: number
  dataSource: 'csv' | 'database' | 'api'
  dataSourceInfo?: string // File name or query info
  outputFormat: 'pdf' | 'docx' | 'png'
  outputFolderId?: string
  outputFolderName?: string
  errors?: BulkGenerationError[]
  generatedDocumentIds?: string[]
  startedAt?: string
  completedAt?: string
  createdBy: string
  createdByName: string
  createdAt: string
}

export interface BulkGenerationError {
  recordIndex: number
  recordIdentifier?: string
  field?: string
  message: string
}

export interface BulkGenerationRecord {
  [key: string]: string | number | boolean | null
}

// ==================== DOCUMENT EXPIRY ALERTS ====================

export type ExpiryAlertStatus = 'active' | 'acknowledged' | 'resolved' | 'expired'
export type ExpiryAlertPriority = 'low' | 'medium' | 'high' | 'critical'

export interface ExpiryAlert {
  id: string
  documentId: string
  documentName: string
  documentCategory?: DocumentCategory
  expiryDate: string
  daysUntilExpiry: number
  alertStatus: ExpiryAlertStatus
  priority: ExpiryAlertPriority
  assignedTo?: string
  assignedToName?: string
  notificationsSent: number
  lastNotificationAt?: string
  acknowledgedBy?: string
  acknowledgedByName?: string
  acknowledgedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ExpiryNotification {
  id: string
  alertId: string
  documentId: string
  documentName: string
  recipientId: string
  recipientName: string
  recipientEmail: string
  channel: 'email' | 'sms' | 'in_app' | 'push'
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  sentAt?: string
  deliveredAt?: string
  failureReason?: string
  createdAt: string
}

export interface ExpiryAlertConfig {
  id: string
  documentCategory?: DocumentCategory
  alertDaysBefore: number[] // e.g., [90, 60, 30, 7]
  notifyRoles: string[]
  notifyUserIds?: string[]
  channels: ('email' | 'sms' | 'in_app' | 'push')[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ==================== OCR (Optical Character Recognition) ====================

export type OCRStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ExtractedField {
  fieldName: string
  value: string
  confidence: number // 0-100
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
    page: number
  }
  suggestedCorrection?: string
  isVerified?: boolean
  verifiedValue?: string
}

export interface OCRResult {
  id: string
  documentId: string
  documentName: string
  status: OCRStatus
  language: string
  totalPages: number
  processedPages: number
  rawText?: string
  extractedFields: ExtractedField[]
  detectedDocumentType?: string
  confidence: number // Overall confidence 0-100
  processingTimeMs?: number
  errorMessage?: string
  processedAt?: string
  createdAt: string
}

export interface OCRTemplate {
  id: string
  name: string
  description?: string
  documentType: string // e.g., "passport", "birth_certificate", "invoice"
  expectedFields: {
    fieldName: string
    label: string
    type: 'text' | 'date' | 'number' | 'email' | 'phone'
    required: boolean
    region?: {
      x: number
      y: number
      width: number
      height: number
      page: number
    }
  }[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ==================== DOCUMENT APPROVAL WORKFLOW ====================

export type ApprovalStepStatus = 'pending' | 'approved' | 'rejected' | 'skipped'
export type ApprovalWorkflowStatus = 'draft' | 'active' | 'completed' | 'rejected' | 'cancelled'

export interface ApprovalStep {
  id: string
  order: number
  name: string
  description?: string
  approverType: 'user' | 'role' | 'any_of'
  approverIds: string[] // User IDs or Role IDs
  approverNames: string[]
  requiredApprovals: number // For 'any_of' type, how many need to approve
  autoApproveAfterDays?: number
  autoRejectAfterDays?: number
  status: ApprovalStepStatus
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedByName?: string
  rejectedAt?: string
  comments?: string
}

export interface ApprovalWorkflow {
  id: string
  name: string
  description?: string
  documentCategories?: DocumentCategory[] // Which categories this applies to
  steps: ApprovalStep[]
  isSequential: boolean // Steps must be completed in order
  allowParallelApproval: boolean
  notifyOnStepComplete: boolean
  notifyOnWorkflowComplete: boolean
  isActive: boolean
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface ApprovalRequest {
  id: string
  workflowId: string
  workflowName: string
  documentId: string
  documentName: string
  documentCategory?: DocumentCategory
  requesterId: string
  requesterName: string
  currentStepIndex: number
  currentStepId: string
  currentStepName: string
  steps: ApprovalStep[]
  status: ApprovalWorkflowStatus
  submittedAt: string
  completedAt?: string
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  dueDate?: string
  notes?: string
  attachmentIds?: string[]
  history: ApprovalHistoryEntry[]
  createdAt: string
  updatedAt: string
}

export interface ApprovalHistoryEntry {
  id: string
  stepId: string
  stepName: string
  action: 'submitted' | 'approved' | 'rejected' | 'commented' | 'reassigned' | 'cancelled'
  performedBy: string
  performedByName: string
  performedAt: string
  comments?: string
  previousStatus?: ApprovalStepStatus
  newStatus?: ApprovalStepStatus
}

// ==================== ADDITIONAL REQUEST TYPES ====================

export interface CreateTemplateRequest {
  name: string
  description?: string
  category: TemplateCategory
  content: string
  fields: Omit<TemplateField, 'id'>[]
  paperSize: DocumentTemplate['paperSize']
  orientation: DocumentTemplate['orientation']
  margins: DocumentTemplate['margins']
  headerHtml?: string
  footerHtml?: string
  isActive?: boolean
}

export interface UpdateTemplateRequest {
  name?: string
  description?: string
  category?: TemplateCategory
  content?: string
  fields?: TemplateField[]
  paperSize?: DocumentTemplate['paperSize']
  orientation?: DocumentTemplate['orientation']
  margins?: DocumentTemplate['margins']
  headerHtml?: string
  footerHtml?: string
  isActive?: boolean
}

export interface RequestSignatureRequest {
  documentId: string
  signers: {
    signerId: string
    signerName: string
    signerEmail: string
    order: number
  }[]
  message?: string
  dueDate?: string
}

export interface SignDocumentRequest {
  signatureRequestId: string
  signatureData: string // Base64 encoded signature image or certificate
}

export interface CreateBulkGenerationJobRequest {
  name: string
  templateId: string
  dataSource: BulkGenerationJob['dataSource']
  records: BulkGenerationRecord[]
  outputFormat: BulkGenerationJob['outputFormat']
  outputFolderId?: string
}

export interface ProcessOCRRequest {
  documentId: string
  language?: string
  templateId?: string // Optional OCR template for guided extraction
}

export interface CreateApprovalWorkflowRequest {
  name: string
  description?: string
  documentCategories?: DocumentCategory[]
  steps: Omit<ApprovalStep, 'id' | 'status' | 'approvedBy' | 'approvedByName' | 'approvedAt' | 'rejectedBy' | 'rejectedByName' | 'rejectedAt' | 'comments'>[]
  isSequential?: boolean
  allowParallelApproval?: boolean
  notifyOnStepComplete?: boolean
  notifyOnWorkflowComplete?: boolean
}

export interface SubmitForApprovalRequest {
  workflowId: string
  documentId: string
  urgency?: ApprovalRequest['urgency']
  dueDate?: string
  notes?: string
}

export interface ApproveRejectRequest {
  requestId: string
  action: 'approve' | 'reject'
  comments?: string
}

export interface AcknowledgeExpiryAlertRequest {
  alertId: string
  notes?: string
}

// ==================== FILTER TYPES ====================

export interface TemplateFilters {
  search?: string
  category?: TemplateCategory
  isActive?: boolean
  page?: number
  limit?: number
}

export interface SignatureRequestFilters {
  search?: string
  status?: SignatureRequest['status']
  documentId?: string
  requesterId?: string
  page?: number
  limit?: number
}

export interface BulkJobFilters {
  search?: string
  status?: GenerationStatus
  templateId?: string
  page?: number
  limit?: number
}

export interface ExpiryAlertFilters {
  search?: string
  status?: ExpiryAlertStatus
  priority?: ExpiryAlertPriority
  category?: DocumentCategory
  daysUntilExpiry?: number // Filter alerts expiring within X days
  page?: number
  limit?: number
}

export interface ApprovalRequestFilters {
  search?: string
  status?: ApprovalWorkflowStatus
  workflowId?: string
  requesterId?: string
  approverId?: string // Show requests where user is an approver
  urgency?: ApprovalRequest['urgency']
  page?: number
  limit?: number
}
