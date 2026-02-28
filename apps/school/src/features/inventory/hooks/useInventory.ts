import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAssets,
  fetchAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  fetchStock,
  fetchStockItem,
  createStockItem,
  adjustStock,
  fetchStockAdjustments,
  fetchVendors,
  fetchVendor,
  createVendor,
  updateVendor,
  fetchPurchaseOrders,
  fetchPurchaseOrder,
  createPurchaseOrder,
  updatePOStatus,
  deletePurchaseOrder,
  fetchInventoryStats,
} from '../api/inventory.api'
import type {
  CreateAssetRequest,
  Asset,
  CreateStockRequest,
  CreateVendorRequest,
  Vendor,
  CreatePurchaseOrderRequest,
  PurchaseOrder,
} from '../types/inventory.types'

export const inventoryKeys = {
  all: ['inventory'] as const,
  assets: () => [...inventoryKeys.all, 'assets'] as const,
  assetList: (params?: Record<string, string>) => [...inventoryKeys.assets(), 'list', params] as const,
  assetDetail: (id: string) => [...inventoryKeys.assets(), 'detail', id] as const,
  stock: () => [...inventoryKeys.all, 'stock'] as const,
  stockList: (params?: Record<string, string>) => [...inventoryKeys.stock(), 'list', params] as const,
  stockDetail: (id: string) => [...inventoryKeys.stock(), 'detail', id] as const,
  stockAdjustments: (id: string) => [...inventoryKeys.stock(), 'adjustments', id] as const,
  vendors: () => [...inventoryKeys.all, 'vendors'] as const,
  vendorList: (params?: Record<string, string>) => [...inventoryKeys.vendors(), 'list', params] as const,
  vendorDetail: (id: string) => [...inventoryKeys.vendors(), 'detail', id] as const,
  purchaseOrders: () => [...inventoryKeys.all, 'purchase-orders'] as const,
  poList: (params?: Record<string, string>) => [...inventoryKeys.purchaseOrders(), 'list', params] as const,
  poDetail: (id: string) => [...inventoryKeys.purchaseOrders(), 'detail', id] as const,
  stats: () => [...inventoryKeys.all, 'stats'] as const,
}

// ==================== ASSETS ====================

export function useAssets(params?: {
  category?: string
  status?: string
  condition?: string
  search?: string
}) {
  return useQuery({
    queryKey: inventoryKeys.assetList(params as Record<string, string>),
    queryFn: () => fetchAssets(params),
  })
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: inventoryKeys.assetDetail(id),
    queryFn: () => fetchAsset(id),
    enabled: !!id,
  })
}

export function useCreateAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAssetRequest) => createAsset(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.assets() })
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() })
    },
  })
}

export function useUpdateAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) => updateAsset(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.assets() })
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() })
    },
  })
}

export function useDeleteAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.assets() })
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() })
    },
  })
}

// ==================== STOCK ITEMS ====================

export function useStock(params?: {
  category?: string
  lowStock?: boolean
  search?: string
}) {
  return useQuery({
    queryKey: inventoryKeys.stockList(params as Record<string, string>),
    queryFn: () => fetchStock(params),
  })
}

export function useStockItem(id: string) {
  return useQuery({
    queryKey: inventoryKeys.stockDetail(id),
    queryFn: () => fetchStockItem(id),
    enabled: !!id,
  })
}

export function useCreateStockItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateStockRequest) => createStockItem(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.stock() })
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() })
    },
  })
}

export function useAdjustStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { type: 'in' | 'out' | 'adjustment'; quantity: number; reason: string; reference?: string }
    }) => adjustStock(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.stock() })
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() })
    },
  })
}

export function useStockAdjustments(id: string) {
  return useQuery({
    queryKey: inventoryKeys.stockAdjustments(id),
    queryFn: () => fetchStockAdjustments(id),
    enabled: !!id,
  })
}

// ==================== VENDORS ====================

export function useVendors(params?: { status?: string; category?: string }) {
  return useQuery({
    queryKey: inventoryKeys.vendorList(params as Record<string, string>),
    queryFn: () => fetchVendors(params),
  })
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: inventoryKeys.vendorDetail(id),
    queryFn: () => fetchVendor(id),
    enabled: !!id,
  })
}

export function useCreateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVendorRequest) => createVendor(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.vendors() })
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() })
    },
  })
}

export function useUpdateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vendor> }) => updateVendor(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.vendors() }),
  })
}

// ==================== PURCHASE ORDERS ====================

export function usePurchaseOrders(params?: { status?: string; vendorId?: string }) {
  return useQuery({
    queryKey: inventoryKeys.poList(params as Record<string, string>),
    queryFn: () => fetchPurchaseOrders(params),
  })
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: inventoryKeys.poDetail(id),
    queryFn: () => fetchPurchaseOrder(id),
    enabled: !!id,
  })
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePurchaseOrderRequest) => createPurchaseOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.purchaseOrders() })
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() })
    },
  })
}

export function useUpdatePOStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PurchaseOrder['status'] }) =>
      updatePOStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.purchaseOrders() })
      qc.invalidateQueries({ queryKey: inventoryKeys.vendors() })
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() })
    },
  })
}

export function useDeletePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePurchaseOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.purchaseOrders() })
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() })
    },
  })
}

// ==================== STATS ====================

export function useInventoryStats() {
  return useQuery({
    queryKey: inventoryKeys.stats(),
    queryFn: fetchInventoryStats,
  })
}
