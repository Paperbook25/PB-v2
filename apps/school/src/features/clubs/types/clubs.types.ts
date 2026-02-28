// ==================== CLUB TYPES ====================

export type ClubCategory =
  | 'academic'
  | 'sports'
  | 'arts'
  | 'music'
  | 'technology'
  | 'language'
  | 'social_service'
  | 'environment'
  | 'debate'
  | 'other'

export type ClubStatus = 'active' | 'inactive' | 'pending_approval'

export interface Club {
  id: string
  name: string
  description: string
  category: ClubCategory
  status: ClubStatus
  advisorId: string
  advisorName: string
  presidentId?: string
  presidentName?: string
  vicePresidentId?: string
  vicePresidentName?: string
  secretaryId?: string
  secretaryName?: string
  foundedDate: string
  meetingSchedule?: string
  meetingLocation?: string
  maxMembers?: number
  currentMembers: number
  logoUrl?: string
  website?: string
  email?: string
  socialLinks?: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateClubRequest {
  name: string
  description: string
  category: ClubCategory
  advisorId: string
  meetingSchedule?: string
  meetingLocation?: string
  maxMembers?: number
  logoUrl?: string
  website?: string
  email?: string
}

export interface UpdateClubRequest extends Partial<CreateClubRequest> {
  status?: ClubStatus
  presidentId?: string
  vicePresidentId?: string
  secretaryId?: string
}

export interface ClubFilters {
  search?: string
  category?: ClubCategory | 'all'
  status?: ClubStatus | 'all'
  advisorId?: string
}

// ==================== MEMBERSHIP TYPES ====================

export type MemberRole =
  | 'president'
  | 'vice_president'
  | 'secretary'
  | 'treasurer'
  | 'member'
  | 'coordinator'

export type MembershipStatus = 'active' | 'inactive' | 'pending' | 'rejected' | 'alumni'

export interface ClubMembership {
  id: string
  clubId: string
  clubName: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  role: MemberRole
  status: MembershipStatus
  joinedDate: string
  endDate?: string
  notes?: string
  applicationReason?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface CreateMembershipRequest {
  clubId: string
  studentId: string
  role?: MemberRole
  applicationReason?: string
}

export interface UpdateMembershipRequest {
  role?: MemberRole
  status?: MembershipStatus
  endDate?: string
  notes?: string
  rejectionReason?: string
}

export interface MembershipFilters {
  clubId?: string
  studentId?: string
  role?: MemberRole | 'all'
  status?: MembershipStatus | 'all'
}

// ==================== ACTIVITY TYPES ====================

export type ActivityType =
  | 'meeting'
  | 'workshop'
  | 'competition'
  | 'exhibition'
  | 'performance'
  | 'community_service'
  | 'field_trip'
  | 'guest_lecture'
  | 'practice'
  | 'fundraiser'
  | 'other'

export type ActivityStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'postponed'

export interface ActivitySchedule {
  dayOfWeek?: string
  startTime: string
  endTime: string
  frequency?: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly'
  location: string
}

export interface Activity {
  id: string
  clubId: string
  clubName: string
  title: string
  description: string
  type: ActivityType
  status: ActivityStatus
  schedule: ActivitySchedule
  date: string
  endDate?: string
  organizerId: string
  organizerName: string
  expectedParticipants?: number
  actualParticipants?: number
  budget?: number
  actualCost?: number
  resources?: string[]
  attachments?: { name: string; url: string }[]
  notes?: string
  outcomes?: string
  creditsAwarded?: number
  createdAt: string
  updatedAt: string
}

export interface CreateActivityRequest {
  clubId: string
  title: string
  description: string
  type: ActivityType
  schedule: ActivitySchedule
  date: string
  endDate?: string
  expectedParticipants?: number
  budget?: number
  resources?: string[]
  creditsAwarded?: number
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  status?: ActivityStatus
  actualParticipants?: number
  actualCost?: number
  outcomes?: string
  notes?: string
}

export interface ActivityFilters {
  clubId?: string
  type?: ActivityType | 'all'
  status?: ActivityStatus | 'all'
  startDate?: string
  endDate?: string
}

// ==================== ACHIEVEMENT TYPES ====================

export type AchievementType =
  | 'competition_win'
  | 'certification'
  | 'performance'
  | 'exhibition'
  | 'publication'
  | 'community_impact'
  | 'innovation'
  | 'leadership'
  | 'skill_mastery'
  | 'other'

export type AwardLevel =
  | 'participation'
  | 'school'
  | 'district'
  | 'state'
  | 'national'
  | 'international'

export interface Achievement {
  id: string
  clubId: string
  clubName: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  title: string
  description: string
  type: AchievementType
  level: AwardLevel
  date: string
  position?: string
  competitionName?: string
  venue?: string
  certificateUrl?: string
  mediaUrls?: string[]
  verifiedBy?: string
  verifiedAt?: string
  isVerified: boolean
  creditsAwarded?: number
  createdAt: string
  updatedAt: string
}

export interface CreateAchievementRequest {
  clubId: string
  studentId: string
  title: string
  description: string
  type: AchievementType
  level: AwardLevel
  date: string
  position?: string
  competitionName?: string
  venue?: string
  certificateUrl?: string
  mediaUrls?: string[]
  creditsAwarded?: number
}

export interface UpdateAchievementRequest extends Partial<CreateAchievementRequest> {
  isVerified?: boolean
  verifiedBy?: string
}

export interface AchievementFilters {
  clubId?: string
  studentId?: string
  type?: AchievementType | 'all'
  level?: AwardLevel | 'all'
  isVerified?: boolean
  startDate?: string
  endDate?: string
}

// ==================== EXTRACURRICULAR CREDIT TYPES ====================

export type CreditCategory =
  | 'participation'
  | 'leadership'
  | 'achievement'
  | 'service'
  | 'skill_development'
  | 'attendance'
  | 'special_contribution'

export type CreditStatus = 'pending' | 'approved' | 'rejected'

export interface ExtracurricularCredit {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  clubId?: string
  clubName?: string
  activityId?: string
  activityTitle?: string
  achievementId?: string
  achievementTitle?: string
  category: CreditCategory
  credits: number
  description: string
  academicYear: string
  semester: string
  awardedDate: string
  status: CreditStatus
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateCreditRequest {
  studentId: string
  clubId?: string
  activityId?: string
  achievementId?: string
  category: CreditCategory
  credits: number
  description: string
  academicYear: string
  semester: string
}

export interface UpdateCreditRequest {
  credits?: number
  description?: string
  status?: CreditStatus
  rejectionReason?: string
  notes?: string
}

export interface CreditFilters {
  studentId?: string
  clubId?: string
  category?: CreditCategory | 'all'
  status?: CreditStatus | 'all'
  academicYear?: string
  semester?: string
}

export interface CreditSummary {
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  totalCredits: number
  approvedCredits: number
  pendingCredits: number
  categoryBreakdown: { category: CreditCategory; credits: number }[]
  clubBreakdown: { clubId: string; clubName: string; credits: number }[]
}

// ==================== COMPETITION TYPES ====================

export type CompetitionLevel = 'intra_school' | 'inter_school' | 'district' | 'state' | 'national' | 'international'

export type CompetitionStatus = 'upcoming' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled'

export type ParticipationType = 'individual' | 'team' | 'both'

export interface CompetitionResult {
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  position: string
  score?: number
  remarks?: string
  certificateUrl?: string
  creditsAwarded?: number
}

export interface Competition {
  id: string
  clubId: string
  clubName: string
  title: string
  description: string
  category: ClubCategory
  level: CompetitionLevel
  status: CompetitionStatus
  participationType: ParticipationType
  registrationStartDate: string
  registrationEndDate: string
  competitionDate: string
  endDate?: string
  venue: string
  externalVenue?: boolean
  organizerName: string
  contactEmail?: string
  contactPhone?: string
  maxParticipants?: number
  currentParticipants: number
  entryFee?: number
  prizes?: { position: string; prize: string }[]
  rules?: string[]
  requirements?: string[]
  results?: CompetitionResult[]
  winnerAnnounced: boolean
  attachments?: { name: string; url: string }[]
  createdAt: string
  updatedAt: string
}

export interface CreateCompetitionRequest {
  clubId: string
  title: string
  description: string
  category: ClubCategory
  level: CompetitionLevel
  participationType: ParticipationType
  registrationStartDate: string
  registrationEndDate: string
  competitionDate: string
  endDate?: string
  venue: string
  externalVenue?: boolean
  organizerName: string
  contactEmail?: string
  contactPhone?: string
  maxParticipants?: number
  entryFee?: number
  prizes?: { position: string; prize: string }[]
  rules?: string[]
  requirements?: string[]
}

export interface UpdateCompetitionRequest extends Partial<CreateCompetitionRequest> {
  status?: CompetitionStatus
  currentParticipants?: number
  results?: CompetitionResult[]
  winnerAnnounced?: boolean
}

export interface CompetitionFilters {
  clubId?: string
  category?: ClubCategory | 'all'
  level?: CompetitionLevel | 'all'
  status?: CompetitionStatus | 'all'
  startDate?: string
  endDate?: string
}

export interface CompetitionRegistration {
  id: string
  competitionId: string
  competitionTitle: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  teamName?: string
  teamMembers?: { studentId: string; studentName: string }[]
  registrationDate: string
  status: 'registered' | 'confirmed' | 'withdrawn' | 'disqualified'
  paymentStatus?: 'pending' | 'paid' | 'waived'
  createdAt: string
}

// ==================== CONSTANTS ====================

export const CLUB_CATEGORY_LABELS: Record<ClubCategory, string> = {
  academic: 'Academic',
  sports: 'Sports',
  arts: 'Arts & Crafts',
  music: 'Music',
  technology: 'Technology',
  language: 'Language & Literature',
  social_service: 'Social Service',
  environment: 'Environment',
  debate: 'Debate & Public Speaking',
  other: 'Other',
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  meeting: 'Club Meeting',
  workshop: 'Workshop',
  competition: 'Competition',
  exhibition: 'Exhibition',
  performance: 'Performance',
  community_service: 'Community Service',
  field_trip: 'Field Trip',
  guest_lecture: 'Guest Lecture',
  practice: 'Practice Session',
  fundraiser: 'Fundraiser',
  other: 'Other',
}

export const ACHIEVEMENT_TYPE_LABELS: Record<AchievementType, string> = {
  competition_win: 'Competition Win',
  certification: 'Certification',
  performance: 'Performance',
  exhibition: 'Exhibition',
  publication: 'Publication',
  community_impact: 'Community Impact',
  innovation: 'Innovation',
  leadership: 'Leadership',
  skill_mastery: 'Skill Mastery',
  other: 'Other',
}

export const AWARD_LEVEL_LABELS: Record<AwardLevel, string> = {
  participation: 'Participation',
  school: 'School Level',
  district: 'District Level',
  state: 'State Level',
  national: 'National Level',
  international: 'International Level',
}

export const COMPETITION_LEVEL_LABELS: Record<CompetitionLevel, string> = {
  intra_school: 'Intra-School',
  inter_school: 'Inter-School',
  district: 'District Level',
  state: 'State Level',
  national: 'National Level',
  international: 'International Level',
}

export const CREDIT_CATEGORY_LABELS: Record<CreditCategory, string> = {
  participation: 'Participation',
  leadership: 'Leadership',
  achievement: 'Achievement',
  service: 'Community Service',
  skill_development: 'Skill Development',
  attendance: 'Regular Attendance',
  special_contribution: 'Special Contribution',
}

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  president: 'President',
  vice_president: 'Vice President',
  secretary: 'Secretary',
  treasurer: 'Treasurer',
  member: 'Member',
  coordinator: 'Coordinator',
}

// ==================== DASHBOARD/STATS TYPES ====================

export interface ClubStats {
  totalClubs: number
  activeClubs: number
  totalMembers: number
  totalActivities: number
  upcomingActivities: number
  totalCompetitions: number
  upcomingCompetitions: number
  totalAchievements: number
  totalCreditsAwarded: number
  categoryBreakdown: { category: ClubCategory; count: number }[]
  monthlyActivityTrend: { month: string; count: number }[]
  topClubsByMembers: { clubId: string; clubName: string; members: number }[]
  recentAchievements: Achievement[]
}
