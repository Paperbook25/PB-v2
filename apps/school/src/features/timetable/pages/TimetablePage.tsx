import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  getHours,
  getMinutes,
  differenceInMinutes,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
} from 'date-fns'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, BookOpen, X, Pencil, Trash2, Sparkles } from 'lucide-react'
import { useCalendarEvents, useCalendarFilters, useCreateCalendarEvent, useDeleteCalendarEvent } from '../hooks/useCalendar'
import type { CalendarEvent, CalendarView, CalendarFilterMode } from '../types/calendar.types'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/useAuthStore'
import { AIPlannerDrawer } from '../components/AIPlannerDrawer'

// ==================== EVENT COLORS ====================

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  class: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  holiday: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  event: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  exam: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  meeting: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  substitution: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
}

function getEventColor(type: string) {
  return EVENT_COLORS[type] || EVENT_COLORS.class
}

// ==================== TIME HELPERS ====================

const CALENDAR_START_HOUR = 7
const CALENDAR_END_HOUR = 18
const TOTAL_HOURS = CALENDAR_END_HOUR - CALENDAR_START_HOUR
const HOUR_HEIGHT = 60 // px per hour

function timeToPosition(date: Date): number {
  const hours = getHours(date)
  const minutes = getMinutes(date)
  const totalMinutes = (hours - CALENDAR_START_HOUR) * 60 + minutes
  return (totalMinutes / 60) * HOUR_HEIGHT
}

function formatTimeRange(start: string, end: string): string {
  return `${format(parseISO(start), 'h:mm a')} - ${format(parseISO(end), 'h:mm a')}`
}

// ==================== EVENT TYPE BADGE ====================

function EventTypeBadge({ type }: { type: string }) {
  const color = getEventColor(type)
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color.bg} ${color.text} border ${color.border}`}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  )
}

// ==================== EVENT DETAIL POPOVER ====================

function EventDetailPopover({
  event,
  children,
  onDelete,
}: {
  event: CalendarEvent
  children: React.ReactNode
  onDelete?: (id: string) => void
}) {
  const color = getEventColor(event.type)

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" sideOffset={4}>
        <div className={`px-4 py-3 border-b ${color.bg} rounded-t-md`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm ${color.text} truncate`}>{event.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {event.allDay
                  ? format(parseISO(event.start), 'EEEE, MMMM d, yyyy')
                  : formatTimeRange(event.start, event.end)}
              </p>
            </div>
            <EventTypeBadge type={event.type} />
          </div>
        </div>
        <div className="px-4 py-3 space-y-2">
          {event.description && (
            <p className="text-sm text-gray-600">{event.description}</p>
          )}
          {event.teacherName && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>{event.teacherName}</span>
            </div>
          )}
          {event.roomName && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>{event.roomName}</span>
            </div>
          )}
          {event.className && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>
                {event.className}
                {event.sectionName ? ` - ${event.sectionName}` : ''}
              </span>
            </div>
          )}
          {event.originalTeacher && (
            <div className="text-sm text-gray-600">
              <span className="text-gray-400">Original:</span> {event.originalTeacher}
            </div>
          )}
          {event.substituteTeacher && (
            <div className="text-sm text-gray-600">
              <span className="text-gray-400">Substitute:</span> {event.substituteTeacher}
            </div>
          )}
          {!event.allDay && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>
                {differenceInMinutes(parseISO(event.end), parseISO(event.start))} minutes
              </span>
            </div>
          )}
        </div>
        {onDelete && event.id.startsWith('user-evt-') && (
          <div className="px-4 py-2 border-t bg-gray-50 rounded-b-md flex justify-end gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ==================== EVENT CREATION DIALOG ====================

function CreateEventDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultStartTime,
  onSubmit,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: Date
  defaultStartTime?: string
  onSubmit: (data: {
    title: string
    description?: string
    startDate: string
    endDate: string
    type: string
    allDay: boolean
  }) => void
  isLoading: boolean
}) {
  const dateStr = defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(dateStr)
  const [startTime, setStartTime] = useState(defaultStartTime || '09:00')
  const [endTime, setEndTime] = useState(defaultStartTime ? `${String(parseInt(defaultStartTime.split(':')[0]) + 1).padStart(2, '0')}:00` : '10:00')
  const [eventType, setEventType] = useState('event')
  const [allDay, setAllDay] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setDate(defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
      setStartTime(defaultStartTime || '09:00')
      setEndTime(defaultStartTime ? `${String(parseInt(defaultStartTime.split(':')[0]) + 1).padStart(2, '0')}:00` : '10:00')
      setEventType('event')
      setAllDay(false)
    }
  }, [open, defaultDate, defaultStartTime])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      startDate: allDay ? `${date}T00:00:00` : `${date}T${startTime}:00`,
      endDate: allDay ? `${date}T23:59:59` : `${date}T${endTime}:00`,
      type: eventType,
      allDay,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>Add a new event to the school calendar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="evt-title">Title</Label>
            <Input
              id="evt-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evt-type">Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger id="evt-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">School Event</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evt-date">Date</Label>
            <Input
              id="evt-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="evt-allday"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="evt-allday" className="font-normal">All day event</Label>
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evt-start">Start Time</Label>
                <Input
                  id="evt-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evt-end">End Time</Label>
                <Input
                  id="evt-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="evt-desc">Description</Label>
            <textarea
              id="evt-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== MONTH VIEW ====================

function MonthView({
  currentDate,
  events,
  onDayClick,
  onDeleteEvent,
}: {
  currentDate: Date
  events: CalendarEvent[]
  onDayClick: (date: Date) => void
  onDeleteEvent?: (id: string) => void
}) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach((evt) => {
      const dateKey = format(parseISO(evt.start), 'yyyy-MM-dd')
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(evt)
    })
    return map
  }, [events])

  const MAX_VISIBLE = 3

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-xs font-medium text-gray-500 text-center border-r border-gray-100 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
          {week.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDate[dateKey] || []
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isCurrentDay = isToday(day)
            const visibleEvents = dayEvents.slice(0, MAX_VISIBLE)
            const overflowCount = dayEvents.length - MAX_VISIBLE

            return (
              <div
                key={dateKey}
                className={`min-h-[110px] border-r border-gray-100 last:border-r-0 p-1 cursor-pointer transition-colors hover:bg-gray-50 ${
                  !isCurrentMonth ? 'bg-gray-50/50' : ''
                }`}
                onClick={() => onDayClick(day)}
              >
                {/* Date number */}
                <div className="flex justify-center mb-1">
                  <span
                    className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      isCurrentDay
                        ? 'bg-indigo-600 text-white'
                        : isCurrentMonth
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Event pills */}
                <div className="space-y-0.5">
                  {visibleEvents.map((evt) => {
                    const color = getEventColor(evt.type)
                    return (
                      <EventDetailPopover key={evt.id} event={evt} onDelete={onDeleteEvent}>
                        <button
                          className={`w-full text-left px-1.5 py-0.5 rounded text-[11px] leading-tight truncate border ${color.bg} ${color.text} ${color.border} hover:opacity-80 transition-opacity`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!evt.allDay && (
                            <span className="font-medium">
                              {format(parseISO(evt.start), 'h:mm')}
                            </span>
                          )}{' '}
                          {evt.title}
                        </button>
                      </EventDetailPopover>
                    )
                  })}
                  {overflowCount > 0 && (
                    <button
                      className="w-full text-left px-1.5 py-0.5 text-[11px] text-gray-500 hover:text-gray-700 font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDayClick(day)
                      }}
                    >
                      +{overflowCount} more
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ==================== WEEK VIEW ====================

function WeekView({
  currentDate,
  events,
  onEmptySlotClick,
  onDeleteEvent,
  onDayClick,
}: {
  currentDate: Date
  events: CalendarEvent[]
  onEmptySlotClick: (date: Date, hour: number) => void
  onDeleteEvent?: (id: string) => void
  onDayClick: (date: Date) => void
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  })

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => CALENDAR_START_HOUR + i)
  const gridRef = useRef<HTMLDivElement>(null)
  const [currentTimeTop, setCurrentTimeTop] = useState(0)
  const [showTimeLine, setShowTimeLine] = useState(false)

  // Current time indicator
  useEffect(() => {
    function updateTime() {
      const now = new Date()
      const h = getHours(now)
      if (h >= CALENDAR_START_HOUR && h < CALENDAR_END_HOUR) {
        setCurrentTimeTop(timeToPosition(now))
        setShowTimeLine(true)
      } else {
        setShowTimeLine(false)
      }
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Separate all-day vs timed events, grouped by day
  const { allDayByDate, timedByDate } = useMemo(() => {
    const allDayByDate: Record<string, CalendarEvent[]> = {}
    const timedByDate: Record<string, CalendarEvent[]> = {}

    events.forEach((evt) => {
      const dateKey = format(parseISO(evt.start), 'yyyy-MM-dd')
      if (evt.allDay) {
        if (!allDayByDate[dateKey]) allDayByDate[dateKey] = []
        allDayByDate[dateKey].push(evt)
      } else {
        if (!timedByDate[dateKey]) timedByDate[dateKey] = []
        timedByDate[dateKey].push(evt)
      }
    })

    return { allDayByDate, timedByDate }
  }, [events])

  const hasAllDayEvents = Object.keys(allDayByDate).length > 0

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col">
      {/* Day headers */}
      <div className="flex border-b border-gray-200 sticky top-0 bg-white z-20">
        <div className="w-16 shrink-0 border-r border-gray-100" />
        {days.map((day) => {
          const isCurrentDay = isToday(day)
          return (
            <div
              key={day.toISOString()}
              className="flex-1 text-center py-2 border-r border-gray-100 last:border-r-0 cursor-pointer hover:bg-gray-50"
              onClick={() => onDayClick(day)}
            >
              <div className="text-xs text-gray-500 font-medium">
                {format(day, 'EEE')}
              </div>
              <div
                className={`text-sm font-semibold mx-auto w-7 h-7 flex items-center justify-center rounded-full ${
                  isCurrentDay ? 'bg-indigo-600 text-white' : 'text-gray-900'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      {/* All-day events row */}
      {hasAllDayEvents && (
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <div className="w-16 shrink-0 border-r border-gray-100 flex items-center justify-center">
            <span className="text-[10px] text-gray-400 font-medium">ALL DAY</span>
          </div>
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayAllDay = allDayByDate[dateKey] || []
            return (
              <div
                key={dateKey}
                className="flex-1 border-r border-gray-100 last:border-r-0 p-1 min-h-[32px]"
              >
                {dayAllDay.map((evt) => {
                  const color = getEventColor(evt.type)
                  return (
                    <EventDetailPopover key={evt.id} event={evt} onDelete={onDeleteEvent}>
                      <button
                        className={`w-full text-left px-1.5 py-0.5 rounded text-[11px] truncate border ${color.bg} ${color.text} ${color.border} hover:opacity-80 mb-0.5`}
                      >
                        {evt.title}
                      </button>
                    </EventDetailPopover>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto" ref={gridRef}>
        <div className="flex relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
          {/* Time gutter */}
          <div className="w-16 shrink-0 border-r border-gray-100 relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute w-full pr-2 text-right"
                style={{ top: (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT - 6 }}
              >
                <span className="text-[10px] text-gray-400">
                  {format(setMinutes(setHours(new Date(), hour), 0), 'h a')}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIdx) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayEvents = timedByDate[dateKey] || []
            const isCurrentDay = isToday(day)

            return (
              <div
                key={dateKey}
                className={`flex-1 border-r border-gray-100 last:border-r-0 relative ${
                  isCurrentDay ? 'bg-indigo-50/20' : ''
                }`}
              >
                {/* Hour lines */}
                {hours.map((hour) => (
                  <div key={hour}>
                    <div
                      className="absolute left-0 right-0 border-t border-gray-100"
                      style={{ top: (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT }}
                    />
                    <div
                      className="absolute left-0 right-0 border-t border-gray-100 border-dashed"
                      style={{ top: (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                    />
                    {/* Clickable slot */}
                    <div
                      className="absolute left-0 right-0 cursor-pointer hover:bg-indigo-50/40 transition-colors"
                      style={{
                        top: (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT,
                        height: HOUR_HEIGHT,
                      }}
                      onClick={() => onEmptySlotClick(day, hour)}
                    />
                  </div>
                ))}

                {/* Current time line */}
                {isCurrentDay && showTimeLine && (
                  <div
                    className="absolute left-0 right-0 z-10 pointer-events-none"
                    style={{ top: currentTimeTop }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                      <div className="flex-1 border-t-2 border-red-500" />
                    </div>
                  </div>
                )}

                {/* Event blocks */}
                {dayEvents.map((evt) => {
                  const evtStart = parseISO(evt.start)
                  const evtEnd = parseISO(evt.end)
                  const top = timeToPosition(evtStart)
                  const height = Math.max(
                    (differenceInMinutes(evtEnd, evtStart) / 60) * HOUR_HEIGHT,
                    20
                  )
                  const color = getEventColor(evt.type)

                  return (
                    <EventDetailPopover key={evt.id} event={evt} onDelete={onDeleteEvent}>
                      <button
                        className={`absolute left-0.5 right-0.5 rounded border ${color.bg} ${color.border} ${color.text} px-1.5 py-0.5 text-left overflow-hidden z-[5] hover:opacity-90 transition-opacity cursor-pointer`}
                        style={{ top, height }}
                      >
                        <div className="text-[11px] font-medium truncate">{evt.title}</div>
                        {height > 30 && (
                          <div className="text-[10px] opacity-75 truncate">
                            {format(evtStart, 'h:mm a')}
                            {evt.teacherName ? ` - ${evt.teacherName}` : ''}
                          </div>
                        )}
                        {height > 48 && evt.roomName && (
                          <div className="text-[10px] opacity-60 truncate">{evt.roomName}</div>
                        )}
                      </button>
                    </EventDetailPopover>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ==================== DAY VIEW ====================

function DayView({
  currentDate,
  events,
  onEmptySlotClick,
  onDeleteEvent,
}: {
  currentDate: Date
  events: CalendarEvent[]
  onEmptySlotClick: (date: Date, hour: number) => void
  onDeleteEvent?: (id: string) => void
}) {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => CALENDAR_START_HOUR + i)
  const gridRef = useRef<HTMLDivElement>(null)
  const [currentTimeTop, setCurrentTimeTop] = useState(0)
  const [showTimeLine, setShowTimeLine] = useState(false)
  const isCurrentDay = isToday(currentDate)

  useEffect(() => {
    function updateTime() {
      const now = new Date()
      const h = getHours(now)
      if (h >= CALENDAR_START_HOUR && h < CALENDAR_END_HOUR) {
        setCurrentTimeTop(timeToPosition(now))
        setShowTimeLine(true)
      } else {
        setShowTimeLine(false)
      }
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const dateKey = format(currentDate, 'yyyy-MM-dd')

  const { allDayEvents, timedEvents } = useMemo(() => {
    const allDayEvents: CalendarEvent[] = []
    const timedEvents: CalendarEvent[] = []

    events.forEach((evt) => {
      const evtDateKey = format(parseISO(evt.start), 'yyyy-MM-dd')
      if (evtDateKey === dateKey) {
        if (evt.allDay) {
          allDayEvents.push(evt)
        } else {
          timedEvents.push(evt)
        }
      }
    })

    return { allDayEvents, timedEvents }
  }, [events, dateKey])

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col">
      {/* Day header */}
      <div className="flex border-b border-gray-200 sticky top-0 bg-white z-20">
        <div className="w-16 shrink-0 border-r border-gray-100" />
        <div className="flex-1 text-center py-3">
          <div className="text-xs text-gray-500 font-medium">
            {format(currentDate, 'EEEE')}
          </div>
          <div
            className={`text-lg font-semibold mx-auto w-9 h-9 flex items-center justify-center rounded-full ${
              isCurrentDay ? 'bg-indigo-600 text-white' : 'text-gray-900'
            }`}
          >
            {format(currentDate, 'd')}
          </div>
        </div>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <div className="w-16 shrink-0 border-r border-gray-100 flex items-center justify-center">
            <span className="text-[10px] text-gray-400 font-medium">ALL DAY</span>
          </div>
          <div className="flex-1 p-1.5 space-y-1">
            {allDayEvents.map((evt) => {
              const color = getEventColor(evt.type)
              return (
                <EventDetailPopover key={evt.id} event={evt} onDelete={onDeleteEvent}>
                  <button
                    className={`w-full text-left px-2 py-1 rounded text-xs border ${color.bg} ${color.text} ${color.border} hover:opacity-80`}
                  >
                    <span className="font-medium">{evt.title}</span>
                    {evt.description && (
                      <span className="ml-2 opacity-70">{evt.description}</span>
                    )}
                  </button>
                </EventDetailPopover>
              )
            })}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto" ref={gridRef}>
        <div className="flex relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
          {/* Time gutter */}
          <div className="w-16 shrink-0 border-r border-gray-100 relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute w-full pr-2 text-right"
                style={{ top: (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT - 6 }}
              >
                <span className="text-[10px] text-gray-400">
                  {format(setMinutes(setHours(new Date(), hour), 0), 'h a')}
                </span>
              </div>
            ))}
          </div>

          {/* Main column */}
          <div className={`flex-1 relative ${isCurrentDay ? 'bg-indigo-50/20' : ''}`}>
            {/* Hour lines */}
            {hours.map((hour) => (
              <div key={hour}>
                <div
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT }}
                />
                <div
                  className="absolute left-0 right-0 border-t border-gray-100 border-dashed"
                  style={{ top: (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                />
                <div
                  className="absolute left-0 right-0 cursor-pointer hover:bg-indigo-50/40 transition-colors"
                  style={{
                    top: (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT,
                    height: HOUR_HEIGHT,
                  }}
                  onClick={() => onEmptySlotClick(currentDate, hour)}
                />
              </div>
            ))}

            {/* Current time line */}
            {isCurrentDay && showTimeLine && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{ top: currentTimeTop }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                  <div className="flex-1 border-t-2 border-red-500" />
                </div>
              </div>
            )}

            {/* Event blocks */}
            {timedEvents.map((evt) => {
              const evtStart = parseISO(evt.start)
              const evtEnd = parseISO(evt.end)
              const top = timeToPosition(evtStart)
              const height = Math.max(
                (differenceInMinutes(evtEnd, evtStart) / 60) * HOUR_HEIGHT,
                24
              )
              const color = getEventColor(evt.type)

              return (
                <EventDetailPopover key={evt.id} event={evt} onDelete={onDeleteEvent}>
                  <button
                    className={`absolute left-1 right-1 rounded border-l-4 ${color.bg} ${color.border} ${color.text} px-3 py-1 text-left overflow-hidden z-[5] hover:opacity-90 transition-opacity cursor-pointer shadow-sm`}
                    style={{ top, height }}
                  >
                    <div className="text-sm font-medium truncate">{evt.title}</div>
                    {height > 28 && (
                      <div className="text-xs opacity-75">
                        {format(evtStart, 'h:mm a')} - {format(evtEnd, 'h:mm a')}
                      </div>
                    )}
                    {height > 44 && evt.teacherName && (
                      <div className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                        <User className="h-3 w-3" />
                        {evt.teacherName}
                      </div>
                    )}
                    {height > 60 && evt.roomName && (
                      <div className="text-xs opacity-60 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {evt.roomName}
                      </div>
                    )}
                    {height > 76 && evt.className && (
                      <div className="text-xs opacity-60 flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {evt.className}{evt.sectionName ? ` - ${evt.sectionName}` : ''}
                      </div>
                    )}
                  </button>
                </EventDetailPopover>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== MOBILE MONTH LIST VIEW ====================

function MobileMonthList({
  currentDate,
  events,
  onDeleteEvent,
}: {
  currentDate: Date
  events: CalendarEvent[]
  onDeleteEvent?: (id: string) => void
}) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach((evt) => {
      const dateKey = format(parseISO(evt.start), 'yyyy-MM-dd')
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(evt)
    })
    return map
  }, [events])

  const daysWithEvents = days.filter((day) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    return (eventsByDate[dateKey] || []).length > 0
  })

  return (
    <div className="space-y-4">
      {daysWithEvents.length === 0 && (
        <div className="text-center text-gray-400 py-12 text-sm">
          No events this month.
        </div>
      )}
      {daysWithEvents.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd')
        const dayEvents = eventsByDate[dateKey] || []
        const isCurrentDay = isToday(day)

        return (
          <div key={dateKey} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <div className={`px-4 py-2 border-b border-gray-100 ${isCurrentDay ? 'bg-indigo-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                    isCurrentDay ? 'bg-indigo-600 text-white' : 'text-gray-700'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                <span className="text-sm text-gray-600">{format(day, 'EEEE, MMMM d')}</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {dayEvents.map((evt) => {
                const color = getEventColor(evt.type)
                return (
                  <EventDetailPopover key={evt.id} event={evt} onDelete={onDeleteEvent}>
                    <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${color.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{evt.title}</div>
                        <div className="text-xs text-gray-500">
                          {evt.allDay ? 'All day' : formatTimeRange(evt.start, evt.end)}
                        </div>
                      </div>
                      <EventTypeBadge type={evt.type} />
                    </button>
                  </EventDetailPopover>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ==================== MAIN CALENDAR PAGE ====================

export function TimetablePage() {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [aiPlannerOpen, setAIPlannerOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('week')
  const [filterMode, setFilterMode] = useState<CalendarFilterMode>('all')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')

  // Event creation dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createDialogDate, setCreateDialogDate] = useState<Date | undefined>(undefined)
  const [createDialogTime, setCreateDialogTime] = useState<string | undefined>(undefined)

  // Responsive check
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Compute date range based on view
  const dateRange = useMemo(() => {
    switch (view) {
      case 'day':
        return {
          startDate: format(startOfDay(currentDate), 'yyyy-MM-dd'),
          endDate: format(endOfDay(currentDate), 'yyyy-MM-dd'),
        }
      case 'week': {
        const ws = startOfWeek(currentDate, { weekStartsOn: 1 })
        const we = endOfWeek(currentDate, { weekStartsOn: 1 })
        return {
          startDate: format(ws, 'yyyy-MM-dd'),
          endDate: format(we, 'yyyy-MM-dd'),
        }
      }
      case 'month': {
        // Fetch a bit wider to include days from prev/next month visible in grid
        const ms = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
        const me = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
        return {
          startDate: format(ms, 'yyyy-MM-dd'),
          endDate: format(me, 'yyyy-MM-dd'),
        }
      }
    }
  }, [currentDate, view])

  // Build query params
  const queryParams = useMemo(() => {
    const params: {
      startDate: string
      endDate: string
      classId?: string
      sectionId?: string
      teacherId?: string
    } = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }

    if (filterMode === 'class' && selectedClassId) {
      params.classId = selectedClassId
      if (selectedSectionId) {
        params.sectionId = selectedSectionId
      }
    } else if (filterMode === 'teacher' && selectedTeacherId) {
      params.teacherId = selectedTeacherId
    }

    return params
  }, [dateRange, filterMode, selectedClassId, selectedSectionId, selectedTeacherId])

  // Fetch data
  const { data: eventsData, isLoading: eventsLoading } = useCalendarEvents(queryParams)
  const { data: filtersData } = useCalendarFilters()
  const createMutation = useCreateCalendarEvent()
  const deleteMutation = useDeleteCalendarEvent()

  const events = eventsData?.events || []
  const classes = filtersData?.classes || []
  const teachers = filtersData?.teachers || []

  const selectedClass = classes.find((c) => c.id === selectedClassId)
  const sections = selectedClass?.sections || []

  // Navigation
  const goBack = useCallback(() => {
    switch (view) {
      case 'day':
        setCurrentDate((d) => subDays(d, 1))
        break
      case 'week':
        setCurrentDate((d) => subWeeks(d, 1))
        break
      case 'month':
        setCurrentDate((d) => subMonths(d, 1))
        break
    }
  }, [view])

  const goForward = useCallback(() => {
    switch (view) {
      case 'day':
        setCurrentDate((d) => addDays(d, 1))
        break
      case 'week':
        setCurrentDate((d) => addWeeks(d, 1))
        break
      case 'month':
        setCurrentDate((d) => addMonths(d, 1))
        break
    }
  }, [view])

  const goToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  // Date range label
  const dateLabel = useMemo(() => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy')
      case 'week': {
        const ws = startOfWeek(currentDate, { weekStartsOn: 1 })
        const we = endOfWeek(currentDate, { weekStartsOn: 1 })
        if (ws.getMonth() === we.getMonth()) {
          return `${format(ws, 'MMM d')} - ${format(we, 'd, yyyy')}`
        }
        return `${format(ws, 'MMM d')} - ${format(we, 'MMM d, yyyy')}`
      }
      case 'month':
        return format(currentDate, 'MMMM yyyy')
    }
  }, [currentDate, view])

  // Handle day click (from month view)
  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date)
    setView('day')
  }, [])

  // Handle empty slot click (time grid)
  const handleEmptySlotClick = useCallback((date: Date, hour: number) => {
    setCreateDialogDate(date)
    setCreateDialogTime(`${String(hour).padStart(2, '0')}:00`)
    setCreateDialogOpen(true)
  }, [])

  // Handle create event
  const handleCreateEvent = useCallback(
    (data: {
      title: string
      description?: string
      startDate: string
      endDate: string
      type: string
      allDay: boolean
    }) => {
      createMutation.mutate(
        {
          title: data.title,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          type: data.type,
          allDay: data.allDay,
        },
        {
          onSuccess: () => {
            toast({ title: 'Event Created', description: 'The event has been added to the calendar.' })
            setCreateDialogOpen(false)
          },
          onError: () => {
            toast({ title: 'Error', description: 'Failed to create event.', variant: 'destructive' })
          },
        }
      )
    },
    [createMutation, toast]
  )

  // Handle delete event
  const handleDeleteEvent = useCallback(
    (id: string) => {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast({ title: 'Event Deleted', description: 'The event has been removed.' })
        },
        onError: () => {
          toast({ title: 'Error', description: 'Failed to delete event.', variant: 'destructive' })
        },
      })
    },
    [deleteMutation, toast]
  )

  // Filter mode change
  const handleFilterModeChange = useCallback((mode: string) => {
    setFilterMode(mode as CalendarFilterMode)
    setSelectedClassId('')
    setSelectedSectionId('')
    setSelectedTeacherId('')
  }, [])

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClassId(classId)
    setSelectedSectionId('')
  }, [])

  return (
    <div className="space-y-0">
      <PageHeader
        title="Calendar"
        description="School schedule and events"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Calendar' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {user && ['admin', 'principal', 'teacher'].includes(user.role) && (
              <Button variant="outline" onClick={() => setAIPlannerOpen(true)}>
                <Sparkles className="h-4 w-4 mr-1.5" />
                AI Planner
              </Button>
            )}
            <Button onClick={() => { setCreateDialogDate(new Date()); setCreateDialogTime(undefined); setCreateDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Event
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white space-y-3">
        {/* Navigation + View Switcher */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goForward}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-base font-semibold text-gray-900 ml-2">{dateLabel}</h2>
          </div>

          {/* Right: View switcher */}
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
            {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === v
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                } ${v !== 'day' ? 'border-l border-gray-200' : ''}`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={filterMode} onValueChange={handleFilterModeChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="class">By Class</SelectItem>
              <SelectItem value="teacher">By Teacher</SelectItem>
            </SelectContent>
          </Select>

          {filterMode === 'class' && (
            <>
              <Select value={selectedClassId} onValueChange={handleClassChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedClassId && sections.length > 0 && (
                <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Sections</SelectItem>
                    {sections.map((sec) => (
                      <SelectItem key={sec.id} value={sec.id}>
                        Section {sec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </>
          )}

          {filterMode === 'teacher' && (
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Loading indicator */}
          {eventsLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Calendar content */}
      <div className="px-6 py-4">
        {/* Desktop views */}
        {!isMobile && view === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={events}
            onDayClick={handleDayClick}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {!isMobile && view === 'week' && (
          <div style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
            <WeekView
              currentDate={currentDate}
              events={events}
              onEmptySlotClick={handleEmptySlotClick}
              onDeleteEvent={handleDeleteEvent}
              onDayClick={handleDayClick}
            />
          </div>
        )}

        {!isMobile && view === 'day' && (
          <div style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
            <DayView
              currentDate={currentDate}
              events={events}
              onEmptySlotClick={handleEmptySlotClick}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        )}

        {/* Mobile: month collapses to list */}
        {isMobile && view === 'month' && (
          <MobileMonthList
            currentDate={currentDate}
            events={events}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {isMobile && view === 'week' && (
          <div style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
            <WeekView
              currentDate={currentDate}
              events={events}
              onEmptySlotClick={handleEmptySlotClick}
              onDeleteEvent={handleDeleteEvent}
              onDayClick={handleDayClick}
            />
          </div>
        )}

        {isMobile && view === 'day' && (
          <div style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
            <DayView
              currentDate={currentDate}
              events={events}
              onEmptySlotClick={handleEmptySlotClick}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          {Object.entries(EVENT_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
              <span className="text-xs text-gray-500 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultDate={createDialogDate}
        defaultStartTime={createDialogTime}
        onSubmit={handleCreateEvent}
        isLoading={createMutation.isPending}
      />

      {/* AI Planner Drawer */}
      <AIPlannerDrawer
        open={aiPlannerOpen}
        onOpenChange={setAIPlannerOpen}
        context={{
          classId: selectedClassId || undefined,
          sectionId: selectedSectionId || undefined,
          teacherId: selectedTeacherId || undefined,
        }}
      />
    </div>
  )
}
