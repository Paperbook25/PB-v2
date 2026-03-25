import { Router } from 'express'
import * as facilityController from '../controllers/facility.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All facility routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')
const staffRoles = rbacMiddleware('admin', 'principal', 'teacher')

// ==================== Stats ====================
router.get('/stats', adminRoles, facilityController.getFacilityStats)

// ==================== Availability ====================
router.get('/available', staffRoles, facilityController.getAvailableFacilities)

// ==================== Bookings ====================
router.get('/bookings', staffRoles, facilityController.listBookings)
router.post('/bookings', staffRoles, facilityController.createBooking)
router.patch('/bookings/:id/cancel', staffRoles, facilityController.cancelBooking)

// ==================== Facilities CRUD ====================
router.get('/', staffRoles, facilityController.listFacilities)
router.get('/:id', staffRoles, facilityController.getFacility)
router.post('/', adminRoles, facilityController.createFacility)
router.patch('/:id', adminRoles, facilityController.updateFacility)
router.delete('/:id', adminRoles, facilityController.deleteFacility)

export default router
