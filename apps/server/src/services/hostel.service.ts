import { prisma } from '../config/db.js'

// ==================== Rooms: List ====================

export async function listRooms(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    status?: string
    block?: string
    roomType?: string
    search?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.status) where.status = query.status
  if (query.block) where.block = query.block
  if (query.roomType) where.roomType = query.roomType
  if (query.search) {
    where.OR = [
      { roomNumber: { contains: query.search, mode: 'insensitive' } },
      { block: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.hostelRoom.findMany({
      where,
      include: { allocations: { where: { status: 'active' } } },
      orderBy: { roomNumber: 'asc' },
      skip,
      take: limit,
    }),
    prisma.hostelRoom.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Rooms: Get by ID ====================

export async function getRoomById(schoolId: string, id: string) {
  const room = await prisma.hostelRoom.findFirst({
    where: { id, organizationId: schoolId },
    include: { allocations: { orderBy: { allocatedDate: 'desc' } } },
  })
  if (!room) throw new Error('Hostel room not found')
  return room
}

// ==================== Rooms: Create ====================

export async function createRoom(
  schoolId: string,
  input: {
    roomNumber: string
    block?: string
    floor?: number
    roomType?: string
    capacity?: number
    fee?: number
    status?: string
    amenities?: unknown
  }
) {
  return prisma.hostelRoom.create({
    data: {
      organizationId: schoolId,
      roomNumber: input.roomNumber,
      block: input.block ?? null,
      floor: input.floor ?? 0,
      roomType: input.roomType ?? 'regular',
      capacity: input.capacity ?? 4,
      fee: input.fee ?? null,
      status: input.status ?? 'available',
      amenities: (input.amenities as object) ?? [],
    },
  })
}

// ==================== Rooms: Update ====================

export async function updateRoom(
  schoolId: string,
  id: string,
  input: {
    roomNumber?: string
    block?: string
    floor?: number
    roomType?: string
    capacity?: number
    fee?: number
    status?: string
    amenities?: unknown
  }
) {
  const existing = await prisma.hostelRoom.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Hostel room not found')

  return prisma.hostelRoom.update({ where: { id }, data: input as Record<string, unknown> })
}

// ==================== Rooms: Delete ====================

export async function deleteRoom(schoolId: string, id: string) {
  const existing = await prisma.hostelRoom.findFirst({
    where: { id, organizationId: schoolId },
    include: { allocations: { where: { status: 'active' } } },
  })
  if (!existing) throw new Error('Hostel room not found')
  if (existing.allocations.length > 0) {
    throw new Error('Cannot delete room with active allocations')
  }

  await prisma.hostelRoom.delete({ where: { id } })
  return { success: true }
}

// ==================== Allocations: Allocate Student ====================

export async function allocateStudent(
  schoolId: string,
  input: {
    roomId: string
    studentId: string
    studentName: string
    className?: string
  }
) {
  const room = await prisma.hostelRoom.findFirst({
    where: { id: input.roomId, organizationId: schoolId },
  })
  if (!room) throw new Error('Hostel room not found')
  if (room.occupied >= room.capacity) throw new Error('Room is already at full capacity')

  // Check if student already has an active allocation
  const existingAllocation = await prisma.hostelAllocation.findFirst({
    where: {
      organizationId: schoolId,
      studentId: input.studentId,
      status: 'active',
    },
  })
  if (existingAllocation) throw new Error('Student already has an active hostel allocation')

  const [allocation] = await prisma.$transaction([
    prisma.hostelAllocation.create({
      data: {
        organizationId: schoolId,
        roomId: input.roomId,
        studentId: input.studentId,
        studentName: input.studentName,
        className: input.className ?? null,
      },
    }),
    prisma.hostelRoom.update({
      where: { id: input.roomId },
      data: {
        occupied: { increment: 1 },
        status: room.occupied + 1 >= room.capacity ? 'full' : 'available',
      },
    }),
  ])

  return allocation
}

// ==================== Allocations: Vacate Student ====================

export async function vacateStudent(schoolId: string, allocationId: string) {
  const allocation = await prisma.hostelAllocation.findFirst({
    where: { id: allocationId, organizationId: schoolId },
  })
  if (!allocation) throw new Error('Allocation not found')
  if (allocation.status !== 'active') throw new Error('Allocation is not active')

  const [updated] = await prisma.$transaction([
    prisma.hostelAllocation.update({
      where: { id: allocationId },
      data: { status: 'vacated', vacatedDate: new Date() },
    }),
    prisma.hostelRoom.update({
      where: { id: allocation.roomId },
      data: {
        occupied: { decrement: 1 },
        status: 'available',
      },
    }),
  ])

  return updated
}

// ==================== Allocations: List ====================

export async function listAllocations(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    status?: string
    roomId?: string
    search?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.status) where.status = query.status
  if (query.roomId) where.roomId = query.roomId
  if (query.search) {
    where.OR = [
      { studentName: { contains: query.search, mode: 'insensitive' } },
      { className: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.hostelAllocation.findMany({
      where,
      include: { room: true },
      orderBy: { allocatedDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.hostelAllocation.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Hostel: Stats ====================

export async function getHostelStats(schoolId: string) {
  const [totalRooms, totalBeds, occupiedBeds, byStatus] = await Promise.all([
    prisma.hostelRoom.count({ where: { organizationId: schoolId } }),
    prisma.hostelRoom.aggregate({
      where: { organizationId: schoolId },
      _sum: { capacity: true },
    }),
    prisma.hostelRoom.aggregate({
      where: { organizationId: schoolId },
      _sum: { occupied: true },
    }),
    prisma.hostelRoom.groupBy({
      by: ['status'] as const,
      where: { organizationId: schoolId },
      _count: { id: true },
    }),
  ])

  const totalCapacity = totalBeds._sum.capacity ?? 0
  const totalOccupied = occupiedBeds._sum.occupied ?? 0

  return {
    totalRooms,
    totalCapacity,
    totalOccupied,
    availableBeds: totalCapacity - totalOccupied,
    occupancyRate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
    byStatus: byStatus.reduce(
      (acc, row) => ({ ...acc, [row.status]: row._count.id }),
      {} as Record<string, number>
    ),
  }
}
