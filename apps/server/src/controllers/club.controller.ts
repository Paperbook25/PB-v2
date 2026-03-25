import type { Request, Response, NextFunction } from 'express'
import * as clubService from '../services/club.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Club operations require a school subdomain.')
  }
  return req.schoolId
}

export async function listClubs(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, category, isActive } = req.query
    const result = await clubService.listClubs(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      category: category as string | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getClub(req: Request, res: Response, next: NextFunction) {
  try {
    const club = await clubService.getClubById(getSchoolId(req), String(req.params.id))
    res.json({ data: club })
  } catch (err) { next(err) }
}

export async function createClub(req: Request, res: Response, next: NextFunction) {
  try {
    const club = await clubService.createClub(getSchoolId(req), req.body)
    res.status(201).json({ data: club })
  } catch (err) { next(err) }
}

export async function updateClub(req: Request, res: Response, next: NextFunction) {
  try {
    const club = await clubService.updateClub(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: club })
  } catch (err) { next(err) }
}

export async function deleteClub(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await clubService.deleteClub(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function getClubStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await clubService.getClubStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}
