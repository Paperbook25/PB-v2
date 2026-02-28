import { Router } from 'express'
import * as auditController from '../controllers/audit.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

router.use(authMiddleware)
router.use(rbacMiddleware('admin', 'principal'))

router.get('/', auditController.listAuditLogs)

export default router
