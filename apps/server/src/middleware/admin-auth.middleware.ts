import type { Request, Response, NextFunction } from 'express'
import { auth } from '../lib/auth.js'
import { AppError } from '../utils/errors.js'
import { fromNodeHeaders } from 'better-auth/node'
import { prisma } from '../config/db.js'

/**
 * Middleware that verifies the user is a super admin.
 * Also loads GravityAdmin role for fine-grained RBAC.
 */
export async function adminAuthMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
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
