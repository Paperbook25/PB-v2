import type { Request, Response, NextFunction } from 'express'
import * as contactService from '../services/contact.service.js'
import * as emailCampaignService from '../services/email-campaign.service.js'
import { AppError } from '../utils/errors.js'
import {
  submitContactSchema,
  updateContactSchema,
  listContactsSchema,
} from '../validators/contact.validators.js'

// Helper: extract and validate schoolId from tenant middleware
function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Contact operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== Public ====================

export async function submitContact(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const input = submitContactSchema.parse(req.body)
    const contact = await contactService.submitContact(schoolId, input)

    // Fire-and-forget: trigger email campaigns for contact form submissions
    emailCampaignService.processTrigger(schoolId, 'contact_form', input.email, input.name).catch(() => {})

    res.status(201).json({ data: contact })
  } catch (err) { next(err) }
}

// ==================== Admin ====================

export async function listContacts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listContactsSchema.parse(req.query)
    const result = await contactService.listContacts(getSchoolId(req), query)
    res.json(result)
  } catch (err) { next(err) }
}

export async function getContact(req: Request, res: Response, next: NextFunction) {
  try {
    const contact = await contactService.getContactById(getSchoolId(req), String(req.params.id))
    res.json({ data: contact })
  } catch (err) { next(err) }
}

export async function updateContact(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateContactSchema.parse(req.body)
    const contact = await contactService.updateContact(getSchoolId(req), String(req.params.id), input)
    res.json({ data: contact })
  } catch (err) { next(err) }
}

export async function deleteContact(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await contactService.deleteContact(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function getContactStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await contactService.getContactStats(getSchoolId(req))
    res.json({ data: stats })
  } catch (err) { next(err) }
}
