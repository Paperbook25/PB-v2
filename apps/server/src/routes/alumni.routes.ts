import { Router } from 'express'
import * as alumniController from '../controllers/alumni.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All alumni routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Stats ====================
router.get('/stats', adminRoles, alumniController.getAlumniStats)

// ==================== Batch ====================
router.get('/batch/:batch', adminRoles, alumniController.getAlumniByBatch)

// ==================== CRUD ====================
router.get('/', adminRoles, alumniController.listAlumni)
router.get('/:id', adminRoles, alumniController.getAlumni)
router.post('/', adminRoles, alumniController.createAlumni)
router.patch('/:id', adminRoles, alumniController.updateAlumni)
router.delete('/:id', adminRoles, alumniController.deleteAlumni)

export default router
