import type { Request, Response, NextFunction } from 'express'
import * as websiteService from '../services/school-website.service.js'

export async function getPublishedPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await websiteService.getPublishedPageBySlug(String(req.params.slug))
    res.json({ data: page })
  } catch (err) {
    res.status(404).json({ error: 'Page not found' })
  }
}

export async function getPublicSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await websiteService.getSettings()
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

export async function listPublishedPages(_req: Request, res: Response, next: NextFunction) {
  try {
    const pages = await websiteService.listPublishedPages()
    res.json({ data: pages })
  } catch (err) { next(err) }
}
