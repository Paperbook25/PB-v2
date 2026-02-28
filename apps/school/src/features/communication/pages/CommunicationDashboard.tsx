import { useNavigate } from 'react-router-dom'
import {
  Megaphone,
  MessageSquare,
  FileText,
  ClipboardList,
  AlertTriangle,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  Bell,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCommunicationStats,
  useAnnouncements,
  useEmergencyAlerts,
  useEvents,
} from '../hooks/useCommunication'
import { AnnouncementCard } from '../components/AnnouncementCard'
import { EmergencyAlertCard } from '../components/EmergencyAlertCard'
import { format } from 'date-fns'
import { moduleColors, statusColors, communicationActionColors } from '@/lib/design-tokens'

export function CommunicationDashboard() {
  const navigate = useNavigate()
  const { data: statsResult, isLoading: statsLoading } = useCommunicationStats()
  const { data: announcementsResult } = useAnnouncements({ status: 'published', limit: 3 })
  const { data: alertsResult } = useEmergencyAlerts({ status: 'active', limit: 3 })
  const { data: eventsResult } = useEvents({ status: 'upcoming', limit: 4 })

  const stats = statsResult?.data
  const announcements = announcementsResult?.data || []
  const alerts = alertsResult?.data || []
  const upcomingEvents = eventsResult?.data || []

  const quickActions = [
    {
      label: 'New Announcement',
      icon: Megaphone,
      href: '/communication/announcements/new',
      bgColor: moduleColors.communication,
    },
    {
      label: 'Send Message',
      icon: MessageSquare,
      href: '/communication/messages',
      bgColor: statusColors.success,
    },
    {
      label: 'New Circular',
      icon: FileText,
      href: '/communication/circulars/new',
      bgColor: moduleColors.integrations,
    },
    {
      label: 'Create Survey',
      icon: ClipboardList,
      href: '/communication/surveys/new',
      bgColor: moduleColors.behavior,
    },
    {
      label: 'Emergency Alert',
      icon: AlertTriangle,
      href: '/communication/alerts/new',
      bgColor: statusColors.error,
    },
    {
      label: 'New Event',
      icon: Calendar,
      href: '/communication/events/new',
      bgColor: moduleColors.library,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication Portal"
        description="Manage all school communications in one place"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Communication' },
        ]}
      />

      {/* Active Alerts Banner */}
      {alerts.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-800">
                    {alerts.length} Active Emergency Alert{alerts.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-red-600">
                    {alerts[0]?.title}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => navigate('/communication/alerts')}
              >
                View Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => navigate(action.href)}
          >
            <div
              className="p-2 rounded-lg text-white"
              style={{ backgroundColor: action.bgColor }}
            >
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.announcements.published || 0}</p>
                    <p className="text-sm text-muted-foreground">Published</p>
                  </div>
                  <Megaphone className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.messages.unreadCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Unread Messages</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.circulars.published || 0}</p>
                    <p className="text-sm text-muted-foreground">Circulars</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.surveys.active || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Surveys</p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.alerts.active || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats?.events.upcoming || 0}</p>
                    <p className="text-sm text-muted-foreground">Upcoming Events</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Announcements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Announcements</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/communication/announcements')}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {announcements.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No announcements yet</p>
                <Button
                  variant="link"
                  onClick={() => navigate('/communication/announcements/new')}
                >
                  Create your first announcement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onView={(id) => navigate(`/communication/announcements/${id}`)}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/communication/events')}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {upcomingEvents.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming events</p>
                </div>
              ) : (
                <div className="divide-y">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/communication/events/${event.id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                          <span className="text-xs font-medium text-primary">
                            {format(new Date(event.startsAt), 'MMM')}
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {format(new Date(event.startsAt), 'd')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(event.startsAt), 'h:mm a')}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                            {event.registrationRequired && (
                              <span className="text-xs text-muted-foreground">
                                {event.registrations.length} registered
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
