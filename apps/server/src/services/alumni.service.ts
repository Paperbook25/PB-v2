import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Alumni: List ====================

export async function listAlumni(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    search?: string
    batch?: string
    isVerified?: boolean
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.batch) where.batch = query.batch
  if (query.isVerified !== undefined) where.isVerified = query.isVerified
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { currentOrg: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.alumniRecord.findMany({
      where,
      orderBy: [{ batch: 'desc' }, { name: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.alumniRecord.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Alumni: Get by ID ====================

export async function getAlumniById(schoolId: string, id: string) {
  const record = await prisma.alumniRecord.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!record) throw AppError.notFound('Alumni record not found')
  return record
}

// ==================== Alumni: Create ====================

export async function createAlumni(
  schoolId: string,
  input: {
    name: string
    email?: string
    phone?: string
    batch: string
    className?: string
    currentOrg?: string
    currentRole?: string
    location?: string
    linkedinUrl?: string
    photoUrl?: string
    achievement?: string
    isVerified?: boolean
  }
) {
  return prisma.alumniRecord.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      batch: input.batch,
      className: input.className ?? null,
      currentOrg: input.currentOrg ?? null,
      currentRole: input.currentRole ?? null,
      location: input.location ?? null,
      linkedinUrl: input.linkedinUrl ?? null,
      photoUrl: input.photoUrl ?? null,
      achievement: input.achievement ?? null,
      isVerified: input.isVerified ?? false,
    },
  })
}

// ==================== Alumni: Update ====================

export async function updateAlumni(
  schoolId: string,
  id: string,
  input: Record<string, unknown>
) {
  const existing = await prisma.alumniRecord.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Alumni record not found')

  return prisma.alumniRecord.update({ where: { id }, data: input })
}

// ==================== Alumni: Delete ====================

export async function deleteAlumni(schoolId: string, id: string) {
  const existing = await prisma.alumniRecord.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Alumni record not found')

  await prisma.alumniRecord.delete({ where: { id } })
  return { success: true }
}

// ==================== Alumni: Get by Batch ====================

export async function getAlumniByBatch(schoolId: string, batch: string) {
  return prisma.alumniRecord.findMany({
    where: { organizationId: schoolId, batch },
    orderBy: { name: 'asc' },
  })
}

// ==================== Alumni: Stats ====================

export async function getAlumniStats(schoolId: string) {
  const [totalAlumni, verifiedCount, batchGroups] = await Promise.all([
    prisma.alumniRecord.count({ where: { organizationId: schoolId } }),
    prisma.alumniRecord.count({
      where: { organizationId: schoolId, isVerified: true },
    }),
    prisma.alumniRecord.groupBy({
      by: ['batch'],
      where: { organizationId: schoolId },
      _count: { id: true },
      orderBy: { batch: 'desc' },
    }),
  ])

  return {
    totalAlumni,
    verifiedCount,
    unverifiedCount: totalAlumni - verifiedCount,
    batchWise: batchGroups.map((g) => ({
      batch: g.batch,
      count: g._count.id,
    })),
  }
}
