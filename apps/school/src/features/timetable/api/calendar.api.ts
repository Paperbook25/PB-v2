import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import type { CalendarEvent, CalendarFilters } from '../types/calendar.types'

export function fetchCalendarEvents(params: {
  startDate: string
  endDate: string
  classId?: string
  sectionId?: string
  teacherId?: string
  type?: string
}): Promise<{ events: CalendarEvent[] }> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v) searchParams.set(k, v)
  })
  return apiGet(`/api/calendar/events?${searchParams}`)
}

export function fetchCalendarFilters(): Promise<CalendarFilters> {
  return apiGet('/api/calendar/filters')
}

export function createCalendarEvent(data: {
  title: string
  description?: string
  startDate: string
  endDate: string
  type: string
  allDay?: boolean
  appliesToClasses?: string
}): Promise<CalendarEvent> {
  return apiPost('/api/calendar/events', data)
}

export function updateCalendarEvent(
  id: string,
  data: Partial<{
    title: string
    description: string
    startDate: string
    endDate: string
    type: string
    allDay: boolean
  }>
): Promise<CalendarEvent> {
  return apiPut(`/api/calendar/events/${id}`, data)
}

export function deleteCalendarEvent(id: string): Promise<void> {
  return apiDelete(`/api/calendar/events/${id}`)
}
