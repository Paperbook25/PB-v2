import { faker } from '@faker-js/faker'
import type {
  IntegrationConfig,
  BiometricDevice,
  Webhook,
  APIKey,
  IntegrationType,
  IntegrationStatus,
  BiometricProvider,
  DeviceType,
  DeviceStatus,
} from '@/features/integrations/types/integrations.types'

// ==================== INTEGRATIONS ====================

export const integrations: IntegrationConfig[] = [
  {
    id: 'int_001',
    type: 'sms_gateway',
    name: 'Primary SMS Gateway',
    provider: 'msg91',
    status: 'active',
    credentials: {
      authKey: '***************',
      senderId: 'PBSCHOOL',
    },
    settings: {
      defaultRoute: 'transactional',
      enableDND: true,
    },
    lastTestedAt: faker.date.recent({ days: 1 }).toISOString(),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 7 }).toISOString(),
  },
  {
    id: 'int_002',
    type: 'email_service',
    name: 'SendGrid Email',
    provider: 'sendgrid',
    status: 'active',
    credentials: {
      apiKey: '***************',
    },
    settings: {
      fromEmail: 'noreply@paperbook.edu',
      fromName: 'Paperbook School',
      replyTo: 'admin@paperbook.edu',
    },
    lastTestedAt: faker.date.recent({ days: 1 }).toISOString(),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 3 }).toISOString(),
  },
  {
    id: 'int_003',
    type: 'payment_gateway',
    name: 'Razorpay',
    provider: 'razorpay',
    status: 'active',
    credentials: {
      keyId: '***************',
      keySecret: '***************',
    },
    settings: {
      currency: 'INR',
      autoCapture: true,
      sendReceipt: true,
    },
    lastTestedAt: faker.date.recent({ days: 2 }).toISOString(),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 14 }).toISOString(),
  },
  {
    id: 'int_004',
    type: 'whatsapp_api',
    name: 'WhatsApp Business',
    provider: 'twilio',
    status: 'inactive',
    credentials: {
      accountSid: '***************',
      authToken: '***************',
      whatsappNumber: '+14155238886',
    },
    settings: {
      templateApprovalRequired: true,
    },
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  },
]

// ==================== BIOMETRIC DEVICES ====================

const locations = ['Main Entrance', 'Staff Room', 'Admin Office', 'Back Gate', 'Library']
const providers: BiometricProvider[] = ['zkteco', 'essl', 'biomax']
const deviceTypes: DeviceType[] = ['fingerprint', 'face', 'card', 'multi']
const statuses: DeviceStatus[] = ['online', 'offline', 'syncing']

export const biometricDevices: BiometricDevice[] = [
  {
    id: 'bio_001',
    name: 'Main Gate Fingerprint',
    deviceSerial: 'ZKT-2024-001',
    deviceIp: '192.168.1.101',
    devicePort: 4370,
    provider: 'zkteco',
    location: 'Main Entrance',
    deviceType: 'fingerprint',
    status: 'online',
    lastSyncAt: new Date().toISOString(),
    enrolledCount: 245,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 1 }).toISOString(),
  },
  {
    id: 'bio_002',
    name: 'Staff Room Face Scanner',
    deviceSerial: 'ZKT-2024-002',
    deviceIp: '192.168.1.102',
    devicePort: 4370,
    provider: 'zkteco',
    location: 'Staff Room',
    deviceType: 'face',
    status: 'online',
    lastSyncAt: new Date().toISOString(),
    enrolledCount: 52,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 1 }).toISOString(),
  },
  {
    id: 'bio_003',
    name: 'Admin Office Card Reader',
    deviceSerial: 'ESSL-2024-001',
    deviceIp: '192.168.1.103',
    devicePort: 5005,
    provider: 'essl',
    location: 'Admin Office',
    deviceType: 'card',
    status: 'offline',
    lastSyncAt: faker.date.recent({ days: 2 }).toISOString(),
    enrolledCount: 15,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 2 }).toISOString(),
  },
  {
    id: 'bio_004',
    name: 'Back Gate Multi-Modal',
    deviceSerial: 'ZKT-2024-003',
    deviceIp: '192.168.1.104',
    devicePort: 4370,
    provider: 'zkteco',
    location: 'Back Gate',
    deviceType: 'multi',
    status: 'online',
    lastSyncAt: new Date().toISOString(),
    enrolledCount: 180,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 1 }).toISOString(),
  },
]

// ==================== WEBHOOKS ====================

export const webhooks: Webhook[] = [
  {
    id: 'wh_001',
    name: 'ERP Sync',
    url: 'https://erp.example.com/webhooks/paperbook',
    events: ['student.created', 'student.updated', 'fee.paid'],
    secret: 'whsec_***************',
    isActive: true,
    lastTriggeredAt: new Date().toISOString(),
    successCount: 1523,
    failureCount: 12,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 7 }).toISOString(),
  },
  {
    id: 'wh_002',
    name: 'Parent App Notifications',
    url: 'https://parent-app.example.com/api/notify',
    events: ['attendance.marked', 'exam.scheduled', 'result.published'],
    secret: 'whsec_***************',
    isActive: true,
    lastTriggeredAt: new Date().toISOString(),
    successCount: 8432,
    failureCount: 45,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 3 }).toISOString(),
  },
  {
    id: 'wh_003',
    name: 'Analytics Dashboard',
    url: 'https://analytics.example.com/ingest',
    events: ['student.created', 'staff.created', 'admission.applied', 'admission.approved'],
    isActive: false,
    successCount: 234,
    failureCount: 89,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  },
]

// ==================== API KEYS ====================

function generateAPIKey(): string {
  return `pk_live_${faker.string.alphanumeric(32)}`
}

export const apiKeys: APIKey[] = [
  {
    id: 'key_001',
    name: 'Mobile App Production',
    key: generateAPIKey(),
    keyPreview: 'pk_live_****************************abc1',
    permissions: ['students:read', 'attendance:read', 'attendance:write'],
    lastUsedAt: new Date().toISOString(),
    isActive: true,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  },
  {
    id: 'key_002',
    name: 'ERP Integration',
    key: generateAPIKey(),
    keyPreview: 'pk_live_****************************xyz2',
    permissions: ['students:read', 'students:write', 'staff:read', 'finance:read'],
    lastUsedAt: faker.date.recent({ days: 1 }).toISOString(),
    isActive: true,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  },
  {
    id: 'key_003',
    name: 'Analytics Service',
    key: generateAPIKey(),
    keyPreview: 'pk_live_****************************def3',
    permissions: ['students:read', 'attendance:read', 'exams:read'],
    expiresAt: faker.date.future({ years: 1 }).toISOString(),
    isActive: true,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  },
  {
    id: 'key_004',
    name: 'Legacy System (Deprecated)',
    key: generateAPIKey(),
    keyPreview: 'pk_live_****************************ghi4',
    permissions: ['students:read'],
    isActive: false,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
  },
]

// ==================== HELPER FUNCTIONS ====================

export function generateId(prefix: string): string {
  return `${prefix}_${faker.string.alphanumeric(6)}`
}
