import { useSearchParams } from 'react-router-dom'
import { GraduationCap, Users, ClipboardCheck, AlertCircle, Shield } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMyAttendance } from '@/features/attendance/hooks/useAttendance'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ATTENDANCE_STATUS_LABELS } from '@/features/attendance/types/attendance.types'

import { StudentsTab } from '../components/StudentsTab'
import { StaffTab } from '../components/StaffTab'
import { AttendanceTab } from '../components/AttendanceTab'
import { BehaviorTab } from '../components/BehaviorTab'
import type {
  PrimaryTab,
  StudentSubTab,
  StaffSubTab,
  AttendanceSubTab,
  BehaviorSubTab,
} from '../types/people.types'

// ============================================
// My Attendance View (for Student/Parent)
// ============================================
function MyAttendanceView() {
  const { data: myAttendanceData, isLoading: myAttendanceLoading } = useMyAttendance()
  const myAttendance = myAttendanceData?.data

  return (
    <div>
      <PageHeader
        title="My Attendance"
        description="View your attendance records"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Attendance' }]}
        moduleColor="students"
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
            <CardContent className="p-6">
              <h3 className="text-base font-semibold mb-4">Monthly Attendance</h3>
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
            <CardContent className="p-6">
              <h3 className="text-base font-semibold mb-4">Recent Attendance</h3>
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

// ============================================
// Main People Page Component
// ============================================
export function PeoplePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, hasRole } = useAuthStore()

  // Get tab state from URL
  const activeTab = (searchParams.get('tab') as PrimaryTab) || 'students'
  const subTab = searchParams.get('subtab') || ''
  const nestedTab = searchParams.get('nested') || ''

  // Check if user is student or parent
  const isStudentOrParent = user?.role === 'student' || user?.role === 'parent'

  // Filter visible tabs by role
  const visibleTabs = [
    { value: 'students', label: 'Students', icon: GraduationCap, roles: ['admin', 'principal', 'teacher'] as const },
    { value: 'staff', label: 'Staff', icon: Users, roles: ['admin', 'principal'] as const },
    { value: 'attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['admin', 'principal', 'teacher'] as const },
    { value: 'behavior', label: 'Behavior', icon: Shield, roles: ['admin', 'principal', 'teacher'] as const },
  ].filter(t => hasRole([...t.roles]))

  // Handle tab changes
  const handlePrimaryTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  const handleStudentsSubTabChange = (value: StudentSubTab) => {
    setSearchParams({ tab: 'students', subtab: value })
  }

  const handleStaffSubTabChange = (value: StaffSubTab) => {
    setSearchParams({ tab: 'staff', subtab: value })
  }

  const handleStaffNestedTabChange = (value: string) => {
    setSearchParams({ tab: 'staff', subtab: subTab || 'list', nested: value })
  }

  const handleAttendanceSubTabChange = (value: AttendanceSubTab) => {
    setSearchParams({ tab: 'attendance', subtab: value })
  }

  const handleBehaviorSubTabChange = (value: BehaviorSubTab) => {
    setSearchParams({ tab: 'behavior', subtab: value })
  }

  // Show My Attendance view for student/parent
  if (isStudentOrParent) {
    return <MyAttendanceView />
  }

  // Get current subtab with defaults
  const studentSubTab = (subTab as StudentSubTab) || 'dashboard'
  const staffSubTab = (subTab as StaffSubTab) || 'list'
  const attendanceSubTab = (subTab as AttendanceSubTab) || 'mark'
  const behaviorSubTab = (subTab as BehaviorSubTab) || 'dashboard'

  return (
    <div>
      <PageHeader
        title="People"
        description="Manage students, staff, and attendance"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'People' }]}
        moduleColor="students"
      />

      <Tabs value={activeTab} onValueChange={handlePrimaryTabChange} className="mt-6">
        <TabsList className={`grid w-full grid-cols-${visibleTabs.length}`}>
          {visibleTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="students" className="mt-0">
            <StudentsTab
              subTab={studentSubTab}
              onSubTabChange={handleStudentsSubTabChange}
            />
          </TabsContent>

          <TabsContent value="staff" className="mt-0">
            <StaffTab
              subTab={staffSubTab}
              nestedTab={nestedTab}
              onSubTabChange={handleStaffSubTabChange}
              onNestedTabChange={handleStaffNestedTabChange}
            />
          </TabsContent>

          <TabsContent value="attendance" className="mt-0">
            <AttendanceTab
              subTab={attendanceSubTab}
              onSubTabChange={handleAttendanceSubTabChange}
            />
          </TabsContent>

          <TabsContent value="behavior" className="mt-0">
            <BehaviorTab
              subTab={behaviorSubTab}
              onSubTabChange={handleBehaviorSubTabChange}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
