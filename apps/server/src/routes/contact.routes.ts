import { Router } from 'express'
import * as contactController from '../controllers/contact.controller.js'
import { authMiddleware, rbacMiddleware, validate } from '../middleware/index.js'
import { submitContactSchema } from '../validators/contact.validators.js'
import rateLimit from 'express-rate-limit'

const router = Router()
const publicRouter = Router()

// All admin routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Admin Routes ====================

router.get('/stats', adminRoles, contactController.getContactStats)
router.get('/', adminRoles, contactController.listContacts)
router.get('/:id', adminRoles, contactController.getContact)
router.patch('/:id', adminRoles, contactController.updateContact)
router.delete('/:id', adminRoles, contactController.deleteContact)

// ==================== Public Routes ====================

const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 submissions per window per IP
  message: { error: 'Too many contact submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

publicRouter.post(
  '/submit',
  contactRateLimiter,
  validate(submitContactSchema),
  contactController.submitContact
)

export { router as contactRouter, publicRouter as contactPublicRouter }
