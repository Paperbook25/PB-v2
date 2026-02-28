// ==================== STATUS & TYPE UNIONS ====================

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

export type PeriodType = 'class' | 'break' | 'lunch' | 'assembly' | 'activity'

export type TimetableStatus = 'draft' | 'published' | 'archived'

export type SubstitutionStatus = 'pending' | 'approved' | 'rejected' | 'completed'

// ==================== CONSTANTS ====================

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
]

export const PERIOD_TYPES: { value: PeriodType; label: string; color: string }[] = [
  { value: 'class', label: 'Class', color: 'bg-blue-100 text-blue-700' },
  { value: 'break', label: 'Break', color: 'bg-green-100 text-green-700' },
  { value: 'lunch', label: 'Lunch', color: 'bg-orange-100 text-orange-700' },
  { value: 'assembly', label: 'Assembly', color: 'bg-purple-100 text-purple-700' },
  { value: 'activity', label: 'Activity', color: 'bg-pink-100 text-pink-700' },
]

// ==================== INTERFACES ====================

export interface PeriodDefinition {
  id: string
  name: string
  type: PeriodType
  startTime: string // HH:mm format
  endTime: string
  order: number
  isActive: boolean
}

export interface Subject {
  id: string
  name: string
  code: string
  color: string
  weeklyPeriods: number // Target periods per week
}

export interface Room {
  id: string
  name: string
  building: string
  capacity: number
  type: 'classroom' | 'lab' | 'library' | 'auditorium' | 'sports' | 'other'
  facilities: string[]
  isAvailable: boolean
}

export interface TimetableEntry {
  id: string
  timetableId: string
  day: DayOfWeek
  periodId: string
  subjectId: string
  subjectName: string
  teacherId: string
  teacherName: string
  roomId: string
  roomName: string
  classId: string
  className: string
  sectionId: string
  sectionName: string
}

export interface Timetable {
  id: string
  name: string
  academicYear: string
  term: string
  classId: string
  className: string
  sectionId: string
  sectionName: string
  status: TimetableStatus
  effectiveFrom: string
  effectiveTo?: string
  entries: TimetableEntry[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface TeacherTimetable {
  teacherId: string
  teacherName: string
  department: string
  entries: TimetableEntry[]
  totalPeriods: number
  freePeriodsPerDay: Record<DayOfWeek, number>
}

export interface RoomTimetable {
  roomId: string
  roomName: string
  entries: TimetableEntry[]
  utilizationPercent: number
}

export interface Substitution {
  id: string
  date: string
  periodId: string
  periodName: string
  originalTeacherId: string
  originalTeacherName: string
  substituteTeacherId: string
  substituteTeacherName: string
  classId: string
  className: string
  sectionId: string
  sectionName: string
  subjectId: string
  subjectName: string
  reason: string
  status: SubstitutionStatus
  approvedBy?: string
  approvedAt?: string
  createdBy: string
  createdAt: string
}

export interface TimetableConflict {
  type: 'teacher' | 'room' | 'class'
  message: string
  day: DayOfWeek
  periodId: string
  entries: TimetableEntry[]
}

// ==================== STATS ====================

export interface TimetableStats {
  totalClasses: number
  publishedTimetables: number
  draftTimetables: number
  totalTeachers: number
  avgPeriodsPerTeacher: number
  pendingSubstitutions: number
  roomUtilization: number
}

// ==================== FILTER TYPES ====================

export interface TimetableFilters {
  search?: string
  classId?: string
  status?: TimetableStatus
  academicYear?: string
  page?: number
  limit?: number
}

export interface SubstitutionFilters {
  search?: string
  date?: string
  status?: SubstitutionStatus
  teacherId?: string
  page?: number
  limit?: number
}

// ==================== REQUEST TYPES ====================

export interface CreateTimetableRequest {
  name: string
  academicYear: string
  term: string
  classId: string
  sectionId: string
  effectiveFrom: string
  effectiveTo?: string
}

export interface CreateTimetableEntryRequest {
  timetableId: string
  day: DayOfWeek
  periodId: string
  subjectId: string
  teacherId: string
  roomId: string
}

export interface CreateSubstitutionRequest {
  date: string
  periodId: string
  originalTeacherId: string
  substituteTeacherId: string
  classId: string
  sectionId: string
  subjectId: string
  reason: string
}

export interface UpdatePeriodDefinitionRequest {
  name?: string
  type?: PeriodType
  startTime?: string
  endTime?: string
  order?: number
  isActive?: boolean
}
