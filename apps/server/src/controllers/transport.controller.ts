import type { Request, Response, NextFunction } from 'express'
import * as transportService from '../services/transport.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Transport operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Routes ====================

export async function listRoutes(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, isActive } = req.query
    const result = await transportService.listRoutes(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const route = await transportService.getRouteById(getSchoolId(req), String(req.params.id))
    res.json({ data: route })
  } catch (err) { next(err) }
}

export async function createRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const route = await transportService.createRoute(getSchoolId(req), req.body)
    res.status(201).json({ data: route })
  } catch (err) { next(err) }
}

export async function updateRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const route = await transportService.updateRoute(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: route })
  } catch (err) { next(err) }
}

export async function deleteRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await transportService.deleteRoute(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Stops ====================

export async function addStop(req: Request, res: Response, next: NextFunction) {
  try {
    const stop = await transportService.addStop(getSchoolId(req), String(req.params.routeId), req.body)
    res.status(201).json({ data: stop })
  } catch (err) { next(err) }
}

export async function updateStop(req: Request, res: Response, next: NextFunction) {
  try {
    const stop = await transportService.updateStop(getSchoolId(req), String(req.params.stopId), req.body)
    res.json({ data: stop })
  } catch (err) { next(err) }
}

export async function deleteStop(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await transportService.deleteStop(getSchoolId(req), String(req.params.stopId))
    res.json(result)
  } catch (err) { next(err) }
}

export async function reorderStops(req: Request, res: Response, next: NextFunction) {
  try {
    const { stopIds } = req.body
    const result = await transportService.reorderStops(getSchoolId(req), String(req.params.routeId), stopIds)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Vehicles ====================

export async function listVehicles(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, isActive } = req.query
    const result = await transportService.listVehicles(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getVehicle(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await transportService.getVehicle(getSchoolId(req), String(req.params.id))
    res.json({ data: vehicle })
  } catch (err) { next(err) }
}

export async function createVehicle(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await transportService.createVehicle(getSchoolId(req), req.body)
    res.status(201).json({ data: vehicle })
  } catch (err) { next(err) }
}

export async function updateVehicle(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await transportService.updateVehicle(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: vehicle })
  } catch (err) { next(err) }
}

export async function deleteVehicle(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await transportService.deleteVehicle(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Drivers ====================

export async function listDrivers(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, isActive } = req.query
    const result = await transportService.listDrivers(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const driver = await transportService.getDriver(getSchoolId(req), String(req.params.id))
    res.json({ data: driver })
  } catch (err) { next(err) }
}

export async function createDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const driver = await transportService.createDriver(getSchoolId(req), req.body)
    res.status(201).json({ data: driver })
  } catch (err) { next(err) }
}

export async function updateDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const driver = await transportService.updateDriver(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: driver })
  } catch (err) { next(err) }
}

export async function deleteDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await transportService.deleteDriver(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Student Assignments ====================

export async function listAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, routeId, stopId, search } = req.query
    const result = await transportService.listAssignments(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      routeId: routeId as string | undefined,
      stopId: stopId as string | undefined,
      search: search as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function assignStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const assignment = await transportService.assignStudent(getSchoolId(req), req.body)
    res.status(201).json({ data: assignment })
  } catch (err) { next(err) }
}

export async function removeAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await transportService.removeAssignment(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Stats ====================

export async function getTransportStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await transportService.getTransportStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}
