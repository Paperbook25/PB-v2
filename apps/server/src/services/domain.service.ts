import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { randomBytes } from 'crypto'
import dns from 'dns/promises'

export async function createMapping(schoolId: string, domain: string) {
  // Normalize domain
  const normalizedDomain = domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')

  // Basic validation
  if (!normalizedDomain || normalizedDomain.length > 253) {
    throw AppError.badRequest('Invalid domain name.')
  }

  // Must look like a valid domain (at least one dot, no spaces)
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(normalizedDomain)) {
    throw AppError.badRequest('Invalid domain format. Example: school.example.com')
  }

  // Check if domain already mapped
  const existing = await prisma.domainMapping.findUnique({
    where: { domain: normalizedDomain },
  })
  if (existing) {
    if (existing.organizationId === schoolId) return existing
    throw AppError.conflict('This domain is already mapped to another school.')
  }

  // Generate verification token
  const verifyToken = `pb-verify-${randomBytes(16).toString('hex')}`

  return prisma.domainMapping.create({
    data: {
      organizationId: schoolId,
      domain: normalizedDomain,
      verifyToken,
    },
  })
}

export async function verifyDns(schoolId: string, id: string) {
  const mapping = await prisma.domainMapping.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!mapping) throw AppError.notFound('Domain mapping not found')
  if (mapping.isVerified) return { verified: true, message: 'Domain already verified' }

  try {
    // Check TXT record: _paperbook-verify.domain.com
    const txtRecords = await dns.resolveTxt(`_paperbook-verify.${mapping.domain}`)
    const flatRecords = txtRecords.map((r) => r.join(''))

    if (flatRecords.includes(mapping.verifyToken)) {
      await prisma.domainMapping.update({
        where: { id },
        data: { isVerified: true, verifiedAt: new Date(), sslStatus: 'active' },
      })

      // Also update WebsiteSettings.customDomain
      const settings = await prisma.websiteSettings.findFirst({
        where: { organizationId: schoolId },
      })
      if (settings) {
        await prisma.websiteSettings.update({
          where: { id: settings.id },
          data: { customDomain: mapping.domain },
        })
      }

      return { verified: true, message: 'Domain verified successfully!' }
    }

    return {
      verified: false,
      message: 'TXT record not found. Please add the DNS record and try again.',
    }
  } catch (err: any) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return {
        verified: false,
        message: 'DNS record not found. Please add the TXT record and try again.',
      }
    }
    return { verified: false, message: `DNS lookup failed: ${err.message}` }
  }
}

export async function listMappings(schoolId: string) {
  return prisma.domainMapping.findMany({
    where: { organizationId: schoolId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function deleteMapping(schoolId: string, id: string) {
  const mapping = await prisma.domainMapping.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!mapping) throw AppError.notFound('Domain mapping not found')

  await prisma.domainMapping.delete({ where: { id } })

  // Clear customDomain from settings if it matches
  const settings = await prisma.websiteSettings.findFirst({
    where: { organizationId: schoolId },
  })
  if (settings?.customDomain === mapping.domain) {
    await prisma.websiteSettings.update({
      where: { id: settings.id },
      data: { customDomain: null },
    })
  }

  return { success: true }
}

// Used by tenant middleware for custom domain resolution
export async function lookupDomainToOrg(domain: string) {
  const mapping = await prisma.domainMapping.findUnique({
    where: { domain: domain.toLowerCase() },
  })
  if (!mapping || !mapping.isVerified) return null
  return mapping.organizationId
}
