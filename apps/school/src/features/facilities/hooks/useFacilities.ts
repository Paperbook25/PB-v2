import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchFacilities,
  fetchFacility,
  createFacility,
  updateFacility,
  deleteFacility,
  updateFacilityStatus,
  fetchFacilityAvailability,
  fetchBookings,
  fetchBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  approveBooking,
  cancelBooking,
  checkInBooking,
  completeBooking,
  fetchRecurringBookings,
  fetchRecurringBooking,
  cancelRecurringBooking,
  pauseRecurringBooking,
  resumeRecurringBooking,
  fetchResources,
  fetchResource,
  createResource,
  updateResource,
  deleteResource,
  fetchResourceAvailability,
  checkConflicts,
  resolveConflict,
  fetchMaintenanceRequests,
  fetchMaintenanceRequest,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  startMaintenance,
  completeMaintenance,
  holdMaintenance,
  cancelMaintenance,
  fetchMaintenanceSchedules,
  fetchMaintenanceSchedule,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  deleteMaintenanceSchedule,
  toggleMaintenanceSchedule,
  fetchUsageStats,
  fetchUtilizationReports,
  fetchUtilizationReport,
  generateUtilizationReport,
  deleteUtilizationReport,
  fetchHeatmapData,
  fetchCapacityAnalysis,
  fetchResourceUtilization,
  fetchFacilitiesDashboard,
  fetchBuildings,
} from '../api/facilities.api'
import type {
  FacilityFilters,
  CreateFacilityRequest,
  UpdateFacilityRequest,
  FacilityStatus,
  BookingFilters,
  CreateBookingRequest,
  UpdateBookingRequest,
  ResourceFilters,
  CreateResourceRequest,
  UpdateResourceRequest,
  MaintenanceFilters,
  CreateMaintenanceRequest,
  UpdateMaintenanceRequest,
  MaintenanceSchedule,
  CheckConflictRequest,
  UtilizationFilters,
  GenerateReportRequest,
} from '../types/facilities.types'

// ==================== QUERY KEYS ====================

export const facilitiesKeys = {
  all: ['facilities'] as const,
  // Facilities
  facilities: () => [...facilitiesKeys.all, 'list'] as const,
  facilityList: (filters: FacilityFilters) => [...facilitiesKeys.facilities(), filters] as const,
  facilityDetail: (id: string) => [...facilitiesKeys.all, 'detail', id] as const,
  facilityAvailability: (id: string, date: string) =>
    [...facilitiesKeys.all, 'availability', id, date] as const,
  // Bookings
  bookings: () => [...facilitiesKeys.all, 'bookings'] as const,
  bookingList: (filters: BookingFilters) => [...facilitiesKeys.bookings(), 'list', filters] as const,
  bookingDetail: (id: string) => [...facilitiesKeys.bookings(), 'detail', id] as const,
  recurringBookings: (filters?: { facilityId?: string; status?: string }) =>
    [...facilitiesKeys.bookings(), 'recurring', filters] as const,
  recurringBookingDetail: (id: string) =>
    [...facilitiesKeys.bookings(), 'recurring', 'detail', id] as const,
  // Resources
  resources: () => [...facilitiesKeys.all, 'resources'] as const,
  resourceList: (filters: ResourceFilters) => [...facilitiesKeys.resources(), 'list', filters] as const,
  resourceDetail: (id: string) => [...facilitiesKeys.resources(), 'detail', id] as const,
  resourceAvailability: (id: string, date: string) =>
    [...facilitiesKeys.resources(), 'availability', id, date] as const,
  // Maintenance
  maintenance: () => [...facilitiesKeys.all, 'maintenance'] as const,
  maintenanceList: (filters: MaintenanceFilters) =>
    [...facilitiesKeys.maintenance(), 'list', filters] as const,
  maintenanceDetail: (id: string) => [...facilitiesKeys.maintenance(), 'detail', id] as const,
  maintenanceSchedules: (filters?: { facilityId?: string; resourceId?: string; isActive?: boolean }) =>
    [...facilitiesKeys.maintenance(), 'schedules', filters] as const,
  maintenanceScheduleDetail: (id: string) =>
    [...facilitiesKeys.maintenance(), 'schedules', 'detail', id] as const,
  // Analytics
  analytics: () => [...facilitiesKeys.all, 'analytics'] as const,
  usageStats: (filters: UtilizationFilters) => [...facilitiesKeys.analytics(), 'usage', filters] as const,
  utilizationReports: (filters?: { period?: string; page?: number; limit?: number }) =>
    [...facilitiesKeys.analytics(), 'reports', filters] as const,
  utilizationReportDetail: (id: string) =>
    [...facilitiesKeys.analytics(), 'reports', 'detail', id] as const,
  heatmap: (facilityId: string, periodStart: string, periodEnd: string) =>
    [...facilitiesKeys.analytics(), 'heatmap', facilityId, periodStart, periodEnd] as const,
  capacityAnalysis: (filters: UtilizationFilters) =>
    [...facilitiesKeys.analytics(), 'capacity', filters] as const,
  resourceUtilization: (filters: UtilizationFilters & { resourceIds?: string[] }) =>
    [...facilitiesKeys.analytics(), 'resources', filters] as const,
  // Dashboard
  dashboard: () => [...facilitiesKeys.all, 'dashboard'] as const,
  // Buildings
  buildings: () => [...facilitiesKeys.all, 'buildings'] as const,
}

// ==================== FACILITY HOOKS ====================

export function useFacilities(filters: FacilityFilters = {}) {
  return useQuery({
    queryKey: facilitiesKeys.facilityList(filters),
    queryFn: () => fetchFacilities(filters),
  })
}

export function useFacility(id: string) {
  return useQuery({
    queryKey: facilitiesKeys.facilityDetail(id),
    queryFn: () => fetchFacility(id),
    enabled: !!id,
  })
}

export function useFacilityAvailability(facilityId: string, date: string) {
  return useQuery({
    queryKey: facilitiesKeys.facilityAvailability(facilityId, date),
    queryFn: () => fetchFacilityAvailability(facilityId, date),
    enabled: !!facilityId && !!date,
  })
}

export function useCreateFacility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFacilityRequest) => createFacility(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

export function useUpdateFacility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFacilityRequest }) =>
      updateFacility(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilityDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

export function useDeleteFacility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

export function useUpdateFacilityStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: FacilityStatus }) =>
      updateFacilityStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilityDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

// ==================== BOOKING HOOKS ====================

export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: facilitiesKeys.bookingList(filters),
    queryFn: () => fetchBookings(filters),
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: facilitiesKeys.bookingDetail(id),
    queryFn: () => fetchBooking(id),
    enabled: !!id,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

export function useUpdateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingRequest }) =>
      updateBooking(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookingDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookings() })
    },
  })
}

export function useDeleteBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

export function useApproveBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => approveBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookingDetail(id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelBooking(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookingDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

export function useCheckInBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => checkInBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookingDetail(id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
    },
  })
}

export function useCompleteBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => completeBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookingDetail(id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.analytics() })
    },
  })
}

// ==================== RECURRING BOOKING HOOKS ====================

export function useRecurringBookings(filters: { facilityId?: string; status?: string } = {}) {
  return useQuery({
    queryKey: facilitiesKeys.recurringBookings(filters),
    queryFn: () => fetchRecurringBookings(filters),
  })
}

export function useRecurringBooking(id: string) {
  return useQuery({
    queryKey: facilitiesKeys.recurringBookingDetail(id),
    queryFn: () => fetchRecurringBooking(id),
    enabled: !!id,
  })
}

export function useCancelRecurringBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, cancelFutureOnly }: { id: string; cancelFutureOnly?: boolean }) =>
      cancelRecurringBooking(id, cancelFutureOnly),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
    },
  })
}

export function usePauseRecurringBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pauseRecurringBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.recurringBookingDetail(id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.recurringBookings() })
    },
  })
}

export function useResumeRecurringBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => resumeRecurringBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.recurringBookingDetail(id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.recurringBookings() })
    },
  })
}

// ==================== RESOURCE HOOKS ====================

export function useResources(filters: ResourceFilters = {}) {
  return useQuery({
    queryKey: facilitiesKeys.resourceList(filters),
    queryFn: () => fetchResources(filters),
  })
}

export function useResource(id: string) {
  return useQuery({
    queryKey: facilitiesKeys.resourceDetail(id),
    queryFn: () => fetchResource(id),
    enabled: !!id,
  })
}

export function useResourceAvailability(resourceId: string, date: string) {
  return useQuery({
    queryKey: facilitiesKeys.resourceAvailability(resourceId, date),
    queryFn: () => fetchResourceAvailability(resourceId, date),
    enabled: !!resourceId && !!date,
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateResourceRequest) => createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.resources() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

export function useUpdateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceRequest }) =>
      updateResource(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.resourceDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.resources() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.resources() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

// ==================== CONFLICT HOOKS ====================

export function useCheckConflicts() {
  return useMutation({
    mutationFn: (data: CheckConflictRequest) => checkConflicts(data),
  })
}

export function useResolveConflict() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conflictId,
      action,
      details,
    }: {
      conflictId: string
      action: string
      details?: Record<string, unknown>
    }) => resolveConflict(conflictId, action, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
    },
  })
}

// ==================== MAINTENANCE HOOKS ====================

export function useMaintenanceRequests(filters: MaintenanceFilters = {}) {
  return useQuery({
    queryKey: facilitiesKeys.maintenanceList(filters),
    queryFn: () => fetchMaintenanceRequests(filters),
  })
}

export function useMaintenanceRequest(id: string) {
  return useQuery({
    queryKey: facilitiesKeys.maintenanceDetail(id),
    queryFn: () => fetchMaintenanceRequest(id),
    enabled: !!id,
  })
}

export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMaintenanceRequest) => createMaintenanceRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenance() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

export function useUpdateMaintenanceRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaintenanceRequest }) =>
      updateMaintenanceRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenanceDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenance() })
    },
  })
}

export function useDeleteMaintenanceRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteMaintenanceRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenance() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

export function useStartMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => startMaintenance(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenanceDetail(id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenance() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
    },
  })
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { completionNotes?: string; actualCost?: number }
    }) => completeMaintenance(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenanceDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenance() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

export function useHoldMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => holdMaintenance(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenanceDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenance() })
    },
  })
}

export function useCancelMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelMaintenance(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenanceDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenance() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.facilities() })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.dashboard() })
    },
  })
}

// ==================== MAINTENANCE SCHEDULE HOOKS ====================

export function useMaintenanceSchedules(
  filters: { facilityId?: string; resourceId?: string; isActive?: boolean } = {}
) {
  return useQuery({
    queryKey: facilitiesKeys.maintenanceSchedules(filters),
    queryFn: () => fetchMaintenanceSchedules(filters),
  })
}

export function useMaintenanceSchedule(id: string) {
  return useQuery({
    queryKey: facilitiesKeys.maintenanceScheduleDetail(id),
    queryFn: () => fetchMaintenanceSchedule(id),
    enabled: !!id,
  })
}

export function useCreateMaintenanceSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      data: Omit<MaintenanceSchedule, 'id' | 'lastPerformedDate' | 'createdAt' | 'updatedAt'>
    ) => createMaintenanceSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenanceSchedules() })
    },
  })
}

export function useUpdateMaintenanceSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaintenanceSchedule> }) =>
      updateMaintenanceSchedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: facilitiesKeys.maintenanceScheduleDetail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenanceSchedules() })
    },
  })
}

export function useDeleteMaintenanceSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteMaintenanceSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenanceSchedules() })
    },
  })
}

export function useToggleMaintenanceSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleMaintenanceSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenanceScheduleDetail(id) })
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.maintenanceSchedules() })
    },
  })
}

// ==================== ANALYTICS HOOKS ====================

export function useUsageStats(filters: UtilizationFilters) {
  return useQuery({
    queryKey: facilitiesKeys.usageStats(filters),
    queryFn: () => fetchUsageStats(filters),
    enabled: !!filters.periodStart && !!filters.periodEnd,
  })
}

export function useUtilizationReports(
  filters: { period?: string; page?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: facilitiesKeys.utilizationReports(filters),
    queryFn: () => fetchUtilizationReports(filters),
  })
}

export function useUtilizationReport(id: string) {
  return useQuery({
    queryKey: facilitiesKeys.utilizationReportDetail(id),
    queryFn: () => fetchUtilizationReport(id),
    enabled: !!id,
  })
}

export function useGenerateUtilizationReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GenerateReportRequest) => generateUtilizationReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.utilizationReports() })
    },
  })
}

export function useDeleteUtilizationReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUtilizationReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.utilizationReports() })
    },
  })
}

export function useHeatmapData(facilityId: string, periodStart: string, periodEnd: string) {
  return useQuery({
    queryKey: facilitiesKeys.heatmap(facilityId, periodStart, periodEnd),
    queryFn: () => fetchHeatmapData(facilityId, periodStart, periodEnd),
    enabled: !!facilityId && !!periodStart && !!periodEnd,
  })
}

export function useCapacityAnalysis(filters: UtilizationFilters) {
  return useQuery({
    queryKey: facilitiesKeys.capacityAnalysis(filters),
    queryFn: () => fetchCapacityAnalysis(filters),
    enabled: !!filters.periodStart && !!filters.periodEnd,
  })
}

export function useResourceUtilization(filters: UtilizationFilters & { resourceIds?: string[] }) {
  return useQuery({
    queryKey: facilitiesKeys.resourceUtilization(filters),
    queryFn: () => fetchResourceUtilization(filters),
    enabled: !!filters.periodStart && !!filters.periodEnd,
  })
}

// ==================== DASHBOARD HOOKS ====================

export function useFacilitiesDashboard() {
  return useQuery({
    queryKey: facilitiesKeys.dashboard(),
    queryFn: fetchFacilitiesDashboard,
  })
}

// ==================== BUILDINGS HOOKS ====================

export function useBuildings() {
  return useQuery({
    queryKey: facilitiesKeys.buildings(),
    queryFn: fetchBuildings,
  })
}
