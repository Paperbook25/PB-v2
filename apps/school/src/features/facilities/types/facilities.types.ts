// ==================== FACILITY TYPES ====================

export type FacilityType =
  | 'classroom'
  | 'laboratory'
  | 'computer_lab'
  | 'library'
  | 'auditorium'
  | 'sports_hall'
  | 'conference_room'
  | 'seminar_hall'
  | 'music_room'
  | 'art_room'
  | 'cafeteria'
  | 'playground'
  | 'other'

export type FacilityStatus = 'available' | 'occupied' | 'maintenance' | 'reserved' | 'closed'

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  classroom: 'Classroom',
  laboratory: 'Laboratory',
  computer_lab: 'Computer Lab',
  library: 'Library',
  auditorium: 'Auditorium',
  sports_hall: 'Sports Hall',
  conference_room: 'Conference Room',
  seminar_hall: 'Seminar Hall',
  music_room: 'Music Room',
  art_room: 'Art Room',
  cafeteria: 'Cafeteria',
  playground: 'Playground',
  other: 'Other',
}

export const FACILITY_STATUS_LABELS: Record<FacilityStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Under Maintenance',
  reserved: 'Reserved',
  closed: 'Closed',
}

export interface FacilityAmenity {
  name: string
  quantity?: number
  condition: 'good' | 'fair' | 'poor' | 'needs_repair'
}

export interface Facility {
  id: string
  name: string
  code: string
  type: FacilityType
  building: string
  floor: number
  roomNumber: string
  capacity: number
  area: number // in square feet
  status: FacilityStatus
  description?: string
  amenities: FacilityAmenity[]
  imageUrl?: string
  isAirConditioned: boolean
  hasProjector: boolean
  hasWhiteboard: boolean
  hasAudioSystem: boolean
  hasVideoConferencing: boolean
  accessibleForDisabled: boolean
  operatingHours: {
    start: string // HH:mm format
    end: string
  }
  bookingRules?: {
    maxBookingDuration: number // in hours
    minAdvanceBooking: number // in hours
    maxAdvanceBooking: number // in days
    requiresApproval: boolean
    allowRecurring: boolean
    allowedRoles: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface CreateFacilityRequest {
  name: string
  code: string
  type: FacilityType
  building: string
  floor: number
  roomNumber: string
  capacity: number
  area: number
  description?: string
  amenities?: FacilityAmenity[]
  isAirConditioned?: boolean
  hasProjector?: boolean
  hasWhiteboard?: boolean
  hasAudioSystem?: boolean
  hasVideoConferencing?: boolean
  accessibleForDisabled?: boolean
  operatingHours?: {
    start: string
    end: string
  }
  bookingRules?: Facility['bookingRules']
}

export interface UpdateFacilityRequest extends Partial<CreateFacilityRequest> {
  status?: FacilityStatus
}

export interface FacilityFilters {
  search?: string
  type?: FacilityType | 'all'
  building?: string
  status?: FacilityStatus | 'all'
  minCapacity?: number
  maxCapacity?: number
  hasProjector?: boolean
  isAirConditioned?: boolean
}

// ==================== BOOKING TYPES ====================

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type BookingPurpose =
  | 'class'
  | 'exam'
  | 'meeting'
  | 'event'
  | 'workshop'
  | 'training'
  | 'practice'
  | 'other'

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending Approval',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

export const BOOKING_PURPOSE_LABELS: Record<BookingPurpose, string> = {
  class: 'Class/Lecture',
  exam: 'Examination',
  meeting: 'Meeting',
  event: 'Event',
  workshop: 'Workshop',
  training: 'Training Session',
  practice: 'Practice Session',
  other: 'Other',
}

export interface BookingSlot {
  date: string // YYYY-MM-DD format
  startTime: string // HH:mm format
  endTime: string // HH:mm format
}

export interface Booking {
  id: string
  facilityId: string
  facilityName: string
  facilityCode: string
  facilityType: FacilityType
  bookedBy: {
    id: string
    name: string
    role: string
    department?: string
  }
  purpose: BookingPurpose
  title: string
  description?: string
  slot: BookingSlot
  attendeesCount: number
  status: BookingStatus
  requiresResources: boolean
  resources?: BookingResource[]
  notes?: string
  approvedBy?: {
    id: string
    name: string
    approvedAt: string
  }
  cancelledBy?: {
    id: string
    name: string
    cancelledAt: string
    reason: string
  }
  checkedInAt?: string
  completedAt?: string
  recurrence?: RecurrenceInfo
  isRecurringInstance: boolean
  parentBookingId?: string
  createdAt: string
  updatedAt: string
}

export interface BookingResource {
  resourceId: string
  resourceName: string
  quantity: number
}

export interface RecurrenceInfo {
  pattern: 'daily' | 'weekly' | 'monthly'
  interval: number // every N days/weeks/months
  daysOfWeek?: number[] // 0-6 for Sunday-Saturday (for weekly)
  dayOfMonth?: number // 1-31 (for monthly)
  endDate: string
  occurrences?: number
}

export interface RecurringBooking {
  id: string
  facilityId: string
  facilityName: string
  bookedBy: {
    id: string
    name: string
    role: string
  }
  purpose: BookingPurpose
  title: string
  description?: string
  startTime: string // HH:mm
  endTime: string // HH:mm
  recurrence: RecurrenceInfo
  attendeesCount: number
  resources?: BookingResource[]
  status: 'active' | 'paused' | 'cancelled' | 'completed'
  instances: string[] // Array of booking IDs
  createdAt: string
  updatedAt: string
}

export interface CreateBookingRequest {
  facilityId: string
  purpose: BookingPurpose
  title: string
  description?: string
  slot: BookingSlot
  attendeesCount: number
  resources?: BookingResource[]
  notes?: string
  recurrence?: RecurrenceInfo
}

export interface UpdateBookingRequest {
  title?: string
  description?: string
  attendeesCount?: number
  resources?: BookingResource[]
  notes?: string
}

export interface BookingFilters {
  facilityId?: string
  facilityType?: FacilityType
  bookedById?: string
  status?: BookingStatus | 'all'
  purpose?: BookingPurpose | 'all'
  dateFrom?: string
  dateTo?: string
}

// ==================== RESOURCE TYPES ====================

export type ResourceCategory =
  | 'audio_visual'
  | 'furniture'
  | 'sports_equipment'
  | 'lab_equipment'
  | 'teaching_aids'
  | 'electronics'
  | 'stationery'
  | 'other'

export type ResourceStatus = 'available' | 'in_use' | 'maintenance' | 'retired'

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  audio_visual: 'Audio/Visual Equipment',
  furniture: 'Furniture',
  sports_equipment: 'Sports Equipment',
  lab_equipment: 'Lab Equipment',
  teaching_aids: 'Teaching Aids',
  electronics: 'Electronics',
  stationery: 'Stationery',
  other: 'Other',
}

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  available: 'Available',
  in_use: 'In Use',
  maintenance: 'Under Maintenance',
  retired: 'Retired',
}

export interface Resource {
  id: string
  name: string
  code: string
  category: ResourceCategory
  description?: string
  totalQuantity: number
  availableQuantity: number
  inUseQuantity: number
  maintenanceQuantity: number
  status: ResourceStatus
  location: string
  imageUrl?: string
  specifications?: Record<string, string>
  purchaseDate?: string
  warrantyExpiry?: string
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
  createdAt: string
  updatedAt: string
}

export interface ResourceAvailability {
  resourceId: string
  resourceName: string
  date: string
  slots: {
    startTime: string
    endTime: string
    availableQuantity: number
    bookedBy?: string
    bookingId?: string
  }[]
}

export interface CreateResourceRequest {
  name: string
  code: string
  category: ResourceCategory
  description?: string
  totalQuantity: number
  location: string
  specifications?: Record<string, string>
  purchaseDate?: string
  warrantyExpiry?: string
}

export interface UpdateResourceRequest extends Partial<CreateResourceRequest> {
  status?: ResourceStatus
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
}

export interface ResourceFilters {
  search?: string
  category?: ResourceCategory | 'all'
  status?: ResourceStatus | 'all'
  location?: string
}

// ==================== CONFLICT DETECTION TYPES ====================

export type ConflictType =
  | 'facility_overlap'
  | 'resource_unavailable'
  | 'capacity_exceeded'
  | 'outside_operating_hours'
  | 'booking_rules_violation'
  | 'maintenance_scheduled'
  | 'double_booking'

export type ConflictSeverity = 'error' | 'warning' | 'info'

export const CONFLICT_TYPE_LABELS: Record<ConflictType, string> = {
  facility_overlap: 'Facility Already Booked',
  resource_unavailable: 'Resource Unavailable',
  capacity_exceeded: 'Capacity Exceeded',
  outside_operating_hours: 'Outside Operating Hours',
  booking_rules_violation: 'Booking Rules Violation',
  maintenance_scheduled: 'Maintenance Scheduled',
  double_booking: 'Double Booking Detected',
}

export interface BookingConflict {
  id: string
  type: ConflictType
  severity: ConflictSeverity
  message: string
  details: string
  conflictingBookingId?: string
  conflictingBookingTitle?: string
  facilityId: string
  facilityName: string
  slot: BookingSlot
  suggestedAlternatives?: AlternativeSlot[]
  createdAt: string
}

export interface AlternativeSlot {
  facilityId: string
  facilityName: string
  slot: BookingSlot
  matchScore: number // 0-100, how well it matches the original request
}

export type ResolutionAction =
  | 'cancel_new'
  | 'cancel_existing'
  | 'modify_new'
  | 'modify_existing'
  | 'use_alternative'
  | 'override'
  | 'split_booking'

export const RESOLUTION_ACTION_LABELS: Record<ResolutionAction, string> = {
  cancel_new: 'Cancel New Booking',
  cancel_existing: 'Cancel Existing Booking',
  modify_new: 'Modify New Booking',
  modify_existing: 'Modify Existing Booking',
  use_alternative: 'Use Alternative Slot',
  override: 'Override Conflict',
  split_booking: 'Split Booking',
}

export interface ConflictResolution {
  id: string
  conflictId: string
  action: ResolutionAction
  resolvedBy: {
    id: string
    name: string
  }
  details: string
  affectedBookings: string[]
  alternativeUsed?: AlternativeSlot
  resolvedAt: string
}

export interface CheckConflictRequest {
  facilityId: string
  slot: BookingSlot
  excludeBookingId?: string
  resources?: { resourceId: string; quantity: number }[]
  attendeesCount?: number
}

export interface CheckConflictResponse {
  hasConflicts: boolean
  conflicts: BookingConflict[]
  alternatives: AlternativeSlot[]
}

// ==================== MAINTENANCE TYPES ====================

export type MaintenanceType =
  | 'preventive'
  | 'corrective'
  | 'emergency'
  | 'inspection'
  | 'cleaning'
  | 'upgrade'
  | 'repair'

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical'

export type MaintenanceStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold'
  | 'overdue'

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  preventive: 'Preventive Maintenance',
  corrective: 'Corrective Maintenance',
  emergency: 'Emergency Repair',
  inspection: 'Inspection',
  cleaning: 'Cleaning',
  upgrade: 'Upgrade',
  repair: 'Repair',
}

export const MAINTENANCE_PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  on_hold: 'On Hold',
  overdue: 'Overdue',
}

export interface MaintenanceRequest {
  id: string
  facilityId?: string
  facilityName?: string
  resourceId?: string
  resourceName?: string
  type: MaintenanceType
  priority: MaintenancePriority
  status: MaintenanceStatus
  title: string
  description: string
  reportedBy: {
    id: string
    name: string
    role: string
  }
  assignedTo?: {
    id: string
    name: string
    role: string
  }
  scheduledDate?: string
  scheduledStartTime?: string
  scheduledEndTime?: string
  actualStartTime?: string
  actualEndTime?: string
  estimatedCost?: number
  actualCost?: number
  vendor?: string
  workOrderNumber?: string
  attachments?: {
    name: string
    url: string
    type: string
  }[]
  notes?: string
  completionNotes?: string
  affectedBookings?: string[]
  createdAt: string
  updatedAt: string
}

export interface MaintenanceSchedule {
  id: string
  facilityId?: string
  facilityName?: string
  resourceId?: string
  resourceName?: string
  type: MaintenanceType
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  monthOfYear?: number // 1-12 for yearly
  preferredTimeSlot: {
    start: string
    end: string
  }
  duration: number // in hours
  description: string
  lastPerformedDate?: string
  nextScheduledDate: string
  isActive: boolean
  assignedTo?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateMaintenanceRequest {
  facilityId?: string
  resourceId?: string
  type: MaintenanceType
  priority: MaintenancePriority
  title: string
  description: string
  scheduledDate?: string
  scheduledStartTime?: string
  scheduledEndTime?: string
  estimatedCost?: number
  assignedToId?: string
  vendor?: string
  notes?: string
}

export interface UpdateMaintenanceRequest extends Partial<CreateMaintenanceRequest> {
  status?: MaintenanceStatus
  actualStartTime?: string
  actualEndTime?: string
  actualCost?: number
  completionNotes?: string
  workOrderNumber?: string
}

export interface MaintenanceFilters {
  facilityId?: string
  resourceId?: string
  type?: MaintenanceType | 'all'
  priority?: MaintenancePriority | 'all'
  status?: MaintenanceStatus | 'all'
  dateFrom?: string
  dateTo?: string
  assignedToId?: string
}

// ==================== UTILIZATION ANALYTICS TYPES ====================

export type UtilizationPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface UsageStats {
  facilityId: string
  facilityName: string
  facilityType: FacilityType
  period: UtilizationPeriod
  periodStart: string
  periodEnd: string
  totalBookings: number
  confirmedBookings: number
  cancelledBookings: number
  noShowBookings: number
  totalHoursBooked: number
  totalAvailableHours: number
  utilizationPercentage: number
  peakHours: {
    hour: number // 0-23
    bookingCount: number
  }[]
  popularPurposes: {
    purpose: BookingPurpose
    count: number
    percentage: number
  }[]
  averageBookingDuration: number // in hours
  averageAttendees: number
  repeatBookerPercentage: number
}

export interface UtilizationReport {
  id: string
  title: string
  period: UtilizationPeriod
  periodStart: string
  periodEnd: string
  generatedAt: string
  generatedBy: {
    id: string
    name: string
  }
  summary: {
    totalFacilities: number
    totalBookings: number
    overallUtilization: number
    mostUtilizedFacility: {
      id: string
      name: string
      utilization: number
    }
    leastUtilizedFacility: {
      id: string
      name: string
      utilization: number
    }
    totalRevenue?: number
    maintenanceDowntime: number // in hours
  }
  facilityStats: UsageStats[]
  trends: {
    date: string
    bookings: number
    utilization: number
  }[]
  recommendations?: string[]
}

export interface HeatmapData {
  facilityId: string
  facilityName: string
  data: {
    day: number // 0-6 (Sunday-Saturday)
    hour: number // 0-23
    value: number // utilization percentage or booking count
  }[]
}

export interface CapacityAnalysis {
  facilityId: string
  facilityName: string
  capacity: number
  averageOccupancy: number
  occupancyPercentage: number
  underutilizedSessions: number
  overutilizedSessions: number
  optimalCapacity: number
}

export interface ResourceUtilization {
  resourceId: string
  resourceName: string
  category: ResourceCategory
  totalQuantity: number
  period: UtilizationPeriod
  periodStart: string
  periodEnd: string
  totalBookings: number
  averageQuantityBooked: number
  utilizationPercentage: number
  maintenanceDowntime: number
  mostRequestedWith: {
    facilityId: string
    facilityName: string
    count: number
  }[]
}

export interface UtilizationFilters {
  facilityIds?: string[]
  facilityTypes?: FacilityType[]
  period: UtilizationPeriod
  periodStart: string
  periodEnd: string
  building?: string
  includeResources?: boolean
}

export interface GenerateReportRequest {
  title: string
  period: UtilizationPeriod
  periodStart: string
  periodEnd: string
  facilityIds?: string[]
  facilityTypes?: FacilityType[]
  includeRecommendations?: boolean
}

// ==================== DASHBOARD TYPES ====================

export interface FacilitiesDashboardStats {
  totalFacilities: number
  availableFacilities: number
  occupiedFacilities: number
  underMaintenance: number
  totalResources: number
  availableResources: number
  todayBookings: number
  pendingApprovals: number
  activeMaintenanceRequests: number
  weeklyUtilization: number
  monthlyTrend: {
    month: string
    bookings: number
    utilization: number
  }[]
  upcomingMaintenance: {
    id: string
    facilityName: string
    type: MaintenanceType
    scheduledDate: string
  }[]
  recentBookings: {
    id: string
    facilityName: string
    title: string
    bookedBy: string
    slot: BookingSlot
    status: BookingStatus
  }[]
}

// ==================== CONSTANTS ====================

export const BUILDINGS = [
  'Main Building',
  'Science Block',
  'Arts Block',
  'Administration Block',
  'Sports Complex',
  'Library Building',
  'Hostel Block A',
  'Hostel Block B',
  'Workshop',
] as const

export const FLOORS = [0, 1, 2, 3, 4, 5] as const

export const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00',
] as const

export const DEFAULT_OPERATING_HOURS = {
  start: '08:00',
  end: '18:00',
}

export const DEFAULT_BOOKING_RULES = {
  maxBookingDuration: 4,
  minAdvanceBooking: 2,
  maxAdvanceBooking: 30,
  requiresApproval: true,
  allowRecurring: true,
  allowedRoles: ['admin', 'teacher', 'staff'],
}
