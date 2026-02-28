import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  BUILDINGS,
  type Facility,
  type FacilityType,
  type FacilityStatus,
  type CreateFacilityRequest,
  type UpdateFacilityRequest,
  type Booking,
  type BookingStatus,
  type BookingPurpose,
  type CreateBookingRequest,
  type UpdateBookingRequest,
  type RecurringBooking,
  type Resource,
  type ResourceCategory,
  type ResourceStatus,
  type CreateResourceRequest,
  type UpdateResourceRequest,
  type MaintenanceRequest,
  type MaintenanceType,
  type MaintenancePriority,
  type MaintenanceStatus,
  type CreateMaintenanceRequest,
  type UpdateMaintenanceRequest,
  type MaintenanceSchedule,
  type CheckConflictRequest,
  type BookingConflict,
  type AlternativeSlot,
  type UsageStats,
  type UtilizationReport,
  type HeatmapData,
  type CapacityAnalysis,
  type ResourceUtilization,
  type FacilitiesDashboardStats,
} from '@/features/facilities/types/facilities.types'

// Helper to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

// ==================== MOCK DATA ====================

const facilities: Facility[] = [
  {
    id: 'fac-001',
    name: 'Main Conference Room',
    code: 'MCR-101',
    type: 'conference_room',
    building: 'Administration Block',
    floor: 1,
    roomNumber: '101',
    capacity: 50,
    area: 800,
    status: 'available',
    description: 'Large conference room with modern AV equipment',
    amenities: [
      { name: 'Projector', quantity: 1, condition: 'good' },
      { name: 'Whiteboard', quantity: 2, condition: 'good' },
      { name: 'Conference Table', quantity: 1, condition: 'good' },
    ],
    isAirConditioned: true,
    hasProjector: true,
    hasWhiteboard: true,
    hasAudioSystem: true,
    hasVideoConferencing: true,
    accessibleForDisabled: true,
    operatingHours: { start: '08:00', end: '18:00' },
    bookingRules: {
      maxBookingDuration: 4,
      minAdvanceBooking: 2,
      maxAdvanceBooking: 30,
      requiresApproval: true,
      allowRecurring: true,
      allowedRoles: ['admin', 'principal', 'teacher'],
    },
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'fac-002',
    name: 'Physics Laboratory',
    code: 'PHY-LAB-01',
    type: 'laboratory',
    building: 'Science Block',
    floor: 2,
    roomNumber: '201',
    capacity: 40,
    area: 1200,
    status: 'available',
    description: 'Fully equipped physics laboratory for experiments',
    amenities: [
      { name: 'Lab Tables', quantity: 20, condition: 'good' },
      { name: 'Microscopes', quantity: 20, condition: 'good' },
      { name: 'Safety Equipment', quantity: 1, condition: 'good' },
    ],
    isAirConditioned: true,
    hasProjector: true,
    hasWhiteboard: true,
    hasAudioSystem: false,
    hasVideoConferencing: false,
    accessibleForDisabled: true,
    operatingHours: { start: '08:00', end: '17:00' },
    bookingRules: {
      maxBookingDuration: 3,
      minAdvanceBooking: 24,
      maxAdvanceBooking: 14,
      requiresApproval: true,
      allowRecurring: true,
      allowedRoles: ['admin', 'teacher'],
    },
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
  },
  {
    id: 'fac-003',
    name: 'Computer Lab A',
    code: 'COMP-LAB-A',
    type: 'computer_lab',
    building: 'Main Building',
    floor: 3,
    roomNumber: '301',
    capacity: 30,
    area: 900,
    status: 'occupied',
    description: 'Computer lab with 30 workstations',
    amenities: [
      { name: 'Desktop Computers', quantity: 30, condition: 'good' },
      { name: 'Projector', quantity: 1, condition: 'good' },
    ],
    isAirConditioned: true,
    hasProjector: true,
    hasWhiteboard: true,
    hasAudioSystem: false,
    hasVideoConferencing: false,
    accessibleForDisabled: true,
    operatingHours: { start: '08:00', end: '18:00' },
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-05T09:00:00Z',
  },
  {
    id: 'fac-004',
    name: 'Main Auditorium',
    code: 'AUD-001',
    type: 'auditorium',
    building: 'Main Building',
    floor: 0,
    roomNumber: 'G-01',
    capacity: 500,
    area: 5000,
    status: 'available',
    description: 'Large auditorium for events and assemblies',
    amenities: [
      { name: 'Stage', quantity: 1, condition: 'good' },
      { name: 'Sound System', quantity: 1, condition: 'good' },
      { name: 'Lighting System', quantity: 1, condition: 'good' },
    ],
    isAirConditioned: true,
    hasProjector: true,
    hasWhiteboard: false,
    hasAudioSystem: true,
    hasVideoConferencing: true,
    accessibleForDisabled: true,
    operatingHours: { start: '07:00', end: '21:00' },
    bookingRules: {
      maxBookingDuration: 8,
      minAdvanceBooking: 48,
      maxAdvanceBooking: 60,
      requiresApproval: true,
      allowRecurring: false,
      allowedRoles: ['admin', 'principal'],
    },
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
  },
  {
    id: 'fac-005',
    name: 'Sports Hall',
    code: 'SPT-001',
    type: 'sports_hall',
    building: 'Sports Complex',
    floor: 0,
    roomNumber: 'G-01',
    capacity: 200,
    area: 3000,
    status: 'maintenance',
    description: 'Indoor sports hall for basketball, badminton, etc.',
    amenities: [
      { name: 'Basketball Court', quantity: 1, condition: 'fair' },
      { name: 'Badminton Courts', quantity: 4, condition: 'good' },
    ],
    isAirConditioned: false,
    hasProjector: false,
    hasWhiteboard: false,
    hasAudioSystem: true,
    hasVideoConferencing: false,
    accessibleForDisabled: true,
    operatingHours: { start: '06:00', end: '20:00' },
    createdAt: '2024-01-02T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z',
  },
]

const bookings: Booking[] = [
  {
    id: 'bkg-001',
    facilityId: 'fac-001',
    facilityName: 'Main Conference Room',
    facilityCode: 'MCR-101',
    facilityType: 'conference_room',
    bookedBy: {
      id: 'usr-001',
      name: 'Dr. Sarah Johnson',
      role: 'Principal',
      department: 'Administration',
    },
    purpose: 'meeting',
    title: 'Staff Meeting - Q1 Review',
    description: 'Quarterly review meeting with all department heads',
    slot: {
      date: '2024-02-20',
      startTime: '10:00',
      endTime: '12:00',
    },
    attendeesCount: 25,
    status: 'confirmed',
    requiresResources: true,
    resources: [
      { resourceId: 'res-001', resourceName: 'Laptop', quantity: 1 },
      { resourceId: 'res-002', resourceName: 'Laser Pointer', quantity: 1 },
    ],
    approvedBy: {
      id: 'usr-admin',
      name: 'Admin',
      approvedAt: '2024-02-15T10:00:00Z',
    },
    isRecurringInstance: false,
    createdAt: '2024-02-14T09:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
  {
    id: 'bkg-002',
    facilityId: 'fac-002',
    facilityName: 'Physics Laboratory',
    facilityCode: 'PHY-LAB-01',
    facilityType: 'laboratory',
    bookedBy: {
      id: 'usr-002',
      name: 'Mr. Robert Chen',
      role: 'Teacher',
      department: 'Science',
    },
    purpose: 'class',
    title: 'Physics Practical - Class 10A',
    slot: {
      date: '2024-02-20',
      startTime: '09:00',
      endTime: '10:30',
    },
    attendeesCount: 35,
    status: 'pending',
    requiresResources: false,
    isRecurringInstance: true,
    parentBookingId: 'rbkg-001',
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-02-10T09:00:00Z',
  },
  {
    id: 'bkg-003',
    facilityId: 'fac-003',
    facilityName: 'Computer Lab A',
    facilityCode: 'COMP-LAB-A',
    facilityType: 'computer_lab',
    bookedBy: {
      id: 'usr-003',
      name: 'Ms. Emily Davis',
      role: 'Teacher',
      department: 'IT',
    },
    purpose: 'exam',
    title: 'Computer Science Practical Exam',
    slot: {
      date: '2024-02-21',
      startTime: '10:00',
      endTime: '13:00',
    },
    attendeesCount: 30,
    status: 'confirmed',
    requiresResources: false,
    isRecurringInstance: false,
    createdAt: '2024-02-12T09:00:00Z',
    updatedAt: '2024-02-13T09:00:00Z',
  },
]

const recurringBookings: RecurringBooking[] = [
  {
    id: 'rbkg-001',
    facilityId: 'fac-002',
    facilityName: 'Physics Laboratory',
    bookedBy: {
      id: 'usr-002',
      name: 'Mr. Robert Chen',
      role: 'Teacher',
    },
    purpose: 'class',
    title: 'Physics Practical - Class 10A',
    startTime: '09:00',
    endTime: '10:30',
    recurrence: {
      pattern: 'weekly',
      interval: 1,
      daysOfWeek: [1, 3], // Monday, Wednesday
      endDate: '2024-06-30',
    },
    attendeesCount: 35,
    status: 'active',
    instances: ['bkg-002'],
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z',
  },
]

const resources: Resource[] = [
  {
    id: 'res-001',
    name: 'Laptop',
    code: 'LPT-001',
    category: 'electronics',
    description: 'Dell Latitude laptop for presentations',
    totalQuantity: 10,
    availableQuantity: 7,
    inUseQuantity: 2,
    maintenanceQuantity: 1,
    status: 'available',
    location: 'IT Store Room',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
  },
  {
    id: 'res-002',
    name: 'Laser Pointer',
    code: 'LSR-001',
    category: 'teaching_aids',
    description: 'Wireless laser pointer with presenter controls',
    totalQuantity: 15,
    availableQuantity: 12,
    inUseQuantity: 3,
    maintenanceQuantity: 0,
    status: 'available',
    location: 'Staff Room',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
  },
  {
    id: 'res-003',
    name: 'Portable Projector',
    code: 'PRJ-001',
    category: 'audio_visual',
    description: 'Portable projector for classrooms',
    totalQuantity: 5,
    availableQuantity: 3,
    inUseQuantity: 2,
    maintenanceQuantity: 0,
    status: 'available',
    location: 'AV Room',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
  },
]

const maintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'mnt-001',
    facilityId: 'fac-005',
    facilityName: 'Sports Hall',
    type: 'repair',
    priority: 'high',
    status: 'in_progress',
    title: 'Basketball Court Floor Repair',
    description: 'Damaged flooring near the basketball hoop area needs repair',
    reportedBy: {
      id: 'usr-004',
      name: 'Coach Williams',
      role: 'Staff',
    },
    assignedTo: {
      id: 'usr-005',
      name: 'Maintenance Team',
      role: 'Staff',
    },
    scheduledDate: '2024-02-18',
    scheduledStartTime: '08:00',
    scheduledEndTime: '17:00',
    actualStartTime: '2024-02-18T08:30:00Z',
    estimatedCost: 15000,
    workOrderNumber: 'WO-2024-001',
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-02-18T08:30:00Z',
  },
  {
    id: 'mnt-002',
    facilityId: 'fac-001',
    facilityName: 'Main Conference Room',
    type: 'preventive',
    priority: 'medium',
    status: 'scheduled',
    title: 'AC Servicing',
    description: 'Regular AC maintenance and filter cleaning',
    reportedBy: {
      id: 'usr-admin',
      name: 'Admin',
      role: 'Admin',
    },
    scheduledDate: '2024-02-25',
    scheduledStartTime: '14:00',
    scheduledEndTime: '16:00',
    estimatedCost: 3000,
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-02-15T09:00:00Z',
  },
]

const maintenanceSchedules: MaintenanceSchedule[] = [
  {
    id: 'msched-001',
    facilityId: 'fac-001',
    facilityName: 'Main Conference Room',
    type: 'cleaning',
    frequency: 'daily',
    preferredTimeSlot: { start: '07:00', end: '08:00' },
    duration: 1,
    description: 'Daily cleaning before office hours',
    nextScheduledDate: '2024-02-21',
    isActive: true,
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
  },
  {
    id: 'msched-002',
    facilityId: 'fac-004',
    facilityName: 'Main Auditorium',
    type: 'inspection',
    frequency: 'monthly',
    dayOfMonth: 1,
    preferredTimeSlot: { start: '09:00', end: '12:00' },
    duration: 3,
    description: 'Monthly inspection of sound and lighting systems',
    lastPerformedDate: '2024-02-01',
    nextScheduledDate: '2024-03-01',
    isActive: true,
    assignedTo: { id: 'usr-005', name: 'Maintenance Team' },
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z',
  },
]

// ==================== HANDLERS ====================

export const facilitiesHandlers = [
  // ==================== FACILITIES ====================

  // Get all facilities
  http.get('/api/facilities', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const type = url.searchParams.get('type')
    const building = url.searchParams.get('building')
    const status = url.searchParams.get('status')
    const minCapacity = url.searchParams.get('minCapacity')
    const maxCapacity = url.searchParams.get('maxCapacity')
    const hasProjector = url.searchParams.get('hasProjector')
    const isAirConditioned = url.searchParams.get('isAirConditioned')

    let filtered = [...facilities]

    if (search) {
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(search) ||
          f.code.toLowerCase().includes(search) ||
          f.building.toLowerCase().includes(search)
      )
    }

    if (type && type !== 'all') {
      filtered = filtered.filter((f) => f.type === type)
    }

    if (building) {
      filtered = filtered.filter((f) => f.building === building)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((f) => f.status === status)
    }

    if (minCapacity) {
      filtered = filtered.filter((f) => f.capacity >= parseInt(minCapacity))
    }

    if (maxCapacity) {
      filtered = filtered.filter((f) => f.capacity <= parseInt(maxCapacity))
    }

    if (hasProjector === 'true') {
      filtered = filtered.filter((f) => f.hasProjector)
    }

    if (isAirConditioned === 'true') {
      filtered = filtered.filter((f) => f.isAirConditioned)
    }

    return HttpResponse.json({
      data: filtered,
      meta: {
        total: filtered.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    })
  }),

  // Get single facility
  http.get('/api/facilities/:id', async ({ params }) => {
    await mockDelay('read')
    const facility = facilities.find((f) => f.id === params.id)

    if (!facility) {
      return HttpResponse.json({ error: 'Facility not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: facility })
  }),

  // Create facility
  http.post('/api/facilities', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateFacilityRequest

    const newFacility: Facility = {
      id: generateId(),
      ...body,
      status: 'available',
      amenities: body.amenities || [],
      isAirConditioned: body.isAirConditioned ?? false,
      hasProjector: body.hasProjector ?? false,
      hasWhiteboard: body.hasWhiteboard ?? false,
      hasAudioSystem: body.hasAudioSystem ?? false,
      hasVideoConferencing: body.hasVideoConferencing ?? false,
      accessibleForDisabled: body.accessibleForDisabled ?? false,
      operatingHours: body.operatingHours || { start: '08:00', end: '18:00' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    facilities.unshift(newFacility)
    return HttpResponse.json({ data: newFacility }, { status: 201 })
  }),

  // Update facility
  http.put('/api/facilities/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = facilities.findIndex((f) => f.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Facility not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateFacilityRequest
    facilities[idx] = {
      ...facilities[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: facilities[idx] })
  }),

  // Delete facility
  http.delete('/api/facilities/:id', async ({ params }) => {
    await mockDelay('write')
    const idx = facilities.findIndex((f) => f.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Facility not found' }, { status: 404 })
    }

    // Check for active bookings
    const hasActiveBookings = bookings.some(
      (b) => b.facilityId === params.id && ['pending', 'confirmed', 'checked_in'].includes(b.status)
    )

    if (hasActiveBookings) {
      return HttpResponse.json(
        { error: 'Cannot delete facility with active bookings' },
        { status: 400 }
      )
    }

    facilities.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // Update facility status
  http.patch('/api/facilities/:id/status', async ({ params, request }) => {
    await mockDelay('read')
    const idx = facilities.findIndex((f) => f.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Facility not found' }, { status: 404 })
    }

    const body = (await request.json()) as { status: FacilityStatus }
    facilities[idx] = {
      ...facilities[idx],
      status: body.status,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: facilities[idx] })
  }),

  // Get facility availability
  http.get('/api/facilities/:id/availability', async ({ params, request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]

    const facilityBookings = bookings.filter(
      (b) => b.facilityId === params.id && b.slot.date === date && b.status !== 'cancelled'
    )

    // Generate time slots
    const slots = []
    for (let hour = 8; hour < 18; hour++) {
      for (const minute of ['00', '30']) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute}`
        const endHour = minute === '30' ? hour + 1 : hour
        const endMinute = minute === '30' ? '00' : '30'
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute}`

        slots.push({
          date,
          startTime,
          endTime,
        })
      }
    }

    return HttpResponse.json({
      data: {
        slots,
        bookings: facilityBookings,
      },
    })
  }),

  // Get buildings
  http.get('/api/facilities/buildings', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: [...BUILDINGS] })
  }),

  // ==================== BOOKINGS ====================

  // Get all bookings
  http.get('/api/facilities/bookings', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const facilityId = url.searchParams.get('facilityId')
    const status = url.searchParams.get('status')
    const purpose = url.searchParams.get('purpose')
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')

    let filtered = [...bookings]

    if (facilityId) {
      filtered = filtered.filter((b) => b.facilityId === facilityId)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((b) => b.status === status)
    }

    if (purpose && purpose !== 'all') {
      filtered = filtered.filter((b) => b.purpose === purpose)
    }

    if (dateFrom) {
      filtered = filtered.filter((b) => b.slot.date >= dateFrom)
    }

    if (dateTo) {
      filtered = filtered.filter((b) => b.slot.date <= dateTo)
    }

    filtered.sort((a, b) => {
      const dateCompare = b.slot.date.localeCompare(a.slot.date)
      if (dateCompare !== 0) return dateCompare
      return b.slot.startTime.localeCompare(a.slot.startTime)
    })

    return HttpResponse.json({
      data: filtered,
      meta: {
        total: filtered.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    })
  }),

  // Get single booking
  http.get('/api/facilities/bookings/:id', async ({ params }) => {
    await mockDelay('read')
    const booking = bookings.find((b) => b.id === params.id)

    if (!booking) {
      return HttpResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: booking })
  }),

  // Create booking
  http.post('/api/facilities/bookings', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateBookingRequest

    const facility = facilities.find((f) => f.id === body.facilityId)
    if (!facility) {
      return HttpResponse.json({ error: 'Facility not found' }, { status: 404 })
    }

    // Check for conflicts
    const hasConflict = bookings.some(
      (b) =>
        b.facilityId === body.facilityId &&
        b.slot.date === body.slot.date &&
        b.status !== 'cancelled' &&
        !(body.slot.endTime <= b.slot.startTime || body.slot.startTime >= b.slot.endTime)
    )

    if (hasConflict) {
      return HttpResponse.json(
        { error: 'Time slot conflicts with an existing booking' },
        { status: 409 }
      )
    }

    const newBooking: Booking = {
      id: generateId(),
      facilityId: facility.id,
      facilityName: facility.name,
      facilityCode: facility.code,
      facilityType: facility.type,
      bookedBy: {
        id: 'usr-current',
        name: 'Current User',
        role: 'Teacher',
      },
      purpose: body.purpose,
      title: body.title,
      description: body.description,
      slot: body.slot,
      attendeesCount: body.attendeesCount,
      status: facility.bookingRules?.requiresApproval ? 'pending' : 'confirmed',
      requiresResources: !!body.resources?.length,
      resources: body.resources,
      notes: body.notes,
      isRecurringInstance: !!body.recurrence,
      recurrence: body.recurrence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    bookings.unshift(newBooking)
    return HttpResponse.json({ data: newBooking }, { status: 201 })
  }),

  // Update booking
  http.put('/api/facilities/bookings/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = bookings.findIndex((b) => b.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateBookingRequest
    bookings[idx] = {
      ...bookings[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: bookings[idx] })
  }),

  // Delete booking
  http.delete('/api/facilities/bookings/:id', async ({ params }) => {
    await mockDelay('write')
    const idx = bookings.findIndex((b) => b.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    bookings.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // Approve booking
  http.patch('/api/facilities/bookings/:id/approve', async ({ params }) => {
    await mockDelay('read')
    const idx = bookings.findIndex((b) => b.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (bookings[idx].status !== 'pending') {
      return HttpResponse.json({ error: 'Can only approve pending bookings' }, { status: 400 })
    }

    bookings[idx] = {
      ...bookings[idx],
      status: 'confirmed',
      approvedBy: {
        id: 'usr-admin',
        name: 'Admin',
        approvedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: bookings[idx] })
  }),

  // Cancel booking
  http.patch('/api/facilities/bookings/:id/cancel', async ({ params, request }) => {
    await mockDelay('read')
    const idx = bookings.findIndex((b) => b.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const body = (await request.json()) as { reason: string }

    bookings[idx] = {
      ...bookings[idx],
      status: 'cancelled',
      cancelledBy: {
        id: 'usr-current',
        name: 'Current User',
        cancelledAt: new Date().toISOString(),
        reason: body.reason,
      },
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: bookings[idx] })
  }),

  // Check-in booking
  http.patch('/api/facilities/bookings/:id/check-in', async ({ params }) => {
    await mockDelay('read')
    const idx = bookings.findIndex((b) => b.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (bookings[idx].status !== 'confirmed') {
      return HttpResponse.json({ error: 'Can only check-in confirmed bookings' }, { status: 400 })
    }

    bookings[idx] = {
      ...bookings[idx],
      status: 'checked_in',
      checkedInAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Update facility status
    const facilityIdx = facilities.findIndex((f) => f.id === bookings[idx].facilityId)
    if (facilityIdx !== -1) {
      facilities[facilityIdx].status = 'occupied'
    }

    return HttpResponse.json({ data: bookings[idx] })
  }),

  // Complete booking
  http.patch('/api/facilities/bookings/:id/complete', async ({ params }) => {
    await mockDelay('read')
    const idx = bookings.findIndex((b) => b.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    bookings[idx] = {
      ...bookings[idx],
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Update facility status
    const facilityIdx = facilities.findIndex((f) => f.id === bookings[idx].facilityId)
    if (facilityIdx !== -1) {
      facilities[facilityIdx].status = 'available'
    }

    return HttpResponse.json({ data: bookings[idx] })
  }),

  // Get recurring bookings
  http.get('/api/facilities/bookings/recurring', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const facilityId = url.searchParams.get('facilityId')
    const status = url.searchParams.get('status')

    let filtered = [...recurringBookings]

    if (facilityId) {
      filtered = filtered.filter((rb) => rb.facilityId === facilityId)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((rb) => rb.status === status)
    }

    return HttpResponse.json({ data: filtered })
  }),

  // ==================== RESOURCES ====================

  // Get all resources
  http.get('/api/facilities/resources', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')

    let filtered = [...resources]

    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(search) || r.code.toLowerCase().includes(search)
      )
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((r) => r.category === category)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.status === status)
    }

    return HttpResponse.json({
      data: filtered,
      meta: {
        total: filtered.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    })
  }),

  // Get single resource
  http.get('/api/facilities/resources/:id', async ({ params }) => {
    await mockDelay('read')
    const resource = resources.find((r) => r.id === params.id)

    if (!resource) {
      return HttpResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: resource })
  }),

  // Create resource
  http.post('/api/facilities/resources', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateResourceRequest

    const newResource: Resource = {
      id: generateId(),
      ...body,
      availableQuantity: body.totalQuantity,
      inUseQuantity: 0,
      maintenanceQuantity: 0,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    resources.unshift(newResource)
    return HttpResponse.json({ data: newResource }, { status: 201 })
  }),

  // Update resource
  http.put('/api/facilities/resources/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = resources.findIndex((r) => r.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateResourceRequest
    resources[idx] = {
      ...resources[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: resources[idx] })
  }),

  // Delete resource
  http.delete('/api/facilities/resources/:id', async ({ params }) => {
    await mockDelay('write')
    const idx = resources.findIndex((r) => r.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    resources.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== CONFLICTS ====================

  // Check conflicts
  http.post('/api/facilities/conflicts/check', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as CheckConflictRequest

    const conflicts: BookingConflict[] = []
    const alternatives: AlternativeSlot[] = []

    // Check for facility conflicts
    const facilityConflicts = bookings.filter(
      (b) =>
        b.facilityId === body.facilityId &&
        b.slot.date === body.slot.date &&
        b.status !== 'cancelled' &&
        b.id !== body.excludeBookingId &&
        !(body.slot.endTime <= b.slot.startTime || body.slot.startTime >= b.slot.endTime)
    )

    for (const conflict of facilityConflicts) {
      const facility = facilities.find((f) => f.id === body.facilityId)
      conflicts.push({
        id: generateId(),
        type: 'facility_overlap',
        severity: 'error',
        message: 'This time slot conflicts with an existing booking',
        details: `"${conflict.title}" is booked from ${conflict.slot.startTime} to ${conflict.slot.endTime}`,
        conflictingBookingId: conflict.id,
        conflictingBookingTitle: conflict.title,
        facilityId: body.facilityId,
        facilityName: facility?.name || 'Unknown',
        slot: body.slot,
        createdAt: new Date().toISOString(),
      })
    }

    // Generate alternatives if conflicts exist
    if (conflicts.length > 0) {
      const availableFacilities = facilities.filter(
        (f) =>
          f.id !== body.facilityId &&
          f.status === 'available' &&
          (body.attendeesCount ? f.capacity >= body.attendeesCount : true)
      )

      for (const alt of availableFacilities.slice(0, 3)) {
        alternatives.push({
          facilityId: alt.id,
          facilityName: alt.name,
          slot: body.slot,
          matchScore: Math.floor(Math.random() * 30) + 70,
        })
      }
    }

    return HttpResponse.json({
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts,
        alternatives,
      },
    })
  }),

  // ==================== MAINTENANCE ====================

  // Get maintenance requests
  http.get('/api/facilities/maintenance', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const facilityId = url.searchParams.get('facilityId')
    const status = url.searchParams.get('status')
    const priority = url.searchParams.get('priority')
    const type = url.searchParams.get('type')

    let filtered = [...maintenanceRequests]

    if (facilityId) {
      filtered = filtered.filter((m) => m.facilityId === facilityId)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((m) => m.status === status)
    }

    if (priority && priority !== 'all') {
      filtered = filtered.filter((m) => m.priority === priority)
    }

    if (type && type !== 'all') {
      filtered = filtered.filter((m) => m.type === type)
    }

    return HttpResponse.json({
      data: filtered,
      meta: {
        total: filtered.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    })
  }),

  // Get single maintenance request
  http.get('/api/facilities/maintenance/:id', async ({ params }) => {
    await mockDelay('read')
    const maintenance = maintenanceRequests.find((m) => m.id === params.id)

    if (!maintenance) {
      return HttpResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: maintenance })
  }),

  // Create maintenance request
  http.post('/api/facilities/maintenance', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateMaintenanceRequest

    const facility = body.facilityId ? facilities.find((f) => f.id === body.facilityId) : null
    const resource = body.resourceId ? resources.find((r) => r.id === body.resourceId) : null

    const newMaintenance: MaintenanceRequest = {
      id: generateId(),
      ...body,
      facilityName: facility?.name,
      resourceName: resource?.name,
      status: 'scheduled',
      reportedBy: {
        id: 'usr-current',
        name: 'Current User',
        role: 'Staff',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    maintenanceRequests.unshift(newMaintenance)
    return HttpResponse.json({ data: newMaintenance }, { status: 201 })
  }),

  // Update maintenance request
  http.put('/api/facilities/maintenance/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = maintenanceRequests.findIndex((m) => m.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateMaintenanceRequest
    maintenanceRequests[idx] = {
      ...maintenanceRequests[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: maintenanceRequests[idx] })
  }),

  // Delete maintenance request
  http.delete('/api/facilities/maintenance/:id', async ({ params }) => {
    await mockDelay('write')
    const idx = maintenanceRequests.findIndex((m) => m.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    maintenanceRequests.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // Start maintenance
  http.patch('/api/facilities/maintenance/:id/start', async ({ params }) => {
    await mockDelay('read')
    const idx = maintenanceRequests.findIndex((m) => m.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    maintenanceRequests[idx] = {
      ...maintenanceRequests[idx],
      status: 'in_progress',
      actualStartTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Update facility status to maintenance if applicable
    if (maintenanceRequests[idx].facilityId) {
      const facilityIdx = facilities.findIndex(
        (f) => f.id === maintenanceRequests[idx].facilityId
      )
      if (facilityIdx !== -1) {
        facilities[facilityIdx].status = 'maintenance'
      }
    }

    return HttpResponse.json({ data: maintenanceRequests[idx] })
  }),

  // Complete maintenance
  http.patch('/api/facilities/maintenance/:id/complete', async ({ params, request }) => {
    await mockDelay('read')
    const idx = maintenanceRequests.findIndex((m) => m.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    const body = (await request.json()) as { completionNotes?: string; actualCost?: number }

    maintenanceRequests[idx] = {
      ...maintenanceRequests[idx],
      status: 'completed',
      actualEndTime: new Date().toISOString(),
      completionNotes: body.completionNotes,
      actualCost: body.actualCost,
      updatedAt: new Date().toISOString(),
    }

    // Update facility status back to available
    if (maintenanceRequests[idx].facilityId) {
      const facilityIdx = facilities.findIndex(
        (f) => f.id === maintenanceRequests[idx].facilityId
      )
      if (facilityIdx !== -1) {
        facilities[facilityIdx].status = 'available'
      }
    }

    return HttpResponse.json({ data: maintenanceRequests[idx] })
  }),

  // Get maintenance schedules
  http.get('/api/facilities/maintenance/schedules', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const facilityId = url.searchParams.get('facilityId')
    const isActive = url.searchParams.get('isActive')

    let filtered = [...maintenanceSchedules]

    if (facilityId) {
      filtered = filtered.filter((s) => s.facilityId === facilityId)
    }

    if (isActive !== null) {
      filtered = filtered.filter((s) => s.isActive === (isActive === 'true'))
    }

    return HttpResponse.json({ data: filtered })
  }),

  // ==================== ANALYTICS ====================

  // Get usage stats
  http.get('/api/facilities/analytics/usage', async ({ request }) => {
    await mockDelay('read')

    const stats: UsageStats[] = facilities.map((f) => ({
      facilityId: f.id,
      facilityName: f.name,
      facilityType: f.type,
      period: 'monthly',
      periodStart: '2024-02-01',
      periodEnd: '2024-02-29',
      totalBookings: Math.floor(Math.random() * 50) + 10,
      confirmedBookings: Math.floor(Math.random() * 40) + 5,
      cancelledBookings: Math.floor(Math.random() * 10),
      noShowBookings: Math.floor(Math.random() * 5),
      totalHoursBooked: Math.floor(Math.random() * 100) + 20,
      totalAvailableHours: 200,
      utilizationPercentage: Math.floor(Math.random() * 40) + 40,
      peakHours: [
        { hour: 10, bookingCount: Math.floor(Math.random() * 20) + 5 },
        { hour: 14, bookingCount: Math.floor(Math.random() * 20) + 5 },
      ],
      popularPurposes: [
        { purpose: 'class' as BookingPurpose, count: 25, percentage: 50 },
        { purpose: 'meeting' as BookingPurpose, count: 15, percentage: 30 },
        { purpose: 'event' as BookingPurpose, count: 10, percentage: 20 },
      ],
      averageBookingDuration: 2,
      averageAttendees: 25,
      repeatBookerPercentage: 60,
    }))

    return HttpResponse.json({ data: stats })
  }),

  // Get dashboard stats
  http.get('/api/facilities/dashboard', async () => {
    await mockDelay('read')

    const stats: FacilitiesDashboardStats = {
      totalFacilities: facilities.length,
      availableFacilities: facilities.filter((f) => f.status === 'available').length,
      occupiedFacilities: facilities.filter((f) => f.status === 'occupied').length,
      underMaintenance: facilities.filter((f) => f.status === 'maintenance').length,
      totalResources: resources.length,
      availableResources: resources.filter((r) => r.status === 'available').length,
      todayBookings: bookings.filter(
        (b) => b.slot.date === new Date().toISOString().split('T')[0]
      ).length,
      pendingApprovals: bookings.filter((b) => b.status === 'pending').length,
      activeMaintenanceRequests: maintenanceRequests.filter(
        (m) => m.status === 'in_progress'
      ).length,
      weeklyUtilization: 68,
      monthlyTrend: [
        { month: 'Jan', bookings: 120, utilization: 65 },
        { month: 'Feb', bookings: 145, utilization: 72 },
      ],
      upcomingMaintenance: maintenanceRequests
        .filter((m) => m.status === 'scheduled')
        .slice(0, 5)
        .map((m) => ({
          id: m.id,
          facilityName: m.facilityName || 'Unknown',
          type: m.type,
          scheduledDate: m.scheduledDate || '',
        })),
      recentBookings: bookings.slice(0, 5).map((b) => ({
        id: b.id,
        facilityName: b.facilityName,
        title: b.title,
        bookedBy: b.bookedBy.name,
        slot: b.slot,
        status: b.status,
      })),
    }

    return HttpResponse.json({ data: stats })
  }),

  // Get utilization reports
  http.get('/api/facilities/analytics/reports', async () => {
    await mockDelay('read')

    const reports: UtilizationReport[] = [
      {
        id: 'rpt-001',
        title: 'February 2024 Utilization Report',
        period: 'monthly',
        periodStart: '2024-02-01',
        periodEnd: '2024-02-29',
        generatedAt: '2024-02-20T10:00:00Z',
        generatedBy: { id: 'usr-admin', name: 'Admin' },
        summary: {
          totalFacilities: facilities.length,
          totalBookings: 145,
          overallUtilization: 68,
          mostUtilizedFacility: {
            id: 'fac-003',
            name: 'Computer Lab A',
            utilization: 85,
          },
          leastUtilizedFacility: {
            id: 'fac-005',
            name: 'Sports Hall',
            utilization: 35,
          },
          maintenanceDowntime: 24,
        },
        facilityStats: [],
        trends: [
          { date: '2024-02-01', bookings: 5, utilization: 60 },
          { date: '2024-02-02', bookings: 8, utilization: 75 },
        ],
        recommendations: [
          'Consider increasing availability for Computer Lab A during peak hours',
          'Sports Hall has low utilization - consider promotional activities',
        ],
      },
    ]

    return HttpResponse.json({
      data: reports,
      meta: {
        total: reports.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    })
  }),

  // Generate utilization report
  http.post('/api/facilities/analytics/reports', async ({ request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as { title: string; period: string }

    const report: UtilizationReport = {
      id: generateId(),
      title: body.title,
      period: body.period as UtilizationReport['period'],
      periodStart: '2024-02-01',
      periodEnd: '2024-02-29',
      generatedAt: new Date().toISOString(),
      generatedBy: { id: 'usr-current', name: 'Current User' },
      summary: {
        totalFacilities: facilities.length,
        totalBookings: bookings.length,
        overallUtilization: 68,
        mostUtilizedFacility: {
          id: 'fac-003',
          name: 'Computer Lab A',
          utilization: 85,
        },
        leastUtilizedFacility: {
          id: 'fac-005',
          name: 'Sports Hall',
          utilization: 35,
        },
        maintenanceDowntime: 24,
      },
      facilityStats: [],
      trends: [],
    }

    return HttpResponse.json({ data: report }, { status: 201 })
  }),

  // Get heatmap data
  http.get('/api/facilities/analytics/heatmap/:facilityId', async ({ params }) => {
    await mockDelay('read')

    const heatmap: HeatmapData = {
      facilityId: params.facilityId as string,
      facilityName: facilities.find((f) => f.id === params.facilityId)?.name || 'Unknown',
      data: [],
    }

    // Generate sample heatmap data
    for (let day = 0; day < 7; day++) {
      for (let hour = 8; hour < 18; hour++) {
        heatmap.data.push({
          day,
          hour,
          value: Math.floor(Math.random() * 100),
        })
      }
    }

    return HttpResponse.json({ data: heatmap })
  }),
]
