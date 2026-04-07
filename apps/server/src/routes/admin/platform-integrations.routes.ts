import { Router } from 'express'
import * as platformIntService from '../../services/platform-integration.service.js'

const router = Router()

// List all platform integrations (credentials masked)
router.get('/', async (req, res, next) => {
  try {
    const type = req.query.type as string | undefined
    const integrations = await platformIntService.listPlatformIntegrations(type)
    res.json({ data: integrations })
  } catch (err) { next(err) }
})

// Create a new platform integration
router.post('/', async (req, res, next) => {
  try {
    const { type, name, provider, credentials, settings, isDefault } = req.body
    if (!type || !name || !provider || !credentials) {
      return res.status(400).json({ error: 'type, name, provider, and credentials are required' })
    }
    const integration = await platformIntService.createPlatformIntegration({ type, name, provider, credentials, settings, isDefault })
    res.status(201).json({ data: integration })
  } catch (err) { next(err) }
})

// Update a platform integration
router.put('/:id', async (req, res, next) => {
  try {
    const { name, credentials, settings, isDefault, status } = req.body
    const integration = await platformIntService.updatePlatformIntegration(req.params.id, { name, credentials, settings, isDefault, status })
    res.json({ data: integration })
  } catch (err) { next(err) }
})

// Delete a platform integration
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await platformIntService.deletePlatformIntegration(req.params.id)
    res.json(result)
  } catch (err) { next(err) }
})

// Test a platform integration connection
router.post('/:id/test', async (req, res, next) => {
  try {
    const result = await platformIntService.testPlatformIntegration(req.params.id)
    res.json(result)
  } catch (err) { next(err) }
})

export default router
