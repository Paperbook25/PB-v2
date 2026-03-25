import { Router } from 'express'
import * as transportController from '../controllers/transport.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All transport routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Stats ====================
router.get('/stats', adminRoles, transportController.getTransportStats)

// ==================== Routes ====================
router.get('/', adminRoles, transportController.listRoutes)
router.get('/:id', adminRoles, transportController.getRoute)
router.post('/', adminRoles, transportController.createRoute)
router.patch('/:id', adminRoles, transportController.updateRoute)
router.delete('/:id', adminRoles, transportController.deleteRoute)

// ==================== Stops ====================
router.post('/:routeId/stops', adminRoles, transportController.addStop)
router.patch('/stops/:stopId', adminRoles, transportController.updateStop)
router.delete('/stops/:stopId', adminRoles, transportController.deleteStop)
router.put('/:routeId/stops/reorder', adminRoles, transportController.reorderStops)

export default router
