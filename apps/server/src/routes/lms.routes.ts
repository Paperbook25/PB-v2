import { Router } from 'express'
import * as lmsController from '../controllers/lms.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All LMS routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal', 'teacher')

// ==================== Stats ====================
router.get('/stats', adminRoles, lmsController.getLmsStats)

// ==================== Courses ====================
router.get('/courses', adminRoles, lmsController.listCourses)
router.get('/courses/:id', adminRoles, lmsController.getCourse)
router.post('/courses', adminRoles, lmsController.createCourse)
router.patch('/courses/:id', adminRoles, lmsController.updateCourse)
router.delete('/courses/:id', adminRoles, lmsController.deleteCourse)

// ==================== Lessons ====================
router.post('/courses/:courseId/lessons', adminRoles, lmsController.createLesson)
router.patch('/lessons/:id', adminRoles, lmsController.updateLesson)
router.delete('/lessons/:id', adminRoles, lmsController.deleteLesson)

// ==================== Assignments ====================
router.get('/assignments', adminRoles, lmsController.listAssignments)
router.get('/assignments/:id', adminRoles, lmsController.getAssignment)
router.post('/assignments', adminRoles, lmsController.createAssignment)
router.patch('/assignments/:id', adminRoles, lmsController.updateAssignment)
router.delete('/assignments/:id', adminRoles, lmsController.deleteAssignment)

// ==================== Submissions ====================
router.post('/assignments/:assignmentId/submit', authMiddleware, lmsController.submitAssignment)
router.patch('/submissions/:id/grade', adminRoles, lmsController.gradeSubmission)

export default router
