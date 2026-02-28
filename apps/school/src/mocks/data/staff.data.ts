import { faker } from '@faker-js/faker'

export interface Staff {
  id: string
  employeeId: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female'
  department: string
  designation: string
  joiningDate: string
  photoUrl: string
  qualification: string[]
  specialization: string
  salary: number
  address: {
    street: string
    city: string
    state: string
    pincode: string
  }
  status: 'active' | 'on_leave' | 'resigned'
}

const DEPARTMENTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer Science', 'Physical Education', 'Art', 'Music', 'Administration']
const DESIGNATIONS = ['Principal', 'Vice Principal', 'Senior Teacher', 'Teacher', 'Assistant Teacher', 'Lab Assistant', 'Librarian', 'Accountant', 'Clerk', 'Peon']
const QUALIFICATIONS = ['B.Ed', 'M.Ed', 'B.A.', 'M.A.', 'B.Sc.', 'M.Sc.', 'B.Com', 'M.Com', 'Ph.D.', 'MBA']
const INDIAN_STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Telangana']

function createStaff(): Staff {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const joiningYear = faker.date.past({ years: 10 }).getFullYear()
  const gender = faker.helpers.arrayElement(['male', 'female']) as 'male' | 'female'
  const department = faker.helpers.arrayElement(DEPARTMENTS)

  return {
    id: faker.string.uuid(),
    employeeId: `EMP${joiningYear}${faker.string.numeric(4)}`,
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: `+91 ${faker.string.numeric(10)}`,
    dateOfBirth: faker.date.birthdate({ min: 25, max: 60, mode: 'age' }).toISOString(),
    gender,
    department,
    designation: faker.helpers.arrayElement(DESIGNATIONS),
    joiningDate: faker.date.past({ years: 10 }).toISOString(),
    photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}&backgroundColor=b6e3f4`,
    qualification: faker.helpers.arrayElements(QUALIFICATIONS, { min: 1, max: 3 }),
    specialization: department,
    salary: faker.number.int({ min: 25000, max: 100000 }),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.helpers.arrayElement(INDIAN_STATES),
      pincode: faker.string.numeric(6),
    },
    status: faker.helpers.weightedArrayElement([
      { value: 'active', weight: 90 },
      { value: 'on_leave', weight: 7 },
      { value: 'resigned', weight: 3 },
    ]) as Staff['status'],
  }
}

// Generate 35 staff members
export const staff: Staff[] = Array.from({ length: 35 }, createStaff)

// ==================== TIMETABLE DATA ====================

const CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const SECTIONS = ['A', 'B', 'C']
const DAYS: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer Science', 'Physical Education', 'Art', 'Music']
const ROOMS = ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203', 'Room 301', 'Room 302', 'Lab 1', 'Lab 2', 'Computer Lab', 'Art Room', 'Music Room', 'Sports Ground']

export interface TimetableEntry {
  id: string
  staffId: string
  staffName: string
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  periodNumber: number
  subject: string
  class: string
  section: string
  room?: string
}

// Generate timetable entries for teaching staff
const teachingStaff = staff.filter((s) =>
  s.status === 'active' && ['Teacher', 'Senior Teacher', 'Assistant Teacher'].includes(s.designation)
)

export const timetableEntries: TimetableEntry[] = []

teachingStaff.forEach((teacher) => {
  const subjectForTeacher = SUBJECTS.includes(teacher.department) ? teacher.department : faker.helpers.arrayElement(SUBJECTS)
  const assignedClasses = faker.helpers.arrayElements(CLASSES, { min: 2, max: 4 })
  const assignedSections = faker.helpers.arrayElements(SECTIONS, { min: 1, max: 2 })

  // Each teacher gets 4-6 periods per day across their classes
  DAYS.forEach((day) => {
    const periodsToday = faker.number.int({ min: 3, max: 6 })
    const periodNumbers = faker.helpers.arrayElements([1, 2, 3, 4, 5, 6, 7, 8], { min: periodsToday, max: periodsToday })

    periodNumbers.forEach((period) => {
      timetableEntries.push({
        id: faker.string.uuid(),
        staffId: teacher.id,
        staffName: teacher.name,
        day,
        periodNumber: period,
        subject: subjectForTeacher,
        class: faker.helpers.arrayElement(assignedClasses),
        section: faker.helpers.arrayElement(assignedSections),
        room: faker.helpers.arrayElement(ROOMS),
      })
    })
  })
})

// ==================== SUBSTITUTION DATA ====================

export interface SubstitutionRecord {
  id: string
  date: string
  absentStaffId: string
  absentStaffName: string
  substituteStaffId: string
  substituteStaffName: string
  periodNumber: number
  class: string
  section: string
  subject: string
  status: 'pending' | 'assigned' | 'completed' | 'cancelled'
  reason?: string
  createdAt: string
}

const activeTeachers = teachingStaff.filter((s) => s.status === 'active')
export const substitutions: SubstitutionRecord[] = Array.from({ length: 15 }, () => {
  const absentTeacher = faker.helpers.arrayElement(activeTeachers)
  const substituteTeacher = faker.helpers.arrayElement(activeTeachers.filter((t) => t.id !== absentTeacher.id))
  const date = faker.date.recent({ days: 30 })

  return {
    id: faker.string.uuid(),
    date: date.toISOString().split('T')[0],
    absentStaffId: absentTeacher.id,
    absentStaffName: absentTeacher.name,
    substituteStaffId: substituteTeacher.id,
    substituteStaffName: substituteTeacher.name,
    periodNumber: faker.number.int({ min: 1, max: 8 }),
    class: faker.helpers.arrayElement(CLASSES),
    section: faker.helpers.arrayElement(SECTIONS),
    subject: SUBJECTS.includes(absentTeacher.department) ? absentTeacher.department : faker.helpers.arrayElement(SUBJECTS),
    status: faker.helpers.weightedArrayElement([
      { value: 'completed' as const, weight: 50 },
      { value: 'assigned' as const, weight: 25 },
      { value: 'pending' as const, weight: 15 },
      { value: 'cancelled' as const, weight: 10 },
    ]),
    reason: faker.helpers.arrayElement(['Sick Leave', 'Personal Work', 'Training', 'Medical Emergency', 'Family Event']),
    createdAt: date.toISOString(),
  }
})

// ==================== PERFORMANCE REVIEW DATA ====================

export interface PerformanceReviewRecord {
  id: string
  staffId: string
  staffName: string
  reviewerId: string
  reviewerName: string
  period: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'annual'
  year: number
  ratings: { category: string; rating: number; comment?: string }[]
  overallRating: number
  strengths: string
  areasOfImprovement: string
  goals: string
  status: 'draft' | 'submitted' | 'acknowledged'
  createdAt: string
  submittedAt?: string
  acknowledgedAt?: string
}

const PERFORMANCE_CATEGORIES = [
  'Teaching Quality',
  'Student Engagement',
  'Curriculum Knowledge',
  'Classroom Management',
  'Communication',
  'Punctuality',
  'Professional Development',
  'Team Collaboration',
]

const STRENGTH_OPTIONS = [
  'Excellent classroom management and student engagement',
  'Strong subject knowledge and teaching methodology',
  'Outstanding rapport with students and parents',
  'Innovative use of technology in teaching',
  'Consistent punctuality and dedication',
  'Effective communicator with clear lesson planning',
]

const IMPROVEMENT_OPTIONS = [
  'Could incorporate more interactive teaching methods',
  'Needs to improve documentation and record keeping',
  'Should attend more professional development workshops',
  'Time management during class transitions can be improved',
  'Could provide more individual attention to struggling students',
]

const GOAL_OPTIONS = [
  'Complete advanced teaching certification by Q4',
  'Implement project-based learning in at least 2 units',
  'Achieve 95% attendance rate for the academic year',
  'Mentor 2 junior teachers this year',
  'Develop supplementary study material for the department',
]

const principalStaff = staff.find((s) => s.designation === 'Principal') || staff[0]

export const performanceReviews: PerformanceReviewRecord[] = []

teachingStaff.slice(0, 20).forEach((teacher) => {
  const periods: ('Q1' | 'Q2' | 'Q3' | 'Q4' | 'annual')[] = faker.helpers.arrayElements(['Q1', 'Q2', 'Q3', 'Q4', 'annual'] as const, { min: 1, max: 3 })

  periods.forEach((period) => {
    const ratings = PERFORMANCE_CATEGORIES.map((category) => ({
      category,
      rating: faker.number.int({ min: 2, max: 5 }),
      comment: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    }))

    const overallRating = Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1))
    const createdDate = faker.date.past({ years: 1 })

    performanceReviews.push({
      id: faker.string.uuid(),
      staffId: teacher.id,
      staffName: teacher.name,
      reviewerId: principalStaff.id,
      reviewerName: principalStaff.name,
      period,
      year: 2025,
      ratings,
      overallRating,
      strengths: faker.helpers.arrayElement(STRENGTH_OPTIONS),
      areasOfImprovement: faker.helpers.arrayElement(IMPROVEMENT_OPTIONS),
      goals: faker.helpers.arrayElement(GOAL_OPTIONS),
      status: faker.helpers.weightedArrayElement([
        { value: 'acknowledged' as const, weight: 50 },
        { value: 'submitted' as const, weight: 30 },
        { value: 'draft' as const, weight: 20 },
      ]),
      createdAt: createdDate.toISOString(),
      submittedAt: faker.datatype.boolean() ? faker.date.recent({ days: 60 }).toISOString() : undefined,
      acknowledgedAt: faker.datatype.boolean() ? faker.date.recent({ days: 30 }).toISOString() : undefined,
    })
  })
})

// ==================== PROFESSIONAL DEVELOPMENT DATA ====================

export interface PDRecord {
  id: string
  staffId: string
  type: 'certification' | 'workshop' | 'seminar' | 'training' | 'conference' | 'course'
  title: string
  provider: string
  startDate: string
  endDate?: string
  status: 'upcoming' | 'in_progress' | 'completed' | 'expired'
  certificateUrl?: string
  description?: string
  hours?: number
  cost?: number
  expiryDate?: string
  createdAt: string
}

const PD_TITLES: Record<string, string[]> = {
  certification: [
    'Google Certified Educator Level 1',
    'Microsoft Innovative Educator',
    'CBSE Teaching Certificate',
    'Cambridge International Teaching',
    'National Board Certification',
  ],
  workshop: [
    'STEM Teaching Methodologies',
    'Inclusive Education Practices',
    'Digital Classroom Tools',
    'Assessment & Evaluation Techniques',
    'Project-Based Learning Workshop',
  ],
  seminar: [
    'National Education Policy 2020 Implementation',
    'Child Psychology in Education',
    'CBSE Curriculum Updates Seminar',
    'Education Technology Trends',
  ],
  training: [
    'First Aid & CPR Training',
    'Fire Safety Training',
    'Classroom Technology Training',
    'Special Education Needs Training',
  ],
  conference: [
    'National Teachers Conference 2025',
    'EdTech Asia Conference',
    'CBSE Annual Conference',
    'Science Education Summit',
  ],
  course: [
    'Advanced Pedagogy - Coursera',
    'Data-Driven Teaching - edX',
    'Educational Leadership - NPTEL',
    'Classroom Management Mastery',
  ],
}

const PD_PROVIDERS = [
  'CBSE',
  'NCERT',
  'Google for Education',
  'Microsoft Education',
  'Coursera',
  'edX',
  'NPTEL',
  'Cambridge Assessment',
  'State Education Board',
  'National Institute of Education',
]

export const professionalDevelopments: PDRecord[] = []

teachingStaff.slice(0, 25).forEach((teacher) => {
  const numRecords = faker.number.int({ min: 1, max: 4 })

  for (let i = 0; i < numRecords; i++) {
    const type = faker.helpers.arrayElement(['certification', 'workshop', 'seminar', 'training', 'conference', 'course'] as const)
    const titles = PD_TITLES[type]
    const startDate = faker.date.past({ years: 2 })

    professionalDevelopments.push({
      id: faker.string.uuid(),
      staffId: teacher.id,
      type,
      title: faker.helpers.arrayElement(titles),
      provider: faker.helpers.arrayElement(PD_PROVIDERS),
      startDate: startDate.toISOString().split('T')[0],
      endDate: type !== 'seminar' ? faker.date.between({ from: startDate, to: new Date() }).toISOString().split('T')[0] : undefined,
      status: faker.helpers.weightedArrayElement([
        { value: 'completed' as const, weight: 50 },
        { value: 'in_progress' as const, weight: 20 },
        { value: 'upcoming' as const, weight: 15 },
        { value: 'expired' as const, weight: 15 },
      ]),
      description: faker.lorem.sentence(),
      hours: faker.number.int({ min: 2, max: 80 }),
      cost: faker.helpers.arrayElement([0, 500, 1000, 2500, 5000, 10000]),
      expiryDate: type === 'certification' ? faker.date.future({ years: 3 }).toISOString().split('T')[0] : undefined,
      createdAt: startDate.toISOString(),
    })
  }
})

// Helper to get stats
export const staffStats = {
  total: staff.length,
  active: staff.filter((s) => s.status === 'active').length,
  byDepartment: DEPARTMENTS.reduce((acc, dept) => {
    acc[dept] = staff.filter((s) => s.department === dept).length
    return acc
  }, {} as Record<string, number>),
  byGender: {
    male: staff.filter((s) => s.gender === 'male').length,
    female: staff.filter((s) => s.gender === 'female').length,
  },
}

// Demo teacher for login page (first active teacher)
export const demoTeacher = staff.find(s => s.designation === 'Teacher' && s.status === 'active') || staff.find(s => s.status === 'active')!
