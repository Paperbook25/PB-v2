import type { Request, Response, NextFunction } from 'express'
import * as messagingService from '../services/messaging.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) throw AppError.badRequest('No school context')
  return req.schoolId
}

function getUserInfo(req: Request) {
  const userId = req.user?.userId || req.user?.email
  if (!userId) throw AppError.unauthorized('Authentication required')
  return {
    userId,
    userName: req.user?.name || 'Unknown',
    userType: req.user?.role || 'teacher',
  }
}

export async function listConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = getUserInfo(req)
    const result = await messagingService.listConversations(getSchoolId(req), userId, req.query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function createConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, userName, userType } = getUserInfo(req)
    const result = await messagingService.createConversation(getSchoolId(req), userId, userName, userType, req.body)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

export async function listMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = getUserInfo(req)
    const result = await messagingService.listMessages(String(req.params.conversationId), userId, req.query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, userName, userType } = getUserInfo(req)
    const { content } = req.body
    if (!content?.trim()) throw AppError.badRequest('Message content is required')
    const result = await messagingService.sendMessage(String(req.params.conversationId), userId, userName, userType, content)
    res.status(201).json(result)
  } catch (err) { next(err) }
}
