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

// ==================== Vehicles: List ====================

export async function listVehicles(
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
      { vehicleNumber: { contains: query.search, mode: 'insensitive' } },
      { make: { contains: query.search, mode: 'insensitive' } },
      { model: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.transportVehicle.findMany({
      where,
      orderBy: { vehicleNumber: 'asc' },
      skip,
      take: limit,
    }),
    prisma.transportVehicle.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Vehicles: Get by ID ====================

export async function getVehicle(schoolId: string, id: string) {
  const vehicle = await prisma.transportVehicle.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!vehicle) throw new Error('Vehicle not found')
  return vehicle
}

// ==================== Vehicles: Create ====================

export async function createVehicle(
  schoolId: string,
  input: {
    vehicleNumber: string
    type?: string
    capacity?: number
    make?: string
    model?: string
    year?: number
    registrationNumber?: string
    insuranceNumber?: string
    insuranceExpiry?: string
    fitnessExpiry?: string
  }
) {
  return prisma.transportVehicle.create({
    data: {
      organizationId: schoolId,
      vehicleNumber: input.vehicleNumber,
      type: input.type ?? 'bus',
      capacity: input.capacity ?? 40,
      make: input.make ?? null,
      model: input.model ?? null,
      year: input.year ?? null,
      registrationNumber: input.registrationNumber ?? null,
      insuranceNumber: input.insuranceNumber ?? null,
      insuranceExpiry: input.insuranceExpiry ? new Date(input.insuranceExpiry) : null,
      fitnessExpiry: input.fitnessExpiry ? new Date(input.fitnessExpiry) : null,
    },
  })
}

// ==================== Vehicles: Update ====================

export async function updateVehicle(
  schoolId: string,
  id: string,
  input: Record<string, unknown>
) {
  const existing = await prisma.transportVehicle.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Vehicle not found')

  // Convert date strings to Date objects if present
  const data = { ...input }
  if (typeof data.insuranceExpiry === 'string') data.insuranceExpiry = new Date(data.insuranceExpiry as string)
  if (typeof data.fitnessExpiry === 'string') data.fitnessExpiry = new Date(data.fitnessExpiry as string)

  return prisma.transportVehicle.update({ where: { id }, data })
}

// ==================== Vehicles: Delete ====================

export async function deleteVehicle(schoolId: string, id: string) {
  const existing = await prisma.transportVehicle.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Vehicle not found')

  await prisma.transportVehicle.delete({ where: { id } })
  return { success: true }
}

// ==================== Drivers: List ====================

export async function listDrivers(
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
      { phone: { contains: query.search, mode: 'insensitive' } },
      { licenseNumber: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.transportDriver.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.transportDriver.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Drivers: Get by ID ====================

export async function getDriver(schoolId: string, id: string) {
  const driver = await prisma.transportDriver.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!driver) throw new Error('Driver not found')
  return driver
}

// ==================== Drivers: Create ====================

export async function createDriver(
  schoolId: string,
  input: {
    name: string
    phone?: string
    licenseNumber?: string
    licenseExpiry?: string
    address?: string
    experience?: number
    photoUrl?: string
  }
) {
  return prisma.transportDriver.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      phone: input.phone ?? null,
      licenseNumber: input.licenseNumber ?? null,
      licenseExpiry: input.licenseExpiry ? new Date(input.licenseExpiry) : null,
      address: input.address ?? null,
      experience: input.experience ?? null,
      photoUrl: input.photoUrl ?? null,
    },
  })
}

// ==================== Drivers: Update ====================

export async function updateDriver(
  schoolId: string,
  id: string,
  input: Record<string, unknown>
) {
  const existing = await prisma.transportDriver.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Driver not found')

  const data = { ...input }
  if (typeof data.licenseExpiry === 'string') data.licenseExpiry = new Date(data.licenseExpiry as string)

  return prisma.transportDriver.update({ where: { id }, data })
}

// ==================== Drivers: Delete ====================

export async function deleteDriver(schoolId: string, id: string) {
  const existing = await prisma.transportDriver.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Driver not found')

  await prisma.transportDriver.delete({ where: { id } })
  return { success: true }
}

// ==================== Assignments: List ====================

export async function listAssignments(
  schoolId: string,
  query: { page?: number; limit?: number; routeId?: string; stopId?: string; search?: string }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 50
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.routeId) where.routeId = query.routeId
  if (query.stopId) where.stopId = query.stopId
  if (query.search) {
    where.student = {
      OR: [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { admissionNumber: { contains: query.search, mode: 'insensitive' } },
      ],
    }
  }

  const [data, total] = await prisma.$transaction([
    prisma.transportAssignment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            classId: true,
            sectionId: true,
            photoUrl: true,
          },
        },
        route: { select: { id: true, name: true } },
        stop: { select: { id: true, name: true, area: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transportAssignment.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Assignments: Assign Student ====================

export async function assignStudent(
  schoolId: string,
  input: {
    studentId: string
    routeId: string
    stopId?: string
    pickupType?: string
  }
) {
  // Verify route belongs to school
  const route = await prisma.transportRoute.findFirst({
    where: { id: input.routeId, organizationId: schoolId },
  })
  if (!route) throw new Error('Route not found')

  // Verify stop belongs to route if provided
  if (input.stopId) {
    const stop = await prisma.transportStop.findFirst({
      where: { id: input.stopId, routeId: input.routeId },
    })
    if (!stop) throw new Error('Stop not found on this route')
  }

  // Upsert: if student already assigned, update; otherwise create
  return prisma.transportAssignment.upsert({
    where: {
      organizationId_studentId: {
        organizationId: schoolId,
        studentId: input.studentId,
      },
    },
    update: {
      routeId: input.routeId,
      stopId: input.stopId ?? null,
      pickupType: input.pickupType ?? 'both',
    },
    create: {
      organizationId: schoolId,
      studentId: input.studentId,
      routeId: input.routeId,
      stopId: input.stopId ?? null,
      pickupType: input.pickupType ?? 'both',
    },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true, admissionNumber: true },
      },
      route: { select: { id: true, name: true } },
      stop: { select: { id: true, name: true } },
    },
  })
}

// ==================== Assignments: Remove ====================

export async function removeAssignment(schoolId: string, id: string) {
  const existing = await prisma.transportAssignment.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Assignment not found')

  await prisma.transportAssignment.delete({ where: { id } })
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
