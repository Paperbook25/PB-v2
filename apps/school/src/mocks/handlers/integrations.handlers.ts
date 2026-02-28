import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import { faker } from '@faker-js/faker'
import {
  integrations,
  biometricDevices,
  webhooks,
  apiKeys,
  generateId,
} from '../data/integrations.data'
import type {
  IntegrationConfig,
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  BiometricDevice,
  CreateBiometricDeviceRequest,
  UpdateBiometricDeviceRequest,
  Webhook,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  APIKey,
  CreateAPIKeyRequest,
} from '@/features/integrations/types/integrations.types'

export const integrationsHandlers = [
  // ==================== INTEGRATIONS ====================

  // Get all integrations
  http.get('/api/integrations', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase()

    let filtered = [...integrations]

    if (type) {
      filtered = filtered.filter((i) => i.type === type)
    }

    if (status) {
      filtered = filtered.filter((i) => i.status === status)
    }

    if (search) {
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(search) ||
          i.provider.toLowerCase().includes(search)
      )
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single integration
  http.get('/api/integrations/:id', async ({ params }) => {
    await mockDelay('read')
    const integration = integrations.find((i) => i.id === params.id)
    if (!integration) {
      return HttpResponse.json({ error: 'Integration not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: integration })
  }),

  // Create integration
  http.post('/api/integrations', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateIntegrationRequest
    const newIntegration: IntegrationConfig = {
      id: generateId('int'),
      type: body.type,
      name: body.name,
      provider: body.provider,
      status: 'pending',
      credentials: body.credentials,
      settings: body.settings || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    integrations.unshift(newIntegration)
    return HttpResponse.json({ data: newIntegration }, { status: 201 })
  }),

  // Update integration
  http.put('/api/integrations/:id', async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateIntegrationRequest
    const index = integrations.findIndex((i) => i.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Integration not found' }, { status: 404 })
    }
    integrations[index] = {
      ...integrations[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({ data: integrations[index] })
  }),

  // Delete integration
  http.delete('/api/integrations/:id', async ({ params }) => {
    await mockDelay('read')
    const index = integrations.findIndex((i) => i.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Integration not found' }, { status: 404 })
    }
    integrations.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Test integration
  http.post('/api/integrations/:id/test', async ({ params }) => {
    await mockDelay('heavy') // Simulate testing time
    const integration = integrations.find((i) => i.id === params.id)
    if (!integration) {
      return HttpResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Simulate test result (80% success rate)
    const success = Math.random() > 0.2
    integration.lastTestedAt = new Date().toISOString()
    integration.status = success ? 'active' : 'error'
    integration.updatedAt = new Date().toISOString()

    return HttpResponse.json({
      success,
      message: success
        ? 'Connection successful. Integration is working properly.'
        : 'Connection failed. Please check your credentials.',
      responseTime: Math.floor(Math.random() * 500) + 100,
      details: success
        ? { provider: integration.provider, version: '2.1.0' }
        : { error: 'Authentication failed' },
    })
  }),

  // ==================== BIOMETRIC DEVICES ====================

  // Get all biometric devices
  http.get('/api/biometric-devices', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const provider = url.searchParams.get('provider')
    const status = url.searchParams.get('status')
    const location = url.searchParams.get('location')
    const search = url.searchParams.get('search')?.toLowerCase()

    let filtered = [...biometricDevices]

    if (provider) {
      filtered = filtered.filter((d) => d.provider === provider)
    }

    if (status) {
      filtered = filtered.filter((d) => d.status === status)
    }

    if (location) {
      filtered = filtered.filter((d) => d.location === location)
    }

    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(search) ||
          d.deviceSerial.toLowerCase().includes(search) ||
          d.location.toLowerCase().includes(search)
      )
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single biometric device
  http.get('/api/biometric-devices/:id', async ({ params }) => {
    await mockDelay('read')
    const device = biometricDevices.find((d) => d.id === params.id)
    if (!device) {
      return HttpResponse.json({ error: 'Device not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: device })
  }),

  // Create biometric device
  http.post('/api/biometric-devices', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateBiometricDeviceRequest
    const newDevice: BiometricDevice = {
      id: generateId('bio'),
      name: body.name,
      deviceSerial: body.deviceSerial,
      deviceIp: body.deviceIp,
      devicePort: body.devicePort,
      provider: body.provider,
      location: body.location,
      deviceType: body.deviceType,
      status: 'offline',
      enrolledCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    biometricDevices.unshift(newDevice)
    return HttpResponse.json({ data: newDevice }, { status: 201 })
  }),

  // Update biometric device
  http.put('/api/biometric-devices/:id', async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateBiometricDeviceRequest
    const index = biometricDevices.findIndex((d) => d.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Device not found' }, { status: 404 })
    }
    biometricDevices[index] = {
      ...biometricDevices[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({ data: biometricDevices[index] })
  }),

  // Delete biometric device
  http.delete('/api/biometric-devices/:id', async ({ params }) => {
    await mockDelay('read')
    const index = biometricDevices.findIndex((d) => d.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Device not found' }, { status: 404 })
    }
    biometricDevices.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Sync biometric device
  http.post('/api/biometric-devices/:id/sync', async ({ params }) => {
    await mockDelay('heavy') // Simulate sync time
    const device = biometricDevices.find((d) => d.id === params.id)
    if (!device) {
      return HttpResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    // Simulate sync result
    const success = device.status !== 'offline'
    if (success) {
      device.lastSyncAt = new Date().toISOString()
      device.status = 'online'
      device.updatedAt = new Date().toISOString()
    }

    const recordsSynced = success ? Math.floor(Math.random() * 50) + 10 : 0
    const newRecords = success ? Math.floor(Math.random() * 5) : 0
    const updatedRecords = recordsSynced - newRecords

    return HttpResponse.json({
      success,
      recordsSynced,
      newRecords,
      updatedRecords,
      errors: success ? [] : ['Device is offline. Please check network connectivity.'],
      syncedAt: new Date().toISOString(),
    })
  }),

  // ==================== WEBHOOKS ====================

  // Get all webhooks
  http.get('/api/webhooks', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: webhooks })
  }),

  // Get single webhook
  http.get('/api/webhooks/:id', async ({ params }) => {
    await mockDelay('read')
    const webhook = webhooks.find((w) => w.id === params.id)
    if (!webhook) {
      return HttpResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: webhook })
  }),

  // Create webhook
  http.post('/api/webhooks', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateWebhookRequest
    const newWebhook: Webhook = {
      id: generateId('wh'),
      name: body.name,
      url: body.url,
      events: body.events,
      secret: body.secret || `whsec_${faker.string.alphanumeric(24)}`,
      isActive: true,
      successCount: 0,
      failureCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    webhooks.unshift(newWebhook)
    return HttpResponse.json({ data: newWebhook }, { status: 201 })
  }),

  // Update webhook
  http.put('/api/webhooks/:id', async ({ params, request }) => {
    await mockDelay('read')
    const body = (await request.json()) as UpdateWebhookRequest
    const index = webhooks.findIndex((w) => w.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }
    webhooks[index] = {
      ...webhooks[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({ data: webhooks[index] })
  }),

  // Delete webhook
  http.delete('/api/webhooks/:id', async ({ params }) => {
    await mockDelay('read')
    const index = webhooks.findIndex((w) => w.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }
    webhooks.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Test webhook
  http.post('/api/webhooks/:id/test', async ({ params }) => {
    await mockDelay('heavy')
    const webhook = webhooks.find((w) => w.id === params.id)
    if (!webhook) {
      return HttpResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    // Simulate test (90% success rate)
    const success = Math.random() > 0.1
    const responseTime = Math.floor(Math.random() * 300) + 50

    if (success) {
      webhook.successCount++
    } else {
      webhook.failureCount++
    }
    webhook.lastTriggeredAt = new Date().toISOString()
    webhook.updatedAt = new Date().toISOString()

    return HttpResponse.json({ success, responseTime })
  }),

  // ==================== API KEYS ====================

  // Get all API keys
  http.get('/api/api-keys', async () => {
    await mockDelay('read')
    // Return keys with masked full key (security)
    const maskedKeys = apiKeys.map((key) => ({
      ...key,
      key: key.keyPreview, // Only return preview, not full key
    }))
    return HttpResponse.json({ data: maskedKeys })
  }),

  // Create API key
  http.post('/api/api-keys', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateAPIKeyRequest
    const fullKey = `pk_live_${faker.string.alphanumeric(32)}`
    const newKey: APIKey = {
      id: generateId('key'),
      name: body.name,
      key: fullKey,
      keyPreview: `${fullKey.substring(0, 8)}****************************${fullKey.substring(fullKey.length - 4)}`,
      permissions: body.permissions,
      expiresAt: body.expiresAt,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    apiKeys.unshift(newKey)
    // Return full key only on creation
    return HttpResponse.json({ data: newKey }, { status: 201 })
  }),

  // Revoke API key
  http.delete('/api/api-keys/:id', async ({ params }) => {
    await mockDelay('read')
    const index = apiKeys.findIndex((k) => k.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'API key not found' }, { status: 404 })
    }
    apiKeys[index].isActive = false
    return HttpResponse.json({ success: true })
  }),
]
