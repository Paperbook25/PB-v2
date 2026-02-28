import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type {
  Asset,
  CreateAssetRequest,
  StockItem,
  CreateStockRequest,
  StockAdjustment,
  Vendor,
  CreateVendorRequest,
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  InventoryStats,
} from '../types/inventory.types'

const BASE = '/api/inventory'

// ==================== ASSETS ====================

export async function fetchAssets(params?: {
  category?: string
  status?: string
  condition?: string
  search?: string
}) {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  if (params?.status) qs.set('status', params.status)
  if (params?.condition) qs.set('condition', params.condition)
  if (params?.search) qs.set('search', params.search)
  return apiGet<{ data: Asset[] }>(`${BASE}/assets?${qs}`)
}

export async function fetchAsset(id: string) {
  return apiGet<{ data: Asset }>(`${BASE}/assets/${id}`)
}

export async function createAsset(data: CreateAssetRequest) {
  return apiPost<{ data: Asset }>(`${BASE}/assets`, data)
}

export async function updateAsset(id: string, data: Partial<Asset>) {
  return apiPut<{ data: Asset }>(`${BASE}/assets/${id}`, data)
}

export async function deleteAsset(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/assets/${id}`)
}

// ==================== STOCK ITEMS ====================

export async function fetchStock(params?: {
  category?: string
  lowStock?: boolean
  search?: string
}) {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  if (params?.lowStock) qs.set('lowStock', 'true')
  if (params?.search) qs.set('search', params.search)
  return apiGet<{ data: StockItem[] }>(`${BASE}/stock?${qs}`)
}

export async function fetchStockItem(id: string) {
  return apiGet<{ data: StockItem }>(`${BASE}/stock/${id}`)
}

export async function createStockItem(data: CreateStockRequest) {
  return apiPost<{ data: StockItem }>(`${BASE}/stock`, data)
}

export async function adjustStock(
  id: string,
  data: { type: 'in' | 'out' | 'adjustment'; quantity: number; reason: string; reference?: string }
) {
  return apiPost<{ data: StockItem }>(`${BASE}/stock/${id}/adjust`, data)
}

export async function fetchStockAdjustments(id: string) {
  return apiGet<{ data: StockAdjustment[] }>(`${BASE}/stock/${id}/adjustments`)
}

// ==================== VENDORS ====================

export async function fetchVendors(params?: { status?: string; category?: string }) {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.category) qs.set('category', params.category)
  return apiGet<{ data: Vendor[] }>(`${BASE}/vendors?${qs}`)
}

export async function fetchVendor(id: string) {
  return apiGet<{ data: Vendor }>(`${BASE}/vendors/${id}`)
}

export async function createVendor(data: CreateVendorRequest) {
  return apiPost<{ data: Vendor }>(`${BASE}/vendors`, data)
}

export async function updateVendor(id: string, data: Partial<Vendor>) {
  return apiPut<{ data: Vendor }>(`${BASE}/vendors/${id}`, data)
}

// ==================== PURCHASE ORDERS ====================

export async function fetchPurchaseOrders(params?: { status?: string; vendorId?: string }) {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.vendorId) qs.set('vendorId', params.vendorId)
  return apiGet<{ data: PurchaseOrder[] }>(`${BASE}/purchase-orders?${qs}`)
}

export async function fetchPurchaseOrder(id: string) {
  return apiGet<{ data: PurchaseOrder }>(`${BASE}/purchase-orders/${id}`)
}

export async function createPurchaseOrder(data: CreatePurchaseOrderRequest) {
  return apiPost<{ data: PurchaseOrder }>(`${BASE}/purchase-orders`, data)
}

export async function updatePOStatus(id: string, status: PurchaseOrder['status']) {
  return apiPatch<{ data: PurchaseOrder }>(`${BASE}/purchase-orders/${id}/status`, { status })
}

export async function deletePurchaseOrder(id: string) {
  return apiDelete<{ success: boolean }>(`${BASE}/purchase-orders/${id}`)
}

// ==================== STATS ====================

export async function fetchInventoryStats() {
  return apiGet<{ data: InventoryStats }>(`${BASE}/stats`)
}
