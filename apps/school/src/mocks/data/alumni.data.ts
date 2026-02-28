import { faker } from '@faker-js/faker'
import type {
  Alumni,
  AlumniAchievement,
  AlumniContribution,
  AlumniEvent,
  EventRegistration,
  AchievementCategory,
  ContributionType,
  ContributionStatus,
  EventType,
  EventStatus,
} from '@/features/alumni/types/alumni.types'
import { getGraduatedStudents } from './students.data'

// Generate batches from 2015 to 2024
const batches = Array.from({ length: 10 }, (_, i) => String(2015 + i))

// Get graduated students to link some alumni records
const graduatedStudents = getGraduatedStudents()

// Helper to create alumni record
function createAlumniRecord(batch: string, linkedStudent?: typeof graduatedStudents[0]): Alumni {
  // If we have a linked student, use their data
  if (linkedStudent) {
    return {
      id: faker.string.uuid(),
      studentId: linkedStudent.id, // Link to actual student
      name: linkedStudent.name,
      email: linkedStudent.email,
      phone: linkedStudent.phone,
      batch,
      class: '12',
      section: linkedStudent.section,
      rollNumber: String(linkedStudent.rollNumber),
      photo: linkedStudent.photoUrl,
      currentCity: faker.datatype.boolean(0.8) ? faker.location.city() : undefined,
      currentCountry: faker.datatype.boolean(0.9) ? faker.location.country() : undefined,
      occupation: faker.helpers.arrayElement([
        'Software Engineer',
        'Doctor',
        'Teacher',
        'Business Analyst',
        'Chartered Accountant',
        'Civil Services',
        'Entrepreneur',
        'Lawyer',
        'Researcher',
        'Architect',
        'Data Scientist',
        'Marketing Manager',
      ]),
      company: faker.datatype.boolean(0.6) ? faker.company.name() : undefined,
      linkedIn: faker.datatype.boolean(0.5)
        ? `https://linkedin.com/in/${faker.internet.username()}`
        : undefined,
      isVerified: true, // System-graduated students are auto-verified
      registeredAt: faker.date.past({ years: 2 }).toISOString(),
    }
  }

  // Create unlinked alumni record
  return {
    id: faker.string.uuid(),
    studentId: undefined,
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.datatype.boolean(0.8) ? `+91 ${faker.string.numeric(10)}` : undefined,
    batch,
    class: '12',
    section: faker.helpers.arrayElement(['A', 'B', 'C', 'D']),
    rollNumber: faker.string.numeric(4),
    photo: faker.datatype.boolean(0.6)
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.alphanumeric(8)}`
      : undefined,
    currentCity: faker.datatype.boolean(0.8) ? faker.location.city() : undefined,
    currentCountry: faker.datatype.boolean(0.9) ? faker.location.country() : undefined,
    occupation: faker.datatype.boolean(0.7)
      ? faker.helpers.arrayElement([
          'Software Engineer',
          'Doctor',
          'Teacher',
          'Business Analyst',
          'Chartered Accountant',
          'Civil Services',
          'Entrepreneur',
          'Lawyer',
          'Researcher',
          'Architect',
          'Data Scientist',
          'Marketing Manager',
        ])
      : undefined,
    company: faker.datatype.boolean(0.6) ? faker.company.name() : undefined,
    linkedIn: faker.datatype.boolean(0.5)
      ? `https://linkedin.com/in/${faker.internet.username()}`
      : undefined,
    isVerified: faker.datatype.boolean(0.7),
    registeredAt: faker.date.past({ years: 5 }).toISOString(),
  }
}

// Generate alumni - first link graduated students to most recent batch (2024)
// Then generate additional alumni for other batches
let studentIndex = 0
export const alumni: Alumni[] = batches.flatMap((batch) => {
  const count = faker.number.int({ min: 10, max: 20 })
  const batchAlumni: Alumni[] = []

  for (let i = 0; i < count; i++) {
    // For 2024 batch, link to graduated students
    if (batch === '2024' && studentIndex < graduatedStudents.length) {
      batchAlumni.push(createAlumniRecord(batch, graduatedStudents[studentIndex]))
      studentIndex++
    } else {
      batchAlumni.push(createAlumniRecord(batch))
    }
  }

  return batchAlumni
})

// Export function to find alumni by student ID
export function getAlumniByStudentId(studentId: string): Alumni | undefined {
  return alumni.find(a => a.studentId === studentId)
}

// Generate achievements
const achievementCategories: AchievementCategory[] = [
  'academic',
  'professional',
  'sports',
  'arts',
  'social',
  'other',
]

export const achievements: AlumniAchievement[] = faker.helpers
  .arrayElements(alumni, 40)
  .map((alumnus) => ({
    id: faker.string.uuid(),
    alumniId: alumnus.id,
    alumniName: alumnus.name,
    title: faker.helpers.arrayElement([
      'IIT JEE Rank Holder',
      'UPSC Civil Services',
      'National Level Sports Award',
      'Best Employee Award',
      'Published Research Paper',
      'Startup Founder',
      'Fulbright Scholar',
      'Rhodes Scholar',
      'National Award for Arts',
      'Social Impact Award',
      'Patent Holder',
      'Gold Medalist',
      'State Topper',
      'International Conference Speaker',
      'Best Dissertation Award',
    ]),
    description: faker.lorem.paragraph(),
    category: faker.helpers.arrayElement(achievementCategories),
    date: faker.date.past({ years: 5 }).toISOString().split('T')[0],
    isPublished: faker.datatype.boolean(0.8),
    addedBy: faker.helpers.arrayElement(['self', 'admin']),
  }))

// Generate contributions
const contributionTypes: ContributionType[] = [
  'monetary',
  'scholarship',
  'mentorship',
  'infrastructure',
  'books',
  'other',
]
const contributionStatuses: ContributionStatus[] = ['pledged', 'received', 'utilized']

export const contributions: AlumniContribution[] = faker.helpers
  .arrayElements(alumni.filter((a) => a.isVerified), 25)
  .map((alumnus) => ({
    id: faker.string.uuid(),
    alumniId: alumnus.id,
    alumniName: alumnus.name,
    type: faker.helpers.arrayElement(contributionTypes),
    description: faker.lorem.sentence(),
    amount:
      faker.helpers.arrayElement(contributionTypes.slice(0, 2)) === 'monetary' ||
      faker.helpers.arrayElement(contributionTypes.slice(0, 2)) === 'scholarship'
        ? faker.number.int({ min: 5000, max: 500000 })
        : undefined,
    date: faker.date.past({ years: 3 }).toISOString().split('T')[0],
    status: faker.helpers.arrayElement(contributionStatuses),
    acknowledgement: faker.datatype.boolean(0.6) ? faker.lorem.sentence() : undefined,
  }))

// Generate events
const eventTypes: EventType[] = ['reunion', 'meet', 'webinar', 'fundraiser', 'sports', 'other']
const eventStatuses: EventStatus[] = ['upcoming', 'ongoing', 'completed', 'cancelled']

const today = new Date()

export const events: AlumniEvent[] = [
  // Upcoming events
  ...Array.from({ length: 3 }, () => ({
    id: faker.string.uuid(),
    title: faker.helpers.arrayElement([
      'Annual Alumni Reunion 2024',
      'Career Guidance Webinar',
      'Alumni Sports Meet',
      'Fundraiser Gala Dinner',
      'Batch of 2020 Meetup',
    ]),
    description: faker.lorem.paragraph(),
    type: faker.helpers.arrayElement(eventTypes),
    date: faker.date.future({ years: 1 }).toISOString().split('T')[0],
    venue: faker.datatype.boolean(0.7) ? `${faker.location.city()} Convention Center` : undefined,
    isVirtual: faker.datatype.boolean(0.4),
    meetingLink: faker.datatype.boolean(0.4)
      ? `https://meet.google.com/${faker.string.alphanumeric(10)}`
      : undefined,
    targetBatches: faker.helpers.arrayElements(batches, faker.number.int({ min: 1, max: 5 })),
    registeredCount: faker.number.int({ min: 10, max: 100 }),
    maxCapacity: faker.datatype.boolean(0.6) ? faker.number.int({ min: 50, max: 200 }) : undefined,
    status: 'upcoming' as EventStatus,
  })),
  // Past events
  ...Array.from({ length: 8 }, () => ({
    id: faker.string.uuid(),
    title: faker.helpers.arrayElement([
      'Founders Day Celebration',
      'Alumni Cricket Tournament',
      'Tech Talk Series',
      'Scholarship Award Ceremony',
      'Cultural Night',
      'Annual Day Alumni Meet',
    ]),
    description: faker.lorem.paragraph(),
    type: faker.helpers.arrayElement(eventTypes),
    date: faker.date.past({ years: 2 }).toISOString().split('T')[0],
    venue: `${faker.location.city()} Convention Center`,
    isVirtual: faker.datatype.boolean(0.3),
    meetingLink: undefined,
    targetBatches: faker.helpers.arrayElements(batches, faker.number.int({ min: 2, max: 6 })),
    registeredCount: faker.number.int({ min: 30, max: 150 }),
    maxCapacity: faker.number.int({ min: 50, max: 200 }),
    status: 'completed' as EventStatus,
  })),
]

// Generate event registrations
export const eventRegistrations: EventRegistration[] = events
  .filter((e) => e.status === 'upcoming' || e.status === 'completed')
  .flatMap((event) =>
    faker.helpers
      .arrayElements(
        alumni.filter((a) => event.targetBatches.includes(a.batch)),
        Math.min(event.registeredCount, 20)
      )
      .map((alumnus) => ({
        id: faker.string.uuid(),
        eventId: event.id,
        alumniId: alumnus.id,
        alumniName: alumnus.name,
        registeredAt: faker.date.recent({ days: 30 }).toISOString(),
        status: faker.helpers.arrayElement(['registered', 'attended', 'cancelled'] as const),
      }))
  )
