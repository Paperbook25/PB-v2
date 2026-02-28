import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Trash2 } from 'lucide-react'
import { useVendors, useCreatePurchaseOrder } from '../hooks/useInventory'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface POItem {
  id: string
  itemName: string
  quantity: number
  unitPrice: number
}

export function CreatePurchaseOrderPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: vendorsResult } = useVendors({ status: 'active' })
  const createPO = useCreatePurchaseOrder()

  const vendors = vendorsResult?.data || []

  const [formData, setFormData] = useState({
    vendorId: '',
    expectedDelivery: '',
    notes: '',
  })

  const [items, setItems] = useState<POItem[]>([
    { id: '1', itemName: '', quantity: 1, unitPrice: 0 },
  ])

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), itemName: '', quantity: 1, unitPrice: 0 },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length === 1) return
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof POItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.vendorId) {
      toast({ title: 'Please select a vendor', variant: 'destructive' })
      return
    }

    const validItems = items.filter((item) => item.itemName.trim() && item.quantity > 0)
    if (validItems.length === 0) {
      toast({ title: 'Please add at least one item', variant: 'destructive' })
      return
    }

    try {
      await createPO.mutateAsync({
        vendorId: formData.vendorId,
        items: validItems.map((item) => ({
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })),
        expectedDelivery: formData.expectedDelivery || undefined,
        notes: formData.notes || undefined,
      })
      toast({ title: 'Purchase order created successfully' })
      navigate('/inventory/purchase-orders')
    } catch {
      toast({ title: 'Failed to create purchase order', variant: 'destructive' })
    }
  }

  return (
    <div>
      <PageHeader
        title="Create Purchase Order"
        description="Create a new purchase order for procurement"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Inventory', href: '/inventory' },
          { label: 'Purchase Orders', href: '/inventory/purchase-orders' },
          { label: 'Create' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Vendor *</Label>
                <Select
                  value={formData.vendorId}
                  onValueChange={(v) => setFormData({ ...formData, vendorId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expected Delivery Date</Label>
                <Input
                  type="date"
                  value={formData.expectedDelivery}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedDelivery: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or instructions..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.itemName}
                        onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
                        placeholder="Item name"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(calculateTotal())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/inventory/purchase-orders')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createPO.isPending}>
            {createPO.isPending ? 'Creating...' : 'Create Purchase Order'}
          </Button>
        </div>
      </form>
    </div>
  )
}
