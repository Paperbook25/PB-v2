import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import {
  AlertTriangle,
  FileWarning,
  Award,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Plus,
  ArrowRight,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  LayoutDashboard,
  Shield,
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import {
  useBehaviorStats,
  useIncidents,
  useLeaderboard,
  useDeleteIncident,
  useUpdateIncident,
  useNotifyParent,
  useDetentions,
  useUpdateDetention,
  useDeleteDetention,
} from '../hooks/useBehavior'
import {
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
  DetentionStatus,
} from '../types/behavior.types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { chartColors, detentionStatusColors } from '@/lib/design-tokens'

// Tab types
type PrimaryTab = 'dashboard' | 'incidents' | 'detentions'

// Chart colors from design tokens
const COLORS = chartColors

// Severity and status colors - standardized across all behavior pages
const severityColors: Record<IncidentSeverity, { bg: string; text: string }> = {
  minor: { bg: 'var(--color-status-info-light)', text: 'var(--color-status-info)' },
  moderate: { bg: 'var(--color-status-warning-light)', text: 'var(--color-status-warning)' },
  major: { bg: 'var(--color-module-behavior-light)', text: 'var(--color-module-behavior)' },
  critical: { bg: 'var(--color-status-error-light)', text: 'var(--color-status-error)' },
}

const incidentStatusColors: Record<IncidentStatus, { bg: string; text: string }> = {
  reported: { bg: 'var(--color-status-info-light)', text: 'var(--color-status-info)' },
  under_review: { bg: 'var(--color-status-warning-light)', text: 'var(--color-status-warning)' },
  resolved: { bg: 'var(--color-status-success-light)', text: 'var(--color-status-success)' },
  escalated: { bg: 'var(--color-status-error-light)', text: 'var(--color-status-error)' },
}

const detentionStatusConfig: Record<
  DetentionStatus,
  { label: string; icon: typeof Clock; style: { backgroundColor: string; color: string } }
> = {
  scheduled: { label: 'Scheduled', icon: Clock, style: { ...detentionStatusColors.scheduled } },
  attended: { label: 'Attended', icon: CheckCircle, style: { ...detentionStatusColors.attended } },
  missed: { label: 'Missed', icon: XCircle, style: { ...detentionStatusColors.missed } },
  excused: { label: 'Excused', icon: AlertCircle, style: { ...detentionStatusColors.excused } },
  cancelled: { label: 'Cancelled', icon: XCircle, style: { ...detentionStatusColors.cancelled } },
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

// ============================================
// Dashboard Tab Component
// ============================================
function DashboardTab() {
  const navigate = useNavigate()
  const { data: statsResult, isLoading: statsLoading } = useBehaviorStats()
  const { data: incidentsResult } = useIncidents({ status: 'reported', limit: 5 })
  const { data: leaderboardResult } = useLeaderboard('positive', 5)

  const stats = statsResult?.data
  const recentIncidents = incidentsResult?.data || []
  const topStudents = leaderboardResult?.data || []

  const quickActions = [
    {
      label: 'Report Incident',
      icon: FileWarning,
      href: '/behavior/incidents/new',
      style: { backgroundColor: 'var(--color-module-behavior)' },
    },
    {
      label: 'Award Points',
      icon: Award,
      href: '/behavior/points/new',
      style: { backgroundColor: 'var(--color-module-behavior)' },
    },
    {
      label: 'Schedule Detention',
      icon: Clock,
      href: '/behavior/detentions/new',
      style: { backgroundColor: 'var(--color-module-behavior)' },
    },
    {
      label: 'View Analytics',
      icon: TrendingUp,
      href: '/behavior/analytics',
      style: { backgroundColor: 'var(--color-module-behavior)' },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => navigate(action.href)}
          >
            <div className="p-2 rounded-lg text-white" style={action.style}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalIncidents || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Incidents</p>
                  </div>
                  <FileWarning className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalActions || 0}</p>
                    <p className="text-sm text-muted-foreground">Actions Taken</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      +{stats?.totalPositivePoints || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Positive Points</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      -{stats?.totalNegativePoints || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Negative Points</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.detentionStats.scheduled || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Detentions Scheduled</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats?.studentsAtRisk?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">At-Risk Students</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={stats?.incidentsByCategory.filter((c) => c.count > 0) || []}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      value.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
                    }
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Incidents by Severity */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats?.incidentsBySeverity.filter((s) => s.count > 0) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ severity, count }) =>
                      `${severity.charAt(0).toUpperCase() + severity.slice(1)}: ${count}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats?.incidentsBySeverity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Incidents</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/behavior?tab=incidents')}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentIncidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileWarning className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending incidents</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/behavior/incidents/${incident.id}`)}
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {incident.studentName} - {incident.studentClass}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge style={{ backgroundColor: severityColors[incident.severity].bg, color: severityColors[incident.severity].text }}>
                          {incident.severity}
                        </Badge>
                        <Badge style={{ backgroundColor: incidentStatusColors[incident.status].bg, color: incidentStatusColors[incident.status].text }}>
                          {incident.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(incident.reportedAt), 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Students Leaderboard */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Students (Positive Points)</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/behavior/points')}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No points awarded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0
                            ? 'bg-yellow-500'
                            : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                            ? 'bg-amber-600'
                            : 'bg-blue-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{student.total}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Students */}
      {stats?.studentsAtRisk && stats.studentsAtRisk.length > 0 && (
        <Card className="border-orange-200" style={{ backgroundColor: 'var(--color-module-behavior-light)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Students Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.studentsAtRisk.map((student) => (
                <div
                  key={student.studentId}
                  className="bg-white p-4 rounded-lg border border-orange-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{student.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.studentClass} - {student.studentSection}
                      </p>
                    </div>
                    <Badge
                      variant={
                        student.behaviorTrend === 'declining' ? 'destructive' : 'secondary'
                      }
                    >
                      {student.behaviorTrend}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Incidents:</span>
                      <span className="ml-1 font-medium">{student.incidentCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active Actions:</span>
                      <span className="ml-1 font-medium">{student.activeActions}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Net Points:</span>
                      <span
                        className={`ml-1 font-medium ${
                          student.netPoints < 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {student.netPoints > 0 ? '+' : ''}
                        {student.netPoints}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// Incidents Tab Component
// ============================================
function IncidentsTab() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { hasRole } = useAuthStore()
  const canManageBehavior = hasRole(['admin', 'principal'])
  const canEditIncidents = hasRole(['admin', 'principal', 'teacher'])
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {meta.total} incident{meta.total !== 1 ? 's' : ''} found
        </p>
        <Button onClick={() => navigate('/behavior/incidents/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      </div>

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
                    <Badge style={{ backgroundColor: severityColors[incident.severity].bg, color: severityColors[incident.severity].text }}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge style={{ backgroundColor: incidentStatusColors[incident.status].bg, color: incidentStatusColors[incident.status].text }}>
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
                        {canEditIncidents && !incident.parentNotified && (
                          <DropdownMenuItem
                            onClick={() => handleNotifyParent(incident.id)}
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Notify Parent
                          </DropdownMenuItem>
                        )}
                        {canEditIncidents && incident.status !== 'resolved' && (
                          <DropdownMenuItem
                            onClick={() => handleResolve(incident.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </DropdownMenuItem>
                        )}
                        {canEditIncidents && (
                          <DropdownMenuItem
                            onClick={() => navigate(`/behavior/incidents/${incident.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {canManageBehavior && (
                          <DropdownMenuItem
                            onClick={() => setDeleteId(incident.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
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

// ============================================
// Detentions Tab Component
// ============================================
function DetentionsTab() {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {meta.total} detention{meta.total !== 1 ? 's' : ''} found
        </p>
        <Button onClick={() => navigate('/behavior/detentions/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Detention
        </Button>
      </div>

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
                const statusInfo = detentionStatusConfig[detention.status]
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

// ============================================
// Main BehaviorMainPage Component
// ============================================
export function BehaviorMainPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { hasRole } = useAuthStore()
  const canManageBehavior = hasRole(['admin', 'principal', 'teacher'])

  // Primary tab
  const activeTab = (searchParams.get('tab') as PrimaryTab) || 'dashboard'

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  const getHeaderActions = () => {
    if (!canManageBehavior) return undefined

    if (activeTab === 'incidents') {
      return (
        <Button onClick={() => navigate('/behavior/incidents/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      )
    }
    if (activeTab === 'detentions') {
      return (
        <Button onClick={() => navigate('/behavior/detentions/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Detention
        </Button>
      )
    }
    return undefined
  }

  return (
    <div>
      <PageHeader
        title="Behavior & Discipline"
        description="Track student behavior, incidents, and rewards"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Behavior' }]}
        actions={getHeaderActions()}
        moduleColor="behavior"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 hidden sm:block" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <FileWarning className="h-4 w-4 hidden sm:block" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="detentions" className="flex items-center gap-2">
            <Clock className="h-4 w-4 hidden sm:block" />
            Detentions
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="dashboard" className="mt-0">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="incidents" className="mt-0">
            <IncidentsTab />
          </TabsContent>

          <TabsContent value="detentions" className="mt-0">
            <DetentionsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
