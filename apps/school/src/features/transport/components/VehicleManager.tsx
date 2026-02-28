import { useState } from 'react'
import { Plus, Bus, Trash2, Wrench, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useVehicles, useCreateVehicle, useDeleteVehicle, useRoutes } from '../hooks/useTransport'
import { VEHICLE_STATUS_LABELS, VEHICLE_TYPE_LABELS } from '../types/transport.types'

function isExpiringSoon(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays < 30 && diffDays > 0
}

function isExpired(dateStr: string) {
  return new Date(dateStr) < new Date()
}

export function VehicleManager() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const { toast } = useToast()

  const { data: result, isLoading } = useVehicles({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  })
  const { data: routesResult } = useRoutes()
  const createMutation = useCreateVehicle()
  const deleteMutation = useDeleteVehicle()

  const vehicles = result?.data || []
  const routes = routesResult?.data || []

  const [form, setForm] = useState({
    registrationNumber: '',
    type: 'bus' as const,
    make: '',
    model: '',
    year: 2024,
    capacity: 45,
    fuelType: 'diesel' as const,
    chassisNumber: '',
    engineNumber: '',
    insuranceExpiry: '',
    fitnessExpiry: '',
    permitExpiry: '',
  })

  const handleCreate = () => {
    createMutation.mutate(form, {
      onSuccess: () => {
        toast({ title: 'Vehicle added successfully' })
        setShowCreate(false)
        setForm({ registrationNumber: '', type: 'bus', make: '', model: '', year: 2024, capacity: 45, fuelType: 'diesel', chassisNumber: '', engineNumber: '', insuranceExpiry: '', fitnessExpiry: '', permitExpiry: '' })
      },
    })
  }

  const getRouteName = (routeId: string | null) => {
    if (!routeId) return 'Unassigned'
    return routes.find((r) => r.id === routeId)?.name || routeId
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">Loading vehicles...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(VEHICLE_STATUS_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(VEHICLE_TYPE_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowCreate(true)} className="sm:ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Vehicle Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-mono">{vehicle.registrationNumber}</CardTitle>
                <Badge variant={vehicle.status === 'running' ? 'success' : vehicle.status === 'maintenance' ? 'warning' : 'secondary'}>
                  {VEHICLE_STATUS_LABELS[vehicle.status]}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <Bus className="h-3.5 w-3.5" />
                {vehicle.make} {vehicle.model} ({vehicle.year}) - {VEHICLE_TYPE_LABELS[vehicle.type]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium">{vehicle.capacity} seats</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assigned To</span>
                  <span className="font-medium text-xs">{getRouteName(vehicle.assignedRouteId)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Odometer</span>
                  <span className="font-mono text-xs">{vehicle.odometerReading.toLocaleString()} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Wrench className="h-3 w-3" /> Next Service
                  </span>
                  <span className="text-xs">{vehicle.nextServiceDue || 'N/A'}</span>
                </div>

                {/* Expiry alerts */}
                <div className="pt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Insurance
                    </span>
                    <span className={`text-xs font-medium ${isExpired(vehicle.insuranceExpiry) ? 'text-destructive' : isExpiringSoon(vehicle.insuranceExpiry) ? 'text-orange-500' : ''}`}>
                      {isExpired(vehicle.insuranceExpiry) && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                      {vehicle.insuranceExpiry}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Fitness</span>
                    <span className={`text-xs font-medium ${isExpired(vehicle.fitnessExpiry) ? 'text-destructive' : isExpiringSoon(vehicle.fitnessExpiry) ? 'text-orange-500' : ''}`}>
                      {vehicle.fitnessExpiry}
                    </span>
                  </div>
                </div>

                {vehicle.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {vehicle.features.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-3">
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(vehicle.id, { onSuccess: () => toast({ title: 'Vehicle removed' }) })}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No vehicles found</div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Registration Number</Label>
                <Input value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} placeholder="KA-01-XX-0000" />
              </div>
              <div>
                <Label>Vehicle Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as typeof form.type })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(VEHICLE_TYPE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Make</Label>
                <Input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Tata" />
              </div>
              <div>
                <Label>Model</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Starbus" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Year</Label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Fuel Type</Label>
                <Select value={form.fuelType} onValueChange={(v) => setForm({ ...form, fuelType: v as typeof form.fuelType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="cng">CNG</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Insurance Expiry</Label>
                <Input type="date" value={form.insuranceExpiry} onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })} />
              </div>
              <div>
                <Label>Fitness Expiry</Label>
                <Input type="date" value={form.fitnessExpiry} onChange={(e) => setForm({ ...form, fitnessExpiry: e.target.value })} />
              </div>
              <div>
                <Label>Permit Expiry</Label>
                <Input type="date" value={form.permitExpiry} onChange={(e) => setForm({ ...form, permitExpiry: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.registrationNumber || createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
