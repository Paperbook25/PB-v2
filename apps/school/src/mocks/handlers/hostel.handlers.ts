import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  hostels,
  rooms,
  roomAllocations,
  hostelFees,
  messMenus,
  hostelAttendance,
  allocatedStudentIds,
} from '../data/hostel.data'
import { students } from '../data/students.data'
import type {
  Hostel,
  Room,
  RoomAllocation,
  HostelFee,
  MessMenu,
  HostelAttendance,
} from '@/features/hostel/types/hostel.types'

export const hostelHandlers = [
  // ==================== ELIGIBLE STUDENTS ====================

  // Get active students who are not currently allocated to a hostel room
  http.get('/api/hostel/eligible-students', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const gender = url.searchParams.get('gender') // For filtering boys/girls hostels

    // Get currently allocated student IDs (active allocations only)
    const currentlyAllocatedIds = new Set(
      roomAllocations.filter((a) => a.status === 'active').map((a) => a.studentId)
    )

    // Filter active students not in hostel
    let eligibleStudents = students
      .filter((s) => s.status === 'active' && !currentlyAllocatedIds.has(s.id))
      .map((s) => ({
        id: s.id,
        name: s.name,
        class: s.class,
        section: s.section,
        rollNumber: s.rollNumber,
        admissionNumber: s.admissionNumber,
        gender: s.gender,
        photoUrl: s.photoUrl,
      }))

    // Filter by gender if specified (for boys/girls hostels)
    if (gender) {
      eligibleStudents = eligibleStudents.filter((s) => s.gender === gender)
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      eligibleStudents = eligibleStudents.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.admissionNumber.toLowerCase().includes(searchLower) ||
          s.class.toLowerCase().includes(searchLower)
      )
    }

    return HttpResponse.json({ data: eligibleStudents })
  }),

  // ==================== HOSTELS ====================

  // Get all hostels
  http.get('/api/hostel/hostels', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')

    let filtered = [...hostels]
    if (type) filtered = filtered.filter((h) => h.type === type)
    if (status) filtered = filtered.filter((h) => h.status === status)

    return HttpResponse.json({ data: filtered })
  }),

  // Get single hostel
  http.get('/api/hostel/hostels/:id', async ({ params }) => {
    await mockDelay('read')
    const hostel = hostels.find((h) => h.id === params.id)
    if (!hostel) {
      return HttpResponse.json({ error: 'Hostel not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: hostel })
  }),

  // Create hostel
  http.post('/api/hostel/hostels', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    const now = new Date().toISOString()

    const newHostel: Hostel = {
      id: `h-${Date.now()}`,
      name: body.name as string,
      type: body.type as Hostel['type'],
      capacity: body.capacity as number || 0,
      occupancy: 0,
      wardenId: body.wardenId as string || '',
      wardenName: body.wardenName as string || '',
      floors: body.floors as number || 1,
      address: body.address as string || '',
      contactNumber: body.contactNumber as string || '',
      email: body.email as string || '',
      amenities: body.amenities as string[] || [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }

    hostels.push(newHostel)
    return HttpResponse.json({ data: newHostel }, { status: 201 })
  }),

  // Update hostel
  http.put('/api/hostel/hostels/:id', async ({ params, request }) => {
    await mockDelay('write')
    const index = hostels.findIndex((h) => h.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Hostel not found' }, { status: 404 })
    }
    const body = await request.json() as Partial<Hostel>
    hostels[index] = {
      ...hostels[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({ data: hostels[index] })
  }),

  // Delete hostel
  http.delete('/api/hostel/hostels/:id', async ({ params }) => {
    await mockDelay('write')
    const index = hostels.findIndex((h) => h.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Hostel not found' }, { status: 404 })
    }
    hostels.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== ROOMS ====================

  // Get all rooms
  http.get('/api/hostel/rooms', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const hostelId = url.searchParams.get('hostelId')
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const floor = url.searchParams.get('floor')

    let filtered = [...rooms]
    if (hostelId) filtered = filtered.filter((r) => r.hostelId === hostelId)
    if (type) filtered = filtered.filter((r) => r.type === type)
    if (status) filtered = filtered.filter((r) => r.status === status)
    if (floor) filtered = filtered.filter((r) => r.floor === parseInt(floor))

    return HttpResponse.json({ data: filtered })
  }),

  // Get single room
  http.get('/api/hostel/rooms/:id', async ({ params }) => {
    await mockDelay('read')
    const room = rooms.find((r) => r.id === params.id)
    if (!room) {
      return HttpResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: room })
  }),

  // Create room
  http.post('/api/hostel/rooms', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    const hostel = hostels.find((h) => h.id === body.hostelId)

    const newRoom: Room = {
      id: `r-${Date.now()}`,
      hostelId: body.hostelId as string,
      hostelName: hostel?.name || '',
      roomNumber: body.roomNumber as string,
      floor: body.floor as number,
      type: body.type as Room['type'],
      capacity: body.capacity as number,
      occupancy: 0,
      amenities: body.amenities as string[] || [],
      status: 'available',
      monthlyRent: body.monthlyRent as number || 0,
      createdAt: new Date().toISOString(),
    }

    rooms.push(newRoom)
    return HttpResponse.json({ data: newRoom }, { status: 201 })
  }),

  // Update room
  http.put('/api/hostel/rooms/:id', async ({ params, request }) => {
    await mockDelay('write')
    const index = rooms.findIndex((r) => r.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    const body = await request.json() as Partial<Room>
    rooms[index] = { ...rooms[index], ...body }
    return HttpResponse.json({ data: rooms[index] })
  }),

  // Delete room
  http.delete('/api/hostel/rooms/:id', async ({ params }) => {
    await mockDelay('write')
    const index = rooms.findIndex((r) => r.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    rooms.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== ALLOCATIONS ====================

  // Get all allocations
  http.get('/api/hostel/allocations', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const hostelId = url.searchParams.get('hostelId')
    const roomId = url.searchParams.get('roomId')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')

    let filtered = [...roomAllocations]
    if (hostelId) filtered = filtered.filter((a) => a.hostelId === hostelId)
    if (roomId) filtered = filtered.filter((a) => a.roomId === roomId)
    if (status) filtered = filtered.filter((a) => a.status === status)
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter((a) =>
        a.studentName.toLowerCase().includes(s) ||
        a.roomNumber.toLowerCase().includes(s)
      )
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Create allocation
  http.post('/api/hostel/allocations', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    const room = rooms.find((r) => r.id === body.roomId)
    const hostel = hostels.find((h) => h.id === room?.hostelId)

    const newAllocation: RoomAllocation = {
      id: `alloc-${Date.now()}`,
      roomId: body.roomId as string,
      roomNumber: room?.roomNumber || '',
      hostelId: room?.hostelId || '',
      hostelName: hostel?.name || '',
      studentId: body.studentId as string,
      studentName: body.studentName as string,
      class: body.class as string,
      section: body.section as string,
      bedNumber: body.bedNumber as number,
      startDate: body.startDate as string,
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    roomAllocations.push(newAllocation)

    // Update room occupancy
    if (room) {
      room.occupancy++
      if (room.occupancy >= room.capacity) {
        room.status = 'full'
      }
    }

    // Update hostel occupancy
    if (hostel) {
      hostel.occupancy++
    }

    return HttpResponse.json({ data: newAllocation }, { status: 201 })
  }),

  // Vacate allocation
  http.patch('/api/hostel/allocations/:id/vacate', async ({ params }) => {
    await mockDelay('write')
    const index = roomAllocations.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Allocation not found' }, { status: 404 })
    }

    const allocation = roomAllocations[index]
    allocation.status = 'vacated'
    allocation.endDate = new Date().toISOString().split('T')[0]

    // Update room occupancy
    const room = rooms.find((r) => r.id === allocation.roomId)
    if (room) {
      room.occupancy--
      room.status = 'available'
    }

    // Update hostel occupancy
    const hostel = hostels.find((h) => h.id === allocation.hostelId)
    if (hostel) {
      hostel.occupancy--
    }

    return HttpResponse.json({ data: allocation })
  }),

  // Transfer allocation
  http.patch('/api/hostel/allocations/:id/transfer', async ({ params, request }) => {
    await mockDelay('write')
    const index = roomAllocations.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Allocation not found' }, { status: 404 })
    }

    const body = await request.json() as { newRoomId: string; bedNumber: number }
    const oldAllocation = roomAllocations[index]
    const newRoom = rooms.find((r) => r.id === body.newRoomId)
    const newHostel = hostels.find((h) => h.id === newRoom?.hostelId)

    // Mark old allocation as transferred
    oldAllocation.status = 'transferred'
    oldAllocation.endDate = new Date().toISOString().split('T')[0]

    // Update old room occupancy
    const oldRoom = rooms.find((r) => r.id === oldAllocation.roomId)
    if (oldRoom) {
      oldRoom.occupancy--
      oldRoom.status = 'available'
    }

    // Create new allocation
    const newAllocation: RoomAllocation = {
      id: `alloc-${Date.now()}`,
      roomId: body.newRoomId,
      roomNumber: newRoom?.roomNumber || '',
      hostelId: newRoom?.hostelId || '',
      hostelName: newHostel?.name || '',
      studentId: oldAllocation.studentId,
      studentName: oldAllocation.studentName,
      class: oldAllocation.class,
      section: oldAllocation.section,
      bedNumber: body.bedNumber,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    roomAllocations.push(newAllocation)

    // Update new room occupancy
    if (newRoom) {
      newRoom.occupancy++
      if (newRoom.occupancy >= newRoom.capacity) {
        newRoom.status = 'full'
      }
    }

    return HttpResponse.json({ data: newAllocation })
  }),

  // ==================== FEES ====================

  // Get all fees
  http.get('/api/hostel/fees', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const feeType = url.searchParams.get('feeType')
    const status = url.searchParams.get('status')
    const month = url.searchParams.get('month')

    let filtered = [...hostelFees]
    if (studentId) filtered = filtered.filter((f) => f.studentId === studentId)
    if (feeType) filtered = filtered.filter((f) => f.feeType === feeType)
    if (status) filtered = filtered.filter((f) => f.status === status)
    if (month) filtered = filtered.filter((f) => f.month === month)

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  // Create fee
  http.post('/api/hostel/fees', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    const allocation = roomAllocations.find((a) => a.studentId === body.studentId && a.status === 'active')
    const room = rooms.find((r) => r.id === allocation?.roomId)

    const newFee: HostelFee = {
      id: `hfee-${Date.now()}`,
      studentId: body.studentId as string,
      studentName: allocation?.studentName || '',
      roomNumber: room?.roomNumber || '',
      hostelName: room?.hostelName || '',
      feeType: body.feeType as HostelFee['feeType'],
      amount: body.amount as number,
      month: body.month as string,
      dueDate: body.dueDate as string,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    hostelFees.push(newFee)
    return HttpResponse.json({ data: newFee }, { status: 201 })
  }),

  // Pay fee
  http.patch('/api/hostel/fees/:id/pay', async ({ params }) => {
    await mockDelay('write')
    const index = hostelFees.findIndex((f) => f.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Fee not found' }, { status: 404 })
    }

    hostelFees[index].status = 'paid'
    hostelFees[index].paidDate = new Date().toISOString().split('T')[0]
    hostelFees[index].transactionId = `TXN${Date.now()}`

    return HttpResponse.json({ data: hostelFees[index] })
  }),

  // Generate bulk fees for all active residents
  http.post('/api/hostel/fees/bulk-generate', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as { month: string; feeType: HostelFee['feeType']; dueDate: string; amount: number }

    const activeAllocations = roomAllocations.filter((a) => a.status === 'active')
    let created = 0

    for (const allocation of activeAllocations) {
      // Check if fee already exists for this student/month/feeType
      const exists = hostelFees.some(
        (f) => f.studentId === allocation.studentId && f.month === body.month && f.feeType === body.feeType
      )

      if (!exists) {
        const room = rooms.find((r) => r.id === allocation.roomId)
        const newFee: HostelFee = {
          id: `hfee-${Date.now()}-${created}`,
          studentId: allocation.studentId,
          studentName: allocation.studentName,
          roomNumber: room?.roomNumber || allocation.roomNumber,
          hostelName: allocation.hostelName,
          feeType: body.feeType,
          amount: body.amount,
          month: body.month,
          dueDate: body.dueDate,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
        hostelFees.push(newFee)
        created++
      }
    }

    return HttpResponse.json({ data: { created } }, { status: 201 })
  }),

  // ==================== MESS MENU ====================

  // Get mess menu
  http.get('/api/hostel/mess-menu', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const hostelId = url.searchParams.get('hostelId')
    const dayOfWeek = url.searchParams.get('dayOfWeek')
    const mealType = url.searchParams.get('mealType')

    let filtered = [...messMenus]
    if (hostelId) filtered = filtered.filter((m) => m.hostelId === hostelId)
    if (dayOfWeek) filtered = filtered.filter((m) => m.dayOfWeek === parseInt(dayOfWeek))
    if (mealType) filtered = filtered.filter((m) => m.mealType === mealType)

    return HttpResponse.json({ data: filtered })
  }),

  // Update mess menu
  http.put('/api/hostel/mess-menu', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    const hostel = hostels.find((h) => h.id === body.hostelId)

    const index = messMenus.findIndex(
      (m) => m.hostelId === body.hostelId && m.dayOfWeek === body.dayOfWeek && m.mealType === body.mealType
    )

    const menuItem: MessMenu = {
      id: index !== -1 ? messMenus[index].id : `menu-${Date.now()}`,
      hostelId: body.hostelId as string,
      hostelName: hostel?.name || '',
      dayOfWeek: body.dayOfWeek as number,
      mealType: body.mealType as MessMenu['mealType'],
      items: body.items as string[],
      specialDiet: body.specialDiet as string,
      updatedAt: new Date().toISOString(),
    }

    if (index !== -1) {
      messMenus[index] = menuItem
    } else {
      messMenus.push(menuItem)
    }

    return HttpResponse.json({ data: menuItem })
  }),

  // ==================== ATTENDANCE ====================

  // Get attendance
  http.get('/api/hostel/attendance', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const hostelId = url.searchParams.get('hostelId')
    const date = url.searchParams.get('date')
    const status = url.searchParams.get('status')

    let filtered = [...hostelAttendance]

    if (hostelId) {
      const hostel = hostels.find((h) => h.id === hostelId)
      if (hostel) {
        filtered = filtered.filter((a) => a.hostelName === hostel.name)
      }
    }
    if (date) filtered = filtered.filter((a) => a.date === date)
    if (status) filtered = filtered.filter((a) => a.status === status)

    return HttpResponse.json({ data: filtered })
  }),

  // Mark attendance
  http.post('/api/hostel/attendance', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    const allocation = roomAllocations.find((a) => a.studentId === body.studentId && a.status === 'active')

    const existingIndex = hostelAttendance.findIndex(
      (a) => a.studentId === body.studentId && a.date === body.date
    )

    const attendanceRecord: HostelAttendance = {
      id: existingIndex !== -1 ? hostelAttendance[existingIndex].id : `hatt-${Date.now()}`,
      studentId: body.studentId as string,
      studentName: allocation?.studentName || '',
      roomNumber: allocation?.roomNumber || '',
      hostelName: allocation?.hostelName || '',
      date: body.date as string,
      checkIn: body.checkIn as string,
      checkOut: body.checkOut as string,
      status: body.status as HostelAttendance['status'],
      remarks: body.remarks as string,
      markedBy: 'Warden',
      createdAt: new Date().toISOString(),
    }

    if (existingIndex !== -1) {
      hostelAttendance[existingIndex] = attendanceRecord
    } else {
      hostelAttendance.push(attendanceRecord)
    }

    return HttpResponse.json({ data: attendanceRecord })
  }),

  // Bulk mark attendance
  http.post('/api/hostel/attendance/bulk', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as { date: string; records: Array<{ studentId: string; status: string }> }

    for (const record of body.records) {
      const allocation = roomAllocations.find((a) => a.studentId === record.studentId && a.status === 'active')
      if (!allocation) continue

      const existingIndex = hostelAttendance.findIndex(
        (a) => a.studentId === record.studentId && a.date === body.date
      )

      const attendanceRecord: HostelAttendance = {
        id: existingIndex !== -1 ? hostelAttendance[existingIndex].id : `hatt-${Date.now()}-${record.studentId}`,
        studentId: record.studentId,
        studentName: allocation.studentName,
        roomNumber: allocation.roomNumber,
        hostelName: allocation.hostelName,
        date: body.date,
        status: record.status as HostelAttendance['status'],
        markedBy: 'Warden',
        createdAt: new Date().toISOString(),
      }

      if (existingIndex !== -1) {
        hostelAttendance[existingIndex] = attendanceRecord
      } else {
        hostelAttendance.push(attendanceRecord)
      }
    }

    return HttpResponse.json({ success: true })
  }),

  // ==================== STATS ====================

  http.get('/api/hostel/stats', async () => {
    await mockDelay('read')

    const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0)
    const occupiedBeds = rooms.reduce((sum, r) => sum + r.occupancy, 0)
    const today = new Date().toISOString().split('T')[0]
    const todayAttendance = hostelAttendance.filter((a) => a.date === today)

    const stats = {
      totalHostels: hostels.length,
      totalRooms: rooms.length,
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      totalStudents: roomAllocations.filter((a) => a.status === 'active').length,
      pendingFees: hostelFees.filter((f) => f.status === 'pending' || f.status === 'overdue').length,
      pendingFeesAmount: hostelFees
        .filter((f) => f.status === 'pending' || f.status === 'overdue')
        .reduce((sum, f) => sum + f.amount, 0),
      todayPresent: todayAttendance.filter((a) => a.status === 'present').length,
      todayAbsent: todayAttendance.filter((a) => a.status === 'absent').length,
    }

    return HttpResponse.json({ data: stats })
  }),
]
