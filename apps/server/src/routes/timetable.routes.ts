import { Router } from 'express'
import * as timetableController from '../controllers/timetable.controller.js'
import { authMiddleware, rbacMiddleware, validate } from '../middleware/index.js'
import {
  createRoomSchema, updateRoomSchema, createTimetableSchema,
  updateTimetableSchema, addEntrySchema, createSubstitutionSchema,
  updatePeriodDefSchema,
} from '../validators/timetable.validators.js'

const router = Router()

// All timetable routes require auth
router.use(authMiddleware)

const adminPrincipal = rbacMiddleware('admin', 'principal')
const readRoles = rbacMiddleware('admin', 'principal', 'teacher')
const writeRoles = rbacMiddleware('admin', 'principal', 'teacher')

// ==================== Static routes ====================

// Stats
router.get('/stats', readRoles, timetableController.getStats)

// Period definitions
router.get('/periods', readRoles, timetableController.getPeriodDefinitions)
router.put('/periods/:id', adminPrincipal, validate(updatePeriodDefSchema), timetableController.updatePeriodDefinition)

// Subjects
router.get('/subjects', readRoles, timetableController.getSubjects)

// Rooms CRUD
router.get('/rooms', readRoles, timetableController.listRooms)
router.post('/rooms', adminPrincipal, validate(createRoomSchema), timetableController.createRoom)
router.put('/rooms/:id', adminPrincipal, validate(updateRoomSchema), timetableController.updateRoom)
router.delete('/rooms/:id', adminPrincipal, timetableController.deleteRoom)

// Timetables CRUD
router.get('/timetables', readRoles, timetableController.listTimetables)
router.post('/timetables', adminPrincipal, validate(createTimetableSchema), timetableController.createTimetable)

// Substitutions
router.get('/substitutions', readRoles, timetableController.listSubstitutions)
router.post('/substitutions', writeRoles, validate(createSubstitutionSchema), timetableController.createSubstitution)
router.patch('/substitutions/:id/approve', adminPrincipal, timetableController.approveSubstitution)
router.patch('/substitutions/:id/reject', adminPrincipal, timetableController.rejectSubstitution)
router.delete('/substitutions/:id', adminPrincipal, timetableController.deleteSubstitution)

// Entry delete
router.delete('/entries/:id', adminPrincipal, timetableController.deleteEntry)

// ==================== Parameterized routes ====================

// Timetable by ID
router.get('/timetables/:id', readRoles, timetableController.getTimetable)
router.put('/timetables/:id', adminPrincipal, validate(updateTimetableSchema), timetableController.updateTimetable)
router.patch('/timetables/:id/publish', adminPrincipal, timetableController.publishTimetable)
router.post('/timetables/:id/entries', adminPrincipal, validate(addEntrySchema), timetableController.addEntry)

// Teacher/Room views
router.get('/teachers/:teacherId/timetable', readRoles, timetableController.getTeacherTimetable)
router.get('/rooms/:roomId/timetable', readRoles, timetableController.getRoomTimetable)

export default router
