import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, Clock, Users, Calendar } from 'lucide-react'
import { useVisitorReports, useVisitorStats } from '../hooks/useVisitors'
import { VISIT_PURPOSE_LABELS, type VisitPurpose } from '../types/visitor.types'

export function VisitorReportsPage() {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])

  const { data: reportsResult, isLoading } = useVisitorReports({
    startDate,
    endDate,
  })
  const { data: statsResult } = useVisitorStats()

  const reports = reportsResult?.data || []
  const stats = statsResult?.data

  // Calculate totals
  const totalVisitors = reports.reduce((sum, r) => sum + r.totalVisitors, 0)
  const avgDuration = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.avgDuration, 0) / reports.length)
    : 0

  // Purpose breakdown
  const purposeBreakdown: Record<VisitPurpose, number> = {
    meeting: 0,
    delivery: 0,
    parent_visit: 0,
    vendor: 0,
    interview: 0,
    other: 0,
  }
  reports.forEach((r) => {
    Object.entries(r.byPurpose).forEach(([purpose, count]) => {
      purposeBreakdown[purpose as VisitPurpose] += count
    })
  })

  const getPurposeColor = (purpose: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-blue-500',
      delivery: 'bg-green-500',
      parent_visit: 'bg-purple-500',
      vendor: 'bg-orange-500',
      interview: 'bg-pink-500',
      other: 'bg-gray-500',
    }
    return colors[purpose] || 'bg-gray-500'
  }

  return (
    <div>
      <PageHeader
        title="Visitor Reports"
        description="Analytics and insights on visitor activity"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Visitors', href: '/visitors' },
          { label: 'Reports' },
        ]}
      />

      <div className="space-y-6">
        {/* Date Range */}
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVisitors}</div>
              <p className="text-xs text-muted-foreground">
                In selected period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgDuration}m</div>
              <p className="text-xs text-muted-foreground">Per visit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.length > 0 ? Math.round(totalVisitors / reports.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Visitors per day</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pre-Approved</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.preApprovedActive || 0}</div>
              <p className="text-xs text-muted-foreground">Active passes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Purpose Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>By Purpose</CardTitle>
              <CardDescription>Visitor distribution by purpose</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(purposeBreakdown)
                  .filter(([, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([purpose, count]) => {
                    const percentage = totalVisitors > 0 ? (count / totalVisitors) * 100 : 0
                    return (
                      <div key={purpose}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {VISIT_PURPOSE_LABELS[purpose as VisitPurpose]}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getPurposeColor(purpose)} rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
              <CardDescription>Busiest times for visitor check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.length > 0 && reports[0].peakHours.length > 0 ? (
                  reports[0].peakHours.map((peak, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {peak.hour}:00 - {peak.hour + 1}:00
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {peak.count} visitors
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Breakdown</CardTitle>
            <CardDescription>Day-by-day visitor statistics</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No data available for the selected period
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium">Date</th>
                      <th className="pb-2 text-left font-medium">Total</th>
                      <th className="pb-2 text-left font-medium">Meeting</th>
                      <th className="pb-2 text-left font-medium">Delivery</th>
                      <th className="pb-2 text-left font-medium">Parent</th>
                      <th className="pb-2 text-left font-medium">Vendor</th>
                      <th className="pb-2 text-left font-medium">Avg Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.slice(0, 10).map((report) => (
                      <tr key={report.date} className="border-b last:border-0">
                        <td className="py-3 font-medium">
                          {new Date(report.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-3 font-medium">{report.totalVisitors}</td>
                        <td className="py-3">{report.byPurpose.meeting || 0}</td>
                        <td className="py-3">{report.byPurpose.delivery || 0}</td>
                        <td className="py-3">{report.byPurpose.parent_visit || 0}</td>
                        <td className="py-3">{report.byPurpose.vendor || 0}</td>
                        <td className="py-3">{report.avgDuration}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
