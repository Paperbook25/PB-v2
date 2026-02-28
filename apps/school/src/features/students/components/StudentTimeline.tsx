import { formatDistanceToNow } from 'date-fns'
import {
  IndianRupee,
  ClipboardCheck,
  BookOpen,
  Award,
  Calendar,
  FileText,
  User,
  GraduationCap,
  ArrowUpCircle,
  ArrowRightCircle,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useStudentTimeline } from '../hooks/useStudents'
import type { TimelineEvent, TimelineEventType } from '../types/student.types'
import { timelineColors, statusColors, moduleColors } from '@/lib/design-tokens'

interface StudentTimelineProps {
  studentId: string
}

const EVENT_ICON_MAP: Record<TimelineEventType, LucideIcon> = {
  fee_paid: IndianRupee,
  attendance_marked: ClipboardCheck,
  book_issued: BookOpen,
  book_returned: BookOpen,
  marks_entered: Award,
  leave_applied: Calendar,
  document_uploaded: FileText,
  profile_updated: User,
  admission: GraduationCap,
  promotion: ArrowUpCircle,
  transfer: ArrowRightCircle,
}

const EVENT_COLOR_STYLE_MAP: Record<TimelineEventType, { bg: string; text: string }> = {
  fee_paid: { bg: timelineColors.feePaidLight, text: timelineColors.feePaid },
  attendance_marked: { bg: timelineColors.attendanceMarkedLight, text: timelineColors.attendanceMarked },
  book_issued: { bg: timelineColors.bookIssuedLight, text: timelineColors.bookIssued },
  book_returned: { bg: timelineColors.bookIssuedLight, text: timelineColors.bookIssued },
  marks_entered: { bg: timelineColors.gradeUpdatedLight, text: timelineColors.gradeUpdated },
  leave_applied: { bg: moduleColors.behaviorLight, text: moduleColors.behavior },
  document_uploaded: { bg: timelineColors.documentUploadedLight, text: timelineColors.documentUploaded },
  profile_updated: { bg: statusColors.inactiveLight, text: statusColors.inactive },
  admission: { bg: moduleColors.admissionsLight, text: moduleColors.admissions },
  promotion: { bg: moduleColors.lmsLight, text: moduleColors.lms },
  transfer: { bg: statusColors.errorLight, text: statusColors.error },
}

function TimelineItem({ event }: { event: TimelineEvent }) {
  const Icon = EVENT_ICON_MAP[event.type] ?? Clock
  const colorStyle = EVENT_COLOR_STYLE_MAP[event.type] ?? { bg: statusColors.inactiveLight, text: statusColors.inactive }

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Connecting line */}
      <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border last:hidden" />

      {/* Icon */}
      <div
        className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: colorStyle.bg, color: colorStyle.text }}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium leading-tight">{event.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {event.description}
            </p>
          </div>
          <time className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(event.timestamp), {
              addSuffix: true,
            })}
          </time>
        </div>
      </div>
    </div>
  )
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-16 shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function StudentTimeline({ studentId }: StudentTimelineProps) {
  const { data: eventsResponse, isLoading, isError } = useStudentTimeline(studentId)
  const events = eventsResponse?.data

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TimelineSkeleton />
        ) : isError ? (
          <div className="text-center py-8 text-destructive text-sm">
            Failed to load timeline. Please try again.
          </div>
        ) : !events || events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Clock className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-xs mt-1">
              Student activity will appear here as events occur.
            </p>
          </div>
        ) : (
          <div>
            {events.map((event: TimelineEvent) => (
              <TimelineItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
