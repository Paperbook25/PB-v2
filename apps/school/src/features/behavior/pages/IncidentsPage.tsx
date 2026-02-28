import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Plus,
  Search,
  FileWarning,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Bell,
  CheckCircle,
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
  useIncidents,
  useDeleteIncident,
  useUpdateIncident,
  useNotifyParent,
} from '../hooks/useBehavior'
import { IncidentCategory, IncidentSeverity, IncidentStatus } from '../types/behavior.types'
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

// Standardized severity and status colors - consistent with BehaviorMainPage
const severityStyles: Record<IncidentSeverity, React.CSSProperties> = {
  minor: { backgroundColor: 'var(--color-status-info-light)', color: 'var(--color-status-info)' },
  moderate: { backgroundColor: 'var(--color-status-warning-light)', color: 'var(--color-status-warning)' },
  major: { backgroundColor: 'var(--color-module-behavior-light)', color: 'var(--color-module-behavior)' },
  critical: { backgroundColor: 'var(--color-status-error-light)', color: 'var(--color-status-error)' },
}

const statusStyles: Record<IncidentStatus, React.CSSProperties> = {
  reported: { backgroundColor: 'var(--color-status-info-light)', color: 'var(--color-status-info)' },
  under_review: { backgroundColor: 'var(--color-status-warning-light)', color: 'var(--color-status-warning)' },
  resolved: { backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' },
  escalated: { backgroundColor: 'var(--color-status-error-light)', color: 'var(--color-status-error)' },
}

const categories: { value: IncidentCategory; label: string }[] = [
  { value: 'tardiness', label: 'Tardiness' },
  { value: 'dress_code', label: 'Dress Code' },
  { value: 'disruptive_behavior', label: 'Disruptive Behavior' },
  { value: 'bullying', label: 'Bullying' },
  { value: 'fighting', label: 'Fighting' },
  { value: 'property_damage', label: 'Property Damage' },
  { value: 'academic_dishonesty', label: 'Academic Dishonesty' },
  { value: 'substance_abuse', label: 'Substance Abuse' },
  { value: 'verbal_abuse', label: 'Verbal Abuse' },
  { value: 'insubordination', label: 'Insubordination' },
  { value: 'other', label: 'Other' },
]

export function IncidentsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<IncidentCategory | 'all'>('all')
  const [severity, setSeverity] = useState<IncidentSeverity | 'all'>('all')
  const [status, setStatus] = useState<IncidentStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: result, isLoading } = useIncidents({
    search: search || undefined,
    category: category !== 'all' ? category : undefined,
    severity: severity !== 'all' ? severity : undefined,
    status: status !== 'all' ? status : undefined,
    page,
    limit: 10,
  })

  const deleteMutation = useDeleteIncident()
  const updateMutation = useUpdateIncident()
  const notifyMutation = useNotifyParent()

  const incidents = result?.data || []
  const meta = result?.meta || { total: 0, totalPages: 1 }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({
        title: 'Incident deleted',
        description: 'The incident has been deleted successfully.',
      })
      setDeleteId(null)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete incident.',
        variant: 'destructive',
      })
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          status: 'resolved',
          resolution: {
            resolvedBy: 'current-user',
            resolvedByName: 'Current User',
            notes: 'Marked as resolved',
            outcome: 'no_action',
          },
        },
      })
      toast({
        title: 'Incident resolved',
        description: 'The incident has been marked as resolved.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to resolve incident.',
        variant: 'destructive',
      })
    }
  }

  const handleNotifyParent = async (id: string) => {
    try {
      await notifyMutation.mutateAsync(id)
      toast({
        title: 'Parent notified',
        description: 'The parent has been notified about the incident.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to notify parent.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident Reports"
        description="View and manage behavioral incidents"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Behavior', href: '/behavior' },
          { label: 'Incidents' },
        ]}
        actions={
          <Button onClick={() => navigate('/behavior/incidents/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Report Incident
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as IncidentCategory | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={severity}
          onValueChange={(v) => setSeverity(v as IncidentSeverity | 'all')}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="minor">Minor</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="major">Major</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as IncidentStatus | 'all')}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
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
      ) : incidents.length === 0 ? (
        <div className="text-center py-12">
          <FileWarning className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No incidents found</p>
          <Button onClick={() => navigate('/behavior/incidents/new')}>
            Report an Incident
          </Button>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Incident</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(incident.incidentDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{incident.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {incident.studentClass} - {incident.studentSection}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer hover:text-primary"
                      onClick={() => navigate(`/behavior/incidents/${incident.id}`)}
                    >
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {incident.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {incident.category.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge style={severityStyles[incident.severity]}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge style={statusStyles[incident.status]}>
                      {incident.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {incident.parentNotified ? (
                      <Badge variant="outline" className="text-green-600">
                        Notified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/behavior/incidents/${incident.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {!incident.parentNotified && (
                          <DropdownMenuItem
                            onClick={() => handleNotifyParent(incident.id)}
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Notify Parent
                          </DropdownMenuItem>
                        )}
                        {incident.status !== 'resolved' && (
                          <DropdownMenuItem
                            onClick={() => handleResolve(incident.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => navigate(`/behavior/incidents/${incident.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(incident.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
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
            <AlertDialogTitle>Delete Incident</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this incident? This action cannot be
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
