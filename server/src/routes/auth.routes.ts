import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { authMiddleware, validate } from '../middleware/index.js'
import { loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validators.js'

const router = Router()

// Public routes
router.post('/login', validate(loginSchema), authController.login)
router.post('/refresh', validate(refreshSchema), authController.refresh)
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword)

// Protected routes
router.post('/logout', authMiddleware, authController.logout)
router.get('/me', authMiddleware, authController.getMe)

export default router
