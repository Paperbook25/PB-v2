import { Router } from 'express'
import * as qbController from '../controllers/question-bank.controller.js'
import { authMiddleware, rbacMiddleware, validate } from '../middleware/index.js'
import {
  createQuestionSchema, updateQuestionSchema,
  createOnlineExamSchema, updateOnlineExamSchema,
} from '../validators/question-bank.validators.js'

const questionBankRouter = Router()
const onlineExamRouter = Router()

// All routes require auth
questionBankRouter.use(authMiddleware)
onlineExamRouter.use(authMiddleware)

const teacherRoles = rbacMiddleware('admin', 'principal', 'teacher')
const allAuth = rbacMiddleware('admin', 'principal', 'teacher', 'student', 'parent')

// ==================== Question Bank - Static routes before /:id ====================

questionBankRouter.get('/stats', teacherRoles, qbController.getQuestionStats)
questionBankRouter.post('/import', teacherRoles, qbController.importQuestions)

// ==================== Question Bank CRUD ====================

questionBankRouter.get('/', teacherRoles, qbController.listQuestions)
questionBankRouter.post('/', teacherRoles, validate(createQuestionSchema), qbController.createQuestion)
questionBankRouter.get('/:id', teacherRoles, qbController.getQuestion)
questionBankRouter.put('/:id', teacherRoles, validate(updateQuestionSchema), qbController.updateQuestion)
questionBankRouter.delete('/:id', teacherRoles, qbController.deleteQuestion)

// ==================== Online Exams - Static routes before /:id ====================

onlineExamRouter.get('/my-attempts', rbacMiddleware('student'), qbController.getMyAttempts)

// ==================== Online Exams CRUD ====================

onlineExamRouter.get('/', teacherRoles, qbController.listOnlineExams)
onlineExamRouter.post('/', teacherRoles, validate(createOnlineExamSchema), qbController.createOnlineExam)
onlineExamRouter.get('/:id', allAuth, qbController.getOnlineExam)
onlineExamRouter.put('/:id', teacherRoles, validate(updateOnlineExamSchema), qbController.updateOnlineExam)
onlineExamRouter.delete('/:id', teacherRoles, qbController.deleteOnlineExam)

// ==================== Attempt sub-resources ====================

onlineExamRouter.post('/:id/start', allAuth, qbController.startAttempt)
onlineExamRouter.post('/:id/submit', allAuth, qbController.submitAttempt)
onlineExamRouter.get('/:id/attempts', teacherRoles, qbController.getAttempts)
onlineExamRouter.post('/:id/report-violation', allAuth, qbController.reportViolation)

export { questionBankRouter, onlineExamRouter }
