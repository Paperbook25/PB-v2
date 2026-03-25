import type { Request, Response, NextFunction } from 'express'
import { handleChat } from '../services/chatbot.service.js'
import { AppError } from '../utils/errors.js'

/**
 * POST /api/public/chat
 * Body: { message: string }
 * Public endpoint — no auth required, rate limited.
 */
export async function handleMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId
    if (!schoolId) {
      throw AppError.badRequest('No school context. Chat requires a school subdomain.')
    }

    const { message } = req.body
    if (!message || typeof message !== 'string') {
      throw AppError.badRequest('Message is required and must be a string.')
    }

    // Enforce a reasonable max length to prevent abuse
    const trimmed = message.trim().slice(0, 500)
    if (trimmed.length === 0) {
      throw AppError.badRequest('Message cannot be empty.')
    }

    const response = await handleChat(schoolId, trimmed)
    res.json({ data: response })
  } catch (err) {
    next(err)
  }
}
