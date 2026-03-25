import { prisma } from '../config/db.js'
import type { SubmitContactInput, UpdateContactInput, ListContactsInput } from '../validators/contact.validators.js'

// ==================== Public ====================

export async function submitContact(schoolId: string, input: SubmitContactInput) {
  return prisma.contactSubmission.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message,
      source: 'website_contact',
      pageSlug: input.pageSlug ?? null,
      status: 'new',
    },
  })
}

// ==================== Admin: List ====================

export async function listContacts(schoolId: string, query: ListContactsInput) {
  const { page, limit, status, source, search } = query
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (status) where.status = status
  if (source) where.source = source
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contactSubmission.count({ where }),
  ])

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ==================== Admin: Single ====================

export async function getContactById(schoolId: string, id: string) {
  const contact = await prisma.contactSubmission.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!contact) throw new Error('Contact submission not found')
  return contact
}

// ==================== Admin: Update ====================

export async function updateContact(schoolId: string, id: string, input: UpdateContactInput) {
  const existing = await prisma.contactSubmission.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Contact submission not found')

  return prisma.contactSubmission.update({
    where: { id },
    data: {
      ...(input.status !== undefined && { status: input.status }),
      ...(input.notes !== undefined && { notes: input.notes }),
    },
  })
}

// ==================== Admin: Delete ====================

export async function deleteContact(schoolId: string, id: string) {
  const existing = await prisma.contactSubmission.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Contact submission not found')

  await prisma.contactSubmission.delete({ where: { id } })
  return { success: true }
}

// ==================== Admin: Stats ====================

export async function getContactStats(schoolId: string) {
  const [byStatus, bySource, total] = await Promise.all([
    prisma.contactSubmission.groupBy({
      by: ['status'] as const,
      where: { organizationId: schoolId },
      _count: { id: true },
    }),
    prisma.contactSubmission.groupBy({
      by: ['source'] as const,
      where: { organizationId: schoolId },
      _count: { id: true },
    }),
    prisma.contactSubmission.count({ where: { organizationId: schoolId } }),
  ])

  return {
    total,
    byStatus: byStatus.reduce(
      (acc, row) => ({ ...acc, [row.status]: row._count.id }),
      {} as Record<string, number>
    ),
    bySource: bySource.reduce(
      (acc, row) => ({ ...acc, [row.source]: row._count.id }),
      {} as Record<string, number>
    ),
  }
}
