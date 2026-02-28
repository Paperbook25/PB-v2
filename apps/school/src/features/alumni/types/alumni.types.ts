// Alumni types

export interface Alumni {
  id: string
  studentId?: string // linked to former student record
  name: string
  email: string
  phone?: string
  batch: string // graduation year e.g., "2020"
  class: string // last class attended
  section: string
  rollNumber: string
  photo?: string
  currentCity?: string
  currentCountry?: string
  occupation?: string
  company?: string
  linkedIn?: string
  isVerified: boolean
  registeredAt: string
}

export type AchievementCategory = 'academic' | 'professional' | 'sports' | 'arts' | 'social' | 'other'

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  academic: 'Academic',
  professional: 'Professional',
  sports: 'Sports',
  arts: 'Arts & Culture',
  social: 'Social Service',
  other: 'Other',
}

export interface AlumniAchievement {
  id: string
  alumniId: string
  alumniName: string
  title: string
  description: string
  category: AchievementCategory
  date: string
  isPublished: boolean
  addedBy: 'self' | 'admin'
}

export type ContributionType = 'monetary' | 'scholarship' | 'mentorship' | 'infrastructure' | 'books' | 'other'

export const CONTRIBUTION_TYPE_LABELS: Record<ContributionType, string> = {
  monetary: 'Monetary Donation',
  scholarship: 'Scholarship Fund',
  mentorship: 'Mentorship Program',
  infrastructure: 'Infrastructure',
  books: 'Books & Materials',
  other: 'Other',
}

export type ContributionStatus = 'pledged' | 'received' | 'utilized'

export const CONTRIBUTION_STATUS_LABELS: Record<ContributionStatus, string> = {
  pledged: 'Pledged',
  received: 'Received',
  utilized: 'Utilized',
}

export interface AlumniContribution {
  id: string
  alumniId: string
  alumniName: string
  type: ContributionType
  description: string
  amount?: number
  date: string
  status: ContributionStatus
  acknowledgement?: string
}

export type EventType = 'reunion' | 'meet' | 'webinar' | 'fundraiser' | 'sports' | 'other'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  reunion: 'Reunion',
  meet: 'Alumni Meet',
  webinar: 'Webinar',
  fundraiser: 'Fundraiser',
  sports: 'Sports Event',
  other: 'Other',
}

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: 'Upcoming',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export interface AlumniEvent {
  id: string
  title: string
  description: string
  type: EventType
  date: string
  venue?: string
  isVirtual: boolean
  meetingLink?: string
  targetBatches: string[]
  registeredCount: number
  maxCapacity?: number
  status: EventStatus
}

export interface EventRegistration {
  id: string
  eventId: string
  alumniId: string
  alumniName: string
  registeredAt: string
  status: 'registered' | 'attended' | 'cancelled'
}

export interface BatchStats {
  batch: string
  totalAlumni: number
  verifiedAlumni: number
  contributions: number
  achievements: number
}

export interface AlumniStats {
  totalAlumni: number
  verifiedAlumni: number
  totalContributions: number
  contributionAmount: number
  totalAchievements: number
  upcomingEvents: number
  batchCount: number
}

// API payload types
export interface CreateAlumniPayload {
  name: string
  email: string
  phone?: string
  batch: string
  class: string
  section: string
  rollNumber: string
  photo?: string
  currentCity?: string
  currentCountry?: string
  occupation?: string
  company?: string
  linkedIn?: string
}

export interface UpdateAlumniPayload extends Partial<CreateAlumniPayload> {
  isVerified?: boolean
}

export interface CreateAchievementPayload {
  alumniId: string
  title: string
  description: string
  category: AchievementCategory
  date: string
  isPublished?: boolean
}

export interface CreateContributionPayload {
  alumniId: string
  type: ContributionType
  description: string
  amount?: number
  date: string
}

export interface CreateEventPayload {
  title: string
  description: string
  type: EventType
  date: string
  venue?: string
  isVirtual: boolean
  meetingLink?: string
  targetBatches: string[]
  maxCapacity?: number
}

export interface AlumniFilters {
  batch?: string
  isVerified?: boolean
  search?: string
}

export interface AchievementFilters {
  category?: AchievementCategory
  isPublished?: boolean
  alumniId?: string
}

export interface ContributionFilters {
  type?: ContributionType
  status?: ContributionStatus
  alumniId?: string
}

export interface EventFilters {
  type?: EventType
  status?: EventStatus
  batch?: string
}
