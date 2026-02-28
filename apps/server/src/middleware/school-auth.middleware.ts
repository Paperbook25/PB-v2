import type { Request, Response, NextFunction } from 'express'
import { auth } from '../lib/auth.js'
import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { fromNodeHeaders } from 'better-auth/node'

/**
 * Better-auth session middleware for school-facing routes.
 *
 * Replaces the old JWT-based `authMiddleware`. It:
 *  1. Verifies the better-auth session from cookies
 *  2. Looks up the user's OrgMember record for the current tenant (req.schoolId)
 *  3. Populates req.user with the same JwtPayload shape so rbacMiddleware,
 *     controllers, and services all work unchanged.
 *
 * The OrgMember `role` field stores the better-auth org role (owner/admin/member).
 * We map it to the school-level role that the rest of the app expects:
 *   - owner  → admin
 *   - admin  → principal
 *   - member → teacher (default; can be overridden per-user later)
 *
 * For finer-grained roles (accountant, librarian, etc.), the OrgMember.role
 * can store those directly — the mapping only applies to the three standard
 * better-auth org roles.
 */

const ORG_ROLE_TO_SCHOOL_ROLE: Record<string, string> = {
  owner: 'admin',
  admin: 'principal',
  member: 'teacher',
}

export async function schoolAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session) {
      return next(AppError.unauthorized('Not authenticated'))
    }

    const user = session.user
    const schoolId = req.schoolId // set by subdomainTenantMiddleware → requireTenant

    // If there's no school context (shouldn't happen since school routes use requireTenant,
    // but just in case), fall back to a basic user object.
    if (!schoolId) {
      req.user = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: (user as any).role || 'user',
      }
      return next()
    }

    // Platform admins (super admins) bypass org membership checks
    if ((user as any).role === 'admin') {
      req.user = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: 'admin',
        organizationId: schoolId,
      }
      return next()
    }

    // Look up the user's membership in this school's organization
    const membership = await prisma.orgMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: schoolId,
          userId: user.id,
        },
      },
      select: { role: true },
    })

    if (!membership) {
      return next(AppError.forbidden('You are not a member of this school.'))
    }

    // Map the org role to a school-level role
    const schoolRole = ORG_ROLE_TO_SCHOOL_ROLE[membership.role] || membership.role

    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: schoolRole,
      organizationId: schoolId,
    }

    next()
  } catch (error) {
    next(error instanceof AppError ? error : AppError.unauthorized('Invalid session'))
  }
}
