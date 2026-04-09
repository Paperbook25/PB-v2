import { prisma } from '../config/db.js'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { AppError } from '../utils/errors.js'
import { env } from '../config/env.js'

// AES-256-GCM encryption for sensitive credentials
// Key is derived from JWT_SECRET — 32 bytes required for AES-256
function getEncryptionKey(): Buffer {
  const secret = env.JWT_SECRET || 'fallback-secret-change-in-production'
  const key = Buffer.alloc(32)
  Buffer.from(secret).copy(key)
  return key
}

function encryptCredentials(plainCredentials: Record<string, string>): string {
  const key = getEncryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const json = JSON.stringify(plainCredentials)
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return JSON.stringify({
    iv: iv.toString('hex'),
    data: encrypted.toString('hex'),
    tag: tag.toString('hex'),
  })
}

function decryptCredentials(encryptedJson: string): Record<string, string> {
  try {
    const key = getEncryptionKey()
    const { iv, data, tag } = JSON.parse(encryptedJson)
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'))
    decipher.setAuthTag(Buffer.from(tag, 'hex'))
    const decrypted = Buffer.concat([decipher.update(Buffer.from(data, 'hex')), decipher.final()])
    return JSON.parse(decrypted.toString('utf8'))
  } catch {
    return {}
  }
}

function maskCredentials(credentials: Record<string, string>): Record<string, string> {
  const masked: Record<string, string> = {}
  for (const [key, value] of Object.entries(credentials)) {
    if (typeof value === 'string' && value.length > 8) {
      masked[key] = value.slice(0, 4) + '•'.repeat(value.length - 8) + value.slice(-4)
    } else {
      masked[key] = '••••••••'
    }
  }
  return masked
}

export async function listPlatformIntegrations(type?: string) {
  const integrations = await prisma.platformIntegration.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: 'asc' },
  })

  return integrations.map(integration => ({
    id: integration.id,
    type: integration.type,
    name: integration.name,
    provider: integration.provider,
    credentials: maskCredentials(decryptCredentials(JSON.stringify(integration.credentials))),
    settings: integration.settings,
    status: integration.status,
    isDefault: integration.isDefault,
    lastTestedAt: integration.lastTestedAt,
    createdAt: integration.createdAt,
    updatedAt: integration.updatedAt,
  }))
}

export async function getPlatformIntegration(id: string) {
  const integration = await prisma.platformIntegration.findUnique({ where: { id } })
  if (!integration) throw AppError.notFound('Platform integration not found')
  return integration
}

export async function getActivePlatformIntegration(type: string, provider: string) {
  const integration = await prisma.platformIntegration.findFirst({
    where: { type, provider, status: 'active', isDefault: true },
  })
  if (!integration) {
    // Fallback to any active one
    return prisma.platformIntegration.findFirst({
      where: { type, provider, status: 'active' },
    })
  }
  return integration
}

export async function getDecryptedCredentials(id: string): Promise<Record<string, string>> {
  const integration = await prisma.platformIntegration.findUnique({ where: { id } })
  if (!integration) throw AppError.notFound('Platform integration not found')
  return decryptCredentials(JSON.stringify(integration.credentials))
}

export async function createPlatformIntegration(data: {
  type: string
  name: string
  provider: string
  credentials: Record<string, string>
  settings?: Record<string, unknown>
  isDefault?: boolean
}) {
  const encrypted = encryptCredentials(data.credentials)

  // If setting as default, unset others of same type/provider
  if (data.isDefault) {
    await prisma.platformIntegration.updateMany({
      where: { type: data.type, provider: data.provider, isDefault: true },
      data: { isDefault: false },
    })
  }

  const integration = await prisma.platformIntegration.create({
    data: {
      type: data.type,
      name: data.name,
      provider: data.provider,
      credentials: JSON.parse(encrypted) as any,
      settings: (data.settings || {}) as any,
      isDefault: data.isDefault ?? false,
      status: 'inactive',
    },
  })

  return {
    id: integration.id,
    type: integration.type,
    name: integration.name,
    provider: integration.provider,
    status: integration.status,
    isDefault: integration.isDefault,
    createdAt: integration.createdAt,
  }
}

export async function updatePlatformIntegration(id: string, data: {
  name?: string
  credentials?: Record<string, string>
  settings?: Record<string, unknown>
  isDefault?: boolean
  status?: string
}) {
  const existing = await prisma.platformIntegration.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Platform integration not found')

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.status !== undefined) updateData.status = data.status
  if (data.settings !== undefined) updateData.settings = data.settings

  if (data.credentials) {
    // Merge with existing credentials so partial updates work
    const existingCreds = decryptCredentials(JSON.stringify(existing.credentials))
    const merged = { ...existingCreds, ...data.credentials }
    const encrypted = encryptCredentials(merged)
    updateData.credentials = JSON.parse(encrypted)
  }

  if (data.isDefault !== undefined) {
    updateData.isDefault = data.isDefault
    if (data.isDefault) {
      await prisma.platformIntegration.updateMany({
        where: { type: existing.type, provider: existing.provider, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }
  }

  const integration = await prisma.platformIntegration.update({
    where: { id },
    data: updateData as any,
  })

  // Invalidate email config cache if this was an email integration
  if (integration.type === 'email_service') {
    const { invalidateEmailConfigCache } = await import('./email.service.js')
    invalidateEmailConfigCache()
  }

  return {
    id: integration.id,
    type: integration.type,
    name: integration.name,
    provider: integration.provider,
    status: integration.status,
    isDefault: integration.isDefault,
    updatedAt: integration.updatedAt,
  }
}

export async function deletePlatformIntegration(id: string) {
  const existing = await prisma.platformIntegration.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Platform integration not found')

  await prisma.platformIntegration.delete({ where: { id } })
  return { success: true }
}

/** Exposed for email.service.ts to call without going through full service */
export function decryptPlatformCredentials(credentials: any): Record<string, string> {
  return decryptCredentials(JSON.stringify(credentials))
}

export async function testPlatformIntegration(id: string): Promise<{ success: boolean; message: string }> {
  const integration = await prisma.platformIntegration.findUnique({ where: { id } })
  if (!integration) throw AppError.notFound('Platform integration not found')

  const credentials = decryptCredentials(JSON.stringify(integration.credentials))

  try {
    let testResult: { success: boolean; message: string }

    if (integration.provider === 'razorpay') {
      testResult = await testRazorpayConnection(credentials)
    } else if (integration.type === 'email_service' && (integration.provider === 'resend' || integration.provider === 'sendgrid')) {
      testResult = await testResendConnection(credentials)
    } else {
      testResult = { success: false, message: `Test not implemented for provider: ${integration.provider}` }
    }

    // Update status and lastTestedAt
    await prisma.platformIntegration.update({
      where: { id },
      data: {
        status: testResult.success ? 'active' : 'error',
        lastTestedAt: new Date(),
      },
    })

    return testResult
  } catch (err: any) {
    await prisma.platformIntegration.update({
      where: { id },
      data: { status: 'error', lastTestedAt: new Date() },
    })
    return { success: false, message: err.message || 'Connection test failed' }
  }
}

async function testResendConnection(credentials: Record<string, string>) {
  const { apiKey } = credentials
  if (!apiKey) return { success: false, message: 'API Key is required' }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    // Validate by listing domains — lightweight, doesn't send email
    const { data, error } = await resend.domains.list()
    if (error) return { success: false, message: `Resend API error: ${error.message}` }
    return { success: true, message: `Connected to Resend successfully (${(data?.data?.length || 0)} domain(s) configured)` }
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to Resend' }
  }
}

async function testRazorpayConnection(credentials: Record<string, string>) {
  const { keyId, keySecret } = credentials
  if (!keyId || !keySecret) {
    return { success: false, message: 'Missing Razorpay Key ID or Key Secret' }
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const response = await fetch('https://api.razorpay.com/v1/payments?count=1', {
    headers: { Authorization: `Basic ${auth}` },
  })

  if (response.ok || response.status === 200) {
    return { success: true, message: 'Connected to Razorpay successfully' }
  }

  if (response.status === 401) {
    return { success: false, message: 'Invalid Razorpay credentials — authentication failed' }
  }

  return { success: false, message: `Razorpay API returned: ${response.status}` }
}
