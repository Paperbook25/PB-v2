import type { Request, Response, NextFunction } from 'express'
import * as adminUserService from '../services/admin-user.service.js'

function paramStr(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value
}

/**
 * GET /api/admin/users
 * List all users with pagination and filtering.
 */
export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminUserService.listUsers({
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      role: req.query.role as string | undefined,
      search: req.query.search as string | undefined,
      isActive: req.query.isActive !== undefined
        ? req.query.isActive === 'true'
        : undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/users/:id
 * Get a single user's details.
 */
export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminUserService.getUser(paramStr(req.params.id))
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/admin/users/:id/ban
 * Ban a user.
 */
export async function banUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminUserService.banUser(paramStr(req.params.id))
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/admin/users/:id/unban
 * Unban a user.
 */
export async function unbanUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminUserService.unbanUser(paramStr(req.params.id))
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/admin/users/impersonate
 * Impersonate a user (placeholder for better-auth impersonation).
 */
export async function impersonate(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    // Placeholder: In production, this would use better-auth's admin
    // impersonation API to create a session as the target user.
    // For now, return a message indicating the feature is available.
    res.json({
      message: 'Impersonation initiated',
      targetUserId: userId,
      note: 'Use better-auth admin plugin impersonation endpoint for full implementation',
    })
  } catch (error) {
    next(error)
  }
}
