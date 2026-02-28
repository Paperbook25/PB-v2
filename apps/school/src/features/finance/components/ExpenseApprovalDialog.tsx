import { useState } from 'react'
import { CheckCircle, XCircle, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useApproveExpense, useRejectExpense, useMarkExpensePaid } from '../hooks/useFinance'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_STATUS_LABELS,
  type Expense,
} from '../types/finance.types'

interface ExpenseApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
}

export function ExpenseApprovalDialog({
  open,
  onOpenChange,
  expense,
}: ExpenseApprovalDialogProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [paymentRef, setPaymentRef] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | 'pay' | null>(null)

  const approveMutation = useApproveExpense()
  const rejectMutation = useRejectExpense()
  const markPaidMutation = useMarkExpensePaid()

  if (!expense) return null

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({ id: expense.id, data: {} })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to approve expense:', error)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return

    try {
      await rejectMutation.mutateAsync({
        id: expense.id,
        data: { reason: rejectionReason },
      })
      setRejectionReason('')
      setAction(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to reject expense:', error)
    }
  }

  const handleMarkPaid = async () => {
    try {
      await markPaidMutation.mutateAsync({
        id: expense.id,
        data: { paymentRef: paymentRef || undefined },
      })
      setPaymentRef('')
      setAction(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to mark expense as paid:', error)
    }
  }

  const handleClose = () => {
    setAction(null)
    setRejectionReason('')
    setPaymentRef('')
    onOpenChange(false)
  }

  const isPending = approveMutation.isPending || rejectMutation.isPending || markPaidMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
          <DialogDescription>
            Review and take action on this expense request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Expense Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Expense Number</p>
                <p className="font-mono font-medium">{expense.expenseNumber}</p>
              </div>
              <Badge variant={expense.status === 'pending_approval' ? 'warning' : 'secondary'}>
                {EXPENSE_STATUS_LABELS[expense.status]}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{EXPENSE_CATEGORY_LABELS[expense.category]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium text-lg">{formatCurrency(expense.amount)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{expense.description}</p>
            </div>

            {expense.vendorName && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vendor</p>
                  <p className="text-sm">{expense.vendorName}</p>
                </div>
                {expense.invoiceNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice No.</p>
                    <p className="text-sm font-mono">{expense.invoiceNumber}</p>
                  </div>
                )}
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Requested by</p>
                <p>{expense.requestedBy}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(expense.requestedAt, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              {expense.approvedBy && (
                <div>
                  <p className="text-muted-foreground">Approved by</p>
                  <p>{expense.approvedBy}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(expense.approvedAt!, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            {expense.rejectionReason && (
              <div className="bg-destructive/10 p-3 rounded border border-destructive/20">
                <p className="text-sm text-muted-foreground">Rejection Reason</p>
                <p className="text-sm text-destructive">{expense.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Action Forms */}
          {action === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Provide a reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {action === 'pay' && (
            <div className="space-y-2">
              <Label htmlFor="paymentRef">Payment Reference (Optional)</Label>
              <Input
                id="paymentRef"
                placeholder="Transaction ID or Reference Number"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {expense.status === 'pending_approval' && !action && (
            <>
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => setAction('reject')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={isPending}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </Button>
            </>
          )}

          {expense.status === 'approved' && !action && (
            <Button onClick={() => setAction('pay')}>
              <Banknote className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          )}

          {action === 'reject' && (
            <>
              <Button variant="outline" onClick={() => setAction(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isPending}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </>
          )}

          {action === 'pay' && (
            <>
              <Button variant="outline" onClick={() => setAction(null)}>
                Cancel
              </Button>
              <Button onClick={handleMarkPaid} disabled={isPending}>
                {markPaidMutation.isPending ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </>
          )}

          {(expense.status === 'paid' || expense.status === 'rejected') && (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
