import { ApiError } from './api-error'

/**
 * Interface for accessing auth store state from the consuming app.
 * This decouples the API client from any specific store implementation.
 */
export interface AuthStoreAccessor {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  getUser: () => { role: string; studentId?: string; childIds?: string[] } | null
  setTokens: (accessToken: string, refreshToken: string, user: unknown) => void
  logout: (reason: string) => void
  useMockApi: boolean
}

let storeAccessor: AuthStoreAccessor | null = null

export function configureApiClient(accessor: AuthStoreAccessor) {
  storeAccessor = accessor
}

function getAuthHeaders(): HeadersInit {
  if (!storeAccessor) return {}

  if (storeAccessor.useMockApi) {
    const user = storeAccessor.getUser()
    if (!user) return {}
    const headers: HeadersInit = { 'X-User-Role': user.role }
    if (user.studentId) headers['X-Student-Id'] = user.studentId
    if (user.childIds && user.childIds.length > 0) {
      headers['X-Child-Ids'] = user.childIds.join(',')
    }
    return headers
  }

  const accessToken = storeAccessor.getAccessToken()
  if (!accessToken) return {}
  return { 'Authorization': `Bearer ${accessToken}` }
}

let refreshPromise: Promise<boolean> | null = null

async function attemptTokenRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  if (!storeAccessor) return false

  refreshPromise = (async () => {
    const refreshToken = storeAccessor!.getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) return false

      const data = await response.json()
      storeAccessor!.setTokens(data.accessToken, data.refreshToken, data.user)
      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

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

async function fetchWithAuth(url: string, options: RequestInit, operation: string): Promise<Response> {
  let response: Response

  try {
    response = await fetch(url, options)
  } catch {
    throw new ApiError('Unable to connect to the server. Please check your internet connection.', 0)
  }

  if (response.status === 401 && storeAccessor && !storeAccessor.useMockApi) {
    const refreshed = await attemptTokenRefresh()
    if (refreshed) {
      const newHeaders = { ...options.headers, ...getAuthHeaders() } as HeadersInit
      try {
        response = await fetch(url, { ...options, headers: newHeaders })
      } catch {
        throw new ApiError('Unable to connect to the server. Please check your internet connection.', 0)
      }
    }

    if (response.status === 401) {
      storeAccessor.logout('session_expired')
      await handleErrorResponse(response, operation)
    }
  }

  if (!response.ok) {
    await handleErrorResponse(response, operation)
  }

  return response
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(
    url,
    { method: 'GET', headers: { ...getAuthHeaders() } },
    'fetch data'
  )
  return response.json()
}

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

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(
    url,
    { method: 'DELETE', headers: { ...getAuthHeaders() } },
    'delete data'
  )
  return response.json()
}
