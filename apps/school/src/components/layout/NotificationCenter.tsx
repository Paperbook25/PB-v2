import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPatch } from '@/lib/api-client'
import {
  Bell,
  Check,
  CheckCheck,
  UserPlus,
  IndianRupee,
  ClipboardCheck,
  BookOpen,
  AlertTriangle,
  Calendar,
  MessageSquare,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  type: 'admission' | 'fee' | 'attendance' | 'library' | 'alert' | 'event' | 'message' | 'system'
  read: boolean
  createdAt: string
  actionUrl?: string
}

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  admission: { icon: UserPlus, color: 'text-blue-500' },
  fee: { icon: IndianRupee, color: 'text-green-500' },
  attendance: { icon: ClipboardCheck, color: 'text-purple-500' },
  library: { icon: BookOpen, color: 'text-orange-500' },
  alert: { icon: AlertTriangle, color: 'text-red-500' },
  event: { icon: Calendar, color: 'text-teal-500' },
  message: { icon: MessageSquare, color: 'text-indigo-500' },
  system: { icon: Bell, color: 'text-gray-500' },
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: result } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiGet<{ data: Notification[] }>('/api/notifications')
      return response.data
    },
    refetchInterval: 30000,
  })

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiPatch(`/api/notifications/${id}/read`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiPatch('/api/notifications/mark-all-read')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications = result || []
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => markAllReadMutation.mutate()}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const config = typeConfig[notification.type] || typeConfig.system
                const Icon = config.icon
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer',
                      !notification.read && 'bg-primary/5'
                    )}
                    onClick={() => {
                      if (!notification.read) {
                        markReadMutation.mutate(notification.id)
                      }
                    }}
                  >
                    <div className={cn('mt-0.5 shrink-0', config.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm', !notification.read && 'font-medium')}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
