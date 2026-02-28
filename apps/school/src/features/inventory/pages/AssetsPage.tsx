import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Search, Pencil } from 'lucide-react'
import { useAssets, useCreateAsset, useUpdateAsset } from '../hooks/useInventory'
import type { Asset } from '../types/inventory.types'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
  ASSET_STATUS_LABELS,
  type AssetCategory,
  type AssetCondition,
} from '../types/inventory.types'

export function AssetsPage() {
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
    <div>
      <PageHeader
        title="Assets"
        description="Manage school assets and equipment"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Inventory', href: '/inventory' },
          { label: 'Assets' },
        ]}
      />

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
    </div>
  )
}
