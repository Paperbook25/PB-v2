import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Search,
  Download,
  Eye,
  MoreHorizontal,
  ArrowRight,
  FileText,
  Kanban,
  GraduationCap,
  Clock,
  MessageSquare,
  IndianRupee,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn, formatDate, getInitials } from '@/lib/utils'
import { useApplications, useUpdateStatus, useApplicationStats } from '../hooks/useAdmissions'
import { exportApplications } from '../api/admissions.api'
import { useToast } from '@/hooks/use-toast'
import type { ApplicationStatus } from '../types/admission.types'
import { APPLICATION_STATUSES, CLASSES, getStatusConfig, canTransitionTo } from '../types/admission.types'
import { StatusChangeDialog } from '../components/StatusChangeDialog'
import { AdmissionPipeline } from '../components/AdmissionPipeline'
import { EntranceExamManager } from '../components/EntranceExamManager'
import { WaitlistManager } from '../components/WaitlistManager'
import { CommunicationManager } from '../components/CommunicationManager'
import { AdmissionPaymentManager } from '../components/AdmissionPaymentManager'
import { AdmissionAnalyticsView } from '../components/AdmissionAnalyticsView'

// Tab types
type AdmissionTab = 'applications' | 'pipeline' | 'entrance-exams' | 'waitlist' | 'communications' | 'payments' | 'analytics'

// ============================================
// Applications Tab Component (from ApplicationsListPage)
// ============================================
function ApplicationsTab() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')
  const [classFilter, setClassFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [isExporting, setIsExporting] = useState(false)

  // Status change dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [selectedCurrentStatus, setSelectedCurrentStatus] = useState<ApplicationStatus>('applied')

  const { data, isLoading } = useApplications({
    page,
    limit,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    class: classFilter || undefined,
  })

  const updateStatus = useUpdateStatus()

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as ApplicationStatus | 'all')
    setPage(1)
  }

  const handleClassFilterChange = (value: string) => {
    setClassFilter(value === 'all' ? '' : value)
    setPage(1)
  }

  const handleRowClick = (id: string) => {
    navigate(`/admissions/${id}`)
  }

  const handleOpenStatusDialog = (applicationId: string, currentStatus: ApplicationStatus) => {
    setSelectedApplicationId(applicationId)
    setSelectedCurrentStatus(currentStatus)
    setStatusDialogOpen(true)
  }

  const handleStatusChange = (newStatus: ApplicationStatus, note?: string) => {
    if (selectedApplicationId) {
      updateStatus.mutate(
        { id: selectedApplicationId, data: { status: newStatus, note } },
        {
          onSuccess: () => {
            setStatusDialogOpen(false)
            setSelectedApplicationId(null)
          },
        }
      )
    }
  }

  const applications = data?.data || []
  const meta = data?.meta

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportResponse = await exportApplications({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        class: classFilter || undefined,
      })
      const exportData = exportResponse.data

      if (exportData.length === 0) {
        toast({
          title: 'No Data',
          description: 'No applications to export with current filters.',
          variant: 'destructive',
        })
        return
      }

      const headers = Object.keys(exportData[0])
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `applications-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export Complete',
        description: `Exported ${exportData.length} applications.`,
      })
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Failed to export applications. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {meta?.total || 0} application{(meta?.total || 0) !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button size="sm" onClick={() => navigate('/admissions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          className={cn('cursor-pointer transition-colors', statusFilter === 'all' && 'ring-2 ring-primary')}
          onClick={() => handleStatusFilterChange('all')}
        >
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{meta?.total || 0}</p>
            <p className="text-xs text-muted-foreground">Total Applications</p>
          </CardContent>
        </Card>
        {APPLICATION_STATUSES.slice(0, 4).map((status) => {
          const count = applications.filter((a) => a.status === status.value).length
          return (
            <Card
              key={status.value}
              className={cn('cursor-pointer transition-colors', statusFilter === status.value && 'ring-2 ring-primary')}
              onClick={() => handleStatusFilterChange(status.value)}
            >
              <CardContent className="p-4">
                <p className={cn('text-2xl font-bold', status.color)}>{count}</p>
                <p className="text-xs text-muted-foreground">{status.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or application number..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {APPLICATION_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={classFilter || 'all'} onValueChange={handleClassFilterChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASSES.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No applications found</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/admissions/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Application
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => {
                  const statusConfig = getStatusConfig(app.status)
                  const possibleTransitions = APPLICATION_STATUSES.filter((s) =>
                    canTransitionTo(app.status, s.value)
                  ).slice(0, 3)

                  return (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(app.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={app.photoUrl} />
                            <AvatarFallback>{getInitials(app.studentName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{app.studentName}</p>
                            <p className="text-sm text-muted-foreground">{app.applicationNumber}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{app.applyingForClass}</TableCell>
                      <TableCell>{formatDate(app.appliedDate)}</TableCell>
                      <TableCell>
                        <Badge className={cn(statusConfig.bgColor, statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRowClick(app.id) }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            {possibleTransitions.length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                {possibleTransitions.map((transition) => (
                                  <DropdownMenuItem
                                    key={transition.value}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleOpenStatusDialog(app.id, app.status)
                                    }}
                                    className={transition.value === 'rejected' ? 'text-destructive' : ''}
                                  >
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    {transition.label}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Status Change Dialog */}
      <StatusChangeDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        currentStatus={selectedCurrentStatus}
        onConfirm={handleStatusChange}
        isLoading={updateStatus.isPending}
      />
    </div>
  )
}

// ============================================
// Pipeline Tab Component (from AdmissionsPage)
// ============================================
function PipelineTab() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState<string>('')

  // Status change dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [selectedCurrentStatus, setSelectedCurrentStatus] = useState<ApplicationStatus>('applied')

  const { data: applicationsData, isLoading: isLoadingApps } = useApplications({
    search: search || undefined,
    class: classFilter || undefined,
    limit: 100,
  })

  const { data: statsData, isLoading: isLoadingStats } = useApplicationStats()

  const updateStatus = useUpdateStatus()

  const applications = applicationsData?.data || []
  const stats = statsData?.data

  const handleStatusChange = (applicationId: string) => {
    const app = applications.find((a) => a.id === applicationId)
    if (app) {
      setSelectedApplicationId(applicationId)
      setSelectedCurrentStatus(app.status)
      setStatusDialogOpen(true)
    }
  }

  const handleConfirmStatusChange = (newStatus: ApplicationStatus, note?: string) => {
    if (selectedApplicationId) {
      updateStatus.mutate(
        { id: selectedApplicationId, data: { status: newStatus, note } },
        {
          onSuccess: () => {
            setStatusDialogOpen(false)
            setSelectedApplicationId(null)
          },
        }
      )
    }
  }

  // Filter applications based on search
  const filteredApplications = applications.filter((app) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      app.studentName.toLowerCase().includes(searchLower) ||
      app.applicationNumber.toLowerCase().includes(searchLower) ||
      app.email.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Drag and drop to change application status
        </p>
        <Button size="sm" onClick={() => navigate('/admissions/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Application
        </Button>
      </div>

      {/* Stats */}
      {isLoadingStats ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
              <p className="text-xs text-muted-foreground">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold" style={{ color: 'var(--color-module-admissions)' }}>{stats?.byStatus?.applied || 0}</p>
              <p className="text-xs text-muted-foreground">New Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold" style={{ color: 'var(--color-module-finance)' }}>{stats?.byStatus?.under_review || 0}</p>
              <p className="text-xs text-muted-foreground">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold" style={{ color: 'var(--color-module-attendance)' }}>{stats?.byStatus?.approved || 0}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold" style={{ color: 'var(--color-module-students)' }}>{stats?.byStatus?.enrolled || 0}</p>
              <p className="text-xs text-muted-foreground">Enrolled</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={classFilter || 'all'} onValueChange={(v) => setClassFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASSES.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline */}
      {isLoadingApps ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[300px]">
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="space-y-3 bg-muted/50 rounded-lg p-3 min-h-[400px]">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-24" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdmissionPipeline applications={filteredApplications} onStatusChange={handleStatusChange} />
      )}

      {/* Status Change Dialog */}
      <StatusChangeDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        currentStatus={selectedCurrentStatus}
        onConfirm={handleConfirmStatusChange}
        isLoading={updateStatus.isPending}
      />
    </div>
  )
}

// ============================================
// Entrance Exams Tab Component
// ============================================
function EntranceExamsTab() {
  return <EntranceExamManager />
}

// ============================================
// Waitlist Tab Component
// ============================================
function WaitlistTab() {
  return <WaitlistManager />
}

// ============================================
// Communications Tab Component
// ============================================
function CommunicationsTab() {
  return <CommunicationManager />
}

// ============================================
// Payments Tab Component
// ============================================
function PaymentsTab() {
  return <AdmissionPaymentManager />
}

// ============================================
// Analytics Tab Component
// ============================================
function AnalyticsTab() {
  return <AdmissionAnalyticsView />
}

// ============================================
// Main AdmissionsMainPage Component
// ============================================
export function AdmissionsMainPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Primary tab
  const activeTab = (searchParams.get('tab') as AdmissionTab) || 'applications'

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  return (
    <div>
      <PageHeader
        title="Admissions"
        description="Manage student admissions and applications"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Admissions' }]}
        moduleColor="admissions"
        actions={
          activeTab === 'applications' || activeTab === 'pipeline' ? (
            <Button onClick={() => navigate('/admissions/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          ) : undefined
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText className="h-4 w-4 hidden sm:block" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <Kanban className="h-4 w-4 hidden sm:block" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="entrance-exams" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 hidden sm:block" />
            Exams
          </TabsTrigger>
          <TabsTrigger value="waitlist" className="flex items-center gap-2">
            <Clock className="h-4 w-4 hidden sm:block" />
            Waitlist
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 hidden sm:block" />
            Comms
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 hidden sm:block" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 hidden sm:block" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="applications" className="mt-0">
            <ApplicationsTab />
          </TabsContent>

          <TabsContent value="pipeline" className="mt-0">
            <PipelineTab />
          </TabsContent>

          <TabsContent value="entrance-exams" className="mt-0">
            <EntranceExamsTab />
          </TabsContent>

          <TabsContent value="waitlist" className="mt-0">
            <WaitlistTab />
          </TabsContent>

          <TabsContent value="communications" className="mt-0">
            <CommunicationsTab />
          </TabsContent>

          <TabsContent value="payments" className="mt-0">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <AnalyticsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
