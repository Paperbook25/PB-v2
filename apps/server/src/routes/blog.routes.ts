import { Router } from 'express'
import * as ctrl from '../controllers/blog.controller.js'
import * as publicCtrl from '../controllers/blog-public.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()
const publicRouter = Router()

// All admin routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Admin Routes ====================

router.get('/', adminRoles, ctrl.listPosts)
router.post('/', adminRoles, ctrl.createPost)
router.get('/categories', adminRoles, ctrl.getCategories)
router.get('/:id', adminRoles, ctrl.getPost)
router.put('/:id', adminRoles, ctrl.updatePost)
router.post('/:id/publish', adminRoles, ctrl.publishPost)
router.post('/:id/unpublish', adminRoles, ctrl.unpublishPost)
router.delete('/:id', adminRoles, ctrl.deletePost)

// ==================== Public Routes (no auth) ====================

publicRouter.get('/', publicCtrl.listPublishedPosts)
publicRouter.get('/:slug', publicCtrl.getPublishedPost)

export default router
export { publicRouter as blogPublicRouter }
