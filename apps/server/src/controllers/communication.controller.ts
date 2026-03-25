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
