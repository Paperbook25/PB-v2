import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { env } from './config/env.js'
import { prisma } from './config/db.js'
import routes from './routes/index.js'
import { errorMiddleware } from './middleware/error.middleware.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()

// Trust proxy for correct IP addresses
app.set('trust proxy', 1)

// ---------------------------------------------------------------------------
// Security headers via Helmet
// ---------------------------------------------------------------------------
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for SPA compatibility (inline scripts needed)
  crossOriginEmbedderPolicy: false, // Allow cross-origin resources
}))

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

// Rate limit for auth endpoints (relaxed in development for testing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProd ? 20 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again later.' },
})

// Rate limit for general API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
})

app.use('/api/auth', authLimiter)
app.use('/api', apiLimiter)

// CORS
app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// API routes
app.use('/api', routes)

// In production, serve the frontend build
if (env.isProd) {
  const clientDist = resolve(__dirname, '../../client-dist')
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist))
    // SPA fallback: serve index.html for all non-API routes
    app.get('*', (_req, res) => {
      res.sendFile(resolve(clientDist, 'index.html'))
    })
  }
}

// Error handling (must be last)
app.use(errorMiddleware)

// Start server
async function main() {
  try {
    // Test DB connection
    await prisma.$connect()
    console.log('[DB] Connected to PostgreSQL')

    app.listen(env.PORT, () => {
      console.log(`[Server] Running on http://localhost:${env.PORT}`)
      console.log(`[Server] Environment: ${env.NODE_ENV}`)
    })
  } catch (error) {
    console.error('[Server] Failed to start:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received, shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})

main()
