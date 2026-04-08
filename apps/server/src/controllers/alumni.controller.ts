import type { Request, Response, NextFunction } from 'express'
import * as alumniService from '../services/alumni.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Alumni operations require a school subdomain.')
  }
  return req.schoolId
}

export async function listAlumni(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, batch, isVerified } = req.query
    const result = await alumniService.listAlumni(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      batch: batch as string | undefined,
      isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getAlumni(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await alumniService.getAlumniById(getSchoolId(req), String(req.params.id))
    res.json({ data: record })
  } catch (err) { next(err) }
}

export async function createAlumni(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await alumniService.createAlumni(getSchoolId(req), req.body)
    res.status(201).json({ data: record })
  } catch (err) { next(err) }
}

export async function updateAlumni(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await alumniService.updateAlumni(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: record })
  } catch (err) { next(err) }
}

export async function deleteAlumni(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await alumniService.deleteAlumni(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function getAlumniByBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await alumniService.getAlumniByBatch(getSchoolId(req), String(req.params.batch))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getAlumniStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await alumniService.getAlumniStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}

export async function verifyAlumni(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await alumniService.updateAlumni(getSchoolId(req), String(req.params.id), { isVerified: true })
    res.json({ data: record })
  } catch (err) { next(err) }
}

// Achievements — stored on AlumniRecord.achievement field
export async function listAchievements(req: Request, res: Response, next: NextFunction) {
  try {
    const { prisma } = await import('../config/db.js')
    const where: Record<string, unknown> = { organizationId: getSchoolId(req), achievement: { not: null } }
    if (req.query.alumniId) where.id = req.query.alumniId as string
    const records = await prisma.alumniRecord.findMany({
      where,
      select: { id: true, name: true, achievement: true, batch: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ data: records })
  } catch (err) { next(err) }
}

export async function createAchievement(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.body.alumniId ?? req.params.id
    const record = await alumniService.updateAlumni(getSchoolId(req), String(id), {
      achievement: req.body.achievement,
    })
    res.status(201).json({ data: record })
  } catch (err) { next(err) }
}

export async function updateAchievement(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await alumniService.updateAlumni(getSchoolId(req), String(req.params.id), {
      achievement: req.body.achievement,
    })
    res.json({ data: record })
  } catch (err) { next(err) }
}

export async function publishAchievement(req: Request, res: Response, next: NextFunction) {
  try {
    // isPublished not in schema — return record as-is; frontend can handle this flag if added later
    const record = await alumniService.getAlumniById(getSchoolId(req), String(req.params.id))
    res.json({ data: record })
  } catch (err) { next(err) }
}

export async function deleteAchievement(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await alumniService.updateAlumni(getSchoolId(req), String(req.params.id), { achievement: null })
    res.json({ data: record })
  } catch (err) { next(err) }
}
