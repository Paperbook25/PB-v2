import { useMemo } from 'react'
import { RotateCcw, Loader2, AlertTriangle, Calendar, BookOpen, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useReturnBook } from '../hooks/useLibrary'
import { FINE_RATE_PER_DAY, type IssuedBook } from '../types/library.types'

interface ReturnBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issuedBook: IssuedBook | null
}

export function ReturnBookDialog({ open, onOpenChange, issuedBook }: ReturnBookDialogProps) {
  const { toast } = useToast()
  const returnBook = useReturnBook()

  const overdueInfo = useMemo(() => {
    if (!issuedBook) return null

    const dueDate = new Date(issuedBook.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    const diffTime = today.getTime() - dueDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) {
      return { isOverdue: false, days: 0, fine: 0 }
    }

    return {
      isOverdue: true,
      days: diffDays,
      fine: diffDays * FINE_RATE_PER_DAY,
    }
  }, [issuedBook])

  if (!issuedBook) return null

  const handleReturn = () => {
    returnBook.mutate(issuedBook.id, {
      onSuccess: (result) => {
        if (result.fine) {
          toast({
            title: 'Book Returned with Fine',
            description: `${issuedBook.bookTitle} has been returned. A fine of Rs ${result.fine.amount} has been created for ${result.fine.overdueDays} overdue days.`,
          })
        } else {
          toast({
            title: 'Book Returned Successfully',
            description: `${issuedBook.bookTitle} has been returned to the library.`,
          })
        }
        onOpenChange(false)
      },
      onError: (error) => {
        toast({
          title: 'Return Failed',
          description: error instanceof Error ? error.message : 'Failed to return book',
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Return Book
          </DialogTitle>
          <DialogDescription>Process the return of an issued book.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Book Info */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{issuedBook.bookTitle}</p>
                <p className="text-sm text-muted-foreground">ISBN: {issuedBook.bookIsbn}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{issuedBook.studentName}</p>
                <p className="text-sm text-muted-foreground">
                  {issuedBook.studentClass} - Section {issuedBook.studentSection}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Issue Date:</span>
                  <span className="text-sm">
                    {new Date(issuedBook.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Due Date:</span>
                  <span className="text-sm">
                    {new Date(issuedBook.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Return Date:</span>
                  <span className="text-sm">{new Date().toLocaleDateString()} (Today)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={overdueInfo?.isOverdue ? 'destructive' : 'default'}>
                {overdueInfo?.isOverdue ? `${overdueInfo.days} days overdue` : 'On Time'}
              </Badge>
            </div>
          </div>

          {/* Fine Warning */}
          {overdueInfo?.isOverdue && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Overdue Fine</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Overdue Days:</span>
                    <span>{overdueInfo.days} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Rate:</span>
                    <span>Rs {FINE_RATE_PER_DAY} per day</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t">
                    <span>Total Fine:</span>
                    <span>Rs {overdueInfo.fine}</span>
                  </div>
                </div>
                <p className="text-xs mt-2">
                  A fine record will be created when this book is returned.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {!overdueInfo?.isOverdue && (
            <Alert>
              <AlertDescription>
                This book is being returned on time. No fine will be charged.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReturn} disabled={returnBook.isPending}>
            {returnBook.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Confirm Return
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
