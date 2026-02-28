import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Download, Eye, MoreHorizontal, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useApplications, useUpdateStatus } from '../hooks/useAdmissions'
import { exportApplications } from '../api/admissions.api'
import { useToast } from '@/hooks/use-toast'
import type { ApplicationStatus } from '../types/admission.types'
import { APPLICATION_STATUSES, CLASSES, getStatusConfig, canTransitionTo } from '../types/admission.types'
import { StatusChangeDialog } from '../components/StatusChangeDialog'

export function ApplicationsListPage() {
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
    } catch (error) {
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
    <div>
      <PageHeader
        title="Applications"
        description="Manage all admission applications"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Admissions' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            <Button size="sm" onClick={() => navigate('/admissions/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
        <div className="flex items-center justify-between mt-4">
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
