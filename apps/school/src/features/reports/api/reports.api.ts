import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  ReportTemplate,
  ReportDefinition,
  GeneratedReport,
  ScheduledReport,
  KPIMetric,
  Dashboard,
  AnalyticsOverview,
  AcademicAnalytics,
  FinancialAnalytics,
  AttendanceAnalytics,
  GenerateReportRequest,
  CreateScheduledReportRequest,
  ReportFilters,
  ReportCategory,
} from '../types/reports.types'

const API_BASE = '/api/reports'

// ==================== TEMPLATES ====================

export async function fetchReportTemplates(
  category?: ReportCategory | 'all'
): Promise<{ data: ReportTemplate[] }> {
  const params = category && category !== 'all' ? `?category=${category}` : ''
  return apiGet<{ data: ReportTemplate[] }>(`${API_BASE}/templates${params}`)
}

export async function fetchReportTemplate(id: string): Promise<{ data: ReportTemplate }> {
  return apiGet<{ data: ReportTemplate }>(`${API_BASE}/templates/${id}`)
}

// ==================== DEFINITIONS ====================

export async function fetchReportDefinitions(
  filters: { category?: ReportCategory | 'all'; search?: string } = {}
): Promise<{ data: ReportDefinition[] }> {
  const params = new URLSearchParams()
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.search) params.set('search', filters.search)

  const queryString = params.toString()
  return apiGet<{ data: ReportDefinition[] }>(
    `${API_BASE}/definitions${queryString ? `?${queryString}` : ''}`
  )
}

export async function fetchReportDefinition(id: string): Promise<{ data: ReportDefinition }> {
  return apiGet<{ data: ReportDefinition }>(`${API_BASE}/definitions/${id}`)
}

// ==================== GENERATED REPORTS ====================

export async function fetchGeneratedReports(
  filters: ReportFilters = {}
): Promise<PaginatedResponse<GeneratedReport>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)

  return apiGet<PaginatedResponse<GeneratedReport>>(
    `${API_BASE}/generated?${params.toString()}`
  )
}

export async function fetchGeneratedReport(id: string): Promise<{ data: GeneratedReport }> {
  return apiGet<{ data: GeneratedReport }>(`${API_BASE}/generated/${id}`)
}

export async function generateReport(
  data: GenerateReportRequest
): Promise<{ data: GeneratedReport }> {
  return apiPost<{ data: GeneratedReport }>(`${API_BASE}/generate`, data)
}

export async function deleteGeneratedReport(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/generated/${id}`)
}

// ==================== SCHEDULED REPORTS ====================

export async function fetchScheduledReports(
  filters: { category?: ReportCategory | 'all'; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<ScheduledReport>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)

  return apiGet<PaginatedResponse<ScheduledReport>>(
    `${API_BASE}/scheduled?${params.toString()}`
  )
}

export async function createScheduledReport(
  data: CreateScheduledReportRequest
): Promise<{ data: ScheduledReport }> {
  return apiPost<{ data: ScheduledReport }>(`${API_BASE}/scheduled`, data)
}

export async function toggleScheduledReport(id: string): Promise<{ data: ScheduledReport }> {
  return apiPatch<{ data: ScheduledReport }>(`${API_BASE}/scheduled/${id}/toggle`)
}

export async function deleteScheduledReport(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/scheduled/${id}`)
}

// ==================== KPI METRICS ====================

export async function fetchKPIMetrics(
  category?: ReportCategory | 'all'
): Promise<{ data: KPIMetric[] }> {
  const params = category && category !== 'all' ? `?category=${category}` : ''
  return apiGet<{ data: KPIMetric[] }>(`${API_BASE}/kpis${params}`)
}

// ==================== DASHBOARDS ====================

export async function fetchDashboards(): Promise<{ data: Dashboard[] }> {
  return apiGet<{ data: Dashboard[] }>(`${API_BASE}/dashboards`)
}

export async function fetchDashboard(id: string): Promise<{ data: Dashboard }> {
  return apiGet<{ data: Dashboard }>(`${API_BASE}/dashboards/${id}`)
}

// ==================== ANALYTICS ====================

export async function fetchAnalyticsOverview(): Promise<{ data: AnalyticsOverview }> {
  return apiGet<{ data: AnalyticsOverview }>(`${API_BASE}/analytics/overview`)
}

export async function fetchAcademicAnalytics(): Promise<{ data: AcademicAnalytics }> {
  return apiGet<{ data: AcademicAnalytics }>(`${API_BASE}/analytics/academic`)
}

export async function fetchFinancialAnalytics(): Promise<{ data: FinancialAnalytics }> {
  return apiGet<{ data: FinancialAnalytics }>(`${API_BASE}/analytics/financial`)
}

export async function fetchAttendanceAnalytics(): Promise<{ data: AttendanceAnalytics }> {
  return apiGet<{ data: AttendanceAnalytics }>(`${API_BASE}/analytics/attendance`)
}

// ==================== EXPORT ====================

export async function exportData(
  type: string,
  format: string,
  data: unknown
): Promise<{ data: { downloadUrl: string; expiresAt: string } }> {
  return apiPost<{ data: { downloadUrl: string; expiresAt: string } }>(`${API_BASE}/export`, {
    type,
    format,
    data,
  })
}
