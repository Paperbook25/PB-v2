import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Check, Truck, Package } from 'lucide-react'
import { usePurchaseOrders, useUpdatePOStatus, useVendors } from '../hooks/useInventory'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { PO_STATUS_LABELS, type POStatus } from '../types/inventory.types'
import { Link } from 'react-router-dom'

export function PurchaseOrdersPage() {
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
    <div>
      <PageHeader
        title="Purchase Orders"
        description="Manage procurement and purchase orders"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Inventory', href: '/inventory' },
          { label: 'Purchase Orders' },
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
                  <Link to="/inventory/purchase-orders/new">
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
    </div>
  )
}
