import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import { faker } from '@faker-js/faker'
import {
  announcements,
  circulars,
  conversations,
  messages,
  surveys,
  emergencyAlerts,
  events,
} from '../data/communication.data'
import {
  Announcement,
  AnnouncementFilters,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  Circular,
  CircularFilters,
  CreateCircularRequest,
  UpdateCircularRequest,
  Conversation,
  ConversationFilters,
  Message,
  SendMessageRequest,
  Survey,
  SurveyFilters,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  SurveyResponse,
  SurveyAnswer,
  SubmitSurveyResponseRequest,
  EmergencyAlert,
  EmergencyAlertFilters,
  CreateEmergencyAlertRequest,
  UpdateEmergencyAlertRequest,
  Event,
  EventFilters,
  CreateEventRequest,
  UpdateEventRequest,
  CommunicationStats,
} from '@/features/communication/types/communication.types'

const API_BASE = '/api/communication'

// ===== Announcements Handlers =====
const announcementsHandlers = [
  // Get announcements list
  http.get(`${API_BASE}/announcements`, async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search')
    const priority = url.searchParams.get('priority')
    const status = url.searchParams.get('status')

    let filtered = [...announcements]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.content.toLowerCase().includes(searchLower)
      )
    }

    if (priority) {
      filtered = filtered.filter((a) => a.priority === priority)
    }

    if (status) {
      filtered = filtered.filter((a) => a.status === status)
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = filtered.slice(offset, offset + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Get single announcement
  http.get(`${API_BASE}/announcements/:id`, async ({ params }) => {
    await mockDelay('read')
    const announcement = announcements.find((a) => a.id === params.id)

    if (!announcement) {
      return HttpResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: announcement })
  }),

  // Create announcement
  http.post(`${API_BASE}/announcements`, async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateAnnouncementRequest

    const newAnnouncement: Announcement = {
      id: faker.string.uuid(),
      title: body.title,
      content: body.content,
      priority: body.priority,
      status: body.scheduledAt ? 'scheduled' : 'draft',
      target: body.target,
      attachments: body.attachments?.map((a) => ({ ...a, id: faker.string.uuid() })) || [],
      scheduledAt: body.scheduledAt,
      expiresAt: body.expiresAt,
      createdBy: faker.string.uuid(),
      createdByName: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      acknowledgementRequired: body.acknowledgementRequired || false,
      acknowledgements: [],
    }

    announcements.unshift(newAnnouncement)
    return HttpResponse.json({ data: newAnnouncement }, { status: 201 })
  }),

  // Update announcement
  http.put(`${API_BASE}/announcements/:id`, async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateAnnouncementRequest
    const index = announcements.findIndex((a) => a.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    const updated: Announcement = {
      ...announcements[index],
      ...body,
      updatedAt: new Date().toISOString(),
      publishedAt: body.status === 'published' ? new Date().toISOString() : announcements[index].publishedAt,
      attachments: body.attachments
        ? body.attachments.map((a, i) => ({ ...a, id: `ATT${Date.now()}${i}` }))
        : announcements[index].attachments,
    }

    announcements[index] = updated
    return HttpResponse.json({ data: updated })
  }),

  // Delete announcement
  http.delete(`${API_BASE}/announcements/:id`, async ({ params }) => {
    await mockDelay('read')
    const index = announcements.findIndex((a) => a.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    announcements.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Acknowledge announcement
  http.post(`${API_BASE}/announcements/:id/acknowledge`, async ({ params }) => {
    await mockDelay('read')
    const announcement = announcements.find((a) => a.id === params.id)

    if (!announcement) {
      return HttpResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    announcement.acknowledgements.push({
      userId: faker.string.uuid(),
      userName: 'Current User',
      acknowledgedAt: new Date().toISOString(),
    })

    return HttpResponse.json({ success: true })
  }),
]

// ===== Messages Handlers =====
const messagesHandlers = [
  // Get conversations list
  http.get(`${API_BASE}/conversations`, async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search')
    const type = url.searchParams.get('type')

    let filtered = [...conversations]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(searchLower) ||
          c.participants.some((p) => p.userName.toLowerCase().includes(searchLower))
      )
    }

    if (type) {
      filtered = filtered.filter((c) => c.type === type)
    }

    // Sort by last message date
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = filtered.slice(offset, offset + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Get messages for a conversation
  http.get(`${API_BASE}/conversations/:id/messages`, async ({ params, request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')

    const conversationMessages = messages
      .filter((m) => m.conversationId === params.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    const total = conversationMessages.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = conversationMessages.slice(offset, offset + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Send message
  http.post(`${API_BASE}/messages`, async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as SendMessageRequest

    let conversationId = body.conversationId

    // Create new conversation if needed
    if (!conversationId && body.recipientIds) {
      const newConversation: Conversation = {
        id: faker.string.uuid(),
        participants: body.recipientIds.map((id) => ({
          userId: id,
          userName: faker.person.fullName(),
          userRole: 'parent',
          userAvatar: faker.image.avatar(),
          joinedAt: new Date().toISOString(),
        })),
        type: body.recipientIds.length > 1 ? 'group' : 'direct',
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      conversations.unshift(newConversation)
      conversationId = newConversation.id
    }

    const newMessage: Message = {
      id: faker.string.uuid(),
      conversationId: conversationId!,
      senderId: faker.string.uuid(),
      senderName: 'Current User',
      senderRole: 'teacher',
      content: body.content,
      attachments: body.attachments?.map((a) => ({ ...a, id: faker.string.uuid() })) || [],
      status: 'sent',
      createdAt: new Date().toISOString(),
    }

    messages.push(newMessage)

    // Update conversation
    const conv = conversations.find((c) => c.id === conversationId)
    if (conv) {
      conv.lastMessage = newMessage
      conv.updatedAt = new Date().toISOString()
    }

    return HttpResponse.json({ data: newMessage }, { status: 201 })
  }),
]

// ===== Circulars Handlers =====
const circularsHandlers = [
  // Get circulars list
  http.get(`${API_BASE}/circulars`, async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search')
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')

    let filtered = [...circulars]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.referenceNumber.toLowerCase().includes(searchLower)
      )
    }

    if (category) {
      filtered = filtered.filter((c) => c.category === category)
    }

    if (status) {
      filtered = filtered.filter((c) => c.status === status)
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = filtered.slice(offset, offset + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Get single circular
  http.get(`${API_BASE}/circulars/:id`, async ({ params }) => {
    await mockDelay('read')
    const circular = circulars.find((c) => c.id === params.id)

    if (!circular) {
      return HttpResponse.json({ error: 'Circular not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: circular })
  }),

  // Create circular
  http.post(`${API_BASE}/circulars`, async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateCircularRequest
    const refYear = new Date().getFullYear()

    const newCircular: Circular = {
      id: faker.string.uuid(),
      referenceNumber: `CIR/${refYear}/${faker.number.int({ min: 100, max: 999 })}`,
      title: body.title,
      content: body.content,
      category: body.category,
      status: 'draft',
      target: body.target,
      attachments: body.attachments?.map((a) => ({ ...a, id: faker.string.uuid() })) || [],
      createdBy: faker.string.uuid(),
      createdByName: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloadCount: 0,
    }

    circulars.unshift(newCircular)
    return HttpResponse.json({ data: newCircular }, { status: 201 })
  }),

  // Update circular
  http.put(`${API_BASE}/circulars/:id`, async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateCircularRequest
    const index = circulars.findIndex((c) => c.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Circular not found' }, { status: 404 })
    }

    const updated: Circular = {
      ...circulars[index],
      ...body,
      updatedAt: new Date().toISOString(),
      publishedAt: body.status === 'published' ? new Date().toISOString() : circulars[index].publishedAt,
      attachments: body.attachments
        ? body.attachments.map((a, i) => ({ ...a, id: `ATT${Date.now()}${i}` }))
        : circulars[index].attachments,
    }

    circulars[index] = updated
    return HttpResponse.json({ data: updated })
  }),

  // Delete circular
  http.delete(`${API_BASE}/circulars/:id`, async ({ params }) => {
    await mockDelay('read')
    const index = circulars.findIndex((c) => c.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Circular not found' }, { status: 404 })
    }

    circulars.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),
]

// ===== Surveys Handlers =====
const surveysHandlers = [
  // Get surveys list
  http.get(`${API_BASE}/surveys`, async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search')
    const status = url.searchParams.get('status')

    let filtered = [...surveys]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((s) => s.title.toLowerCase().includes(searchLower))
    }

    if (status) {
      filtered = filtered.filter((s) => s.status === status)
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = filtered.slice(offset, offset + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Get single survey
  http.get(`${API_BASE}/surveys/:id`, async ({ params }) => {
    await mockDelay('read')
    const survey = surveys.find((s) => s.id === params.id)

    if (!survey) {
      return HttpResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: survey })
  }),

  // Create survey
  http.post(`${API_BASE}/surveys`, async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateSurveyRequest

    const newSurvey: Survey = {
      id: faker.string.uuid(),
      title: body.title,
      description: body.description,
      status: 'draft',
      target: body.target,
      questions: body.questions.map((q, i) => ({ ...q, id: faker.string.uuid(), order: i + 1 })),
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      anonymous: body.anonymous || false,
      createdBy: faker.string.uuid(),
      createdByName: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
      totalTargeted: faker.number.int({ min: 50, max: 200 }),
    }

    surveys.unshift(newSurvey)
    return HttpResponse.json({ data: newSurvey }, { status: 201 })
  }),

  // Update survey
  http.put(`${API_BASE}/surveys/:id`, async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateSurveyRequest
    const index = surveys.findIndex((s) => s.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    const updated = {
      ...surveys[index],
      ...body,
      questions: body.questions
        ? body.questions.map((q, i) => ({ ...q, id: faker.string.uuid(), order: i + 1 }))
        : surveys[index].questions,
      updatedAt: new Date().toISOString(),
    }

    surveys[index] = updated
    return HttpResponse.json({ data: updated })
  }),

  // Delete survey
  http.delete(`${API_BASE}/surveys/:id`, async ({ params }) => {
    await mockDelay('read')
    const index = surveys.findIndex((s) => s.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    surveys.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Submit survey response
  http.post(`${API_BASE}/surveys/:id/responses`, async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as SubmitSurveyResponseRequest
    const survey = surveys.find((s) => s.id === params.id)

    if (!survey) {
      return HttpResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    survey.responseCount += 1

    const response: SurveyResponse = {
      id: faker.string.uuid(),
      surveyId: survey.id,
      respondentId: survey.anonymous ? undefined : faker.string.uuid(),
      respondentName: survey.anonymous ? undefined : 'Current User',
      answers: body.answers as unknown as SurveyAnswer[],
      submittedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: response }, { status: 201 })
  }),

  // Get survey responses
  http.get(`${API_BASE}/surveys/:id/responses`, async ({ params, request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    const survey = surveys.find((s) => s.id === params.id)
    if (!survey) {
      return HttpResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Generate mock responses
    const responses: SurveyResponse[] = Array.from({ length: survey.responseCount }, () => ({
      id: faker.string.uuid(),
      surveyId: survey.id,
      respondentId: survey.anonymous ? undefined : faker.string.uuid(),
      respondentName: survey.anonymous ? undefined : faker.person.fullName(),
      answers: survey.questions.map((q) => ({
        questionId: q.id,
        value:
          q.type === 'rating'
            ? faker.number.int({ min: 1, max: 5 })
            : q.type === 'scale'
            ? faker.number.int({ min: 1, max: 10 })
            : q.type === 'multiple_choice'
            ? faker.helpers.arrayElements(q.options || [], { min: 1, max: 2 })
            : q.type === 'single_choice'
            ? faker.helpers.arrayElement(q.options || [''])
            : faker.lorem.sentence(),
      })),
      submittedAt: faker.date.recent({ days: 30 }).toISOString(),
    }))

    const total = responses.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = responses.slice(offset, offset + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),
]

// ===== Emergency Alerts Handlers =====
const alertsHandlers = [
  // Get alerts list
  http.get(`${API_BASE}/alerts`, async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search')
    const severity = url.searchParams.get('severity')
    const status = url.searchParams.get('status')

    let filtered = [...emergencyAlerts]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.message.toLowerCase().includes(searchLower)
      )
    }

    if (severity) {
      filtered = filtered.filter((a) => a.severity === severity)
    }

    if (status) {
      filtered = filtered.filter((a) => a.status === status)
    }

    // Sort active first, then by date
    filtered.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1
      if (a.status !== 'active' && b.status === 'active') return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = filtered.slice(offset, offset + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Get single alert
  http.get(`${API_BASE}/alerts/:id`, async ({ params }) => {
    await mockDelay('read')
    const alert = emergencyAlerts.find((a) => a.id === params.id)

    if (!alert) {
      return HttpResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: alert })
  }),

  // Create alert
  http.post(`${API_BASE}/alerts`, async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateEmergencyAlertRequest

    const newAlert: EmergencyAlert = {
      id: faker.string.uuid(),
      title: body.title,
      message: body.message,
      severity: body.severity,
      status: 'active',
      target: body.target,
      channels: body.channels,
      instructions: body.instructions,
      createdBy: faker.string.uuid(),
      createdByName: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      acknowledgements: [],
    }

    emergencyAlerts.unshift(newAlert)
    return HttpResponse.json({ data: newAlert }, { status: 201 })
  }),

  // Update alert
  http.put(`${API_BASE}/alerts/:id`, async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateEmergencyAlertRequest
    const index = emergencyAlerts.findIndex((a) => a.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    const updated = {
      ...emergencyAlerts[index],
      ...body,
      updatedAt: new Date().toISOString(),
      resolvedAt: body.status === 'resolved' ? new Date().toISOString() : emergencyAlerts[index].resolvedAt,
      resolvedBy: body.status === 'resolved' ? 'Current User' : emergencyAlerts[index].resolvedBy,
    }

    emergencyAlerts[index] = updated
    return HttpResponse.json({ data: updated })
  }),

  // Acknowledge alert
  http.post(`${API_BASE}/alerts/:id/acknowledge`, async ({ params, request }) => {
    await mockDelay('read')
    const alert = emergencyAlerts.find((a) => a.id === params.id)
    const body = (await request.json()) as { status?: 'safe' | 'need_help'; location?: string }

    if (!alert) {
      return HttpResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    alert.acknowledgements.push({
      userId: faker.string.uuid(),
      userName: 'Current User',
      acknowledgedAt: new Date().toISOString(),
      status: body.status || 'safe',
      location: body.location,
    })

    return HttpResponse.json({ success: true })
  }),
]

// ===== Events Handlers =====
const eventsHandlers = [
  // Get events list
  http.get(`${API_BASE}/events`, async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search')
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')

    let filtered = [...events]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((e) => e.title.toLowerCase().includes(searchLower))
    }

    if (type) {
      filtered = filtered.filter((e) => e.type === type)
    }

    if (status) {
      filtered = filtered.filter((e) => e.status === status)
    }

    // Sort by date
    filtered.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = filtered.slice(offset, offset + limit)

    return HttpResponse.json({
      data,
      meta: { total, page, limit, totalPages },
    })
  }),

  // Get single event
  http.get(`${API_BASE}/events/:id`, async ({ params }) => {
    await mockDelay('read')
    const event = events.find((e) => e.id === params.id)

    if (!event) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: event })
  }),

  // Create event
  http.post(`${API_BASE}/events`, async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateEventRequest

    const newEvent: Event = {
      id: faker.string.uuid(),
      title: body.title,
      description: body.description,
      type: body.type,
      status: 'upcoming',
      target: body.target,
      venue: body.venue,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      registrationRequired: body.registrationRequired || false,
      registrationDeadline: body.registrationDeadline,
      maxAttendees: body.maxAttendees,
      attachments: body.attachments?.map((a) => ({ ...a, id: faker.string.uuid() })) || [],
      createdBy: faker.string.uuid(),
      createdByName: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      registrations: [],
    }

    events.unshift(newEvent)
    return HttpResponse.json({ data: newEvent }, { status: 201 })
  }),

  // Update event
  http.put(`${API_BASE}/events/:id`, async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateEventRequest
    const index = events.findIndex((e) => e.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const updated: Event = {
      ...events[index],
      ...body,
      updatedAt: new Date().toISOString(),
      attachments: body.attachments
        ? body.attachments.map((a, i) => ({ ...a, id: `ATT${Date.now()}${i}` }))
        : events[index].attachments,
    }

    events[index] = updated
    return HttpResponse.json({ data: updated })
  }),

  // Delete event
  http.delete(`${API_BASE}/events/:id`, async ({ params }) => {
    await mockDelay('read')
    const index = events.findIndex((e) => e.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    events.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Register for event
  http.post(`${API_BASE}/events/:id/register`, async ({ params }) => {
    await mockDelay('read')
    const event = events.find((e) => e.id === params.id)

    if (!event) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.maxAttendees && event.registrations.length >= event.maxAttendees) {
      return HttpResponse.json({ error: 'Event is full' }, { status: 400 })
    }

    event.registrations.push({
      userId: faker.string.uuid(),
      userName: 'Current User',
      userRole: 'teacher',
      registeredAt: new Date().toISOString(),
    })

    return HttpResponse.json({ success: true })
  }),

  // Cancel registration
  http.delete(`${API_BASE}/events/:id/register`, async ({ params }) => {
    await mockDelay('read')
    const event = events.find((e) => e.id === params.id)

    if (!event) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // In real app, we'd find the specific user's registration
    event.registrations.pop()

    return HttpResponse.json({ success: true })
  }),
]

// ===== Stats Handler =====
const statsHandler = [
  http.get(`${API_BASE}/stats`, async () => {
    await mockDelay('read')

    const stats: CommunicationStats = {
      announcements: {
        total: announcements.length,
        published: announcements.filter((a) => a.status === 'published').length,
        draft: announcements.filter((a) => a.status === 'draft').length,
        scheduled: announcements.filter((a) => a.status === 'scheduled').length,
      },
      messages: {
        totalConversations: conversations.length,
        unreadCount: conversations.reduce((acc, c) => acc + c.unreadCount, 0),
        sentToday: messages.filter(
          (m) => new Date(m.createdAt).toDateString() === new Date().toDateString()
        ).length,
      },
      circulars: {
        total: circulars.length,
        published: circulars.filter((c) => c.status === 'published').length,
        totalDownloads: circulars.reduce((acc, c) => acc + c.downloadCount, 0),
      },
      surveys: {
        active: surveys.filter((s) => s.status === 'active').length,
        totalResponses: surveys.reduce((acc, s) => acc + s.responseCount, 0),
        pendingResponses: surveys
          .filter((s) => s.status === 'active')
          .reduce((acc, s) => acc + (s.totalTargeted - s.responseCount), 0),
      },
      alerts: {
        active: emergencyAlerts.filter((a) => a.status === 'active').length,
        resolvedThisMonth: emergencyAlerts.filter(
          (a) =>
            a.status === 'resolved' &&
            a.resolvedAt &&
            new Date(a.resolvedAt).getMonth() === new Date().getMonth()
        ).length,
      },
      events: {
        upcoming: events.filter((e) => e.status === 'upcoming').length,
        totalRegistrations: events.reduce((acc, e) => acc + e.registrations.length, 0),
      },
    }

    return HttpResponse.json({ data: stats })
  }),
]

export const communicationHandlers = [
  ...announcementsHandlers,
  ...messagesHandlers,
  ...circularsHandlers,
  ...surveysHandlers,
  ...alertsHandlers,
  ...eventsHandlers,
  ...statsHandler,
]
