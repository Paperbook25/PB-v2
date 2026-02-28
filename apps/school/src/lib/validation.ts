import { z } from 'zod'

/**
 * Shared validation schemas and utilities for consistent form validation across the app.
 */

// ============================================================================
// BASIC FIELD VALIDATORS
// ============================================================================

/** Non-empty string with configurable min/max */
export const requiredString = (fieldName: string, min = 1, max = 255) =>
  z
    .string()
    .min(min, `${fieldName} is required`)
    .max(max, `${fieldName} must be ${max} characters or less`)

/** Optional string that can be empty */
export const optionalString = (max = 255) =>
  z.string().max(max).optional().or(z.literal(''))

/** Email validation */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

/** Optional email */
export const optionalEmailSchema = z
  .string()
  .email('Please enter a valid email address')
  .optional()
  .or(z.literal(''))

/** Indian phone number (10 digits, optionally starting with +91) */
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^(\+91)?[6-9]\d{9}$/,
    'Please enter a valid 10-digit Indian phone number'
  )

/** Optional phone number */
export const optionalPhoneSchema = z
  .string()
  .regex(/^(\+91)?[6-9]\d{9}$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''))

/** Positive number (for amounts, quantities, etc.) */
export const positiveNumber = (fieldName: string) =>
  z
    .number({ invalid_type_error: `${fieldName} must be a number` })
    .positive(`${fieldName} must be greater than 0`)

/** Non-negative number (allows zero) */
export const nonNegativeNumber = (fieldName: string) =>
  z
    .number({ invalid_type_error: `${fieldName} must be a number` })
    .min(0, `${fieldName} cannot be negative`)

/** Currency amount (INR) */
export const currencySchema = z
  .number({ invalid_type_error: 'Amount must be a number' })
  .min(0, 'Amount cannot be negative')
  .multipleOf(0.01, 'Amount can have at most 2 decimal places')

/** Percentage (0-100) */
export const percentageSchema = z
  .number({ invalid_type_error: 'Percentage must be a number' })
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100')

// ============================================================================
// DATE VALIDATORS
// ============================================================================

/** Date string in ISO format */
export const dateSchema = z
  .string()
  .min(1, 'Date is required')
  .refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date')

/** Optional date */
export const optionalDateSchema = z
  .string()
  .refine((val) => val === '' || !isNaN(Date.parse(val)), 'Invalid date')
  .optional()
  .or(z.literal(''))

/** Date that must be in the future */
export const futureDateSchema = z
  .string()
  .min(1, 'Date is required')
  .refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime()) && date > new Date()
  }, 'Date must be in the future')

/** Date that must be in the past */
export const pastDateSchema = z
  .string()
  .min(1, 'Date is required')
  .refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime()) && date < new Date()
  }, 'Date must be in the past')

// ============================================================================
// SELECT/ENUM VALIDATORS
// ============================================================================

/** Required select field */
export const requiredSelect = <T extends string>(
  options: readonly T[],
  fieldName: string
) =>
  z.enum(options as [T, ...T[]], {
    errorMap: () => ({ message: `Please select a ${fieldName}` }),
  })

/** Optional select field */
export const optionalSelect = <T extends string>(options: readonly T[]) =>
  z.enum(options as [T, ...T[]]).optional()

// ============================================================================
// COMPLEX VALIDATORS
// ============================================================================

/** Password with strength requirements */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

/** Simple password (less strict) */
export const simplePasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')

/** URL validation */
export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''))

/** Pincode (Indian postal code) */
export const pincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode')

/** Optional pincode */
export const optionalPincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, 'Invalid pincode')
  .optional()
  .or(z.literal(''))

/** Aadhaar number (12 digits) */
export const aadhaarSchema = z
  .string()
  .regex(/^\d{12}$/, 'Please enter a valid 12-digit Aadhaar number')

/** PAN card number */
export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Please enter a valid PAN number')

// ============================================================================
// FILE VALIDATORS
// ============================================================================

/** File size validator (in bytes) */
export const maxFileSize = (maxBytes: number, label = 'File') =>
  z.custom<File>(
    (file) => file instanceof File && file.size <= maxBytes,
    `${label} must be less than ${Math.round(maxBytes / 1024 / 1024)}MB`
  )

/** File type validator */
export const fileType = (allowedTypes: string[], label = 'File') =>
  z.custom<File>(
    (file) => file instanceof File && allowedTypes.includes(file.type),
    `${label} must be one of: ${allowedTypes.join(', ')}`
  )

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert empty strings to undefined for optional fields.
 * Useful when HTML inputs return "" instead of undefined.
 */
export const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === '' ? undefined : val), schema)

/**
 * Convert string to number for numeric inputs.
 * HTML number inputs often return strings.
 */
export const stringToNumber = z.preprocess((val) => {
  if (val === '' || val === undefined || val === null) return undefined
  const parsed = Number(val)
  return isNaN(parsed) ? val : parsed
}, z.number())

/**
 * Validate date range (start before end)
 */
export const dateRangeSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  )

// ============================================================================
// COMMON FORM SCHEMAS
// ============================================================================

/** Address schema */
export const addressSchema = z.object({
  line1: requiredString('Address line 1'),
  line2: optionalString(),
  city: requiredString('City'),
  state: requiredString('State'),
  pincode: pincodeSchema,
  country: z.string().default('India'),
})

/** Optional address schema */
export const optionalAddressSchema = z.object({
  line1: optionalString(),
  line2: optionalString(),
  city: optionalString(),
  state: optionalString(),
  pincode: optionalPincodeSchema,
  country: optionalString(),
})

/** Contact info schema */
export const contactSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  alternatePhone: optionalPhoneSchema,
})

/** Person name schema */
export const nameSchema = z.object({
  firstName: requiredString('First name'),
  lastName: requiredString('Last name'),
  middleName: optionalString(),
})
