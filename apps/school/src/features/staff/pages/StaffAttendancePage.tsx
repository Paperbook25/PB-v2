import { useState } from 'react'
import { CalendarDays, ClipboardList, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { AttendanceMarkingGrid } from '../components/AttendanceMarkingGrid'
import { useStaffList, useDailyAttendance, useSaveAttendance } from '../hooks/useStaff'
import type { BulkAttendanceRecord } from '../types/staff.types'

export function StaffAttendancePage() {
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

  // Calculate summary stats from attendance data
  const todayAttendance = attendanceData?.data || []
  const presentCount = todayAttendance.filter((r) => r.status === 'present').length
  const absentCount = todayAttendance.filter((r) => r.status === 'absent').length
  const onLeaveCount = todayAttendance.filter((r) => r.status === 'on_leave').length
  const halfDayCount = todayAttendance.filter((r) => r.status === 'half_day').length

  return (
    <div>
      <PageHeader
        title="Staff Attendance"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Staff', href: '/staff' },
          { label: 'Attendance' },
        ]}
      />

      <Tabs defaultValue="mark" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mark" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="space-y-4">
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

        <TabsContent value="reports" className="space-y-4">
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
