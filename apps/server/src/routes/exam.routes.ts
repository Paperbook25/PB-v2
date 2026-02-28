import { Router } from 'express'
import * as examController from '../controllers/exam.controller.js'
import { authMiddleware, rbacMiddleware, validate } from '../middleware/index.js'
import {
  createExamSchema, updateExamSchema, submitMarksSchema,
  createGradeScaleSchema, updateGradeScaleSchema,
  generateReportCardsSchema, createExamSlotSchema,
  createQuestionPaperSchema,
} from '../validators/exam.validators.js'

const examRouter = Router()
const gradeScaleRouter = Router()
const reportCardRouter = Router()
const studentExamRouter = Router()

// All routes require auth
examRouter.use(authMiddleware)
gradeScaleRouter.use(authMiddleware)
reportCardRouter.use(authMiddleware)
studentExamRouter.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')
const teacherRoles = rbacMiddleware('admin', 'principal', 'teacher')
const allRoles = rbacMiddleware('admin', 'principal', 'teacher', 'student', 'parent')

// ==================== Static routes (MUST be before /:id and /:examId) ====================

examRouter.get('/my-marks', rbacMiddleware('student'), examController.getMyMarks)
examRouter.get('/my-children-marks', rbacMiddleware('parent'), examController.getMyChildrenMarks)
examRouter.get('/my-report-card', rbacMiddleware('student'), examController.getMyReportCard)
examRouter.get('/co-scholastic', allRoles, examController.listCoScholastic)
examRouter.post('/co-scholastic', teacherRoles, examController.submitCoScholastic)
examRouter.get('/question-papers', teacherRoles, examController.listQuestionPapers)
examRouter.post('/question-papers', teacherRoles, validate(createQuestionPaperSchema), examController.createQuestionPaper)
examRouter.get('/question-papers/:id', teacherRoles, examController.getQuestionPaper)
examRouter.delete('/question-papers/:id', adminRoles, examController.deleteQuestionPaper)

// ==================== Exam CRUD ====================

examRouter.get('/', allRoles, examController.listExams)
examRouter.post('/', adminRoles, validate(createExamSchema), examController.createExam)
examRouter.get('/:id', allRoles, examController.getExam)
examRouter.put('/:id', adminRoles, validate(updateExamSchema), examController.updateExam)
examRouter.delete('/:id', adminRoles, examController.deleteExam)
examRouter.post('/:id/publish', adminRoles, examController.publishExam)

// ==================== Exam sub-resources ====================

examRouter.get('/:examId/students', teacherRoles, examController.getStudentsForMarks)
examRouter.get('/:examId/marks', allRoles, examController.getMarks)
examRouter.post('/:examId/marks', teacherRoles, validate(submitMarksSchema), examController.submitMarks)
examRouter.get('/:examId/report-cards', allRoles, examController.getReportCards)
examRouter.get('/:examId/timetable', allRoles, examController.getExamTimetable)
examRouter.post('/:examId/timetable', adminRoles, validate(createExamSlotSchema), examController.createExamSlot)
examRouter.get('/:examId/analytics', teacherRoles, examController.getExamAnalytics)

// ==================== Grade Scales ====================

gradeScaleRouter.get('/', allRoles, examController.listGradeScales)
gradeScaleRouter.post('/', adminRoles, validate(createGradeScaleSchema), examController.createGradeScale)
gradeScaleRouter.get('/:id', allRoles, examController.getGradeScale)
gradeScaleRouter.put('/:id', adminRoles, validate(updateGradeScaleSchema), examController.updateGradeScale)
gradeScaleRouter.delete('/:id', adminRoles, examController.deleteGradeScale)

// ==================== Report Cards ====================

reportCardRouter.post('/generate', adminRoles, validate(generateReportCardsSchema), examController.generateReportCards)
reportCardRouter.delete('/:id', adminRoles, examController.deleteReportCard)

// ==================== Student routes (marks / progress / report-card) ====================

studentExamRouter.get('/:studentId/marks', allRoles, examController.getStudentMarks)
studentExamRouter.get('/:studentId/progress', allRoles, examController.getStudentProgress)
studentExamRouter.get('/:studentId/report-card', allRoles, examController.getStudentReportCard)

export { examRouter, gradeScaleRouter, reportCardRouter, studentExamRouter }
