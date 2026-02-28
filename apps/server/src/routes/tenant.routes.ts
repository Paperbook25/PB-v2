import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/db.js'

const router = Router()

/**
 * GET /api/public/tenant/resolve
 *
 * Public endpoint that resolves a school slug to basic school info.
 * Used by the SPA in development mode when the server can't inject
 * tenant config into the HTML (because Vite serves the HTML, not Express).
 *
 * In production this isn't needed (Express injects window.__PAPERBOOK_TENANT__),
 * but it serves as a fallback and is useful for health checks.
 *
 * Only returns non-sensitive public info: name, logo, status.
 */
router.get('/resolve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = (req.query.slug as string || '').toLowerCase().trim()

    if (!slug || !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) {
      return res.status(400).json({ error: 'Invalid slug' })
    }

    const org = await prisma.organization.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        logo: true,
        profile: {
          select: {
            status: true,
            planTier: true,
          },
        },
      },
    })

    if (!org) {
      return res.status(404).json({ error: 'School not found', slug })
    }

    const status = org.profile?.status || 'active'

    // Don't reveal details about churned/suspended schools to the public
    if (status === 'churned') {
      return res.status(404).json({ error: 'School not found', slug })
    }

    if (status === 'suspended') {
      return res.json({
        slug: org.slug,
        name: org.name,
        logo: org.logo,
        status: 'suspended',
      })
    }

    return res.json({
      slug: org.slug,
      name: org.name,
      logo: org.logo,
      status,
    })
  } catch (error) {
    next(error)
  }
})

export default router
