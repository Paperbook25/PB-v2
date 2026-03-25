import { Router } from 'express'
import * as behaviorController from '../controllers/behavior.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All behavior routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal', 'teacher')

// ==================== Stats ====================
router.get('/stats', behaviorController.getBehaviorStats)

// ==================== Student-specific ====================
router.get('/student/:studentId', behaviorController.getStudentBehavior)

// ==================== Records ====================
router.get('/', behaviorController.listRecords)
router.get('/:id', behaviorController.getRecord)
router.post('/', adminRoles, behaviorController.createRecord)
router.patch('/:id', adminRoles, behaviorController.updateRecord)
router.delete('/:id', rbacMiddleware('admin', 'principal'), behaviorController.deleteRecord)

export default router
