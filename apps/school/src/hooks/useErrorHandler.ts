import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/useAuthStore'
import { ApiError, isApiError, getErrorMessage } from '@/lib/api-error'

interface ErrorHandlerOptions {
  /** Custom title for the error toast */
  title?: string
  /** Whether to show a toast notification (default: true) */
  showToast?: boolean
  /** Callback to run after handling the error */
  onError?: (error: unknown) => void
  /** Whether to redirect to login on 401 errors (default: true) */
  redirectOnUnauthorized?: boolean
}

/**
 * Hook that provides standardized error handling for the application.
 * Handles API errors, shows appropriate toast messages, and manages auth redirects.
 *
 * @example
 * const { handleError } = useErrorHandler()
 *
 * try {
 *   await someMutation()
 * } catch (error) {
 *   handleError(error, { title: 'Failed to save' })
 * }
 */
export function useErrorHandler() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  /**
   * Handle an error with standardized behavior
   */
  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const {
        title = 'Error',
        showToast = true,
        onError,
        redirectOnUnauthorized = true,
      } = options

      // Handle API errors with structured information
      if (isApiError(error)) {
        // Handle authentication errors
        if (error.isUnauthorized() && redirectOnUnauthorized) {
          logout()
          navigate('/login', { replace: true })
          if (showToast) {
            toast({
              title: 'Session Expired',
              description: 'Please log in again to continue.',
              variant: 'destructive',
            })
          }
          return
        }

        // Handle forbidden errors
        if (error.isForbidden()) {
          if (showToast) {
            toast({
              title: 'Access Denied',
              description: error.getUserMessage(),
              variant: 'destructive',
            })
          }
          return
        }

        // Handle validation errors with field details
        if (error.isValidationError() && error.fields) {
          const fieldErrors = Object.entries(error.fields)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n')

          if (showToast) {
            toast({
              title: 'Validation Error',
              description: fieldErrors || error.getUserMessage(),
              variant: 'destructive',
            })
          }
          return
        }

        // Handle server errors
        if (error.isServerError()) {
          if (showToast) {
            toast({
              title: 'Server Error',
              description: error.getUserMessage(),
              variant: 'destructive',
            })
          }
          return
        }

        // Handle other API errors
        if (showToast) {
          toast({
            title,
            description: error.getUserMessage(),
            variant: 'destructive',
          })
        }
      } else {
        // Handle non-API errors
        if (showToast) {
          toast({
            title,
            description: getErrorMessage(error),
            variant: 'destructive',
          })
        }
      }

      // Call custom error handler if provided
      onError?.(error)
    },
    [toast, navigate, logout]
  )

  /**
   * Create an error handler for React Query mutations
   * Returns a function suitable for use as onError callback
   */
  const createMutationErrorHandler = useCallback(
    (options: ErrorHandlerOptions = {}) => {
      return (error: unknown) => handleError(error, options)
    },
    [handleError]
  )

  /**
   * Get a user-friendly error message from any error
   */
  const getErrorMessageFromError = useCallback((error: unknown): string => {
    return getErrorMessage(error)
  }, [])

  return {
    handleError,
    createMutationErrorHandler,
    getErrorMessage: getErrorMessageFromError,
    isApiError,
  }
}

/**
 * Standard mutation error handler factory
 * Creates consistent onError handlers for React Query mutations
 *
 * @example
 * const mutation = useMutation({
 *   mutationFn: updateData,
 *   onError: createStandardErrorHandler(toast, 'Failed to update'),
 * })
 */
export function createStandardErrorHandler(
  toast: ReturnType<typeof useToast>['toast'],
  title: string = 'Error'
) {
  return (error: unknown) => {
    toast({
      title,
      description: getErrorMessage(error),
      variant: 'destructive',
    })
  }
}
