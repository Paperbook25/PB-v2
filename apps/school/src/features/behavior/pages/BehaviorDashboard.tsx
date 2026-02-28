import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  FileWarning,
  Award,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useBehaviorStats,
  useIncidents,
  useLeaderboard,
} from '../hooks/useBehavior'
import { format } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

// Standardized severity and status colors - consistent with BehaviorMainPage
const severityStyles = {
  minor: { backgroundColor: 'var(--color-status-info-light)', color: 'var(--color-status-info)' },
  moderate: { backgroundColor: 'var(--color-status-warning-light)', color: 'var(--color-status-warning)' },
  major: { backgroundColor: 'var(--color-module-behavior-light)', color: 'var(--color-module-behavior)' },
  critical: { backgroundColor: 'var(--color-status-error-light)', color: 'var(--color-status-error)' },
}

const statusStyles = {
  reported: { backgroundColor: 'var(--color-status-info-light)', color: 'var(--color-status-info)' },
  under_review: { backgroundColor: 'var(--color-status-warning-light)', color: 'var(--color-status-warning)' },
  resolved: { backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' },
  escalated: { backgroundColor: 'var(--color-status-error-light)', color: 'var(--color-status-error)' },
}

export function BehaviorDashboard() {
  const navigate = useNavigate()
  const { data: statsResult, isLoading: statsLoading } = useBehaviorStats()
  const { data: incidentsResult } = useIncidents({ status: 'reported', limit: 5 })
  const { data: leaderboardResult } = useLeaderboard('positive', 5)

  const stats = statsResult?.data
  const recentIncidents = incidentsResult?.data || []
  const topStudents = leaderboardResult?.data || []

  const quickActions = [
    {
      label: 'Report Incident',
      icon: FileWarning,
      href: '/behavior/incidents/new',
      color: 'bg-red-500',
    },
    {
      label: 'Award Points',
      icon: Award,
      href: '/behavior/points/new',
      color: 'bg-green-500',
    },
    {
      label: 'Schedule Detention',
      icon: Clock,
      href: '/behavior/detentions/new',
      color: 'bg-orange-500',
    },
    {
      label: 'View Analytics',
      icon: TrendingUp,
      href: '/behavior/analytics',
      color: 'bg-blue-500',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Behavior & Discipline"
        description="Track student behavior, incidents, and rewards"
        moduleColor="behavior"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Behavior' },
        ]}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => navigate(action.href)}
          >
            <div className={`p-2 rounded-lg ${action.color} text-white`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalIncidents || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Incidents</p>
                  </div>
                  <FileWarning className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalActions || 0}</p>
                    <p className="text-sm text-muted-foreground">Actions Taken</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      +{stats?.totalPositivePoints || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Positive Points</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      -{stats?.totalNegativePoints || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Negative Points</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.detentionStats.scheduled || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Detentions Scheduled</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats?.studentsAtRisk?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">At-Risk Students</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={stats?.incidentsByCategory.filter((c) => c.count > 0) || []}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      value.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
                    }
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Incidents by Severity */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats?.incidentsBySeverity.filter((s) => s.count > 0) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ severity, count }) =>
                      `${severity.charAt(0).toUpperCase() + severity.slice(1)}: ${count}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats?.incidentsBySeverity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Incidents</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/behavior/incidents')}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentIncidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileWarning className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending incidents</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/behavior/incidents/${incident.id}`)}
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {incident.studentName} • {incident.studentClass}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge style={severityStyles[incident.severity]}>
                          {incident.severity}
                        </Badge>
                        <Badge style={statusStyles[incident.status]}>
                          {incident.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(incident.reportedAt), 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Students Leaderboard */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Students (Positive Points)</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/behavior/points')}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No points awarded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0
                            ? 'bg-yellow-500'
                            : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                            ? 'bg-amber-600'
                            : 'bg-blue-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{student.total}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Students */}
      {stats?.studentsAtRisk && stats.studentsAtRisk.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Students Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.studentsAtRisk.map((student) => (
                <div
                  key={student.studentId}
                  className="bg-white p-4 rounded-lg border border-orange-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{student.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.studentClass} - {student.studentSection}
                      </p>
                    </div>
                    <Badge
                      variant={
                        student.behaviorTrend === 'declining' ? 'destructive' : 'secondary'
                      }
                    >
                      {student.behaviorTrend}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Incidents:</span>
                      <span className="ml-1 font-medium">{student.incidentCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active Actions:</span>
                      <span className="ml-1 font-medium">{student.activeActions}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Net Points:</span>
                      <span
                        className={`ml-1 font-medium ${
                          student.netPoints < 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {student.netPoints > 0 ? '+' : ''}
                        {student.netPoints}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
