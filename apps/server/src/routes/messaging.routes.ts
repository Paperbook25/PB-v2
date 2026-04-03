import { Router } from 'express'
import * as messagingController from '../controllers/messaging.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

router.use(authMiddleware)

// All authenticated users with portal access can use messaging
const portalRoles = rbacMiddleware('admin', 'principal', 'teacher', 'parent')

// Conversations
router.get('/conversations', portalRoles, messagingController.listConversations)
router.post('/conversations', portalRoles, messagingController.createConversation)

// Messages within a conversation
router.get('/conversations/:conversationId/messages', portalRoles, messagingController.listMessages)
router.post('/conversations/:conversationId/messages', portalRoles, messagingController.sendMessage)

export default router
