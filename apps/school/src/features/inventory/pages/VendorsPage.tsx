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
import { Plus, Star, Pencil } from 'lucide-react'
import { useVendors, useCreateVendor, useUpdateVendor } from '../hooks/useInventory'
import type { Vendor } from '../types/inventory.types'
import { useToast } from '@/hooks/use-toast'
import { STOCK_CATEGORY_LABELS, type StockCategory } from '../types/inventory.types'

export function VendorsPage() {
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
    <div>
      <PageHeader
        title="Vendors"
        description="Manage supplier and vendor directory"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Inventory', href: '/inventory' },
          { label: 'Vendors' },
        ]}
      />

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
    </div>
  )
}
