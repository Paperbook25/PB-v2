import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2 } from 'lucide-react'
import { usePeriodDefinitions } from '../hooks/useTimetable'
import type { TimetableEntry, DayOfWeek } from '../types/timetable.types'
import { DAYS_OF_WEEK } from '../types/timetable.types'
import { getSubjectColors, statusColors, moduleColors } from '@/lib/design-tokens'

interface TimetableGridProps {
  entries: TimetableEntry[]
  isEditable?: boolean
  onAddEntry?: (day: DayOfWeek, periodId: string) => void
  onDeleteEntry?: (entryId: string) => void
  isLoading?: boolean
}

export function TimetableGrid({
  entries,
  isEditable = false,
  onAddEntry,
  onDeleteEntry,
  isLoading,
}: TimetableGridProps) {
  const { data: periodsResult, isLoading: periodsLoading } = usePeriodDefinitions()
  const periods = periodsResult?.data ?? []

  // Create a lookup map for entries by day and period
  const entryMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>()
    entries.forEach((entry) => {
      const key = `${entry.day}-${entry.periodId}`
      map.set(key, entry)
    })
    return map
  }, [entries])

  if (isLoading || periodsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSubjectStyle = (subjectName: string) => {
    const colors = getSubjectColors(subjectName)
    return {
      backgroundColor: colors.bg,
      color: colors.text,
      borderColor: colors.text,
    }
  }

  const getPeriodTypeStyle = (type: string): React.CSSProperties => {
    switch (type) {
      case 'break':
        return { backgroundColor: statusColors.successLight }
      case 'lunch':
        return { backgroundColor: moduleColors.behaviorLight }
      case 'assembly':
        return { backgroundColor: moduleColors.integrationsLight }
      case 'activity':
        return { backgroundColor: moduleColors.parentPortalLight }
      default:
        return {}
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Timetable</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="border p-2 bg-muted text-left w-24">Period</th>
              <th className="border p-2 bg-muted text-center w-16">Time</th>
              {DAYS_OF_WEEK.map((day) => (
                <th key={day.value} className="border p-2 bg-muted text-center">
                  {day.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period.id} style={getPeriodTypeStyle(period.type)}>
                <td className="border p-2 font-medium">
                  <div className="flex flex-col">
                    <span>{period.name}</span>
                    {period.type !== 'class' && (
                      <Badge variant="outline" className="w-fit text-xs mt-1">
                        {period.type}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="border p-2 text-center text-xs text-muted-foreground">
                  {period.startTime}
                  <br />
                  {period.endTime}
                </td>
                {DAYS_OF_WEEK.map((day) => {
                  const entry = entryMap.get(`${day.value}-${period.id}`)
                  const isBreak = period.type !== 'class'

                  if (isBreak) {
                    return (
                      <td
                        key={day.value}
                        className="border p-2 text-center text-muted-foreground italic"
                      >
                        {period.type === 'lunch' ? '🍽️' : period.type === 'break' ? '☕' : '—'}
                      </td>
                    )
                  }

                  if (!entry) {
                    return (
                      <td key={day.value} className="border p-2 text-center">
                        {isEditable && onAddEntry ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-full w-full text-muted-foreground"
                            onClick={() => onAddEntry(day.value, period.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    )
                  }

                  return (
                    <td key={day.value} className="border p-1">
                      <div
                        className="rounded p-2 text-xs border"
                        style={getSubjectStyle(entry.subjectName)}
                      >
                        <div className="font-semibold truncate">{entry.subjectName}</div>
                        <div className="truncate text-[10px] opacity-80">{entry.teacherName}</div>
                        <div className="truncate text-[10px] opacity-60">{entry.roomName}</div>
                        {isEditable && onDeleteEntry && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 mt-1 hover:bg-red-100"
                            onClick={() => onDeleteEntry(entry.id)}
                          >
                            <Trash2 className="h-3 w-3" style={{ color: statusColors.error }} />
                          </Button>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
