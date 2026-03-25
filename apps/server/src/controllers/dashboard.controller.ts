import type { Request, Response, NextFunction } from 'express'
import * as dashboardService from '../services/dashboard.service.js'
import { AppError } from '../utils/errors.js'
import { prisma } from '../config/db.js'

// Helper: extract and validate schoolId from tenant middleware
function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Dashboard operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== ADMIN / PRINCIPAL ====================

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getStats(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getFeeCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getFeeCollection(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getAttendance(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getClassWiseStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getClassWiseStudents(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getAnnouncements(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getAnnouncements(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getEvents(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getActivities(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getQuickStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getQuickStats(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getPaymentMethods(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getPaymentMethods(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getFeeTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getFeeTransactions(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getClassWiseCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getClassWiseCollection(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== ACCOUNTANT ====================

export async function getAccountantStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getAccountantStats(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getTodayCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTodayCollection(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getCollectionTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getCollectionTrends(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getPendingDues(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getPendingDues(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getRecentTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getRecentTransactions(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== TEACHER ====================

export async function getTeacherStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTeacherStats(getSchoolId(req), req.user!.userId)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getTeacherSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTeacherSchedule(getSchoolId(req), req.user!.userId)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getTeacherClasses(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTeacherClasses(getSchoolId(req), req.user!.userId)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getTeacherTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTeacherTasks(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getStrugglingStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getStrugglingStudents(getSchoolId(req), req.user!.userId)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getPendingGrades(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getPendingGrades(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== PARENT ====================

export async function getChildTimetable(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.query.studentId as string | undefined
    const data = await dashboardService.getChildTimetable(getSchoolId(req), req.user!.userId, studentId)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getChildAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getChildAssignments(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getChildTeachers(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.query.studentId as string | undefined
    const data = await dashboardService.getChildTeachers(getSchoolId(req), req.user!.userId, studentId)
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== LIBRARIAN ====================

export async function getLibrarianStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getLibrarianStats(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getCirculationStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getCirculationStats(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getOverdueBooks(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getOverdueBooks(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getPendingReservations(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getPendingReservations(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getLibraryActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getLibraryActivity(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== TRANSPORT MANAGER ====================

export async function getTransportStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getTransportStats(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getFleetStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getFleetStatus(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getMaintenanceAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getMaintenanceAlerts(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getRoutePerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getRoutePerformance(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getDriverStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getDriverStatus(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== STUDENT ====================

export async function getStudentCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { studentId: true },
    })
    if (!user?.studentId) {
      res.json({ data: [] })
      return
    }
    const data = await dashboardService.getStudentCourses(getSchoolId(req), user.studentId)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getStudentAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getStudentAssignments(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getStudentTransport(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getStudentTransport(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

// ==================== NOTIFICATIONS ====================

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getNotifications(getSchoolId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await dashboardService.markNotificationRead(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function markAllNotificationsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await dashboardService.markAllNotificationsRead(getSchoolId(req))
    res.json(result)
  } catch (err) { next(err) }
}
