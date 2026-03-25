import type { Request, Response, NextFunction } from 'express'
import * as visitorService from '../services/visitor.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Visitor operations require a school subdomain.')
  }
  return req.schoolId
}

export async function listVisitors(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, status, purpose, date, search } = req.query
    const result = await visitorService.listVisitors(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string | undefined,
      purpose: purpose as string | undefined,
      date: date as string | undefined,
      search: search as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function checkIn(req: Request, res: Response, next: NextFunction) {
  try {
    const visitor = await visitorService.checkIn(getSchoolId(req), req.body)
    res.status(201).json({ data: visitor })
  } catch (err) { next(err) }
}

export async function checkOut(req: Request, res: Response, next: NextFunction) {
  try {
    const visitor = await visitorService.checkOut(getSchoolId(req), String(req.params.id))
    res.json({ data: visitor })
  } catch (err) { next(err) }
}

export async function getVisitor(req: Request, res: Response, next: NextFunction) {
  try {
    const visitor = await visitorService.getVisitorById(getSchoolId(req), String(req.params.id))
    res.json({ data: visitor })
  } catch (err) { next(err) }
}

export async function getVisitorStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await visitorService.getVisitorStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}

export async function deleteVisitor(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await visitorService.deleteVisitor(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}
