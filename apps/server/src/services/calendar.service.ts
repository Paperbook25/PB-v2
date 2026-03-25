import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Types ====================

export interface CalendarEventItem {
  id: string
  title: string
  description?: string
  start: string // ISO datetime
  end: string   // ISO datetime
  type: 'class' | 'holiday' | 'event' | 'exam' | 'meeting' | 'substitution'
  color?: string
  allDay: boolean
  // Class-specific fields
  subjectName?: string
  teacherName?: string
  roomName?: string
  className?: string
  sectionName?: string
  // For substitutions
  originalTeacher?: string
  substituteTeacher?: string
}

export interface WeeklyScheduleEntry {
  id: string
  dayOfWeek: string
  periodId: string
  periodName: string
  periodNumber: number
  startTime: string
  endTime: string
  subjectId: string | null
  subjectName: string | null
  subjectCode: string | null
  teacherId: string | null
  teacherName: string | null
  roomId: string | null
  roomName: string | null
  classId: string | null
  className: string | null
  sectionId: string | null
  sectionName: string | null
}

export interface WeeklySchedule {
  entries: WeeklyScheduleEntry[]
  periods: Array<{ id: string; name: string; periodNumber: number; startTime: string; endTime: string; type: string }>
  days: string[]
}

// ==================== Constants ====================

const DAY_MAP: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

const DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

// Map CalendarEventType enum to our output types
const eventTypeMap: Record<string, CalendarEventItem['type']> = {
  holiday: 'holiday',
  vacation: 'holiday',
  exam: 'exam',
  ptm: 'meeting',
  sports: 'event',
  cultural: 'event',
  workshop: 'event',
  other: 'event',
}

// Colors for event types
const eventColors: Record<string, string> = {
  class: '#4285f4',
  holiday: '#e67c73',
  event: '#7986cb',
  exam: '#f4511e',
  meeting: '#33b679',
  substitution: '#f6bf26',
}

const periodTypeFromDb: Record<string, string> = {
  period_class: 'class',
  period_break: 'break',
  period_lunch: 'lunch',
  period_assembly: 'assembly',
  period_activity: 'activity',
}

// ==================== Helper Functions ====================

/**
 * Get all dates in a range, grouped by day-of-week name.
 */
function getDatesInRange(startDate: Date, endDate: Date): Map<string, Date[]> {
  const result = new Map<string, Date[]>()
  for (const day of DAY_NAMES) {
    result.set(day, [])
  }

  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  while (current <= end) {
    const jsDay = current.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    // Map JS day to our day names (skip Sunday = 0)
    if (jsDay >= 1 && jsDay <= 6) {
      const dayName = DAY_NAMES[jsDay - 1]
      const dates = result.get(dayName)
      if (dates) {
        dates.push(new Date(current))
      }
    }
    current.setDate(current.getDate() + 1)
  }

  return result
}

/**
 * Check if a date falls on a holiday.
 */
function isHoliday(date: Date, holidays: Array<{ startDate: Date; endDate: Date }>): boolean {
  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)

  for (const h of holidays) {
    const start = new Date(h.startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(h.endDate)
    end.setHours(23, 59, 59, 999)
    if (dateOnly >= start && dateOnly <= end) {
      return true
    }
  }
  return false
}

/**
 * Combine a date with a time string (HH:MM) into an ISO datetime string.
 */
function combineDateAndTime(date: Date, time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const combined = new Date(date)
  combined.setHours(hours, minutes, 0, 0)
  return combined.toISOString()
}

/**
 * Format a date as YYYY-MM-DD for substitution date comparison.
 */
function formatDateKey(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

function formatEntryForSchedule(e: any, timetableContext?: any): WeeklyScheduleEntry {
  const tt = timetableContext || e.timetable
  return {
    id: e.id,
    dayOfWeek: e.dayOfWeek,
    periodId: e.periodId,
    periodName: e.period?.name || '',
    periodNumber: e.period?.periodNumber || 0,
    startTime: e.period?.startTime || '',
    endTime: e.period?.endTime || '',
    subjectId: e.subjectId || null,
    subjectName: e.subject?.name || null,
    subjectCode: e.subject?.code || null,
    teacherId: e.teacherId || null,
    teacherName: e.teacher ? `${e.teacher.firstName} ${e.teacher.lastName}`.trim() : null,
    roomId: e.roomId || null,
    roomName: e.room?.name || null,
    classId: tt?.classId || tt?.class?.id || null,
    className: tt?.class?.name || null,
    sectionId: tt?.sectionId || tt?.section?.id || null,
    sectionName: tt?.section?.name || null,
  }
}

// Standard entry include for timetable entries
const entryInclude = {
  period: true,
  subject: { select: { id: true, name: true, code: true } },
  room: { select: { id: true, name: true } },
  teacher: { select: { id: true, firstName: true, lastName: true } },
}

// ==================== Main Functions ====================

/**
 * Get all calendar events for a date range.
 * Returns unified events from:
 * 1. CalendarEvents (holidays, school events)
 * 2. TimetableEntries (recurring class schedule, expanded into the date range)
 * 3. Substitutions (modifications to the regular schedule)
 */
export async function getCalendarEvents(schoolId: string, params: {
  startDate: string
  endDate: string
  classId?: string
  sectionId?: string
  teacherId?: string
  type?: 'all' | 'classes' | 'events' | 'holidays'
}): Promise<CalendarEventItem[]> {
  const { startDate, endDate, classId, sectionId, teacherId, type = 'all' } = params

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw AppError.badRequest('Invalid date format. Use ISO date strings (YYYY-MM-DD).')
  }

  const results: CalendarEventItem[] = []

  // 1. Fetch CalendarEvents (holidays, school events, exams, etc.)
  if (type === 'all' || type === 'events' || type === 'holidays') {
    const calendarWhere: any = {
      organizationId: schoolId,
      startDate: { lte: end },
      endDate: { gte: start },
    }

    if (type === 'holidays') {
      calendarWhere.type = { in: ['holiday', 'vacation'] }
    }

    const calendarEvents = await prisma.calendarEvent.findMany({
      where: calendarWhere,
      orderBy: { startDate: 'asc' },
    })

    for (const evt of calendarEvents) {
      const mappedType = eventTypeMap[evt.type] || 'event'

      // If filtering by type='holidays' and this is not a holiday type, skip
      if (type === 'holidays' && mappedType !== 'holiday') continue

      results.push({
        id: evt.id,
        title: evt.title,
        description: evt.description || undefined,
        start: evt.startDate.toISOString(),
        end: evt.endDate.toISOString(),
        type: mappedType,
        color: eventColors[mappedType],
        allDay: true,
      })
    }
  }

  // 2. Expand timetable entries into the date range
  if (type === 'all' || type === 'classes') {
    // Gather holidays for skipping class events on holiday dates
    const holidays = await prisma.calendarEvent.findMany({
      where: {
        organizationId: schoolId,
        type: { in: ['holiday', 'vacation'] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
      select: { startDate: true, endDate: true },
    })

    // Build the timetable filter
    const timetableWhere: any = {
      organizationId: schoolId,
      status: 'tt_published',
    }
    if (classId) timetableWhere.classId = classId
    if (sectionId) timetableWhere.sectionId = sectionId

    // If filtering by teacher, we need entries for that teacher across all published timetables
    const entryWhere: any = {}
    if (teacherId) entryWhere.teacherId = teacherId

    const timetables = await prisma.timetable.findMany({
      where: timetableWhere,
      include: {
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        entries: {
          where: entryWhere,
          include: {
            ...entryInclude,
            substitutions: {
              where: {
                date: { gte: start, lte: end },
                status: { in: ['sub_approved', 'sub_completed'] },
              },
              include: {
                originalTeacher: { select: { id: true, firstName: true, lastName: true } },
                substituteTeacher: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    })

    // Get all dates in range grouped by day-of-week
    const datesByDay = getDatesInRange(start, end)

    for (const timetable of timetables) {
      for (const entry of timetable.entries) {
        const dayDates = datesByDay.get(entry.dayOfWeek)
        if (!dayDates) continue

        for (const date of dayDates) {
          // Skip holidays
          if (isHoliday(date, holidays)) continue

          const dateKey = formatDateKey(date)

          // Check if there is a substitution for this entry on this date
          const sub = entry.substitutions.find(
            (s: any) => formatDateKey(s.date) === dateKey
          )

          if (sub) {
            // Create a substitution event
            const originalName = sub.originalTeacher
              ? `${sub.originalTeacher.firstName} ${sub.originalTeacher.lastName}`.trim()
              : (entry.teacher ? `${entry.teacher.firstName} ${entry.teacher.lastName}`.trim() : undefined)
            const substituteName = sub.substituteTeacher
              ? `${sub.substituteTeacher.firstName} ${sub.substituteTeacher.lastName}`.trim()
              : undefined

            // If filtering by teacher and this substitution replaces them, still show it
            results.push({
              id: `${entry.id}_${dateKey}_sub`,
              title: `${entry.subject?.name || 'Class'} (Substitution)`,
              description: sub.reason || undefined,
              start: combineDateAndTime(date, entry.period.startTime),
              end: combineDateAndTime(date, entry.period.endTime),
              type: 'substitution',
              color: eventColors.substitution,
              allDay: false,
              subjectName: entry.subject?.name || undefined,
              teacherName: substituteName || originalName,
              roomName: entry.room?.name || undefined,
              className: timetable.class?.name || undefined,
              sectionName: timetable.section?.name || undefined,
              originalTeacher: originalName,
              substituteTeacher: substituteName,
            })
          } else {
            // Regular class event
            const teacherName = entry.teacher
              ? `${entry.teacher.firstName} ${entry.teacher.lastName}`.trim()
              : undefined

            results.push({
              id: `${entry.id}_${dateKey}`,
              title: entry.subject?.name || 'Class',
              start: combineDateAndTime(date, entry.period.startTime),
              end: combineDateAndTime(date, entry.period.endTime),
              type: 'class',
              color: eventColors.class,
              allDay: false,
              subjectName: entry.subject?.name || undefined,
              teacherName,
              roomName: entry.room?.name || undefined,
              className: timetable.class?.name || undefined,
              sectionName: timetable.section?.name || undefined,
            })
          }
        }
      }
    }
  }

  // Sort by start time
  results.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  return results
}

/**
 * Get the weekly recurring schedule for a class (from published timetable).
 * Returns the raw timetable entries with period times, subject, teacher, room.
 */
export async function getClassSchedule(schoolId: string, classId: string, sectionId?: string): Promise<WeeklySchedule> {
  const timetableWhere: any = {
    organizationId: schoolId,
    classId,
    status: 'tt_published',
  }
  if (sectionId) timetableWhere.sectionId = sectionId

  const timetables = await prisma.timetable.findMany({
    where: timetableWhere,
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      entries: {
        include: entryInclude,
        orderBy: [{ dayOfWeek: 'asc' }, { period: { periodNumber: 'asc' } }],
      },
    },
  })

  const allEntries: WeeklyScheduleEntry[] = []
  for (const tt of timetables) {
    for (const entry of tt.entries) {
      allEntries.push(formatEntryForSchedule(entry, tt))
    }
  }

  const periods = await prisma.periodDefinition.findMany({
    where: { isActive: true, organizationId: schoolId },
    orderBy: { periodNumber: 'asc' },
  })

  return {
    entries: allEntries,
    periods: periods.map(p => ({
      id: p.id,
      name: p.name,
      periodNumber: p.periodNumber,
      startTime: p.startTime,
      endTime: p.endTime,
      type: periodTypeFromDb[p.type] || p.type,
    })),
    days: [...DAY_NAMES],
  }
}

/**
 * Get the weekly recurring schedule for a teacher across all their classes.
 */
export async function getTeacherSchedule(schoolId: string, teacherId: string): Promise<WeeklySchedule> {
  const teacher = await prisma.staff.findFirst({ where: { id: teacherId, organizationId: schoolId } })
  if (!teacher) throw AppError.notFound('Teacher not found')

  const entries = await prisma.timetableEntry.findMany({
    where: {
      teacherId,
      timetable: { status: 'tt_published', organizationId: schoolId },
    },
    include: {
      ...entryInclude,
      timetable: {
        include: {
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { period: { periodNumber: 'asc' } }],
  })

  const formattedEntries = entries.map(e => formatEntryForSchedule(e, e.timetable))

  const periods = await prisma.periodDefinition.findMany({
    where: { isActive: true, organizationId: schoolId },
    orderBy: { periodNumber: 'asc' },
  })

  return {
    entries: formattedEntries,
    periods: periods.map(p => ({
      id: p.id,
      name: p.name,
      periodNumber: p.periodNumber,
      startTime: p.startTime,
      endTime: p.endTime,
      type: periodTypeFromDb[p.type] || p.type,
    })),
    days: [...DAY_NAMES],
  }
}

/**
 * Get all classes/sections available for the calendar filter dropdown.
 */
export async function getCalendarFilters(schoolId: string): Promise<{
  classes: Array<{ id: string; name: string; sections: Array<{ id: string; name: string }> }>
  teachers: Array<{ id: string; name: string; department?: string }>
}> {
  const [classes, teachers] = await Promise.all([
    prisma.class.findMany({
      where: { organizationId: schoolId },
      orderBy: { sortOrder: 'asc' },
      include: {
        sections: {
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        },
      },
    }),
    prisma.staff.findMany({
      where: { status: 'active', organizationId: schoolId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: { select: { name: true } },
      },
      orderBy: { firstName: 'asc' },
    }),
  ])

  return {
    classes: classes.map(c => ({
      id: c.id,
      name: c.name,
      sections: c.sections.map(s => ({ id: s.id, name: s.name })),
    })),
    teachers: teachers.map(t => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`.trim(),
      department: t.department?.name || undefined,
    })),
  }
}

/**
 * Create a calendar event (holiday, school event, exam, meeting).
 */
export async function createCalendarEvent(schoolId: string, input: {
  title: string
  description?: string
  startDate: string
  endDate: string
  type: 'holiday' | 'event' | 'exam' | 'meeting'
  isRecurring?: boolean
  appliesToClasses?: string
  createdBy: string
}): Promise<any> {
  if (!input.title || !input.startDate || !input.endDate || !input.type) {
    throw AppError.badRequest('Title, startDate, endDate, and type are required.')
  }

  const startDate = new Date(input.startDate)
  const endDate = new Date(input.endDate)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw AppError.badRequest('Invalid date format. Use ISO date strings (YYYY-MM-DD).')
  }

  if (startDate > endDate) {
    throw AppError.badRequest('startDate must be before or equal to endDate.')
  }

  // Map our input types to the CalendarEventType enum values
  const typeMap: Record<string, string> = {
    holiday: 'holiday',
    event: 'other',
    exam: 'exam',
    meeting: 'ptm',
  }

  const dbType = typeMap[input.type] || 'other'

  // Parse appliesToClasses
  let appliesToClasses: any = null
  if (input.appliesToClasses && input.appliesToClasses !== 'all') {
    appliesToClasses = input.appliesToClasses.split(',').map(s => s.trim())
  }

  const event = await prisma.calendarEvent.create({
    data: {
      organizationId: schoolId,
      title: input.title,
      description: input.description || '',
      type: dbType as any,
      startDate,
      endDate,
      isRecurring: input.isRecurring || false,
      appliesToClasses,
    },
  })

  return {
    data: {
      id: event.id,
      title: event.title,
      description: event.description,
      type: input.type,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      isRecurring: event.isRecurring,
      appliesToClasses: event.appliesToClasses,
      createdAt: event.createdAt.toISOString(),
    },
  }
}

/**
 * Update a calendar event.
 */
export async function updateCalendarEvent(schoolId: string, id: string, input: Partial<{
  title: string
  description: string
  startDate: string
  endDate: string
  type: string
  appliesToClasses: string
}>): Promise<any> {
  const existing = await prisma.calendarEvent.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Calendar event not found')

  const data: any = {}

  if (input.title !== undefined) data.title = input.title
  if (input.description !== undefined) data.description = input.description

  if (input.startDate !== undefined) {
    const d = new Date(input.startDate)
    if (isNaN(d.getTime())) throw AppError.badRequest('Invalid startDate format.')
    data.startDate = d
  }

  if (input.endDate !== undefined) {
    const d = new Date(input.endDate)
    if (isNaN(d.getTime())) throw AppError.badRequest('Invalid endDate format.')
    data.endDate = d
  }

  if (input.type !== undefined) {
    const typeMap: Record<string, string> = {
      holiday: 'holiday',
      event: 'other',
      exam: 'exam',
      meeting: 'ptm',
    }
    data.type = typeMap[input.type] || input.type
  }

  if (input.appliesToClasses !== undefined) {
    if (input.appliesToClasses === 'all' || input.appliesToClasses === '') {
      data.appliesToClasses = null
    } else {
      data.appliesToClasses = input.appliesToClasses.split(',').map((s: string) => s.trim())
    }
  }

  const updated = await prisma.calendarEvent.update({
    where: { id },
    data,
  })

  return {
    data: {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      type: updated.type,
      startDate: updated.startDate.toISOString(),
      endDate: updated.endDate.toISOString(),
      isRecurring: updated.isRecurring,
      appliesToClasses: updated.appliesToClasses,
      updatedAt: updated.updatedAt.toISOString(),
    },
  }
}

/**
 * Delete a calendar event.
 */
export async function deleteCalendarEvent(schoolId: string, id: string): Promise<void> {
  const existing = await prisma.calendarEvent.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Calendar event not found')

  await prisma.calendarEvent.delete({ where: { id } })
}
