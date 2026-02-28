import type { Address } from '@/types/common.types'

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'document_verification'
  | 'entrance_exam'
  | 'interview'
  | 'approved'
  | 'waitlisted'
  | 'rejected'
  | 'enrolled'
  | 'withdrawn'

export type DocumentType =
  | 'birth_certificate'
  | 'previous_marksheet'
  | 'transfer_certificate'
  | 'address_proof'
  | 'photo'
  | 'parent_id'
  | 'medical_certificate'
  | 'other'

export type DocumentStatus = 'pending' | 'verified' | 'rejected'

export interface ApplicationDocument {
  id: string
  type: DocumentType
  name: string
  url: string
  uploadedAt: string
  status: DocumentStatus
  verifiedBy?: string
  verifiedAt?: string
  rejectionReason?: string
}

export interface StatusChange {
  id: string
  fromStatus: ApplicationStatus | null
  toStatus: ApplicationStatus
  changedAt: string
  changedBy: string
  note?: string
}

export interface ApplicationNote {
  id: string
  content: string
  createdAt: string
  createdBy: string
  createdByName: string
}

export interface Application {
  id: string
  applicationNumber: string
  status: ApplicationStatus

  // Student Info
  studentName: string
  dateOfBirth: string
  gender: 'male' | 'female'
  photoUrl: string

  // Contact Info
  email: string
  phone: string
  address: Address

  // Academic Info
  applyingForClass: string
  applyingForSection?: string
  previousSchool: string
  previousClass: string
  previousMarks: number

  // Parent Info
  fatherName: string
  motherName: string
  guardianPhone: string
  guardianEmail: string
  guardianOccupation: string

  // Application Details
  appliedDate: string
  entranceExamDate?: string
  entranceExamScore?: number
  interviewDate?: string
  interviewScore?: number
  interviewNotes?: string

  // Documents
  documents: ApplicationDocument[]

  // Timeline
  statusHistory: StatusChange[]
  notes: ApplicationNote[]

  // Enrollment reference (only set when status is 'enrolled')
  enrolledStudentId?: string

  // Source tracking
  source?: 'website' | 'referral' | 'advertisement' | 'walk_in' | 'social_media' | 'other'
  referredBy?: string

  // Payment tracking
  admissionFeeStatus?: 'pending' | 'partial' | 'paid' | 'waived'
  admissionFeeAmount?: number
  admissionFeePaid?: number

  // Waitlist
  waitlistPosition?: number

  // Metadata
  createdAt: string
  updatedAt: string
}

// API Request/Response types
export interface CreateApplicationRequest {
  studentName: string
  dateOfBirth: string
  gender: 'male' | 'female'
  email: string
  phone: string
  address: Address
  applyingForClass: string
  previousSchool: string
  previousClass: string
  previousMarks: number
  fatherName: string
  motherName: string
  guardianPhone: string
  guardianEmail: string
  guardianOccupation: string
}

export interface UpdateApplicationRequest extends Partial<CreateApplicationRequest> {
  applyingForSection?: string
  entranceExamDate?: string
  entranceExamScore?: number
  interviewDate?: string
  interviewScore?: number
  interviewNotes?: string
}

export interface UpdateStatusRequest {
  status: ApplicationStatus
  note?: string
}

export interface AddDocumentRequest {
  type: DocumentType
  name: string
  url: string
}

export interface AddNoteRequest {
  content: string
}

export interface ApplicationFilters {
  search?: string
  status?: ApplicationStatus | 'all'
  class?: string
  dateFrom?: string
  dateTo?: string
}

// Status configuration for pipeline view
export interface StatusConfig {
  value: ApplicationStatus
  label: string
  color: string
  bgColor: string
  description: string
  allowedTransitions: ApplicationStatus[]
}

export const APPLICATION_STATUSES: StatusConfig[] = [
  {
    value: 'applied',
    label: 'Applied',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'New application received',
    allowedTransitions: ['under_review', 'rejected', 'withdrawn'],
  },
  {
    value: 'under_review',
    label: 'Under Review',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    description: 'Application being reviewed',
    allowedTransitions: ['document_verification', 'rejected', 'withdrawn'],
  },
  {
    value: 'document_verification',
    label: 'Document Verification',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    description: 'Verifying submitted documents',
    allowedTransitions: ['entrance_exam', 'interview', 'rejected', 'withdrawn'],
  },
  {
    value: 'entrance_exam',
    label: 'Entrance Exam',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: 'Scheduled for entrance exam',
    allowedTransitions: ['interview', 'approved', 'rejected', 'withdrawn'],
  },
  {
    value: 'interview',
    label: 'Interview',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    description: 'Scheduled for interview',
    allowedTransitions: ['approved', 'waitlisted', 'rejected', 'withdrawn'],
  },
  {
    value: 'approved',
    label: 'Approved',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Application approved',
    allowedTransitions: ['enrolled', 'withdrawn'],
  },
  {
    value: 'waitlisted',
    label: 'Waitlisted',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    description: 'Added to waitlist',
    allowedTransitions: ['approved', 'rejected', 'withdrawn'],
  },
  {
    value: 'rejected',
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Application rejected',
    allowedTransitions: [],
  },
  {
    value: 'enrolled',
    label: 'Enrolled',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    description: 'Student enrolled',
    allowedTransitions: [],
  },
  {
    value: 'withdrawn',
    label: 'Withdrawn',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    description: 'Application withdrawn',
    allowedTransitions: [],
  },
]

export const DOCUMENT_TYPES: { value: DocumentType; label: string; required: boolean }[] = [
  { value: 'birth_certificate', label: 'Birth Certificate', required: true },
  { value: 'previous_marksheet', label: 'Previous Marksheet', required: true },
  { value: 'transfer_certificate', label: 'Transfer Certificate', required: false },
  { value: 'address_proof', label: 'Address Proof', required: true },
  { value: 'photo', label: 'Passport Photo', required: true },
  { value: 'parent_id', label: 'Parent ID Proof', required: true },
  { value: 'medical_certificate', label: 'Medical Certificate', required: false },
  { value: 'other', label: 'Other Documents', required: false },
]

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
]

export function getStatusConfig(status: ApplicationStatus): StatusConfig {
  return APPLICATION_STATUSES.find((s) => s.value === status) || APPLICATION_STATUSES[0]
}

export function canTransitionTo(currentStatus: ApplicationStatus, targetStatus: ApplicationStatus): boolean {
  const config = getStatusConfig(currentStatus)
  return config.allowedTransitions.includes(targetStatus)
}

// ==================== WAITLIST TYPES ====================

export interface WaitlistEntry {
  id: string
  applicationId: string
  studentName: string
  applyingForClass: string
  position: number
  addedAt: string
  previousMarks: number
  entranceExamScore?: number
  status: 'waiting' | 'offered' | 'expired'
  offeredAt?: string
  expiresAt?: string
}

export interface ClassCapacity {
  class: string
  section: string
  totalSeats: number
  filledSeats: number
  availableSeats: number
  waitlistCount: number
}

// ==================== ENTRANCE TEST TYPES ====================

export interface EntranceExamSchedule {
  id: string
  class: string
  examDate: string
  examTime: string
  venue: string
  duration: number // in minutes
  totalMarks: number
  passingMarks: number
  subjects: string[]
  registeredCount: number
  completedCount: number
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
}

export interface ExamResult {
  applicationId: string
  studentName: string
  examScheduleId: string
  marksObtained: number
  totalMarks: number
  percentage: number
  grade: string
  subjectWiseMarks: { subject: string; marks: number; total: number }[]
  result: 'pass' | 'fail'
  rank?: number
}

export interface ScheduleExamRequest {
  class: string
  examDate: string
  examTime: string
  venue: string
  duration: number
  totalMarks: number
  passingMarks: number
  subjects: string[]
}

export interface RecordExamScoreRequest {
  applicationId: string
  marksObtained: number
  subjectWiseMarks: { subject: string; marks: number; total: number }[]
}

// ==================== COMMUNICATION TYPES ====================

export type CommunicationType = 'email' | 'sms' | 'whatsapp'
export type CommunicationTrigger =
  | 'application_received'
  | 'status_change'
  | 'exam_scheduled'
  | 'interview_scheduled'
  | 'approved'
  | 'rejected'
  | 'waitlisted'
  | 'payment_due'
  | 'custom'

export interface CommunicationLog {
  id: string
  applicationId: string
  studentName: string
  type: CommunicationType
  trigger: CommunicationTrigger
  recipient: string
  subject: string
  message: string
  sentAt: string
  status: 'sent' | 'delivered' | 'failed' | 'pending'
  sentBy: string
}

export interface CommunicationTemplate {
  id: string
  name: string
  trigger: CommunicationTrigger
  type: CommunicationType
  subject: string
  body: string
  isActive: boolean
  variables: string[] // e.g., {{studentName}}, {{status}}
}

export interface SendCommunicationRequest {
  applicationIds: string[]
  templateId?: string
  type: CommunicationType
  subject: string
  message: string
}

// ==================== ADMISSION FEE TYPES ====================

export interface AdmissionFee {
  id: string
  class: string
  feeType: string
  amount: number
  isRequired: boolean
}

export interface AdmissionPayment {
  id: string
  applicationId: string
  studentName: string
  class: string
  totalAmount: number
  paidAmount: number
  status: 'pending' | 'partial' | 'paid' | 'waived'
  paymentDate?: string
  paymentMethod?: string
  transactionId?: string
  receiptNumber?: string
  feeBreakdown: { feeType: string; amount: number; paid: boolean }[]
  generatedAt: string
  dueDate: string
}

export interface RecordPaymentRequest {
  applicationId: string
  amount: number
  paymentMethod: string
  transactionId?: string
}

// ==================== ANALYTICS TYPES ====================

export interface AdmissionAnalytics {
  conversionFunnel: { stage: string; count: number; percentage: number }[]
  monthlyTrend: { month: string; applications: number; approvals: number; rejections: number }[]
  classDistribution: { class: string; applications: number; approved: number; enrolled: number }[]
  sourceDistribution: { source: string; count: number; percentage: number }[]
  avgProcessingDays: number
  approvalRate: number
  rejectionRate: number
  withdrawalRate: number
  avgExamScore: number
  topPerformers: { name: string; class: string; score: number }[]
}

// ==================== COMMUNICATION TRIGGER LABELS ====================

export const COMMUNICATION_TRIGGER_LABELS: Record<CommunicationTrigger, string> = {
  application_received: 'Application Received',
  status_change: 'Status Change',
  exam_scheduled: 'Exam Scheduled',
  interview_scheduled: 'Interview Scheduled',
  approved: 'Approved',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
  payment_due: 'Payment Due',
  custom: 'Custom Message',
}

// ==================== CRM LEAD TRACKING TYPES ====================

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'nurturing'
  | 'application_started'
  | 'converted'
  | 'lost'
  | 'unresponsive'

export type LeadSource =
  | 'website_inquiry'
  | 'phone_call'
  | 'walk_in'
  | 'referral'
  | 'social_media'
  | 'advertisement'
  | 'school_fair'
  | 'open_house'
  | 'email_campaign'
  | 'partner_school'
  | 'other'

export interface LeadActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'task'
  description: string
  outcome?: string
  createdAt: string
  createdBy: string
  createdByName: string
  scheduledAt?: string
  completedAt?: string
}

export interface Lead {
  id: string
  leadNumber: string
  status: LeadStatus
  source: LeadSource

  // Student Info
  studentName: string
  dateOfBirth?: string
  currentClass?: string
  interestedInClass: string

  // Contact Info
  parentName: string
  parentEmail: string
  parentPhone: string
  alternatePhone?: string
  address?: Address

  // Lead Details
  inquiryDate: string
  expectedJoiningDate?: string
  notes?: string

  // Assignment
  assignedTo?: string
  assignedToName?: string

  // Tracking
  activities: LeadActivity[]
  lastContactedAt?: string
  nextFollowUpDate?: string
  followUpCount: number

  // Conversion
  convertedToApplicationId?: string
  convertedAt?: string
  lostReason?: string

  // Campaign tracking
  campaignId?: string
  campaignName?: string

  // Score
  leadScore: number // 0-100 based on engagement

  // Metadata
  createdAt: string
  updatedAt: string
}

export interface CreateLeadRequest {
  studentName: string
  dateOfBirth?: string
  currentClass?: string
  interestedInClass: string
  parentName: string
  parentEmail: string
  parentPhone: string
  alternatePhone?: string
  address?: Address
  source: LeadSource
  notes?: string
  expectedJoiningDate?: string
  campaignId?: string
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {
  status?: LeadStatus
  assignedTo?: string
  nextFollowUpDate?: string
  lostReason?: string
}

export interface AddLeadActivityRequest {
  type: LeadActivity['type']
  description: string
  outcome?: string
  scheduledAt?: string
}

export interface LeadFilters {
  search?: string
  status?: LeadStatus | 'all'
  source?: LeadSource | 'all'
  assignedTo?: string
  campaignId?: string
  dateFrom?: string
  dateTo?: string
}

export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string; bgColor: string }[] = [
  { value: 'new', label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { value: 'contacted', label: 'Contacted', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  { value: 'qualified', label: 'Qualified', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { value: 'nurturing', label: 'Nurturing', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { value: 'application_started', label: 'Application Started', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  { value: 'converted', label: 'Converted', color: 'text-green-700', bgColor: 'bg-green-100' },
  { value: 'lost', label: 'Lost', color: 'text-red-700', bgColor: 'bg-red-100' },
  { value: 'unresponsive', label: 'Unresponsive', color: 'text-gray-700', bgColor: 'bg-gray-100' },
]

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'website_inquiry', label: 'Website Inquiry' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'school_fair', label: 'School Fair' },
  { value: 'open_house', label: 'Open House' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'partner_school', label: 'Partner School' },
  { value: 'other', label: 'Other' },
]

// ==================== MARKETING CAMPAIGN TYPES ====================

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
export type CampaignType = 'email' | 'sms' | 'social_media' | 'print' | 'event' | 'digital_ads' | 'referral_program'

export interface CampaignMetrics {
  impressions: number
  clicks: number
  leads: number
  applications: number
  enrollments: number
  cost: number
  costPerLead: number
  costPerEnrollment: number
  conversionRate: number
  roi: number
}

export interface MarketingCampaign {
  id: string
  name: string
  description: string
  type: CampaignType
  status: CampaignStatus

  // Target
  targetClasses: string[]
  targetAreas?: string[]
  targetAudience?: string

  // Schedule
  startDate: string
  endDate: string

  // Budget
  budget: number
  spent: number

  // Content
  content?: string
  mediaUrls?: string[]
  landingPageUrl?: string
  promoCode?: string

  // Metrics
  metrics: CampaignMetrics

  // Tracking
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string

  // Management
  createdBy: string
  createdByName: string

  // Metadata
  createdAt: string
  updatedAt: string
}

export interface CreateCampaignRequest {
  name: string
  description: string
  type: CampaignType
  targetClasses: string[]
  targetAreas?: string[]
  targetAudience?: string
  startDate: string
  endDate: string
  budget: number
  content?: string
  mediaUrls?: string[]
  landingPageUrl?: string
  promoCode?: string
}

export interface UpdateCampaignRequest extends Partial<CreateCampaignRequest> {
  status?: CampaignStatus
  spent?: number
}

export interface CampaignFilters {
  search?: string
  status?: CampaignStatus | 'all'
  type?: CampaignType | 'all'
  dateFrom?: string
  dateTo?: string
}

export const CAMPAIGN_STATUSES: { value: CampaignStatus; label: string; color: string; bgColor: string }[] = [
  { value: 'draft', label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  { value: 'scheduled', label: 'Scheduled', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { value: 'active', label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' },
  { value: 'paused', label: 'Paused', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { value: 'completed', label: 'Completed', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
]

export const CAMPAIGN_TYPES: { value: CampaignType; label: string }[] = [
  { value: 'email', label: 'Email Campaign' },
  { value: 'sms', label: 'SMS Campaign' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'print', label: 'Print Media' },
  { value: 'event', label: 'Event' },
  { value: 'digital_ads', label: 'Digital Ads' },
  { value: 'referral_program', label: 'Referral Program' },
]

// ==================== INTERVIEW FEEDBACK TYPES ====================

export type InterviewRating = 1 | 2 | 3 | 4 | 5

export interface InterviewCriteria {
  id: string
  name: string
  description?: string
  weightage: number // percentage
}

export interface InterviewCriteriaScore {
  criteriaId: string
  criteriaName: string
  rating: InterviewRating
  comments?: string
}

export interface InterviewFeedback {
  id: string
  applicationId: string
  studentName: string
  interviewDate: string
  interviewType: 'student' | 'parent' | 'combined'

  // Interviewers
  interviewers: {
    id: string
    name: string
    role: string
  }[]

  // Evaluation
  criteriaScores: InterviewCriteriaScore[]
  overallRating: InterviewRating
  overallComments: string

  // Student Observation
  strengths: string[]
  areasOfImprovement: string[]

  // Parent Interaction
  parentEngagement?: InterviewRating
  parentExpectations?: string

  // Recommendation
  recommendation: 'strongly_recommend' | 'recommend' | 'consider' | 'not_recommend'
  recommendationNotes?: string

  // Additional Info
  specialNeeds?: string
  behavioralObservations?: string

  // Metadata
  submittedBy: string
  submittedByName: string
  submittedAt: string
  updatedAt: string
}

export interface CreateInterviewFeedbackRequest {
  applicationId: string
  interviewDate: string
  interviewType: 'student' | 'parent' | 'combined'
  interviewers: { id: string; name: string; role: string }[]
  criteriaScores: Omit<InterviewCriteriaScore, 'criteriaName'>[]
  overallRating: InterviewRating
  overallComments: string
  strengths: string[]
  areasOfImprovement: string[]
  parentEngagement?: InterviewRating
  parentExpectations?: string
  recommendation: InterviewFeedback['recommendation']
  recommendationNotes?: string
  specialNeeds?: string
  behavioralObservations?: string
}

export interface UpdateInterviewFeedbackRequest extends Partial<CreateInterviewFeedbackRequest> {}

export const DEFAULT_INTERVIEW_CRITERIA: InterviewCriteria[] = [
  { id: 'communication', name: 'Communication Skills', description: 'Ability to express thoughts clearly', weightage: 20 },
  { id: 'confidence', name: 'Confidence', description: 'Self-assurance and composure', weightage: 15 },
  { id: 'academic_aptitude', name: 'Academic Aptitude', description: 'Interest and ability in learning', weightage: 25 },
  { id: 'general_awareness', name: 'General Awareness', description: 'Knowledge of surroundings and current affairs', weightage: 15 },
  { id: 'behavior', name: 'Behavior & Manners', description: 'Politeness and social behavior', weightage: 15 },
  { id: 'creativity', name: 'Creativity & Curiosity', description: 'Innovative thinking and inquisitiveness', weightage: 10 },
]

export const RECOMMENDATION_LABELS: Record<InterviewFeedback['recommendation'], { label: string; color: string; bgColor: string }> = {
  strongly_recommend: { label: 'Strongly Recommend', color: 'text-green-700', bgColor: 'bg-green-100' },
  recommend: { label: 'Recommend', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  consider: { label: 'Consider', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  not_recommend: { label: 'Not Recommend', color: 'text-red-700', bgColor: 'bg-red-100' },
}

// ==================== ADMISSION PLAN TYPES ====================

export type AcademicYear = string // e.g., "2024-25"

export interface ClassAdmissionTarget {
  class: string
  sections: number
  seatsPerSection: number
  totalSeats: number
  reservedSeats: {
    category: string
    seats: number
  }[]
  targetApplications: number
  expectedConversionRate: number
}

export interface AdmissionPhase {
  id: string
  name: string
  startDate: string
  endDate: string
  targetClasses: string[]
  applicationFee: number
  isEarlyBird: boolean
  discountPercentage?: number
  maxApplications?: number
  status: 'upcoming' | 'active' | 'completed'
}

export interface AdmissionMilestone {
  id: string
  name: string
  targetDate: string
  completedDate?: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  description?: string
  assignedTo?: string
}

export interface AdmissionPlan {
  id: string
  academicYear: AcademicYear
  name: string
  description?: string
  status: 'draft' | 'approved' | 'active' | 'completed'

  // Targets
  classTargets: ClassAdmissionTarget[]
  totalTargetSeats: number
  totalTargetApplications: number

  // Phases
  phases: AdmissionPhase[]

  // Important Dates
  applicationOpenDate: string
  applicationCloseDate: string
  examDates: string[]
  interviewStartDate: string
  interviewEndDate: string
  resultAnnouncementDate: string
  enrollmentDeadline: string

  // Milestones
  milestones: AdmissionMilestone[]

  // Budget
  marketingBudget: number
  operationalBudget: number

  // Progress
  currentApplications: number
  currentEnrollments: number
  progressPercentage: number

  // Management
  approvedBy?: string
  approvedAt?: string
  createdBy: string
  createdByName: string

  // Metadata
  createdAt: string
  updatedAt: string
}

export interface CreateAdmissionPlanRequest {
  academicYear: AcademicYear
  name: string
  description?: string
  classTargets: Omit<ClassAdmissionTarget, 'totalSeats'>[]
  applicationOpenDate: string
  applicationCloseDate: string
  examDates: string[]
  interviewStartDate: string
  interviewEndDate: string
  resultAnnouncementDate: string
  enrollmentDeadline: string
  marketingBudget: number
  operationalBudget: number
  phases: Omit<AdmissionPhase, 'id' | 'status'>[]
  milestones: Omit<AdmissionMilestone, 'id' | 'status' | 'completedDate'>[]
}

export interface UpdateAdmissionPlanRequest extends Partial<CreateAdmissionPlanRequest> {
  status?: AdmissionPlan['status']
}

// ==================== REFERRAL TRACKING TYPES ====================

export type ReferralType = 'sibling' | 'alumni' | 'staff' | 'parent' | 'external'
export type ReferralStatus = 'pending' | 'verified' | 'rewarded' | 'invalid'

export interface ReferralReward {
  type: 'discount' | 'cashback' | 'fee_waiver' | 'gift'
  value: number // percentage for discount/fee_waiver, amount for cashback
  description: string
  appliedAt?: string
}

export interface ReferralTracking {
  id: string
  applicationId: string
  studentName: string

  // Referral Details
  referralType: ReferralType
  referralCode?: string

  // Referrer Info
  referrerId?: string // Student ID if sibling/alumni
  referrerName: string
  referrerRelation: string
  referrerContact?: string
  referrerEmail?: string

  // Sibling Link (if referralType is 'sibling')
  siblingDetails?: {
    studentId: string
    studentName: string
    class: string
    section: string
    rollNumber: string
    admissionNumber: string
  }

  // Alumni Link (if referralType is 'alumni')
  alumniDetails?: {
    alumniId: string
    name: string
    batchYear: string
    currentOrganization?: string
  }

  // Verification
  status: ReferralStatus
  verifiedBy?: string
  verifiedAt?: string
  verificationNotes?: string

  // Reward
  reward?: ReferralReward

  // Metadata
  createdAt: string
  updatedAt: string
}

export interface CreateReferralRequest {
  applicationId: string
  referralType: ReferralType
  referralCode?: string
  referrerName: string
  referrerRelation: string
  referrerContact?: string
  referrerEmail?: string
  referrerId?: string
  siblingDetails?: ReferralTracking['siblingDetails']
  alumniDetails?: ReferralTracking['alumniDetails']
}

export interface UpdateReferralRequest {
  status?: ReferralStatus
  verificationNotes?: string
  reward?: ReferralReward
}

export interface ReferralFilters {
  search?: string
  referralType?: ReferralType | 'all'
  status?: ReferralStatus | 'all'
  dateFrom?: string
  dateTo?: string
}

export const REFERRAL_TYPES: { value: ReferralType; label: string; description: string }[] = [
  { value: 'sibling', label: 'Sibling', description: 'Brother/Sister already studying in school' },
  { value: 'alumni', label: 'Alumni', description: 'Referred by school alumni' },
  { value: 'staff', label: 'Staff', description: 'Referred by school staff member' },
  { value: 'parent', label: 'Current Parent', description: 'Referred by parent of current student' },
  { value: 'external', label: 'External', description: 'External referral or other' },
]

export const REFERRAL_STATUSES: { value: ReferralStatus; label: string; color: string; bgColor: string }[] = [
  { value: 'pending', label: 'Pending Verification', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { value: 'verified', label: 'Verified', color: 'text-green-700', bgColor: 'bg-green-100' },
  { value: 'rewarded', label: 'Reward Applied', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { value: 'invalid', label: 'Invalid', color: 'text-red-700', bgColor: 'bg-red-100' },
]
