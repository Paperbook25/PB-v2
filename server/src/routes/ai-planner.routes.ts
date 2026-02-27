import { Router } from 'express'
import { chat, generateAndPreview, applyDraft } from '../controllers/ai-planner.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { rbacMiddleware } from '../middleware/rbac.middleware.js'

const router = Router()

// SSE streaming chat endpoint
router.post('/chat', authMiddleware, rbacMiddleware('admin', 'principal', 'teacher'), chat)

// Direct schedule generation (no LLM needed)
router.post('/generate', authMiddleware, rbacMiddleware('admin', 'principal', 'teacher'), generateAndPreview)

// Apply generated schedule as draft timetable
router.post('/apply-draft', authMiddleware, rbacMiddleware('admin', 'principal'), applyDraft)

export default router
