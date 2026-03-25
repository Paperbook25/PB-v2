import { prisma } from '../config/db.js'

// ==================== Visitors: List ====================

export async function listVisitors(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    status?: string
    purpose?: string
    date?: string
    search?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.status) where.status = query.status
  if (query.purpose) where.purpose = query.purpose
  if (query.date) {
    const start = new Date(query.date)
    const end = new Date(query.date)
    end.setDate(end.getDate() + 1)
    where.checkInAt = { gte: start, lt: end }
  }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
      { hostName: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.visitorLog.findMany({
      where,
      orderBy: { checkInAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.visitorLog.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Visitors: Check In ====================

export async function checkIn(
  schoolId: string,
  input: {
    name: string
    phone?: string
    email?: string
    purpose?: string
    hostName?: string
    hostDepartment?: string
    idType?: string
    idNumber?: string
    photoUrl?: string
    badge?: string
    notes?: string
  }
) {
  return prisma.visitorLog.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      phone: input.phone ?? null,
      email: input.email ?? null,
      purpose: input.purpose ?? 'general',
      hostName: input.hostName ?? null,
      hostDepartment: input.hostDepartment ?? null,
      idType: input.idType ?? null,
      idNumber: input.idNumber ?? null,
      photoUrl: input.photoUrl ?? null,
      badge: input.badge ?? null,
      notes: input.notes ?? null,
    },
  })
}

// ==================== Visitors: Check Out ====================

export async function checkOut(schoolId: string, id: string) {
  const visitor = await prisma.visitorLog.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!visitor) throw new Error('Visitor record not found')
  if (visitor.status === 'checked_out') throw new Error('Visitor already checked out')

  return prisma.visitorLog.update({
    where: { id },
    data: { checkOutAt: new Date(), status: 'checked_out' },
  })
}

// ==================== Visitors: Get by ID ====================

export async function getVisitorById(schoolId: string, id: string) {
  const visitor = await prisma.visitorLog.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!visitor) throw new Error('Visitor record not found')
  return visitor
}

// ==================== Visitors: Delete ====================

export async function deleteVisitor(schoolId: string, id: string) {
  const existing = await prisma.visitorLog.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Visitor record not found')

  await prisma.visitorLog.delete({ where: { id } })
  return { success: true }
}

// ==================== Visitors: Stats ====================

export async function getVisitorStats(schoolId: string) {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const [todayTotal, checkedInNow, byPurpose] = await Promise.all([
    prisma.visitorLog.count({
      where: {
        organizationId: schoolId,
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.visitorLog.count({
      where: { organizationId: schoolId, status: 'checked_in' },
    }),
    prisma.visitorLog.groupBy({
      by: ['purpose'] as const,
      where: {
        organizationId: schoolId,
        checkInAt: { gte: todayStart, lte: todayEnd },
      },
      _count: { id: true },
    }),
  ])

  return {
    todayTotal,
    checkedInNow,
    byPurpose: byPurpose.reduce(
      (acc, row) => ({ ...acc, [row.purpose]: row._count.id }),
      {} as Record<string, number>
    ),
  }
}
