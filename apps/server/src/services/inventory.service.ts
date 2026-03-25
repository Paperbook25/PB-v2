import { prisma } from '../config/db.js'

// ==================== Inventory: List ====================

export async function listItems(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    category?: string
    condition?: string
    search?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.category) where.category = query.category
  if (query.condition) where.condition = query.condition
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { assetCode: { contains: query.search, mode: 'insensitive' } },
      { location: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.inventoryItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.inventoryItem.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Inventory: Get by ID ====================

export async function getItemById(schoolId: string, id: string) {
  const item = await prisma.inventoryItem.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!item) throw new Error('Inventory item not found')
  return item
}

// ==================== Inventory: Create ====================

export async function createItem(
  schoolId: string,
  input: {
    name: string
    category?: string
    description?: string
    quantity?: number
    unit?: string
    location?: string
    purchaseDate?: string
    purchasePrice?: number
    vendorName?: string
    condition?: string
    warrantyExpiry?: string
    assetCode?: string
    minStock?: number
  }
) {
  return prisma.inventoryItem.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      category: input.category ?? 'general',
      description: input.description ?? null,
      quantity: input.quantity ?? 0,
      unit: input.unit ?? 'pieces',
      location: input.location ?? null,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
      purchasePrice: input.purchasePrice ?? null,
      vendorName: input.vendorName ?? null,
      condition: input.condition ?? 'good',
      warrantyExpiry: input.warrantyExpiry ? new Date(input.warrantyExpiry) : null,
      assetCode: input.assetCode ?? null,
      minStock: input.minStock ?? 0,
    },
  })
}

// ==================== Inventory: Update ====================

export async function updateItem(
  schoolId: string,
  id: string,
  input: {
    name?: string
    category?: string
    description?: string
    quantity?: number
    unit?: string
    location?: string
    purchaseDate?: string
    purchasePrice?: number
    vendorName?: string
    condition?: string
    warrantyExpiry?: string
    assetCode?: string
    minStock?: number
  }
) {
  const existing = await prisma.inventoryItem.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Inventory item not found')

  const data: Record<string, unknown> = { ...input }
  if (input.purchaseDate) data.purchaseDate = new Date(input.purchaseDate)
  if (input.warrantyExpiry) data.warrantyExpiry = new Date(input.warrantyExpiry)

  return prisma.inventoryItem.update({ where: { id }, data })
}

// ==================== Inventory: Delete ====================

export async function deleteItem(schoolId: string, id: string) {
  const existing = await prisma.inventoryItem.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Inventory item not found')

  await prisma.inventoryItem.delete({ where: { id } })
  return { success: true }
}

// ==================== Inventory: Low Stock ====================

export async function getLowStock(schoolId: string) {
  // Items where quantity <= minStock and minStock > 0
  const items = await prisma.inventoryItem.findMany({
    where: {
      organizationId: schoolId,
      minStock: { gt: 0 },
    },
    orderBy: { quantity: 'asc' },
  })

  // Filter in application layer since Prisma doesn't support comparing two columns directly
  return items.filter((item) => item.quantity <= item.minStock)
}

// ==================== Inventory: Stats ====================

export async function getInventoryStats(schoolId: string) {
  const [totalItems, byCategory, byCondition, allItems] = await Promise.all([
    prisma.inventoryItem.count({ where: { organizationId: schoolId } }),
    prisma.inventoryItem.groupBy({
      by: ['category'] as const,
      where: { organizationId: schoolId },
      _count: { id: true },
    }),
    prisma.inventoryItem.groupBy({
      by: ['condition'] as const,
      where: { organizationId: schoolId },
      _count: { id: true },
    }),
    prisma.inventoryItem.aggregate({
      where: { organizationId: schoolId },
      _sum: { purchasePrice: true },
    }),
  ])

  const lowStockItems = await getLowStock(schoolId)

  return {
    totalItems,
    totalValue: allItems._sum.purchasePrice ?? 0,
    lowStockCount: lowStockItems.length,
    byCategory: byCategory.reduce(
      (acc, row) => ({ ...acc, [row.category]: row._count.id }),
      {} as Record<string, number>
    ),
    byCondition: byCondition.reduce(
      (acc, row) => ({ ...acc, [row.condition]: row._count.id }),
      {} as Record<string, number>
    ),
  }
}
