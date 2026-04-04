import { Router } from 'express'
import { adminAuthMiddleware, adminRbac } from '../../middleware/admin-auth.middleware.js'
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
import featureUsageRouter from './feature-usage.routes.js'
import ticketRouter from './ticket.routes.js'
import creditNoteRouter from './credit-note.routes.js'
import communicationLogRouter from './communication-log.routes.js'
import dashboardWidgetRouter from './dashboard-widget.routes.js'
import notificationRouter from './notification.routes.js'
import platformSettingsRouter from './platform-settings.routes.js'

const router = Router()

// All admin routes require super-admin authentication
router.use(adminAuthMiddleware)

// Read-only routes: all roles can access
router.use('/dashboard', dashboardRouter)
router.use('/analytics', analyticsRouter)
router.use('/usage', usageRouter)
router.use('/health', healthRouter)
router.use('/audit', auditRouter)
router.use('/dashboard-widgets', dashboardWidgetRouter)
router.use('/notifications', notificationRouter)

// Admin + billing_admin can access billing and subscriptions
router.use('/subscriptions', adminRbac('admin', 'billing_admin'), subscriptionsRouter)
router.use('/billing', adminRbac('admin', 'billing_admin'), billingRouter)
router.use('/credit-notes', adminRbac('admin', 'billing_admin'), creditNoteRouter)

// Admin + support can access schools, users, tickets, leads
router.use('/schools', adminRbac('admin', 'support'), schoolsRouter)
router.use('/users', adminRbac('admin', 'support'), usersRouter)
router.use('/tickets', adminRbac('admin', 'support'), ticketRouter)
router.use('/leads', adminRbac('admin', 'support'), leadsRouter)

// Admin only: addons, announcements, security, feature-usage
router.use('/addons', adminRbac('admin'), addonsRouter)
router.use('/announcements', adminRbac('admin'), announcementsRouter)
router.use('/security', adminRbac('admin'), securityRouter)
router.use('/feature-usage', adminRbac('admin'), featureUsageRouter)
router.use('/communication-logs', adminRbac('admin', 'support'), communicationLogRouter)
router.use('/platform-settings', adminRbac('admin'), platformSettingsRouter)

export default router
