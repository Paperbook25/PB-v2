import { Router } from 'express'
import * as inventoryController from '../controllers/inventory.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All inventory routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Stats ====================
router.get('/stats', adminRoles, inventoryController.getInventoryStats)

// ==================== Low Stock ====================
router.get('/low-stock', adminRoles, inventoryController.getLowStock)

// ==================== Items ====================
router.get('/', adminRoles, inventoryController.listItems)
router.get('/:id', adminRoles, inventoryController.getItem)
router.post('/', adminRoles, inventoryController.createItem)
router.patch('/:id', adminRoles, inventoryController.updateItem)
router.delete('/:id', adminRoles, inventoryController.deleteItem)

export default router
