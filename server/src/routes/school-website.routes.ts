import { Router } from 'express'
import * as ctrl from '../controllers/school-website.controller.js'
import * as publicCtrl from '../controllers/school-website-public.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()
const publicRouter = Router()

// All admin routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Pages ====================

router.get('/pages', adminRoles, ctrl.listPages)
router.post('/pages', adminRoles, ctrl.createPage)
router.get('/pages/:id', adminRoles, ctrl.getPage)
router.put('/pages/:id', adminRoles, ctrl.updatePage)
router.delete('/pages/:id', adminRoles, ctrl.deletePage)
router.post('/pages/:id/publish', adminRoles, ctrl.publishPage)
router.post('/pages/:id/unpublish', adminRoles, ctrl.unpublishPage)

// ==================== Sections ====================

router.post('/pages/:id/sections', adminRoles, ctrl.addSection)
router.put('/sections/:id', adminRoles, ctrl.updateSection)
router.delete('/sections/:id', adminRoles, ctrl.deleteSection)
router.put('/pages/:id/sections/reorder', adminRoles, ctrl.reorderSections)

// ==================== Settings ====================

router.get('/settings', adminRoles, ctrl.getSettings)
router.put('/settings', adminRoles, ctrl.updateSettings)

// ==================== Media ====================

router.post('/media', adminRoles, ctrl.uploadMedia)
router.get('/media', adminRoles, ctrl.listMedia)
router.delete('/media/:id', adminRoles, ctrl.deleteMedia)

// ==================== AI Generate ====================

router.post('/ai/generate', adminRoles, ctrl.aiGenerate)

// ==================== Public Routes (no auth) ====================

publicRouter.get('/pages', publicCtrl.listPublishedPages)
publicRouter.get('/pages/:slug', publicCtrl.getPublishedPage)
publicRouter.get('/settings', publicCtrl.getPublicSettings)

export default router
export { publicRouter as websitePublicRouter }
