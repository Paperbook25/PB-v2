import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateCsrfToken,
  storeCsrfToken,
  getCsrfToken,
  initializeCsrf,
  getCsrfHeaders,
  checkRateLimit,
  getRateLimitRemaining,
  clearRateLimit,
  calculatePasswordStrength,
  sanitizeInput,
  sanitizeHtml,
} from './security'

describe('security utilities', () => {
  beforeEach(() => {
    // Clear session storage
    sessionStorage.clear()
    // Clear rate limit map
    clearRateLimit('test')
  })

  describe('CSRF Protection', () => {
    it('should generate unique CSRF tokens', () => {
      const token1 = generateCsrfToken()
      const token2 = generateCsrfToken()

      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      expect(token1).not.toBe(token2)
      expect(token1.length).toBe(64) // 32 bytes * 2 hex chars
    })

    it('should store and retrieve CSRF token', () => {
      const token = 'test-csrf-token-123'
      storeCsrfToken(token)

      expect(getCsrfToken()).toBe(token)
    })

    it('should initialize CSRF token if not present', () => {
      expect(getCsrfToken()).toBeNull()

      const token = initializeCsrf()
      expect(token).toBeDefined()
      expect(getCsrfToken()).toBe(token)
    })

    it('should return existing token on subsequent initializations', () => {
      const token1 = initializeCsrf()
      const token2 = initializeCsrf()

      expect(token1).toBe(token2)
    })

    it('should return CSRF headers', () => {
      initializeCsrf()
      const headers = getCsrfHeaders()

      expect(headers['X-CSRF-Token']).toBeDefined()
    })

    it('should return empty headers when no token exists', () => {
      const headers = getCsrfHeaders()

      expect(Object.keys(headers)).toHaveLength(0)
    })
  })

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const config = { maxRequests: 3, windowMs: 60000 }

      expect(checkRateLimit('test', config)).toBe(true)
      expect(checkRateLimit('test', config)).toBe(true)
      expect(checkRateLimit('test', config)).toBe(true)
    })

    it('should block requests exceeding limit', () => {
      const config = { maxRequests: 2, windowMs: 60000 }

      expect(checkRateLimit('test', config)).toBe(true)
      expect(checkRateLimit('test', config)).toBe(true)
      expect(checkRateLimit('test', config)).toBe(false)
    })

    it('should track remaining requests', () => {
      const config = { maxRequests: 3, windowMs: 60000 }

      expect(getRateLimitRemaining('test', config)).toBe(3)
      checkRateLimit('test', config)
      expect(getRateLimitRemaining('test', config)).toBe(2)
      checkRateLimit('test', config)
      expect(getRateLimitRemaining('test', config)).toBe(1)
    })

    it('should clear rate limit', () => {
      const config = { maxRequests: 1, windowMs: 60000 }

      checkRateLimit('test', config)
      expect(checkRateLimit('test', config)).toBe(false)

      clearRateLimit('test')
      expect(checkRateLimit('test', config)).toBe(true)
    })

    it('should handle different keys independently', () => {
      const config = { maxRequests: 1, windowMs: 60000 }

      expect(checkRateLimit('key1', config)).toBe(true)
      expect(checkRateLimit('key1', config)).toBe(false)
      expect(checkRateLimit('key2', config)).toBe(true) // Different key
    })
  })

  describe('Password Strength', () => {
    it('should rate empty password as weak', () => {
      const result = calculatePasswordStrength('')
      expect(result.score).toBe(0)
      expect(result.label).toBe('weak')
    })

    it('should rate short password as weak', () => {
      const result = calculatePasswordStrength('abc')
      expect(result.score).toBeLessThanOrEqual(1)
      expect(result.feedback).toContain('Use at least 8 characters')
    })

    it('should rate password with only letters as fair', () => {
      const result = calculatePasswordStrength('abcdefgh')
      expect(result.label).not.toBe('very-strong')
      expect(result.feedback.some(f => f.includes('numbers') || f.includes('uppercase'))).toBe(true)
    })

    it('should rate strong password highly', () => {
      const result = calculatePasswordStrength('MySecure@Password123!')
      expect(result.score).toBeGreaterThanOrEqual(3)
      expect(['strong', 'very-strong']).toContain(result.label)
    })

    it('should penalize repeated characters', () => {
      const result = calculatePasswordStrength('Aaaaaaaa1!')
      expect(result.feedback).toContain('Avoid repeated characters')
    })

    it('should provide helpful feedback', () => {
      const result = calculatePasswordStrength('password')
      expect(result.feedback.length).toBeGreaterThan(0)
    })
  })

  describe('Input Sanitization', () => {
    it('should escape HTML in sanitizeInput', () => {
      const input = '<script>alert("xss")</script>'
      const result = sanitizeInput(input)

      expect(result).not.toContain('<script>')
      expect(result).toContain('&lt;script&gt;')
    })

    it('should handle normal text in sanitizeInput', () => {
      const input = 'Hello, World!'
      const result = sanitizeInput(input)

      expect(result).toBe('Hello, World!')
    })

    it('should remove script tags in sanitizeHtml', () => {
      const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>'
      const result = sanitizeHtml(input)

      expect(result).not.toContain('<script>')
      expect(result).toContain('<p>Hello</p>')
      expect(result).toContain('<p>World</p>')
    })

    it('should remove event handlers in sanitizeHtml', () => {
      const input = '<img src="x" onerror="alert(1)">'
      const result = sanitizeHtml(input)

      expect(result).not.toContain('onerror')
    })

    it('should remove javascript: URLs in sanitizeHtml', () => {
      const input = '<a href="javascript:alert(1)">Click</a>'
      const result = sanitizeHtml(input)

      expect(result).not.toContain('javascript:')
    })
  })
})
