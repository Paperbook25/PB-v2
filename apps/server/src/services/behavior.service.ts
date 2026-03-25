import { prisma } from '../config/db.js'

// ==================== Behavior: List ====================

export async function listRecords(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    type?: string
    category?: string
    studentId?: string
    date?: string
    search?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.type) where.type = query.type
  if (query.category) where.category = query.category
  if (query.studentId) where.studentId = query.studentId
  if (query.date) {
    const start = new Date(query.date)
    const end = new Date(query.date)
    end.setDate(end.getDate() + 1)
    where.date = { gte: start, lt: end }
  }
  if (query.search) {
    where.OR = [
      { studentName: { contains: query.search, mode: 'insensitive' } },
      { className: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.behaviorRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.behaviorRecord.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Behavior: Get by ID ====================

export async function getRecordById(schoolId: string, id: string) {
  const record = await prisma.behaviorRecord.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!record) throw new Error('Behavior record not found')
  return record
}

// ==================== Behavior: Create ====================

export async function createRecord(
  schoolId: string,
  input: {
    studentId: string
    studentName: string
    className?: string
    type?: string
    category?: string
    description: string
    points?: number
    reportedBy: string
    reportedByName: string
    date?: string
    actionTaken?: string
    parentNotified?: boolean
  }
) {
  return prisma.behaviorRecord.create({
    data: {
      organizationId: schoolId,
      studentId: input.studentId,
      studentName: input.studentName,
      className: input.className ?? null,
      type: input.type ?? 'positive',
      category: input.category ?? 'general',
      description: input.description,
      points: input.points ?? 0,
      reportedBy: input.reportedBy,
      reportedByName: input.reportedByName,
      date: input.date ? new Date(input.date) : new Date(),
      actionTaken: input.actionTaken ?? null,
      parentNotified: input.parentNotified ?? false,
    },
  })
}

// ==================== Behavior: Update ====================

export async function updateRecord(
  schoolId: string,
  id: string,
  input: {
    type?: string
    category?: string
    description?: string
    points?: number
    actionTaken?: string
    parentNotified?: boolean
  }
) {
  const existing = await prisma.behaviorRecord.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Behavior record not found')

  return prisma.behaviorRecord.update({ where: { id }, data: input })
}

// ==================== Behavior: Delete ====================

export async function deleteRecord(schoolId: string, id: string) {
  const existing = await prisma.behaviorRecord.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Behavior record not found')

  await prisma.behaviorRecord.delete({ where: { id } })
  return { success: true }
}

// ==================== Behavior: Get Student Behavior ====================

export async function getStudentBehavior(
  schoolId: string,
  studentId: string,
  query: { page?: number; limit?: number }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 50
  const skip = (page - 1) * limit

  const where = { organizationId: schoolId, studentId }

  const [records, total, pointsSummary] = await Promise.all([
    prisma.behaviorRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.behaviorRecord.count({ where }),
    prisma.behaviorRecord.groupBy({
      by: ['type'] as const,
      where,
      _sum: { points: true },
      _count: { id: true },
    }),
  ])

  return {
    data: records,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    summary: pointsSummary.reduce(
      (acc, row) => ({
        ...acc,
        [row.type]: { count: row._count.id, totalPoints: row._sum.points ?? 0 },
      }),
      {} as Record<string, { count: number; totalPoints: number }>
    ),
  }
}

// ==================== Behavior: Stats ====================

export async function getBehaviorStats(schoolId: string) {
  const [total, byType, byCategory, frequentStudents] = await Promise.all([
    prisma.behaviorRecord.count({ where: { organizationId: schoolId } }),
    prisma.behaviorRecord.groupBy({
      by: ['type'] as const,
      where: { organizationId: schoolId },
      _count: { id: true },
    }),
    prisma.behaviorRecord.groupBy({
      by: ['category'] as const,
      where: { organizationId: schoolId },
      _count: { id: true },
    }),
    prisma.behaviorRecord.groupBy({
      by: ['studentId', 'studentName'] as const,
      where: { organizationId: schoolId, type: 'negative' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ])

  return {
    total,
    byType: byType.reduce(
      (acc, row) => ({ ...acc, [row.type]: row._count.id }),
      {} as Record<string, number>
    ),
    byCategory: byCategory.reduce(
      (acc, row) => ({ ...acc, [row.category]: row._count.id }),
      {} as Record<string, number>
    ),
    frequentStudents: frequentStudents.map((row) => ({
      studentId: row.studentId,
      studentName: row.studentName,
      incidentCount: row._count.id,
    })),
  }
}
