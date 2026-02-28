import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api-client'
import {
  Clock,
  ClipboardCheck,
  BookOpen,
  Calendar,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Users,
  FileText,
  Coffee,
  Shield,
  Sparkles,
  TrendingDown,
  Award,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn, formatDate, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'

const periodTypeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  lecture: { icon: BookOpen, color: 'text-blue-600 dark:text-blue-200', bg: 'bg-blue-50 dark:bg-blue-800' },
  free: { icon: Coffee, color: 'text-green-600 dark:text-green-200', bg: 'bg-green-50 dark:bg-green-800' },
  extra: { icon: Sparkles, color: 'text-purple-600 dark:text-purple-200', bg: 'bg-purple-50 dark:bg-purple-800' },
  duty: { icon: Shield, color: 'text-orange-600 dark:text-orange-200', bg: 'bg-orange-50 dark:bg-orange-800' },
}

export function TeacherDashboard() {
  const { user } = useAuthStore()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'teacher-stats'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/teacher-stats')
      return json.data
    },
  })

  const { data: schedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['dashboard', 'teacher-schedule'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/teacher-schedule')
      return json.data
    },
  })

  const { data: classes } = useQuery({
    queryKey: ['dashboard', 'teacher-classes'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/teacher-classes')
      return json.data
    },
  })

  const { data: tasks } = useQuery({
    queryKey: ['dashboard', 'teacher-tasks'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/teacher-tasks')
      return json.data
    },
  })

  const { data: announcements } = useQuery({
    queryKey: ['dashboard', 'announcements'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/announcements')
      return json.data
    },
  })

  // Fetch struggling students
  const { data: strugglingStudents } = useQuery({
    queryKey: ['dashboard', 'struggling-students'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/struggling-students')
      return json.data
    },
  })

  // Fetch pending grades
  const { data: pendingGrades } = useQuery({
    queryKey: ['dashboard', 'pending-grades'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/pending-grades')
      return json.data
    },
  })

  const attendanceProgress = stats
    ? Math.round((stats.attendanceMarked / (stats.attendanceMarked + stats.attendancePending)) * 100)
    : 0

  return (
    <div>
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, ${user?.name?.split(' ')[0] || 'Teacher'}!`}
        description={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Classes Today</p>
                    <p className="text-2xl font-bold">{stats?.classesToday || 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-800">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link to="/attendance">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Attendance</p>
                      <p className="text-2xl font-bold">
                        {stats?.attendanceMarked || 0}/{(stats?.attendanceMarked || 0) + (stats?.attendancePending || 0)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-800">
                      <ClipboardCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <Progress value={attendanceProgress} className="mt-2 h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">{stats?.attendancePending || 0} pending</p>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Tasks</p>
                    <p className="text-2xl font-bold">{stats?.pendingMarksEntry || 0}</p>
                    <p className="text-xs text-muted-foreground">marks entries</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-800">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Leave Balance</p>
                    <p className="text-2xl font-bold">{stats?.leaveBalance || 0}</p>
                    <p className="text-xs text-muted-foreground">days remaining</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-800">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Schedule & Classes */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
              <CardDescription>{stats?.classesToday || 0} classes scheduled</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {scheduleLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {schedule?.map((period: any) => {
                  const config = periodTypeConfig[period.type] || periodTypeConfig.lecture
                  const PeriodIcon = config.icon
                  return (
                    <div
                      key={period.period}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-lg border',
                        config.bg
                      )}
                    >
                      <div className="text-center min-w-[32px]">
                        <span className="text-lg font-bold">{period.period}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <PeriodIcon className={cn('h-4 w-4', config.color)} />
                          <span className="font-medium text-sm">{period.subject}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{period.time}</span>
                          {period.class !== '-' && (
                            <>
                              <span>|</span>
                              <span>{period.class}</span>
                            </>
                          )}
                          {period.room !== '-' && (
                            <>
                              <span>|</span>
                              <span>{period.room}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={cn('text-xs', config.color)}>
                        {period.type}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Pending Tasks
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks?.map((task: any) => (
              <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div
                  className={cn(
                    'mt-0.5 w-2 h-2 rounded-full shrink-0',
                    task.priority === 'high' && 'bg-red-500',
                    task.priority === 'medium' && 'bg-yellow-500',
                    task.priority === 'low' && 'bg-green-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{task.task}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {task.priority}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      Due: {formatDate(task.dueDate, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {(!tasks || tasks.length === 0) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                All caught up!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Classes & Announcements */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* My Classes - Attendance Status */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Classes
              </CardTitle>
              <CardDescription>Today's attendance status by class</CardDescription>
            </div>
            <Link to="/attendance">
              <Button variant="ghost" size="sm">
                Mark Attendance
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {classes?.map((cls: any) => (
                <div
                  key={cls.class}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    cls.attendanceToday === 'marked'
                      ? 'bg-green-50 border-green-200 dark:bg-green-800 dark:border-green-800'
                      : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-800 dark:border-yellow-800'
                  )}
                >
                  <div>
                    <p className="font-medium text-sm">{cls.class}</p>
                    <p className="text-xs text-muted-foreground">{cls.subject} | {cls.students} students</p>
                    {cls.attendanceToday === 'marked' && (
                      <p className="text-xs mt-1">
                        <span className="text-green-600 font-medium">{cls.presentToday}P</span>
                        {' / '}
                        <span className="text-red-600 font-medium">{cls.absentToday}A</span>
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={cls.attendanceToday === 'marked' ? 'default' : 'secondary'}
                    className={cn(
                      cls.attendanceToday === 'marked'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    )}
                  >
                    {cls.attendanceToday === 'marked' ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {cls.attendanceToday === 'marked' ? 'Done' : 'Pending'}
                  </Badge>
                </div>
              ))}
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
            {announcements?.slice(0, 3).map((item: any) => (
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
                <p className="text-[10px] text-muted-foreground">{item.createdBy}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Struggling Students & Pending Grades */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Struggling Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                Students Needing Attention
              </CardTitle>
              <CardDescription>Low performance or attendance alerts</CardDescription>
            </div>
            <Link to="/students">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {strugglingStudents && strugglingStudents.length > 0 ? (
              <div className="space-y-3">
                {strugglingStudents.slice(0, 4).map((student: any) => (
                  <div
                    key={student.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      student.alertType === 'attendance' && 'border-red-200 bg-red-50 dark:bg-red-800',
                      student.alertType === 'performance' && 'border-orange-200 bg-orange-50 dark:bg-orange-800'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{getInitials(student.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.class} | {student.issue}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={student.alertType === 'attendance' ? 'destructive' : 'secondary'}
                      className="text-[10px]"
                    >
                      {student.alertType === 'attendance' ? `${student.value}%` : `Grade: ${student.value}`}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All students are doing well!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Grade Entry */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                Pending Grades
              </CardTitle>
              <CardDescription>Exams requiring marks entry</CardDescription>
            </div>
            <Link to="/exams">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingGrades && pendingGrades.length > 0 ? (
              <div className="space-y-3">
                {pendingGrades.slice(0, 4).map((exam: any) => (
                  <Link key={exam.id} to={`/exams/${exam.id}/marks`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{exam.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exam.class} | {exam.subject}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {exam.enteredCount}/{exam.totalStudents} entered
                        </p>
                        <Progress value={(exam.enteredCount / exam.totalStudents) * 100} className="w-20 h-1.5 mt-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All grades are up to date!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
