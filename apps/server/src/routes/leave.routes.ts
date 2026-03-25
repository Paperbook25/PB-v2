import { Router } from 'express'
import * as ctrl from '../controllers/leave.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All routes require auth
router.use(authMiddleware)

const adminPrincipal = rbacMiddleware('admin', 'principal')
const readRoles = rbacMiddleware('admin', 'principal', 'teacher')
const writeRoles = rbacMiddleware('admin', 'principal', 'teacher')

// ==================== Leave Stats (static route first) ====================

router.get('/stats', adminPrincipal, ctrl.getLeaveStats)

// ==================== Leave Requests CRUD ====================

router.get('/requests', adminPrincipal, ctrl.listLeaveRequests)
router.post('/requests', writeRoles, ctrl.applyLeave)
router.get('/requests/:id', readRoles, ctrl.getLeaveRequest)
router.post('/requests/:id/approve', adminPrincipal, ctrl.approveLeave)
router.post('/requests/:id/reject', adminPrincipal, ctrl.rejectLeave)
router.post('/requests/:id/cancel', writeRoles, ctrl.cancelLeave)

// ==================== Per-staff routes ====================

router.get('/balance/:staffId', readRoles, ctrl.getLeaveBalance)
router.get('/staff/:staffId', readRoles, ctrl.getStaffLeaveRequests)

export default router
