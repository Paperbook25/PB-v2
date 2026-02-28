import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Users,
  ClipboardCheck,
  CalendarDays,
  IndianRupee,
  Clock,
  RefreshCw,
  ClipboardList,
  BarChart3,
  CheckCircle,
  XCircle,
  Filter,
  Calculator,
  FileText,
  History,
  Play,
  Calendar,
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { cn, formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { deleteStaff, exportStaff } from '@/features/staff/api/staff.api'
import {
  useStaffList,
  useDailyAttendance,
  useSaveAttendance,
  useAllLeaveRequests,
  useUpdateLeaveRequest,
  useProcessMonthlySalary,
  useMarkSalaryPaid,
  useClassTimetable,
} from '@/features/staff/hooks/useStaff'
import { AttendanceMarkingGrid } from '@/features/staff/components/AttendanceMarkingGrid'
import { LeaveApprovalDialog } from '@/features/staff/components/LeaveApprovalDialog'
import { MonthlySalaryRun } from '@/features/staff/components/MonthlySalaryRun'
import { SalarySlipView } from '@/features/staff/components/SalarySlipView'
import { TimetableView } from '@/features/staff/components/TimetableView'
import { SubstitutionManager } from '@/features/staff/components/SubstitutionManager'
import {
  LEAVE_TYPE_LABELS,
  DAYS_OF_WEEK,
  PERIODS,
  type BulkAttendanceRecord,
  type LeaveRequest,
  type LeaveStatus,
  type SalarySlip,
  type DayOfWeek,
  type TimetableEntry,
  type StaffStatus,
} from '@/features/staff/types/staff.types'
import type { StaffTabProps, StaffSubTab } from '../types/people.types'

// Sub-tab types
type AttendanceSubTab = 'mark' | 'reports'
type LeaveSubTab = 'pending' | 'all'
type PayrollSubTab = 'process' | 'structure' | 'history'
type TimetableSubTab = 'class' | 'teacher'

// Constants
const DEPARTMENTS = ['All Departments', 'Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer Science', 'Physical Education', 'Art', 'Music', 'Administration']
const STATUSES = ['All Status', 'active', 'on_leave', 'resigned']
const CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const SECTIONS = ['A', 'B', 'C']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const STATUS_CONFIG: Record<LeaveStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: <XCircle className="h-3 w-3" /> },
}

// ============================================
// Staff List Tab Component
// ============================================
function StaffListTab() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All Departments')
  const [statusFilter, setStatusFilter] = useState<StaffStatus | 'All Status'>('All Status')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const limit = 10

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      toast({
        title: 'Staff Deleted',
        description: 'The staff member has been removed successfully.',
      })
      setDeleteId(null)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete staff member. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const { data, isLoading } = useStaffList({
    search: search || undefined,
    department: departmentFilter !== 'All Departments' ? departmentFilter : undefined,
    status: statusFilter !== 'All Status' ? statusFilter : undefined,
    page,
    limit,
  })

  const staffList = data?.data || []
  const meta = data?.meta || { total: 0, totalPages: 1 }

  const staffToDelete = staffList.find((s: any) => s.id === deleteId)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const result = await exportStaff({
        department: departmentFilter !== 'All Departments' ? departmentFilter : undefined,
        status: statusFilter !== 'All Status' ? statusFilter : undefined,
      })
      const exportData = result.data

      if (exportData.length === 0) {
        toast({
          title: 'No Data',
          description: 'No staff members to export with current filters.',
          variant: 'destructive',
        })
        return
      }

      const headers = Object.keys(exportData[0])
      const csvContent = [
        headers.join(','),
        ...exportData.map((row: Record<string, string | number>) => headers.map(h => `"${row[h] ?? ''}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `staff-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export Complete',
        description: `Exported ${exportData.length} staff members.`,
      })
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Failed to export staff data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'on_leave':
        return <Badge variant="warning">On Leave</Badge>
      case 'resigned':
        return <Badge variant="secondary">Resigned</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {meta.total} staff member{meta.total !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button size="sm" onClick={() => navigate('/staff/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, employee ID, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={departmentFilter}
                onValueChange={(v) => {
                  setDepartmentFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as StaffStatus | 'All Status')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === 'All Status' ? s : s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : staffList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No staff members found
                    </TableCell>
                  </TableRow>
                ) : (
                  staffList.map((staff: any) => (
                    <TableRow
                      key={staff.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/staff/${staff.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={staff.photoUrl} />
                            <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-sm text-muted-foreground">{staff.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{staff.employeeId}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>{staff.designation}</TableCell>
                      <TableCell>{getStatusBadge(staff.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/staff/${staff.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/staff/${staff.id}/edit`)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteId(staff.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total} staff
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === meta.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {staffToDelete?.name}? This action cannot be undone
              and will remove all associated records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================
// Attendance Tab Component
// ============================================
function AttendanceTabContent({ subTab, onSubTabChange }: { subTab: AttendanceSubTab; onSubTabChange: (tab: AttendanceSubTab) => void }) {
  const { toast } = useToast()
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)

  const { data: staffData, isLoading: staffLoading } = useStaffList({ limit: 100 })
  const { data: attendanceData, isLoading: attendanceLoading } = useDailyAttendance(selectedDate)
  const saveAttendance = useSaveAttendance()

  const handleSaveAttendance = (records: BulkAttendanceRecord[]) => {
    saveAttendance.mutate(
      { date: selectedDate, records },
      {
        onSuccess: (result) => {
          toast({
            title: 'Attendance Saved',
            description: `Attendance recorded for ${result.count} staff members.`,
          })
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to save attendance',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const isLoading = staffLoading || attendanceLoading
  const todayAttendance = attendanceData?.data || []
  const presentCount = todayAttendance.filter((r) => r.status === 'present').length
  const absentCount = todayAttendance.filter((r) => r.status === 'absent').length
  const onLeaveCount = todayAttendance.filter((r) => r.status === 'on_leave').length
  const halfDayCount = todayAttendance.filter((r) => r.status === 'half_day').length

  return (
    <div className="space-y-4">
      {/* Nested tabs for Mark/Reports */}
      <Tabs value={subTab} onValueChange={(v) => onSubTabChange(v as AttendanceSubTab)}>
        <TabsList variant="secondary" className="flex flex-wrap w-full">
          <TabsTrigger variant="secondary" value="mark" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="reports" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="mt-4 space-y-4">
          {/* Date Selector and Stats */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={today}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Present</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{presentCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{absentCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600">Half Day</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{halfDayCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">On Leave</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{onLeaveCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>
                {selectedDate === today
                  ? "Today's attendance"
                  : `Attendance for ${new Date(selectedDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
                <AttendanceMarkingGrid
                  date={selectedDate}
                  staffList={staffData?.data || []}
                  existingRecords={attendanceData?.data || []}
                  onSave={handleSaveAttendance}
                  isSaving={saveAttendance.isPending}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Reports</CardTitle>
              <CardDescription>Monthly attendance summary and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Attendance reports with department-wise breakdown and trends.</p>
                <p className="text-sm mt-2">Select a date range to generate reports.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// Leave Tab Component
// ============================================
function LeaveTabContent({ subTab, onSubTabChange }: { subTab: LeaveSubTab; onSubTabChange: (tab: LeaveSubTab) => void }) {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)

  const { data: leaveRequestsData, isLoading } = useAllLeaveRequests(
    statusFilter !== 'all' ? { status: statusFilter } : {}
  )
  const updateLeaveRequest = useUpdateLeaveRequest()

  const leaveRequests = leaveRequestsData?.data || []
  const pendingRequests = leaveRequests.filter((r) => r.status === 'pending')

  const handleApprove = () => {
    if (!selectedRequest) return

    updateLeaveRequest.mutate(
      { requestId: selectedRequest.id, data: { status: 'approved' } },
      {
        onSuccess: () => {
          toast({
            title: 'Leave Approved',
            description: `Leave request for ${selectedRequest.staffName} has been approved.`,
          })
          setApprovalDialogOpen(false)
          setSelectedRequest(null)
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to approve leave',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleReject = (reason: string) => {
    if (!selectedRequest) return

    updateLeaveRequest.mutate(
      { requestId: selectedRequest.id, data: { status: 'rejected', rejectionReason: reason } },
      {
        onSuccess: () => {
          toast({
            title: 'Leave Rejected',
            description: `Leave request for ${selectedRequest.staffName} has been rejected.`,
          })
          setApprovalDialogOpen(false)
          setSelectedRequest(null)
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to reject leave',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const openApprovalDialog = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setApprovalDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Nested tabs for Pending/All */}
      <Tabs value={subTab} onValueChange={(v) => onSubTabChange(v as LeaveSubTab)}>
        <TabsList variant="secondary" className="flex flex-wrap w-full">
          <TabsTrigger variant="secondary" value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending Approvals
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="all" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            All Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Requests</CardTitle>
              <CardDescription>
                {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} awaiting your action
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending leave requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.staffName}`} />
                          <AvatarFallback>{getInitials(request.staffName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.staffName}</p>
                          <p className="text-sm text-muted-foreground">
                            {LEAVE_TYPE_LABELS[request.type]} - {request.numberOfDays} day{request.numberOfDays !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => openApprovalDialog(request)}>
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Leave Requests</CardTitle>
                  <CardDescription>Complete history of leave requests</CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leave requests found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((request) => {
                      const status = STATUS_CONFIG[request.status]
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.staffName}`} />
                                <AvatarFallback>{getInitials(request.staffName)}</AvatarFallback>
                              </Avatar>
                              {request.staffName}
                            </div>
                          </TableCell>
                          <TableCell>{LEAVE_TYPE_LABELS[request.type]}</TableCell>
                          <TableCell>
                            <p className="text-sm">{formatDate(request.startDate)}</p>
                            <p className="text-xs text-muted-foreground">to {formatDate(request.endDate)}</p>
                          </TableCell>
                          <TableCell>{request.numberOfDays}</TableCell>
                          <TableCell>
                            <Badge className={cn(status.color, 'gap-1')}>
                              {status.icon}
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(request.appliedOn)}</TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <Button size="sm" variant="outline" onClick={() => openApprovalDialog(request)}>
                                Review
                              </Button>
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
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <LeaveApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={updateLeaveRequest.isPending}
      />
    </div>
  )
}

// ============================================
// Payroll Tab Component
// ============================================
function PayrollTabContent({ subTab, onSubTabChange }: { subTab: PayrollSubTab; onSubTabChange: (tab: PayrollSubTab) => void }) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null)
  const [slipDialogOpen, setSlipDialogOpen] = useState(false)

  const { data: staffData, isLoading: staffLoading } = useStaffList({ limit: 100 })
  const processSalary = useProcessMonthlySalary()
  const markPaid = useMarkSalaryPaid()

  const staffList = staffData?.data || []
  const filteredStaff = staffList
    .filter((s) => s.status === 'active')
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  const handleProcessSalary = async (month: number, year: number) => {
    try {
      const result = await processSalary.mutateAsync({ month, year })
      toast({
        title: 'Salary Processed',
        description: `Generated ${result.data.length} salary slips for ${MONTHS[month - 1]} ${year}`,
      })
      return result.data
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to process salary',
        variant: 'destructive',
      })
      return []
    }
  }

  const handleMarkPaid = async () => {
    if (!selectedSlip) return

    try {
      await markPaid.mutateAsync(selectedSlip.id)
      toast({
        title: 'Salary Paid',
        description: `Salary marked as paid for ${selectedSlip.staffName}`,
      })
      setSlipDialogOpen(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to mark as paid',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Nested tabs for Process/Structure/History */}
      <Tabs value={subTab} onValueChange={(v) => onSubTabChange(v as PayrollSubTab)}>
        <TabsList variant="secondary" className="flex flex-wrap w-full">
          <TabsTrigger variant="secondary" value="process" className="gap-2">
            <Play className="h-4 w-4" />
            Monthly Processing
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="structure" className="gap-2">
            <Calculator className="h-4 w-4" />
            Salary Structure
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="history" className="gap-2">
            <History className="h-4 w-4" />
            Payment History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="process" className="mt-4 space-y-4">
          <MonthlySalaryRun
            onProcess={handleProcessSalary}
            isProcessing={processSalary.isPending}
          />
        </TabsContent>

        <TabsContent value="structure" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Salary Structure</CardTitle>
              <CardDescription>View and manage salary components for each staff member</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs mb-4"
              />

              {staffLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead className="text-right">Monthly Salary</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={staff.photoUrl} />
                              <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{staff.name}</p>
                              <p className="text-xs text-muted-foreground">{staff.employeeId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{staff.department}</TableCell>
                        <TableCell>{staff.designation}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(staff.salary)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = `/staff/${staff.id}?tab=salary`}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View all salary payments made</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a staff member to view their payment history</p>
                <p className="text-sm mt-2">
                  Individual payment history can be viewed from the staff detail page
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Salary Slip Dialog */}
      <Dialog open={slipDialogOpen} onOpenChange={setSlipDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Salary Slip</DialogTitle>
          </DialogHeader>
          {selectedSlip && (
            <SalarySlipView
              slip={selectedSlip}
              onMarkPaid={handleMarkPaid}
              isMarkingPaid={markPaid.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// Timetable Tab Component
// ============================================
function ClassTimetableGrid({ cls, section }: { cls: string; section: string }) {
  const { data: timetable, isLoading } = useClassTimetable(cls, section)

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  const entries = timetable?.data?.entries ?? []

  const getEntry = (day: DayOfWeek, period: number): TimetableEntry | undefined => {
    return entries.find((e: TimetableEntry) => e.day === day && e.periodNumber === period)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border p-2 bg-muted text-left font-medium w-24">Period</th>
            {DAYS_OF_WEEK.map((day) => (
              <th key={day} className="border p-2 bg-muted text-center font-medium">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period) => (
            <tr key={period.number}>
              <td className="border p-2 bg-muted/50">
                <div className="text-xs font-medium">Period {period.number}</div>
                <div className="text-xs text-muted-foreground">
                  {period.startTime} - {period.endTime}
                </div>
              </td>
              {DAYS_OF_WEEK.map((day) => {
                const entry = getEntry(day, period.number)
                return (
                  <td key={day} className="border p-2 min-w-[120px]">
                    {entry ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium">{entry.subject}</p>
                        <p className="text-xs text-muted-foreground">{entry.staffName}</p>
                        {entry.room && (
                          <Badge variant="outline" className="text-[10px] h-4">
                            {entry.room}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TimetableTabContent({ subTab, onSubTabChange }: { subTab: TimetableSubTab; onSubTabChange: (tab: TimetableSubTab) => void }) {
  const [selectedClass, setSelectedClass] = useState('Class 10')
  const [selectedSection, setSelectedSection] = useState('A')
  const [selectedStaffId, setSelectedStaffId] = useState('')

  const { data: staffData } = useStaffList({ status: 'active' })
  const staffList = staffData?.data ?? []
  const teachingStaff = staffList.filter((s) =>
    ['Teacher', 'Senior Teacher', 'Assistant Teacher'].includes(s.designation)
  )

  return (
    <div className="space-y-4">
      {/* Nested tabs for Class/Teacher */}
      <Tabs value={subTab} onValueChange={(v) => onSubTabChange(v as TimetableSubTab)}>
        <TabsList variant="secondary" className="flex flex-wrap w-full">
          <TabsTrigger variant="secondary" value="class">
            <Calendar className="h-4 w-4 mr-2" />
            Class Timetable
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="teacher">
            <Users className="h-4 w-4 mr-2" />
            Teacher Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="class" className="mt-4 space-y-4">
          <div className="flex gap-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((sec) => (
                  <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedClass} - Section {selectedSection}
              </CardTitle>
              <CardDescription>Weekly class schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <ClassTimetableGrid cls={selectedClass} section={selectedSection} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teacher" className="mt-4 space-y-4">
          <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachingStaff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} - {s.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStaffId ? (
            <TimetableView staffId={selectedStaffId} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Users className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">Select a teacher to view their schedule</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// Substitutions Tab Component
// ============================================
function SubstitutionsTabContent() {
  return <SubstitutionManager />
}

// ============================================
// Main StaffTab Component
// ============================================
export function StaffTab({ subTab, nestedTab, onSubTabChange, onNestedTabChange }: StaffTabProps) {
  // Map nested tab values
  const attendanceSubTab = (nestedTab as AttendanceSubTab) || 'mark'
  const leaveSubTab = (nestedTab as LeaveSubTab) || 'pending'
  const payrollSubTab = (nestedTab as PayrollSubTab) || 'process'
  const timetableSubTab = (nestedTab as TimetableSubTab) || 'class'

  return (
    <div className="space-y-4">
      <Tabs value={subTab} onValueChange={(v) => onSubTabChange(v as StaffSubTab)}>
        <TabsList variant="secondary" className="flex flex-wrap w-full">
          <TabsTrigger variant="secondary" value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4 hidden sm:block" />
            All Staff
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="attendance" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 hidden sm:block" />
            Attendance
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="leave" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 hidden sm:block" />
            Leave
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="payroll" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 hidden sm:block" />
            Payroll
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="timetable" className="flex items-center gap-2">
            <Clock className="h-4 w-4 hidden sm:block" />
            Timetable
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="substitutions" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 hidden sm:block" />
            Substitutions
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="list" className="mt-0">
            <StaffListTab />
          </TabsContent>

          <TabsContent value="attendance" className="mt-0">
            <AttendanceTabContent
              subTab={attendanceSubTab}
              onSubTabChange={(tab) => onNestedTabChange(tab)}
            />
          </TabsContent>

          <TabsContent value="leave" className="mt-0">
            <LeaveTabContent
              subTab={leaveSubTab}
              onSubTabChange={(tab) => onNestedTabChange(tab)}
            />
          </TabsContent>

          <TabsContent value="payroll" className="mt-0">
            <PayrollTabContent
              subTab={payrollSubTab}
              onSubTabChange={(tab) => onNestedTabChange(tab)}
            />
          </TabsContent>

          <TabsContent value="timetable" className="mt-0">
            <TimetableTabContent
              subTab={timetableSubTab}
              onSubTabChange={(tab) => onNestedTabChange(tab)}
            />
          </TabsContent>

          <TabsContent value="substitutions" className="mt-0">
            <SubstitutionsTabContent />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
