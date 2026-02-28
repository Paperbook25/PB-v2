/**
 * Structured API Error class with status codes and field-level errors
 */
export class ApiError extends Error {
  public readonly status: number
  public readonly code?: string
  public readonly fields?: Record<string, string[]>
  public readonly timestamp: string

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string
      fields?: Record<string, string[]>
    }
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = options?.code
    this.fields = options?.fields
    this.timestamp = new Date().toISOString()

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }

  /**
   * Check if error is a specific HTTP status
   */
  isStatus(status: number): boolean {
    return this.status === status
  }

  /**
   * Check if error is an authentication failure (401)
   */
  isUnauthorized(): boolean {
    return this.status === 401
  }

  /**
   * Check if error is a forbidden access (403)
   */
  isForbidden(): boolean {
    return this.status === 403
  }

  /**
   * Check if error is a not found (404)
   */
  isNotFound(): boolean {
    return this.status === 404
  }

  /**
   * Check if error is a validation error (400/422)
   */
  isValidationError(): boolean {
    return this.status === 400 || this.status === 422
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600
  }

  /**
   * Get user-friendly error message based on status
   */
  getUserMessage(): string {
    if (this.isUnauthorized()) {
      return 'Your session has expired. Please log in again.'
    }
    if (this.isForbidden()) {
      return 'You do not have permission to perform this action.'
    }
    if (this.isNotFound()) {
      return 'The requested resource was not found.'
    }
    if (this.isServerError()) {
      return 'An unexpected error occurred. Please try again later.'
    }
    return this.message
  }

  /**
   * Get field-specific error messages
   */
  getFieldErrors(): Record<string, string> {
    if (!this.fields) return {}
    const result: Record<string, string> = {}
    for (const [field, errors] of Object.entries(this.fields)) {
      result[field] = errors.join(', ')
    }
    return result
  }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Extract user-friendly message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.getUserMessage()
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

/**
 * Common error messages for different scenarios
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const
