import { Router } from 'express'
import * as formAnalyticsController from '../controllers/form-analytics.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'
import rateLimit from 'express-rate-limit'

const router = Router()
const publicRouter = Router()

// All admin routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Admin Routes ====================

router.get('/stats', adminRoles, formAnalyticsController.getFormStats)
router.get('/funnel', adminRoles, formAnalyticsController.getConversionFunnel)
router.get('/dropoffs', adminRoles, formAnalyticsController.getFieldDropoffs)
router.get('/trends', adminRoles, formAnalyticsController.getFormTrends)

// ==================== Public Routes ====================

const trackRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 track requests per minute per IP
  message: { error: 'Too many tracking requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

publicRouter.post(
  '/track',
  trackRateLimiter,
  formAnalyticsController.trackEvents
)

export { router as formAnalyticsRouter, publicRouter as formAnalyticsPublicRouter }
