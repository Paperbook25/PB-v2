import { Router } from 'express'
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js'
import schoolsRouter from './schools.routes.js'
import addonsRouter from './addons.routes.js'
import usersRouter from './users.routes.js'
import dashboardRouter from './dashboard.routes.js'
import auditRouter from './audit.routes.js'
import subscriptionsRouter from './subscriptions.routes.js'
import billingRouter from './billing.routes.js'
import leadsRouter from './leads.routes.js'
import announcementsRouter from './announcements.routes.js'
import analyticsRouter from './analytics.routes.js'
import usageRouter from './usage.routes.js'
import healthRouter from './health.routes.js'
import securityRouter from './security.routes.js'

const router = Router()

// All admin routes require super-admin authentication
router.use(adminAuthMiddleware)

// Mount sub-routers
router.use('/schools', schoolsRouter)
router.use('/addons', addonsRouter)
router.use('/users', usersRouter)
router.use('/dashboard', dashboardRouter)
router.use('/audit', auditRouter)
router.use('/subscriptions', subscriptionsRouter)
router.use('/billing', billingRouter)
router.use('/leads', leadsRouter)
router.use('/announcements', announcementsRouter)
router.use('/analytics', analyticsRouter)
router.use('/usage', usageRouter)
router.use('/health', healthRouter)
router.use('/security', securityRouter)

export default router
