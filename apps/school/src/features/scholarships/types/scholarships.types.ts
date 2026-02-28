// ==================== SCHOLARSHIP DEFINITION TYPES ====================

export type ScholarshipType = 'merit' | 'need_based' | 'sports' | 'cultural' | 'minority' | 'disability' | 'sibling' | 'staff_ward' | 'government'

export type ScholarshipStatus = 'draft' | 'active' | 'suspended' | 'expired' | 'archived'

export const SCHOLARSHIP_TYPE_LABELS: Record<ScholarshipType, string> = {
  merit: 'Merit Scholarship',
  need_based: 'Need-Based Scholarship',
  sports: 'Sports Scholarship',
  cultural: 'Cultural & Arts Scholarship',
  minority: 'Minority Scholarship',
  disability: 'Disability Scholarship',
  sibling: 'Sibling Discount',
  staff_ward: 'Staff Ward Scholarship',
  government: 'Government Scholarship',
}

export const SCHOLARSHIP_STATUS_LABELS: Record<ScholarshipStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  suspended: 'Suspended',
  expired: 'Expired',
  archived: 'Archived',
}

export interface Scholarship {
  id: string
  name: string
  code: string
  type: ScholarshipType
  description: string
  amount: number
  amountType: 'fixed' | 'percentage'
  maxAmount?: number
  availableSlots: number
  usedSlots: number
  academicYear: string
  applicableClasses: string[]
  applicationStartDate: string
  applicationEndDate: string
  status: ScholarshipStatus
  renewalAllowed: boolean
  renewalMaxYears?: number
  fundingSource: 'school' | 'government' | 'donor' | 'trust'
  donorName?: string
  createdAt: string
  updatedAt: string
}

export interface CreateScholarshipRequest {
  name: string
  type: ScholarshipType
  description: string
  amount: number
  amountType: 'fixed' | 'percentage'
  maxAmount?: number
  availableSlots: number
  academicYear: string
  applicableClasses: string[]
  applicationStartDate: string
  applicationEndDate: string
  renewalAllowed: boolean
  renewalMaxYears?: number
  fundingSource: 'school' | 'government' | 'donor' | 'trust'
  donorName?: string
}

export interface UpdateScholarshipRequest extends Partial<CreateScholarshipRequest> {
  status?: ScholarshipStatus
}

export interface ScholarshipFilters {
  search?: string
  type?: ScholarshipType | 'all'
  status?: ScholarshipStatus | 'all'
  academicYear?: string
  fundingSource?: string | 'all'
}

// ==================== ELIGIBILITY CRITERIA TYPES ====================

export type CriteriaType = 'academic' | 'income' | 'attendance' | 'behavior' | 'extracurricular' | 'category' | 'custom'

export const CRITERIA_TYPE_LABELS: Record<CriteriaType, string> = {
  academic: 'Academic Performance',
  income: 'Family Income',
  attendance: 'Attendance Requirement',
  behavior: 'Behavior Record',
  extracurricular: 'Extracurricular Activities',
  category: 'Social Category',
  custom: 'Custom Criteria',
}

export interface EligibilityCriteria {
  id: string
  scholarshipId: string
  type: CriteriaType
  name: string
  description: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_than_or_equals' | 'less_than_or_equals' | 'in' | 'not_in' | 'between'
  value: string | number | string[] | number[]
  secondaryValue?: string | number // For 'between' operator
  weight: number // For scoring
  isMandatory: boolean
  order: number
}

export interface CreateEligibilityCriteriaRequest {
  scholarshipId: string
  type: CriteriaType
  name: string
  description: string
  operator: EligibilityCriteria['operator']
  value: string | number | string[] | number[]
  secondaryValue?: string | number
  weight: number
  isMandatory: boolean
  order: number
}

export interface EligibilityCheck {
  criteriaId: string
  criteriaName: string
  criteriaType: CriteriaType
  isPassed: boolean
  isMandatory: boolean
  actualValue: string | number
  requiredValue: string | number | string[] | number[]
  score: number
  maxScore: number
  message: string
}

export interface EligibilityResult {
  studentId: string
  studentName: string
  scholarshipId: string
  isEligible: boolean
  totalScore: number
  maxPossibleScore: number
  eligibilityPercentage: number
  checks: EligibilityCheck[]
  failedMandatoryCriteria: string[]
  checkedAt: string
}

// ==================== APPLICATION TYPES ====================

export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'shortlisted' | 'approved' | 'rejected' | 'waitlisted' | 'withdrawn'

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  approved: 'Approved',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
  withdrawn: 'Withdrawn',
}

export interface ScholarshipApplication {
  id: string
  applicationNumber: string
  scholarshipId: string
  scholarshipName: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  studentRollNumber: number
  parentName: string
  parentPhone: string
  parentEmail: string
  familyIncome?: number
  incomeProofUrl?: string
  statementOfPurpose?: string
  achievements?: string[]
  supportingDocuments: {
    name: string
    type: string
    url: string
    uploadedAt: string
  }[]
  eligibilityScore: number
  status: ApplicationStatus
  submittedAt?: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  rejectionReason?: string
  approvedAmount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateApplicationRequest {
  scholarshipId: string
  studentId: string
  familyIncome?: number
  statementOfPurpose?: string
  achievements?: string[]
}

export interface UpdateApplicationRequest {
  familyIncome?: number
  incomeProofUrl?: string
  statementOfPurpose?: string
  achievements?: string[]
  supportingDocuments?: {
    name: string
    type: string
    url: string
    uploadedAt: string
  }[]
}

export interface ApplicationFilters {
  search?: string
  scholarshipId?: string
  status?: ApplicationStatus | 'all'
  studentClass?: string
  fromDate?: string
  toDate?: string
}

// ==================== SELECTION COMMITTEE TYPES ====================

export type CommitteeMemberRole = 'chairperson' | 'member' | 'secretary' | 'observer'

export const COMMITTEE_MEMBER_ROLE_LABELS: Record<CommitteeMemberRole, string> = {
  chairperson: 'Chairperson',
  member: 'Member',
  secretary: 'Secretary',
  observer: 'Observer',
}

export interface CommitteeMember {
  id: string
  staffId: string
  staffName: string
  staffEmail: string
  staffDesignation: string
  role: CommitteeMemberRole
  canVote: boolean
  joinedAt: string
}

export interface SelectionCommittee {
  id: string
  name: string
  description?: string
  academicYear: string
  scholarshipIds: string[]
  members: CommitteeMember[]
  chairpersonId: string
  secretaryId?: string
  meetingSchedule?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCommitteeRequest {
  name: string
  description?: string
  academicYear: string
  scholarshipIds: string[]
  members: {
    staffId: string
    role: CommitteeMemberRole
    canVote: boolean
  }[]
}

export interface UpdateCommitteeRequest extends Partial<CreateCommitteeRequest> {
  isActive?: boolean
}

export interface ReviewScore {
  id: string
  applicationId: string
  reviewerId: string
  reviewerName: string
  committeeId: string
  scores: {
    criteriaId: string
    criteriaName: string
    score: number
    maxScore: number
    comments?: string
  }[]
  totalScore: number
  maxPossibleScore: number
  recommendation: 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend' | 'strongly_not_recommend'
  comments: string
  submittedAt: string
}

export interface CreateReviewScoreRequest {
  applicationId: string
  committeeId: string
  scores: {
    criteriaId: string
    score: number
    comments?: string
  }[]
  recommendation: ReviewScore['recommendation']
  comments: string
}

export interface ApplicationReviewSummary {
  applicationId: string
  applicationNumber: string
  studentName: string
  scholarshipName: string
  totalReviews: number
  averageScore: number
  maxPossibleScore: number
  scorePercentage: number
  recommendations: {
    strongly_recommend: number
    recommend: number
    neutral: number
    not_recommend: number
    strongly_not_recommend: number
  }
  reviews: ReviewScore[]
  finalDecision?: ApplicationStatus
  finalDecisionBy?: string
  finalDecisionAt?: string
}

// ==================== DISBURSEMENT TYPES ====================

export type PaymentStatus = 'pending' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  scheduled: 'Scheduled',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export type DisbursementFrequency = 'one_time' | 'monthly' | 'quarterly' | 'half_yearly' | 'yearly'

export const DISBURSEMENT_FREQUENCY_LABELS: Record<DisbursementFrequency, string> = {
  one_time: 'One Time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: 'Half Yearly',
  yearly: 'Yearly',
}

export interface DisbursementSchedule {
  id: string
  applicationId: string
  applicationNumber: string
  scholarshipId: string
  scholarshipName: string
  studentId: string
  studentName: string
  totalAmount: number
  frequency: DisbursementFrequency
  installments: {
    installmentNumber: number
    amount: number
    dueDate: string
    status: PaymentStatus
    paidAmount?: number
    paidDate?: string
    transactionId?: string
    remarks?: string
  }[]
  startDate: string
  endDate: string
  totalDisbursed: number
  totalPending: number
  status: 'active' | 'completed' | 'suspended' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface Disbursement {
  id: string
  scheduleId: string
  applicationId: string
  scholarshipId: string
  scholarshipName: string
  studentId: string
  studentName: string
  studentClass: string
  installmentNumber: number
  amount: number
  dueDate: string
  status: PaymentStatus
  paymentMethod?: 'bank_transfer' | 'fee_adjustment' | 'cheque' | 'cash'
  transactionId?: string
  bankAccountNumber?: string
  bankName?: string
  ifscCode?: string
  paidAmount?: number
  paidDate?: string
  processedBy?: string
  processedAt?: string
  remarks?: string
  receiptUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateDisbursementScheduleRequest {
  applicationId: string
  totalAmount: number
  frequency: DisbursementFrequency
  startDate: string
  installmentAmounts?: number[] // For custom installment amounts
}

export interface ProcessDisbursementRequest {
  disbursementId: string
  paymentMethod: Disbursement['paymentMethod']
  paidAmount: number
  transactionId?: string
  remarks?: string
}

export interface DisbursementFilters {
  search?: string
  scholarshipId?: string
  status?: PaymentStatus | 'all'
  fromDate?: string
  toDate?: string
  studentClass?: string
}

// ==================== RENEWAL TYPES ====================

export type RenewalStatus = 'pending_review' | 'eligible' | 'not_eligible' | 'renewed' | 'not_renewed' | 'graduated'

export const RENEWAL_STATUS_LABELS: Record<RenewalStatus, string> = {
  pending_review: 'Pending Review',
  eligible: 'Eligible for Renewal',
  not_eligible: 'Not Eligible',
  renewed: 'Renewed',
  not_renewed: 'Not Renewed',
  graduated: 'Graduated',
}

export interface RenewalCriteria {
  id: string
  scholarshipId: string
  scholarshipName: string
  academicYear: string
  minimumAttendancePercentage: number
  minimumAcademicPercentage: number
  minimumGPA?: number
  maxBehaviorIncidents: number
  requiresReapplication: boolean
  additionalCriteria?: {
    name: string
    description: string
    isMandatory: boolean
  }[]
  reviewDeadline: string
  createdAt: string
  updatedAt: string
}

export interface CreateRenewalCriteriaRequest {
  scholarshipId: string
  academicYear: string
  minimumAttendancePercentage: number
  minimumAcademicPercentage: number
  minimumGPA?: number
  maxBehaviorIncidents: number
  requiresReapplication: boolean
  additionalCriteria?: {
    name: string
    description: string
    isMandatory: boolean
  }[]
  reviewDeadline: string
}

export interface RenewalApplication {
  id: string
  originalApplicationId: string
  originalApplicationNumber: string
  scholarshipId: string
  scholarshipName: string
  studentId: string
  studentName: string
  studentClass: string
  previousClass: string
  academicYear: string
  previousYearPerformance: {
    attendancePercentage: number
    academicPercentage: number
    gpa?: number
    behaviorIncidents: number
    achievements: string[]
  }
  criteriaEvaluation: {
    criteriaName: string
    required: string | number
    actual: string | number
    passed: boolean
  }[]
  renewalStatus: RenewalStatus
  isAutoRenewed: boolean
  renewedAmount?: number
  previousAmount: number
  changeInAmount?: number
  changeReason?: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  newApplicationId?: string
  createdAt: string
  updatedAt: string
}

export interface RenewalFilters {
  search?: string
  scholarshipId?: string
  status?: RenewalStatus | 'all'
  academicYear?: string
  studentClass?: string
}

// ==================== STATISTICS TYPES ====================

export interface ScholarshipStats {
  totalScholarships: number
  activeScholarships: number
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  totalDisbursed: number
  totalPendingDisbursement: number
  totalBeneficiaries: number
  renewalRate: number
  byType: {
    type: ScholarshipType
    count: number
    amount: number
  }[]
  byStatus: {
    status: ApplicationStatus
    count: number
  }[]
  monthlyDisbursements: {
    month: string
    amount: number
    count: number
  }[]
}

export interface StudentScholarshipSummary {
  studentId: string
  studentName: string
  studentClass: string
  activeScholarships: number
  totalAmountReceived: number
  pendingAmount: number
  scholarships: {
    scholarshipId: string
    scholarshipName: string
    amount: number
    status: ApplicationStatus
    disbursementStatus: string
  }[]
}

// ==================== CONSTANTS ====================

export const ACADEMIC_YEARS = [
  '2024-25',
  '2025-26',
  '2026-27',
  '2027-28',
] as const

export const CLASSES = [
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
] as const

export const SOCIAL_CATEGORIES = [
  'General',
  'OBC',
  'SC',
  'ST',
  'EWS',
  'Minority',
] as const
