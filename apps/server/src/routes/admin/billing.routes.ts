import { Router } from 'express'
import * as ctrl from '../../controllers/admin-billing.controller.js'

const router = Router()

router.get('/invoices', ctrl.listInvoices)
router.get('/invoices/:id', ctrl.getInvoice)
router.post('/invoices', ctrl.createInvoice)
router.put('/invoices/:id', ctrl.updateInvoice)
router.patch('/invoices/:id/send', ctrl.sendInvoice)
router.patch('/invoices/:id/cancel', ctrl.cancelInvoice)
router.post('/invoices/:id/payment', ctrl.recordPayment)
router.get('/revenue', ctrl.getRevenueSummary)
router.get('/payments', ctrl.listPayments)

export default router
