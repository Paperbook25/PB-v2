import { Router } from 'express'
import * as admissionController from '../controllers/admission.controller.js'
import { authMiddleware, rbacMiddleware, validate } from '../middleware/index.js'
import {
  createApplicationSchema, updateApplicationSchema,
  createExamScheduleSchema, recordPaymentSchema,
} from '../validators/admission.validators.js'

const router = Router()
const publicRouter = Router()

// All admission routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Static routes (before /:id) ====================

router.get('/stats', adminRoles, admissionController.getStats)
router.get('/waitlist', adminRoles, admissionController.getWaitlist)
router.get('/class-capacity', adminRoles, admissionController.getClassCapacity)
router.get('/exam-schedules', adminRoles, admissionController.listExamSchedules)
router.post('/exam-schedules', adminRoles, validate(createExamScheduleSchema), admissionController.createExamSchedule)
router.get('/exam-results', adminRoles, admissionController.getExamResults)
router.get('/communications', adminRoles, admissionController.listCommunications)
router.get('/communication-templates', adminRoles, admissionController.listCommunicationTemplates)
router.post('/send-communication', adminRoles, admissionController.sendCommunication)
router.get('/payments', adminRoles, admissionController.listPayments)
router.get('/analytics', adminRoles, admissionController.getAnalytics)
router.get('/export', adminRoles, admissionController.exportApplications)

// ==================== CRUD ====================

router.get('/', adminRoles, admissionController.listApplications)
router.post('/', adminRoles, validate(createApplicationSchema), admissionController.createApplication)
router.get('/:id', adminRoles, admissionController.getApplication)
router.put('/:id', adminRoles, validate(updateApplicationSchema), admissionController.updateApplication)
router.patch('/:id/status', adminRoles, admissionController.changeStatus)
router.delete('/:id', adminRoles, admissionController.deleteApplication)

// ==================== Sub-resources ====================

router.post('/:id/documents', adminRoles, admissionController.addDocument)
router.patch('/:id/documents/:docId', adminRoles, admissionController.updateDocument)
router.post('/:id/notes', adminRoles, admissionController.addNote)
router.patch('/:id/interview', adminRoles, admissionController.updateInterview)
router.patch('/:id/entrance-exam', adminRoles, admissionController.updateEntranceExam)
router.post('/:id/exam-score', adminRoles, admissionController.recordExamScore)
router.get('/:id/payment', adminRoles, admissionController.getPayment)
router.post('/:id/payment', adminRoles, validate(recordPaymentSchema), admissionController.recordPayment)

// ==================== Public Route ====================

publicRouter.post('/apply', validate(createApplicationSchema), admissionController.publicApply)

export default router
export { publicRouter as admissionPublicRouter }
