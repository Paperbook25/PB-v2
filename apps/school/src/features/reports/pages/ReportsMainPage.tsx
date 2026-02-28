import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  FileText,
  BarChart3,
  Calendar,
  Download,
  Clock,
  ChevronRight,
  Plus,
  TrendingUp,
  Users,
  IndianRupee,
  GraduationCap,
  Search,
  Filter,
  Star,
  Trash2,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Mail,
  Pause,
  Play,
  ClipboardList,
  History,
  AlertTriangle,
  CreditCard,
  UserCheck,
  UserX,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { KPICard } from '../components/KPICard'
import { GenerateReportDialog } from '../components/GenerateReportDialog'
import {
  SimpleBarChart,
  SimplePieChart,
  SimpleLineChart,
  SimpleAreaChart,
  HorizontalBarChart,
} from '../components/AnalyticsCharts'
import {
  useKPIMetrics,
  useReportTemplates,
  useGeneratedReports,
  useAnalyticsOverview,
  useDeleteGeneratedReport,
  useScheduledReports,
  useToggleScheduledReport,
  useDeleteScheduledReport,
  useAcademicAnalytics,
  useFinancialAnalytics,
  useAttendanceAnalytics,
} from '../hooks/useReports'
import {
  REPORT_CATEGORIES,
  type ReportTemplate,
  type ReportCategory,
  type ReportStatus,
  type GeneratedReport,
  type ScheduledReport,
  type KPIMetric,
} from '../types/reports.types'

// Tab types
type PrimaryTab = 'dashboard' | 'templates' | 'history' | 'scheduled' | 'analytics'
type AnalyticsSubTab = 'academic' | 'financial' | 'attendance'

// ============================================
// Dashboard Tab Component
// ============================================
function DashboardTab() {
  const navigate = useNavigate()
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)

  const { data: kpisData, isLoading: kpisLoading } = useKPIMetrics()
  const { data: templatesData, isLoading: templatesLoading } = useReportTemplates()
  const { data: reportsData, isLoading: reportsLoading } = useGeneratedReports({ limit: 5 })
  const { data: overviewData, isLoading: overviewLoading } = useAnalyticsOverview()

  const kpis = kpisData?.data || []
  const templates = templatesData?.data?.filter((t) => t.isPopular) || []
  const recentReports = reportsData?.data || []
  const overview = overviewData?.data

  const handleGenerateFromTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    setGenerateDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-reports-light)' }}>
                  <Users className="h-5 w-5" style={{ color: 'var(--color-module-reports)' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview?.totalStudents || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-finance-light)' }}>
                  <IndianRupee className="h-5 w-5" style={{ color: 'var(--color-module-finance)' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(overview?.totalRevenue || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Collection</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-attendance-light)' }}>
                  <TrendingUp className="h-5 w-5" style={{ color: 'var(--color-module-attendance)' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview?.attendanceRate || 0}%</p>
                  <p className="text-xs text-muted-foreground">Attendance Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-exams-light)' }}>
                  <GraduationCap className="h-5 w-5" style={{ color: 'var(--color-module-exams)' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview?.passRate || 0}%</p>
                  <p className="text-xs text-muted-foreground">Pass Rate</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Metrics */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Key Performance Indicators</CardTitle>
                <CardDescription>Real-time metrics across all modules</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {kpis.slice(0, 8).map((kpi) => (
                    <KPICard key={kpi.id} metric={kpi} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Reports */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Reports</CardTitle>
              <CardDescription>Generate popular reports instantly</CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.slice(0, 5).map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                      onClick={() => handleGenerateFromTemplate(template)}
                    >
                      <FileText className="h-4 w-4 mr-2 shrink-0" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {template.category}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Recent Reports</CardTitle>
            <CardDescription>Recently generated reports</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No reports generated yet. Start by creating a new report.
            </p>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{report.category}</span>
                        <span>•</span>
                        <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        report.status === 'ready'
                          ? 'default'
                          : report.status === 'generating'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {report.status}
                    </Badge>
                    {report.status === 'ready' && report.fileUrl && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <GenerateReportDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        template={selectedTemplate}
      />
    </div>
  )
}

// ============================================
// Templates Tab Component
// ============================================
function TemplatesTab() {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: templatesData, isLoading } = useReportTemplates(categoryFilter)

  const templates = templatesData?.data || []

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleGenerateFromTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    setGenerateDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as ReportCategory | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {REPORT_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No templates found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </div>
                  {template.isPopular && (
                    <Badge variant="secondary" className="shrink-0">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {template.category}
                  </Badge>
                  <Button size="sm" onClick={() => handleGenerateFromTemplate(template)}>
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GenerateReportDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        template={selectedTemplate}
      />
    </div>
  )
}

// ============================================
// History Tab Component
// ============================================
function HistoryTab() {
  const { toast } = useToast()
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [deleteReport, setDeleteReport] = useState<GeneratedReport | null>(null)

  const { data: reportsData, isLoading, refetch } = useGeneratedReports({
    category: categoryFilter,
    status: statusFilter,
    search: searchQuery,
    page,
    limit: 10,
  })

  const deleteMutation = useDeleteGeneratedReport()

  const reports = reportsData?.data || []
  const pagination = reportsData?.meta

  const handleDelete = async () => {
    if (!deleteReport) return

    try {
      await deleteMutation.mutateAsync(deleteReport.id)
      toast({
        title: 'Report Deleted',
        description: 'The report has been deleted successfully.',
      })
    } catch {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete the report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDeleteReport(null)
    }
  }

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'generating':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'ready':
        return <Badge style={{ backgroundColor: 'var(--color-module-attendance-light)', color: 'var(--color-module-attendance)' }}>Ready</Badge>
      case 'generating':
        return <Badge style={{ backgroundColor: 'var(--color-module-communication-light)', color: 'var(--color-module-communication)' }}>Generating</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'scheduled':
        return <Badge style={{ backgroundColor: 'var(--color-module-finance-light)', color: 'var(--color-module-finance)' }}>Scheduled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v as ReportCategory | 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {REPORT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as ReportStatus | 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generated Reports</CardTitle>
          <CardDescription>
            {pagination?.total || 0} reports found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports found matching your criteria.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <span className="font-medium">{report.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {report.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="uppercase text-xs">
                        {report.format}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {report.fileSize || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {report.status === 'ready' && report.fileUrl && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteReport(report)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * 10 + 1} - {Math.min(page * 10, pagination.total)} of{' '}
                    {pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteReport} onOpenChange={() => setDeleteReport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteReport?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================
// Scheduled Tab Component
// ============================================
function ScheduledTab() {
  const { toast } = useToast()
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all')
  const [deleteReport, setDeleteReport] = useState<ScheduledReport | null>(null)

  const { data: reportsData, isLoading } = useScheduledReports({
    category: categoryFilter,
  })

  const toggleMutation = useToggleScheduledReport()
  const deleteMutation = useDeleteScheduledReport()

  const reports = reportsData?.data || []

  const handleToggle = async (report: ScheduledReport) => {
    try {
      await toggleMutation.mutateAsync(report.id)
      toast({
        title: report.isActive ? 'Schedule Paused' : 'Schedule Activated',
        description: `"${report.reportName}" has been ${report.isActive ? 'paused' : 'activated'}.`,
      })
    } catch {
      toast({
        title: 'Action Failed',
        description: 'Failed to update schedule. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteReport) return

    try {
      await deleteMutation.mutateAsync(deleteReport.id)
      toast({
        title: 'Schedule Deleted',
        description: 'The scheduled report has been deleted.',
      })
    } catch {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete schedule. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDeleteReport(null)
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Daily'
      case 'weekly':
        return 'Weekly'
      case 'monthly':
        return 'Monthly'
      case 'quarterly':
        return 'Quarterly'
      case 'yearly':
        return 'Yearly'
      default:
        return frequency
    }
  }

  const formatNextRun = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    return d.toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as ReportCategory | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {REPORT_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scheduled Reports</CardTitle>
          <CardDescription>
            {reports.length} scheduled report{reports.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled reports found.</p>
              <p className="text-sm mt-1">Create a schedule to automate report generation.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Last Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{report.reportName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{report.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{getFrequencyLabel(report.frequency)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="uppercase text-xs">{report.format}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{report.recipients.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatNextRun(report.nextRunAt)}</span>
                    </TableCell>
                    <TableCell>
                      {report.lastStatus === 'ready' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : report.lastStatus === 'failed' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.isActive ? 'default' : 'secondary'}>
                        {report.isActive ? 'Active' : 'Paused'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(report)}
                          disabled={toggleMutation.isPending}
                        >
                          {report.isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteReport(report)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteReport} onOpenChange={() => setDeleteReport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the schedule for "{deleteReport?.reportName}"? This will
              stop all future automated reports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================
// Analytics Tab Component with Subtabs
// ============================================
function AnalyticsTab({ subTab, onSubTabChange }: { subTab: AnalyticsSubTab; onSubTabChange: (tab: AnalyticsSubTab) => void }) {
  return (
    <div className="space-y-4">
      <Tabs value={subTab} onValueChange={(v) => onSubTabChange(v as AnalyticsSubTab)}>
        <TabsList variant="secondary" className="flex flex-wrap w-full">
          <TabsTrigger variant="secondary" value="academic" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Academic
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="financial" className="gap-2">
            <IndianRupee className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="attendance" className="gap-2">
            <Users className="h-4 w-4" />
            Attendance
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="academic" className="mt-0">
            <AcademicAnalyticsContent />
          </TabsContent>

          <TabsContent value="financial" className="mt-0">
            <FinancialAnalyticsContent />
          </TabsContent>

          <TabsContent value="attendance" className="mt-0">
            <AttendanceAnalyticsContent />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

// ============================================
// Academic Analytics Content
// ============================================
function AcademicAnalyticsContent() {
  const { data: analyticsData, isLoading } = useAcademicAnalytics()

  const analytics = analyticsData?.data

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          No analytics data available.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-attendance-light)' }}>
              <TrendingUp className="h-5 w-5" style={{ color: 'var(--color-module-attendance)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.overallPassRate}%</p>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-reports-light)' }}>
              <GraduationCap className="h-5 w-5" style={{ color: 'var(--color-module-reports)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.averageScore}%</p>
              <p className="text-xs text-muted-foreground">Average Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-integrations-light)' }}>
              <Award className="h-5 w-5" style={{ color: 'var(--color-module-integrations)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.topPerformers.length}</p>
              <p className="text-xs text-muted-foreground">Top Performers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-finance-light)' }}>
              <Users className="h-5 w-5" style={{ color: 'var(--color-module-finance)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.classWisePerformance.length}</p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <SimplePieChart
          title="Grade Distribution"
          data={analytics.gradeDistribution}
          height={300}
        />

        {/* Subject Performance */}
        <SimpleBarChart
          title="Subject-wise Average Score"
          data={analytics.subjectWisePerformance.map((s) => ({
            label: s.subject,
            value: s.average,
          }))}
          height={300}
          formatValue={(v) => `${v}%`}
        />

        {/* Class Performance */}
        <HorizontalBarChart
          title="Class-wise Average Score"
          data={analytics.classWisePerformance.map((c) => ({
            label: c.class,
            value: c.average,
          }))}
          height={350}
          formatValue={(v) => `${v}%`}
        />

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performers</CardTitle>
            <CardDescription>Students with highest scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPerformers.map((student, index) => (
                <div
                  key={student.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.class}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {student.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Pass Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subject-wise Pass Rates</CardTitle>
          <CardDescription>Percentage of students passing each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analytics.subjectWisePerformance.map((subject) => (
              <div
                key={subject.subject}
                className="p-4 rounded-lg border text-center"
              >
                <p className="text-2xl font-bold">{subject.passRate}%</p>
                <p className="text-sm text-muted-foreground truncate">{subject.subject}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Financial Analytics Content
// ============================================
function FinancialAnalyticsContent() {
  const { data: analyticsData, isLoading } = useFinancialAnalytics()

  const analytics = analyticsData?.data

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          No analytics data available.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-finance-light)' }}>
              <IndianRupee className="h-5 w-5" style={{ color: 'var(--color-module-finance)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(analytics.totalCollection)}</p>
              <p className="text-xs text-muted-foreground">Total Collection</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-exams-light)' }}>
              <AlertTriangle className="h-5 w-5" style={{ color: 'var(--color-module-exams)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(analytics.pendingAmount)}</p>
              <p className="text-xs text-muted-foreground">Pending Fees</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-reports-light)' }}>
              <TrendingUp className="h-5 w-5" style={{ color: 'var(--color-module-reports)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.collectionRate}%</p>
              <p className="text-xs text-muted-foreground">Collection Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-behavior-light)' }}>
              <CreditCard className="h-5 w-5" style={{ color: 'var(--color-module-behavior)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.defaulterCount}</p>
              <p className="text-xs text-muted-foreground">Fee Defaulters</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection Trend */}
        <SimpleAreaChart
          title="Monthly Collection Trend"
          data={analytics.monthlyCollection.map((d) => ({ label: d.label || d.date, value: d.value }))}
          height={300}
          color="#22c55e"
          formatValue={(v) => formatCurrency(v)}
        />

        {/* Fee Type Breakdown */}
        <SimplePieChart
          title="Fee Type Breakdown"
          data={analytics.feeTypeBreakdown}
          height={300}
        />

        {/* Payment Mode Distribution */}
        <SimplePieChart
          title="Payment Mode Distribution"
          data={analytics.paymentModeDistribution}
          height={300}
        />

        {/* Class-wise Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Class-wise Collection</CardTitle>
            <CardDescription>Collection vs Pending by class group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.classWiseCollection.map((item) => {
              const total = item.collected + item.pending
              const collectionRate = (item.collected / total) * 100

              return (
                <div key={item.class} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.class}</span>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="text-green-600">{formatCurrency(item.collected)}</span>
                      <span className="text-red-600">{formatCurrency(item.pending)}</span>
                    </div>
                  </div>
                  <Progress value={collectionRate} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {collectionRate.toFixed(1)}% collected
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Concession Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(analytics.concessionAmount)}</p>
            <p className="text-sm text-muted-foreground mt-1">Total concession granted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Collection Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={analytics.collectionRate} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{analytics.collectionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">At-Risk Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{analytics.defaulterCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Students with overdue fees</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// Attendance Analytics Content
// ============================================
function AttendanceAnalyticsContent() {
  const { data: analyticsData, isLoading } = useAttendanceAnalytics()

  const analytics = analyticsData?.data

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          No analytics data available.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-attendance-light)' }}>
              <Users className="h-5 w-5" style={{ color: 'var(--color-module-attendance)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.overallRate}%</p>
              <p className="text-xs text-muted-foreground">Overall Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-lms-light)' }}>
              <UserCheck className="h-5 w-5" style={{ color: 'var(--color-module-lms)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.presentToday}</p>
              <p className="text-xs text-muted-foreground">Present Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-exams-light)' }}>
              <UserX className="h-5 w-5" style={{ color: 'var(--color-module-exams)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.absentToday}</p>
              <p className="text-xs text-muted-foreground">Absent Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-finance-light)' }}>
              <Clock className="h-5 w-5" style={{ color: 'var(--color-module-finance)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.lateArrivals}</p>
              <p className="text-xs text-muted-foreground">Late Arrivals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-behavior-light)' }}>
              <AlertTriangle className="h-5 w-5" style={{ color: 'var(--color-module-behavior)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.chronicallyAbsent}</p>
              <p className="text-xs text-muted-foreground">Chronic Absent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <SimpleLineChart
          title="Monthly Attendance Trend"
          data={analytics.monthlyTrend.filter((m) => m.value > 0).map((d) => ({ label: d.label || d.date, value: d.value }))}
          height={300}
          color="#3b82f6"
          formatValue={(v) => `${v}%`}
        />

        {/* Day-wise Pattern */}
        <SimpleBarChart
          title="Day-wise Attendance Pattern"
          data={analytics.dayWisePattern.map((d) => ({
            label: d.day,
            value: d.rate,
          }))}
          height={300}
          formatValue={(v) => `${v}%`}
        />

        {/* Class-wise Attendance */}
        <HorizontalBarChart
          title="Class-wise Attendance Rate"
          data={analytics.classWiseAttendance.map((c) => ({
            label: c.class,
            value: c.rate,
          }))}
          height={400}
          formatValue={(v) => `${v}%`}
        />

        {/* Today's Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Attendance</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Attendance</span>
                <span className="font-medium">{analytics.overallRate}%</span>
              </div>
              <Progress value={analytics.overallRate} className="h-3" />
            </div>

            {/* Present vs Absent */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">Present</span>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
                  {analytics.presentToday}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-red-700 dark:text-red-300">Absent</span>
                </div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-2">
                  {analytics.absentToday}
                </p>
              </div>
            </div>

            {/* Alerts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Late Arrivals</span>
                </div>
                <span className="font-medium">{analytics.lateArrivals}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Chronically Absent Students</span>
                </div>
                <span className="font-medium">{analytics.chronicallyAbsent}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Class-wise Attendance Details</CardTitle>
          <CardDescription>Attendance rate for each class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {analytics.classWiseAttendance.map((item) => (
              <div
                key={item.class}
                className="p-4 rounded-lg border text-center"
              >
                <p
                  className={`text-2xl font-bold ${
                    item.rate >= 90
                      ? 'text-green-600'
                      : item.rate >= 80
                        ? 'text-blue-600'
                        : item.rate >= 70
                          ? 'text-yellow-600'
                          : 'text-red-600'
                  }`}
                >
                  {item.rate}%
                </p>
                <p className="text-sm text-muted-foreground">{item.class}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Main ReportsMainPage Component
// ============================================
export function ReportsMainPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Primary tab
  const activeTab = (searchParams.get('tab') as PrimaryTab) || 'dashboard'

  // Analytics sub-tab
  const analyticsSubTab = (searchParams.get('subtab') as AnalyticsSubTab) || 'academic'

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  const handleSubTabChange = (tab: PrimaryTab, subtab: string) => {
    setSearchParams({ tab, subtab })
  }

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Generate reports, view analytics, and track key metrics"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Reports' }]}
        moduleColor="reports"
        actions={
          activeTab === 'dashboard' ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleTabChange('scheduled')}>
                <Calendar className="h-4 w-4 mr-2" />
                Scheduled Reports
              </Button>
              <Button size="sm" onClick={() => navigate('/reports/new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </div>
          ) : activeTab === 'templates' || activeTab === 'history' ? (
            <Button size="sm" onClick={() => navigate('/reports/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          ) : undefined
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 hidden sm:block" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4 hidden sm:block" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4 hidden sm:block" />
            History
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 hidden sm:block" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 hidden sm:block" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="dashboard" className="mt-0">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <TemplatesTab />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <HistoryTab />
          </TabsContent>

          <TabsContent value="scheduled" className="mt-0">
            <ScheduledTab />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <AnalyticsTab
              subTab={analyticsSubTab}
              onSubTabChange={(tab) => handleSubTabChange('analytics', tab)}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
