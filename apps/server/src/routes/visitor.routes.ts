import { Router } from 'express'
import * as visitorController from '../controllers/visitor.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All visitor routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Stats ====================
router.get('/stats', adminRoles, visitorController.getVisitorStats)

// ==================== Visitors ====================
router.get('/', adminRoles, visitorController.listVisitors)
router.get('/:id', adminRoles, visitorController.getVisitor)
router.post('/', adminRoles, visitorController.checkIn)
router.patch('/:id/checkout', adminRoles, visitorController.checkOut)
router.delete('/:id', adminRoles, visitorController.deleteVisitor)

export default router
