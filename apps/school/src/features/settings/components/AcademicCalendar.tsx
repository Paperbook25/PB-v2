import { useState } from 'react'
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useCalendarEvents, useCreateCalendarEvent, useDeleteCalendarEvent } from '../hooks/useSettings'
import { CALENDAR_EVENT_TYPE_LABELS } from '../types/settings.types'
import type { CalendarEventType } from '../types/settings.types'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const eventTypeColors: Record<CalendarEventType, string> = {
  holiday: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100',
  exam: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100',
  ptm: 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-100',
  sports: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100',
  cultural: 'bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-100',
  workshop: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100',
  vacation: 'bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-100',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100',
}

export function AcademicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const { toast } = useToast()

  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

  const { data: result, isLoading } = useCalendarEvents({
    type: typeFilter || undefined,
  })
  const createMutation = useCreateCalendarEvent()
  const deleteMutation = useDeleteCalendarEvent()

  const events = result?.data || []

  // Filter events for current month view
  const monthEvents = events.filter((e) => {
    const start = e.startDate.substring(0, 7)
    const end = e.endDate.substring(0, 7)
    return start <= currentMonth && end >= currentMonth
  })

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'holiday' as CalendarEventType,
    startDate: '',
    endDate: '',
    isRecurring: false,
    appliesToClasses: [] as string[],
  })

  const handleCreate = () => {
    createMutation.mutate(form, {
      onSuccess: () => {
        toast({ title: 'Event added to calendar' })
        setShowCreate(false)
        setForm({ title: '', description: '', type: 'holiday', startDate: '', endDate: '', isRecurring: false, appliesToClasses: [] })
      },
    })
  }

  const navigateMonth = (direction: number) => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + direction)
    setCurrentDate(d)
  }

  // Generate calendar days grid
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter((e) => e.startDate <= dateStr && e.endDate >= dateStr)
  }

  // Stats
  const holidays = events.filter((e) => e.type === 'holiday' || e.type === 'vacation').length
  const exams = events.filter((e) => e.type === 'exam').length
  const ptms = events.filter((e) => e.type === 'ptm').length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{holidays}</p>
            <p className="text-xs text-muted-foreground">Holidays / Vacations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{exams}</p>
            <p className="text-xs text-muted-foreground">Exam Periods</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-purple-600">{ptms}</p>
            <p className="text-xs text-muted-foreground">PTM Dates</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {MONTHS[month]} {year}
          </h3>
          <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(CALENDAR_EVENT_TYPE_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-px bg-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : []
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
              return (
                <div
                  key={i}
                  className={`bg-background min-h-[80px] p-1 ${!day ? 'bg-muted/30' : ''} ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-medium ${isToday ? 'text-primary font-bold' : ''}`}>{day}</span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayEvents.slice(0, 2).map((e) => (
                          <div
                            key={e.id}
                            className={`text-[10px] px-1 py-0.5 rounded truncate ${eventTypeColors[e.type]}`}
                            title={e.title}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Events List for Current Month */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Events in {MONTHS[month]} {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : monthEvents.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No events this month</div>
          ) : (
            <div className="space-y-3">
              {monthEvents.map((event) => (
                <div key={event.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${eventTypeColors[event.type].split(' ')[0]}`} />
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{CALENDAR_EVENT_TYPE_LABELS[event.type]}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {event.startDate === event.endDate ? event.startDate : `${event.startDate} to ${event.endDate}`}
                        </span>
                        {event.isRecurring && <Badge variant="secondary" className="text-xs">Recurring</Badge>}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(event.id, { onSuccess: () => toast({ title: 'Event deleted' }) })}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Calendar Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as CalendarEventType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CALENDAR_EVENT_TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.title || !form.startDate || !form.endDate || createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
