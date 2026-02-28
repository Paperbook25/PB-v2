import { faker } from '@faker-js/faker'
import {
  Announcement,
  AnnouncementPriority,
  AnnouncementStatus,
  AnnouncementTarget,
  Circular,
  CircularStatus,
  Conversation,
  Message,
  MessageStatus,
  Survey,
  SurveyStatus,
  QuestionType,
  EmergencyAlert,
  AlertSeverity,
  AlertStatus,
  Event,
  EventStatus,
  EventType,
} from '@/features/communication/types/communication.types'
import { Role } from '@/types/common.types'

const roles: Role[] = ['admin', 'principal', 'teacher', 'accountant', 'librarian', 'transport_manager', 'student', 'parent']
const priorities: AnnouncementPriority[] = ['low', 'normal', 'high', 'urgent']
const announcementStatuses: AnnouncementStatus[] = ['draft', 'scheduled', 'published', 'archived']
const circularStatuses: CircularStatus[] = ['draft', 'published', 'archived']
const surveyStatuses: SurveyStatus[] = ['draft', 'active', 'closed', 'archived']
const alertSeverities: AlertSeverity[] = ['info', 'warning', 'critical', 'emergency']
const alertStatuses: AlertStatus[] = ['active', 'resolved', 'cancelled']
const eventTypes: EventType[] = ['academic', 'sports', 'cultural', 'meeting', 'holiday', 'other']
const eventStatuses: EventStatus[] = ['upcoming', 'ongoing', 'completed', 'cancelled']
const questionTypes: QuestionType[] = ['text', 'textarea', 'single_choice', 'multiple_choice', 'rating', 'scale']

function createTarget(): AnnouncementTarget {
  const type = faker.helpers.arrayElement(['all', 'role', 'class', 'section', 'individual'] as const)
  const target: AnnouncementTarget = { type }

  if (type === 'role') {
    target.roles = faker.helpers.arrayElements(roles, { min: 1, max: 3 })
  } else if (type === 'class') {
    target.classIds = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.string.uuid())
  } else if (type === 'section') {
    target.sectionIds = Array.from({ length: faker.number.int({ min: 1, max: 2 }) }, () => faker.string.uuid())
  } else if (type === 'individual') {
    target.userIds = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.string.uuid())
  }

  return target
}

// ===== Announcements =====
function createAnnouncement(status?: AnnouncementStatus): Announcement {
  const createdAt = faker.date.past({ years: 1 })
  const finalStatus = status || faker.helpers.arrayElement(announcementStatuses)
  const acknowledgementRequired = faker.datatype.boolean()

  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence({ min: 4, max: 8 }),
    content: faker.lorem.paragraphs({ min: 1, max: 3 }),
    priority: faker.helpers.arrayElement(priorities),
    status: finalStatus,
    target: createTarget(),
    attachments: faker.datatype.boolean() ? [{
      id: faker.string.uuid(),
      name: `${faker.system.commonFileName()}.pdf`,
      url: faker.internet.url(),
      type: 'application/pdf',
      size: faker.number.int({ min: 10000, max: 5000000 }),
    }] : [],
    publishedAt: finalStatus === 'published' ? faker.date.between({ from: createdAt, to: new Date() }).toISOString() : undefined,
    scheduledAt: finalStatus === 'scheduled' ? faker.date.future({ years: 0.1 }).toISOString() : undefined,
    expiresAt: faker.datatype.boolean() ? faker.date.future({ years: 0.5 }).toISOString() : undefined,
    createdBy: faker.string.uuid(),
    createdByName: faker.person.fullName(),
    createdAt: createdAt.toISOString(),
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
    viewCount: faker.number.int({ min: 0, max: 500 }),
    acknowledgementRequired,
    acknowledgements: acknowledgementRequired ? Array.from({ length: faker.number.int({ min: 0, max: 50 }) }, () => ({
      userId: faker.string.uuid(),
      userName: faker.person.fullName(),
      acknowledgedAt: faker.date.recent({ days: 30 }).toISOString(),
    })) : [],
  }
}

export const announcements: Announcement[] = [
  ...Array.from({ length: 10 }, () => createAnnouncement('published')),
  ...Array.from({ length: 5 }, () => createAnnouncement('draft')),
  ...Array.from({ length: 3 }, () => createAnnouncement('scheduled')),
  ...Array.from({ length: 7 }, () => createAnnouncement('archived')),
]

// ===== Conversations & Messages =====
function createMessage(conversationId: string, senderId: string, senderName: string, senderRole: Role): Message {
  return {
    id: faker.string.uuid(),
    conversationId,
    senderId,
    senderName,
    senderRole,
    senderAvatar: faker.image.avatar(),
    content: faker.lorem.sentences({ min: 1, max: 3 }),
    attachments: faker.datatype.boolean() && faker.number.int({ min: 0, max: 10 }) < 2 ? [{
      id: faker.string.uuid(),
      name: faker.system.commonFileName('pdf'),
      url: faker.internet.url(),
      type: 'application/pdf',
      size: faker.number.int({ min: 10000, max: 2000000 }),
    }] : [],
    status: faker.helpers.arrayElement(['sent', 'delivered', 'read'] as MessageStatus[]),
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
    readAt: faker.datatype.boolean() ? faker.date.recent({ days: 5 }).toISOString() : undefined,
  }
}

function createConversation(): Conversation {
  const conversationId = faker.string.uuid()
  const isGroup = faker.datatype.boolean()
  const participantCount = isGroup ? faker.number.int({ min: 3, max: 8 }) : 2

  const participants = Array.from({ length: participantCount }, () => ({
    userId: faker.string.uuid(),
    userName: faker.person.fullName(),
    userRole: faker.helpers.arrayElement(roles),
    userAvatar: faker.image.avatar(),
    joinedAt: faker.date.past({ years: 1 }).toISOString(),
    lastReadAt: faker.datatype.boolean() ? faker.date.recent({ days: 7 }).toISOString() : undefined,
  }))

  const createdAt = faker.date.past({ years: 1 })

  return {
    id: conversationId,
    participants,
    type: isGroup ? 'group' : 'direct',
    title: isGroup ? faker.lorem.words({ min: 2, max: 4 }) : undefined,
    lastMessage: createMessage(conversationId, participants[0].userId, participants[0].userName, participants[0].userRole),
    unreadCount: faker.number.int({ min: 0, max: 10 }),
    createdAt: createdAt.toISOString(),
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
  }
}

export const conversations: Conversation[] = Array.from({ length: 25 }, createConversation)

// Create messages for each conversation
export const messages: Message[] = conversations.flatMap((conv) => {
  const messageCount = faker.number.int({ min: 3, max: 15 })
  return Array.from({ length: messageCount }, () => {
    const participant = faker.helpers.arrayElement(conv.participants)
    return createMessage(conv.id, participant.userId, participant.userName, participant.userRole)
  }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
})

// ===== Circulars =====
const circularCategories = ['Academic', 'Administrative', 'Fee Related', 'Examination', 'Holiday', 'Events', 'General']

function createCircular(status?: CircularStatus): Circular {
  const createdAt = faker.date.past({ years: 1 })
  const finalStatus = status || faker.helpers.arrayElement(circularStatuses)
  const refYear = new Date().getFullYear()

  return {
    id: faker.string.uuid(),
    referenceNumber: `CIR/${refYear}/${faker.number.int({ min: 100, max: 999 })}`,
    title: faker.lorem.sentence({ min: 5, max: 10 }),
    content: faker.lorem.paragraphs({ min: 2, max: 5 }),
    category: faker.helpers.arrayElement(circularCategories),
    status: finalStatus,
    target: createTarget(),
    attachments: [{
      id: faker.string.uuid(),
      name: `circular_${faker.number.int({ min: 100, max: 999 })}.pdf`,
      url: faker.internet.url(),
      type: 'application/pdf',
      size: faker.number.int({ min: 50000, max: 2000000 }),
    }],
    publishedAt: finalStatus === 'published' ? faker.date.between({ from: createdAt, to: new Date() }).toISOString() : undefined,
    createdBy: faker.string.uuid(),
    createdByName: faker.person.fullName(),
    createdAt: createdAt.toISOString(),
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
    downloadCount: faker.number.int({ min: 0, max: 300 }),
  }
}

export const circulars: Circular[] = [
  ...Array.from({ length: 20 }, () => createCircular('published')),
  ...Array.from({ length: 5 }, () => createCircular('draft')),
  ...Array.from({ length: 10 }, () => createCircular('archived')),
]

// ===== Surveys =====
function createSurveyQuestion(order: number): { id: string; question: string; type: QuestionType; options?: string[]; required: boolean; order: number } {
  const type = faker.helpers.arrayElement(questionTypes)

  return {
    id: faker.string.uuid(),
    question: faker.lorem.sentence() + '?',
    type,
    options: ['single_choice', 'multiple_choice'].includes(type)
      ? Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, () => faker.lorem.words({ min: 2, max: 5 }))
      : undefined,
    required: faker.datatype.boolean(),
    order,
  }
}

function createSurvey(status?: SurveyStatus): Survey {
  const createdAt = faker.date.past({ years: 0.5 })
  const finalStatus = status || faker.helpers.arrayElement(surveyStatuses)
  const questionCount = faker.number.int({ min: 3, max: 8 })
  const totalTargeted = faker.number.int({ min: 50, max: 500 })

  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence({ min: 4, max: 8 }),
    description: faker.lorem.paragraph(),
    status: finalStatus,
    target: createTarget(),
    questions: Array.from({ length: questionCount }, (_, i) => createSurveyQuestion(i + 1)),
    startsAt: finalStatus === 'draft' ? faker.date.future({ years: 0.1 }).toISOString() : faker.date.past({ years: 0.3 }).toISOString(),
    endsAt: ['draft', 'active'].includes(finalStatus) ? faker.date.future({ years: 0.2 }).toISOString() : faker.date.past({ years: 0.1 }).toISOString(),
    anonymous: faker.datatype.boolean(),
    createdBy: faker.string.uuid(),
    createdByName: faker.person.fullName(),
    createdAt: createdAt.toISOString(),
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
    responseCount: ['active', 'closed'].includes(finalStatus) ? faker.number.int({ min: 10, max: totalTargeted }) : 0,
    totalTargeted,
  }
}

export const surveys: Survey[] = [
  ...Array.from({ length: 5 }, () => createSurvey('active')),
  ...Array.from({ length: 3 }, () => createSurvey('draft')),
  ...Array.from({ length: 8 }, () => createSurvey('closed')),
  ...Array.from({ length: 4 }, () => createSurvey('archived')),
]

// ===== Emergency Alerts =====
function createEmergencyAlert(status?: AlertStatus): EmergencyAlert {
  const createdAt = faker.date.past({ years: 0.5 })
  const finalStatus = status || faker.helpers.arrayElement(alertStatuses)

  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence({ min: 3, max: 6 }),
    message: faker.lorem.paragraph(),
    severity: faker.helpers.arrayElement(alertSeverities),
    status: finalStatus,
    target: { type: 'all' },
    channels: faker.helpers.arrayElements(['app', 'sms', 'email', 'push'] as const, { min: 1, max: 4 }),
    instructions: faker.datatype.boolean() ? faker.lorem.sentences({ min: 2, max: 4 }) : undefined,
    resolvedAt: finalStatus === 'resolved' ? faker.date.between({ from: createdAt, to: new Date() }).toISOString() : undefined,
    resolvedBy: finalStatus === 'resolved' ? faker.person.fullName() : undefined,
    createdBy: faker.string.uuid(),
    createdByName: faker.person.fullName(),
    createdAt: createdAt.toISOString(),
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
    acknowledgements: Array.from({ length: faker.number.int({ min: 10, max: 100 }) }, () => ({
      userId: faker.string.uuid(),
      userName: faker.person.fullName(),
      acknowledgedAt: faker.date.recent({ days: 7 }).toISOString(),
      location: faker.datatype.boolean() ? faker.location.city() : undefined,
      status: faker.helpers.arrayElement(['safe', 'need_help'] as const),
    })),
  }
}

export const emergencyAlerts: EmergencyAlert[] = [
  ...Array.from({ length: 2 }, () => createEmergencyAlert('active')),
  ...Array.from({ length: 15 }, () => createEmergencyAlert('resolved')),
  ...Array.from({ length: 3 }, () => createEmergencyAlert('cancelled')),
]

// ===== Events =====
function createEvent(status?: EventStatus): Event {
  const createdAt = faker.date.past({ years: 1 })
  const finalStatus = status || faker.helpers.arrayElement(eventStatuses)
  const registrationRequired = faker.datatype.boolean()
  const maxAttendees = registrationRequired ? faker.number.int({ min: 50, max: 500 }) : undefined

  let startsAt: Date
  let endsAt: Date

  if (finalStatus === 'upcoming') {
    startsAt = faker.date.future({ years: 0.3 })
    endsAt = new Date(startsAt.getTime() + faker.number.int({ min: 1, max: 8 }) * 60 * 60 * 1000)
  } else if (finalStatus === 'ongoing') {
    startsAt = faker.date.recent({ days: 1 })
    endsAt = faker.date.soon({ days: 1 })
  } else {
    startsAt = faker.date.past({ years: 0.5 })
    endsAt = new Date(startsAt.getTime() + faker.number.int({ min: 1, max: 8 }) * 60 * 60 * 1000)
  }

  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence({ min: 3, max: 7 }),
    description: faker.lorem.paragraphs({ min: 1, max: 3 }),
    type: faker.helpers.arrayElement(eventTypes),
    status: finalStatus,
    target: createTarget(),
    venue: `${faker.location.buildingNumber()} ${faker.location.street()}, ${faker.helpers.arrayElement(['Auditorium', 'Conference Hall', 'Sports Ground', 'Library', 'Main Hall'])}`,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    registrationRequired,
    registrationDeadline: registrationRequired ? new Date(startsAt.getTime() - 24 * 60 * 60 * 1000).toISOString() : undefined,
    maxAttendees,
    attachments: faker.datatype.boolean() ? [{
      id: faker.string.uuid(),
      name: 'event_details.pdf',
      url: faker.internet.url(),
      type: 'application/pdf',
    }] : [],
    createdBy: faker.string.uuid(),
    createdByName: faker.person.fullName(),
    createdAt: createdAt.toISOString(),
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
    registrations: registrationRequired ? Array.from({ length: faker.number.int({ min: 10, max: maxAttendees || 100 }) }, () => ({
      userId: faker.string.uuid(),
      userName: faker.person.fullName(),
      userRole: faker.helpers.arrayElement(roles),
      registeredAt: faker.date.recent({ days: 30 }).toISOString(),
      attended: finalStatus === 'completed' ? faker.datatype.boolean() : undefined,
      attendedAt: finalStatus === 'completed' && faker.datatype.boolean() ? startsAt.toISOString() : undefined,
    })) : [],
  }
}

export const events: Event[] = [
  ...Array.from({ length: 8 }, () => createEvent('upcoming')),
  ...Array.from({ length: 2 }, () => createEvent('ongoing')),
  ...Array.from({ length: 15 }, () => createEvent('completed')),
  ...Array.from({ length: 3 }, () => createEvent('cancelled')),
]
