import type { Request, Response, NextFunction } from 'express'
import * as websiteService from '../services/school-website.service.js'
import * as websiteAI from '../services/website-ai.service.js'
import { AppError } from '../utils/errors.js'
import {
  createPageSchema, updatePageSchema,
  createSectionSchema, updateSectionSchema, reorderSectionsSchema,
  updateSettingsSchema, uploadMediaSchema, uploadMediaFileSchema, generatePageSchema,
} from '../validators/school-website.validators.js'

// Helper: extract and validate schoolId from tenant middleware
function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Website operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Pages ====================

export async function listPages(req: Request, res: Response, next: NextFunction) {
  try {
    const pages = await websiteService.listPages(getSchoolId(req))
    res.json({ data: pages })
  } catch (err) { next(err) }
}

export async function getPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await websiteService.getPageById(getSchoolId(req), String(req.params.id))
    res.json({ data: page })
  } catch (err) { next(err) }
}

export async function createPage(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createPageSchema.parse(req.body)
    const page = await websiteService.createPage(getSchoolId(req), input)
    res.status(201).json({ data: page })
  } catch (err) { next(err) }
}

export async function updatePage(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updatePageSchema.parse(req.body)
    const page = await websiteService.updatePage(getSchoolId(req), String(req.params.id), input)
    res.json({ data: page })
  } catch (err) { next(err) }
}

export async function deletePage(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await websiteService.deletePage(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function publishPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await websiteService.publishPage(getSchoolId(req), String(req.params.id))
    res.json({ data: page })
  } catch (err) { next(err) }
}

export async function unpublishPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await websiteService.unpublishPage(getSchoolId(req), String(req.params.id))
    res.json({ data: page })
  } catch (err) { next(err) }
}

// ==================== Sections ====================

export async function addSection(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createSectionSchema.parse(req.body)
    const section = await websiteService.addSection(getSchoolId(req), String(req.params.id), input)
    res.status(201).json({ data: section })
  } catch (err) { next(err) }
}

export async function updateSection(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateSectionSchema.parse(req.body)
    const section = await websiteService.updateSection(getSchoolId(req), String(req.params.id), input)
    res.json({ data: section })
  } catch (err) { next(err) }
}

export async function deleteSection(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await websiteService.deleteSection(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function reorderSections(req: Request, res: Response, next: NextFunction) {
  try {
    const input = reorderSectionsSchema.parse(req.body)
    const result = await websiteService.reorderSections(getSchoolId(req), String(req.params.id), input)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Settings ====================

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await websiteService.getSettings(getSchoolId(req))
    res.json({ data: settings })
  } catch (err) { next(err) }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateSettingsSchema.parse(req.body)
    const settings = await websiteService.updateSettings(getSchoolId(req), input)
    res.json({ data: settings })
  } catch (err) { next(err) }
}

// ==================== Media ====================

export async function listMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const media = await websiteService.listMedia(getSchoolId(req))
    res.json({ data: media })
  } catch (err) { next(err) }
}

export async function uploadMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const input = uploadMediaSchema.parse(req.body)
    const media = await websiteService.uploadMedia(getSchoolId(req), input)
    res.status(201).json({ data: media })
  } catch (err) { next(err) }
}

export async function uploadMediaFile(req: Request, res: Response, next: NextFunction) {
  try {
    const input = uploadMediaFileSchema.parse(req.body)
    const media = await websiteService.uploadMediaFile(getSchoolId(req), input)
    res.status(201).json({ data: media })
  } catch (err) { next(err) }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await websiteService.deleteMedia(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== AI Generate (SSE) ====================

export async function aiGenerate(req: Request, res: Response, next: NextFunction) {
  try {
    const input = generatePageSchema.parse(req.body)

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    await websiteAI.generatePageContent({
      schoolId: getSchoolId(req),
      pageSlug: input.pageSlug,
      template: input.template as 'classic' | 'modern' | 'minimal',
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      },
    })

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) { next(err) }
}
