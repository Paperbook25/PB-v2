import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ApplicationStatus } from '../types/admission.types'
import { getStatusConfig, canTransitionTo, APPLICATION_STATUSES } from '../types/admission.types'
import { cn } from '@/lib/utils'

interface StatusChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: ApplicationStatus
  onConfirm: (newStatus: ApplicationStatus, note?: string) => void
  isLoading?: boolean
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  currentStatus,
  onConfirm,
  isLoading,
}: StatusChangeDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('')
  const [note, setNote] = useState('')

  const currentConfig = getStatusConfig(currentStatus)
  const allowedStatuses = APPLICATION_STATUSES.filter((s) => canTransitionTo(currentStatus, s.value))

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus, note.trim() || undefined)
      setSelectedStatus('')
      setNote('')
    }
  }

  const handleClose = () => {
    setSelectedStatus('')
    setNote('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Application Status</DialogTitle>
          <DialogDescription>
            Current status:{' '}
            <span className={cn('font-medium', currentConfig.color)}>{currentConfig.label}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as ApplicationStatus)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {allowedStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', status.bgColor)} />
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStatus && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getStatusConfig(selectedStatus).description}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this status change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedStatus || isLoading}>
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
