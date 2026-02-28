import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, XCircle, CheckCircle, AlertCircle } from 'lucide-react'
import {
  usePreApproved,
  useCreatePreApproved,
  useRevokePreApproved,
} from '../hooks/useVisitors'
import { useToast } from '@/hooks/use-toast'

export function PreApprovedPage() {
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: preApprovedResult, isLoading } = usePreApproved({
    status: statusFilter || undefined,
  })
  const createPreApproved = useCreatePreApproved()
  const revokePreApproved = useRevokePreApproved()
  const { toast } = useToast()

  const preApproved = preApprovedResult?.data || []

  const [formData, setFormData] = useState({
    visitorName: '',
    visitorPhone: '',
    visitorCompany: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    purpose: '',
    maxVisits: 12,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPreApproved.mutateAsync(formData)
      toast({ title: 'Pre-approved visitor added successfully' })
      setIsDialogOpen(false)
      setFormData({
        visitorName: '',
        visitorPhone: '',
        visitorCompany: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        purpose: '',
        maxVisits: 12,
      })
    } catch {
      toast({ title: 'Failed to add pre-approved visitor', variant: 'destructive' })
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this pre-approval?')) return
    try {
      await revokePreApproved.mutateAsync(id)
      toast({ title: 'Pre-approval revoked successfully' })
    } catch {
      toast({ title: 'Failed to revoke pre-approval', variant: 'destructive' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-yellow-100 text-yellow-800'
      case 'revoked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUsagePercentage = (used: number, max: number) => {
    return Math.round((used / max) * 100)
  }

  return (
    <div>
      <PageHeader
        title="Pre-Approved Visitors"
        description="Manage recurring visitors and contractors"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Visitors', href: '/visitors' },
          { label: 'Pre-Approved' },
        ]}
      />

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Passes</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {preApproved.filter((p) => p.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently valid</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {preApproved.filter((p) => p.status === 'expired').length}
              </div>
              <p className="text-xs text-muted-foreground">Need renewal</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revoked</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {preApproved.filter((p) => p.status === 'revoked').length}
              </div>
              <p className="text-xs text-muted-foreground">Cancelled passes</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pre-Approved List</CardTitle>
                <CardDescription>Vendors, contractors, and regular visitors</CardDescription>
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Pre-Approved
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Pre-Approved Visitor</DialogTitle>
                      <DialogDescription>
                        Create a recurring access pass for a visitor
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Visitor Name *</Label>
                            <Input
                              value={formData.visitorName}
                              onChange={(e) =>
                                setFormData({ ...formData, visitorName: e.target.value })
                              }
                              placeholder="Full name"
                              required
                            />
                          </div>
                          <div>
                            <Label>Phone *</Label>
                            <Input
                              value={formData.visitorPhone}
                              onChange={(e) =>
                                setFormData({ ...formData, visitorPhone: e.target.value })
                              }
                              placeholder="+91 9876543210"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Company/Organization</Label>
                          <Input
                            value={formData.visitorCompany}
                            onChange={(e) =>
                              setFormData({ ...formData, visitorCompany: e.target.value })
                            }
                            placeholder="Company name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Valid From *</Label>
                            <Input
                              type="date"
                              value={formData.validFrom}
                              onChange={(e) =>
                                setFormData({ ...formData, validFrom: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label>Valid Until *</Label>
                            <Input
                              type="date"
                              value={formData.validUntil}
                              onChange={(e) =>
                                setFormData({ ...formData, validUntil: e.target.value })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Purpose *</Label>
                          <Input
                            value={formData.purpose}
                            onChange={(e) =>
                              setFormData({ ...formData, purpose: e.target.value })
                            }
                            placeholder="e.g., Regular stationary delivery"
                            required
                          />
                        </div>
                        <div>
                          <Label>Max Visits</Label>
                          <Input
                            type="number"
                            min={1}
                            value={formData.maxVisits}
                            onChange={(e) =>
                              setFormData({ ...formData, maxVisits: parseInt(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createPreApproved.isPending}>
                          {createPreApproved.isPending ? 'Adding...' : 'Add Pre-Approved'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : preApproved.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pre-approved visitors found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preApproved.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.visitorName}</p>
                          <p className="text-sm text-muted-foreground">{item.visitorPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.visitorCompany || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.purpose}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{item.validFrom}</p>
                          <p className="text-muted-foreground">to {item.validUntil}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {item.usedVisits}/{item.maxVisits}
                          </div>
                          <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${getUsagePercentage(item.usedVisits, item.maxVisits)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.approvedByName}</TableCell>
                      <TableCell>
                        {item.status === 'active' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRevoke(item.id)}
                            disabled={revokePreApproved.isPending}
                          >
                            Revoke
                          </Button>
                        )}
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
