import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  Clock,
  MoreHorizontal,
  Check,
  X,
  Video,
  MapPin,
  Plus,
} from 'lucide-react'
import { useMeetings, useConfirmMeeting, useCancelMeeting } from '../hooks/useParentPortal'
import type { Meeting, MeetingFilters, MeetingStatus, MeetingType } from '../types/parent-portal.types'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface MeetingsListProps {
  onSchedule: () => void
  onViewDetails: (meeting: Meeting) => void
}

export function MeetingsList({ onSchedule, onViewDetails }: MeetingsListProps) {
  const { toast } = useToast()
  const [filters, setFilters] = useState<MeetingFilters>({
    status: undefined,
    page: 1,
    limit: 10,
  })

  const { data: result, isLoading } = useMeetings(filters)
  const confirmMutation = useConfirmMeeting()
  const cancelMutation = useCancelMeeting()

  const meetings = result?.data ?? []
  const meta = result?.meta

  const handleConfirm = async (id: string) => {
    try {
      await confirmMutation.mutateAsync(id)
      toast({ title: 'Meeting Confirmed', description: 'The meeting has been confirmed.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to confirm meeting.', variant: 'destructive' })
    }
  }

  const handleCancel = async (id: string) => {
    const reason = prompt('Please provide a reason for cancellation:')
    if (reason === null) return

    try {
      await cancelMutation.mutateAsync({ id, reason })
      toast({ title: 'Meeting Cancelled', description: 'The meeting has been cancelled.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel meeting.', variant: 'destructive' })
    }
  }

  const getStatusBadge = (status: MeetingStatus) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>
      case 'confirmed':
        return <Badge style={{ backgroundColor: 'var(--color-status-info-light)', color: 'var(--color-status-info)' }}>Confirmed</Badge>
      case 'completed':
        return <Badge style={{ backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' }}>Completed</Badge>
      case 'cancelled':
        return <Badge style={{ backgroundColor: 'var(--color-status-error-light)', color: 'var(--color-status-error)' }}>Cancelled</Badge>
      case 'no_show':
        return <Badge variant="outline">No Show</Badge>
      default:
        return null
    }
  }

  const getTypeBadge = (type: MeetingType) => {
    const colors: Record<MeetingType, string> = {
      ptm: 'bg-purple-100 text-purple-800',
      academic: 'bg-blue-100 text-blue-800',
      disciplinary: 'bg-red-100 text-red-800',
      counseling: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return <Badge className={colors[type]}>{type.toUpperCase()}</Badge>
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Meetings
        </CardTitle>
        <Button onClick={onSchedule}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                status: value === 'all' ? undefined : (value as MeetingStatus),
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No meetings found
                </TableCell>
              </TableRow>
            ) : (
              meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {format(new Date(meeting.scheduledAt), 'MMM d, yyyy')}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(meeting.scheduledAt), 'h:mm a')} ({meeting.duration} min)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(meeting.type)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{meeting.subject}</TableCell>
                  <TableCell>{meeting.teacherName}</TableCell>
                  <TableCell>
                    {meeting.studentName}
                    <span className="text-sm text-muted-foreground block">
                      {meeting.studentClass} - {meeting.studentSection}
                    </span>
                  </TableCell>
                  <TableCell>
                    {meeting.meetingLink ? (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Video className="h-3 w-3" />
                        Online
                      </span>
                    ) : meeting.venue ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {meeting.venue}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">TBD</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(meeting.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(meeting)}>
                          View Details
                        </DropdownMenuItem>
                        {meeting.status === 'scheduled' && (
                          <DropdownMenuItem onClick={() => handleConfirm(meeting.id)}>
                            <Check className="h-4 w-4 mr-2" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        {(meeting.status === 'scheduled' || meeting.status === 'confirmed') && (
                          <DropdownMenuItem
                            onClick={() => handleCancel(meeting.id)}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        {meeting.meetingLink && (
                          <DropdownMenuItem
                            onClick={() => window.open(meeting.meetingLink, '_blank')}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === 1}
                onClick={() => setFilters({ ...filters, page: meta.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === meta.totalPages}
                onClick={() => setFilters({ ...filters, page: meta.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
