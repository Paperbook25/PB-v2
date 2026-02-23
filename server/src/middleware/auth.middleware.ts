import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, type JwtPayload } from '../utils/jwt.js'
import { AppError } from '../utils/errors.js'

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or invalid authorization header')
  }

  const token = authHeader.substring(7)

  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch {
    throw AppError.unauthorized('Invalid or expired token')
  }
}
