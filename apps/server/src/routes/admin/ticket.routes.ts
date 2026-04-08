import { Router } from 'express'
import * as controller from '../../controllers/admin-ticket.controller.js'

const router = Router()

router.get('/stats', controller.getTicketStats)
router.get('/', controller.listTickets)
router.get('/:id', controller.getTicket)
router.post('/', controller.createTicket)
router.patch('/:id', controller.updateTicket)
router.post('/:id/responses', controller.addResponse)
router.delete('/:id', controller.deleteTicket)

export default router
