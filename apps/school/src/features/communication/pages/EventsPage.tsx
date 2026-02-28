import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useEvents,
  useDeleteEvent,
  useRegisterForEvent,
  useCancelEventRegistration,
} from '../hooks/useCommunication'
import { Event, EventStatus, EventType } from '../types/communication.types'
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

const statusConfig: Record<
  EventStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  upcoming: { label: 'Upcoming', variant: 'default' },
  ongoing: { label: 'Ongoing', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
}

const typeConfig: Record<EventType, { label: string; color: string }> = {
  academic: { label: 'Academic', color: 'bg-blue-100 text-blue-800' },
  sports: { label: 'Sports', color: 'bg-green-100 text-green-800' },
  cultural: { label: 'Cultural', color: 'bg-purple-100 text-purple-800' },
  meeting: { label: 'Meeting', color: 'bg-yellow-100 text-yellow-800' },
  holiday: { label: 'Holiday', color: 'bg-red-100 text-red-800' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800' },
}

export function EventsPage() {
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
  const cancelRegistrationMutation = useCancelEventRegistration()

  const events = result?.data || []
  const meta = result?.meta || { total: 0, totalPages: 1 }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({
        title: 'Event deleted',
        description: 'The event has been deleted successfully.',
      })
      setDeleteId(null)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete event.',
        variant: 'destructive',
      })
    }
  }

  const handleRegister = async (eventId: string) => {
    try {
      await registerMutation.mutateAsync(eventId)
      toast({
        title: 'Registered',
        description: 'You have been registered for this event.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to register for event.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelRegistration = async (eventId: string) => {
    try {
      await cancelRegistrationMutation.mutateAsync(eventId)
      toast({
        title: 'Registration cancelled',
        description: 'Your registration has been cancelled.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to cancel registration.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Create and manage school events"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Communication', href: '/communication' },
          { label: 'Events' },
        ]}
        actions={
          <Button onClick={() => navigate('/communication/events/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as EventStatus | 'all')}
        >
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
        <Select
          value={type}
          onValueChange={(v) => setType(v as EventType | 'all')}
        >
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
          <Button onClick={() => navigate('/communication/events/new')}>
            Create your first event
          </Button>
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
              onCancelRegistration={handleCancelRegistration}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
          >
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

interface EventCardProps {
  event: Event
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onRegister?: (id: string) => void
  onCancelRegistration?: (id: string) => void
}

function EventCard({
  event,
  onView,
  onEdit,
  onDelete,
  onRegister,
  onCancelRegistration,
}: EventCardProps) {
  const statusInfo = statusConfig[event.status]
  const typeInfo = typeConfig[event.type]
  const isUpcoming = event.status === 'upcoming'
  const isFull = event.maxAttendees
    ? event.registrations.length >= event.maxAttendees
    : false

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      {/* Date Header */}
      <div className="bg-primary text-primary-foreground p-3 text-center">
        <p className="text-sm font-medium">
          {format(new Date(event.startsAt), 'EEEE')}
        </p>
        <p className="text-3xl font-bold">
          {format(new Date(event.startsAt), 'd')}
        </p>
        <p className="text-sm">
          {format(new Date(event.startsAt), 'MMMM yyyy')}
        </p>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3
              className="font-semibold cursor-pointer hover:text-primary"
              onClick={() => onView?.(event.id)}
            >
              {event.title}
            </h3>
            <div className="flex items-center gap-2">
              <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
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
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(event.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(event.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(event.startsAt), 'h:mm a')} -{' '}
              {format(new Date(event.endsAt), 'h:mm a')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{event.venue}</span>
          </div>
          {event.registrationRequired && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {event.registrations.length}
                {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} registered
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {event.registrationRequired && isUpcoming && (
        <CardFooter className="pt-0">
          {isFull ? (
            <Button variant="outline" className="w-full" disabled>
              Event Full
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onRegister?.(event.id)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Register
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
