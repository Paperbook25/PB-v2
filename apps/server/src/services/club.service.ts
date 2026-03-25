import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Clubs: List ====================

export async function listClubs(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    search?: string
    category?: string
    isActive?: boolean
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.category) where.category = query.category
  if (query.isActive !== undefined) where.isActive = query.isActive
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { coordinatorName: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.club.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.club.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Clubs: Get by ID ====================

export async function getClubById(schoolId: string, id: string) {
  const club = await prisma.club.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!club) throw AppError.notFound('Club not found')
  return club
}

// ==================== Clubs: Create ====================

export async function createClub(
  schoolId: string,
  input: {
    name: string
    description?: string
    category?: string
    coordinatorId?: string
    coordinatorName?: string
    meetingDay?: string
    meetingTime?: string
    location?: string
    maxMembers?: number
    coverImage?: string
  }
) {
  return prisma.club.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      description: input.description ?? null,
      category: input.category ?? 'academic',
      coordinatorId: input.coordinatorId ?? null,
      coordinatorName: input.coordinatorName ?? null,
      meetingDay: input.meetingDay ?? null,
      meetingTime: input.meetingTime ?? null,
      location: input.location ?? null,
      maxMembers: input.maxMembers ?? null,
      coverImage: input.coverImage ?? null,
    },
  })
}

// ==================== Clubs: Update ====================

export async function updateClub(
  schoolId: string,
  id: string,
  input: Record<string, unknown>
) {
  const existing = await prisma.club.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Club not found')

  return prisma.club.update({ where: { id }, data: input })
}

// ==================== Clubs: Delete ====================

export async function deleteClub(schoolId: string, id: string) {
  const existing = await prisma.club.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Club not found')

  await prisma.club.delete({ where: { id } })
  return { success: true }
}

// ==================== Clubs: Stats ====================

export async function getClubStats(schoolId: string) {
  const [totalClubs, activeClubs, categoryGroups, totalMembers] = await Promise.all([
    prisma.club.count({ where: { organizationId: schoolId } }),
    prisma.club.count({ where: { organizationId: schoolId, isActive: true } }),
    prisma.club.groupBy({
      by: ['category'],
      where: { organizationId: schoolId, isActive: true },
      _count: { id: true },
    }),
    prisma.club.aggregate({
      where: { organizationId: schoolId, isActive: true },
      _sum: { currentMembers: true },
    }),
  ])

  return {
    totalClubs,
    activeClubs,
    inactiveClubs: totalClubs - activeClubs,
    totalMembers: totalMembers._sum.currentMembers ?? 0,
    byCategory: categoryGroups.map((g) => ({
      category: g.category,
      count: g._count.id,
    })),
  }
}
