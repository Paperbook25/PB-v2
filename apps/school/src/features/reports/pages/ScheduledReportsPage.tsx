import { useState } from 'react'
import {
  Calendar,
  Clock,
  Mail,
  Pause,
  Play,
  Trash2,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import {
  useScheduledReports,
  useToggleScheduledReport,
  useDeleteScheduledReport,
} from '../hooks/useReports'
import { REPORT_CATEGORIES, type ReportCategory, type ScheduledReport } from '../types/reports.types'

export function ScheduledReportsPage() {
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
    } catch (error) {
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
    } catch (error) {
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
    <div>
      <PageHeader
        title="Scheduled Reports"
        description="Manage automated report generation"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reports', href: '/reports' },
          { label: 'Scheduled' },
        ]}
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        }
      />

      {/* Filter */}
      <div className="flex gap-4 mb-6">
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
