import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  School,
  Users,
  Activity,
  TrendingUp,
  Loader2,
  AlertCircle,
  IndianRupee,
  Plus,
  Trash2,
  GripVertical,
  Settings2,
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

  const queryClient = useQueryClient()
  const [showCustomize, setShowCustomize] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [widgetForm, setWidgetForm] = useState({ title: '', type: 'stat_card', dataSource: 'schools', width: 1 })

  const widgetsQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'widgets'],
    queryFn: adminApi.listWidgets,
  })

  const createWidgetMutation = useMutation({
    mutationFn: (data: any) => adminApi.createWidget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'widgets'] })
      setShowAddWidget(false)
      setWidgetForm({ title: '', type: 'stat_card', dataSource: 'schools', width: 1 })
    },
  })

  const deleteWidgetMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteWidget(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'widgets'] }),
  })

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => adminApi.reorderWidgets(ids),
  })

  const dragItemRef = useRef<string | null>(null)
  const [localWidgetOrder, setLocalWidgetOrder] = useState<string[] | null>(null)

  const stats = statsQuery.data
  const growth = growthQuery.data || []
  const addons = addonQuery.data || []
  const activities = activityQuery.data || []
  const rawWidgets: any[] = widgetsQuery.data || []
  const widgets = localWidgetOrder
    ? localWidgetOrder.map((id) => rawWidgets.find((w) => w.id === id)).filter(Boolean)
    : rawWidgets

  // Map dataSource keys to live values from already-loaded queries
  const LIVE_WIDGET_VALUES: Record<string, string> = {
    schools: stats?.totalSchools?.toString() ?? '—',
    active_schools: stats?.activeSchools?.toString() ?? '—',
    users: stats?.totalUsers?.toString() ?? '—',
    mrr: subAnalyticsQuery.data?.mrr
      ? `₹${(subAnalyticsQuery.data.mrr / 1000).toFixed(1)}K`
      : stats?.monthlyRevenue
        ? `₹${(stats.monthlyRevenue / 1000).toFixed(1)}K`
        : '—',
    trials: subAnalyticsQuery.data?.trialCount?.toString() ?? '—',
    revenue: stats?.monthlyRevenue ? `₹${(stats.monthlyRevenue / 1000).toFixed(1)}K` : '—',
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform overview and key metrics</p>
        </div>
        <button
          onClick={() => setShowCustomize(!showCustomize)}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" />
          {showCustomize ? 'Done' : 'Customize'}
        </button>
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
            value={(() => {
              const mrr = subAnalyticsQuery.data?.mrr || stats?.monthlyRevenue || 0
              if (mrr >= 100000) return `₹${(mrr / 100000).toFixed(1)}L`
              if (mrr >= 1000) return `₹${(mrr / 1000).toFixed(1)}K`
              return `₹${mrr}`
            })()}
            icon={IndianRupee}
            trend={subAnalyticsQuery.data?.trialCount ? { value: subAnalyticsQuery.data.activeCount + subAnalyticsQuery.data.trialCount, label: 'total subs' } : undefined}
          />
        </div>
      )}

      {/* Custom Widgets */}
      {widgets.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {widgets.map((widget: any) => (
            <div
              key={widget.id}
              className="rounded-lg border bg-card p-4 relative"
              draggable={showCustomize}
              onDragStart={() => { dragItemRef.current = widget.id }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!dragItemRef.current || dragItemRef.current === widget.id) return
                const currentOrder = localWidgetOrder ?? rawWidgets.map((w) => w.id)
                const fromIdx = currentOrder.indexOf(dragItemRef.current)
                const toIdx = currentOrder.indexOf(widget.id)
                const newOrder = [...currentOrder]
                newOrder.splice(fromIdx, 1)
                newOrder.splice(toIdx, 0, dragItemRef.current)
                setLocalWidgetOrder(newOrder)
                reorderMutation.mutate(newOrder)
                dragItemRef.current = null
              }}
            >
              {showCustomize && (
                <>
                  <GripVertical className="absolute top-2 left-2 h-3.5 w-3.5 text-muted-foreground/50 cursor-grab" />
                  <button
                    onClick={() => deleteWidgetMutation.mutate(widget.id)}
                    className="absolute top-2 right-2 rounded-md p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              )}
              <p className="text-xs text-muted-foreground">{widget.title}</p>
              <p className="text-lg font-bold mt-1">{LIVE_WIDGET_VALUES[widget.dataSource] ?? widget.dataSource}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{widget.type.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      )}

      {showCustomize && (
        <button
          onClick={() => setShowAddWidget(true)}
          className="w-full rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Widget
        </button>
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
      {showAddWidget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAddWidget(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Add Widget</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                <input value={widgetForm.title} onChange={e => setWidgetForm({...widgetForm, title: e.target.value})} placeholder="Widget title" className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                <select value={widgetForm.type} onChange={e => setWidgetForm({...widgetForm, type: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                  <option value="stat_card">Stat Card</option>
                  <option value="line_chart">Line Chart</option>
                  <option value="bar_chart">Bar Chart</option>
                  <option value="table">Table</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Data Source</label>
                <select value={widgetForm.dataSource} onChange={e => setWidgetForm({...widgetForm, dataSource: e.target.value})} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                  <option value="schools">Schools Count</option>
                  <option value="users">Users Count</option>
                  <option value="revenue">Revenue</option>
                  <option value="tickets">Open Tickets</option>
                  <option value="leads">Active Leads</option>
                  <option value="subscriptions">Active Subscriptions</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowAddWidget(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button
                onClick={() => createWidgetMutation.mutate({ title: widgetForm.title, type: widgetForm.type, dataSource: widgetForm.dataSource, config: '{}', width: widgetForm.width })}
                disabled={!widgetForm.title || createWidgetMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg disabled:opacity-50"
              >
                {createWidgetMutation.isPending ? 'Adding...' : 'Add Widget'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
