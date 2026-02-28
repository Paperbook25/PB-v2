import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchRoutes,
  fetchRoute,
  createRoute,
  updateRoute,
  deleteRoute,
  fetchVehicles,
  fetchVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  fetchDrivers,
  fetchDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  fetchAssignments,
  assignStudent,
  removeAssignment,
  fetchGPSPositions,
  fetchMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  fetchTransportNotifications,
  sendTransportNotification,
  fetchTransportStats,
} from '../api/transport.api'
import type {
  CreateRouteRequest,
  TransportRoute,
  CreateVehicleRequest,
  Vehicle,
  CreateDriverRequest,
  Driver,
  AssignStudentRequest,
  CreateMaintenanceRequest,
  MaintenanceRecord,
} from '../types/transport.types'

export const transportKeys = {
  all: ['transport'] as const,
  routes: () => [...transportKeys.all, 'routes'] as const,
  routeList: (params?: Record<string, string>) => [...transportKeys.routes(), 'list', params] as const,
  routeDetail: (id: string) => [...transportKeys.routes(), 'detail', id] as const,
  vehicles: () => [...transportKeys.all, 'vehicles'] as const,
  vehicleList: (params?: Record<string, string>) => [...transportKeys.vehicles(), 'list', params] as const,
  vehicleDetail: (id: string) => [...transportKeys.vehicles(), 'detail', id] as const,
  drivers: () => [...transportKeys.all, 'drivers'] as const,
  driverList: (params?: Record<string, string>) => [...transportKeys.drivers(), 'list', params] as const,
  driverDetail: (id: string) => [...transportKeys.drivers(), 'detail', id] as const,
  assignments: (params?: Record<string, string>) => [...transportKeys.all, 'assignments', params] as const,
  tracking: () => [...transportKeys.all, 'tracking'] as const,
  maintenance: (params?: Record<string, string>) => [...transportKeys.all, 'maintenance', params] as const,
  notifications: (params?: Record<string, string>) => [...transportKeys.all, 'notifications', params] as const,
  stats: () => [...transportKeys.all, 'stats'] as const,
}

// ==================== ROUTES ====================

export function useRoutes(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: transportKeys.routeList(params as Record<string, string>),
    queryFn: () => fetchRoutes(params),
  })
}

export function useRoute(id: string) {
  return useQuery({
    queryKey: transportKeys.routeDetail(id),
    queryFn: () => fetchRoute(id),
    enabled: !!id,
  })
}

export function useCreateRoute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRouteRequest) => createRoute(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.routes() }),
  })
}

export function useUpdateRoute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransportRoute> }) => updateRoute(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.routes() }),
  })
}

export function useDeleteRoute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRoute(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.routes() }),
  })
}

// ==================== VEHICLES ====================

export function useVehicles(params?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: transportKeys.vehicleList(params as Record<string, string>),
    queryFn: () => fetchVehicles(params),
  })
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: transportKeys.vehicleDetail(id),
    queryFn: () => fetchVehicle(id),
    enabled: !!id,
  })
}

export function useCreateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVehicleRequest) => createVehicle(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.vehicles() }),
  })
}

export function useUpdateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) => updateVehicle(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.vehicles() }),
  })
}

export function useDeleteVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.vehicles() }),
  })
}

// ==================== DRIVERS ====================

export function useDrivers(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: transportKeys.driverList(params as Record<string, string>),
    queryFn: () => fetchDrivers(params),
  })
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: transportKeys.driverDetail(id),
    queryFn: () => fetchDriver(id),
    enabled: !!id,
  })
}

export function useCreateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDriverRequest) => createDriver(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.drivers() }),
  })
}

export function useUpdateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Driver> }) => updateDriver(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.drivers() }),
  })
}

export function useDeleteDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDriver(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.drivers() }),
  })
}

// ==================== STUDENT ASSIGNMENTS ====================

export function useAssignments(params?: { routeId?: string; stopId?: string; search?: string }) {
  return useQuery({
    queryKey: transportKeys.assignments(params as Record<string, string>),
    queryFn: () => fetchAssignments(params),
  })
}

export function useAssignStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AssignStudentRequest & Record<string, unknown>) => assignStudent(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transportKeys.assignments() })
      qc.invalidateQueries({ queryKey: transportKeys.routes() })
    },
  })
}

export function useRemoveAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removeAssignment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transportKeys.assignments() })
      qc.invalidateQueries({ queryKey: transportKeys.routes() })
    },
  })
}

// ==================== GPS TRACKING ====================

export function useGPSTracking(enabled = true) {
  return useQuery({
    queryKey: transportKeys.tracking(),
    queryFn: fetchGPSPositions,
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled,
  })
}

// ==================== MAINTENANCE ====================

export function useMaintenanceRecords(params?: { vehicleId?: string; status?: string; type?: string }) {
  return useQuery({
    queryKey: transportKeys.maintenance(params as Record<string, string>),
    queryFn: () => fetchMaintenanceRecords(params),
  })
}

export function useCreateMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMaintenanceRequest) => createMaintenanceRecord(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.maintenance() }),
  })
}

export function useUpdateMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaintenanceRecord> }) => updateMaintenanceRecord(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.maintenance() }),
  })
}

export function useDeleteMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMaintenanceRecord(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transportKeys.maintenance() })
      qc.invalidateQueries({ queryKey: transportKeys.stats() })
    },
  })
}

// ==================== NOTIFICATIONS ====================

export function useTransportNotifications(params?: { routeId?: string; eventType?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: transportKeys.notifications(params as Record<string, string>),
    queryFn: () => fetchTransportNotifications(params),
  })
}

export function useSendNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => sendTransportNotification(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.notifications() }),
  })
}

// ==================== STATS ====================

export function useTransportStats() {
  return useQuery({
    queryKey: transportKeys.stats(),
    queryFn: fetchTransportStats,
  })
}
