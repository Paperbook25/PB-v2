import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import type { CalendarEvent, CalendarFilters } from '@/features/timetable/types/calendar.types'
import {
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from 'date-fns'

// ==================== MOCK DATA ====================

const CLASSES = [
  {
    id: 'cls-6',
    name: 'Class 6',
    sections: [
      { id: 'sec-6a', name: 'A' },
      { id: 'sec-6b', name: 'B' },
    ],
  },
  {
    id: 'cls-7',
    name: 'Class 7',
    sections: [
      { id: 'sec-7a', name: 'A' },
      { id: 'sec-7b', name: 'B' },
    ],
  },
  {
    id: 'cls-8',
    name: 'Class 8',
    sections: [
      { id: 'sec-8a', name: 'A' },
      { id: 'sec-8b', name: 'B' },
      { id: 'sec-8c', name: 'C' },
    ],
  },
  {
    id: 'cls-9',
    name: 'Class 9',
    sections: [
      { id: 'sec-9a', name: 'A' },
      { id: 'sec-9b', name: 'B' },
    ],
  },
  {
    id: 'cls-10',
    name: 'Class 10',
    sections: [
      { id: 'sec-10a', name: 'A' },
      { id: 'sec-10b', name: 'B' },
      { id: 'sec-10c', name: 'C' },
    ],
  },
]

const TEACHERS = [
  { id: 'tch-1', name: 'Mrs. Priya Sharma', department: 'Mathematics' },
  { id: 'tch-2', name: 'Mr. Rajesh Gupta', department: 'English' },
  { id: 'tch-3', name: 'Dr. Anita Patel', department: 'Science' },
  { id: 'tch-4', name: 'Mrs. Sunita Singh', department: 'Hindi' },
  { id: 'tch-5', name: 'Mr. Arun Kumar', department: 'Computer Science' },
  { id: 'tch-6', name: 'Mr. Vikram Rao', department: 'Social Studies' },
  { id: 'tch-7', name: 'Mrs. Kavita Nair', department: 'Physics' },
  { id: 'tch-8', name: 'Mr. Deepak Joshi', department: 'Chemistry' },
  { id: 'tch-9', name: 'Mrs. Meera Desai', department: 'Biology' },
  { id: 'tch-10', name: 'Mr. Suresh Pillai', department: 'Physical Education' },
]

const SUBJECTS = [
  { name: 'Mathematics', teacher: TEACHERS[0], room: 'Room 101' },
  { name: 'English', teacher: TEACHERS[1], room: 'Room 102' },
  { name: 'Science', teacher: TEACHERS[2], room: 'Lab 1' },
  { name: 'Hindi', teacher: TEACHERS[3], room: 'Room 103' },
  { name: 'Computer Science', teacher: TEACHERS[4], room: 'Computer Lab' },
  { name: 'Social Studies', teacher: TEACHERS[5], room: 'Room 104' },
  { name: 'Physics', teacher: TEACHERS[6], room: 'Physics Lab' },
  { name: 'Chemistry', teacher: TEACHERS[7], room: 'Chemistry Lab' },
  { name: 'Biology', teacher: TEACHERS[8], room: 'Biology Lab' },
  { name: 'Physical Education', teacher: TEACHERS[9], room: 'Sports Ground' },
]

// Class period schedule template (time slots)
const PERIOD_SLOTS = [
  { start: '08:00', end: '08:45' },
  { start: '08:45', end: '09:30' },
  { start: '09:45', end: '10:30' },  // after short break
  { start: '10:30', end: '11:15' },
  { start: '11:30', end: '12:15' },  // after short break
  { start: '12:15', end: '13:00' },
  // lunch break 13:00 - 13:45
  { start: '13:45', end: '14:30' },
  { start: '14:30', end: '15:15' },
]

// Generate class timetable for a specific class and section over a date range
function generateClassEvents(
  cls: typeof CLASSES[0],
  section: typeof CLASSES[0]['sections'][0],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Create a consistent subject rotation per class-section
  const seed = cls.id.charCodeAt(4) + section.id.charCodeAt(4)
  const shuffledSubjects = [...SUBJECTS].sort((a, b) => {
    const ha = (a.name.charCodeAt(0) * seed) % 100
    const hb = (b.name.charCodeAt(0) * seed) % 100
    return ha - hb
  })

  for (const day of days) {
    const dayOfWeek = getDay(day) // 0=Sun, 6=Sat
    // Skip weekends (Sunday=0, and we may include Saturday with fewer periods)
    if (dayOfWeek === 0) continue
    const isSaturday = dayOfWeek === 6
    const periodsForDay = isSaturday ? PERIOD_SLOTS.slice(0, 4) : PERIOD_SLOTS

    const dateStr = format(day, 'yyyy-MM-dd')

    periodsForDay.forEach((slot, periodIdx) => {
      // Pick subject based on day+period to be consistent
      const subjectIdx = (dayOfWeek * 8 + periodIdx + seed) % shuffledSubjects.length
      const subject = shuffledSubjects[subjectIdx]

      events.push({
        id: `cls-evt-${cls.id}-${section.id}-${dateStr}-${periodIdx}`,
        title: subject.name,
        start: `${dateStr}T${slot.start}:00`,
        end: `${dateStr}T${slot.end}:00`,
        type: 'class',
        allDay: false,
        subjectName: subject.name,
        teacherName: subject.teacher.name,
        roomName: subject.room,
        className: cls.name,
        sectionName: section.name,
      })
    })
  }

  return events
}

// Static holidays
function getHolidays(startDate: Date, endDate: Date): CalendarEvent[] {
  const holidays: Array<{ date: string; title: string; description: string }> = [
    { date: '2026-01-26', title: 'Republic Day', description: 'National holiday' },
    { date: '2026-02-19', title: 'Shivaji Jayanti', description: 'State holiday' },
    { date: '2026-03-14', title: 'Holi', description: 'Festival of colors' },
    { date: '2026-03-30', title: 'Id-ul-Fitr', description: 'End of Ramadan' },
    { date: '2026-04-02', title: 'Ram Navami', description: 'Hindu festival' },
    { date: '2026-04-06', title: 'Mahavir Jayanti', description: 'Jain festival' },
    { date: '2026-04-14', title: 'Ambedkar Jayanti', description: 'National observance' },
    { date: '2026-05-01', title: 'May Day', description: 'Workers day' },
    { date: '2026-08-15', title: 'Independence Day', description: 'National holiday' },
    { date: '2026-10-02', title: 'Gandhi Jayanti', description: 'National holiday' },
    { date: '2026-10-20', title: 'Dussehra', description: 'Hindu festival' },
    { date: '2026-11-09', title: 'Diwali', description: 'Festival of lights' },
    { date: '2026-12-25', title: 'Christmas', description: 'National holiday' },
  ]

  return holidays
    .filter((h) => {
      const hDate = parseISO(h.date)
      return isWithinInterval(hDate, { start: startDate, end: endDate })
    })
    .map((h) => ({
      id: `holiday-${h.date}`,
      title: h.title,
      description: h.description,
      start: `${h.date}T00:00:00`,
      end: `${h.date}T23:59:59`,
      type: 'holiday' as const,
      allDay: true,
    }))
}

// School events
function getSchoolEvents(startDate: Date, endDate: Date): CalendarEvent[] {
  const events: Array<{
    date: string
    title: string
    description: string
    startTime: string
    endTime: string
    allDay: boolean
  }> = [
    {
      date: '2026-02-07',
      title: 'Annual Sports Day',
      description: 'Inter-house sports competition',
      startTime: '09:00',
      endTime: '16:00',
      allDay: false,
    },
    {
      date: '2026-02-14',
      title: 'Science Fair',
      description: 'Annual science exhibition by students',
      startTime: '10:00',
      endTime: '15:00',
      allDay: false,
    },
    {
      date: '2026-02-20',
      title: 'Parent-Teacher Meeting',
      description: 'PTM for Classes 9-10',
      startTime: '10:00',
      endTime: '13:00',
      allDay: false,
    },
    {
      date: '2026-02-28',
      title: 'Cultural Day',
      description: 'Annual cultural performances by students',
      startTime: '09:00',
      endTime: '14:00',
      allDay: false,
    },
    {
      date: '2026-03-05',
      title: 'Annual Day Rehearsal',
      description: 'Final rehearsal for annual day ceremony',
      startTime: '08:00',
      endTime: '12:00',
      allDay: false,
    },
    {
      date: '2026-03-07',
      title: 'Annual Day Celebration',
      description: 'Grand annual day event with chief guest',
      startTime: '09:00',
      endTime: '15:00',
      allDay: false,
    },
    {
      date: '2026-03-20',
      title: 'Inter-School Quiz',
      description: 'District level quiz competition hosted at school',
      startTime: '10:00',
      endTime: '14:00',
      allDay: false,
    },
    {
      date: '2026-04-15',
      title: 'Earth Day Activity',
      description: 'Tree planting and environment awareness campaign',
      startTime: '08:00',
      endTime: '11:00',
      allDay: false,
    },
  ]

  return events
    .filter((e) => {
      const eDate = parseISO(e.date)
      return isWithinInterval(eDate, { start: startDate, end: endDate })
    })
    .map((e) => ({
      id: `school-evt-${e.date}-${e.title.replace(/\s+/g, '-').toLowerCase()}`,
      title: e.title,
      description: e.description,
      start: e.allDay ? `${e.date}T00:00:00` : `${e.date}T${e.startTime}:00`,
      end: e.allDay ? `${e.date}T23:59:59` : `${e.date}T${e.endTime}:00`,
      type: 'event' as const,
      allDay: e.allDay,
    }))
}

// Exam events
function getExamEvents(startDate: Date, endDate: Date): CalendarEvent[] {
  const exams: Array<{
    date: string
    title: string
    startTime: string
    endTime: string
    className: string
  }> = [
    { date: '2026-02-16', title: 'Unit Test 4 - Mathematics', startTime: '09:00', endTime: '10:30', className: 'Class 10' },
    { date: '2026-02-17', title: 'Unit Test 4 - Science', startTime: '09:00', endTime: '10:30', className: 'Class 10' },
    { date: '2026-02-18', title: 'Unit Test 4 - English', startTime: '09:00', endTime: '10:30', className: 'Class 10' },
    { date: '2026-03-02', title: 'Pre-Board Exam - Mathematics', startTime: '09:00', endTime: '12:00', className: 'Class 10' },
    { date: '2026-03-03', title: 'Pre-Board Exam - Science', startTime: '09:00', endTime: '12:00', className: 'Class 10' },
    { date: '2026-03-04', title: 'Pre-Board Exam - English', startTime: '09:00', endTime: '12:00', className: 'Class 10' },
    { date: '2026-03-05', title: 'Pre-Board Exam - Hindi', startTime: '09:00', endTime: '12:00', className: 'Class 10' },
    { date: '2026-03-06', title: 'Pre-Board Exam - Social Studies', startTime: '09:00', endTime: '12:00', className: 'Class 10' },
    { date: '2026-03-16', title: 'Unit Test 4 - Mathematics', startTime: '09:00', endTime: '10:30', className: 'Class 9' },
    { date: '2026-03-17', title: 'Unit Test 4 - Science', startTime: '09:00', endTime: '10:30', className: 'Class 9' },
  ]

  return exams
    .filter((e) => {
      const eDate = parseISO(e.date)
      return isWithinInterval(eDate, { start: startDate, end: endDate })
    })
    .map((e) => ({
      id: `exam-${e.date}-${e.title.replace(/\s+/g, '-').toLowerCase()}`,
      title: e.title,
      start: `${e.date}T${e.startTime}:00`,
      end: `${e.date}T${e.endTime}:00`,
      type: 'exam' as const,
      allDay: false,
      className: e.className,
    }))
}

// Meeting events
function getMeetingEvents(startDate: Date, endDate: Date): CalendarEvent[] {
  const meetings: Array<{
    date: string
    title: string
    startTime: string
    endTime: string
    description: string
  }> = [
    { date: '2026-02-02', title: 'Staff Meeting', startTime: '15:30', endTime: '16:30', description: 'Monthly staff meeting' },
    { date: '2026-02-09', title: 'Department Heads Meeting', startTime: '15:30', endTime: '16:15', description: 'Curriculum review' },
    { date: '2026-02-23', title: 'Board Meeting', startTime: '11:00', endTime: '13:00', description: 'Quarterly board review' },
    { date: '2026-03-02', title: 'Staff Meeting', startTime: '15:30', endTime: '16:30', description: 'Monthly staff meeting' },
    { date: '2026-03-13', title: 'Exam Committee Meeting', startTime: '14:00', endTime: '15:30', description: 'Pre-board exam review' },
    { date: '2026-04-06', title: 'Staff Meeting', startTime: '15:30', endTime: '16:30', description: 'Monthly staff meeting' },
  ]

  return meetings
    .filter((m) => {
      const mDate = parseISO(m.date)
      return isWithinInterval(mDate, { start: startDate, end: endDate })
    })
    .map((m) => ({
      id: `meeting-${m.date}-${m.title.replace(/\s+/g, '-').toLowerCase()}`,
      title: m.title,
      description: m.description,
      start: `${m.date}T${m.startTime}:00`,
      end: `${m.date}T${m.endTime}:00`,
      type: 'meeting' as const,
      allDay: false,
    }))
}

// Substitution events
function getSubstitutionEvents(startDate: Date, endDate: Date): CalendarEvent[] {
  const subs: Array<{
    date: string
    title: string
    startTime: string
    endTime: string
    originalTeacher: string
    substituteTeacher: string
    className: string
    sectionName: string
    roomName: string
  }> = [
    {
      date: '2026-02-25',
      title: 'Mathematics (Substitution)',
      startTime: '08:00',
      endTime: '08:45',
      originalTeacher: 'Mrs. Priya Sharma',
      substituteTeacher: 'Mr. Rajesh Gupta',
      className: 'Class 10',
      sectionName: 'A',
      roomName: 'Room 101',
    },
    {
      date: '2026-02-26',
      title: 'Science (Substitution)',
      startTime: '09:45',
      endTime: '10:30',
      originalTeacher: 'Dr. Anita Patel',
      substituteTeacher: 'Mrs. Kavita Nair',
      className: 'Class 9',
      sectionName: 'B',
      roomName: 'Lab 1',
    },
    {
      date: '2026-03-10',
      title: 'Hindi (Substitution)',
      startTime: '10:30',
      endTime: '11:15',
      originalTeacher: 'Mrs. Sunita Singh',
      substituteTeacher: 'Mr. Vikram Rao',
      className: 'Class 8',
      sectionName: 'A',
      roomName: 'Room 103',
    },
  ]

  return subs
    .filter((s) => {
      const sDate = parseISO(s.date)
      return isWithinInterval(sDate, { start: startDate, end: endDate })
    })
    .map((s) => ({
      id: `sub-${s.date}-${s.title.replace(/\s+/g, '-').toLowerCase()}`,
      title: s.title,
      start: `${s.date}T${s.startTime}:00`,
      end: `${s.date}T${s.endTime}:00`,
      type: 'substitution' as const,
      allDay: false,
      originalTeacher: s.originalTeacher,
      substituteTeacher: s.substituteTeacher,
      className: s.className,
      sectionName: s.sectionName,
      roomName: s.roomName,
    }))
}

// In-memory store for user-created events
const userCreatedEvents: CalendarEvent[] = []

// ==================== HANDLERS ====================

export const calendarHandlers = [
  // GET /api/calendar/events
  http.get('/api/calendar/events', async ({ request }) => {
    await mockDelay('read')

    const url = new URL(request.url)
    const startDateStr = url.searchParams.get('startDate') || ''
    const endDateStr = url.searchParams.get('endDate') || ''
    const classId = url.searchParams.get('classId')
    const sectionId = url.searchParams.get('sectionId')
    const teacherId = url.searchParams.get('teacherId')
    const typeFilter = url.searchParams.get('type')

    if (!startDateStr || !endDateStr) {
      return HttpResponse.json({ events: [] })
    }

    const startDate = parseISO(startDateStr)
    const endDate = parseISO(endDateStr)

    let events: CalendarEvent[] = []

    // Generate class events
    if (classId && sectionId) {
      // Specific class + section
      const cls = CLASSES.find((c) => c.id === classId)
      const sec = cls?.sections.find((s) => s.id === sectionId)
      if (cls && sec) {
        events.push(...generateClassEvents(cls, sec, startDate, endDate))
      }
    } else if (classId) {
      // All sections of a class
      const cls = CLASSES.find((c) => c.id === classId)
      if (cls) {
        cls.sections.forEach((sec) => {
          events.push(...generateClassEvents(cls, sec, startDate, endDate))
        })
      }
    } else if (teacherId) {
      // All events for a specific teacher
      const teacher = TEACHERS.find((t) => t.id === teacherId)
      if (teacher) {
        CLASSES.forEach((cls) => {
          cls.sections.forEach((sec) => {
            const classEvents = generateClassEvents(cls, sec, startDate, endDate)
            events.push(...classEvents.filter((e) => e.teacherName === teacher.name))
          })
        })
      }
    } else {
      // All classes - just pick Class 10-A as default view to avoid overwhelming data
      const defaultClass = CLASSES.find((c) => c.id === 'cls-10')
      if (defaultClass) {
        defaultClass.sections.forEach((sec) => {
          events.push(...generateClassEvents(defaultClass, sec, startDate, endDate))
        })
      }
    }

    // Always add holidays, school events, exams, meetings, substitutions
    events.push(...getHolidays(startDate, endDate))
    events.push(...getSchoolEvents(startDate, endDate))
    events.push(...getExamEvents(startDate, endDate))
    events.push(...getMeetingEvents(startDate, endDate))
    events.push(...getSubstitutionEvents(startDate, endDate))

    // Add user-created events within range
    userCreatedEvents.forEach((evt) => {
      const evtStart = parseISO(evt.start)
      if (isWithinInterval(evtStart, { start: startDate, end: endDate })) {
        events.push(evt)
      }
    })

    // Apply type filter
    if (typeFilter) {
      events = events.filter((e) => e.type === typeFilter)
    }

    return HttpResponse.json({ events })
  }),

  // GET /api/calendar/filters
  http.get('/api/calendar/filters', async () => {
    await mockDelay('read')
    const filters: CalendarFilters = {
      classes: CLASSES,
      teachers: TEACHERS,
    }
    return HttpResponse.json(filters)
  }),

  // POST /api/calendar/events
  http.post('/api/calendar/events', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as Record<string, unknown>

    const newEvent: CalendarEvent = {
      id: `user-evt-${Date.now()}`,
      title: body.title as string,
      description: (body.description as string) || undefined,
      start: body.startDate as string,
      end: body.endDate as string,
      type: (body.type as CalendarEvent['type']) || 'event',
      allDay: (body.allDay as boolean) || false,
    }

    userCreatedEvents.push(newEvent)
    return HttpResponse.json(newEvent, { status: 201 })
  }),

  // PUT /api/calendar/events/:id
  http.put('/api/calendar/events/:id', async ({ params, request }) => {
    await mockDelay('write')
    const body = (await request.json()) as Record<string, unknown>
    const index = userCreatedEvents.findIndex((e) => e.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const existing = userCreatedEvents[index]
    if (body.title) existing.title = body.title as string
    if (body.description !== undefined) existing.description = body.description as string
    if (body.startDate) existing.start = body.startDate as string
    if (body.endDate) existing.end = body.endDate as string
    if (body.type) existing.type = body.type as CalendarEvent['type']
    if (body.allDay !== undefined) existing.allDay = body.allDay as boolean
    userCreatedEvents[index] = existing

    return HttpResponse.json(userCreatedEvents[index])
  }),

  // DELETE /api/calendar/events/:id
  http.delete('/api/calendar/events/:id', async ({ params }) => {
    await mockDelay('write')
    const index = userCreatedEvents.findIndex((e) => e.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    userCreatedEvents.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),
]
