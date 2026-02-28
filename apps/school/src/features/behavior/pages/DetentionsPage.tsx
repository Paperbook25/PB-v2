import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useDetentions,
  useUpdateDetention,
  useDeleteDetention,
} from '../hooks/useBehavior'
import { DetentionStatus } from '../types/behavior.types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Standardized status colors - consistent with BehaviorMainPage
const statusConfig: Record<
  DetentionStatus,
  { label: string; icon: typeof Clock; style: React.CSSProperties }
> = {
  scheduled: { label: 'Scheduled', icon: Clock, style: { backgroundColor: 'var(--color-status-info-light)', color: 'var(--color-status-info)' } },
  attended: { label: 'Attended', icon: CheckCircle, style: { backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' } },
  missed: { label: 'Missed', icon: XCircle, style: { backgroundColor: 'var(--color-status-error-light)', color: 'var(--color-status-error)' } },
  excused: { label: 'Excused', icon: AlertCircle, style: { backgroundColor: 'var(--color-status-warning-light)', color: 'var(--color-status-warning)' } },
  cancelled: { label: 'Cancelled', icon: XCircle, style: { backgroundColor: 'var(--color-status-inactive-light)', color: 'var(--color-status-inactive)' } },
}

export function DetentionsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<DetentionStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: result, isLoading } = useDetentions({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    page,
    limit: 10,
  })

  const updateMutation = useUpdateDetention()
  const deleteMutation = useDeleteDetention()

  const detentions = result?.data || []
  const meta = result?.meta || { total: 0, totalPages: 1 }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({
        title: 'Detention deleted',
        description: 'The detention has been deleted successfully.',
      })
      setDeleteId(null)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete detention.',
        variant: 'destructive',
      })
    }
  }

  const handleStatusChange = async (id: string, newStatus: DetentionStatus) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { status: newStatus },
      })
      toast({
        title: 'Detention updated',
        description: `Detention marked as ${newStatus}.`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update detention.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detention Schedule"
        description="Manage student detentions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Behavior', href: '/behavior' },
          { label: 'Detentions' },
        ]}
        actions={
          <Button onClick={() => navigate('/behavior/detentions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Detention
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as DetentionStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="attended">Attended</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
            <SelectItem value="excused">Excused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      ) : detentions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No detentions found</p>
          <Button onClick={() => navigate('/behavior/detentions/new')}>
            Schedule a Detention
          </Button>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detentions.map((detention) => {
                const statusInfo = statusConfig[detention.status]
                return (
                  <TableRow key={detention.id}>
                    <TableCell className="font-medium">
                      {format(new Date(detention.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {detention.startTime} - {detention.endTime}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{detention.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {detention.studentClass}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {detention.reason}
                    </TableCell>
                    <TableCell>{detention.location}</TableCell>
                    <TableCell>{detention.supervisorName}</TableCell>
                    <TableCell>
                      <Badge style={statusInfo.style}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {detention.status === 'scheduled' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(detention.id, 'attended')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Mark Attended
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(detention.id, 'missed')}
                              >
                                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                Mark Missed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(detention.id, 'excused')}
                              >
                                <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                                Mark Excused
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/behavior/detentions/${detention.id}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(detention.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Detention</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this detention? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
