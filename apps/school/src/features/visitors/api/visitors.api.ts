import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type {
  Visitor,
  CreateVisitorRequest,
  VisitorPass,
  CreateVisitorPassRequest,
  PreApprovedVisitor,
  CreatePreApprovedRequest,
  VisitorStats,
  VisitorReport,
} from '../types/visitor.types'

const BASE = '/api/visitors'

// ==================== VISITORS ====================

export async function fetchVisitors(params?: { search?: string }) {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  return apiGet<{ data: Visitor[] }>(`${BASE}?${qs}`)
}

export async function fetchVisitor(id: string) {
  return apiGet<{ data: Visitor }>(`${BASE}/${id}`)
}

export async function createVisitor(data: CreateVisitorRequest) {
  return apiPost<{ data: Visitor }>(`${BASE}`, data)
}

export async function updateVisitor(id: string, data: Partial<Visitor>) {
  return apiPut<{ data: Visitor }>(`${BASE}/${id}`, data)
}

export async function deleteVisitor(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/${id}`)
}

// ==================== VISITOR PASSES ====================

export async function fetchPasses(params?: {
  status?: string
  purpose?: string
  date?: string
  search?: string
  page?: number
  limit?: number
}) {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.purpose) qs.set('purpose', params.purpose)
  if (params?.date) qs.set('date', params.date)
  if (params?.search) qs.set('search', params.search)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  return apiGet<{
    data: VisitorPass[]
    meta: { total: number; page: number; limit: number; totalPages: number }
  }>(`${BASE}/passes?${qs}`)
}

export async function fetchActivePasses() {
  return apiGet<{ data: VisitorPass[] }>(`${BASE}/passes/active`)
}

export async function createPass(data: CreateVisitorPassRequest) {
  return apiPost<{ data: VisitorPass }>(`${BASE}/passes`, data)
}

export async function checkOutVisitor(id: string) {
  return apiPatch<{ data: VisitorPass }>(`${BASE}/passes/${id}/checkout`, {})
}

export async function cancelPass(id: string) {
  return apiPatch<{ data: VisitorPass }>(`${BASE}/passes/${id}/cancel`, {})
}

export async function deletePass(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/passes/${id}`)
}

// ==================== PRE-APPROVED VISITORS ====================

export async function fetchPreApproved(params?: { status?: string }) {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  return apiGet<{ data: PreApprovedVisitor[] }>(`${BASE}/pre-approved?${qs}`)
}

export async function createPreApproved(data: CreatePreApprovedRequest) {
  return apiPost<{ data: PreApprovedVisitor }>(`${BASE}/pre-approved`, data)
}

export async function revokePreApproved(id: string) {
  return apiPatch<{ data: PreApprovedVisitor }>(`${BASE}/pre-approved/${id}/revoke`, {})
}

// ==================== STATS & REPORTS ====================

export async function fetchVisitorStats() {
  return apiGet<{ data: VisitorStats }>(`${BASE}/stats`)
}

export async function fetchVisitorReports(params?: { startDate?: string; endDate?: string }) {
  const qs = new URLSearchParams()
  if (params?.startDate) qs.set('startDate', params.startDate)
  if (params?.endDate) qs.set('endDate', params.endDate)
  return apiGet<{ data: VisitorReport[] }>(`${BASE}/reports?${qs}`)
}
