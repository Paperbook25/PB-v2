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

// ==================== Hostel CRUD ====================

export async function listHostels(schoolId: string) {
  return prisma.hostel.findMany({
    where: { organizationId: schoolId },
    orderBy: { name: 'asc' },
  })
}

export async function getHostelById(schoolId: string, id: string) {
  const hostel = await prisma.hostel.findFirst({ where: { id, organizationId: schoolId } })
  if (!hostel) throw AppError.notFound('Hostel not found')
  return hostel
}

export async function createHostel(schoolId: string, input: Record<string, unknown>) {
  return prisma.hostel.create({
    data: {
      organizationId: schoolId,
      name: input.name as string,
      type: (input.type as string) ?? 'boys',
      totalRooms: Number(input.totalRooms ?? 0),
      capacity: Number(input.capacity ?? 0),
      wardenName: (input.wardenName as string) ?? null,
      wardenPhone: (input.wardenPhone as string) ?? null,
      address: (input.address as string) ?? null,
    },
  })
}

export async function updateHostel(schoolId: string, id: string, input: Record<string, unknown>) {
  const existing = await prisma.hostel.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Hostel not found')
  const { organizationId: _o, ...safe } = input as any
  return prisma.hostel.update({ where: { id }, data: safe })
}

export async function deleteHostel(schoolId: string, id: string) {
  const existing = await prisma.hostel.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Hostel not found')
  await prisma.hostel.delete({ where: { id } })
  return { success: true }
}

// ==================== Mess Menu ====================

export async function getMessMenu(schoolId: string, hostelId?: string) {
  const where: Record<string, unknown> = { organizationId: schoolId }
  if (hostelId) where.hostelId = hostelId

  return prisma.messMenu.findMany({
    where,
    orderBy: [{ weekDay: 'asc' }, { mealType: 'asc' }],
  })
}

export async function updateMessMenu(
  schoolId: string,
  items: Array<{ weekDay: string; mealType: string; items: string; hostelId?: string }>
) {
  // Upsert each meal slot
  const results = await prisma.$transaction(
    items.map((item) =>
      prisma.messMenu.upsert({
        where: {
          id: 'nonexistent', // force create path — we use updateMany+create pattern below
        },
        update: {},
        create: {
          organizationId: schoolId,
          hostelId: item.hostelId ?? null,
          weekDay: item.weekDay,
          mealType: item.mealType,
          items: item.items,
        },
      }).catch(() =>
        prisma.messMenu.updateMany({
          where: {
            organizationId: schoolId,
            weekDay: item.weekDay,
            mealType: item.mealType,
            hostelId: item.hostelId ?? null,
          },
          data: { items: item.items },
        })
      )
    )
  )
  return results
}

export async function upsertMessMenuItems(
  schoolId: string,
  items: Array<{ weekDay: string; mealType: string; items: string; hostelId?: string }>
) {
  // Delete existing for this hostel and recreate
  const hostelId = items[0]?.hostelId ?? null
  await prisma.messMenu.deleteMany({
    where: { organizationId: schoolId, hostelId },
  })
  if (items.length === 0) return []

  return prisma.messMenu.createMany({
    data: items.map((item) => ({
      organizationId: schoolId,
      hostelId: item.hostelId ?? null,
      weekDay: item.weekDay,
      mealType: item.mealType,
      items: item.items,
    })),
  })
}

// ==================== Hostel Attendance ====================

export async function listHostelAttendance(
  schoolId: string,
  query: { hostelId?: string; date?: string; studentId?: string; page?: number; limit?: number }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 50
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.hostelId) where.hostelId = query.hostelId
  if (query.studentId) where.studentId = query.studentId
  if (query.date) where.date = new Date(query.date)

  const [data, total] = await prisma.$transaction([
    prisma.hostelAttendanceRecord.findMany({ where, orderBy: { date: 'desc' }, skip, take: limit }),
    prisma.hostelAttendanceRecord.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function markHostelAttendance(schoolId: string, input: Record<string, unknown>) {
  return prisma.hostelAttendanceRecord.create({
    data: {
      organizationId: schoolId,
      hostelId: input.hostelId as string,
      studentId: input.studentId as string,
      studentName: input.studentName as string,
      date: new Date(input.date as string),
      status: (input.status as string) ?? 'present',
      remarks: (input.remarks as string) ?? null,
    },
  })
}

export async function bulkMarkHostelAttendance(
  schoolId: string,
  hostelId: string,
  date: string,
  records: Array<{ studentId: string; studentName: string; status: string; remarks?: string }>
) {
  const dateObj = new Date(date)

  // Delete existing records for this hostel+date
  await prisma.hostelAttendanceRecord.deleteMany({
    where: { organizationId: schoolId, hostelId, date: dateObj },
  })

  if (records.length === 0) return { count: 0 }

  const result = await prisma.hostelAttendanceRecord.createMany({
    data: records.map((r) => ({
      organizationId: schoolId,
      hostelId,
      studentId: r.studentId,
      studentName: r.studentName,
      date: dateObj,
      status: r.status,
      remarks: r.remarks ?? null,
    })),
  })

  return { count: result.count }
}

// ==================== Hostel Fees ====================

export async function listHostelFees(
  schoolId: string,
  query: { hostelId?: string; studentId?: string; status?: string; month?: number; year?: number; page?: number; limit?: number }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.hostelId) where.hostelId = query.hostelId
  if (query.studentId) where.studentId = query.studentId
  if (query.status) where.status = query.status
  if (query.month) where.month = query.month
  if (query.year) where.year = query.year

  const [data, total] = await prisma.$transaction([
    prisma.hostelFee.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.hostelFee.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function createHostelFee(schoolId: string, input: Record<string, unknown>) {
  return prisma.hostelFee.create({
    data: {
      organizationId: schoolId,
      studentId: input.studentId as string,
      studentName: input.studentName as string,
      hostelId: input.hostelId as string,
      feeType: (input.feeType as string) ?? 'monthly',
      amount: Number(input.amount),
      month: input.month ? Number(input.month) : null,
      year: input.year ? Number(input.year) : null,
      dueDate: input.dueDate ? new Date(input.dueDate as string) : null,
    },
  })
}

export async function payHostelFee(schoolId: string, id: string, paymentRef?: string) {
  const fee = await prisma.hostelFee.findFirst({ where: { id, organizationId: schoolId } })
  if (!fee) throw AppError.notFound('Hostel fee not found')
  if (fee.status === 'paid') throw AppError.badRequest('Fee is already paid')

  return prisma.hostelFee.update({
    where: { id },
    data: { status: 'paid', paidDate: new Date(), paymentRef: paymentRef ?? null },
  })
}

export async function generateBulkHostelFees(
  schoolId: string,
  hostelId: string,
  month: number,
  year: number,
  amount: number,
  dueDate?: string
) {
  // Get all active allocations for this org (hostelId is not on HostelAllocation — it's tracked via hostelFee.hostelId)
  const allocations = await prisma.hostelAllocation.findMany({
    where: { organizationId: schoolId, status: 'active' },
    select: { studentId: true, studentName: true },
  })

  if (allocations.length === 0) return { count: 0 }

  const result = await prisma.hostelFee.createMany({
    data: allocations.map((a) => ({
      organizationId: schoolId,
      studentId: a.studentId,
      studentName: a.studentName,
      hostelId,
      feeType: 'monthly',
      amount,
      month,
      year,
      dueDate: dueDate ? new Date(dueDate) : null,
    })),
    skipDuplicates: true,
  })

  return { count: result.count }
}
