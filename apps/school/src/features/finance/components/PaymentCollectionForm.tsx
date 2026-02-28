import { useState, useMemo } from 'react'
import { Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useStudentFeesById, useCollectPayment } from '../hooks/useFinance'
import { formatCurrency } from '@/lib/utils'
import {
  PAYMENT_MODES,
  PAYMENT_MODE_LABELS,
  type PaymentMode,
  type Receipt as ReceiptType,
} from '../types/finance.types'
import { StudentFeeSearch } from './StudentFeeSearch'
import { ReceiptView } from './ReceiptView'

interface Student {
  id: string
  name: string
  className: string
  section: string
  admissionNumber: string
}

export function PaymentCollectionForm() {
  const { toast } = useToast()
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedFees, setSelectedFees] = useState<Record<string, number>>({})
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash')
  const [transactionRef, setTransactionRef] = useState('')
  const [remarks, setRemarks] = useState('')
  const [receipt, setReceipt] = useState<ReceiptType | null>(null)

  const { data: feesData, isLoading: feesLoading } = useStudentFeesById(selectedStudent?.id || '')
  const collectMutation = useCollectPayment()

  const pendingFees = useMemo(() => {
    if (!feesData?.data) return []
    return feesData.data.filter(
      (fee) => fee.status !== 'paid' && fee.status !== 'waived'
    )
  }, [feesData])

  const totalSelected = useMemo(() => {
    return Object.values(selectedFees).reduce((sum, amount) => sum + amount, 0)
  }, [selectedFees])

  const handleFeeToggle = (feeId: string, dueAmount: number) => {
    setSelectedFees((prev) => {
      if (prev[feeId] !== undefined) {
        const { [feeId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [feeId]: dueAmount }
    })
  }

  const handleAmountChange = (feeId: string, amount: string, maxAmount: number) => {
    const value = parseFloat(amount) || 0
    setSelectedFees((prev) => ({
      ...prev,
      [feeId]: Math.min(value, maxAmount),
    }))
  }

  const handleCollect = async () => {
    if (!selectedStudent || totalSelected === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select a student and at least one fee to collect.',
        variant: 'destructive',
      })
      return
    }

    // Validate transaction reference for non-cash payments
    if (paymentMode !== 'cash' && !transactionRef.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Transaction reference is required for non-cash payments.',
        variant: 'destructive',
      })
      return
    }

    const payments = Object.entries(selectedFees)
      .filter(([_, amount]) => amount > 0)
      .map(([studentFeeId, amount]) => ({
        studentFeeId,
        amount,
      }))

    try {
      const result = await collectMutation.mutateAsync({
        studentId: selectedStudent.id,
        payments,
        paymentMode,
        transactionRef: transactionRef || undefined,
        remarks: remarks || undefined,
      })

      setReceipt(result.data)
      toast({
        title: 'Payment collected',
        description: `Payment of ${formatCurrency(totalSelected)} has been collected successfully.`,
      })
      // Reset form
      setSelectedFees({})
      setTransactionRef('')
      setRemarks('')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to collect payment',
        variant: 'destructive',
      })
    }
  }

  const handleCloseReceipt = () => {
    setReceipt(null)
    setSelectedStudent(null)
  }

  if (receipt) {
    return <ReceiptView receipt={receipt} onClose={handleCloseReceipt} />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Collect Fee Payment</CardTitle>
          <CardDescription>Search for a student and collect pending fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Search */}
          <div className="space-y-2">
            <Label>
              Student <span className="text-destructive">*</span>
            </Label>
            <StudentFeeSearch
              selectedStudent={selectedStudent}
              onSelect={setSelectedStudent}
            />
          </div>

          {/* Pending Fees */}
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Pending Fees</Label>
                {pendingFees.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {Object.keys(selectedFees).length} of {pendingFees.length} selected
                  </span>
                )}
              </div>

              {feesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : pendingFees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  No pending fees for this student
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {pendingFees.map((fee) => {
                    const dueAmount = fee.totalAmount - fee.discountAmount - fee.paidAmount
                    const isSelected = selectedFees[fee.id] !== undefined

                    return (
                      <div
                        key={fee.id}
                        className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleFeeToggle(fee.id, dueAmount)}
                          />
                          <div>
                            <p className="font-medium">{fee.feeTypeName}</p>
                            <p className="text-xs text-muted-foreground">
                              Total: {formatCurrency(fee.totalAmount)}
                              {fee.discountAmount > 0 && (
                                <span className="text-green-600">
                                  {' '}- {formatCurrency(fee.discountAmount)} discount
                                </span>
                              )}
                              {fee.paidAmount > 0 && (
                                <span>
                                  {' '}- {formatCurrency(fee.paidAmount)} paid
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">Due:</span>
                          {isSelected ? (
                            <Input
                              type="number"
                              min="0"
                              max={dueAmount}
                              value={selectedFees[fee.id] || 0}
                              onChange={(e) =>
                                handleAmountChange(fee.id, e.target.value, dueAmount)
                              }
                              className="w-28 text-right"
                            />
                          ) : (
                            <span className="font-medium text-red-600 w-28 text-right">
                              {formatCurrency(dueAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Payment Details */}
              {pendingFees.length > 0 && (
                <>
                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMode">Payment Mode</Label>
                      <Select
                        value={paymentMode}
                        onValueChange={(v) => setPaymentMode(v as PaymentMode)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_MODES.map((mode) => (
                            <SelectItem key={mode} value={mode}>
                              {PAYMENT_MODE_LABELS[mode]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {paymentMode !== 'cash' && (
                      <div className="space-y-2">
                        <Label htmlFor="transactionRef">
                          Transaction Reference <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="transactionRef"
                          placeholder="Transaction ID / Cheque No."
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks (Optional)</Label>
                    <Input
                      id="remarks"
                      placeholder="Any additional notes"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>

                  {/* Total and Submit */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalSelected)}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      disabled={totalSelected === 0 || collectMutation.isPending}
                      onClick={handleCollect}
                    >
                      {collectMutation.isPending ? (
                        'Processing...'
                      ) : (
                        <>
                          <Receipt className="h-4 w-4 mr-2" />
                          Collect & Generate Receipt
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
