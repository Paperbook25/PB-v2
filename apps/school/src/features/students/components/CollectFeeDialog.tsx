import { useState, useMemo } from 'react'
import { Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useStudentFeesById, useCollectPayment } from '@/features/finance/hooks/useFinance'
import { ReceiptView } from '@/features/finance/components/ReceiptView'
import { formatCurrency } from '@/lib/utils'
import {
  PAYMENT_MODES,
  PAYMENT_MODE_LABELS,
  type PaymentMode,
  type Receipt as ReceiptType,
} from '@/features/finance/types/finance.types'

interface CollectFeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: {
    id: string
    name: string
    className: string
    section: string
    admissionNumber: string
  }
}

export function CollectFeeDialog({ open, onOpenChange, student }: CollectFeeDialogProps) {
  const [selectedFees, setSelectedFees] = useState<Record<string, number>>({})
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash')
  const [transactionRef, setTransactionRef] = useState('')
  const [remarks, setRemarks] = useState('')
  const [receipt, setReceipt] = useState<ReceiptType | null>(null)

  const { data: feesData, isLoading: feesLoading } = useStudentFeesById(student.id)
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
    if (totalSelected === 0) return

    const payments = Object.entries(selectedFees)
      .filter(([_, amount]) => amount > 0)
      .map(([studentFeeId, amount]) => ({
        studentFeeId,
        amount,
      }))

    try {
      const result = await collectMutation.mutateAsync({
        studentId: student.id,
        payments,
        paymentMode,
        transactionRef: transactionRef || undefined,
        remarks: remarks || undefined,
      })

      setReceipt(result.data)
      // Reset form
      setSelectedFees({})
      setTransactionRef('')
      setRemarks('')
    } catch (error) {
      console.error('Failed to collect payment:', error)
    }
  }

  const handleCloseReceipt = () => {
    setReceipt(null)
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setSelectedFees({})
      setTransactionRef('')
      setRemarks('')
      setPaymentMode('cash')
      setReceipt(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {receipt ? (
          <ReceiptView receipt={receipt} onClose={handleCloseReceipt} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Collect Fee Payment</DialogTitle>
              <DialogDescription>
                Collecting fees for {student.name} ({student.admissionNumber}) - {student.className} {student.section}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              {/* Pending Fees */}
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
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
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
                          <Label htmlFor="transactionRef">Transaction Reference</Label>
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
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
