import { useState } from 'react'
import { Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
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
import { useCollectionReport } from '../hooks/useFinance'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PAYMENT_MODE_LABELS, type PaymentMode } from '../types/finance.types'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function CollectionReportView() {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [dateFrom, setDateFrom] = useState<Date>(thirtyDaysAgo)
  const [dateTo, setDateTo] = useState<Date>(today)

  const { data, isLoading, error } = useCollectionReport(
    dateFrom.toISOString(),
    dateTo.toISOString()
  )

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load collection report. Please try again.
      </div>
    )
  }

  const report = data?.data

  const paymentModeData = report
    ? Object.entries(report.byPaymentMode)
        .filter(([_, value]) => value > 0)
        .map(([mode, value]) => ({
          name: PAYMENT_MODE_LABELS[mode as PaymentMode],
          value,
        }))
    : []

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">From:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(dateFrom.toISOString(), { month: 'short', day: 'numeric', year: 'numeric' })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dateFrom}
                onSelect={(date: Date | undefined) => date && setDateFrom(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">To:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(dateTo.toISOString(), { month: 'short', day: 'numeric', year: 'numeric' })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dateTo}
                onSelect={(date: Date | undefined) => date && setDateTo(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-[250px] w-full" />
            <Skeleton className="h-[250px] w-full" />
          </div>
        </div>
      ) : report ? (
        <>
          {/* Total Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total Collection</CardTitle>
              <CardDescription>
                {formatDate(dateFrom.toISOString(), { month: 'long', day: 'numeric' })} -{' '}
                {formatDate(dateTo.toISOString(), { month: 'long', day: 'numeric', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(report.totalCollected)}
              </p>
            </CardContent>
          </Card>

          {/* Daily Collection Chart */}
          {report.dailyCollections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Collection Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={report.dailyCollections}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tickFormatter={(value) =>
                        formatDate(value, { month: 'short', day: 'numeric' })
                      }
                    />
                    <YAxis
                      className="text-xs"
                      tickFormatter={(v) => `₹${v / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) =>
                        formatDate(label, { month: 'long', day: 'numeric', year: 'numeric' })
                      }
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="var(--color-chart-1)"
                      name="Collection"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* By Payment Mode */}
            {paymentModeData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">By Payment Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={paymentModeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {paymentModeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* By Fee Type */}
            {report.byFeeType.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">By Fee Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fee Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.byFeeType.slice(0, 5).map((item) => (
                        <TableRow key={item.feeTypeName}>
                          <TableCell>{item.feeTypeName}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          {/* By Class */}
          {report.byClass.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Collection by Class</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={report.byClass} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}k`} />
                    <YAxis dataKey="className" type="category" width={80} className="text-xs" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  )
}
