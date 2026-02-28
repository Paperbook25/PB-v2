import type {
  IntegrationConfig,
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  TestIntegrationResponse,
  IntegrationFilters,
  BiometricDevice,
  CreateBiometricDeviceRequest,
  UpdateBiometricDeviceRequest,
  BiometricDeviceFilters,
  BiometricSyncResult,
  Webhook,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  APIKey,
  CreateAPIKeyRequest,
} from '../types/integrations.types'

const API_BASE = '/api'

// ==================== INTEGRATIONS ====================

export async function fetchIntegrations(filters: IntegrationFilters = {}) {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)

  const response = await fetch(`${API_BASE}/integrations?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch integrations')
  return response.json() as Promise<{ data: IntegrationConfig[] }>
}

export async function fetchIntegration(id: string) {
  const response = await fetch(`${API_BASE}/integrations/${id}`)
  if (!response.ok) throw new Error('Failed to fetch integration')
  return response.json() as Promise<{ data: IntegrationConfig }>
}

export async function createIntegration(data: CreateIntegrationRequest) {
  const response = await fetch(`${API_BASE}/integrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create integration')
  return response.json() as Promise<{ data: IntegrationConfig }>
}

export async function updateIntegration(id: string, data: UpdateIntegrationRequest) {
  const response = await fetch(`${API_BASE}/integrations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update integration')
  return response.json() as Promise<{ data: IntegrationConfig }>
}

export async function deleteIntegration(id: string) {
  const response = await fetch(`${API_BASE}/integrations/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete integration')
  return response.json() as Promise<{ success: boolean }>
}

export async function testIntegration(id: string) {
  const response = await fetch(`${API_BASE}/integrations/${id}/test`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to test integration')
  return response.json() as Promise<TestIntegrationResponse>
}

// ==================== BIOMETRIC DEVICES ====================

export async function fetchBiometricDevices(filters: BiometricDeviceFilters = {}) {
  const params = new URLSearchParams()
  if (filters.provider) params.set('provider', filters.provider)
  if (filters.status) params.set('status', filters.status)
  if (filters.location) params.set('location', filters.location)
  if (filters.search) params.set('search', filters.search)

  const response = await fetch(`${API_BASE}/biometric-devices?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch biometric devices')
  return response.json() as Promise<{ data: BiometricDevice[] }>
}

export async function fetchBiometricDevice(id: string) {
  const response = await fetch(`${API_BASE}/biometric-devices/${id}`)
  if (!response.ok) throw new Error('Failed to fetch biometric device')
  return response.json() as Promise<{ data: BiometricDevice }>
}

export async function createBiometricDevice(data: CreateBiometricDeviceRequest) {
  const response = await fetch(`${API_BASE}/biometric-devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create biometric device')
  return response.json() as Promise<{ data: BiometricDevice }>
}

export async function updateBiometricDevice(id: string, data: UpdateBiometricDeviceRequest) {
  const response = await fetch(`${API_BASE}/biometric-devices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update biometric device')
  return response.json() as Promise<{ data: BiometricDevice }>
}

export async function deleteBiometricDevice(id: string) {
  const response = await fetch(`${API_BASE}/biometric-devices/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete biometric device')
  return response.json() as Promise<{ success: boolean }>
}

export async function syncBiometricDevice(id: string) {
  const response = await fetch(`${API_BASE}/biometric-devices/${id}/sync`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to sync biometric device')
  return response.json() as Promise<BiometricSyncResult>
}

// ==================== WEBHOOKS ====================

export async function fetchWebhooks() {
  const response = await fetch(`${API_BASE}/webhooks`)
  if (!response.ok) throw new Error('Failed to fetch webhooks')
  return response.json() as Promise<{ data: Webhook[] }>
}

export async function fetchWebhook(id: string) {
  const response = await fetch(`${API_BASE}/webhooks/${id}`)
  if (!response.ok) throw new Error('Failed to fetch webhook')
  return response.json() as Promise<{ data: Webhook }>
}

export async function createWebhook(data: CreateWebhookRequest) {
  const response = await fetch(`${API_BASE}/webhooks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create webhook')
  return response.json() as Promise<{ data: Webhook }>
}

export async function updateWebhook(id: string, data: UpdateWebhookRequest) {
  const response = await fetch(`${API_BASE}/webhooks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update webhook')
  return response.json() as Promise<{ data: Webhook }>
}

export async function deleteWebhook(id: string) {
  const response = await fetch(`${API_BASE}/webhooks/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete webhook')
  return response.json() as Promise<{ success: boolean }>
}

export async function testWebhook(id: string) {
  const response = await fetch(`${API_BASE}/webhooks/${id}/test`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to test webhook')
  return response.json() as Promise<{ success: boolean; responseTime: number }>
}

// ==================== API KEYS ====================

export async function fetchAPIKeys() {
  const response = await fetch(`${API_BASE}/api-keys`)
  if (!response.ok) throw new Error('Failed to fetch API keys')
  return response.json() as Promise<{ data: APIKey[] }>
}

export async function createAPIKey(data: CreateAPIKeyRequest) {
  const response = await fetch(`${API_BASE}/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create API key')
  return response.json() as Promise<{ data: APIKey }>
}

export async function revokeAPIKey(id: string) {
  const response = await fetch(`${API_BASE}/api-keys/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to revoke API key')
  return response.json() as Promise<{ success: boolean }>
}
