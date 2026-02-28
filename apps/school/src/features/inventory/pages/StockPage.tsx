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
import { Search, Plus, Minus, RefreshCw } from 'lucide-react'
import { useStock, useAdjustStock } from '../hooks/useInventory'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { STOCK_CATEGORY_LABELS, type StockItem } from '../types/inventory.types'

export function StockPage() {
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
    <div>
      <PageHeader
        title="Stock Items"
        description="Manage consumable stock and inventory"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Inventory', href: '/inventory' },
          { label: 'Stock' },
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
    </div>
  )
}
