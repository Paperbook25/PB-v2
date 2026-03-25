import type { Request, Response, NextFunction } from 'express'
import * as inventoryService from '../services/inventory.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Inventory operations require a school subdomain.')
  }
  return req.schoolId
}

export async function listItems(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, category, condition, search } = req.query
    const result = await inventoryService.listItems(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      category: category as string | undefined,
      condition: condition as string | undefined,
      search: search as string | undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await inventoryService.getItemById(getSchoolId(req), String(req.params.id))
    res.json({ data: item })
  } catch (err) { next(err) }
}

export async function createItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await inventoryService.createItem(getSchoolId(req), req.body)
    res.status(201).json({ data: item })
  } catch (err) { next(err) }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await inventoryService.updateItem(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: item })
  } catch (err) { next(err) }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await inventoryService.deleteItem(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function getLowStock(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await inventoryService.getLowStock(getSchoolId(req))
    res.json({ data: items })
  } catch (err) { next(err) }
}

export async function getInventoryStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await inventoryService.getInventoryStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}
