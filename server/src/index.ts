import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { prisma } from './config/db.js'
import routes from './routes/index.js'
import { errorMiddleware } from './middleware/error.middleware.js'

const app = express()

// Trust proxy for correct IP addresses
app.set('trust proxy', 1)

// CORS
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// API routes
app.use('/api', routes)

// Error handling (must be last)
app.use(errorMiddleware)

// Start server
async function main() {
  try {
    // Test DB connection
    await prisma.$connect()
    console.log('[DB] Connected to MySQL')

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
