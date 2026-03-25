import { Router } from 'express'
import * as emailCampaignController from '../controllers/email-campaign.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All email campaign routes require auth + admin role
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Campaign CRUD ====================

router.get('/', adminRoles, emailCampaignController.listCampaigns)
router.post('/', adminRoles, emailCampaignController.createCampaign)
router.get('/:id', adminRoles, emailCampaignController.getCampaign)
router.patch('/:id', adminRoles, emailCampaignController.updateCampaign)
router.delete('/:id', adminRoles, emailCampaignController.deleteCampaign)

// ==================== Campaign Actions ====================

router.post('/:id/activate', adminRoles, emailCampaignController.activateCampaign)
router.post('/:id/pause', adminRoles, emailCampaignController.pauseCampaign)
router.post('/:id/execute', adminRoles, emailCampaignController.executeCampaign)
router.get('/:id/stats', adminRoles, emailCampaignController.getCampaignStats)

// ==================== Steps ====================

router.post('/:id/steps', adminRoles, emailCampaignController.addStep)
router.patch('/steps/:stepId', adminRoles, emailCampaignController.updateStep)
router.delete('/steps/:stepId', adminRoles, emailCampaignController.deleteStep)

export default router
