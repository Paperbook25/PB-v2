import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type {
  Hostel,
  CreateHostelRequest,
  Room,
  CreateRoomRequest,
  RoomAllocation,
  CreateAllocationRequest,
  HostelFee,
  CreateHostelFeeRequest,
  MessMenu,
  UpdateMessMenuRequest,
  HostelAttendance,
  MarkAttendanceRequest,
  HostelStats,
} from '../types/hostel.types'

const BASE = '/api/hostel'

// ==================== HOSTELS ====================

export async function fetchHostels(params?: { type?: string; status?: string }) {
  const qs = new URLSearchParams()
  if (params?.type) qs.set('type', params.type)
  if (params?.status) qs.set('status', params.status)
  return apiGet<{ data: Hostel[] }>(`${BASE}/hostels?${qs}`)
}

export async function fetchHostel(id: string) {
  return apiGet<{ data: Hostel }>(`${BASE}/hostels/${id}`)
}

export async function createHostel(data: CreateHostelRequest) {
  return apiPost<{ data: Hostel }>(`${BASE}/hostels`, data)
}

export async function updateHostel(id: string, data: Partial<Hostel>) {
  return apiPut<{ data: Hostel }>(`${BASE}/hostels/${id}`, data)
}

export async function deleteHostel(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/hostels/${id}`)
}

// ==================== ROOMS ====================

export async function fetchRooms(params?: { hostelId?: string; type?: string; status?: string; floor?: number }) {
  const qs = new URLSearchParams()
  if (params?.hostelId) qs.set('hostelId', params.hostelId)
  if (params?.type) qs.set('type', params.type)
  if (params?.status) qs.set('status', params.status)
  if (params?.floor) qs.set('floor', String(params.floor))
  return apiGet<{ data: Room[] }>(`${BASE}/rooms?${qs}`)
}

export async function fetchRoom(id: string) {
  return apiGet<{ data: Room }>(`${BASE}/rooms/${id}`)
}

export async function createRoom(data: CreateRoomRequest) {
  return apiPost<{ data: Room }>(`${BASE}/rooms`, data)
}

export async function updateRoom(id: string, data: Partial<Room>) {
  return apiPut<{ data: Room }>(`${BASE}/rooms/${id}`, data)
}

export async function deleteRoom(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/rooms/${id}`)
}

// ==================== ALLOCATIONS ====================

export async function fetchAllocations(params?: { hostelId?: string; roomId?: string; status?: string; search?: string }) {
  const qs = new URLSearchParams()
  if (params?.hostelId) qs.set('hostelId', params.hostelId)
  if (params?.roomId) qs.set('roomId', params.roomId)
  if (params?.status) qs.set('status', params.status)
  if (params?.search) qs.set('search', params.search)
  return apiGet<{ data: RoomAllocation[] }>(`${BASE}/allocations?${qs}`)
}

export async function createAllocation(data: CreateAllocationRequest) {
  return apiPost<{ data: RoomAllocation }>(`${BASE}/allocations`, data)
}

export async function vacateAllocation(id: string) {
  return apiPatch<{ data: RoomAllocation }>(`${BASE}/allocations/${id}/vacate`, {})
}

export async function transferAllocation(id: string, data: { newRoomId: string; bedNumber: number }) {
  return apiPatch<{ data: RoomAllocation }>(`${BASE}/allocations/${id}/transfer`, data)
}

// ==================== FEES ====================

export async function fetchHostelFees(params?: { studentId?: string; feeType?: string; status?: string; month?: string }) {
  const qs = new URLSearchParams()
  if (params?.studentId) qs.set('studentId', params.studentId)
  if (params?.feeType) qs.set('feeType', params.feeType)
  if (params?.status) qs.set('status', params.status)
  if (params?.month) qs.set('month', params.month)
  return apiGet<{ data: HostelFee[] }>(`${BASE}/fees?${qs}`)
}

export async function createHostelFee(data: CreateHostelFeeRequest) {
  return apiPost<{ data: HostelFee }>(`${BASE}/fees`, data)
}

export async function payHostelFee(id: string) {
  return apiPatch<{ data: HostelFee }>(`${BASE}/fees/${id}/pay`, {})
}

// ==================== MESS MENU ====================

export async function fetchMessMenu(params?: { hostelId?: string; dayOfWeek?: number; mealType?: string }) {
  const qs = new URLSearchParams()
  if (params?.hostelId) qs.set('hostelId', params.hostelId)
  if (params?.dayOfWeek !== undefined) qs.set('dayOfWeek', String(params.dayOfWeek))
  if (params?.mealType) qs.set('mealType', params.mealType)
  return apiGet<{ data: MessMenu[] }>(`${BASE}/mess-menu?${qs}`)
}

export async function updateMessMenu(data: UpdateMessMenuRequest) {
  return apiPut<{ data: MessMenu }>(`${BASE}/mess-menu`, data)
}

// ==================== ATTENDANCE ====================

export async function fetchHostelAttendance(params?: { hostelId?: string; date?: string; status?: string }) {
  const qs = new URLSearchParams()
  if (params?.hostelId) qs.set('hostelId', params.hostelId)
  if (params?.date) qs.set('date', params.date)
  if (params?.status) qs.set('status', params.status)
  return apiGet<{ data: HostelAttendance[] }>(`${BASE}/attendance?${qs}`)
}

export async function markHostelAttendance(data: MarkAttendanceRequest) {
  return apiPost<{ data: HostelAttendance }>(`${BASE}/attendance`, data)
}

export async function markBulkHostelAttendance(data: { date: string; records: Array<{ studentId: string; status: string }> }) {
  return apiPost<{ success: boolean }>(`${BASE}/attendance/bulk`, data)
}

// ==================== BULK FEES ====================

export async function generateBulkFees(data: { month: string; feeType: HostelFee['feeType']; dueDate: string; amount: number }) {
  return apiPost<{ data: { created: number } }>(`${BASE}/fees/bulk-generate`, data)
}

// ==================== STATS ====================

export async function fetchHostelStats() {
  return apiGet<{ data: HostelStats }>(`${BASE}/stats`)
}

// ==================== ELIGIBLE STUDENTS ====================

export interface EligibleStudent {
  id: string
  name: string
  class: string
  section: string
  rollNumber: number
  admissionNumber: string
  gender: 'male' | 'female' | 'other'
  photoUrl: string
}

export async function fetchEligibleStudentsForHostel(params?: { search?: string; gender?: string }) {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  if (params?.gender) qs.set('gender', params.gender)
  return apiGet<{ data: EligibleStudent[] }>(`${BASE}/eligible-students?${qs}`)
}
