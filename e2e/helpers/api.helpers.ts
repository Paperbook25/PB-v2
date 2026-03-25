import type { APIRequestContext } from '@playwright/test'

const API_BASE = 'http://localhost:3001/api'

export async function apiLogin(request: APIRequestContext, email: string, password: string) {
  // Try better-auth endpoint first, then fall back to legacy
  let response = await request.post(`${API_BASE}/auth/sign-in/email`, {
    data: { email, password },
  })

  if (!response.ok()) {
    // Fallback to legacy endpoint
    response = await request.post(`${API_BASE}/auth/login`, {
      data: { email, password },
    })
  }

  const body = await response.json().catch(() => ({}))
  return body.token ?? body.accessToken ?? body.data?.token ?? ''
}

export async function apiGet(request: APIRequestContext, endpoint: string, token: string) {
  const response = await request.get(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok()) {
    return { data: null, error: `HTTP ${response.status()}` }
  }
  return response.json().catch(() => ({ data: null }))
}

export async function apiPost(request: APIRequestContext, endpoint: string, data: unknown, token: string) {
  const response = await request.post(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  })
  if (!response.ok()) {
    return { data: null, error: `HTTP ${response.status()}` }
  }
  return response.json().catch(() => ({ data: null }))
}
