import { useState } from 'react'
import { Send, MessageSquare, Mail, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSendReminders } from '../hooks/useFinance'
import { formatCurrency } from '@/lib/utils'
import type { OutstandingDue } from '../types/finance.types'

interface ReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStudents: OutstandingDue[]
}

export function ReminderDialog({ open, onOpenChange, selectedStudents }: ReminderDialogProps) {
  const [method, setMethod] = useState<'sms' | 'email' | 'both'>('both')
  const [message, setMessage] = useState('')
  const sendMutation = useSendReminders()

  const totalDue = selectedStudents.reduce((sum, s) => sum + s.totalDue, 0)

  const defaultMessage = `Dear Parent,

This is a reminder that fee payment of Rs ${formatCurrency(selectedStudents[0]?.totalDue || 0)} is pending for your ward. Please clear the dues at the earliest.

Thank you,
Paperbook School`

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync({
        studentIds: selectedStudents.map((s) => s.studentId),
        method,
        message: message || undefined,
      })
      onOpenChange(false)
      setMessage('')
    } catch (error) {
      console.error('Failed to send reminders:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Fee Reminder</DialogTitle>
          <DialogDescription>
            Send reminder to {selectedStudents.length} student
            {selectedStudents.length > 1 ? 's' : ''} with total outstanding of{' '}
            {formatCurrency(totalDue)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Students Summary */}
          <div className="bg-muted/50 p-3 rounded-lg max-h-[120px] overflow-y-auto">
            {selectedStudents.map((student) => (
              <div key={student.id} className="flex justify-between text-sm py-1">
                <span>{student.studentName}</span>
                <span className="text-red-600 font-medium">
                  {formatCurrency(student.totalDue)}
                </span>
              </div>
            ))}
          </div>

          {/* Reminder Method */}
          <div className="space-y-2">
            <Label>Send via</Label>
            <RadioGroup
              value={method}
              onValueChange={(v: string) => setMethod(v as 'sms' | 'email' | 'both')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms" className="flex items-center gap-1 font-normal">
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-1 font-normal">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="font-normal">
                  Both
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder={defaultMessage}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default reminder message
            </p>
          </div>

          {/* Contact Info Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Reminders will be sent to the parent contact information on file.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sendMutation.isPending}>
            {sendMutation.isPending ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Reminder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
