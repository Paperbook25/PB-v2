import { prisma } from '../config/db.js'

interface AuditLogQuery {
  module?: string
  action?: string
  search?: string
  page?: number
  limit?: number
}

export async function listAuditLogs(query: AuditLogQuery) {
  const page = query.page || 1
  const limit = query.limit || 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (query.module) {
    where.module = query.module
  }
  if (query.action) {
    where.action = query.action
  }
  if (query.search) {
    where.OR = [
      { userName: { contains: query.search } },
      { description: { contains: query.search } },
      { entityName: { contains: query.search } },
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

  return {
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
  }
}
