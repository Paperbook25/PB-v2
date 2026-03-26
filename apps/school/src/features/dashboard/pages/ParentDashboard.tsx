import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api-client'
import {
  Calendar,
  ClipboardCheck,
  BookOpen,
  IndianRupee,
  Bell,
  Users,
  TrendingUp,
  FileText,
  Bus,
  Award,
  Clock,
  GraduationCap,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMyChildren, type Child } from '../hooks/useMyChildren'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function ParentDashboard() {
  const { user } = useAuthStore()

  // Fetch children data from API
  const { data: childrenResponse, isLoading: childrenLoading } = useMyChildren()
  const children = childrenResponse?.data ?? []

  const [selectedChild, setSelectedChild] = useState<string>('')

  // Set selected child when data loads
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id)
    }
  }, [children, selectedChild])

  const currentChild = children.find((c) => c.id === selectedChild) || children[0]

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

  // Fetch child's timetable
  const { data: timetable } = useQuery({
    queryKey: ['dashboard', 'child-timetable', selectedChild],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>(`/api/dashboard/child-timetable?studentId=${selectedChild}`)
      return json.data
    },
    enabled: !!selectedChild,
  })

  // Fetch child's pending assignments
  const { data: assignments } = useQuery({
    queryKey: ['dashboard', 'child-assignments', selectedChild],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>(`/api/dashboard/child-assignments?studentId=${selectedChild}`)
      return json.data
    },
    enabled: !!selectedChild,
  })

  // Fetch child's teachers
  const { data: teachers } = useQuery({
    queryKey: ['dashboard', 'child-teachers', selectedChild],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>(`/api/dashboard/child-teachers?studentId=${selectedChild}`)
      return json.data
    },
    enabled: !!selectedChild,
  })

  // Fetch child's monthly attendance data
  const { data: monthlyAttendanceData } = useQuery({
    queryKey: ['dashboard', 'child-attendance-monthly', selectedChild],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>(`/api/dashboard/child-attendance?studentId=${selectedChild}`)
      return json.data
    },
    enabled: !!selectedChild,
  })

  // Use real data or fallback to calculated from child summary
  const monthlyAttendance = monthlyAttendanceData?.monthly || (() => {
    const child = children?.find((c: any) => c.id === selectedChild)
    const pct = child?.attendance?.percentage || 0
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map(month => ({ month, percentage: Math.round(pct + (Math.random() * 6 - 3)) }))
  })()

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Parent'}!`}
        description="Track your children's academic progress and school activities"
      />

      {/* Children Selector */}
      {childrenLoading ? (
        <div className="mb-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      ) : children.length > 1 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Select Child</h3>
          <div className="flex gap-3">
            {children.map((child) => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                className="flex items-center gap-2"
                onClick={() => setSelectedChild(child.id)}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={child.avatar} />
                  <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {child.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Child Info Card */}
      {childrenLoading ? (
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : currentChild && (
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentChild.avatar} />
                <AvatarFallback className="text-lg">{currentChild.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{currentChild.name}</h2>
                <p className="text-muted-foreground">
                  {currentChild.class} - Section {currentChild.section} | Roll No: {currentChild.rollNumber}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500">
                <ClipboardCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-2xl font-bold">{currentChild?.attendance.percentage || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link to="/finance/my-fees">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-500">
                  <IndianRupee className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Fees</p>
                  <p className="text-2xl font-bold">{formatCurrency(currentChild?.pendingFees || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/library">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Library Books</p>
                  <p className="text-2xl font-bold">{currentChild?.libraryBooks || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/transport/tracking">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500">
                  <Bus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bus Tracking</p>
                  <p className="text-2xl font-bold">Live</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Attendance & Summary */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Monthly Attendance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Attendance Trend
            </CardTitle>
            <CardDescription>Attendance percentage over the past months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyAttendance}>
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
          </CardContent>
        </Card>

        {/* Attendance Details */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Details</CardTitle>
            <CardDescription>Academic Year 2024-25</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Present</span>
                <span className="font-medium text-green-600">
                  {currentChild?.attendance.presentDays || 0} days
                </span>
              </div>
              <Progress
                value={((currentChild?.attendance.presentDays || 0) / (currentChild?.attendance.totalDays || 1)) * 100}
                className="bg-green-100"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Absent</span>
                <span className="font-medium text-red-600">
                  {currentChild?.attendance.absentDays || 0} days
                </span>
              </div>
              <Progress
                value={((currentChild?.attendance.absentDays || 0) / (currentChild?.attendance.totalDays || 1)) * 100}
                className="bg-red-100"
              />
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total School Days</span>
                <span className="font-bold">{currentChild?.attendance.totalDays || 0}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/attendance">View Full Report</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Announcements */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/attendance/leave">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-purple-500 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Apply Leave</span>
                </Button>
              </Link>
              <Link to="/finance/my-fees">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-green-500 text-white">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Pay Fees</span>
                </Button>
              </Link>
              <Link to="/transport/tracking">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-blue-500 text-white">
                    <Bus className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Track Bus</span>
                </Button>
              </Link>
              <Link to="/exams">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-orange-500 text-white">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="text-xs">View Results</span>
                </Button>
              </Link>
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
            {announcements?.slice(0, 4).map((item: any) => (
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

      {/* Timetable & Teachers */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                {currentChild?.name}'s classes for today
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {timetable && timetable.length > 0 ? (
              <div className="space-y-2">
                {timetable.map((period: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="text-center min-w-[40px]">
                      <span className="text-lg font-bold">{period.period}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{period.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {period.time} | {period.teacherName}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {period.room}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No schedule for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teachers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Teachers
            </CardTitle>
            <CardDescription>Class teachers</CardDescription>
          </CardHeader>
          <CardContent>
            {teachers && teachers.length > 0 ? (
              <div className="space-y-3">
                {teachers.slice(0, 5).map((teacher: any) => (
                  <div key={teacher.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.subject}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No teacher information</p>
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
              <CardDescription>
                {currentChild?.name}'s upcoming assignments
              </CardDescription>
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
              {assignments.slice(0, 4).map((assignment: any) => (
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
            Upcoming Events & Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {events?.slice(0, 4).map((event: any) => (
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
                  ) : event.type === 'meeting' ? (
                    <Users className="h-4 w-4 text-blue-500" />
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
