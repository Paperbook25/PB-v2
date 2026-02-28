import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchHostels,
  fetchHostel,
  createHostel,
  updateHostel,
  deleteHostel,
  fetchRooms,
  fetchRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  fetchAllocations,
  createAllocation,
  vacateAllocation,
  transferAllocation,
  fetchHostelFees,
  createHostelFee,
  payHostelFee,
  generateBulkFees,
  fetchMessMenu,
  updateMessMenu,
  fetchHostelAttendance,
  markHostelAttendance,
  markBulkHostelAttendance,
  fetchHostelStats,
  fetchEligibleStudentsForHostel,
} from '../api/hostel.api'
import type {
  CreateHostelRequest,
  Hostel,
  CreateRoomRequest,
  Room,
  CreateAllocationRequest,
  CreateHostelFeeRequest,
  UpdateMessMenuRequest,
  MarkAttendanceRequest,
} from '../types/hostel.types'

export const hostelKeys = {
  all: ['hostel'] as const,
  hostels: () => [...hostelKeys.all, 'hostels'] as const,
  hostelList: (params?: Record<string, string>) => [...hostelKeys.hostels(), 'list', params] as const,
  hostelDetail: (id: string) => [...hostelKeys.hostels(), 'detail', id] as const,
  rooms: () => [...hostelKeys.all, 'rooms'] as const,
  roomList: (params?: Record<string, string>) => [...hostelKeys.rooms(), 'list', params] as const,
  roomDetail: (id: string) => [...hostelKeys.rooms(), 'detail', id] as const,
  allocations: (params?: Record<string, string>) => [...hostelKeys.all, 'allocations', params] as const,
  fees: (params?: Record<string, string>) => [...hostelKeys.all, 'fees', params] as const,
  messMenu: (params?: Record<string, string>) => [...hostelKeys.all, 'mess-menu', params] as const,
  attendance: (params?: Record<string, string>) => [...hostelKeys.all, 'attendance', params] as const,
  stats: () => [...hostelKeys.all, 'stats'] as const,
  eligibleStudents: (params?: Record<string, string>) => [...hostelKeys.all, 'eligible-students', params] as const,
}

// ==================== HOSTELS ====================

export function useHostels(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: hostelKeys.hostelList(params as Record<string, string>),
    queryFn: () => fetchHostels(params),
  })
}

export function useHostel(id: string) {
  return useQuery({
    queryKey: hostelKeys.hostelDetail(id),
    queryFn: () => fetchHostel(id),
    enabled: !!id,
  })
}

export function useCreateHostel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateHostelRequest) => createHostel(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: hostelKeys.hostels() }),
  })
}

export function useUpdateHostel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Hostel> }) => updateHostel(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: hostelKeys.hostels() }),
  })
}

export function useDeleteHostel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteHostel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: hostelKeys.hostels() }),
  })
}

// ==================== ROOMS ====================

export function useRooms(params?: { hostelId?: string; type?: string; status?: string; floor?: number }) {
  return useQuery({
    queryKey: hostelKeys.roomList(params as Record<string, string>),
    queryFn: () => fetchRooms(params),
  })
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: hostelKeys.roomDetail(id),
    queryFn: () => fetchRoom(id),
    enabled: !!id,
  })
}

export function useCreateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRoomRequest) => createRoom(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hostelKeys.rooms() })
      qc.invalidateQueries({ queryKey: hostelKeys.hostels() })
    },
  })
}

export function useUpdateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Room> }) => updateRoom(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: hostelKeys.rooms() }),
  })
}

export function useDeleteRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hostelKeys.rooms() })
      qc.invalidateQueries({ queryKey: hostelKeys.hostels() })
    },
  })
}

// ==================== ALLOCATIONS ====================

export function useAllocations(params?: { hostelId?: string; roomId?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: hostelKeys.allocations(params as Record<string, string>),
    queryFn: () => fetchAllocations(params),
  })
}

export function useCreateAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAllocationRequest) => createAllocation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hostelKeys.allocations() })
      qc.invalidateQueries({ queryKey: hostelKeys.rooms() })
      qc.invalidateQueries({ queryKey: hostelKeys.hostels() })
      qc.invalidateQueries({ queryKey: hostelKeys.stats() })
    },
  })
}

export function useVacateAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vacateAllocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hostelKeys.allocations() })
      qc.invalidateQueries({ queryKey: hostelKeys.rooms() })
      qc.invalidateQueries({ queryKey: hostelKeys.hostels() })
      qc.invalidateQueries({ queryKey: hostelKeys.stats() })
    },
  })
}

export function useTransferAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { newRoomId: string; bedNumber: number } }) =>
      transferAllocation(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hostelKeys.allocations() })
      qc.invalidateQueries({ queryKey: hostelKeys.rooms() })
    },
  })
}

// ==================== FEES ====================

export function useHostelFees(params?: { studentId?: string; feeType?: string; status?: string; month?: string }) {
  return useQuery({
    queryKey: hostelKeys.fees(params as Record<string, string>),
    queryFn: () => fetchHostelFees(params),
  })
}

export function useCreateHostelFee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateHostelFeeRequest) => createHostelFee(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: hostelKeys.fees() }),
  })
}

export function usePayHostelFee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => payHostelFee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hostelKeys.fees() })
      qc.invalidateQueries({ queryKey: hostelKeys.stats() })
    },
  })
}

export function useGenerateBulkFees() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { month: string; feeType: string; dueDate: string; amount: number }) =>
      generateBulkFees(data as Parameters<typeof generateBulkFees>[0]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hostelKeys.fees() })
      qc.invalidateQueries({ queryKey: hostelKeys.stats() })
    },
  })
}

// ==================== MESS MENU ====================

export function useMessMenu(params?: { hostelId?: string; dayOfWeek?: number; mealType?: string }) {
  return useQuery({
    queryKey: hostelKeys.messMenu(params as Record<string, string>),
    queryFn: () => fetchMessMenu(params),
  })
}

export function useUpdateMessMenu() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateMessMenuRequest) => updateMessMenu(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: hostelKeys.messMenu() }),
  })
}

// ==================== ATTENDANCE ====================

export function useHostelAttendance(params?: { hostelId?: string; date?: string; status?: string }) {
  return useQuery({
    queryKey: hostelKeys.attendance(params as Record<string, string>),
    queryFn: () => fetchHostelAttendance(params),
  })
}

export function useMarkHostelAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MarkAttendanceRequest) => markHostelAttendance(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hostelKeys.attendance() })
      qc.invalidateQueries({ queryKey: hostelKeys.stats() })
    },
  })
}

export function useMarkBulkHostelAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { date: string; records: Array<{ studentId: string; status: string }> }) =>
      markBulkHostelAttendance(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hostelKeys.attendance() })
      qc.invalidateQueries({ queryKey: hostelKeys.stats() })
    },
  })
}

// ==================== STATS ====================

export function useHostelStats() {
  return useQuery({
    queryKey: hostelKeys.stats(),
    queryFn: fetchHostelStats,
  })
}

// ==================== ELIGIBLE STUDENTS ====================

export function useEligibleStudentsForHostel(params?: { search?: string; gender?: string }) {
  return useQuery({
    queryKey: hostelKeys.eligibleStudents(params as Record<string, string>),
    queryFn: () => fetchEligibleStudentsForHostel(params),
  })
}
