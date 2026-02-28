import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Check,
  X,
  Clock,
  Calendar,
  Users,
  FileText,
  Loader2,
  AlertCircle,
  ClipboardCheck,
  BarChart3,
  CalendarDays,
  AlertTriangle,
  Bell,
  Fingerprint,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { usePermission } from '@/components/auth'
import { cn } from '@/lib/utils'
import { statusColors } from '@/lib/design-tokens'
import {
  useStudentsForAttendance,
  useMarkAttendance,
  useLeaveRequests,
  useUpdateLeaveRequest,
  useMyAttendance,
  useAttendanceReport,
} from '../hooks/useAttendance'
import {
  CLASSES,
  SECTIONS,
  ATTENDANCE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
} from '../types/attendance.types'
import type { AttendanceStatus } from '../types/attendance.types'

// Import components for each tab
import { PeriodAttendanceManager } from '../components/PeriodAttendanceManager'
import { ShortageAlertManager } from '../components/ShortageAlertManager'
import { LateDetectionManager } from '../components/LateDetectionManager'
import { NotificationManager } from '../components/NotificationManager'
import { BiometricDeviceManager } from '../components/BiometricDeviceManager'

// Tab types
type PrimaryTab = 'mark' | 'period' | 'reports' | 'leave' | 'alerts' | 'late' | 'notifications' | 'biometric'

// ============================================
// Mark Attendance Tab Component
// ============================================
function MarkAttendanceTab() {
  const { toast } = useToast()
  const [selectedClass, setSelectedClass] = useState('Class 10')
  const [selectedSection, setSelectedSection] = useState('A')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Queries
  const { data: studentsData, isLoading: studentsLoading } = useStudentsForAttendance(
    selectedClass,
    selectedSection,
    selectedDate
  )

  // Mutations
  const markAttendance = useMarkAttendance()

  const students = studentsData?.data || []

  // Initialize attendance data when students load
  useEffect(() => {
    if (students.length > 0) {
      const initial = students.reduce((acc, s) => ({
        ...acc,
        [s.id]: s.status || 'present',
      }), {})
      setAttendanceData(initial)
      setHasChanges(false)
    }
  }, [students])

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: status }))
    setHasChanges(true)
  }

  const handleMarkAll = (status: AttendanceStatus) => {
    const newData = students.reduce((acc, s) => ({ ...acc, [s.id]: status }), {})
    setAttendanceData(newData)
    setHasChanges(true)
  }

  const handleSaveAttendance = async () => {
    const records = Object.entries(attendanceData).map(([studentId, status]) => ({
      studentId,
      status,
    }))

    try {
      await markAttendance.mutateAsync({
        date: selectedDate,
        className: selectedClass,
        section: selectedSection,
        records,
      })
      toast({
        title: 'Attendance Saved',
        description: `Attendance marked for ${records.length} students.`,
      })
      setHasChanges(false)
    } catch {
      toast({
        title: 'Save Failed',
        description: 'Failed to save attendance. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Calculate stats
  const stats = {
    total: students.length,
    present: Object.values(attendanceData).filter((s) => s === 'present').length,
    absent: Object.values(attendanceData).filter((s) => s === 'absent').length,
    late: Object.values(attendanceData).filter((s) => s === 'late').length,
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => handleMarkAll('present')}>
                Mark All Present
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleMarkAll('absent')}>
                Mark All Absent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-communication-light)' }}>
              <Users className="h-5 w-5" style={{ color: 'var(--color-module-communication)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-attendance-light)' }}>
              <Check className="h-5 w-5" style={{ color: 'var(--color-module-attendance)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.present}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-exams-light)' }}>
              <X className="h-5 w-5" style={{ color: 'var(--color-module-exams)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-finance-light)' }}>
              <Clock className="h-5 w-5" style={{ color: 'var(--color-module-finance)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.late}</p>
              <p className="text-xs text-muted-foreground">Late</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selectedClass} - Section {selectedSection}
          </CardTitle>
          <CardDescription>Click on status to cycle through: Present → Absent → Late</CardDescription>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found for this class/section
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {students.map((student) => {
                const status = attendanceData[student.id] || student.status || 'present'
                return (
                  <div
                    key={student.id}
                    className={cn(
                      'p-3 rounded-lg border bg-card transition-all cursor-pointer hover:shadow-md',
                      'border-l-4',
                      status === 'present' && 'border-l-green-500',
                      status === 'absent' && 'border-l-red-500',
                      status === 'late' && 'border-l-orange-500',
                      status === 'half_day' && 'border-l-yellow-500',
                      status === 'excused' && 'border-l-blue-500'
                    )}
                    onClick={() => {
                      const statuses: AttendanceStatus[] = ['present', 'absent', 'late', 'half_day', 'excused']
                      const currentIndex = statuses.indexOf(status)
                      const nextStatus = statuses[(currentIndex + 1) % statuses.length]
                      handleAttendanceChange(student.id, nextStatus)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={student.photoUrl} />
                        <AvatarFallback className="text-xs font-medium">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Roll {student.rollNumber}</p>
                      </div>
                      <Badge
                        variant={
                          status === 'present' ? 'success' :
                          status === 'absent' ? 'destructive' :
                          status === 'late' ? 'warning' :
                          'secondary'
                        }
                        className="shrink-0 text-xs"
                      >
                        {ATTENDANCE_STATUS_LABELS[status]}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            {hasChanges && (
              <p className="text-sm text-muted-foreground">You have unsaved changes</p>
            )}
            <div className="ml-auto">
              <Button onClick={handleSaveAttendance} disabled={markAttendance.isPending || !hasChanges}>
                {markAttendance.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Attendance'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Reports Tab Component
// ============================================
function ReportsTab() {
  const [selectedClass, setSelectedClass] = useState('Class 10')
  const [selectedSection, setSelectedSection] = useState('A')

  const { data: reportData, isLoading: reportLoading } = useAttendanceReport(
    selectedClass,
    selectedSection,
    '2024-04-01',
    new Date().toISOString().split('T')[0]
  )

  const report = reportData?.data || []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">Attendance Report</CardTitle>
              <CardDescription>Class-wise attendance summary</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reportLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : report.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No report data available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                  <TableHead className="text-center">Absent</TableHead>
                  <TableHead className="text-center">Late</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.slice(0, 20).map((r) => (
                  <TableRow key={r.studentId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{r.studentName}</p>
                        <p className="text-xs text-muted-foreground">{r.admissionNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center" style={{ color: 'var(--color-module-attendance)' }}>{r.presentDays}</TableCell>
                    <TableCell className="text-center" style={{ color: 'var(--color-module-exams)' }}>{r.absentDays}</TableCell>
                    <TableCell className="text-center" style={{ color: 'var(--color-module-finance)' }}>{r.lateDays}</TableCell>
                    <TableCell className="text-center">{r.totalDays}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={r.attendancePercentage >= 75 ? 'success' : 'destructive'}>
                        {r.attendancePercentage}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Leave Management Tab Component
// ============================================
function LeaveManagementTab() {
  const { toast } = useToast()
  const { data: leaveData, isLoading: leavesLoading } = useLeaveRequests()
  const updateLeave = useUpdateLeaveRequest()

  const leaves = leaveData?.data || []

  const handleLeaveAction = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      await updateLeave.mutateAsync({
        id: leaveId,
        data: { status },
      })
      toast({
        title: status === 'approved' ? 'Leave Approved' : 'Leave Rejected',
        description: 'Leave request has been updated.',
      })
    } catch {
      toast({
        title: 'Update Failed',
        description: 'Failed to update leave request.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave Requests</CardTitle>
          <CardDescription>Approve or reject student leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          {leavesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : leaves.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No leave requests</p>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{leave.studentName}</p>
                        <Badge variant="outline">{leave.className} - {leave.section}</Badge>
                        <Badge
                          variant={
                            leave.status === 'approved' ? 'success' :
                            leave.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {leave.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {LEAVE_TYPE_LABELS[leave.leaveType]} - {leave.startDate} to {leave.endDate}
                      </p>
                      <p className="text-sm">{leave.reason}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Applied by {leave.appliedBy}
                      </p>
                    </div>
                    {leave.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          style={{ color: statusColors.success }}
                          onClick={() => handleLeaveAction(leave.id, 'approved')}
                          disabled={updateLeave.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          style={{ color: statusColors.error }}
                          onClick={() => handleLeaveAction(leave.id, 'rejected')}
                          disabled={updateLeave.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                  {leave.rejectionReason && (
                    <p className="text-sm mt-2" style={{ color: statusColors.error }}>
                      Rejection reason: {leave.rejectionReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Period-wise Attendance Tab Component
// ============================================
function PeriodAttendanceTab() {
  return <PeriodAttendanceManager />
}

// ============================================
// Shortage Alerts Tab Component
// ============================================
function ShortageAlertsTab() {
  return <ShortageAlertManager />
}

// ============================================
// Late Detection Tab Component
// ============================================
function LateDetectionTab() {
  return <LateDetectionManager />
}

// ============================================
// Notifications Tab Component
// ============================================
function NotificationsTab() {
  return <NotificationManager />
}

// ============================================
// Biometric Devices Tab Component
// ============================================
function BiometricTab() {
  return <BiometricDeviceManager />
}

// ============================================
// Main AttendancePage Component
// ============================================
export function AttendancePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isStudent, isParent, canMarkAttendance } = usePermission()
  const { data: myAttendanceData, isLoading: myAttendanceLoading } = useMyAttendance()

  const myAttendance = myAttendanceData?.data

  // Primary tab from URL
  const activeTab = (searchParams.get('tab') as PrimaryTab) || (canMarkAttendance ? 'mark' : 'mark')

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  // Student/Parent View
  if (isStudent || isParent) {
    return (
      <div>
        <PageHeader
          title="My Attendance"
          description="View your attendance records"
          breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Attendance' }]}
          moduleColor="attendance"
        />

        {myAttendanceLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : myAttendance ? (
          <div className="space-y-6 mt-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold">{myAttendance.summary.attendancePercentage}%</p>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold" style={{ color: 'var(--color-module-attendance)' }}>{myAttendance.summary.presentDays}</p>
                  <p className="text-sm text-muted-foreground">Present</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold" style={{ color: 'var(--color-module-exams)' }}>{myAttendance.summary.absentDays}</p>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold" style={{ color: 'var(--color-module-finance)' }}>{myAttendance.summary.lateDays}</p>
                  <p className="text-sm text-muted-foreground">Late</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold">{myAttendance.summary.totalDays}</p>
                  <p className="text-sm text-muted-foreground">Total Days</p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myAttendance.monthlyData.map((month) => (
                    <div key={month.month} className="flex items-center gap-4">
                      <span className="w-12 text-sm font-medium">{month.month}</span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden flex">
                        <div
                          className="h-full"
                          style={{ width: `${(month.present / (month.present + month.absent + month.late)) * 100}%`, backgroundColor: 'var(--color-module-attendance)' }}
                        />
                        <div
                          className="h-full"
                          style={{ width: `${(month.late / (month.present + month.absent + month.late)) * 100}%`, backgroundColor: 'var(--color-module-finance)' }}
                        />
                        <div
                          className="h-full"
                          style={{ width: `${(month.absent / (month.present + month.absent + month.late)) * 100}%`, backgroundColor: 'var(--color-module-exams)' }}
                        />
                      </div>
                      <span className="w-12 text-sm text-right">{month.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Records */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myAttendance.recentRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.status === 'present' ? 'success' :
                              record.status === 'absent' ? 'destructive' : 'warning'
                            }
                          >
                            {ATTENDANCE_STATUS_LABELS[record.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.checkInTime || '-'}</TableCell>
                        <TableCell>{record.checkOutTime || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="mt-6">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No attendance data available</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Staff View with tabs
  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Mark and manage daily attendance"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Attendance' }]}
        moduleColor="attendance"
        actions={
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="mark" className="flex items-center gap-1">
            <ClipboardCheck className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Mark</span>
            <span className="md:hidden">Mark</span>
          </TabsTrigger>
          <TabsTrigger value="period" className="flex items-center gap-1">
            <Calendar className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Period</span>
            <span className="md:hidden">Period</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Reports</span>
            <span className="md:hidden">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Leave</span>
            <span className="md:hidden">Leave</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Alerts</span>
            <span className="md:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="late" className="flex items-center gap-1">
            <Clock className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Late</span>
            <span className="md:hidden">Late</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Notify</span>
            <span className="md:hidden">Notify</span>
          </TabsTrigger>
          <TabsTrigger value="biometric" className="flex items-center gap-1">
            <Fingerprint className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Biometric</span>
            <span className="md:hidden">Bio</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="mark" className="mt-0">
            <MarkAttendanceTab />
          </TabsContent>

          <TabsContent value="period" className="mt-0">
            <PeriodAttendanceTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="leave" className="mt-0">
            <LeaveManagementTab />
          </TabsContent>

          <TabsContent value="alerts" className="mt-0">
            <ShortageAlertsTab />
          </TabsContent>

          <TabsContent value="late" className="mt-0">
            <LateDetectionTab />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="biometric" className="mt-0">
            <BiometricTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
