import { Request, Response, NextFunction } from 'express'
import * as addonService from '../services/addon.service.js'
import { prisma } from '../config/db.js'

export async function listAddons(req: Request, res: Response, next: NextFunction) {
  try {
    const school = await prisma.schoolProfile.findFirst()
    if (!school) return res.status(404).json({ error: 'School not configured' })
    const addons = await addonService.listAddons(school.id)
    res.json({ addons })
  } catch (error) {
    next(error)
  }
}

export async function toggleAddon(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params
    const { enabled } = req.body
    const userId = (req as any).user?.userId

    const school = await prisma.schoolProfile.findFirst()
    if (!school) return res.status(404).json({ error: 'School not configured' })

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' })
    }

    const result = await addonService.toggleAddon(school.id, slug as string, enabled, userId)
    res.json(result)
  } catch (error: any) {
    if (error.message?.includes('not found') || error.message?.includes('core module')) {
      return res.status(400).json({ error: error.message })
    }
    next(error)
  }
}
