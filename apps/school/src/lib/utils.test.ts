import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatCurrency, getInitials, generateId } from './utils'

describe('utils', () => {
  describe('cn (class name merger)', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'added', false && 'not-added')).toBe('base added')
    })

    it('should merge tailwind classes correctly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2') // Later class wins
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end')
    })

    it('should handle array of classes', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
    })
  })

  describe('formatDate', () => {
    it('should format date string in Indian format', () => {
      const result = formatDate('2024-01-15')
      expect(result).toMatch(/15.*Jan.*2024/)
    })

    it('should format Date object', () => {
      const date = new Date('2024-06-20')
      const result = formatDate(date)
      expect(result).toMatch(/20.*Jun.*2024/)
    })

    it('should accept custom format options', () => {
      const result = formatDate('2024-01-15', { month: 'long' })
      expect(result).toMatch(/January/)
    })
  })

  describe('formatCurrency', () => {
    it('should format currency in INR', () => {
      const result = formatCurrency(1000)
      expect(result).toMatch(/₹/)
      expect(result).toMatch(/1,000/)
    })

    it('should format large amounts with Indian number system', () => {
      const result = formatCurrency(100000)
      expect(result).toMatch(/1,00,000/)
    })

    it('should handle zero', () => {
      const result = formatCurrency(0)
      expect(result).toMatch(/₹/)
      expect(result).toMatch(/0/)
    })

    it('should round to nearest rupee', () => {
      const result = formatCurrency(1000.5)
      // Should not have decimal places
      expect(result).not.toMatch(/\./)
    })
  })

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should handle multiple names and take first two', () => {
      expect(getInitials('John Michael Doe')).toBe('JM')
    })

    it('should handle lowercase names', () => {
      expect(getInitials('john doe')).toBe('JD')
    })

    it('should handle names with extra spaces', () => {
      expect(getInitials('John  Doe')).toBe('JD')
    })
  })

  describe('generateId', () => {
    it('should generate a string id', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
    })

    it('should generate unique ids', () => {
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(generateId())
      }
      expect(ids.size).toBe(100)
    })

    it('should generate id of expected length', () => {
      const id = generateId()
      expect(id.length).toBe(7) // Based on substring(2, 9)
    })
  })
})
