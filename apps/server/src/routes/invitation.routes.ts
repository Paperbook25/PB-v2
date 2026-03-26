import { Router } from 'express'
import { schoolAuthMiddleware } from '../middleware/school-auth.middleware.js'
import { rbacMiddleware } from '../middleware/rbac.middleware.js'
import {
  sendInvitation,
  listInvitations,
  resendInvitation,
  cancelInvitation,
} from '../controllers/invitation.controller.js'

const router = Router()

// All invitation management routes require authentication + admin/principal
router.use(schoolAuthMiddleware)
router.use(rbacMiddleware('admin', 'principal'))

router.post('/send', sendInvitation)
router.get('/', listInvitations)
router.post('/:id/resend', resendInvitation)
router.delete('/:id', cancelInvitation)

export default router
