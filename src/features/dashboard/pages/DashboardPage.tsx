import { memo, useMemo, useCallback } from 'react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { Sparkline } from '@/components/ui/sparkline'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorCard } from '@/components/ErrorBoundary'
import { MetricCard } from '@/components/ui/metric-card'
import { DonutChart } from '@/components/ui/donut-chart'
import { ProgressRing } from '@/components/ui/progress-ring'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { quickStatColors, statusColors } from '@/lib/design-tokens'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Sample sparkline data for trends - moved outside component to prevent recreation
const SPARKLINE_DATA: Record<string, number[]> = {
  students: [45, 52, 49, 63, 58, 72, 68],
  staff: [22, 24, 23, 25, 24, 26, 27],
  fees: [150, 180, 165, 210, 195, 240, 220],
  attendance: [92, 88, 94, 91, 89, 93, 91],
}

// Quick actions config - moved outside component to prevent recreation
const QUICK_ACTIONS = [
  { label: 'Add Student', icon: UserPlus, href: '/students/new', color: 'var(--color-module-students)' },
  { label: 'Mark Attendance', icon: ClipboardCheck, href: '/attendance', color: 'var(--color-module-attendance)' },
  { label: 'Collect Fee', icon: IndianRupee, href: '/finance/collection', color: 'var(--color-module-finance)' },
  { label: 'New Admission', icon: GraduationCap, href: '/admissions/new', color: 'var(--color-module-admissions)' },
] as const

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

type StatCardVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange' | 'cyan'

interface StatCardProps {
  title: string
  value: number
  change?: { value: number; trend: 'up' | 'down' }
  icon: React.ElementType
  href?: string
  variant?: StatCardVariant
  prefix?: string
  suffix?: string
  formatFn?: (n: number) => string
  sparklineData?: number[]
  iconColor?: string
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  href,
  variant = 'primary',
  prefix,
  suffix,
  formatFn,
  sparklineData: trendData,
  iconColor,
}: StatCardProps) {
  const content = (
    <div className={cn('stat-card', `stat-card-${variant}`)}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="stat-label">{title}</p>
          <div className="stat-value">
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              formatFn={formatFn}
              duration={1200}
            />
          </div>
          {change && (
            <div className={cn('mt-2', change.trend === 'up' ? 'trend-up' : 'trend-down')}>
              {change.trend === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{change.value}% from last month</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          <div
            className="icon-box text-white"
            style={{ backgroundColor: iconColor || 'var(--color-primary)' }}
          >
            <Icon className="h-5 w-5" />
          </div>
          {trendData && (
            <Sparkline
              data={trendData}
              width={60}
              height={20}
              color={iconColor || 'var(--color-primary)'}
              showArea
            />
          )}
        </div>
      </div>
    </div>
  )

  return href ? <Link to={href} className="block">{content}</Link> : content
}

const QuickActions = memo(function QuickActions() {
  return (
    <div className="flex items-center gap-2">
      {QUICK_ACTIONS.map((action) => (
        <Link key={action.label} to={action.href}>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9 px-3 hover:shadow-md transition-all"
          >
            <div
              className="flex h-5 w-5 items-center justify-center rounded text-white"
              style={{ backgroundColor: action.color }}
            >
              <action.icon className="h-3 w-3" />
            </div>
            <span className="hidden sm:inline text-xs font-medium">{action.label}</span>
          </Button>
        </Link>
      ))}
    </div>
  )
})

// Custom tooltip component for charts - memoized
const ChartTooltip = memo(function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="chart-tooltip">
      <p className="text-sm font-medium mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
})

// Fee Collection Section Component - accepts stats as prop to avoid duplicate query
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
  const targetAmount = 5400000 // 54L target
  const collectionProgress = Math.round((totalCollected / targetAmount) * 100)

  return (
    <>
      <div className="section-header">
        <div className="section-header-bar" style={{ backgroundColor: 'var(--color-module-finance)' }} />
        <h2 className="section-header-title">Fee Collection Overview</h2>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Row 1: Three Metric Cards */}
        <MetricCard
          title="Total Collected"
          value={`₹${formatLakhs(totalCollected)}`}
          trend={{ value: 18, direction: 'up' }}
          icon={<IndianRupee className="h-5 w-5" />}
          variant="amber"
        />

        <MetricCard
          title="Pending Fees"
          value={`₹${formatLakhs(pendingFees)}`}
          trend={{ value: 12, direction: 'down' }}
          icon={<Clock className="h-5 w-5" />}
          variant="rose"
        />

        <MetricCard
          title="Collection Progress"
          value=""
          variant="green"
          className="flex items-center"
        >
          <div className="flex items-center gap-4 mt-2">
            <ProgressRing
              progress={collectionProgress}
              size={80}
              strokeWidth={8}
              color={statusColors.success}
              showPercentage
            />
            <div className="text-xs text-muted-foreground">
              <p>Target: ₹{formatLakhs(targetAmount)}</p>
              <p className="mt-1">Collected: ₹{formatLakhs(totalCollected)}</p>
            </div>
          </div>
        </MetricCard>

        {/* Row 2: Monthly Trend Bar Chart */}
        <Card className="md:col-span-2 lg:col-span-2" style={{ backgroundColor: 'var(--color-module-students-light)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Trend</CardTitle>
            <CardDescription>Fee collection by month</CardDescription>
          </CardHeader>
          <CardContent>
            {feeLoading ? (
              <Skeleton className="h-[180px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={180} className="fee-bar-chart">
                <BarChart data={feeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v / 100000}L`}
                  />
                  <Tooltip
                    content={<ChartTooltip formatter={formatCurrency} />}
                    cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
                  />
                  <Bar
                    dataKey="collected"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    name="Collected"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Donut */}
        <Card style={{ backgroundColor: 'var(--color-status-info-light)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods ? (
              <DonutChart
                data={paymentMethods}
                size={160}
                strokeWidth={16}
                centerValue={`₹${formatLakhs(paymentMethods.reduce((sum: number, p: any) => sum + p.value, 0))}`}
                centerLabel="Total"
                showLegend
                legendPosition="bottom"
              />
            ) : (
              <Skeleton className="h-[200px] w-full" />
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Recent Transactions
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/finance/collection">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTransactions?.slice(0, 4).map((txn: any) => (
                <div key={txn.id} className="transaction-item">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      <span className="text-emerald-600 font-semibold">₹{txn.amount.toLocaleString()}</span>
                      {' '}from {txn.studentName} ({txn.class})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      via {txn.paymentMethod} • {formatRelativeTime(txn.timestamp)}
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
    </>
  )
})

// Quick Stats Section - memoized
const QuickStatsSection = memo(function QuickStatsSection() {
  const { data: quickStats, isLoading } = useQuery({
    queryKey: ['dashboard', 'quick-stats'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/quick-stats')
      return json.data
    },
  })

  const stats = [
    {
      icon: Cake,
      value: quickStats?.todayBirthdays || 0,
      label: 'Birthdays Today',
      color: quickStatColors.birthdays,
    },
    {
      icon: FileText,
      value: quickStats?.pendingLeaveRequests || 0,
      label: 'Leave Requests',
      color: quickStatColors.leaveRequests,
    },
    {
      icon: BookOpen,
      value: quickStats?.overdueBooks || 0,
      label: 'Overdue Books',
      color: quickStatColors.overdueBooks,
    },
    {
      icon: ClipboardCheck,
      value: quickStats?.upcomingExams || 0,
      label: 'Exams This Week',
      color: quickStatColors.exams,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="quick-stat-card">
          <stat.icon className="h-5 w-5 mb-2" style={{ color: stat.color }} />
          <div className="quick-stat-value" style={{ color: stat.color }}>
            {stat.value}
          </div>
          <div className="quick-stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  )
})

export function DashboardPage() {
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
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your school."
        actions={<QuickActions />}
      />

      {/* Quick Stats Row */}
      <QuickStatsSection />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
            <div key={i} className="stat-card stat-card-primary">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Total Students"
              value={stats?.totalStudents || 0}
              change={{ value: 12, trend: 'up' }}
              icon={GraduationCap}
              href="/students"
              variant="primary"
              iconColor="var(--color-module-students)"
              sparklineData={SPARKLINE_DATA.students}
            />
            <StatCard
              title="Total Staff"
              value={stats?.totalStaff || 0}
              change={{ value: 3, trend: 'up' }}
              icon={Users}
              href="/staff"
              variant="success"
              iconColor="var(--color-module-staff)"
              sparklineData={SPARKLINE_DATA.staff}
            />
            <StatCard
              title="Fee Collected"
              value={stats?.totalFeeCollected || 0}
              change={{ value: 8, trend: 'up' }}
              icon={IndianRupee}
              href="/finance"
              variant="warning"
              iconColor="var(--color-module-finance)"
              prefix="₹"
              formatFn={(n) => {
                if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
                if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
                return n.toFixed(0)
              }}
              sparklineData={SPARKLINE_DATA.fees}
            />
            <StatCard
              title="Today's Attendance"
              value={stats?.attendanceToday || 0}
              change={{ value: 2, trend: 'down' }}
              icon={ClipboardCheck}
              href="/attendance"
              variant="orange"
              iconColor="var(--color-module-attendance)"
              suffix="%"
              sparklineData={SPARKLINE_DATA.attendance}
            />
          </>
        )}
      </div>

      {/* Fee Collection Section - Redesigned */}
      <FeeCollectionSection stats={stats} />

      {/* Attendance & Events */}
      <div className="section-header">
        <div className="section-header-bar" style={{ backgroundColor: 'var(--color-module-attendance)' }} />
        <h2 className="section-header-title">Attendance & Events</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Weekly Attendance */}
        <Card style={{ backgroundColor: 'var(--color-module-attendance-light)' }}>
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
            <CardDescription>This week's attendance trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="present" fill="url(#colorAttendance)" name="Present %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card style={{ backgroundColor: 'var(--color-module-communication-light)' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" style={{ color: 'var(--color-module-communication)' }} />
                Announcements
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements?.slice(0, 3).map((item: any) => (
              <div key={item.id} className="space-y-1">
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
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card style={{ backgroundColor: 'var(--color-module-academic-light)' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" style={{ color: 'var(--color-module-academic)' }} />
                Upcoming Events
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {events?.slice(0, 4).map((event: any) => {
              const eventColor = event.type === 'exam'
                ? 'var(--color-module-exams)'
                : event.type === 'meeting'
                ? 'var(--color-module-communication)'
                : event.type === 'holiday'
                ? 'var(--color-module-attendance)'
                : 'var(--color-module-academic)'
              return (
                <div key={event.id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: eventColor }}
                  >
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="section-header">
        <div className="section-header-bar" style={{ backgroundColor: 'var(--color-module-reports)' }} />
        <h2 className="section-header-title">Recent Activity</h2>
      </div>
      <div className="mb-6">
        <Card style={{ backgroundColor: 'var(--color-module-reports-light)' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" style={{ color: 'var(--color-module-reports)' }} />
                Activity Log
              </CardTitle>
              <CardDescription>Latest actions across the system</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities?.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div
                    className="w-2 h-2 mt-2 rounded-full animate-pulse-live"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.action}:</span> {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.user.name} • {formatDate(activity.timestamp, { hour: 'numeric', minute: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
