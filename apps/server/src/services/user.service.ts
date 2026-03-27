import bcrypt from 'bcryptjs'
import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import type { CreateUserInput, UpdateUserInput } from '../validators/user.validators.js'

function formatUser(user: {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  avatarUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  studentId: string | null
  class: string | null
  section: string | null
  rollNumber: number | null
  childIds: string | null
}) {
  let childIds: string[] = []
  if (user.childIds) {
    try { childIds = JSON.parse(user.childIds) } catch { /* ignore */ }
  }

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
    studentId: user.studentId,
    class: user.class,
    section: user.section,
    rollNumber: user.rollNumber,
    childIds,
  }
}

/**
 * List users scoped to a school.
 * Uses OrgMember to find users that belong to the organization,
 * then fetches their legacy User records.
 */
export async function listUsers(schoolId: string) {
  // Find all user IDs that are members of this school's organization
  const members = await prisma.orgMember.findMany({
    where: { organizationId: schoolId },
    select: { userId: true },
  })
  const memberUserIds = members.map(m => m.userId)

  if (memberUserIds.length === 0) return []

  // Fetch matching legacy User records
  const users = await prisma.user.findMany({
    where: { id: { in: memberUserIds } },
    orderBy: { createdAt: 'desc' },
  })
  return users.map(formatUser)
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw AppError.notFound('User not found')
  return formatUser(user)
}

export async function createUser(schoolId: string, input: CreateUserInput) {
  // Check for duplicate email
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  })
  if (existing) {
    throw AppError.conflict('A user with this email already exists')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)

  const result = await prisma.$transaction(async (tx) => {
    // Create the legacy User record
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
        phone: input.phone || null,
        avatarUrl: input.avatarUrl || null,
        studentId: input.studentId || null,
        class: input.class || null,
        section: input.section || null,
        rollNumber: input.rollNumber || null,
        childIds: input.childIds ? JSON.stringify(input.childIds) : null,
      },
    })

    // Also create a BetterAuthUser + Account + OrgMember so the user can log in
    const existingAuthUser = await tx.betterAuthUser.findUnique({
      where: { email: input.email },
    })

    if (!existingAuthUser) {
      const { hashPassword } = await import('better-auth/crypto')
      const authPasswordHash = await hashPassword(input.password)

      await tx.betterAuthUser.create({
        data: {
          id: user.id,
          name: input.name,
          email: input.email,
          emailVerified: false,
          role: 'user',
        },
      })

      await tx.betterAuthAccount.create({
        data: {
          id: crypto.randomUUID(),
          accountId: user.id,
          providerId: 'credential',
          userId: user.id,
          password: authPasswordHash,
        },
      })
    }

    // Link user to the school's organization
    const existingMember = await tx.orgMember.findFirst({
      where: { organizationId: schoolId, userId: user.id },
    })
    if (!existingMember) {
      await tx.orgMember.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: schoolId,
          userId: user.id,
          role: input.role === 'admin' ? 'admin' : 'member',
        },
      })
    }

    return user
  })

  return formatUser(result)
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('User not found')

  // Check email uniqueness if changing
  if (input.email && input.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: input.email },
    })
    if (emailTaken) {
      throw AppError.conflict('A user with this email already exists')
    }
  }

  const data: Record<string, unknown> = {}
  if (input.email !== undefined) data.email = input.email
  if (input.name !== undefined) data.name = input.name
  if (input.role !== undefined) data.role = input.role
  if (input.phone !== undefined) data.phone = input.phone || null
  if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl || null
  if (input.isActive !== undefined) data.isActive = input.isActive
  if (input.studentId !== undefined) data.studentId = input.studentId || null
  if (input.class !== undefined) data.class = input.class || null
  if (input.section !== undefined) data.section = input.section || null
  if (input.rollNumber !== undefined) data.rollNumber = input.rollNumber || null
  if (input.childIds !== undefined) data.childIds = JSON.stringify(input.childIds)

  if (input.password) {
    data.passwordHash = await bcrypt.hash(input.password, 12)
  }

  const user = await prisma.user.update({
    where: { id },
    data,
  })

  return formatUser(user)
}

export async function deleteUser(id: string) {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('User not found')

  await prisma.user.delete({ where: { id } })
  return { success: true }
}

export async function toggleUserStatus(id: string) {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('User not found')

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: !existing.isActive },
  })

  return formatUser(user)
}
