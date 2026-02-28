import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  Facility,
  CreateFacilityRequest,
  UpdateFacilityRequest,
  FacilityFilters,
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingFilters,
  RecurringBooking,
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceFilters,
  ResourceAvailability,
  MaintenanceRequest,
  CreateMaintenanceRequest,
  UpdateMaintenanceRequest,
  MaintenanceFilters,
  MaintenanceSchedule,
  CheckConflictRequest,
  CheckConflictResponse,
  ConflictResolution,
  UsageStats,
  UtilizationReport,
  UtilizationFilters,
  GenerateReportRequest,
  HeatmapData,
  CapacityAnalysis,
  ResourceUtilization,
  FacilitiesDashboardStats,
  BookingSlot,
} from '../types/facilities.types'

const API_BASE = '/api/facilities'

// ==================== FACILITIES CRUD ====================

export async function fetchFacilities(
  filters: FacilityFilters = {}
): Promise<PaginatedResponse<Facility>> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.building) params.set('building', filters.building)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.minCapacity) params.set('minCapacity', String(filters.minCapacity))
  if (filters.maxCapacity) params.set('maxCapacity', String(filters.maxCapacity))
  if (filters.hasProjector !== undefined) params.set('hasProjector', String(filters.hasProjector))
  if (filters.isAirConditioned !== undefined) params.set('isAirConditioned', String(filters.isAirConditioned))

  return apiGet<PaginatedResponse<Facility>>(`${API_BASE}?${params.toString()}`)
}

export async function fetchFacility(id: string): Promise<{ data: Facility }> {
  return apiGet<{ data: Facility }>(`${API_BASE}/${id}`)
}

export async function createFacility(data: CreateFacilityRequest): Promise<{ data: Facility }> {
  return apiPost<{ data: Facility }>(API_BASE, data)
}

export async function updateFacility(
  id: string,
  data: UpdateFacilityRequest
): Promise<{ data: Facility }> {
  return apiPut<{ data: Facility }>(`${API_BASE}/${id}`, data)
}

export async function deleteFacility(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/${id}`)
}

export async function updateFacilityStatus(
  id: string,
  status: Facility['status']
): Promise<{ data: Facility }> {
  return apiPatch<{ data: Facility }>(`${API_BASE}/${id}/status`, { status })
}

// ==================== FACILITY AVAILABILITY ====================

export async function fetchFacilityAvailability(
  facilityId: string,
  date: string
): Promise<{ data: { slots: BookingSlot[]; bookings: Booking[] } }> {
  return apiGet<{ data: { slots: BookingSlot[]; bookings: Booking[] } }>(
    `${API_BASE}/${facilityId}/availability?date=${date}`
  )
}

// ==================== BOOKINGS CRUD ====================

export async function fetchBookings(
  filters: BookingFilters = {}
): Promise<PaginatedResponse<Booking>> {
  const params = new URLSearchParams()

  if (filters.facilityId) params.set('facilityId', filters.facilityId)
  if (filters.facilityType) params.set('facilityType', filters.facilityType)
  if (filters.bookedById) params.set('bookedById', filters.bookedById)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.purpose && filters.purpose !== 'all') params.set('purpose', filters.purpose)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)

  return apiGet<PaginatedResponse<Booking>>(`${API_BASE}/bookings?${params.toString()}`)
}

export async function fetchBooking(id: string): Promise<{ data: Booking }> {
  return apiGet<{ data: Booking }>(`${API_BASE}/bookings/${id}`)
}

export async function createBooking(data: CreateBookingRequest): Promise<{ data: Booking }> {
  return apiPost<{ data: Booking }>(`${API_BASE}/bookings`, data)
}

export async function updateBooking(
  id: string,
  data: UpdateBookingRequest
): Promise<{ data: Booking }> {
  return apiPut<{ data: Booking }>(`${API_BASE}/bookings/${id}`, data)
}

export async function deleteBooking(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/bookings/${id}`)
}

export async function approveBooking(id: string): Promise<{ data: Booking }> {
  return apiPatch<{ data: Booking }>(`${API_BASE}/bookings/${id}/approve`)
}

export async function cancelBooking(
  id: string,
  reason: string
): Promise<{ data: Booking }> {
  return apiPatch<{ data: Booking }>(`${API_BASE}/bookings/${id}/cancel`, { reason })
}

export async function checkInBooking(id: string): Promise<{ data: Booking }> {
  return apiPatch<{ data: Booking }>(`${API_BASE}/bookings/${id}/check-in`)
}

export async function completeBooking(id: string): Promise<{ data: Booking }> {
  return apiPatch<{ data: Booking }>(`${API_BASE}/bookings/${id}/complete`)
}

// ==================== RECURRING BOOKINGS ====================

export async function fetchRecurringBookings(
  filters: { facilityId?: string; status?: string } = {}
): Promise<{ data: RecurringBooking[] }> {
  const params = new URLSearchParams()
  if (filters.facilityId) params.set('facilityId', filters.facilityId)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)

  return apiGet<{ data: RecurringBooking[] }>(
    `${API_BASE}/bookings/recurring?${params.toString()}`
  )
}

export async function fetchRecurringBooking(id: string): Promise<{ data: RecurringBooking }> {
  return apiGet<{ data: RecurringBooking }>(`${API_BASE}/bookings/recurring/${id}`)
}

export async function cancelRecurringBooking(
  id: string,
  cancelFutureOnly: boolean = false
): Promise<{ data: RecurringBooking }> {
  return apiPatch<{ data: RecurringBooking }>(
    `${API_BASE}/bookings/recurring/${id}/cancel`,
    { cancelFutureOnly }
  )
}

export async function pauseRecurringBooking(id: string): Promise<{ data: RecurringBooking }> {
  return apiPatch<{ data: RecurringBooking }>(`${API_BASE}/bookings/recurring/${id}/pause`)
}

export async function resumeRecurringBooking(id: string): Promise<{ data: RecurringBooking }> {
  return apiPatch<{ data: RecurringBooking }>(`${API_BASE}/bookings/recurring/${id}/resume`)
}

// ==================== RESOURCES CRUD ====================

export async function fetchResources(
  filters: ResourceFilters = {}
): Promise<PaginatedResponse<Resource>> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.location) params.set('location', filters.location)

  return apiGet<PaginatedResponse<Resource>>(`${API_BASE}/resources?${params.toString()}`)
}

export async function fetchResource(id: string): Promise<{ data: Resource }> {
  return apiGet<{ data: Resource }>(`${API_BASE}/resources/${id}`)
}

export async function createResource(data: CreateResourceRequest): Promise<{ data: Resource }> {
  return apiPost<{ data: Resource }>(`${API_BASE}/resources`, data)
}

export async function updateResource(
  id: string,
  data: UpdateResourceRequest
): Promise<{ data: Resource }> {
  return apiPut<{ data: Resource }>(`${API_BASE}/resources/${id}`, data)
}

export async function deleteResource(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/resources/${id}`)
}

export async function fetchResourceAvailability(
  resourceId: string,
  date: string
): Promise<{ data: ResourceAvailability }> {
  return apiGet<{ data: ResourceAvailability }>(
    `${API_BASE}/resources/${resourceId}/availability?date=${date}`
  )
}

// ==================== CONFLICT DETECTION ====================

export async function checkConflicts(
  data: CheckConflictRequest
): Promise<{ data: CheckConflictResponse }> {
  return apiPost<{ data: CheckConflictResponse }>(`${API_BASE}/conflicts/check`, data)
}

export async function resolveConflict(
  conflictId: string,
  action: string,
  details?: Record<string, unknown>
): Promise<{ data: ConflictResolution }> {
  return apiPost<{ data: ConflictResolution }>(`${API_BASE}/conflicts/${conflictId}/resolve`, {
    action,
    ...details,
  })
}

// ==================== MAINTENANCE REQUESTS ====================

export async function fetchMaintenanceRequests(
  filters: MaintenanceFilters = {}
): Promise<PaginatedResponse<MaintenanceRequest>> {
  const params = new URLSearchParams()

  if (filters.facilityId) params.set('facilityId', filters.facilityId)
  if (filters.resourceId) params.set('resourceId', filters.resourceId)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.priority && filters.priority !== 'all') params.set('priority', filters.priority)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.assignedToId) params.set('assignedToId', filters.assignedToId)

  return apiGet<PaginatedResponse<MaintenanceRequest>>(
    `${API_BASE}/maintenance?${params.toString()}`
  )
}

export async function fetchMaintenanceRequest(id: string): Promise<{ data: MaintenanceRequest }> {
  return apiGet<{ data: MaintenanceRequest }>(`${API_BASE}/maintenance/${id}`)
}

export async function createMaintenanceRequest(
  data: CreateMaintenanceRequest
): Promise<{ data: MaintenanceRequest }> {
  return apiPost<{ data: MaintenanceRequest }>(`${API_BASE}/maintenance`, data)
}

export async function updateMaintenanceRequest(
  id: string,
  data: UpdateMaintenanceRequest
): Promise<{ data: MaintenanceRequest }> {
  return apiPut<{ data: MaintenanceRequest }>(`${API_BASE}/maintenance/${id}`, data)
}

export async function deleteMaintenanceRequest(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/maintenance/${id}`)
}

export async function startMaintenance(id: string): Promise<{ data: MaintenanceRequest }> {
  return apiPatch<{ data: MaintenanceRequest }>(`${API_BASE}/maintenance/${id}/start`)
}

export async function completeMaintenance(
  id: string,
  data: { completionNotes?: string; actualCost?: number }
): Promise<{ data: MaintenanceRequest }> {
  return apiPatch<{ data: MaintenanceRequest }>(`${API_BASE}/maintenance/${id}/complete`, data)
}

export async function holdMaintenance(
  id: string,
  reason: string
): Promise<{ data: MaintenanceRequest }> {
  return apiPatch<{ data: MaintenanceRequest }>(`${API_BASE}/maintenance/${id}/hold`, { reason })
}

export async function cancelMaintenance(
  id: string,
  reason: string
): Promise<{ data: MaintenanceRequest }> {
  return apiPatch<{ data: MaintenanceRequest }>(`${API_BASE}/maintenance/${id}/cancel`, { reason })
}

// ==================== MAINTENANCE SCHEDULES ====================

export async function fetchMaintenanceSchedules(
  filters: { facilityId?: string; resourceId?: string; isActive?: boolean } = {}
): Promise<{ data: MaintenanceSchedule[] }> {
  const params = new URLSearchParams()
  if (filters.facilityId) params.set('facilityId', filters.facilityId)
  if (filters.resourceId) params.set('resourceId', filters.resourceId)
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive))

  return apiGet<{ data: MaintenanceSchedule[] }>(
    `${API_BASE}/maintenance/schedules?${params.toString()}`
  )
}

export async function fetchMaintenanceSchedule(id: string): Promise<{ data: MaintenanceSchedule }> {
  return apiGet<{ data: MaintenanceSchedule }>(`${API_BASE}/maintenance/schedules/${id}`)
}

export async function createMaintenanceSchedule(
  data: Omit<MaintenanceSchedule, 'id' | 'lastPerformedDate' | 'createdAt' | 'updatedAt'>
): Promise<{ data: MaintenanceSchedule }> {
  return apiPost<{ data: MaintenanceSchedule }>(`${API_BASE}/maintenance/schedules`, data)
}

export async function updateMaintenanceSchedule(
  id: string,
  data: Partial<MaintenanceSchedule>
): Promise<{ data: MaintenanceSchedule }> {
  return apiPut<{ data: MaintenanceSchedule }>(`${API_BASE}/maintenance/schedules/${id}`, data)
}

export async function deleteMaintenanceSchedule(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/maintenance/schedules/${id}`)
}

export async function toggleMaintenanceSchedule(id: string): Promise<{ data: MaintenanceSchedule }> {
  return apiPatch<{ data: MaintenanceSchedule }>(`${API_BASE}/maintenance/schedules/${id}/toggle`)
}

// ==================== UTILIZATION & ANALYTICS ====================

export async function fetchUsageStats(
  filters: UtilizationFilters
): Promise<{ data: UsageStats[] }> {
  const params = new URLSearchParams()

  params.set('period', filters.period)
  params.set('periodStart', filters.periodStart)
  params.set('periodEnd', filters.periodEnd)
  if (filters.facilityIds?.length) params.set('facilityIds', filters.facilityIds.join(','))
  if (filters.facilityTypes?.length) params.set('facilityTypes', filters.facilityTypes.join(','))
  if (filters.building) params.set('building', filters.building)
  if (filters.includeResources) params.set('includeResources', 'true')

  return apiGet<{ data: UsageStats[] }>(`${API_BASE}/analytics/usage?${params.toString()}`)
}

export async function fetchUtilizationReports(
  filters: { period?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<UtilizationReport>> {
  const params = new URLSearchParams()
  if (filters.period && filters.period !== 'all') params.set('period', filters.period)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<UtilizationReport>>(
    `${API_BASE}/analytics/reports?${params.toString()}`
  )
}

export async function fetchUtilizationReport(id: string): Promise<{ data: UtilizationReport }> {
  return apiGet<{ data: UtilizationReport }>(`${API_BASE}/analytics/reports/${id}`)
}

export async function generateUtilizationReport(
  data: GenerateReportRequest
): Promise<{ data: UtilizationReport }> {
  return apiPost<{ data: UtilizationReport }>(`${API_BASE}/analytics/reports`, data)
}

export async function deleteUtilizationReport(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/analytics/reports/${id}`)
}

export async function fetchHeatmapData(
  facilityId: string,
  periodStart: string,
  periodEnd: string
): Promise<{ data: HeatmapData }> {
  const params = new URLSearchParams()
  params.set('periodStart', periodStart)
  params.set('periodEnd', periodEnd)

  return apiGet<{ data: HeatmapData }>(
    `${API_BASE}/analytics/heatmap/${facilityId}?${params.toString()}`
  )
}

export async function fetchCapacityAnalysis(
  filters: UtilizationFilters
): Promise<{ data: CapacityAnalysis[] }> {
  const params = new URLSearchParams()

  params.set('period', filters.period)
  params.set('periodStart', filters.periodStart)
  params.set('periodEnd', filters.periodEnd)
  if (filters.facilityIds?.length) params.set('facilityIds', filters.facilityIds.join(','))
  if (filters.building) params.set('building', filters.building)

  return apiGet<{ data: CapacityAnalysis[] }>(
    `${API_BASE}/analytics/capacity?${params.toString()}`
  )
}

export async function fetchResourceUtilization(
  filters: UtilizationFilters & { resourceIds?: string[] }
): Promise<{ data: ResourceUtilization[] }> {
  const params = new URLSearchParams()

  params.set('period', filters.period)
  params.set('periodStart', filters.periodStart)
  params.set('periodEnd', filters.periodEnd)
  if (filters.resourceIds?.length) params.set('resourceIds', filters.resourceIds.join(','))

  return apiGet<{ data: ResourceUtilization[] }>(
    `${API_BASE}/analytics/resources?${params.toString()}`
  )
}

// ==================== DASHBOARD ====================

export async function fetchFacilitiesDashboard(): Promise<{ data: FacilitiesDashboardStats }> {
  return apiGet<{ data: FacilitiesDashboardStats }>(`${API_BASE}/dashboard`)
}

// ==================== BUILDINGS ====================

export async function fetchBuildings(): Promise<{ data: string[] }> {
  return apiGet<{ data: string[] }>(`${API_BASE}/buildings`)
}
