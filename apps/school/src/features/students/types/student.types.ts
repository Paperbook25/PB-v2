export interface Student {
  id: string
  admissionNumber: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  bloodGroup: string
  class: string
  section: string
  rollNumber: number
  admissionDate: string
  photoUrl: string
  address: {
    street: string
    city: string
    state: string
    pincode: string
  }
  parent: {
    fatherName: string
    motherName: string
    guardianPhone: string
    guardianEmail: string
    occupation: string
  }
  status: 'active' | 'inactive' | 'graduated' | 'transferred'
  // New fields
  siblingIds?: string[]
  healthRecord?: StudentHealthRecord
}

export interface StudentFilters {
  search?: string
  class?: string
  section?: string
  status?: string
  page?: number
  limit?: number
}

export interface CreateStudentRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  bloodGroup?: string
  class: string
  section: string
  rollNumber?: number
  photoUrl?: string
  address: {
    street: string
    city: string
    state: string
    pincode: string
  }
  parent: {
    fatherName: string
    motherName: string
    guardianPhone: string
    guardianEmail: string
    occupation?: string
  }
}

export interface UpdateStudentRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  bloodGroup?: string
  class?: string
  section?: string
  rollNumber?: number
  photoUrl?: string
  address?: {
    street: string
    city: string
    state: string
    pincode: string
  }
  parent?: {
    fatherName: string
    motherName: string
    guardianPhone: string
    guardianEmail: string
    occupation?: string
  }
  status?: 'active' | 'inactive' | 'graduated' | 'transferred'
}

// ==================== TIMELINE ====================

export type TimelineEventType =
  | 'fee_paid'
  | 'attendance_marked'
  | 'book_issued'
  | 'book_returned'
  | 'marks_entered'
  | 'leave_applied'
  | 'document_uploaded'
  | 'profile_updated'
  | 'admission'
  | 'promotion'
  | 'transfer'

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, string | number>
}

// ==================== DOCUMENTS ====================

export type DocumentType =
  | 'birth_certificate'
  | 'aadhar_card'
  | 'transfer_certificate'
  | 'photo'
  | 'address_proof'
  | 'marksheet'
  | 'medical_certificate'
  | 'caste_certificate'
  | 'income_certificate'
  | 'other'

export interface StudentDocument {
  id: string
  studentId: string
  type: DocumentType
  name: string
  fileName: string
  fileSize: number
  mimeType: string
  url: string
  uploadedAt: string
  uploadedBy: string
  verified: boolean
  verifiedAt?: string
  verifiedBy?: string
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  birth_certificate: 'Birth Certificate',
  aadhar_card: 'Aadhar Card',
  transfer_certificate: 'Transfer Certificate',
  photo: 'Passport Photo',
  address_proof: 'Address Proof',
  marksheet: 'Previous Marksheet',
  medical_certificate: 'Medical Certificate',
  caste_certificate: 'Caste Certificate',
  income_certificate: 'Income Certificate',
  other: 'Other',
}

// ==================== PROMOTION ====================

export interface PromotionRequest {
  studentIds: string[]
  fromClass: string
  toClass: string
  academicYear: string
  newSection?: string
  autoAssignRollNumbers: boolean
}

export interface PromotionResult {
  promoted: number
  failed: number
  details: {
    studentId: string
    studentName: string
    fromClass: string
    toClass: string
    newSection: string
    newRollNumber: number
    success: boolean
    error?: string
  }[]
}

// ==================== SIBLING ====================

export interface SiblingGroup {
  groupId: string
  students: {
    id: string
    name: string
    class: string
    section: string
    rollNumber: number
    photoUrl: string
  }[]
}

// ==================== HEALTH RECORDS ====================

export interface StudentHealthRecord {
  allergies: string[]
  medicalConditions: string[]
  medications: string[]
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  bloodGroup: string
  height?: string
  weight?: string
  visionLeft?: string
  visionRight?: string
  lastCheckupDate?: string
  insuranceProvider?: string
  insurancePolicyNumber?: string
  notes?: string
}

// ==================== ID CARD ====================

export interface IDCardData {
  studentId: string
  name: string
  class: string
  section: string
  rollNumber: number
  admissionNumber: string
  dateOfBirth: string
  bloodGroup: string
  photoUrl: string
  parentName: string
  parentPhone: string
  address: string
  schoolName: string
  schoolLogo: string
  academicYear: string
  validUntil: string
}

// ==================== BULK IMPORT ====================

export interface BulkImportResult {
  total: number
  successful: number
  failed: number
  errors: {
    row: number
    field: string
    message: string
  }[]
}

export interface BulkImportRow {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  class: string
  section: string
  fatherName: string
  motherName: string
  guardianPhone: string
}

// ==================== PORTFOLIO & SKILLS ====================

export type SkillCategory = 'academic' | 'sports' | 'arts' | 'leadership' | 'technical' | 'communication' | 'other'

export interface StudentSkill {
  id: string
  studentId: string
  name: string
  category: SkillCategory
  proficiencyLevel: 1 | 2 | 3 | 4 | 5
  certifications?: string[]
  endorsedBy?: string[]
  acquiredDate: string
  notes?: string
}

export interface PortfolioItem {
  id: string
  studentId: string
  title: string
  type: 'project' | 'achievement' | 'certificate' | 'publication' | 'competition' | 'other'
  description: string
  date: string
  attachments: { name: string; url: string; type: string }[]
  tags: string[]
  visibility: 'public' | 'school' | 'private'
  featured: boolean
}

export interface StudentPortfolio {
  studentId: string
  bio?: string
  interests: string[]
  careerGoals?: string
  skills: StudentSkill[]
  items: PortfolioItem[]
  lastUpdated: string
}

// ==================== LEARNING STYLE ASSESSMENT ====================

export type LearningStyleType = 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic'
export type IntelligenceType = 'linguistic' | 'logical' | 'spatial' | 'musical' | 'bodily' | 'interpersonal' | 'intrapersonal' | 'naturalist'

export interface LearningStyleAssessment {
  id: string
  studentId: string
  assessmentDate: string
  assessedBy: string
  primaryStyle: LearningStyleType
  secondaryStyle?: LearningStyleType
  styleScores: Record<LearningStyleType, number>
  multipleIntelligences: Record<IntelligenceType, number>
  recommendations: string[]
  accommodations?: string[]
  notes?: string
}

export interface LearningPreferences {
  studentId: string
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night'
  preferredGroupSize: 'individual' | 'pair' | 'small_group' | 'large_group'
  attentionSpan: 'short' | 'medium' | 'long'
  motivators: string[]
  challenges: string[]
  accommodationsNeeded: string[]
}

// ==================== RISK INDICATORS ====================

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical'
export type RiskCategory = 'academic' | 'attendance' | 'behavioral' | 'social' | 'health' | 'financial'

export interface RiskIndicator {
  id: string
  studentId: string
  category: RiskCategory
  level: RiskLevel
  indicator: string
  description: string
  detectedDate: string
  dataPoints: { metric: string; value: number | string; threshold?: number | string }[]
  trend: 'improving' | 'stable' | 'declining'
  interventions: RiskIntervention[]
  status: 'active' | 'monitoring' | 'resolved'
  resolvedDate?: string
  resolvedBy?: string
}

export interface RiskIntervention {
  id: string
  riskId: string
  type: 'counseling' | 'tutoring' | 'parent_meeting' | 'mentoring' | 'accommodation' | 'referral' | 'other'
  description: string
  assignedTo: string
  startDate: string
  endDate?: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  outcome?: string
  notes?: string
}

export interface StudentRiskProfile {
  studentId: string
  overallRiskLevel: RiskLevel
  riskScore: number
  indicators: RiskIndicator[]
  watchList: boolean
  lastAssessment: string
  nextReview?: string
}

// ==================== GRADUATION & PROMOTION TRACKING ====================

export interface GraduationRequirement {
  id: string
  category: string
  name: string
  description: string
  required: boolean
  credits?: number
  minimumGrade?: string
}

export interface StudentGraduationProgress {
  studentId: string
  expectedGraduationYear: string
  currentCredits: number
  requiredCredits: number
  gpa: number
  requirements: {
    requirementId: string
    name: string
    status: 'completed' | 'in_progress' | 'not_started' | 'waived'
    completedDate?: string
    grade?: string
    credits?: number
  }[]
  certifications: { name: string; date: string; issuer: string }[]
  extracurriculars: { activity: string; role: string; years: string }[]
  communityService: { hours: number; organization: string; description: string }[]
  onTrack: boolean
  projectedGraduationDate: string
  notes?: string
}

export interface PromotionHistory {
  id: string
  studentId: string
  academicYear: string
  fromClass: string
  toClass: string
  fromSection: string
  toSection: string
  promotionDate: string
  promotionType: 'regular' | 'conditional' | 'retained' | 'accelerated'
  conditions?: string[]
  approvedBy: string
  remarks?: string
}

// ==================== STUDENT-TEACHER RELATIONSHIPS ====================

export type RelationshipType = 'class_teacher' | 'subject_teacher' | 'mentor' | 'counselor' | 'club_advisor' | 'sports_coach'

export interface StudentTeacherRelationship {
  id: string
  studentId: string
  teacherId: string
  teacherName: string
  relationshipType: RelationshipType
  subject?: string
  academicYear: string
  startDate: string
  endDate?: string
  isActive: boolean
  notes?: string
}

export interface TeacherFeedback {
  id: string
  studentId: string
  teacherId: string
  teacherName: string
  subject?: string
  term: string
  academicYear: string
  feedbackDate: string
  areas: {
    category: 'academic' | 'behavior' | 'participation' | 'effort' | 'social'
    rating: 1 | 2 | 3 | 4 | 5
    comments?: string
  }[]
  overallComments: string
  recommendations?: string
  parentAcknowledged: boolean
  parentAcknowledgedDate?: string
}

export interface MentorshipRecord {
  studentId: string
  mentorId: string
  mentorName: string
  startDate: string
  endDate?: string
  goals: string[]
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly'
  sessions: {
    date: string
    duration: number
    topics: string[]
    notes: string
    actionItems: string[]
  }[]
  status: 'active' | 'completed' | 'paused'
}
