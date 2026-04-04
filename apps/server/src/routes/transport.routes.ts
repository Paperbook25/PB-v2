import { Router } from 'express'
import * as transportController from '../controllers/transport.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All transport routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Stats ====================
router.get('/stats', adminRoles, transportController.getTransportStats)

// ==================== Vehicles ====================
router.get('/vehicles', adminRoles, transportController.listVehicles)
router.get('/vehicles/:id', adminRoles, transportController.getVehicle)
router.post('/vehicles', adminRoles, transportController.createVehicle)
router.patch('/vehicles/:id', adminRoles, transportController.updateVehicle)
router.delete('/vehicles/:id', adminRoles, transportController.deleteVehicle)

// ==================== Drivers ====================
router.get('/drivers', adminRoles, transportController.listDrivers)
router.get('/drivers/:id', adminRoles, transportController.getDriver)
router.post('/drivers', adminRoles, transportController.createDriver)
router.patch('/drivers/:id', adminRoles, transportController.updateDriver)
router.delete('/drivers/:id', adminRoles, transportController.deleteDriver)

// ==================== Student Assignments ====================
router.get('/assignments', adminRoles, transportController.listAssignments)
router.post('/assignments', adminRoles, transportController.assignStudent)
router.delete('/assignments/:id', adminRoles, transportController.removeAssignment)

// ==================== Stops ====================
router.post('/:routeId/stops', adminRoles, transportController.addStop)
router.patch('/stops/:stopId', adminRoles, transportController.updateStop)
router.delete('/stops/:stopId', adminRoles, transportController.deleteStop)
router.put('/:routeId/stops/reorder', adminRoles, transportController.reorderStops)

// ==================== Routes (catch-all :id last) ====================
router.get('/', adminRoles, transportController.listRoutes)
router.post('/', adminRoles, transportController.createRoute)
router.get('/:id', adminRoles, transportController.getRoute)
router.patch('/:id', adminRoles, transportController.updateRoute)
router.delete('/:id', adminRoles, transportController.deleteRoute)

export default router
