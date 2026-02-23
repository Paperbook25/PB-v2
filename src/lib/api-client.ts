import { useAuthStore } from '@/stores/useAuthStore'
import { ApiError } from './api-error'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

/**
 * Gets auth headers based on the current user context.
 * When using real API: sends Authorization Bearer token.
 * When using MSW: sends X-User-Role headers for mock data scoping.
 */
function getAuthHeaders(): HeadersInit {
  const state = useAuthStore.getState()

  if (USE_MOCK_API) {
    // Legacy MSW headers
    const { user } = state
    if (!user) return {}
    const headers: HeadersInit = { 'X-User-Role': user.role }
    if (user.studentId) headers['X-Student-Id'] = user.studentId
    if (user.childIds && user.childIds.length > 0) {
      headers['X-Child-Ids'] = user.childIds.join(',')
    }
    return headers
  }

  // Real API: Bearer token
  const { accessToken } = state
  if (!accessToken) return {}
  return { 'Authorization': `Bearer ${accessToken}` }
}

/**
 * Attempts to refresh the access token using the refresh token.
 * Returns true if successful, false otherwise.
 */
let refreshPromise: Promise<boolean> | null = null

async function attemptTokenRefresh(): Promise<boolean> {
  // Deduplicate concurrent refresh attempts
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const { refreshToken } = useAuthStore.getState()
    if (!refreshToken) return false

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) return false

      const data = await response.json()
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken, data.user)
      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * Parses error response and throws structured ApiError
 */
async function handleErrorResponse(response: Response, operation: string): Promise<never> {
  let errorData: { error?: string; message?: string; code?: string; fields?: Record<string, string[]> } = {}

  try {
    errorData = await response.json()
  } catch {
    // Response body is not JSON
  }

  const message = errorData.error || errorData.message || getDefaultErrorMessage(response.status, operation)

  throw new ApiError(message, response.status, {
    code: errorData.code,
    fields: errorData.fields,
  })
}

/**
 * Get default error message based on HTTP status
 */
function getDefaultErrorMessage(status: number, operation: string): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.'
    case 401:
      return 'Your session has expired. Please log in again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 409:
      return 'This operation conflicts with existing data.'
    case 422:
      return 'Validation failed. Please check your input.'
    case 429:
      return 'Too many requests. Please wait and try again.'
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server error. Please try again later.'
    default:
      return `Failed to ${operation}`
  }
}

/**
 * Wrapper that handles 401 responses by attempting token refresh and retrying.
 */
async function fetchWithAuth(url: string, options: RequestInit, operation: string): Promise<Response> {
  let response: Response

  try {
    response = await fetch(url, options)
  } catch {
    throw new ApiError('Unable to connect to the server. Please check your internet connection.', 0)
  }

  // If 401 and not using mock API, try refresh
  if (response.status === 401 && !USE_MOCK_API) {
    const refreshed = await attemptTokenRefresh()
    if (refreshed) {
      // Retry with new token
      const newHeaders = { ...options.headers, ...getAuthHeaders() } as HeadersInit
      try {
        response = await fetch(url, { ...options, headers: newHeaders })
      } catch {
        throw new ApiError('Unable to connect to the server. Please check your internet connection.', 0)
      }
    }

    // If still 401 after refresh, logout
    if (response.status === 401) {
      useAuthStore.getState().logout('session_expired')
      await handleErrorResponse(response, operation)
    }
  }

  if (!response.ok) {
    await handleErrorResponse(response, operation)
  }

  return response
}

/**
 * Performs a GET request with auth headers.
 */
export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(
    url,
    { method: 'GET', headers: { ...getAuthHeaders() } },
    'fetch data'
  )
  return response.json()
}

/**
 * Performs a POST request with auth headers.
 */
export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await fetchWithAuth(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: data ? JSON.stringify(data) : undefined,
    },
    'save data'
  )
  return response.json()
}

/**
 * Performs a PUT request with auth headers.
 */
export async function apiPut<T>(url: string, data: unknown): Promise<T> {
  const response = await fetchWithAuth(
    url,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    },
    'update data'
  )
  return response.json()
}

/**
 * Performs a PATCH request with auth headers.
 */
export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const response = await fetchWithAuth(
    url,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: data ? JSON.stringify(data) : undefined,
    },
    'update data'
  )
  return response.json()
}

/**
 * Performs a DELETE request with auth headers.
 */
export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(
    url,
    { method: 'DELETE', headers: { ...getAuthHeaders() } },
    'delete data'
  )
  return response.json()
}
