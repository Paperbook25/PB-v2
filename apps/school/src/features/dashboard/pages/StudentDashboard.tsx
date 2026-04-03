import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api-client'
import {
  Calendar,
  ClipboardCheck,
  BookOpen,
  IndianRupee,
  Bell,
  Award,
  Clock,
  TrendingUp,
  FileText,
  MonitorPlay,
  Bus,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMyAttendance } from '@/features/attendance/hooks/useAttendance'
import { useMyFees } from '@/features/finance/hooks/useFinance'
import { useMyIssuedBooks } from '@/features/library/hooks/useLibrary'
import { useExams } from '@/features/exams/hooks/useExams'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface QuickStatProps {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
  href?: string
}

function QuickStat({ title, value, icon: Icon, color, href }: QuickStatProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-lg', color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return href ? <Link to={href}>{content}</Link> : content
}

export function StudentDashboard() {
  const { user } = useAuthStore()

  // Fetch student's attendance
  const { data: attendanceResponse, isLoading: attendanceLoading } = useMyAttendance()
  const attendanceData = attendanceResponse?.data

  // Fetch student's fees
  const { data: feesResponse } = useMyFees()
  const pendingFees = feesResponse?.data?.summary?.totalPending ?? 0

  // Fetch student's issued books
  const { data: booksResponse } = useMyIssuedBooks()
  const libraryBooks = booksResponse?.data?.length ?? 0

  // Fetch upcoming exams (scheduled exams)
  const { data: examsResponse } = useExams({ status: 'scheduled' })
  const upcomingExams = examsResponse?.data?.length ?? 0

  // Fetch announcements
  const { data: announcements } = useQuery({
    queryKey: ['dashboard', 'announcements'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/announcements')
      return json.data
    },
  })

  // Fetch upcoming events
  const { data: events } = useQuery({
    queryKey: ['dashboard', 'events'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/events')
      return json.data
    },
  })

  // Fetch enrolled courses
  const { data: courses } = useQuery({
    queryKey: ['dashboard', 'student-courses'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/student-courses')
      return json.data
    },
  })

  // Fetch pending assignments
  const { data: assignments } = useQuery({
    queryKey: ['dashboard', 'student-assignments'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/student-assignments')
      return json.data
    },
  })

  // Fetch transport info
  const { data: transport } = useQuery({
    queryKey: ['dashboard', 'student-transport'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/student-transport')
      return json.data
    },
  })

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Student'}!`}
        description={`${user?.class || 'Class 10'} - Section ${user?.section || 'A'} | Roll No: ${user?.rollNumber || 1}`}
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <QuickStat
          title="Attendance"
          value={`${attendanceData?.summary?.attendancePercentage || 0}%`}
          icon={ClipboardCheck}
          color="bg-green-500"
          href="/attendance"
        />
        <QuickStat
          title="Pending Fees"
          value={formatCurrency(pendingFees)}
          icon={IndianRupee}
          color="bg-orange-500"
          href="/finance/my-fees"
        />
        <QuickStat
          title="Library Books"
          value={libraryBooks}
          icon={BookOpen}
          color="bg-blue-500"
          href="/library"
        />
        <QuickStat
          title="Upcoming Exams"
          value={upcomingExams}
          icon={FileText}
          color="bg-purple-500"
          href="/exams"
        />
      </div>

      {/* Attendance Chart & Details */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Monthly Attendance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Attendance
            </CardTitle>
            <CardDescription>Your attendance trend this academic year</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={attendanceData?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Attendance']}
                  />
                  <Bar dataKey="percentage" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>Academic Year {attendanceData?.academicYear || '2024-25'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {attendanceLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Present</span>
                    <span className="font-medium text-green-600">
                      {attendanceData?.summary?.presentDays || 0} days
                    </span>
                  </div>
                  <Progress value={((attendanceData?.summary?.presentDays || 0) / (attendanceData?.summary?.totalDays || 1)) * 100} className="bg-green-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Absent</span>
                    <span className="font-medium text-red-600">
                      {attendanceData?.summary?.absentDays || 0} days
                    </span>
                  </div>
                  <Progress value={((attendanceData?.summary?.absentDays || 0) / (attendanceData?.summary?.totalDays || 1)) * 100} className="bg-red-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Late</span>
                    <span className="font-medium text-orange-600">
                      {attendanceData?.summary?.lateDays || 0} days
                    </span>
                  </div>
                  <Progress value={((attendanceData?.summary?.lateDays || 0) / (attendanceData?.summary?.totalDays || 1)) * 100} className="bg-orange-100" />
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total Days</span>
                    <span className="font-bold">{attendanceData?.summary?.totalDays || 0}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance & Events */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Recent Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(attendanceData?.recentRecords ?? []).slice(0, 5).map((record: any) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{formatDate(record.date, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    {record.checkInTime && (
                      <p className="text-xs text-muted-foreground">
                        Check-in: {record.checkInTime}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      record.status === 'present'
                        ? 'default'
                        : record.status === 'absent'
                        ? 'destructive'
                        : record.status === 'late'
                        ? 'secondary'
                        : 'outline'
                    }
                    className={cn(
                      record.status === 'present' && 'bg-green-500',
                      record.status === 'late' && 'bg-orange-500 text-white'
                    )}
                  >
                    {record.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {(!attendanceData?.recentRecords || attendanceData.recentRecords.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No attendance records yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(announcements ?? []).slice(0, 4).map((item: any) => (
              <div key={item.id} className="space-y-1 pb-3 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.priority === 'high'
                        ? 'destructive'
                        : item.priority === 'medium'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-[10px] px-1.5 py-0"
                  >
                    {item.priority}
                  </Badge>
                  <span className="text-sm font-medium truncate">{item.title}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* LMS & Transport Section */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Enrolled Courses */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MonitorPlay className="h-5 w-5" />
                My Courses
              </CardTitle>
              <CardDescription>Continue learning where you left off</CardDescription>
            </div>
            <Link to="/lms/courses">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {(courses ?? []).slice(0, 4).map((course: any) => (
                <Link key={course.id} to={`/lms/courses/${course.id}/learn`}>
                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MonitorPlay className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{course.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={course.progress} className="flex-1 h-1.5" />
                        <span className="text-xs text-muted-foreground">{course.progress}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {(!courses || courses.length === 0) && (
                <div className="col-span-2 text-center py-6 text-muted-foreground">
                  <MonitorPlay className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No courses enrolled yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transport Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5" />
              Bus Route
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transport ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border">
                  <p className="font-medium text-sm">{transport.routeName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bus: {transport.vehicleNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Driver: {transport.driverName}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Your Stop</p>
                  <div className="flex items-center gap-2 p-2 border rounded-lg">
                    <div className="p-1.5 rounded-full bg-green-500">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm">{transport.stopName}</p>
                      <p className="text-xs text-muted-foreground">
                        Pickup: {transport.pickupTime}
                      </p>
                    </div>
                  </div>
                </div>
                <Link to="/transport/tracking">
                  <Button variant="outline" size="sm" className="w-full">
                    <Bus className="h-4 w-4 mr-2" />
                    Track Live
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Bus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transport assigned</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Assignments */}
      {assignments && assignments.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pending Assignments
              </CardTitle>
              <CardDescription>Due soon - complete these first</CardDescription>
            </div>
            <Link to="/lms/assignments">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {(assignments ?? []).slice(0, 4).map((assignment: any) => (
                <div
                  key={assignment.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    assignment.daysUntilDue <= 1 && 'border-red-200 bg-red-50',
                    assignment.daysUntilDue <= 3 && assignment.daysUntilDue > 1 && 'border-orange-200 bg-orange-50',
                    assignment.daysUntilDue > 3 && 'border-green-200 bg-green-50'
                  )}
                >
                  <p className="font-medium text-sm truncate">{assignment.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{assignment.courseName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      {assignment.daysUntilDue <= 0
                        ? 'Overdue'
                        : assignment.daysUntilDue === 1
                        ? 'Due tomorrow'
                        : `Due in ${assignment.daysUntilDue} days`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events & Exams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(events ?? []).slice(0, 4).map((event: any) => (
              <div
                key={event.id}
                className={cn(
                  'p-4 rounded-lg border',
                  event.type === 'exam' && 'border-red-200 bg-red-50',
                  event.type === 'holiday' && 'border-green-200 bg-green-50',
                  event.type === 'meeting' && 'border-blue-200 bg-blue-50',
                  event.type === 'event' && 'border-purple-200 bg-purple-50'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {event.type === 'exam' ? (
                    <Award className="h-4 w-4 text-red-500" />
                  ) : (
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Badge variant="outline" className="text-xs">
                    {event.type}
                  </Badge>
                </div>
                <p className="font-medium text-sm">{event.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(event.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
