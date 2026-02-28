import { Router } from 'express'
import { prisma } from '../../config/db.js'

const router = Router()

/**
 * GET /api/admin/audit
 * Paginated audit log with filters for action, module, and date range.
 *
 * Query parameters:
 *   - page (number, default 1)
 *   - limit (number, default 20)
 *   - action (string, e.g. "create", "update", "delete", "status_change")
 *   - module (string, e.g. "schools", "users", "addons", "auth")
 *   - startDate (ISO-8601 date string)
 *   - endDate (ISO-8601 date string)
 *   - search (string, searches userName, description, entityName)
 *   - userId (string, filter by specific user)
 */
router.get('/', async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Filter by action type
    if (req.query.action) {
      where.action = req.query.action as string
    }

    // Filter by module
    if (req.query.module) {
      where.module = req.query.module as string
    }

    // Filter by user
    if (req.query.userId) {
      where.userId = req.query.userId as string
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      const createdAt: Record<string, Date> = {}
      if (req.query.startDate) {
        createdAt.gte = new Date(req.query.startDate as string)
      }
      if (req.query.endDate) {
        createdAt.lte = new Date(req.query.endDate as string)
      }
      where.createdAt = createdAt
    }

    // Text search across userName, description, entityName
    if (req.query.search) {
      const searchTerm = req.query.search as string
      where.OR = [
        { userName: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { entityName: { contains: searchTerm, mode: 'insensitive' } },
      ]
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    res.json({
      data: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        userName: log.userName,
        userRole: log.userRole,
        action: log.action,
        module: log.module,
        entityType: log.entityType,
        entityId: log.entityId,
        entityName: log.entityName,
        description: log.description,
        changes: log.changes || null,
        ipAddress: log.ipAddress,
        timestamp: log.createdAt.toISOString(),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
})

export default router
