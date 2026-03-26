import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors.js'
import * as onboardingService from '../services/onboarding.service.js'

/**
 * POST /api/public/register-school — Public endpoint
 */
export async function registerSchool(req: Request, res: Response, next: NextFunction) {
  try {
    const { schoolName, adminName, adminEmail, adminPassword, phone, city, state, affiliationBoard, institutionType } = req.body

    if (!schoolName || !adminName || !adminEmail || !adminPassword) {
      throw AppError.badRequest('School name, admin name, email, and password are required')
    }

    if (adminPassword.length < 8) {
      throw AppError.badRequest('Password must be at least 8 characters')
    }

    const result = await onboardingService.registerSchool({
      schoolName,
      adminName,
      adminEmail,
      adminPassword,
      phone,
      city,
      state,
      affiliationBoard,
      institutionType,
    })

    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/onboarding/status — Returns current onboarding step + completion
 */
export async function getOnboardingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId || req.user?.organizationId
    if (!schoolId) throw AppError.badRequest('School context required')

    const status = await onboardingService.getOnboardingStatus(schoolId)
    res.json(status)
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/onboarding/complete-step — Marks a step as done
 */
export async function completeOnboardingStep(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId || req.user?.organizationId
    if (!schoolId) throw AppError.badRequest('School context required')

    const { step } = req.body
    if (typeof step !== 'number' || step < 0 || step > 5) {
      throw AppError.badRequest('Step must be a number between 0 and 5')
    }

    const result = await onboardingService.completeOnboardingStep(schoolId, step)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/onboarding/skip — Marks onboarding as complete
 */
export async function skipOnboarding(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId || req.user?.organizationId
    if (!schoolId) throw AppError.badRequest('School context required')

    const result = await onboardingService.skipOnboarding(schoolId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/onboarding/checklist — Returns setup checklist with completion data
 */
export async function getSetupChecklist(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId || req.user?.organizationId
    if (!schoolId) throw AppError.badRequest('School context required')

    const checklist = await onboardingService.getSetupChecklist(schoolId)
    res.json(checklist)
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/settings/quick-setup — Batch create academic year + classes + sections
 */
export async function quickSetupAcademics(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId || req.user?.organizationId
    if (!schoolId) throw AppError.badRequest('School context required')

    const result = await onboardingService.quickSetupAcademics(schoolId, req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/finance/quick-setup — Batch create fee types
 */
export async function quickSetupFees(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId || req.user?.organizationId
    if (!schoolId) throw AppError.badRequest('School context required')

    const result = await onboardingService.quickSetupFees(schoolId, req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}
