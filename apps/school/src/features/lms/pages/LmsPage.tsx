import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Video, TrendingUp, Plus, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLmsStats, useLiveClasses } from '../hooks/useLms'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { LIVE_CLASS_STATUS_LABELS } from '../types/lms.types'
import { statusColors, moduleColors } from '@/lib/design-tokens'

const popularCoursesData = [
  { name: 'Math 10', students: 45 },
  { name: 'Physics', students: 38 },
  { name: 'Biology', students: 35 },
  { name: 'English', students: 30 },
  { name: 'CS', students: 28 },
]

export function LmsPage() {
  const { data: statsResult, isLoading: statsLoading } = useLmsStats()
  const stats = statsResult?.data

  const { data: liveClassesResult } = useLiveClasses({ status: 'scheduled', limit: 5 })
  const liveClasses = liveClassesResult?.data ?? []

  const statCards = [
    {
      title: 'Total Courses',
      value: stats?.totalCourses ?? 0,
      icon: BookOpen,
      bgColor: statusColors.infoLight,
      iconColor: statusColors.info,
    },
    {
      title: 'Active Students',
      value: stats?.activeEnrollments ?? 0,
      icon: Users,
      bgColor: statusColors.successLight,
      iconColor: statusColors.success,
    },
    {
      title: 'Live Classes Today',
      value: stats?.liveClassesToday ?? 0,
      icon: Video,
      bgColor: moduleColors.integrationsLight,
      iconColor: moduleColors.integrations,
    },
    {
      title: 'Avg Completion Rate',
      value: `${stats?.avgCompletionRate ?? 0}%`,
      icon: TrendingUp,
      bgColor: moduleColors.behaviorLight,
      iconColor: moduleColors.behavior,
    },
  ]

  return (
    <div>
      <PageHeader
        title="LMS Dashboard"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'LMS' },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: stat.bgColor }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button asChild>
          <Link to="/lms/courses/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/lms/live-classes">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Live Class
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Live Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Live Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {liveClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming live classes scheduled.
              </p>
            ) : (
              <div className="space-y-3">
                {liveClasses.map((lc) => (
                  <div
                    key={lc.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{lc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lc.instructorName} &middot;{' '}
                        {new Date(lc.scheduledAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {LIVE_CLASS_STATUS_LABELS[lc.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Courses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popularCoursesData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="students"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
