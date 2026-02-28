import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Video, Users, ExternalLink, Calendar, Clock } from 'lucide-react'
import type { LiveClass } from '../types/lms.types'
import { LIVE_CLASS_STATUS_LABELS } from '../types/lms.types'
import { liveClassStatusColors } from '@/lib/design-tokens'

interface LiveClassCardProps {
  liveClass: LiveClass
}

export function LiveClassCard({ liveClass }: LiveClassCardProps) {
  const scheduledDate = new Date(liveClass.scheduledAt)
  const formattedDate = scheduledDate.toLocaleDateString('en-IN')
  const formattedTime = scheduledDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const canJoin = liveClass.status === 'scheduled' || liveClass.status === 'live'
  const hasRecording = liveClass.status === 'completed' && !!liveClass.recordingUrl

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="font-semibold line-clamp-1">{liveClass.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {liveClass.instructorName}
            </p>
          </div>
          <Badge
            variant="outline"
            className={liveClass.status === 'live' ? 'animate-pulse' : ''}
            style={{
              backgroundColor: liveClassStatusColors[liveClass.status]?.bg,
              color: liveClassStatusColors[liveClass.status]?.text,
            }}
          >
            {LIVE_CLASS_STATUS_LABELS[liveClass.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Course name */}
        <p className="text-sm text-muted-foreground">{liveClass.courseName}</p>

        {/* Date, time, and duration */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formattedTime}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {liveClass.duration} min
          </Badge>
        </div>

        {/* Attendance count */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{liveClass.attendanceCount} attendees</span>
        </div>

        {/* Action buttons */}
        <div className="pt-1">
          {canJoin && (
            <Button size="sm" className="w-full" asChild>
              <a
                href={liveClass.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Video className="h-4 w-4 mr-2" />
                Join Meeting
                <ExternalLink className="h-3.5 w-3.5 ml-2" />
              </a>
            </Button>
          )}

          {hasRecording && (
            <Button size="sm" variant="outline" className="w-full" asChild>
              <a
                href={liveClass.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Video className="h-4 w-4 mr-2" />
                Watch Recording
                <ExternalLink className="h-3.5 w-3.5 ml-2" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
