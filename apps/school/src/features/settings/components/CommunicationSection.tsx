import { useNavigate } from 'react-router-dom'
import {
  Megaphone,
  MessageSquare,
  FileText,
  ClipboardList,
  AlertTriangle,
  Calendar,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  useCommunicationStats,
  useAnnouncements,
  useEmergencyAlerts,
  useEvents,
  useCirculars,
  useSurveys,
  useConversations,
} from '@/features/communication/hooks/useCommunication'
import type { CommunicationTab } from '../types/settings.types'
import { cn } from '@/lib/utils'

interface CommunicationSectionProps {
  activeTab: CommunicationTab
  onTabChange: (tab: CommunicationTab) => void
}

export function CommunicationSection({ activeTab, onTabChange }: CommunicationSectionProps) {
  const { hasRole } = useAuthStore()
  const canSeeEmergency = hasRole(['admin', 'principal'])

  const tabs = [
    { value: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { value: 'announcements' as const, label: 'Announcements', icon: Megaphone },
    { value: 'messages' as const, label: 'Messages', icon: MessageSquare },
    { value: 'circulars' as const, label: 'Circulars', icon: FileText },
    { value: 'surveys' as const, label: 'Surveys', icon: ClipboardList },
    ...(canSeeEmergency ? [{ value: 'emergency' as const, label: 'Emergency', icon: AlertTriangle }] : []),
    { value: 'events' as const, label: 'Events', icon: Calendar },
  ]

  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as CommunicationTab)}>
      <TabsList variant="secondary" className="flex flex-wrap w-full">
        {tabs.map((tab) => (
          <TabsTrigger variant="secondary" key={tab.value} value={tab.value} className="flex items-center gap-2">
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-6">
        <TabsContent value="dashboard" className="mt-0">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="announcements" className="mt-0">
          <AnnouncementsTab />
        </TabsContent>

        <TabsContent value="messages" className="mt-0">
          <MessagesTab />
        </TabsContent>

        <TabsContent value="circulars" className="mt-0">
          <CircularsTab />
        </TabsContent>

        <TabsContent value="surveys" className="mt-0">
          <SurveysTab />
        </TabsContent>

        {canSeeEmergency && (
          <TabsContent value="emergency" className="mt-0">
            <EmergencyTab />
          </TabsContent>
        )}

        <TabsContent value="events" className="mt-0">
          <EventsTab />
        </TabsContent>
      </div>
    </Tabs>
  )
}

// Dashboard Tab
function DashboardTab() {
  const navigate = useNavigate()
  const { data: statsResult, isLoading: statsLoading } = useCommunicationStats()
  const { data: alertsResult } = useEmergencyAlerts({ status: 'active', limit: 3 })

  const stats = statsResult?.data
  const alerts = alertsResult?.data || []

  const quickActions = [
    { label: 'New Announcement', icon: Megaphone, href: '/communication/announcements/new', color: 'bg-blue-500' },
    { label: 'Send Message', icon: MessageSquare, href: '/settings?section=communication&tab=messages', color: 'bg-green-500' },
    { label: 'New Circular', icon: FileText, href: '/communication/circulars/new', color: 'bg-purple-500' },
    { label: 'Create Survey', icon: ClipboardList, href: '/communication/surveys/new', color: 'bg-orange-500' },
    { label: 'Emergency Alert', icon: AlertTriangle, href: '/communication/alerts/new', color: 'bg-red-500' },
    { label: 'New Event', icon: Calendar, href: '/communication/events/new', color: 'bg-teal-500' },
  ]

  return (
    <div className="space-y-6">
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
                  <p className="text-sm text-red-600">{alerts[0]?.title}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Megaphone className="h-4 w-4" />
                  <span className="text-sm">Active Announcements</span>
                </div>
                <p className="text-2xl font-bold">{stats?.announcements?.published || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Unread Messages</span>
                </div>
                <p className="text-2xl font-bold">{stats?.messages?.unreadCount || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <ClipboardList className="h-4 w-4" />
                  <span className="text-sm">Active Surveys</span>
                </div>
                <p className="text-2xl font-bold">{stats?.surveys?.active || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Upcoming Events</span>
                </div>
                <p className="text-2xl font-bold">{stats?.events?.upcoming || 0}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-4 justify-start gap-3"
                onClick={() => navigate(action.href)}
              >
                <div className={cn('p-2 rounded-lg text-white', action.color)}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Announcements Tab
function AnnouncementsTab() {
  const navigate = useNavigate()
  const { data: result, isLoading } = useAnnouncements({ limit: 20 })
  const announcements = result?.data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Announcements</h3>
        <Button onClick={() => navigate('/communication/announcements/new')}>
          <Megaphone className="mr-2 h-4 w-4" /> New Announcement
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No announcements found</h3>
            <p className="text-muted-foreground mb-4">Create your first announcement to get started</p>
            <Button onClick={() => navigate('/communication/announcements/new')}>
              Create Announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{announcement.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{announcement.content}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Messages Tab
function MessagesTab() {
  const { data: result, isLoading } = useConversations()
  const conversations = result?.data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Messages</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
            <p className="text-muted-foreground">Start a conversation to communicate with staff and parents</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <Card key={conversation.id} className="cursor-pointer hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Conversation {conversation.id.slice(-4)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {conversation.unreadCount > 0 && (
                        <span className="text-primary font-medium">{conversation.unreadCount} unread • </span>
                      )}
                      {conversation.participants.length} participants
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Circulars Tab
function CircularsTab() {
  const navigate = useNavigate()
  const { data: result, isLoading } = useCirculars()
  const circulars = result?.data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Circulars</h3>
        <Button onClick={() => navigate('/communication/circulars/new')}>
          <FileText className="mr-2 h-4 w-4" /> New Circular
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : circulars.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No circulars found</h3>
            <p className="text-muted-foreground mb-4">Create your first circular to get started</p>
            <Button onClick={() => navigate('/communication/circulars/new')}>
              Create Circular
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {circulars.map((circular) => (
            <Card key={circular.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{circular.title}</h4>
                    <p className="text-sm text-muted-foreground">{circular.category}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Surveys Tab
function SurveysTab() {
  const navigate = useNavigate()
  const { data: result, isLoading } = useSurveys()
  const surveys = result?.data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Surveys</h3>
        <Button onClick={() => navigate('/communication/surveys/new')}>
          <ClipboardList className="mr-2 h-4 w-4" /> New Survey
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : surveys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No surveys found</h3>
            <p className="text-muted-foreground mb-4">Create your first survey to gather feedback</p>
            <Button onClick={() => navigate('/communication/surveys/new')}>
              Create Survey
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {surveys.map((survey) => (
            <Card key={survey.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{survey.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {survey.responseCount} responses • {survey.status}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Emergency Tab
function EmergencyTab() {
  const { data: result, isLoading } = useEmergencyAlerts()
  const alerts = result?.data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Emergency Alerts</h3>
        <Button variant="destructive">
          <AlertTriangle className="mr-2 h-4 w-4" /> New Alert
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No emergency alerts</h3>
            <p className="text-muted-foreground">Emergency alerts will appear here when created</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className={alert.status === 'active' ? 'border-red-300 bg-red-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {alert.severity} • {alert.status}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Events Tab
function EventsTab() {
  const { data: result, isLoading } = useEvents()
  const events = result?.data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Events</h3>
        <Button>
          <Calendar className="mr-2 h-4 w-4" /> New Event
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No events scheduled</h3>
            <p className="text-muted-foreground mb-4">Create an event to share with your school community</p>
            <Button>Create Event</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {event.type} • {event.venue} • {event.status}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
