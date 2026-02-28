import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  BarChart3,
  Calendar,
  Download,
  Clock,
  ChevronRight,
  Plus,
  TrendingUp,
  Users,
  IndianRupee,
  GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { KPICard } from '../components/KPICard'
import { GenerateReportDialog } from '../components/GenerateReportDialog'
import {
  useKPIMetrics,
  useReportTemplates,
  useGeneratedReports,
  useAnalyticsOverview,
} from '../hooks/useReports'
import type { ReportTemplate } from '../types/reports.types'

export function ReportsDashboard() {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)

  const { data: kpisData, isLoading: kpisLoading } = useKPIMetrics()
  const { data: templatesData, isLoading: templatesLoading } = useReportTemplates()
  const { data: reportsData, isLoading: reportsLoading } = useGeneratedReports({ limit: 5 })
  const { data: overviewData, isLoading: overviewLoading } = useAnalyticsOverview()

  const kpis = kpisData?.data || []
  const templates = templatesData?.data?.filter((t) => t.isPopular) || []
  const recentReports = reportsData?.data || []
  const overview = overviewData?.data

  const handleGenerateFromTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    setGenerateDialogOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Generate reports, view analytics, and track key metrics"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Reports' }]}
        moduleColor="reports"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/reports/scheduled">
                <Calendar className="h-4 w-4 mr-2" />
                Scheduled Reports
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/reports/new">
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Link>
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-reports-light)' }}>
                  <Users className="h-5 w-5" style={{ color: 'var(--color-module-reports)' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview?.totalStudents || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-finance-light)' }}>
                  <IndianRupee className="h-5 w-5" style={{ color: 'var(--color-module-finance)' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(overview?.totalRevenue || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Collection</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-attendance-light)' }}>
                  <TrendingUp className="h-5 w-5" style={{ color: 'var(--color-module-attendance)' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview?.attendanceRate || 0}%</p>
                  <p className="text-xs text-muted-foreground">Attendance Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-exams-light)' }}>
                  <GraduationCap className="h-5 w-5" style={{ color: 'var(--color-module-exams)' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overview?.passRate || 0}%</p>
                  <p className="text-xs text-muted-foreground">Pass Rate</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Metrics */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Key Performance Indicators</CardTitle>
                <CardDescription>Real-time metrics across all modules</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/reports/analytics">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {kpis.slice(0, 8).map((kpi) => (
                    <KPICard key={kpi.id} metric={kpi} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Reports */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Reports</CardTitle>
              <CardDescription>Generate popular reports instantly</CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.slice(0, 5).map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                      onClick={() => handleGenerateFromTemplate(template)}
                    >
                      <FileText className="h-4 w-4 mr-2 shrink-0" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {template.category}
                        </p>
                      </div>
                    </Button>
                  ))}
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/reports/templates">
                      View All Templates
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Reports */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Recent Reports</CardTitle>
            <CardDescription>Recently generated reports</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/reports/history">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No reports generated yet. Start by creating a new report.
            </p>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{report.category}</span>
                        <span>•</span>
                        <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        report.status === 'ready'
                          ? 'default'
                          : report.status === 'generating'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {report.status}
                    </Badge>
                    {report.status === 'ready' && report.fileUrl && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Link to="/reports/analytics/academic">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                Academic Analytics
              </CardTitle>
              <CardDescription>
                Performance metrics, grade distribution, and trends
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/reports/analytics/financial">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-green-500" />
                Financial Analytics
              </CardTitle>
              <CardDescription>
                Collection rates, fee breakdown, and payment trends
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/reports/analytics/attendance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Attendance Analytics
              </CardTitle>
              <CardDescription>
                Daily patterns, class-wise analysis, and alerts
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <GenerateReportDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        template={selectedTemplate}
      />
    </div>
  )
}
