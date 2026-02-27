import type { Request, Response, NextFunction } from 'express'
import type { Role } from '@prisma/client'
import * as permissionService from '../services/permission.service.js'
import { AppError } from '../utils/errors.js'

const VALID_ROLES: Role[] = [
  'admin', 'principal', 'teacher', 'accountant',
  'librarian', 'transport_manager', 'student', 'parent',
]

/**
 * GET /api/permissions
 * List all permissions grouped by module (admin/principal only)
 */
export async function getAllPermissions(_req: Request, res: Response, next: NextFunction) {
  try {
    const grouped = await permissionService.getAllPermissions()
    res.json({ data: grouped })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/permissions/role/:role
 * Get permissions for a specific role
 */
export async function getPermissionsForRole(req: Request, res: Response, next: NextFunction) {
  try {
    const role = req.params.role as Role

    if (!VALID_ROLES.includes(role)) {
      throw AppError.badRequest(`Invalid role: ${role}`)
    }

    const permissions = await permissionService.getPermissionsForRole(role)
    res.json({ data: permissions })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/permissions/role/:role
 * Update permissions for a role (admin/principal only)
 * Body: { permissions: [{ slug: string, granted: boolean }] }
 */
export async function updateRolePermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const role = req.params.role as Role

    if (!VALID_ROLES.includes(role)) {
      throw AppError.badRequest(`Invalid role: ${role}`)
    }

    // Prevent modifying admin permissions
    if (role === 'admin') {
      throw AppError.forbidden('Cannot modify admin permissions')
    }

    const { permissions } = req.body as { permissions: { slug: string; granted: boolean }[] }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw AppError.badRequest('permissions array is required')
    }

    // Validate each entry has slug and granted fields
    for (const p of permissions) {
      if (typeof p.slug !== 'string' || typeof p.granted !== 'boolean') {
        throw AppError.badRequest('Each permission must have a string slug and boolean granted')
      }
    }

    const grantedBy = req.user?.userId || undefined
    const results = await permissionService.updateRolePermissions(role, permissions, grantedBy)

    // Return updated permissions for the role
    const updated = await permissionService.getPermissionsForRole(role)
    res.json({ data: updated, message: `Updated ${results.length} permissions for role '${role}'` })
  } catch (err) {
    next(err)
  }
}
