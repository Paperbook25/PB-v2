import type { Request, Response, NextFunction } from 'express'
import * as behaviorService from '../services/behavior.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Behavior operations require a school subdomain.')
  }
  return req.schoolId
}

export async function listRecords(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, type, category, studentId, date, search } = req.query
    const result = await behaviorService.listRecords(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type: type as string | undefined,
      category: category as string | undefined,
      studentId: studentId as string | undefined,
      date: date as string | undefined,
      search: search as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await behaviorService.getRecordById(getSchoolId(req), String(req.params.id))
    res.json({ data: record })
  } catch (err) { next(err) }
}

export async function createRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await behaviorService.createRecord(getSchoolId(req), req.body)
    res.status(201).json({ data: record })
  } catch (err) { next(err) }
}

export async function updateRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await behaviorService.updateRecord(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: record })
  } catch (err) { next(err) }
}

export async function deleteRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await behaviorService.deleteRecord(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function getStudentBehavior(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query
    const result = await behaviorService.getStudentBehavior(
      getSchoolId(req),
      String(req.params.studentId),
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      }
    )
    res.json(result)
  } catch (err) { next(err) }
}

export async function getBehaviorStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await behaviorService.getBehaviorStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}
