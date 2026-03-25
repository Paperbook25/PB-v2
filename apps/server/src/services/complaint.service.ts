import { prisma } from '../config/db.js'

// ==================== Complaints: List ====================

export async function listComplaints(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    status?: string
    category?: string
    priority?: string
    search?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.status) where.status = query.status
  if (query.category) where.category = query.category
  if (query.priority) where.priority = query.priority
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { complaintNumber: { contains: query.search, mode: 'insensitive' } },
      { filedByName: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.complaint.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Complaints: Get by ID ====================

export async function getComplaintById(schoolId: string, id: string) {
  const complaint = await prisma.complaint.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!complaint) throw new Error('Complaint not found')
  return complaint
}

// ==================== Complaints: Create ====================

export async function createComplaint(
  schoolId: string,
  input: {
    title: string
    description: string
    category?: string
    priority?: string
    filedBy: string
    filedByName: string
    filedByRole: string
  }
) {
  const count = await prisma.complaint.count({ where: { organizationId: schoolId } })
  const complaintNumber = `CMP-${String(count + 1).padStart(5, '0')}`

  return prisma.complaint.create({
    data: {
      organizationId: schoolId,
      complaintNumber,
      title: input.title,
      description: input.description,
      category: input.category ?? 'general',
      priority: input.priority ?? 'medium',
      filedBy: input.filedBy,
      filedByName: input.filedByName,
      filedByRole: input.filedByRole,
    },
  })
}

// ==================== Complaints: Update ====================

export async function updateComplaint(
  schoolId: string,
  id: string,
  input: {
    title?: string
    description?: string
    category?: string
    priority?: string
    status?: string
  }
) {
  const existing = await prisma.complaint.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Complaint not found')

  return prisma.complaint.update({
    where: { id },
    data: input,
  })
}

// ==================== Complaints: Assign ====================

export async function assignComplaint(
  schoolId: string,
  id: string,
  input: { assignedTo: string; assignedToName: string }
) {
  const existing = await prisma.complaint.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Complaint not found')

  return prisma.complaint.update({
    where: { id },
    data: {
      assignedTo: input.assignedTo,
      assignedToName: input.assignedToName,
      status: existing.status === 'open' ? 'in_progress' : existing.status,
    },
  })
}

// ==================== Complaints: Resolve ====================

export async function resolveComplaint(
  schoolId: string,
  id: string,
  input: { resolution: string; resolvedBy: string }
) {
  const existing = await prisma.complaint.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Complaint not found')

  return prisma.complaint.update({
    where: { id },
    data: {
      resolution: input.resolution,
      resolvedBy: input.resolvedBy,
      resolvedAt: new Date(),
      status: 'resolved',
    },
  })
}

// ==================== Complaints: Delete ====================

export async function deleteComplaint(schoolId: string, id: string) {
  const existing = await prisma.complaint.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Complaint not found')

  await prisma.complaint.delete({ where: { id } })
  return { success: true }
}

// ==================== Complaints: Stats ====================

export async function getComplaintStats(schoolId: string) {
  const [total, byStatus, byCategory, byPriority] = await Promise.all([
    prisma.complaint.count({ where: { organizationId: schoolId } }),
    prisma.complaint.groupBy({
      by: ['status'] as const,
      where: { organizationId: schoolId },
      _count: { id: true },
    }),
    prisma.complaint.groupBy({
      by: ['category'] as const,
      where: { organizationId: schoolId },
      _count: { id: true },
    }),
    prisma.complaint.groupBy({
      by: ['priority'] as const,
      where: { organizationId: schoolId },
      _count: { id: true },
    }),
  ])

  return {
    total,
    byStatus: byStatus.reduce(
      (acc, row) => ({ ...acc, [row.status]: row._count.id }),
      {} as Record<string, number>
    ),
    byCategory: byCategory.reduce(
      (acc, row) => ({ ...acc, [row.category]: row._count.id }),
      {} as Record<string, number>
    ),
    byPriority: byPriority.reduce(
      (acc, row) => ({ ...acc, [row.priority]: row._count.id }),
      {} as Record<string, number>
    ),
  }
}
