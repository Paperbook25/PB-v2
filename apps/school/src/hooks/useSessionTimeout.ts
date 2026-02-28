import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { initializeSessionTimeout } from '@/lib/security'
import { useToast } from '@/hooks/use-toast'

const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

/**
 * Hook to manage session timeout
 * Should be used in the root component when user is authenticated
 */
export function useSessionTimeout() {
  const { isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSessionTimeout = useCallback(() => {
    logout('session_expired')
    navigate('/login', { replace: true })
    toast({
      title: 'Session Expired',
      description: 'Your session has expired due to inactivity. Please log in again.',
      variant: 'destructive',
    })
  }, [logout, navigate, toast])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const cleanup = initializeSessionTimeout(handleSessionTimeout, SESSION_TIMEOUT_MS)

    return cleanup
  }, [isAuthenticated, handleSessionTimeout])
}
