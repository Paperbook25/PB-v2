import { faker } from '@faker-js/faker'
import type {
  TimelineEvent,
  TimelineEventType,
  StudentDocument,
  DocumentType,
  StudentHealthRecord,
} from '@/features/students/types/student.types'

export interface Student {
  id: string
  admissionNumber: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  bloodGroup: string
  class: string
  section: string
  rollNumber: number
  admissionDate: string
  photoUrl: string
  address: {
    street: string
    city: string
    state: string
    pincode: string
  }
  parent: {
    fatherName: string
    motherName: string
    guardianPhone: string
    guardianEmail: string
    occupation: string
  }
  status: 'active' | 'inactive' | 'graduated' | 'transferred'
  siblingIds?: string[]
  healthRecord?: StudentHealthRecord
}

const CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const SECTIONS = ['A', 'B', 'C', 'D']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const INDIAN_STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Telangana']

function createStudent(forceStatus?: Student['status'], forceClass?: string): Student {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const admissionYear = faker.date.past({ years: 5 }).getFullYear()
  const gender = faker.helpers.arrayElement(['male', 'female']) as 'male' | 'female'

  return {
    id: faker.string.uuid(),
    admissionNumber: `ADM${admissionYear}${faker.string.numeric(4)}`,
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: `+91 ${faker.string.numeric(10)}`,
    dateOfBirth: faker.date.birthdate({ min: 5, max: 18, mode: 'age' }).toISOString(),
    gender,
    bloodGroup: faker.helpers.arrayElement(BLOOD_GROUPS),
    class: forceClass || faker.helpers.arrayElement(CLASSES),
    section: faker.helpers.arrayElement(SECTIONS),
    rollNumber: faker.number.int({ min: 1, max: 50 }),
    admissionDate: faker.date.past({ years: 3 }).toISOString(),
    photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.helpers.arrayElement(INDIAN_STATES),
      pincode: faker.string.numeric(6),
    },
    parent: {
      fatherName: faker.person.fullName({ sex: 'male' }),
      motherName: faker.person.fullName({ sex: 'female' }),
      guardianPhone: `+91 ${faker.string.numeric(10)}`,
      guardianEmail: faker.internet.email(),
      occupation: faker.person.jobTitle(),
    },
    status: forceStatus || faker.helpers.weightedArrayElement([
      { value: 'active', weight: 85 },
      { value: 'inactive', weight: 5 },
      { value: 'graduated', weight: 8 },
      { value: 'transferred', weight: 2 },
    ]) as Student['status'],
  }
}

// Generate 150 students with guaranteed mix of statuses
// First, create 25 graduated students (for alumni linking)
const graduatedStudents = Array.from({ length: 25 }, () => createStudent('graduated', 'Class 12'))

// Then create 120 active students across all classes
const activeStudents = Array.from({ length: 120 }, () => createStudent('active'))

// Finally create 5 students with other statuses
const otherStudents = Array.from({ length: 5 }, () =>
  createStudent(faker.helpers.arrayElement(['inactive', 'transferred']))
)

export const students: Student[] = [...graduatedStudents, ...activeStudents, ...otherStudents]

// Helper to get active students for hostel allocation
export const getActiveStudents = () => students.filter(s => s.status === 'active')

// Helper to get graduated students for alumni linking
export const getGraduatedStudents = () => students.filter(s => s.status === 'graduated')

// ==================== SIBLING LINKING ====================

// Link some students as siblings (share same last name and parent)
const siblingPairs: [number, number][] = []
for (let i = 0; i < 15; i++) {
  const a = i * 2
  const b = i * 2 + 1
  if (a < students.length && b < students.length) {
    const lastName = students[a].name.split(' ')[1]
    students[b] = {
      ...students[b],
      name: `${students[b].name.split(' ')[0]} ${lastName}`,
      parent: { ...students[a].parent },
    }
    students[a].siblingIds = [students[b].id]
    students[b].siblingIds = [students[a].id]
    siblingPairs.push([a, b])
  }
}

// ==================== HEALTH RECORDS ====================

const ALLERGIES = ['Peanuts', 'Dust', 'Pollen', 'Milk', 'Eggs', 'Shellfish', 'Penicillin', 'Latex']
const CONDITIONS = ['Asthma', 'Diabetes Type 1', 'Epilepsy', 'ADHD', 'Scoliosis', 'Eczema']
const MEDICATIONS = ['Inhaler (Salbutamol)', 'EpiPen', 'Insulin', 'Ritalin', 'Cetirizine']
const RELATIONSHIPS = ['Father', 'Mother', 'Uncle', 'Aunt', 'Grandparent', 'Guardian']

// Assign health records to ~40% of students
students.forEach((student) => {
  if (faker.datatype.boolean(0.4)) {
    student.healthRecord = {
      allergies: faker.helpers.arrayElements(ALLERGIES, { min: 0, max: 3 }),
      medicalConditions: faker.helpers.arrayElements(CONDITIONS, { min: 0, max: 2 }),
      medications: faker.helpers.arrayElements(MEDICATIONS, { min: 0, max: 2 }),
      emergencyContact: {
        name: student.parent.fatherName,
        phone: student.parent.guardianPhone,
        relationship: faker.helpers.arrayElement(RELATIONSHIPS),
      },
      bloodGroup: student.bloodGroup,
      height: `${faker.number.int({ min: 100, max: 180 })} cm`,
      weight: `${faker.number.int({ min: 20, max: 80 })} kg`,
      visionLeft: faker.helpers.arrayElement(['6/6', '6/9', '6/12', '6/18']),
      visionRight: faker.helpers.arrayElement(['6/6', '6/9', '6/12', '6/18']),
      lastCheckupDate: faker.date.recent({ days: 180 }).toISOString(),
      notes: faker.datatype.boolean(0.3) ? 'Regular checkup required every 6 months' : undefined,
    }
  }
})

// ==================== STUDENT DOCUMENTS ====================

const DOC_TYPES: DocumentType[] = ['birth_certificate', 'aadhar_card', 'transfer_certificate', 'photo', 'address_proof', 'marksheet']
const MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

function generateStudentDocuments(studentId: string): StudentDocument[] {
  const numDocs = faker.number.int({ min: 2, max: 6 })
  const selectedTypes = faker.helpers.arrayElements(DOC_TYPES, numDocs)
  return selectedTypes.map((type) => ({
    id: faker.string.uuid(),
    studentId,
    type,
    name: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    fileName: `${type}_${studentId.slice(0, 8)}.${faker.helpers.arrayElement(['pdf', 'jpg', 'png'])}`,
    fileSize: faker.number.int({ min: 50000, max: 5000000 }),
    mimeType: faker.helpers.arrayElement(MIME_TYPES),
    url: `/uploads/documents/${studentId}/${type}.pdf`,
    uploadedAt: faker.date.recent({ days: 90 }).toISOString(),
    uploadedBy: 'Admin User',
    verified: faker.datatype.boolean(0.7),
    verifiedAt: faker.datatype.boolean(0.7) ? faker.date.recent({ days: 60 }).toISOString() : undefined,
    verifiedBy: faker.datatype.boolean(0.7) ? 'Principal' : undefined,
  }))
}

// Store documents for all students
export const studentDocuments: StudentDocument[] = students.flatMap((s) =>
  generateStudentDocuments(s.id)
)

// ==================== TIMELINE EVENTS ====================

const TIMELINE_EVENT_TEMPLATES: { type: TimelineEventType; titles: string[]; descriptions: string[] }[] = [
  { type: 'fee_paid', titles: ['Fee Payment Received'], descriptions: ['Tuition fee paid via UPI', 'Annual fee paid via bank transfer', 'Exam fee collected in cash'] },
  { type: 'attendance_marked', titles: ['Attendance Marked'], descriptions: ['Present for the day', 'Marked absent', 'Late arrival - reached at 9:15 AM'] },
  { type: 'book_issued', titles: ['Library Book Issued'], descriptions: ['Issued "Introduction to Physics"', 'Issued "Mathematics - Class 10"', 'Issued "English Literature"'] },
  { type: 'book_returned', titles: ['Library Book Returned'], descriptions: ['Returned "Introduction to Physics"', 'Returned "History of India"'] },
  { type: 'marks_entered', titles: ['Exam Marks Entered'], descriptions: ['Unit Test 1 marks: 85/100 in Math', 'Half Yearly marks entered', 'Class Test marks: 42/50 in Science'] },
  { type: 'leave_applied', titles: ['Leave Application'], descriptions: ['Sick leave applied for 2 days', 'Family emergency leave for 3 days', 'Medical leave for 1 day'] },
  { type: 'document_uploaded', titles: ['Document Uploaded'], descriptions: ['Birth certificate uploaded', 'Aadhar card uploaded', 'Transfer certificate uploaded'] },
  { type: 'profile_updated', titles: ['Profile Updated'], descriptions: ['Contact number updated', 'Address updated', 'Emergency contact updated'] },
  { type: 'admission', titles: ['Admission Completed'], descriptions: ['Student admitted to the school'] },
]

function generateTimeline(studentId: string): TimelineEvent[] {
  const events: TimelineEvent[] = []
  const numEvents = faker.number.int({ min: 8, max: 20 })

  for (let i = 0; i < numEvents; i++) {
    const template = faker.helpers.arrayElement(TIMELINE_EVENT_TEMPLATES)
    events.push({
      id: faker.string.uuid(),
      type: template.type,
      title: faker.helpers.arrayElement(template.titles),
      description: faker.helpers.arrayElement(template.descriptions),
      timestamp: faker.date.recent({ days: 90 }).toISOString(),
    })
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Cache timelines
const timelineCache = new Map<string, TimelineEvent[]>()

export function getStudentTimeline(studentId: string): TimelineEvent[] {
  if (!timelineCache.has(studentId)) {
    timelineCache.set(studentId, generateTimeline(studentId))
  }
  return timelineCache.get(studentId)!
}

// ==================== PROMOTION HELPERS ====================

export function getNextClass(currentClass: string): string | null {
  const index = CLASSES.indexOf(currentClass)
  if (index === -1 || index >= CLASSES.length - 1) return null
  return CLASSES[index + 1]
}

export { CLASSES, SECTIONS }

// ==================== STATS ====================

export const studentStats = {
  total: students.length,
  active: students.filter((s) => s.status === 'active').length,
  byClass: CLASSES.reduce((acc, cls) => {
    acc[cls] = students.filter((s) => s.class === cls).length
    return acc
  }, {} as Record<string, number>),
  byGender: {
    male: students.filter((s) => s.gender === 'male').length,
    female: students.filter((s) => s.gender === 'female').length,
  },
}

// Demo student for login page (first active student)
export const demoStudent = students.find(s => s.status === 'active')!

// ==================== PORTFOLIO & SKILLS ====================

import type {
  StudentSkill,
  PortfolioItem,
  StudentPortfolio,
  LearningStyleAssessment,
  LearningPreferences,
  LearningStyleType,
  IntelligenceType,
  RiskIndicator,
  RiskLevel,
  RiskCategory,
  StudentRiskProfile,
  StudentGraduationProgress,
  PromotionHistory,
  StudentTeacherRelationship,
  RelationshipType,
  TeacherFeedback,
  MentorshipRecord,
} from '@/features/students/types/student.types'

const SKILL_CATEGORIES = ['academic', 'sports', 'arts', 'leadership', 'technical', 'communication'] as const
const SKILL_NAMES: Record<typeof SKILL_CATEGORIES[number], string[]> = {
  academic: ['Mathematics', 'Science', 'English Literature', 'History', 'Geography', 'Computer Science'],
  sports: ['Cricket', 'Football', 'Basketball', 'Swimming', 'Athletics', 'Badminton', 'Chess'],
  arts: ['Painting', 'Music - Vocals', 'Classical Dance', 'Drama', 'Photography', 'Creative Writing'],
  leadership: ['Public Speaking', 'Team Management', 'Event Organization', 'Debate', 'Student Council'],
  technical: ['Programming', 'Web Development', 'Robotics', 'Video Editing', '3D Modeling'],
  communication: ['Presentation Skills', 'Writing', 'Active Listening', 'Negotiation'],
}

const PORTFOLIO_TYPES = ['project', 'achievement', 'certificate', 'competition'] as const

function generateStudentSkills(studentId: string): StudentSkill[] {
  const numSkills = faker.number.int({ min: 2, max: 6 })
  const skills: StudentSkill[] = []
  const usedCategories = new Set<string>()

  for (let i = 0; i < numSkills; i++) {
    const category = faker.helpers.arrayElement(SKILL_CATEGORIES)
    if (usedCategories.has(category)) continue
    usedCategories.add(category)

    skills.push({
      id: faker.string.uuid(),
      studentId,
      name: faker.helpers.arrayElement(SKILL_NAMES[category]),
      category,
      proficiencyLevel: faker.helpers.arrayElement([1, 2, 3, 4, 5]) as 1 | 2 | 3 | 4 | 5,
      certifications: faker.datatype.boolean(0.3) ? [faker.company.name() + ' Certificate'] : undefined,
      endorsedBy: faker.datatype.boolean(0.4) ? [faker.person.fullName()] : undefined,
      acquiredDate: faker.date.past({ years: 2 }).toISOString(),
      notes: faker.datatype.boolean(0.2) ? faker.lorem.sentence() : undefined,
    })
  }
  return skills
}

function generatePortfolioItems(studentId: string): PortfolioItem[] {
  const numItems = faker.number.int({ min: 1, max: 5 })
  return Array.from({ length: numItems }, () => ({
    id: faker.string.uuid(),
    studentId,
    title: faker.helpers.arrayElement([
      'Science Fair Project - Solar Energy',
      'Art Competition Winner',
      'Math Olympiad Participation',
      'School Annual Day Performance',
      'Sports Day Achievement',
      'Essay Writing Competition',
      'Coding Hackathon Project',
    ]),
    type: faker.helpers.arrayElement(PORTFOLIO_TYPES),
    description: faker.lorem.paragraph(),
    date: faker.date.past({ years: 2 }).toISOString(),
    attachments: faker.datatype.boolean(0.5)
      ? [{ name: 'certificate.pdf', url: '/uploads/certificates/cert.pdf', type: 'application/pdf' }]
      : [],
    tags: faker.helpers.arrayElements(['award', 'competition', 'project', 'achievement', 'certificate'], { min: 1, max: 3 }),
    visibility: faker.helpers.arrayElement(['public', 'school', 'private']),
    featured: faker.datatype.boolean(0.2),
  }))
}

// Cache portfolios
const portfolioCache = new Map<string, StudentPortfolio>()

export function getStudentPortfolio(studentId: string): StudentPortfolio {
  if (!portfolioCache.has(studentId)) {
    portfolioCache.set(studentId, {
      studentId,
      bio: faker.datatype.boolean(0.6) ? faker.lorem.paragraph() : undefined,
      interests: faker.helpers.arrayElements(
        ['Science', 'Mathematics', 'Arts', 'Sports', 'Music', 'Technology', 'Literature', 'History'],
        { min: 2, max: 5 }
      ),
      careerGoals: faker.datatype.boolean(0.5) ? faker.helpers.arrayElement([
        'Become an engineer',
        'Pursue medicine',
        'Become a scientist',
        'Work in technology',
        'Become an artist',
      ]) : undefined,
      skills: generateStudentSkills(studentId),
      items: generatePortfolioItems(studentId),
      lastUpdated: faker.date.recent({ days: 30 }).toISOString(),
    })
  }
  return portfolioCache.get(studentId)!
}

// ==================== LEARNING STYLE ASSESSMENTS ====================

const LEARNING_STYLES: LearningStyleType[] = ['visual', 'auditory', 'reading_writing', 'kinesthetic']
const INTELLIGENCE_TYPES: IntelligenceType[] = ['linguistic', 'logical', 'spatial', 'musical', 'bodily', 'interpersonal', 'intrapersonal', 'naturalist']

function generateLearningStyleAssessment(studentId: string): LearningStyleAssessment {
  const styleScores: Record<LearningStyleType, number> = {
    visual: faker.number.int({ min: 20, max: 100 }),
    auditory: faker.number.int({ min: 20, max: 100 }),
    reading_writing: faker.number.int({ min: 20, max: 100 }),
    kinesthetic: faker.number.int({ min: 20, max: 100 }),
  }

  const sortedStyles = Object.entries(styleScores).sort((a, b) => b[1] - a[1])
  const primaryStyle = sortedStyles[0][0] as LearningStyleType
  const secondaryStyle = sortedStyles[1][0] as LearningStyleType

  const multipleIntelligences: Record<IntelligenceType, number> = {} as Record<IntelligenceType, number>
  INTELLIGENCE_TYPES.forEach(type => {
    multipleIntelligences[type] = faker.number.int({ min: 20, max: 100 })
  })

  return {
    id: faker.string.uuid(),
    studentId,
    assessmentDate: faker.date.recent({ days: 180 }).toISOString(),
    assessedBy: faker.person.fullName(),
    primaryStyle,
    secondaryStyle,
    styleScores,
    multipleIntelligences,
    recommendations: [
      `Focus on ${primaryStyle} learning materials`,
      `Use ${secondaryStyle} techniques as supplementary`,
      'Regular breaks recommended during study sessions',
    ],
    accommodations: faker.datatype.boolean(0.3) ? ['Extended time for tests', 'Preferential seating'] : undefined,
    notes: faker.datatype.boolean(0.2) ? faker.lorem.sentence() : undefined,
  }
}

const learningStyleCache = new Map<string, LearningStyleAssessment[]>()

export function getLearningStyleAssessments(studentId: string): LearningStyleAssessment[] {
  if (!learningStyleCache.has(studentId)) {
    const numAssessments = faker.number.int({ min: 1, max: 3 })
    learningStyleCache.set(studentId, Array.from({ length: numAssessments }, () =>
      generateLearningStyleAssessment(studentId)
    ))
  }
  return learningStyleCache.get(studentId)!
}

const learningPreferencesCache = new Map<string, LearningPreferences>()

export function getLearningPreferences(studentId: string): LearningPreferences {
  if (!learningPreferencesCache.has(studentId)) {
    learningPreferencesCache.set(studentId, {
      studentId,
      preferredStudyTime: faker.helpers.arrayElement(['morning', 'afternoon', 'evening', 'night']),
      preferredGroupSize: faker.helpers.arrayElement(['individual', 'pair', 'small_group', 'large_group']),
      attentionSpan: faker.helpers.arrayElement(['short', 'medium', 'long']),
      motivators: faker.helpers.arrayElements(['grades', 'praise', 'competition', 'curiosity', 'rewards'], { min: 1, max: 3 }),
      challenges: faker.helpers.arrayElements(['focus', 'time_management', 'organization', 'test_anxiety'], { min: 0, max: 2 }),
      accommodationsNeeded: [],
    })
  }
  return learningPreferencesCache.get(studentId)!
}

// ==================== RISK INDICATORS ====================

const RISK_LEVELS: RiskLevel[] = ['low', 'moderate', 'high', 'critical']
const RISK_CATEGORIES: RiskCategory[] = ['academic', 'attendance', 'behavioral', 'social', 'health', 'financial']

function generateRiskIndicators(studentId: string): RiskIndicator[] {
  if (faker.datatype.boolean(0.7)) return [] // 70% of students have no risks

  const numRisks = faker.number.int({ min: 1, max: 3 })
  return Array.from({ length: numRisks }, () => {
    const category = faker.helpers.arrayElement(RISK_CATEGORIES)
    const indicators: Record<RiskCategory, string[]> = {
      academic: ['Failing grades in multiple subjects', 'Significant grade drop', 'Incomplete assignments'],
      attendance: ['High absence rate', 'Frequent tardiness', 'Unexplained absences'],
      behavioral: ['Discipline incidents', 'Peer conflicts', 'Classroom disruptions'],
      social: ['Social isolation', 'Bullying victim', 'Difficulty making friends'],
      health: ['Frequent illness', 'Mental health concerns', 'Medical condition affecting learning'],
      financial: ['Fee payment delays', 'Unable to afford supplies', 'Transportation issues'],
    }

    return {
      id: faker.string.uuid(),
      studentId,
      category,
      level: faker.helpers.weightedArrayElement([
        { value: 'low' as RiskLevel, weight: 40 },
        { value: 'moderate' as RiskLevel, weight: 35 },
        { value: 'high' as RiskLevel, weight: 20 },
        { value: 'critical' as RiskLevel, weight: 5 },
      ]),
      indicator: faker.helpers.arrayElement(indicators[category]),
      description: faker.lorem.sentence(),
      detectedDate: faker.date.recent({ days: 60 }).toISOString(),
      dataPoints: [
        { metric: 'Attendance %', value: faker.number.int({ min: 50, max: 95 }), threshold: 75 },
        { metric: 'Assignment Completion', value: faker.number.int({ min: 40, max: 100 }), threshold: 80 },
      ],
      trend: faker.helpers.arrayElement(['improving', 'stable', 'declining']),
      interventions: faker.datatype.boolean(0.5) ? [{
        id: faker.string.uuid(),
        riskId: '',
        type: faker.helpers.arrayElement(['counseling', 'tutoring', 'parent_meeting', 'mentoring']),
        description: faker.lorem.sentence(),
        assignedTo: faker.person.fullName(),
        startDate: faker.date.recent({ days: 30 }).toISOString(),
        status: faker.helpers.arrayElement(['planned', 'in_progress', 'completed']),
      }] : [],
      status: faker.helpers.arrayElement(['active', 'monitoring', 'resolved']),
    }
  })
}

const riskProfileCache = new Map<string, StudentRiskProfile>()

export function getStudentRiskProfile(studentId: string): StudentRiskProfile {
  if (!riskProfileCache.has(studentId)) {
    const indicators = generateRiskIndicators(studentId)
    const maxLevel = indicators.reduce((max, ind) => {
      const levels: RiskLevel[] = ['low', 'moderate', 'high', 'critical']
      return levels.indexOf(ind.level) > levels.indexOf(max) ? ind.level : max
    }, 'low' as RiskLevel)

    riskProfileCache.set(studentId, {
      studentId,
      overallRiskLevel: indicators.length > 0 ? maxLevel : 'low',
      riskScore: indicators.length > 0 ? faker.number.int({ min: 10, max: 90 }) : 0,
      indicators,
      watchList: indicators.some(i => i.level === 'high' || i.level === 'critical'),
      lastAssessment: faker.date.recent({ days: 30 }).toISOString(),
      nextReview: faker.date.future({ years: 0.25 }).toISOString(),
    })
  }
  return riskProfileCache.get(studentId)!
}

// Get all at-risk students
export function getAtRiskStudents(filters?: { level?: string; category?: string }) {
  return students
    .map(s => ({ studentId: s.id, studentName: s.name, riskProfile: getStudentRiskProfile(s.id) }))
    .filter(s => {
      if (s.riskProfile.indicators.length === 0) return false
      if (filters?.level && s.riskProfile.overallRiskLevel !== filters.level) return false
      if (filters?.category && !s.riskProfile.indicators.some(i => i.category === filters.category)) return false
      return true
    })
}

// ==================== GRADUATION & PROMOTION ====================

const graduationProgressCache = new Map<string, StudentGraduationProgress>()

export function getGraduationProgress(studentId: string): StudentGraduationProgress {
  if (!graduationProgressCache.has(studentId)) {
    const student = students.find(s => s.id === studentId)
    const classNum = parseInt(student?.class.replace('Class ', '') || '10')
    const requiredCredits = 100
    const currentCredits = Math.min(requiredCredits, Math.floor((classNum / 12) * requiredCredits) + faker.number.int({ min: -10, max: 10 }))

    graduationProgressCache.set(studentId, {
      studentId,
      expectedGraduationYear: `${2025 + (12 - classNum)}`,
      currentCredits,
      requiredCredits,
      gpa: parseFloat((faker.number.float({ min: 2.5, max: 4.0 })).toFixed(2)),
      requirements: [
        { requirementId: '1', name: 'Core Subjects', status: 'completed', credits: 40 },
        { requirementId: '2', name: 'Electives', status: classNum >= 9 ? 'in_progress' : 'not_started', credits: 20 },
        { requirementId: '3', name: 'Physical Education', status: 'completed', credits: 10 },
        { requirementId: '4', name: 'Community Service', status: faker.helpers.arrayElement(['completed', 'in_progress', 'not_started']), credits: 5 },
      ],
      certifications: faker.datatype.boolean(0.4) ? [
        { name: 'Computer Basics', date: faker.date.past({ years: 1 }).toISOString(), issuer: 'School IT Dept' }
      ] : [],
      extracurriculars: faker.datatype.boolean(0.6) ? [
        { activity: faker.helpers.arrayElement(['Chess Club', 'Drama Club', 'Science Club']), role: 'Member', years: '2023-24' }
      ] : [],
      communityService: faker.datatype.boolean(0.5) ? [
        { hours: faker.number.int({ min: 5, max: 50 }), organization: 'Local NGO', description: 'Teaching underprivileged children' }
      ] : [],
      onTrack: currentCredits >= (classNum / 12) * requiredCredits * 0.9,
      projectedGraduationDate: `${2025 + (12 - classNum)}-03-31`,
    })
  }
  return graduationProgressCache.get(studentId)!
}

const promotionHistoryCache = new Map<string, PromotionHistory[]>()

export function getPromotionHistory(studentId: string): PromotionHistory[] {
  if (!promotionHistoryCache.has(studentId)) {
    const student = students.find(s => s.id === studentId)
    const currentClassNum = parseInt(student?.class.replace('Class ', '') || '1')
    const history: PromotionHistory[] = []

    for (let i = 1; i < currentClassNum; i++) {
      history.push({
        id: faker.string.uuid(),
        studentId,
        academicYear: `${2024 - (currentClassNum - i)}-${2025 - (currentClassNum - i)}`,
        fromClass: `Class ${i}`,
        toClass: `Class ${i + 1}`,
        fromSection: faker.helpers.arrayElement(SECTIONS),
        toSection: faker.helpers.arrayElement(SECTIONS),
        promotionDate: faker.date.past({ years: currentClassNum - i }).toISOString(),
        promotionType: faker.helpers.weightedArrayElement([
          { value: 'regular' as const, weight: 90 },
          { value: 'conditional' as const, weight: 8 },
          { value: 'accelerated' as const, weight: 2 },
        ]),
        approvedBy: 'Principal',
      })
    }

    promotionHistoryCache.set(studentId, history)
  }
  return promotionHistoryCache.get(studentId)!
}

export function getGraduationDashboard(filters?: { class?: string; year?: string }) {
  let filteredStudents = students.filter(s => s.status === 'active')
  if (filters?.class) {
    filteredStudents = filteredStudents.filter(s => s.class === filters.class)
  }

  const progressData = filteredStudents.map(s => getGraduationProgress(s.id))
  const onTrack = progressData.filter(p => p.onTrack).length
  const atRisk = progressData.filter(p => !p.onTrack).length

  const byClass: { class: string; total: number; onTrack: number; atRisk: number }[] = []
  CLASSES.forEach(cls => {
    const classStudents = filteredStudents.filter(s => s.class === cls)
    const classProgress = classStudents.map(s => getGraduationProgress(s.id))
    byClass.push({
      class: cls,
      total: classStudents.length,
      onTrack: classProgress.filter(p => p.onTrack).length,
      atRisk: classProgress.filter(p => !p.onTrack).length,
    })
  })

  return {
    totalStudents: filteredStudents.length,
    onTrack,
    atRisk,
    graduated: students.filter(s => s.status === 'graduated').length,
    byClass,
  }
}

// ==================== STUDENT-TEACHER RELATIONSHIPS ====================

const RELATIONSHIP_TYPES: RelationshipType[] = ['class_teacher', 'subject_teacher', 'mentor', 'counselor', 'club_advisor', 'sports_coach']
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physical Education', 'Art']

const teacherRelationshipsCache = new Map<string, StudentTeacherRelationship[]>()

export function getStudentTeacherRelationships(studentId: string): StudentTeacherRelationship[] {
  if (!teacherRelationshipsCache.has(studentId)) {
    const relationships: StudentTeacherRelationship[] = [
      // Class teacher
      {
        id: faker.string.uuid(),
        studentId,
        teacherId: faker.string.uuid(),
        teacherName: faker.person.fullName(),
        relationshipType: 'class_teacher',
        academicYear: '2024-25',
        startDate: '2024-04-01',
        isActive: true,
      },
      // Subject teachers
      ...faker.helpers.arrayElements(SUBJECTS, { min: 3, max: 6 }).map(subject => ({
        id: faker.string.uuid(),
        studentId,
        teacherId: faker.string.uuid(),
        teacherName: faker.person.fullName(),
        relationshipType: 'subject_teacher' as RelationshipType,
        subject,
        academicYear: '2024-25',
        startDate: '2024-04-01',
        isActive: true,
      })),
    ]

    // Optional mentor
    if (faker.datatype.boolean(0.3)) {
      relationships.push({
        id: faker.string.uuid(),
        studentId,
        teacherId: faker.string.uuid(),
        teacherName: faker.person.fullName(),
        relationshipType: 'mentor',
        academicYear: '2024-25',
        startDate: faker.date.recent({ days: 180 }).toISOString(),
        isActive: true,
      })
    }

    teacherRelationshipsCache.set(studentId, relationships)
  }
  return teacherRelationshipsCache.get(studentId)!
}

const teacherFeedbackCache = new Map<string, TeacherFeedback[]>()

export function getTeacherFeedback(studentId: string, filters?: { term?: string; academicYear?: string }): TeacherFeedback[] {
  const cacheKey = `${studentId}-${filters?.term}-${filters?.academicYear}`
  if (!teacherFeedbackCache.has(cacheKey)) {
    const relationships = getStudentTeacherRelationships(studentId)
    const feedbackList: TeacherFeedback[] = []

    relationships.slice(0, 4).forEach(rel => {
      feedbackList.push({
        id: faker.string.uuid(),
        studentId,
        teacherId: rel.teacherId,
        teacherName: rel.teacherName,
        subject: rel.subject,
        term: filters?.term || 'Term 1',
        academicYear: filters?.academicYear || '2024-25',
        feedbackDate: faker.date.recent({ days: 60 }).toISOString(),
        areas: [
          { category: 'academic', rating: faker.helpers.arrayElement([3, 4, 5]) as 3 | 4 | 5, comments: faker.lorem.sentence() },
          { category: 'participation', rating: faker.helpers.arrayElement([2, 3, 4, 5]) as 2 | 3 | 4 | 5 },
          { category: 'behavior', rating: faker.helpers.arrayElement([3, 4, 5]) as 3 | 4 | 5 },
        ],
        overallComments: faker.lorem.paragraph(),
        recommendations: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : undefined,
        parentAcknowledged: faker.datatype.boolean(0.7),
        parentAcknowledgedDate: faker.datatype.boolean(0.7) ? faker.date.recent({ days: 30 }).toISOString() : undefined,
      })
    })

    teacherFeedbackCache.set(cacheKey, feedbackList)
  }
  return teacherFeedbackCache.get(cacheKey)!
}

const mentorshipCache = new Map<string, MentorshipRecord | null>()

export function getMentorship(studentId: string): MentorshipRecord | null {
  if (!mentorshipCache.has(studentId)) {
    if (faker.datatype.boolean(0.3)) {
      mentorshipCache.set(studentId, {
        studentId,
        mentorId: faker.string.uuid(),
        mentorName: faker.person.fullName(),
        startDate: faker.date.recent({ days: 180 }).toISOString(),
        goals: faker.helpers.arrayElements([
          'Improve academic performance',
          'Develop leadership skills',
          'Better time management',
          'Career guidance',
          'Personal development',
        ], { min: 2, max: 4 }),
        meetingFrequency: faker.helpers.arrayElement(['weekly', 'biweekly', 'monthly']),
        sessions: Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => ({
          date: faker.date.recent({ days: 90 }).toISOString(),
          duration: faker.helpers.arrayElement([30, 45, 60]),
          topics: faker.helpers.arrayElements(['Goal setting', 'Study habits', 'Stress management', 'Career exploration'], { min: 1, max: 3 }),
          notes: faker.lorem.paragraph(),
          actionItems: [faker.lorem.sentence()],
        })),
        status: 'active',
      })
    } else {
      mentorshipCache.set(studentId, null)
    }
  }
  return mentorshipCache.get(studentId)!
}
