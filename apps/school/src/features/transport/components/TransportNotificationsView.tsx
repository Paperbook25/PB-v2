import { useState } from 'react'
import { Bell, MessageSquare, Smartphone, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTransportNotifications, useRoutes } from '../hooks/useTransport'
import { NOTIFICATION_EVENT_LABELS } from '../types/transport.types'
import type { NotificationEventType } from '../types/transport.types'

export function TransportNotificationsView() {
  const [routeFilter, setRouteFilter] = useState<string>('')
  const [eventFilter, setEventFilter] = useState<string>('')

  const { data: routesResult } = useRoutes()
  const { data: result, isLoading } = useTransportNotifications({
    routeId: routeFilter || undefined,
    eventType: eventFilter || undefined,
  })

  const routes = routesResult?.data || []
  const notifications = result?.data || []

  const channelIcon = (channel: string) => {
    switch (channel) {
      case 'sms': return <MessageSquare className="h-3.5 w-3.5" />
      case 'whatsapp': return <Smartphone className="h-3.5 w-3.5" />
      case 'push': return <Bell className="h-3.5 w-3.5" />
      default: return <Send className="h-3.5 w-3.5" />
    }
  }

  const eventVariant = (eventType: string): 'success' | 'warning' | 'destructive' | 'secondary' => {
    switch (eventType) {
      case 'boarded': return 'success'
      case 'alighted': return 'success'
      case 'delay': return 'warning'
      case 'breakdown': return 'destructive'
      default: return 'secondary'
    }
  }

  // Stats
  const totalSent = notifications.length
  const deliveredCount = notifications.filter((n) => n.status === 'delivered').length
  const failedCount = notifications.filter((n) => n.status === 'failed').length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{totalSent}</p>
            <p className="text-xs text-muted-foreground">Total Notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-destructive">{failedCount}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={routeFilter} onValueChange={setRouteFilter}>
          <SelectTrigger className="sm:w-[250px]">
            <SelectValue placeholder="All routes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Routes</SelectItem>
            {routes.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="sm:w-[200px]">
            <SelectValue placeholder="All events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {Object.entries(NOTIFICATION_EVENT_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Stop</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notif) => (
                  <TableRow key={notif.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(notif.sentAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell className="font-medium">{notif.studentName}</TableCell>
                    <TableCell>
                      <Badge variant={eventVariant(notif.eventType)}>
                        {NOTIFICATION_EVENT_LABELS[notif.eventType as NotificationEventType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{notif.routeName}</TableCell>
                    <TableCell className="text-sm">{notif.stopName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        {channelIcon(notif.channel)}
                        <span className="capitalize">{notif.channel}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={notif.status === 'delivered' ? 'success' : notif.status === 'failed' ? 'destructive' : 'secondary'}>
                        {notif.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && notifications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No notifications found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
