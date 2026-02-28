import { z } from 'zod'

/**
 * Environment variable schema
 * All Vite environment variables must be prefixed with VITE_
 */
const envSchema = z.object({
  // API Configuration
  VITE_API_URL: z
    .string()
    .url('VITE_API_URL must be a valid URL')
    .optional()
    .default('http://localhost:3002/api'),

  // Feature Flags
  VITE_ENABLE_MSW: z
    .enum(['true', 'false'])
    .optional()
    .default('true')
    .transform(val => val === 'true'),

  VITE_ENABLE_ANALYTICS: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform(val => val === 'true'),

  VITE_ENABLE_SENTRY: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform(val => val === 'true'),

  // Session Configuration
  VITE_SESSION_TIMEOUT_MS: z
    .string()
    .optional()
    .default('1800000') // 30 minutes
    .transform(val => parseInt(val, 10))
    .pipe(z.number().positive()),

  // External Services (optional)
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_ANALYTICS_ID: z.string().optional(),

  // App Info
  VITE_APP_VERSION: z.string().optional().default('0.1.0'),
  VITE_APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .optional()
    .default('development'),
})

/**
 * Type for validated environment variables
 */
export type Env = z.infer<typeof envSchema>

/**
 * Validate and parse environment variables
 */
function validateEnv(): Env {
  const envVars = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_ENABLE_MSW: import.meta.env.VITE_ENABLE_MSW,
    VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
    VITE_ENABLE_SENTRY: import.meta.env.VITE_ENABLE_SENTRY,
    VITE_SESSION_TIMEOUT_MS: import.meta.env.VITE_SESSION_TIMEOUT_MS,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID,
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  }

  const result = envSchema.safeParse(envVars)

  if (!result.success) {
    const errors = result.error.errors
      .map(err => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n')

    console.error(`Environment variable validation failed:\n${errors}`)

    // In development, throw error to surface issues immediately
    if (import.meta.env.DEV) {
      throw new Error(`Invalid environment variables:\n${errors}`)
    }
  }

  return result.success ? result.data : (envSchema.parse({}) as Env)
}

/**
 * Validated environment variables
 * Access env vars through this object for type safety
 */
export const env = validateEnv()

/**
 * Check if running in development mode
 */
export const isDev = env.VITE_APP_ENV === 'development'

/**
 * Check if running in production mode
 */
export const isProd = env.VITE_APP_ENV === 'production'

/**
 * Check if running in staging mode
 */
export const isStaging = env.VITE_APP_ENV === 'staging'

/**
 * Check if MSW mocking is enabled
 */
export const isMswEnabled = env.VITE_ENABLE_MSW && isDev

/**
 * Check if analytics is enabled
 */
export const isAnalyticsEnabled = env.VITE_ENABLE_ANALYTICS && isProd

/**
 * Check if Sentry error tracking is enabled
 */
export const isSentryEnabled = env.VITE_ENABLE_SENTRY && !!env.VITE_SENTRY_DSN
