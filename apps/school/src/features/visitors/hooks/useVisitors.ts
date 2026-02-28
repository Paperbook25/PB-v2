import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchVisitors,
  fetchVisitor,
  createVisitor,
  updateVisitor,
  deleteVisitor,
  fetchPasses,
  fetchActivePasses,
  createPass,
  checkOutVisitor,
  cancelPass,
  deletePass,
  fetchPreApproved,
  createPreApproved,
  revokePreApproved,
  fetchVisitorStats,
  fetchVisitorReports,
} from '../api/visitors.api'
import type {
  Visitor,
  CreateVisitorRequest,
  CreateVisitorPassRequest,
  CreatePreApprovedRequest,
} from '../types/visitor.types'

export const visitorKeys = {
  all: ['visitors'] as const,
  list: (params?: Record<string, string>) => [...visitorKeys.all, 'list', params] as const,
  detail: (id: string) => [...visitorKeys.all, 'detail', id] as const,
  passes: (params?: Record<string, string>) => [...visitorKeys.all, 'passes', params] as const,
  activePasses: () => [...visitorKeys.all, 'passes', 'active'] as const,
  preApproved: (params?: Record<string, string>) => [...visitorKeys.all, 'pre-approved', params] as const,
  stats: () => [...visitorKeys.all, 'stats'] as const,
  reports: (params?: Record<string, string>) => [...visitorKeys.all, 'reports', params] as const,
}

// ==================== VISITORS ====================

export function useVisitors(params?: { search?: string }) {
  return useQuery({
    queryKey: visitorKeys.list(params as Record<string, string>),
    queryFn: () => fetchVisitors(params),
  })
}

export function useVisitor(id: string) {
  return useQuery({
    queryKey: visitorKeys.detail(id),
    queryFn: () => fetchVisitor(id),
    enabled: !!id,
  })
}

export function useCreateVisitor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVisitorRequest) => createVisitor(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: visitorKeys.all }),
  })
}

export function useUpdateVisitor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Visitor> }) => updateVisitor(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: visitorKeys.all }),
  })
}

export function useDeleteVisitor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVisitor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: visitorKeys.all }),
  })
}

// ==================== VISITOR PASSES ====================

export function usePasses(params?: {
  status?: string
  purpose?: string
  date?: string
  search?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: visitorKeys.passes(params as Record<string, string>),
    queryFn: () => fetchPasses(params),
  })
}

export function useActivePasses() {
  return useQuery({
    queryKey: visitorKeys.activePasses(),
    queryFn: fetchActivePasses,
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export function useCreatePass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVisitorPassRequest) => createPass(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: visitorKeys.passes() })
      qc.invalidateQueries({ queryKey: visitorKeys.activePasses() })
      qc.invalidateQueries({ queryKey: visitorKeys.stats() })
    },
  })
}

export function useCheckOut() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => checkOutVisitor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: visitorKeys.passes() })
      qc.invalidateQueries({ queryKey: visitorKeys.activePasses() })
      qc.invalidateQueries({ queryKey: visitorKeys.stats() })
    },
  })
}

export function useCancelPass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelPass(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: visitorKeys.passes() })
      qc.invalidateQueries({ queryKey: visitorKeys.activePasses() })
      qc.invalidateQueries({ queryKey: visitorKeys.stats() })
    },
  })
}

export function useDeletePass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePass(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: visitorKeys.passes() })
      qc.invalidateQueries({ queryKey: visitorKeys.activePasses() })
      qc.invalidateQueries({ queryKey: visitorKeys.stats() })
    },
  })
}

// ==================== PRE-APPROVED VISITORS ====================

export function usePreApproved(params?: { status?: string }) {
  return useQuery({
    queryKey: visitorKeys.preApproved(params as Record<string, string>),
    queryFn: () => fetchPreApproved(params),
  })
}

export function useCreatePreApproved() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePreApprovedRequest) => createPreApproved(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: visitorKeys.preApproved() })
      qc.invalidateQueries({ queryKey: visitorKeys.stats() })
    },
  })
}

export function useRevokePreApproved() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => revokePreApproved(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: visitorKeys.preApproved() })
      qc.invalidateQueries({ queryKey: visitorKeys.stats() })
    },
  })
}

// ==================== STATS & REPORTS ====================

export function useVisitorStats() {
  return useQuery({
    queryKey: visitorKeys.stats(),
    queryFn: fetchVisitorStats,
  })
}

export function useVisitorReports(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: visitorKeys.reports(params as Record<string, string>),
    queryFn: () => fetchVisitorReports(params),
  })
}
