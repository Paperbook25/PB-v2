import { Router } from 'express'
import { schoolAuthMiddleware as authMiddleware } from '../middleware/school-auth.middleware.js'
import { rbacMiddleware } from '../middleware/rbac.middleware.js'
import * as agentController from '../controllers/agent.controller.js'

const router = Router()

// All agent routes require authentication
router.use(authMiddleware)

// Only these roles can use agents
const agentRoles = rbacMiddleware('admin', 'principal', 'teacher', 'accountant', 'parent')

router.get('/', agentRoles, agentController.listAgents)
router.post('/chat', agentRoles, agentController.chat)

export default router
