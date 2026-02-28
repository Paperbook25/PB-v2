import { useState, useEffect } from 'react'
import { CalendarIcon, RefreshCw, AlertTriangle, History } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useRenewBook } from '../hooks/useLibrary'
import type { IssuedBook } from '../types/library.types'
import { MAX_RENEWALS, RENEWAL_DAYS } from '../types/library.types'

interface RenewBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issuedBook: IssuedBook | null
}

export function RenewBookDialog({ open, onOpenChange, issuedBook }: RenewBookDialogProps) {
  const { toast } = useToast()
  const renewBookMutation = useRenewBook()

  const [newDueDate, setNewDueDate] = useState<Date | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Reset date when dialog opens
  useEffect(() => {
    if (open && issuedBook) {
      // Default to RENEWAL_DAYS from today
      setNewDueDate(addDays(new Date(), RENEWAL_DAYS))
    }
  }, [open, issuedBook])

  if (!issuedBook) return null

  const renewalCount = issuedBook.renewalCount || 0
  const canRenew = renewalCount < MAX_RENEWALS
  const isOverdue = issuedBook.status === 'overdue'
  const currentDueDate = new Date(issuedBook.dueDate)

  const handleRenew = async () => {
    if (!newDueDate) {
      toast({
        title: 'Error',
        description: 'Please select a new due date.',
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await renewBookMutation.mutateAsync({
        issuedBookId: issuedBook.id,
        newDueDate: newDueDate.toISOString(),
      })

      toast({
        title: 'Book Renewed',
        description: result.message || 'The book has been renewed successfully.',
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Renewal Failed',
        description: error instanceof Error ? error.message : 'Failed to renew book. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Renew Book
          </DialogTitle>
          <DialogDescription>
            Extend the due date for this borrowed book.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Book Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="font-medium">{issuedBook.bookTitle}</p>
            <p className="text-sm text-muted-foreground">
              Borrowed by: {issuedBook.studentName} ({issuedBook.studentClass} - {issuedBook.studentSection})
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Current Due Date:</span>
              <span className={cn(isOverdue && 'text-destructive font-medium')}>
                {format(currentDueDate, 'PPP')}
              </span>
              {isOverdue && (
                <Badge variant="destructive" className="text-[10px]">
                  Overdue
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Renewals Used:</span>
              <Badge variant={renewalCount >= MAX_RENEWALS ? 'destructive' : 'secondary'}>
                {renewalCount} / {MAX_RENEWALS}
              </Badge>
            </div>
          </div>

          {/* Renewal History */}
          {issuedBook.renewalHistory && issuedBook.renewalHistory.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <History className="h-4 w-4" />
                Renewal History
              </div>
              <div className="bg-muted/30 rounded-lg p-3 space-y-2 max-h-[120px] overflow-y-auto">
                {issuedBook.renewalHistory.map((record, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground flex justify-between">
                    <span>Renewal {idx + 1}</span>
                    <span>
                      {format(new Date(record.previousDueDate), 'MMM d')} → {format(new Date(record.newDueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cannot Renew Warning */}
          {!canRenew && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Maximum renewals ({MAX_RENEWALS}) reached. The student must return this book and re-borrow it if needed.
              </AlertDescription>
            </Alert>
          )}

          {/* Overdue Warning */}
          {isOverdue && canRenew && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This book is currently overdue. Renewing will extend the due date, but existing fines may still apply.
              </AlertDescription>
            </Alert>
          )}

          {/* New Due Date Selection */}
          {canRenew && (
            <div className="space-y-2">
              <label className="text-sm font-medium">New Due Date</label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !newDueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDueDate ? format(newDueDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDueDate}
                    onSelect={(date) => {
                      setNewDueDate(date)
                      setCalendarOpen(false)
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Standard renewal period is {RENEWAL_DAYS} days from today.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRenew}
            disabled={!canRenew || renewBookMutation.isPending}
          >
            {renewBookMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Renewing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Renew Book
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
