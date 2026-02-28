import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

type Role = 'admin' | 'principal' | 'teacher' | 'accountant' | 'librarian' | 'transport_manager' | 'student' | 'parent'

export function rbacMiddleware(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw AppError.unauthorized()
    }

    const userRole = req.user.role as Role

    if (!allowedRoles.includes(userRole)) {
      throw AppError.forbidden(`Role '${userRole}' does not have access to this resource`)
    }

    next()
  }
}

/**
 * Permission-based middleware that checks if the user's role has a specific permission granted.
 * Admin role always passes (has all permissions).
 */
export function requirePermission(permissionSlug: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw AppError.unauthorized()
    }

    // Admin always has all permissions
    if (req.user.role === 'admin') {
      return next()
    }

    const rolePerms = await prisma.rolePermission.findMany({
      where: {
        role: req.user.role as Role,
        permission: { slug: permissionSlug },
        granted: true,
      },
      include: { permission: true },
    })

    if (rolePerms.length === 0) {
      throw AppError.forbidden(`Missing permission: ${permissionSlug}`)
    }

    next()
  }
}
