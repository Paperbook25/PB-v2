import { faker } from '@faker-js/faker'
import type {
  Conversation,
  Message,
  Meeting,
  PTMSlot,
  ProgressReport,
  ParentPortalStats,
  MessageStatus,
  MeetingStatus,
  MeetingType,
  ConversationParticipantType,
} from '@/features/parent-portal/types/parent-portal.types'

// ==================== TEACHERS REFERENCE ====================

const TEACHERS = [
  { id: 'TCH001', name: 'Dr. Ramesh Krishnamurthy', subject: 'Mathematics', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ramesh' },
  { id: 'TCH002', name: 'Prof. Sunita Venkataraman', subject: 'Science', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunita' },
  { id: 'TCH003', name: 'Dr. Anil Bhattacharya', subject: 'Physics', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anil' },
  { id: 'TCH004', name: 'Meenakshi Iyer', subject: 'English', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=meenakshi' },
  { id: 'TCH005', name: 'Dr. Suresh Narayanan', subject: 'Computer Science', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suresh' },
]

// ==================== STUDENTS REFERENCE ====================

const STUDENTS = [
  { id: 'STU001', name: 'Arjun Sharma', class: 'Class 10', section: 'A', parentId: 'PAR001', parentName: 'Rajesh Sharma' },
  { id: 'STU002', name: 'Priya Patel', class: 'Class 9', section: 'B', parentId: 'PAR002', parentName: 'Amit Patel' },
  { id: 'STU003', name: 'Rahul Gupta', class: 'Class 8', section: 'A', parentId: 'PAR003', parentName: 'Sanjay Gupta' },
  { id: 'STU004', name: 'Sneha Reddy', class: 'Class 10', section: 'B', parentId: 'PAR004', parentName: 'Venkat Reddy' },
  { id: 'STU005', name: 'Karthik Kumar', class: 'Class 7', section: 'A', parentId: 'PAR005', parentName: 'Suresh Kumar' },
]

// ==================== CONVERSATIONS ====================

export const conversations: Conversation[] = STUDENTS.map((student, index) => {
  const teacher = TEACHERS[index % TEACHERS.length]
  const messagesCount = faker.number.int({ min: 5, max: 15 })

  return {
    id: `CONV${String(index + 1).padStart(4, '0')}`,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    participants: [
      {
        id: student.parentId,
        name: student.parentName,
        type: 'parent' as ConversationParticipantType,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.parentName.replace(/\s/g, '')}`,
      },
      {
        id: teacher.id,
        name: teacher.name,
        type: 'teacher' as ConversationParticipantType,
        avatar: teacher.avatar,
      },
    ],
    lastMessage: faker.helpers.arrayElement([
      'Thank you for the update on the project submission.',
      'Can we discuss the upcoming test preparation?',
      'The homework has been completed and submitted.',
      'Please let me know if you have any concerns.',
      'Looking forward to the parent-teacher meeting.',
    ]),
    lastMessageAt: faker.date.recent({ days: 3 }).toISOString(),
    lastMessageSenderId: faker.helpers.arrayElement([student.parentId, teacher.id]),
    unreadCount: faker.number.int({ min: 0, max: 5 }),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 3 }).toISOString(),
  }
})

// ==================== MESSAGES ====================

export const messages: Message[] = []

conversations.forEach((conv) => {
  const msgCount = faker.number.int({ min: 8, max: 20 })
  const parent = conv.participants.find((p) => p.type === 'parent')!
  const teacher = conv.participants.find((p) => p.type === 'teacher')!

  for (let i = 0; i < msgCount; i++) {
    const isFromParent = i % 2 === 0
    const sender = isFromParent ? parent : teacher
    const createdAt = faker.date.recent({ days: Math.max(1, 14 - i) }).toISOString()

    messages.push({
      id: `MSG${conv.id}-${String(i + 1).padStart(3, '0')}`,
      conversationId: conv.id,
      senderId: sender.id,
      senderName: sender.name,
      senderType: sender.type,
      senderAvatar: sender.avatar,
      content: faker.helpers.arrayElement([
        `Hello, I wanted to discuss ${conv.studentName}'s progress in class.`,
        'Thank you for your message. I have noted your concerns.',
        'The recent test results show improvement in mathematics.',
        'Can we schedule a meeting to discuss the upcoming exams?',
        'The assignment has been submitted on time.',
        'Please ensure the homework is completed by tomorrow.',
        'I appreciate your involvement in your child\'s education.',
        'The science project deadline has been extended by one week.',
        'Your child performed exceptionally well in the class presentation.',
        'We need to discuss the attendance pattern for this month.',
      ]),
      status: i < 2 ? 'sent' as MessageStatus : faker.helpers.arrayElement(['delivered', 'read']) as MessageStatus,
      createdAt,
      readAt: i >= 2 ? faker.date.recent({ days: 1 }).toISOString() : undefined,
    })
  }
})

// ==================== MEETINGS ====================

export const meetings: Meeting[] = []

STUDENTS.forEach((student, sIndex) => {
  const meetingsCount = faker.number.int({ min: 2, max: 5 })

  for (let i = 0; i < meetingsCount; i++) {
    const teacher = TEACHERS[(sIndex + i) % TEACHERS.length]
    const daysOffset = faker.number.int({ min: -30, max: 30 })
    const scheduledAt = new Date()
    scheduledAt.setDate(scheduledAt.getDate() + daysOffset)
    scheduledAt.setHours(faker.number.int({ min: 9, max: 16 }), faker.helpers.arrayElement([0, 30]), 0, 0)

    const status: MeetingStatus = daysOffset < -7
      ? faker.helpers.arrayElement(['completed', 'no_show', 'cancelled'])
      : daysOffset < 0
        ? 'completed'
        : faker.helpers.arrayElement(['scheduled', 'confirmed', 'cancelled'])

    meetings.push({
      id: `MTG${String(sIndex * 10 + i + 1).padStart(4, '0')}`,
      studentId: student.id,
      studentName: student.name,
      studentClass: student.class,
      studentSection: student.section,
      parentId: student.parentId,
      parentName: student.parentName,
      teacherId: teacher.id,
      teacherName: teacher.name,
      type: faker.helpers.arrayElement(['ptm', 'academic', 'counseling', 'other']) as MeetingType,
      subject: faker.helpers.arrayElement([
        'Academic Progress Discussion',
        'Term-End Review',
        'Performance Improvement Plan',
        'Parent-Teacher Meeting',
        'Extra-Curricular Activities',
        'Career Counseling',
      ]),
      description: faker.lorem.sentence(),
      scheduledAt: scheduledAt.toISOString(),
      duration: faker.helpers.arrayElement([15, 30, 45, 60]),
      status,
      venue: faker.helpers.arrayElement(['Room 101', 'Conference Hall', 'Staff Room', 'Principal Office', undefined]),
      meetingLink: faker.datatype.boolean() ? `https://meet.example.com/${faker.string.alphanumeric(10)}` : undefined,
      parentNotes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
      teacherNotes: status === 'completed' ? faker.lorem.sentences(2) : undefined,
      confirmedAt: status === 'confirmed' || status === 'completed' ? faker.date.recent({ days: 7 }).toISOString() : undefined,
      completedAt: status === 'completed' ? scheduledAt.toISOString() : undefined,
      cancelledAt: status === 'cancelled' ? faker.date.recent({ days: 3 }).toISOString() : undefined,
      cancelReason: status === 'cancelled' ? faker.helpers.arrayElement(['Schedule conflict', 'Emergency', 'Rescheduled']) : undefined,
      createdAt: faker.date.past({ years: 0.5 }).toISOString(),
      updatedAt: faker.date.recent({ days: 5 }).toISOString(),
    })
  }
})

// ==================== PTM SLOTS ====================

export const ptmSlots: PTMSlot[] = []

// Generate PTM slots for next 2 weeks
const today = new Date()
for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
  const date = new Date(today)
  date.setDate(today.getDate() + dayOffset)

  // Skip Sundays
  if (date.getDay() === 0) continue

  TEACHERS.forEach((teacher, tIndex) => {
    // Each teacher has 4-6 slots per day
    const slotsCount = faker.number.int({ min: 4, max: 6 })

    for (let slotIndex = 0; slotIndex < slotsCount; slotIndex++) {
      const startHour = 9 + slotIndex
      const currentBookings = faker.number.int({ min: 0, max: 3 })
      const maxBookings = 3

      ptmSlots.push({
        id: `SLOT-${dayOffset}-${tIndex}-${slotIndex}`,
        date: date.toISOString().split('T')[0],
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        endTime: `${String(startHour).padStart(2, '0')}:30`,
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherSubject: teacher.subject,
        maxBookings,
        currentBookings,
        isAvailable: currentBookings < maxBookings,
      })
    }
  })
}

// ==================== PROGRESS REPORTS ====================

export const progressReports: ProgressReport[] = STUDENTS.map((student, index) => {
  const subjects = TEACHERS.slice(0, 5).map((teacher, tIndex) => ({
    subjectId: `SUB${String(tIndex + 1).padStart(3, '0')}`,
    subjectName: teacher.subject,
    teacherName: teacher.name,
    grade: faker.helpers.arrayElement(['A+', 'A', 'B+', 'B', 'C+', 'C']),
    percentage: faker.number.int({ min: 60, max: 98 }),
    maxMarks: 100,
    obtainedMarks: faker.number.int({ min: 60, max: 98 }),
    remarks: faker.helpers.arrayElement([
      'Excellent performance',
      'Good progress',
      'Needs more practice',
      'Consistent improvement',
      undefined,
    ]),
  }))

  const avgPercentage = Math.round(subjects.reduce((sum, s) => sum + s.percentage, 0) / subjects.length)

  return {
    id: `RPT${String(index + 1).padStart(4, '0')}`,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    term: 'Term 1',
    academicYear: '2024-25',
    overallGrade: avgPercentage >= 90 ? 'A+' : avgPercentage >= 80 ? 'A' : avgPercentage >= 70 ? 'B+' : avgPercentage >= 60 ? 'B' : 'C',
    overallPercentage: avgPercentage,
    subjects,
    teacherRemarks: faker.lorem.sentences(2),
    principalRemarks: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    attendance: {
      present: faker.number.int({ min: 80, max: 95 }),
      absent: faker.number.int({ min: 5, max: 20 }),
      percentage: faker.number.float({ min: 80, max: 98, fractionDigits: 1 }),
    },
    behavior: {
      rating: faker.helpers.arrayElement(['excellent', 'good', 'satisfactory']),
      remarks: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    },
    generatedAt: faker.date.recent({ days: 30 }).toISOString(),
  }
})

// ==================== STATS ====================

export function getParentPortalStats(parentId?: string): ParentPortalStats {
  const parentConvs = parentId
    ? conversations.filter((c) => c.participants.some((p) => p.id === parentId))
    : conversations

  const unreadMessages = parentConvs.reduce((sum, c) => sum + c.unreadCount, 0)

  const parentMeetings = parentId
    ? meetings.filter((m) => m.parentId === parentId)
    : meetings

  const scheduledMeetings = parentMeetings.filter(
    (m) => m.status === 'scheduled' || m.status === 'confirmed'
  ).length
  const completedMeetings = parentMeetings.filter((m) => m.status === 'completed').length

  return {
    totalMessages: messages.filter((m) =>
      parentConvs.some((c) => c.id === m.conversationId)
    ).length,
    unreadMessages,
    scheduledMeetings,
    completedMeetings,
    pendingAcknowledgements: faker.number.int({ min: 0, max: 5 }),
  }
}
