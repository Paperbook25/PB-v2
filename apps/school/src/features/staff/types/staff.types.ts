import type { Address } from '@/types/common.types'

// ==================== STAFF TYPES ====================

export type StaffStatus = 'active' | 'on_leave' | 'resigned'

export interface Staff {
  id: string
  employeeId: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female'
  department: string
  designation: string
  joiningDate: string
  photoUrl: string
  qualification: string[]
  specialization: string
  salary: number
  address: Address
  status: StaffStatus
  // Additional fields for complete staff record
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  bankDetails?: {
    accountNumber: string
    bankName: string
    ifscCode: string
    accountHolderName: string
  }
}

export interface CreateStaffRequest {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female'
  department: string
  designation: string
  joiningDate: string
  qualification: string[]
  specialization: string
  salary: number
  address: Address
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  bankDetails?: {
    accountNumber: string
    bankName: string
    ifscCode: string
    accountHolderName: string
  }
}

export interface UpdateStaffRequest extends Partial<CreateStaffRequest> {
  status?: StaffStatus
}

export interface StaffFilters {
  search?: string
  department?: string
  status?: StaffStatus | 'all'
}

// ==================== BULK IMPORT TYPES ====================

export interface BulkImportStaffResult {
  total: number
  successful: number
  failed: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
}

// ==================== LEAVE TYPES ====================

export type LeaveType = 'EL' | 'CL' | 'SL' | 'PL'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  EL: 'Earned Leave',
  CL: 'Casual Leave',
  SL: 'Sick Leave',
  PL: 'Privilege Leave',
}

export interface LeaveBalance {
  staffId: string
  year: number
  EL: { total: number; used: number; available: number }
  CL: { total: number; used: number; available: number }
  SL: { total: number; used: number; available: number }
  PL: { total: number; used: number; available: number }
}

export interface LeaveRequest {
  id: string
  staffId: string
  staffName: string
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  numberOfDays: number
  appliedOn: string
  approvedBy?: string
  rejectionReason?: string
}

export interface CreateLeaveRequest {
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
}

// ==================== ATTENDANCE TYPES ====================

export type StaffAttendanceStatus = 'present' | 'absent' | 'half_day' | 'on_leave'

export interface StaffAttendanceRecord {
  id: string
  staffId: string
  date: string
  status: StaffAttendanceStatus
  checkInTime?: string
  checkOutTime?: string
}

export interface StaffAttendanceSummary {
  staffId: string
  month: number
  year: number
  totalWorkingDays: number
  present: number
  absent: number
  halfDay: number
  onLeave: number
  attendancePercentage: number
}

export interface BulkAttendanceRecord {
  staffId: string
  status: StaffAttendanceStatus
  checkInTime?: string
  checkOutTime?: string
}

// ==================== SALARY TYPES ====================

export interface SalaryStructure {
  staffId: string
  basic: number
  hra: number
  da: number
  conveyance: number
  specialAllowance: number
  grossSalary: number
  pf: number
  professionalTax: number
  tds: number
  totalDeductions: number
  netSalary: number
}

export interface SalarySlip {
  id: string
  staffId: string
  staffName: string
  month: number
  year: number
  earnings: {
    basic: number
    hra: number
    da: number
    conveyance: number
    allowances: number
    gross: number
  }
  deductions: {
    pf: number
    tax: number
    professionalTax: number
    lop: number
    total: number
  }
  netPayable: number
  status: 'generated' | 'paid'
  paidOn?: string
}

export interface ProcessSalaryRequest {
  month: number
  year: number
  staffIds?: string[]
}

// ==================== TIMETABLE TYPES ====================

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const PERIODS = [
  { number: 1, startTime: '08:00', endTime: '08:45', label: 'Period 1' },
  { number: 2, startTime: '08:45', endTime: '09:30', label: 'Period 2' },
  { number: 3, startTime: '09:30', endTime: '10:15', label: 'Period 3' },
  { number: 4, startTime: '10:30', endTime: '11:15', label: 'Period 4' },
  { number: 5, startTime: '11:15', endTime: '12:00', label: 'Period 5' },
  { number: 6, startTime: '12:45', endTime: '13:30', label: 'Period 6' },
  { number: 7, startTime: '13:30', endTime: '14:15', label: 'Period 7' },
  { number: 8, startTime: '14:15', endTime: '15:00', label: 'Period 8' },
] as const

export interface TimetableEntry {
  id: string
  staffId: string
  staffName: string
  day: DayOfWeek
  periodNumber: number
  subject: string
  class: string
  section: string
  room?: string
}

export interface StaffTimetable {
  staffId: string
  staffName: string
  entries: TimetableEntry[]
  totalPeriodsPerWeek: number
}

export interface ClassTimetable {
  class: string
  section: string
  entries: TimetableEntry[]
}

// ==================== SUBSTITUTION TYPES ====================

export type SubstitutionStatus = 'pending' | 'assigned' | 'completed' | 'cancelled'

export interface Substitution {
  id: string
  date: string
  absentStaffId: string
  absentStaffName: string
  substituteStaffId: string
  substituteStaffName: string
  periodNumber: number
  class: string
  section: string
  subject: string
  status: SubstitutionStatus
  reason?: string
  createdAt: string
}

export interface CreateSubstitutionRequest {
  date: string
  absentStaffId: string
  substituteStaffId: string
  periodNumber: number
  class: string
  section: string
  subject: string
  reason?: string
}

// ==================== PERFORMANCE REVIEW TYPES ====================

export type ReviewPeriod = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'annual'
export type ReviewStatus = 'draft' | 'submitted' | 'acknowledged'

export const REVIEW_PERIOD_LABELS: Record<ReviewPeriod, string> = {
  Q1: 'Quarter 1 (Apr-Jun)',
  Q2: 'Quarter 2 (Jul-Sep)',
  Q3: 'Quarter 3 (Oct-Dec)',
  Q4: 'Quarter 4 (Jan-Mar)',
  annual: 'Annual Review',
}

export const PERFORMANCE_CATEGORIES = [
  'Teaching Quality',
  'Student Engagement',
  'Curriculum Knowledge',
  'Classroom Management',
  'Communication',
  'Punctuality',
  'Professional Development',
  'Team Collaboration',
] as const

export interface PerformanceRating {
  category: string
  rating: number // 1-5
  comment?: string
}

export interface PerformanceReview {
  id: string
  staffId: string
  staffName: string
  reviewerId: string
  reviewerName: string
  period: ReviewPeriod
  year: number
  ratings: PerformanceRating[]
  overallRating: number
  strengths: string
  areasOfImprovement: string
  goals: string
  status: ReviewStatus
  createdAt: string
  submittedAt?: string
  acknowledgedAt?: string
}

export interface CreatePerformanceReview {
  staffId: string
  period: ReviewPeriod
  year: number
  ratings: PerformanceRating[]
  strengths: string
  areasOfImprovement: string
  goals: string
}

// ==================== PROFESSIONAL DEVELOPMENT TYPES ====================

export type PDType = 'certification' | 'workshop' | 'seminar' | 'training' | 'conference' | 'course'

export const PD_TYPE_LABELS: Record<PDType, string> = {
  certification: 'Certification',
  workshop: 'Workshop',
  seminar: 'Seminar',
  training: 'Training Program',
  conference: 'Conference',
  course: 'Online Course',
}

export type PDStatus = 'upcoming' | 'in_progress' | 'completed' | 'expired'

export interface ProfessionalDevelopment {
  id: string
  staffId: string
  type: PDType
  title: string
  provider: string
  startDate: string
  endDate?: string
  status: PDStatus
  certificateUrl?: string
  description?: string
  hours?: number
  cost?: number
  expiryDate?: string
  createdAt: string
}

export interface CreatePDRequest {
  staffId: string
  type: PDType
  title: string
  provider: string
  startDate: string
  endDate?: string
  status: PDStatus
  description?: string
  hours?: number
  cost?: number
  expiryDate?: string
}

// ==================== CONSTANTS ====================

export const DEPARTMENTS = [
  'Mathematics',
  'Science',
  'English',
  'Social Studies',
  'Hindi',
  'Computer Science',
  'Physical Education',
  'Art',
  'Music',
  'Administration',
] as const

export const DESIGNATIONS = [
  'Principal',
  'Vice Principal',
  'Senior Teacher',
  'Teacher',
  'Assistant Teacher',
  'Lab Assistant',
  'Librarian',
  'Accountant',
  'Clerk',
  'Peon',
] as const

export const QUALIFICATIONS = [
  'B.Ed',
  'M.Ed',
  'B.A.',
  'M.A.',
  'B.Sc.',
  'M.Sc.',
  'B.Com',
  'M.Com',
  'Ph.D.',
  'MBA',
] as const

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const

// ==================== ADVANCED PAYROLL & BENEFITS ====================

export type DeductionType = 'tax' | 'pf' | 'esi' | 'loan' | 'advance' | 'professional_tax' | 'insurance' | 'other'
export type BenefitType = 'health_insurance' | 'life_insurance' | 'gratuity' | 'pension' | 'housing' | 'transport' | 'meal' | 'other'

export interface PayrollDeduction {
  id: string
  staffId: string
  type: DeductionType
  name: string
  amount: number
  isPercentage: boolean
  percentageOf?: 'basic' | 'gross'
  effectiveFrom: string
  effectiveTo?: string
  isRecurring: boolean
  status: 'active' | 'completed' | 'cancelled'
  notes?: string
}

export interface EmployeeBenefit {
  id: string
  staffId: string
  type: BenefitType
  name: string
  provider?: string
  policyNumber?: string
  coverageAmount?: number
  employerContribution: number
  employeeContribution: number
  startDate: string
  endDate?: string
  nominees?: { name: string; relationship: string; percentage: number }[]
  status: 'active' | 'expired' | 'cancelled'
  documents?: { name: string; url: string }[]
}

export interface LoanAdvance {
  id: string
  staffId: string
  type: 'loan' | 'advance'
  amount: number
  reason: string
  approvedBy: string
  approvedDate: string
  disbursementDate: string
  totalInstallments: number
  installmentAmount: number
  paidInstallments: number
  remainingAmount: number
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled'
  deductions: { month: string; amount: number; status: 'pending' | 'deducted' }[]
}

// ==================== TIME-OFF ACCRUAL ====================

export interface TimeOffPolicy {
  id: string
  name: string
  leaveType: LeaveType
  accrualRate: number
  accrualPeriod: 'monthly' | 'quarterly' | 'yearly'
  maxAccrual: number
  carryForwardLimit: number
  carryForwardExpiry?: number // months
  eligibilityAfterDays: number
  applicableTo: 'all' | 'department' | 'designation'
  applicableValues?: string[]
}

export interface TimeOffAccrual {
  staffId: string
  leaveType: LeaveType
  year: number
  accrued: number
  used: number
  carriedForward: number
  forfeited: number
  available: number
  history: {
    date: string
    type: 'accrual' | 'usage' | 'carry_forward' | 'adjustment' | 'forfeit'
    amount: number
    balance: number
    notes?: string
  }[]
}

// ==================== ONBOARDING WORKFLOW ====================

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold'
export type OnboardingTaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked'

export interface OnboardingTask {
  id: string
  category: 'documentation' | 'training' | 'access' | 'equipment' | 'introduction' | 'compliance'
  name: string
  description: string
  assignedTo: 'hr' | 'it' | 'manager' | 'employee' | 'admin'
  dueInDays: number
  isMandatory: boolean
  order: number
}

export interface OnboardingChecklist {
  id: string
  staffId: string
  staffName: string
  joiningDate: string
  status: OnboardingStatus
  assignedHR: string
  assignedManager: string
  tasks: {
    taskId: string
    taskName: string
    category: OnboardingTask['category']
    assignedTo: OnboardingTask['assignedTo']
    status: OnboardingTaskStatus
    dueDate: string
    completedDate?: string
    completedBy?: string
    notes?: string
    attachments?: { name: string; url: string }[]
  }[]
  progress: number
  startDate: string
  targetCompletionDate: string
  actualCompletionDate?: string
  feedback?: string
}

// ==================== EXIT INTERVIEW ====================

export type SeparationType = 'resignation' | 'termination' | 'retirement' | 'contract_end' | 'layoff' | 'death'

export interface ExitInterview {
  id: string
  staffId: string
  staffName: string
  department: string
  designation: string
  joiningDate: string
  lastWorkingDate: string
  separationType: SeparationType
  interviewDate: string
  interviewedBy: string
  ratings: {
    category: 'work_environment' | 'management' | 'growth' | 'compensation' | 'work_life_balance' | 'team'
    rating: 1 | 2 | 3 | 4 | 5
    comments?: string
  }[]
  reasonForLeaving: string[]
  wouldRecommend: boolean
  wouldRejoin: boolean
  suggestions: string
  bestPart: string
  improvements: string
  handoverStatus: 'not_started' | 'in_progress' | 'completed'
  clearanceStatus: {
    department: string
    cleared: boolean
    clearedBy?: string
    clearedDate?: string
    remarks?: string
  }[]
  fnfStatus: 'pending' | 'processed' | 'paid'
  fnfAmount?: number
  isConfidential: boolean
  status: 'scheduled' | 'completed' | 'cancelled'
}

// ==================== SKILLS MATRIX & CERTIFICATIONS ====================

export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface StaffSkill {
  id: string
  staffId: string
  skillName: string
  category: 'technical' | 'soft' | 'domain' | 'tool' | 'language'
  proficiency: SkillProficiency
  yearsOfExperience: number
  selfAssessed: boolean
  verifiedBy?: string
  verifiedDate?: string
  lastUsed?: string
  notes?: string
}

export interface Certification {
  id: string
  staffId: string
  name: string
  issuingOrganization: string
  credentialId?: string
  credentialUrl?: string
  issueDate: string
  expiryDate?: string
  doesNotExpire: boolean
  status: 'active' | 'expired' | 'revoked'
  category: 'teaching' | 'technical' | 'safety' | 'compliance' | 'professional' | 'other'
  attachmentUrl?: string
  reminderSent: boolean
  reminderDays?: number
}

export interface SkillGap {
  staffId: string
  requiredSkill: string
  currentProficiency: SkillProficiency | null
  requiredProficiency: SkillProficiency
  gap: number
  priority: 'low' | 'medium' | 'high'
  recommendedTraining?: string
}

export interface CertificationExpiryAlert {
  staffId: string
  staffName: string
  certificationId: string
  certificationName: string
  expiryDate: string
  daysUntilExpiry: number
  status: 'upcoming' | 'expiring_soon' | 'expired'
  renewalUrl?: string
}

// ==================== WORK SCHEDULE PREFERENCES ====================

export type WorkMode = 'on_site' | 'remote' | 'hybrid'
export type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible'

export interface WorkSchedulePreference {
  staffId: string
  preferredWorkMode: WorkMode
  currentWorkMode: WorkMode
  preferredShift: ShiftType
  currentShift: ShiftType
  preferredWorkingDays: DayOfWeek[]
  flexibleHours: boolean
  preferredStartTime?: string
  preferredEndTime?: string
  remoteCapable: boolean
  equipmentAtHome: boolean
  constraints?: string[]
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'not_requested'
  approvedBy?: string
  approvalDate?: string
  effectiveFrom?: string
  notes?: string
}

export interface ShiftSchedule {
  id: string
  staffId: string
  staffName: string
  week: string
  schedules: {
    day: DayOfWeek
    shift: ShiftType
    workMode: WorkMode
    startTime: string
    endTime: string
    isOverride: boolean
    overrideReason?: string
  }[]
  status: 'draft' | 'published' | 'active'
  createdBy: string
  createdAt: string
}
