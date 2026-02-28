import { faker } from '@faker-js/faker'
import type {
  PeriodDefinition,
  Subject,
  Room,
  Timetable,
  TimetableEntry,
  Substitution,
  TimetableStats,
  DayOfWeek,
  PeriodType,
} from '@/features/timetable/types/timetable.types'

// ==================== PERIOD DEFINITIONS ====================

export const periodDefinitions: PeriodDefinition[] = [
  { id: 'P1', name: 'Period 1', type: 'class', startTime: '08:00', endTime: '08:45', order: 1, isActive: true },
  { id: 'P2', name: 'Period 2', type: 'class', startTime: '08:45', endTime: '09:30', order: 2, isActive: true },
  { id: 'P3', name: 'Period 3', type: 'class', startTime: '09:30', endTime: '10:15', order: 3, isActive: true },
  { id: 'BR1', name: 'Short Break', type: 'break', startTime: '10:15', endTime: '10:30', order: 4, isActive: true },
  { id: 'P4', name: 'Period 4', type: 'class', startTime: '10:30', endTime: '11:15', order: 5, isActive: true },
  { id: 'P5', name: 'Period 5', type: 'class', startTime: '11:15', endTime: '12:00', order: 6, isActive: true },
  { id: 'LN', name: 'Lunch Break', type: 'lunch', startTime: '12:00', endTime: '12:45', order: 7, isActive: true },
  { id: 'P6', name: 'Period 6', type: 'class', startTime: '12:45', endTime: '13:30', order: 8, isActive: true },
  { id: 'P7', name: 'Period 7', type: 'class', startTime: '13:30', endTime: '14:15', order: 9, isActive: true },
  { id: 'P8', name: 'Period 8', type: 'class', startTime: '14:15', endTime: '15:00', order: 10, isActive: true },
]

// ==================== SUBJECTS ====================

export const subjects: Subject[] = [
  { id: 'SUB001', name: 'Mathematics', code: 'MATH', color: '#3b82f6', weeklyPeriods: 6 },
  { id: 'SUB002', name: 'English', code: 'ENG', color: '#22c55e', weeklyPeriods: 5 },
  { id: 'SUB003', name: 'Science', code: 'SCI', color: '#f59e0b', weeklyPeriods: 5 },
  { id: 'SUB004', name: 'Social Studies', code: 'SST', color: '#8b5cf6', weeklyPeriods: 4 },
  { id: 'SUB005', name: 'Hindi', code: 'HIN', color: '#ec4899', weeklyPeriods: 4 },
  { id: 'SUB006', name: 'Computer Science', code: 'CS', color: '#14b8a6', weeklyPeriods: 3 },
  { id: 'SUB007', name: 'Physical Education', code: 'PE', color: '#f97316', weeklyPeriods: 2 },
  { id: 'SUB008', name: 'Art', code: 'ART', color: '#a855f7', weeklyPeriods: 2 },
  { id: 'SUB009', name: 'Music', code: 'MUS', color: '#06b6d4', weeklyPeriods: 1 },
  { id: 'SUB010', name: 'Moral Science', code: 'MS', color: '#84cc16', weeklyPeriods: 1 },
]

// ==================== ROOMS ====================

export const rooms: Room[] = [
  { id: 'RM001', name: 'Room 101', building: 'Main Block', capacity: 40, type: 'classroom', facilities: ['Projector', 'AC'], isAvailable: true },
  { id: 'RM002', name: 'Room 102', building: 'Main Block', capacity: 40, type: 'classroom', facilities: ['Projector', 'AC'], isAvailable: true },
  { id: 'RM003', name: 'Room 103', building: 'Main Block', capacity: 40, type: 'classroom', facilities: ['Projector'], isAvailable: true },
  { id: 'RM004', name: 'Room 201', building: 'Main Block', capacity: 45, type: 'classroom', facilities: ['Projector', 'AC', 'Smart Board'], isAvailable: true },
  { id: 'RM005', name: 'Room 202', building: 'Main Block', capacity: 45, type: 'classroom', facilities: ['Projector', 'AC'], isAvailable: true },
  { id: 'RM006', name: 'Computer Lab 1', building: 'Science Block', capacity: 30, type: 'lab', facilities: ['Computers', 'AC', 'Projector'], isAvailable: true },
  { id: 'RM007', name: 'Computer Lab 2', building: 'Science Block', capacity: 30, type: 'lab', facilities: ['Computers', 'AC', 'Projector'], isAvailable: true },
  { id: 'RM008', name: 'Physics Lab', building: 'Science Block', capacity: 35, type: 'lab', facilities: ['Lab Equipment', 'AC'], isAvailable: true },
  { id: 'RM009', name: 'Chemistry Lab', building: 'Science Block', capacity: 35, type: 'lab', facilities: ['Lab Equipment', 'AC', 'Fume Hood'], isAvailable: true },
  { id: 'RM010', name: 'Biology Lab', building: 'Science Block', capacity: 35, type: 'lab', facilities: ['Lab Equipment', 'AC', 'Microscopes'], isAvailable: true },
  { id: 'RM011', name: 'Library', building: 'Main Block', capacity: 100, type: 'library', facilities: ['AC', 'Reading Area', 'Computers'], isAvailable: true },
  { id: 'RM012', name: 'Auditorium', building: 'Admin Block', capacity: 500, type: 'auditorium', facilities: ['Stage', 'Sound System', 'AC', 'Projector'], isAvailable: true },
  { id: 'RM013', name: 'Sports Ground', building: 'Outdoor', capacity: 200, type: 'sports', facilities: ['Track', 'Football Field'], isAvailable: true },
  { id: 'RM014', name: 'Indoor Sports Hall', building: 'Sports Block', capacity: 100, type: 'sports', facilities: ['Basketball Court', 'Badminton Courts'], isAvailable: true },
]

// ==================== TEACHERS (Reference) ====================

const TEACHERS = [
  { id: 'TCH001', name: 'Dr. Ramesh Krishnamurthy', department: 'Mathematics' },
  { id: 'TCH002', name: 'Prof. Sunita Venkataraman', department: 'Science' },
  { id: 'TCH003', name: 'Dr. Anil Bhattacharya', department: 'Science' },
  { id: 'TCH004', name: 'Meenakshi Iyer', department: 'English' },
  { id: 'TCH005', name: 'Dr. Suresh Narayanan', department: 'Computer Science' },
  { id: 'TCH006', name: 'Kavitha Raghavan', department: 'Science' },
  { id: 'TCH007', name: 'Rajesh Tiwari', department: 'Social Studies' },
  { id: 'TCH008', name: 'Deepa Kulkarni', department: 'Art' },
  { id: 'TCH009', name: 'Amit Sharma', department: 'Hindi' },
  { id: 'TCH010', name: 'Priya Mehta', department: 'Physical Education' },
]

// ==================== CLASSES (Reference) ====================

const CLASSES = [
  { id: 'CLS001', name: 'Class 6', sections: [{ id: 'SEC001', name: 'A' }, { id: 'SEC002', name: 'B' }] },
  { id: 'CLS002', name: 'Class 7', sections: [{ id: 'SEC003', name: 'A' }, { id: 'SEC004', name: 'B' }] },
  { id: 'CLS003', name: 'Class 8', sections: [{ id: 'SEC005', name: 'A' }, { id: 'SEC006', name: 'B' }] },
  { id: 'CLS004', name: 'Class 9', sections: [{ id: 'SEC007', name: 'A' }, { id: 'SEC008', name: 'B' }] },
  { id: 'CLS005', name: 'Class 10', sections: [{ id: 'SEC009', name: 'A' }, { id: 'SEC010', name: 'B' }] },
]

// ==================== HELPER FUNCTIONS ====================

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const CLASS_PERIODS = periodDefinitions.filter(p => p.type === 'class')

function generateTimetableEntries(timetableId: string, classId: string, className: string, sectionId: string, sectionName: string): TimetableEntry[] {
  const entries: TimetableEntry[] = []
  let entryId = 1

  // For each day
  DAYS.forEach(day => {
    // Skip Saturday afternoon
    const periodsForDay = day === 'saturday' ? CLASS_PERIODS.slice(0, 4) : CLASS_PERIODS

    periodsForDay.forEach(period => {
      const subject = faker.helpers.arrayElement(subjects)
      const teacher = faker.helpers.arrayElement(TEACHERS)
      const room = faker.helpers.arrayElement(rooms.filter(r => r.type === 'classroom'))

      entries.push({
        id: `${timetableId}-E${String(entryId++).padStart(3, '0')}`,
        timetableId,
        day,
        periodId: period.id,
        subjectId: subject.id,
        subjectName: subject.name,
        teacherId: teacher.id,
        teacherName: teacher.name,
        roomId: room.id,
        roomName: room.name,
        classId,
        className,
        sectionId,
        sectionName,
      })
    })
  })

  return entries
}

// ==================== TIMETABLES ====================

export const timetables: Timetable[] = []

CLASSES.forEach((cls, clsIndex) => {
  cls.sections.forEach((section, secIndex) => {
    const timetableId = `TT${String(clsIndex * 2 + secIndex + 1).padStart(4, '0')}`
    const entries = generateTimetableEntries(timetableId, cls.id, cls.name, section.id, section.name)

    timetables.push({
      id: timetableId,
      name: `${cls.name} ${section.name} - 2024-25`,
      academicYear: '2024-25',
      term: 'Term 1',
      classId: cls.id,
      className: cls.name,
      sectionId: section.id,
      sectionName: section.name,
      status: clsIndex < 3 ? 'published' : 'draft',
      effectiveFrom: '2024-04-01',
      effectiveTo: '2025-03-31',
      entries,
      createdBy: 'Admin',
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    })
  })
})

// ==================== SUBSTITUTIONS ====================

function createSubstitution(index: number): Substitution {
  const timetable = faker.helpers.arrayElement(timetables)
  const entry = faker.helpers.arrayElement(timetable.entries)
  const substituteTeacher = faker.helpers.arrayElement(TEACHERS.filter(t => t.id !== entry.teacherId))

  const daysAgo = faker.number.int({ min: -7, max: 7 })
  const date = new Date()
  date.setDate(date.getDate() + daysAgo)

  const status = daysAgo < 0 ? 'completed' : faker.helpers.arrayElement(['pending', 'approved']) as Substitution['status']

  return {
    id: `SUB${String(index + 1).padStart(4, '0')}`,
    date: date.toISOString().split('T')[0],
    periodId: entry.periodId,
    periodName: periodDefinitions.find(p => p.id === entry.periodId)?.name || '',
    originalTeacherId: entry.teacherId,
    originalTeacherName: entry.teacherName,
    substituteTeacherId: substituteTeacher.id,
    substituteTeacherName: substituteTeacher.name,
    classId: entry.classId,
    className: entry.className,
    sectionId: entry.sectionId,
    sectionName: entry.sectionName,
    subjectId: entry.subjectId,
    subjectName: entry.subjectName,
    reason: faker.helpers.arrayElement([
      'Medical leave',
      'Personal emergency',
      'Training/Workshop',
      'Official duty',
      'Casual leave',
    ]),
    status,
    approvedBy: status === 'approved' || status === 'completed' ? 'Principal' : undefined,
    approvedAt: status === 'approved' || status === 'completed' ? faker.date.recent({ days: 3 }).toISOString() : undefined,
    createdBy: 'Admin',
    createdAt: faker.date.recent({ days: 14 }).toISOString(),
  }
}

export const substitutions: Substitution[] = Array.from({ length: 15 }, (_, i) => createSubstitution(i))

// ==================== STATS ====================

export function getTimetableStats(): TimetableStats {
  const publishedCount = timetables.filter(t => t.status === 'published').length
  const draftCount = timetables.filter(t => t.status === 'draft').length
  const pendingSubs = substitutions.filter(s => s.status === 'pending').length

  // Calculate avg periods per teacher
  const teacherPeriods = new Map<string, number>()
  timetables.forEach(tt => {
    tt.entries.forEach(entry => {
      teacherPeriods.set(entry.teacherId, (teacherPeriods.get(entry.teacherId) || 0) + 1)
    })
  })
  const avgPeriods = teacherPeriods.size > 0
    ? Math.round([...teacherPeriods.values()].reduce((a, b) => a + b, 0) / teacherPeriods.size)
    : 0

  return {
    totalClasses: CLASSES.reduce((sum, c) => sum + c.sections.length, 0),
    publishedTimetables: publishedCount,
    draftTimetables: draftCount,
    totalTeachers: TEACHERS.length,
    avgPeriodsPerTeacher: avgPeriods,
    pendingSubstitutions: pendingSubs,
    roomUtilization: 78.5,
  }
}
