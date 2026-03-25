import { Router } from 'express'
import * as ctrl from '../controllers/communication.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')
const readRoles = rbacMiddleware('admin', 'principal', 'teacher')

// ==================== Announcements ====================

router.get('/announcements', readRoles, ctrl.listAnnouncements)
router.post('/announcements', adminRoles, ctrl.createAnnouncement)
router.get('/announcements/:id', readRoles, ctrl.getAnnouncement)
router.put('/announcements/:id', adminRoles, ctrl.updateAnnouncement)
router.post('/announcements/:id/publish', adminRoles, ctrl.publishAnnouncement)
router.delete('/announcements/:id', adminRoles, ctrl.deleteAnnouncement)

// ==================== Circulars ====================

router.get('/circulars', readRoles, ctrl.listCirculars)
router.post('/circulars', adminRoles, ctrl.createCircular)
router.get('/circulars/:id', readRoles, ctrl.getCircular)
router.put('/circulars/:id', adminRoles, ctrl.updateCircular)
router.delete('/circulars/:id', adminRoles, ctrl.deleteCircular)

export default router
