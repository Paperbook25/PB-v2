import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/db.js'

interface AuditOptions {
  module: string
  entityType: string
}

export function auditMiddleware(options: AuditOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only log mutations (POST, PUT, PATCH, DELETE)
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      next()
      return
    }

    // Capture original json method to intercept response
    const originalJson = res.json.bind(res)

    res.json = function (body: unknown) {
      // Log asynchronously — don't block the response
      const action = getActionFromMethod(req.method)
      const entityId = req.params.id || (body as Record<string, unknown>)?.id as string || ''

      if (req.user) {
        prisma.auditLog.create({
          data: {
            userId: req.user.userId,
            userName: req.user.name,
            userRole: req.user.role,
            action,
            module: options.module,
            entityType: options.entityType,
            entityId: String(entityId),
            description: `${action} ${options.entityType}`,
            ipAddress: req.ip || req.socket.remoteAddress || null,
            changes: req.method === 'PUT' || req.method === 'PATCH' ? req.body : undefined,
          },
        }).catch((err) => {
          console.error('Failed to create audit log:', err)
        })
      }

      return originalJson(body)
    }

    next()
  }
}

function getActionFromMethod(method: string): string {
  switch (method) {
    case 'POST': return 'create'
    case 'PUT': return 'update'
    case 'PATCH': return 'status_change'
    case 'DELETE': return 'delete'
    default: return method.toLowerCase()
  }
}
