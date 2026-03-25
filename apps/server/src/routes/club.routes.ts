import { Router } from 'express'
import * as clubController from '../controllers/club.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All club routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal', 'teacher')

// ==================== Stats ====================
router.get('/stats', adminRoles, clubController.getClubStats)

// ==================== CRUD ====================
router.get('/', adminRoles, clubController.listClubs)
router.get('/:id', adminRoles, clubController.getClub)
router.post('/', adminRoles, clubController.createClub)
router.patch('/:id', adminRoles, clubController.updateClub)
router.delete('/:id', adminRoles, clubController.deleteClub)

export default router
