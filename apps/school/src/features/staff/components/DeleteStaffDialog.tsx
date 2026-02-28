import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staffName: string
  onConfirm: () => void
  isDeleting?: boolean
}

export function DeleteStaffDialog({
  open,
  onOpenChange,
  staffName,
  onConfirm,
  isDeleting,
}: DeleteStaffDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Staff Member
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{staffName}</strong> from the staff records?
            This action cannot be undone and will permanently remove all their data including:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Attendance records</li>
              <li>Leave history</li>
              <li>Salary records</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Staff Member'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
