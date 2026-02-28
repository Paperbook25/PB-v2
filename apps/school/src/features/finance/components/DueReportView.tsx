import { Download, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Legend,
} from 'recharts'
import { useDueReport } from '../hooks/useFinance'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#991b1b']

export function DueReportView() {
  const { data, isLoading, error } = useDueReport()

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load due report. Please try again.
      </div>
    )
  }

  const report = data?.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Outstanding Dues Report</h3>
          <p className="text-sm text-muted-foreground">
            Analysis of pending fee payments
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-200" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(report.totalOutstanding)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Outstanding</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-200" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.totalStudentsWithDues}</p>
                    <p className="text-xs text-muted-foreground">Students with Dues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Ageing Buckets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ageing Analysis</CardTitle>
                <CardDescription>Outstanding dues by days overdue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={report.byAgeingBucket.filter(b => b.amount > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="amount"
                      nameKey="bucket"
                    >
                      {report.byAgeingBucket.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {report.byAgeingBucket.map((bucket, index) => (
                    <div key={bucket.bucket} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span>{bucket.bucket}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{bucket.count} students</Badge>
                        <span className="font-medium">{formatCurrency(bucket.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Class */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Class</CardTitle>
                <CardDescription>Outstanding dues distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={report.byClass} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}k`} />
                    <YAxis dataKey="className" type="category" width={80} className="text-xs" />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="amount" fill="var(--color-chart-5)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Defaulters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Defaulters</CardTitle>
              <CardDescription>Students with highest outstanding dues</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead className="text-right">Amount Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.topDefaulters.slice(0, 10).map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.admissionNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.studentClass} - {student.studentSection}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.daysOverdue >= 60
                              ? 'destructive'
                              : student.daysOverdue >= 30
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {student.daysOverdue} days
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {formatCurrency(student.totalDue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
