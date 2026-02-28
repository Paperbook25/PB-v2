import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  transportRoutes,
  vehicles,
  drivers,
  studentAssignments,
  generateGPSPositions,
  maintenanceRecords,
  transportNotifications,
} from '../data/transport.data'
import type { TransportRoute, Vehicle, Driver, MaintenanceRecord, NotificationEventType } from '@/features/transport/types/transport.types'

export const transportHandlers = [
  // ==================== ROUTES ====================

  // Get all routes
  http.get('/api/transport/routes', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')

    let filtered = [...transportRoutes]

    if (status) {
      filtered = filtered.filter((r) => r.status === status)
    }
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(s) || r.code.toLowerCase().includes(s)
      )
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single route
  http.get('/api/transport/routes/:id', async ({ params }) => {
    await mockDelay('read')
    const route = transportRoutes.find((r) => r.id === params.id)
    if (!route) {
      return HttpResponse.json({ error: 'Route not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: route })
  }),

  // Create route
  http.post('/api/transport/routes', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Record<string, unknown>
    const now = new Date().toISOString()
    const stops = (body.stops as Array<Record<string, unknown>>).map((stop, i) => ({
      ...stop,
      id: `s-new-${Date.now()}-${i}`,
      studentCount: 0,
    }))

    const newRoute: TransportRoute = {
      id: `r-${Date.now()}`,
      name: body.name as string,
      code: body.code as string,
      description: body.description as string || '',
      stops: stops as TransportRoute['stops'],
      totalStudents: 0,
      totalDistance: stops.reduce((sum, s) => sum + ((s as Record<string, unknown>).distanceFromSchool as number || 0), 0),
      assignedVehicleId: null,
      assignedDriverId: null,
      status: 'active',
      monthlyFee: body.monthlyFee as number || 0,
      createdAt: now,
      updatedAt: now,
    }

    transportRoutes.push(newRoute)
    return HttpResponse.json({ data: newRoute }, { status: 201 })
  }),

  // Update route
  http.put('/api/transport/routes/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = transportRoutes.findIndex((r) => r.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Route not found' }, { status: 404 })
    }
    const body = await request.json() as Partial<TransportRoute>
    transportRoutes[index] = {
      ...transportRoutes[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({ data: transportRoutes[index] })
  }),

  // Delete route
  http.delete('/api/transport/routes/:id', async ({ params }) => {
    await mockDelay('read')
    const index = transportRoutes.findIndex((r) => r.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Route not found' }, { status: 404 })
    }
    transportRoutes.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== VEHICLES ====================

  // Get all vehicles
  http.get('/api/transport/vehicles', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const type = url.searchParams.get('type')

    let filtered = [...vehicles]
    if (status) filtered = filtered.filter((v) => v.status === status)
    if (type) filtered = filtered.filter((v) => v.type === type)

    return HttpResponse.json({ data: filtered })
  }),

  // Get single vehicle
  http.get('/api/transport/vehicles/:id', async ({ params }) => {
    await mockDelay('read')
    const vehicle = vehicles.find((v) => v.id === params.id)
    if (!vehicle) {
      return HttpResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: vehicle })
  }),

  // Create vehicle
  http.post('/api/transport/vehicles', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Record<string, unknown>
    const newVehicle: Vehicle = {
      id: `v-${Date.now()}`,
      registrationNumber: body.registrationNumber as string,
      type: body.type as Vehicle['type'],
      make: body.make as string,
      model: body.model as string,
      year: body.year as number,
      capacity: body.capacity as number,
      fuelType: body.fuelType as Vehicle['fuelType'],
      chassisNumber: body.chassisNumber as string || '',
      engineNumber: body.engineNumber as string || '',
      insuranceExpiry: body.insuranceExpiry as string,
      fitnessExpiry: body.fitnessExpiry as string,
      permitExpiry: body.permitExpiry as string || '',
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextServiceDue: '',
      odometerReading: 0,
      assignedRouteId: null,
      status: 'idle',
      gpsDeviceId: null,
      features: [],
      createdAt: new Date().toISOString(),
    }
    vehicles.push(newVehicle)
    return HttpResponse.json({ data: newVehicle }, { status: 201 })
  }),

  // Update vehicle
  http.put('/api/transport/vehicles/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = vehicles.findIndex((v) => v.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }
    const body = await request.json() as Partial<Vehicle>
    vehicles[index] = { ...vehicles[index], ...body }
    return HttpResponse.json({ data: vehicles[index] })
  }),

  // Delete vehicle
  http.delete('/api/transport/vehicles/:id', async ({ params }) => {
    await mockDelay('read')
    const index = vehicles.findIndex((v) => v.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }
    vehicles.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== DRIVERS ====================

  // Get all drivers
  http.get('/api/transport/drivers', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')

    let filtered = [...drivers]
    if (status) filtered = filtered.filter((d) => d.status === status)
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(s) || d.phone.includes(s)
      )
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single driver
  http.get('/api/transport/drivers/:id', async ({ params }) => {
    await mockDelay('read')
    const driver = drivers.find((d) => d.id === params.id)
    if (!driver) {
      return HttpResponse.json({ error: 'Driver not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: driver })
  }),

  // Create driver
  http.post('/api/transport/drivers', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Record<string, unknown>
    const newDriver: Driver = {
      id: `d-${Date.now()}`,
      name: body.name as string,
      phone: body.phone as string,
      email: body.email as string || '',
      licenseNumber: body.licenseNumber as string,
      licenseExpiry: body.licenseExpiry as string,
      licenseType: body.licenseType as string || 'Heavy Vehicle',
      experience: body.experience as number || 0,
      address: body.address as string || '',
      emergencyContact: body.emergencyContact as string || '',
      bloodGroup: body.bloodGroup as string || '',
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${(body.name as string).replace(/\s/g, '')}`,
      assignedRouteId: null,
      assignedVehicleId: null,
      status: 'active',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: body.salary as number || 0,
      createdAt: new Date().toISOString(),
    }
    drivers.push(newDriver)
    return HttpResponse.json({ data: newDriver }, { status: 201 })
  }),

  // Update driver
  http.put('/api/transport/drivers/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = drivers.findIndex((d) => d.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Driver not found' }, { status: 404 })
    }
    const body = await request.json() as Partial<Driver>
    drivers[index] = { ...drivers[index], ...body }
    return HttpResponse.json({ data: drivers[index] })
  }),

  // Delete driver
  http.delete('/api/transport/drivers/:id', async ({ params }) => {
    await mockDelay('read')
    const index = drivers.findIndex((d) => d.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Driver not found' }, { status: 404 })
    }
    drivers.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== STUDENT ASSIGNMENTS ====================

  // Get assignments by route
  http.get('/api/transport/assignments', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const routeId = url.searchParams.get('routeId')
    const stopId = url.searchParams.get('stopId')
    const search = url.searchParams.get('search')

    let filtered = [...studentAssignments]
    if (routeId) filtered = filtered.filter((a) => a.routeId === routeId)
    if (stopId) filtered = filtered.filter((a) => a.stopId === stopId)
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter((a) =>
        a.studentName.toLowerCase().includes(s) || a.class.toLowerCase().includes(s)
      )
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Assign student to stop
  http.post('/api/transport/assignments', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Record<string, unknown>
    const route = transportRoutes.find((r) => r.id === body.routeId)
    const stop = route?.stops.find((s) => s.id === body.stopId)

    const newAssignment = {
      id: `sa-${Date.now()}`,
      studentId: body.studentId as string,
      studentName: body.studentName as string || 'New Student',
      class: body.class as string || '',
      section: body.section as string || '',
      routeId: body.routeId as string,
      stopId: body.stopId as string,
      stopName: stop?.name || '',
      parentPhone: body.parentPhone as string || '',
      monthlyFee: route?.monthlyFee || 0,
      assignedDate: new Date().toISOString().split('T')[0],
      isActive: true,
    }

    studentAssignments.push(newAssignment)

    // Update stop student count
    if (stop) stop.studentCount++
    if (route) route.totalStudents++

    return HttpResponse.json({ data: newAssignment }, { status: 201 })
  }),

  // Remove student assignment
  http.delete('/api/transport/assignments/:id', async ({ params }) => {
    await mockDelay('read')
    const index = studentAssignments.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const assignment = studentAssignments[index]
    const route = transportRoutes.find((r) => r.id === assignment.routeId)
    const stop = route?.stops.find((s) => s.id === assignment.stopId)
    if (stop) stop.studentCount--
    if (route) route.totalStudents--

    studentAssignments.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== GPS TRACKING ====================

  http.get('/api/transport/tracking', async () => {
    await mockDelay('read')
    const positions = generateGPSPositions()
    return HttpResponse.json({ data: positions })
  }),

  // ==================== MAINTENANCE ====================

  // Get all maintenance records
  http.get('/api/transport/maintenance', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const vehicleId = url.searchParams.get('vehicleId')
    const status = url.searchParams.get('status')
    const type = url.searchParams.get('type')

    let filtered = [...maintenanceRecords]
    if (vehicleId) filtered = filtered.filter((m) => m.vehicleId === vehicleId)
    if (status) filtered = filtered.filter((m) => m.status === status)
    if (type) filtered = filtered.filter((m) => m.type === type)

    filtered.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  // Create maintenance record
  http.post('/api/transport/maintenance', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Record<string, unknown>
    const vehicle = vehicles.find((v) => v.id === body.vehicleId)

    const newRecord: MaintenanceRecord = {
      id: `mt-${Date.now()}`,
      vehicleId: body.vehicleId as string,
      vehicleNumber: vehicle?.registrationNumber || '',
      type: body.type as MaintenanceRecord['type'],
      description: body.description as string,
      scheduledDate: body.scheduledDate as string,
      completedDate: null,
      cost: body.cost as number || 0,
      vendor: body.vendor as string || '',
      notes: body.notes as string || '',
      status: 'scheduled',
      documents: [],
      createdAt: new Date().toISOString(),
    }

    maintenanceRecords.push(newRecord)
    return HttpResponse.json({ data: newRecord }, { status: 201 })
  }),

  // Update maintenance record (mark complete, etc.)
  http.patch('/api/transport/maintenance/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = maintenanceRecords.findIndex((m) => m.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Record not found' }, { status: 404 })
    }
    const body = await request.json() as Partial<MaintenanceRecord>
    maintenanceRecords[index] = { ...maintenanceRecords[index], ...body }
    return HttpResponse.json({ data: maintenanceRecords[index] })
  }),

  // Delete maintenance record
  http.delete('/api/transport/maintenance/:id', async ({ params }) => {
    await mockDelay('write')
    const index = maintenanceRecords.findIndex((m) => m.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Record not found' }, { status: 404 })
    }
    maintenanceRecords.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== NOTIFICATIONS ====================

  // Get transport notifications
  http.get('/api/transport/notifications', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const routeId = url.searchParams.get('routeId')
    const eventType = url.searchParams.get('eventType')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filtered = [...transportNotifications]
    if (routeId) filtered = filtered.filter((n) => n.routeId === routeId)
    if (eventType) filtered = filtered.filter((n) => n.eventType === eventType)

    filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  }),

  // Send manual notification
  http.post('/api/transport/notifications/send', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Record<string, unknown>

    const notification = {
      id: `tn-${Date.now()}`,
      studentId: body.studentId as string || '',
      studentName: body.studentName as string || '',
      parentPhone: body.parentPhone as string || '',
      routeId: body.routeId as string || '',
      routeName: body.routeName as string || '',
      stopName: body.stopName as string || '',
      eventType: body.eventType as NotificationEventType,
      message: body.message as string,
      sentAt: new Date().toISOString(),
      channel: body.channel as string || 'sms',
      status: 'sent' as const,
    }

    transportNotifications.unshift(notification as typeof transportNotifications[0])
    return HttpResponse.json({ data: notification }, { status: 201 })
  }),

  // ==================== STATS ====================

  http.get('/api/transport/stats', async () => {
    await mockDelay('read')
    const stats = {
      totalRoutes: transportRoutes.length,
      activeRoutes: transportRoutes.filter((r) => r.status === 'active').length,
      totalVehicles: vehicles.length,
      runningVehicles: vehicles.filter((v) => v.status === 'running').length,
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter((d) => d.status === 'active').length,
      totalStudentsUsing: transportRoutes.reduce((sum, r) => sum + r.totalStudents, 0),
      upcomingMaintenance: maintenanceRecords.filter((m) => m.status === 'scheduled' || m.status === 'overdue').length,
    }
    return HttpResponse.json({ data: stats })
  }),
]
