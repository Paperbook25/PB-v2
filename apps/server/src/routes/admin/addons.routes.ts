import { Router } from 'express'
import * as controller from '../../controllers/admin-addon.controller.js'

const router = Router()

// GET    /api/admin/addons           — List all addons with usage stats
router.get('/', controller.listAddons)

// PUT    /api/admin/addons/:id       — Update an addon's details
router.put('/:id', controller.updateAddon)

// GET    /api/admin/addons/:id/usage — Get addon usage details (which schools use it)
router.get('/:id/usage', controller.getAddonUsage)

export default router
