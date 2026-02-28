import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CheckCircle,
  XCircle,
  Clock,
  GraduationCap,
  TrendingUp,
  Users,
  BarChart3,
  Trophy,
  Globe,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useAdmissionAnalytics } from '../hooks/useAdmissions'
import type { AdmissionAnalytics } from '../types/admission.types'
import { statusColors, moduleColors, chartColors, medalColors } from '@/lib/design-tokens'

function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

function SectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface KpiCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  iconBgColor: string
}

function KpiCard({ title, value, description, icon, iconBgColor }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-md p-2" style={{ backgroundColor: iconBgColor }}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

interface ConversionFunnelProps {
  funnel: AdmissionAnalytics['conversionFunnel']
}

function ConversionFunnel({ funnel }: ConversionFunnelProps) {
  const maxCount = Math.max(...funnel.map((f) => f.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Conversion Funnel
        </CardTitle>
        <CardDescription>Application progression through each stage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnel.map((stage, index) => {
            const widthPercentage = Math.max((stage.count / maxCount) * 100, 2)
            return (
              <div key={stage.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">
                    {stage.count} ({stage.percentage}%)
                  </span>
                </div>
                <div className="relative h-8 w-full rounded-md bg-muted/50 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${widthPercentage}%`,
                      backgroundColor: chartColors[index % chartColors.length],
                    }}
                  >
                    {widthPercentage > 15 && (
                      <span className="text-xs font-medium text-white">{stage.count}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface SourceDistributionProps {
  sources: AdmissionAnalytics['sourceDistribution']
}

function SourceDistribution({ sources }: SourceDistributionProps) {
  function getSourceIcon(source: string) {
    const lower = source.toLowerCase()
    if (lower.includes('website') || lower.includes('online')) return <Globe className="h-4 w-4" />
    if (lower.includes('referral')) return <Users className="h-4 w-4" />
    if (lower.includes('social')) return <TrendingUp className="h-4 w-4" />
    return <Users className="h-4 w-4" />
  }

  const sourceColorStyles = [
    { bg: statusColors.infoLight, text: statusColors.info },
    { bg: statusColors.successLight, text: statusColors.success },
    { bg: moduleColors.integrationsLight, text: moduleColors.integrations },
    { bg: moduleColors.behaviorLight, text: moduleColors.behavior },
    { bg: moduleColors.parentPortalLight, text: moduleColors.parentPortal },
    { bg: moduleColors.libraryLight, text: moduleColors.library },
  ]

  function getSourceColorStyle(index: number) {
    return sourceColorStyles[index % sourceColorStyles.length]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Source Distribution
        </CardTitle>
        <CardDescription>Where applications are coming from</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sources.map((source, index) => (
            <div
              key={source.source}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <div
                className="rounded-md p-2"
                style={{
                  backgroundColor: getSourceColorStyle(index).bg,
                  color: getSourceColorStyle(index).text,
                }}
              >
                {getSourceIcon(source.source)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate capitalize">
                  {source.source.replace(/_/g, ' ')}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg font-bold">{source.count}</span>
                  <Badge variant="secondary" className="text-xs">
                    {source.percentage}%
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface MonthlyTrendTableProps {
  trends: AdmissionAnalytics['monthlyTrend']
}

function MonthlyTrendTable({ trends }: MonthlyTrendTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Monthly Trend
        </CardTitle>
        <CardDescription>Application activity over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Applications</TableHead>
              <TableHead className="text-right">Approvals</TableHead>
              <TableHead className="text-right">Rejections</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trends.map((trend) => (
              <TableRow key={trend.month}>
                <TableCell className="font-medium">{trend.month}</TableCell>
                <TableCell className="text-right">{trend.applications}</TableCell>
                <TableCell className="text-right">
                  <span className="font-medium" style={{ color: statusColors.success }}>{trend.approvals}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium" style={{ color: statusColors.error }}>{trend.rejections}</span>
                </TableCell>
              </TableRow>
            ))}
            {trends.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No trend data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

interface ClassDistributionTableProps {
  distributions: AdmissionAnalytics['classDistribution']
}

function ClassDistributionTable({ distributions }: ClassDistributionTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Class Distribution
        </CardTitle>
        <CardDescription>Application breakdown by class</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead className="text-right">Applications</TableHead>
              <TableHead className="text-right">Approved</TableHead>
              <TableHead className="text-right">Enrolled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {distributions.map((dist) => (
              <TableRow key={dist.class}>
                <TableCell className="font-medium">{dist.class}</TableCell>
                <TableCell className="text-right">{dist.applications}</TableCell>
                <TableCell className="text-right">
                  <span className="font-medium" style={{ color: statusColors.success }}>{dist.approved}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium" style={{ color: statusColors.info }}>{dist.enrolled}</span>
                </TableCell>
              </TableRow>
            ))}
            {distributions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No distribution data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

interface TopPerformersListProps {
  performers: AdmissionAnalytics['topPerformers']
}

function TopPerformersList({ performers }: TopPerformersListProps) {
  function getMedalStyle(index: number): React.CSSProperties {
    if (index === 0) return { backgroundColor: medalColors.goldLight, color: medalColors.gold }
    if (index === 1) return { backgroundColor: medalColors.silverLight, color: medalColors.silver }
    if (index === 2) return { backgroundColor: medalColors.bronzeLight, color: medalColors.bronze }
    return {}
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Performers
        </CardTitle>
        <CardDescription>Highest scoring applicants in entrance exams</CardDescription>
      </CardHeader>
      <CardContent>
        {performers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No performer data available
          </p>
        ) : (
          <div className="space-y-3">
            {performers.map((performer, index) => (
              <div
                key={`${performer.name}-${performer.class}`}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold"
                  style={getMedalStyle(index)}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{performer.name}</p>
                  <p className="text-xs text-muted-foreground">{performer.class}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">{performer.score}</span>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AdmissionAnalyticsView() {
  const { data: analyticsResponse, isLoading } = useAdmissionAnalytics()
  const analytics = analyticsResponse?.data

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admission Analytics</h2>
          <p className="text-muted-foreground">Insights and metrics for the admission process</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admission Analytics</h2>
          <p className="text-muted-foreground">Insights and metrics for the admission process</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">No analytics data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admission Analytics</h2>
        <p className="text-muted-foreground">Insights and metrics for the admission process</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Approval Rate"
          value={`${analytics.approvalRate}%`}
          description="Percentage of applications approved"
          icon={<CheckCircle className="h-4 w-4" style={{ color: statusColors.success }} />}
          iconBgColor={statusColors.successLight}
        />
        <KpiCard
          title="Rejection Rate"
          value={`${analytics.rejectionRate}%`}
          description="Percentage of applications rejected"
          icon={<XCircle className="h-4 w-4" style={{ color: statusColors.error }} />}
          iconBgColor={statusColors.errorLight}
        />
        <KpiCard
          title="Avg Processing Days"
          value={`${analytics.avgProcessingDays}`}
          description="Average days to process an application"
          icon={<Clock className="h-4 w-4" style={{ color: statusColors.info }} />}
          iconBgColor={statusColors.infoLight}
        />
        <KpiCard
          title="Avg Exam Score"
          value={`${analytics.avgExamScore}%`}
          description="Average entrance exam score"
          icon={<GraduationCap className="h-4 w-4" style={{ color: moduleColors.integrations }} />}
          iconBgColor={moduleColors.integrationsLight}
        />
      </div>

      {/* Conversion Funnel and Source Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnel funnel={analytics.conversionFunnel} />
        <SourceDistribution sources={analytics.sourceDistribution} />
      </div>

      {/* Monthly Trend and Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrendTable trends={analytics.monthlyTrend} />
        <ClassDistributionTable distributions={analytics.classDistribution} />
      </div>

      {/* Top Performers */}
      <TopPerformersList performers={analytics.topPerformers} />
    </div>
  )
}
