import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Facilities: List ====================

export async function listFacilities(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    search?: string
    type?: string
    status?: string
    isBookable?: boolean
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.type) where.type = query.type
  if (query.status) where.status = query.status
  if (query.isBookable !== undefined) where.isBookable = query.isBookable
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { location: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.facility.findMany({
      where,
      include: { _count: { select: { bookings: true } } },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.facility.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Facilities: Get by ID ====================

export async function getFacilityById(schoolId: string, id: string) {
  const facility = await prisma.facility.findFirst({
    where: { id, organizationId: schoolId },
    include: {
      bookings: {
        where: { status: 'confirmed', date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 20,
      },
    },
  })
  if (!facility) throw AppError.notFound('Facility not found')
  return facility
}

// ==================== Facilities: Create ====================

export async function createFacility(
  schoolId: string,
  input: {
    name: string
    type?: string
    description?: string
    location?: string
    capacity?: number
    isBookable?: boolean
    status?: string
    imageUrl?: string
    amenities?: unknown
  }
) {
  return prisma.facility.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      type: input.type ?? 'general',
      description: input.description ?? null,
      location: input.location ?? null,
      capacity: input.capacity ?? null,
      isBookable: input.isBookable ?? false,
      status: input.status ?? 'available',
      imageUrl: input.imageUrl ?? null,
      amenities: input.amenities ?? [],
    },
  })
}

// ==================== Facilities: Update ====================

export async function updateFacility(
  schoolId: string,
  id: string,
  input: Record<string, unknown>
) {
  const existing = await prisma.facility.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Facility not found')

  return prisma.facility.update({ where: { id }, data: input })
}

// ==================== Facilities: Delete ====================

export async function deleteFacility(schoolId: string, id: string) {
  const existing = await prisma.facility.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Facility not found')

  await prisma.$transaction([
    prisma.facilityBooking.deleteMany({ where: { facilityId: id } }),
    prisma.facility.delete({ where: { id } }),
  ])
  return { success: true }
}

// ==================== Bookings: List ====================

export async function listBookings(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    facilityId?: string
    date?: string
    status?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {
    facility: { organizationId: schoolId },
  }

  if (query.facilityId) where.facilityId = query.facilityId
  if (query.date) where.date = new Date(query.date)
  if (query.status) where.status = query.status

  const [data, total] = await prisma.$transaction([
    prisma.facilityBooking.findMany({
      where,
      include: { facility: { select: { name: true, type: true, location: true } } },
      orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.facilityBooking.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Bookings: Create ====================

export async function createBooking(
  schoolId: string,
  input: {
    facilityId: string
    bookedBy: string
    bookedByName: string
    purpose?: string
    date: string
    startTime: string
    endTime: string
  }
) {
  const facility = await prisma.facility.findFirst({
    where: { id: input.facilityId, organizationId: schoolId },
  })
  if (!facility) throw AppError.notFound('Facility not found')
  if (!facility.isBookable) throw AppError.badRequest('This facility is not bookable')
  if (facility.status !== 'available') {
    throw AppError.badRequest(`Facility is currently ${facility.status}`)
  }

  // Check for overlapping bookings on the same date
  const bookingDate = new Date(input.date)
  const overlapping = await prisma.facilityBooking.findFirst({
    where: {
      facilityId: input.facilityId,
      date: bookingDate,
      status: 'confirmed',
      OR: [
        {
          startTime: { lte: input.startTime },
          endTime: { gt: input.startTime },
        },
        {
          startTime: { lt: input.endTime },
          endTime: { gte: input.endTime },
        },
        {
          startTime: { gte: input.startTime },
          endTime: { lte: input.endTime },
        },
      ],
    },
  })

  if (overlapping) {
    throw AppError.conflict('Time slot overlaps with an existing booking')
  }

  return prisma.facilityBooking.create({
    data: {
      facilityId: input.facilityId,
      bookedBy: input.bookedBy,
      bookedByName: input.bookedByName,
      purpose: input.purpose ?? null,
      date: bookingDate,
      startTime: input.startTime,
      endTime: input.endTime,
    },
  })
}

// ==================== Bookings: Cancel ====================

export async function cancelBooking(schoolId: string, bookingId: string) {
  const booking = await prisma.facilityBooking.findFirst({
    where: {
      id: bookingId,
      facility: { organizationId: schoolId },
    },
  })
  if (!booking) throw AppError.notFound('Booking not found')
  if (booking.status === 'cancelled') {
    throw AppError.badRequest('Booking is already cancelled')
  }

  return prisma.facilityBooking.update({
    where: { id: bookingId },
    data: { status: 'cancelled' },
  })
}

// ==================== Get Available Facilities ====================

export async function getAvailableFacilities(
  schoolId: string,
  date: string,
  startTime: string,
  endTime: string
) {
  const bookingDate = new Date(date)

  // Find facilities that have overlapping confirmed bookings
  const busyFacilityIds = await prisma.facilityBooking.findMany({
    where: {
      facility: { organizationId: schoolId },
      date: bookingDate,
      status: 'confirmed',
      OR: [
        {
          startTime: { lte: startTime },
          endTime: { gt: startTime },
        },
        {
          startTime: { lt: endTime },
          endTime: { gte: endTime },
        },
        {
          startTime: { gte: startTime },
          endTime: { lte: endTime },
        },
      ],
    },
    select: { facilityId: true },
    distinct: ['facilityId'],
  })

  const busyIds = busyFacilityIds.map((b) => b.facilityId)

  return prisma.facility.findMany({
    where: {
      organizationId: schoolId,
      isBookable: true,
      status: 'available',
      id: { notIn: busyIds },
    },
    orderBy: { name: 'asc' },
  })
}

// ==================== Facility Stats ====================

export async function getFacilityStats(schoolId: string) {
  const [totalFacilities, byType, byStatus, totalBookings, upcomingBookings] =
    await Promise.all([
      prisma.facility.count({ where: { organizationId: schoolId } }),
      prisma.facility.groupBy({
        by: ['type'],
        where: { organizationId: schoolId },
        _count: { id: true },
      }),
      prisma.facility.groupBy({
        by: ['status'],
        where: { organizationId: schoolId },
        _count: { id: true },
      }),
      prisma.facilityBooking.count({
        where: { facility: { organizationId: schoolId } },
      }),
      prisma.facilityBooking.count({
        where: {
          facility: { organizationId: schoolId },
          status: 'confirmed',
          date: { gte: new Date() },
        },
      }),
    ])

  return {
    totalFacilities,
    totalBookings,
    upcomingBookings,
    byType: byType.map((g) => ({ type: g.type, count: g._count.id })),
    byStatus: byStatus.map((g) => ({ status: g.status, count: g._count.id })),
  }
}
