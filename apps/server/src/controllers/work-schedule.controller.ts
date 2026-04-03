import type { Request, Response, NextFunction } from 'express'
import * as workScheduleService from '../services/work-schedule.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) throw AppError.badRequest('No school context')
  return req.schoolId
}

export async function listSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await workScheduleService.listWorkSchedules(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await workScheduleService.createWorkSchedule(getSchoolId(req), req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await workScheduleService.updateWorkSchedule(String(req.params.id), getSchoolId(req), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function deleteSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    await workScheduleService.deleteWorkSchedule(String(req.params.id), getSchoolId(req))
    res.json({ success: true })
  } catch (err) { next(err) }
}
