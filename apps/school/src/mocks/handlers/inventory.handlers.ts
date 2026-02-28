import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  assets,
  stockItems,
  stockAdjustments,
  vendors,
  purchaseOrders,
} from '../data/inventory.data'
import type {
  Asset,
  StockItem,
  StockAdjustment,
  Vendor,
  PurchaseOrder,
  PurchaseOrderItem,
} from '@/features/inventory/types/inventory.types'

export const inventoryHandlers = [
  // ==================== ASSETS ====================

  // Get all assets
  http.get('/api/inventory/assets', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')
    const condition = url.searchParams.get('condition')
    const search = url.searchParams.get('search')

    let filtered = [...assets]
    if (category) filtered = filtered.filter((a) => a.category === category)
    if (status) filtered = filtered.filter((a) => a.status === status)
    if (condition) filtered = filtered.filter((a) => a.condition === condition)
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter((a) =>
        a.name.toLowerCase().includes(s) ||
        a.assetCode.toLowerCase().includes(s) ||
        a.location.toLowerCase().includes(s)
      )
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single asset
  http.get('/api/inventory/assets/:id', async ({ params }) => {
    await mockDelay('read')
    const asset = assets.find((a) => a.id === params.id)
    if (!asset) {
      return HttpResponse.json({ error: 'Asset not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: asset })
  }),

  // Create asset
  http.post('/api/inventory/assets', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    const categoryPrefix = {
      furniture: 'FRN',
      electronics: 'ELC',
      sports: 'SPT',
      lab_equipment: 'LAB',
      vehicle: 'VEH',
      building: 'BLD',
      other: 'OTH',
    }
    const prefix = categoryPrefix[body.category as keyof typeof categoryPrefix] || 'AST'

    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name: body.name as string,
      category: body.category as Asset['category'],
      assetCode: `${prefix}-${String(assets.length + 1).padStart(4, '0')}`,
      serialNumber: body.serialNumber as string,
      purchaseDate: body.purchaseDate as string,
      purchasePrice: body.purchasePrice as number,
      currentValue: body.purchasePrice as number,
      depreciationRate: body.depreciationRate as number || 10,
      location: body.location as string,
      condition: body.condition as Asset['condition'] || 'new',
      warrantyExpiry: body.warrantyExpiry as string,
      description: body.description as string,
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    assets.push(newAsset)
    return HttpResponse.json({ data: newAsset }, { status: 201 })
  }),

  // Update asset
  http.put('/api/inventory/assets/:id', async ({ params, request }) => {
    await mockDelay('write')
    const index = assets.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Asset not found' }, { status: 404 })
    }
    const body = await request.json() as Partial<Asset>
    assets[index] = { ...assets[index], ...body }
    return HttpResponse.json({ data: assets[index] })
  }),

  // Delete asset
  http.delete('/api/inventory/assets/:id', async ({ params }) => {
    await mockDelay('write')
    const index = assets.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Asset not found' }, { status: 404 })
    }
    assets.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== STOCK ITEMS ====================

  // Get all stock items
  http.get('/api/inventory/stock', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const lowStock = url.searchParams.get('lowStock')
    const search = url.searchParams.get('search')

    let filtered = [...stockItems]
    if (category) filtered = filtered.filter((s) => s.category === category)
    if (lowStock === 'true') filtered = filtered.filter((s) => s.currentStock <= s.reorderLevel)
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(s) || item.sku.toLowerCase().includes(s)
      )
    }

    return HttpResponse.json({ data: filtered })
  }),

  // Get single stock item
  http.get('/api/inventory/stock/:id', async ({ params }) => {
    await mockDelay('read')
    const item = stockItems.find((s) => s.id === params.id)
    if (!item) {
      return HttpResponse.json({ error: 'Stock item not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: item })
  }),

  // Create stock item
  http.post('/api/inventory/stock', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    const categoryPrefix = {
      stationery: 'STN',
      cleaning: 'CLN',
      sports: 'SPT',
      lab_consumables: 'LAB',
      medical: 'MED',
      other: 'OTH',
    }
    const prefix = categoryPrefix[body.category as keyof typeof categoryPrefix] || 'STK'

    const newStock: StockItem = {
      id: `stock-${Date.now()}`,
      name: body.name as string,
      category: body.category as StockItem['category'],
      sku: `${prefix}-${String(stockItems.length + 1).padStart(3, '0')}`,
      unit: body.unit as string,
      currentStock: 0,
      minimumStock: body.minimumStock as number,
      reorderLevel: body.reorderLevel as number,
      unitPrice: body.unitPrice as number,
      location: body.location as string,
      createdAt: new Date().toISOString(),
    }

    stockItems.push(newStock)
    return HttpResponse.json({ data: newStock }, { status: 201 })
  }),

  // Stock adjustment
  http.post('/api/inventory/stock/:id/adjust', async ({ params, request }) => {
    await mockDelay('write')
    const index = stockItems.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Stock item not found' }, { status: 404 })
    }

    const body = await request.json() as Record<string, unknown>
    const quantity = body.quantity as number
    const type = body.type as 'in' | 'out' | 'adjustment'

    stockItems[index].currentStock += quantity
    if (type === 'in') {
      stockItems[index].lastRestocked = new Date().toISOString().split('T')[0]
    }

    const adjustment: StockAdjustment = {
      id: `adj-${Date.now()}`,
      stockItemId: stockItems[index].id,
      stockItemName: stockItems[index].name,
      type,
      quantity,
      reason: body.reason as string,
      reference: body.reference as string,
      adjustedBy: 'Administrator',
      createdAt: new Date().toISOString(),
    }

    stockAdjustments.push(adjustment)

    return HttpResponse.json({ data: stockItems[index] })
  }),

  // Get stock adjustments
  http.get('/api/inventory/stock/:id/adjustments', async ({ params }) => {
    await mockDelay('read')
    const adjustments = stockAdjustments.filter((a) => a.stockItemId === params.id)
    adjustments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return HttpResponse.json({ data: adjustments })
  }),

  // Delete stock item
  http.delete('/api/inventory/stock/:id', async ({ params }) => {
    await mockDelay('write')
    const index = stockItems.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Stock item not found' }, { status: 404 })
    }
    stockItems.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== VENDORS ====================

  // Get all vendors
  http.get('/api/inventory/vendors', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')

    let filtered = [...vendors]
    if (status) filtered = filtered.filter((v) => v.status === status)
    if (category) filtered = filtered.filter((v) => v.categories.includes(category as any))

    return HttpResponse.json({ data: filtered })
  }),

  // Get single vendor
  http.get('/api/inventory/vendors/:id', async ({ params }) => {
    await mockDelay('read')
    const vendor = vendors.find((v) => v.id === params.id)
    if (!vendor) {
      return HttpResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: vendor })
  }),

  // Create vendor
  http.post('/api/inventory/vendors', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>

    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      name: body.name as string,
      contactPerson: body.contactPerson as string,
      phone: body.phone as string,
      email: body.email as string,
      address: body.address as string,
      gstNumber: body.gstNumber as string,
      categories: body.categories as Vendor['categories'],
      rating: 0,
      totalOrders: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    vendors.push(newVendor)
    return HttpResponse.json({ data: newVendor }, { status: 201 })
  }),

  // Update vendor
  http.put('/api/inventory/vendors/:id', async ({ params, request }) => {
    await mockDelay('write')
    const index = vendors.findIndex((v) => v.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }
    const body = await request.json() as Partial<Vendor>
    vendors[index] = { ...vendors[index], ...body }
    return HttpResponse.json({ data: vendors[index] })
  }),

  // Delete vendor
  http.delete('/api/inventory/vendors/:id', async ({ params }) => {
    await mockDelay('write')
    const index = vendors.findIndex((v) => v.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }
    vendors.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== PURCHASE ORDERS ====================

  // Get all purchase orders
  http.get('/api/inventory/purchase-orders', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const vendorId = url.searchParams.get('vendorId')

    let filtered = [...purchaseOrders]
    if (status) filtered = filtered.filter((po) => po.status === status)
    if (vendorId) filtered = filtered.filter((po) => po.vendorId === vendorId)

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  // Get single purchase order
  http.get('/api/inventory/purchase-orders/:id', async ({ params }) => {
    await mockDelay('read')
    const po = purchaseOrders.find((p) => p.id === params.id)
    if (!po) {
      return HttpResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: po })
  }),

  // Create purchase order
  http.post('/api/inventory/purchase-orders', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Record<string, unknown>
    const vendor = vendors.find((v) => v.id === body.vendorId)
    const items = (body.items as Omit<PurchaseOrderItem, 'id'>[]).map((item, i) => ({
      ...item,
      id: `poi-${Date.now()}-${i}`,
    }))
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(4, '0')}`,
      vendorId: body.vendorId as string,
      vendorName: vendor?.name || '',
      items,
      totalAmount,
      status: 'draft',
      createdBy: 'admin-1',
      createdByName: 'Administrator',
      expectedDelivery: body.expectedDelivery as string,
      notes: body.notes as string,
      createdAt: new Date().toISOString(),
    }

    purchaseOrders.push(newPO)
    return HttpResponse.json({ data: newPO }, { status: 201 })
  }),

  // Update PO status
  http.patch('/api/inventory/purchase-orders/:id/status', async ({ params, request }) => {
    await mockDelay('write')
    const index = purchaseOrders.findIndex((po) => po.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }

    const body = await request.json() as { status: PurchaseOrder['status'] }
    purchaseOrders[index].status = body.status

    if (body.status === 'approved') {
      purchaseOrders[index].approvedBy = 'principal-1'
      purchaseOrders[index].approvedByName = 'Dr. Anil Kumar'
    }
    if (body.status === 'ordered') {
      purchaseOrders[index].orderDate = new Date().toISOString().split('T')[0]
    }
    if (body.status === 'received') {
      purchaseOrders[index].receivedDate = new Date().toISOString().split('T')[0]
      // Update vendor stats
      const vendor = vendors.find((v) => v.id === purchaseOrders[index].vendorId)
      if (vendor) {
        vendor.totalOrders++
      }
    }

    return HttpResponse.json({ data: purchaseOrders[index] })
  }),

  // Delete purchase order
  http.delete('/api/inventory/purchase-orders/:id', async ({ params }) => {
    await mockDelay('write')
    const index = purchaseOrders.findIndex((po) => po.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }

    purchaseOrders.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== STATS ====================

  http.get('/api/inventory/stats', async () => {
    await mockDelay('read')

    const totalAssetValue = assets.filter((a) => a.status === 'active').reduce((sum, a) => sum + a.purchasePrice, 0)
    const totalDepreciation = assets.filter((a) => a.status === 'active').reduce((sum, a) => sum + (a.purchasePrice - a.currentValue), 0)
    const lowStockItems = stockItems.filter((s) => s.currentStock <= s.reorderLevel).length
    const pendingPOs = purchaseOrders.filter((po) => po.status === 'pending_approval' || po.status === 'draft').length
    const pendingPOValue = purchaseOrders.filter((po) => po.status === 'pending_approval' || po.status === 'draft').reduce((sum, po) => sum + po.totalAmount, 0)

    const stats = {
      totalAssets: assets.filter((a) => a.status === 'active').length,
      totalAssetValue,
      totalDepreciation: Math.round(totalDepreciation),
      assetsInMaintenance: assets.filter((a) => a.status === 'maintenance').length,
      lowStockItems,
      pendingPOs,
      pendingPOValue,
      activeVendors: vendors.filter((v) => v.status === 'active').length,
    }

    return HttpResponse.json({ data: stats })
  }),
]
