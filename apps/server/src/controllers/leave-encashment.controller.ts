import type { Request, Response, NextFunction } from 'express'
import * as encashmentService from '../services/leave-encashment.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) throw AppError.badRequest('No school context')
  return req.schoolId
}

export async function requestEncashment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await encashmentService.requestEncashment(getSchoolId(req), String(req.params.staffId), req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function listEncashments(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await encashmentService.listEncashments(getSchoolId(req), req.query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function processEncashment(req: Request, res: Response, next: NextFunction) {
  try {
    const processedBy = req.user?.name || 'Unknown'
    const data = await encashmentService.processEncashment(String(req.params.id), processedBy, req.body)
    res.json({ data })
  } catch (err) { next(err) }
}
