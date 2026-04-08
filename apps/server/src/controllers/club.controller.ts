import type { Request, Response, NextFunction } from 'express'
import * as clubService from '../services/club.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Club operations require a school subdomain.')
  }
  return req.schoolId
}

// Frontend uses advisorName/memberCount/meetingSchedule — map to schema fields
function mapClubResponse(c: any) {
  return {
    ...c,
    advisorName: c.coordinatorName,
    memberCount: c.currentMembers,
    meetingSchedule: c.meetingDay ? (c.meetingTime ? `${c.meetingDay} ${c.meetingTime}` : c.meetingDay) : undefined,
  }
}

function mapClubInput(body: any) {
  const { meetingSchedule, advisorName, memberCount, ...rest } = body
  return {
    ...rest,
    coordinatorName: advisorName || rest.coordinatorName,
    meetingDay: meetingSchedule || rest.meetingDay,
  }
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
    res.json({ ...result, data: result.data.map(mapClubResponse) })
  } catch (err) { next(err) }
}

export async function getClub(req: Request, res: Response, next: NextFunction) {
  try {
    const club = await clubService.getClubById(getSchoolId(req), String(req.params.id))
    res.json({ data: mapClubResponse(club) })
  } catch (err) { next(err) }
}

export async function createClub(req: Request, res: Response, next: NextFunction) {
  try {
    const club = await clubService.createClub(getSchoolId(req), mapClubInput(req.body))
    res.status(201).json({ data: mapClubResponse(club) })
  } catch (err) { next(err) }
}

export async function updateClub(req: Request, res: Response, next: NextFunction) {
  try {
    const club = await clubService.updateClub(getSchoolId(req), String(req.params.id), mapClubInput(req.body))
    res.json({ data: mapClubResponse(club) })
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
    // Map to frontend-expected shape (totalActivities is not tracked yet)
    res.json({ data: { ...stats, totalActivities: 0 } })
  } catch (err) { next(err) }
}
