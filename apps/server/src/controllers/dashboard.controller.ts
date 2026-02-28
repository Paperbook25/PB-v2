import type { Request, Response, NextFunction } from 'express'
import * as dashboardService from '../services/dashboard.service.js'

// ==================== ADMIN / PRINCIPAL ====================

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getStats()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getFeeCollection(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getFeeCollection()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getAttendance(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getAttendance()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getClassWiseStudents(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getClassWiseStudents()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getAnnouncements(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getAnnouncements()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getEvents(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getEvents()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getActivities(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getActivities()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getQuickStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getQuickStats()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getPaymentMethods(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getPaymentMethods()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getFeeTransactions(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getFeeTransactions()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getClassWiseCollection(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getClassWiseCollection()
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== ACCOUNTANT ====================

export async function getAccountantStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getAccountantStats()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getTodayCollection(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTodayCollection()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getCollectionTrends(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getCollectionTrends()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getPendingDues(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getPendingDues()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getRecentTransactions(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getRecentTransactions()
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== TEACHER ====================

export async function getTeacherStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTeacherStats(req.user!.userId)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getTeacherSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTeacherSchedule(req.user!.userId)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getTeacherClasses(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTeacherClasses(req.user!.userId)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getTeacherTasks(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTeacherTasks()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getStrugglingStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getStrugglingStudents(req.user!.userId)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getPendingGrades(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getPendingGrades()
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== PARENT ====================

export async function getChildTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.query.studentId as string | undefined
    const data = await dashboardService.getChildTimetable(req.user!.userId, studentId)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getChildAssignments(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getChildAssignments()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getChildTeachers(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.query.studentId as string | undefined
    const data = await dashboardService.getChildTeachers(req.user!.userId, studentId)
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== LIBRARIAN ====================

export async function getLibrarianStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getLibrarianStats()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getCirculationStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getCirculationStats()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getOverdueBooks(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getOverdueBooks()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getPendingReservations(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getPendingReservations()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getLibraryActivity(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getLibraryActivity()
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== TRANSPORT MANAGER ====================

export async function getTransportStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTransportStats()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getFleetStatus(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getFleetStatus()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getMaintenanceAlerts(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getMaintenanceAlerts()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getRoutePerformance(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getRoutePerformance()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getDriverStatus(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getDriverStatus()
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== STUDENT ====================

export async function getStudentCourses(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getStudentCourses()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getStudentAssignments(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getStudentAssignments()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getStudentTransport(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getStudentTransport()
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== NOTIFICATIONS ====================

export async function getNotifications(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getNotifications()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await dashboardService.markNotificationRead(String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function markAllNotificationsRead(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await dashboardService.markAllNotificationsRead()
    res.json(result)
  } catch (err) { next(err) }
}
