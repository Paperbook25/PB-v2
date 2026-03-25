import type { Request, Response, NextFunction } from 'express'
import * as scholarshipService from '../services/scholarship.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Scholarship operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Scholarships ====================

export async function listScholarships(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, type, isActive, academicYear } = req.query
    const result = await scholarshipService.listScholarships(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      type: type as string | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      academicYear: academicYear as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getScholarship(req: Request, res: Response, next: NextFunction) {
  try {
    const scholarship = await scholarshipService.getScholarshipById(
      getSchoolId(req),
      String(req.params.id)
    )
    res.json({ data: scholarship })
  } catch (err) { next(err) }
}

export async function createScholarship(req: Request, res: Response, next: NextFunction) {
  try {
    const scholarship = await scholarshipService.createScholarship(getSchoolId(req), req.body)
    res.status(201).json({ data: scholarship })
  } catch (err) { next(err) }
}

export async function updateScholarship(req: Request, res: Response, next: NextFunction) {
  try {
    const scholarship = await scholarshipService.updateScholarship(
      getSchoolId(req),
      String(req.params.id),
      req.body
    )
    res.json({ data: scholarship })
  } catch (err) { next(err) }
}

export async function deleteScholarship(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await scholarshipService.deleteScholarship(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Recipients ====================

export async function listRecipients(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query
    const data = await scholarshipService.listRecipients(
      getSchoolId(req),
      String(req.params.scholarshipId),
      { status: status as string | undefined }
    )
    res.json({ data })
  } catch (err) { next(err) }
}

export async function awardScholarship(req: Request, res: Response, next: NextFunction) {
  try {
    const recipient = await scholarshipService.awardScholarship(
      getSchoolId(req),
      String(req.params.scholarshipId),
      req.body
    )
    res.status(201).json({ data: recipient })
  } catch (err) { next(err) }
}

export async function revokeScholarship(req: Request, res: Response, next: NextFunction) {
  try {
    const { revokeReason } = req.body
    if (!revokeReason) {
      throw AppError.badRequest('revokeReason is required')
    }
    const recipient = await scholarshipService.revokeScholarship(
      getSchoolId(req),
      String(req.params.id),
      revokeReason
    )
    res.json({ data: recipient })
  } catch (err) { next(err) }
}

// ==================== Stats ====================

export async function getScholarshipStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await scholarshipService.getScholarshipStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}
