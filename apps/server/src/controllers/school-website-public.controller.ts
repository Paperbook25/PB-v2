import type { Request, Response, NextFunction } from 'express'
import * as websiteService from '../services/school-website.service.js'

// Public endpoints: schoolId comes from tenant middleware (subdomain), not auth
function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw new Error('No school context. Public website requires a school subdomain.')
  }
  return req.schoolId
}

export async function getPublishedPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await websiteService.getPublishedPageBySlug(getSchoolId(req), String(req.params.slug))
    res.json({ data: page })
  } catch (err) {
    res.status(404).json({ error: 'Page not found' })
  }
}

export async function getPublicSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await websiteService.getSettings(getSchoolId(req))
    // Return only public-safe fields
    res.json({
      data: {
        template: settings.template,
        primaryColor: settings.primaryColor,
        accentColor: settings.accentColor,
        fontFamily: settings.fontFamily,
        metaTitle: settings.metaTitle,
        metaDescription: settings.metaDescription,
        socialLinks: settings.socialLinks,
      },
    })
  } catch (err) { next(err) }
}

export async function listPublishedPages(req: Request, res: Response, next: NextFunction) {
  try {
    const pages = await websiteService.listPublishedPages(getSchoolId(req))
    res.json({ data: pages })
  } catch (err) { next(err) }
}
