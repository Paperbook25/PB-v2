import type { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { AppError } from '../utils/errors.js'

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const fields: Record<string, string[]> = {}
        for (const issue of err.issues) {
          const path = issue.path.join('.')
          if (!fields[path]) fields[path] = []
          fields[path].push(issue.message)
        }
        throw AppError.validation('Validation failed', fields)
      }
      throw err
    }
  }
}
