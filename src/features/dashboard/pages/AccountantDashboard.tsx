import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api-client'
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  Calendar,
  ArrowRight,
  Receipt,
  CreditCard,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function AccountantDashboard() {
  const { user } = useAuthStore()

  // Fetch accountant-specific stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'accountant-stats'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/accountant-stats')
      return json.data
    },
  })

  // Fetch today's collection data
  const { data: todayCollection } = useQuery({
    queryKey: ['dashboard', 'today-collection'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/today-collection')
      return json.data
    },
  })

  // Fetch collection trends
  const { data: collectionTrends } = useQuery({
    queryKey: ['dashboard', 'collection-trends'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/collection-trends')
      return json.data
    },
  })

  // Fetch pending dues
  const { data: pendingDues } = useQuery({
    queryKey: ['dashboard', 'pending-dues'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/pending-dues')
      return json.data
    },
  })

  // Fetch recent transactions
  const { data: transactions } = useQuery({
    queryKey: ['dashboard', 'recent-transactions'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/recent-transactions')
      return json.data
    },
  })

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Accountant'}!`}
        description={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} - Finance Overview`}
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
                    <p className="text-sm text-muted-foreground">Today's Collection</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats?.todayCollection || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.todayReceipts || 0} receipts
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-800">
                    <IndianRupee className="h-5 w-5 text-green-600 dark:text-green-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link to="/finance">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Pending</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(stats?.totalPending || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats?.studentsWithDues || 0} students
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-800">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-200" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(stats?.monthCollection || 0)}
                    </p>
                    <div className="flex items-center gap-1 text-xs mt-1">
                      {(stats?.monthGrowth || 0) >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={cn(
                        (stats?.monthGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {stats?.monthGrowth || 0}% vs last month
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-800">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Collection Rate</p>
                    <p className="text-2xl font-bold">{stats?.collectionRate || 0}%</p>
                    <Progress value={stats?.collectionRate || 0} className="mt-2 h-1.5" />
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-800">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Collection Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Collection Trend</CardTitle>
            <CardDescription>Fee collection over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={collectionTrends || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-chart-1)"
                  fill="var(--color-chart-1)"
                  fillOpacity={0.6}
                  name="Collection"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/finance?tab=collection">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-green-500 text-white">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Collect Fee</span>
                </Button>
              </Link>
              <Link to="/finance?tab=payments">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-blue-500 text-white">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <span className="text-xs">View Payments</span>
                </Button>
              </Link>
              <Link to="/finance/online-payments">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-purple-500 text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Online Payments</span>
                </Button>
              </Link>
              <Link to="/finance/escalation">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-orange-500 text-white">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Send Reminders</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Dues & Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Dues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Overdue Payments
              </CardTitle>
              <CardDescription>Students with pending fees</CardDescription>
            </div>
            <Link to="/finance?tab=collection">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingDues?.slice(0, 5).map((due: any) => (
                <div key={due.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{due.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {due.className} - {due.section} | {due.daysOverdue} days overdue
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{formatCurrency(due.amount)}</p>
                    <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
                  </div>
                </div>
              ))}
              {(!pendingDues || pendingDues.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">No overdue payments!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Latest fee collections</CardDescription>
            </div>
            <Link to="/finance?tab=payments">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions?.slice(0, 5).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{tx.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.feeType} | {formatDate(tx.date, { hour: 'numeric', minute: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(tx.amount)}</p>
                    <Badge variant="outline" className="text-[10px]">{tx.mode}</Badge>
                  </div>
                </div>
              ))}
              {(!transactions || transactions.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No transactions today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
