import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  reportTemplates,
  reportDefinitions,
  generatedReports,
  scheduledReports,
  kpiMetrics,
  dashboards,
  getAnalyticsOverview,
  getAcademicAnalytics,
  getFinancialAnalytics,
  getAttendanceAnalytics,
} from '../data/reports.data'
import type {
  GeneratedReport,
  ScheduledReport,
  GenerateReportRequest,
  CreateScheduledReportRequest,
  ReportStatus,
} from '@/features/reports/types/reports.types'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

export const reportsHandlers = [
  // ==================== REPORT TEMPLATES ====================

  // Get all report templates
  http.get('/api/reports/templates', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const category = url.searchParams.get('category')

    let filtered = [...reportTemplates]

    if (category && category !== 'all') {
      filtered = filtered.filter((t) => t.category === category)
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single template
  http.get('/api/reports/templates/:id', async ({ params }) => {
    await mockDelay('read')
    const template = reportTemplates.find((t) => t.id === params.id)

    if (!template) {
      return HttpResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: template })
  }),

  // ==================== REPORT DEFINITIONS ====================

  // Get all report definitions
  http.get('/api/reports/definitions', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')?.toLowerCase() || ''

    let filtered = [...reportDefinitions]

    if (category && category !== 'all') {
      filtered = filtered.filter((d) => d.category === category)
    }

    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(search) || d.description.toLowerCase().includes(search)
      )
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single definition
  http.get('/api/reports/definitions/:id', async ({ params }) => {
    await mockDelay('read')
    const definition = reportDefinitions.find((d) => d.id === params.id)

    if (!definition) {
      return HttpResponse.json({ error: 'Definition not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: definition })
  }),

  // ==================== GENERATED REPORTS ====================

  // Get all generated reports
  http.get('/api/reports/generated', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...generatedReports]

    if (category && category !== 'all') {
      filtered = filtered.filter((r) => r.category === category)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.status === status)
    }

    if (search) {
      filtered = filtered.filter((r) => r.name.toLowerCase().includes(search))
    }

    // Sort by generatedAt descending
    filtered.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filtered.slice(startIndex, startIndex + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  // Generate a new report
  http.post('/api/reports/generate', async ({ request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as GenerateReportRequest

    const definition = reportDefinitions.find(
      (d) => d.id === body.definitionId || d.id === body.templateId
    )

    if (!definition && !body.templateId) {
      return HttpResponse.json({ error: 'Report definition not found' }, { status: 404 })
    }

    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + 7)

    const newReport: GeneratedReport = {
      id: generateId(),
      definitionId: body.definitionId || body.templateId || '',
      name: body.name || definition?.name || 'Custom Report',
      category: definition?.category || 'custom',
      status: 'generating',
      format: body.format,
      dateRange: {
        preset: body.dateRange.preset,
        startDate: body.dateRange.startDate || now.toISOString(),
        endDate: body.dateRange.endDate || now.toISOString(),
      },
      generatedBy: 'Current User',
      generatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    generatedReports.unshift(newReport)

    // Simulate report generation completing after 2 seconds
    setTimeout(() => {
      const idx = generatedReports.findIndex((r) => r.id === newReport.id)
      if (idx !== -1) {
        generatedReports[idx] = {
          ...generatedReports[idx],
          status: 'ready',
          fileUrl: `/reports/download/${newReport.id}.${body.format}`,
          fileSize: `${Math.floor(Math.random() * 400 + 100)} KB`,
          rowCount: Math.floor(Math.random() * 500 + 50),
        }
      }
    }, 2000)

    return HttpResponse.json({ data: newReport }, { status: 201 })
  }),

  // Get report status
  http.get('/api/reports/generated/:id', async ({ params }) => {
    await mockDelay('read')
    const report = generatedReports.find((r) => r.id === params.id)

    if (!report) {
      return HttpResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: report })
  }),

  // Delete generated report
  http.delete('/api/reports/generated/:id', async ({ params }) => {
    await mockDelay('read')
    const idx = generatedReports.findIndex((r) => r.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    generatedReports.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== SCHEDULED REPORTS ====================

  // Get all scheduled reports
  http.get('/api/reports/scheduled', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...scheduledReports]

    if (category && category !== 'all') {
      filtered = filtered.filter((r) => r.category === category)
    }

    // Sort by nextRunAt ascending
    filtered.sort((a, b) => new Date(a.nextRunAt).getTime() - new Date(b.nextRunAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filtered.slice(startIndex, startIndex + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  // Create scheduled report
  http.post('/api/reports/scheduled', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateScheduledReportRequest

    const definition = reportDefinitions.find((d) => d.id === body.definitionId)

    if (!definition) {
      return HttpResponse.json({ error: 'Report definition not found' }, { status: 404 })
    }

    const now = new Date()
    const nextRun = new Date(body.startDate || now)
    if (body.frequency === 'daily') nextRun.setDate(nextRun.getDate() + 1)
    else if (body.frequency === 'weekly') nextRun.setDate(nextRun.getDate() + 7)
    else if (body.frequency === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1)

    const newScheduled: ScheduledReport = {
      id: generateId(),
      definitionId: body.definitionId,
      reportName: definition.name,
      category: definition.category,
      frequency: body.frequency,
      format: body.format,
      recipients: body.recipients,
      nextRunAt: nextRun.toISOString(),
      isActive: true,
      createdBy: 'Current User',
      createdAt: now.toISOString(),
    }

    scheduledReports.unshift(newScheduled)
    return HttpResponse.json({ data: newScheduled }, { status: 201 })
  }),

  // Toggle scheduled report active status
  http.patch('/api/reports/scheduled/:id/toggle', async ({ params }) => {
    await mockDelay('read')
    const idx = scheduledReports.findIndex((r) => r.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Scheduled report not found' }, { status: 404 })
    }

    scheduledReports[idx] = {
      ...scheduledReports[idx],
      isActive: !scheduledReports[idx].isActive,
    }

    return HttpResponse.json({ data: scheduledReports[idx] })
  }),

  // Delete scheduled report
  http.delete('/api/reports/scheduled/:id', async ({ params }) => {
    await mockDelay('read')
    const idx = scheduledReports.findIndex((r) => r.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Scheduled report not found' }, { status: 404 })
    }

    scheduledReports.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== KPI METRICS ====================

  // Get all KPI metrics
  http.get('/api/reports/kpis', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const category = url.searchParams.get('category')

    let filtered = [...kpiMetrics]

    if (category && category !== 'all') {
      filtered = filtered.filter((k) => k.category === category)
    }

    return HttpResponse.json({ data: filtered })
  }),

  // ==================== DASHBOARDS ====================

  // Get all dashboards
  http.get('/api/reports/dashboards', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: dashboards })
  }),

  // Get single dashboard
  http.get('/api/reports/dashboards/:id', async ({ params }) => {
    await mockDelay('read')
    const dashboard = dashboards.find((d) => d.id === params.id)

    if (!dashboard) {
      return HttpResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: dashboard })
  }),

  // ==================== ANALYTICS ====================

  // Get analytics overview
  http.get('/api/reports/analytics/overview', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: getAnalyticsOverview() })
  }),

  // Get academic analytics
  http.get('/api/reports/analytics/academic', async () => {
    await mockDelay('write')
    return HttpResponse.json({ data: getAcademicAnalytics() })
  }),

  // Get financial analytics
  http.get('/api/reports/analytics/financial', async () => {
    await mockDelay('write')
    return HttpResponse.json({ data: getFinancialAnalytics() })
  }),

  // Get attendance analytics
  http.get('/api/reports/analytics/attendance', async () => {
    await mockDelay('write')
    return HttpResponse.json({ data: getAttendanceAnalytics() })
  }),

  // ==================== EXPORT ====================

  // Export data (simulated)
  http.post('/api/reports/export', async ({ request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as { type: string; format: string; data: unknown }

    return HttpResponse.json({
      data: {
        downloadUrl: `/exports/${generateId()}.${body.format}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      },
    })
  }),
]
