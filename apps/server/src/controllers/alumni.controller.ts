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
