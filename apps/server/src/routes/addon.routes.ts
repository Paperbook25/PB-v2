import { Router } from 'express'
import { listAddons, toggleAddon } from '../controllers/addon.controller.js'
import { schoolAuthMiddleware as authMiddleware } from '../middleware/school-auth.middleware.js'
import { rbacMiddleware } from '../middleware/rbac.middleware.js'

const router = Router()

// All authenticated users can see addons (needed to render the app launcher)
router.get('/', authMiddleware, listAddons)

// Only admin can toggle addons
router.patch('/:slug', authMiddleware, rbacMiddleware('admin'), toggleAddon)

export default router
