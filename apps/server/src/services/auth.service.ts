import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../config/db.js'
import { env } from '../config/env.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  parseExpiryToMs,
  type JwtPayload,
} from '../utils/jwt.js'
import { AppError } from '../utils/errors.js'
import { sendEmail, passwordResetEmail } from './email.service.js'
import type { LoginInput, ForgotPasswordInput, ResetPasswordInput } from '../validators/auth.validators.js'
import { getRolePermissionSlugs } from './permission.service.js'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar?: string | null
    phone?: string | null
    studentId?: string | null
    class?: string | null
    section?: string | null
    rollNumber?: number | null
    childIds?: string[]
  }
  organizationSlug?: string | null
  enabledAddons: string[]
  permissions: string[]
}

export async function login(
  input: LoginInput,
  userAgent?: string,
  ipAddress?: string
): Promise<AuthTokens> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (!user) {
    throw AppError.unauthorized('Invalid email or password')
  }

  if (!user.isActive) {
    throw AppError.forbidden('Your account has been deactivated. Please contact an administrator.')
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash)
  if (!isPasswordValid) {
    throw AppError.unauthorized('Invalid email or password')
  }

  // Look up the user's org membership to include in the JWT
  const orgMembership = await prisma.orgMember.findFirst({
    where: { userId: user.id },
    select: {
      organizationId: true,
      organization: { select: { slug: true } },
    },
  })

  // Create session
  const refreshExpiryMs = parseExpiryToMs(env.JWT_REFRESH_EXPIRY)
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: crypto.randomBytes(64).toString('hex'),
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      expiresAt: new Date(Date.now() + refreshExpiryMs),
    },
  })

  const jwtPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    organizationId: orgMembership?.organizationId ?? undefined,
  }

  const accessToken = signAccessToken(jwtPayload)
  const refreshToken = signRefreshToken({
    userId: user.id,
    sessionId: session.id,
  })

  // Parse childIds from JSON string
  let childIds: string[] = []
  if (user.childIds) {
    try { childIds = JSON.parse(user.childIds) } catch { /* ignore */ }
  }

  // Log login
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'login',
      module: 'auth',
      entityType: 'user',
      entityId: user.id,
      entityName: user.name,
      description: `User ${user.name} logged in`,
      ipAddress: ipAddress || null,
    },
  }).catch(() => {})

  // Fetch enabled addons for the school
  const school = await prisma.schoolProfile.findFirst()
  let enabledAddons: string[] = []
  if (school) {
    const schoolAddons = await prisma.schoolAddon.findMany({
      where: { schoolId: school.id, enabled: true },
      include: { addon: { select: { slug: true } } },
    })
    enabledAddons = schoolAddons.map(sa => sa.addon.slug)
  }

  // Fetch role permissions
  const permissionSlugs = await getRolePermissionSlugs(user.role)

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatarUrl,
      phone: user.phone,
      studentId: user.studentId,
      class: user.class,
      section: user.section,
      rollNumber: user.rollNumber,
      childIds,
    },
    organizationSlug: orgMembership?.organization?.slug ?? null,
    enabledAddons,
    permissions: permissionSlugs,
  }
}

export async function logout(userId: string, refreshToken?: string): Promise<void> {
  if (refreshToken) {
    // Delete specific session
    try {
      const payload = verifyRefreshToken(refreshToken)
      await prisma.session.delete({
        where: { id: payload.sessionId },
      })
    } catch {
      // Token invalid, clean up all sessions for user
      await prisma.session.deleteMany({
        where: { userId },
      })
    }
  } else {
    // Delete all sessions for user
    await prisma.session.deleteMany({
      where: { userId },
    })
  }
}

export async function refreshTokens(
  refreshToken: string,
  userAgent?: string,
  ipAddress?: string
): Promise<AuthTokens> {
  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token')
  }

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } })
    }
    throw AppError.unauthorized('Session expired. Please log in again.')
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  if (!user || !user.isActive) {
    await prisma.session.delete({ where: { id: session.id } })
    throw AppError.unauthorized('User not found or inactive')
  }

  // Rotate refresh token
  const refreshExpiryMs = parseExpiryToMs(env.JWT_REFRESH_EXPIRY)
  const newRefreshTokenRaw = crypto.randomBytes(64).toString('hex')

  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshToken: newRefreshTokenRaw,
      userAgent: userAgent || session.userAgent,
      ipAddress: ipAddress || session.ipAddress,
      expiresAt: new Date(Date.now() + refreshExpiryMs),
    },
  })

  // Look up the user's org membership to include in the refreshed JWT
  const orgMembership = await prisma.orgMember.findFirst({
    where: { userId: user.id },
    select: { organizationId: true },
  })

  const jwtPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    organizationId: orgMembership?.organizationId ?? undefined,
  }

  const newAccessToken = signAccessToken(jwtPayload)
  const newRefreshToken = signRefreshToken({
    userId: user.id,
    sessionId: session.id,
  })

  let childIds: string[] = []
  if (user.childIds) {
    try { childIds = JSON.parse(user.childIds) } catch { /* ignore */ }
  }

  // Fetch enabled addons for the school
  const school = await prisma.schoolProfile.findFirst()
  let enabledAddons: string[] = []
  if (school) {
    const schoolAddons = await prisma.schoolAddon.findMany({
      where: { schoolId: school.id, enabled: true },
      include: { addon: { select: { slug: true } } },
    })
    enabledAddons = schoolAddons.map(sa => sa.addon.slug)
  }

  // Fetch role permissions
  const permissionSlugs = await getRolePermissionSlugs(user.role)

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatarUrl,
      phone: user.phone,
      studentId: user.studentId,
      class: user.class,
      section: user.section,
      rollNumber: user.rollNumber,
      childIds,
    },
    enabledAddons,
    permissions: permissionSlugs,
  }
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  })

  // Always return success to prevent email enumeration
  if (!user) return

  // Invalidate existing reset tokens
  await prisma.passwordReset.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  })

  const token = crypto.randomBytes(64).toString('hex')

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  })

  // Send password reset email
  const resetLink = `${env.CORS_ORIGIN || 'http://localhost:5173'}/reset-password?token=${token}`
  const email = passwordResetEmail(user.name, resetLink)
  email.to = user.email
  await sendEmail(email).catch(err => console.error('[Auth] Failed to send reset email:', err))
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token: input.token },
  })

  if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
    throw AppError.badRequest('Invalid or expired reset token')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate all sessions
    prisma.session.deleteMany({
      where: { userId: resetRecord.userId },
    }),
  ])
}

export async function getMe(userId: string): Promise<AuthTokens['user']> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw AppError.notFound('User not found')
  }

  let childIds: string[] = []
  if (user.childIds) {
    try { childIds = JSON.parse(user.childIds) } catch { /* ignore */ }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatarUrl,
    phone: user.phone,
    studentId: user.studentId,
    class: user.class,
    section: user.section,
    rollNumber: user.rollNumber,
    childIds,
  }
}
