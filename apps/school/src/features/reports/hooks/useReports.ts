import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchReportTemplates,
  fetchReportTemplate,
  fetchReportDefinitions,
  fetchReportDefinition,
  fetchGeneratedReports,
  fetchGeneratedReport,
  generateReport,
  deleteGeneratedReport,
  fetchScheduledReports,
  createScheduledReport,
  toggleScheduledReport,
  deleteScheduledReport,
  fetchKPIMetrics,
  fetchDashboards,
  fetchDashboard,
  fetchAnalyticsOverview,
  fetchAcademicAnalytics,
  fetchFinancialAnalytics,
  fetchAttendanceAnalytics,
  exportData,
} from '../api/reports.api'
import type {
  ReportCategory,
  ReportFilters,
  GenerateReportRequest,
  CreateScheduledReportRequest,
} from '../types/reports.types'

// ==================== QUERY KEYS ====================

export const reportsKeys = {
  all: ['reports'] as const,
  templates: () => [...reportsKeys.all, 'templates'] as const,
  templateList: (category?: ReportCategory | 'all') =>
    [...reportsKeys.templates(), category] as const,
  templateDetail: (id: string) => [...reportsKeys.templates(), 'detail', id] as const,
  definitions: () => [...reportsKeys.all, 'definitions'] as const,
  definitionList: (filters: { category?: ReportCategory | 'all'; search?: string }) =>
    [...reportsKeys.definitions(), 'list', filters] as const,
  definitionDetail: (id: string) => [...reportsKeys.definitions(), 'detail', id] as const,
  generated: () => [...reportsKeys.all, 'generated'] as const,
  generatedList: (filters: ReportFilters) => [...reportsKeys.generated(), 'list', filters] as const,
  generatedDetail: (id: string) => [...reportsKeys.generated(), 'detail', id] as const,
  scheduled: () => [...reportsKeys.all, 'scheduled'] as const,
  scheduledList: (filters: { category?: ReportCategory | 'all'; page?: number; limit?: number }) =>
    [...reportsKeys.scheduled(), 'list', filters] as const,
  kpis: () => [...reportsKeys.all, 'kpis'] as const,
  kpiList: (category?: ReportCategory | 'all') => [...reportsKeys.kpis(), category] as const,
  dashboards: () => [...reportsKeys.all, 'dashboards'] as const,
  dashboardDetail: (id: string) => [...reportsKeys.dashboards(), 'detail', id] as const,
  analytics: () => [...reportsKeys.all, 'analytics'] as const,
  analyticsOverview: () => [...reportsKeys.analytics(), 'overview'] as const,
  academicAnalytics: () => [...reportsKeys.analytics(), 'academic'] as const,
  financialAnalytics: () => [...reportsKeys.analytics(), 'financial'] as const,
  attendanceAnalytics: () => [...reportsKeys.analytics(), 'attendance'] as const,
}

// ==================== TEMPLATE HOOKS ====================

export function useReportTemplates(category?: ReportCategory | 'all') {
  return useQuery({
    queryKey: reportsKeys.templateList(category),
    queryFn: () => fetchReportTemplates(category),
  })
}

export function useReportTemplate(id: string) {
  return useQuery({
    queryKey: reportsKeys.templateDetail(id),
    queryFn: () => fetchReportTemplate(id),
    enabled: !!id,
  })
}

// ==================== DEFINITION HOOKS ====================

export function useReportDefinitions(
  filters: { category?: ReportCategory | 'all'; search?: string } = {}
) {
  return useQuery({
    queryKey: reportsKeys.definitionList(filters),
    queryFn: () => fetchReportDefinitions(filters),
  })
}

export function useReportDefinition(id: string) {
  return useQuery({
    queryKey: reportsKeys.definitionDetail(id),
    queryFn: () => fetchReportDefinition(id),
    enabled: !!id,
  })
}

// ==================== GENERATED REPORT HOOKS ====================

export function useGeneratedReports(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: reportsKeys.generatedList(filters),
    queryFn: () => fetchGeneratedReports(filters),
  })
}

export function useGeneratedReport(id: string) {
  return useQuery({
    queryKey: reportsKeys.generatedDetail(id),
    queryFn: () => fetchGeneratedReport(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll while report is generating
      const data = query.state.data?.data
      if (data?.status === 'generating') return 2000
      return false
    },
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GenerateReportRequest) => generateReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.generated() })
    },
  })
}

export function useDeleteGeneratedReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteGeneratedReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.generated() })
    },
  })
}

// ==================== SCHEDULED REPORT HOOKS ====================

export function useScheduledReports(
  filters: { category?: ReportCategory | 'all'; page?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: reportsKeys.scheduledList(filters),
    queryFn: () => fetchScheduledReports(filters),
  })
}

export function useCreateScheduledReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateScheduledReportRequest) => createScheduledReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.scheduled() })
    },
  })
}

export function useToggleScheduledReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleScheduledReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.scheduled() })
    },
  })
}

export function useDeleteScheduledReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteScheduledReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.scheduled() })
    },
  })
}

// ==================== KPI HOOKS ====================

export function useKPIMetrics(category?: ReportCategory | 'all') {
  return useQuery({
    queryKey: reportsKeys.kpiList(category),
    queryFn: () => fetchKPIMetrics(category),
  })
}

// ==================== DASHBOARD HOOKS ====================

export function useDashboards() {
  return useQuery({
    queryKey: reportsKeys.dashboards(),
    queryFn: fetchDashboards,
  })
}

export function useDashboard(id: string) {
  return useQuery({
    queryKey: reportsKeys.dashboardDetail(id),
    queryFn: () => fetchDashboard(id),
    enabled: !!id,
  })
}

// ==================== ANALYTICS HOOKS ====================

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: reportsKeys.analyticsOverview(),
    queryFn: fetchAnalyticsOverview,
  })
}

export function useAcademicAnalytics() {
  return useQuery({
    queryKey: reportsKeys.academicAnalytics(),
    queryFn: fetchAcademicAnalytics,
  })
}

export function useFinancialAnalytics() {
  return useQuery({
    queryKey: reportsKeys.financialAnalytics(),
    queryFn: fetchFinancialAnalytics,
  })
}

export function useAttendanceAnalytics() {
  return useQuery({
    queryKey: reportsKeys.attendanceAnalytics(),
    queryFn: fetchAttendanceAnalytics,
  })
}

// ==================== EXPORT HOOKS ====================

export function useExportData() {
  return useMutation({
    mutationFn: ({ type, format, data }: { type: string; format: string; data: unknown }) =>
      exportData(type, format, data),
  })
}
