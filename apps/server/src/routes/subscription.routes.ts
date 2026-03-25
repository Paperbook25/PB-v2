import { Router } from 'express'
import { getCurrentPlan, getAvailablePlans, upgradePlan, checkLimits } from '../controllers/subscription.controller.js'
import { schoolAuthMiddleware as authMiddleware } from '../middleware/school-auth.middleware.js'
import { rbacMiddleware } from '../middleware/rbac.middleware.js'

const router = Router()

// All authenticated users can view subscription info
router.get('/current', authMiddleware, getCurrentPlan)

// Available plans (public-ish — any authenticated user can see)
router.get('/plans', authMiddleware, getAvailablePlans)

// Check resource limits (students, staff, users)
router.get('/limits', authMiddleware, checkLimits)

// Only admin can change the plan
router.post('/upgrade', authMiddleware, rbacMiddleware('admin'), upgradePlan)

export default router
