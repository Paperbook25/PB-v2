import type { Request, Response, NextFunction } from 'express'
import { auth } from '../lib/auth.js'
import { AppError } from '../utils/errors.js'
import { fromNodeHeaders } from 'better-auth/node'
import { prisma } from '../config/db.js'
import jwt from 'jsonwebtoken'

const GRAVITY_COOKIE = 'gravity_admin_token'
const GRAVITY_PURPOSE = 'gravity_admin_v1'

function parseCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Middleware that verifies the user is a super admin.
 * Checks custom gravity JWT cookie first (bypasses better-auth origin issues),
 * then falls back to better-auth session.
 */
export async function adminAuthMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    // --- Primary: custom gravity JWT cookie ---
    const gravityToken = parseCookie(req.headers.cookie, GRAVITY_COOKIE)
    if (gravityToken) {
      try {
        const payload = jwt.verify(gravityToken, process.env.JWT_SECRET!) as any
        if (payload.purpose === GRAVITY_PURPOSE) {
          // Load GravityAdmin record for role-based checks
          let gravityRole = payload.role || 'admin'
          try {
            const gravityAdmin = await prisma.gravityAdmin.findUnique({ where: { userId: payload.userId } })
            if (gravityAdmin) {
              if (!gravityAdmin.isActive) return next(AppError.forbidden('Your admin account has been deactivated'))
              gravityRole = gravityAdmin.role
            }
          } catch { /* GravityAdmin table may not exist yet */ }

          req.user = { userId: payload.userId, email: payload.email, name: payload.name, role: gravityRole as any }
          return next()
        }
      } catch {
        // Invalid/expired token — fall through to better-auth
      }
    }

    // --- Fallback: better-auth session ---
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session) {
      return next(AppError.unauthorized('Not authenticated'))
    }

    if ((session.user as any).role !== 'admin') {
      return next(AppError.forbidden('Super admin access required'))
    }

    // Load GravityAdmin record for role-based checks
    let gravityRole = 'admin'
    try {
      const gravityAdmin = await prisma.gravityAdmin.findUnique({
        where: { userId: session.user.id },
      })
      if (gravityAdmin) {
        if (!gravityAdmin.isActive) {
          return next(AppError.forbidden('Your admin account has been deactivated'))
        }
        gravityRole = gravityAdmin.role
      }
    } catch {
      // GravityAdmin table may not exist yet — continue with default role
    }

    req.user = {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: gravityRole as any,
    }

    next()
  } catch (error) {
    next(error instanceof AppError ? error : AppError.unauthorized('Invalid session'))
  }
}

/**
 * RBAC middleware for Gravity admin roles.
 * Use after adminAuthMiddleware to restrict specific routes.
 */
export function adminRbac(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role || 'viewer'
    // super_admin bypasses all checks
    if (role === 'super_admin' || allowedRoles.includes(role)) {
      return next()
    }
    next(AppError.forbidden(`This action requires one of: ${allowedRoles.join(', ')}`))
  }
}
