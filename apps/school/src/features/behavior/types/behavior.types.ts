import { Role } from '@/types/common.types'

// ===== Incident Types =====
export type IncidentSeverity = 'minor' | 'moderate' | 'major' | 'critical'
export type IncidentCategory =
  | 'tardiness'
  | 'dress_code'
  | 'disruptive_behavior'
  | 'bullying'
  | 'fighting'
  | 'property_damage'
  | 'academic_dishonesty'
  | 'substance_abuse'
  | 'verbal_abuse'
  | 'insubordination'
  | 'other'
export type IncidentStatus = 'reported' | 'under_review' | 'resolved' | 'escalated'

export interface Incident {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  category: IncidentCategory
  severity: IncidentSeverity
  status: IncidentStatus
  title: string
  description: string
  location: string
  incidentDate: string
  incidentTime: string
  witnesses?: string[]
  attachments?: IncidentAttachment[]
  reportedBy: string
  reportedByName: string
  reportedByRole: Role
  reportedAt: string
  updatedAt: string
  resolution?: IncidentResolution
  actions: DisciplinaryAction[]
  parentNotified: boolean
  parentNotifiedAt?: string
}

export interface IncidentAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface IncidentResolution {
  resolvedBy: string
  resolvedByName: string
  resolvedAt: string
  notes: string
  outcome: 'warning' | 'counseling' | 'detention' | 'suspension' | 'expulsion' | 'no_action'
}

export interface CreateIncidentRequest {
  studentId: string
  category: IncidentCategory
  severity: IncidentSeverity
  title: string
  description: string
  location: string
  incidentDate: string
  incidentTime: string
  witnesses?: string[]
  attachments?: Omit<IncidentAttachment, 'id'>[]
}

export interface UpdateIncidentRequest {
  category?: IncidentCategory
  severity?: IncidentSeverity
  status?: IncidentStatus
  title?: string
  description?: string
  resolution?: Omit<IncidentResolution, 'resolvedAt'>
}

export interface IncidentFilters {
  search?: string
  studentId?: string
  category?: IncidentCategory
  severity?: IncidentSeverity
  status?: IncidentStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// ===== Disciplinary Actions =====
export type ActionType = 'verbal_warning' | 'written_warning' | 'counseling' | 'detention' | 'suspension' | 'expulsion'
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'appealed' | 'overturned'

export interface DisciplinaryAction {
  id: string
  incidentId: string
  studentId: string
  studentName: string
  studentClass: string
  type: ActionType
  status: ActionStatus
  description: string
  startDate: string
  endDate?: string // For suspensions
  durationDays?: number
  issuedBy: string
  issuedByName: string
  issuedAt: string
  completedAt?: string
  notes?: string
  parentAcknowledged: boolean
  parentAcknowledgedAt?: string
  appeal?: ActionAppeal
}

export interface ActionAppeal {
  id: string
  submittedBy: string
  submittedByName: string
  submittedAt: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedByName?: string
  reviewedAt?: string
  reviewNotes?: string
}

export interface CreateActionRequest {
  incidentId?: string
  studentId: string
  type: ActionType
  description: string
  startDate: string
  endDate?: string
  durationDays?: number
  notes?: string
}

export interface UpdateActionRequest {
  status?: ActionStatus
  notes?: string
  completedAt?: string
}

export interface ActionFilters {
  search?: string
  studentId?: string
  type?: ActionType
  status?: ActionStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// ===== Behavior Points =====
export type PointType = 'positive' | 'negative'
export type PointCategory =
  | 'academic_excellence'
  | 'helpfulness'
  | 'leadership'
  | 'good_attendance'
  | 'sports'
  | 'arts'
  | 'community_service'
  | 'improvement'
  | 'late_arrival'
  | 'uniform_violation'
  | 'homework_missing'
  | 'disruptive'
  | 'other'

export interface BehaviorPoint {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  type: PointType
  category: PointCategory
  points: number
  description: string
  awardedBy: string
  awardedByName: string
  awardedAt: string
}

export interface CreateBehaviorPointRequest {
  studentId: string
  type: PointType
  category: PointCategory
  points: number
  description: string
}

export interface BehaviorPointFilters {
  studentId?: string
  type?: PointType
  category?: PointCategory
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface StudentBehaviorSummary {
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  totalPositivePoints: number
  totalNegativePoints: number
  netPoints: number
  incidentCount: number
  lastIncident?: string
  activeActions: number
  behaviorTrend: 'improving' | 'stable' | 'declining'
}

// ===== Detention =====
export type DetentionStatus = 'scheduled' | 'attended' | 'missed' | 'excused' | 'cancelled'

export interface Detention {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  actionId?: string
  incidentId?: string
  reason: string
  date: string
  startTime: string
  endTime: string
  location: string
  supervisorId: string
  supervisorName: string
  status: DetentionStatus
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateDetentionRequest {
  studentId: string
  actionId?: string
  incidentId?: string
  reason: string
  date: string
  startTime: string
  endTime: string
  location: string
  supervisorId: string
}

export interface UpdateDetentionRequest {
  status?: DetentionStatus
  notes?: string
  date?: string
  startTime?: string
  endTime?: string
  location?: string
  supervisorId?: string
}

export interface DetentionFilters {
  search?: string
  studentId?: string
  status?: DetentionStatus
  supervisorId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// ===== Analytics =====
export interface BehaviorStats {
  totalIncidents: number
  incidentsByCategory: { category: IncidentCategory; count: number }[]
  incidentsBySeverity: { severity: IncidentSeverity; count: number }[]
  incidentsByMonth: { month: string; count: number }[]
  totalActions: number
  actionsByType: { type: ActionType; count: number }[]
  totalPositivePoints: number
  totalNegativePoints: number
  topStudentsPositive: { studentId: string; studentName: string; points: number }[]
  studentsAtRisk: StudentBehaviorSummary[]
  detentionStats: {
    scheduled: number
    attended: number
    missed: number
  }
}

// ===== Behavior Policy =====
export interface BehaviorPolicy {
  id: string
  name: string
  description: string
  incidentCategory: IncidentCategory
  severity: IncidentSeverity
  recommendedAction: ActionType
  pointsDeducted: number
  escalationAfter: number // Number of occurrences before escalation
  escalationAction: ActionType
  active: boolean
  createdAt: string
  updatedAt: string
}

// ===== Positive Behavior Reinforcement =====
export type ReinforcementCategory =
  | 'academic_achievement'
  | 'good_citizenship'
  | 'kindness'
  | 'teamwork'
  | 'creativity'
  | 'punctuality'
  | 'responsibility'
  | 'respect'
  | 'perseverance'
  | 'leadership'
  | 'sportsmanship'
  | 'community_service'
  | 'peer_support'
  | 'class_participation'
  | 'improvement'
  | 'other'

export interface RewardCategory {
  id: string
  name: string
  description: string
  pointsRequired: number
  icon?: string
  color?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface PositiveReinforcement {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  category: ReinforcementCategory
  title: string
  description: string
  points: number
  awardedBy: string
  awardedByName: string
  awardedByRole: Role
  awardedAt: string
  witnessedBy?: string[]
  isPublic: boolean // Display on recognition board
  parentNotified: boolean
  parentNotifiedAt?: string
  attachments?: { id: string; name: string; url: string }[]
}

export interface CreatePositiveReinforcementRequest {
  studentId: string
  category: ReinforcementCategory
  title: string
  description: string
  points: number
  witnessedBy?: string[]
  isPublic?: boolean
}

export interface UpdatePositiveReinforcementRequest {
  category?: ReinforcementCategory
  title?: string
  description?: string
  points?: number
  isPublic?: boolean
}

export interface PositiveReinforcementFilters {
  search?: string
  studentId?: string
  category?: ReinforcementCategory
  awardedBy?: string
  isPublic?: boolean
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// ===== Merit Points System =====
export type TransactionType = 'earned' | 'redeemed' | 'adjustment' | 'expired' | 'bonus'

export interface MeritPoint {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  points: number
  category: ReinforcementCategory
  description: string
  source: 'reinforcement' | 'achievement' | 'reward' | 'manual' | 'system'
  sourceId?: string // Link to reinforcement, achievement, etc.
  awardedBy: string
  awardedByName: string
  awardedAt: string
  expiresAt?: string
}

export interface PointTransaction {
  id: string
  studentId: string
  studentName: string
  type: TransactionType
  points: number
  balance: number // Balance after transaction
  description: string
  referenceType?: 'reinforcement' | 'reward_redemption' | 'adjustment' | 'achievement'
  referenceId?: string
  processedBy: string
  processedByName: string
  processedAt: string
  notes?: string
}

export interface PointBalance {
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  currentBalance: number
  totalEarned: number
  totalRedeemed: number
  lifetimePoints: number
  lastTransactionAt?: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  nextTierPoints?: number
}

export interface CreateMeritPointRequest {
  studentId: string
  points: number
  category: ReinforcementCategory
  description: string
  source?: 'reinforcement' | 'achievement' | 'reward' | 'manual'
  sourceId?: string
  expiresAt?: string
}

export interface RedeemPointsRequest {
  studentId: string
  rewardCategoryId: string
  points: number
  notes?: string
}

export interface MeritPointFilters {
  studentId?: string
  category?: ReinforcementCategory
  source?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface PointTransactionFilters {
  studentId?: string
  type?: TransactionType
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// ===== Counselor Referral Workflow =====
export type ReferralStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'follow_up_required'

export type ReferralPriority = 'low' | 'medium' | 'high' | 'urgent'

export type ReferralReason =
  | 'behavioral_concerns'
  | 'academic_struggles'
  | 'social_issues'
  | 'emotional_support'
  | 'family_issues'
  | 'bullying_victim'
  | 'bullying_perpetrator'
  | 'anxiety'
  | 'depression'
  | 'anger_management'
  | 'substance_abuse'
  | 'attendance_issues'
  | 'career_guidance'
  | 'peer_conflict'
  | 'self_harm_concern'
  | 'other'

export interface CounselorReferral {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  reason: ReferralReason
  priority: ReferralPriority
  status: ReferralStatus
  description: string
  referredBy: string
  referredByName: string
  referredByRole: Role
  referredAt: string
  assignedCounselorId?: string
  assignedCounselorName?: string
  assignedAt?: string
  incidentId?: string // Link to incident if applicable
  parentConsentRequired: boolean
  parentConsentGiven?: boolean
  parentConsentDate?: string
  confidential: boolean
  notes?: string
  updatedAt: string
  sessions?: CounselorSession[]
  completedAt?: string
  outcome?: string
}

export interface CounselorSession {
  id: string
  referralId: string
  studentId: string
  studentName: string
  counselorId: string
  counselorName: string
  sessionNumber: number
  scheduledAt: string
  startedAt?: string
  endedAt?: string
  duration?: number // in minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  type: 'individual' | 'group' | 'family' | 'crisis'
  location: string
  notes?: string
  summary?: string
  goals?: string[]
  progress?: string
  nextSteps?: string
  followUpRequired: boolean
  followUpDate?: string
  parentPresent?: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCounselorReferralRequest {
  studentId: string
  reason: ReferralReason
  priority: ReferralPriority
  description: string
  incidentId?: string
  parentConsentRequired?: boolean
  confidential?: boolean
  notes?: string
}

export interface UpdateCounselorReferralRequest {
  status?: ReferralStatus
  priority?: ReferralPriority
  assignedCounselorId?: string
  parentConsentGiven?: boolean
  notes?: string
  outcome?: string
}

export interface CreateCounselorSessionRequest {
  referralId: string
  scheduledAt: string
  type: 'individual' | 'group' | 'family' | 'crisis'
  location: string
  notes?: string
  goals?: string[]
}

export interface UpdateCounselorSessionRequest {
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  startedAt?: string
  endedAt?: string
  notes?: string
  summary?: string
  progress?: string
  nextSteps?: string
  followUpRequired?: boolean
  followUpDate?: string
  parentPresent?: boolean
}

export interface CounselorReferralFilters {
  search?: string
  studentId?: string
  counselorId?: string
  reason?: ReferralReason
  priority?: ReferralPriority
  status?: ReferralStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface CounselorSessionFilters {
  referralId?: string
  studentId?: string
  counselorId?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// ===== Behavior Intervention Tracking =====
export type InterventionType =
  | 'behavioral_contract'
  | 'check_in_check_out'
  | 'mentoring'
  | 'social_skills_group'
  | 'anger_management'
  | 'restorative_practice'
  | 'parent_involvement'
  | 'academic_support'
  | 'peer_mediation'
  | 'counseling'
  | 'environmental_modification'
  | 'positive_reinforcement_plan'
  | 'self_monitoring'
  | 'other'

export type InterventionTier = 'tier_1' | 'tier_2' | 'tier_3' // MTSS/PBIS Tiers

export type InterventionStatus = 'draft' | 'active' | 'paused' | 'completed' | 'discontinued'

export interface BehaviorIntervention {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  type: InterventionType
  tier: InterventionTier
  status: InterventionStatus
  title: string
  description: string
  targetBehaviors: string[]
  replacementBehaviors: string[]
  strategies: string[]
  startDate: string
  endDate?: string
  reviewDate: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  assignedStaff: { id: string; name: string; role: string }[]
  parentInvolvement: boolean
  parentAcknowledged?: boolean
  parentAcknowledgedAt?: string
  progress: InterventionProgress[]
  goals: InterventionGoal[]
  notes?: string
}

export interface InterventionGoal {
  id: string
  interventionId: string
  description: string
  targetMetric?: string
  baselineValue?: number
  targetValue?: number
  currentValue?: number
  status: 'not_started' | 'in_progress' | 'achieved' | 'not_achieved'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface InterventionProgress {
  id: string
  interventionId: string
  date: string
  recordedBy: string
  recordedByName: string
  notes: string
  behaviorRating?: number // 1-5 scale
  goalsProgress?: { goalId: string; value: number; notes?: string }[]
  parentContact?: boolean
  attachments?: { id: string; name: string; url: string }[]
  createdAt: string
}

export interface InterventionPlan {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  title: string
  description: string
  tier: InterventionTier
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'archived'
  startDate: string
  endDate: string
  interventions: BehaviorIntervention[]
  teamMembers: { id: string; name: string; role: string; isPrimary: boolean }[]
  meetingSchedule?: string
  reviewFrequency: 'weekly' | 'biweekly' | 'monthly'
  parentConsent: boolean
  parentConsentDate?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
}

export interface CreateBehaviorInterventionRequest {
  studentId: string
  type: InterventionType
  tier: InterventionTier
  title: string
  description: string
  targetBehaviors: string[]
  replacementBehaviors: string[]
  strategies: string[]
  startDate: string
  endDate?: string
  reviewDate: string
  assignedStaffIds: string[]
  parentInvolvement?: boolean
  goals?: Omit<InterventionGoal, 'id' | 'interventionId' | 'createdAt' | 'updatedAt'>[]
  notes?: string
}

export interface UpdateBehaviorInterventionRequest {
  status?: InterventionStatus
  description?: string
  targetBehaviors?: string[]
  replacementBehaviors?: string[]
  strategies?: string[]
  endDate?: string
  reviewDate?: string
  assignedStaffIds?: string[]
  notes?: string
}

export interface CreateInterventionProgressRequest {
  interventionId: string
  notes: string
  behaviorRating?: number
  goalsProgress?: { goalId: string; value: number; notes?: string }[]
  parentContact?: boolean
}

export interface BehaviorInterventionFilters {
  search?: string
  studentId?: string
  type?: InterventionType
  tier?: InterventionTier
  status?: InterventionStatus
  assignedStaffId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface InterventionPlanFilters {
  search?: string
  studentId?: string
  tier?: InterventionTier
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// ===== Peer Conflict Resolution Tracking =====
export type ConflictType =
  | 'verbal_dispute'
  | 'physical_altercation'
  | 'cyberbullying'
  | 'social_exclusion'
  | 'rumor_spreading'
  | 'property_dispute'
  | 'academic_conflict'
  | 'relationship_conflict'
  | 'group_conflict'
  | 'other'

export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical'

export type ConflictStatus =
  | 'reported'
  | 'under_investigation'
  | 'mediation_scheduled'
  | 'in_mediation'
  | 'resolved'
  | 'escalated'
  | 'monitoring'

export interface ConflictReport {
  id: string
  type: ConflictType
  severity: ConflictSeverity
  status: ConflictStatus
  title: string
  description: string
  location: string
  occurredAt: string
  involvedParties: ConflictParty[]
  witnesses?: { id: string; name: string; role: Role; statement?: string }[]
  reportedBy: string
  reportedByName: string
  reportedByRole: Role
  reportedAt: string
  assignedTo?: string
  assignedToName?: string
  assignedAt?: string
  incidentIds?: string[] // Link to related incidents
  resolutionSteps: ResolutionStep[]
  mediationSessions?: MediationSession[]
  outcome?: ConflictOutcome
  followUp?: ConflictFollowUp
  parentNotifications: { partyId: string; notifiedAt: string; method: string }[]
  confidential: boolean
  notes?: string
  updatedAt: string
}

export interface ConflictParty {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  role: 'initiator' | 'respondent' | 'participant' | 'bystander'
  perspective?: string
  impactStatement?: string
  willingToMediate: boolean
  parentNotified: boolean
  parentNotifiedAt?: string
}

export interface ResolutionStep {
  id: string
  conflictId: string
  stepNumber: number
  action: string
  description: string
  responsiblePerson: string
  responsiblePersonName: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  dueDate?: string
  completedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface MediationSession {
  id: string
  conflictId: string
  sessionNumber: number
  scheduledAt: string
  startedAt?: string
  endedAt?: string
  duration?: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  mediatorId: string
  mediatorName: string
  mediatorRole: Role
  location: string
  participants: { partyId: string; attended: boolean; notes?: string }[]
  agenda?: string[]
  discussionPoints?: string[]
  agreements?: string[]
  nextSteps?: string[]
  outcome?: 'agreement_reached' | 'partial_agreement' | 'no_agreement' | 'needs_follow_up'
  followUpRequired: boolean
  followUpDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ConflictOutcome {
  resolvedAt: string
  resolvedBy: string
  resolvedByName: string
  resolutionType: 'mediation' | 'administrative' | 'counseling' | 'peer_support' | 'other'
  summary: string
  agreements: string[]
  consequencesApplied?: { partyId: string; consequence: string }[]
  satisfactionRating?: { partyId: string; rating: number }[]
  lessonsLearned?: string
}

export interface ConflictFollowUp {
  id: string
  conflictId: string
  scheduledAt: string
  completedAt?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  assignedTo: string
  assignedToName: string
  checkInWith: string[]
  notes?: string
  agreementsHonored?: boolean
  additionalConcerns?: string
  createdAt: string
  updatedAt: string
}

export interface CreateConflictReportRequest {
  type: ConflictType
  severity: ConflictSeverity
  title: string
  description: string
  location: string
  occurredAt: string
  involvedParties: Omit<ConflictParty, 'id'>[]
  witnesses?: { id: string; name: string; role: Role }[]
  incidentIds?: string[]
  confidential?: boolean
  notes?: string
}

export interface UpdateConflictReportRequest {
  status?: ConflictStatus
  severity?: ConflictSeverity
  assignedTo?: string
  notes?: string
}

export interface CreateResolutionStepRequest {
  conflictId: string
  action: string
  description: string
  responsiblePersonId: string
  dueDate?: string
}

export interface UpdateResolutionStepRequest {
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped'
  notes?: string
  completedAt?: string
}

export interface CreateMediationSessionRequest {
  conflictId: string
  scheduledAt: string
  mediatorId: string
  location: string
  participantIds: string[]
  agenda?: string[]
  notes?: string
}

export interface UpdateMediationSessionRequest {
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  startedAt?: string
  endedAt?: string
  discussionPoints?: string[]
  agreements?: string[]
  nextSteps?: string[]
  outcome?: 'agreement_reached' | 'partial_agreement' | 'no_agreement' | 'needs_follow_up'
  followUpRequired?: boolean
  followUpDate?: string
  notes?: string
}

export interface ResolveConflictRequest {
  resolutionType: 'mediation' | 'administrative' | 'counseling' | 'peer_support' | 'other'
  summary: string
  agreements: string[]
  consequencesApplied?: { partyId: string; consequence: string }[]
  lessonsLearned?: string
}

export interface ConflictReportFilters {
  search?: string
  type?: ConflictType
  severity?: ConflictSeverity
  status?: ConflictStatus
  involvedStudentId?: string
  assignedTo?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface MediationSessionFilters {
  conflictId?: string
  mediatorId?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// ===== Extended Analytics =====
export interface BehaviorModuleStats extends BehaviorStats {
  // Positive Reinforcement Stats
  totalReinforcements: number
  reinforcementsByCategory: { category: ReinforcementCategory; count: number }[]
  topReinforcedStudents: { studentId: string; studentName: string; count: number }[]
  // Merit Points Stats
  totalPointsAwarded: number
  totalPointsRedeemed: number
  averagePointsPerStudent: number
  studentsByTier: { tier: string; count: number }[]
  // Counselor Referral Stats
  totalReferrals: number
  referralsByReason: { reason: ReferralReason; count: number }[]
  referralsByStatus: { status: ReferralStatus; count: number }[]
  averageSessionsPerReferral: number
  // Intervention Stats
  totalInterventions: number
  interventionsByType: { type: InterventionType; count: number }[]
  interventionsByTier: { tier: InterventionTier; count: number }[]
  interventionSuccessRate: number
  // Conflict Resolution Stats
  totalConflicts: number
  conflictsByType: { type: ConflictType; count: number }[]
  conflictsBySeverity: { severity: ConflictSeverity; count: number }[]
  mediationSuccessRate: number
  averageResolutionTime: number // in days
}
