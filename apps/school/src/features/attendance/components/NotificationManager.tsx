import { useState } from 'react'
import { Bell, Mail, MessageSquare, Smartphone, Send, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useNotificationConfig, useUpdateNotificationConfig, useNotificationHistory, useNotificationStats, useSendTestNotification } from '../hooks/useAttendance'
import { NOTIFICATION_CHANNEL_LABELS, NOTIFICATION_EVENT_LABELS } from '../types/attendance.types'
import type { NotificationChannel, NotificationEventType } from '../types/attendance.types'

const CHANNEL_ICONS: Record<NotificationChannel, React.ReactNode> = {
  sms: <Smartphone className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
  whatsapp: <MessageSquare className="h-5 w-5" />,
  in_app: <Bell className="h-5 w-5" />,
}

const ALL_CHANNELS: NotificationChannel[] = ['sms', 'email', 'whatsapp', 'in_app']
const ALL_EVENTS: NotificationEventType[] = ['absence', 'late', 'low_attendance', 'leave_status']

export function NotificationManager() {
  const { toast } = useToast()

  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [testRecipients, setTestRecipients] = useState<Record<NotificationChannel, string>>({
    sms: '',
    email: '',
    whatsapp: '',
    in_app: '',
  })

  // Queries
  const { data: configs, isLoading: configsLoading } = useNotificationConfig()
  const { data: history, isLoading: historyLoading } = useNotificationHistory({
    channel: channelFilter !== 'all' ? channelFilter : undefined,
    eventType: eventFilter !== 'all' ? eventFilter : undefined,
  })
  const { data: stats, isLoading: statsLoading } = useNotificationStats()

  // Mutations
  const updateConfig = useUpdateNotificationConfig()
  const sendTest = useSendTestNotification()

  const handleToggleEnabled = (channel: NotificationChannel, currentConfig: {
    enabled: boolean
    events: NotificationEventType[]
    timing: 'immediate' | 'daily_digest'
  }) => {
    updateConfig.mutate(
      {
        channel,
        data: {
          channel,
          enabled: !currentConfig.enabled,
          events: currentConfig.events,
          timing: currentConfig.timing,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Configuration Updated',
            description: `${NOTIFICATION_CHANNEL_LABELS[channel]} notifications ${!currentConfig.enabled ? 'enabled' : 'disabled'}.`,
          })
        },
        onError: () => {
          toast({
            title: 'Update Failed',
            description: 'Failed to update notification configuration.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleToggleEvent = (channel: NotificationChannel, event: NotificationEventType, currentConfig: {
    enabled: boolean
    events: NotificationEventType[]
    timing: 'immediate' | 'daily_digest'
  }) => {
    const newEvents = currentConfig.events.includes(event)
      ? currentConfig.events.filter((e) => e !== event)
      : [...currentConfig.events, event]

    updateConfig.mutate(
      {
        channel,
        data: {
          channel,
          enabled: currentConfig.enabled,
          events: newEvents,
          timing: currentConfig.timing,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Configuration Updated',
            description: `Event settings updated for ${NOTIFICATION_CHANNEL_LABELS[channel]}.`,
          })
        },
        onError: () => {
          toast({
            title: 'Update Failed',
            description: 'Failed to update event configuration.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleTimingChange = (channel: NotificationChannel, timing: 'immediate' | 'daily_digest', currentConfig: {
    enabled: boolean
    events: NotificationEventType[]
  }) => {
    updateConfig.mutate(
      {
        channel,
        data: {
          channel,
          enabled: currentConfig.enabled,
          events: currentConfig.events,
          timing,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Configuration Updated',
            description: `Timing updated for ${NOTIFICATION_CHANNEL_LABELS[channel]}.`,
          })
        },
        onError: () => {
          toast({
            title: 'Update Failed',
            description: 'Failed to update timing configuration.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleSendTest = (channel: NotificationChannel) => {
    const recipient = testRecipients[channel]
    if (!recipient.trim()) {
      toast({
        title: 'Recipient Required',
        description: 'Please enter a recipient for the test notification.',
        variant: 'destructive',
      })
      return
    }

    sendTest.mutate(
      { channel, recipient },
      {
        onSuccess: () => {
          toast({
            title: 'Test Sent',
            description: `Test notification sent via ${NOTIFICATION_CHANNEL_LABELS[channel]}.`,
          })
          setTestRecipients((prev) => ({ ...prev, [channel]: '' }))
        },
        onError: () => {
          toast({
            title: 'Send Failed',
            description: 'Failed to send test notification.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const getConfigForChannel = (channel: NotificationChannel) => {
    return configs?.find((c) => c.channel === channel)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>
      case 'sent':
        return <Badge variant="secondary"><Send className="h-3 w-3 mr-1" />Sent</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getChannelBadge = (channel: NotificationChannel) => {
    return (
      <Badge variant="outline" className="gap-1">
        {CHANNEL_ICONS[channel]}
        {NOTIFICATION_CHANNEL_LABELS[channel]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          {configsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALL_CHANNELS.map((channel) => {
                const config = getConfigForChannel(channel)
                const isEnabled = config?.enabled ?? false
                const events = config?.events ?? []
                const timing = config?.timing ?? 'immediate'

                return (
                  <Card key={channel}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2 rounded-lg',
                            isEnabled
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          )}>
                            {CHANNEL_ICONS[channel]}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {NOTIFICATION_CHANNEL_LABELS[channel]}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {isEnabled ? 'Enabled' : 'Disabled'}
                            </CardDescription>
                          </div>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() =>
                            handleToggleEnabled(channel, { enabled: isEnabled, events, timing })
                          }
                          disabled={updateConfig.isPending}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Events */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Events</Label>
                        <div className="space-y-2">
                          {ALL_EVENTS.map((event) => (
                            <div key={event} className="flex items-center gap-2">
                              <Checkbox
                                id={`${channel}-${event}`}
                                checked={events.includes(event)}
                                onCheckedChange={() =>
                                  handleToggleEvent(channel, event, { enabled: isEnabled, events, timing })
                                }
                                disabled={!isEnabled || updateConfig.isPending}
                              />
                              <Label
                                htmlFor={`${channel}-${event}`}
                                className={cn(
                                  'text-sm cursor-pointer',
                                  !isEnabled && 'text-muted-foreground'
                                )}
                              >
                                {NOTIFICATION_EVENT_LABELS[event]}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timing */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Timing</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`${channel}-immediate`}
                              name={`${channel}-timing`}
                              value="immediate"
                              checked={timing === 'immediate'}
                              onChange={() =>
                                handleTimingChange(channel, 'immediate', { enabled: isEnabled, events })
                              }
                              disabled={!isEnabled || updateConfig.isPending}
                              className="h-4 w-4"
                            />
                            <Label
                              htmlFor={`${channel}-immediate`}
                              className={cn(
                                'text-sm cursor-pointer',
                                !isEnabled && 'text-muted-foreground'
                              )}
                            >
                              Immediate
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`${channel}-daily_digest`}
                              name={`${channel}-timing`}
                              value="daily_digest"
                              checked={timing === 'daily_digest'}
                              onChange={() =>
                                handleTimingChange(channel, 'daily_digest', { enabled: isEnabled, events })
                              }
                              disabled={!isEnabled || updateConfig.isPending}
                              className="h-4 w-4"
                            />
                            <Label
                              htmlFor={`${channel}-daily_digest`}
                              className={cn(
                                'text-sm cursor-pointer',
                                !isEnabled && 'text-muted-foreground'
                              )}
                            >
                              Daily Digest
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* Test Notification */}
                      <div className="space-y-2 pt-2 border-t">
                        <Label className="text-sm font-medium">Send Test</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder={
                              channel === 'email' ? 'Email address' :
                              channel === 'sms' || channel === 'whatsapp' ? 'Phone number' :
                              'User ID'
                            }
                            value={testRecipients[channel]}
                            onChange={(e) =>
                              setTestRecipients((prev) => ({ ...prev, [channel]: e.target.value }))
                            }
                            disabled={!isEnabled}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendTest(channel)}
                            disabled={!isEnabled || sendTest.isPending}
                          >
                            {sendTest.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {/* Stats Cards */}
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                    <Send className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalSent}</p>
                    <p className="text-xs text-muted-foreground">Total Sent</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-200" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.delivered}</p>
                    <p className="text-xs text-muted-foreground">Delivered</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-200" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-200" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <Label className="text-sm font-medium mb-1 block">Channel</Label>
                  <Select value={channelFilter} onValueChange={setChannelFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Channels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      {ALL_CHANNELS.map((ch) => (
                        <SelectItem key={ch} value={ch}>
                          {NOTIFICATION_CHANNEL_LABELS[ch]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Event Type</Label>
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Events" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      {ALL_EVENTS.map((ev) => (
                        <SelectItem key={ev} value={ev}>
                          {NOTIFICATION_EVENT_LABELS[ev]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification History Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification History</CardTitle>
              <CardDescription>Record of all sent notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !history || history.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No notification history found
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell className="font-medium">
                            {notification.studentName}
                          </TableCell>
                          <TableCell>
                            {notification.className} - {notification.section}
                          </TableCell>
                          <TableCell>{notification.date}</TableCell>
                          <TableCell>{getChannelBadge(notification.channel)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {NOTIFICATION_EVENT_LABELS[notification.eventType]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {notification.recipient}
                          </TableCell>
                          <TableCell>{getStatusBadge(notification.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(notification.sentAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
