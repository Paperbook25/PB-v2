import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, readFileSync } from 'fs'
import { toNodeHandler } from 'better-auth/node'
import { env } from './config/env.js'
import { prisma } from './config/db.js'
import { auth } from './lib/auth.js'
import routes from './routes/index.js'
import tenantRoutes from './routes/tenant.routes.js'
import { subdomainTenantMiddleware } from './middleware/tenant.middleware.js'
import { errorMiddleware } from './middleware/error.middleware.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()

// Trust proxy for correct IP addresses
app.set('trust proxy', 1)

// ---------------------------------------------------------------------------
// Security headers via Helmet
// ---------------------------------------------------------------------------
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now (SPA needs inline scripts for tenant injection)
  crossOriginEmbedderPolicy: false, // Allow cross-origin resources
}))

// ---------------------------------------------------------------------------
// Gzip compression (60-80% bandwidth reduction)
// ---------------------------------------------------------------------------
app.use(compression({ level: 6, threshold: 1024 }))

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

// Rate limit for public endpoints (tenant resolution, public website)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProd ? 200 : 2000, // Relaxed in dev — SPA hot-reload triggers many requests
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/auth', authLimiter)
app.use('/api/public', publicLimiter)

// ---------------------------------------------------------------------------
// CORS — allow school subdomains, admin portal, and localhost
// ---------------------------------------------------------------------------
const allowedOrigins = [
  ...env.CORS_ORIGIN.split(',').map(o => o.trim()),
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8000',  // PB marketing website
  'http://localhost:8080',
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, curl, server-to-server, file://)
    if (!origin) return callback(null, true)

    // Allow PB marketing website (any origin for public lead-signup)
    if (origin === 'null' || origin.startsWith('file://')) return callback(null, true)

    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true)

    // Allow any subdomain of the configured APP_DOMAIN
    try {
      const url = new URL(origin)
      if (
        url.hostname.endsWith(`.${env.APP_DOMAIN}`) ||
        url.hostname === env.APP_DOMAIN
      ) {
        return callback(null, true)
      }
    } catch {
      // Invalid origin URL — reject
    }

    callback(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ---------------------------------------------------------------------------
// Subdomain tenant resolution (runs on EVERY request, enriches req)
// ---------------------------------------------------------------------------
app.use(subdomainTenantMiddleware)

// ---------------------------------------------------------------------------
// Request timeout (30s — prevents slowloris & hanging connections)
// ---------------------------------------------------------------------------
app.use((_req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({ error: 'Request timeout' })
  })
  next()
})

// ---------------------------------------------------------------------------
// better-auth handler (must be before body parser for auth routes)
// ---------------------------------------------------------------------------
app.all('/api/auth/*', toNodeHandler(auth))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Public tenant resolution endpoint (used by SPA in dev mode)
app.use('/api/public/tenant', tenantRoutes)

// All API routes (includes /api/admin/* via routes/admin/index.ts)
app.use('/api', routes)

// Serve uploaded media files statically
app.use('/uploads', express.static(resolve(process.cwd(), 'public/uploads')))

// ---------------------------------------------------------------------------
// Production: serve the Gravity Portal (admin) SPA
// ---------------------------------------------------------------------------
if (env.isProd) {
  const adminDist = resolve(__dirname, '../admin-dist')
  if (existsSync(adminDist)) {
    const adminHtml = readFileSync(resolve(adminDist, 'index.html'), 'utf-8')

    // Serve admin on admin.paperbook.app subdomain
    app.use((req, res, next) => {
      const host = (req.hostname || '').toLowerCase()
      if (host === `admin.${env.APP_DOMAIN}`) {
        // Serve static admin assets
        const staticPath = resolve(adminDist, req.path.slice(1))
        if (req.path !== '/' && existsSync(staticPath)) {
          return res.sendFile(staticPath)
        }
        // SPA fallback for admin
        res.setHeader('Content-Type', 'text/html')
        res.setHeader('Cache-Control', 'no-cache')
        return res.send(adminHtml)
      }
      next()
    })
  }
}

// ---------------------------------------------------------------------------
// Production: serve the school SPA with server-injected tenant config
// ---------------------------------------------------------------------------
if (env.isProd) {
  const clientDist = resolve(__dirname, '../client-dist')
  if (existsSync(clientDist)) {
    const indexHtml = readFileSync(resolve(clientDist, 'index.html'), 'utf-8')

    // Serve static assets (JS, CSS, images) — but NOT index.html automatically
    app.use(express.static(clientDist, { index: false }))

    // SPA fallback: inject tenant config into HTML before serving
    app.get('*', (req, res) => {
      // Build the tenant config that the SPA reads from window.__PAPERBOOK_TENANT__
      const tenantConfig = {
        slug: req.tenantSlug || null,
        org: req.tenantOrg
          ? { name: req.tenantOrg.name, slug: req.tenantOrg.slug, logo: req.tenantOrg.logo, status: req.tenantOrg.status }
          : null,
      }

      // Inject as a script tag — the SPA reads this immediately on boot
      // Use JSON.stringify with replacer to prevent XSS via school names
      const safeJson = JSON.stringify(tenantConfig)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/'/g, '\\u0027')

      const html = indexHtml.replace(
        '</head>',
        `<script>window.__PAPERBOOK_TENANT__=${safeJson}</script></head>`
      )

      res.setHeader('Content-Type', 'text/html')
      res.setHeader('Cache-Control', 'no-cache')
      res.send(html)
    })
  }
}

// Error handling (must be last)
app.use(errorMiddleware)

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
async function main() {
  try {
    await prisma.$connect()
    console.log('[DB] Connected to PostgreSQL')

    app.listen(env.PORT, () => {
      console.log(`[Server] Running on http://localhost:${env.PORT}`)
      console.log(`[Server] Environment: ${env.NODE_ENV}`)
      console.log(`[Server] better-auth mounted at /api/auth/*`)
      console.log(`[Server] Admin API mounted at /api/admin/*`)
      console.log(`[Server] Tenant resolution: *.${env.APP_DOMAIN}`)
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
