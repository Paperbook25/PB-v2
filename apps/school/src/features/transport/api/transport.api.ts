import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type {
  TransportRoute,
  CreateRouteRequest,
  Vehicle,
  CreateVehicleRequest,
  Driver,
  CreateDriverRequest,
  StopStudentAssignment,
  AssignStudentRequest,
  GPSPosition,
  MaintenanceRecord,
  CreateMaintenanceRequest,
  TransportNotification,
  TransportStats,
  // Route Optimization
  RouteOptimization,
  CreateRouteOptimizationRequest,
  ApplyOptimizationRequest,
  // Fuel Tracking
  FuelLog,
  FuelConsumption,
  FuelEfficiency,
  CreateFuelLogRequest,
  // Driver Behavior
  DriverBehavior,
  DrivingEvent,
  BehaviorScore,
  AcknowledgeEventRequest,
  // Parent Notifications
  ParentNotification,
  ETAUpdate,
  ETASubscription,
  SendParentNotificationRequest,
  // Emergency SOS
  EmergencySOS,
  SOSResponse,
  TriggerSOSRequest,
  UpdateSOSRequest,
  SOSResponseRequest,
  // Multi-Trip
  Trip,
  TripSchedule,
  MultiTrip,
  CreateTripRequest,
  UpdateTripRequest,
  CreateTripScheduleRequest,
  TripBoardingRecord,
} from '../types/transport.types'

const BASE = '/api/transport'

// ==================== ROUTES ====================

export async function fetchRoutes(params?: { status?: string; search?: string }) {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.search) qs.set('search', params.search)
  return apiGet<{ data: TransportRoute[] }>(`${BASE}/routes?${qs}`)
}

export async function fetchRoute(id: string) {
  return apiGet<{ data: TransportRoute }>(`${BASE}/routes/${id}`)
}

export async function createRoute(data: CreateRouteRequest) {
  return apiPost<{ data: TransportRoute }>(`${BASE}/routes`, data)
}

export async function updateRoute(id: string, data: Partial<TransportRoute>) {
  return apiPut<{ data: TransportRoute }>(`${BASE}/routes/${id}`, data)
}

export async function deleteRoute(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/routes/${id}`)
}

// ==================== VEHICLES ====================

export async function fetchVehicles(params?: { status?: string; type?: string }) {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.type) qs.set('type', params.type)
  return apiGet<{ data: Vehicle[] }>(`${BASE}/vehicles?${qs}`)
}

export async function fetchVehicle(id: string) {
  return apiGet<{ data: Vehicle }>(`${BASE}/vehicles/${id}`)
}

export async function createVehicle(data: CreateVehicleRequest) {
  return apiPost<{ data: Vehicle }>(`${BASE}/vehicles`, data)
}

export async function updateVehicle(id: string, data: Partial<Vehicle>) {
  return apiPut<{ data: Vehicle }>(`${BASE}/vehicles/${id}`, data)
}

export async function deleteVehicle(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/vehicles/${id}`)
}

// ==================== DRIVERS ====================

export async function fetchDrivers(params?: { status?: string; search?: string }) {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.search) qs.set('search', params.search)
  return apiGet<{ data: Driver[] }>(`${BASE}/drivers?${qs}`)
}

export async function fetchDriver(id: string) {
  return apiGet<{ data: Driver }>(`${BASE}/drivers/${id}`)
}

export async function createDriver(data: CreateDriverRequest) {
  return apiPost<{ data: Driver }>(`${BASE}/drivers`, data)
}

export async function updateDriver(id: string, data: Partial<Driver>) {
  return apiPut<{ data: Driver }>(`${BASE}/drivers/${id}`, data)
}

export async function deleteDriver(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/drivers/${id}`)
}

// ==================== STUDENT ASSIGNMENTS ====================

export async function fetchAssignments(params?: { routeId?: string; stopId?: string; search?: string }) {
  const qs = new URLSearchParams()
  if (params?.routeId) qs.set('routeId', params.routeId)
  if (params?.stopId) qs.set('stopId', params.stopId)
  if (params?.search) qs.set('search', params.search)
  return apiGet<{ data: StopStudentAssignment[] }>(`${BASE}/assignments?${qs}`)
}

export async function assignStudent(data: AssignStudentRequest & Record<string, unknown>) {
  return apiPost<{ data: StopStudentAssignment }>(`${BASE}/assignments`, data)
}

export async function removeAssignment(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/assignments/${id}`)
}

// ==================== GPS TRACKING ====================

export async function fetchGPSPositions() {
  return apiGet<{ data: GPSPosition[] }>(`${BASE}/tracking`)
}

// ==================== MAINTENANCE ====================

export async function fetchMaintenanceRecords(params?: { vehicleId?: string; status?: string; type?: string }) {
  const qs = new URLSearchParams()
  if (params?.vehicleId) qs.set('vehicleId', params.vehicleId)
  if (params?.status) qs.set('status', params.status)
  if (params?.type) qs.set('type', params.type)
  return apiGet<{ data: MaintenanceRecord[] }>(`${BASE}/maintenance?${qs}`)
}

export async function createMaintenanceRecord(data: CreateMaintenanceRequest) {
  return apiPost<{ data: MaintenanceRecord }>(`${BASE}/maintenance`, data)
}

export async function updateMaintenanceRecord(id: string, data: Partial<MaintenanceRecord>) {
  return apiPatch<{ data: MaintenanceRecord }>(`${BASE}/maintenance/${id}`, data)
}

export async function deleteMaintenanceRecord(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/maintenance/${id}`)
}

// ==================== NOTIFICATIONS ====================

export async function fetchTransportNotifications(params?: { routeId?: string; eventType?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.routeId) qs.set('routeId', params.routeId)
  if (params?.eventType) qs.set('eventType', params.eventType)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet<{ data: TransportNotification[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`${BASE}/notifications?${qs}`)
}

export async function sendTransportNotification(data: Record<string, unknown>) {
  return apiPost<{ data: TransportNotification }>(`${BASE}/notifications/send`, data)
}

// ==================== STATS ====================

export async function fetchTransportStats() {
  return apiGet<{ data: TransportStats }>(`${BASE}/stats`)
}

// ==================== ROUTE OPTIMIZATION ====================

export async function fetchRouteOptimizations(params?: { routeId?: string; status?: string }) {
  const qs = new URLSearchParams()
  if (params?.routeId) qs.set('routeId', params.routeId)
  if (params?.status) qs.set('status', params.status)
  return apiGet<{ data: RouteOptimization[] }>(`${BASE}/optimizations?${qs}`)
}

export async function fetchRouteOptimization(id: string) {
  return apiGet<{ data: RouteOptimization }>(`${BASE}/optimizations/${id}`)
}

export async function createRouteOptimization(data: CreateRouteOptimizationRequest) {
  return apiPost<{ data: RouteOptimization }>(`${BASE}/optimizations`, data)
}

export async function applyRouteOptimization(data: ApplyOptimizationRequest) {
  return apiPost<{ data: TransportRoute }>(`${BASE}/optimizations/${data.optimizationId}/apply`, data)
}

export async function deleteRouteOptimization(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/optimizations/${id}`)
}

// ==================== FUEL TRACKING ====================

export async function fetchFuelLogs(params?: { vehicleId?: string; driverId?: string; startDate?: string; endDate?: string }) {
  const qs = new URLSearchParams()
  if (params?.vehicleId) qs.set('vehicleId', params.vehicleId)
  if (params?.driverId) qs.set('driverId', params.driverId)
  if (params?.startDate) qs.set('startDate', params.startDate)
  if (params?.endDate) qs.set('endDate', params.endDate)
  return apiGet<{ data: FuelLog[] }>(`${BASE}/fuel/logs?${qs}`)
}

export async function fetchFuelLog(id: string) {
  return apiGet<{ data: FuelLog }>(`${BASE}/fuel/logs/${id}`)
}

export async function createFuelLog(data: CreateFuelLogRequest) {
  return apiPost<{ data: FuelLog }>(`${BASE}/fuel/logs`, data)
}

export async function updateFuelLog(id: string, data: Partial<FuelLog>) {
  return apiPatch<{ data: FuelLog }>(`${BASE}/fuel/logs/${id}`, data)
}

export async function deleteFuelLog(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/fuel/logs/${id}`)
}

export async function fetchFuelConsumption(params?: { vehicleId?: string; period?: string }) {
  const qs = new URLSearchParams()
  if (params?.vehicleId) qs.set('vehicleId', params.vehicleId)
  if (params?.period) qs.set('period', params.period)
  return apiGet<{ data: FuelConsumption[] }>(`${BASE}/fuel/consumption?${qs}`)
}

export async function fetchFuelEfficiency(params?: { vehicleId?: string }) {
  const qs = new URLSearchParams()
  if (params?.vehicleId) qs.set('vehicleId', params.vehicleId)
  return apiGet<{ data: FuelEfficiency[] }>(`${BASE}/fuel/efficiency?${qs}`)
}

// ==================== DRIVER BEHAVIOR MONITORING ====================

export async function fetchDriverBehaviors(params?: { driverId?: string; search?: string }) {
  const qs = new URLSearchParams()
  if (params?.driverId) qs.set('driverId', params.driverId)
  if (params?.search) qs.set('search', params.search)
  return apiGet<{ data: DriverBehavior[] }>(`${BASE}/behavior?${qs}`)
}

export async function fetchDriverBehavior(driverId: string) {
  return apiGet<{ data: DriverBehavior }>(`${BASE}/behavior/${driverId}`)
}

export async function fetchDrivingEvents(params?: { driverId?: string; vehicleId?: string; eventType?: string; severity?: string; startDate?: string; endDate?: string }) {
  const qs = new URLSearchParams()
  if (params?.driverId) qs.set('driverId', params.driverId)
  if (params?.vehicleId) qs.set('vehicleId', params.vehicleId)
  if (params?.eventType) qs.set('eventType', params.eventType)
  if (params?.severity) qs.set('severity', params.severity)
  if (params?.startDate) qs.set('startDate', params.startDate)
  if (params?.endDate) qs.set('endDate', params.endDate)
  return apiGet<{ data: DrivingEvent[] }>(`${BASE}/behavior/events?${qs}`)
}

export async function acknowledgeDrivingEvent(data: AcknowledgeEventRequest) {
  return apiPost<{ data: DrivingEvent }>(`${BASE}/behavior/events/${data.eventId}/acknowledge`, data)
}

export async function fetchBehaviorScores(params?: { sortBy?: 'score' | 'name'; order?: 'asc' | 'desc' }) {
  const qs = new URLSearchParams()
  if (params?.sortBy) qs.set('sortBy', params.sortBy)
  if (params?.order) qs.set('order', params.order)
  return apiGet<{ data: BehaviorScore[] }>(`${BASE}/behavior/scores?${qs}`)
}

// ==================== PARENT REAL-TIME NOTIFICATIONS ====================

export async function fetchParentNotifications(params?: { parentId?: string; studentId?: string; notificationType?: string; status?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.parentId) qs.set('parentId', params.parentId)
  if (params?.studentId) qs.set('studentId', params.studentId)
  if (params?.notificationType) qs.set('notificationType', params.notificationType)
  if (params?.status) qs.set('status', params.status)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet<{ data: ParentNotification[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`${BASE}/parent-notifications?${qs}`)
}

export async function sendParentNotification(data: SendParentNotificationRequest) {
  return apiPost<{ data: ParentNotification[] }>(`${BASE}/parent-notifications/send`, data)
}

export async function fetchETAUpdates(params?: { routeId?: string; studentId?: string }) {
  const qs = new URLSearchParams()
  if (params?.routeId) qs.set('routeId', params.routeId)
  if (params?.studentId) qs.set('studentId', params.studentId)
  return apiGet<{ data: ETAUpdate[] }>(`${BASE}/eta?${qs}`)
}

export async function fetchETASubscriptions(params?: { parentId?: string; studentId?: string }) {
  const qs = new URLSearchParams()
  if (params?.parentId) qs.set('parentId', params.parentId)
  if (params?.studentId) qs.set('studentId', params.studentId)
  return apiGet<{ data: ETASubscription[] }>(`${BASE}/eta/subscriptions?${qs}`)
}

export async function updateETASubscription(id: string, data: Partial<ETASubscription>) {
  return apiPatch<{ data: ETASubscription }>(`${BASE}/eta/subscriptions/${id}`, data)
}

// ==================== EMERGENCY SOS INTEGRATION ====================

export async function fetchSOSAlerts(params?: { status?: string; priority?: string; vehicleId?: string }) {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.priority) qs.set('priority', params.priority)
  if (params?.vehicleId) qs.set('vehicleId', params.vehicleId)
  return apiGet<{ data: EmergencySOS[] }>(`${BASE}/sos?${qs}`)
}

export async function fetchSOSAlert(id: string) {
  return apiGet<{ data: EmergencySOS }>(`${BASE}/sos/${id}`)
}

export async function triggerSOS(data: TriggerSOSRequest) {
  return apiPost<{ data: EmergencySOS }>(`${BASE}/sos/trigger`, data)
}

export async function updateSOS(data: UpdateSOSRequest) {
  return apiPatch<{ data: EmergencySOS }>(`${BASE}/sos/${data.sosId}`, data)
}

export async function respondToSOS(data: SOSResponseRequest) {
  return apiPost<{ data: SOSResponse }>(`${BASE}/sos/${data.sosId}/respond`, data)
}

export async function fetchSOSHistory(params?: { vehicleId?: string; driverId?: string; startDate?: string; endDate?: string }) {
  const qs = new URLSearchParams()
  if (params?.vehicleId) qs.set('vehicleId', params.vehicleId)
  if (params?.driverId) qs.set('driverId', params.driverId)
  if (params?.startDate) qs.set('startDate', params.startDate)
  if (params?.endDate) qs.set('endDate', params.endDate)
  return apiGet<{ data: EmergencySOS[] }>(`${BASE}/sos/history?${qs}`)
}

// ==================== MULTI-TRIP MANAGEMENT ====================

export async function fetchTrips(params?: { routeId?: string; vehicleId?: string; driverId?: string; date?: string; status?: string; tripPeriod?: string }) {
  const qs = new URLSearchParams()
  if (params?.routeId) qs.set('routeId', params.routeId)
  if (params?.vehicleId) qs.set('vehicleId', params.vehicleId)
  if (params?.driverId) qs.set('driverId', params.driverId)
  if (params?.date) qs.set('date', params.date)
  if (params?.status) qs.set('status', params.status)
  if (params?.tripPeriod) qs.set('tripPeriod', params.tripPeriod)
  return apiGet<{ data: Trip[] }>(`${BASE}/trips?${qs}`)
}

export async function fetchTrip(id: string) {
  return apiGet<{ data: Trip }>(`${BASE}/trips/${id}`)
}

export async function createTrip(data: CreateTripRequest) {
  return apiPost<{ data: Trip }>(`${BASE}/trips`, data)
}

export async function updateTrip(data: UpdateTripRequest) {
  return apiPatch<{ data: Trip }>(`${BASE}/trips/${data.tripId}`, data)
}

export async function deleteTrip(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/trips/${id}`)
}

export async function startTrip(tripId: string, data: { startOdometer: number }) {
  return apiPost<{ data: Trip }>(`${BASE}/trips/${tripId}/start`, data)
}

export async function endTrip(tripId: string, data: { endOdometer: number; notes?: string }) {
  return apiPost<{ data: Trip }>(`${BASE}/trips/${tripId}/end`, data)
}

export async function fetchTripSchedules(params?: { routeId?: string; dayOfWeek?: number }) {
  const qs = new URLSearchParams()
  if (params?.routeId) qs.set('routeId', params.routeId)
  if (params?.dayOfWeek !== undefined) qs.set('dayOfWeek', String(params.dayOfWeek))
  return apiGet<{ data: TripSchedule[] }>(`${BASE}/trips/schedules?${qs}`)
}

export async function fetchTripSchedule(id: string) {
  return apiGet<{ data: TripSchedule }>(`${BASE}/trips/schedules/${id}`)
}

export async function createTripSchedule(data: CreateTripScheduleRequest) {
  return apiPost<{ data: TripSchedule }>(`${BASE}/trips/schedules`, data)
}

export async function updateTripSchedule(id: string, data: Partial<TripSchedule>) {
  return apiPatch<{ data: TripSchedule }>(`${BASE}/trips/schedules/${id}`, data)
}

export async function deleteTripSchedule(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/trips/schedules/${id}`)
}

export async function fetchMultiTrips(params?: { routeId?: string; date?: string; status?: string }) {
  const qs = new URLSearchParams()
  if (params?.routeId) qs.set('routeId', params.routeId)
  if (params?.date) qs.set('date', params.date)
  if (params?.status) qs.set('status', params.status)
  return apiGet<{ data: MultiTrip[] }>(`${BASE}/trips/multi?${qs}`)
}

export async function fetchMultiTrip(id: string) {
  return apiGet<{ data: MultiTrip }>(`${BASE}/trips/multi/${id}`)
}

export async function fetchTripBoardingRecords(tripId: string) {
  return apiGet<{ data: TripBoardingRecord[] }>(`${BASE}/trips/${tripId}/boarding`)
}

export async function recordBoarding(tripId: string, data: { studentId: string; stopId: string; action: 'boarded' | 'dropped'; verifiedBy?: 'rfid' | 'manual' | 'facial_recognition' }) {
  return apiPost<{ data: TripBoardingRecord }>(`${BASE}/trips/${tripId}/boarding`, data)
}
