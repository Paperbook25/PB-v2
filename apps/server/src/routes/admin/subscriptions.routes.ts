import { Router } from 'express'
import * as ctrl from '../../controllers/admin-subscription.controller.js'

const router = Router()

router.get('/', ctrl.listSubscriptions)
router.get('/analytics', ctrl.getAnalytics)
router.get('/trials', ctrl.getExpiringTrials)
router.get('/:id', ctrl.getSubscription)
router.post('/', ctrl.createSubscription)
router.put('/:id', ctrl.updateSubscription)
router.patch('/:id/cancel', ctrl.cancelSubscription)

export default router
