import type { Request, Response, NextFunction } from 'express'
import * as settingsService from '../services/settings.service.js'

// ==================== SCHOOL PROFILE ====================

export async function getSchoolProfile(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.getSchoolProfile()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function updateSchoolProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateSchoolProfile(req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== ACADEMIC YEARS ====================

export async function listAcademicYears(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.listAcademicYears()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createAcademicYear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.createAcademicYear(req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateAcademicYear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateAcademicYear(String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function deleteAcademicYear(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingsService.deleteAcademicYear(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function setCurrentAcademicYear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.setCurrentAcademicYear(String(req.params.id))
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== CLASSES ====================

export async function listClasses(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.listClasses()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createClass(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.createClass(req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateClass(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateClass(String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function deleteClass(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingsService.deleteClass(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== SUBJECTS ====================

export async function listSubjects(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.listSubjects()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createSubject(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.createSubject(req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateSubject(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateSubject(String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function deleteSubject(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingsService.deleteSubject(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== NOTIFICATIONS ====================

export async function getNotificationPreferences(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.getNotificationPreferences()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function updateNotificationPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateNotificationPreferences(req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== BACKUP ====================

export async function getBackupConfig(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.getBackupConfig()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function updateBackupConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateBackupConfig(req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function triggerBackup(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingsService.triggerBackup()
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== THEME ====================

export async function getThemeConfig(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.getThemeConfig()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function updateThemeConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateThemeConfig(req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== CALENDAR ====================

export async function listCalendarEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.listCalendarEvents({
      type: req.query.type as string | undefined,
      month: req.query.month as string | undefined,
    })
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createCalendarEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.createCalendarEvent(req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateCalendarEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateCalendarEvent(String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function deleteCalendarEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingsService.deleteCalendarEvent(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

// ==================== EMAIL TEMPLATES ====================

export async function listEmailTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.listEmailTemplates({
      category: req.query.category as string | undefined,
    })
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getEmailTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.getEmailTemplate(String(req.params.id))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createEmailTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.createEmailTemplate(req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateEmailTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.updateEmailTemplate(String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function deleteEmailTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingsService.deleteEmailTemplate(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}
