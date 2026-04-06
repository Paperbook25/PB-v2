import { Router } from 'express'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'
import * as integrationService from '../services/integration.service.js'
import { testRazorpayConnection } from '../services/razorpay.service.js'
import { testWhatsAppConnection } from '../services/whatsapp.service.js'
import { testSmsConnection } from '../services/sms.service.js'

const router = Router()

// All integration routes require auth + admin
router.use(authMiddleware)
const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== CRUD ====================

router.get('/', adminRoles, async (req, res, next) => {
  try {
    const data = await integrationService.listIntegrations(
      req.user!.organizationId!,
      req.query as any
    )
    res.json({ data })
  } catch (err) { next(err) }
})

router.get('/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await integrationService.getIntegration(
      String(req.params.id),
      req.user!.organizationId!
    )
    res.json({ data })
  } catch (err) { next(err) }
})

router.post('/', adminRoles, async (req, res, next) => {
  try {
    const data = await integrationService.createIntegration(
      req.user!.organizationId!,
      req.body
    )
    res.status(201).json({ data })
  } catch (err) { next(err) }
})

router.put('/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await integrationService.updateIntegration(
      String(req.params.id),
      req.user!.organizationId!,
      req.body
    )
    res.json({ data })
  } catch (err) { next(err) }
})

router.delete('/:id', adminRoles, async (req, res, next) => {
  try {
    const result = await integrationService.deleteIntegration(
      String(req.params.id),
      req.user!.organizationId!
    )
    res.json(result)
  } catch (err) { next(err) }
})

// ==================== Test Connection ====================

router.post('/:id/test', adminRoles, async (req, res, next) => {
  try {
    const orgId = req.user!.organizationId!
    const integrationId = String(req.params.id)

    // Get integration to determine type
    const integration = await integrationService.getIntegration(integrationId, orgId)
    let result: any

    switch (integration.type) {
      case 'payment_gateway':
        if (integration.provider === 'razorpay') {
          result = await testRazorpayConnection(integrationId, orgId)
        } else {
          result = { success: false, message: `Testing not implemented for ${integration.provider}` }
        }
        break
      case 'whatsapp_api':
        result = await testWhatsAppConnection(integrationId, orgId)
        break
      case 'sms_gateway':
        result = await testSmsConnection(integrationId, orgId)
        break
      default:
        result = { success: false, message: `Testing not implemented for ${integration.type}` }
    }

    res.json(result)
  } catch (err) { next(err) }
})

export default router
