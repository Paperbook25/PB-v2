import type { Request, Response, NextFunction } from 'express'
import * as communicationService from '../services/communication.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Communication operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Announcements ====================

export async function listAnnouncements(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      type: req.query.type as string | undefined,
      published: req.query.published as string | undefined,
      search: req.query.search as string | undefined,
    }
    const result = await communicationService.listAnnouncements(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    const announcement = await communicationService.getAnnouncementById(getSchoolId(req), String(req.params.id))
    res.json({ data: announcement })
  } catch (err) { next(err) }
}

export async function createAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    const announcement = await communicationService.createAnnouncement(getSchoolId(req), req.body)
    res.status(201).json({ data: announcement })
  } catch (err) { next(err) }
}

export async function updateAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    const announcement = await communicationService.updateAnnouncement(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: announcement })
  } catch (err) { next(err) }
}

export async function publishAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    const publishedBy = req.user?.name || 'Unknown'
    const announcement = await communicationService.publishAnnouncement(getSchoolId(req), String(req.params.id), publishedBy)
    res.json({ data: announcement })
  } catch (err) { next(err) }
}

export async function deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await communicationService.deleteAnnouncement(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Circulars ====================

export async function listCirculars(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      category: req.query.category as string | undefined,
      search: req.query.search as string | undefined,
    }
    const result = await communicationService.listCirculars(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getCircular(req: Request, res: Response, next: NextFunction) {
  try {
    const circular = await communicationService.getCircularById(getSchoolId(req), String(req.params.id))
    res.json({ data: circular })
  } catch (err) { next(err) }
}

export async function createCircular(req: Request, res: Response, next: NextFunction) {
  try {
    const circular = await communicationService.createCircular(getSchoolId(req), req.body)
    res.status(201).json({ data: circular })
  } catch (err) { next(err) }
}

export async function updateCircular(req: Request, res: Response, next: NextFunction) {
  try {
    const circular = await communicationService.updateCircular(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: circular })
  } catch (err) { next(err) }
}

export async function deleteCircular(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await communicationService.deleteCircular(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Surveys ====================

export async function listSurveys(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    }
    const result = await communicationService.listSurveys(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getSurvey(req: Request, res: Response, next: NextFunction) {
  try {
    const survey = await communicationService.getSurvey(getSchoolId(req), String(req.params.id))
    res.json({ data: survey })
  } catch (err) { next(err) }
}

export async function createSurvey(req: Request, res: Response, next: NextFunction) {
  try {
    const data = { ...req.body, createdBy: req.user?.name || undefined }
    const survey = await communicationService.createSurvey(getSchoolId(req), data)
    res.status(201).json({ data: survey })
  } catch (err) { next(err) }
}

export async function updateSurvey(req: Request, res: Response, next: NextFunction) {
  try {
    const survey = await communicationService.updateSurvey(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: survey })
  } catch (err) { next(err) }
}

export async function deleteSurvey(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await communicationService.deleteSurvey(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function submitSurveyResponse(req: Request, res: Response, next: NextFunction) {
  try {
    const response = await communicationService.submitSurveyResponse(
      getSchoolId(req),
      String(req.params.id),
      req.body,
    )
    res.status(201).json({ data: response })
  } catch (err) { next(err) }
}

export async function getSurveyResponses(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await communicationService.getSurveyResponses(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Events ====================

export async function listEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      eventType: req.query.eventType as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      search: req.query.search as string | undefined,
    }
    const result = await communicationService.listEvents(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await communicationService.getEvent(getSchoolId(req), String(req.params.id))
    res.json({ data: event })
  } catch (err) { next(err) }
}

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = { ...req.body, createdBy: req.user?.name || undefined }
    const event = await communicationService.createEvent(getSchoolId(req), data)
    res.status(201).json({ data: event })
  } catch (err) { next(err) }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await communicationService.updateEvent(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: event })
  } catch (err) { next(err) }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await communicationService.deleteEvent(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function registerForEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || req.body.userId
    const userName = req.user?.name || req.body.userName
    if (!userId) throw AppError.badRequest('User ID is required')

    const registration = await communicationService.registerForEvent(
      getSchoolId(req),
      String(req.params.id),
      userId,
      userName,
    )
    res.status(201).json({ data: registration })
  } catch (err) { next(err) }
}

export async function cancelEventRegistration(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || req.body.userId
    if (!userId) throw AppError.badRequest('User ID is required')

    const registration = await communicationService.cancelEventRegistration(
      getSchoolId(req),
      String(req.params.id),
      userId,
    )
    res.json({ data: registration })
  } catch (err) { next(err) }
}

// ==================== Communication Stats ====================

export async function getCommunicationStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await communicationService.getCommunicationStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}
