import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Check, X, Clock, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ATTENDANCE_COLORS } from '@/lib/attendance-ui'
import type { StaffAttendanceRecord, StaffAttendanceStatus } from '../types/staff.types'

interface AttendanceCalendarProps {
  month: number
  year: number
  records: StaffAttendanceRecord[]
  onMonthChange: (month: number, year: number) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const STATUS_COLORS: Record<StaffAttendanceStatus, string> = {
  present: `${ATTENDANCE_COLORS.present.bgSolid} text-white`,
  absent: `${ATTENDANCE_COLORS.absent.bgSolid} text-white`,
  half_day: `${ATTENDANCE_COLORS.half_day.bgSolid} text-white`,
  on_leave: `${ATTENDANCE_COLORS.on_leave.bgSolid} text-white`,
}

const STATUS_ICONS: Record<StaffAttendanceStatus, React.ReactNode> = {
  present: <Check className="h-3 w-3" />,
  absent: <X className="h-3 w-3" />,
  half_day: <Clock className="h-3 w-3" />,
  on_leave: <CalendarIcon className="h-3 w-3" />,
}

export function AttendanceCalendar({ month, year, records, onMonthChange }: AttendanceCalendarProps) {
  // Create a map of date to attendance record
  const recordsByDate = useMemo(() => {
    const map: Record<string, StaffAttendanceRecord> = {}
    records.forEach((record) => {
      map[record.date] = record
    })
    return map
  }, [records])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days: { date: number; isCurrentMonth: boolean; dateStr: string }[] = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      days.push({
        date,
        isCurrentMonth: false,
        dateStr: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
      })
    }

    // Current month days
    for (let date = 1; date <= daysInMonth; date++) {
      days.push({
        date,
        isCurrentMonth: true,
        dateStr: `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
      })
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let date = 1; date <= remainingDays; date++) {
      const nextMonth = month === 12 ? 1 : month + 1
      const nextYear = month === 12 ? year + 1 : year
      days.push({
        date,
        isCurrentMonth: false,
        dateStr: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
      })
    }

    return days
  }, [month, year])

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1)
    } else {
      onMonthChange(month - 1, year)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1)
    } else {
      onMonthChange(month + 1, year)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {MONTHS[month - 1]} {year}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className={cn('w-6 h-6 rounded flex items-center justify-center', STATUS_COLORS.present)}>
            <Check className="h-3 w-3" />
          </div>
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('w-6 h-6 rounded flex items-center justify-center', STATUS_COLORS.absent)}>
            <X className="h-3 w-3" />
          </div>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('w-6 h-6 rounded flex items-center justify-center', STATUS_COLORS.half_day)}>
            <Clock className="h-3 w-3" />
          </div>
          <span>Half Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('w-6 h-6 rounded flex items-center justify-center', STATUS_COLORS.on_leave)}>
            <CalendarIcon className="h-3 w-3" />
          </div>
          <span>On Leave</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-muted">
          {DAYS.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const record = recordsByDate[day.dateStr]
            const isToday = day.dateStr === today
            const isWeekend = index % 7 === 0 || index % 7 === 6

            return (
              <div
                key={day.dateStr}
                className={cn(
                  'min-h-[60px] p-2 border-t border-r last:border-r-0',
                  !day.isCurrentMonth && 'bg-muted/50 text-muted-foreground',
                  isWeekend && day.isCurrentMonth && 'bg-muted/30',
                  isToday && 'ring-2 ring-primary ring-inset'
                )}
              >
                <div className="flex items-start justify-between">
                  <span className={cn('text-sm', isToday && 'font-bold text-primary')}>
                    {day.date}
                  </span>
                  {record && day.isCurrentMonth && (
                    <div
                      className={cn(
                        'w-6 h-6 rounded flex items-center justify-center',
                        STATUS_COLORS[record.status]
                      )}
                    >
                      {STATUS_ICONS[record.status]}
                    </div>
                  )}
                </div>
                {record && day.isCurrentMonth && record.checkInTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {record.checkInTime}
                    {record.checkOutTime && ` - ${record.checkOutTime}`}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
