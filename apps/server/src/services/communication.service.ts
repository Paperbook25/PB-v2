import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Types ====================

interface ListAnnouncementsQuery {
  page?: number
  limit?: number
  type?: string
  published?: string
  search?: string
  audience?: string // Filter by targetAudience (e.g., 'students', 'parents', 'staff')
}

interface CreateAnnouncementInput {
  title: string
  body: string
  type?: string
  priority?: string
  targetAudience?: string
  targetClasses?: string[]
  attachmentUrl?: string
  expiresAt?: string
}

interface UpdateAnnouncementInput {
  title?: string
  body?: string
  type?: string
  priority?: string
  targetAudience?: string
  targetClasses?: string[]
  attachmentUrl?: string
  expiresAt?: string
}

interface ListCircularsQuery {
  page?: number
  limit?: number
  category?: string
  search?: string
}

interface CreateCircularInput {
  title: string
  body: string
  category?: string
  fileUrl?: string
  issuedBy?: string
  issuedDate?: string
  targetAudience?: string
}

interface UpdateCircularInput {
  title?: string
  body?: string
  category?: string
  fileUrl?: string
  issuedBy?: string
  issuedDate?: string
  targetAudience?: string
}

// ==================== Announcements ====================

export async function listAnnouncements(schoolId: string, query: ListAnnouncementsQuery) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.type) where.type = query.type
  if (query.published === 'true') where.isPublished = true
  if (query.published === 'false') where.isPublished = false
  if (query.audience) where.targetAudience = { in: ['all', query.audience] }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { body: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.announcement.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.announcement.count({ where: where as any }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getAnnouncementById(schoolId: string, id: string) {
  const announcement = await prisma.announcement.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!announcement) throw AppError.notFound('Announcement not found')
  return announcement
}

export async function createAnnouncement(schoolId: string, input: CreateAnnouncementInput) {
  return prisma.announcement.create({
    data: {
      organizationId: schoolId,
      title: input.title,
      body: input.body,
      type: input.type ?? 'general',
      priority: input.priority ?? 'normal',
      targetAudience: input.targetAudience ?? 'all',
      targetClasses: input.targetClasses ?? undefined,
      attachmentUrl: input.attachmentUrl ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  })
}

export async function updateAnnouncement(schoolId: string, id: string, input: UpdateAnnouncementInput) {
  const existing = await prisma.announcement.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Announcement not found')

  return prisma.announcement.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.targetAudience !== undefined && { targetAudience: input.targetAudience }),
      ...(input.targetClasses !== undefined && { targetClasses: input.targetClasses }),
      ...(input.attachmentUrl !== undefined && { attachmentUrl: input.attachmentUrl }),
      ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt ? new Date(input.expiresAt) : null }),
    },
  })
}

export async function publishAnnouncement(schoolId: string, id: string, publishedBy: string) {
  const existing = await prisma.announcement.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Announcement not found')

  return prisma.announcement.update({
    where: { id },
    data: {
      isPublished: true,
      publishedAt: new Date(),
      publishedBy,
    },
  })
}

export async function deleteAnnouncement(schoolId: string, id: string) {
  const existing = await prisma.announcement.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Announcement not found')

  await prisma.announcement.delete({ where: { id } })
  return { success: true }
}

// ==================== Circulars ====================

async function generateCircularNumber(schoolId: string): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.circular.count({
    where: { organizationId: schoolId },
  })
  return `CIR-${year}-${String(count + 1).padStart(4, '0')}`
}

export async function listCirculars(schoolId: string, query: ListCircularsQuery) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.category) where.category = query.category
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { circularNumber: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.circular.findMany({
      where: where as any,
      orderBy: { issuedDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.circular.count({ where: where as any }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getCircularById(schoolId: string, id: string) {
  const circular = await prisma.circular.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!circular) throw AppError.notFound('Circular not found')
  return circular
}

export async function createCircular(schoolId: string, input: CreateCircularInput) {
  const circularNumber = await generateCircularNumber(schoolId)

  return prisma.circular.create({
    data: {
      organizationId: schoolId,
      circularNumber,
      title: input.title,
      body: input.body,
      category: input.category ?? 'academic',
      fileUrl: input.fileUrl ?? null,
      issuedBy: input.issuedBy ?? null,
      issuedDate: input.issuedDate ? new Date(input.issuedDate) : new Date(),
      targetAudience: input.targetAudience ?? 'all',
    },
  })
}

export async function updateCircular(schoolId: string, id: string, input: UpdateCircularInput) {
  const existing = await prisma.circular.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Circular not found')

  return prisma.circular.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.fileUrl !== undefined && { fileUrl: input.fileUrl }),
      ...(input.issuedBy !== undefined && { issuedBy: input.issuedBy }),
      ...(input.issuedDate !== undefined && { issuedDate: new Date(input.issuedDate) }),
      ...(input.targetAudience !== undefined && { targetAudience: input.targetAudience }),
    },
  })
}

export async function deleteCircular(schoolId: string, id: string) {
  const existing = await prisma.circular.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Circular not found')

  await prisma.circular.delete({ where: { id } })
  return { success: true }
}
