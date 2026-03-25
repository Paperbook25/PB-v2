import type { Request, Response, NextFunction } from 'express'
import * as seoService from '../services/seo.service.js'

function getSchoolId(req: Request): string {
  return req.schoolId || ''
}

function getBaseUrl(req: Request): string {
  const proto = req.headers['x-forwarded-proto'] || req.protocol
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${proto}://${host}`
}

export async function serveSitemap(req: Request, res: Response, next: NextFunction) {
  try {
    const xml = await seoService.generateSitemap(getSchoolId(req), getBaseUrl(req))
    res.set('Content-Type', 'application/xml')
    res.set('Cache-Control', 'public, max-age=3600')
    res.send(xml)
  } catch (err) { next(err) }
}

export async function serveRobotsTxt(req: Request, res: Response, _next: NextFunction) {
  const txt = seoService.generateRobotsTxt(getBaseUrl(req))
  res.set('Content-Type', 'text/plain')
  res.set('Cache-Control', 'public, max-age=86400')
  res.send(txt)
}
