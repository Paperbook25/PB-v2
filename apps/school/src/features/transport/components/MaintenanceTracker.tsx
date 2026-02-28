import { useState } from 'react'
import { Plus, Wrench, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useMaintenanceRecords, useCreateMaintenance, useUpdateMaintenance, useVehicles } from '../hooks/useTransport'
import { MAINTENANCE_TYPE_LABELS, MAINTENANCE_STATUS_LABELS } from '../types/transport.types'
import type { MaintenanceType } from '../types/transport.types'

export function MaintenanceTracker() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [vehicleFilter, setVehicleFilter] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const { toast } = useToast()

  const { data: result, isLoading } = useMaintenanceRecords({
    vehicleId: vehicleFilter || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  })
  const { data: vehiclesResult } = useVehicles()
  const createMutation = useCreateMaintenance()
  const updateMutation = useUpdateMaintenance()

  const records = result?.data || []
  const vehicles = vehiclesResult?.data || []

  const [form, setForm] = useState({
    vehicleId: '',
    type: 'routine' as MaintenanceType,
    description: '',
    scheduledDate: '',
    cost: 0,
    vendor: '',
    notes: '',
  })

  const handleCreate = () => {
    createMutation.mutate(form, {
      onSuccess: () => {
        toast({ title: 'Maintenance record created' })
        setShowCreate(false)
        setForm({ vehicleId: '', type: 'routine', description: '', scheduledDate: '', cost: 0, vendor: '', notes: '' })
      },
    })
  }

  const handleMarkComplete = (id: string) => {
    updateMutation.mutate(
      { id, data: { status: 'completed', completedDate: new Date().toISOString().split('T')[0] } },
      { onSuccess: () => toast({ title: 'Marked as completed' }) }
    )
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'in_progress': return <Wrench className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-orange-500" />
    }
  }

  const statusVariant = (status: string): 'success' | 'destructive' | 'warning' | 'secondary' => {
    switch (status) {
      case 'completed': return 'success'
      case 'overdue': return 'destructive'
      case 'in_progress': return 'warning'
      default: return 'secondary'
    }
  }

  // Stats
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0)
  const overdueCount = records.filter((r) => r.status === 'overdue').length
  const scheduledCount = records.filter((r) => r.status === 'scheduled').length

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{records.length}</p>
            <p className="text-xs text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{scheduledCount}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
            <p className="text-xs text-muted-foreground">Total Cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
          <SelectTrigger className="sm:w-[200px]">
            <SelectValue placeholder="All vehicles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.registrationNumber}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(MAINTENANCE_STATUS_LABELS).map(([val, label]) => (
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
            {Object.entries(MAINTENANCE_TYPE_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowCreate(true)} className="sm:ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Records Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{statusIcon(record.status)}</TableCell>
                  <TableCell className="font-mono text-xs">{record.vehicleNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{MAINTENANCE_TYPE_LABELS[record.type]}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">{record.description}</TableCell>
                  <TableCell className="text-xs">{record.scheduledDate}</TableCell>
                  <TableCell className="text-sm">{record.vendor}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(record.cost)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(record.status)}>
                      {MAINTENANCE_STATUS_LABELS[record.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(record.status === 'scheduled' || record.status === 'in_progress') && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkComplete(record.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {records.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No maintenance records found</div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vehicle</Label>
                <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.registrationNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MaintenanceType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(MAINTENANCE_TYPE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Scheduled Date</Label>
                <Input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
              </div>
              <div>
                <Label>Estimated Cost (INR)</Label>
                <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Vendor</Label>
              <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Service center name" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.vehicleId || !form.description || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
