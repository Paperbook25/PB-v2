import type { Request, Response, NextFunction } from 'express'
import * as websiteService from '../services/school-website.service.js'
import * as websiteAI from '../services/website-ai.service.js'
import {
  createPageSchema, updatePageSchema,
  createSectionSchema, updateSectionSchema, reorderSectionsSchema,
  updateSettingsSchema, uploadMediaSchema, generatePageSchema,
} from '../validators/school-website.validators.js'

// ==================== Pages ====================

export async function listPages(_req: Request, res: Response, next: NextFunction) {
  try {
    const pages = await websiteService.listPages()
    res.json({ data: pages })
  } catch (err) { next(err) }
}

export async function getPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await websiteService.getPageById(String(req.params.id))
    res.json({ data: page })
  } catch (err) { next(err) }
}

export async function createPage(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createPageSchema.parse(req.body)
    const page = await websiteService.createPage(input)
    res.status(201).json({ data: page })
  } catch (err) { next(err) }
}

export async function updatePage(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updatePageSchema.parse(req.body)
    const page = await websiteService.updatePage(String(req.params.id), input)
    res.json({ data: page })
  } catch (err) { next(err) }
}

export async function deletePage(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await websiteService.deletePage(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function publishPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await websiteService.publishPage(String(req.params.id))
    res.json({ data: page })
  } catch (err) { next(err) }
}

export async function unpublishPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await websiteService.unpublishPage(String(req.params.id))
    res.json({ data: page })
  } catch (err) { next(err) }
}

// ==================== Sections ====================

export async function addSection(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createSectionSchema.parse(req.body)
    const section = await websiteService.addSection(String(req.params.id), input)
    res.status(201).json({ data: section })
  } catch (err) { next(err) }
}

export async function updateSection(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateSectionSchema.parse(req.body)
    const section = await websiteService.updateSection(String(req.params.id), input)
    res.json({ data: section })
  } catch (err) { next(err) }
}

export async function deleteSection(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await websiteService.deleteSection(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function reorderSections(req: Request, res: Response, next: NextFunction) {
  try {
    const input = reorderSectionsSchema.parse(req.body)
    const result = await websiteService.reorderSections(String(req.params.id), input)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Settings ====================

export async function getSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await websiteService.getSettings()
    res.json({ data: settings })
  } catch (err) { next(err) }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateSettingsSchema.parse(req.body)
    const settings = await websiteService.updateSettings(input)
    res.json({ data: settings })
  } catch (err) { next(err) }
}

// ==================== Media ====================

export async function listMedia(_req: Request, res: Response, next: NextFunction) {
  try {
    const media = await websiteService.listMedia()
    res.json({ data: media })
  } catch (err) { next(err) }
}

export async function uploadMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const input = uploadMediaSchema.parse(req.body)
    const media = await websiteService.uploadMedia(input)
    res.status(201).json({ data: media })
  } catch (err) { next(err) }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await websiteService.deleteMedia(String(req.params.id))
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
      pageSlug: input.pageSlug,
      template: input.template,
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      },
    })

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) { next(err) }
}
