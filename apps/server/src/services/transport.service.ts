import { prisma } from '../config/db.js'

// ==================== Routes: List ====================

export async function listRoutes(
  schoolId: string,
  query: { page?: number; limit?: number; search?: string; isActive?: boolean }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.isActive !== undefined) where.isActive = query.isActive
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { vehicleNumber: { contains: query.search, mode: 'insensitive' } },
      { driverName: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.transportRoute.findMany({
      where,
      include: { stops: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.transportRoute.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Routes: Get by ID ====================

export async function getRouteById(schoolId: string, id: string) {
  const route = await prisma.transportRoute.findFirst({
    where: { id, organizationId: schoolId },
    include: { stops: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!route) throw new Error('Route not found')
  return route
}

// ==================== Routes: Create ====================

export async function createRoute(
  schoolId: string,
  input: {
    name: string
    description?: string
    vehicleNumber?: string
    vehicleType?: string
    driverName?: string
    driverPhone?: string
    attendantName?: string
    capacity?: number
    fee?: number
  }
) {
  return prisma.transportRoute.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      description: input.description ?? null,
      vehicleNumber: input.vehicleNumber ?? null,
      vehicleType: input.vehicleType ?? 'bus',
      driverName: input.driverName ?? null,
      driverPhone: input.driverPhone ?? null,
      attendantName: input.attendantName ?? null,
      capacity: input.capacity ?? 40,
      fee: input.fee ?? null,
    },
  })
}

// ==================== Routes: Update ====================

export async function updateRoute(
  schoolId: string,
  id: string,
  input: Record<string, unknown>
) {
  const existing = await prisma.transportRoute.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Route not found')

  return prisma.transportRoute.update({ where: { id }, data: input })
}

// ==================== Routes: Delete ====================

export async function deleteRoute(schoolId: string, id: string) {
  const existing = await prisma.transportRoute.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Route not found')

  await prisma.transportRoute.delete({ where: { id } }) // Cascade deletes stops
  return { success: true }
}

// ==================== Stops: Add ====================

export async function addStop(
  schoolId: string,
  routeId: string,
  input: {
    name: string
    area?: string
    pickupTime?: string
    dropTime?: string
    sortOrder?: number
  }
) {
  // Verify route belongs to school
  const route = await prisma.transportRoute.findFirst({
    where: { id: routeId, organizationId: schoolId },
  })
  if (!route) throw new Error('Route not found')

  return prisma.transportStop.create({
    data: {
      routeId,
      name: input.name,
      area: input.area ?? null,
      pickupTime: input.pickupTime ?? null,
      dropTime: input.dropTime ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  })
}

// ==================== Stops: Update ====================

export async function updateStop(
  schoolId: string,
  stopId: string,
  input: Record<string, unknown>
) {
  const stop = await prisma.transportStop.findFirst({
    where: { id: stopId },
    include: { route: { select: { organizationId: true } } },
  })
  if (!stop || stop.route.organizationId !== schoolId) {
    throw new Error('Stop not found')
  }

  return prisma.transportStop.update({ where: { id: stopId }, data: input })
}

// ==================== Stops: Delete ====================

export async function deleteStop(schoolId: string, stopId: string) {
  const stop = await prisma.transportStop.findFirst({
    where: { id: stopId },
    include: { route: { select: { organizationId: true } } },
  })
  if (!stop || stop.route.organizationId !== schoolId) {
    throw new Error('Stop not found')
  }

  await prisma.transportStop.delete({ where: { id: stopId } })
  return { success: true }
}

// ==================== Stops: Reorder ====================

export async function reorderStops(
  schoolId: string,
  routeId: string,
  stopIds: string[]
) {
  const route = await prisma.transportRoute.findFirst({
    where: { id: routeId, organizationId: schoolId },
  })
  if (!route) throw new Error('Route not found')

  const updates = stopIds.map((id, index) =>
    prisma.transportStop.update({
      where: { id },
      data: { sortOrder: index },
    })
  )

  await prisma.$transaction(updates)
  return { success: true }
}

// ==================== Transport Stats ====================

export async function getTransportStats(schoolId: string) {
  const [totalRoutes, activeRoutes, totalCapacity, totalStudents] =
    await Promise.all([
      prisma.transportRoute.count({ where: { organizationId: schoolId } }),
      prisma.transportRoute.count({
        where: { organizationId: schoolId, isActive: true },
      }),
      prisma.transportRoute.aggregate({
        where: { organizationId: schoolId, isActive: true },
        _sum: { capacity: true, currentStudents: true },
      }),
      prisma.transportStop.count({
        where: { route: { organizationId: schoolId } },
      }),
    ])

  return {
    totalRoutes,
    activeRoutes,
    totalCapacity: totalCapacity._sum.capacity ?? 0,
    totalStudentsUsing: totalCapacity._sum.currentStudents ?? 0,
    totalStops: totalStudents,
  }
}
