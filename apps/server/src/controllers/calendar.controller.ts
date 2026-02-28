import type { Request, Response, NextFunction } from 'express'
import * as calendarService from '../services/calendar.service.js'

// GET /api/calendar/events?startDate=...&endDate=...&classId=...&teacherId=...&type=...
export async function getEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      startDate, endDate, classId, sectionId, teacherId, type,
    } = req.query as Record<string, string | undefined>

    const events = await calendarService.getCalendarEvents({
      startDate: startDate || '',
      endDate: endDate || '',
      classId,
      sectionId,
      teacherId,
      type: (type as 'all' | 'classes' | 'events' | 'holidays') || 'all',
    })

    res.json({ data: events })
  } catch (err) {
    next(err)
  }
}

// GET /api/calendar/schedule/class/:classId?sectionId=...
export async function getClassSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const classId = String(req.params.classId)
    const sectionId = req.query.sectionId as string | undefined

    const schedule = await calendarService.getClassSchedule(classId, sectionId)
    res.json({ data: schedule })
  } catch (err) {
    next(err)
  }
}

// GET /api/calendar/schedule/teacher/:teacherId
export async function getTeacherSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const teacherId = String(req.params.teacherId)

    const schedule = await calendarService.getTeacherSchedule(teacherId)
    res.json({ data: schedule })
  } catch (err) {
    next(err)
  }
}

// GET /api/calendar/filters
export async function getFilters(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = await calendarService.getCalendarFilters()
    res.json({ data: filters })
  } catch (err) {
    next(err)
  }
}

// POST /api/calendar/events
export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const createdBy = req.user?.name || 'Unknown'
    const result = await calendarService.createCalendarEvent({
      ...req.body,
      createdBy,
    })
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

// PUT /api/calendar/events/:id
export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id)
    const result = await calendarService.updateCalendarEvent(id, req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/calendar/events/:id
export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id)
    await calendarService.deleteCalendarEvent(id)
    res.json({ success: true, message: 'Calendar event deleted successfully' })
  } catch (err) {
    next(err)
  }
}
