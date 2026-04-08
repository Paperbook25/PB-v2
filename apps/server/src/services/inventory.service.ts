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

// ==================== Assets ====================

export async function listAssets(
  schoolId: string,
  query: { category?: string; condition?: string; search?: string; page?: number; limit?: number }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId, isActive: true }
  if (query.category) where.category = query.category
  if (query.condition) where.condition = query.condition
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { assetCode: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.asset.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function getAssetById(schoolId: string, id: string) {
  const asset = await prisma.asset.findFirst({ where: { id, organizationId: schoolId } })
  if (!asset) throw AppError.notFound('Asset not found')
  return asset
}

export async function createAsset(schoolId: string, input: Record<string, unknown>) {
  return prisma.asset.create({
    data: {
      organizationId: schoolId,
      name: input.name as string,
      assetCode: (input.assetCode as string) ?? null,
      category: (input.category as string) ?? 'furniture',
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate as string) : null,
      purchasePrice: input.purchasePrice ? Number(input.purchasePrice) : null,
      currentValue: input.currentValue ? Number(input.currentValue) : null,
      depreciation: input.depreciation ? Number(input.depreciation) : null,
      location: (input.location as string) ?? null,
      assignedTo: (input.assignedTo as string) ?? null,
      condition: (input.condition as string) ?? 'good',
      warrantyExpiry: input.warrantyExpiry ? new Date(input.warrantyExpiry as string) : null,
      notes: (input.notes as string) ?? null,
    },
  })
}

export async function updateAsset(schoolId: string, id: string, input: Record<string, unknown>) {
  const existing = await prisma.asset.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Asset not found')
  const { organizationId: _o, ...safe } = input as any
  if (safe.purchaseDate) safe.purchaseDate = new Date(safe.purchaseDate)
  if (safe.warrantyExpiry) safe.warrantyExpiry = new Date(safe.warrantyExpiry)
  return prisma.asset.update({ where: { id }, data: safe })
}

export async function deleteAsset(schoolId: string, id: string) {
  const existing = await prisma.asset.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Asset not found')
  await prisma.asset.update({ where: { id }, data: { isActive: false } })
  return { success: true }
}

// ==================== Vendors ====================

export async function listVendors(schoolId: string, query: { search?: string; isActive?: boolean } = {}) {
  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.isActive !== undefined) where.isActive = query.isActive
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  return prisma.vendor.findMany({ where, orderBy: { name: 'asc' } })
}

export async function getVendorById(schoolId: string, id: string) {
  const vendor = await prisma.vendor.findFirst({ where: { id, organizationId: schoolId } })
  if (!vendor) throw AppError.notFound('Vendor not found')
  return vendor
}

export async function createVendor(schoolId: string, input: Record<string, unknown>) {
  return prisma.vendor.create({
    data: {
      organizationId: schoolId,
      name: input.name as string,
      contactPerson: (input.contactPerson as string) ?? null,
      email: (input.email as string) ?? null,
      phone: (input.phone as string) ?? null,
      address: (input.address as string) ?? null,
      gstin: (input.gstin as string) ?? null,
    },
  })
}

export async function updateVendor(schoolId: string, id: string, input: Record<string, unknown>) {
  const existing = await prisma.vendor.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Vendor not found')
  const { organizationId: _o, ...safe } = input as any
  return prisma.vendor.update({ where: { id }, data: safe })
}

// ==================== Purchase Orders ====================

export async function listPurchaseOrders(
  schoolId: string,
  query: { vendorId?: string; status?: string; page?: number; limit?: number }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.vendorId) where.vendorId = query.vendorId
  if (query.status) where.status = query.status

  const [data, total] = await prisma.$transaction([
    prisma.purchaseOrder.findMany({
      where,
      include: { vendor: { select: { name: true } }, items: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.purchaseOrder.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function getPurchaseOrderById(schoolId: string, id: string) {
  const po = await prisma.purchaseOrder.findFirst({
    where: { id, organizationId: schoolId },
    include: { vendor: true, items: true },
  })
  if (!po) throw AppError.notFound('Purchase order not found')
  return po
}

export async function createPurchaseOrder(
  schoolId: string,
  input: {
    vendorId: string
    notes?: string
    items: Array<{ itemName: string; quantity: number; unitPrice: number }>
  }
) {
  const items = input.items ?? []
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  // Generate PO number
  const count = await prisma.purchaseOrder.count({ where: { organizationId: schoolId } })
  const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

  return prisma.purchaseOrder.create({
    data: {
      organizationId: schoolId,
      poNumber,
      vendorId: input.vendorId,
      totalAmount,
      notes: input.notes ?? null,
      items: {
        create: items.map((item) => ({
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })),
      },
    },
    include: { vendor: { select: { name: true } }, items: true },
  })
}

export async function updatePurchaseOrderStatus(schoolId: string, id: string, status: string) {
  const existing = await prisma.purchaseOrder.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Purchase order not found')

  const data: Record<string, unknown> = { status }
  if (status === 'ordered') data.orderedDate = new Date()
  if (status === 'received') data.receivedDate = new Date()

  return prisma.purchaseOrder.update({ where: { id }, data })
}

export async function deletePurchaseOrder(schoolId: string, id: string) {
  const existing = await prisma.purchaseOrder.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Purchase order not found')
  if (!['draft', 'cancelled'].includes(existing.status)) {
    throw AppError.badRequest('Only draft or cancelled purchase orders can be deleted')
  }

  await prisma.purchaseOrder.delete({ where: { id } })
  return { success: true }
}
