import { Router } from 'express'
import * as controller from '../../controllers/admin-addon.controller.js'

const router = Router()

// GET    /api/admin/addons           — List all addons with usage stats
router.get('/', controller.listAddons)

// POST   /api/admin/addons           — Create a new addon
router.post('/', controller.createAddon)

// PUT    /api/admin/addons/:id       — Update an addon's details
router.put('/:id', controller.updateAddon)

// DELETE /api/admin/addons/:id       — Delete an addon
router.delete('/:id', controller.deleteAddon)

// GET    /api/admin/addons/:id/usage — Get addon usage details (which schools use it)
router.get('/:id/usage', controller.getAddonUsage)

export default router
