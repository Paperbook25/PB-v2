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

// ==================== Stats ====================

export async function getTransportStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await transportService.getTransportStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}
