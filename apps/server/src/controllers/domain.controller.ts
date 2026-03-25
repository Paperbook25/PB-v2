import type { Request, Response, NextFunction } from 'express'
import * as domainService from '../services/domain.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Domain operations require a school subdomain.')
  }
  return req.schoolId
}

export async function listDomains(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const domains = await domainService.listMappings(schoolId)
    res.json({ data: domains })
  } catch (err) {
    next(err)
  }
}

export async function addDomain(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const { domain } = req.body
    if (!domain || typeof domain !== 'string') {
      throw AppError.badRequest('domain is required and must be a string.')
    }
    const mapping = await domainService.createMapping(schoolId, domain)
    res.status(201).json({ data: mapping })
  } catch (err) {
    next(err)
  }
}

export async function verifyDomain(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const id = String(req.params.id)
    const result = await domainService.verifyDns(schoolId, id)
    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}

export async function deleteDomain(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const id = String(req.params.id)
    const result = await domainService.deleteMapping(schoolId, id)
    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}
