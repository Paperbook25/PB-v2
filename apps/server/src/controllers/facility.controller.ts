import type { Request, Response, NextFunction } from 'express'
import * as facilityService from '../services/facility.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Facility operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Facilities ====================

export async function listFacilities(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, type, status, isBookable } = req.query
    const result = await facilityService.listFacilities(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      type: type as string | undefined,
      status: status as string | undefined,
      isBookable: isBookable !== undefined ? isBookable === 'true' : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getFacility(req: Request, res: Response, next: NextFunction) {
  try {
    const facility = await facilityService.getFacilityById(getSchoolId(req), String(req.params.id))
    res.json({ data: facility })
  } catch (err) { next(err) }
}

export async function createFacility(req: Request, res: Response, next: NextFunction) {
  try {
    const facility = await facilityService.createFacility(getSchoolId(req), req.body)
    res.status(201).json({ data: facility })
  } catch (err) { next(err) }
}

export async function updateFacility(req: Request, res: Response, next: NextFunction) {
  try {
    const facility = await facilityService.updateFacility(
      getSchoolId(req),
      String(req.params.id),
      req.body
    )
    res.json({ data: facility })
  } catch (err) { next(err) }
}

export async function deleteFacility(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await facilityService.deleteFacility(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Bookings ====================

export async function listBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, facilityId, date, status } = req.query
    const result = await facilityService.listBookings(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      facilityId: facilityId as string | undefined,
      date: date as string | undefined,
      status: status as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await facilityService.createBooking(getSchoolId(req), req.body)
    res.status(201).json({ data: booking })
  } catch (err) { next(err) }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await facilityService.cancelBooking(getSchoolId(req), String(req.params.id))
    res.json({ data: booking })
  } catch (err) { next(err) }
}

// ==================== Availability ====================

export async function getAvailableFacilities(req: Request, res: Response, next: NextFunction) {
  try {
    const { date, startTime, endTime } = req.query
    if (!date || !startTime || !endTime) {
      throw AppError.badRequest('date, startTime, and endTime query parameters are required')
    }
    const data = await facilityService.getAvailableFacilities(
      getSchoolId(req),
      date as string,
      startTime as string,
      endTime as string
    )
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== Stats ====================

export async function getFacilityStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await facilityService.getFacilityStats(getSchoolId(req))
    const byStatus = (stats as any).byStatus as Record<string, number> | undefined
    // Map to frontend-expected shape
    res.json({
      data: {
        ...stats,
        totalFacilities: (stats as any).totalFacilities ?? 0,
        availableFacilities: byStatus?.available ?? 0,
        underMaintenance: byStatus?.maintenance ?? (byStatus as any)?.under_maintenance ?? 0,
        todayBookings: (stats as any).todayBookings ?? 0,
      },
    })
  } catch (err) { next(err) }
}
