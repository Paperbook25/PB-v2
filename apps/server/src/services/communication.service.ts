import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Types ====================

interface ListSurveysQuery {
  page?: number
  limit?: number
  status?: string
  search?: string
}

interface CreateSurveyInput {
  title: string
  description?: string
  status?: string
  targetAudience?: string
  startDate?: string
  endDate?: string
  questions?: unknown[]
  createdBy?: string
}

interface UpdateSurveyInput {
  title?: string
  description?: string
  status?: string
  targetAudience?: string
  startDate?: string
  endDate?: string
  questions?: unknown[]
}

interface SubmitSurveyResponseInput {
  respondentId?: string
  respondentName?: string
  answers: Record<string, unknown>
}

interface ListEventsQuery {
  page?: number
  limit?: number
  eventType?: string
  startDate?: string
  endDate?: string
  search?: string
}

interface CreateEventInput {
  title: string
  description?: string
  eventType?: string
  startDate: string
  endDate?: string
  location?: string
  isAllDay?: boolean
  targetAudience?: string
  maxAttendees?: number
  createdBy?: string
}

interface UpdateEventInput {
  title?: string
  description?: string
  eventType?: string
  startDate?: string
  endDate?: string
  location?: string
  isAllDay?: boolean
  targetAudience?: string
  maxAttendees?: number
}

interface ListAnnouncementsQuery {
  page?: number
  limit?: number
  type?: string
  published?: string
  search?: string
  audience?: string // Filter by targetAudience (e.g., 'students', 'parents', 'staff')
}

interface CreateAnnouncementInput {
  title: string
  body: string
  type?: string
  priority?: string
  targetAudience?: string
  targetClasses?: string[]
  attachmentUrl?: string
  expiresAt?: string
}

interface UpdateAnnouncementInput {
  title?: string
  body?: string
  type?: string
  priority?: string
  targetAudience?: string
  targetClasses?: string[]
  attachmentUrl?: string
  expiresAt?: string
}

interface ListCircularsQuery {
  page?: number
  limit?: number
  category?: string
  search?: string
}

interface CreateCircularInput {
  title: string
  body: string
  category?: string
  fileUrl?: string
  issuedBy?: string
  issuedDate?: string
  targetAudience?: string
}

interface UpdateCircularInput {
  title?: string
  body?: string
  category?: string
  fileUrl?: string
  issuedBy?: string
  issuedDate?: string
  targetAudience?: string
}

// ==================== Announcements ====================

export async function listAnnouncements(schoolId: string, query: ListAnnouncementsQuery) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.type) where.type = query.type
  if (query.published === 'true') where.isPublished = true
  if (query.published === 'false') where.isPublished = false
  if (query.audience) where.targetAudience = { in: ['all', query.audience] }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { body: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.announcement.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.announcement.count({ where: where as any }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getAnnouncementById(schoolId: string, id: string) {
  const announcement = await prisma.announcement.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!announcement) throw AppError.notFound('Announcement not found')
  return announcement
}

export async function createAnnouncement(schoolId: string, input: CreateAnnouncementInput) {
  return prisma.announcement.create({
    data: {
      organizationId: schoolId,
      title: input.title,
      body: input.body,
      type: input.type ?? 'general',
      priority: input.priority ?? 'normal',
      targetAudience: input.targetAudience ?? 'all',
      targetClasses: input.targetClasses ?? undefined,
      attachmentUrl: input.attachmentUrl ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  })
}

export async function updateAnnouncement(schoolId: string, id: string, input: UpdateAnnouncementInput) {
  const existing = await prisma.announcement.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Announcement not found')

  return prisma.announcement.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.targetAudience !== undefined && { targetAudience: input.targetAudience }),
      ...(input.targetClasses !== undefined && { targetClasses: input.targetClasses }),
      ...(input.attachmentUrl !== undefined && { attachmentUrl: input.attachmentUrl }),
      ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt ? new Date(input.expiresAt) : null }),
    },
  })
}

export async function publishAnnouncement(schoolId: string, id: string, publishedBy: string) {
  const existing = await prisma.announcement.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Announcement not found')

  return prisma.announcement.update({
    where: { id },
    data: {
      isPublished: true,
      publishedAt: new Date(),
      publishedBy,
    },
  })
}

export async function deleteAnnouncement(schoolId: string, id: string) {
  const existing = await prisma.announcement.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Announcement not found')

  await prisma.announcement.delete({ where: { id } })
  return { success: true }
}

// ==================== Circulars ====================

async function generateCircularNumber(schoolId: string): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.circular.count({
    where: { organizationId: schoolId },
  })
  return `CIR-${year}-${String(count + 1).padStart(4, '0')}`
}

export async function listCirculars(schoolId: string, query: ListCircularsQuery) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.category) where.category = query.category
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { circularNumber: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.circular.findMany({
      where: where as any,
      orderBy: { issuedDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.circular.count({ where: where as any }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getCircularById(schoolId: string, id: string) {
  const circular = await prisma.circular.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!circular) throw AppError.notFound('Circular not found')
  return circular
}

export async function createCircular(schoolId: string, input: CreateCircularInput) {
  const circularNumber = await generateCircularNumber(schoolId)

  return prisma.circular.create({
    data: {
      organizationId: schoolId,
      circularNumber,
      title: input.title,
      body: input.body,
      category: input.category ?? 'academic',
      fileUrl: input.fileUrl ?? null,
      issuedBy: input.issuedBy ?? null,
      issuedDate: input.issuedDate ? new Date(input.issuedDate) : new Date(),
      targetAudience: input.targetAudience ?? 'all',
    },
  })
}

export async function updateCircular(schoolId: string, id: string, input: UpdateCircularInput) {
  const existing = await prisma.circular.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Circular not found')

  return prisma.circular.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.fileUrl !== undefined && { fileUrl: input.fileUrl }),
      ...(input.issuedBy !== undefined && { issuedBy: input.issuedBy }),
      ...(input.issuedDate !== undefined && { issuedDate: new Date(input.issuedDate) }),
      ...(input.targetAudience !== undefined && { targetAudience: input.targetAudience }),
    },
  })
}

export async function deleteCircular(schoolId: string, id: string) {
  const existing = await prisma.circular.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Circular not found')

  await prisma.circular.delete({ where: { id } })
  return { success: true }
}

// ==================== Surveys ====================

export async function listSurveys(schoolId: string, query: ListSurveysQuery) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.status) where.status = query.status
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.survey.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { _count: { select: { responses: true } } },
    }),
    prisma.survey.count({ where: where as any }),
  ])

  return {
    data: data.map(({ _count, ...survey }) => ({
      ...survey,
      responseCount: _count.responses,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getSurvey(schoolId: string, id: string) {
  const survey = await prisma.survey.findFirst({
    where: { id, organizationId: schoolId },
    include: { _count: { select: { responses: true } } },
  })
  if (!survey) throw AppError.notFound('Survey not found')

  const { _count, ...rest } = survey
  return { ...rest, responseCount: _count.responses }
}

export async function createSurvey(schoolId: string, input: CreateSurveyInput) {
  return prisma.survey.create({
    data: {
      organizationId: schoolId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'draft',
      targetAudience: input.targetAudience ?? 'all',
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      questions: (input.questions as any) ?? undefined,
      createdBy: input.createdBy ?? null,
    },
  })
}

export async function updateSurvey(schoolId: string, id: string, input: UpdateSurveyInput) {
  const existing = await prisma.survey.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Survey not found')

  return prisma.survey.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.targetAudience !== undefined && { targetAudience: input.targetAudience }),
      ...(input.startDate !== undefined && { startDate: input.startDate ? new Date(input.startDate) : null }),
      ...(input.endDate !== undefined && { endDate: input.endDate ? new Date(input.endDate) : null }),
      ...(input.questions !== undefined && { questions: input.questions as any }),
    },
  })
}

export async function deleteSurvey(schoolId: string, id: string) {
  const existing = await prisma.survey.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Survey not found')

  await prisma.survey.delete({ where: { id } })
  return { success: true }
}

export async function submitSurveyResponse(schoolId: string, surveyId: string, input: SubmitSurveyResponseInput) {
  const survey = await prisma.survey.findFirst({
    where: { id: surveyId, organizationId: schoolId },
  })
  if (!survey) throw AppError.notFound('Survey not found')
  if (survey.status !== 'active') throw AppError.badRequest('Survey is not currently active')

  if (survey.endDate && new Date() > new Date(survey.endDate)) {
    throw AppError.badRequest('Survey has ended')
  }

  return prisma.surveyResponse.create({
    data: {
      surveyId,
      respondentId: input.respondentId ?? null,
      respondentName: input.respondentName ?? null,
      answers: input.answers as any,
    },
  })
}

export async function getSurveyResponses(schoolId: string, surveyId: string) {
  const survey = await prisma.survey.findFirst({
    where: { id: surveyId, organizationId: schoolId },
  })
  if (!survey) throw AppError.notFound('Survey not found')

  const responses = await prisma.surveyResponse.findMany({
    where: { surveyId },
    orderBy: { submittedAt: 'desc' },
  })

  return { data: responses, total: responses.length }
}

// ==================== Events ====================

export async function listEvents(schoolId: string, query: ListEventsQuery) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.eventType) where.eventType = query.eventType
  if (query.startDate || query.endDate) {
    where.startDate = {
      ...(query.startDate && { gte: new Date(query.startDate) }),
      ...(query.endDate && { lte: new Date(query.endDate) }),
    }
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.schoolEvent.findMany({
      where: where as any,
      orderBy: { startDate: 'asc' },
      skip,
      take: limit,
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.schoolEvent.count({ where: where as any }),
  ])

  return {
    data: data.map(({ _count, ...event }) => ({
      ...event,
      registrationCount: _count.registrations,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getEvent(schoolId: string, id: string) {
  const event = await prisma.schoolEvent.findFirst({
    where: { id, organizationId: schoolId },
    include: { _count: { select: { registrations: true } } },
  })
  if (!event) throw AppError.notFound('Event not found')

  const { _count, ...rest } = event
  return { ...rest, registrationCount: _count.registrations }
}

export async function createEvent(schoolId: string, input: CreateEventInput) {
  return prisma.schoolEvent.create({
    data: {
      organizationId: schoolId,
      title: input.title,
      description: input.description ?? null,
      eventType: input.eventType ?? 'general',
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      location: input.location ?? null,
      isAllDay: input.isAllDay ?? false,
      targetAudience: input.targetAudience ?? 'all',
      maxAttendees: input.maxAttendees ?? null,
      createdBy: input.createdBy ?? null,
    },
  })
}

export async function updateEvent(schoolId: string, id: string, input: UpdateEventInput) {
  const existing = await prisma.schoolEvent.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Event not found')

  return prisma.schoolEvent.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.eventType !== undefined && { eventType: input.eventType }),
      ...(input.startDate !== undefined && { startDate: new Date(input.startDate) }),
      ...(input.endDate !== undefined && { endDate: input.endDate ? new Date(input.endDate) : null }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.isAllDay !== undefined && { isAllDay: input.isAllDay }),
      ...(input.targetAudience !== undefined && { targetAudience: input.targetAudience }),
      ...(input.maxAttendees !== undefined && { maxAttendees: input.maxAttendees }),
    },
  })
}

export async function deleteEvent(schoolId: string, id: string) {
  const existing = await prisma.schoolEvent.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Event not found')

  await prisma.schoolEvent.delete({ where: { id } })
  return { success: true }
}

export async function registerForEvent(schoolId: string, eventId: string, userId: string, userName?: string) {
  const event = await prisma.schoolEvent.findFirst({
    where: { id: eventId, organizationId: schoolId },
  })
  if (!event) throw AppError.notFound('Event not found')

  if (event.maxAttendees) {
    const currentCount = await prisma.eventRegistration.count({
      where: { eventId, status: 'registered' },
    })
    if (currentCount >= event.maxAttendees) {
      throw AppError.badRequest('Event has reached maximum capacity')
    }
  }

  // Upsert: if user cancelled before, re-register
  return prisma.eventRegistration.upsert({
    where: { eventId_userId: { eventId, userId } },
    create: {
      eventId,
      userId,
      userName: userName ?? null,
      status: 'registered',
    },
    update: {
      status: 'registered',
      userName: userName ?? undefined,
    },
  })
}

export async function cancelEventRegistration(schoolId: string, eventId: string, userId: string) {
  const event = await prisma.schoolEvent.findFirst({
    where: { id: eventId, organizationId: schoolId },
  })
  if (!event) throw AppError.notFound('Event not found')

  const registration = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId } },
  })
  if (!registration) throw AppError.notFound('Registration not found')

  return prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { status: 'cancelled' },
  })
}

// ==================== Communication Stats ====================

export async function getCommunicationStats(schoolId: string) {
  const [announcements, circulars, surveys, events] = await Promise.all([
    prisma.announcement.count({ where: { organizationId: schoolId } }),
    prisma.circular.count({ where: { organizationId: schoolId } }),
    prisma.survey.count({ where: { organizationId: schoolId } }),
    prisma.schoolEvent.count({ where: { organizationId: schoolId } }),
  ])

  const [activeSurveys, upcomingEvents] = await Promise.all([
    prisma.survey.count({ where: { organizationId: schoolId, status: 'active' } }),
    prisma.schoolEvent.count({
      where: { organizationId: schoolId, startDate: { gte: new Date() } },
    }),
  ])

  return {
    announcements,
    circulars,
    surveys: { total: surveys, active: activeSurveys },
    events: { total: events, upcoming: upcomingEvents },
  }
}
