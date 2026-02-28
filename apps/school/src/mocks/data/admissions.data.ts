import { faker } from '@faker-js/faker'
import type {
  Application,
  ApplicationDocument,
  ApplicationNote,
  ApplicationStatus,
  DocumentStatus,
  DocumentType,
  StatusChange,
  WaitlistEntry,
  ClassCapacity,
  EntranceExamSchedule,
  ExamResult,
  CommunicationLog,
  CommunicationTemplate,
  AdmissionPayment,
  AdmissionAnalytics,
} from '@/features/admissions/types/admission.types'

const CLASSES = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
]

const INDIAN_STATES = [
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Delhi',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
  'West Bengal',
  'Kerala',
  'Telangana',
]

const SCHOOLS = [
  'Delhi Public School',
  'Kendriya Vidyalaya',
  'Ryan International School',
  'DAV Public School',
  'Army Public School',
  'St. Xavier\'s School',
  'Modern School',
  'Bal Bharati Public School',
  'Springdales School',
  'Sanskriti School',
]

const STAFF_NAMES = [
  'Mrs. Sharma',
  'Mr. Gupta',
  'Ms. Patel',
  'Mr. Singh',
  'Mrs. Reddy',
  'Mr. Kumar',
  'Ms. Verma',
  'Mr. Joshi',
]

const DOCUMENT_TYPES: DocumentType[] = [
  'birth_certificate',
  'previous_marksheet',
  'transfer_certificate',
  'address_proof',
  'photo',
  'parent_id',
]

// Status flow probabilities based on realistic admission process
const STATUS_WEIGHTS: { value: ApplicationStatus; weight: number }[] = [
  { value: 'applied', weight: 14 },
  { value: 'under_review', weight: 11 },
  { value: 'document_verification', weight: 9 },
  { value: 'entrance_exam', weight: 7 },
  { value: 'interview', weight: 9 },
  { value: 'approved', weight: 16 },
  { value: 'waitlisted', weight: 6 },
  { value: 'rejected', weight: 8 },
  { value: 'enrolled', weight: 14 },
  { value: 'withdrawn', weight: 4 },
]

const APPLICATION_SOURCES = ['website', 'referral', 'advertisement', 'walk_in', 'social_media', 'other'] as const

function generateApplicationNumber(year: number, index: number): string {
  return `APP${year}${String(index).padStart(4, '0')}`
}

function generateDocuments(status: ApplicationStatus): ApplicationDocument[] {
  const hasDocuments = ['document_verification', 'entrance_exam', 'interview', 'approved', 'enrolled'].includes(status)

  if (!hasDocuments && faker.datatype.boolean(0.3)) {
    return []
  }

  const docCount = faker.number.int({ min: 2, max: 6 })
  const selectedTypes = faker.helpers.arrayElements(DOCUMENT_TYPES, docCount)

  return selectedTypes.map((type) => {
    const uploadedAt = faker.date.recent({ days: 30 }).toISOString()
    const isVerified = ['approved', 'enrolled'].includes(status) || faker.datatype.boolean(0.6)
    const docStatus: DocumentStatus = isVerified
      ? 'verified'
      : faker.datatype.boolean(0.1) ? 'rejected' : 'pending'

    return {
      id: faker.string.uuid(),
      type,
      name: `${type.replace(/_/g, ' ')}_${faker.string.alphanumeric(8)}.pdf`,
      url: `/documents/${faker.string.uuid()}.pdf`,
      uploadedAt,
      status: docStatus,
      verifiedBy: docStatus === 'verified' ? faker.helpers.arrayElement(STAFF_NAMES) : undefined,
      verifiedAt: docStatus === 'verified' ? faker.date.recent({ days: 7 }).toISOString() : undefined,
      rejectionReason: docStatus === 'rejected' ? 'Document not clear. Please upload a better quality scan.' : undefined,
    }
  })
}

function generateStatusHistory(currentStatus: ApplicationStatus, appliedDate: Date): StatusChange[] {
  const statusFlow: ApplicationStatus[] = [
    'applied',
    'under_review',
    'document_verification',
    'entrance_exam',
    'interview',
    'approved',
    'enrolled',
  ]

  const currentIndex = statusFlow.indexOf(currentStatus)
  const history: StatusChange[] = []

  // Start with applied
  let currentDate = new Date(appliedDate)
  history.push({
    id: faker.string.uuid(),
    fromStatus: null,
    toStatus: 'applied',
    changedAt: currentDate.toISOString(),
    changedBy: 'System',
    note: 'Application submitted online',
  })

  // Handle special cases
  if (currentStatus === 'rejected') {
    const rejectAt = faker.number.int({ min: 1, max: 3 })
    for (let i = 1; i <= rejectAt && i < statusFlow.length; i++) {
      currentDate = new Date(currentDate.getTime() + faker.number.int({ min: 1, max: 5 }) * 24 * 60 * 60 * 1000)
      history.push({
        id: faker.string.uuid(),
        fromStatus: statusFlow[i - 1],
        toStatus: statusFlow[i],
        changedAt: currentDate.toISOString(),
        changedBy: faker.helpers.arrayElement(STAFF_NAMES),
      })
    }
    currentDate = new Date(currentDate.getTime() + faker.number.int({ min: 1, max: 3 }) * 24 * 60 * 60 * 1000)
    history.push({
      id: faker.string.uuid(),
      fromStatus: history[history.length - 1].toStatus,
      toStatus: 'rejected',
      changedAt: currentDate.toISOString(),
      changedBy: faker.helpers.arrayElement(STAFF_NAMES),
      note: faker.helpers.arrayElement([
        'Does not meet admission criteria',
        'Failed entrance examination',
        'Documents verification failed',
        'Incomplete application',
      ]),
    })
    return history
  }

  if (currentStatus === 'withdrawn') {
    const withdrawAt = faker.number.int({ min: 1, max: 4 })
    for (let i = 1; i <= withdrawAt && i < statusFlow.length; i++) {
      currentDate = new Date(currentDate.getTime() + faker.number.int({ min: 1, max: 5 }) * 24 * 60 * 60 * 1000)
      history.push({
        id: faker.string.uuid(),
        fromStatus: statusFlow[i - 1],
        toStatus: statusFlow[i],
        changedAt: currentDate.toISOString(),
        changedBy: faker.helpers.arrayElement(STAFF_NAMES),
      })
    }
    currentDate = new Date(currentDate.getTime() + faker.number.int({ min: 1, max: 3 }) * 24 * 60 * 60 * 1000)
    history.push({
      id: faker.string.uuid(),
      fromStatus: history[history.length - 1].toStatus,
      toStatus: 'withdrawn',
      changedAt: currentDate.toISOString(),
      changedBy: 'Applicant',
      note: 'Application withdrawn by parent/guardian',
    })
    return history
  }

  // Normal flow
  for (let i = 1; i <= currentIndex; i++) {
    currentDate = new Date(currentDate.getTime() + faker.number.int({ min: 1, max: 5 }) * 24 * 60 * 60 * 1000)
    history.push({
      id: faker.string.uuid(),
      fromStatus: statusFlow[i - 1],
      toStatus: statusFlow[i],
      changedAt: currentDate.toISOString(),
      changedBy: faker.helpers.arrayElement(STAFF_NAMES),
    })
  }

  return history
}

function generateNotes(status: ApplicationStatus): ApplicationNote[] {
  if (faker.datatype.boolean(0.4)) {
    return []
  }

  const noteCount = faker.number.int({ min: 1, max: 3 })
  const notes: ApplicationNote[] = []

  const sampleNotes = [
    'Parents seem very keen on academic focus',
    'Sibling already studying in Class 5',
    'Father is a doctor, mother is a teacher',
    'Requested for morning batch if possible',
    'Good performance in previous school',
    'Referred by current parent Mr. Sharma',
    'Needs to submit TC from previous school',
    'Interview scheduled with principal',
    'Excellent communication skills observed',
    'Sports achievements noted - district level',
  ]

  for (let i = 0; i < noteCount; i++) {
    const staffName = faker.helpers.arrayElement(STAFF_NAMES)
    notes.push({
      id: faker.string.uuid(),
      content: faker.helpers.arrayElement(sampleNotes),
      createdAt: faker.date.recent({ days: 20 }).toISOString(),
      createdBy: faker.string.uuid(),
      createdByName: staffName,
    })
  }

  return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function createApplication(index: number): Application {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const gender = faker.helpers.arrayElement(['male', 'female']) as 'male' | 'female'
  const appliedDate = faker.date.recent({ days: 60 })
  const status = faker.helpers.weightedArrayElement(STATUS_WEIGHTS) as ApplicationStatus

  const applyingForClass = faker.helpers.arrayElement(CLASSES)
  const previousClassIndex = CLASSES.indexOf(applyingForClass) - 1
  const previousClass = previousClassIndex >= 0 ? CLASSES[previousClassIndex] : 'Pre-School'

  const hasEntranceExam = ['entrance_exam', 'interview', 'approved', 'waitlisted', 'enrolled'].includes(status)
  const hasInterview = ['interview', 'approved', 'waitlisted', 'enrolled'].includes(status)

  return {
    id: faker.string.uuid(),
    applicationNumber: generateApplicationNumber(appliedDate.getFullYear(), index + 1),
    status,

    // Student Info
    studentName: `${firstName} ${lastName}`,
    dateOfBirth: faker.date.birthdate({ min: 3, max: 17, mode: 'age' }).toISOString(),
    gender,
    photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}&backgroundColor=b6e3f4,c0aede,d1d4f9`,

    // Contact Info
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: `+91 ${faker.string.numeric(10)}`,
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.helpers.arrayElement(INDIAN_STATES),
      pincode: faker.string.numeric(6),
    },

    // Academic Info
    applyingForClass,
    previousSchool: faker.helpers.arrayElement(SCHOOLS),
    previousClass,
    previousMarks: faker.number.int({ min: 45, max: 98 }),

    // Parent Info
    fatherName: faker.person.fullName({ sex: 'male' }),
    motherName: faker.person.fullName({ sex: 'female' }),
    guardianPhone: `+91 ${faker.string.numeric(10)}`,
    guardianEmail: faker.internet.email(),
    guardianOccupation: faker.person.jobTitle(),

    // Application Details
    appliedDate: appliedDate.toISOString(),
    entranceExamDate: hasEntranceExam ? faker.date.recent({ days: 20 }).toISOString() : undefined,
    entranceExamScore: hasEntranceExam ? faker.number.int({ min: 40, max: 100 }) : undefined,
    interviewDate: hasInterview ? faker.date.recent({ days: 10 }).toISOString() : undefined,
    interviewScore: hasInterview ? faker.number.int({ min: 1, max: 10 }) : undefined,
    interviewNotes: hasInterview ? faker.helpers.arrayElement([
      'Good communication skills. Parents supportive.',
      'Student is enthusiastic about learning.',
      'Strong academic background.',
      'Well-mannered and confident.',
    ]) : undefined,

    // Documents
    documents: generateDocuments(status),

    // Timeline
    statusHistory: generateStatusHistory(status, appliedDate),
    notes: generateNotes(status),

    // Source tracking
    source: faker.helpers.arrayElement(APPLICATION_SOURCES),
    referredBy: faker.datatype.boolean(0.3) ? faker.person.fullName() : undefined,

    // Payment tracking
    admissionFeeStatus: ['approved', 'enrolled'].includes(status)
      ? (status === 'enrolled' ? 'paid' : faker.helpers.arrayElement(['pending', 'paid']))
      : undefined,
    admissionFeeAmount: ['approved', 'enrolled'].includes(status) ? faker.helpers.arrayElement([15000, 20000, 25000, 30000, 35000]) : undefined,
    admissionFeePaid: status === 'enrolled' ? faker.helpers.arrayElement([15000, 20000, 25000, 30000, 35000]) : 0,

    // Waitlist
    waitlistPosition: status === 'waitlisted' ? faker.number.int({ min: 1, max: 15 }) : undefined,

    // Metadata
    createdAt: appliedDate.toISOString(),
    updatedAt: faker.date.recent({ days: 5 }).toISOString(),
  }
}

// Generate 55 applications
export const applications: Application[] = Array.from({ length: 55 }, (_, i) => createApplication(i))
  .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())

// Helper to get stats
export const applicationStats = {
  total: applications.length,
  byStatus: applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {} as Record<ApplicationStatus, number>),
  byClass: CLASSES.reduce((acc, cls) => {
    acc[cls] = applications.filter((a) => a.applyingForClass === cls).length
    return acc
  }, {} as Record<string, number>),
  thisMonth: applications.filter((a) => {
    const appliedDate = new Date(a.appliedDate)
    const now = new Date()
    return appliedDate.getMonth() === now.getMonth() && appliedDate.getFullYear() === now.getFullYear()
  }).length,
  pendingReview: applications.filter((a) => ['applied', 'under_review'].includes(a.status)).length,
}

// Helper function to find application by ID
export function findApplicationById(id: string): Application | undefined {
  return applications.find((a) => a.id === id)
}

// ==================== WAITLIST DATA ====================

export const classCapacities: ClassCapacity[] = CLASSES.map((cls) => {
  const sections = ['A', 'B', 'C']
  return sections.map((section) => {
    const totalSeats = faker.helpers.arrayElement([30, 35, 40, 45])
    const filled = faker.number.int({ min: Math.floor(totalSeats * 0.7), max: totalSeats })
    const waitlistApps = applications.filter(
      (a) => a.applyingForClass === cls && a.status === 'waitlisted'
    )
    return {
      class: cls,
      section,
      totalSeats,
      filledSeats: filled,
      availableSeats: Math.max(0, totalSeats - filled),
      waitlistCount: Math.floor(waitlistApps.length / 3),
    }
  })
}).flat()

export const waitlistEntries: WaitlistEntry[] = applications
  .filter((a) => a.status === 'waitlisted')
  .map((a, i) => ({
    id: faker.string.uuid(),
    applicationId: a.id,
    studentName: a.studentName,
    applyingForClass: a.applyingForClass,
    position: i + 1,
    addedAt: faker.date.recent({ days: 20 }).toISOString(),
    previousMarks: a.previousMarks,
    entranceExamScore: a.entranceExamScore,
    status: 'waiting' as const,
  }))

// ==================== ENTRANCE EXAM DATA ====================

const EXAM_VENUES = ['Hall A - Ground Floor', 'Hall B - First Floor', 'Lab 1 - Science Block', 'Auditorium']
const EXAM_SUBJECTS_MAP: Record<string, string[]> = {
  primary: ['English', 'Mathematics'],
  middle: ['English', 'Mathematics', 'Science'],
  senior: ['English', 'Mathematics', 'Science', 'Social Studies'],
}

export const examSchedules: EntranceExamSchedule[] = CLASSES.slice(3).map((cls, i) => {
  const isLower = i < 5
  const subjects = isLower ? EXAM_SUBJECTS_MAP.primary : (i < 8 ? EXAM_SUBJECTS_MAP.middle : EXAM_SUBJECTS_MAP.senior)
  const registered = faker.number.int({ min: 8, max: 25 })
  const statusVal = faker.helpers.weightedArrayElement([
    { value: 'upcoming' as const, weight: 3 },
    { value: 'completed' as const, weight: 5 },
    { value: 'cancelled' as const, weight: 1 },
  ])

  return {
    id: faker.string.uuid(),
    class: cls,
    examDate: statusVal === 'upcoming'
      ? faker.date.soon({ days: 30 }).toISOString()
      : faker.date.recent({ days: 30 }).toISOString(),
    examTime: faker.helpers.arrayElement(['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM']),
    venue: faker.helpers.arrayElement(EXAM_VENUES),
    duration: isLower ? 60 : (i < 8 ? 90 : 120),
    totalMarks: isLower ? 50 : 100,
    passingMarks: isLower ? 20 : 40,
    subjects,
    registeredCount: registered,
    completedCount: statusVal === 'completed' ? registered - faker.number.int({ min: 0, max: 3 }) : 0,
    status: statusVal,
  }
})

export const examResults: ExamResult[] = applications
  .filter((a) => a.entranceExamScore !== undefined)
  .map((a) => {
    const schedule = examSchedules.find((e) => e.class === a.applyingForClass)
    const totalMarks = schedule?.totalMarks ?? 100
    const passingMarks = schedule?.passingMarks ?? 40
    const subjects = schedule?.subjects ?? ['English', 'Mathematics']
    const marksObtained = a.entranceExamScore!
    const percentage = (marksObtained / totalMarks) * 100

    return {
      applicationId: a.id,
      studentName: a.studentName,
      examScheduleId: schedule?.id ?? '',
      marksObtained,
      totalMarks,
      percentage,
      grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'D',
      subjectWiseMarks: subjects.map((subject) => ({
        subject,
        marks: faker.number.int({ min: Math.floor(marksObtained / subjects.length * 0.7), max: Math.ceil(marksObtained / subjects.length * 1.3) }),
        total: Math.floor(totalMarks / subjects.length),
      })),
      result: marksObtained >= passingMarks ? 'pass' as const : 'fail' as const,
      rank: faker.number.int({ min: 1, max: 25 }),
    }
  })

// ==================== COMMUNICATION DATA ====================

const COMM_SUBJECTS: Record<string, string> = {
  application_received: 'Application Received - {{applicationNumber}}',
  status_change: 'Application Status Update - {{applicationNumber}}',
  exam_scheduled: 'Entrance Exam Scheduled - {{class}}',
  interview_scheduled: 'Interview Scheduled - {{applicationNumber}}',
  approved: 'Congratulations! Application Approved',
  rejected: 'Application Update - {{applicationNumber}}',
  waitlisted: 'Waitlist Notification - {{applicationNumber}}',
  payment_due: 'Admission Fee Payment Reminder',
  custom: 'Important Update from School',
}

export const communicationTemplates: CommunicationTemplate[] = [
  {
    id: faker.string.uuid(),
    name: 'Application Received',
    trigger: 'application_received',
    type: 'email',
    subject: 'Application Received - {{applicationNumber}}',
    body: 'Dear {{parentName}},\n\nThank you for submitting the admission application for {{studentName}} for {{class}}. Your application number is {{applicationNumber}}.\n\nWe will review your application and get back to you shortly.\n\nRegards,\nAdmissions Team',
    isActive: true,
    variables: ['parentName', 'studentName', 'class', 'applicationNumber'],
  },
  {
    id: faker.string.uuid(),
    name: 'Exam Scheduled SMS',
    trigger: 'exam_scheduled',
    type: 'sms',
    subject: '',
    body: 'Dear Parent, entrance exam for {{studentName}} is scheduled on {{examDate}} at {{venue}}. App #{{applicationNumber}}.',
    isActive: true,
    variables: ['studentName', 'examDate', 'venue', 'applicationNumber'],
  },
  {
    id: faker.string.uuid(),
    name: 'Application Approved',
    trigger: 'approved',
    type: 'email',
    subject: 'Congratulations! Application Approved',
    body: 'Dear {{parentName}},\n\nWe are pleased to inform you that the admission application for {{studentName}} has been approved for {{class}}.\n\nPlease complete the admission fee payment of Rs. {{feeAmount}} by {{dueDate}} to confirm the enrollment.\n\nPayment can be made online through the parent portal.\n\nRegards,\nAdmissions Team',
    isActive: true,
    variables: ['parentName', 'studentName', 'class', 'feeAmount', 'dueDate'],
  },
  {
    id: faker.string.uuid(),
    name: 'Application Rejected',
    trigger: 'rejected',
    type: 'email',
    subject: 'Application Update',
    body: 'Dear {{parentName}},\n\nWe regret to inform you that the admission application for {{studentName}} for {{class}} could not be accepted at this time.\n\nWe wish {{studentName}} all the best for the future.\n\nRegards,\nAdmissions Team',
    isActive: true,
    variables: ['parentName', 'studentName', 'class'],
  },
  {
    id: faker.string.uuid(),
    name: 'Waitlist Notification',
    trigger: 'waitlisted',
    type: 'email',
    subject: 'Waitlist Notification',
    body: 'Dear {{parentName}},\n\n{{studentName}} has been placed on the waitlist (Position #{{position}}) for {{class}}. We will notify you when a seat becomes available.\n\nRegards,\nAdmissions Team',
    isActive: true,
    variables: ['parentName', 'studentName', 'class', 'position'],
  },
  {
    id: faker.string.uuid(),
    name: 'Payment Reminder SMS',
    trigger: 'payment_due',
    type: 'sms',
    subject: '',
    body: 'Reminder: Admission fee of Rs. {{feeAmount}} for {{studentName}} is due by {{dueDate}}. Pay online at the parent portal. App #{{applicationNumber}}.',
    isActive: true,
    variables: ['studentName', 'feeAmount', 'dueDate', 'applicationNumber'],
  },
]

export const communicationLogs: CommunicationLog[] = applications
  .slice(0, 30)
  .flatMap((app) => {
    const logs: CommunicationLog[] = []
    // Always send application received
    logs.push({
      id: faker.string.uuid(),
      applicationId: app.id,
      studentName: app.studentName,
      type: 'email',
      trigger: 'application_received',
      recipient: app.guardianEmail,
      subject: `Application Received - ${app.applicationNumber}`,
      message: `Application for ${app.studentName} has been received.`,
      sentAt: app.appliedDate,
      status: 'delivered',
      sentBy: 'System',
    })

    if (['approved', 'enrolled'].includes(app.status)) {
      logs.push({
        id: faker.string.uuid(),
        applicationId: app.id,
        studentName: app.studentName,
        type: 'email',
        trigger: 'approved',
        recipient: app.guardianEmail,
        subject: 'Congratulations! Application Approved',
        message: `Application for ${app.studentName} has been approved.`,
        sentAt: faker.date.recent({ days: 15 }).toISOString(),
        status: 'delivered',
        sentBy: 'System',
      })
    }

    if (app.entranceExamDate) {
      logs.push({
        id: faker.string.uuid(),
        applicationId: app.id,
        studentName: app.studentName,
        type: 'sms',
        trigger: 'exam_scheduled',
        recipient: app.guardianPhone,
        subject: '',
        message: `Entrance exam scheduled on ${new Date(app.entranceExamDate).toLocaleDateString()}.`,
        sentAt: faker.date.recent({ days: 25 }).toISOString(),
        status: faker.helpers.arrayElement(['delivered', 'sent']),
        sentBy: 'System',
      })
    }

    return logs
  })
  .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

// ==================== PAYMENT DATA ====================

export const admissionPayments: AdmissionPayment[] = applications
  .filter((a) => ['approved', 'enrolled'].includes(a.status))
  .map((app) => {
    const totalAmount = app.admissionFeeAmount ?? 25000
    const isPaid = app.status === 'enrolled'
    const feeBreakdown = [
      { feeType: 'Registration Fee', amount: 2000, paid: true },
      { feeType: 'Admission Fee', amount: totalAmount - 7000, paid: isPaid },
      { feeType: 'Caution Deposit', amount: 5000, paid: isPaid },
    ]

    return {
      id: faker.string.uuid(),
      applicationId: app.id,
      studentName: app.studentName,
      class: app.applyingForClass,
      totalAmount,
      paidAmount: isPaid ? totalAmount : 2000,
      status: isPaid ? 'paid' as const : 'partial' as const,
      paymentDate: isPaid ? faker.date.recent({ days: 10 }).toISOString() : undefined,
      paymentMethod: isPaid ? faker.helpers.arrayElement(['online', 'cheque', 'cash', 'upi']) : undefined,
      transactionId: isPaid ? `TXN${faker.string.alphanumeric(10).toUpperCase()}` : undefined,
      receiptNumber: isPaid ? `REC-${faker.string.numeric(6)}` : undefined,
      feeBreakdown,
      generatedAt: faker.date.recent({ days: 20 }).toISOString(),
      dueDate: faker.date.soon({ days: 15 }).toISOString(),
    }
  })

// ==================== ANALYTICS DATA ====================

export function generateAnalytics(): AdmissionAnalytics {
  const total = applications.length
  const byStatus = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const approved = byStatus['approved'] || 0
  const enrolled = byStatus['enrolled'] || 0
  const rejected = byStatus['rejected'] || 0
  const withdrawn = byStatus['withdrawn'] || 0

  return {
    conversionFunnel: [
      { stage: 'Applied', count: total, percentage: 100 },
      { stage: 'Under Review', count: total - (byStatus['applied'] || 0), percentage: Math.round(((total - (byStatus['applied'] || 0)) / total) * 100) },
      { stage: 'Document Verified', count: total - (byStatus['applied'] || 0) - (byStatus['under_review'] || 0), percentage: Math.round(((total - (byStatus['applied'] || 0) - (byStatus['under_review'] || 0)) / total) * 100) },
      { stage: 'Exam Completed', count: (byStatus['interview'] || 0) + approved + enrolled, percentage: Math.round((((byStatus['interview'] || 0) + approved + enrolled) / total) * 100) },
      { stage: 'Approved', count: approved + enrolled, percentage: Math.round(((approved + enrolled) / total) * 100) },
      { stage: 'Enrolled', count: enrolled, percentage: Math.round((enrolled / total) * 100) },
    ],
    monthlyTrend: Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      return {
        month: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
        applications: faker.number.int({ min: 5, max: 20 }),
        approvals: faker.number.int({ min: 2, max: 12 }),
        rejections: faker.number.int({ min: 0, max: 5 }),
      }
    }),
    classDistribution: CLASSES.filter((cls) => applications.some((a) => a.applyingForClass === cls)).map((cls) => {
      const classApps = applications.filter((a) => a.applyingForClass === cls)
      return {
        class: cls,
        applications: classApps.length,
        approved: classApps.filter((a) => ['approved', 'enrolled'].includes(a.status)).length,
        enrolled: classApps.filter((a) => a.status === 'enrolled').length,
      }
    }),
    sourceDistribution: APPLICATION_SOURCES.map((source) => {
      const count = applications.filter((a) => a.source === source).length
      return {
        source: source.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        count,
        percentage: Math.round((count / total) * 100),
      }
    }),
    avgProcessingDays: faker.number.int({ min: 8, max: 18 }),
    approvalRate: Math.round(((approved + enrolled) / total) * 100),
    rejectionRate: Math.round((rejected / total) * 100),
    withdrawalRate: Math.round((withdrawn / total) * 100),
    avgExamScore: Math.round(applications.filter((a) => a.entranceExamScore).reduce((sum, a) => sum + (a.entranceExamScore || 0), 0) / Math.max(1, applications.filter((a) => a.entranceExamScore).length)),
    topPerformers: applications
      .filter((a) => a.entranceExamScore && a.entranceExamScore >= 80)
      .sort((a, b) => (b.entranceExamScore || 0) - (a.entranceExamScore || 0))
      .slice(0, 5)
      .map((a) => ({
        name: a.studentName,
        class: a.applyingForClass,
        score: a.entranceExamScore!,
      })),
  }
}

// Helper function to filter applications
export function filterApplications(filters: {
  search?: string
  status?: ApplicationStatus | 'all'
  class?: string
  dateFrom?: string
  dateTo?: string
}): Application[] {
  let filtered = [...applications]

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (a) =>
        a.studentName.toLowerCase().includes(searchLower) ||
        a.email.toLowerCase().includes(searchLower) ||
        a.applicationNumber.toLowerCase().includes(searchLower) ||
        a.fatherName.toLowerCase().includes(searchLower) ||
        a.motherName.toLowerCase().includes(searchLower)
    )
  }

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((a) => a.status === filters.status)
  }

  if (filters.class) {
    filtered = filtered.filter((a) => a.applyingForClass === filters.class)
  }

  if (filters.dateFrom) {
    filtered = filtered.filter((a) => new Date(a.appliedDate) >= new Date(filters.dateFrom!))
  }

  if (filters.dateTo) {
    filtered = filtered.filter((a) => new Date(a.appliedDate) <= new Date(filters.dateTo!))
  }

  return filtered
}
