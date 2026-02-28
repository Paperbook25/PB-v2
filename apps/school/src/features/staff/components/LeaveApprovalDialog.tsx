import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import { LEAVE_TYPE_LABELS, type LeaveRequest } from '../types/staff.types'

interface LeaveApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: LeaveRequest | null
  onApprove: () => void
  onReject: (reason: string) => void
  isProcessing?: boolean
}

export function LeaveApprovalDialog({
  open,
  onOpenChange,
  request,
  onApprove,
  onReject,
  isProcessing,
}: LeaveApprovalDialogProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!request) return null

  const handleApprove = () => {
    onApprove()
    setShowRejectForm(false)
    setRejectionReason('')
  }

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason.trim())
      setShowRejectForm(false)
      setRejectionReason('')
    }
  }

  const handleClose = () => {
    setShowRejectForm(false)
    setRejectionReason('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
          <DialogDescription>Review and take action on this leave request.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Request Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Staff Member</p>
              <p className="font-medium">{request.staffName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Leave Type</p>
              <Badge variant="secondary">{LEAVE_TYPE_LABELS[request.type]}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-medium">{formatDate(request.startDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">End Date</p>
              <p className="font-medium">{formatDate(request.endDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Number of Days</p>
              <p className="font-medium">{request.numberOfDays} day{request.numberOfDays !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Applied On</p>
              <p className="font-medium">{formatDate(request.appliedOn)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">Reason</p>
            <p className="text-sm mt-1 bg-muted p-3 rounded-lg">{request.reason}</p>
          </div>

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="border-t pt-4 space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {showRejectForm ? (
            <>
              <Button variant="outline" onClick={() => setShowRejectForm(false)} disabled={isProcessing}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Confirm Rejection
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectForm(true)}
                disabled={isProcessing}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
