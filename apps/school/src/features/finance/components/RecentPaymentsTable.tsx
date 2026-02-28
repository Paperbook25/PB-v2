import { useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { usePayments, useReceipt } from '../hooks/useFinance'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  PAYMENT_MODES,
  PAYMENT_MODE_LABELS,
  type PaymentMode,
} from '../types/finance.types'
import { ReceiptView } from './ReceiptView'
import { Pagination } from '@/components/ui/pagination'

export function RecentPaymentsTable() {
  const [search, setSearch] = useState('')
  const [paymentMode, setPaymentMode] = useState<PaymentMode | 'all'>('all')
  const [page, setPage] = useState(1)
  const [selectedReceiptNumber, setSelectedReceiptNumber] = useState<string | null>(null)

  const { data, isLoading, error } = usePayments({
    search: search || undefined,
    paymentMode: paymentMode !== 'all' ? paymentMode : undefined,
    page,
    limit: 10,
  })

  const { data: receiptData } = useReceipt(selectedReceiptNumber || '')

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load payments. Please try again.
      </div>
    )
  }

  const payments = data?.data || []
  const pagination = data?.meta

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, receipt no..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={paymentMode}
          onValueChange={(v) => {
            setPaymentMode(v as PaymentMode | 'all')
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            {PAYMENT_MODES.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {PAYMENT_MODE_LABELS[mode]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No.</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                </TableRow>
              ))
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">
                    {payment.receiptNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.studentClass} - {payment.studentSection}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{payment.feeTypeName}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {PAYMENT_MODE_LABELS[payment.paymentMode]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(payment.collectedAt, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedReceiptNumber(payment.receiptNumber)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Receipt Dialog */}
      <Dialog
        open={!!selectedReceiptNumber && !!receiptData?.data}
        onOpenChange={() => setSelectedReceiptNumber(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {receiptData?.data && (
            <ReceiptView
              receipt={receiptData.data}
              onClose={() => setSelectedReceiptNumber(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
