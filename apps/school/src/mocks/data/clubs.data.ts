import { faker } from '@faker-js/faker'
import type {
  Club,
  ClubCategory,
  ClubStatus,
  ClubMembership,
  MemberRole,
  MembershipStatus,
  Activity,
  ActivityType,
  ActivityStatus,
  Achievement,
  AchievementType,
  AwardLevel,
  ExtracurricularCredit,
  CreditCategory,
  CreditStatus,
  Competition,
  CompetitionLevel,
  CompetitionStatus,
  ParticipationType,
  CompetitionRegistration,
  ClubStats,
} from '@/features/clubs/types/clubs.types'

// ==================== CONSTANTS ====================

const CLUB_CATEGORIES: ClubCategory[] = [
  'academic',
  'sports',
  'arts',
  'music',
  'technology',
  'language',
  'social_service',
  'environment',
  'debate',
  'other',
]

const CLUB_NAMES: Record<ClubCategory, string[]> = {
  academic: ['Science Club', 'Mathematics Olympiad Club', 'Astronomy Club', 'Robotics Club', 'Quiz Club'],
  sports: ['Cricket Club', 'Football Club', 'Basketball Club', 'Athletics Club', 'Chess Club', 'Table Tennis Club'],
  arts: ['Art Club', 'Photography Club', 'Film Making Club', 'Craft Club', 'Painting Club'],
  music: ['Choir Club', 'Band Club', 'Classical Music Club', 'Guitar Club', 'Vocal Club'],
  technology: ['Coding Club', 'Cyber Security Club', 'AI & ML Club', 'Web Development Club', 'Tech Innovators'],
  language: ['English Literary Club', 'Hindi Sahitya Club', 'French Club', 'Creative Writing Club', 'Book Club'],
  social_service: ['NSS Club', 'Community Service Club', 'Red Cross Club', 'Eco Warriors', 'Helping Hands'],
  environment: ['Green Club', 'Nature Club', 'Gardening Club', 'Wildlife Conservation Club', 'Sustainability Club'],
  debate: ['Debate Club', 'Model United Nations', 'Public Speaking Club', 'Oratory Club', 'Parliamentary Debate'],
  other: ['Adventure Club', 'Cultural Club', 'Heritage Club', 'Yoga & Wellness Club', 'Cooking Club'],
}

const STAFF_ADVISORS = [
  { id: 'staff-001', name: 'Dr. Rajesh Kumar' },
  { id: 'staff-002', name: 'Mrs. Priya Sharma' },
  { id: 'staff-003', name: 'Mr. Amit Verma' },
  { id: 'staff-004', name: 'Ms. Anita Gupta' },
  { id: 'staff-005', name: 'Mr. Suresh Patel' },
  { id: 'staff-006', name: 'Mrs. Kavita Singh' },
  { id: 'staff-007', name: 'Dr. Meena Iyer' },
  { id: 'staff-008', name: 'Mr. Vikram Rao' },
]

const STUDENTS = [
  { id: 'stu-001', name: 'Aarav Sharma', class: '10', section: 'A' },
  { id: 'stu-002', name: 'Priya Patel', class: '10', section: 'B' },
  { id: 'stu-003', name: 'Rohan Kumar', class: '9', section: 'A' },
  { id: 'stu-004', name: 'Ananya Gupta', class: '11', section: 'A' },
  { id: 'stu-005', name: 'Vikram Singh', class: '12', section: 'B' },
  { id: 'stu-006', name: 'Sneha Reddy', class: '9', section: 'B' },
  { id: 'stu-007', name: 'Arjun Nair', class: '11', section: 'B' },
  { id: 'stu-008', name: 'Kavya Menon', class: '10', section: 'A' },
  { id: 'stu-009', name: 'Rahul Verma', class: '12', section: 'A' },
  { id: 'stu-010', name: 'Ishita Joshi', class: '9', section: 'A' },
  { id: 'stu-011', name: 'Aditya Rao', class: '11', section: 'A' },
  { id: 'stu-012', name: 'Meera Shah', class: '10', section: 'B' },
  { id: 'stu-013', name: 'Karan Malhotra', class: '12', section: 'B' },
  { id: 'stu-014', name: 'Divya Kapoor', class: '9', section: 'B' },
  { id: 'stu-015', name: 'Siddharth Iyer', class: '11', section: 'B' },
]

const ACTIVITY_TYPES: ActivityType[] = [
  'meeting',
  'workshop',
  'competition',
  'exhibition',
  'performance',
  'community_service',
  'field_trip',
  'guest_lecture',
  'practice',
  'fundraiser',
  'other',
]

const ACHIEVEMENT_TYPES: AchievementType[] = [
  'competition_win',
  'certification',
  'performance',
  'exhibition',
  'publication',
  'community_impact',
  'innovation',
  'leadership',
  'skill_mastery',
  'other',
]

const AWARD_LEVELS: AwardLevel[] = [
  'participation',
  'school',
  'district',
  'state',
  'national',
  'international',
]

const COMPETITION_LEVELS: CompetitionLevel[] = [
  'intra_school',
  'inter_school',
  'district',
  'state',
  'national',
  'international',
]

const MEETING_SCHEDULES = [
  'Every Monday, 3:00 PM - 4:30 PM',
  'Every Tuesday, 4:00 PM - 5:00 PM',
  'Every Wednesday, 3:30 PM - 5:00 PM',
  'Every Friday, 2:30 PM - 4:00 PM',
  'Alternate Saturdays, 10:00 AM - 12:00 PM',
  'Every Thursday, 3:00 PM - 4:00 PM',
]

const MEETING_LOCATIONS = [
  'Room 101',
  'Auditorium',
  'Science Lab',
  'Computer Lab',
  'Sports Ground',
  'Music Room',
  'Art Studio',
  'Library Hall',
  'Conference Room',
  'Open Air Theatre',
]

// ==================== HELPER FUNCTIONS ====================

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

// ==================== CLUB GENERATION ====================

function createClub(index: number): Club {
  const category = CLUB_CATEGORIES[index % CLUB_CATEGORIES.length]
  const names = CLUB_NAMES[category]
  const name = names[index % names.length]
  const advisor = faker.helpers.arrayElement(STAFF_ADVISORS)
  const status: ClubStatus = faker.helpers.weightedArrayElement([
    { value: 'active', weight: 8 },
    { value: 'inactive', weight: 1 },
    { value: 'pending_approval', weight: 1 },
  ])

  const hasPresident = faker.datatype.boolean(0.8) && status === 'active'
  const president = hasPresident ? faker.helpers.arrayElement(STUDENTS) : null

  const hasVP = hasPresident && faker.datatype.boolean(0.7)
  const vp = hasVP ? faker.helpers.arrayElement(STUDENTS.filter((s) => s.id !== president?.id)) : null

  const hasSecretary = hasPresident && faker.datatype.boolean(0.6)
  const secretary = hasSecretary
    ? faker.helpers.arrayElement(STUDENTS.filter((s) => s.id !== president?.id && s.id !== vp?.id))
    : null

  const maxMembers = faker.helpers.arrayElement([20, 25, 30, 40, 50, undefined])
  const currentMembers = maxMembers
    ? faker.number.int({ min: 5, max: maxMembers })
    : faker.number.int({ min: 5, max: 35 })

  return {
    id: `club-${String(index + 1).padStart(3, '0')}`,
    name,
    description: faker.lorem.paragraph(2),
    category,
    status,
    advisorId: advisor.id,
    advisorName: advisor.name,
    ...(president && { presidentId: president.id, presidentName: president.name }),
    ...(vp && { vicePresidentId: vp.id, vicePresidentName: vp.name }),
    ...(secretary && { secretaryId: secretary.id, secretaryName: secretary.name }),
    foundedDate: faker.date.past({ years: 5 }).toISOString().split('T')[0],
    meetingSchedule: faker.helpers.arrayElement(MEETING_SCHEDULES),
    meetingLocation: faker.helpers.arrayElement(MEETING_LOCATIONS),
    maxMembers,
    currentMembers,
    logoUrl: `https://picsum.photos/seed/${generateId()}/200/200`,
    website: faker.datatype.boolean(0.3) ? faker.internet.url() : undefined,
    email: faker.datatype.boolean(0.5) ? faker.internet.email({ provider: 'school.edu' }) : undefined,
    socialLinks: faker.datatype.boolean(0.4)
      ? {
          instagram: faker.datatype.boolean(0.7) ? `@${name.toLowerCase().replace(/\s+/g, '_')}` : undefined,
          facebook: faker.datatype.boolean(0.5) ? faker.internet.url() : undefined,
        }
      : undefined,
    createdAt: faker.date.past({ years: 3 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  }
}

// Generate 25 clubs
export const clubs: Club[] = Array.from({ length: 25 }, (_, i) => createClub(i))

// ==================== MEMBERSHIP GENERATION ====================

function createMembership(clubIndex: number, memberIndex: number): ClubMembership {
  const club = clubs[clubIndex % clubs.length]
  const student = STUDENTS[memberIndex % STUDENTS.length]
  const role: MemberRole = faker.helpers.weightedArrayElement([
    { value: 'member', weight: 7 },
    { value: 'coordinator', weight: 2 },
    { value: 'treasurer', weight: 1 },
  ])
  const status: MembershipStatus = faker.helpers.weightedArrayElement([
    { value: 'active', weight: 8 },
    { value: 'inactive', weight: 1 },
    { value: 'pending', weight: 1 },
  ])

  return {
    id: `mem-${String(clubIndex * 10 + memberIndex + 1).padStart(4, '0')}`,
    clubId: club.id,
    clubName: club.name,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    role,
    status,
    joinedDate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
    applicationReason: faker.datatype.boolean(0.6) ? faker.lorem.sentence() : undefined,
    notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : undefined,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent({ days: 60 }).toISOString(),
  }
}

// Generate memberships (multiple per club)
export const memberships: ClubMembership[] = []
clubs.forEach((_, clubIndex) => {
  const memberCount = faker.number.int({ min: 5, max: 12 })
  for (let i = 0; i < memberCount; i++) {
    memberships.push(createMembership(clubIndex, i))
  }
})

// ==================== ACTIVITY GENERATION ====================

function createActivity(index: number): Activity {
  const club = faker.helpers.arrayElement(clubs)
  const organizer = faker.helpers.arrayElement(STAFF_ADVISORS)
  const type: ActivityType = faker.helpers.arrayElement(ACTIVITY_TYPES)
  const status: ActivityStatus = faker.helpers.weightedArrayElement([
    { value: 'completed', weight: 4 },
    { value: 'scheduled', weight: 4 },
    { value: 'ongoing', weight: 1 },
    { value: 'cancelled', weight: 1 },
  ])

  const date = status === 'completed'
    ? faker.date.past({ years: 1 })
    : status === 'scheduled'
      ? faker.date.future({ years: 0.5 })
      : faker.date.recent({ days: 7 })

  const startTime = faker.helpers.arrayElement(['09:00', '10:00', '14:00', '15:00', '16:00'])
  const endTime = faker.helpers.arrayElement(['11:00', '12:00', '16:00', '17:00', '18:00'])

  const expectedParticipants = faker.number.int({ min: 10, max: 50 })
  const actualParticipants = status === 'completed' ? faker.number.int({ min: 8, max: expectedParticipants }) : undefined

  return {
    id: `act-${String(index + 1).padStart(4, '0')}`,
    clubId: club.id,
    clubName: club.name,
    title: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    type,
    status,
    schedule: {
      startTime,
      endTime,
      location: faker.helpers.arrayElement(MEETING_LOCATIONS),
      frequency: type === 'meeting' ? 'weekly' : 'once',
    },
    date: date.toISOString().split('T')[0],
    organizerId: organizer.id,
    organizerName: organizer.name,
    expectedParticipants,
    actualParticipants,
    budget: faker.datatype.boolean(0.5) ? faker.number.int({ min: 500, max: 10000 }) : undefined,
    actualCost: status === 'completed' && faker.datatype.boolean(0.7)
      ? faker.number.int({ min: 300, max: 8000 })
      : undefined,
    resources: faker.datatype.boolean(0.6)
      ? [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()]
      : undefined,
    notes: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : undefined,
    outcomes: status === 'completed' && faker.datatype.boolean(0.6) ? faker.lorem.sentence() : undefined,
    creditsAwarded: faker.datatype.boolean(0.5) ? faker.number.int({ min: 1, max: 5 }) : undefined,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  }
}

// Generate 60 activities
export const activities: Activity[] = Array.from({ length: 60 }, (_, i) => createActivity(i))

// ==================== ACHIEVEMENT GENERATION ====================

function createAchievement(index: number): Achievement {
  const club = faker.helpers.arrayElement(clubs)
  const student = faker.helpers.arrayElement(STUDENTS)
  const type: AchievementType = faker.helpers.arrayElement(ACHIEVEMENT_TYPES)
  const level: AwardLevel = faker.helpers.weightedArrayElement([
    { value: 'school', weight: 4 },
    { value: 'district', weight: 3 },
    { value: 'state', weight: 2 },
    { value: 'national', weight: 1 },
    { value: 'international', weight: 0.5 },
    { value: 'participation', weight: 2 },
  ])

  const isVerified = faker.datatype.boolean(0.7)
  const verifier = isVerified ? faker.helpers.arrayElement(STAFF_ADVISORS) : null

  return {
    id: `ach-${String(index + 1).padStart(4, '0')}`,
    clubId: club.id,
    clubName: club.name,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    title: faker.lorem.words(4),
    description: faker.lorem.sentence(),
    type,
    level,
    date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    position: type === 'competition_win' ? faker.helpers.arrayElement(['1st', '2nd', '3rd', 'Finalist']) : undefined,
    competitionName: type === 'competition_win' ? faker.lorem.words(3) : undefined,
    venue: faker.datatype.boolean(0.6) ? faker.location.city() : undefined,
    certificateUrl: faker.datatype.boolean(0.5) ? faker.internet.url() : undefined,
    mediaUrls: faker.datatype.boolean(0.3)
      ? [faker.image.url(), faker.image.url()]
      : undefined,
    isVerified,
    verifiedBy: verifier?.name,
    verifiedAt: isVerified ? faker.date.recent({ days: 30 }).toISOString() : undefined,
    creditsAwarded: faker.datatype.boolean(0.6) ? faker.number.int({ min: 2, max: 10 }) : undefined,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  }
}

// Generate 40 achievements
export const achievements: Achievement[] = Array.from({ length: 40 }, (_, i) => createAchievement(i))

// ==================== CREDIT GENERATION ====================

function createCredit(index: number): ExtracurricularCredit {
  const club = faker.helpers.arrayElement(clubs)
  const student = faker.helpers.arrayElement(STUDENTS)
  const category: CreditCategory = faker.helpers.arrayElement([
    'participation',
    'leadership',
    'achievement',
    'service',
    'skill_development',
    'attendance',
    'special_contribution',
  ])
  const status: CreditStatus = faker.helpers.weightedArrayElement([
    { value: 'approved', weight: 6 },
    { value: 'pending', weight: 3 },
    { value: 'rejected', weight: 1 },
  ])

  const approver = status === 'approved' ? faker.helpers.arrayElement(STAFF_ADVISORS) : null

  return {
    id: `cred-${String(index + 1).padStart(4, '0')}`,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    clubId: club.id,
    clubName: club.name,
    category,
    credits: faker.number.int({ min: 1, max: 10 }),
    description: faker.lorem.sentence(),
    academicYear: faker.helpers.arrayElement(['2023-24', '2024-25']),
    semester: faker.helpers.arrayElement(['1', '2']),
    awardedDate: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    status,
    approvedBy: approver?.name,
    approvedAt: approver ? faker.date.recent({ days: 30 }).toISOString() : undefined,
    rejectionReason: status === 'rejected' ? faker.lorem.sentence() : undefined,
    notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : undefined,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  }
}

// Generate 80 credits
export const credits: ExtracurricularCredit[] = Array.from({ length: 80 }, (_, i) => createCredit(i))

// ==================== COMPETITION GENERATION ====================

function createCompetition(index: number): Competition {
  const club = faker.helpers.arrayElement(clubs)
  const level: CompetitionLevel = faker.helpers.weightedArrayElement([
    { value: 'intra_school', weight: 4 },
    { value: 'inter_school', weight: 3 },
    { value: 'district', weight: 2 },
    { value: 'state', weight: 1 },
    { value: 'national', weight: 0.5 },
    { value: 'international', weight: 0.2 },
  ])
  const status: CompetitionStatus = faker.helpers.weightedArrayElement([
    { value: 'completed', weight: 4 },
    { value: 'upcoming', weight: 3 },
    { value: 'registration_open', weight: 2 },
    { value: 'ongoing', weight: 1 },
  ])
  const participationType: ParticipationType = faker.helpers.arrayElement(['individual', 'team', 'both'])

  const regStart = faker.date.past({ years: 0.5 })
  const regEnd = new Date(regStart)
  regEnd.setDate(regEnd.getDate() + faker.number.int({ min: 14, max: 30 }))
  const compDate = new Date(regEnd)
  compDate.setDate(compDate.getDate() + faker.number.int({ min: 7, max: 21 }))

  const maxParticipants = faker.helpers.arrayElement([20, 30, 50, 100, undefined])
  const currentParticipants = maxParticipants
    ? faker.number.int({ min: 5, max: maxParticipants })
    : faker.number.int({ min: 5, max: 40 })

  return {
    id: `comp-${String(index + 1).padStart(4, '0')}`,
    clubId: club.id,
    clubName: club.name,
    title: faker.lorem.words(4),
    description: faker.lorem.paragraph(),
    category: club.category,
    level,
    status,
    participationType,
    registrationStartDate: regStart.toISOString().split('T')[0],
    registrationEndDate: regEnd.toISOString().split('T')[0],
    competitionDate: compDate.toISOString().split('T')[0],
    venue: faker.location.streetAddress(),
    externalVenue: level !== 'intra_school' && faker.datatype.boolean(0.6),
    organizerName: faker.person.fullName(),
    contactEmail: faker.internet.email(),
    contactPhone: faker.phone.number(),
    maxParticipants,
    currentParticipants,
    entryFee: faker.datatype.boolean(0.4) ? faker.number.int({ min: 50, max: 500 }) : undefined,
    prizes: [
      { position: '1st', prize: 'Gold Medal + Certificate' },
      { position: '2nd', prize: 'Silver Medal + Certificate' },
      { position: '3rd', prize: 'Bronze Medal + Certificate' },
    ],
    rules: [
      'All participants must carry valid ID',
      'Reporting time is 30 minutes before the event',
      'Decision of judges is final',
    ],
    requirements: faker.datatype.boolean(0.5)
      ? ['Valid school ID', 'Consent form', 'Sports attire']
      : undefined,
    winnerAnnounced: status === 'completed',
    results: status === 'completed'
      ? [
          {
            studentId: STUDENTS[0].id,
            studentName: STUDENTS[0].name,
            studentClass: STUDENTS[0].class,
            studentSection: STUDENTS[0].section,
            position: '1st',
            score: faker.number.int({ min: 85, max: 100 }),
            creditsAwarded: 10,
          },
          {
            studentId: STUDENTS[1].id,
            studentName: STUDENTS[1].name,
            studentClass: STUDENTS[1].class,
            studentSection: STUDENTS[1].section,
            position: '2nd',
            score: faker.number.int({ min: 75, max: 84 }),
            creditsAwarded: 7,
          },
        ]
      : undefined,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  }
}

// Generate 20 competitions
export const competitions: Competition[] = Array.from({ length: 20 }, (_, i) => createCompetition(i))

// ==================== COMPETITION REGISTRATION GENERATION ====================

function createRegistration(index: number): CompetitionRegistration {
  const competition = faker.helpers.arrayElement(competitions)
  const student = faker.helpers.arrayElement(STUDENTS)

  return {
    id: `reg-${String(index + 1).padStart(4, '0')}`,
    competitionId: competition.id,
    competitionTitle: competition.title,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    teamName: competition.participationType === 'team' ? faker.lorem.words(2) : undefined,
    teamMembers: competition.participationType === 'team'
      ? [
          { studentId: STUDENTS[0].id, studentName: STUDENTS[0].name },
          { studentId: STUDENTS[1].id, studentName: STUDENTS[1].name },
        ]
      : undefined,
    registrationDate: faker.date.past({ years: 0.5 }).toISOString().split('T')[0],
    status: faker.helpers.weightedArrayElement([
      { value: 'confirmed', weight: 7 },
      { value: 'registered', weight: 2 },
      { value: 'withdrawn', weight: 1 },
    ]),
    paymentStatus: competition.entryFee
      ? faker.helpers.weightedArrayElement([
          { value: 'paid', weight: 7 },
          { value: 'pending', weight: 2 },
          { value: 'waived', weight: 1 },
        ])
      : undefined,
    createdAt: faker.date.past({ years: 0.5 }).toISOString(),
  }
}

// Generate 50 registrations
export const registrations: CompetitionRegistration[] = Array.from({ length: 50 }, (_, i) => createRegistration(i))

// ==================== STATS HELPER ====================

export function getClubStats(): ClubStats {
  const activeClubs = clubs.filter((c) => c.status === 'active')
  const totalMembers = memberships.filter((m) => m.status === 'active').length
  const upcomingActivities = activities.filter((a) => a.status === 'scheduled').length
  const upcomingCompetitions = competitions.filter((c) => c.status === 'upcoming' || c.status === 'registration_open').length
  const totalCredits = credits.filter((c) => c.status === 'approved').reduce((sum, c) => sum + c.credits, 0)

  const categoryBreakdown = CLUB_CATEGORIES.map((category) => ({
    category,
    count: clubs.filter((c) => c.category === category).length,
  }))

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyActivityTrend = months.map((month, idx) => ({
    month,
    count: activities.filter((a) => {
      const actMonth = new Date(a.date).getMonth()
      return actMonth === idx
    }).length,
  }))

  const topClubsByMembers = clubs
    .map((c) => ({
      clubId: c.id,
      clubName: c.name,
      members: memberships.filter((m) => m.clubId === c.id && m.status === 'active').length,
    }))
    .sort((a, b) => b.members - a.members)
    .slice(0, 5)

  const recentAchievements = [...achievements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return {
    totalClubs: clubs.length,
    activeClubs: activeClubs.length,
    totalMembers,
    totalActivities: activities.length,
    upcomingActivities,
    totalCompetitions: competitions.length,
    upcomingCompetitions,
    totalAchievements: achievements.length,
    totalCreditsAwarded: totalCredits,
    categoryBreakdown,
    monthlyActivityTrend,
    topClubsByMembers,
    recentAchievements,
  }
}

// ==================== AVAILABLE DATA FOR DROPDOWNS ====================

export function getAvailableStudents() {
  return STUDENTS
}

export function getAvailableAdvisors() {
  return STAFF_ADVISORS
}
