import type { Request, Response, NextFunction } from 'express'
import * as emailCampaignService from '../services/email-campaign.service.js'
import { AppError } from '../utils/errors.js'

// Helper: extract and validate schoolId from tenant middleware
function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Email campaign operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Campaigns ====================

export async function listCampaigns(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    }
    const result = await emailCampaignService.listCampaigns(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await emailCampaignService.getCampaignById(getSchoolId(req), String(req.params.id))
    res.json({ data: campaign })
  } catch (err) { next(err) }
}

export async function createCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await emailCampaignService.createCampaign(getSchoolId(req), req.body)
    res.status(201).json({ data: campaign })
  } catch (err) { next(err) }
}

export async function updateCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await emailCampaignService.updateCampaign(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: campaign })
  } catch (err) { next(err) }
}

export async function deleteCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await emailCampaignService.deleteCampaign(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Steps ====================

export async function addStep(req: Request, res: Response, next: NextFunction) {
  try {
    const step = await emailCampaignService.addStep(getSchoolId(req), String(req.params.id), req.body)
    res.status(201).json({ data: step })
  } catch (err) { next(err) }
}

export async function updateStep(req: Request, res: Response, next: NextFunction) {
  try {
    const step = await emailCampaignService.updateStep(getSchoolId(req), String(req.params.stepId), req.body)
    res.json({ data: step })
  } catch (err) { next(err) }
}

export async function deleteStep(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await emailCampaignService.deleteStep(getSchoolId(req), String(req.params.stepId))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== Campaign Actions ====================

export async function activateCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await emailCampaignService.activateCampaign(getSchoolId(req), String(req.params.id))
    res.json({ data: campaign })
  } catch (err) { next(err) }
}

export async function pauseCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await emailCampaignService.pauseCampaign(getSchoolId(req), String(req.params.id))
    res.json({ data: campaign })
  } catch (err) { next(err) }
}

export async function executeCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await emailCampaignService.executeCampaign(getSchoolId(req), String(req.params.id))
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getCampaignStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await emailCampaignService.getCampaignStats(getSchoolId(req), String(req.params.id))
    res.json({ data: stats })
  } catch (err) { next(err) }
}
