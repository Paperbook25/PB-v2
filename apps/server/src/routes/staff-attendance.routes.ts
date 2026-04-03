import { Router } from 'express'
import * as staffAttendanceController from '../controllers/staff-attendance.controller.js'
import { authMiddleware, rbacMiddleware, validate } from '../middleware/index.js'
import {
  markStaffAttendanceSchema, createLeaveRequestSchema, updateLeaveRequestSchema,
  updateLeavePolicySchema, createCustomLeaveTypeSchema, createBlackoutDateSchema,
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
router.patch('/leave-requests/:id/cancel', writeRoles, staffAttendanceController.cancelLeaveRequest)

// ==================== Leave Policy (admin/principal) ====================

router.get('/leave-policies', adminPrincipal, staffAttendanceController.getLeavePolicy)
router.put('/leave-policies', adminPrincipal, validate(updateLeavePolicySchema), staffAttendanceController.updateLeavePolicy)

router.get('/leave-types', adminPrincipal, staffAttendanceController.listCustomLeaveTypes)
router.post('/leave-types', adminPrincipal, validate(createCustomLeaveTypeSchema), staffAttendanceController.createCustomLeaveType)
router.put('/leave-types/:id', adminPrincipal, staffAttendanceController.updateCustomLeaveType)
router.delete('/leave-types/:id', adminPrincipal, staffAttendanceController.deleteCustomLeaveType)

router.get('/blackout-dates', adminPrincipal, staffAttendanceController.listBlackoutDates)
router.post('/blackout-dates', adminPrincipal, validate(createBlackoutDateSchema), staffAttendanceController.createBlackoutDate)
router.delete('/blackout-dates/:id', adminPrincipal, staffAttendanceController.deleteBlackoutDate)

router.post('/allocate-annual-leave', adminPrincipal, staffAttendanceController.allocateAnnualLeave)

// ==================== Per-staff routes (MUST be before /:id in main staff router) ====================

router.get('/:id/attendance', readRoles, staffAttendanceController.getStaffAttendanceHistory)
router.get('/:id/attendance/summary', readRoles, staffAttendanceController.getStaffAttendanceSummary)
router.get('/:id/leave-balance', readRoles, staffAttendanceController.getLeaveBalance)
router.get('/:id/leave-requests', readRoles, staffAttendanceController.listStaffLeaveRequests)
router.post('/:id/leave-requests', writeRoles, validate(createLeaveRequestSchema), staffAttendanceController.createLeaveRequest)

export default router
