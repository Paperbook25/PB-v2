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

// ==================== Contributions ====================

export async function listContributions(
  schoolId: string,
  query: { alumniId?: string; status?: string; page?: number; limit?: number }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.alumniId) where.alumniId = query.alumniId
  if (query.status) where.status = query.status

  const [data, total] = await prisma.$transaction([
    prisma.alumniContribution.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.alumniContribution.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function createContribution(schoolId: string, input: Record<string, unknown>) {
  return prisma.alumniContribution.create({
    data: {
      organizationId: schoolId,
      alumniId: (input.alumniId as string) ?? null,
      alumniName: input.alumniName as string,
      type: (input.type as string) ?? 'donation',
      amount: input.amount ? Number(input.amount) : null,
      description: (input.description as string) ?? null,
    },
  })
}

export async function updateContributionStatus(schoolId: string, id: string, status: string) {
  const existing = await prisma.alumniContribution.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Contribution not found')

  const data: Record<string, unknown> = { status }
  if (status === 'received') data.receivedDate = new Date()

  return prisma.alumniContribution.update({ where: { id }, data })
}

export async function deleteContribution(schoolId: string, id: string) {
  const existing = await prisma.alumniContribution.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Contribution not found')
  await prisma.alumniContribution.delete({ where: { id } })
  return { success: true }
}

// ==================== Alumni Events ====================

export async function listAlumniEvents(
  schoolId: string,
  query: { type?: string; status?: string; page?: number; limit?: number }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.type) where.type = query.type
  if (query.status) where.status = query.status

  const [data, total] = await prisma.$transaction([
    prisma.alumniEvent.findMany({
      where,
      include: { _count: { select: { registrations: true } } },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.alumniEvent.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function getAlumniEventById(schoolId: string, id: string) {
  const event = await prisma.alumniEvent.findFirst({
    where: { id, organizationId: schoolId },
    include: { registrations: true },
  })
  if (!event) throw AppError.notFound('Event not found')
  return event
}

export async function createAlumniEvent(schoolId: string, input: Record<string, unknown>) {
  return prisma.alumniEvent.create({
    data: {
      organizationId: schoolId,
      title: input.title as string,
      description: (input.description as string) ?? null,
      type: (input.type as string) ?? 'reunion',
      date: new Date(input.date as string),
      venue: (input.venue as string) ?? null,
      isOnline: Boolean(input.isOnline ?? false),
      meetLink: (input.meetLink as string) ?? null,
    },
  })
}

export async function updateAlumniEvent(schoolId: string, id: string, input: Record<string, unknown>) {
  const existing = await prisma.alumniEvent.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Event not found')
  const { organizationId: _o, ...safe } = input as any
  if (safe.date) safe.date = new Date(safe.date)
  return prisma.alumniEvent.update({ where: { id }, data: safe })
}

export async function updateAlumniEventStatus(schoolId: string, id: string, status: string) {
  const existing = await prisma.alumniEvent.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Event not found')
  return prisma.alumniEvent.update({ where: { id }, data: { status } })
}

export async function deleteAlumniEvent(schoolId: string, id: string) {
  const existing = await prisma.alumniEvent.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Event not found')
  await prisma.alumniEvent.delete({ where: { id } })
  return { success: true }
}

export async function getEventRegistrations(schoolId: string, eventId: string) {
  const event = await prisma.alumniEvent.findFirst({ where: { id: eventId, organizationId: schoolId } })
  if (!event) throw AppError.notFound('Event not found')

  return prisma.alumniEventRegistration.findMany({
    where: { eventId },
    orderBy: { registeredAt: 'desc' },
  })
}

export async function registerForEvent(schoolId: string, eventId: string, alumniId: string) {
  const event = await prisma.alumniEvent.findFirst({ where: { id: eventId, organizationId: schoolId } })
  if (!event) throw AppError.notFound('Event not found')

  return prisma.alumniEventRegistration.upsert({
    where: { eventId_alumniId: { eventId, alumniId } },
    update: {},
    create: { eventId, alumniId },
  })
}

export async function cancelEventRegistration(schoolId: string, eventId: string, alumniId: string) {
  const event = await prisma.alumniEvent.findFirst({ where: { id: eventId, organizationId: schoolId } })
  if (!event) throw AppError.notFound('Event not found')

  await prisma.alumniEventRegistration.deleteMany({ where: { eventId, alumniId } })
  return { success: true }
}

// ==================== Graduation ====================

export async function getEligibleForGraduation(schoolId: string) {
  // Get existing alumni names to exclude
  const existingAlumni = await prisma.alumniRecord.findMany({
    where: { organizationId: schoolId },
    select: { name: true },
  })
  const existingNames = new Set(existingAlumni.map((a) => a.name.toLowerCase()))

  const students = await prisma.student.findMany({
    where: { organizationId: schoolId, status: 'active' },
    select: { id: true, firstName: true, lastName: true, admissionNumber: true, classId: true, email: true, phone: true },
    orderBy: { firstName: 'asc' },
  })

  return students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.trim().toLowerCase()
    return !existingNames.has(fullName)
  })
}

export async function graduateStudent(
  schoolId: string,
  input: { studentId?: string; name?: string; batch: string; email?: string; phone?: string }
) {
  let name = input.name
  let email = input.email
  let phone = input.phone

  if (input.studentId) {
    const student = await prisma.student.findFirst({
      where: { id: input.studentId, organizationId: schoolId },
    })
    if (!student) throw AppError.notFound('Student not found')
    name = `${student.firstName} ${student.lastName}`.trim()
    email = email ?? student.email ?? undefined
    phone = phone ?? student.phone ?? undefined
  }

  if (!name) throw AppError.badRequest('Name is required')

  return prisma.alumniRecord.create({
    data: {
      organizationId: schoolId,
      name,
      batch: input.batch,
      email: email ?? null,
      phone: phone ?? null,
    },
  })
}

export async function graduateBatch(schoolId: string, studentIds: string[], batch: string) {
  const results = await Promise.allSettled(
    studentIds.map((id) => graduateStudent(schoolId, { studentId: id, batch }))
  )
  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length
  return { succeeded, failed, total: studentIds.length }
}
