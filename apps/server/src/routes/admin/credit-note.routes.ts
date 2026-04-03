import { Router } from 'express'
import * as controller from '../../controllers/admin-credit-note.controller.js'

const router = Router()

router.get('/', controller.listCreditNotes)
router.post('/', controller.createCreditNote)
router.patch('/:id/issue', controller.issueCreditNote)
router.patch('/:id/apply', controller.applyCreditNote)
router.patch('/:id/cancel', controller.cancelCreditNote)

export default router
