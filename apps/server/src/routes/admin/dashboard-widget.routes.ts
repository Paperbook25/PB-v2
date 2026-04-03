import { Router } from 'express'
import * as controller from '../../controllers/admin-dashboard-widget.controller.js'

const router = Router()

router.get('/', controller.listWidgets)
router.post('/', controller.createWidget)
router.put('/:id', controller.updateWidget)
router.delete('/:id', controller.deleteWidget)
router.post('/reorder', controller.reorderWidgets)

export default router
