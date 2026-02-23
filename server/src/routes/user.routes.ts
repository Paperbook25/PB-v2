import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { authMiddleware, rbacMiddleware, validate, auditMiddleware } from '../middleware/index.js'
import { createUserSchema, updateUserSchema } from '../validators/user.validators.js'

const router = Router()

// All user routes require auth
router.use(authMiddleware)

// Parent/student self-view endpoint (before admin RBAC)
router.get('/my-children', userController.getMyChildren)

// Admin routes below require admin/principal role
const adminRoutes = rbacMiddleware('admin', 'principal')

const audit = auditMiddleware({ module: 'settings', entityType: 'user' })

router.get('/', adminRoutes, userController.listUsers)
router.get('/:id', adminRoutes, userController.getUser)
router.post('/', adminRoutes, validate(createUserSchema), audit, userController.createUser)
router.put('/:id', adminRoutes, validate(updateUserSchema), audit, userController.updateUser)
router.delete('/:id', adminRoutes, audit, userController.deleteUser)
router.patch('/:id/toggle-status', adminRoutes, audit, userController.toggleUserStatus)

export default router
