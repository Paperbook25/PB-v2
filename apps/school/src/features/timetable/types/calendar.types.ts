export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string // ISO datetime
  end: string   // ISO datetime
  type: 'class' | 'holiday' | 'event' | 'exam' | 'meeting' | 'substitution'
  color?: string
  allDay: boolean
  subjectName?: string
  teacherName?: string
  roomName?: string
  className?: string
  sectionName?: string
  originalTeacher?: string
  substituteTeacher?: string
}

export interface CalendarFilters {
  classes: Array<{ id: string; name: string; sections: Array<{ id: string; name: string }> }>
  teachers: Array<{ id: string; name: string; department?: string }>
}

export type CalendarView = 'day' | 'week' | 'month'
export type CalendarFilterMode = 'all' | 'class' | 'teacher'
