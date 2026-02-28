import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Video,
  ExternalLink,
  Play,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useEvents, useCreateEvent, useUpdateEventStatus } from '../hooks/useAlumni'
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS, type EventType, type EventStatus } from '../types/alumni.types'
import { useToast } from '@/hooks/use-toast'

export function EventsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: eventsResult, isLoading } = useEvents({
    type: typeFilter && typeFilter !== 'all' ? typeFilter as EventType : undefined,
    status: statusFilter && statusFilter !== 'all' ? statusFilter as EventStatus : undefined,
  })
  const createEvent = useCreateEvent()
  const updateStatus = useUpdateEventStatus()
  const { toast } = useToast()

  const events = eventsResult?.data || []

  type Event = typeof events extends (infer U)[] ? U : never

  // Generate batch options
  const currentYear = new Date().getFullYear()
  const batches = Array.from({ length: 15 }, (_, i) => String(currentYear - i))

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'meet' as EventType,
    date: '',
    venue: '',
    isVirtual: false,
    meetingLink: '',
    targetBatches: [] as string[],
    maxCapacity: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createEvent.mutateAsync({
        ...formData,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined,
      })
      toast({ title: 'Event created successfully' })
      setIsDialogOpen(false)
      setFormData({
        title: '',
        description: '',
        type: 'meet',
        date: '',
        venue: '',
        isVirtual: false,
        meetingLink: '',
        targetBatches: [],
        maxCapacity: '',
      })
    } catch {
      toast({ title: 'Failed to create event', variant: 'destructive' })
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: EventStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus })
      toast({ title: `Event ${EVENT_STATUS_LABELS[newStatus].toLowerCase()}` })
    } catch {
      toast({ title: 'Failed to update event', variant: 'destructive' })
    }
  }

  const toggleBatch = (batch: string) => {
    setFormData((prev) => ({
      ...prev,
      targetBatches: prev.targetBatches.includes(batch)
        ? prev.targetBatches.filter((b) => b !== batch)
        : [...prev.targetBatches, batch],
    }))
  }

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: EventType) => {
    switch (type) {
      case 'reunion':
        return 'bg-purple-100 text-purple-800'
      case 'meet':
        return 'bg-blue-100 text-blue-800'
      case 'webinar':
        return 'bg-cyan-100 text-cyan-800'
      case 'fundraiser':
        return 'bg-pink-100 text-pink-800'
      case 'sports':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <PageHeader
        title="Alumni Events"
        description="Manage reunions, meets, and alumni gatherings"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Alumni', href: '/alumni' },
          { label: 'Events' },
        ]}
      />

      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Event</DialogTitle>
                      <DialogDescription>
                        Schedule a new alumni event or gathering
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label>Event Title *</Label>
                          <Input
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="e.g., Annual Alumni Reunion 2024"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Type *</Label>
                            <Select
                              value={formData.type}
                              onValueChange={(v) =>
                                setFormData({ ...formData, type: v as EventType })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Date *</Label>
                            <Input
                              type="date"
                              value={formData.date}
                              onChange={(e) =>
                                setFormData({ ...formData, date: e.target.value })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Venue</Label>
                            <Input
                              value={formData.venue}
                              onChange={(e) =>
                                setFormData({ ...formData, venue: e.target.value })
                              }
                              placeholder="Location or address"
                            />
                          </div>
                          <div>
                            <Label>Max Capacity</Label>
                            <Input
                              type="number"
                              value={formData.maxCapacity}
                              onChange={(e) =>
                                setFormData({ ...formData, maxCapacity: e.target.value })
                              }
                              placeholder="Leave empty for unlimited"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="isVirtual"
                              checked={formData.isVirtual}
                              onChange={(e) =>
                                setFormData({ ...formData, isVirtual: e.target.checked })
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="isVirtual" className="font-normal">
                              Virtual / Online Event
                            </Label>
                          </div>
                        </div>
                        {formData.isVirtual && (
                          <div>
                            <Label>Meeting Link</Label>
                            <Input
                              value={formData.meetingLink}
                              onChange={(e) =>
                                setFormData({ ...formData, meetingLink: e.target.value })
                              }
                              placeholder="https://meet.google.com/..."
                            />
                          </div>
                        )}
                        <div>
                          <Label>Target Batches</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {batches.slice(0, 10).map((batch) => (
                              <Badge
                                key={batch}
                                variant={
                                  formData.targetBatches.includes(batch) ? 'default' : 'outline'
                                }
                                className="cursor-pointer"
                                onClick={() => toggleBatch(batch)}
                              >
                                {batch}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Leave empty to invite all batches
                          </p>
                        </div>
                        <div>
                          <Label>Description *</Label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Event details and agenda"
                            rows={3}
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createEvent.isPending}>
                          {createEvent.isPending ? 'Creating...' : 'Create Event'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                No events found. Create your first event.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event: Event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Badge className={getTypeColor(event.type)}>
                      {EVENT_TYPE_LABELS[event.type]}
                    </Badge>
                    <Badge className={getStatusColor(event.status)}>
                      {EVENT_STATUS_LABELS[event.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.venue}
                      </div>
                    )}
                    {event.isVirtual && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Video className="h-4 w-4" />
                        Virtual Event
                        {event.meetingLink && (
                          <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center"
                          >
                            Join <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {event.registeredCount} registered
                      {event.maxCapacity && ` / ${event.maxCapacity} max`}
                    </div>
                  </div>

                  {event.targetBatches.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {event.targetBatches.slice(0, 4).map((batch: string) => (
                        <Badge key={batch} variant="outline" className="text-xs">
                          {batch}
                        </Badge>
                      ))}
                      {event.targetBatches.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{event.targetBatches.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {event.status === 'upcoming' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(event.id, 'ongoing')}
                        disabled={updateStatus.isPending}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(event.id, 'cancelled')}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                  {event.status === 'ongoing' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(event.id, 'completed')}
                      disabled={updateStatus.isPending}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Completed
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
