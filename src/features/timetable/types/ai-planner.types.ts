export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  schedule?: AIGeneratedSchedule
  quickActions?: QuickAction[]
}

export interface QuickAction {
  label: string
  action: string
}

export interface ScheduleEntry {
  dayOfWeek: string
  periodId: string
  subjectId: string
  subjectName: string
  teacherId: string
  teacherName: string
  roomId: string
  roomName: string
}

export interface AIGeneratedSchedule {
  classId: string
  sectionId: string
  academicYearId: string
  entries: ScheduleEntry[]
  conflicts: Array<{
    type: 'teacher' | 'room' | 'class'
    message: string
    day: string
    periodId: string
  }>
  summary: {
    totalSlotsFilled: number
    totalSlotsAvailable: number
    subjectDistribution: Record<string, { assigned: number; target: number }>
  }
}
