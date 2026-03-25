import { apiGet, apiPost, apiDelete } from '@/lib/api-client'
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

// TODO: Backend not implemented — visitor update returns placeholder
export async function updateVisitor(_id: string, _data: Partial<Visitor>) {
  return { data: {} as Visitor }
}

export async function deleteVisitor(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/${id}`)
}

// ==================== VISITOR PASSES ====================
// TODO: Backend not implemented — visitor pass management returns placeholders

export async function fetchPasses(_params?: {
  status?: string
  purpose?: string
  date?: string
  search?: string
  page?: number
  limit?: number
}) {
  return {
    data: [] as VisitorPass[],
    meta: { total: 0, page: 1, limit: 20, totalPages: 0 }
  }
}

export async function fetchActivePasses() {
  return { data: [] as VisitorPass[] }
}

export async function createPass(_data: CreateVisitorPassRequest) {
  return { data: {} as VisitorPass }
}

export async function checkOutVisitor(_id: string) {
  return { data: {} as VisitorPass }
}

export async function cancelPass(_id: string) {
  return { data: {} as VisitorPass }
}

export async function deletePass(_id: string) {
  return { success: false }
}

// ==================== PRE-APPROVED VISITORS ====================
// TODO: Backend not implemented — pre-approved visitor management returns placeholders

export async function fetchPreApproved(_params?: { status?: string }) {
  return { data: [] as PreApprovedVisitor[] }
}

export async function createPreApproved(_data: CreatePreApprovedRequest) {
  return { data: {} as PreApprovedVisitor }
}

export async function revokePreApproved(_id: string) {
  return { data: {} as PreApprovedVisitor }
}

// ==================== STATS & REPORTS ====================

export async function fetchVisitorStats() {
  return apiGet<{ data: VisitorStats }>(`${BASE}/stats`)
}

// TODO: Backend not implemented — visitor reports returns placeholder
export async function fetchVisitorReports(_params?: { startDate?: string; endDate?: string }) {
  return { data: [] as VisitorReport[] }
}
