import { Router } from 'express'
import * as calendarController from '../controllers/calendar.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All calendar routes require auth
router.use(authMiddleware)

// Read access for most roles
const readRoles = rbacMiddleware('admin', 'principal', 'teacher', 'student', 'parent')
// Write access for admin/principal only
const writeRoles = rbacMiddleware('admin', 'principal')

// Read endpoints
router.get('/events', readRoles, calendarController.getEvents)
router.get('/schedule/class/:classId', readRoles, calendarController.getClassSchedule)
router.get('/schedule/teacher/:teacherId', readRoles, calendarController.getTeacherSchedule)
router.get('/filters', readRoles, calendarController.getFilters)

// Write endpoints
router.post('/events', writeRoles, calendarController.createEvent)
router.put('/events/:id', writeRoles, calendarController.updateEvent)
router.delete('/events/:id', writeRoles, calendarController.deleteEvent)

export default router
