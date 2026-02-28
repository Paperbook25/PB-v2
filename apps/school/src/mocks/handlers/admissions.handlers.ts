import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  applications,
  filterApplications,
  applicationStats,
  waitlistEntries,
  classCapacities,
  examSchedules,
  examResults,
  communicationLogs,
  communicationTemplates,
  admissionPayments,
  generateAnalytics,
} from '../data/admissions.data'
import type {
  Application,
  ApplicationDocument,
  ApplicationNote,
  ApplicationStatus,
  CommunicationType,
  CreateApplicationRequest,
  StatusChange,
  UpdateApplicationRequest,
} from '@/features/admissions/types/admission.types'

// Helper to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

// Helper to generate application number
function generateApplicationNumber(): string {
  const year = new Date().getFullYear()
  const count = applications.length + 1
  return `APP${year}${String(count).padStart(4, '0')}`
}

export const admissionsHandlers = [
  // Get all applications with filters and pagination
  http.get('/api/admissions', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status') as ApplicationStatus | 'all' | null
    const classFilter = url.searchParams.get('class')
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')

    const filtered = filterApplications({
      search: search || undefined,
      status: status || undefined,
      class: classFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })

    const total = filtered.length
    const start = (page - 1) * limit
    const paginatedData = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  }),

  // Get application stats
  http.get('/api/admissions/stats', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: applicationStats })
  }),

  // Get single application by ID
  http.get('/api/admissions/:id', async ({ params }) => {
    await mockDelay('read')
    const application = applications.find((a) => a.id === params.id)

    if (!application) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: application })
  }),

  // Create new application
  http.post('/api/admissions', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateApplicationRequest

    const newApplication: Application = {
      id: generateId(),
      applicationNumber: generateApplicationNumber(),
      status: 'applied',

      // Student Info
      studentName: body.studentName,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.studentName.replace(/\s/g, '')}&backgroundColor=b6e3f4,c0aede,d1d4f9`,

      // Contact Info
      email: body.email,
      phone: body.phone,
      address: body.address,

      // Academic Info
      applyingForClass: body.applyingForClass,
      previousSchool: body.previousSchool,
      previousClass: body.previousClass,
      previousMarks: body.previousMarks,

      // Parent Info
      fatherName: body.fatherName,
      motherName: body.motherName,
      guardianPhone: body.guardianPhone,
      guardianEmail: body.guardianEmail,
      guardianOccupation: body.guardianOccupation,

      // Application Details
      appliedDate: new Date().toISOString(),

      // Documents
      documents: [],

      // Timeline
      statusHistory: [
        {
          id: generateId(),
          fromStatus: null,
          toStatus: 'applied',
          changedAt: new Date().toISOString(),
          changedBy: 'System',
          note: 'Application submitted',
        },
      ],
      notes: [],

      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    applications.unshift(newApplication)

    return HttpResponse.json({ data: newApplication }, { status: 201 })
  }),

  // Update application
  http.put('/api/admissions/:id', async ({ params, request }) => {
    await mockDelay('read')
    const applicationIndex = applications.findIndex((a) => a.id === params.id)

    if (applicationIndex === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateApplicationRequest
    const updatedApplication = {
      ...applications[applicationIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    applications[applicationIndex] = updatedApplication

    return HttpResponse.json({ data: updatedApplication })
  }),

  // Update application status
  http.patch('/api/admissions/:id/status', async ({ params, request }) => {
    await mockDelay('read')
    const applicationIndex = applications.findIndex((a) => a.id === params.id)

    if (applicationIndex === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const body = (await request.json()) as { status: ApplicationStatus; note?: string }
    const application = applications[applicationIndex]

    const statusChange: StatusChange = {
      id: generateId(),
      fromStatus: application.status,
      toStatus: body.status,
      changedAt: new Date().toISOString(),
      changedBy: 'Current User', // In real app, would come from auth context
      note: body.note,
    }

    const updatedApplication: Application = {
      ...application,
      status: body.status,
      statusHistory: [...application.statusHistory, statusChange],
      updatedAt: new Date().toISOString(),
    }

    applications[applicationIndex] = updatedApplication

    return HttpResponse.json({ data: updatedApplication })
  }),

  // Add document to application
  http.post('/api/admissions/:id/documents', async ({ params, request }) => {
    await mockDelay('write')
    const applicationIndex = applications.findIndex((a) => a.id === params.id)

    if (applicationIndex === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const body = (await request.json()) as { type: string; name: string; url: string }

    const newDocument: ApplicationDocument = {
      id: generateId(),
      type: body.type as ApplicationDocument['type'],
      name: body.name,
      url: body.url,
      uploadedAt: new Date().toISOString(),
      status: 'pending',
    }

    const application = applications[applicationIndex]
    const updatedApplication: Application = {
      ...application,
      documents: [...application.documents, newDocument],
      updatedAt: new Date().toISOString(),
    }

    applications[applicationIndex] = updatedApplication

    return HttpResponse.json({ data: newDocument }, { status: 201 })
  }),

  // Verify/reject document
  http.patch('/api/admissions/:id/documents/:docId', async ({ params, request }) => {
    await mockDelay('read')
    const applicationIndex = applications.findIndex((a) => a.id === params.id)

    if (applicationIndex === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const body = (await request.json()) as { status: 'verified' | 'rejected'; rejectionReason?: string }
    const application = applications[applicationIndex]
    const docIndex = application.documents.findIndex((d) => d.id === params.docId)

    if (docIndex === -1) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const updatedDocument: ApplicationDocument = {
      ...application.documents[docIndex],
      status: body.status,
      verifiedBy: body.status === 'verified' ? 'Current User' : undefined,
      verifiedAt: body.status === 'verified' ? new Date().toISOString() : undefined,
      rejectionReason: body.rejectionReason,
    }

    const updatedDocuments = [...application.documents]
    updatedDocuments[docIndex] = updatedDocument

    const updatedApplication: Application = {
      ...application,
      documents: updatedDocuments,
      updatedAt: new Date().toISOString(),
    }

    applications[applicationIndex] = updatedApplication

    return HttpResponse.json({ data: updatedDocument })
  }),

  // Add note to application
  http.post('/api/admissions/:id/notes', async ({ params, request }) => {
    await mockDelay('read')
    const applicationIndex = applications.findIndex((a) => a.id === params.id)

    if (applicationIndex === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const body = (await request.json()) as { content: string }

    const newNote: ApplicationNote = {
      id: generateId(),
      content: body.content,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id', // In real app, would come from auth context
      createdByName: 'Current User',
    }

    const application = applications[applicationIndex]
    const updatedApplication: Application = {
      ...application,
      notes: [newNote, ...application.notes],
      updatedAt: new Date().toISOString(),
    }

    applications[applicationIndex] = updatedApplication

    return HttpResponse.json({ data: newNote }, { status: 201 })
  }),

  // Schedule interview
  http.patch('/api/admissions/:id/interview', async ({ params, request }) => {
    await mockDelay('read')
    const applicationIndex = applications.findIndex((a) => a.id === params.id)

    if (applicationIndex === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const body = (await request.json()) as { interviewDate: string }
    const application = applications[applicationIndex]

    const updatedApplication: Application = {
      ...application,
      interviewDate: body.interviewDate,
      updatedAt: new Date().toISOString(),
    }

    applications[applicationIndex] = updatedApplication

    return HttpResponse.json({ data: updatedApplication })
  }),

  // Schedule entrance exam
  http.patch('/api/admissions/:id/entrance-exam', async ({ params, request }) => {
    await mockDelay('read')
    const applicationIndex = applications.findIndex((a) => a.id === params.id)

    if (applicationIndex === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const body = (await request.json()) as { entranceExamDate: string }
    const application = applications[applicationIndex]

    const updatedApplication: Application = {
      ...application,
      entranceExamDate: body.entranceExamDate,
      updatedAt: new Date().toISOString(),
    }

    applications[applicationIndex] = updatedApplication

    return HttpResponse.json({ data: updatedApplication })
  }),

  // Delete application
  http.delete('/api/admissions/:id', async ({ params }) => {
    await mockDelay('read')
    const applicationIndex = applications.findIndex((a) => a.id === params.id)

    if (applicationIndex === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    applications.splice(applicationIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== WAITLIST HANDLERS ====================

  http.get('/api/admissions/waitlist', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const cls = url.searchParams.get('class')
    let entries = [...waitlistEntries]
    if (cls) {
      entries = entries.filter((e) => e.applyingForClass === cls)
    }
    entries.sort((a, b) => a.position - b.position)
    return HttpResponse.json({ data: entries })
  }),

  http.get('/api/admissions/class-capacity', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: classCapacities })
  }),

  // ==================== ENTRANCE EXAM HANDLERS ====================

  http.get('/api/admissions/exam-schedules', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: examSchedules })
  }),

  http.post('/api/admissions/exam-schedules', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as Record<string, unknown>
    const newSchedule = {
      id: generateId(),
      ...body,
      registeredCount: 0,
      completedCount: 0,
      status: 'upcoming',
    }
    examSchedules.push(newSchedule as typeof examSchedules[0])
    return HttpResponse.json({ data: newSchedule }, { status: 201 })
  }),

  http.get('/api/admissions/exam-results', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const cls = url.searchParams.get('class')
    const scheduleId = url.searchParams.get('scheduleId')
    let results = [...examResults]
    if (cls) {
      results = results.filter((r) => {
        const app = applications.find((a) => a.id === r.applicationId)
        return app?.applyingForClass === cls
      })
    }
    if (scheduleId) {
      results = results.filter((r) => r.examScheduleId === scheduleId)
    }
    results.sort((a, b) => b.percentage - a.percentage)
    return HttpResponse.json({ data: results })
  }),

  http.post('/api/admissions/:id/exam-score', async ({ params, request }) => {
    await mockDelay('read')
    const applicationIndex = applications.findIndex((a) => a.id === params.id)
    if (applicationIndex === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    const body = (await request.json()) as { marksObtained: number; subjectWiseMarks: { subject: string; marks: number; total: number }[] }
    const app = applications[applicationIndex]
    app.entranceExamScore = body.marksObtained
    app.updatedAt = new Date().toISOString()
    return HttpResponse.json({ data: app })
  }),

  // ==================== COMMUNICATION HANDLERS ====================

  http.get('/api/admissions/communications', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const applicationId = url.searchParams.get('applicationId')
    const type = url.searchParams.get('type')
    let logs = [...communicationLogs]
    if (applicationId) {
      logs = logs.filter((l) => l.applicationId === applicationId)
    }
    if (type) {
      logs = logs.filter((l) => l.type === type)
    }
    return HttpResponse.json({ data: logs })
  }),

  http.get('/api/admissions/communication-templates', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: communicationTemplates })
  }),

  http.post('/api/admissions/send-communication', async ({ request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as { applicationIds: string[]; type: string; subject: string; message: string }
    const newLogs = body.applicationIds.map((appId) => {
      const app = applications.find((a) => a.id === appId)
      return {
        id: generateId(),
        applicationId: appId,
        studentName: app?.studentName ?? 'Unknown',
        type: body.type as CommunicationType,
        trigger: 'custom' as const,
        recipient: app?.guardianEmail ?? '',
        subject: body.subject,
        message: body.message,
        sentAt: new Date().toISOString(),
        status: 'sent' as const,
        sentBy: 'Current User',
      }
    })
    communicationLogs.unshift(...newLogs)
    return HttpResponse.json({ data: newLogs, count: newLogs.length }, { status: 201 })
  }),

  // ==================== PAYMENT HANDLERS ====================

  http.get('/api/admissions/payments', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    let payments = [...admissionPayments]
    if (status) {
      payments = payments.filter((p) => p.status === status)
    }
    return HttpResponse.json({ data: payments })
  }),

  http.get('/api/admissions/:id/payment', async ({ params }) => {
    await mockDelay('read')
    const payment = admissionPayments.find((p) => p.applicationId === params.id)
    if (!payment) {
      return HttpResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: payment })
  }),

  http.post('/api/admissions/:id/payment', async ({ params, request }) => {
    await mockDelay('write')
    const body = (await request.json()) as { amount: number; paymentMethod: string; transactionId?: string }
    const paymentIndex = admissionPayments.findIndex((p) => p.applicationId === params.id)

    if (paymentIndex === -1) {
      return HttpResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    const payment = admissionPayments[paymentIndex]
    const newPaid = payment.paidAmount + body.amount
    const updatedPayment = {
      ...payment,
      paidAmount: newPaid,
      status: newPaid >= payment.totalAmount ? 'paid' as const : 'partial' as const,
      paymentDate: new Date().toISOString(),
      paymentMethod: body.paymentMethod,
      transactionId: body.transactionId ?? `TXN${Date.now()}`,
      receiptNumber: `REC-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      feeBreakdown: payment.feeBreakdown.map((f) => ({ ...f, paid: true })),
    }
    admissionPayments[paymentIndex] = updatedPayment

    return HttpResponse.json({ data: updatedPayment })
  }),

  // ==================== ANALYTICS HANDLERS ====================

  http.get('/api/admissions/analytics', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: generateAnalytics() })
  }),

  // ==================== EXPORT HANDLER ====================

  http.get('/api/admissions/export', async ({ request }) => {
    await mockDelay('heavy')
    const url = new URL(request.url)
    const statusFilter = url.searchParams.get('status') as ApplicationStatus | null
    const classFilter = url.searchParams.get('class')

    let filtered = [...applications]
    if (statusFilter) {
      filtered = filtered.filter((a) => a.status === statusFilter)
    }
    if (classFilter) {
      filtered = filtered.filter((a) => a.applyingForClass === classFilter)
    }

    const exportData = filtered.map((a) => ({
      applicationNumber: a.applicationNumber,
      studentName: a.studentName,
      dateOfBirth: a.dateOfBirth,
      gender: a.gender,
      email: a.email,
      phone: a.phone,
      applyingForClass: a.applyingForClass,
      previousSchool: a.previousSchool || '',
      previousClass: a.previousClass || '',
      previousMarks: a.previousMarks || '',
      fatherName: a.fatherName,
      motherName: a.motherName,
      guardianPhone: a.guardianPhone,
      guardianEmail: a.guardianEmail,
      guardianOccupation: a.guardianOccupation || '',
      status: a.status,
      appliedDate: a.appliedDate,
      address: `${a.address.street}, ${a.address.city}, ${a.address.state} - ${a.address.pincode}`,
    }))

    return HttpResponse.json({ data: exportData })
  }),

  // ==================== PUBLIC APPLICATION HANDLER ====================

  http.post('/api/public/admissions/apply', async ({ request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as CreateApplicationRequest & { source?: string }

    const newApplication: Application = {
      id: generateId(),
      applicationNumber: generateApplicationNumber(),
      status: 'applied',
      studentName: body.studentName,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.studentName.replace(/\s/g, '')}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      email: body.email,
      phone: body.phone,
      address: body.address,
      applyingForClass: body.applyingForClass,
      previousSchool: body.previousSchool,
      previousClass: body.previousClass,
      previousMarks: body.previousMarks,
      fatherName: body.fatherName,
      motherName: body.motherName,
      guardianPhone: body.guardianPhone,
      guardianEmail: body.guardianEmail,
      guardianOccupation: body.guardianOccupation,
      appliedDate: new Date().toISOString(),
      documents: [],
      statusHistory: [
        {
          id: generateId(),
          fromStatus: null,
          toStatus: 'applied',
          changedAt: new Date().toISOString(),
          changedBy: 'Online Portal',
          note: 'Application submitted via public portal',
        },
      ],
      notes: [],
      source: (body.source as Application['source']) ?? 'website',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    applications.unshift(newApplication)

    return HttpResponse.json({
      data: {
        applicationNumber: newApplication.applicationNumber,
        message: 'Application submitted successfully. You will receive a confirmation email shortly.',
      },
    }, { status: 201 })
  }),
]
