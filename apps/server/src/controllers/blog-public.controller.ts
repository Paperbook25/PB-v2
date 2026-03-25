import type { Request, Response, NextFunction } from 'express'
import * as blogService from '../services/blog.service.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw new Error('No school context. Public blog requires a school subdomain.')
  }
  return req.schoolId
}

// ==================== Public: List Published Posts ====================

export async function listPublishedPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      category: req.query.category ? String(req.query.category) : undefined,
    }
    const result = await blogService.listPublishedPosts(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Public: Get Published Post by Slug ====================

export async function getPublishedPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await blogService.getPublishedPostBySlug(getSchoolId(req), String(req.params.slug))
    res.json({ data: post })
  } catch (err) {
    res.status(404).json({ error: 'Blog post not found' })
  }
}
