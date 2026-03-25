import { Router } from 'express'
import * as ctrl from '../controllers/report.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All routes require auth
router.use(authMiddleware)

const adminPrincipal = rbacMiddleware('admin', 'principal')
const readRoles = rbacMiddleware('admin', 'principal', 'teacher', 'accountant')

// ==================== Reports ====================

router.get('/overview', adminPrincipal, ctrl.getSchoolOverviewReport)
router.get('/attendance', readRoles, ctrl.getAttendanceReport)
router.get('/fee-collection', readRoles, ctrl.getFeeCollectionReport)
router.get('/student/:studentId', readRoles, ctrl.getStudentReport)
router.get('/class/:classId', readRoles, ctrl.getClassReport)
router.get('/exam/:examId', readRoles, ctrl.getExamReport)

export default router
