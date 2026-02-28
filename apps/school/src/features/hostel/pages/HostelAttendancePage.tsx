import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'
import { UserCheck, UserX, Clock, CalendarDays } from 'lucide-react'
import {
  useHostelAttendance,
  useHostels,
  useAllocations,
  useMarkBulkHostelAttendance,
  useHostelStats,
} from '../hooks/useHostel'
import { useToast } from '@/hooks/use-toast'
import { getAttendanceBadgeVariant } from '@/lib/attendance-ui'
import { ATTENDANCE_STATUS_LABELS, type HostelAttendanceStatus } from '../types/hostel.types'

export function HostelAttendancePage() {
  const [hostelFilter, setHostelFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, HostelAttendanceStatus>>({})

  const { data: attendanceResult, isLoading } = useHostelAttendance({
    hostelId: hostelFilter || undefined,
    date: dateFilter,
  })
  const { data: hostelsResult } = useHostels()
  const { data: allocationsResult } = useAllocations({
    hostelId: hostelFilter || undefined,
    status: 'active',
  })
  const { data: statsResult } = useHostelStats()
  const markBulkAttendance = useMarkBulkHostelAttendance()
  const { toast } = useToast()

  const attendance = attendanceResult?.data || []
  const hostels = hostelsResult?.data || []
  const allocations = allocationsResult?.data || []
  const stats = statsResult?.data

  // Merge allocations with attendance data
  const studentList = allocations.map((allocation) => {
    const att = attendance.find((a) => a.studentId === allocation.studentId)
    return {
      ...allocation,
      attendance: att,
      currentStatus: attendanceStatus[allocation.studentId] || att?.status || 'present',
    }
  })

  const handleStatusChange = (studentId: string, status: HostelAttendanceStatus) => {
    setAttendanceStatus((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleMarkAll = (status: HostelAttendanceStatus) => {
    const newStatus: Record<string, HostelAttendanceStatus> = {}
    allocations.forEach((a) => {
      newStatus[a.studentId] = status
    })
    setAttendanceStatus(newStatus)
  }

  const handleSave = async () => {
    const records = Object.entries(attendanceStatus).map(([studentId, status]) => ({
      studentId,
      status,
    }))

    if (records.length === 0) {
      toast({ title: 'No changes to save', variant: 'destructive' })
      return
    }

    try {
      await markBulkAttendance.mutateAsync({ date: dateFilter, records })
      toast({ title: 'Attendance saved successfully' })
      setAttendanceStatus({})
    } catch {
      toast({ title: 'Failed to save attendance', variant: 'destructive' })
    }
  }

  const presentCount = studentList.filter((s) => s.currentStatus === 'present').length
  const absentCount = studentList.filter((s) => s.currentStatus === 'absent').length
  const leaveCount = studentList.filter((s) => s.currentStatus === 'leave').length

  return (
    <div>
      <PageHeader
        title="Hostel Attendance"
        description="Mark daily hostel attendance and night roll call"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Hostel', href: '/hostel' },
          { label: 'Attendance' },
        ]}
      />

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <p className="text-xs text-muted-foreground">
                {studentList.length > 0
                  ? `${Math.round((presentCount / studentList.length) * 100)}%`
                  : '0%'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              <p className="text-xs text-muted-foreground">Require follow-up</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
              <CalendarDays className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{leaveCount}</div>
              <p className="text-xs text-muted-foreground">Approved leave</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">Active allocations</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div>
                <Label>Hostel</Label>
                <Select value={hostelFilter || 'all'} onValueChange={(v) => setHostelFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Hostels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hostels</SelectItem>
                    {hostels.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={() => handleMarkAll('present')}>
                  Mark All Present
                </Button>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={() => handleMarkAll('absent')}>
                  Mark All Absent
                </Button>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSave}
                  disabled={markBulkAttendance.isPending || Object.keys(attendanceStatus).length === 0}
                >
                  {markBulkAttendance.isPending ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading attendance...</div>
            ) : studentList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found. Please select a hostel with active allocations.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Hostel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentList.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentName}</TableCell>
                      <TableCell>
                        {student.class}-{student.section}
                      </TableCell>
                      <TableCell>{student.roomNumber}</TableCell>
                      <TableCell>{student.hostelName}</TableCell>
                      <TableCell>
                        <Select
                          value={student.currentStatus}
                          onValueChange={(v) =>
                            handleStatusChange(student.studentId, v as HostelAttendanceStatus)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              <Badge variant={getAttendanceBadgeVariant(student.currentStatus)}>
                                {ATTENDANCE_STATUS_LABELS[student.currentStatus]}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                <Badge variant={getAttendanceBadgeVariant(value)}>
                                  {label}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{student.attendance?.checkIn || '-'}</TableCell>
                      <TableCell>{student.attendance?.checkOut || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
