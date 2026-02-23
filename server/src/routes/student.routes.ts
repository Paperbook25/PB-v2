import { Router } from 'express'
import * as studentController from '../controllers/student.controller.js'
import * as attendanceController from '../controllers/attendance.controller.js'
import { authMiddleware, rbacMiddleware, validate, auditMiddleware } from '../middleware/index.js'
import {
  createStudentSchema, updateStudentSchema, createDocumentSchema,
  upsertHealthRecordSchema, createSkillSchema, updateSkillSchema,
  createPortfolioItemSchema, updatePortfolioItemSchema,
  linkSiblingSchema, promoteStudentsSchema, bulkImportStudentsSchema,
} from '../validators/student.validators.js'

const router = Router()

// All student routes require auth
router.use(authMiddleware)

const audit = auditMiddleware({ module: 'students', entityType: 'student' })
const readRoles = rbacMiddleware('admin', 'principal', 'teacher')
const writeRoles = rbacMiddleware('admin', 'principal')

// ==================== Static routes (before /:id) ====================

router.post('/promote', writeRoles, validate(promoteStudentsSchema), audit, studentController.promoteStudents)
router.post('/bulk-import', writeRoles, audit, studentController.bulkImport)
router.get('/export', readRoles, studentController.exportStudents)

// ==================== CRUD ====================

router.get('/', readRoles, studentController.listStudents)
router.post('/', writeRoles, validate(createStudentSchema), audit, studentController.createStudent)
router.get('/:id', readRoles, studentController.getStudent)
router.put('/:id', writeRoles, validate(updateStudentSchema), audit, studentController.updateStudent)
router.delete('/:id', writeRoles, audit, studentController.deleteStudent)

// ==================== Attendance ====================

router.get('/:studentId/attendance', readRoles, attendanceController.getStudentAttendance)

// ==================== Documents ====================

router.get('/:id/documents', readRoles, studentController.listDocuments)
router.post('/:id/documents', writeRoles, validate(createDocumentSchema), audit, studentController.createDocument)
router.delete('/:id/documents/:docId', writeRoles, audit, studentController.deleteDocument)
router.patch('/:id/documents/:docId/verify', writeRoles, audit, studentController.verifyDocument)

// ==================== Health ====================

router.get('/:id/health', readRoles, studentController.getHealthRecord)
router.put('/:id/health', writeRoles, validate(upsertHealthRecordSchema), audit, studentController.upsertHealthRecord)

// ==================== Timeline ====================

router.get('/:id/timeline', readRoles, studentController.listTimeline)

// ==================== Siblings ====================

router.get('/:id/siblings', readRoles, studentController.getSiblings)
router.post('/:id/siblings', writeRoles, validate(linkSiblingSchema), audit, studentController.linkSibling)
router.delete('/:id/siblings/:siblingId', writeRoles, audit, studentController.unlinkSibling)

// ==================== ID Card ====================

router.get('/:id/id-card', readRoles, studentController.getIdCard)

// ==================== Portfolio & Skills ====================

router.get('/:id/portfolio', readRoles, studentController.getPortfolio)
router.put('/:id/portfolio', writeRoles, audit, studentController.updatePortfolio)
router.post('/:id/skills', writeRoles, validate(createSkillSchema), audit, studentController.addSkill)
router.put('/:id/skills/:skillId', writeRoles, validate(updateSkillSchema), audit, studentController.updateSkill)
router.delete('/:id/skills/:skillId', writeRoles, audit, studentController.deleteSkill)
router.post('/:id/portfolio/items', writeRoles, validate(createPortfolioItemSchema), audit, studentController.addPortfolioItem)
router.put('/:id/portfolio/items/:itemId', writeRoles, validate(updatePortfolioItemSchema), audit, studentController.updatePortfolioItem)
router.delete('/:id/portfolio/items/:itemId', writeRoles, audit, studentController.deletePortfolioItem)

export default router
