import { Router } from 'express'
import * as hostelController from '../controllers/hostel.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All hostel routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Stats ====================
router.get('/stats', adminRoles, hostelController.getHostelStats)

// ==================== Allocations ====================
router.get('/allocations', adminRoles, hostelController.listAllocations)
router.post('/allocations', adminRoles, hostelController.allocateStudent)
router.patch('/allocations/:id/vacate', adminRoles, hostelController.vacateStudent)

// ==================== Rooms ====================
router.get('/rooms', adminRoles, hostelController.listRooms)
router.get('/rooms/:id', adminRoles, hostelController.getRoom)
router.post('/rooms', adminRoles, hostelController.createRoom)
router.patch('/rooms/:id', adminRoles, hostelController.updateRoom)
router.delete('/rooms/:id', adminRoles, hostelController.deleteRoom)

export default router
