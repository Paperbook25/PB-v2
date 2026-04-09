import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

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

// ==================== Detentions ====================

export async function listDetentions(
  schoolId: string,
  query: { studentId?: string; status?: string; date?: string; page?: number; limit?: number }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.studentId) where.studentId = query.studentId
  if (query.status) where.status = query.status
  if (query.date) where.date = new Date(query.date)

  const [data, total] = await prisma.$transaction([
    prisma.detention.findMany({ where, orderBy: { date: 'desc' }, skip, take: limit }),
    prisma.detention.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function createDetention(schoolId: string, input: Record<string, unknown>) {
  return prisma.detention.create({
    data: {
      organizationId: schoolId,
      studentId: input.studentId as string,
      studentName: input.studentName as string,
      className: (input.className as string) ?? null,
      reason: input.reason as string,
      date: new Date(input.date as string),
      startTime: (input.startTime as string) ?? null,
      endTime: (input.endTime as string) ?? null,
      supervisorName: (input.supervisorName as string) ?? null,
      notes: (input.notes as string) ?? null,
    },
  })
}

export async function updateDetention(schoolId: string, id: string, input: Record<string, unknown>) {
  const existing = await prisma.detention.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Detention not found')
  const { organizationId: _o, ...safe } = input as any
  if (safe.date) safe.date = new Date(safe.date)
  return prisma.detention.update({ where: { id }, data: safe })
}

export async function deleteDetention(schoolId: string, id: string) {
  const existing = await prisma.detention.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Detention not found')
  await prisma.detention.delete({ where: { id } })
  return { success: true }
}

// ==================== Disciplinary Actions ====================

export async function listDisciplinaryActions(
  schoolId: string,
  query: { studentId?: string; actionType?: string; page?: number; limit?: number }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.studentId) where.studentId = query.studentId
  if (query.actionType) where.actionType = query.actionType

  const [data, total] = await prisma.$transaction([
    prisma.disciplinaryAction.findMany({ where, orderBy: { issuedDate: 'desc' }, skip, take: limit }),
    prisma.disciplinaryAction.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function getDisciplinaryActionById(schoolId: string, id: string) {
  const action = await prisma.disciplinaryAction.findFirst({ where: { id, organizationId: schoolId } })
  if (!action) throw AppError.notFound('Disciplinary action not found')
  return action
}

export async function createDisciplinaryAction(schoolId: string, input: Record<string, unknown>) {
  return prisma.disciplinaryAction.create({
    data: {
      organizationId: schoolId,
      studentId: input.studentId as string,
      studentName: input.studentName as string,
      incidentId: (input.incidentId as string) ?? null,
      actionType: input.actionType as string,
      description: input.description as string,
      issuedByName: (input.issuedByName as string) ?? null,
    },
  })
}

export async function updateDisciplinaryAction(schoolId: string, id: string, input: Record<string, unknown>) {
  const existing = await prisma.disciplinaryAction.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Disciplinary action not found')
  const { organizationId: _o, ...safe } = input as any
  return prisma.disciplinaryAction.update({ where: { id }, data: safe })
}

export async function submitAppeal(schoolId: string, id: string, appealText: string) {
  const existing = await prisma.disciplinaryAction.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Disciplinary action not found')

  return prisma.disciplinaryAction.update({
    where: { id },
    data: { appealText, appealStatus: 'pending' },
  })
}

// ==================== Behavior Points ====================

export async function listBehaviorPoints(
  schoolId: string,
  query: { studentId?: string; type?: string; page?: number; limit?: number }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.studentId) where.studentId = query.studentId
  if (query.type) where.type = query.type

  const [data, total] = await prisma.$transaction([
    prisma.behaviorPoint.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.behaviorPoint.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function createBehaviorPoint(schoolId: string, input: Record<string, unknown>) {
  return prisma.behaviorPoint.create({
    data: {
      organizationId: schoolId,
      studentId: input.studentId as string,
      studentName: input.studentName as string,
      className: (input.className as string) ?? null,
      type: input.type as string,
      points: Number(input.points),
      reason: input.reason as string,
      awardedByName: (input.awardedByName as string) ?? null,
    },
  })
}

export async function getStudentBehaviorSummary(schoolId: string, studentId: string) {
  const [positive, negative, recentPoints] = await Promise.all([
    prisma.behaviorPoint.aggregate({
      where: { organizationId: schoolId, studentId, type: 'positive' },
      _sum: { points: true },
    }),
    prisma.behaviorPoint.aggregate({
      where: { organizationId: schoolId, studentId, type: 'negative' },
      _sum: { points: true },
    }),
    prisma.behaviorPoint.findMany({
      where: { organizationId: schoolId, studentId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  const positiveTotal = positive._sum.points ?? 0
  const negativeTotal = negative._sum.points ?? 0

  return {
    studentId,
    totalPoints: positiveTotal - negativeTotal,
    positivePoints: positiveTotal,
    negativePoints: negativeTotal,
    recentPoints,
  }
}

export async function getBehaviorLeaderboard(schoolId: string, limit = 10) {
  const rows = await prisma.behaviorPoint.groupBy({
    by: ['studentId', 'studentName', 'className'],
    where: { organizationId: schoolId, type: 'positive' },
    _sum: { points: true },
    orderBy: { _sum: { points: 'desc' } },
    take: limit,
  })

  return rows.map((r, i) => ({
    rank: i + 1,
    studentId: r.studentId,
    studentName: r.studentName,
    className: r.className,
    totalPoints: r._sum.points ?? 0,
  }))
}
