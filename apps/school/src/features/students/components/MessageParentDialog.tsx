import { useState } from 'react'
import { Send, MessageSquare, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
import { useSendParentMessage } from '../hooks/useStudents'
import { useToast } from '@/hooks/use-toast'

type MessageChannel = 'sms' | 'email' | 'whatsapp' | 'all'

interface MessageParentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: {
    id: string
    name: string
    parent: {
      guardianPhone: string
      guardianEmail: string
    }
  }
}

export function MessageParentDialog({ open, onOpenChange, student }: MessageParentDialogProps) {
  const { toast } = useToast()
  const [channel, setChannel] = useState<MessageChannel>('all')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const sendMutation = useSendParentMessage()

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message to send.',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await sendMutation.mutateAsync({
        studentId: student.id,
        channel,
        subject: channel === 'email' || channel === 'all' ? subject : undefined,
        message,
      })

      const sentChannels = response.data.sentVia.join(', ').toUpperCase()
      toast({
        title: 'Message Sent',
        description: `Message sent successfully via ${sentChannels}.`,
      })
      onOpenChange(false)
      setMessage('')
      setSubject('')
      setChannel('all')
    } catch (error) {
      toast({
        title: 'Failed to Send',
        description: 'Could not send message. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMessage('')
      setSubject('')
      setChannel('all')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Message Parent</DialogTitle>
          <DialogDescription>
            Send a message to {student.name}'s parent/guardian
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contact Info */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{student.parent.guardianPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{student.parent.guardianEmail}</span>
            </div>
          </div>

          {/* Channel Selection */}
          <div className="space-y-2">
            <Label>Send via</Label>
            <RadioGroup
              value={channel}
              onValueChange={(v: string) => setChannel(v as MessageChannel)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms" className="flex items-center gap-1 font-normal cursor-pointer">
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-1 font-normal cursor-pointer">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whatsapp" id="whatsapp" />
                <Label htmlFor="whatsapp" className="flex items-center gap-1 font-normal cursor-pointer">
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="font-normal cursor-pointer">
                  All Channels
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Subject (for email) */}
          {(channel === 'email' || channel === 'all') && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Message subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>
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
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
