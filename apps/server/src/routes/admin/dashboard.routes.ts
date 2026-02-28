import { Router } from 'express'
import * as controller from '../../controllers/admin-dashboard.controller.js'

const router = Router()

// GET /api/admin/dashboard/stats    — Platform-wide statistics
router.get('/stats', controller.getStats)

// GET /api/admin/dashboard/growth   — School/user creation trends (last 12 months)
router.get('/growth', controller.getGrowth)

// GET /api/admin/dashboard/addons   — Addon popularity across schools
router.get('/addons', controller.getAddonPopularity)

// GET /api/admin/dashboard/activity — Recent audit log entries
router.get('/activity', controller.getActivity)

export default router
