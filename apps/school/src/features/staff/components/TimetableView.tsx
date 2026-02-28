import { useMemo } from 'react'
import { Clock, BookOpen, CalendarDays, Coffee } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useStaffTimetable } from '../hooks/useStaff'
import type { DayOfWeek, TimetableEntry } from '../types/staff.types'
import { DAYS_OF_WEEK, PERIODS } from '../types/staff.types'

interface TimetableViewProps {
  staffId: string
}

// Color mapping for subjects - consistent colors based on subject name hash
const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Mathematics: { bg: 'bg-blue-50 dark:bg-blue-800', text: 'text-blue-700 dark:text-blue-100', border: 'border-blue-200 dark:border-blue-700' },
  Science: { bg: 'bg-green-50 dark:bg-green-800', text: 'text-green-700 dark:text-green-100', border: 'border-green-200 dark:border-green-700' },
  English: { bg: 'bg-purple-50 dark:bg-purple-800', text: 'text-purple-700 dark:text-purple-100', border: 'border-purple-200 dark:border-purple-700' },
  Hindi: { bg: 'bg-orange-50 dark:bg-orange-800', text: 'text-orange-700 dark:text-orange-100', border: 'border-orange-200 dark:border-orange-700' },
  'Social Studies': { bg: 'bg-amber-50 dark:bg-amber-800', text: 'text-amber-700 dark:text-amber-100', border: 'border-amber-200 dark:border-amber-700' },
  'Computer Science': { bg: 'bg-cyan-50 dark:bg-cyan-800', text: 'text-cyan-700 dark:text-cyan-100', border: 'border-cyan-200 dark:border-cyan-700' },
  'Physical Education': { bg: 'bg-rose-50 dark:bg-rose-800', text: 'text-rose-700 dark:text-rose-100', border: 'border-rose-200 dark:border-rose-700' },
  Art: { bg: 'bg-pink-50 dark:bg-pink-800', text: 'text-pink-700 dark:text-pink-100', border: 'border-pink-200 dark:border-pink-700' },
  Music: { bg: 'bg-violet-50 dark:bg-violet-800', text: 'text-violet-700 dark:text-violet-100', border: 'border-violet-200 dark:border-violet-700' },
}

const DEFAULT_COLOR = { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-100', border: 'border-slate-200 dark:border-slate-700' }

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] || DEFAULT_COLOR
}

function TimetableGridSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[800px]">
            {/* Header row */}
            <Skeleton className="h-8 w-full" />
            {DAYS_OF_WEEK.map((day) => (
              <Skeleton key={day} className="h-8 w-full" />
            ))}
            {/* Grid cells */}
            {PERIODS.map((period) => (
              <>
                <Skeleton key={`label-${period.number}`} className="h-20 w-full" />
                {DAYS_OF_WEEK.map((day) => (
                  <Skeleton key={`${period.number}-${day}`} className="h-20 w-full" />
                ))}
              </>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BreakRow({ label, time }: { label: string; time: string }) {
  return (
    <>
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Coffee className="h-3 w-3" />
          <span className="font-medium">{label}</span>
        </div>
      </div>
      {DAYS_OF_WEEK.map((day) => (
        <div key={`break-${day}`} className="flex items-center justify-center py-2">
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      ))}
    </>
  )
}

export function TimetableView({ staffId }: TimetableViewProps) {
  const { data: timetableResponse, isLoading } = useStaffTimetable(staffId)
  const timetableData = timetableResponse?.data

  // Build a lookup map: day -> periodNumber -> entry
  const entryMap = useMemo(() => {
    const map: Record<string, Record<number, TimetableEntry>> = {}
    if (!timetableData?.entries) return map

    for (const entry of timetableData.entries) {
      if (!map[entry.day]) {
        map[entry.day] = {}
      }
      map[entry.day][entry.periodNumber] = entry
    }
    return map
  }, [timetableData?.entries])

  // Calculate subject-wise period counts for summary
  const subjectSummary = useMemo(() => {
    if (!timetableData?.entries) return []

    const counts: Record<string, number> = {}
    for (const entry of timetableData.entries) {
      counts[entry.subject] = (counts[entry.subject] || 0) + 1
    }

    return Object.entries(counts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
  }, [timetableData?.entries])

  if (isLoading) {
    return <TimetableGridSkeleton />
  }

  if (!timetableData || timetableData.entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Timetable Assigned</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This staff member does not have any timetable entries yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Weekly Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Weekly Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-1.5 min-w-[800px]">
              {/* Header Row */}
              <div className="p-2 text-center text-sm font-medium text-muted-foreground">
                Period
              </div>
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-semibold bg-muted rounded-md"
                >
                  {day.slice(0, 3)}
                </div>
              ))}

              {/* Period Rows with Break Indicators */}
              {PERIODS.map((period) => (
                <>
                  {/* Break before period 4 (between 3 and 4) */}
                  {period.number === 4 && (
                    <BreakRow label="Short Break" time="10:15 - 10:30" />
                  )}

                  {/* Break before period 6 (between 5 and 6) */}
                  {period.number === 6 && (
                    <BreakRow label="Lunch Break" time="12:00 - 12:45" />
                  )}

                  {/* Period Label Cell */}
                  <div
                    key={`period-${period.number}`}
                    className="p-2 flex flex-col items-center justify-center text-center border rounded-md bg-muted/50"
                  >
                    <span className="text-xs font-medium">{period.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {period.startTime} - {period.endTime}
                    </span>
                  </div>

                  {/* Day Cells for this Period */}
                  {DAYS_OF_WEEK.map((day) => {
                    const entry = entryMap[day]?.[period.number]

                    if (!entry) {
                      return (
                        <div
                          key={`${period.number}-${day}`}
                          className="p-2 border border-dashed rounded-md flex items-center justify-center min-h-[72px]"
                        >
                          <span className="text-xs text-muted-foreground">Free</span>
                        </div>
                      )
                    }

                    const color = getSubjectColor(entry.subject)

                    return (
                      <div
                        key={`${period.number}-${day}`}
                        className={cn(
                          'p-2 border rounded-md min-h-[72px] flex flex-col justify-center gap-1',
                          color.bg,
                          color.border
                        )}
                      >
                        <p className={cn('text-xs font-semibold leading-tight', color.text)}>
                          {entry.subject}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {entry.class}-{entry.section}
                        </p>
                        {entry.room && (
                          <p className="text-[10px] text-muted-foreground">
                            Room {entry.room}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5" />
              Weekly Summary
            </span>
            <Badge variant="secondary" className="text-sm">
              <Clock className="h-3 w-3 mr-1" />
              {timetableData.totalPeriodsPerWeek} periods / week
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {subjectSummary.map(({ subject, count }) => {
              const color = getSubjectColor(subject)
              return (
                <div
                  key={subject}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border',
                    color.bg,
                    color.border
                  )}
                >
                  <span className={cn('text-sm font-medium', color.text)}>{subject}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
