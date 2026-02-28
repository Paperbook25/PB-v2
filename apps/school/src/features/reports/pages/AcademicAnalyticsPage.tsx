import { GraduationCap, TrendingUp, Award, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  SimpleBarChart,
  SimplePieChart,
  SimpleLineChart,
  HorizontalBarChart,
} from '../components/AnalyticsCharts'
import { KPICard } from '../components/KPICard'
import { useAcademicAnalytics } from '../hooks/useReports'
import type { KPIMetric } from '../types/reports.types'

export function AcademicAnalyticsPage() {
  const { data: analyticsData, isLoading } = useAcademicAnalytics()

  const analytics = analyticsData?.data

  // Create KPI metrics from analytics data
  const kpis: KPIMetric[] = analytics
    ? [
        {
          id: 'pass-rate',
          name: 'Overall Pass Rate',
          value: analytics.overallPassRate,
          previousValue: analytics.overallPassRate - 1.4,
          change: 1.4,
          changePercent: 1.5,
          trend: 'up',
          format: 'percent',
          category: 'academic',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'avg-score',
          name: 'Average Score',
          value: analytics.averageScore,
          previousValue: analytics.averageScore - 2.3,
          change: 2.3,
          changePercent: 3.3,
          trend: 'up',
          format: 'percent',
          category: 'academic',
          updatedAt: new Date().toISOString(),
        },
      ]
    : []

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Academic Analytics"
          description="Student performance and academic metrics"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Reports', href: '/reports' },
            { label: 'Academic Analytics' },
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
          title="Academic Analytics"
          description="Student performance and academic metrics"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Reports', href: '/reports' },
            { label: 'Academic Analytics' },
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
        title="Academic Analytics"
        description="Student performance and academic metrics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reports', href: '/reports' },
          { label: 'Academic Analytics' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.overallPassRate}%</p>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.averageScore}%</p>
              <p className="text-xs text-muted-foreground">Average Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.topPerformers.length}</p>
              <p className="text-xs text-muted-foreground">Top Performers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Users className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.classWisePerformance.length}</p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <SimplePieChart
          title="Grade Distribution"
          data={analytics.gradeDistribution}
          height={300}
        />

        {/* Subject Performance */}
        <SimpleBarChart
          title="Subject-wise Average Score"
          data={analytics.subjectWisePerformance.map((s) => ({
            label: s.subject,
            value: s.average,
          }))}
          height={300}
          formatValue={(v) => `${v}%`}
        />

        {/* Class Performance */}
        <HorizontalBarChart
          title="Class-wise Average Score"
          data={analytics.classWisePerformance.map((c) => ({
            label: c.class,
            value: c.average,
          }))}
          height={350}
          formatValue={(v) => `${v}%`}
        />

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performers</CardTitle>
            <CardDescription>Students with highest scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPerformers.map((student, index) => (
                <div
                  key={student.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.class}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {student.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Pass Rates */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Subject-wise Pass Rates</CardTitle>
          <CardDescription>Percentage of students passing each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analytics.subjectWisePerformance.map((subject) => (
              <div
                key={subject.subject}
                className="p-4 rounded-lg border text-center"
              >
                <p className="text-2xl font-bold">{subject.passRate}%</p>
                <p className="text-sm text-muted-foreground truncate">{subject.subject}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
