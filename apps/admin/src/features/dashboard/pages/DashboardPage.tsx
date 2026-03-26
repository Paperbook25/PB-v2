import { useQuery } from '@tanstack/react-query'
import {
  School,
  Users,
  Activity,
  TrendingUp,
  Loader2,
  AlertCircle,
  IndianRupee,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { adminApi } from '../../../lib/api'
import { StatCard } from '../../../components/shared/StatCard'
import { format } from 'date-fns'

export function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: adminApi.getStats,
  })

  const growthQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'growth'],
    queryFn: adminApi.getGrowth,
  })

  const addonQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'addons'],
    queryFn: adminApi.getAddonPopularity,
  })

  const activityQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'activity'],
    queryFn: adminApi.getActivity,
  })

  const subAnalyticsQuery = useQuery({
    queryKey: ['admin', 'subscriptions', 'analytics'],
    queryFn: adminApi.getSubscriptionAnalytics,
  })

  const stats = statsQuery.data
  const growth = growthQuery.data || []
  const addons = addonQuery.data || []
  const activities = activityQuery.data || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Platform overview and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      {statsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex h-[120px] items-center justify-center rounded-lg border bg-card">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ))}
        </div>
      ) : statsQuery.isError ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load dashboard stats
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Schools"
            value={stats?.totalSchools ?? 0}
            icon={School}
            trend={stats?.schoolsTrend ? { value: stats.schoolsTrend, label: 'this month' } : undefined}
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={Users}
            trend={stats?.usersTrend ? { value: stats.usersTrend, label: 'this month' } : undefined}
          />
          <StatCard
            title="Active Schools"
            value={stats?.activeSchools ?? 0}
            icon={Activity}
            trend={stats?.activeTrend ? { value: stats.activeTrend, label: 'this month' } : undefined}
          />
          <StatCard
            title="MRR"
            value={subAnalyticsQuery.data?.mrr ? `₹${subAnalyticsQuery.data.mrr >= 1000 ? `${(subAnalyticsQuery.data.mrr / 1000).toFixed(1)}K` : subAnalyticsQuery.data.mrr}` : '₹0'}
            icon={IndianRupee}
            trend={subAnalyticsQuery.data?.activeCount ? { value: subAnalyticsQuery.data.activeCount, label: 'active subs' } : undefined}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Growth Chart */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">School Growth</h2>
          {growthQuery.isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : growthQuery.isError ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Failed to load growth data
            </div>
          ) : growth.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No growth data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="schools"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Schools"
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Users"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Addon Popularity Chart */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Addon Popularity</h2>
          {addonQuery.isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : addonQuery.isError ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Failed to load addon data
            </div>
          ) : addons.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No addon data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={addons}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  name="Schools Using"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Recent Activity</h2>
        {activityQuery.isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : activityQuery.isError ? (
          <div className="text-sm text-muted-foreground">
            Failed to load activity feed
          </div>
        ) : activities.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <div className="space-y-0">
            {activities.slice(0, 10).map((activity: any, index: number) => (
              <div
                key={activity.id || index}
                className="flex items-start gap-3 border-b border-border py-3 last:border-0"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.userName || 'System'}</span>{' '}
                    {activity.action || activity.description}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {activity.module && (
                      <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase">
                        {activity.module}
                      </span>
                    )}
                    {activity.createdAt
                      ? format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')
                      : activity.timestamp || ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
