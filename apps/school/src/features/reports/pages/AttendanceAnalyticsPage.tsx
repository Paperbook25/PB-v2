import { Users, UserCheck, UserX, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  SimpleLineChart,
  SimpleBarChart,
  HorizontalBarChart,
} from '../components/AnalyticsCharts'
import { useAttendanceAnalytics } from '../hooks/useReports'

export function AttendanceAnalyticsPage() {
  const { data: analyticsData, isLoading } = useAttendanceAnalytics()

  const analytics = analyticsData?.data

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Attendance Analytics"
          description="Attendance patterns and analysis"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Reports', href: '/reports' },
            { label: 'Attendance Analytics' },
          ]}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div>
        <PageHeader
          title="Attendance Analytics"
          description="Attendance patterns and analysis"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Reports', href: '/reports' },
            { label: 'Attendance Analytics' },
          ]}
        />
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No analytics data available.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Attendance Analytics"
        description="Attendance patterns and analysis"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reports', href: '/reports' },
          { label: 'Attendance Analytics' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.overallRate}%</p>
              <p className="text-xs text-muted-foreground">Overall Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.presentToday}</p>
              <p className="text-xs text-muted-foreground">Present Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.absentToday}</p>
              <p className="text-xs text-muted-foreground">Absent Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.lateArrivals}</p>
              <p className="text-xs text-muted-foreground">Late Arrivals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.chronicallyAbsent}</p>
              <p className="text-xs text-muted-foreground">Chronic Absent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <SimpleLineChart
          title="Monthly Attendance Trend"
          data={analytics.monthlyTrend.filter((m) => m.value > 0).map((m) => ({ label: m.label || m.date, value: m.value }))}
          height={300}
          color="#3b82f6"
          formatValue={(v) => `${v}%`}
        />

        {/* Day-wise Pattern */}
        <SimpleBarChart
          title="Day-wise Attendance Pattern"
          data={analytics.dayWisePattern.map((d) => ({
            label: d.day,
            value: d.rate,
          }))}
          height={300}
          formatValue={(v) => `${v}%`}
        />

        {/* Class-wise Attendance */}
        <HorizontalBarChart
          title="Class-wise Attendance Rate"
          data={analytics.classWiseAttendance.map((c) => ({
            label: c.class,
            value: c.rate,
          }))}
          height={400}
          formatValue={(v) => `${v}%`}
        />

        {/* Today's Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Attendance</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Attendance</span>
                <span className="font-medium">{analytics.overallRate}%</span>
              </div>
              <Progress value={analytics.overallRate} className="h-3" />
            </div>

            {/* Present vs Absent */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">Present</span>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
                  {analytics.presentToday}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-red-700 dark:text-red-300">Absent</span>
                </div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-2">
                  {analytics.absentToday}
                </p>
              </div>
            </div>

            {/* Alerts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Late Arrivals</span>
                </div>
                <span className="font-medium">{analytics.lateArrivals}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Chronically Absent Students</span>
                </div>
                <span className="font-medium">{analytics.chronicallyAbsent}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Details */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Class-wise Attendance Details</CardTitle>
          <CardDescription>Attendance rate for each class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {analytics.classWiseAttendance.map((item) => (
              <div
                key={item.class}
                className="p-4 rounded-lg border text-center"
              >
                <p
                  className={`text-2xl font-bold ${
                    item.rate >= 90
                      ? 'text-green-600'
                      : item.rate >= 80
                        ? 'text-blue-600'
                        : item.rate >= 70
                          ? 'text-yellow-600'
                          : 'text-red-600'
                  }`}
                >
                  {item.rate}%
                </p>
                <p className="text-sm text-muted-foreground">{item.class}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
