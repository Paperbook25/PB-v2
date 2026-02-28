import { useAuthStore } from '@/stores/useAuthStore'
import { ApiError } from './api-error'

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
 * Cookie-based fetch wrapper. Auth is handled via better-auth session cookies
 * which are sent automatically with `credentials: 'include'`.
 * Handles 401 by logging out (session expired).
 */
async function fetchWithAuth(url: string, options: RequestInit, operation: string): Promise<Response> {
  let response: Response

  try {
    response = await fetch(url, { ...options, credentials: 'include' })
  } catch {
    throw new ApiError('Unable to connect to the server. Please check your internet connection.', 0)
  }

  // Session expired — log out
  if (response.status === 401) {
    useAuthStore.getState().logout('session_expired')
    await handleErrorResponse(response, operation)
  }

  if (!response.ok) {
    await handleErrorResponse(response, operation)
  }

  return response
}

/**
 * Performs a GET request with cookie auth.
 */
export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, { method: 'GET' }, 'fetch data')
  return response.json()
}

/**
 * Performs a POST request with cookie auth.
 */
export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await fetchWithAuth(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    },
    'save data'
  )
  return response.json()
}

/**
 * Performs a PUT request with cookie auth.
 */
export async function apiPut<T>(url: string, data: unknown): Promise<T> {
  const response = await fetchWithAuth(
    url,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    'update data'
  )
  return response.json()
}

/**
 * Performs a PATCH request with cookie auth.
 */
export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const response = await fetchWithAuth(
    url,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    },
    'update data'
  )
  return response.json()
}

/**
 * Performs a DELETE request with cookie auth.
 */
export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, { method: 'DELETE' }, 'delete data')
  return response.json()
}
