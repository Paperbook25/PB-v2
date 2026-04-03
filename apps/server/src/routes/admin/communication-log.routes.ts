import { Router } from 'express'
import * as controller from '../../controllers/admin-communication-log.controller.js'

const router = Router()

router.get('/', controller.listLogs)
router.post('/', controller.createLog)

export default router
