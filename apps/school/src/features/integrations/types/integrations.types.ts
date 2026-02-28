// ==================== INTEGRATION TYPE ENUMS ====================

export type IntegrationType =
  | 'sms_gateway'
  | 'email_service'
  | 'payment_gateway'
  | 'whatsapp_api'
  | 'calendar_sync'
  | 'biometric_device'

export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending'

// Provider types
export type SMSProvider = 'twilio' | 'msg91' | 'textlocal' | 'custom'
export type EmailProvider = 'sendgrid' | 'aws_ses' | 'mailgun' | 'smtp'
export type PaymentProvider = 'razorpay' | 'payu' | 'ccavenue' | 'stripe'
export type BiometricProvider = 'zkteco' | 'essl' | 'biomax' | 'generic'
export type WhatsAppProvider = 'twilio' | 'gupshup' | 'interakt' | 'wati'

export type DeviceType = 'fingerprint' | 'face' | 'card' | 'multi'
export type DeviceStatus = 'online' | 'offline' | 'syncing' | 'error'

// ==================== INTEGRATION CONFIG ====================

export interface IntegrationConfig {
  id: string
  type: IntegrationType
  name: string
  provider: string
  status: IntegrationStatus
  credentials: Record<string, string>
  settings: Record<string, unknown>
  lastTestedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateIntegrationRequest {
  type: IntegrationType
  name: string
  provider: string
  credentials: Record<string, string>
  settings?: Record<string, unknown>
}

export interface UpdateIntegrationRequest {
  name?: string
  provider?: string
  credentials?: Record<string, string>
  settings?: Record<string, unknown>
  status?: IntegrationStatus
}

export interface TestIntegrationResponse {
  success: boolean
  message: string
  responseTime?: number
  details?: Record<string, unknown>
}

// ==================== BIOMETRIC DEVICE ====================

export interface BiometricDevice {
  id: string
  name: string
  deviceSerial: string
  deviceIp: string
  devicePort: number
  provider: BiometricProvider
  location: string
  deviceType: DeviceType
  status: DeviceStatus
  lastSyncAt?: string
  enrolledCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateBiometricDeviceRequest {
  name: string
  deviceSerial: string
  deviceIp: string
  devicePort: number
  provider: BiometricProvider
  location: string
  deviceType: DeviceType
}

export interface UpdateBiometricDeviceRequest {
  name?: string
  deviceIp?: string
  devicePort?: number
  location?: string
  status?: DeviceStatus
}

export interface BiometricSyncResult {
  success: boolean
  recordsSynced: number
  newRecords: number
  updatedRecords: number
  errors: string[]
  syncedAt: string
}

// ==================== WEBHOOK ====================

export interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  secret?: string
  isActive: boolean
  lastTriggeredAt?: string
  successCount: number
  failureCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateWebhookRequest {
  name: string
  url: string
  events: string[]
  secret?: string
}

export interface UpdateWebhookRequest {
  name?: string
  url?: string
  events?: string[]
  secret?: string
  isActive?: boolean
}

// ==================== API KEY ====================

export interface APIKey {
  id: string
  name: string
  key: string
  keyPreview: string
  permissions: string[]
  expiresAt?: string
  lastUsedAt?: string
  isActive: boolean
  createdAt: string
}

export interface CreateAPIKeyRequest {
  name: string
  permissions: string[]
  expiresAt?: string
}

// ==================== FILTERS ====================

export interface IntegrationFilters {
  type?: IntegrationType
  status?: IntegrationStatus
  search?: string
}

export interface BiometricDeviceFilters {
  provider?: BiometricProvider
  status?: DeviceStatus
  location?: string
  search?: string
}

// ==================== CONSTANTS ====================

export const INTEGRATION_TYPES: IntegrationType[] = [
  'sms_gateway',
  'email_service',
  'payment_gateway',
  'whatsapp_api',
  'calendar_sync',
  'biometric_device',
]

export const INTEGRATION_TYPE_LABELS: Record<IntegrationType, string> = {
  sms_gateway: 'SMS Gateway',
  email_service: 'Email Service',
  payment_gateway: 'Payment Gateway',
  whatsapp_api: 'WhatsApp API',
  calendar_sync: 'Calendar Sync',
  biometric_device: 'Biometric Device',
}

export const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  error: 'Error',
  pending: 'Pending',
}

export const SMS_PROVIDERS: SMSProvider[] = ['twilio', 'msg91', 'textlocal', 'custom']
export const EMAIL_PROVIDERS: EmailProvider[] = ['sendgrid', 'aws_ses', 'mailgun', 'smtp']
export const PAYMENT_PROVIDERS: PaymentProvider[] = ['razorpay', 'payu', 'ccavenue', 'stripe']
export const BIOMETRIC_PROVIDERS: BiometricProvider[] = ['zkteco', 'essl', 'biomax', 'generic']
export const WHATSAPP_PROVIDERS: WhatsAppProvider[] = ['twilio', 'gupshup', 'interakt', 'wati']

export const SMS_PROVIDER_LABELS: Record<SMSProvider, string> = {
  twilio: 'Twilio',
  msg91: 'MSG91',
  textlocal: 'TextLocal',
  custom: 'Custom HTTP',
}

export const EMAIL_PROVIDER_LABELS: Record<EmailProvider, string> = {
  sendgrid: 'SendGrid',
  aws_ses: 'Amazon SES',
  mailgun: 'Mailgun',
  smtp: 'Custom SMTP',
}

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  razorpay: 'Razorpay',
  payu: 'PayU',
  ccavenue: 'CCAvenue',
  stripe: 'Stripe',
}

export const BIOMETRIC_PROVIDER_LABELS: Record<BiometricProvider, string> = {
  zkteco: 'ZKTeco',
  essl: 'eSSL',
  biomax: 'BioMax',
  generic: 'Generic',
}

export const WHATSAPP_PROVIDER_LABELS: Record<WhatsAppProvider, string> = {
  twilio: 'Twilio',
  gupshup: 'Gupshup',
  interakt: 'Interakt',
  wati: 'WATI',
}

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  fingerprint: 'Fingerprint',
  face: 'Face Recognition',
  card: 'Card Reader',
  multi: 'Multi-Modal',
}

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  syncing: 'Syncing',
  error: 'Error',
}

export const WEBHOOK_EVENTS = [
  'student.created',
  'student.updated',
  'student.deleted',
  'staff.created',
  'staff.updated',
  'staff.deleted',
  'attendance.marked',
  'fee.paid',
  'fee.overdue',
  'exam.scheduled',
  'result.published',
  'admission.applied',
  'admission.approved',
  'admission.rejected',
]

export const API_PERMISSIONS = [
  'students:read',
  'students:write',
  'staff:read',
  'staff:write',
  'attendance:read',
  'attendance:write',
  'finance:read',
  'finance:write',
  'exams:read',
  'exams:write',
  'admissions:read',
  'admissions:write',
]
