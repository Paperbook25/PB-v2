import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors.js'
import * as invitationService from '../services/invitation.service.js'

/**
 * POST /api/invitations/send
 */
export async function sendInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId || req.user?.organizationId
    const inviterId = req.user?.userId
    if (!schoolId || !inviterId) throw AppError.badRequest('School context required')

    const { email, role, name } = req.body
    if (!email) throw AppError.badRequest('Email is required')

    const result = await invitationService.sendInvitation(schoolId, inviterId, { email, role, name })
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/invitations
 */
export async function listInvitations(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId || req.user?.organizationId
    if (!schoolId) throw AppError.badRequest('School context required')

    const invitations = await invitationService.listInvitations(schoolId)
    res.json({ data: invitations })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/invitations/:id/resend
 */
export async function resendInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId || req.user?.organizationId
    if (!schoolId) throw AppError.badRequest('School context required')

    const result = await invitationService.resendInvitation(schoolId, req.params.id as string)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/invitations/:id
 */
export async function cancelInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId || req.user?.organizationId
    if (!schoolId) throw AppError.badRequest('School context required')

    const result = await invitationService.cancelInvitation(schoolId, req.params.id as string)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/public/accept-invite — Public endpoint
 */
export async function acceptInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, name, password } = req.body
    if (!token || !name || !password) {
      throw AppError.badRequest('Token, name, and password are required')
    }

    if (password.length < 8) {
      throw AppError.badRequest('Password must be at least 8 characters')
    }

    const result = await invitationService.acceptInvitation({ token, name, password })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/public/invite-details/:id — Public endpoint
 */
export async function getInviteDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await invitationService.getInvitationDetails(req.params.id as string)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
