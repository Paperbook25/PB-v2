import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import type {
  CreateApplicationInput, UpdateApplicationInput, ListApplicationsInput,
  ChangeStatusInput, AddDocumentInput, UpdateDocumentInput, AddNoteInput,
  UpdateInterviewInput, UpdateEntranceExamInput, CreateExamScheduleInput,
  RecordExamScoreInput, SendCommunicationInput, RecordPaymentInput,
} from '../validators/admission.validators.js'

// ==================== Enum Mapping ====================

const statusToDb: Record<string, string> = {
  applied: 'adm_applied', under_review: 'adm_under_review',
  document_verification: 'adm_document_verification', entrance_exam: 'adm_entrance_exam',
  interview: 'adm_interview', approved: 'adm_approved', waitlisted: 'adm_waitlisted',
  rejected: 'adm_rejected', enrolled: 'adm_enrolled', withdrawn: 'adm_withdrawn',
}
const statusFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(statusToDb).map(([k, v]) => [v, k])
)

const docTypeToDb: Record<string, string> = {
  birth_certificate: 'adoc_birth_certificate', previous_marksheet: 'adoc_previous_marksheet',
  transfer_certificate: 'adoc_transfer_certificate', address_proof: 'adoc_address_proof',
  photo: 'adoc_photo', parent_id: 'adoc_parent_id',
  medical_certificate: 'adoc_medical_certificate', other: 'adoc_other',
}
const docTypeFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(docTypeToDb).map(([k, v]) => [v, k])
)

const docStatusToDb: Record<string, string> = {
  pending: 'ads_pending', verified: 'ads_verified', rejected: 'ads_rejected',
}
const docStatusFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(docStatusToDb).map(([k, v]) => [v, k])
)

const sourceToDb: Record<string, string> = {
  website: 'asrc_website', referral: 'asrc_referral', advertisement: 'asrc_advertisement',
  walk_in: 'asrc_walk_in', social_media: 'asrc_social_media', other: 'asrc_other',
}
const sourceFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(sourceToDb).map(([k, v]) => [v, k])
)

const feeStatusToDb: Record<string, string> = {
  pending: 'afs_pending', partial: 'afs_partial', paid: 'afs_paid', waived: 'afs_waived',
}
const feeStatusFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(feeStatusToDb).map(([k, v]) => [v, k])
)

const commTypeToDb: Record<string, string> = {
  email: 'comm_email', sms: 'comm_sms', whatsapp: 'comm_whatsapp',
}
const commTypeFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(commTypeToDb).map(([k, v]) => [v, k])
)

const commTriggerToDb: Record<string, string> = {
  application_received: 'ct_application_received', status_change: 'ct_status_change',
  exam_scheduled: 'ct_exam_scheduled', interview_scheduled: 'ct_interview_scheduled',
  approved: 'ct_approved', rejected: 'ct_rejected', waitlisted: 'ct_waitlisted',
  payment_due: 'ct_payment_due', custom: 'ct_custom',
}
const commTriggerFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(commTriggerToDb).map(([k, v]) => [v, k])
)

const commDeliveryFromDb: Record<string, string> = {
  cds_sent: 'sent', cds_delivered: 'delivered', cds_failed: 'failed', cds_pending: 'pending',
}

const examScheduleStatusFromDb: Record<string, string> = {
  aes_upcoming: 'upcoming', aes_in_progress: 'in_progress',
  aes_completed: 'completed', aes_cancelled: 'cancelled',
}

// ==================== Helpers ====================

function formatDocument(d: any) {
  return {
    id: d.id,
    type: docTypeFromDb[d.type] || d.type,
    name: d.name,
    url: d.url,
    uploadedAt: d.createdAt,
    status: docStatusFromDb[d.status] || d.status,
    verifiedBy: d.verifiedBy,
    verifiedAt: d.verifiedAt,
    rejectionReason: d.rejectionReason,
  }
}

function formatStatusHistory(h: any) {
  return {
    id: h.id,
    fromStatus: h.fromStatus ? (statusFromDb[h.fromStatus] || h.fromStatus) : null,
    toStatus: statusFromDb[h.toStatus] || h.toStatus,
    changedAt: h.changedAt,
    changedBy: h.changedBy,
    note: h.note,
  }
}

function formatNote(n: any) {
  return {
    id: n.id,
    content: n.content,
    createdAt: n.createdAt,
    createdBy: n.createdBy,
    createdByName: n.createdByName,
  }
}

function formatApplication(app: any) {
  return {
    id: app.id,
    applicationNumber: app.applicationNumber,
    status: statusFromDb[app.status] || app.status,
    studentName: app.studentName,
    dateOfBirth: app.dateOfBirth,
    gender: app.gender,
    photoUrl: app.photoUrl,
    email: app.email,
    phone: app.phone,
    address: {
      street: app.addressStreet || '',
      city: app.addressCity || '',
      state: app.addressState || '',
      pincode: app.addressPincode || '',
    },
    applyingForClass: app.applyingForClass,
    applyingForSection: app.applyingForSection,
    previousSchool: app.previousSchool,
    previousClass: app.previousClass,
    previousMarks: app.previousMarks,
    fatherName: app.fatherName,
    motherName: app.motherName,
    guardianPhone: app.guardianPhone,
    guardianEmail: app.guardianEmail,
    guardianOccupation: app.guardianOccupation,
    appliedDate: app.createdAt,
    entranceExamDate: app.entranceExamDate,
    entranceExamScore: app.entranceExamScore,
    interviewDate: app.interviewDate,
    interviewScore: app.interviewScore,
    interviewNotes: app.interviewNotes,
    documents: (app.documents || []).map(formatDocument),
    statusHistory: (app.statusHistory || []).map(formatStatusHistory),
    notes: (app.notes || []).map(formatNote),
    enrolledStudentId: app.enrolledStudentId,
    source: app.source ? (sourceFromDb[app.source] || app.source) : null,
    referredBy: app.referredBy,
    admissionFeeStatus: app.admissionFeeStatus ? (feeStatusFromDb[app.admissionFeeStatus] || app.admissionFeeStatus) : null,
    admissionFeeAmount: app.admissionFeeAmount ? Number(app.admissionFeeAmount) : null,
    admissionFeePaid: app.admissionFeePaid ? Number(app.admissionFeePaid) : null,
    waitlistPosition: app.waitlistPosition,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  }
}

const applicationInclude = {
  documents: true,
  statusHistory: { orderBy: { changedAt: 'desc' as const } },
  notes: { orderBy: { createdAt: 'desc' as const } },
}

async function generateApplicationNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `APP-${year}-`
  const last = await prisma.admissionApplication.findFirst({
    where: { applicationNumber: { startsWith: prefix } },
    orderBy: { applicationNumber: 'desc' },
  })
  let seq = 1
  if (last) {
    const parts = last.applicationNumber.split('-')
    seq = parseInt(parts[2], 10) + 1
  }
  return `${prefix}${String(seq).padStart(4, '0')}`
}

// ==================== CRUD ====================

export async function listApplications(query: ListApplicationsInput) {
  const { page, limit, search, status, class: className, dateFrom, dateTo } = query
  const where: any = {}

  if (search) {
    where.OR = [
      { studentName: { contains: search } },
      { email: { contains: search } },
      { applicationNumber: { contains: search } },
      { phone: { contains: search } },
    ]
  }
  if (status && status !== 'all' && statusToDb[status]) {
    where.status = statusToDb[status]
  }
  if (className) {
    where.applyingForClass = className
  }
  if (dateFrom) {
    where.createdAt = { ...(where.createdAt || {}), gte: new Date(dateFrom) }
  }
  if (dateTo) {
    where.createdAt = { ...(where.createdAt || {}), lte: new Date(dateTo + 'T23:59:59.999Z') }
  }

  const [total, applications] = await Promise.all([
    prisma.admissionApplication.count({ where }),
    prisma.admissionApplication.findMany({
      where,
      include: applicationInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: applications.map(formatApplication),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getApplicationById(id: string) {
  const app = await prisma.admissionApplication.findUnique({
    where: { id },
    include: applicationInclude,
  })
  if (!app) throw AppError.notFound('Application not found')
  return formatApplication(app)
}

export async function createApplication(input: CreateApplicationInput) {
  const applicationNumber = await generateApplicationNumber()
  const app = await prisma.admissionApplication.create({
    data: {
      applicationNumber,
      studentName: input.studentName,
      dateOfBirth: new Date(input.dateOfBirth),
      gender: input.gender as any,
      email: input.email,
      phone: input.phone,
      addressStreet: input.address?.street,
      addressCity: input.address?.city,
      addressState: input.address?.state,
      addressPincode: input.address?.pincode,
      applyingForClass: input.applyingForClass,
      applyingForSection: input.applyingForSection,
      previousSchool: input.previousSchool,
      previousClass: input.previousClass,
      previousMarks: input.previousMarks,
      fatherName: input.fatherName,
      motherName: input.motherName,
      guardianPhone: input.guardianPhone,
      guardianEmail: input.guardianEmail,
      guardianOccupation: input.guardianOccupation,
      source: input.source ? (sourceToDb[input.source] as any) : undefined,
      referredBy: input.referredBy,
      photoUrl: input.photoUrl,
      statusHistory: {
        create: {
          fromStatus: null,
          toStatus: 'adm_applied',
          changedBy: 'system',
          note: 'Application submitted',
        },
      },
    },
    include: applicationInclude,
  })
  return formatApplication(app)
}

export async function updateApplication(id: string, input: UpdateApplicationInput) {
  const existing = await prisma.admissionApplication.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Application not found')

  const data: any = {}
  if (input.studentName !== undefined) data.studentName = input.studentName
  if (input.dateOfBirth !== undefined) data.dateOfBirth = new Date(input.dateOfBirth)
  if (input.gender !== undefined) data.gender = input.gender
  if (input.email !== undefined) data.email = input.email
  if (input.phone !== undefined) data.phone = input.phone
  if (input.address) {
    if (input.address.street !== undefined) data.addressStreet = input.address.street
    if (input.address.city !== undefined) data.addressCity = input.address.city
    if (input.address.state !== undefined) data.addressState = input.address.state
    if (input.address.pincode !== undefined) data.addressPincode = input.address.pincode
  }
  if (input.applyingForClass !== undefined) data.applyingForClass = input.applyingForClass
  if (input.applyingForSection !== undefined) data.applyingForSection = input.applyingForSection
  if (input.previousSchool !== undefined) data.previousSchool = input.previousSchool
  if (input.previousClass !== undefined) data.previousClass = input.previousClass
  if (input.previousMarks !== undefined) data.previousMarks = input.previousMarks
  if (input.fatherName !== undefined) data.fatherName = input.fatherName
  if (input.motherName !== undefined) data.motherName = input.motherName
  if (input.guardianPhone !== undefined) data.guardianPhone = input.guardianPhone
  if (input.guardianEmail !== undefined) data.guardianEmail = input.guardianEmail
  if (input.guardianOccupation !== undefined) data.guardianOccupation = input.guardianOccupation
  if (input.source && sourceToDb[input.source]) data.source = sourceToDb[input.source]
  if (input.referredBy !== undefined) data.referredBy = input.referredBy
  if (input.photoUrl !== undefined) data.photoUrl = input.photoUrl

  const app = await prisma.admissionApplication.update({
    where: { id },
    data,
    include: applicationInclude,
  })
  return formatApplication(app)
}

export async function changeStatus(id: string, input: ChangeStatusInput, changedBy: string) {
  const existing = await prisma.admissionApplication.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Application not found')

  const newStatus = statusToDb[input.status]
  if (!newStatus) throw AppError.badRequest('Invalid status')

  const app = await prisma.admissionApplication.update({
    where: { id },
    data: {
      status: newStatus as any,
      statusHistory: {
        create: {
          fromStatus: existing.status,
          toStatus: newStatus as any,
          changedBy,
          note: input.note,
        },
      },
    },
    include: applicationInclude,
  })
  return formatApplication(app)
}

export async function deleteApplication(id: string) {
  const existing = await prisma.admissionApplication.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Application not found')
  await prisma.admissionApplication.delete({ where: { id } })
  return { success: true }
}

// ==================== Documents ====================

export async function addDocument(appId: string, input: AddDocumentInput) {
  const app = await prisma.admissionApplication.findUnique({ where: { id: appId } })
  if (!app) throw AppError.notFound('Application not found')

  const doc = await prisma.admissionDocument.create({
    data: {
      applicationId: appId,
      type: docTypeToDb[input.type] as any,
      name: input.name,
      url: input.url,
    },
  })
  return formatDocument(doc)
}

export async function updateDocument(appId: string, docId: string, input: UpdateDocumentInput, verifiedBy?: string) {
  const doc = await prisma.admissionDocument.findFirst({
    where: { id: docId, applicationId: appId },
  })
  if (!doc) throw AppError.notFound('Document not found')

  const data: any = {
    status: docStatusToDb[input.status] as any,
  }
  if (input.status === 'verified') {
    data.verifiedBy = verifiedBy || 'system'
    data.verifiedAt = new Date()
  }
  if (input.status === 'rejected' && input.rejectionReason) {
    data.rejectionReason = input.rejectionReason
  }

  const updated = await prisma.admissionDocument.update({
    where: { id: docId },
    data,
  })
  return formatDocument(updated)
}

// ==================== Notes ====================

export async function addNote(appId: string, input: AddNoteInput, userId: string, userName: string) {
  const app = await prisma.admissionApplication.findUnique({ where: { id: appId } })
  if (!app) throw AppError.notFound('Application not found')

  const note = await prisma.admissionNote.create({
    data: {
      applicationId: appId,
      content: input.content,
      createdBy: userId,
      createdByName: userName,
    },
  })
  return formatNote(note)
}

// ==================== Interview & Entrance Exam ====================

export async function updateInterview(id: string, input: UpdateInterviewInput) {
  const existing = await prisma.admissionApplication.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Application not found')

  const app = await prisma.admissionApplication.update({
    where: { id },
    data: {
      interviewDate: new Date(input.interviewDate),
      interviewScore: input.interviewScore,
      interviewNotes: input.interviewNotes,
    },
    include: applicationInclude,
  })
  return formatApplication(app)
}

export async function updateEntranceExam(id: string, input: UpdateEntranceExamInput) {
  const existing = await prisma.admissionApplication.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Application not found')

  const app = await prisma.admissionApplication.update({
    where: { id },
    data: {
      entranceExamDate: new Date(input.entranceExamDate),
      entranceExamScore: input.entranceExamScore,
    },
    include: applicationInclude,
  })
  return formatApplication(app)
}

// ==================== Waitlist ====================

export async function getWaitlist(query: { class?: string }) {
  const where: any = { status: 'adm_waitlisted' }
  if (query.class) where.applyingForClass = query.class

  const apps = await prisma.admissionApplication.findMany({
    where,
    orderBy: { waitlistPosition: 'asc' },
  })

  return {
    data: apps.map((app, idx) => ({
      id: app.id,
      applicationId: app.id,
      studentName: app.studentName,
      applyingForClass: app.applyingForClass,
      position: app.waitlistPosition || idx + 1,
      addedAt: app.updatedAt,
      previousMarks: app.previousMarks,
      entranceExamScore: app.entranceExamScore,
      status: 'waiting',
      offeredAt: null,
      expiresAt: null,
    })),
  }
}

// ==================== Class Capacity ====================

export async function getClassCapacity() {
  const classes = await prisma.class.findMany({
    include: {
      sections: {
        include: {
          students: { where: { status: 'active' }, select: { id: true } },
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  const waitlistCounts = await prisma.admissionApplication.groupBy({
    by: ['applyingForClass'],
    where: { status: 'adm_waitlisted' },
    _count: { id: true },
  })
  const waitlistMap = Object.fromEntries(
    waitlistCounts.map(w => [w.applyingForClass, w._count.id])
  )

  const data: any[] = []
  for (const cls of classes) {
    for (const sec of cls.sections) {
      data.push({
        class: cls.name,
        section: sec.name,
        totalSeats: 40,
        filledSeats: sec.students.length,
        availableSeats: Math.max(0, 40 - sec.students.length),
        waitlistCount: waitlistMap[cls.name] || 0,
      })
    }
  }
  return { data }
}

// ==================== Exam Schedules ====================

export async function listExamSchedules() {
  const schedules = await prisma.admEntranceExamSchedule.findMany({
    orderBy: { examDate: 'desc' },
  })
  return {
    data: schedules.map(s => ({
      id: s.id,
      class: s.class,
      examDate: s.examDate,
      examTime: s.examTime,
      venue: s.venue,
      duration: s.duration,
      totalMarks: s.totalMarks,
      passingMarks: s.passingMarks,
      subjects: s.subjects,
      registeredCount: s.registeredCount,
      completedCount: s.completedCount,
      status: examScheduleStatusFromDb[s.status] || s.status,
    })),
  }
}

export async function createExamSchedule(input: CreateExamScheduleInput) {
  const schedule = await prisma.admEntranceExamSchedule.create({
    data: {
      class: input.class,
      examDate: new Date(input.examDate),
      examTime: input.examTime,
      venue: input.venue,
      duration: input.duration,
      totalMarks: input.totalMarks,
      passingMarks: input.passingMarks,
      subjects: input.subjects,
    },
  })
  return {
    id: schedule.id,
    class: schedule.class,
    examDate: schedule.examDate,
    examTime: schedule.examTime,
    venue: schedule.venue,
    duration: schedule.duration,
    totalMarks: schedule.totalMarks,
    passingMarks: schedule.passingMarks,
    subjects: schedule.subjects,
    registeredCount: schedule.registeredCount,
    completedCount: schedule.completedCount,
    status: examScheduleStatusFromDb[schedule.status] || schedule.status,
  }
}

// ==================== Exam Results ====================

export async function getExamResults(query: { class?: string; scheduleId?: string }) {
  const where: any = {
    entranceExamScore: { not: null },
  }
  if (query.class) where.applyingForClass = query.class

  const apps = await prisma.admissionApplication.findMany({
    where,
    orderBy: { entranceExamScore: 'desc' },
  })

  const data = apps.map((app, idx) => {
    const totalMarks = 100
    const percentage = ((app.entranceExamScore || 0) / totalMarks) * 100
    let grade = 'F'
    if (percentage >= 90) grade = 'A+'
    else if (percentage >= 80) grade = 'A'
    else if (percentage >= 70) grade = 'B'
    else if (percentage >= 60) grade = 'C'
    else if (percentage >= 50) grade = 'D'

    return {
      applicationId: app.id,
      studentName: app.studentName,
      examScheduleId: query.scheduleId || null,
      marksObtained: app.entranceExamScore || 0,
      totalMarks,
      percentage,
      grade,
      subjectWiseMarks: [],
      result: percentage >= 33 ? 'pass' : 'fail',
      rank: idx + 1,
    }
  })

  return { data }
}

export async function recordExamScore(id: string, input: RecordExamScoreInput) {
  const existing = await prisma.admissionApplication.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Application not found')

  const app = await prisma.admissionApplication.update({
    where: { id },
    data: { entranceExamScore: input.marksObtained },
    include: applicationInclude,
  })
  return formatApplication(app)
}

// ==================== Communications ====================

export async function listCommunications(query: { applicationId?: string; type?: string }) {
  const where: any = {}
  if (query.applicationId) where.applicationId = query.applicationId
  if (query.type && commTypeToDb[query.type]) where.type = commTypeToDb[query.type]

  const comms = await prisma.admissionCommunication.findMany({
    where,
    include: { application: { select: { studentName: true } } },
    orderBy: { sentAt: 'desc' },
  })

  return {
    data: comms.map(c => ({
      id: c.id,
      applicationId: c.applicationId,
      studentName: (c as any).application?.studentName || '',
      type: commTypeFromDb[c.type] || c.type,
      trigger: commTriggerFromDb[c.trigger] || c.trigger,
      recipient: c.recipient,
      subject: c.subject,
      message: c.message,
      sentAt: c.sentAt,
      status: commDeliveryFromDb[c.status] || c.status,
      sentBy: c.sentBy,
    })),
  }
}

export async function listCommunicationTemplates() {
  const templates = await prisma.admissionCommTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return {
    data: templates.map(t => ({
      id: t.id,
      name: t.name,
      trigger: commTriggerFromDb[t.trigger] || t.trigger,
      type: commTypeFromDb[t.type] || t.type,
      subject: t.subject,
      body: t.body,
      isActive: t.isActive,
      variables: t.variables,
    })),
  }
}

export async function sendCommunication(input: SendCommunicationInput, sentBy: string) {
  const apps = await prisma.admissionApplication.findMany({
    where: { id: { in: input.applicationIds } },
  })

  const records = await Promise.all(
    apps.map(app =>
      prisma.admissionCommunication.create({
        data: {
          applicationId: app.id,
          type: commTypeToDb[input.type] as any,
          trigger: 'ct_custom' as any,
          recipient: app.email,
          subject: input.subject,
          message: input.message,
          status: 'cds_sent',
          sentBy,
        },
        include: { application: { select: { studentName: true } } },
      })
    )
  )

  return {
    data: records.map(c => ({
      id: c.id,
      applicationId: c.applicationId,
      studentName: (c as any).application?.studentName || '',
      type: commTypeFromDb[c.type] || c.type,
      trigger: commTriggerFromDb[c.trigger] || c.trigger,
      recipient: c.recipient,
      subject: c.subject,
      message: c.message,
      sentAt: c.sentAt,
      status: commDeliveryFromDb[c.status] || c.status,
      sentBy: c.sentBy,
    })),
    count: records.length,
  }
}

// ==================== Payments ====================

export async function listPayments(query: { status?: string }) {
  const where: any = {}
  if (query.status && feeStatusToDb[query.status]) {
    where.status = feeStatusToDb[query.status]
  }

  const payments = await prisma.admissionPayment.findMany({
    where,
    include: { application: { select: { studentName: true, applyingForClass: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return {
    data: payments.map(p => ({
      id: p.id,
      applicationId: p.applicationId,
      studentName: (p as any).application?.studentName || '',
      class: (p as any).application?.applyingForClass || '',
      totalAmount: Number(p.totalAmount),
      paidAmount: Number(p.paidAmount),
      status: feeStatusFromDb[p.status] || p.status,
      paymentDate: p.paymentDate,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId,
      receiptNumber: p.receiptNumber,
      feeBreakdown: p.feeBreakdown,
      generatedAt: p.createdAt,
      dueDate: p.dueDate,
    })),
  }
}

export async function getPayment(appId: string) {
  const payment = await prisma.admissionPayment.findFirst({
    where: { applicationId: appId },
    include: { application: { select: { studentName: true, applyingForClass: true } } },
    orderBy: { createdAt: 'desc' },
  })
  if (!payment) throw AppError.notFound('Payment not found')

  return {
    id: payment.id,
    applicationId: payment.applicationId,
    studentName: (payment as any).application?.studentName || '',
    class: (payment as any).application?.applyingForClass || '',
    totalAmount: Number(payment.totalAmount),
    paidAmount: Number(payment.paidAmount),
    status: feeStatusFromDb[payment.status] || payment.status,
    paymentDate: payment.paymentDate,
    paymentMethod: payment.paymentMethod,
    transactionId: payment.transactionId,
    receiptNumber: payment.receiptNumber,
    feeBreakdown: payment.feeBreakdown,
    generatedAt: payment.createdAt,
    dueDate: payment.dueDate,
  }
}

export async function recordPayment(appId: string, input: RecordPaymentInput) {
  const app = await prisma.admissionApplication.findUnique({ where: { id: appId } })
  if (!app) throw AppError.notFound('Application not found')

  // Find or create payment record
  let payment = await prisma.admissionPayment.findFirst({
    where: { applicationId: appId },
    orderBy: { createdAt: 'desc' },
  })

  const receiptNumber = `ADMRCPT-${Date.now()}`

  if (payment) {
    const newPaid = Number(payment.paidAmount) + input.amount
    const newStatus = newPaid >= Number(payment.totalAmount) ? 'afs_paid' : 'afs_partial'
    payment = await prisma.admissionPayment.update({
      where: { id: payment.id },
      data: {
        paidAmount: newPaid,
        status: newStatus as any,
        paymentDate: new Date(),
        paymentMethod: input.paymentMethod,
        transactionId: input.transactionId,
        receiptNumber,
      },
      include: { application: { select: { studentName: true, applyingForClass: true } } },
    })
  } else {
    const totalAmount = Number(app.admissionFeeAmount) || input.amount
    const status = input.amount >= totalAmount ? 'afs_paid' : 'afs_partial'
    payment = await prisma.admissionPayment.create({
      data: {
        applicationId: appId,
        totalAmount,
        paidAmount: input.amount,
        status: status as any,
        paymentDate: new Date(),
        paymentMethod: input.paymentMethod,
        transactionId: input.transactionId,
        receiptNumber,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: { application: { select: { studentName: true, applyingForClass: true } } },
    })
  }

  // Update application fee status
  await prisma.admissionApplication.update({
    where: { id: appId },
    data: {
      admissionFeeStatus: payment.status,
      admissionFeePaid: payment.paidAmount,
    },
  })

  return {
    id: payment.id,
    applicationId: payment.applicationId,
    studentName: (payment as any).application?.studentName || '',
    class: (payment as any).application?.applyingForClass || '',
    totalAmount: Number(payment.totalAmount),
    paidAmount: Number(payment.paidAmount),
    status: feeStatusFromDb[payment.status] || payment.status,
    paymentDate: payment.paymentDate,
    paymentMethod: payment.paymentMethod,
    transactionId: payment.transactionId,
    receiptNumber: payment.receiptNumber,
    feeBreakdown: payment.feeBreakdown,
    generatedAt: payment.createdAt,
    dueDate: payment.dueDate,
  }
}

// ==================== Stats ====================

export async function getStats() {
  const [total, byStatus, byClass, thisMonth, pendingReview] = await Promise.all([
    prisma.admissionApplication.count(),
    prisma.admissionApplication.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.admissionApplication.groupBy({
      by: ['applyingForClass'],
      _count: { id: true },
    }),
    prisma.admissionApplication.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.admissionApplication.count({
      where: { status: 'adm_under_review' },
    }),
  ])

  return {
    data: {
      total,
      byStatus: Object.fromEntries(
        byStatus.map(s => [statusFromDb[s.status] || s.status, s._count.id])
      ),
      byClass: Object.fromEntries(
        byClass.map(c => [c.applyingForClass, c._count.id])
      ),
      thisMonth,
      pendingReview,
    },
  }
}

// ==================== Analytics ====================

export async function getAnalytics() {
  const apps = await prisma.admissionApplication.findMany({
    include: { statusHistory: true },
  })

  const stages = ['applied', 'under_review', 'document_verification', 'entrance_exam', 'interview', 'approved', 'enrolled']
  const conversionFunnel = stages.map(stage => {
    const count = apps.filter(a => {
      const idx = stages.indexOf(statusFromDb[a.status] || '')
      return idx >= stages.indexOf(stage)
    }).length
    return {
      stage,
      count,
      percentage: apps.length > 0 ? Math.round((count / apps.length) * 100) : 0,
    }
  })

  // Monthly trend
  const monthlyMap: Record<string, { applications: number; approvals: number; rejections: number }> = {}
  for (const app of apps) {
    const month = app.createdAt.toISOString().slice(0, 7)
    if (!monthlyMap[month]) monthlyMap[month] = { applications: 0, approvals: 0, rejections: 0 }
    monthlyMap[month].applications++
    if (app.status === 'adm_approved' || app.status === 'adm_enrolled') monthlyMap[month].approvals++
    if (app.status === 'adm_rejected') monthlyMap[month].rejections++
  }
  const monthlyTrend = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }))

  // Class distribution
  const classMap: Record<string, { applications: number; approved: number; enrolled: number }> = {}
  for (const app of apps) {
    const cls = app.applyingForClass
    if (!classMap[cls]) classMap[cls] = { applications: 0, approved: 0, enrolled: 0 }
    classMap[cls].applications++
    if (app.status === 'adm_approved') classMap[cls].approved++
    if (app.status === 'adm_enrolled') classMap[cls].enrolled++
  }
  const classDistribution = Object.entries(classMap).map(([cls, data]) => ({ class: cls, ...data }))

  // Source distribution
  const sourceMap: Record<string, number> = {}
  for (const app of apps) {
    const src = app.source ? (sourceFromDb[app.source] || app.source) : 'unknown'
    sourceMap[src] = (sourceMap[src] || 0) + 1
  }
  const sourceDistribution = Object.entries(sourceMap).map(([source, count]) => ({
    source,
    count,
    percentage: apps.length > 0 ? Math.round((count / apps.length) * 100) : 0,
  }))

  const approved = apps.filter(a => a.status === 'adm_approved' || a.status === 'adm_enrolled').length
  const rejected = apps.filter(a => a.status === 'adm_rejected').length
  const withdrawn = apps.filter(a => a.status === 'adm_withdrawn').length
  const withScores = apps.filter(a => a.entranceExamScore != null)

  return {
    data: {
      conversionFunnel,
      monthlyTrend,
      classDistribution,
      sourceDistribution,
      avgProcessingDays: 15,
      approvalRate: apps.length > 0 ? Math.round((approved / apps.length) * 100) : 0,
      rejectionRate: apps.length > 0 ? Math.round((rejected / apps.length) * 100) : 0,
      withdrawalRate: apps.length > 0 ? Math.round((withdrawn / apps.length) * 100) : 0,
      avgExamScore: withScores.length > 0
        ? Math.round(withScores.reduce((sum, a) => sum + (a.entranceExamScore || 0), 0) / withScores.length)
        : 0,
      topPerformers: withScores
        .sort((a, b) => (b.entranceExamScore || 0) - (a.entranceExamScore || 0))
        .slice(0, 5)
        .map(a => ({ name: a.studentName, class: a.applyingForClass, score: a.entranceExamScore || 0 })),
    },
  }
}

// ==================== Export ====================

export async function exportApplications(query: { status?: string; class?: string }) {
  const where: any = {}
  if (query.status && statusToDb[query.status]) where.status = statusToDb[query.status]
  if (query.class) where.applyingForClass = query.class

  const apps = await prisma.admissionApplication.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return {
    data: apps.map(app => ({
      applicationNumber: app.applicationNumber,
      studentName: app.studentName,
      dateOfBirth: app.dateOfBirth?.toISOString().split('T')[0] || '',
      gender: app.gender,
      email: app.email,
      phone: app.phone,
      applyingForClass: app.applyingForClass,
      previousSchool: app.previousSchool,
      previousClass: app.previousClass,
      previousMarks: String(app.previousMarks),
      fatherName: app.fatherName,
      motherName: app.motherName,
      guardianPhone: app.guardianPhone,
      guardianEmail: app.guardianEmail,
      guardianOccupation: app.guardianOccupation || '',
      status: statusFromDb[app.status] || app.status,
      appliedDate: app.createdAt.toISOString(),
      address: [app.addressStreet, app.addressCity, app.addressState, app.addressPincode].filter(Boolean).join(', '),
    })),
  }
}

// ==================== Public Apply ====================

export async function publicApply(input: CreateApplicationInput) {
  const applicationNumber = await generateApplicationNumber()
  await prisma.admissionApplication.create({
    data: {
      applicationNumber,
      studentName: input.studentName,
      dateOfBirth: new Date(input.dateOfBirth),
      gender: input.gender as any,
      email: input.email,
      phone: input.phone,
      addressStreet: input.address?.street,
      addressCity: input.address?.city,
      addressState: input.address?.state,
      addressPincode: input.address?.pincode,
      applyingForClass: input.applyingForClass,
      previousSchool: input.previousSchool,
      previousClass: input.previousClass,
      previousMarks: input.previousMarks,
      fatherName: input.fatherName,
      motherName: input.motherName,
      guardianPhone: input.guardianPhone,
      guardianEmail: input.guardianEmail,
      guardianOccupation: input.guardianOccupation,
      source: input.source ? (sourceToDb[input.source] as any) : 'asrc_website',
      statusHistory: {
        create: {
          fromStatus: null,
          toStatus: 'adm_applied',
          changedBy: 'public',
          note: 'Application submitted via public portal',
        },
      },
    },
  })

  return {
    data: {
      applicationNumber,
      message: 'Application submitted successfully. You will receive a confirmation email shortly.',
    },
  }
}
