import type { Request, Response, NextFunction } from 'express'
import * as documentService from '../services/document.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Document operations require a school subdomain.')
  }
  return req.schoolId
}

export async function listDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, category, isPublic } = req.query
    const result = await documentService.listDocuments(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      category: category as string | undefined,
      isPublic: isPublic !== undefined ? isPublic === 'true' : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await documentService.getDocumentById(getSchoolId(req), String(req.params.id))
    res.json({ data: doc })
  } catch (err) { next(err) }
}

export async function createDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await documentService.createDocument(getSchoolId(req), req.body)
    res.status(201).json({ data: doc })
  } catch (err) { next(err) }
}

export async function updateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await documentService.updateDocument(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: doc })
  } catch (err) { next(err) }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await documentService.deleteDocument(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function incrementDownload(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await documentService.incrementDownload(getSchoolId(req), String(req.params.id))
    res.json({ data: doc })
  } catch (err) { next(err) }
}
