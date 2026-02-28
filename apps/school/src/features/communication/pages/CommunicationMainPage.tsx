import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Plus,
  Search,
  Megaphone,
  MessageSquare,
  FileText,
  ClipboardList,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Send,
  Users,
  User,
  Clock,
  BarChart,
  Play,
  Pause,
  MapPin,
  UserPlus,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { cn, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  useCommunicationStats,
  useAnnouncements,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
  useAcknowledgeAnnouncement,
  useConversations,
  useMessages,
  useSendMessage,
  useCirculars,
  useDeleteCircular,
  useUpdateCircular,
  useSurveys,
  useDeleteSurvey,
  useUpdateSurvey,
  useEmergencyAlerts,
  useUpdateEmergencyAlert,
  useAcknowledgeEmergencyAlert,
  useEvents,
  useDeleteEvent,
  useRegisterForEvent,
  useCancelEventRegistration,
} from '../hooks/useCommunication'
import { AnnouncementCard } from '../components/AnnouncementCard'
import { EmergencyAlertCard } from '../components/EmergencyAlertCard'
import { MessageThread } from '../components/MessageThread'
import {
  Announcement,
  AnnouncementStatus,
  AnnouncementPriority,
  Conversation,
  Circular,
  CircularStatus,
  Survey,
  SurveyStatus,
  AlertSeverity,
  AlertStatus,
  Event,
  EventStatus,
  EventType,
} from '../types/communication.types'

// Tab types
type PrimaryTab = 'dashboard' | 'announcements' | 'messages' | 'circulars' | 'surveys' | 'emergency' | 'events'

// Status configs
const circularStatusConfig: Record<CircularStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Published', variant: 'default' },
  archived: { label: 'Archived', variant: 'outline' },
}

const surveyStatusConfig: Record<SurveyStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  active: { label: 'Active', variant: 'default' },
  closed: { label: 'Closed', variant: 'outline' },
  archived: { label: 'Archived', variant: 'secondary' },
}

const eventStatusConfig: Record<EventStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  upcoming: { label: 'Upcoming', variant: 'default' },
  ongoing: { label: 'Ongoing', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
}

const eventTypeConfig: Record<EventType, { label: string; bgColor: string; textColor: string }> = {
  academic: { label: 'Academic', bgColor: 'var(--color-module-academic-light)', textColor: 'var(--color-module-academic)' },
  sports: { label: 'Sports', bgColor: 'var(--color-module-transport-light)', textColor: 'var(--color-module-transport)' },
  cultural: { label: 'Cultural', bgColor: 'var(--color-module-communication-light)', textColor: 'var(--color-module-communication)' },
  meeting: { label: 'Meeting', bgColor: 'var(--color-module-settings-light)', textColor: 'var(--color-module-settings)' },
  holiday: { label: 'Holiday', bgColor: 'var(--color-module-exams-light)', textColor: 'var(--color-module-exams)' },
  other: { label: 'Other', bgColor: 'var(--color-module-dashboard-light)', textColor: 'var(--color-module-dashboard)' },
}

const circularCategories = ['Academic', 'Administrative', 'Fee Related', 'Examination', 'Holiday', 'Events', 'General']

// ============================================
// Dashboard Tab Component
// ============================================
function DashboardTab() {
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
    { label: 'New Announcement', icon: Megaphone, href: '/communication/announcements/new', bgColor: 'var(--color-module-communication)' },
    { label: 'Send Message', icon: MessageSquare, href: '/communication?tab=messages', bgColor: 'var(--color-module-attendance)' },
    { label: 'New Circular', icon: FileText, href: '/communication/circulars/new', bgColor: 'var(--color-module-documents)' },
    { label: 'Create Survey', icon: ClipboardList, href: '/communication/surveys/new', bgColor: 'var(--color-module-reports)' },
    { label: 'Emergency Alert', icon: AlertTriangle, href: '/communication/alerts/new', bgColor: 'var(--color-module-exams)' },
    { label: 'New Event', icon: Calendar, href: '/communication/events/new', bgColor: 'var(--color-module-timetable)' },
  ]

  return (
    <div className="space-y-6">
      {/* Active Alerts Banner */}
      {alerts.length > 0 && (
        <Card style={{ backgroundColor: 'var(--color-module-exams-light)', borderColor: 'var(--color-module-exams)' }} className="border">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-module-exams-light)' }}>
                  <AlertTriangle className="h-5 w-5" style={{ color: 'var(--color-module-exams)' }} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-module-exams)' }}>
                    {alerts.length} Active Emergency Alert{alerts.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-module-exams)' }}>{alerts[0]?.title}</p>
                </div>
              </div>
              <Button variant="destructive" onClick={() => navigate('/communication?tab=emergency')}>
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
            <div className="p-2 rounded-lg text-white" style={{ backgroundColor: action.bgColor }}>
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/communication?tab=announcements')}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {announcements.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No announcements yet</p>
                <Button variant="link" onClick={() => navigate('/communication/announcements/new')}>
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/communication?tab=events')}>
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

// ============================================
// Announcements Tab Component
// ============================================
function AnnouncementsTab() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AnnouncementStatus | 'all'>('all')
  const [priority, setPriority] = useState<AnnouncementPriority | 'all'>('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: result, isLoading } = useAnnouncements({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    priority: priority !== 'all' ? priority : undefined,
    page,
    limit: 10,
  })

  const deleteMutation = useDeleteAnnouncement()
  const updateMutation = useUpdateAnnouncement()
  const acknowledgeMutation = useAcknowledgeAnnouncement()

  const announcements = result?.data || []
  const meta = result?.meta || { total: 0, totalPages: 1 }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({ title: 'Announcement deleted', description: 'The announcement has been deleted successfully.' })
      setDeleteId(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to delete announcement.', variant: 'destructive' })
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status: 'published' } })
      toast({ title: 'Announcement published', description: 'The announcement is now visible to the target audience.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to publish announcement.', variant: 'destructive' })
    }
  }

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeMutation.mutateAsync(id)
      toast({ title: 'Acknowledged', description: 'Your acknowledgement has been recorded.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to acknowledge announcement.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{meta.total} announcement{meta.total !== 1 ? 's' : ''}</p>
        <Button onClick={() => navigate('/communication/announcements/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as AnnouncementStatus | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => setPriority(v as AnnouncementPriority | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No announcements found</p>
          <Button onClick={() => navigate('/communication/announcements/new')}>Create your first announcement</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onView={(id) => navigate(`/communication/announcements/${id}`)}
              onEdit={(id) => navigate(`/communication/announcements/${id}/edit`)}
              onDelete={(id) => setDeleteId(id)}
              onPublish={handlePublish}
              onAcknowledge={handleAcknowledge}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================
// Messages Tab Component
// ============================================
function MessagesTab() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const currentUserId = 'current-user-id'

  const { data: conversationsResult, isLoading: conversationsLoading } = useConversations({
    search: search || undefined,
  })
  const { data: messagesResult, isLoading: messagesLoading } = useMessages(selectedConversation?.id || '', 1, 100)
  const sendMessageMutation = useSendMessage()

  const conversations = conversationsResult?.data || []
  const messages = messagesResult?.data || []

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return
    try {
      await sendMessageMutation.mutateAsync({ conversationId: selectedConversation.id, content })
    } catch {
      toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' })
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    if (conversation.type === 'direct') {
      return conversation.participants.find((p) => p.userId !== currentUserId)
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a New Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Search for a user..." />
              <p className="text-sm text-muted-foreground text-center py-4">
                Search for a teacher, parent, or staff member to start a conversation
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-340px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-72px)]">
            {conversationsLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new conversation to begin messaging</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation)
                  const isSelected = selectedConversation?.id === conversation.id

                  return (
                    <div
                      key={conversation.id}
                      className={cn(
                        'p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                        isSelected && 'bg-muted'
                      )}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={otherParticipant?.userAvatar} />
                          <AvatarFallback>
                            {conversation.type === 'direct'
                              ? getInitials(otherParticipant?.userName || '')
                              : conversation.title?.charAt(0) || 'G'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {conversation.type === 'direct' ? otherParticipant?.userName : conversation.title || 'Group Chat'}
                            </p>
                            {conversation.lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(conversation.lastMessage.createdAt), 'h:mm a')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {conversation.type === 'group' ? (
                              <Users className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <User className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {conversation.type === 'direct' ? otherParticipant?.userRole : `${conversation.participants.length} members`}
                            </span>
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <MessageThread
              conversation={selectedConversation}
              messages={messages}
              currentUserId={currentUserId}
              onSendMessage={handleSendMessage}
              isLoading={messagesLoading}
              isSending={sendMessageMutation.isPending}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the list to view messages</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ============================================
// Circulars Tab Component
// ============================================
function CircularsTab() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<CircularStatus | 'all'>('all')
  const [category, setCategory] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: result, isLoading } = useCirculars({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    category: category !== 'all' ? category : undefined,
    page,
    limit: 10,
  })

  const deleteMutation = useDeleteCircular()
  const updateMutation = useUpdateCircular()

  const circulars = result?.data || []
  const meta = result?.meta || { total: 0, totalPages: 1 }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({ title: 'Circular deleted', description: 'The circular has been deleted successfully.' })
      setDeleteId(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to delete circular.', variant: 'destructive' })
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status: 'published' } })
      toast({ title: 'Circular published', description: 'The circular is now available for download.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to publish circular.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{meta.total} circular{meta.total !== 1 ? 's' : ''}</p>
        <Button onClick={() => navigate('/communication/circulars/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Circular
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or reference number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as CircularStatus | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {circularCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      ) : circulars.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No circulars found</p>
          <Button onClick={() => navigate('/communication/circulars/new')}>Create your first circular</Button>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {circulars.map((circular) => {
                const statusInfo = circularStatusConfig[circular.status]
                return (
                  <TableRow key={circular.id}>
                    <TableCell className="font-mono text-sm">{circular.referenceNumber}</TableCell>
                    <TableCell>
                      <div
                        className="font-medium cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/communication/circulars/${circular.id}`)}
                      >
                        {circular.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{circular.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        {circular.downloadCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(circular.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/communication/circulars/${circular.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />View
                          </DropdownMenuItem>
                          {circular.attachments[0] && (
                            <DropdownMenuItem asChild>
                              <a href={circular.attachments[0].url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />Download
                              </a>
                            </DropdownMenuItem>
                          )}
                          {circular.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handlePublish(circular.id)}>
                              <Send className="h-4 w-4 mr-2" />Publish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => navigate(`/communication/circulars/${circular.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(circular.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Circular</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this circular? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================
// Surveys Tab Component
// ============================================
function SurveyCard({
  survey,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  survey: Survey
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: SurveyStatus) => void
}) {
  const statusInfo = surveyStatusConfig[survey.status]
  const responseRate = survey.totalTargeted > 0 ? Math.round((survey.responseCount / survey.totalTargeted) * 100) : 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold cursor-pointer hover:text-primary" onClick={() => onView?.(survey.id)}>
                {survey.title}
              </h3>
              <p className="text-sm text-muted-foreground">{survey.questions.length} questions</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(survey.id)}>
                <Eye className="h-4 w-4 mr-2" />View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onView?.(survey.id)}>
                <BarChart className="h-4 w-4 mr-2" />Results
              </DropdownMenuItem>
              {survey.status === 'draft' && (
                <DropdownMenuItem onClick={() => onStatusChange?.(survey.id, 'active')}>
                  <Play className="h-4 w-4 mr-2" />Activate
                </DropdownMenuItem>
              )}
              {survey.status === 'active' && (
                <DropdownMenuItem onClick={() => onStatusChange?.(survey.id, 'closed')}>
                  <Pause className="h-4 w-4 mr-2" />Close
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit?.(survey.id)}>
                <Edit className="h-4 w-4 mr-2" />Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(survey.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{survey.description}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Responses</span>
            <span className="font-medium">{survey.responseCount} / {survey.totalTargeted}</span>
          </div>
          <Progress value={responseRate} className="h-2" />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(survey.startsAt), 'MMM d')} - {format(new Date(survey.endsAt), 'MMM d')}</span>
          </div>
          {survey.anonymous && (
            <Badge variant="outline" className="text-xs">Anonymous</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          <span className="text-xs text-muted-foreground">Created by {survey.createdByName}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

function SurveysTab() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SurveyStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: result, isLoading } = useSurveys({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    page,
    limit: 10,
  })

  const deleteMutation = useDeleteSurvey()
  const updateMutation = useUpdateSurvey()

  const surveys = result?.data || []
  const meta = result?.meta || { total: 0, totalPages: 1 }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({ title: 'Survey deleted', description: 'The survey has been deleted successfully.' })
      setDeleteId(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to delete survey.', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (surveyId: string, newStatus: SurveyStatus) => {
    try {
      await updateMutation.mutateAsync({ id: surveyId, data: { status: newStatus } })
      toast({ title: 'Survey updated', description: `Survey status changed to ${newStatus}.` })
    } catch {
      toast({ title: 'Error', description: 'Failed to update survey.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{meta.total} survey{meta.total !== 1 ? 's' : ''}</p>
        <Button onClick={() => navigate('/communication/surveys/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Survey
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search surveys..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as SurveyStatus | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No surveys found</p>
          <Button onClick={() => navigate('/communication/surveys/new')}>Create your first survey</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {surveys.map((survey) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              onView={(id) => navigate(`/communication/surveys/${id}`)}
              onEdit={(id) => navigate(`/communication/surveys/${id}/edit`)}
              onDelete={(id) => setDeleteId(id)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Survey</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this survey? All responses will also be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================
// Emergency Alerts Tab Component
// ============================================
function EmergencyTab() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AlertStatus | 'all'>('all')
  const [severity, setSeverity] = useState<AlertSeverity | 'all'>('all')
  const [page, setPage] = useState(1)
  const [acknowledgeId, setAcknowledgeId] = useState<string | null>(null)
  const [acknowledgeStatus, setAcknowledgeStatus] = useState<'safe' | 'need_help'>('safe')
  const [acknowledgeLocation, setAcknowledgeLocation] = useState('')

  const { data: result, isLoading } = useEmergencyAlerts({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    severity: severity !== 'all' ? severity : undefined,
    page,
    limit: 10,
  })

  const updateMutation = useUpdateEmergencyAlert()
  const acknowledgeMutation = useAcknowledgeEmergencyAlert()

  const alerts = result?.data || []
  const meta = result?.meta || { total: 0, totalPages: 1 }

  const handleResolve = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status: 'resolved' } })
      toast({ title: 'Alert resolved', description: 'The emergency alert has been marked as resolved.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to resolve alert.', variant: 'destructive' })
    }
  }

  const handleAcknowledge = async () => {
    if (!acknowledgeId) return
    try {
      await acknowledgeMutation.mutateAsync({
        id: acknowledgeId,
        data: { status: acknowledgeStatus, location: acknowledgeLocation || undefined },
      })
      toast({ title: 'Acknowledged', description: 'Your status has been recorded.' })
      setAcknowledgeId(null)
      setAcknowledgeLocation('')
    } catch {
      toast({ title: 'Error', description: 'Failed to acknowledge alert.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{meta.total} alert{meta.total !== 1 ? 's' : ''}</p>
        <Button variant="destructive" onClick={() => navigate('/communication/alerts/new')}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          New Alert
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search alerts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as AlertStatus | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={(v) => setSeverity(v as AlertSeverity | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No emergency alerts found</p>
          <Button variant="destructive" onClick={() => navigate('/communication/alerts/new')}>
            Create Emergency Alert
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <EmergencyAlertCard
              key={alert.id}
              alert={alert}
              onView={(id) => navigate(`/communication/alerts/${id}`)}
              onResolve={handleResolve}
              onAcknowledge={(id) => setAcknowledgeId(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* Acknowledge Dialog */}
      <Dialog open={!!acknowledgeId} onOpenChange={() => setAcknowledgeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge Emergency Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your Status</Label>
              <RadioGroup value={acknowledgeStatus} onValueChange={(v) => setAcknowledgeStatus(v as 'safe' | 'need_help')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="safe" id="safe" />
                  <Label htmlFor="safe" className="text-green-600">I'm Safe</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="need_help" id="need_help" />
                  <Label htmlFor="need_help" className="text-red-600">I Need Help</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Current Location (Optional)</Label>
              <Textarea
                id="location"
                placeholder="Enter your current location..."
                value={acknowledgeLocation}
                onChange={(e) => setAcknowledgeLocation(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAcknowledgeId(null)}>Cancel</Button>
              <Button onClick={handleAcknowledge}>Submit Response</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// Events Tab Component
// ============================================
function EventCard({
  event,
  onView,
  onEdit,
  onDelete,
  onRegister,
}: {
  event: Event
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onRegister?: (id: string) => void
}) {
  const statusInfo = eventStatusConfig[event.status]
  const typeInfo = eventTypeConfig[event.type]
  const isUpcoming = event.status === 'upcoming'
  const isFull = event.maxAttendees ? event.registrations.length >= event.maxAttendees : false

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <div className="bg-primary text-primary-foreground p-3 text-center">
        <p className="text-sm font-medium">{format(new Date(event.startsAt), 'EEEE')}</p>
        <p className="text-3xl font-bold">{format(new Date(event.startsAt), 'd')}</p>
        <p className="text-sm">{format(new Date(event.startsAt), 'MMMM yyyy')}</p>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold cursor-pointer hover:text-primary" onClick={() => onView?.(event.id)}>
              {event.title}
            </h3>
            <div className="flex items-center gap-2">
              <Badge style={{ backgroundColor: typeInfo.bgColor, color: typeInfo.textColor }}>{typeInfo.label}</Badge>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(event.id)}>
                <Eye className="h-4 w-4 mr-2" />View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(event.id)}>
                <Edit className="h-4 w-4 mr-2" />Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(event.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(event.startsAt), 'h:mm a')} - {format(new Date(event.endsAt), 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{event.venue}</span>
          </div>
          {event.registrationRequired && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{event.registrations.length}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''} registered</span>
            </div>
          )}
        </div>
      </CardContent>
      {event.registrationRequired && isUpcoming && (
        <CardFooter className="pt-0">
          {isFull ? (
            <Button variant="outline" className="w-full" disabled>Event Full</Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => onRegister?.(event.id)}>
              <UserPlus className="h-4 w-4 mr-2" />Register
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

function EventsTab() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<EventStatus | 'all'>('all')
  const [type, setType] = useState<EventType | 'all'>('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: result, isLoading } = useEvents({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    type: type !== 'all' ? type : undefined,
    page,
    limit: 12,
  })

  const deleteMutation = useDeleteEvent()
  const registerMutation = useRegisterForEvent()

  const events = result?.data || []
  const meta = result?.meta || { total: 0, totalPages: 1 }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({ title: 'Event deleted', description: 'The event has been deleted successfully.' })
      setDeleteId(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to delete event.', variant: 'destructive' })
    }
  }

  const handleRegister = async (eventId: string) => {
    try {
      await registerMutation.mutateAsync(eventId)
      toast({ title: 'Registered', description: 'You have been registered for this event.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to register for event.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{meta.total} event{meta.total !== 1 ? 's' : ''}</p>
        <Button onClick={() => navigate('/communication/events/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as EventStatus | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => setType(v as EventType | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="cultural">Cultural</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="holiday">Holiday</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No events found</p>
          <Button onClick={() => navigate('/communication/events/new')}>Create your first event</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onView={(id) => navigate(`/communication/events/${id}`)}
              onEdit={(id) => navigate(`/communication/events/${id}/edit`)}
              onDelete={(id) => setDeleteId(id)}
              onRegister={handleRegister}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================
// Main CommunicationMainPage Component
// ============================================
export function CommunicationMainPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { hasRole } = useAuthStore()

  // Check if user can see emergency tab (admin/principal only)
  const canSeeEmergency = hasRole(['admin', 'principal'])

  // Primary tab
  const activeTab = (searchParams.get('tab') as PrimaryTab) || 'dashboard'

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  return (
    <div>
      <PageHeader
        title="Communication Portal"
        description="Manage all school communications in one place"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Communication' }]}
        moduleColor="communication"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className={cn('grid w-full', canSeeEmergency ? 'grid-cols-7' : 'grid-cols-6')}>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 hidden sm:block" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 hidden sm:block" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 hidden sm:block" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="circulars" className="flex items-center gap-2">
            <FileText className="h-4 w-4 hidden sm:block" />
            Circulars
          </TabsTrigger>
          <TabsTrigger value="surveys" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 hidden sm:block" />
            Surveys
          </TabsTrigger>
          {canSeeEmergency && (
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 hidden sm:block" />
              Emergency
            </TabsTrigger>
          )}
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 hidden sm:block" />
            Events
          </TabsTrigger>
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
    </div>
  )
}
