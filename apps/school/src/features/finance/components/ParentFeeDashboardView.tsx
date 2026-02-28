import { IndianRupee, Users, AlertCircle, Receipt, Download, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useParentFeeDashboard } from '../hooks/useFinance'
import { useAuthStore } from '@/stores/useAuthStore'
import { PAYMENT_STATUS_LABELS, PAYMENT_MODE_LABELS, type PaymentStatus, type PaymentMode } from '../types/finance.types'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export function ParentFeeDashboardView() {
  const { data: result, isLoading } = useParentFeeDashboard()
  const { user } = useAuthStore()
  const isStudent = user?.role === 'student'
  const dashboard = result?.data

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (!dashboard) {
    return (
      <Card><CardContent className="py-12 text-center text-muted-foreground">No fee data available.</CardContent></Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800">
              <IndianRupee className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboard.totalPaid)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-800">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pending</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboard.totalPending)}</p>
            </div>
          </CardContent>
        </Card>
        {!isStudent && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Children</p>
                <p className="text-2xl font-bold">{dashboard.children.length}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {isStudent && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Academic Year</p>
                <p className="text-2xl font-bold">2024-25</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Per-Child Overview */}
      {dashboard.children.map(child => (
        <Card key={child.studentId}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{child.studentName}</CardTitle>
              <Badge variant="outline">{child.className} - {child.section}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <Progress value={child.paymentPercentage} className="flex-1 h-2" />
              <span className="text-sm font-medium">{child.paymentPercentage}% paid</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-sm mb-3">
              <div><span className="text-muted-foreground">Total:</span> <span className="font-medium">{formatCurrency(child.totalFees)}</span></div>
              <div><span className="text-muted-foreground">Paid:</span> <span className="font-medium text-green-600">{formatCurrency(child.paidAmount)}</span></div>
              <div><span className="text-muted-foreground">Pending:</span> <span className="font-medium text-red-600">{formatCurrency(child.pendingAmount)}</span></div>
              <div><span className="text-muted-foreground">Discount:</span> <span className="font-medium text-blue-600">{formatCurrency(child.discountAmount)}</span></div>
            </div>
            {child.fees.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {child.fees.slice(0, 5).map(fee => (
                    <TableRow key={fee.id}>
                      <TableCell>{fee.feeTypeName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(fee.totalAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(fee.paidAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(fee.totalAmount - fee.paidAmount - fee.discountAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={fee.status === 'paid' ? 'default' : fee.status === 'overdue' ? 'destructive' : 'secondary'}>
                          {PAYMENT_STATUS_LABELS[fee.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Upcoming Dues */}
      {dashboard.upcomingDues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {dashboard.upcomingDues.map((due, i) => (
                <div key={i} className={`border rounded-lg p-3 ${
                  due.daysUntilDue < 7 ? 'border-red-300 bg-red-50 dark:bg-red-800 dark:border-red-700' :
                  due.daysUntilDue < 30 ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-800 dark:border-yellow-700' :
                  'border-green-300 bg-green-50 dark:bg-green-800 dark:border-green-700'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{due.feeTypeName}</span>
                    <span className="text-sm font-bold">{formatCurrency(due.amount)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{due.studentName}</p>
                  <p className="text-xs mt-1">
                    Due: {due.dueDate} ({due.daysUntilDue > 0 ? `${due.daysUntilDue} days` : 'Overdue'})
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payments */}
      {dashboard.recentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.recentPayments.slice(0, 10).map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.collectedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono text-xs">{payment.receiptNumber}</TableCell>
                    <TableCell>{payment.feeTypeName}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell><Badge variant="outline">{PAYMENT_MODE_LABELS[payment.paymentMode]}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Downloadable Receipts */}
      {dashboard.downloadableReceipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboard.downloadableReceipts.map(receipt => (
                <div key={receipt.receiptNumber} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-mono text-sm">{receipt.receiptNumber}</span>
                      <p className="text-xs text-muted-foreground">{receipt.studentName} &middot; {new Date(receipt.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(receipt.amount)}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
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
