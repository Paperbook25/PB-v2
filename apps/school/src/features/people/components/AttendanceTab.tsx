import { useState, useEffect } from 'react'
import {
  Check,
  X,
  Clock,
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
  Calendar,
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  useStudentsForAttendance,
  useMarkAttendance,
  useLeaveRequests,
  useUpdateLeaveRequest,
  useAttendanceReport,
} from '@/features/attendance/hooks/useAttendance'
import {
  CLASSES,
  SECTIONS,
  ATTENDANCE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
} from '@/features/attendance/types/attendance.types'
import type { AttendanceStatus } from '@/features/attendance/types/attendance.types'

// Import components for each tab
import { PeriodAttendanceManager } from '@/features/attendance/components/PeriodAttendanceManager'
import { ShortageAlertManager } from '@/features/attendance/components/ShortageAlertManager'
import { LateDetectionManager } from '@/features/attendance/components/LateDetectionManager'
import { NotificationManager } from '@/features/attendance/components/NotificationManager'
import { BiometricDeviceManager } from '@/features/attendance/components/BiometricDeviceManager'
import type { AttendanceTabProps, AttendanceSubTab } from '../types/people.types'

// ============================================
// Mark Attendance Tab Component
// ============================================
function MarkAttendanceContent() {
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
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-200" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
              <Check className="h-5 w-5 text-green-600 dark:text-green-200" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.present}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
              <X className="h-5 w-5 text-red-600 dark:text-red-200" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-200" />
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
          <CardDescription>Click on status to cycle through: Present - Absent - Late</CardDescription>
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
function ReportsContent() {
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
                    <TableCell className="text-center text-green-600">{r.presentDays}</TableCell>
                    <TableCell className="text-center text-red-600">{r.absentDays}</TableCell>
                    <TableCell className="text-center text-yellow-600">{r.lateDays}</TableCell>
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
function LeaveManagementContent() {
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
                          className="text-green-600"
                          onClick={() => handleLeaveAction(leave.id, 'approved')}
                          disabled={updateLeave.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
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
                    <p className="text-sm text-red-600 mt-2">
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
// Main AttendanceTab Component
// ============================================
export function AttendanceTab({ subTab, onSubTabChange }: AttendanceTabProps) {
  return (
    <div className="space-y-4">
      <Tabs value={subTab} onValueChange={(v) => onSubTabChange(v as AttendanceSubTab)}>
        <TabsList variant="secondary" className="flex flex-wrap w-full gap-1">
          <TabsTrigger variant="secondary" value="mark" className="flex items-center gap-1">
            <ClipboardCheck className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Mark</span>
            <span className="md:hidden">Mark</span>
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="period" className="flex items-center gap-1">
            <Calendar className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Period</span>
            <span className="md:hidden">Period</span>
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="reports" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Reports</span>
            <span className="md:hidden">Reports</span>
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="leave" className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Leave</span>
            <span className="md:hidden">Leave</span>
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="alerts" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Alerts</span>
            <span className="md:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="late" className="flex items-center gap-1">
            <Clock className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Late</span>
            <span className="md:hidden">Late</span>
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="notifications" className="flex items-center gap-1">
            <Bell className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Notify</span>
            <span className="md:hidden">Notify</span>
          </TabsTrigger>
          <TabsTrigger variant="secondary" value="biometric" className="flex items-center gap-1">
            <Fingerprint className="h-4 w-4 hidden sm:block" />
            <span className="hidden md:inline">Biometric</span>
            <span className="md:hidden">Bio</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="mark" className="mt-0">
            <MarkAttendanceContent />
          </TabsContent>

          <TabsContent value="period" className="mt-0">
            <PeriodAttendanceManager />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <ReportsContent />
          </TabsContent>

          <TabsContent value="leave" className="mt-0">
            <LeaveManagementContent />
          </TabsContent>

          <TabsContent value="alerts" className="mt-0">
            <ShortageAlertManager />
          </TabsContent>

          <TabsContent value="late" className="mt-0">
            <LateDetectionManager />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationManager />
          </TabsContent>

          <TabsContent value="biometric" className="mt-0">
            <BiometricDeviceManager />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
