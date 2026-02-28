import { useState } from 'react'
import { Plus, MapPin, Users, Trash2, Eye, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useRoutes, useCreateRoute, useDeleteRoute } from '../hooks/useTransport'
import { ROUTE_STATUS_LABELS } from '../types/transport.types'
import type { RouteStatus } from '../types/transport.types'

export function RouteManager() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const { toast } = useToast()

  const { data: result, isLoading } = useRoutes({
    status: statusFilter || undefined,
    search: search || undefined,
  })
  const createMutation = useCreateRoute()
  const deleteMutation = useDeleteRoute()

  const routes = result?.data || []
  const viewingRoute = routes.find((r) => r.id === selectedRoute)

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    monthlyFee: 2000,
  })

  const handleCreate = () => {
    createMutation.mutate(
      {
        name: form.name,
        code: form.code,
        description: form.description,
        monthlyFee: form.monthlyFee,
        stops: [],
      },
      {
        onSuccess: () => {
          toast({ title: 'Route created successfully' })
          setShowCreate(false)
          setForm({ name: '', code: '', description: '', monthlyFee: 2000 })
        },
      }
    )
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Route deleted' }),
    })
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">Loading routes...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search routes..."
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
            {Object.entries(ROUTE_STATUS_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowCreate(true)} className="sm:ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Route
        </Button>
      </div>

      {/* Route Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Card key={route.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{route.name}</CardTitle>
                <Badge variant={route.status === 'active' ? 'success' : route.status === 'maintenance' ? 'warning' : 'secondary'}>
                  {ROUTE_STATUS_LABELS[route.status as RouteStatus]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">{route.code}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Stops</span>
                  <span className="font-medium">{route.stops.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Students</span>
                  <span className="font-medium">{route.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-medium">{route.totalDistance} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> Monthly Fee</span>
                  <span className="font-medium">{formatCurrency(route.monthlyFee)}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedRoute(route.id)}>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View Stops
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(route.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {routes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No routes found</div>
      )}

      {/* View Stops Dialog */}
      <Dialog open={!!selectedRoute} onOpenChange={() => setSelectedRoute(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{viewingRoute?.name} - Stops</DialogTitle>
          </DialogHeader>
          {viewingRoute && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Stop Name</TableHead>
                  <TableHead>Landmark</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Drop</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewingRoute.stops.map((stop) => (
                  <TableRow key={stop.id}>
                    <TableCell className="font-mono text-xs">{stop.order}</TableCell>
                    <TableCell className="font-medium">{stop.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{stop.landmark}</TableCell>
                    <TableCell className="font-mono text-xs">{stop.pickupTime}</TableCell>
                    <TableCell className="font-mono text-xs">{stop.dropTime}</TableCell>
                    <TableCell className="text-right">{stop.studentCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Route Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Route F - New Area" />
              </div>
              <div>
                <Label>Route Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="RT-F" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Covers areas..." />
            </div>
            <div>
              <Label>Monthly Fee (INR)</Label>
              <Input type="number" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name || !form.code || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Route'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
