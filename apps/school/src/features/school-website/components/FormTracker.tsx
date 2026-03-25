import { useEffect, useRef, useCallback } from 'react'

interface TrackEvent {
  formType: string
  sessionId: string
  fieldName: string
  action: 'started' | 'completed' | 'abandoned'
  timestamp: string
  metadata?: Record<string, unknown>
}

/**
 * Hook for tracking form field interactions for analytics.
 *
 * Generates a session ID on mount, tracks field focus/blur events,
 * batches events and flushes every 5 seconds. Tracks abandonment
 * on page unload if the form was not submitted.
 *
 * Usage:
 *   const { trackField, trackSubmit, getTrackingProps } = useFormTracking('contact')
 *
 *   // Option A: manual tracking
 *   <input onFocus={() => trackField('email', 'started')}
 *          onBlur={(e) => e.target.value && trackField('email', 'completed')} />
 *
 *   // Option B: spread tracking props
 *   <input {...getTrackingProps('email')} />
 */
export function useFormTracking(formType: string) {
  const sessionId = useRef(Math.random().toString(36).slice(2) + Date.now().toString(36))
  const events = useRef<TrackEvent[]>([])
  const submitted = useRef(false)

  const trackField = useCallback((fieldName: string, action: 'started' | 'completed') => {
    events.current.push({
      formType,
      sessionId: sessionId.current,
      fieldName,
      action,
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
        pageSlug: window.location.pathname.split('/').pop() || 'home',
      },
    })
  }, [formType])

  const trackSubmit = useCallback(() => {
    submitted.current = true
    events.current.push({
      formType,
      sessionId: sessionId.current,
      fieldName: '_form',
      action: 'completed',
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
        pageSlug: window.location.pathname.split('/').pop() || 'home',
      },
    })
    // Flush immediately on submit
    flush()
  }, [formType])

  const trackAbandon = useCallback(() => {
    if (submitted.current) return
    events.current.push({
      formType,
      sessionId: sessionId.current,
      fieldName: '_form',
      action: 'abandoned',
      timestamp: new Date().toISOString(),
    })
  }, [formType])

  const flush = useCallback(() => {
    if (events.current.length === 0) return
    const batch = [...events.current]
    events.current = []

    // Use sendBeacon if available (reliable during unload), otherwise fetch
    const payload = JSON.stringify({ events: batch })
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/public/form-analytics/track',
        new Blob([payload], { type: 'application/json' })
      )
    } else {
      fetch('/api/public/form-analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: payload,
        keepalive: true,
      }).catch(() => {}) // fire and forget
    }
  }, [])

  // Flush events periodically (every 5 seconds)
  useEffect(() => {
    const timer = setInterval(flush, 5000)
    return () => {
      flush()
      clearInterval(timer)
    }
  }, [flush])

  // Track abandon on page unload
  useEffect(() => {
    const handleUnload = () => {
      trackAbandon()
      flush()
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [trackAbandon, flush])

  /**
   * Returns onFocus/onBlur props for an input element that automatically
   * track field interactions.
   */
  const getTrackingProps = useCallback((fieldName: string) => ({
    onFocus: () => trackField(fieldName, 'started'),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      if (e.target.value) {
        trackField(fieldName, 'completed')
      }
    },
  }), [trackField])

  return { trackField, trackSubmit, getTrackingProps, sessionId: sessionId.current }
}
