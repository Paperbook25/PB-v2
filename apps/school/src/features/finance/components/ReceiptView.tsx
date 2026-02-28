import { Printer, Download, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PAYMENT_MODE_LABELS, type Receipt } from '../types/finance.types'

interface ReceiptViewProps {
  receipt: Receipt
  onClose?: () => void
}

export function ReceiptView({ receipt, onClose }: ReceiptViewProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Card className="print:shadow-none print:border-none">
      <CardHeader className="flex flex-row items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-600">Payment Successful</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* School Header */}
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-bold">Paperbook School</h2>
          <p className="text-sm text-muted-foreground">
            123 Education Lane, Knowledge City - 400001
          </p>
          <p className="text-sm text-muted-foreground">
            Phone: +91 98765 43210 | Email: admin@paperbook.edu
          </p>
        </div>

        {/* Receipt Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">FEE RECEIPT</h3>
            <p className="text-sm text-muted-foreground">
              Receipt No: <span className="font-mono">{receipt.receiptNumber}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">
              {formatDate(receipt.generatedAt, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Student Name</p>
              <p className="font-medium">{receipt.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admission No.</p>
              <p className="font-medium">{receipt.admissionNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Class</p>
              <p className="font-medium">
                {receipt.studentClass} - {receipt.studentSection}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Mode</p>
              <Badge variant="secondary">
                {PAYMENT_MODE_LABELS[receipt.paymentMode]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Fee Details Table */}
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">S.No</TableHead>
                <TableHead>Fee Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipt.payments.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{payment.feeTypeName}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Total */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount Paid</p>
              <p className="text-2xl font-bold">{formatCurrency(receipt.totalAmount)}</p>
            </div>
            {receipt.transactionRef && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Transaction Ref</p>
                <p className="font-mono text-sm">{receipt.transactionRef}</p>
              </div>
            )}
          </div>
        </div>

        {/* Remarks */}
        {receipt.remarks && (
          <div>
            <p className="text-sm text-muted-foreground">Remarks</p>
            <p className="text-sm">{receipt.remarks}</p>
          </div>
        )}

        <Separator />

        {/* Footer */}
        <div className="flex justify-between items-end text-sm text-muted-foreground">
          <div>
            <p>Received by: {receipt.generatedBy}</p>
            <p>
              Generated on:{' '}
              {formatDate(receipt.generatedAt, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="border-t border-dashed pt-2 px-8">
              <p className="text-xs">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Print-only footer */}
        <div className="hidden print:block text-center text-xs text-muted-foreground mt-8">
          <p>This is a computer-generated receipt and does not require a physical signature.</p>
        </div>
      </CardContent>
    </Card>
  )
}
