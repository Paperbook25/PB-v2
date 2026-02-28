import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Settings,
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { formatDate } from '@/lib/utils'
import type { Webhook, CreateWebhookRequest, UpdateWebhookRequest } from '../types/integrations.types'
import { WEBHOOK_EVENTS } from '../types/integrations.types'

const webhookSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  url: z.string().url('Please enter a valid URL'),
  events: z.array(z.string()).min(1, 'Select at least one event'),
  secret: z.string().optional(),
})

type WebhookFormData = z.infer<typeof webhookSchema>

interface WebhookManagerProps {
  webhooks: Webhook[]
  onCreate: (data: CreateWebhookRequest) => Promise<void>
  onUpdate: (id: string, data: UpdateWebhookRequest) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onTest: (id: string) => Promise<{ success: boolean; responseTime: number }>
  isCreating?: boolean
  isUpdating?: boolean
}

export function WebhookManager({
  webhooks,
  onCreate,
  onUpdate,
  onDelete,
  onTest,
  isCreating,
  isUpdating,
}: WebhookManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: '',
      url: '',
      events: [],
      secret: '',
    },
  })

  const handleOpenForm = (webhook?: Webhook) => {
    if (webhook) {
      setEditingWebhook(webhook)
      form.reset({
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        secret: '',
      })
    } else {
      setEditingWebhook(null)
      form.reset({
        name: '',
        url: '',
        events: [],
        secret: '',
      })
    }
    setShowForm(true)
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    if (editingWebhook) {
      await onUpdate(editingWebhook.id, data)
    } else {
      await onCreate(data)
    }
    setShowForm(false)
    form.reset()
  })

  const handleTest = async (id: string) => {
    setTestingId(id)
    try {
      await onTest(id)
    } finally {
      setTestingId(null)
    }
  }

  const handleToggleActive = async (webhook: Webhook) => {
    await onUpdate(webhook.id, { isActive: !webhook.isActive })
  }

  const copySecret = (webhook: Webhook) => {
    if (webhook.secret) {
      navigator.clipboard.writeText(webhook.secret)
      setCopiedId(webhook.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const webhookToDelete = webhooks.find((w) => w.id === deleteId)

  // Group events by category
  const eventCategories = [
    { label: 'Students', events: WEBHOOK_EVENTS.filter((e) => e.startsWith('student.')) },
    { label: 'Staff', events: WEBHOOK_EVENTS.filter((e) => e.startsWith('staff.')) },
    { label: 'Attendance', events: WEBHOOK_EVENTS.filter((e) => e.startsWith('attendance.')) },
    { label: 'Finance', events: WEBHOOK_EVENTS.filter((e) => e.startsWith('fee.')) },
    { label: 'Exams', events: WEBHOOK_EVENTS.filter((e) => e.startsWith('exam.') || e.startsWith('result.')) },
    { label: 'Admissions', events: WEBHOOK_EVENTS.filter((e) => e.startsWith('admission.')) },
  ]

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Webhooks</h3>
            <p className="text-sm text-muted-foreground">
              Send event notifications to external services
            </p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </div>

        {webhooks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No webhooks configured. Click "Add Webhook" to create your first webhook endpoint.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{webhook.name}</h4>
                        <Badge variant={webhook.isActive ? 'success' : 'secondary'}>
                          {webhook.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <span className="font-mono text-xs">{webhook.url}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {webhook.events.slice(0, 3).map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {webhook.events.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{webhook.events.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm mr-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          {webhook.successCount}
                        </div>
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-3 w-3" />
                          {webhook.failureCount}
                        </div>
                      </div>

                      <Switch
                        checked={webhook.isActive}
                        onCheckedChange={() => handleToggleActive(webhook)}
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(webhook.id)}
                        disabled={testingId === webhook.id || !webhook.isActive}
                      >
                        {testingId === webhook.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Test
                          </>
                        )}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenForm(webhook)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          {webhook.secret && (
                            <DropdownMenuItem onClick={() => copySecret(webhook)}>
                              <Copy className="h-4 w-4 mr-2" />
                              {copiedId === webhook.id ? 'Copied!' : 'Copy Secret'}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {webhook.lastTriggeredAt && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Last triggered: {formatDate(webhook.lastTriggeredAt)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingWebhook ? 'Edit' : 'Create'} Webhook</DialogTitle>
            <DialogDescription>
              Configure a webhook endpoint to receive event notifications.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ERP Sync" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endpoint URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-domain.com/webhook" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signing Secret (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter secret to sign webhook payloads"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Used to verify webhook authenticity. Leave empty to auto-generate.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="events"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Events</FormLabel>
                    <FormDescription>
                      Select the events that should trigger this webhook
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {eventCategories.map((category) => (
                        <div key={category.label} className="space-y-2">
                          <p className="text-sm font-medium">{category.label}</p>
                          {category.events.map((event) => (
                            <div key={event} className="flex items-center space-x-2">
                              <Checkbox
                                id={event}
                                checked={field.value.includes(event)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, event])
                                  } else {
                                    field.onChange(field.value.filter((e) => e !== event))
                                  }
                                }}
                              />
                              <label
                                htmlFor={event}
                                className="text-sm text-muted-foreground cursor-pointer"
                              >
                                {event.split('.')[1]}
                              </label>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingWebhook ? 'Update Webhook' : 'Create Webhook'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{webhookToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId)
                  setDeleteId(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
