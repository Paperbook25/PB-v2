import { describe, it, expect } from 'vitest'
import {
  requiredString,
  emailSchema,
  phoneSchema,
  positiveNumber,
  nonNegativeNumber,
  currencySchema,
  percentageSchema,
  dateSchema,
  futureDateSchema,
  pastDateSchema,
  passwordSchema,
  pincodeSchema,
  aadhaarSchema,
  panSchema,
  addressSchema,
  dateRangeSchema,
} from './validation'

describe('validation schemas', () => {
  describe('requiredString', () => {
    it('should validate non-empty strings', () => {
      const schema = requiredString('Name')
      expect(schema.safeParse('John').success).toBe(true)
      expect(schema.safeParse('A').success).toBe(true)
    })

    it('should reject empty strings', () => {
      const schema = requiredString('Name')
      const result = schema.safeParse('')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required')
      }
    })

    it('should respect max length', () => {
      const schema = requiredString('Name', 1, 5)
      expect(schema.safeParse('John').success).toBe(true)
      expect(schema.safeParse('Johnathan').success).toBe(false)
    })
  })

  describe('emailSchema', () => {
    it('should validate correct emails', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true)
      expect(emailSchema.safeParse('user.name@domain.co.in').success).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(emailSchema.safeParse('').success).toBe(false)
      expect(emailSchema.safeParse('invalid').success).toBe(false)
      expect(emailSchema.safeParse('missing@').success).toBe(false)
      expect(emailSchema.safeParse('@nodomain.com').success).toBe(false)
    })
  })

  describe('phoneSchema (Indian phone numbers)', () => {
    it('should validate correct phone numbers', () => {
      expect(phoneSchema.safeParse('9876543210').success).toBe(true)
      expect(phoneSchema.safeParse('6123456789').success).toBe(true)
      expect(phoneSchema.safeParse('+919876543210').success).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(phoneSchema.safeParse('').success).toBe(false)
      expect(phoneSchema.safeParse('1234567890').success).toBe(false) // Must start with 6-9
      expect(phoneSchema.safeParse('987654321').success).toBe(false) // Too short
      expect(phoneSchema.safeParse('98765432100').success).toBe(false) // Too long
    })
  })

  describe('positiveNumber', () => {
    it('should validate positive numbers', () => {
      const schema = positiveNumber('Amount')
      expect(schema.safeParse(1).success).toBe(true)
      expect(schema.safeParse(100).success).toBe(true)
      expect(schema.safeParse(0.5).success).toBe(true)
    })

    it('should reject zero and negative numbers', () => {
      const schema = positiveNumber('Amount')
      expect(schema.safeParse(0).success).toBe(false)
      expect(schema.safeParse(-1).success).toBe(false)
    })
  })

  describe('nonNegativeNumber', () => {
    it('should validate zero and positive numbers', () => {
      const schema = nonNegativeNumber('Quantity')
      expect(schema.safeParse(0).success).toBe(true)
      expect(schema.safeParse(1).success).toBe(true)
      expect(schema.safeParse(100).success).toBe(true)
    })

    it('should reject negative numbers', () => {
      const schema = nonNegativeNumber('Quantity')
      expect(schema.safeParse(-1).success).toBe(false)
    })
  })

  describe('currencySchema', () => {
    it('should validate valid currency amounts', () => {
      expect(currencySchema.safeParse(0).success).toBe(true)
      expect(currencySchema.safeParse(100).success).toBe(true)
      expect(currencySchema.safeParse(99.99).success).toBe(true)
    })

    it('should reject negative amounts', () => {
      expect(currencySchema.safeParse(-1).success).toBe(false)
    })

    it('should reject more than 2 decimal places', () => {
      expect(currencySchema.safeParse(10.999).success).toBe(false)
    })
  })

  describe('percentageSchema', () => {
    it('should validate percentages 0-100', () => {
      expect(percentageSchema.safeParse(0).success).toBe(true)
      expect(percentageSchema.safeParse(50).success).toBe(true)
      expect(percentageSchema.safeParse(100).success).toBe(true)
    })

    it('should reject values outside 0-100', () => {
      expect(percentageSchema.safeParse(-1).success).toBe(false)
      expect(percentageSchema.safeParse(101).success).toBe(false)
    })
  })

  describe('dateSchema', () => {
    it('should validate ISO date strings', () => {
      expect(dateSchema.safeParse('2024-01-15').success).toBe(true)
      expect(dateSchema.safeParse('2024-12-31T23:59:59Z').success).toBe(true)
    })

    it('should reject invalid dates', () => {
      expect(dateSchema.safeParse('').success).toBe(false)
      expect(dateSchema.safeParse('not-a-date').success).toBe(false)
    })
  })

  describe('futureDateSchema', () => {
    it('should validate future dates', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      expect(futureDateSchema.safeParse(futureDate.toISOString()).success).toBe(true)
    })

    it('should reject past dates', () => {
      const pastDate = new Date()
      pastDate.setFullYear(pastDate.getFullYear() - 1)
      expect(futureDateSchema.safeParse(pastDate.toISOString()).success).toBe(false)
    })
  })

  describe('pastDateSchema', () => {
    it('should validate past dates', () => {
      const pastDate = new Date()
      pastDate.setFullYear(pastDate.getFullYear() - 1)
      expect(pastDateSchema.safeParse(pastDate.toISOString()).success).toBe(true)
    })

    it('should reject future dates', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      expect(pastDateSchema.safeParse(futureDate.toISOString()).success).toBe(false)
    })
  })

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      expect(passwordSchema.safeParse('Password1').success).toBe(true)
      expect(passwordSchema.safeParse('MySecure123').success).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(passwordSchema.safeParse('short').success).toBe(false) // Too short
      expect(passwordSchema.safeParse('nouppercase1').success).toBe(false) // No uppercase
      expect(passwordSchema.safeParse('NOLOWERCASE1').success).toBe(false) // No lowercase
      expect(passwordSchema.safeParse('NoNumbers').success).toBe(false) // No number
    })
  })

  describe('pincodeSchema (Indian postal code)', () => {
    it('should validate correct pincodes', () => {
      expect(pincodeSchema.safeParse('110001').success).toBe(true)
      expect(pincodeSchema.safeParse('560001').success).toBe(true)
    })

    it('should reject invalid pincodes', () => {
      expect(pincodeSchema.safeParse('000001').success).toBe(false) // Can't start with 0
      expect(pincodeSchema.safeParse('11000').success).toBe(false) // Too short
      expect(pincodeSchema.safeParse('1100011').success).toBe(false) // Too long
    })
  })

  describe('aadhaarSchema', () => {
    it('should validate correct Aadhaar numbers', () => {
      expect(aadhaarSchema.safeParse('123456789012').success).toBe(true)
    })

    it('should reject invalid Aadhaar numbers', () => {
      expect(aadhaarSchema.safeParse('12345678901').success).toBe(false) // Too short
      expect(aadhaarSchema.safeParse('1234567890123').success).toBe(false) // Too long
      expect(aadhaarSchema.safeParse('12345678901a').success).toBe(false) // Contains letter
    })
  })

  describe('panSchema', () => {
    it('should validate correct PAN numbers', () => {
      expect(panSchema.safeParse('ABCDE1234F').success).toBe(true)
    })

    it('should reject invalid PAN numbers', () => {
      expect(panSchema.safeParse('ABCDE1234').success).toBe(false) // Too short
      expect(panSchema.safeParse('abcde1234f').success).toBe(false) // Lowercase
      expect(panSchema.safeParse('12345ABCDE').success).toBe(false) // Wrong format
    })
  })

  describe('addressSchema', () => {
    it('should validate complete address', () => {
      const address = {
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
      }
      expect(addressSchema.safeParse(address).success).toBe(true)
    })

    it('should validate address without line2', () => {
      const address = {
        line1: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      }
      expect(addressSchema.safeParse(address).success).toBe(true)
    })

    it('should reject address with missing required fields', () => {
      const address = {
        line1: '123 Main Street',
        // Missing city, state, pincode
      }
      expect(addressSchema.safeParse(address).success).toBe(false)
    })
  })

  describe('dateRangeSchema', () => {
    it('should validate valid date ranges', () => {
      expect(dateRangeSchema.safeParse({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }).success).toBe(true)
    })

    it('should validate same start and end date', () => {
      expect(dateRangeSchema.safeParse({
        startDate: '2024-06-15',
        endDate: '2024-06-15',
      }).success).toBe(true)
    })

    it('should reject when start date is after end date', () => {
      const result = dateRangeSchema.safeParse({
        startDate: '2024-12-31',
        endDate: '2024-01-01',
      })
      expect(result.success).toBe(false)
    })
  })
})
