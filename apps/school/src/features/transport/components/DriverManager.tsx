import { useState } from 'react'
import { Plus, Trash2, Phone, Mail, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn, getInitials } from '@/lib/utils'
import { useDrivers, useCreateDriver, useDeleteDriver, useRoutes } from '../hooks/useTransport'
import { DRIVER_STATUS_LABELS } from '../types/transport.types'

export function DriverManager() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const { toast } = useToast()

  const { data: result, isLoading } = useDrivers({
    status: statusFilter || undefined,
    search: search || undefined,
  })
  const { data: routesResult } = useRoutes()
  const createMutation = useCreateDriver()
  const deleteMutation = useDeleteDriver()

  const drivers = result?.data || []
  const routes = routesResult?.data || []

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseType: 'Heavy Vehicle',
    experience: 0,
    address: '',
    emergencyContact: '',
    bloodGroup: 'O+',
    salary: 15000,
  })

  const handleCreate = () => {
    createMutation.mutate(form, {
      onSuccess: () => {
        toast({ title: 'Driver added successfully' })
        setShowCreate(false)
        setForm({ name: '', phone: '', email: '', licenseNumber: '', licenseExpiry: '', licenseType: 'Heavy Vehicle', experience: 0, address: '', emergencyContact: '', bloodGroup: 'O+', salary: 15000 })
      },
    })
  }

  const getRouteName = (routeId: string | null) => {
    if (!routeId) return 'Unassigned'
    return routes.find((r) => r.id === routeId)?.name || routeId
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">Loading drivers...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search drivers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(DRIVER_STATUS_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowCreate(true)} className="sm:ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      {/* Driver Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drivers.map((driver) => (
          <Card key={driver.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={driver.photoUrl} />
                  <AvatarFallback>{getInitials(driver.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{driver.name}</p>
                    <Badge variant={driver.status === 'active' ? 'success' : driver.status === 'on_leave' ? 'warning' : 'secondary'}>
                      {DRIVER_STATUS_LABELS[driver.status]}
                    </Badge>
                  </div>

                  <div className="mt-2 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{driver.email}</span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">License</span>
                      <span className="font-mono text-xs">{driver.licenseNumber.slice(-10)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">License Expiry</span>
                      <span className={cn(
                        'text-xs',
                        new Date(driver.licenseExpiry) < new Date() && 'text-destructive font-medium'
                      )}>{driver.licenseExpiry}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Experience</span>
                      <span>{driver.experience} years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Route</span>
                      <span className="text-xs font-medium truncate max-w-[140px]">{getRouteName(driver.assignedRouteId)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Salary</span>
                      <span className="font-medium">{formatCurrency(driver.salary)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(driver.id, { onSuccess: () => toast({ title: 'Driver removed' }) })}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {drivers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No drivers found</div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter name" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>License Number</Label>
                <Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} placeholder="KA01XXXX" />
              </div>
              <div>
                <Label>License Expiry</Label>
                <Input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Experience (years)</Label>
                <Input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Blood Group</Label>
                <Select value={form.bloodGroup} onValueChange={(v) => setForm({ ...form, bloodGroup: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Salary (INR)</Label>
                <Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Emergency Contact</Label>
              <Input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="+91 98765 43200" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name || !form.phone || createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
