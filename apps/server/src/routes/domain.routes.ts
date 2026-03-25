import { Router } from 'express'
import * as domainController from '../controllers/domain.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All domain routes require auth + admin/principal role
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

router.get('/', adminRoles, domainController.listDomains)
router.post('/', adminRoles, domainController.addDomain)
router.post('/:id/verify', adminRoles, domainController.verifyDomain)
router.delete('/:id', adminRoles, domainController.deleteDomain)

export default router
