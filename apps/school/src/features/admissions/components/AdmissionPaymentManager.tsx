import { useState } from 'react'
import { IndianRupee, ChevronDown, ChevronRight, CreditCard, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAdmissionPayments, useRecordPayment } from '../hooks/useAdmissions'
import type { AdmissionPayment, RecordPaymentRequest } from '../types/admission.types'

const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Online', label: 'Online' },
  { value: 'NEFT', label: 'NEFT' },
]

const STATUS_BADGE_STYLES: Record<AdmissionPayment['status'], { className: string; label: string }> = {
  pending: { className: 'bg-red-100 text-red-700', label: 'Pending' },
  partial: { className: 'bg-yellow-100 text-yellow-700', label: 'Partial' },
  paid: { className: 'bg-green-100 text-green-700', label: 'Paid' },
  waived: { className: 'bg-gray-100 text-gray-700', label: 'Waived' },
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function AdmissionPaymentManager() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<AdmissionPayment | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [transactionId, setTransactionId] = useState('')

  const { data: paymentsResponse, isLoading } = useAdmissionPayments(
    statusFilter !== 'all' ? statusFilter : undefined
  )
  const payments = paymentsResponse?.data ?? []
  const recordPayment = useRecordPayment()

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      payment.studentName.toLowerCase().includes(query) ||
      payment.applicationId.toLowerCase().includes(query) ||
      payment.class.toLowerCase().includes(query)
    )
  })

  const totalPending = payments
    .filter((p) => p.status === 'pending' || p.status === 'partial')
    .reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0)

  const totalCollected = payments.reduce((sum, p) => sum + p.paidAmount, 0)

  const pendingCount = payments.filter((p) => p.status === 'pending' || p.status === 'partial').length

  const handleOpenPaymentDialog = (payment: AdmissionPayment) => {
    setSelectedPayment(payment)
    setPaymentAmount('')
    setPaymentMethod('')
    setTransactionId('')
    setPaymentDialogOpen(true)
  }

  const handleRecordPayment = () => {
    if (!selectedPayment || !paymentAmount || !paymentMethod) return

    const request: RecordPaymentRequest = {
      applicationId: selectedPayment.applicationId,
      amount: parseFloat(paymentAmount),
      paymentMethod,
      transactionId: transactionId || undefined,
    }

    recordPayment.mutate(request, {
      onSuccess: () => {
        setPaymentDialogOpen(false)
        setSelectedPayment(null)
        setPaymentAmount('')
        setPaymentMethod('')
        setTransactionId('')
      },
    })
  }

  const handleToggleRow = (paymentId: string) => {
    setExpandedRowId(expandedRowId === paymentId ? null : paymentId)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <IndianRupee className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatINR(totalPending)}</div>
            <p className="text-xs text-muted-foreground">Across all pending payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatINR(totalCollected)}</div>
            <p className="text-xs text-muted-foreground">Total fees collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Count</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Payments awaiting collection</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, application ID, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="waived">Waived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]" />
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const statusStyle = STATUS_BADGE_STYLES[payment.status]
                  const balance = payment.totalAmount - payment.paidAmount
                  const isExpanded = expandedRowId === payment.id

                  return (
                    <PaymentRow
                      key={payment.id}
                      payment={payment}
                      statusStyle={statusStyle}
                      balance={balance}
                      isExpanded={isExpanded}
                      onToggleExpand={() => handleToggleRow(payment.id)}
                      onRecordPayment={() => handleOpenPaymentDialog(payment)}
                    />
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {selectedPayment && (
                <>
                  Record payment for <strong>{selectedPayment.studentName}</strong> (
                  {selectedPayment.class}). Balance:{' '}
                  <strong>{formatINR(selectedPayment.totalAmount - selectedPayment.paidAmount)}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min={1}
                max={selectedPayment ? selectedPayment.totalAmount - selectedPayment.paidAmount : undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-id">Transaction ID (Optional)</Label>
              <Input
                id="transaction-id"
                placeholder="Enter transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={!paymentAmount || !paymentMethod || recordPayment.isPending}
            >
              {recordPayment.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PaymentRowProps {
  payment: AdmissionPayment
  statusStyle: { className: string; label: string }
  balance: number
  isExpanded: boolean
  onToggleExpand: () => void
  onRecordPayment: () => void
}

function PaymentRow({
  payment,
  statusStyle,
  balance,
  isExpanded,
  onToggleExpand,
  onRecordPayment,
}: PaymentRowProps) {
  return (
    <>
      <TableRow className="cursor-pointer" onClick={onToggleExpand}>
        <TableCell>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium">{payment.studentName}</p>
            <p className="text-xs text-muted-foreground">{payment.applicationId}</p>
          </div>
        </TableCell>
        <TableCell>{payment.class}</TableCell>
        <TableCell className="text-right font-medium">{formatINR(payment.totalAmount)}</TableCell>
        <TableCell className="text-right font-medium text-green-600">
          {formatINR(payment.paidAmount)}
        </TableCell>
        <TableCell className="text-right font-medium text-red-600">
          {formatINR(balance)}
        </TableCell>
        <TableCell>
          <Badge className={statusStyle.className}>{statusStyle.label}</Badge>
        </TableCell>
        <TableCell>{formatDate(payment.dueDate)}</TableCell>
        <TableCell className="text-right">
          <Button
            variant="outline"
            size="sm"
            disabled={payment.status === 'paid' || payment.status === 'waived'}
            onClick={(e) => {
              e.stopPropagation()
              onRecordPayment()
            }}
          >
            Record Payment
          </Button>
        </TableCell>
      </TableRow>

      {/* Expanded Fee Breakdown */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={9} className="bg-muted/50 p-0">
            <div className="px-8 py-4">
              <h4 className="text-sm font-semibold mb-3">Fee Breakdown</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Paid Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payment.feeBreakdown.map((fee, index) => (
                    <TableRow key={index}>
                      <TableCell>{fee.feeType}</TableCell>
                      <TableCell className="text-right">{formatINR(fee.amount)}</TableCell>
                      <TableCell>
                        {fee.paid ? (
                          <Badge className="bg-green-100 text-green-700">Paid</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">Unpaid</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {payment.receiptNumber && (
                <p className="text-xs text-muted-foreground mt-3">
                  Receipt: {payment.receiptNumber}
                </p>
              )}
              {payment.paymentDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last Payment: {formatDate(payment.paymentDate)}
                  {payment.paymentMethod && ` via ${payment.paymentMethod}`}
                  {payment.transactionId && ` (Txn: ${payment.transactionId})`}
                </p>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
