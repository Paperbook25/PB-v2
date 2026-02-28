/**
 * Security utilities for the application
 */

// ============================================================================
// CSRF PROTECTION
// ============================================================================

const CSRF_TOKEN_KEY = 'paperbook-csrf-token'
const CSRF_HEADER_NAME = 'X-CSRF-Token'

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Store CSRF token in session storage
 */
export function storeCsrfToken(token: string): void {
  sessionStorage.setItem(CSRF_TOKEN_KEY, token)
}

/**
 * Get the current CSRF token
 */
export function getCsrfToken(): string | null {
  return sessionStorage.getItem(CSRF_TOKEN_KEY)
}

/**
 * Initialize CSRF protection - call on app start
 */
export function initializeCsrf(): string {
  let token = getCsrfToken()
  if (!token) {
    token = generateCsrfToken()
    storeCsrfToken(token)
  }
  return token
}

/**
 * Get headers with CSRF token included
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken()
  return token ? { [CSRF_HEADER_NAME]: token } : {}
}

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const defaultRateLimitConfig: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
}

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier for the rate limit (e.g., endpoint name)
 * @param config - Optional rate limit configuration
 * @returns true if the request should be allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = defaultRateLimitConfig
): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    // Start new window
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return true
  }

  if (entry.count >= config.maxRequests) {
    return false
  }

  entry.count++
  return true
}

/**
 * Get remaining requests for a rate limit key
 */
export function getRateLimitRemaining(
  key: string,
  config: RateLimitConfig = defaultRateLimitConfig
): number {
  const entry = rateLimitMap.get(key)
  const now = Date.now()

  if (!entry || now > entry.resetTime) {
    return config.maxRequests
  }

  return Math.max(0, config.maxRequests - entry.count)
}

/**
 * Clear rate limit for a key
 */
export function clearRateLimit(key: string): void {
  rateLimitMap.delete(key)
}

// ============================================================================
// SESSION TIMEOUT
// ============================================================================

const SESSION_TIMEOUT_KEY = 'paperbook-last-activity'
const DEFAULT_SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

let sessionTimeoutCallback: (() => void) | null = null
let sessionTimeoutId: ReturnType<typeof setTimeout> | null = null
let isSessionTimeoutEnabled = false

/**
 * Update the last activity timestamp
 */
export function updateLastActivity(): void {
  if (!isSessionTimeoutEnabled) return
  const now = Date.now()
  sessionStorage.setItem(SESSION_TIMEOUT_KEY, now.toString())
  resetSessionTimer()
}

/**
 * Get the last activity timestamp
 */
export function getLastActivity(): number {
  const stored = sessionStorage.getItem(SESSION_TIMEOUT_KEY)
  return stored ? parseInt(stored, 10) : Date.now()
}

/**
 * Check if the session has timed out
 */
export function isSessionTimedOut(timeoutMs: number = DEFAULT_SESSION_TIMEOUT_MS): boolean {
  const lastActivity = getLastActivity()
  return Date.now() - lastActivity > timeoutMs
}

/**
 * Reset the session timeout timer
 */
function resetSessionTimer(timeoutMs: number = DEFAULT_SESSION_TIMEOUT_MS): void {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId)
  }

  if (!sessionTimeoutCallback) return

  sessionTimeoutId = setTimeout(() => {
    if (sessionTimeoutCallback) {
      sessionTimeoutCallback()
    }
  }, timeoutMs)
}

/**
 * Initialize session timeout monitoring
 * @param onTimeout - Callback to execute when session times out
 * @param timeoutMs - Session timeout in milliseconds
 */
export function initializeSessionTimeout(
  onTimeout: () => void,
  timeoutMs: number = DEFAULT_SESSION_TIMEOUT_MS
): () => void {
  sessionTimeoutCallback = onTimeout
  isSessionTimeoutEnabled = true

  // Check if already timed out
  if (isSessionTimedOut(timeoutMs)) {
    onTimeout()
    return () => {}
  }

  // Update activity on user interactions
  const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

  const handleActivity = () => {
    updateLastActivity()
  }

  events.forEach(event => {
    window.addEventListener(event, handleActivity, { passive: true })
  })

  // Start the timer
  updateLastActivity()
  resetSessionTimer(timeoutMs)

  // Return cleanup function
  return () => {
    isSessionTimeoutEnabled = false
    events.forEach(event => {
      window.removeEventListener(event, handleActivity)
    })
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId)
    }
    sessionTimeoutCallback = null
  }
}

/**
 * Clear session timeout data
 */
export function clearSessionTimeout(): void {
  sessionStorage.removeItem(SESSION_TIMEOUT_KEY)
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId)
    sessionTimeoutId = null
  }
  sessionTimeoutCallback = null
  isSessionTimeoutEnabled = false
}

// ============================================================================
// PASSWORD STRENGTH
// ============================================================================

export interface PasswordStrength {
  score: number // 0-4
  label: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  feedback: string[]
}

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  if (!password) {
    return { score: 0, label: 'weak', feedback: ['Password is required'] }
  }

  // Length check
  if (password.length >= 8) score++
  else feedback.push('Use at least 8 characters')

  if (password.length >= 12) score++
  else if (password.length >= 8) feedback.push('Consider using 12+ characters for better security')

  // Character type checks
  if (/[a-z]/.test(password)) score += 0.5
  else feedback.push('Add lowercase letters')

  if (/[A-Z]/.test(password)) score += 0.5
  else feedback.push('Add uppercase letters')

  if (/[0-9]/.test(password)) score += 0.5
  else feedback.push('Add numbers')

  if (/[^a-zA-Z0-9]/.test(password)) score += 0.5
  else feedback.push('Add special characters (!@#$%^&*)')

  // Penalize common patterns
  if (/^[a-zA-Z]+$/.test(password)) score -= 0.5
  if (/^[0-9]+$/.test(password)) score -= 1
  if (/(.)\1{2,}/.test(password)) {
    score -= 0.5
    feedback.push('Avoid repeated characters')
  }

  // Map score to label
  const normalizedScore = Math.max(0, Math.min(4, Math.round(score)))
  const labels: PasswordStrength['label'][] = ['weak', 'fair', 'good', 'strong', 'very-strong']

  return {
    score: normalizedScore,
    label: labels[normalizedScore],
    feedback,
  }
}

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

/**
 * Sanitize HTML content (basic)
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
}
