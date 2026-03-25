import { Router } from 'express'
import * as complaintController from '../controllers/complaint.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All complaint routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Stats ====================
router.get('/stats', adminRoles, complaintController.getComplaintStats)

// ==================== Complaints ====================
router.get('/', complaintController.listComplaints)
router.get('/:id', complaintController.getComplaint)
router.post('/', complaintController.createComplaint)
router.patch('/:id', adminRoles, complaintController.updateComplaint)
router.patch('/:id/assign', adminRoles, complaintController.assignComplaint)
router.patch('/:id/resolve', adminRoles, complaintController.resolveComplaint)
router.delete('/:id', adminRoles, complaintController.deleteComplaint)

export default router
