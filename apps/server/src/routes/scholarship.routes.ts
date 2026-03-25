import { Router } from 'express'
import * as scholarshipController from '../controllers/scholarship.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All scholarship routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Stats ====================
router.get('/stats', adminRoles, scholarshipController.getScholarshipStats)

// ==================== Recipients ====================
router.get('/:scholarshipId/recipients', adminRoles, scholarshipController.listRecipients)
router.post('/:scholarshipId/recipients', adminRoles, scholarshipController.awardScholarship)
router.patch('/recipients/:id/revoke', adminRoles, scholarshipController.revokeScholarship)

// ==================== Scholarships CRUD ====================
router.get('/', adminRoles, scholarshipController.listScholarships)
router.get('/:id', adminRoles, scholarshipController.getScholarship)
router.post('/', adminRoles, scholarshipController.createScholarship)
router.patch('/:id', adminRoles, scholarshipController.updateScholarship)
router.delete('/:id', adminRoles, scholarshipController.deleteScholarship)

export default router
