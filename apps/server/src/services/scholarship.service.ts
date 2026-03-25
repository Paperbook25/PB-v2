import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Scholarships: List ====================

export async function listScholarships(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    search?: string
    type?: string
    isActive?: boolean
    academicYear?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.type) where.type = query.type
  if (query.isActive !== undefined) where.isActive = query.isActive
  if (query.academicYear) where.academicYear = query.academicYear
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.scholarship.findMany({
      where,
      include: { _count: { select: { recipients: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.scholarship.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Scholarships: Get by ID ====================

export async function getScholarshipById(schoolId: string, id: string) {
  const scholarship = await prisma.scholarship.findFirst({
    where: { id, organizationId: schoolId },
    include: {
      recipients: { orderBy: { awardedDate: 'desc' } },
    },
  })
  if (!scholarship) throw AppError.notFound('Scholarship not found')
  return scholarship
}

// ==================== Scholarships: Create ====================

export async function createScholarship(
  schoolId: string,
  input: {
    name: string
    description?: string
    type?: string
    amount: number
    percentage?: number
    eligibility?: string
    maxRecipients?: number
    academicYear?: string
  }
) {
  return prisma.scholarship.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      description: input.description ?? null,
      type: input.type ?? 'merit',
      amount: input.amount,
      percentage: input.percentage ?? null,
      eligibility: input.eligibility ?? null,
      maxRecipients: input.maxRecipients ?? null,
      academicYear: input.academicYear ?? null,
    },
  })
}

// ==================== Scholarships: Update ====================

export async function updateScholarship(
  schoolId: string,
  id: string,
  input: Record<string, unknown>
) {
  const existing = await prisma.scholarship.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Scholarship not found')

  return prisma.scholarship.update({ where: { id }, data: input })
}

// ==================== Scholarships: Delete ====================

export async function deleteScholarship(schoolId: string, id: string) {
  const existing = await prisma.scholarship.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Scholarship not found')

  await prisma.$transaction([
    prisma.scholarshipRecipient.deleteMany({ where: { scholarshipId: id } }),
    prisma.scholarship.delete({ where: { id } }),
  ])
  return { success: true }
}

// ==================== Recipients: Award ====================

export async function awardScholarship(
  schoolId: string,
  scholarshipId: string,
  input: {
    studentId: string
    studentName: string
    className?: string
    amount: number
  }
) {
  const scholarship = await prisma.scholarship.findFirst({
    where: { id: scholarshipId, organizationId: schoolId },
  })
  if (!scholarship) throw AppError.notFound('Scholarship not found')
  if (!scholarship.isActive) {
    throw AppError.badRequest('Scholarship is not active')
  }
  if (
    scholarship.maxRecipients &&
    scholarship.currentRecipients >= scholarship.maxRecipients
  ) {
    throw AppError.badRequest('Maximum recipients limit reached')
  }

  // Check if student already has this scholarship
  const existingRecipient = await prisma.scholarshipRecipient.findFirst({
    where: {
      scholarshipId,
      studentId: input.studentId,
      status: 'active',
    },
  })
  if (existingRecipient) {
    throw AppError.conflict('Student already has this scholarship')
  }

  const [recipient] = await prisma.$transaction([
    prisma.scholarshipRecipient.create({
      data: {
        scholarshipId,
        studentId: input.studentId,
        studentName: input.studentName,
        className: input.className ?? null,
        amount: input.amount,
      },
    }),
    prisma.scholarship.update({
      where: { id: scholarshipId },
      data: { currentRecipients: { increment: 1 } },
    }),
  ])

  return recipient
}

// ==================== Recipients: Revoke ====================

export async function revokeScholarship(
  schoolId: string,
  recipientId: string,
  revokeReason: string
) {
  const recipient = await prisma.scholarshipRecipient.findFirst({
    where: {
      id: recipientId,
      scholarship: { organizationId: schoolId },
    },
  })
  if (!recipient) throw AppError.notFound('Scholarship recipient not found')
  if (recipient.status === 'revoked') {
    throw AppError.badRequest('Scholarship is already revoked')
  }

  const [updated] = await prisma.$transaction([
    prisma.scholarshipRecipient.update({
      where: { id: recipientId },
      data: {
        status: 'revoked',
        revokedDate: new Date(),
        revokeReason,
      },
    }),
    prisma.scholarship.update({
      where: { id: recipient.scholarshipId },
      data: { currentRecipients: { decrement: 1 } },
    }),
  ])

  return updated
}

// ==================== Recipients: List by Scholarship ====================

export async function listRecipients(
  schoolId: string,
  scholarshipId: string,
  query: { status?: string }
) {
  const where: Record<string, unknown> = {
    scholarshipId,
    scholarship: { organizationId: schoolId },
  }
  if (query.status) where.status = query.status

  return prisma.scholarshipRecipient.findMany({
    where,
    include: { scholarship: { select: { name: true, type: true } } },
    orderBy: { awardedDate: 'desc' },
  })
}

// ==================== Scholarship Stats ====================

export async function getScholarshipStats(schoolId: string) {
  const [
    totalScholarships,
    activeScholarships,
    totalRecipients,
    activeRecipients,
    totalAmount,
    byType,
  ] = await Promise.all([
    prisma.scholarship.count({ where: { organizationId: schoolId } }),
    prisma.scholarship.count({
      where: { organizationId: schoolId, isActive: true },
    }),
    prisma.scholarshipRecipient.count({
      where: { scholarship: { organizationId: schoolId } },
    }),
    prisma.scholarshipRecipient.count({
      where: {
        scholarship: { organizationId: schoolId },
        status: 'active',
      },
    }),
    prisma.scholarshipRecipient.aggregate({
      where: {
        scholarship: { organizationId: schoolId },
        status: 'active',
      },
      _sum: { amount: true },
    }),
    prisma.scholarship.groupBy({
      by: ['type'],
      where: { organizationId: schoolId, isActive: true },
      _count: { id: true },
    }),
  ])

  return {
    totalScholarships,
    activeScholarships,
    totalRecipients,
    activeRecipients,
    totalAmountAwarded: totalAmount._sum.amount ?? 0,
    byType: byType.map((g) => ({ type: g.type, count: g._count.id })),
  }
}
