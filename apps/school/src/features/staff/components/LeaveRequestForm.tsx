import { useState } from 'react'
import { CalendarDays, Loader2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LEAVE_TYPE_LABELS, type LeaveType, type LeaveBalance } from '../types/staff.types'

interface LeaveRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { type: LeaveType; startDate: string; endDate: string; reason: string }) => void
  isSubmitting?: boolean
  leaveBalance?: LeaveBalance
}

export function LeaveRequestForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  leaveBalance,
}: LeaveRequestFormProps) {
  const [type, setType] = useState<LeaveType | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const today = new Date().toISOString().split('T')[0]

  // Calculate number of days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  const numberOfDays = calculateDays()
  const selectedLeaveBalance = type && leaveBalance ? leaveBalance[type] : null
  const hasInsufficientBalance = selectedLeaveBalance && numberOfDays > selectedLeaveBalance.available

  const handleSubmit = () => {
    if (type && startDate && endDate && reason) {
      onSubmit({ type, startDate, endDate, reason })
    }
  }

  const handleClose = () => {
    setType('')
    setStartDate('')
    setEndDate('')
    setReason('')
    onOpenChange(false)
  }

  const isValid = type && startDate && endDate && reason && !hasInsufficientBalance && numberOfDays > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Apply for Leave
          </DialogTitle>
          <DialogDescription>Fill in the details to submit a leave request.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as LeaveType)}>
              <SelectTrigger id="leaveType">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((lt) => (
                  <SelectItem key={lt} value={lt}>
                    <div className="flex items-center justify-between w-full">
                      <span>{LEAVE_TYPE_LABELS[lt]}</span>
                      {leaveBalance && (
                        <span className="text-muted-foreground ml-4">
                          ({leaveBalance[lt].available} available)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (!endDate || e.target.value > endDate) {
                    setEndDate(e.target.value)
                  }
                }}
                min={today}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
              />
            </div>
          </div>

          {numberOfDays > 0 && (
            <p className="text-sm text-muted-foreground">
              Total: <strong>{numberOfDays}</strong> day{numberOfDays !== 1 ? 's' : ''}
            </p>
          )}

          {hasInsufficientBalance && (
            <Alert variant="destructive">
              <AlertDescription>
                Insufficient leave balance. You have only {selectedLeaveBalance?.available} days available.
              </AlertDescription>
            </Alert>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for your leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
