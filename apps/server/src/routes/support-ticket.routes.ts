import { Router } from 'express'
import { authMiddleware } from '../middleware/index.js'
import * as controller from '../controllers/support-ticket.controller.js'

const router = Router()

router.use(authMiddleware)

router.get('/', controller.listMyTickets)
router.post('/', controller.createMyTicket)
router.get('/:id', controller.getMyTicket)
router.post('/:id/responses', controller.addMyResponse)

export default router
