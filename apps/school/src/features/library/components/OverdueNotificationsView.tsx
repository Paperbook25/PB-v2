import { useState, useEffect } from 'react'
import { Bell, Save, Loader2, Mail, MessageSquare, Phone, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useOverdueNotifications,
  useNotificationConfig,
  useUpdateNotificationConfig,
} from '../hooks/useLibrary'
import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_STATUS_LABELS,
  type NotificationChannel,
  type NotificationStatus,
  type NotificationConfig,
} from '../types/library.types'
import { statusColors } from '@/lib/design-tokens'

const CHANNEL_ICONS: Record<NotificationChannel, typeof Mail> = {
  sms: MessageSquare,
  email: Mail,
  whatsapp: Phone,
  in_app: Smartphone,
}

const STATUS_VARIANT: Record<NotificationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  sent: 'secondary',
  delivered: 'default',
  failed: 'destructive',
  pending: 'outline',
}

export function OverdueNotificationsView() {
  const { toast } = useToast()
  const { data: configResult, isLoading: configLoading } = useNotificationConfig()
  const updateConfig = useUpdateNotificationConfig()

  const [channelFilter, setChannelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data: notifResult, isLoading: notifsLoading } = useOverdueNotifications({
    channel: channelFilter,
    status: statusFilter,
    page,
    limit: 15,
  })

  const config = configResult?.data
  const [autoEnabled, setAutoEnabled] = useState(false)
  const [sendAfterDays, setSendAfterDays] = useState(1)
  const [repeatEvery, setRepeatEvery] = useState(3)
  const [maxReminders, setMaxReminders] = useState(5)

  useEffect(() => {
    if (config) {
      setAutoEnabled(config.autoSendEnabled)
      setSendAfterDays(config.sendAfterDays)
      setRepeatEvery(config.repeatEveryDays)
      setMaxReminders(config.maxReminders)
    }
  }, [config])

  const notifications = notifResult?.data || []
  const pagination = notifResult?.meta

  const handleSaveConfig = () => {
    updateConfig.mutate(
      { autoSendEnabled: autoEnabled, sendAfterDays, repeatEveryDays: repeatEvery, maxReminders },
      {
        onSuccess: () => toast({ title: 'Saved', description: 'Notification config updated.' }),
        onError: () => toast({ title: 'Error', description: 'Failed to save config', variant: 'destructive' }),
      }
    )
  }

  const deliveredCount = notifications.filter(n => n.status === 'delivered').length
  const failedCount = notifications.filter(n => n.status === 'failed').length

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Overdue Notifications</h3>
        <p className="text-sm text-muted-foreground">Configure and monitor overdue book return reminders to parents</p>
      </div>

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="logs">Notification Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          {configLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto-Send Reminders</Label>
                    <p className="text-sm text-muted-foreground">Automatically send overdue reminders to parents</p>
                  </div>
                  <Switch checked={autoEnabled} onCheckedChange={setAutoEnabled} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Send After (days overdue)</Label>
                    <Input type="number" min={1} value={sendAfterDays} onChange={(e) => setSendAfterDays(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Repeat Every (days)</Label>
                    <Input type="number" min={1} value={repeatEvery} onChange={(e) => setRepeatEvery(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Max Reminders</Label>
                    <Input type="number" min={1} value={maxReminders} onChange={(e) => setMaxReminders(Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveConfig} disabled={updateConfig.isPending}>
                    {updateConfig.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{pagination?.total || 0}</div>
                <p className="text-sm text-muted-foreground">Total Notifications</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold" style={{ color: statusColors.success }}>{deliveredCount}</div>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold" style={{ color: statusColors.error }}>{failedCount}</div>
                <p className="text-sm text-muted-foreground">Failed</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-4">
            <Select value={channelFilter} onValueChange={(v) => { setChannelFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="in_app">In-App</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {notifsLoading ? (
            <Skeleton className="h-60 w-full" />
          ) : notifications.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No notification logs found.</CardContent></Card>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map(n => {
                    const Icon = CHANNEL_ICONS[n.channel]
                    return (
                      <TableRow key={n.id}>
                        <TableCell>
                          <span className="font-medium">{n.studentName}</span>
                          <span className="text-xs text-muted-foreground ml-1">{n.studentClass}</span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{n.bookTitle}</TableCell>
                        <TableCell>{n.overdueDays} days</TableCell>
                        <TableCell className="font-medium" style={{ color: statusColors.error }}>Rs {n.fineAmount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            <Icon className="h-3 w-3 mr-1" />
                            {NOTIFICATION_CHANNEL_LABELS[n.channel]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[n.status]}>{NOTIFICATION_STATUS_LABELS[n.status]}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(n.sentAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
