import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCalendarEvents,
  fetchCalendarFilters,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../api/calendar.api'

// ==================== QUERY KEYS ====================

export const calendarKeys = {
  all: ['calendar'] as const,
  events: () => [...calendarKeys.all, 'events'] as const,
  eventList: (params: {
    startDate: string
    endDate: string
    classId?: string
    sectionId?: string
    teacherId?: string
    type?: string
  }) => [...calendarKeys.events(), params] as const,
  filters: () => [...calendarKeys.all, 'filters'] as const,
}

// ==================== EVENTS ====================

export function useCalendarEvents(params: {
  startDate: string
  endDate: string
  classId?: string
  sectionId?: string
  teacherId?: string
  type?: string
}) {
  return useQuery({
    queryKey: calendarKeys.eventList(params),
    queryFn: () => fetchCalendarEvents(params),
    enabled: !!params.startDate && !!params.endDate,
  })
}

// ==================== FILTERS ====================

export function useCalendarFilters() {
  return useQuery({
    queryKey: calendarKeys.filters(),
    queryFn: fetchCalendarFilters,
  })
}

// ==================== CREATE EVENT ====================

export function useCreateCalendarEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string
      description?: string
      startDate: string
      endDate: string
      type: string
      allDay?: boolean
      appliesToClasses?: string
    }) => createCalendarEvent(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.events() })
    },
  })
}

// ==================== UPDATE EVENT ====================

export function useUpdateCalendarEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<{
        title: string
        description: string
        startDate: string
        endDate: string
        type: string
        allDay: boolean
      }>
    }) => updateCalendarEvent(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.events() })
    },
  })
}

// ==================== DELETE EVENT ====================

export function useDeleteCalendarEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCalendarEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.events() })
    },
  })
}
