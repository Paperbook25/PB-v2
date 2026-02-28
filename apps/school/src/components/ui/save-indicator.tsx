import { Check, AlertCircle, Loader2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'

interface SaveIndicatorProps {
  status: SaveStatus
  className?: string
  showText?: boolean
  errorMessage?: string
}

const statusConfig: Record<SaveStatus, { icon: React.ReactNode; text: string; className: string }> = {
  idle: {
    icon: null,
    text: '',
    className: '',
  },
  unsaved: {
    icon: <Circle className="h-3 w-3 fill-current" />,
    text: 'Unsaved changes',
    className: 'text-amber-600 dark:text-amber-500',
  },
  saving: {
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    text: 'Saving...',
    className: 'text-muted-foreground',
  },
  saved: {
    icon: <Check className="h-3 w-3" />,
    text: 'Saved',
    className: 'text-green-600 dark:text-green-500',
  },
  error: {
    icon: <AlertCircle className="h-3 w-3" />,
    text: 'Save failed',
    className: 'text-destructive',
  },
}

export function SaveIndicator({ status, className, showText = true, errorMessage }: SaveIndicatorProps) {
  if (status === 'idle') return null

  const config = statusConfig[status]

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-sm transition-opacity duration-200',
        config.className,
        className
      )}
      role="status"
      aria-live="polite"
    >
      {config.icon}
      {showText && <span>{status === 'error' && errorMessage ? errorMessage : config.text}</span>}
    </div>
  )
}

// Hook to manage save status with auto-reset
import { useState, useCallback, useRef, useEffect } from 'react'

interface UseSaveIndicatorOptions {
  resetDelay?: number // ms to show "saved" before resetting to idle
}

export function useSaveIndicator(options: UseSaveIndicatorOptions = {}) {
  const { resetDelay = 2000 } = options
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      globalThis.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTimeout()
  }, [clearTimeout])

  const markUnsaved = useCallback(() => {
    clearTimeout()
    setStatus('unsaved')
    setErrorMessage(undefined)
  }, [clearTimeout])

  const markSaving = useCallback(() => {
    clearTimeout()
    setStatus('saving')
    setErrorMessage(undefined)
  }, [clearTimeout])

  const markSaved = useCallback(() => {
    clearTimeout()
    setStatus('saved')
    setErrorMessage(undefined)
    timeoutRef.current = globalThis.setTimeout(() => {
      setStatus('idle')
    }, resetDelay)
  }, [clearTimeout, resetDelay])

  const markError = useCallback((message?: string) => {
    clearTimeout()
    setStatus('error')
    setErrorMessage(message)
  }, [clearTimeout])

  const reset = useCallback(() => {
    clearTimeout()
    setStatus('idle')
    setErrorMessage(undefined)
  }, [clearTimeout])

  return {
    status,
    errorMessage,
    markUnsaved,
    markSaving,
    markSaved,
    markError,
    reset,
    SaveIndicator: (props: Omit<SaveIndicatorProps, 'status' | 'errorMessage'>) => (
      <SaveIndicator status={status} errorMessage={errorMessage} {...props} />
    ),
  }
}
