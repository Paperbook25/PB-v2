import type { Request, Response, NextFunction } from 'express'
import * as subscriptionService from '../services/subscription.service.js'
import type { PlanTier } from '../config/plan-tiers.js'

export async function getCurrentPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(404).json({ error: 'School not configured' })

    const subscription = await subscriptionService.getCurrentPlan(schoolId)
    res.json({ data: subscription })
  } catch (error) {
    next(error)
  }
}

export async function getAvailablePlans(_req: Request, res: Response, next: NextFunction) {
  try {
    const plans = subscriptionService.getAvailablePlans()
    res.json({ data: plans })
  } catch (error) {
    next(error)
  }
}

export async function upgradePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(404).json({ error: 'School not configured' })

    const { tier } = req.body
    if (!tier || !['free', 'starter', 'professional', 'enterprise'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid plan tier. Must be one of: free, starter, professional, enterprise.' })
    }

    const userId = req.user?.userId || ''
    const result = await subscriptionService.upgradePlan(schoolId, tier as PlanTier, userId)
    res.json({ data: result })
  } catch (error: any) {
    if (error.message?.includes('Invalid plan tier')) {
      return res.status(400).json({ error: error.message })
    }
    next(error)
  }
}

export async function checkLimits(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.schoolId
    if (!schoolId) return res.status(404).json({ error: 'School not configured' })

    const resource = req.query.resource as 'students' | 'staff' | 'users'
    if (!resource || !['students', 'staff', 'users'].includes(resource)) {
      return res.status(400).json({ error: 'Invalid resource. Must be one of: students, staff, users.' })
    }

    const result = await subscriptionService.checkPlanLimits(schoolId, resource)
    res.json({ data: result })
  } catch (error) {
    next(error)
  }
}
