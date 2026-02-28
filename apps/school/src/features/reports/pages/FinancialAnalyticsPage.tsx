import { IndianRupee, TrendingUp, TrendingDown, AlertTriangle, CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatCurrency } from '@/lib/utils'
import {
  SimpleAreaChart,
  SimplePieChart,
  SimpleBarChart,
} from '../components/AnalyticsCharts'
import { useFinancialAnalytics } from '../hooks/useReports'

export function FinancialAnalyticsPage() {
  const { data: analyticsData, isLoading } = useFinancialAnalytics()

  const analytics = analyticsData?.data

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Financial Analytics"
          description="Fee collection and financial metrics"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Reports', href: '/reports' },
            { label: 'Financial Analytics' },
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
          title="Financial Analytics"
          description="Fee collection and financial metrics"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Reports', href: '/reports' },
            { label: 'Financial Analytics' },
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
        title="Financial Analytics"
        description="Fee collection and financial metrics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reports', href: '/reports' },
          { label: 'Financial Analytics' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <IndianRupee className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(analytics.totalCollection)}</p>
              <p className="text-xs text-muted-foreground">Total Collection</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(analytics.pendingAmount)}</p>
              <p className="text-xs text-muted-foreground">Pending Fees</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.collectionRate}%</p>
              <p className="text-xs text-muted-foreground">Collection Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <CreditCard className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.defaulterCount}</p>
              <p className="text-xs text-muted-foreground">Fee Defaulters</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection Trend */}
        <SimpleAreaChart
          title="Monthly Collection Trend"
          data={analytics.monthlyCollection.map((m) => ({ label: m.label || m.date, value: m.value }))}
          height={300}
          color="#22c55e"
          formatValue={(v) => formatCurrency(v)}
        />

        {/* Fee Type Breakdown */}
        <SimplePieChart
          title="Fee Type Breakdown"
          data={analytics.feeTypeBreakdown}
          height={300}
        />

        {/* Payment Mode Distribution */}
        <SimplePieChart
          title="Payment Mode Distribution"
          data={analytics.paymentModeDistribution}
          height={300}
        />

        {/* Class-wise Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Class-wise Collection</CardTitle>
            <CardDescription>Collection vs Pending by class group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.classWiseCollection.map((item) => {
              const total = item.collected + item.pending
              const collectionRate = (item.collected / total) * 100

              return (
                <div key={item.class} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.class}</span>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="text-green-600">{formatCurrency(item.collected)}</span>
                      <span className="text-red-600">{formatCurrency(item.pending)}</span>
                    </div>
                  </div>
                  <Progress value={collectionRate} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {collectionRate.toFixed(1)}% collected
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Concession Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(analytics.concessionAmount)}</p>
            <p className="text-sm text-muted-foreground mt-1">Total concession granted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Collection Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={analytics.collectionRate} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{analytics.collectionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">At-Risk Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{analytics.defaulterCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Students with overdue fees</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
