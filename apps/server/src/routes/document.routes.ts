import { Router } from 'express'
import * as documentController from '../controllers/document.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All document routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Documents ====================
router.get('/', adminRoles, documentController.listDocuments)
router.get('/:id', adminRoles, documentController.getDocument)
router.post('/', adminRoles, documentController.createDocument)
router.patch('/:id', adminRoles, documentController.updateDocument)
router.delete('/:id', adminRoles, documentController.deleteDocument)
router.post('/:id/download', adminRoles, documentController.incrementDownload)

export default router
