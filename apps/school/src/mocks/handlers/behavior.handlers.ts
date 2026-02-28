import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import { faker } from '@faker-js/faker'
import {
  incidents,
  actions,
  behaviorPoints,
  detentions,
  getStudentBehaviorSummary,
} from '../data/behavior.data'
import {
  Incident,
  IncidentFilters,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  DisciplinaryAction,
  ActionFilters,
  CreateActionRequest,
  UpdateActionRequest,
  BehaviorPoint,
  BehaviorPointFilters,
  CreateBehaviorPointRequest,
  Detention,
  DetentionFilters,
  CreateDetentionRequest,
  UpdateDetentionRequest,
  BehaviorStats,
  StudentBehaviorSummary,
} from '@/features/behavior/types/behavior.types'

const API_BASE = '/api/behavior'

// ===== Incidents Handlers =====
const incidentsHandlers = [
  // Get incidents list
  http.get(`${API_BASE}/incidents`, async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search')
    const studentId = url.searchParams.get('studentId')
    const category = url.searchParams.get('category')
    const severity = url.searchParams.get('severity')
    const status = url.searchParams.get('status')

    let filtered = [...incidents]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(searchLower) ||
          i.studentName.toLowerCase().includes(searchLower) ||
          i.description.toLowerCase().includes(searchLower)
      )
    }

    if (studentId) {
      filtered = filtered.filter((i) => i.studentId === studentId)
    }

    if (category) {
      filtered = filtered.filter((i) => i.category === category)
    }

    if (severity) {
      filtered = filtered.filter((i) => i.severity === severity)
    }

    if (status) {
      filtered = filtered.filter((i) => i.status === status)
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = filtered.slice(offset, offset + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Get single incident
  http.get(`${API_BASE}/incidents/:id`, async ({ params }) => {
    await mockDelay('read')
    const incident = incidents.find((i) => i.id === params.id)

    if (!incident) {
      return HttpResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: incident })
  }),

  // Create incident
  http.post(`${API_BASE}/incidents`, async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateIncidentRequest

    const newIncident: Incident = {
      id: faker.string.uuid(),
      studentId: body.studentId,
      studentName: faker.person.fullName(),
      studentClass: 'Class 10',
      studentSection: 'A',
      category: body.category,
      severity: body.severity,
      status: 'reported',
      title: body.title,
      description: body.description,
      location: body.location,
      incidentDate: body.incidentDate,
      incidentTime: body.incidentTime,
      witnesses: body.witnesses,
      attachments: body.attachments?.map((a) => ({ ...a, id: faker.string.uuid() })),
      reportedBy: faker.string.uuid(),
      reportedByName: 'Current User',
      reportedByRole: 'teacher',
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: [],
      parentNotified: false,
    }

    incidents.unshift(newIncident)
    return HttpResponse.json({ data: newIncident }, { status: 201 })
  }),

  // Update incident
  http.put(`${API_BASE}/incidents/:id`, async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateIncidentRequest
    const index = incidents.findIndex((i) => i.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    const updated: Incident = {
      ...incidents[index],
      ...body,
      updatedAt: new Date().toISOString(),
      resolution: body.resolution
        ? {
            ...body.resolution,
            resolvedAt: new Date().toISOString(),
          }
        : incidents[index].resolution,
      status: body.resolution ? 'resolved' : (body.status ?? incidents[index].status),
    }

    incidents[index] = updated
    return HttpResponse.json({ data: updated })
  }),

  // Delete incident
  http.delete(`${API_BASE}/incidents/:id`, async ({ params }) => {
    await mockDelay('read')
    const index = incidents.findIndex((i) => i.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    incidents.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Notify parent
  http.post(`${API_BASE}/incidents/:id/notify-parent`, async ({ params }) => {
    await mockDelay('read')
    const incident = incidents.find((i) => i.id === params.id)

    if (!incident) {
      return HttpResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    incident.parentNotified = true
    incident.parentNotifiedAt = new Date().toISOString()

    return HttpResponse.json({ success: true })
  }),
]

// ===== Actions Handlers =====
const actionsHandlers = [
  // Get actions list
  http.get(`${API_BASE}/actions`, async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search')
    const studentId = url.searchParams.get('studentId')
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')

    let filtered = [...actions]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.studentName.toLowerCase().includes(searchLower) ||
          a.description.toLowerCase().includes(searchLower)
      )
    }

    if (studentId) {
      filtered = filtered.filter((a) => a.studentId === studentId)
    }

    if (type) {
      filtered = filtered.filter((a) => a.type === type)
    }

    if (status) {
      filtered = filtered.filter((a) => a.status === status)
    }

    filtered.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = filtered.slice(offset, offset + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Get single action
  http.get(`${API_BASE}/actions/:id`, async ({ params }) => {
    await mockDelay('read')
    const action = actions.find((a) => a.id === params.id)

    if (!action) {
      return HttpResponse.json({ error: 'Action not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: action })
  }),

  // Create action
  http.post(`${API_BASE}/actions`, async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateActionRequest

    const newAction: DisciplinaryAction = {
      id: faker.string.uuid(),
      incidentId: body.incidentId || '',
      studentId: body.studentId,
      studentName: faker.person.fullName(),
      studentClass: 'Class 10',
      type: body.type,
      status: 'pending',
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      durationDays: body.durationDays,
      issuedBy: faker.string.uuid(),
      issuedByName: 'Current User',
      issuedAt: new Date().toISOString(),
      notes: body.notes,
      parentAcknowledged: false,
    }

    actions.unshift(newAction)

    // Link to incident if provided
    if (body.incidentId) {
      const incident = incidents.find((i) => i.id === body.incidentId)
      if (incident) {
        incident.actions.push(newAction)
      }
    }

    return HttpResponse.json({ data: newAction }, { status: 201 })
  }),

  // Update action
  http.put(`${API_BASE}/actions/:id`, async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateActionRequest
    const index = actions.findIndex((a) => a.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Action not found' }, { status: 404 })
    }

    const updated = {
      ...actions[index],
      ...body,
    }

    actions[index] = updated
    return HttpResponse.json({ data: updated })
  }),

  // Submit appeal
  http.post(`${API_BASE}/actions/:id/appeal`, async ({ params, request }) => {
    await mockDelay('write')
    const body = (await request.json()) as { reason: string }
    const action = actions.find((a) => a.id === params.id)

    if (!action) {
      return HttpResponse.json({ error: 'Action not found' }, { status: 404 })
    }

    action.status = 'appealed'
    action.appeal = {
      id: faker.string.uuid(),
      submittedBy: faker.string.uuid(),
      submittedByName: 'Parent Name',
      submittedAt: new Date().toISOString(),
      reason: body.reason,
      status: 'pending',
    }

    return HttpResponse.json({ data: action })
  }),
]

// ===== Behavior Points Handlers =====
const pointsHandlers = [
  // Get points list
  http.get(`${API_BASE}/points`, async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const studentId = url.searchParams.get('studentId')
    const type = url.searchParams.get('type')
    const category = url.searchParams.get('category')

    let filtered = [...behaviorPoints]

    if (studentId) {
      filtered = filtered.filter((p) => p.studentId === studentId)
    }

    if (type) {
      filtered = filtered.filter((p) => p.type === type)
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category)
    }

    filtered.sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = filtered.slice(offset, offset + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Create point
  http.post(`${API_BASE}/points`, async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as CreateBehaviorPointRequest

    const newPoint: BehaviorPoint = {
      id: faker.string.uuid(),
      studentId: body.studentId,
      studentName: faker.person.fullName(),
      studentClass: 'Class 10',
      type: body.type,
      category: body.category,
      points: body.type === 'negative' ? -Math.abs(body.points) : Math.abs(body.points),
      description: body.description,
      awardedBy: faker.string.uuid(),
      awardedByName: 'Current User',
      awardedAt: new Date().toISOString(),
    }

    behaviorPoints.unshift(newPoint)
    return HttpResponse.json({ data: newPoint }, { status: 201 })
  }),

  // Get student summary
  http.get(`${API_BASE}/students/:id/summary`, async ({ params }) => {
    await mockDelay('read')
    const summary = getStudentBehaviorSummary(params.id as string)
    return HttpResponse.json({ data: summary })
  }),

  // Get leaderboard
  http.get(`${API_BASE}/leaderboard`, async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'positive'
    const limit = parseInt(url.searchParams.get('limit') || '10')

    // Group points by student
    const studentPoints: Record<string, { id: string; name: string; class: string; total: number }> = {}

    behaviorPoints
      .filter((p) => type === 'all' || p.type === type)
      .forEach((p) => {
        if (!studentPoints[p.studentId]) {
          studentPoints[p.studentId] = {
            id: p.studentId,
            name: p.studentName,
            class: p.studentClass,
            total: 0,
          }
        }
        studentPoints[p.studentId].total += p.points
      })

    const leaderboard = Object.values(studentPoints)
      .sort((a, b) => (type === 'negative' ? a.total - b.total : b.total - a.total))
      .slice(0, limit)

    return HttpResponse.json({ data: leaderboard })
  }),
]

// ===== Detentions Handlers =====
const detentionsHandlers = [
  // Get detentions list
  http.get(`${API_BASE}/detentions`, async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const studentId = url.searchParams.get('studentId')
    const status = url.searchParams.get('status')
    const supervisorId = url.searchParams.get('supervisorId')

    let filtered = [...detentions]

    if (studentId) {
      filtered = filtered.filter((d) => d.studentId === studentId)
    }

    if (status) {
      filtered = filtered.filter((d) => d.status === status)
    }

    if (supervisorId) {
      filtered = filtered.filter((d) => d.supervisorId === supervisorId)
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = filtered.slice(offset, offset + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Create detention
  http.post(`${API_BASE}/detentions`, async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateDetentionRequest

    const newDetention: Detention = {
      id: faker.string.uuid(),
      studentId: body.studentId,
      studentName: faker.person.fullName(),
      studentClass: 'Class 10',
      actionId: body.actionId,
      incidentId: body.incidentId,
      reason: body.reason,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      location: body.location,
      supervisorId: body.supervisorId,
      supervisorName: faker.person.fullName(),
      status: 'scheduled',
      createdBy: faker.string.uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    detentions.unshift(newDetention)
    return HttpResponse.json({ data: newDetention }, { status: 201 })
  }),

  // Update detention
  http.put(`${API_BASE}/detentions/:id`, async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateDetentionRequest
    const index = detentions.findIndex((d) => d.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Detention not found' }, { status: 404 })
    }

    const updated = {
      ...detentions[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    detentions[index] = updated
    return HttpResponse.json({ data: updated })
  }),

  // Delete detention
  http.delete(`${API_BASE}/detentions/:id`, async ({ params }) => {
    await mockDelay('read')
    const index = detentions.findIndex((d) => d.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Detention not found' }, { status: 404 })
    }

    detentions.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),
]

// ===== Stats Handler =====
const statsHandler = [
  http.get(`${API_BASE}/stats`, async () => {
    await mockDelay('read')

    const incidentsByCategory = [
      'tardiness', 'dress_code', 'disruptive_behavior', 'bullying', 'fighting',
      'property_damage', 'academic_dishonesty', 'other'
    ].map(cat => ({
      category: cat as any,
      count: incidents.filter(i => i.category === cat).length,
    }))

    const incidentsBySeverity = ['minor', 'moderate', 'major', 'critical'].map(sev => ({
      severity: sev as any,
      count: incidents.filter(i => i.severity === sev).length,
    }))

    const actionsByType = [
      'verbal_warning', 'written_warning', 'counseling', 'detention', 'suspension', 'expulsion'
    ].map(type => ({
      type: type as any,
      count: actions.filter(a => a.type === type).length,
    }))

    // Get students with most positive points
    const studentPositivePoints: Record<string, { id: string; name: string; points: number }> = {}
    behaviorPoints.filter(p => p.type === 'positive').forEach(p => {
      if (!studentPositivePoints[p.studentId]) {
        studentPositivePoints[p.studentId] = { id: p.studentId, name: p.studentName, points: 0 }
      }
      studentPositivePoints[p.studentId].points += p.points
    })

    const topStudentsPositive = Object.values(studentPositivePoints)
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map(s => ({ studentId: s.id, studentName: s.name, points: s.points }))

    // Get at-risk students (many incidents or negative points)
    const studentIncidentCount: Record<string, number> = {}
    incidents.forEach(i => {
      studentIncidentCount[i.studentId] = (studentIncidentCount[i.studentId] || 0) + 1
    })

    const studentsAtRisk = Object.entries(studentIncidentCount)
      .filter(([_, count]) => count >= 3)
      .slice(0, 5)
      .map(([id]) => getStudentBehaviorSummary(id))

    const stats: BehaviorStats = {
      totalIncidents: incidents.length,
      incidentsByCategory,
      incidentsBySeverity,
      incidentsByMonth: [], // Would calculate from actual dates
      totalActions: actions.length,
      actionsByType,
      totalPositivePoints: behaviorPoints.filter(p => p.type === 'positive').reduce((sum, p) => sum + p.points, 0),
      totalNegativePoints: Math.abs(behaviorPoints.filter(p => p.type === 'negative').reduce((sum, p) => sum + p.points, 0)),
      topStudentsPositive,
      studentsAtRisk,
      detentionStats: {
        scheduled: detentions.filter(d => d.status === 'scheduled').length,
        attended: detentions.filter(d => d.status === 'attended').length,
        missed: detentions.filter(d => d.status === 'missed').length,
      },
    }

    return HttpResponse.json({ data: stats })
  }),
]

export const behaviorHandlers = [
  ...incidentsHandlers,
  ...actionsHandlers,
  ...pointsHandlers,
  ...detentionsHandlers,
  ...statsHandler,
]
