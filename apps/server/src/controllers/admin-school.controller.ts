import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as adminSchoolService from '../services/admin-school.service.js'

/** Helper to safely extract a single string from Express v5 params */
function paramStr(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value
}

// ---------------------------------------------------------------------------
// Zod schemas for input validation
// ---------------------------------------------------------------------------

const createSchoolSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().optional(),
  principalName: z.string().optional(),
  establishedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  affiliationNumber: z.string().optional(),
  affiliationBoard: z.string().optional(),
  planTier: z.enum(['free', 'starter', 'professional', 'enterprise']).optional(),
  adminName: z.string().min(1),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
})

const updateSchoolSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().optional(),
  principalName: z.string().optional(),
  establishedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  affiliationNumber: z.string().optional(),
  affiliationBoard: z.string().optional(),
}).strict()

const listSchoolsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['active', 'suspended', 'trial', 'churned']).optional(),
  planTier: z.enum(['free', 'starter', 'professional', 'enterprise']).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

/**
 * GET /api/admin/schools
 * List schools with pagination and filtering.
 */
export async function listSchools(req: Request, res: Response, next: NextFunction) {
  try {
    const params = listSchoolsSchema.parse(req.query)
    const result = await adminSchoolService.listSchools(params)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/admin/schools
 * Create a new school with an admin user.
 */
export async function createSchool(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createSchoolSchema.parse(req.body)
    const result = await adminSchoolService.createSchool(data)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/schools/:id
 * Get a single school with stats.
 */
export async function getSchool(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminSchoolService.getSchool(paramStr(req.params.id))
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * PUT /api/admin/schools/:id
 * Update a school's profile.
 */
export async function updateSchool(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateSchoolSchema.parse(req.body)
    const result = await adminSchoolService.updateSchool(paramStr(req.params.id), data)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/admin/schools/:id/suspend
 * Suspend a school.
 */
export async function suspendSchool(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminSchoolService.suspendSchool(paramStr(req.params.id), req.body.reason)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/admin/schools/:id/activate
 * Activate a suspended school.
 */
export async function activateSchool(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminSchoolService.activateSchool(paramStr(req.params.id))
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/admin/schools/:id
 * Soft-delete a school (mark as churned).
 */
export async function deleteSchool(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminSchoolService.deleteSchool(paramStr(req.params.id))
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/schools/:id/users
 * Get users for a specific school.
 */
export async function getSchoolUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminSchoolService.getSchoolUsers(paramStr(req.params.id))
    res.json({ data: result })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/schools/:id/addons
 * Get addons for a specific school.
 */
export async function getSchoolAddons(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminSchoolService.getSchoolAddons(paramStr(req.params.id))
    res.json({ data: result })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/admin/schools/:id/addons/:slug
 * Toggle an addon for a specific school.
 */
export async function toggleSchoolAddon(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminSchoolService.toggleSchoolAddon(paramStr(req.params.id), paramStr(req.params.slug))
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function bulkSuspend(req: Request, res: Response, next: NextFunction) {
  try {
    const { schoolIds, reason } = req.body
    const result = await adminSchoolService.bulkSuspendSchools(schoolIds, reason)
    res.json(result)
  } catch (err) { next(err) }
}

export async function bulkChangePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const { schoolIds, planTier } = req.body
    const result = await adminSchoolService.bulkChangePlan(schoolIds, planTier)
    res.json(result)
  } catch (err) { next(err) }
}

export async function exportSchools(req: Request, res: Response, next: NextFunction) {
  try {
    const { generateCsv, setCsvHeaders } = await import('../utils/csv-export.js')
    const result = await adminSchoolService.listSchools({ limit: 10000 })
    const csv = generateCsv(result.data, [
      { key: 'name', header: 'School Name' },
      { key: 'slug', header: 'Slug' },
      { key: 'status', header: 'Status' },
      { key: 'planTier', header: 'Plan' },
      { key: 'email', header: 'Email' },
      { key: 'city', header: 'City' },
      { key: 'createdAt', header: 'Created' },
    ])
    setCsvHeaders(res, `schools-${new Date().toISOString().split('T')[0]}.csv`)
    res.send(csv)
  } catch (error) {
    next(error)
  }
}
