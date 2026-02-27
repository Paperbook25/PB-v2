import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../../.env') })

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  // AI / LLM
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'ollama',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'qwen2.5:14b',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',

  // Server
  PORT: parseInt(process.env.PORT || '3001', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',

  get isDev() {
    return this.NODE_ENV === 'development'
  },
  get isProd() {
    return this.NODE_ENV === 'production'
  },
} as const

// Validate required env vars at startup
const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}
