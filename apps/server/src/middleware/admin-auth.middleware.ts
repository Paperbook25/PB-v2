import type { Request, Response, NextFunction } from 'express'
import { auth } from '../lib/auth.js'
import { AppError } from '../utils/errors.js'
import { fromNodeHeaders } from 'better-auth/node'

/**
 * Middleware that verifies the user is a super admin.
 * Uses better-auth session verification.
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

    req.user = {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: 'admin',
    }

    next()
  } catch (error) {
    next(error instanceof AppError ? error : AppError.unauthorized('Invalid session'))
  }
}
