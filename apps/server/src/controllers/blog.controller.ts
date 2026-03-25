import type { Request, Response, NextFunction } from 'express'
import * as blogService from '../services/blog.service.js'
import { AppError } from '../utils/errors.js'
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  listBlogPostsSchema,
} from '../validators/blog.validators.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Blog operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== List Posts (Admin) ====================

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listBlogPostsSchema.parse(req.query)
    const result = await blogService.listPosts(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Get Single Post (Admin) ====================

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await blogService.getPostById(getSchoolId(req), String(req.params.id))
    res.json({ data: post })
  } catch (err) { next(err) }
}

// ==================== Create Post ====================

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createBlogPostSchema.parse(req.body)
    const authorInfo = {
      id: req.user?.userId,
      name: req.user?.name || 'Unknown',
    }
    const post = await blogService.createPost(getSchoolId(req), input, authorInfo)
    res.status(201).json({ data: post })
  } catch (err) { next(err) }
}

// ==================== Update Post ====================

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateBlogPostSchema.parse(req.body)
    const post = await blogService.updatePost(getSchoolId(req), String(req.params.id), input)
    res.json({ data: post })
  } catch (err) { next(err) }
}

// ==================== Publish Post ====================

export async function publishPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await blogService.publishPost(getSchoolId(req), String(req.params.id))
    res.json({ data: post })
  } catch (err) { next(err) }
}

// ==================== Unpublish Post ====================

export async function unpublishPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await blogService.unpublishPost(getSchoolId(req), String(req.params.id))
    res.json({ data: post })
  } catch (err) { next(err) }
}

// ==================== Delete Post ====================

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await blogService.deletePost(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Get Categories ====================

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await blogService.getCategories(getSchoolId(req))
    res.json({ data: categories })
  } catch (err) { next(err) }
}
