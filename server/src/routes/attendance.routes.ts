import { Router } from 'express'
import * as attendanceController from '../controllers/attendance.controller.js'
import { authMiddleware, rbacMiddleware, validate } from '../middleware/index.js'
import {
  markDailyAttendanceSchema, markPeriodAttendanceSchema,
  updatePeriodDefinitionSchema,
} from '../validators/attendance.validators.js'

const router = Router()

// All attendance routes require auth
router.use(authMiddleware)

const readRoles = rbacMiddleware('admin', 'principal', 'teacher')
const writeRoles = rbacMiddleware('admin', 'principal', 'teacher')
const adminPrincipal = rbacMiddleware('admin', 'principal')
const studentRole = rbacMiddleware('student')
const parentRole = rbacMiddleware('parent')

// ==================== Static routes (before /:id) ====================

// Student self-view and parent view
router.get('/my', studentRole, attendanceController.getMyAttendance)
router.get('/my-children', parentRole, attendanceController.getMyChildrenAttendance)

// List/query endpoints
router.get('/students', readRoles, attendanceController.getStudents)
router.get('/history', readRoles, attendanceController.getAttendanceHistory)
router.get('/report', readRoles, attendanceController.getAttendanceReport)
router.get('/summary', readRoles, attendanceController.getAttendanceSummary)

// Period attendance
router.get('/periods/definitions', readRoles, attendanceController.getPeriodDefinitions)
router.put('/periods/definitions/:id', adminPrincipal, validate(updatePeriodDefinitionSchema), attendanceController.updatePeriodDefinition)
router.get('/periods/summary', readRoles, attendanceController.getPeriodSummary)
router.get('/periods', readRoles, attendanceController.getPeriodAttendance)
router.post('/periods', writeRoles, validate(markPeriodAttendanceSchema), attendanceController.markPeriodAttendance)

// Daily attendance (root)
router.get('/', readRoles, attendanceController.getDailyAttendance)
router.post('/', writeRoles, validate(markDailyAttendanceSchema), attendanceController.markDailyAttendance)

export default router
