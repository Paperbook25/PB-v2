import { Router } from 'express'
import * as studentLeaveController from '../controllers/student-leave.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

router.use(authMiddleware)

const adminPrincipal = rbacMiddleware('admin', 'principal')
const readRoles = rbacMiddleware('admin', 'principal', 'teacher')
const applyRoles = rbacMiddleware('admin', 'principal', 'teacher', 'student', 'parent')
const parentRole = rbacMiddleware('parent')

// List all student leave requests (admin/principal/teacher)
router.get('/', readRoles, studentLeaveController.listLeaveRequests)

// Parent views own children's leave requests
router.get('/my-children', parentRole, studentLeaveController.getMyChildrenLeaveRequests)

// Apply for leave (student/parent/teacher/admin)
router.post('/:studentId', applyRoles, studentLeaveController.createLeaveRequest)

// Approve/reject (admin/principal only)
router.patch('/:id/review', adminPrincipal, studentLeaveController.reviewLeaveRequest)

// Cancel (student/parent can cancel their own pending requests)
router.patch('/:id/cancel', applyRoles, studentLeaveController.cancelLeaveRequest)

export default router
