import { memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api-client'
import {
  GraduationCap,
  Users,
  IndianRupee,
  ClipboardCheck,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Bell,
  Activity,
  ArrowRight,
  CheckCircle2,
  Cake,
  BookOpen,
  FileText,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorCard } from '@/components/ErrorBoundary'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Format relative time - extracted as pure function
function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return formatDate(timestamp, { month: 'short', day: 'numeric' })
}

// Format lakhs - extracted as pure function
function formatLakhs(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(2)}L`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

// Quick actions config - moved outside component to prevent recreation
const QUICK_ACTIONS = [
  { label: 'Add Student', icon: UserPlus, href: '/students/new' },
  { label: 'Mark Attendance', icon: ClipboardCheck, href: '/attendance' },
  { label: 'Collect Fee', icon: IndianRupee, href: '/finance/collection' },
  { label: 'New Admission', icon: GraduationCap, href: '/admissions/new' },
] as const

// Simple stat card for the top row
function StatCard({
  label,
  value,
  change,
  icon: Icon,
  href,
}: {
  label: string
  value: string
  change?: { value: number; trend: 'up' | 'down' }
  icon: React.ElementType
  href?: string
}) {
  const inner = (
    <Card className="p-5 hover:shadow-sm hover:translate-y-0 transition-none">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${change.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
              {change.trend === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {change.trend === 'up' ? '+' : '-'}{change.value}% from last month
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  )

  return href ? <Link to={href} className="block">{inner}</Link> : inner
}

// Quick stat pill for the small info row
function QuickStatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType
  value: number
  label: string
}) {
  return (
    <Card className="p-4 hover:shadow-sm hover:translate-y-0 transition-none">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  )
}

const QuickActions = memo(function QuickActions() {
  return (
    <div className="flex items-center gap-2">
      {QUICK_ACTIONS.map((action) => (
        <Link key={action.label} to={action.href}>
          <button className="inline-flex items-center gap-2 h-9 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            <action.icon className="h-3.5 w-3.5 text-gray-500" />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        </Link>
      ))}
    </div>
  )
})

// Custom tooltip component for charts
const ChartTooltip = memo(function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
      <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm text-gray-600">
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
})

// Fee Collection Section Component
interface FeeCollectionSectionProps {
  stats: {
    totalFeeCollected?: number
    pendingFees?: number
  } | undefined
}

const FeeCollectionSection = memo(function FeeCollectionSection({ stats }: FeeCollectionSectionProps) {
  const { data: feeData, isLoading: feeLoading } = useQuery({
    queryKey: ['dashboard', 'fee-collection'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/fee-collection')
      return json.data
    },
  })

  const { data: paymentMethods } = useQuery({
    queryKey: ['dashboard', 'payment-methods'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/payment-methods')
      return json.data
    },
  })

  const { data: recentTransactions } = useQuery({
    queryKey: ['dashboard', 'fee-transactions'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/fee-transactions')
      return json.data
    },
  })

  const totalCollected = stats?.totalFeeCollected || 0
  const pendingFees = stats?.pendingFees || 0
  const targetAmount = 5400000
  const collectionProgress = Math.round((totalCollected / targetAmount) * 100)

  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Fee Collection Overview</h2>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-4">
        {/* Total Collected */}
        <Card className="p-5 hover:shadow-sm hover:translate-y-0 transition-none">
          <p className="text-sm text-gray-500">Total Collected</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{formatLakhs(totalCollected)}</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +18% from last month
          </p>
        </Card>

        {/* Pending Fees */}
        <Card className="p-5 hover:shadow-sm hover:translate-y-0 transition-none">
          <p className="text-sm text-gray-500">Pending Fees</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{formatLakhs(pendingFees)}</p>
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            -12% from last month
          </p>
        </Card>

        {/* Collection Progress */}
        <Card className="p-5 hover:shadow-sm hover:translate-y-0 transition-none">
          <p className="text-sm text-gray-500">Collection Progress</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{collectionProgress}%</p>
          <div className="mt-2">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${Math.min(collectionProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">Collected: {formatLakhs(totalCollected)}</span>
              <span className="text-xs text-gray-400">Target: {formatLakhs(targetAmount)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Monthly Trend Chart */}
        <Card className="lg:col-span-2 hover:shadow-sm hover:translate-y-0 transition-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Monthly Trend</CardTitle>
            <p className="text-xs text-gray-500">Fee collection by month</p>
          </CardHeader>
          <CardContent>
            {feeLoading ? (
              <Skeleton className="h-[180px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={feeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v / 100000}L`}
                  />
                  <Tooltip
                    content={<ChartTooltip formatter={formatCurrency} />}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  />
                  <Bar
                    dataKey="collected"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    name="Collected"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="hover:shadow-sm hover:translate-y-0 transition-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods ? (
              <div className="space-y-3">
                {paymentMethods.map((method: any) => {
                  const total = paymentMethods.reduce((sum: number, p: any) => sum + p.value, 0)
                  const pct = total > 0 ? Math.round((method.value / total) * 100) : 0
                  return (
                    <div key={method.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{method.name}</span>
                        <span className="text-sm font-medium text-gray-900">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: method.color || '#6366f1',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatLakhs(paymentMethods.reduce((sum: number, p: any) => sum + p.value, 0))}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <Skeleton className="h-[200px] w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mt-4 hover:shadow-sm hover:translate-y-0 transition-none">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-gray-400" />
            Recent Transactions
          </CardTitle>
          <Link
            to="/finance/collection"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {recentTransactions?.slice(0, 4).map((txn: any) => (
              <div key={txn.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{formatLakhs(txn.amount)}</span>
                    {' '}from {txn.studentName} ({txn.class})
                  </p>
                  <p className="text-xs text-gray-500">
                    via {txn.paymentMethod} -- {formatRelativeTime(txn.timestamp)}
                  </p>
                </div>
              </div>
            )) || (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

// Quick Stats Section
const QuickStatsSection = memo(function QuickStatsSection() {
  const { data: quickStats, isLoading } = useQuery({
    queryKey: ['dashboard', 'quick-stats'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/quick-stats')
      return json.data
    },
  })

  const stats = [
    { icon: Cake, value: quickStats?.todayBirthdays || 0, label: 'Birthdays Today' },
    { icon: FileText, value: quickStats?.pendingLeaveRequests || 0, label: 'Leave Requests' },
    { icon: BookOpen, value: quickStats?.overdueBooks || 0, label: 'Overdue Books' },
    { icon: ClipboardCheck, value: quickStats?.upcomingExams || 0, label: 'Exams This Week' },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <QuickStatPill key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} />
      ))}
    </div>
  )
})

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const userName = user?.name?.split(' ')[0] || 'there'

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/stats')
      return json.data
    },
  })

  const { data: attendanceData } = useQuery({
    queryKey: ['dashboard', 'attendance'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/attendance')
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

  const { data: events } = useQuery({
    queryKey: ['dashboard', 'events'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/events')
      return json.data
    },
  })

  const { data: activities } = useQuery({
    queryKey: ['dashboard', 'activities'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/activities')
      return json.data
    },
  })

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${userName}`}
        actions={<QuickActions />}
      />

      {/* Quick Stats Row */}
      <QuickStatsSection />

      {/* Main Stats Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsError ? (
          <div className="col-span-full">
            <ErrorCard
              title="Failed to load stats"
              message="Unable to fetch dashboard statistics. Please try again."
              onRetry={() => refetchStats()}
            />
          </div>
        ) : statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 hover:shadow-sm hover:translate-y-0 transition-none">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-20" />
            </Card>
          ))
        ) : (
          <>
            <StatCard
              label="Total Students"
              value={String(stats?.totalStudents || 0)}
              change={{ value: 12, trend: 'up' }}
              icon={GraduationCap}
              href="/students"
            />
            <StatCard
              label="Total Staff"
              value={String(stats?.totalStaff || 0)}
              change={{ value: 3, trend: 'up' }}
              icon={Users}
              href="/staff"
            />
            <StatCard
              label="Fee Collected"
              value={`${formatLakhs(stats?.totalFeeCollected || 0)}`}
              change={{ value: 8, trend: 'up' }}
              icon={IndianRupee}
              href="/finance"
            />
            <StatCard
              label="Today's Attendance"
              value={`${stats?.attendanceToday || 0}%`}
              change={{ value: 2, trend: 'down' }}
              icon={ClipboardCheck}
              href="/attendance"
            />
          </>
        )}
      </div>

      {/* Fee Collection Section */}
      <FeeCollectionSection stats={stats} />

      {/* Attendance & Events */}
      <h2 className="text-base font-semibold text-gray-900 mb-4">Attendance & Events</h2>
      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        {/* Weekly Attendance */}
        <Card className="hover:shadow-sm hover:translate-y-0 transition-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Weekly Attendance</CardTitle>
            <p className="text-xs text-gray-500">This week's attendance trend</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                <Bar dataKey="present" fill="#6366f1" name="Present %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="hover:shadow-sm hover:translate-y-0 transition-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-400" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {announcements?.slice(0, 3).map((item: any) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.priority === 'high' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700">
                        {item.priority}
                      </span>
                    )}
                    {item.priority === 'medium' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700">
                        {item.priority}
                      </span>
                    )}
                    {item.priority === 'low' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-600">
                        {item.priority}
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-900 truncate">{item.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="hover:shadow-sm hover:translate-y-0 transition-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {events?.slice(0, 4).map((event: any) => (
                <div key={event.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-xs font-semibold text-gray-900 leading-none">
                      {new Date(event.date).getDate()}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase leading-none mt-0.5">
                      {new Date(event.date).toLocaleString('en', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(event.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <Card className="mb-6 hover:shadow-sm hover:translate-y-0 transition-none">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-400" />
            Activity Log
          </CardTitle>
          <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View All
            <ArrowRight className="h-3 w-3" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {activities?.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-indigo-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.action}:</span>{' '}
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activity.user.name} -- {formatDate(activity.timestamp, { hour: 'numeric', minute: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
