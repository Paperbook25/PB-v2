import { Router } from 'express'
import * as staffAttendanceController from '../controllers/staff-attendance.controller.js'
import { authMiddleware, rbacMiddleware, validate } from '../middleware/index.js'
import {
  markStaffAttendanceSchema, createLeaveRequestSchema, updateLeaveRequestSchema,
} from '../validators/staff-attendance.validators.js'

const router = Router()

// All routes require auth
router.use(authMiddleware)

const adminPrincipal = rbacMiddleware('admin', 'principal')
const readRoles = rbacMiddleware('admin', 'principal', 'teacher')
const writeRoles = rbacMiddleware('admin', 'principal', 'teacher')

// ==================== Static routes ====================

// Staff attendance (admin/principal only for bulk marking)
router.get('/attendance', adminPrincipal, staffAttendanceController.getStaffDailyAttendance)
router.post('/attendance', adminPrincipal, validate(markStaffAttendanceSchema), staffAttendanceController.markStaffAttendance)

// Leave requests (all)
router.get('/leave-requests', adminPrincipal, staffAttendanceController.listAllLeaveRequests)
router.patch('/leave-requests/:id', adminPrincipal, validate(updateLeaveRequestSchema), staffAttendanceController.updateLeaveRequest)

// ==================== Per-staff routes (MUST be before /:id in main staff router) ====================

router.get('/:id/attendance', readRoles, staffAttendanceController.getStaffAttendanceHistory)
router.get('/:id/attendance/summary', readRoles, staffAttendanceController.getStaffAttendanceSummary)
router.get('/:id/leave-balance', readRoles, staffAttendanceController.getLeaveBalance)
router.get('/:id/leave-requests', readRoles, staffAttendanceController.listStaffLeaveRequests)
router.post('/:id/leave-requests', writeRoles, validate(createLeaveRequestSchema), staffAttendanceController.createLeaveRequest)

export default router
