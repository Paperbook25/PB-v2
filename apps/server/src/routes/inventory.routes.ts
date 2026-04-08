import { Router } from 'express'
import * as inventoryController from '../controllers/inventory.controller.js'
import * as inventoryService from '../services/inventory.service.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All inventory routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Stats ====================
router.get('/stats', adminRoles, inventoryController.getInventoryStats)

// ==================== Low Stock ====================
router.get('/low-stock', adminRoles, inventoryController.getLowStock)

// ==================== Assets ====================
router.get('/assets', adminRoles, async (req, res, next) => {
  try {
    const { category, condition, search, page, limit } = req.query
    const result = await inventoryService.listAssets(req.schoolId!, {
      category: category as string | undefined,
      condition: condition as string | undefined,
      search: search as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
})
router.get('/assets/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await inventoryService.getAssetById(req.schoolId!, req.params.id)
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/assets', adminRoles, async (req, res, next) => {
  try {
    const data = await inventoryService.createAsset(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.put('/assets/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await inventoryService.updateAsset(req.schoolId!, req.params.id, req.body)
    res.json({ data })
  } catch (err) { next(err) }
})
router.delete('/assets/:id', adminRoles, async (req, res, next) => {
  try {
    const result = await inventoryService.deleteAsset(req.schoolId!, req.params.id)
    res.json(result)
  } catch (err) { next(err) }
})

// ==================== Stock Items (existing) ====================
router.get('/stock', adminRoles, inventoryController.listItems)
router.get('/stock/:id', adminRoles, inventoryController.getItem)
router.post('/stock', adminRoles, inventoryController.createItem)
router.post('/stock/:id/adjust', adminRoles, inventoryController.updateItem)
router.get('/stock/:id/adjustments', adminRoles, async (req, res, next) => {
  try {
    // Stub — future enhancement
    res.json({ data: [] })
  } catch (err) { next(err) }
})

// ==================== Vendors ====================
router.get('/vendors', adminRoles, async (req, res, next) => {
  try {
    const { search, isActive } = req.query
    const data = await inventoryService.listVendors(req.schoolId!, {
      search: search as string | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    })
    res.json({ data })
  } catch (err) { next(err) }
})
router.get('/vendors/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await inventoryService.getVendorById(req.schoolId!, req.params.id)
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/vendors', adminRoles, async (req, res, next) => {
  try {
    const data = await inventoryService.createVendor(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.put('/vendors/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await inventoryService.updateVendor(req.schoolId!, req.params.id, req.body)
    res.json({ data })
  } catch (err) { next(err) }
})

// ==================== Purchase Orders ====================
router.get('/purchase-orders', adminRoles, async (req, res, next) => {
  try {
    const { vendorId, status, page, limit } = req.query
    const result = await inventoryService.listPurchaseOrders(req.schoolId!, {
      vendorId: vendorId as string | undefined,
      status: status as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
})
router.get('/purchase-orders/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await inventoryService.getPurchaseOrderById(req.schoolId!, req.params.id)
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/purchase-orders', adminRoles, async (req, res, next) => {
  try {
    const data = await inventoryService.createPurchaseOrder(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.patch('/purchase-orders/:id/status', adminRoles, async (req, res, next) => {
  try {
    const data = await inventoryService.updatePurchaseOrderStatus(req.schoolId!, req.params.id, req.body.status)
    res.json({ data })
  } catch (err) { next(err) }
})
router.delete('/purchase-orders/:id', adminRoles, async (req, res, next) => {
  try {
    const result = await inventoryService.deletePurchaseOrder(req.schoolId!, req.params.id)
    res.json(result)
  } catch (err) { next(err) }
})

// ==================== Items (legacy path) ====================
router.get('/', adminRoles, inventoryController.listItems)
router.get('/:id', adminRoles, inventoryController.getItem)
router.post('/', adminRoles, inventoryController.createItem)
router.patch('/:id', adminRoles, inventoryController.updateItem)
router.delete('/:id', adminRoles, inventoryController.deleteItem)

export default router
