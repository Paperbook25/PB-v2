import { Router } from 'express'
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js'
import schoolsRouter from './schools.routes.js'
import addonsRouter from './addons.routes.js'
import usersRouter from './users.routes.js'
import dashboardRouter from './dashboard.routes.js'
import auditRouter from './audit.routes.js'

const router = Router()

// All admin routes require super-admin authentication
router.use(adminAuthMiddleware)

// Mount sub-routers
router.use('/schools', schoolsRouter)
router.use('/addons', addonsRouter)
router.use('/users', usersRouter)
router.use('/dashboard', dashboardRouter)
router.use('/audit', auditRouter)

export default router
