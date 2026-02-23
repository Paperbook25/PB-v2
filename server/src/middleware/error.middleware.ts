import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors.js'
import { env } from '../config/env.js'

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      fields: err.fields,
      timestamp: new Date().toISOString(),
    })
    return
  }

  // Log unexpected errors
  console.error('Unhandled error:', err)

  res.status(500).json({
    error: env.isDev ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  })
}
