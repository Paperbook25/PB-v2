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

// ==================== Surveys ====================

router.get('/surveys', readRoles, ctrl.listSurveys)
router.post('/surveys', adminRoles, ctrl.createSurvey)
router.get('/surveys/:id', readRoles, ctrl.getSurvey)
router.put('/surveys/:id', adminRoles, ctrl.updateSurvey)
router.delete('/surveys/:id', adminRoles, ctrl.deleteSurvey)
router.post('/surveys/:id/respond', ctrl.submitSurveyResponse)
router.get('/surveys/:id/responses', adminRoles, ctrl.getSurveyResponses)

// ==================== Events ====================

router.get('/events', readRoles, ctrl.listEvents)
router.post('/events', adminRoles, ctrl.createEvent)
router.get('/events/:id', readRoles, ctrl.getEvent)
router.put('/events/:id', adminRoles, ctrl.updateEvent)
router.delete('/events/:id', adminRoles, ctrl.deleteEvent)
router.post('/events/:id/register', ctrl.registerForEvent)
router.delete('/events/:id/register', ctrl.cancelEventRegistration)

// ==================== Stats ====================

router.get('/stats', readRoles, ctrl.getCommunicationStats)

export default router
