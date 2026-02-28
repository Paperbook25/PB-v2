import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  IndianRupee,
  AlertTriangle,
  Wrench,
  FileText,
  Users,
  Search,
  Plus,
  Pencil,
  Minus,
  RefreshCw,
  Check,
  Truck,
  Star,
  LayoutDashboard,
  Boxes,
  ClipboardList,
} from 'lucide-react'
import {
  useInventoryStats,
  useStock,
  usePurchaseOrders,
  useAssets,
  useCreateAsset,
  useUpdateAsset,
  useAdjustStock,
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useUpdatePOStatus,
} from '@/features/inventory/hooks/useInventory'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  PO_STATUS_LABELS,
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
  ASSET_STATUS_LABELS,
  STOCK_CATEGORY_LABELS,
  type POStatus,
  type Asset,
  type StockItem,
  type Vendor,
  type AssetCategory,
  type AssetCondition,
  type StockCategory,
} from '@/features/inventory/types/inventory.types'
import type { AssetsSubTab } from '../types/operations.types'

interface AssetsTabProps {
  subTab: AssetsSubTab
  onSubTabChange: (value: AssetsSubTab) => void
}

// ============================================
// Dashboard SubTab Component
// ============================================
function DashboardSubTab() {
  const { data: statsResult } = useInventoryStats()
  const { data: lowStockResult } = useStock({ lowStock: true })
  const { data: poResult } = usePurchaseOrders()

  const stats = statsResult?.data
  const lowStockItems = lowStockResult?.data || []
  const pendingPOs = poResult?.data?.filter(
    (po) => po.status === 'pending_approval' || po.status === 'draft'
  ) || []

  const statCards = [
    {
      title: 'Total Assets',
      value: stats?.totalAssets || 0,
      icon: Package,
      description: formatCurrency(stats?.totalAssetValue || 0),
    },
    {
      title: 'Depreciation',
      value: formatCurrency(stats?.totalDepreciation || 0),
      icon: IndianRupee,
      description: 'Total depreciated value',
    },
    {
      title: 'Low Stock',
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      description: 'Items below reorder level',
      alert: (stats?.lowStockItems || 0) > 0,
    },
    {
      title: 'In Maintenance',
      value: stats?.assetsInMaintenance || 0,
      icon: Wrench,
      description: 'Assets under repair',
    },
    {
      title: 'Pending POs',
      value: stats?.pendingPOs || 0,
      icon: FileText,
      description: formatCurrency(stats?.pendingPOValue || 0),
    },
    {
      title: 'Active Vendors',
      value: stats?.activeVendors || 0,
      icon: Users,
      description: 'Registered vendors',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className={stat.alert ? 'border-yellow-500' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.alert ? 'text-yellow-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.alert ? 'text-yellow-600' : ''}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">All stock levels are healthy</p>
            ) : (
              <div className="space-y-4">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.sku} - {item.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">
                        {item.currentStock} {item.unit}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Min: {item.minimumStock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Purchase Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Purchase Orders</CardTitle>
            <CardDescription>Orders awaiting approval or action</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingPOs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending purchase orders</p>
            ) : (
              <div className="space-y-4">
                {pendingPOs.slice(0, 5).map((po) => (
                  <div
                    key={po.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{po.poNumber}</p>
                      <p className="text-sm text-muted-foreground">{po.vendorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(po.totalAmount)}</p>
                      <Badge
                        variant={po.status === 'pending_approval' ? 'secondary' : 'outline'}
                      >
                        {PO_STATUS_LABELS[po.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// Assets SubTab Component
// ============================================
function AssetsSubTab() {
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  const { data: assetsResult, isLoading } = useAssets({
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  })
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()
  const { toast } = useToast()

  const assets = assetsResult?.data || []

  const [formData, setFormData] = useState({
    name: '',
    category: 'furniture' as AssetCategory,
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    depreciationRate: 10,
    location: '',
    condition: 'new' as AssetCondition,
    warrantyExpiry: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedAsset) {
        await updateAsset.mutateAsync({ id: selectedAsset.id, data: formData })
        toast({ title: 'Asset updated successfully' })
      } else {
        await createAsset.mutateAsync(formData)
        toast({ title: 'Asset created successfully' })
      }
      handleCloseDialog()
    } catch {
      toast({ title: selectedAsset ? 'Failed to update asset' : 'Failed to create asset', variant: 'destructive' })
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedAsset(null)
    setFormData({
      name: '',
      category: 'furniture',
      serialNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 0,
      depreciationRate: 10,
      location: '',
      condition: 'new',
      warrantyExpiry: '',
      description: '',
    })
  }

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset)
    setFormData({
      name: asset.name,
      category: asset.category,
      serialNumber: asset.serialNumber || '',
      purchaseDate: asset.purchaseDate,
      purchasePrice: asset.purchasePrice,
      depreciationRate: asset.depreciationRate,
      location: asset.location,
      condition: asset.condition,
      warrantyExpiry: asset.warrantyExpiry || '',
      description: asset.description || '',
    })
    setIsDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'disposed':
        return 'bg-gray-100 text-gray-800'
      case 'lost':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'fair':
        return 'text-yellow-600'
      case 'poor':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name, code, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={categoryFilter || 'all'} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                if (!open) handleCloseDialog()
                else setIsDialogOpen(true)
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
                    <DialogDescription>
                      {selectedAsset ? 'Update asset information' : 'Register a new asset'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Asset Name *</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g., Dell Laptop"
                            required
                          />
                        </div>
                        <div>
                          <Label>Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(v) =>
                              setFormData({ ...formData, category: v as AssetCategory })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Serial Number</Label>
                          <Input
                            value={formData.serialNumber}
                            onChange={(e) =>
                              setFormData({ ...formData, serialNumber: e.target.value })
                            }
                            placeholder="Serial/Model number"
                          />
                        </div>
                        <div>
                          <Label>Location *</Label>
                          <Input
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                            placeholder="e.g., Main Building"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Purchase Date *</Label>
                          <Input
                            type="date"
                            value={formData.purchaseDate}
                            onChange={(e) =>
                              setFormData({ ...formData, purchaseDate: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label>Purchase Price *</Label>
                          <Input
                            type="number"
                            value={formData.purchasePrice}
                            onChange={(e) =>
                              setFormData({ ...formData, purchasePrice: parseInt(e.target.value) })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label>Depreciation Rate (%)</Label>
                          <Input
                            type="number"
                            value={formData.depreciationRate}
                            onChange={(e) =>
                              setFormData({ ...formData, depreciationRate: parseInt(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Condition</Label>
                          <Select
                            value={formData.condition}
                            onValueChange={(v) =>
                              setFormData({ ...formData, condition: v as AssetCondition })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ASSET_CONDITION_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Warranty Expiry</Label>
                          <Input
                            type="date"
                            value={formData.warrantyExpiry}
                            onChange={(e) =>
                              setFormData({ ...formData, warrantyExpiry: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createAsset.isPending || updateAsset.isPending}>
                        {selectedAsset
                          ? updateAsset.isPending ? 'Updating...' : 'Update Asset'
                          : createAsset.isPending ? 'Creating...' : 'Create Asset'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading assets...</div>
          ) : assets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assets found. Try adjusting your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.slice(0, 20).map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono text-sm">{asset.assetCode}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        {asset.serialNumber && (
                          <p className="text-sm text-muted-foreground">
                            S/N: {asset.serialNumber}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{ASSET_CATEGORY_LABELS[asset.category]}</TableCell>
                    <TableCell>{asset.location}</TableCell>
                    <TableCell>{formatCurrency(asset.purchasePrice)}</TableCell>
                    <TableCell>{formatCurrency(asset.currentValue)}</TableCell>
                    <TableCell>
                      <span className={getConditionColor(asset.condition)}>
                        {ASSET_CONDITION_LABELS[asset.condition]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(asset.status)}>
                        {ASSET_STATUS_LABELS[asset.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(asset)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Stock SubTab Component
// ============================================
function StockSubTab() {
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [lowStockFilter, setLowStockFilter] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [adjustDialog, setAdjustDialog] = useState<{
    open: boolean
    item: StockItem | null
    type: 'in' | 'out' | 'adjustment'
  }>({
    open: false,
    item: null,
    type: 'in',
  })
  const [adjustQuantity, setAdjustQuantity] = useState(0)
  const [adjustReason, setAdjustReason] = useState('')

  const { data: stockResult, isLoading } = useStock({
    category: categoryFilter || undefined,
    lowStock: lowStockFilter || undefined,
    search: searchTerm || undefined,
  })
  const adjustStock = useAdjustStock()
  const { toast } = useToast()

  const stockItems = stockResult?.data || []

  const handleAdjust = async () => {
    if (!adjustDialog.item) return
    try {
      await adjustStock.mutateAsync({
        id: adjustDialog.item.id,
        data: {
          type: adjustDialog.type,
          quantity: adjustDialog.type === 'out' ? -adjustQuantity : adjustQuantity,
          reason: adjustReason,
        },
      })
      toast({ title: 'Stock adjusted successfully' })
      setAdjustDialog({ open: false, item: null, type: 'in' })
      setAdjustQuantity(0)
      setAdjustReason('')
    } catch {
      toast({ title: 'Failed to adjust stock', variant: 'destructive' })
    }
  }

  const getStockStatus = (item: StockItem) => {
    if (item.currentStock <= item.minimumStock) return { label: 'Critical', color: 'bg-red-100 text-red-800' }
    if (item.currentStock <= item.reorderLevel) return { label: 'Low', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'OK', color: 'bg-green-100 text-green-800' }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={categoryFilter || 'all'} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(STOCK_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant={lowStockFilter ? 'default' : 'outline'}
                onClick={() => setLowStockFilter(!lowStockFilter)}
              >
                Low Stock Only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading stock items...</div>
          ) : stockItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No stock items found. Try adjusting your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockItems.map((item) => {
                  const status = getStockStatus(item)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{STOCK_CATEGORY_LABELS[item.category]}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        {item.currentStock} {item.unit}
                      </TableCell>
                      <TableCell>
                        {item.reorderLevel} {item.unit}
                      </TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setAdjustDialog({ open: true, item, type: 'in' })
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setAdjustDialog({ open: true, item, type: 'out' })
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setAdjustDialog({ open: true, item, type: 'adjustment' })
                            }
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Adjust Dialog */}
      <Dialog
        open={adjustDialog.open}
        onOpenChange={(open) => setAdjustDialog({ ...adjustDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustDialog.type === 'in'
                ? 'Stock In'
                : adjustDialog.type === 'out'
                ? 'Stock Out'
                : 'Stock Adjustment'}
            </DialogTitle>
            <DialogDescription>
              {adjustDialog.item?.name} ({adjustDialog.item?.sku})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Current Stock</Label>
              <p className="text-lg font-medium">
                {adjustDialog.item?.currentStock} {adjustDialog.item?.unit}
              </p>
            </div>
            <div>
              <Label>Quantity *</Label>
              <Input
                type="number"
                min={1}
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Reason *</Label>
              <Input
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder={
                  adjustDialog.type === 'in'
                    ? 'e.g., Purchase order received'
                    : adjustDialog.type === 'out'
                    ? 'e.g., Issued to department'
                    : 'e.g., Physical count correction'
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustDialog({ open: false, item: null, type: 'in' })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjust}
              disabled={adjustStock.isPending || !adjustQuantity || !adjustReason}
            >
              {adjustStock.isPending ? 'Saving...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// Purchase Orders SubTab Component
// ============================================
function PurchaseOrdersSubTab() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [vendorFilter, setVendorFilter] = useState<string>('')

  const { data: poResult, isLoading } = usePurchaseOrders({
    status: statusFilter || undefined,
    vendorId: vendorFilter || undefined,
  })
  const { data: vendorsResult } = useVendors()
  const updateStatus = useUpdatePOStatus()
  const { toast } = useToast()

  const purchaseOrders = poResult?.data || []
  const vendors = vendorsResult?.data || []

  const handleStatusUpdate = async (id: string, status: POStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status })
      toast({ title: `Order ${status === 'approved' ? 'approved' : status === 'ordered' ? 'marked as ordered' : status === 'received' ? 'marked as received' : 'updated'}` })
    } catch {
      toast({ title: 'Failed to update order status', variant: 'destructive' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'ordered':
        return 'bg-purple-100 text-purple-800'
      case 'received':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getNextAction = (status: POStatus): { label: string; nextStatus: POStatus; icon: React.ReactNode } | null => {
    switch (status) {
      case 'draft':
        return { label: 'Submit', nextStatus: 'pending_approval', icon: null }
      case 'pending_approval':
        return { label: 'Approve', nextStatus: 'approved', icon: <Check className="h-4 w-4 mr-1" /> }
      case 'approved':
        return { label: 'Mark Ordered', nextStatus: 'ordered', icon: <Truck className="h-4 w-4 mr-1" /> }
      case 'ordered':
        return { label: 'Mark Received', nextStatus: 'received', icon: <Package className="h-4 w-4 mr-1" /> }
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Status</Label>
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(PO_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vendor</Label>
              <Select value={vendorFilter || 'all'} onValueChange={(v) => setVendorFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button asChild>
                <Link to="/operations/assets/purchase-orders/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create PO
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PO Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading purchase orders...</div>
          ) : purchaseOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No purchase orders found. Try adjusting your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => {
                  const action = getNextAction(po.status)
                  return (
                    <TableRow key={po.id}>
                      <TableCell className="font-mono text-sm">{po.poNumber}</TableCell>
                      <TableCell className="font-medium">{po.vendorName}</TableCell>
                      <TableCell>{po.items.length} items</TableCell>
                      <TableCell>{formatCurrency(po.totalAmount)}</TableCell>
                      <TableCell>{po.createdByName}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(po.status)}>
                          {PO_STATUS_LABELS[po.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {po.orderDate && <p>Ordered: {po.orderDate}</p>}
                          {po.expectedDelivery && (
                            <p className="text-muted-foreground">Expected: {po.expectedDelivery}</p>
                          )}
                          {po.receivedDate && <p className="text-green-600">Received: {po.receivedDate}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {action && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(po.id, action.nextStatus)}
                            disabled={updateStatus.isPending}
                          >
                            {action.icon}
                            {action.label}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Vendors SubTab Component
// ============================================
function VendorsSubTab() {
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  const { data: vendorsResult, isLoading } = useVendors({
    status: statusFilter || undefined,
  })
  const createVendor = useCreateVendor()
  const updateVendor = useUpdateVendor()
  const { toast } = useToast()

  const vendors = vendorsResult?.data || []

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    categories: [] as StockCategory[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedVendor) {
        await updateVendor.mutateAsync({ id: selectedVendor.id, data: formData })
        toast({ title: 'Vendor updated successfully' })
      } else {
        await createVendor.mutateAsync(formData)
        toast({ title: 'Vendor added successfully' })
      }
      handleCloseDialog()
    } catch {
      toast({ title: selectedVendor ? 'Failed to update vendor' : 'Failed to add vendor', variant: 'destructive' })
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedVendor(null)
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      gstNumber: '',
      categories: [],
    })
  }

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setFormData({
      name: vendor.name,
      contactPerson: vendor.contactPerson,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      gstNumber: vendor.gstNumber || '',
      categories: vendor.categories,
    })
    setIsDialogOpen(true)
  }

  const toggleCategory = (category: StockCategory) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Status</Label>
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                if (!open) handleCloseDialog()
                else setIsDialogOpen(true)
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vendor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
                    <DialogDescription>
                      {selectedVendor ? 'Update vendor information' : 'Register a new supplier'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Company Name *</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Vendor name"
                            required
                          />
                        </div>
                        <div>
                          <Label>Contact Person *</Label>
                          <Input
                            value={formData.contactPerson}
                            onChange={(e) =>
                              setFormData({ ...formData, contactPerson: e.target.value })
                            }
                            placeholder="Contact name"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Phone *</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            placeholder="+91 9876543210"
                            required
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="vendor@example.com"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Address *</Label>
                        <Input
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                          placeholder="Full address"
                          required
                        />
                      </div>
                      <div>
                        <Label>GST Number</Label>
                        <Input
                          value={formData.gstNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, gstNumber: e.target.value })
                          }
                          placeholder="GST registration number"
                        />
                      </div>
                      <div>
                        <Label>Categories</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(STOCK_CATEGORY_LABELS).map(([value, label]) => (
                            <Badge
                              key={value}
                              variant={
                                formData.categories.includes(value as StockCategory)
                                  ? 'default'
                                  : 'outline'
                              }
                              className="cursor-pointer"
                              onClick={() => toggleCategory(value as StockCategory)}
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createVendor.isPending || updateVendor.isPending}>
                        {selectedVendor
                          ? updateVendor.isPending ? 'Updating...' : 'Update Vendor'
                          : createVendor.isPending ? 'Adding...' : 'Add Vendor'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No vendors found. Add your first vendor.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">{vendor.contactPerson}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{vendor.phone}</p>
                        <p className="text-muted-foreground">{vendor.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vendor.categories.map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {STOCK_CATEGORY_LABELS[cat]}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{vendor.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{vendor.totalOrders}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          vendor.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {vendor.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(vendor)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Main AssetsTab Component
// ============================================
export function AssetsTab({ subTab, onSubTabChange }: AssetsTabProps) {
  return (
    <Tabs value={subTab} onValueChange={(v) => onSubTabChange(v as AssetsSubTab)}>
      <TabsList variant="secondary" className="flex flex-wrap w-full">
        <TabsTrigger variant="secondary" value="dashboard" className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 hidden sm:block" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="assets" className="flex items-center gap-2">
          <Package className="h-4 w-4 hidden sm:block" />
          Assets
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="stock" className="flex items-center gap-2">
          <Boxes className="h-4 w-4 hidden sm:block" />
          Stock
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="purchase-orders" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 hidden sm:block" />
          Purchase Orders
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="vendors" className="flex items-center gap-2">
          <Users className="h-4 w-4 hidden sm:block" />
          Vendors
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="dashboard" className="mt-0">
          <DashboardSubTab />
        </TabsContent>

        <TabsContent value="assets" className="mt-0">
          <AssetsSubTab />
        </TabsContent>

        <TabsContent value="stock" className="mt-0">
          <StockSubTab />
        </TabsContent>

        <TabsContent value="purchase-orders" className="mt-0">
          <PurchaseOrdersSubTab />
        </TabsContent>

        <TabsContent value="vendors" className="mt-0">
          <VendorsSubTab />
        </TabsContent>
      </div>
    </Tabs>
  )
}
