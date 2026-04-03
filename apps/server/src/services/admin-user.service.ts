import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ============================================================================
// Types
// ============================================================================

interface ListUsersParams {
  page?: number
  limit?: number
  role?: string
  search?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ============================================================================
// Helpers
// ============================================================================

function formatUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    avatar: user.avatarUrl,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

// ============================================================================
// Service Methods
// ============================================================================

/**
 * List all users with pagination and filtering.
 * Supports filtering by role, search term, and active status.
 */
export async function listUsers(params: ListUsersParams) {
  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (params.role) {
    where.role = params.role
  }

  if (params.isActive !== undefined) {
    where.isActive = params.isActive
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  const USER_SORT_FIELDS = new Set(['createdAt', 'updatedAt', 'name', 'email', 'role'])
  const sortField = USER_SORT_FIELDS.has(params.sortBy || '') ? params.sortBy! : 'createdAt'
  const sortDir = params.sortOrder === 'asc' ? 'asc' : 'desc'
  const orderBy: Record<string, string> = { [sortField]: sortDir }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return {
    data: users.map(formatUser),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Get a single user's details with associated information.
 */
export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      staff: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          designation: true,
          department: true,
          status: true,
        },
      },
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
        },
      },
      _count: {
        select: {
          auditLogs: true,
          sessions: true,
        },
      },
    },
  })

  if (!user) {
    throw AppError.notFound('User not found')
  }

  return {
    ...formatUser(user),
    staff: user.staff
      ? {
          id: user.staff.id,
          firstName: user.staff.firstName,
          lastName: user.staff.lastName,
          designation: user.staff.designation
            ? { id: user.staff.designation.id, name: user.staff.designation.name }
            : null,
          department: user.staff.department
            ? { id: user.staff.department.id, name: user.staff.department.name }
            : null,
          status: user.staff.status,
        }
      : null,
    recentSessions: user.sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
    })),
    counts: {
      auditLogs: user._count.auditLogs,
      sessions: user._count.sessions,
    },
  }
}

/**
 * Ban a user by setting isActive to false and invalidating all sessions.
 */
export async function banUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    throw AppError.notFound('User not found')
  }

  if (!user.isActive) {
    throw AppError.badRequest('User is already banned')
  }

  // Ban user and delete all their sessions in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: { isActive: false },
    })

    // Invalidate all sessions
    await tx.session.deleteMany({
      where: { userId: id },
    })

    // Audit log
    await tx.auditLog.create({
      data: {
        userId: null,
        userName: 'System',
        userRole: 'admin',
        action: 'status_change',
        module: 'users',
        entityType: 'User',
        entityId: id,
        entityName: user.name,
        description: `User "${user.name}" (${user.email}) banned`,
        changes: JSON.stringify([
          { field: 'isActive', oldValue: true, newValue: false },
        ]),
      },
    })
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: false,
    bannedAt: new Date().toISOString(),
  }
}

/**
 * Unban a user by setting isActive to true.
 */
export async function unbanUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    throw AppError.notFound('User not found')
  }

  if (user.isActive) {
    throw AppError.badRequest('User is not banned')
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: { isActive: true },
    })

    // Audit log
    await tx.auditLog.create({
      data: {
        userId: null,
        userName: 'System',
        userRole: 'admin',
        action: 'status_change',
        module: 'users',
        entityType: 'User',
        entityId: id,
        entityName: user.name,
        description: `User "${user.name}" (${user.email}) unbanned`,
        changes: JSON.stringify([
          { field: 'isActive', oldValue: false, newValue: true },
        ]),
      },
    })
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: true,
    unbannedAt: new Date().toISOString(),
  }
}

/**
 * Update a user's role.
 */
export async function updateUserRole(id: string, newRole: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw AppError.notFound('User not found')

  const oldRole = user.role
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { role: newRole as any } })
    await tx.auditLog.create({
      data: {
        userId: null,
        userName: 'System',
        userRole: 'admin',
        action: 'update',
        module: 'users',
        entityType: 'User',
        entityId: id,
        entityName: user.name,
        description: `User "${user.name}" role changed from ${oldRole} to ${newRole}`,
        changes: JSON.stringify([{ field: 'role', oldValue: oldRole, newValue: newRole }]),
      },
    })
  })

  return { id, name: user.name, email: user.email, role: newRole }
}

/**
 * Delete a user and their sessions.
 */
export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw AppError.notFound('User not found')
  if (user.role === 'admin') throw AppError.badRequest('Cannot delete admin users from this endpoint')

  await prisma.$transaction(async (tx) => {
    await tx.session.deleteMany({ where: { userId: id } })
    await tx.auditLog.create({
      data: {
        userId: null,
        userName: 'System',
        userRole: 'admin',
        action: 'delete',
        module: 'users',
        entityType: 'User',
        entityId: id,
        entityName: user.name,
        description: `User "${user.name}" (${user.email}) deleted`,
      },
    })
    await tx.user.delete({ where: { id } })
  })

  return { success: true }
}
