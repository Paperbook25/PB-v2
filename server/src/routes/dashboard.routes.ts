import { Router } from 'express'
import * as dc from '../controllers/dashboard.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All dashboard routes require authentication
router.use(authMiddleware)

// ==================== RBAC Groups ====================
const adminRoles = rbacMiddleware('admin', 'principal')
const accountantRoles = rbacMiddleware('admin', 'principal', 'accountant')
const teacherRoles = rbacMiddleware('admin', 'principal', 'teacher')
const parentRoles = rbacMiddleware('admin', 'principal', 'parent')
const librarianRoles = rbacMiddleware('admin', 'principal', 'librarian')
const transportRoles = rbacMiddleware('admin', 'principal', 'transport_manager')
const studentRoles = rbacMiddleware('admin', 'principal', 'student')
const anyRole = rbacMiddleware('admin', 'principal', 'teacher', 'accountant', 'librarian', 'transport_manager', 'student', 'parent')

// ==================== Admin / Principal Dashboard ====================
router.get('/stats', adminRoles, dc.getStats)
router.get('/fee-collection', adminRoles, dc.getFeeCollection)
router.get('/attendance', adminRoles, dc.getAttendance)
router.get('/class-wise-students', adminRoles, dc.getClassWiseStudents)
router.get('/announcements', anyRole, dc.getAnnouncements)
router.get('/events', anyRole, dc.getEvents)
router.get('/activities', adminRoles, dc.getActivities)
router.get('/quick-stats', adminRoles, dc.getQuickStats)
router.get('/payment-methods', adminRoles, dc.getPaymentMethods)
router.get('/fee-transactions', adminRoles, dc.getFeeTransactions)
router.get('/class-wise-collection', adminRoles, dc.getClassWiseCollection)

// ==================== Accountant Dashboard ====================
router.get('/accountant-stats', accountantRoles, dc.getAccountantStats)
router.get('/today-collection', accountantRoles, dc.getTodayCollection)
router.get('/collection-trends', accountantRoles, dc.getCollectionTrends)
router.get('/pending-dues', accountantRoles, dc.getPendingDues)
router.get('/recent-transactions', accountantRoles, dc.getRecentTransactions)

// ==================== Teacher Dashboard ====================
router.get('/teacher-stats', teacherRoles, dc.getTeacherStats)
router.get('/teacher-schedule', teacherRoles, dc.getTeacherSchedule)
router.get('/teacher-classes', teacherRoles, dc.getTeacherClasses)
router.get('/teacher-tasks', teacherRoles, dc.getTeacherTasks)
router.get('/struggling-students', teacherRoles, dc.getStrugglingStudents)
router.get('/pending-grades', teacherRoles, dc.getPendingGrades)

// ==================== Parent Dashboard ====================
router.get('/child-timetable', parentRoles, dc.getChildTimetable)
router.get('/child-assignments', parentRoles, dc.getChildAssignments)
router.get('/child-teachers', parentRoles, dc.getChildTeachers)

// ==================== Librarian Dashboard ====================
router.get('/librarian-stats', librarianRoles, dc.getLibrarianStats)
router.get('/circulation-stats', librarianRoles, dc.getCirculationStats)
router.get('/overdue-books', librarianRoles, dc.getOverdueBooks)
router.get('/pending-reservations', librarianRoles, dc.getPendingReservations)
router.get('/library-activity', librarianRoles, dc.getLibraryActivity)

// ==================== Transport Manager Dashboard ====================
router.get('/transport-stats', transportRoles, dc.getTransportStats)
router.get('/fleet-status', transportRoles, dc.getFleetStatus)
router.get('/maintenance-alerts', transportRoles, dc.getMaintenanceAlerts)
router.get('/route-performance', transportRoles, dc.getRoutePerformance)
router.get('/driver-status', transportRoles, dc.getDriverStatus)

// ==================== Student Dashboard ====================
router.get('/student-courses', studentRoles, dc.getStudentCourses)
router.get('/student-assignments', studentRoles, dc.getStudentAssignments)
router.get('/student-transport', studentRoles, dc.getStudentTransport)

export default router

// ==================== Notification Routes (separate router) ====================
export const notificationRouter = Router()

notificationRouter.use(authMiddleware)

// Static route must come before /:id param route
notificationRouter.patch('/mark-all-read', dc.markAllNotificationsRead)
notificationRouter.get('/', dc.getNotifications)
notificationRouter.patch('/:id/read', dc.markNotificationRead)
