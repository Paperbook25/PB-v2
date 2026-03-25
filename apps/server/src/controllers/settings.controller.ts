import type { Request, Response, NextFunction } from 'express'
import * as settingsService from '../services/settings.service.js'
import { AppError } from '../utils/errors.js'

// Helper: extract and validate schoolId from tenant middleware
function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Settings operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== SCHOOL PROFILE ====================

export async function getSchoolProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.getSchoolProfile(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function updateSchoolProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateSchoolProfile(getSchoolId(req), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== ACADEMIC YEARS ====================

export async function listAcademicYears(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.listAcademicYears(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createAcademicYear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.createAcademicYear(getSchoolId(req), req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateAcademicYear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateAcademicYear(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function deleteAcademicYear(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingsService.deleteAcademicYear(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function setCurrentAcademicYear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.setCurrentAcademicYear(getSchoolId(req), String(req.params.id))
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== CLASSES ====================

export async function listClasses(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.listClasses(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createClass(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.createClass(getSchoolId(req), req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateClass(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateClass(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function deleteClass(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingsService.deleteClass(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== SUBJECTS ====================

export async function listSubjects(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.listSubjects(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createSubject(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.createSubject(getSchoolId(req), req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateSubject(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateSubject(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function deleteSubject(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingsService.deleteSubject(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== NOTIFICATIONS ====================

export async function getNotificationPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.getNotificationPreferences(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function updateNotificationPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateNotificationPreferences(getSchoolId(req), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== BACKUP ====================

export async function getBackupConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.getBackupConfig(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function updateBackupConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateBackupConfig(getSchoolId(req), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function triggerBackup(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingsService.triggerBackup(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== THEME ====================

export async function getThemeConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.getThemeConfig(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function updateThemeConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateThemeConfig(getSchoolId(req), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== CALENDAR ====================

export async function listCalendarEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.listCalendarEvents(getSchoolId(req), {
      type: req.query.type as string | undefined,
      month: req.query.month as string | undefined,
    })
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createCalendarEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.createCalendarEvent(getSchoolId(req), req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateCalendarEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateCalendarEvent(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function deleteCalendarEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingsService.deleteCalendarEvent(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== EMAIL TEMPLATES ====================

export async function listEmailTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.listEmailTemplates(getSchoolId(req), {
      category: req.query.category as string | undefined,
    })
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getEmailTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.getEmailTemplate(getSchoolId(req), String(req.params.id))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createEmailTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.createEmailTemplate(getSchoolId(req), req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateEmailTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateEmailTemplate(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function deleteEmailTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingsService.deleteEmailTemplate(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}
