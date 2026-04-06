import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import crypto from 'crypto'
import { env } from '../config/env.js'

// ============================================================================
// Encryption helpers — AES-256-GCM for credential storage
// ============================================================================

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getEncryptionKey(): Buffer {
  // Derive a 32-byte key from JWT_SECRET
  return crypto.scryptSync(env.JWT_SECRET, 'integration-salt', 32)
}

export function encryptCredentials(data: Record<string, string>): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const tag = cipher.getAuthTag()
  // Store as iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`
}

export function decryptCredentials(encrypted: string): Record<string, string> {
  try {
    const [ivHex, tagHex, data] = encrypted.split(':')
    const key = getEncryptionKey()
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    let decrypted = decipher.update(data, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return JSON.parse(decrypted)
  } catch {
    throw AppError.badRequest('Failed to decrypt credentials')
  }
}

// ============================================================================
// Integration CRUD
// ============================================================================

export async function listIntegrations(organizationId: string, filters?: { type?: string; status?: string; search?: string }) {
  const where: any = { organizationId }
  if (filters?.type) where.type = filters.type
  if (filters?.status) where.status = filters.status
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { provider: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  const integrations = await prisma.integration.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  // Mask credentials in response
  return integrations.map(i => ({
    ...i,
    credentials: maskCredentials(i.credentials as any),
  }))
}

export async function getIntegration(id: string, organizationId: string) {
  const integration = await prisma.integration.findFirst({
    where: { id, organizationId },
  })
  if (!integration) throw AppError.notFound('Integration not found')
  return {
    ...integration,
    credentials: maskCredentials(integration.credentials as any),
  }
}

export async function createIntegration(organizationId: string, data: {
  type: string
  name: string
  provider: string
  credentials: Record<string, string>
  settings?: Record<string, unknown>
}) {
  // Encrypt credentials before storing
  const encryptedCreds = encryptCredentials(data.credentials)

  return prisma.integration.create({
    data: {
      organizationId,
      type: data.type,
      name: data.name,
      provider: data.provider,
      credentials: encryptedCreds as any,
      settings: (data.settings || {}) as any,
      status: 'inactive',
    },
  })
}

export async function updateIntegration(id: string, organizationId: string, data: {
  name?: string
  provider?: string
  credentials?: Record<string, string>
  settings?: Record<string, unknown>
  status?: string
}) {
  const existing = await prisma.integration.findFirst({ where: { id, organizationId } })
  if (!existing) throw AppError.notFound('Integration not found')

  const updateData: any = {}
  if (data.name) updateData.name = data.name
  if (data.provider) updateData.provider = data.provider
  if (data.settings) updateData.settings = data.settings
  if (data.status) updateData.status = data.status
  if (data.credentials) {
    updateData.credentials = encryptCredentials(data.credentials)
  }

  return prisma.integration.update({ where: { id }, data: updateData })
}

export async function deleteIntegration(id: string, organizationId: string) {
  const existing = await prisma.integration.findFirst({ where: { id, organizationId } })
  if (!existing) throw AppError.notFound('Integration not found')
  await prisma.integration.delete({ where: { id } })
  return { success: true }
}

/** Get decrypted credentials for internal use (service-to-service) */
export async function getDecryptedCredentials(id: string, organizationId: string): Promise<Record<string, string>> {
  const integration = await prisma.integration.findFirst({ where: { id, organizationId } })
  if (!integration) throw AppError.notFound('Integration not found')
  const creds = integration.credentials as string
  return decryptCredentials(creds)
}

/** Get active integration by type+provider for an org */
export async function getActiveIntegration(organizationId: string, type: string, provider?: string) {
  const where: any = { organizationId, type, status: 'active' }
  if (provider) where.provider = provider
  const integration = await prisma.integration.findFirst({ where })
  if (!integration) return null
  return {
    ...integration,
    decryptedCredentials: decryptCredentials(integration.credentials as string),
  }
}

export async function markIntegrationTested(id: string, status: 'active' | 'error') {
  return prisma.integration.update({
    where: { id },
    data: { lastTestedAt: new Date(), status },
  })
}

// ============================================================================
// Helpers
// ============================================================================

function maskCredentials(creds: any): Record<string, string> {
  // If it's encrypted string, just return masked indicators
  if (typeof creds === 'string') {
    return { _encrypted: '••••••••' }
  }
  // If it's a plain object (shouldn't happen after encryption, but fallback)
  if (typeof creds === 'object') {
    const masked: Record<string, string> = {}
    for (const [key, val] of Object.entries(creds)) {
      const str = String(val)
      masked[key] = str.length > 8 ? str.substring(0, 4) + '••••' + str.substring(str.length - 4) : '••••••••'
    }
    return masked
  }
  return {}
}
