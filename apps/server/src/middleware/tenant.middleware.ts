import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/db.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/errors.js'

// ---------------------------------------------------------------------------
// Express type extensions
// ---------------------------------------------------------------------------
declare global {
  namespace Express {
    interface Request {
      schoolId?: string
      tenantSlug?: string | null
      tenantOrg?: {
        id: string
        name: string
        slug: string
        logo: string | null
        status: string
        planTier: string
      } | null
    }
  }
}

// ---------------------------------------------------------------------------
// In-memory cache for tenant lookups (avoids DB hit on every request)
// ---------------------------------------------------------------------------
interface CachedTenant {
  org: NonNullable<Request['tenantOrg']>
  expiresAt: number
}

const tenantCache = new Map<string, CachedTenant>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/** Evict a slug from the cache (called after school create/update/delete). */
export function evictTenantCache(slug: string) {
  tenantCache.delete(slug.toLowerCase())
}

/** Evict all entries (called after bulk operations). */
export function clearTenantCache() {
  tenantCache.clear()
}

// ---------------------------------------------------------------------------
// Subdomain extraction
// ---------------------------------------------------------------------------

/** Reserved subdomains that cannot be used as school slugs. */
const RESERVED_SLUGS = new Set([
  'www', 'app', 'api', 'admin', 'mail', 'status', 'blog',
  'docs', 'help', 'support', 'cdn', 'static', 'assets',
  'staging', 'dev', 'test', 'demo',
])

/** Base domain from config — e.g. 'paperbook.local' (dev) or 'paperbook.app' (prod). */
const BASE_DOMAINS = [env.APP_DOMAIN]

/**
 * Extract the school slug from the request hostname.
 *
 * Examples:
 *   school1.paperbook.local  → "school1"
 *   school1.paperbook.app    → "school1"
 *   paperbook.local          → null  (bare domain)
 *   localhost                 → null
 *   admin.paperbook.local    → null  (reserved)
 *
 * Security: only alphanumeric + hyphens, max 63 chars (DNS label rules).
 */
export function extractSlug(hostname: string): string | null {
  // Strip port if present
  const host = hostname.split(':')[0].toLowerCase()

  for (const base of BASE_DOMAINS) {
    if (host.endsWith(`.${base}`)) {
      const slug = host.slice(0, -(base.length + 1)) // remove ".base"

      // Validate: must be a single DNS label (no dots), alphanumeric + hyphens
      if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) {
        return null
      }

      if (RESERVED_SLUGS.has(slug)) {
        return null
      }

      return slug
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Tenant resolution middleware (runs on EVERY request)
// ---------------------------------------------------------------------------

/**
 * Resolves the tenant (school) from the subdomain in the Host header.
 * Attaches `req.tenantSlug`, `req.tenantOrg`, and `req.schoolId`.
 *
 * This does NOT block requests — it enriches the request with tenant info.
 * Individual route handlers / downstream middleware decide whether to enforce.
 */
export async function subdomainTenantMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const hostname = req.hostname || req.headers.host || ''
    const slug = extractSlug(hostname)

    if (!slug) {
      // No subdomain (localhost, bare domain, admin portal) — no tenant
      req.tenantSlug = null
      req.tenantOrg = null
      return next()
    }

    req.tenantSlug = slug

    // Check cache first
    const cached = tenantCache.get(slug)
    if (cached && cached.expiresAt > Date.now()) {
      req.tenantOrg = cached.org
      req.schoolId = cached.org.id
      return next()
    }

    // DB lookup: Organization (slug) + SchoolProfile (status, plan)
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        profile: {
          select: {
            status: true,
            planTier: true,
          },
        },
      },
    })

    if (org && org.slug) {
      const tenant = {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        status: org.profile?.status || 'active',
        planTier: org.profile?.planTier || 'free',
      }
      tenantCache.set(slug, { org: tenant, expiresAt: Date.now() + CACHE_TTL })
      req.tenantOrg = tenant
      req.schoolId = org.id
    } else {
      req.tenantOrg = null
    }

    next()
  } catch (error) {
    // Don't crash the server on tenant resolution failure
    console.error('[Tenant] Resolution error:', error)
    req.tenantSlug = null
    req.tenantOrg = null
    next()
  }
}

// ---------------------------------------------------------------------------
// Enforcement middleware (used on school-facing routes)
// ---------------------------------------------------------------------------

/**
 * Require a valid, active tenant. Use this on routes that MUST be scoped
 * to a school (e.g., /api/students, /api/attendance).
 *
 * Security checks:
 * 1. Subdomain must resolve to an existing school
 * 2. School must not be suspended or churned
 * 3. If user is authenticated, their org membership must match the subdomain
 */
export async function requireTenant(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.tenantSlug) {
    return next(AppError.badRequest(`No school context. Access via a school subdomain (e.g., school1.${env.APP_DOMAIN}).`))
  }

  if (!req.tenantOrg) {
    return next(AppError.notFound(`School "${req.tenantSlug}" not found.`))
  }

  if (req.tenantOrg.status === 'suspended') {
    return next(AppError.forbidden('This school has been suspended. Contact your administrator.'))
  }

  if (req.tenantOrg.status === 'churned') {
    return next(AppError.notFound(`School "${req.tenantSlug}" is no longer active.`))
  }

  // If the user is authenticated via JWT, verify they belong to this org.
  if (req.user && req.schoolId) {
    if (req.user.organizationId) {
      if (req.user.organizationId !== req.schoolId) {
        return next(AppError.forbidden('Your account does not belong to this school.'))
      }
    } else {
      const membership = await prisma.orgMember.findFirst({
        where: {
          userId: req.user.userId,
          organizationId: req.schoolId,
        },
        select: { id: true },
      })

      if (!membership) {
        return next(AppError.forbidden('Your account does not belong to this school.'))
      }
    }
  }

  next()
}

// ---------------------------------------------------------------------------
// Tenant-scoped model list (for Prisma middleware / query scoping)
// ---------------------------------------------------------------------------

/**
 * Prisma models that MUST be filtered by schoolId in all queries.
 * If a query on one of these models is missing a schoolId filter,
 * it's a data-leak bug.
 */
export const TENANT_SCOPED_MODELS = [
  'Student', 'StudentAddress', 'StudentParent', 'StudentHealthRecord',
  'StudentDocument', 'StudentTimelineEvent', 'StudentSibling',
  'Staff', 'StaffAddress', 'StaffQualification', 'StaffBankDetails',
  'Department', 'Designation',
  'StudentDailyAttendance', 'StudentAttendanceRecord', 'PeriodAttendance',
  'StaffDailyAttendance', 'LeaveBalance', 'LeaveRequest',
  'Room', 'Timetable', 'TimetableEntry', 'Substitution',
  'FeeType', 'FeeStructure', 'StudentFee', 'Payment', 'Expense', 'LedgerEntry',
  'AdmissionApplication', 'AdmissionDocument',
  'Exam', 'StudentMark', 'GradeScale', 'ReportCard',
  'BankQuestion', 'OnlineExam',
  'CalendarEvent', 'AcademicYear', 'Class', 'Section', 'Subject',
  'SchoolAddon', 'Permission', 'RolePermission',
  'WebsitePage', 'WebsiteSection', 'WebsiteSettings', 'WebsiteMedia',
]
