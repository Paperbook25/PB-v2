import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import type {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintCategory,
  CreateComplaintRequest,
  UpdateComplaintRequest,
  ComplaintComment,
  CreateCommentRequest,
  TicketHistory,
  StatusChange,
  Resolution,
  CreateResolutionRequest,
  SLAConfig,
  SLABreach,
  SLAStatus,
  AssignmentRule,
  SatisfactionSurvey,
  SurveyResponse,
  SurveyAnalytics,
  AnonymousFeedback,
  CreateAnonymousFeedbackRequest,
  ComplaintStats,
  ComplaintTrend,
  CategoryAnalytics,
  EscalationRequest,
} from '@/features/complaints/types/complaints.types'

// ==================== HELPER FUNCTIONS ====================

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

function generateTicketNumber(): string {
  const year = new Date().getFullYear()
  const seq = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, '0')
  return `CMP-${year}-${seq}`
}

function generateFeedbackToken(): string {
  return `FB-${generateId().toUpperCase()}`
}

function generateSLAStatus(
  priority: ComplaintPriority,
  createdAt: string,
  acknowledgedAt?: string,
  resolvedAt?: string
): SLAStatus {
  const hoursMap: Record<ComplaintPriority, { ack: number; resolve: number }> = {
    critical: { ack: 4, resolve: 24 },
    high: { ack: 8, resolve: 48 },
    medium: { ack: 24, resolve: 72 },
    low: { ack: 48, resolve: 120 },
  }

  const { ack, resolve } = hoursMap[priority]
  const created = new Date(createdAt)
  const now = new Date()

  const acknowledgementDue = new Date(
    created.getTime() + ack * 60 * 60 * 1000
  ).toISOString()
  const resolutionDue = new Date(
    created.getTime() + resolve * 60 * 60 * 1000
  ).toISOString()

  const isAcknowledged = !!acknowledgedAt
  const isResolved = !!resolvedAt

  const acknowledgementBreached = !isAcknowledged && now > new Date(acknowledgementDue)
  const resolutionBreached = !isResolved && now > new Date(resolutionDue)

  const timeRemainingAcknowledge = isAcknowledged
    ? undefined
    : (new Date(acknowledgementDue).getTime() - now.getTime()) / (60 * 60 * 1000)
  const timeRemainingResolve = isResolved
    ? undefined
    : (new Date(resolutionDue).getTime() - now.getTime()) / (60 * 60 * 1000)

  return {
    isAcknowledged,
    isResolved,
    acknowledgementDue,
    resolutionDue,
    acknowledgementBreached,
    resolutionBreached,
    hoursToAcknowledge: ack,
    hoursToResolve: resolve,
    timeRemainingAcknowledge,
    timeRemainingResolve,
  }
}

// ==================== MOCK DATA ====================

const complaints: Complaint[] = [
  {
    id: 'cmp-1',
    ticketNumber: 'CMP-2024-00001',
    complainantType: 'parent',
    complainantId: 'parent-1',
    complainantName: 'Rajesh Kumar',
    complainantEmail: 'rajesh.kumar@example.com',
    complainantPhone: '+91-9876543210',
    studentId: 'student-1',
    studentName: 'Arjun Kumar',
    studentClass: '10',
    studentSection: 'A',
    category: 'academic',
    subject: 'Incorrect marks in Physics exam',
    description:
      'My son received 45 marks in his Physics mid-term exam but the answer sheet shows he should have gotten 58 marks. Please re-evaluate.',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'staff-1',
    assignedToName: 'Dr. Sharma',
    assignedDepartment: 'Academics',
    slaStatus: generateSLAStatus(
      'high',
      '2024-01-15T10:30:00Z',
      '2024-01-15T14:00:00Z'
    ),
    responseCount: 2,
    createdAt: '2024-01-15T10:30:00Z',
    acknowledgedAt: '2024-01-15T14:00:00Z',
    firstResponseAt: '2024-01-15T15:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
    source: 'web',
    tags: ['marks', 're-evaluation'],
    isAnonymous: false,
    isSensitive: false,
    requiresFollowUp: true,
    followUpDate: '2024-01-20',
  },
  {
    id: 'cmp-2',
    ticketNumber: 'CMP-2024-00002',
    complainantType: 'parent',
    complainantId: 'parent-2',
    complainantName: 'Sunita Verma',
    complainantEmail: 'sunita.v@example.com',
    studentId: 'student-2',
    studentName: 'Priya Verma',
    studentClass: '8',
    studentSection: 'B',
    category: 'bullying',
    subject: 'Bullying incident reported',
    description:
      'My daughter has been facing bullying from some senior students. She is afraid to come to school.',
    priority: 'critical',
    status: 'escalated',
    assignedTo: 'staff-2',
    assignedToName: 'Mrs. Gupta',
    assignedDepartment: 'Student Welfare',
    escalatedTo: 'principal-1',
    escalatedToName: 'Principal Singh',
    escalatedAt: '2024-01-14T16:00:00Z',
    escalationReason: 'Sensitive matter requiring immediate attention',
    slaStatus: generateSLAStatus(
      'critical',
      '2024-01-14T09:00:00Z',
      '2024-01-14T10:00:00Z'
    ),
    responseCount: 5,
    createdAt: '2024-01-14T09:00:00Z',
    acknowledgedAt: '2024-01-14T10:00:00Z',
    firstResponseAt: '2024-01-14T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    source: 'phone',
    tags: ['bullying', 'urgent', 'counseling-required'],
    isAnonymous: false,
    isSensitive: true,
    requiresFollowUp: true,
    followUpDate: '2024-01-17',
  },
  {
    id: 'cmp-3',
    ticketNumber: 'CMP-2024-00003',
    complainantType: 'staff',
    complainantId: 'staff-5',
    complainantName: 'Mr. Patel',
    category: 'facilities',
    subject: 'Air conditioning not working in classroom 302',
    description:
      'The AC unit in classroom 302 has been malfunctioning for 3 days. Students are uncomfortable.',
    priority: 'medium',
    status: 'acknowledged',
    assignedTo: 'staff-10',
    assignedToName: 'Maintenance Team',
    assignedDepartment: 'Facilities',
    slaStatus: generateSLAStatus('medium', '2024-01-16T08:00:00Z', '2024-01-16T10:00:00Z'),
    responseCount: 1,
    createdAt: '2024-01-16T08:00:00Z',
    acknowledgedAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    source: 'mobile',
    isAnonymous: false,
    isSensitive: false,
    requiresFollowUp: false,
  },
  {
    id: 'cmp-4',
    ticketNumber: 'CMP-2024-00004',
    complainantType: 'parent',
    complainantId: 'parent-3',
    complainantName: 'Anonymous',
    category: 'fees',
    subject: 'Fee structure transparency issue',
    description:
      'The breakdown of fees is not clear. Need detailed explanation of additional charges.',
    priority: 'low',
    status: 'resolved',
    assignedTo: 'staff-15',
    assignedToName: 'Finance Office',
    assignedDepartment: 'Finance',
    slaStatus: generateSLAStatus(
      'low',
      '2024-01-10T14:00:00Z',
      '2024-01-10T16:00:00Z',
      '2024-01-12T11:00:00Z'
    ),
    responseCount: 3,
    createdAt: '2024-01-10T14:00:00Z',
    acknowledgedAt: '2024-01-10T16:00:00Z',
    firstResponseAt: '2024-01-11T09:00:00Z',
    resolvedAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-12T11:00:00Z',
    source: 'email',
    isAnonymous: false,
    isSensitive: false,
    requiresFollowUp: false,
  },
  {
    id: 'cmp-5',
    ticketNumber: 'CMP-2024-00005',
    complainantType: 'student',
    complainantId: 'student-10',
    complainantName: 'Rahul Mehta',
    studentId: 'student-10',
    studentName: 'Rahul Mehta',
    studentClass: '12',
    studentSection: 'A',
    category: 'transport',
    subject: 'Bus route change request',
    description:
      'The current bus stop is too far from my home. Requesting a stop closer to Sector 15.',
    priority: 'low',
    status: 'submitted',
    slaStatus: generateSLAStatus('low', '2024-01-17T07:30:00Z'),
    responseCount: 0,
    createdAt: '2024-01-17T07:30:00Z',
    updatedAt: '2024-01-17T07:30:00Z',
    source: 'mobile',
    isAnonymous: false,
    isSensitive: false,
    requiresFollowUp: false,
  },
]

const complaintComments: ComplaintComment[] = [
  {
    id: 'comment-1',
    complaintId: 'cmp-1',
    authorId: 'staff-1',
    authorName: 'Dr. Sharma',
    authorRole: 'Academic Coordinator',
    content: 'We have initiated the re-evaluation process. Will update in 2 days.',
    isInternal: false,
    createdAt: '2024-01-15T15:00:00Z',
  },
  {
    id: 'comment-2',
    complaintId: 'cmp-1',
    authorId: 'parent-1',
    authorName: 'Rajesh Kumar',
    authorRole: 'Parent',
    content: 'Thank you for the quick response. Looking forward to the update.',
    isInternal: false,
    createdAt: '2024-01-15T16:00:00Z',
  },
  {
    id: 'comment-3',
    complaintId: 'cmp-1',
    authorId: 'staff-1',
    authorName: 'Dr. Sharma',
    authorRole: 'Academic Coordinator',
    content:
      'Internal note: Answer sheet retrieved from storage. Scheduling re-check with examiner.',
    isInternal: true,
    createdAt: '2024-01-16T09:00:00Z',
  },
]

const ticketHistories: TicketHistory[] = [
  {
    id: 'hist-1',
    complaintId: 'cmp-1',
    action: 'created',
    description: 'Complaint ticket created',
    performedBy: 'parent-1',
    performedByName: 'Rajesh Kumar',
    performedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'hist-2',
    complaintId: 'cmp-1',
    action: 'assigned',
    description: 'Assigned to Dr. Sharma (Academics)',
    performedBy: 'system',
    performedByName: 'System',
    performedAt: '2024-01-15T10:31:00Z',
    metadata: { assignedTo: 'staff-1' },
  },
  {
    id: 'hist-3',
    complaintId: 'cmp-1',
    action: 'status_changed',
    description: 'Status changed from Submitted to Acknowledged',
    performedBy: 'staff-1',
    performedByName: 'Dr. Sharma',
    performedAt: '2024-01-15T14:00:00Z',
    metadata: { fromStatus: 'submitted', toStatus: 'acknowledged' },
  },
]

const statusChanges: StatusChange[] = [
  {
    id: 'sc-1',
    complaintId: 'cmp-1',
    fromStatus: 'submitted',
    toStatus: 'acknowledged',
    changedBy: 'staff-1',
    changedByName: 'Dr. Sharma',
    changedAt: '2024-01-15T14:00:00Z',
  },
  {
    id: 'sc-2',
    complaintId: 'cmp-1',
    fromStatus: 'acknowledged',
    toStatus: 'in_progress',
    changedBy: 'staff-1',
    changedByName: 'Dr. Sharma',
    changedAt: '2024-01-15T15:00:00Z',
    notes: 'Re-evaluation process started',
  },
]

const resolutions: Resolution[] = [
  {
    id: 'res-1',
    complaintId: 'cmp-4',
    summary: 'Fee structure clarification provided',
    detailedDescription:
      'A detailed breakdown of the fee structure was sent to the parent via email. Also scheduled a meeting for further clarification.',
    rootCause: 'Fee structure document was not updated on the website',
    actionsTaken: [
      'Sent detailed fee breakdown via email',
      'Updated fee structure on school website',
      'Scheduled one-on-one meeting',
    ],
    preventiveMeasures: [
      'Quarterly review of fee documents on website',
      'Proactive communication before fee changes',
    ],
    steps: [],
    resolvedBy: 'staff-15',
    resolvedByName: 'Finance Office',
    resolvedAt: '2024-01-12T11:00:00Z',
    verifiedBy: 'admin-1',
    verifiedByName: 'Admin',
    verifiedAt: '2024-01-12T14:00:00Z',
    satisfactionScore: 4,
    reopenCount: 0,
    totalResolutionHours: 45,
    status: 'verified',
  },
]

const slaConfigs: SLAConfig[] = [
  {
    id: 'sla-1',
    category: 'bullying',
    priority: 'critical',
    acknowledgeWithinHours: 4,
    resolveWithinHours: 24,
    escalateAfterHours: 8,
    autoEscalate: true,
    escalateTo: 'principal',
    notifyOnBreach: true,
    notificationRecipients: ['principal', 'counselor'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'sla-2',
    category: 'academic',
    priority: 'high',
    acknowledgeWithinHours: 8,
    resolveWithinHours: 48,
    escalateAfterHours: 24,
    autoEscalate: true,
    escalateTo: 'academic_coordinator',
    notifyOnBreach: true,
    notificationRecipients: ['academic_coordinator'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

const slaBreaches: SLABreach[] = []

const assignmentRules: AssignmentRule[] = [
  {
    id: 'rule-1',
    name: 'Bullying to Student Welfare',
    description: 'Route all bullying complaints to Student Welfare team',
    category: 'bullying',
    assignTo: 'staff-2',
    assignToName: 'Mrs. Gupta',
    escalateTo: 'principal-1',
    escalateToName: 'Principal Singh',
    autoAcknowledge: false,
    isActive: true,
    order: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rule-2',
    name: 'Academic Issues to Coordinator',
    description: 'Route academic complaints to Academic Coordinator',
    category: 'academic',
    assignTo: 'staff-1',
    assignToName: 'Dr. Sharma',
    autoAcknowledge: false,
    isActive: true,
    order: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

const surveys: SatisfactionSurvey[] = [
  {
    id: 'survey-1',
    complaintId: 'cmp-4',
    ticketNumber: 'CMP-2024-00004',
    complainantId: 'parent-3',
    complainantName: 'Anonymous',
    status: 'completed',
    sentAt: '2024-01-12T15:00:00Z',
    completedAt: '2024-01-13T10:00:00Z',
    expiresAt: '2024-01-19T15:00:00Z',
    remindersSent: 0,
    createdAt: '2024-01-12T15:00:00Z',
  },
]

const surveyResponses: SurveyResponse[] = [
  {
    id: 'resp-1',
    surveyId: 'survey-1',
    complaintId: 'cmp-4',
    overallSatisfaction: 4,
    resolutionQuality: 4,
    responseTime: 5,
    staffProfessionalism: 5,
    communicationClarity: 4,
    wouldRecommend: true,
    additionalComments: 'Good response time and helpful staff.',
    respondedAt: '2024-01-13T10:00:00Z',
    isAnonymous: false,
  },
]

const anonymousFeedback: AnonymousFeedback[] = [
  {
    id: 'anon-1',
    feedbackToken: 'FB-ABC123XYZ',
    category: 'safety',
    subject: 'Safety concern in parking area',
    description:
      'The parking area lighting is inadequate and there have been incidents of theft.',
    priority: 'high',
    submittedAt: '2024-01-16T18:00:00Z',
    status: 'acknowledged',
    assignedTo: 'staff-10',
    assignedToName: 'Security Head',
    isVerified: true,
    responsePosted: false,
  },
]

const assignableStaff = [
  { id: 'staff-1', name: 'Dr. Sharma', role: 'Academic Coordinator', department: 'Academics' },
  { id: 'staff-2', name: 'Mrs. Gupta', role: 'Student Welfare Officer', department: 'Student Welfare' },
  { id: 'staff-10', name: 'Mr. Singh', role: 'Facilities Manager', department: 'Facilities' },
  { id: 'staff-15', name: 'Ms. Patel', role: 'Finance Officer', department: 'Finance' },
  { id: 'staff-20', name: 'Mr. Kumar', role: 'Transport Coordinator', department: 'Transport' },
]

// ==================== HANDLERS ====================

export const complaintsHandlers = [
  // ==================== COMPLAINTS CRUD ====================

  // Get all complaints with filters
  http.get('/api/complaints', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const status = url.searchParams.get('status')
    const priority = url.searchParams.get('priority')
    const category = url.searchParams.get('category')
    const assignedTo = url.searchParams.get('assignedTo')
    const complainantType = url.searchParams.get('complainantType')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...complaints]

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.ticketNumber.toLowerCase().includes(search) ||
          c.subject.toLowerCase().includes(search) ||
          c.complainantName?.toLowerCase().includes(search) ||
          c.studentName?.toLowerCase().includes(search)
      )
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status === status)
    }

    if (priority && priority !== 'all') {
      filtered = filtered.filter((c) => c.priority === priority)
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((c) => c.category === category)
    }

    if (assignedTo) {
      filtered = filtered.filter((c) => c.assignedTo === assignedTo)
    }

    if (complainantType && complainantType !== 'all') {
      filtered = filtered.filter((c) => c.complainantType === complainantType)
    }

    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedData = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get single complaint
  http.get('/api/complaints/:id', async ({ params }) => {
    await mockDelay('read')
    const complaint = complaints.find((c) => c.id === params.id)

    if (!complaint) {
      return HttpResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: complaint })
  }),

  // Create complaint
  http.post('/api/complaints', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateComplaintRequest

    const newComplaint: Complaint = {
      id: generateId(),
      ticketNumber: generateTicketNumber(),
      complainantType: body.complainantType,
      complainantId: body.complainantId,
      complainantName: 'User Name', // Would come from user lookup
      studentId: body.studentId,
      category: body.category,
      subcategory: body.subcategory,
      subject: body.subject,
      description: body.description,
      priority: body.priority || 'medium',
      status: 'submitted',
      slaStatus: generateSLAStatus(body.priority || 'medium', new Date().toISOString()),
      responseCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: body.source || 'web',
      isAnonymous: false,
      isSensitive: body.isSensitive || false,
      requiresFollowUp: false,
    }

    complaints.unshift(newComplaint)

    // Add history entry
    ticketHistories.unshift({
      id: generateId(),
      complaintId: newComplaint.id,
      action: 'created',
      description: 'Complaint ticket created',
      performedBy: body.complainantId,
      performedByName: newComplaint.complainantName || 'User',
      performedAt: new Date().toISOString(),
    })

    return HttpResponse.json({ data: newComplaint }, { status: 201 })
  }),

  // Update complaint
  http.patch('/api/complaints/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = complaints.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateComplaintRequest
    const oldComplaint = complaints[idx]

    complaints[idx] = {
      ...oldComplaint,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    // Track status changes
    if (body.status && body.status !== oldComplaint.status) {
      statusChanges.unshift({
        id: generateId(),
        complaintId: oldComplaint.id,
        fromStatus: oldComplaint.status,
        toStatus: body.status,
        changedBy: 'current-user',
        changedByName: 'Current User',
        changedAt: new Date().toISOString(),
      })
    }

    return HttpResponse.json({ data: complaints[idx] })
  }),

  // Delete complaint
  http.delete('/api/complaints/:id', async ({ params }) => {
    await mockDelay('write')
    const idx = complaints.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    complaints.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== ASSIGNMENT & ESCALATION ====================

  // Assign complaint
  http.patch('/api/complaints/:id/assign', async ({ params, request }) => {
    await mockDelay('write')
    const idx = complaints.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    const body = (await request.json()) as { assignedTo: string }
    const staff = assignableStaff.find((s) => s.id === body.assignedTo)

    complaints[idx] = {
      ...complaints[idx],
      assignedTo: body.assignedTo,
      assignedToName: staff?.name || 'Unknown',
      assignedDepartment: staff?.department,
      updatedAt: new Date().toISOString(),
    }

    ticketHistories.unshift({
      id: generateId(),
      complaintId: complaints[idx].id,
      action: 'assigned',
      description: `Assigned to ${staff?.name || 'Unknown'}`,
      performedBy: 'current-user',
      performedByName: 'Current User',
      performedAt: new Date().toISOString(),
      metadata: { assignedTo: body.assignedTo },
    })

    return HttpResponse.json({ data: complaints[idx] })
  }),

  // Escalate complaint
  http.post('/api/complaints/:id/escalate', async ({ params, request }) => {
    await mockDelay('write')
    const idx = complaints.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    const body = (await request.json()) as EscalationRequest

    complaints[idx] = {
      ...complaints[idx],
      status: 'escalated',
      escalatedTo: body.escalateTo,
      escalatedToName: 'Escalated User', // Would lookup
      escalatedAt: new Date().toISOString(),
      escalationReason: body.reason,
      updatedAt: new Date().toISOString(),
    }

    ticketHistories.unshift({
      id: generateId(),
      complaintId: complaints[idx].id,
      action: 'escalated',
      description: `Escalated: ${body.reason}`,
      performedBy: 'current-user',
      performedByName: 'Current User',
      performedAt: new Date().toISOString(),
    })

    return HttpResponse.json({ data: complaints[idx] })
  }),

  // Acknowledge complaint
  http.patch('/api/complaints/:id/acknowledge', async ({ params }) => {
    await mockDelay('write')
    const idx = complaints.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    const now = new Date().toISOString()
    complaints[idx] = {
      ...complaints[idx],
      status: 'acknowledged',
      acknowledgedAt: now,
      slaStatus: {
        ...complaints[idx].slaStatus,
        isAcknowledged: true,
      },
      updatedAt: now,
    }

    return HttpResponse.json({ data: complaints[idx] })
  }),

  // Reopen complaint
  http.patch('/api/complaints/:id/reopen', async ({ params, request }) => {
    await mockDelay('write')
    const idx = complaints.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    const body = (await request.json()) as { reason: string }
    const now = new Date().toISOString()

    complaints[idx] = {
      ...complaints[idx],
      status: 'reopened',
      reopenedAt: now,
      updatedAt: now,
    }

    ticketHistories.unshift({
      id: generateId(),
      complaintId: complaints[idx].id,
      action: 'reopened',
      description: `Reopened: ${body.reason}`,
      performedBy: 'current-user',
      performedByName: 'Current User',
      performedAt: now,
    })

    return HttpResponse.json({ data: complaints[idx] })
  }),

  // Close complaint
  http.patch('/api/complaints/:id/close', async ({ params, request }) => {
    await mockDelay('write')
    const idx = complaints.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    const body = (await request.json()) as { notes?: string }
    const now = new Date().toISOString()

    complaints[idx] = {
      ...complaints[idx],
      status: 'closed',
      closedAt: now,
      updatedAt: now,
    }

    ticketHistories.unshift({
      id: generateId(),
      complaintId: complaints[idx].id,
      action: 'closed',
      description: body.notes ? `Closed: ${body.notes}` : 'Complaint closed',
      performedBy: 'current-user',
      performedByName: 'Current User',
      performedAt: now,
    })

    return HttpResponse.json({ data: complaints[idx] })
  }),

  // ==================== COMMENTS ====================

  // Get comments
  http.get('/api/complaints/:complaintId/comments', async ({ params }) => {
    await mockDelay('read')
    const comments = complaintComments.filter(
      (c) => c.complaintId === params.complaintId
    )
    return HttpResponse.json({ data: comments })
  }),

  // Create comment
  http.post('/api/complaints/:complaintId/comments', async ({ params, request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateCommentRequest

    const newComment: ComplaintComment = {
      id: generateId(),
      complaintId: params.complaintId as string,
      authorId: 'current-user',
      authorName: 'Current User',
      authorRole: 'Staff',
      content: body.content,
      isInternal: body.isInternal,
      createdAt: new Date().toISOString(),
    }

    complaintComments.unshift(newComment)

    // Update complaint response count
    const complaintIdx = complaints.findIndex((c) => c.id === params.complaintId)
    if (complaintIdx !== -1 && !body.isInternal) {
      complaints[complaintIdx].responseCount++
      complaints[complaintIdx].lastResponseAt = newComment.createdAt
      if (!complaints[complaintIdx].firstResponseAt) {
        complaints[complaintIdx].firstResponseAt = newComment.createdAt
      }
    }

    return HttpResponse.json({ data: newComment }, { status: 201 })
  }),

  // Update comment
  http.patch(
    '/api/complaints/:complaintId/comments/:commentId',
    async ({ params, request }) => {
      await mockDelay('write')
      const idx = complaintComments.findIndex((c) => c.id === params.commentId)

      if (idx === -1) {
        return HttpResponse.json({ error: 'Comment not found' }, { status: 404 })
      }

      const body = (await request.json()) as { content: string }
      complaintComments[idx] = {
        ...complaintComments[idx],
        content: body.content,
        updatedAt: new Date().toISOString(),
        editedBy: 'current-user',
      }

      return HttpResponse.json({ data: complaintComments[idx] })
    }
  ),

  // Delete comment
  http.delete('/api/complaints/:complaintId/comments/:commentId', async ({ params }) => {
    await mockDelay('write')
    const idx = complaintComments.findIndex((c) => c.id === params.commentId)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    complaintComments.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== HISTORY & STATUS CHANGES ====================

  // Get ticket history
  http.get('/api/complaints/:complaintId/history', async ({ params }) => {
    await mockDelay('read')
    const history = ticketHistories.filter((h) => h.complaintId === params.complaintId)
    return HttpResponse.json({ data: history })
  }),

  // Get status changes
  http.get('/api/complaints/:complaintId/status-changes', async ({ params }) => {
    await mockDelay('read')
    const changes = statusChanges.filter((s) => s.complaintId === params.complaintId)
    return HttpResponse.json({ data: changes })
  }),

  // ==================== RESOLUTION ====================

  // Get resolution
  http.get('/api/complaints/:complaintId/resolution', async ({ params }) => {
    await mockDelay('read')
    const resolution = resolutions.find((r) => r.complaintId === params.complaintId)

    if (!resolution) {
      return HttpResponse.json({ error: 'Resolution not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: resolution })
  }),

  // Create resolution
  http.post('/api/complaints/:complaintId/resolution', async ({ params, request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateResolutionRequest

    const newResolution: Resolution = {
      id: generateId(),
      complaintId: params.complaintId as string,
      summary: body.summary,
      detailedDescription: body.detailedDescription,
      rootCause: body.rootCause,
      actionsTaken: body.actionsTaken,
      preventiveMeasures: body.preventiveMeasures,
      steps: [],
      resolvedBy: 'current-user',
      resolvedByName: 'Current User',
      resolvedAt: new Date().toISOString(),
      reopenCount: 0,
      totalResolutionHours: 24,
      status: 'draft',
    }

    resolutions.unshift(newResolution)

    return HttpResponse.json({ data: newResolution }, { status: 201 })
  }),

  // Update resolution
  http.put('/api/complaints/:complaintId/resolution', async ({ params, request }) => {
    await mockDelay('write')
    const idx = resolutions.findIndex((r) => r.complaintId === params.complaintId)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Resolution not found' }, { status: 404 })
    }

    const body = (await request.json()) as Partial<Omit<CreateResolutionRequest, 'steps'>>
    resolutions[idx] = { ...resolutions[idx], ...body }

    return HttpResponse.json({ data: resolutions[idx] })
  }),

  // Submit resolution
  http.patch('/api/complaints/:complaintId/resolution/submit', async ({ params }) => {
    await mockDelay('write')
    const idx = resolutions.findIndex((r) => r.complaintId === params.complaintId)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Resolution not found' }, { status: 404 })
    }

    resolutions[idx].status = 'submitted'

    // Update complaint status
    const complaintIdx = complaints.findIndex((c) => c.id === params.complaintId)
    if (complaintIdx !== -1) {
      complaints[complaintIdx].status = 'resolved'
      complaints[complaintIdx].resolvedAt = new Date().toISOString()
    }

    return HttpResponse.json({ data: resolutions[idx] })
  }),

  // Verify resolution
  http.patch('/api/complaints/:complaintId/resolution/verify', async ({ params }) => {
    await mockDelay('write')
    const idx = resolutions.findIndex((r) => r.complaintId === params.complaintId)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Resolution not found' }, { status: 404 })
    }

    resolutions[idx].status = 'verified'
    resolutions[idx].verifiedBy = 'current-user'
    resolutions[idx].verifiedByName = 'Current User'
    resolutions[idx].verifiedAt = new Date().toISOString()

    return HttpResponse.json({ data: resolutions[idx] })
  }),

  // Reject resolution
  http.patch('/api/complaints/:complaintId/resolution/reject', async ({ params, request }) => {
    await mockDelay('write')
    const idx = resolutions.findIndex((r) => r.complaintId === params.complaintId)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Resolution not found' }, { status: 404 })
    }

    const body = (await request.json()) as { reason: string }
    resolutions[idx].status = 'rejected'
    resolutions[idx].rejectionReason = body.reason

    // Revert complaint status
    const complaintIdx = complaints.findIndex((c) => c.id === params.complaintId)
    if (complaintIdx !== -1) {
      complaints[complaintIdx].status = 'in_progress'
    }

    return HttpResponse.json({ data: resolutions[idx] })
  }),

  // ==================== SLA CONFIG ====================

  // Get SLA configs
  http.get('/api/complaints/sla-configs', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: slaConfigs })
  }),

  // Get single SLA config
  http.get('/api/complaints/sla-configs/:id', async ({ params }) => {
    await mockDelay('read')
    const config = slaConfigs.find((c) => c.id === params.id)

    if (!config) {
      return HttpResponse.json({ error: 'SLA config not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: config })
  }),

  // Create SLA config
  http.post('/api/complaints/sla-configs', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as Omit<SLAConfig, 'id' | 'createdAt' | 'updatedAt'>

    const newConfig: SLAConfig = {
      ...body,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    slaConfigs.push(newConfig)
    return HttpResponse.json({ data: newConfig }, { status: 201 })
  }),

  // Update SLA config
  http.put('/api/complaints/sla-configs/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = slaConfigs.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'SLA config not found' }, { status: 404 })
    }

    const body = (await request.json()) as Partial<SLAConfig>
    slaConfigs[idx] = {
      ...slaConfigs[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: slaConfigs[idx] })
  }),

  // Delete SLA config
  http.delete('/api/complaints/sla-configs/:id', async ({ params }) => {
    await mockDelay('write')
    const idx = slaConfigs.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'SLA config not found' }, { status: 404 })
    }

    slaConfigs.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // Toggle SLA config
  http.patch('/api/complaints/sla-configs/:id/toggle', async ({ params }) => {
    await mockDelay('write')
    const idx = slaConfigs.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'SLA config not found' }, { status: 404 })
    }

    slaConfigs[idx].isActive = !slaConfigs[idx].isActive
    slaConfigs[idx].updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: slaConfigs[idx] })
  }),

  // ==================== SLA BREACHES ====================

  // Get SLA breaches
  http.get('/api/complaints/sla-breaches', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const total = slaBreaches.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedData = slaBreaches.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: { page, limit, total, totalPages },
    })
  }),

  // Address SLA breach
  http.patch('/api/complaints/sla-breaches/:id/address', async ({ params, request }) => {
    await mockDelay('write')
    const idx = slaBreaches.findIndex((b) => b.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'SLA breach not found' }, { status: 404 })
    }

    const body = (await request.json()) as { reason?: string }
    slaBreaches[idx].status = 'addressed'
    slaBreaches[idx].addressedAt = new Date().toISOString()
    slaBreaches[idx].addressedBy = 'current-user'
    if (body.reason) slaBreaches[idx].reason = body.reason

    return HttpResponse.json({ data: slaBreaches[idx] })
  }),

  // Excuse SLA breach
  http.patch('/api/complaints/sla-breaches/:id/excuse', async ({ params, request }) => {
    await mockDelay('write')
    const idx = slaBreaches.findIndex((b) => b.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'SLA breach not found' }, { status: 404 })
    }

    const body = (await request.json()) as { reason: string }
    slaBreaches[idx].status = 'excused'
    slaBreaches[idx].reason = body.reason

    return HttpResponse.json({ data: slaBreaches[idx] })
  }),

  // ==================== ASSIGNMENT RULES ====================

  // Get assignment rules
  http.get('/api/complaints/assignment-rules', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: assignmentRules })
  }),

  // Get single assignment rule
  http.get('/api/complaints/assignment-rules/:id', async ({ params }) => {
    await mockDelay('read')
    const rule = assignmentRules.find((r) => r.id === params.id)

    if (!rule) {
      return HttpResponse.json({ error: 'Assignment rule not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: rule })
  }),

  // Create assignment rule
  http.post('/api/complaints/assignment-rules', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as Omit<AssignmentRule, 'id' | 'createdAt' | 'updatedAt'>

    const newRule: AssignmentRule = {
      ...body,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    assignmentRules.push(newRule)
    return HttpResponse.json({ data: newRule }, { status: 201 })
  }),

  // Update assignment rule
  http.put('/api/complaints/assignment-rules/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = assignmentRules.findIndex((r) => r.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Assignment rule not found' }, { status: 404 })
    }

    const body = (await request.json()) as Partial<AssignmentRule>
    assignmentRules[idx] = {
      ...assignmentRules[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: assignmentRules[idx] })
  }),

  // Delete assignment rule
  http.delete('/api/complaints/assignment-rules/:id', async ({ params }) => {
    await mockDelay('write')
    const idx = assignmentRules.findIndex((r) => r.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Assignment rule not found' }, { status: 404 })
    }

    assignmentRules.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // Toggle assignment rule
  http.patch('/api/complaints/assignment-rules/:id/toggle', async ({ params }) => {
    await mockDelay('write')
    const idx = assignmentRules.findIndex((r) => r.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Assignment rule not found' }, { status: 404 })
    }

    assignmentRules[idx].isActive = !assignmentRules[idx].isActive
    assignmentRules[idx].updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: assignmentRules[idx] })
  }),

  // Reorder assignment rules
  http.patch('/api/complaints/assignment-rules/reorder', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as { ruleIds: string[] }

    body.ruleIds.forEach((id, index) => {
      const ruleIdx = assignmentRules.findIndex((r) => r.id === id)
      if (ruleIdx !== -1) {
        assignmentRules[ruleIdx].order = index + 1
      }
    })

    return HttpResponse.json({ data: assignmentRules })
  }),

  // ==================== SURVEYS ====================

  // Get surveys
  http.get('/api/complaints/surveys', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...surveys]

    if (status && status !== 'all') {
      filtered = filtered.filter((s) => s.status === status)
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedData = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get single survey
  http.get('/api/complaints/surveys/:id', async ({ params }) => {
    await mockDelay('read')
    const survey = surveys.find((s) => s.id === params.id)

    if (!survey) {
      return HttpResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: survey })
  }),

  // Send survey
  http.post('/api/complaints/surveys/send', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as { complaintId: string }

    const complaint = complaints.find((c) => c.id === body.complaintId)
    if (!complaint) {
      return HttpResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    const now = new Date()
    const expires = new Date(now)
    expires.setDate(expires.getDate() + 7)

    const newSurvey: SatisfactionSurvey = {
      id: generateId(),
      complaintId: body.complaintId,
      ticketNumber: complaint.ticketNumber,
      complainantId: complaint.complainantId || '',
      complainantName: complaint.complainantName || 'Anonymous',
      status: 'sent',
      sentAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      remindersSent: 0,
      createdAt: now.toISOString(),
    }

    surveys.unshift(newSurvey)
    return HttpResponse.json({ data: newSurvey }, { status: 201 })
  }),

  // Send survey reminder
  http.post('/api/complaints/surveys/:id/reminder', async ({ params }) => {
    await mockDelay('write')
    const idx = surveys.findIndex((s) => s.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    surveys[idx].remindersSent++
    surveys[idx].lastReminderAt = new Date().toISOString()

    return HttpResponse.json({ data: surveys[idx] })
  }),

  // Get survey response
  http.get('/api/complaints/surveys/:surveyId/response', async ({ params }) => {
    await mockDelay('read')
    const response = surveyResponses.find((r) => r.surveyId === params.surveyId)

    if (!response) {
      return HttpResponse.json({ error: 'Survey response not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: response })
  }),

  // Submit survey response
  http.post('/api/complaints/surveys/:surveyId/response', async ({ params, request }) => {
    await mockDelay('write')
    const body = (await request.json()) as Omit<
      SurveyResponse,
      'id' | 'surveyId' | 'complaintId' | 'respondedAt'
    >

    const survey = surveys.find((s) => s.id === params.surveyId)
    if (!survey) {
      return HttpResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    const newResponse: SurveyResponse = {
      id: generateId(),
      surveyId: params.surveyId as string,
      complaintId: survey.complaintId,
      ...body,
      respondedAt: new Date().toISOString(),
    }

    surveyResponses.push(newResponse)

    // Update survey status
    const surveyIdx = surveys.findIndex((s) => s.id === params.surveyId)
    if (surveyIdx !== -1) {
      surveys[surveyIdx].status = 'completed'
      surveys[surveyIdx].completedAt = new Date().toISOString()
    }

    return HttpResponse.json({ data: newResponse }, { status: 201 })
  }),

  // Get survey analytics
  http.get('/api/complaints/surveys/analytics', async () => {
    await mockDelay('read')

    const analytics: SurveyAnalytics = {
      totalSurveysSent: surveys.length,
      totalResponses: surveyResponses.length,
      responseRate: surveys.length > 0 ? (surveyResponses.length / surveys.length) * 100 : 0,
      averageOverallSatisfaction:
        surveyResponses.length > 0
          ? surveyResponses.reduce((sum, r) => sum + r.overallSatisfaction, 0) /
            surveyResponses.length
          : 0,
      averageResolutionQuality:
        surveyResponses.length > 0
          ? surveyResponses.reduce((sum, r) => sum + r.resolutionQuality, 0) /
            surveyResponses.length
          : 0,
      averageResponseTime:
        surveyResponses.length > 0
          ? surveyResponses.reduce((sum, r) => sum + r.responseTime, 0) / surveyResponses.length
          : 0,
      averageStaffProfessionalism:
        surveyResponses.length > 0
          ? surveyResponses.reduce((sum, r) => sum + r.staffProfessionalism, 0) /
            surveyResponses.length
          : 0,
      averageCommunicationClarity:
        surveyResponses.length > 0
          ? surveyResponses.reduce((sum, r) => sum + r.communicationClarity, 0) /
            surveyResponses.length
          : 0,
      recommendationRate:
        surveyResponses.length > 0
          ? (surveyResponses.filter((r) => r.wouldRecommend).length / surveyResponses.length) * 100
          : 0,
      categoryBreakdown: [],
      trendData: [],
    }

    return HttpResponse.json({ data: analytics })
  }),

  // ==================== ANONYMOUS FEEDBACK ====================

  // Get anonymous feedback
  http.get('/api/complaints/anonymous', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...anonymousFeedback]

    if (status && status !== 'all') {
      filtered = filtered.filter((f) => f.status === status)
    }
    if (category && category !== 'all') {
      filtered = filtered.filter((f) => f.category === category)
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedData = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedData,
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get single anonymous feedback
  http.get('/api/complaints/anonymous/:id', async ({ params }) => {
    await mockDelay('read')
    const feedback = anonymousFeedback.find((f) => f.id === params.id)

    if (!feedback) {
      return HttpResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: feedback })
  }),

  // Create anonymous feedback
  http.post('/api/complaints/anonymous', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateAnonymousFeedbackRequest

    const feedbackToken = generateFeedbackToken()
    const newFeedback: AnonymousFeedback = {
      id: generateId(),
      feedbackToken,
      category: body.category,
      subject: body.subject,
      description: body.description,
      priority: body.priority || 'medium',
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      isVerified: false,
      responsePosted: false,
    }

    anonymousFeedback.unshift(newFeedback)

    return HttpResponse.json(
      { data: newFeedback, feedbackToken },
      { status: 201 }
    )
  }),

  // Lookup anonymous feedback by token
  http.get('/api/complaints/anonymous/lookup/:token', async ({ params }) => {
    await mockDelay('read')
    const feedback = anonymousFeedback.find((f) => f.feedbackToken === params.token)

    if (!feedback) {
      return HttpResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    return HttpResponse.json({
      data: {
        feedbackToken: feedback.feedbackToken,
        status: feedback.status,
        category: feedback.category,
        subject: feedback.subject,
        submittedAt: feedback.submittedAt,
        publicResponse: feedback.publicResponse,
        responsePostedAt: feedback.responsePostedAt,
      },
    })
  }),

  // Update anonymous feedback
  http.patch('/api/complaints/anonymous/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = anonymousFeedback.findIndex((f) => f.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    const body = (await request.json()) as {
      assignedTo?: string
      internalNotes?: string
      status?: ComplaintStatus
      isVerified?: boolean
    }

    anonymousFeedback[idx] = {
      ...anonymousFeedback[idx],
      ...body,
    }

    return HttpResponse.json({ data: anonymousFeedback[idx] })
  }),

  // Post response to anonymous feedback
  http.post('/api/complaints/anonymous/:id/respond', async ({ params, request }) => {
    await mockDelay('write')
    const idx = anonymousFeedback.findIndex((f) => f.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    const body = (await request.json()) as { publicResponse: string }
    anonymousFeedback[idx].publicResponse = body.publicResponse
    anonymousFeedback[idx].responsePosted = true
    anonymousFeedback[idx].responsePostedAt = new Date().toISOString()
    anonymousFeedback[idx].responsePostedBy = 'current-user'

    return HttpResponse.json({ data: anonymousFeedback[idx] })
  }),

  // ==================== STATS & ANALYTICS ====================

  // Get complaint stats
  http.get('/api/complaints/stats', async () => {
    await mockDelay('read')

    const stats: ComplaintStats = {
      total: complaints.length,
      byStatus: {
        submitted: complaints.filter((c) => c.status === 'submitted').length,
        acknowledged: complaints.filter((c) => c.status === 'acknowledged').length,
        in_progress: complaints.filter((c) => c.status === 'in_progress').length,
        pending_info: complaints.filter((c) => c.status === 'pending_info').length,
        escalated: complaints.filter((c) => c.status === 'escalated').length,
        resolved: complaints.filter((c) => c.status === 'resolved').length,
        closed: complaints.filter((c) => c.status === 'closed').length,
        reopened: complaints.filter((c) => c.status === 'reopened').length,
      },
      byPriority: {
        low: complaints.filter((c) => c.priority === 'low').length,
        medium: complaints.filter((c) => c.priority === 'medium').length,
        high: complaints.filter((c) => c.priority === 'high').length,
        critical: complaints.filter((c) => c.priority === 'critical').length,
      },
      byCategory: {
        academic: complaints.filter((c) => c.category === 'academic').length,
        administrative: complaints.filter((c) => c.category === 'administrative').length,
        facilities: complaints.filter((c) => c.category === 'facilities').length,
        transport: complaints.filter((c) => c.category === 'transport').length,
        cafeteria: complaints.filter((c) => c.category === 'cafeteria').length,
        safety: complaints.filter((c) => c.category === 'safety').length,
        bullying: complaints.filter((c) => c.category === 'bullying').length,
        fees: complaints.filter((c) => c.category === 'fees').length,
        staff_behavior: complaints.filter((c) => c.category === 'staff_behavior').length,
        communication: complaints.filter((c) => c.category === 'communication').length,
        other: complaints.filter((c) => c.category === 'other').length,
      },
      openTickets: complaints.filter(
        (c) => !['resolved', 'closed'].includes(c.status)
      ).length,
      resolvedThisMonth: complaints.filter((c) => {
        if (!c.resolvedAt) return false
        const resolved = new Date(c.resolvedAt)
        const now = new Date()
        return (
          resolved.getMonth() === now.getMonth() &&
          resolved.getFullYear() === now.getFullYear()
        )
      }).length,
      averageResolutionHours: 36,
      slaBreachCount: slaBreaches.filter((b) => b.status === 'open').length,
      slaComplianceRate: 92.5,
      pendingFollowUps: complaints.filter((c) => c.requiresFollowUp).length,
      satisfactionScore: 4.2,
    }

    return HttpResponse.json({ data: stats })
  }),

  // Get complaint trends
  http.get('/api/complaints/trends', async () => {
    await mockDelay('read')

    const trends: ComplaintTrend[] = [
      { date: '2024-01-01', submitted: 15, resolved: 12, escalated: 2 },
      { date: '2024-01-08', submitted: 18, resolved: 14, escalated: 1 },
      { date: '2024-01-15', submitted: 12, resolved: 10, escalated: 3 },
    ]

    return HttpResponse.json({ data: trends })
  }),

  // Get category analytics
  http.get('/api/complaints/analytics/categories', async () => {
    await mockDelay('read')

    const categories: ComplaintCategory[] = [
      'academic',
      'administrative',
      'facilities',
      'transport',
      'cafeteria',
      'safety',
      'bullying',
      'fees',
      'staff_behavior',
      'communication',
      'other',
    ]

    const analytics: CategoryAnalytics[] = categories.map((category) => {
      const categoryComplaints = complaints.filter((c) => c.category === category)
      return {
        category,
        total: categoryComplaints.length,
        resolved: categoryComplaints.filter((c) => c.status === 'resolved').length,
        pending: categoryComplaints.filter(
          (c) => !['resolved', 'closed'].includes(c.status)
        ).length,
        averageResolutionHours: 36,
        slaComplianceRate: 90,
        satisfactionScore: 4.0,
      }
    })

    return HttpResponse.json({ data: analytics })
  }),

  // ==================== UTILITY ====================

  // Get assignable staff
  http.get('/api/complaints/assignable-staff', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: assignableStaff })
  }),

  // Get complaints by student
  http.get('/api/complaints/students/:studentId', async ({ params }) => {
    await mockDelay('read')
    const studentComplaints = complaints.filter((c) => c.studentId === params.studentId)
    return HttpResponse.json({ data: studentComplaints })
  }),

  // Get my complaints (for authenticated user)
  http.get('/api/complaints/my-complaints', async () => {
    await mockDelay('read')
    // In real app, would filter by authenticated user
    return HttpResponse.json({ data: complaints.slice(0, 3) })
  }),

  // Get my children's complaints (for parents)
  http.get('/api/complaints/my-children-complaints', async () => {
    await mockDelay('read')
    // In real app, would filter by parent's children
    return HttpResponse.json({
      data: [
        {
          studentId: 'student-1',
          studentName: 'Arjun Kumar',
          complaints: complaints.filter((c) => c.studentId === 'student-1'),
        },
      ],
    })
  }),
]
