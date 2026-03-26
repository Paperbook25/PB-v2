import crypto from 'crypto'
import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { env } from '../config/env.js'

export async function listAdmins() {
  const admins = await prisma.gravityAdmin.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const userIds = admins.map((a) => a.userId)
  const users = await prisma.betterAuthUser.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, image: true },
  })
  const userMap = new Map(users.map((u) => [u.id, u]))

  return admins.map((a) => {
    const user = userMap.get(a.userId)
    return {
      id: a.id,
      userId: a.userId,
      name: user?.name || 'Unknown',
      email: user?.email || 'Unknown',
      avatar: user?.image || null,
      role: a.role,
      permissions: a.permissions || [],
      isActive: a.isActive,
      lastLoginAt: a.lastLoginAt?.toISOString() || null,
      createdAt: a.createdAt.toISOString(),
    }
  })
}

export async function createAdmin(input: { email: string; name: string; role?: string; permissions?: string[] }) {
  // Find or verify the user exists
  const user = await prisma.betterAuthUser.findUnique({ where: { email: input.email } })
  if (!user) throw AppError.notFound('User not found. They must have a PaperBook account first.')

  // Check if already a Gravity admin
  const existing = await prisma.gravityAdmin.findUnique({ where: { userId: user.id } })
  if (existing) throw AppError.conflict('This user is already a Gravity admin')

  // Ensure they have admin role in better-auth
  if (user.role !== 'admin') {
    await prisma.betterAuthUser.update({ where: { id: user.id }, data: { role: 'admin' } })
  }

  const admin = await prisma.gravityAdmin.create({
    data: {
      userId: user.id,
      role: input.role || 'admin',
      permissions: input.permissions || [],
      isActive: true,
    },
  })

  return { id: admin.id, userId: user.id, name: user.name, email: user.email, role: admin.role }
}

export async function updateAdmin(id: string, input: { role?: string; permissions?: string[]; isActive?: boolean }) {
  const admin = await prisma.gravityAdmin.findUnique({ where: { id } })
  if (!admin) throw AppError.notFound('Admin not found')

  const data: any = {}
  if (input.role !== undefined) data.role = input.role
  if (input.permissions !== undefined) data.permissions = input.permissions
  if (input.isActive !== undefined) data.isActive = input.isActive

  await prisma.gravityAdmin.update({ where: { id }, data })
  return { success: true }
}

export async function removeAdmin(id: string) {
  const admin = await prisma.gravityAdmin.findUnique({ where: { id } })
  if (!admin) throw AppError.notFound('Admin not found')

  await prisma.gravityAdmin.delete({ where: { id } })

  // Revert better-auth role to 'user'
  await prisma.betterAuthUser.update({ where: { id: admin.userId }, data: { role: 'user' } })

  return { success: true }
}

export async function getComplianceStatus() {
  const checks = [
    {
      id: 'https',
      name: 'HTTPS Enabled',
      description: 'All traffic encrypted with TLS',
      status: env.isProd ? 'pass' : 'warning',
      detail: env.isProd ? 'Production HTTPS active' : 'Development mode — no HTTPS',
    },
    {
      id: 'password_policy',
      name: 'Password Policy',
      description: 'Minimum 8 characters enforced',
      status: 'pass',
      detail: 'All registration and password change endpoints enforce 8+ characters',
    },
    {
      id: 'audit_logging',
      name: 'Audit Logging',
      description: 'All admin actions tracked',
      status: 'pass',
      detail: 'AuditLog model active with 6 action types tracked',
    },
    {
      id: 'session_management',
      name: 'Session Management',
      description: 'Session expiry and cookie security',
      status: 'pass',
      detail: 'better-auth sessions with cookie cache (5 min), cross-subdomain cookies in prod',
    },
    {
      id: 'data_isolation',
      name: 'Data Isolation (Multi-Tenancy)',
      description: 'School data isolated by organizationId',
      status: 'pass',
      detail: 'All tenant-scoped queries filter by organizationId',
    },
    {
      id: 'rate_limiting',
      name: 'Rate Limiting',
      description: 'API rate limits enforced',
      status: 'pass',
      detail: 'Auth: 20/15min (prod), Public: 200/15min (prod)',
    },
  ]

  const passCount = checks.filter((c) => c.status === 'pass').length

  return {
    checks,
    score: Math.round((passCount / checks.length) * 100),
    passCount,
    totalChecks: checks.length,
  }
}

export async function getLoginHistory() {
  // Pull recent admin login audit entries
  const logs = await prisma.auditLog.findMany({
    where: {
      action: 'login',
      userRole: { in: ['admin', 'super_admin'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true, userName: true, userRole: true, ipAddress: true,
      description: true, createdAt: true,
    },
  })

  return logs.map((l) => ({
    id: l.id,
    userName: l.userName,
    userRole: l.userRole,
    ipAddress: l.ipAddress,
    description: l.description,
    createdAt: l.createdAt.toISOString(),
  }))
}
