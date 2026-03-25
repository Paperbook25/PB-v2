import { prisma } from '../config/db.js'

// ==================== Documents: List ====================

export async function listDocuments(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    search?: string
    category?: string
    isPublic?: boolean
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.category) where.category = query.category
  if (query.isPublic !== undefined) where.isPublic = query.isPublic
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.schoolDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.schoolDocument.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Documents: Get by ID ====================

export async function getDocumentById(schoolId: string, id: string) {
  const doc = await prisma.schoolDocument.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!doc) throw new Error('Document not found')
  return doc
}

// ==================== Documents: Create ====================

export async function createDocument(
  schoolId: string,
  input: {
    title: string
    description?: string
    category?: string
    fileUrl: string
    fileType?: string
    fileSize?: number
    uploadedBy?: string
    isPublic?: boolean
  }
) {
  return prisma.schoolDocument.create({
    data: {
      organizationId: schoolId,
      title: input.title,
      description: input.description ?? null,
      category: input.category ?? 'general',
      fileUrl: input.fileUrl,
      fileType: input.fileType ?? null,
      fileSize: input.fileSize ?? null,
      uploadedBy: input.uploadedBy ?? null,
      isPublic: input.isPublic ?? false,
    },
  })
}

// ==================== Documents: Update ====================

export async function updateDocument(
  schoolId: string,
  id: string,
  input: Record<string, unknown>
) {
  const existing = await prisma.schoolDocument.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Document not found')

  return prisma.schoolDocument.update({ where: { id }, data: input })
}

// ==================== Documents: Delete ====================

export async function deleteDocument(schoolId: string, id: string) {
  const existing = await prisma.schoolDocument.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Document not found')

  await prisma.schoolDocument.delete({ where: { id } })
  return { success: true }
}

// ==================== Documents: Increment Download ====================

export async function incrementDownload(schoolId: string, id: string) {
  const existing = await prisma.schoolDocument.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Document not found')

  return prisma.schoolDocument.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  })
}
