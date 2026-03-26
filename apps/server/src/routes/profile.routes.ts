import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { hashPassword as betterAuthHash, verifyPassword as betterAuthVerify } from 'better-auth/crypto'
import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { schoolAuthMiddleware } from '../middleware/school-auth.middleware.js'

const router = Router()

// All profile routes require authentication
router.use(schoolAuthMiddleware)

/**
 * GET /api/profile — Get current user's profile
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId
    if (!userId) throw AppError.unauthorized()

    // Fetch from both BetterAuthUser and legacy User for complete data
    const [baUser, legacyUser] = await Promise.all([
      prisma.betterAuthUser.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, image: true, createdAt: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true, role: true, avatarUrl: true },
      }),
    ])

    if (!baUser) throw AppError.notFound('User not found')

    res.json({
      id: baUser.id,
      name: baUser.name,
      email: baUser.email,
      phone: legacyUser?.phone || null,
      avatar: baUser.image || legacyUser?.avatarUrl || null,
      role: req.user?.role || legacyUser?.role || 'teacher',
      createdAt: baUser.createdAt.toISOString(),
    })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/profile — Update current user's name and phone
 */
router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId
    if (!userId) throw AppError.unauthorized()

    const { name, phone } = req.body
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw AppError.badRequest('Name is required')
    }

    // Update both BetterAuthUser and legacy User
    await Promise.all([
      prisma.betterAuthUser.update({
        where: { id: userId },
        data: { name: name.trim() },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          name: name.trim(),
          phone: phone || null,
        },
      }).catch(() => {
        // Legacy user may not exist for some accounts
      }),
    ])

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/profile/change-password — Change current user's password
 */
router.post('/change-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId
    if (!userId) throw AppError.unauthorized()

    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      throw AppError.badRequest('Current and new password are required')
    }
    if (newPassword.length < 8) {
      throw AppError.badRequest('New password must be at least 8 characters')
    }

    // Get the current password hash from BetterAuthAccount
    const account = await prisma.betterAuthAccount.findFirst({
      where: { userId, providerId: 'credential' },
      select: { id: true, password: true },
    })

    if (!account || !account.password) {
      throw AppError.badRequest('Password change is not available for social login accounts')
    }

    // Verify current password using better-auth's scrypt
    const isValid = await betterAuthVerify({
      hash: account.password,
      password: currentPassword,
    })

    if (!isValid) {
      throw AppError.badRequest('Current password is incorrect')
    }

    // Hash new password with both algorithms
    const newBetterAuthHash = await betterAuthHash(newPassword)
    const newBcryptHash = await bcrypt.hash(newPassword, 12)

    // Update both systems
    await Promise.all([
      prisma.betterAuthAccount.update({
        where: { id: account.id },
        data: { password: newBetterAuthHash },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newBcryptHash },
      }).catch(() => {
        // Legacy user may not exist
      }),
    ])

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/profile/permissions — Get current user's granted permission slugs
 */
router.get('/permissions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId
    const role = req.user?.role
    if (!userId || !role) throw AppError.unauthorized()

    // Admin has all permissions
    if (role === 'admin') {
      const allPerms = await prisma.permission.findMany({ select: { slug: true } })
      return res.json({ permissions: allPerms.map(p => p.slug) })
    }

    // For other roles, fetch from DB. Fall back to defaults if no DB entries.
    const rolePerms = await prisma.rolePermission.findMany({
      where: { role: role as any, granted: true },
      include: { permission: { select: { slug: true } } },
    })

    if (rolePerms.length > 0) {
      return res.json({ permissions: rolePerms.map(rp => rp.permission.slug) })
    }

    // No DB permissions set — return empty (frontend falls back to hardcoded)
    res.json({ permissions: [] })
  } catch (err) {
    next(err)
  }
})

export default router
