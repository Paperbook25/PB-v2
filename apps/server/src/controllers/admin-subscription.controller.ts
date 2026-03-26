import type { Request, Response, NextFunction } from 'express'
import * as subscriptionService from '../services/admin-subscription.service.js'

export async function listSubscriptions(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await subscriptionService.listSubscriptions({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status as string,
      planTier: req.query.planTier as string,
      search: req.query.search as string,
    })
    res.json(result)
  } catch (err) { next(err) }
}

export async function getSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await subscriptionService.getSubscription(String(req.params.id))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await subscriptionService.createSubscription(req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await subscriptionService.updateSubscription(String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function cancelSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await subscriptionService.cancelSubscription(String(req.params.id), req.body.reason)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getExpiringTrials(req: Request, res: Response, next: NextFunction) {
  try {
    const days = Number(req.query.days) || 14
    const data = await subscriptionService.getExpiringTrials(days)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await subscriptionService.getSubscriptionAnalytics()
    res.json({ data })
  } catch (err) { next(err) }
}
