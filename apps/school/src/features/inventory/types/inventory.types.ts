// Inventory Types

export type AssetCategory = 'furniture' | 'electronics' | 'sports' | 'lab_equipment' | 'vehicle' | 'building' | 'other'
export type AssetCondition = 'new' | 'good' | 'fair' | 'poor' | 'disposed'
export type AssetStatus = 'active' | 'maintenance' | 'disposed' | 'lost'
export type StockCategory = 'stationery' | 'cleaning' | 'sports' | 'lab_consumables' | 'medical' | 'other'
export type POStatus = 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'received' | 'cancelled'
export type VendorStatus = 'active' | 'inactive'

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  furniture: 'Furniture',
  electronics: 'Electronics',
  sports: 'Sports Equipment',
  lab_equipment: 'Lab Equipment',
  vehicle: 'Vehicle',
  building: 'Building',
  other: 'Other',
}

export const ASSET_CONDITION_LABELS: Record<AssetCondition, string> = {
  new: 'New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  disposed: 'Disposed',
}

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  active: 'Active',
  maintenance: 'Under Maintenance',
  disposed: 'Disposed',
  lost: 'Lost',
}

export const STOCK_CATEGORY_LABELS: Record<StockCategory, string> = {
  stationery: 'Stationery',
  cleaning: 'Cleaning Supplies',
  sports: 'Sports',
  lab_consumables: 'Lab Consumables',
  medical: 'Medical',
  other: 'Other',
}

export const PO_STATUS_LABELS: Record<POStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  ordered: 'Ordered',
  received: 'Received',
  cancelled: 'Cancelled',
}

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  assetCode: string
  serialNumber?: string
  purchaseDate: string
  purchasePrice: number
  currentValue: number
  depreciationRate: number
  location: string
  assignedTo?: string
  assignedToType?: 'staff' | 'department' | 'room'
  condition: AssetCondition
  warrantyExpiry?: string
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
  status: AssetStatus
  description?: string
  createdAt: string
}

export interface CreateAssetRequest {
  name: string
  category: AssetCategory
  serialNumber?: string
  purchaseDate: string
  purchasePrice: number
  depreciationRate: number
  location: string
  condition: AssetCondition
  warrantyExpiry?: string
  description?: string
}

export interface StockItem {
  id: string
  name: string
  category: StockCategory
  sku: string
  unit: string
  currentStock: number
  minimumStock: number
  reorderLevel: number
  unitPrice: number
  location: string
  lastRestocked?: string
  createdAt: string
}

export interface CreateStockRequest {
  name: string
  category: StockCategory
  unit: string
  minimumStock: number
  reorderLevel: number
  unitPrice: number
  location: string
}

export interface StockAdjustment {
  id: string
  stockItemId: string
  stockItemName: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  reference?: string
  adjustedBy: string
  createdAt: string
}

export interface PurchaseOrderItem {
  id: string
  itemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  vendorId: string
  vendorName: string
  items: PurchaseOrderItem[]
  totalAmount: number
  status: POStatus
  createdBy: string
  createdByName: string
  approvedBy?: string
  approvedByName?: string
  orderDate?: string
  expectedDelivery?: string
  receivedDate?: string
  notes?: string
  createdAt: string
}

export interface CreatePurchaseOrderRequest {
  vendorId: string
  items: Omit<PurchaseOrderItem, 'id'>[]
  expectedDelivery?: string
  notes?: string
}

export interface Vendor {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  gstNumber?: string
  categories: StockCategory[]
  rating: number
  totalOrders: number
  status: VendorStatus
  createdAt: string
}

export interface CreateVendorRequest {
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  gstNumber?: string
  categories: StockCategory[]
}

export interface InventoryStats {
  totalAssets: number
  totalAssetValue: number
  totalDepreciation: number
  assetsInMaintenance: number
  lowStockItems: number
  pendingPOs: number
  pendingPOValue: number
  activeVendors: number
}
