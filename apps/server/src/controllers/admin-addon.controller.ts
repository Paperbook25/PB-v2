import type { Request, Response, NextFunction } from 'express'
import * as adminAddonService from '../services/admin-addon.service.js'

function paramStr(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value
}

/**
 * GET /api/admin/addons
 * List all addons with usage statistics.
 */
export async function listAddons(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminAddonService.listAddons()
    res.json({ data: result })
  } catch (error) {
    next(error)
  }
}

/**
 * PUT /api/admin/addons/:id
 * Update an addon's details.
 */
export async function updateAddon(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminAddonService.updateAddon(paramStr(req.params.id), req.body)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/addons/:id/usage
 * Get usage details for a specific addon.
 */
export async function getAddonUsage(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminAddonService.getAddonUsage(paramStr(req.params.id))
    res.json(result)
  } catch (error) {
    next(error)
  }
}
