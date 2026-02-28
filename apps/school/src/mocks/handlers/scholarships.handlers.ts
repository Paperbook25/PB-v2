import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import type {
  Scholarship,
  ScholarshipType,
  ScholarshipStatus,
  EligibilityCriteria,
  CriteriaType,
  ScholarshipApplication,
  ApplicationStatus,
  SelectionCommittee,
  CommitteeMember,
  CommitteeMemberRole,
  ReviewScore,
  ApplicationReviewSummary,
  DisbursementSchedule,
  Disbursement,
  PaymentStatus,
  DisbursementFrequency,
  RenewalCriteria,
  RenewalApplication,
  RenewalStatus,
  ScholarshipStats,
  StudentScholarshipSummary,
  CreateScholarshipRequest,
  UpdateScholarshipRequest,
  CreateEligibilityCriteriaRequest,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  CreateCommitteeRequest,
  UpdateCommitteeRequest,
  CreateReviewScoreRequest,
  CreateDisbursementScheduleRequest,
  ProcessDisbursementRequest,
  CreateRenewalCriteriaRequest,
} from '@/features/scholarships/types/scholarships.types'

// Helper to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

function generateCode(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

// ==================== MOCK DATA ====================

const scholarships: Scholarship[] = [
  {
    id: 'sch-1',
    name: 'Merit Excellence Scholarship',
    code: 'MES-2024',
    type: 'merit',
    description: 'Awarded to students with exceptional academic performance (90%+ in previous year)',
    amount: 50,
    amountType: 'percentage',
    maxAmount: 50000,
    availableSlots: 20,
    usedSlots: 12,
    academicYear: '2024-25',
    applicableClasses: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    applicationStartDate: '2024-04-01',
    applicationEndDate: '2024-05-31',
    status: 'active',
    renewalAllowed: true,
    renewalMaxYears: 3,
    fundingSource: 'school',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
  },
  {
    id: 'sch-2',
    name: 'Financial Aid Program',
    code: 'FAP-2024',
    type: 'need_based',
    description: 'Financial assistance for students from economically weaker sections',
    amount: 75,
    amountType: 'percentage',
    maxAmount: 80000,
    availableSlots: 50,
    usedSlots: 35,
    academicYear: '2024-25',
    applicableClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    applicationStartDate: '2024-03-15',
    applicationEndDate: '2024-06-15',
    status: 'active',
    renewalAllowed: true,
    renewalMaxYears: 5,
    fundingSource: 'trust',
    donorName: 'ABC Education Trust',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-03-18T11:20:00Z',
  },
  {
    id: 'sch-3',
    name: 'Sports Excellence Award',
    code: 'SEA-2024',
    type: 'sports',
    description: 'For students who have represented at state/national level in sports',
    amount: 25000,
    amountType: 'fixed',
    availableSlots: 10,
    usedSlots: 6,
    academicYear: '2024-25',
    applicableClasses: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    applicationStartDate: '2024-04-01',
    applicationEndDate: '2024-07-31',
    status: 'active',
    renewalAllowed: true,
    renewalMaxYears: 2,
    fundingSource: 'donor',
    donorName: 'Sports Foundation India',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-03-15T16:45:00Z',
  },
  {
    id: 'sch-4',
    name: 'Staff Ward Concession',
    code: 'SWC-2024',
    type: 'staff_ward',
    description: 'Fee concession for children of school staff members',
    amount: 50,
    amountType: 'percentage',
    availableSlots: 100,
    usedSlots: 28,
    academicYear: '2024-25',
    applicableClasses: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    applicationStartDate: '2024-03-01',
    applicationEndDate: '2024-12-31',
    status: 'active',
    renewalAllowed: true,
    fundingSource: 'school',
    createdAt: '2024-01-05T07:00:00Z',
    updatedAt: '2024-01-05T07:00:00Z',
  },
  {
    id: 'sch-5',
    name: 'Government SC/ST Scholarship',
    code: 'GSCST-2024',
    type: 'government',
    description: 'Government scholarship for SC/ST category students',
    amount: 100,
    amountType: 'percentage',
    availableSlots: 200,
    usedSlots: 145,
    academicYear: '2024-25',
    applicableClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    applicationStartDate: '2024-04-01',
    applicationEndDate: '2024-08-31',
    status: 'active',
    renewalAllowed: true,
    renewalMaxYears: 12,
    fundingSource: 'government',
    createdAt: '2024-02-15T10:30:00Z',
    updatedAt: '2024-04-01T09:00:00Z',
  },
]

const eligibilityCriteria: EligibilityCriteria[] = [
  {
    id: 'ec-1',
    scholarshipId: 'sch-1',
    type: 'academic',
    name: 'Previous Year Percentage',
    description: 'Minimum percentage required in previous academic year',
    operator: 'greater_than_or_equals',
    value: 90,
    weight: 40,
    isMandatory: true,
    order: 1,
  },
  {
    id: 'ec-2',
    scholarshipId: 'sch-1',
    type: 'attendance',
    name: 'Attendance Percentage',
    description: 'Minimum attendance required',
    operator: 'greater_than_or_equals',
    value: 85,
    weight: 20,
    isMandatory: true,
    order: 2,
  },
  {
    id: 'ec-3',
    scholarshipId: 'sch-1',
    type: 'behavior',
    name: 'No Disciplinary Action',
    description: 'Should not have any major disciplinary action in the past year',
    operator: 'less_than_or_equals',
    value: 0,
    weight: 20,
    isMandatory: true,
    order: 3,
  },
  {
    id: 'ec-4',
    scholarshipId: 'sch-2',
    type: 'income',
    name: 'Family Annual Income',
    description: 'Maximum family income limit',
    operator: 'less_than_or_equals',
    value: 300000,
    weight: 50,
    isMandatory: true,
    order: 1,
  },
  {
    id: 'ec-5',
    scholarshipId: 'sch-2',
    type: 'academic',
    name: 'Minimum Passing Marks',
    description: 'Should have passed previous year',
    operator: 'greater_than_or_equals',
    value: 40,
    weight: 30,
    isMandatory: true,
    order: 2,
  },
  {
    id: 'ec-6',
    scholarshipId: 'sch-3',
    type: 'extracurricular',
    name: 'Sports Achievement Level',
    description: 'Minimum level of sports representation',
    operator: 'in',
    value: ['state', 'national', 'international'],
    weight: 60,
    isMandatory: true,
    order: 1,
  },
  {
    id: 'ec-7',
    scholarshipId: 'sch-5',
    type: 'category',
    name: 'Social Category',
    description: 'Must belong to SC or ST category',
    operator: 'in',
    value: ['SC', 'ST'],
    weight: 100,
    isMandatory: true,
    order: 1,
  },
]

const applications: ScholarshipApplication[] = [
  {
    id: 'app-1',
    applicationNumber: 'APP-2024-001',
    scholarshipId: 'sch-1',
    scholarshipName: 'Merit Excellence Scholarship',
    studentId: 'std-1',
    studentName: 'Aarav Sharma',
    studentClass: 'Class 10',
    studentSection: 'A',
    studentRollNumber: 1,
    parentName: 'Rajesh Sharma',
    parentPhone: '+91-9876543210',
    parentEmail: 'rajesh.sharma@email.com',
    statementOfPurpose: 'I aspire to become a software engineer and need financial support to continue my education.',
    achievements: ['School topper in Class 9', 'State-level science olympiad winner'],
    supportingDocuments: [
      {
        name: 'Mark Sheet Class 9',
        type: 'academic',
        url: '/documents/marksheet-class9.pdf',
        uploadedAt: '2024-04-05T10:00:00Z',
      },
    ],
    eligibilityScore: 92,
    status: 'approved',
    submittedAt: '2024-04-10T14:30:00Z',
    reviewedBy: 'Principal Kumar',
    reviewedAt: '2024-04-20T11:00:00Z',
    reviewNotes: 'Excellent academic record. Approved.',
    approvedAmount: 45000,
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-04-20T11:00:00Z',
  },
  {
    id: 'app-2',
    applicationNumber: 'APP-2024-002',
    scholarshipId: 'sch-2',
    scholarshipName: 'Financial Aid Program',
    studentId: 'std-2',
    studentName: 'Priya Patel',
    studentClass: 'Class 8',
    studentSection: 'B',
    studentRollNumber: 15,
    parentName: 'Suresh Patel',
    parentPhone: '+91-9876543211',
    parentEmail: 'suresh.patel@email.com',
    familyIncome: 180000,
    incomeProofUrl: '/documents/income-certificate.pdf',
    statementOfPurpose: 'My father is a daily wage worker and we need financial assistance.',
    supportingDocuments: [
      {
        name: 'Income Certificate',
        type: 'income_proof',
        url: '/documents/income-certificate.pdf',
        uploadedAt: '2024-03-20T09:00:00Z',
      },
      {
        name: 'BPL Card',
        type: 'bpl_card',
        url: '/documents/bpl-card.pdf',
        uploadedAt: '2024-03-20T09:05:00Z',
      },
    ],
    eligibilityScore: 88,
    status: 'under_review',
    submittedAt: '2024-03-25T11:30:00Z',
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-03-25T11:30:00Z',
  },
  {
    id: 'app-3',
    applicationNumber: 'APP-2024-003',
    scholarshipId: 'sch-3',
    scholarshipName: 'Sports Excellence Award',
    studentId: 'std-3',
    studentName: 'Rohit Kumar',
    studentClass: 'Class 11',
    studentSection: 'A',
    studentRollNumber: 8,
    parentName: 'Vikram Kumar',
    parentPhone: '+91-9876543212',
    parentEmail: 'vikram.kumar@email.com',
    achievements: ['State-level cricket player', 'District champion in athletics'],
    supportingDocuments: [
      {
        name: 'Sports Certificate',
        type: 'sports',
        url: '/documents/sports-cert.pdf',
        uploadedAt: '2024-04-15T14:00:00Z',
      },
    ],
    eligibilityScore: 95,
    status: 'shortlisted',
    submittedAt: '2024-04-18T10:00:00Z',
    createdAt: '2024-04-15T14:00:00Z',
    updatedAt: '2024-04-22T16:00:00Z',
  },
  {
    id: 'app-4',
    applicationNumber: 'APP-2024-004',
    scholarshipId: 'sch-1',
    scholarshipName: 'Merit Excellence Scholarship',
    studentId: 'std-4',
    studentName: 'Sneha Reddy',
    studentClass: 'Class 12',
    studentSection: 'A',
    studentRollNumber: 3,
    parentName: 'Ramesh Reddy',
    parentPhone: '+91-9876543213',
    parentEmail: 'ramesh.reddy@email.com',
    statementOfPurpose: 'I aim to pursue medicine and serve rural communities.',
    achievements: ['School topper', 'National merit scholar'],
    supportingDocuments: [],
    eligibilityScore: 78,
    status: 'rejected',
    submittedAt: '2024-04-12T09:30:00Z',
    reviewedBy: 'Principal Kumar',
    reviewedAt: '2024-04-25T10:00:00Z',
    rejectionReason: 'Does not meet minimum attendance criteria (82% < 85%)',
    createdAt: '2024-04-10T15:00:00Z',
    updatedAt: '2024-04-25T10:00:00Z',
  },
  {
    id: 'app-5',
    applicationNumber: 'APP-2024-005',
    scholarshipId: 'sch-2',
    scholarshipName: 'Financial Aid Program',
    studentId: 'std-5',
    studentName: 'Mohammed Ali',
    studentClass: 'Class 6',
    studentSection: 'C',
    studentRollNumber: 22,
    parentName: 'Ahmed Ali',
    parentPhone: '+91-9876543214',
    parentEmail: 'ahmed.ali@email.com',
    familyIncome: 240000,
    statementOfPurpose: 'Seeking financial aid for continuing education.',
    supportingDocuments: [],
    eligibilityScore: 0,
    status: 'draft',
    createdAt: '2024-04-28T08:00:00Z',
    updatedAt: '2024-04-28T08:00:00Z',
  },
]

const committees: SelectionCommittee[] = [
  {
    id: 'comm-1',
    name: 'Merit Scholarship Selection Committee 2024-25',
    description: 'Committee for reviewing merit-based scholarship applications',
    academicYear: '2024-25',
    scholarshipIds: ['sch-1', 'sch-3'],
    members: [
      {
        id: 'mem-1',
        staffId: 'staff-1',
        staffName: 'Dr. Anand Kumar',
        staffEmail: 'anand.kumar@school.edu',
        staffDesignation: 'Principal',
        role: 'chairperson',
        canVote: true,
        joinedAt: '2024-02-01T10:00:00Z',
      },
      {
        id: 'mem-2',
        staffId: 'staff-2',
        staffName: 'Mrs. Sunita Verma',
        staffEmail: 'sunita.verma@school.edu',
        staffDesignation: 'Vice Principal',
        role: 'member',
        canVote: true,
        joinedAt: '2024-02-01T10:00:00Z',
      },
      {
        id: 'mem-3',
        staffId: 'staff-3',
        staffName: 'Mr. Rahul Singh',
        staffEmail: 'rahul.singh@school.edu',
        staffDesignation: 'Senior Teacher',
        role: 'secretary',
        canVote: true,
        joinedAt: '2024-02-01T10:00:00Z',
      },
    ],
    chairpersonId: 'staff-1',
    secretaryId: 'staff-3',
    meetingSchedule: 'Every Saturday 10:00 AM',
    isActive: true,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'comm-2',
    name: 'Financial Aid Review Committee 2024-25',
    description: 'Committee for reviewing need-based scholarship applications',
    academicYear: '2024-25',
    scholarshipIds: ['sch-2'],
    members: [
      {
        id: 'mem-4',
        staffId: 'staff-1',
        staffName: 'Dr. Anand Kumar',
        staffEmail: 'anand.kumar@school.edu',
        staffDesignation: 'Principal',
        role: 'chairperson',
        canVote: true,
        joinedAt: '2024-02-05T10:00:00Z',
      },
      {
        id: 'mem-5',
        staffId: 'staff-4',
        staffName: 'Mr. Vijay Nair',
        staffEmail: 'vijay.nair@school.edu',
        staffDesignation: 'Accountant',
        role: 'member',
        canVote: true,
        joinedAt: '2024-02-05T10:00:00Z',
      },
    ],
    chairpersonId: 'staff-1',
    isActive: true,
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-05T10:00:00Z',
  },
]

const reviewScores: ReviewScore[] = [
  {
    id: 'rev-1',
    applicationId: 'app-1',
    reviewerId: 'staff-1',
    reviewerName: 'Dr. Anand Kumar',
    committeeId: 'comm-1',
    scores: [
      { criteriaId: 'ec-1', criteriaName: 'Previous Year Percentage', score: 38, maxScore: 40, comments: 'Excellent marks - 94%' },
      { criteriaId: 'ec-2', criteriaName: 'Attendance Percentage', score: 18, maxScore: 20, comments: '92% attendance' },
      { criteriaId: 'ec-3', criteriaName: 'No Disciplinary Action', score: 20, maxScore: 20, comments: 'Clean record' },
    ],
    totalScore: 76,
    maxPossibleScore: 80,
    recommendation: 'strongly_recommend',
    comments: 'Outstanding student with consistent performance. Highly recommended.',
    submittedAt: '2024-04-18T15:00:00Z',
  },
  {
    id: 'rev-2',
    applicationId: 'app-1',
    reviewerId: 'staff-2',
    reviewerName: 'Mrs. Sunita Verma',
    committeeId: 'comm-1',
    scores: [
      { criteriaId: 'ec-1', criteriaName: 'Previous Year Percentage', score: 40, maxScore: 40 },
      { criteriaId: 'ec-2', criteriaName: 'Attendance Percentage', score: 19, maxScore: 20 },
      { criteriaId: 'ec-3', criteriaName: 'No Disciplinary Action', score: 20, maxScore: 20 },
    ],
    totalScore: 79,
    maxPossibleScore: 80,
    recommendation: 'strongly_recommend',
    comments: 'Deserving candidate.',
    submittedAt: '2024-04-19T10:30:00Z',
  },
]

const disbursementSchedules: DisbursementSchedule[] = [
  {
    id: 'ds-1',
    applicationId: 'app-1',
    applicationNumber: 'APP-2024-001',
    scholarshipId: 'sch-1',
    scholarshipName: 'Merit Excellence Scholarship',
    studentId: 'std-1',
    studentName: 'Aarav Sharma',
    totalAmount: 45000,
    frequency: 'quarterly',
    installments: [
      { installmentNumber: 1, amount: 11250, dueDate: '2024-05-01', status: 'completed', paidAmount: 11250, paidDate: '2024-05-01', transactionId: 'TXN-001' },
      { installmentNumber: 2, amount: 11250, dueDate: '2024-08-01', status: 'completed', paidAmount: 11250, paidDate: '2024-08-02', transactionId: 'TXN-002' },
      { installmentNumber: 3, amount: 11250, dueDate: '2024-11-01', status: 'pending' },
      { installmentNumber: 4, amount: 11250, dueDate: '2025-02-01', status: 'pending' },
    ],
    startDate: '2024-05-01',
    endDate: '2025-02-01',
    totalDisbursed: 22500,
    totalPending: 22500,
    status: 'active',
    createdAt: '2024-04-25T10:00:00Z',
    updatedAt: '2024-08-02T14:00:00Z',
  },
]

const disbursements: Disbursement[] = [
  {
    id: 'disb-1',
    scheduleId: 'ds-1',
    applicationId: 'app-1',
    scholarshipId: 'sch-1',
    scholarshipName: 'Merit Excellence Scholarship',
    studentId: 'std-1',
    studentName: 'Aarav Sharma',
    studentClass: 'Class 10',
    installmentNumber: 1,
    amount: 11250,
    dueDate: '2024-05-01',
    status: 'completed',
    paymentMethod: 'fee_adjustment',
    paidAmount: 11250,
    paidDate: '2024-05-01',
    processedBy: 'Accountant Vijay',
    processedAt: '2024-05-01T11:00:00Z',
    remarks: 'Adjusted against tuition fee',
    createdAt: '2024-04-25T10:00:00Z',
    updatedAt: '2024-05-01T11:00:00Z',
  },
  {
    id: 'disb-2',
    scheduleId: 'ds-1',
    applicationId: 'app-1',
    scholarshipId: 'sch-1',
    scholarshipName: 'Merit Excellence Scholarship',
    studentId: 'std-1',
    studentName: 'Aarav Sharma',
    studentClass: 'Class 10',
    installmentNumber: 2,
    amount: 11250,
    dueDate: '2024-08-01',
    status: 'completed',
    paymentMethod: 'fee_adjustment',
    paidAmount: 11250,
    paidDate: '2024-08-02',
    processedBy: 'Accountant Vijay',
    processedAt: '2024-08-02T14:00:00Z',
    createdAt: '2024-04-25T10:00:00Z',
    updatedAt: '2024-08-02T14:00:00Z',
  },
  {
    id: 'disb-3',
    scheduleId: 'ds-1',
    applicationId: 'app-1',
    scholarshipId: 'sch-1',
    scholarshipName: 'Merit Excellence Scholarship',
    studentId: 'std-1',
    studentName: 'Aarav Sharma',
    studentClass: 'Class 10',
    installmentNumber: 3,
    amount: 11250,
    dueDate: '2024-11-01',
    status: 'pending',
    createdAt: '2024-04-25T10:00:00Z',
    updatedAt: '2024-04-25T10:00:00Z',
  },
]

const renewalCriteria: RenewalCriteria[] = [
  {
    id: 'rc-1',
    scholarshipId: 'sch-1',
    scholarshipName: 'Merit Excellence Scholarship',
    academicYear: '2024-25',
    minimumAttendancePercentage: 85,
    minimumAcademicPercentage: 85,
    minimumGPA: 3.5,
    maxBehaviorIncidents: 0,
    requiresReapplication: false,
    additionalCriteria: [
      { name: 'Maintained Merit', description: 'Should maintain top 10 rank in class', isMandatory: true },
    ],
    reviewDeadline: '2025-03-31',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
]

const renewalApplications: RenewalApplication[] = [
  {
    id: 'ren-1',
    originalApplicationId: 'app-prev-1',
    originalApplicationNumber: 'APP-2023-001',
    scholarshipId: 'sch-1',
    scholarshipName: 'Merit Excellence Scholarship',
    studentId: 'std-10',
    studentName: 'Arjun Mehta',
    studentClass: 'Class 11',
    previousClass: 'Class 10',
    academicYear: '2024-25',
    previousYearPerformance: {
      attendancePercentage: 94,
      academicPercentage: 92,
      gpa: 3.8,
      behaviorIncidents: 0,
      achievements: ['Class topper', 'Science fair winner'],
    },
    criteriaEvaluation: [
      { criteriaName: 'Attendance', required: '85%', actual: '94%', passed: true },
      { criteriaName: 'Academic Performance', required: '85%', actual: '92%', passed: true },
      { criteriaName: 'Behavior', required: '0 incidents', actual: '0 incidents', passed: true },
    ],
    renewalStatus: 'renewed',
    isAutoRenewed: true,
    renewedAmount: 48000,
    previousAmount: 45000,
    changeInAmount: 3000,
    changeReason: 'Fee increase adjustment',
    reviewedBy: 'Dr. Anand Kumar',
    reviewedAt: '2024-04-15T10:00:00Z',
    reviewNotes: 'Excellent performance maintained. Auto-renewed.',
    newApplicationId: 'app-6',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-04-15T10:00:00Z',
  },
]

// ==================== HANDLERS ====================

export const scholarshipsHandlers = [
  // ==================== SCHOLARSHIP CRUD ====================

  // Get all scholarships
  http.get('/api/scholarships', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const academicYear = url.searchParams.get('academicYear')
    const fundingSource = url.searchParams.get('fundingSource')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...scholarships]

    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.code.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search)
      )
    }
    if (type && type !== 'all') {
      filtered = filtered.filter((s) => s.type === type)
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((s) => s.status === status)
    }
    if (academicYear) {
      filtered = filtered.filter((s) => s.academicYear === academicYear)
    }
    if (fundingSource && fundingSource !== 'all') {
      filtered = filtered.filter((s) => s.fundingSource === fundingSource)
    }

    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filtered.slice(startIndex, startIndex + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get single scholarship
  http.get('/api/scholarships/:id', async ({ params }) => {
    await mockDelay('read')
    const scholarship = scholarships.find((s) => s.id === params.id)

    if (!scholarship) {
      return HttpResponse.json({ error: 'Scholarship not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: scholarship })
  }),

  // Create scholarship
  http.post('/api/scholarships', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateScholarshipRequest

    const newScholarship: Scholarship = {
      id: generateId(),
      code: generateCode('SCH'),
      ...body,
      usedSlots: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    scholarships.unshift(newScholarship)
    return HttpResponse.json({ data: newScholarship }, { status: 201 })
  }),

  // Update scholarship
  http.put('/api/scholarships/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = scholarships.findIndex((s) => s.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Scholarship not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateScholarshipRequest
    scholarships[idx] = {
      ...scholarships[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: scholarships[idx] })
  }),

  // Delete scholarship
  http.delete('/api/scholarships/:id', async ({ params }) => {
    await mockDelay('write')
    const idx = scholarships.findIndex((s) => s.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Scholarship not found' }, { status: 404 })
    }

    // Check for active applications
    const hasApplications = applications.some(
      (a) => a.scholarshipId === params.id && !['withdrawn', 'rejected'].includes(a.status)
    )
    if (hasApplications) {
      return HttpResponse.json(
        { error: 'Cannot delete scholarship with active applications' },
        { status: 400 }
      )
    }

    scholarships.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== ELIGIBILITY CRITERIA ====================

  // Get eligibility criteria for a scholarship
  http.get('/api/scholarships/:scholarshipId/criteria', async ({ params }) => {
    await mockDelay('read')
    const criteria = eligibilityCriteria
      .filter((c) => c.scholarshipId === params.scholarshipId)
      .sort((a, b) => a.order - b.order)

    return HttpResponse.json({ data: criteria })
  }),

  // Create eligibility criteria
  http.post('/api/scholarships/:scholarshipId/criteria', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateEligibilityCriteriaRequest

    const newCriteria: EligibilityCriteria = {
      id: generateId(),
      ...body,
    }

    eligibilityCriteria.push(newCriteria)
    return HttpResponse.json({ data: newCriteria }, { status: 201 })
  }),

  // Update eligibility criteria
  http.patch('/api/scholarships/criteria/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = eligibilityCriteria.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Criteria not found' }, { status: 404 })
    }

    const body = (await request.json()) as Partial<CreateEligibilityCriteriaRequest>
    eligibilityCriteria[idx] = { ...eligibilityCriteria[idx], ...body }

    return HttpResponse.json({ data: eligibilityCriteria[idx] })
  }),

  // Delete eligibility criteria
  http.delete('/api/scholarships/criteria/:id', async ({ params }) => {
    await mockDelay('write')
    const idx = eligibilityCriteria.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Criteria not found' }, { status: 404 })
    }

    eligibilityCriteria.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // Check student eligibility
  http.get('/api/scholarships/:scholarshipId/check-eligibility/:studentId', async ({ params }) => {
    await mockDelay('read')

    // Mock eligibility result
    const result = {
      studentId: params.studentId as string,
      studentName: 'Test Student',
      scholarshipId: params.scholarshipId as string,
      isEligible: Math.random() > 0.3,
      totalScore: Math.floor(Math.random() * 30) + 70,
      maxPossibleScore: 100,
      eligibilityPercentage: Math.floor(Math.random() * 30) + 70,
      checks: [],
      failedMandatoryCriteria: [],
      checkedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: result })
  }),

  // Batch check eligibility
  http.post('/api/scholarships/:scholarshipId/batch-check-eligibility', async ({ params, request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as { studentIds: string[] }

    const results = body.studentIds.map((studentId) => ({
      studentId,
      studentName: `Student ${studentId}`,
      scholarshipId: params.scholarshipId as string,
      isEligible: Math.random() > 0.3,
      totalScore: Math.floor(Math.random() * 30) + 70,
      maxPossibleScore: 100,
      eligibilityPercentage: Math.floor(Math.random() * 30) + 70,
      checks: [],
      failedMandatoryCriteria: [],
      checkedAt: new Date().toISOString(),
    }))

    return HttpResponse.json({ data: results })
  }),

  // ==================== APPLICATIONS ====================

  // Get all applications
  http.get('/api/scholarships/applications', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const scholarshipId = url.searchParams.get('scholarshipId')
    const status = url.searchParams.get('status')
    const studentClass = url.searchParams.get('studentClass')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...applications]

    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.applicationNumber.toLowerCase().includes(search) ||
          a.studentName.toLowerCase().includes(search) ||
          a.scholarshipName.toLowerCase().includes(search)
      )
    }
    if (scholarshipId) {
      filtered = filtered.filter((a) => a.scholarshipId === scholarshipId)
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((a) => a.status === status)
    }
    if (studentClass) {
      filtered = filtered.filter((a) => a.studentClass === studentClass)
    }

    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filtered.slice(startIndex, startIndex + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get single application
  http.get('/api/scholarships/applications/:id', async ({ params }) => {
    await mockDelay('read')
    const application = applications.find((a) => a.id === params.id)

    if (!application) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: application })
  }),

  // Create application
  http.post('/api/scholarships/applications', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateApplicationRequest

    const scholarship = scholarships.find((s) => s.id === body.scholarshipId)
    if (!scholarship) {
      return HttpResponse.json({ error: 'Scholarship not found' }, { status: 404 })
    }

    const newApplication: ScholarshipApplication = {
      id: generateId(),
      applicationNumber: `APP-${new Date().getFullYear()}-${String(applications.length + 1).padStart(3, '0')}`,
      scholarshipId: body.scholarshipId,
      scholarshipName: scholarship.name,
      studentId: body.studentId,
      studentName: 'New Student',
      studentClass: 'Class 10',
      studentSection: 'A',
      studentRollNumber: 1,
      parentName: 'Parent Name',
      parentPhone: '+91-9876543210',
      parentEmail: 'parent@email.com',
      familyIncome: body.familyIncome,
      statementOfPurpose: body.statementOfPurpose,
      achievements: body.achievements,
      supportingDocuments: [],
      eligibilityScore: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    applications.unshift(newApplication)
    return HttpResponse.json({ data: newApplication }, { status: 201 })
  }),

  // Update application
  http.patch('/api/scholarships/applications/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = applications.findIndex((a) => a.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateApplicationRequest
    applications[idx] = {
      ...applications[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: applications[idx] })
  }),

  // Submit application
  http.post('/api/scholarships/applications/:id/submit', async ({ params }) => {
    await mockDelay('write')
    const idx = applications.findIndex((a) => a.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (applications[idx].status !== 'draft') {
      return HttpResponse.json({ error: 'Only draft applications can be submitted' }, { status: 400 })
    }

    applications[idx] = {
      ...applications[idx],
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: applications[idx] })
  }),

  // Withdraw application
  http.post('/api/scholarships/applications/:id/withdraw', async ({ params }) => {
    await mockDelay('write')
    const idx = applications.findIndex((a) => a.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (['approved', 'rejected', 'withdrawn'].includes(applications[idx].status)) {
      return HttpResponse.json({ error: 'Cannot withdraw this application' }, { status: 400 })
    }

    applications[idx] = {
      ...applications[idx],
      status: 'withdrawn',
      updatedAt: new Date().toISOString(),
    }

    // Update scholarship slots
    const schIdx = scholarships.findIndex((s) => s.id === applications[idx].scholarshipId)
    if (schIdx !== -1 && scholarships[schIdx].usedSlots > 0) {
      scholarships[schIdx].usedSlots--
    }

    return HttpResponse.json({ data: applications[idx] })
  }),

  // Update application status
  http.patch('/api/scholarships/applications/:id/status', async ({ params, request }) => {
    await mockDelay('write')
    const idx = applications.findIndex((a) => a.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const body = (await request.json()) as {
      status: string
      reviewNotes?: string
      rejectionReason?: string
      approvedAmount?: number
    }

    applications[idx] = {
      ...applications[idx],
      status: body.status as ApplicationStatus,
      reviewNotes: body.reviewNotes,
      rejectionReason: body.rejectionReason,
      approvedAmount: body.approvedAmount,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Current User',
      updatedAt: new Date().toISOString(),
    }

    // Update scholarship slots if approved
    if (body.status === 'approved') {
      const schIdx = scholarships.findIndex((s) => s.id === applications[idx].scholarshipId)
      if (schIdx !== -1) {
        scholarships[schIdx].usedSlots++
      }
    }

    return HttpResponse.json({ data: applications[idx] })
  }),

  // Upload application document
  http.post('/api/scholarships/applications/:id/documents', async ({ params, request }) => {
    await mockDelay('write')
    const idx = applications.findIndex((a) => a.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const body = (await request.json()) as { name: string; type: string; url: string }

    applications[idx].supportingDocuments.push({
      ...body,
      uploadedAt: new Date().toISOString(),
    })
    applications[idx].updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: applications[idx] })
  }),

  // ==================== COMMITTEES ====================

  // Get all committees
  http.get('/api/scholarships/committees', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const academicYear = url.searchParams.get('academicYear')
    const isActive = url.searchParams.get('isActive')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...committees]

    if (academicYear) {
      filtered = filtered.filter((c) => c.academicYear === academicYear)
    }
    if (isActive !== null) {
      filtered = filtered.filter((c) => c.isActive === (isActive === 'true'))
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filtered.slice(startIndex, startIndex + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get single committee
  http.get('/api/scholarships/committees/:id', async ({ params }) => {
    await mockDelay('read')
    const committee = committees.find((c) => c.id === params.id)

    if (!committee) {
      return HttpResponse.json({ error: 'Committee not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: committee })
  }),

  // Create committee
  http.post('/api/scholarships/committees', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateCommitteeRequest

    const members: CommitteeMember[] = body.members.map((m) => ({
      id: generateId(),
      staffId: m.staffId,
      staffName: `Staff ${m.staffId}`,
      staffEmail: `staff${m.staffId}@school.edu`,
      staffDesignation: 'Teacher',
      role: m.role as CommitteeMemberRole,
      canVote: m.canVote,
      joinedAt: new Date().toISOString(),
    }))

    const chairperson = members.find((m) => m.role === 'chairperson')
    const secretary = members.find((m) => m.role === 'secretary')

    const newCommittee: SelectionCommittee = {
      id: generateId(),
      name: body.name,
      description: body.description,
      academicYear: body.academicYear,
      scholarshipIds: body.scholarshipIds,
      members,
      chairpersonId: chairperson?.staffId || members[0]?.staffId || '',
      secretaryId: secretary?.staffId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    committees.unshift(newCommittee)
    return HttpResponse.json({ data: newCommittee }, { status: 201 })
  }),

  // Update committee
  http.put('/api/scholarships/committees/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = committees.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Committee not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateCommitteeRequest

    // Handle members separately if provided
    const { members: memberUpdates, ...otherUpdates } = body

    committees[idx] = {
      ...committees[idx],
      ...otherUpdates,
      updatedAt: new Date().toISOString(),
    }

    // If members were provided, convert them to full CommitteeMember objects
    if (memberUpdates) {
      committees[idx].members = memberUpdates.map((m) => ({
        id: generateId(),
        staffId: m.staffId,
        staffName: `Staff ${m.staffId}`,
        staffEmail: `staff${m.staffId}@school.edu`,
        staffDesignation: 'Teacher',
        role: m.role as CommitteeMemberRole,
        canVote: m.canVote,
        joinedAt: new Date().toISOString(),
      }))

      // Update chairperson and secretary IDs
      const chairperson = committees[idx].members.find((m) => m.role === 'chairperson')
      const secretary = committees[idx].members.find((m) => m.role === 'secretary')
      if (chairperson) {
        committees[idx].chairpersonId = chairperson.staffId
      }
      if (secretary) {
        committees[idx].secretaryId = secretary.staffId
      }
    }

    return HttpResponse.json({ data: committees[idx] })
  }),

  // Delete committee
  http.delete('/api/scholarships/committees/:id', async ({ params }) => {
    await mockDelay('write')
    const idx = committees.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Committee not found' }, { status: 404 })
    }

    committees.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // Add committee member
  http.post('/api/scholarships/committees/:id/members', async ({ params, request }) => {
    await mockDelay('write')
    const idx = committees.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Committee not found' }, { status: 404 })
    }

    const body = (await request.json()) as { staffId: string; role: string; canVote: boolean }

    const newMember: CommitteeMember = {
      id: generateId(),
      staffId: body.staffId,
      staffName: `Staff ${body.staffId}`,
      staffEmail: `staff${body.staffId}@school.edu`,
      staffDesignation: 'Teacher',
      role: body.role as CommitteeMemberRole,
      canVote: body.canVote,
      joinedAt: new Date().toISOString(),
    }

    committees[idx].members.push(newMember)
    committees[idx].updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: committees[idx] })
  }),

  // Remove committee member
  http.delete('/api/scholarships/committees/:committeeId/members/:memberId', async ({ params }) => {
    await mockDelay('write')
    const idx = committees.findIndex((c) => c.id === params.committeeId)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Committee not found' }, { status: 404 })
    }

    const memberIdx = committees[idx].members.findIndex((m) => m.id === params.memberId)
    if (memberIdx === -1) {
      return HttpResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    committees[idx].members.splice(memberIdx, 1)
    committees[idx].updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: committees[idx] })
  }),

  // ==================== REVIEWS ====================

  // Get reviews for an application
  http.get('/api/scholarships/applications/:id/reviews', async ({ params }) => {
    await mockDelay('read')
    const reviews = reviewScores.filter((r) => r.applicationId === params.id)
    return HttpResponse.json({ data: reviews })
  }),

  // Create review
  http.post('/api/scholarships/applications/:id/reviews', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateReviewScoreRequest

    const totalScore = body.scores.reduce((sum, s) => sum + s.score, 0)
    const maxScore = body.scores.length * 20 // Assuming max 20 per criteria

    const newReview: ReviewScore = {
      id: generateId(),
      applicationId: body.applicationId,
      reviewerId: 'current-user',
      reviewerName: 'Current User',
      committeeId: body.committeeId,
      scores: body.scores.map((s) => ({
        criteriaId: s.criteriaId,
        criteriaName: `Criteria ${s.criteriaId}`,
        score: s.score,
        maxScore: 20,
        comments: s.comments,
      })),
      totalScore,
      maxPossibleScore: maxScore,
      recommendation: body.recommendation,
      comments: body.comments,
      submittedAt: new Date().toISOString(),
    }

    reviewScores.push(newReview)
    return HttpResponse.json({ data: newReview }, { status: 201 })
  }),

  // Update review
  http.patch('/api/scholarships/reviews/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = reviewScores.findIndex((r) => r.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const body = (await request.json()) as Partial<CreateReviewScoreRequest>

    if (body.scores) {
      const totalScore = body.scores.reduce((sum, s) => sum + s.score, 0)
      reviewScores[idx].scores = body.scores.map((s) => ({
        criteriaId: s.criteriaId,
        criteriaName: `Criteria ${s.criteriaId}`,
        score: s.score,
        maxScore: 20,
        comments: s.comments,
      }))
      reviewScores[idx].totalScore = totalScore
    }
    if (body.recommendation) {
      reviewScores[idx].recommendation = body.recommendation
    }
    if (body.comments) {
      reviewScores[idx].comments = body.comments
    }

    return HttpResponse.json({ data: reviewScores[idx] })
  }),

  // Get application review summary
  http.get('/api/scholarships/applications/:id/review-summary', async ({ params }) => {
    await mockDelay('read')
    const appReviews = reviewScores.filter((r) => r.applicationId === params.id)
    const application = applications.find((a) => a.id === params.id)

    if (!application) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const avgScore = appReviews.length > 0
      ? appReviews.reduce((sum, r) => sum + r.totalScore, 0) / appReviews.length
      : 0
    const maxScore = appReviews.length > 0 ? appReviews[0].maxPossibleScore : 100

    const summary: ApplicationReviewSummary = {
      applicationId: params.id as string,
      applicationNumber: application.applicationNumber,
      studentName: application.studentName,
      scholarshipName: application.scholarshipName,
      totalReviews: appReviews.length,
      averageScore: avgScore,
      maxPossibleScore: maxScore,
      scorePercentage: maxScore > 0 ? (avgScore / maxScore) * 100 : 0,
      recommendations: {
        strongly_recommend: appReviews.filter((r) => r.recommendation === 'strongly_recommend').length,
        recommend: appReviews.filter((r) => r.recommendation === 'recommend').length,
        neutral: appReviews.filter((r) => r.recommendation === 'neutral').length,
        not_recommend: appReviews.filter((r) => r.recommendation === 'not_recommend').length,
        strongly_not_recommend: appReviews.filter((r) => r.recommendation === 'strongly_not_recommend').length,
      },
      reviews: appReviews,
    }

    return HttpResponse.json({ data: summary })
  }),

  // Make final decision
  http.post('/api/scholarships/applications/:id/final-decision', async ({ params, request }) => {
    await mockDelay('write')
    const appIdx = applications.findIndex((a) => a.id === params.id)

    if (appIdx === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const body = (await request.json()) as { status: string; approvedAmount?: number; notes?: string }

    applications[appIdx] = {
      ...applications[appIdx],
      status: body.status as ApplicationStatus,
      approvedAmount: body.approvedAmount,
      reviewNotes: body.notes,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Current User',
      updatedAt: new Date().toISOString(),
    }

    // Update used slots
    if (body.status === 'approved') {
      const schIdx = scholarships.findIndex((s) => s.id === applications[appIdx].scholarshipId)
      if (schIdx !== -1) {
        scholarships[schIdx].usedSlots++
      }
    }

    const summary: ApplicationReviewSummary = {
      applicationId: params.id as string,
      applicationNumber: applications[appIdx].applicationNumber,
      studentName: applications[appIdx].studentName,
      scholarshipName: applications[appIdx].scholarshipName,
      totalReviews: 0,
      averageScore: 0,
      maxPossibleScore: 100,
      scorePercentage: 0,
      recommendations: { strongly_recommend: 0, recommend: 0, neutral: 0, not_recommend: 0, strongly_not_recommend: 0 },
      reviews: [],
      finalDecision: body.status as ApplicationStatus,
      finalDecisionBy: 'Current User',
      finalDecisionAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: summary })
  }),

  // ==================== DISBURSEMENTS ====================

  // Get disbursement schedules
  http.get('/api/scholarships/disbursement-schedules', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const total = disbursementSchedules.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: disbursementSchedules.slice(startIndex, startIndex + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get single disbursement schedule
  http.get('/api/scholarships/disbursement-schedules/:id', async ({ params }) => {
    await mockDelay('read')
    const schedule = disbursementSchedules.find((s) => s.id === params.id)

    if (!schedule) {
      return HttpResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: schedule })
  }),

  // Create disbursement schedule
  http.post('/api/scholarships/disbursement-schedules', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateDisbursementScheduleRequest

    const application = applications.find((a) => a.id === body.applicationId)
    if (!application) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const numInstallments = body.frequency === 'one_time' ? 1 :
      body.frequency === 'monthly' ? 12 :
      body.frequency === 'quarterly' ? 4 :
      body.frequency === 'half_yearly' ? 2 : 1

    const installmentAmount = body.totalAmount / numInstallments
    const startDate = new Date(body.startDate)

    const installments = Array.from({ length: numInstallments }, (_, i) => {
      const dueDate = new Date(startDate)
      if (body.frequency === 'monthly') {
        dueDate.setMonth(dueDate.getMonth() + i)
      } else if (body.frequency === 'quarterly') {
        dueDate.setMonth(dueDate.getMonth() + i * 3)
      } else if (body.frequency === 'half_yearly') {
        dueDate.setMonth(dueDate.getMonth() + i * 6)
      } else if (body.frequency === 'yearly') {
        dueDate.setFullYear(dueDate.getFullYear() + i)
      }

      return {
        installmentNumber: i + 1,
        amount: body.installmentAmounts?.[i] || installmentAmount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending' as PaymentStatus,
      }
    })

    const endDate = new Date(installments[installments.length - 1].dueDate)

    const newSchedule: DisbursementSchedule = {
      id: generateId(),
      applicationId: body.applicationId,
      applicationNumber: application.applicationNumber,
      scholarshipId: application.scholarshipId,
      scholarshipName: application.scholarshipName,
      studentId: application.studentId,
      studentName: application.studentName,
      totalAmount: body.totalAmount,
      frequency: body.frequency,
      installments,
      startDate: body.startDate,
      endDate: endDate.toISOString().split('T')[0],
      totalDisbursed: 0,
      totalPending: body.totalAmount,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    disbursementSchedules.push(newSchedule)

    // Create individual disbursement records
    installments.forEach((inst) => {
      const disb: Disbursement = {
        id: generateId(),
        scheduleId: newSchedule.id,
        applicationId: body.applicationId,
        scholarshipId: application.scholarshipId,
        scholarshipName: application.scholarshipName,
        studentId: application.studentId,
        studentName: application.studentName,
        studentClass: application.studentClass,
        installmentNumber: inst.installmentNumber,
        amount: inst.amount,
        dueDate: inst.dueDate,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      disbursements.push(disb)
    })

    return HttpResponse.json({ data: newSchedule }, { status: 201 })
  }),

  // Get disbursements
  http.get('/api/scholarships/disbursements', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const status = url.searchParams.get('status')
    const scholarshipId = url.searchParams.get('scholarshipId')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...disbursements]

    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.studentName.toLowerCase().includes(search) ||
          d.scholarshipName.toLowerCase().includes(search)
      )
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((d) => d.status === status)
    }
    if (scholarshipId) {
      filtered = filtered.filter((d) => d.scholarshipId === scholarshipId)
    }

    filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filtered.slice(startIndex, startIndex + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get single disbursement
  http.get('/api/scholarships/disbursements/:id', async ({ params }) => {
    await mockDelay('read')
    const disbursement = disbursements.find((d) => d.id === params.id)

    if (!disbursement) {
      return HttpResponse.json({ error: 'Disbursement not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: disbursement })
  }),

  // Process disbursement
  http.post('/api/scholarships/disbursements/:id/process', async ({ params, request }) => {
    await mockDelay('write')
    const idx = disbursements.findIndex((d) => d.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Disbursement not found' }, { status: 404 })
    }

    const body = (await request.json()) as ProcessDisbursementRequest

    disbursements[idx] = {
      ...disbursements[idx],
      status: 'completed',
      paymentMethod: body.paymentMethod,
      paidAmount: body.paidAmount,
      paidDate: new Date().toISOString().split('T')[0],
      transactionId: body.transactionId,
      remarks: body.remarks,
      processedBy: 'Current User',
      processedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Update schedule
    const scheduleIdx = disbursementSchedules.findIndex((s) => s.id === disbursements[idx].scheduleId)
    if (scheduleIdx !== -1) {
      const schedule = disbursementSchedules[scheduleIdx]
      schedule.totalDisbursed += body.paidAmount
      schedule.totalPending -= body.paidAmount
      const instIdx = schedule.installments.findIndex(
        (i) => i.installmentNumber === disbursements[idx].installmentNumber
      )
      if (instIdx !== -1) {
        schedule.installments[instIdx].status = 'completed'
        schedule.installments[instIdx].paidAmount = body.paidAmount
        schedule.installments[instIdx].paidDate = new Date().toISOString().split('T')[0]
        schedule.installments[instIdx].transactionId = body.transactionId
      }
      if (schedule.totalPending === 0) {
        schedule.status = 'completed'
      }
      schedule.updatedAt = new Date().toISOString()
    }

    return HttpResponse.json({ data: disbursements[idx] })
  }),

  // Cancel disbursement
  http.post('/api/scholarships/disbursements/:id/cancel', async ({ params, request }) => {
    await mockDelay('write')
    const idx = disbursements.findIndex((d) => d.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Disbursement not found' }, { status: 404 })
    }

    const body = (await request.json()) as { reason: string }

    disbursements[idx] = {
      ...disbursements[idx],
      status: 'cancelled',
      remarks: body.reason,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: disbursements[idx] })
  }),

  // ==================== RENEWALS ====================

  // Get renewal criteria
  http.get('/api/scholarships/:scholarshipId/renewal-criteria', async ({ params }) => {
    await mockDelay('read')
    const criteria = renewalCriteria.filter((c) => c.scholarshipId === params.scholarshipId)
    return HttpResponse.json({ data: criteria })
  }),

  // Create renewal criteria
  http.post('/api/scholarships/:scholarshipId/renewal-criteria', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateRenewalCriteriaRequest

    const scholarship = scholarships.find((s) => s.id === body.scholarshipId)
    if (!scholarship) {
      return HttpResponse.json({ error: 'Scholarship not found' }, { status: 404 })
    }

    const newCriteria: RenewalCriteria = {
      id: generateId(),
      scholarshipName: scholarship.name,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    renewalCriteria.push(newCriteria)
    return HttpResponse.json({ data: newCriteria }, { status: 201 })
  }),

  // Update renewal criteria
  http.patch('/api/scholarships/renewal-criteria/:id', async ({ params, request }) => {
    await mockDelay('write')
    const idx = renewalCriteria.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Criteria not found' }, { status: 404 })
    }

    const body = (await request.json()) as Partial<CreateRenewalCriteriaRequest>
    renewalCriteria[idx] = {
      ...renewalCriteria[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: renewalCriteria[idx] })
  }),

  // Delete renewal criteria
  http.delete('/api/scholarships/renewal-criteria/:id', async ({ params }) => {
    await mockDelay('write')
    const idx = renewalCriteria.findIndex((c) => c.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Criteria not found' }, { status: 404 })
    }

    renewalCriteria.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // Get renewal applications
  http.get('/api/scholarships/renewals', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const status = url.searchParams.get('status')
    const scholarshipId = url.searchParams.get('scholarshipId')
    const academicYear = url.searchParams.get('academicYear')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...renewalApplications]

    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.studentName.toLowerCase().includes(search) ||
          r.scholarshipName.toLowerCase().includes(search)
      )
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.renewalStatus === status)
    }
    if (scholarshipId) {
      filtered = filtered.filter((r) => r.scholarshipId === scholarshipId)
    }
    if (academicYear) {
      filtered = filtered.filter((r) => r.academicYear === academicYear)
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filtered.slice(startIndex, startIndex + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get single renewal application
  http.get('/api/scholarships/renewals/:id', async ({ params }) => {
    await mockDelay('read')
    const renewal = renewalApplications.find((r) => r.id === params.id)

    if (!renewal) {
      return HttpResponse.json({ error: 'Renewal application not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: renewal })
  }),

  // Process renewal
  http.post('/api/scholarships/renewals/:id/process', async ({ params, request }) => {
    await mockDelay('write')
    const idx = renewalApplications.findIndex((r) => r.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Renewal application not found' }, { status: 404 })
    }

    const body = (await request.json()) as {
      renewalStatus: string
      renewedAmount?: number
      changeReason?: string
      reviewNotes?: string
    }

    renewalApplications[idx] = {
      ...renewalApplications[idx],
      renewalStatus: body.renewalStatus as RenewalStatus,
      renewedAmount: body.renewedAmount,
      changeInAmount: body.renewedAmount
        ? body.renewedAmount - renewalApplications[idx].previousAmount
        : undefined,
      changeReason: body.changeReason,
      reviewNotes: body.reviewNotes,
      reviewedBy: 'Current User',
      reviewedAt: new Date().toISOString(),
      isAutoRenewed: false,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: renewalApplications[idx] })
  }),

  // Initiate renewal review
  http.post('/api/scholarships/:scholarshipId/initiate-renewal', async ({ params, request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as { academicYear: string }

    // Mock: would normally create renewal applications for all eligible students
    return HttpResponse.json({
      data: {
        initiated: Math.floor(Math.random() * 20) + 5,
        skipped: Math.floor(Math.random() * 5),
      },
    })
  }),

  // ==================== STATISTICS ====================

  // Get scholarship statistics
  http.get('/api/scholarships/stats', async () => {
    await mockDelay('read')

    const stats: ScholarshipStats = {
      totalScholarships: scholarships.length,
      activeScholarships: scholarships.filter((s) => s.status === 'active').length,
      totalApplications: applications.length,
      pendingApplications: applications.filter((a) =>
        ['submitted', 'under_review', 'shortlisted'].includes(a.status)
      ).length,
      approvedApplications: applications.filter((a) => a.status === 'approved').length,
      totalDisbursed: disbursements
        .filter((d) => d.status === 'completed')
        .reduce((sum, d) => sum + (d.paidAmount || 0), 0),
      totalPendingDisbursement: disbursements
        .filter((d) => d.status === 'pending')
        .reduce((sum, d) => sum + d.amount, 0),
      totalBeneficiaries: new Set(
        applications.filter((a) => a.status === 'approved').map((a) => a.studentId)
      ).size,
      renewalRate: 85.5,
      byType: [
        { type: 'merit', count: 2, amount: 95000 },
        { type: 'need_based', count: 3, amount: 180000 },
        { type: 'sports', count: 1, amount: 25000 },
        { type: 'staff_ward', count: 1, amount: 45000 },
        { type: 'government', count: 2, amount: 200000 },
      ],
      byStatus: [
        { status: 'approved', count: 15 },
        { status: 'under_review', count: 8 },
        { status: 'shortlisted', count: 5 },
        { status: 'submitted', count: 12 },
        { status: 'rejected', count: 4 },
        { status: 'draft', count: 6 },
      ],
      monthlyDisbursements: [
        { month: '2024-01', amount: 45000, count: 12 },
        { month: '2024-02', amount: 52000, count: 15 },
        { month: '2024-03', amount: 48000, count: 14 },
        { month: '2024-04', amount: 55000, count: 16 },
        { month: '2024-05', amount: 62000, count: 18 },
        { month: '2024-06', amount: 58000, count: 17 },
      ],
    }

    return HttpResponse.json({ data: stats })
  }),

  // Get student scholarship summary
  http.get('/api/scholarships/student/:studentId/summary', async ({ params }) => {
    await mockDelay('read')

    const studentApps = applications.filter((a) => a.studentId === params.studentId)
    const activeApps = studentApps.filter((a) => a.status === 'approved')

    const summary: StudentScholarshipSummary = {
      studentId: params.studentId as string,
      studentName: studentApps[0]?.studentName || 'Unknown Student',
      studentClass: studentApps[0]?.studentClass || 'Unknown',
      activeScholarships: activeApps.length,
      totalAmountReceived: disbursements
        .filter((d) => d.studentId === params.studentId && d.status === 'completed')
        .reduce((sum, d) => sum + (d.paidAmount || 0), 0),
      pendingAmount: disbursements
        .filter((d) => d.studentId === params.studentId && d.status === 'pending')
        .reduce((sum, d) => sum + d.amount, 0),
      scholarships: studentApps.map((a) => ({
        scholarshipId: a.scholarshipId,
        scholarshipName: a.scholarshipName,
        amount: a.approvedAmount || 0,
        status: a.status,
        disbursementStatus: a.status === 'approved' ? 'active' : 'not_started',
      })),
    }

    return HttpResponse.json({ data: summary })
  }),
]
