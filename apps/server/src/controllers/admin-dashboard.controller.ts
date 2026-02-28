import type { Request, Response, NextFunction } from 'express'
import * as adminDashboardService from '../services/admin-dashboard.service.js'

/**
 * GET /api/admin/dashboard/stats
 * Get high-level platform statistics.
 */
export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminDashboardService.getStats()
    res.json({ data })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/dashboard/growth
 * Get school/user creation trends over the last 12 months.
 */
export async function getGrowth(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminDashboardService.getGrowth()
    res.json({ data })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/dashboard/addons
 * Get addon popularity across all schools.
 */
export async function getAddonPopularity(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminDashboardService.getAddonPopularity()
    res.json({ data })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/dashboard/activity
 * Get recent audit log activity across the platform.
 */
export async function getActivity(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminDashboardService.getRecentActivity()
    res.json({ data })
  } catch (error) {
    next(error)
  }
}
