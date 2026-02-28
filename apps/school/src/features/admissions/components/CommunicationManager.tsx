import { useState } from 'react'
import { Mail, MessageSquare, Phone, Send, Plus, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { formatDate, cn } from '@/lib/utils'
import {
  useCommunicationLogs,
  useCommunicationTemplates,
  useSendCommunication,
} from '../hooks/useAdmissions'
import type {
  CommunicationType,
  CommunicationLog,
  CommunicationTemplate,
} from '../types/admission.types'
import { COMMUNICATION_TRIGGER_LABELS } from '../types/admission.types'

function getTypeIcon(type: CommunicationType) {
  switch (type) {
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'sms':
      return <MessageSquare className="h-4 w-4" />
    case 'whatsapp':
      return <Phone className="h-4 w-4" />
  }
}

function getTypeBadgeVariant(type: CommunicationType) {
  switch (type) {
    case 'email':
      return 'bg-blue-100 text-blue-700'
    case 'sms':
      return 'bg-purple-100 text-purple-700'
    case 'whatsapp':
      return 'bg-green-100 text-green-700'
  }
}

function getStatusBadgeVariant(status: CommunicationLog['status']) {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-700'
    case 'sent':
      return 'bg-blue-100 text-blue-700'
    case 'failed':
      return 'bg-red-100 text-red-700'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
  }
}

function LogsTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function TemplateCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-6 w-20 mt-3 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface LogsTableProps {
  logs: CommunicationLog[]
}

function LogsTable({ logs }: LogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No communication logs found</p>
        <p className="text-sm mt-1">Communication logs will appear here once messages are sent.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Date</th>
              <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Student</th>
              <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Type</th>
              <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Trigger</th>
              <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Recipient</th>
              <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Subject</th>
              <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  {formatDate(log.sentAt)}
                </td>
                <td className="px-4 py-3 text-sm font-medium">{log.studentName}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={cn('gap-1', getTypeBadgeVariant(log.type))}>
                    {getTypeIcon(log.type)}
                    {log.type.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm">
                  {COMMUNICATION_TRIGGER_LABELS[log.trigger]}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{log.recipient}</td>
                <td className="px-4 py-3 text-sm max-w-[200px] truncate">{log.subject}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={getStatusBadgeVariant(log.status)}>
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface TemplateCardProps {
  template: CommunicationTemplate
}

function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className={cn(!template.isActive && 'opacity-60')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{template.name}</CardTitle>
            <CardDescription>{COMMUNICATION_TRIGGER_LABELS[template.trigger]}</CardDescription>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              'gap-1',
              template.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            )}
          >
            {template.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="secondary" className={cn('gap-1', getTypeBadgeVariant(template.type))}>
          {getTypeIcon(template.type)}
          {template.type.toUpperCase()}
        </Badge>
        {template.subject && (
          <p className="text-sm font-medium">Subject: {template.subject}</p>
        )}
        <p className="text-sm text-muted-foreground line-clamp-3">{template.body}</p>
        {template.variables.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {template.variables.map((variable) => (
              <Badge key={variable} variant="outline" className="text-xs font-mono">
                {`{{${variable}}}`}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SendMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: CommunicationTemplate[]
}

function SendMessageDialog({ open, onOpenChange, templates }: SendMessageDialogProps) {
  const { toast } = useToast()
  const sendCommunication = useSendCommunication()

  const [type, setType] = useState<CommunicationType>('email')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [applicationIds, setApplicationIds] = useState('')

  const activeTemplates = templates.filter((t) => t.isActive)

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    if (templateId === 'none') {
      return
    }
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setType(template.type)
      setSubject(template.subject)
      setMessage(template.body)
    }
  }

  const handleSend = () => {
    const ids = applicationIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)

    if (ids.length === 0) {
      toast({
        title: 'Missing Recipients',
        description: 'Please enter at least one application ID.',
        variant: 'destructive',
      })
      return
    }

    if (!subject.trim()) {
      toast({
        title: 'Missing Subject',
        description: 'Please enter a subject for the message.',
        variant: 'destructive',
      })
      return
    }

    if (!message.trim()) {
      toast({
        title: 'Missing Message',
        description: 'Please enter a message body.',
        variant: 'destructive',
      })
      return
    }

    sendCommunication.mutate(
      {
        applicationIds: ids,
        templateId: selectedTemplateId && selectedTemplateId !== 'none' ? selectedTemplateId : undefined,
        type,
        subject: subject.trim(),
        message: message.trim(),
      },
      {
        onSuccess: () => {
          toast({
            title: 'Message Sent',
            description: `${type.charAt(0).toUpperCase() + type.slice(1)} message has been sent to ${ids.length} recipient(s).`,
          })
          handleClose()
        },
        onError: (error) => {
          toast({
            title: 'Failed to Send',
            description: error instanceof Error ? error.message : 'An error occurred while sending the message.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleClose = () => {
    setType('email')
    setSelectedTemplateId('')
    setSubject('')
    setMessage('')
    setApplicationIds('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Message
          </DialogTitle>
          <DialogDescription>
            Compose and send a message to applicants via email, SMS, or WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="applicationIds">Application IDs</Label>
            <Input
              id="applicationIds"
              placeholder="Enter comma-separated application IDs"
              value={applicationIds}
              onChange={(e) => setApplicationIds(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple IDs with commas (e.g., APP001, APP002)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Template (optional)</Label>
            <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No template</SelectItem>
                {activeTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Message Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as CommunicationType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </div>
                </SelectItem>
                <SelectItem value="whatsapp">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter message subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sendCommunication.isPending}>
            {sendCommunication.isPending ? (
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

export function CommunicationManager() {
  const [activeTab, setActiveTab] = useState('logs')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sendDialogOpen, setSendDialogOpen] = useState(false)

  const logsFilters = typeFilter !== 'all' ? { type: typeFilter } : undefined
  const { data: logsResponse, isLoading: logsLoading } = useCommunicationLogs(logsFilters)
  const { data: templatesResponse, isLoading: templatesLoading } = useCommunicationTemplates()

  const communicationLogs: CommunicationLog[] = logsResponse?.data ?? []
  const communicationTemplates: CommunicationTemplate[] = templatesResponse?.data ?? []

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Communications</CardTitle>
            <CardDescription>
              Manage admission-related communications via email, SMS, and WhatsApp.
            </CardDescription>
          </div>
          <Button onClick={() => setSendDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            {activeTab === 'logs' && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        SMS
                      </div>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        WhatsApp
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <TabsContent value="logs" className="mt-0">
            {logsLoading ? (
              <LogsTableSkeleton />
            ) : (
              <LogsTable logs={communicationLogs} />
            )}
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            {templatesLoading ? (
              <TemplateCardsSkeleton />
            ) : communicationTemplates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No templates found</p>
                <p className="text-sm mt-1">Communication templates will appear here once configured.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communicationTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <SendMessageDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        templates={communicationTemplates}
      />
    </Card>
  )
}
