import type { Request, Response, NextFunction } from 'express'
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
