import { useState } from 'react'
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
import { Plus, Heart, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import {
  useContributions,
  useCreateContribution,
  useUpdateContributionStatus,
  useAlumni,
} from '../hooks/useAlumni'
import {
  CONTRIBUTION_TYPE_LABELS,
  CONTRIBUTION_STATUS_LABELS,
  type ContributionType,
  type ContributionStatus,
} from '../types/alumni.types'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export function ContributionsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: contributionsResult, isLoading } = useContributions({
    type: typeFilter && typeFilter !== 'all' ? typeFilter as ContributionType : undefined,
    status: statusFilter && statusFilter !== 'all' ? statusFilter as ContributionStatus : undefined,
  })
  const { data: alumniResult } = useAlumni({ isVerified: true, limit: 200 })
  const createContribution = useCreateContribution()
  const updateStatus = useUpdateContributionStatus()
  const { toast } = useToast()

  const contributions = contributionsResult?.data || []
  const alumniList = alumniResult?.data || []

  type Contribution = typeof contributions extends (infer U)[] ? U : never
  type AlumniMember = typeof alumniList extends (infer U)[] ? U : never

  // Calculate summary stats
  const totalPledged = contributions
    .filter((c: Contribution) => c.status === 'pledged' && c.amount)
    .reduce((sum: number, c: Contribution) => sum + (c.amount || 0), 0)
  const totalReceived = contributions
    .filter((c: Contribution) => c.status === 'received' && c.amount)
    .reduce((sum: number, c: Contribution) => sum + (c.amount || 0), 0)
  const totalUtilized = contributions
    .filter((c: Contribution) => c.status === 'utilized' && c.amount)
    .reduce((sum: number, c: Contribution) => sum + (c.amount || 0), 0)

  const [formData, setFormData] = useState({
    alumniId: '',
    type: 'monetary' as ContributionType,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createContribution.mutateAsync({
        ...formData,
        amount: formData.amount ? parseInt(formData.amount) : undefined,
      })
      toast({ title: 'Contribution recorded successfully' })
      setIsDialogOpen(false)
      setFormData({
        alumniId: '',
        type: 'monetary',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      })
    } catch {
      toast({ title: 'Failed to record contribution', variant: 'destructive' })
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: ContributionStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus })
      toast({ title: `Status updated to ${CONTRIBUTION_STATUS_LABELS[newStatus]}` })
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    }
  }

  const getStatusColor = (status: ContributionStatus) => {
    switch (status) {
      case 'pledged':
        return 'bg-yellow-100 text-yellow-800'
      case 'received':
        return 'bg-blue-100 text-blue-800'
      case 'utilized':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getNextStatus = (
    current: ContributionStatus
  ): { status: ContributionStatus; label: string } | null => {
    switch (current) {
      case 'pledged':
        return { status: 'received', label: 'Mark Received' }
      case 'received':
        return { status: 'utilized', label: 'Mark Utilized' }
      default:
        return null
    }
  }

  return (
    <div>
      <PageHeader
        title="Contributions"
        description="Track alumni donations, scholarships, and support"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Alumni', href: '/alumni' },
          { label: 'Contributions' },
        ]}
      />

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pledged</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPledged)}</div>
              <p className="text-xs text-muted-foreground">Awaiting collection</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received</CardTitle>
              <Heart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalReceived)}</div>
              <p className="text-xs text-muted-foreground">Ready for utilization</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilized</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalUtilized)}</div>
              <p className="text-xs text-muted-foreground">Applied to programs</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(CONTRIBUTION_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(CONTRIBUTION_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Record Contribution
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Record Contribution</DialogTitle>
                      <DialogDescription>
                        Record a new alumni contribution or pledge
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label>Alumni *</Label>
                          <Select
                            value={formData.alumniId}
                            onValueChange={(v) => setFormData({ ...formData, alumniId: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select verified alumni" />
                            </SelectTrigger>
                            <SelectContent>
                              {alumniList.map((a: AlumniMember) => (
                                <SelectItem key={a.id} value={a.id}>
                                  {a.name} ({a.batch})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Type *</Label>
                            <Select
                              value={formData.type}
                              onValueChange={(v) =>
                                setFormData({ ...formData, type: v as ContributionType })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(CONTRIBUTION_TYPE_LABELS).map(
                                  ([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Date *</Label>
                            <Input
                              type="date"
                              value={formData.date}
                              onChange={(e) =>
                                setFormData({ ...formData, date: e.target.value })
                              }
                              required
                            />
                          </div>
                        </div>
                        {(formData.type === 'monetary' || formData.type === 'scholarship') && (
                          <div>
                            <Label>Amount (₹)</Label>
                            <Input
                              type="number"
                              value={formData.amount}
                              onChange={(e) =>
                                setFormData({ ...formData, amount: e.target.value })
                              }
                              placeholder="Enter amount"
                            />
                          </div>
                        )}
                        <div>
                          <Label>Description *</Label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Describe the contribution"
                            rows={3}
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createContribution.isPending}>
                          {createContribution.isPending ? 'Recording...' : 'Record Contribution'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contributions Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading contributions...</div>
            ) : contributions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No contributions found. Record your first contribution.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumni</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributions.map((contribution: Contribution) => {
                    const nextAction = getNextStatus(contribution.status)
                    return (
                      <TableRow key={contribution.id}>
                        <TableCell className="font-medium">{contribution.alumniName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CONTRIBUTION_TYPE_LABELS[contribution.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {contribution.description}
                        </TableCell>
                        <TableCell>
                          {contribution.amount ? formatCurrency(contribution.amount) : '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(contribution.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(contribution.status)}>
                            {CONTRIBUTION_STATUS_LABELS[contribution.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {nextAction && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusUpdate(contribution.id, nextAction.status)
                              }
                              disabled={updateStatus.isPending}
                            >
                              <ArrowRight className="h-3 w-3 mr-1" />
                              {nextAction.label}
                            </Button>
                          )}
                          {contribution.acknowledgement && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {contribution.acknowledgement}
                            </p>
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
