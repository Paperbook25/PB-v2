import { Router } from 'express'
import * as parentPortalController from '../controllers/parent-portal.controller.js'
import { authMiddleware } from '../middleware/index.js'

const router = Router()

// All parent portal routes require auth
router.use(authMiddleware)

// ==================== Overview ====================
router.get('/overview', parentPortalController.getChildOverview)

// ==================== Attendance ====================
router.get('/attendance/:studentId', parentPortalController.getChildAttendance)

// ==================== Fees ====================
router.get('/fees/:studentId', parentPortalController.getChildFees)

// ==================== Marks ====================
router.get('/marks/:studentId', parentPortalController.getChildMarks)

// ==================== Announcements ====================
router.get('/announcements', parentPortalController.getAnnouncements)

export default router
