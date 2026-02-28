export type RouteStatus = 'active' | 'inactive' | 'maintenance'
export type VehicleStatus = 'running' | 'maintenance' | 'idle' | 'decommissioned'
export type DriverStatus = 'active' | 'on_leave' | 'inactive'
export type TripStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled'
export type TripType = 'pickup' | 'drop'
export type MaintenanceType = 'routine' | 'repair' | 'inspection' | 'insurance' | 'fitness_certificate'
export type NotificationEventType = 'boarded' | 'alighted' | 'delay' | 'route_change' | 'breakdown'

export const ROUTE_STATUS_LABELS: Record<RouteStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  maintenance: 'Under Maintenance',
}

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  running: 'Running',
  maintenance: 'In Maintenance',
  idle: 'Idle',
  decommissioned: 'Decommissioned',
}

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  active: 'Active',
  on_leave: 'On Leave',
  inactive: 'Inactive',
}

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export interface RouteStop {
  id: string
  name: string
  landmark: string
  pickupTime: string // HH:mm
  dropTime: string   // HH:mm
  distanceFromSchool: number // km
  order: number
  studentCount: number
}

export interface TransportRoute {
  id: string
  name: string
  code: string
  description: string
  stops: RouteStop[]
  totalStudents: number
  totalDistance: number // km
  assignedVehicleId: string | null
  assignedDriverId: string | null
  status: RouteStatus
  monthlyFee: number
  createdAt: string
  updatedAt: string
}

export interface CreateRouteRequest {
  name: string
  code: string
  description: string
  stops: Omit<RouteStop, 'id' | 'studentCount'>[]
  monthlyFee: number
}

export interface Vehicle {
  id: string
  registrationNumber: string
  type: 'bus' | 'mini_bus' | 'van'
  make: string
  model: string
  year: number
  capacity: number
  fuelType: 'diesel' | 'petrol' | 'cng' | 'electric'
  chassisNumber: string
  engineNumber: string
  insuranceExpiry: string
  fitnessExpiry: string
  permitExpiry: string
  lastServiceDate: string
  nextServiceDue: string
  odometerReading: number
  assignedRouteId: string | null
  status: VehicleStatus
  gpsDeviceId: string | null
  features: string[]
  createdAt: string
}

export const VEHICLE_TYPE_LABELS: Record<Vehicle['type'], string> = {
  bus: 'Bus',
  mini_bus: 'Mini Bus',
  van: 'Van',
}

export interface CreateVehicleRequest {
  registrationNumber: string
  type: Vehicle['type']
  make: string
  model: string
  year: number
  capacity: number
  fuelType: Vehicle['fuelType']
  chassisNumber: string
  engineNumber: string
  insuranceExpiry: string
  fitnessExpiry: string
  permitExpiry: string
}

export interface Driver {
  id: string
  name: string
  phone: string
  email: string
  licenseNumber: string
  licenseExpiry: string
  licenseType: string
  experience: number // years
  address: string
  emergencyContact: string
  bloodGroup: string
  photoUrl: string
  assignedRouteId: string | null
  assignedVehicleId: string | null
  status: DriverStatus
  joiningDate: string
  salary: number
  createdAt: string
}

export interface CreateDriverRequest {
  name: string
  phone: string
  email: string
  licenseNumber: string
  licenseExpiry: string
  licenseType: string
  experience: number
  address: string
  emergencyContact: string
  bloodGroup: string
  salary: number
}

export interface StopStudentAssignment {
  id: string
  studentId: string
  studentName: string
  class: string
  section: string
  routeId: string
  stopId: string
  stopName: string
  parentPhone: string
  monthlyFee: number
  assignedDate: string
  isActive: boolean
}

export interface AssignStudentRequest {
  studentId: string
  routeId: string
  stopId: string
}

export interface GPSPosition {
  routeId: string
  vehicleId: string
  driverName: string
  lat: number
  lng: number
  speed: number // km/h
  heading: number // degrees
  lastUpdated: string
  tripStatus: TripStatus
  tripType: TripType
  currentStop: string
  nextStop: string
  eta: string // minutes
  studentsOnBoard: number
}

export interface MaintenanceRecord {
  id: string
  vehicleId: string
  vehicleNumber: string
  type: MaintenanceType
  description: string
  scheduledDate: string
  completedDate: string | null
  cost: number
  vendor: string
  notes: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue'
  documents: string[]
  createdAt: string
}

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  routine: 'Routine Service',
  repair: 'Repair',
  inspection: 'Inspection',
  insurance: 'Insurance Renewal',
  fitness_certificate: 'Fitness Certificate',
}

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceRecord['status'], string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
}

export interface CreateMaintenanceRequest {
  vehicleId: string
  type: MaintenanceType
  description: string
  scheduledDate: string
  cost: number
  vendor: string
  notes: string
}

export interface TransportNotification {
  id: string
  studentId: string
  studentName: string
  parentPhone: string
  routeId: string
  routeName: string
  stopName: string
  eventType: NotificationEventType
  message: string
  sentAt: string
  channel: 'sms' | 'whatsapp' | 'push'
  status: 'sent' | 'delivered' | 'failed'
}

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEventType, string> = {
  boarded: 'Boarded Bus',
  alighted: 'Alighted from Bus',
  delay: 'Bus Delayed',
  route_change: 'Route Changed',
  breakdown: 'Bus Breakdown',
}

export interface TransportStats {
  totalRoutes: number
  activeRoutes: number
  totalVehicles: number
  runningVehicles: number
  totalDrivers: number
  activeDrivers: number
  totalStudentsUsing: number
  upcomingMaintenance: number
}

// ==================== ROUTE OPTIMIZATION ====================

export type OptimizationStrategy = 'shortest_distance' | 'shortest_time' | 'fewest_stops' | 'balanced'
export type OptimizationStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface OptimizedStop {
  stopId: string
  stopName: string
  originalOrder: number
  optimizedOrder: number
  lat: number
  lng: number
  estimatedArrivalTime: string // HH:mm
  distanceFromPrevious: number // km
  timeFromPrevious: number // minutes
  studentCount: number
}

export interface RouteOptimization {
  id: string
  routeId: string
  routeName: string
  strategy: OptimizationStrategy
  status: OptimizationStatus
  originalDistance: number // km
  optimizedDistance: number // km
  distanceSaved: number // km
  originalDuration: number // minutes
  optimizedDuration: number // minutes
  timeSaved: number // minutes
  optimizedStops: OptimizedStop[]
  fuelSavingEstimate: number // liters
  costSavingEstimate: number // currency
  appliedAt: string | null
  createdAt: string
  createdBy: string
}

export const OPTIMIZATION_STRATEGY_LABELS: Record<OptimizationStrategy, string> = {
  shortest_distance: 'Shortest Distance',
  shortest_time: 'Shortest Time',
  fewest_stops: 'Fewest Stops',
  balanced: 'Balanced (Distance + Time)',
}

export const OPTIMIZATION_STATUS_LABELS: Record<OptimizationStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
}

export interface CreateRouteOptimizationRequest {
  routeId: string
  strategy: OptimizationStrategy
}

export interface ApplyOptimizationRequest {
  optimizationId: string
  routeId: string
}

// ==================== FUEL CONSUMPTION TRACKING ====================

export type FuelLogType = 'refuel' | 'consumption_record'

export interface FuelLog {
  id: string
  vehicleId: string
  vehicleNumber: string
  driverId: string
  driverName: string
  type: FuelLogType
  date: string
  odometerReading: number
  quantity: number // liters
  pricePerLiter: number
  totalCost: number
  fuelStation: string
  receiptNumber: string | null
  notes: string | null
  createdAt: string
  createdBy: string
}

export interface FuelConsumption {
  vehicleId: string
  vehicleNumber: string
  period: string // YYYY-MM
  totalFuelConsumed: number // liters
  totalDistanceTraveled: number // km
  totalCost: number
  averageMileage: number // km/liter
  tripCount: number
  refuelCount: number
}

export interface FuelEfficiency {
  vehicleId: string
  vehicleNumber: string
  vehicleType: Vehicle['type']
  currentMileage: number // km/liter
  expectedMileage: number // km/liter based on vehicle type
  efficiencyRating: 'excellent' | 'good' | 'average' | 'poor'
  trend: 'improving' | 'stable' | 'declining'
  lastMonthMileage: number
  thisMonthMileage: number
  recommendations: string[]
}

export const FUEL_LOG_TYPE_LABELS: Record<FuelLogType, string> = {
  refuel: 'Refuel',
  consumption_record: 'Consumption Record',
}

export const EFFICIENCY_RATING_LABELS: Record<FuelEfficiency['efficiencyRating'], string> = {
  excellent: 'Excellent',
  good: 'Good',
  average: 'Average',
  poor: 'Poor',
}

export interface CreateFuelLogRequest {
  vehicleId: string
  driverId: string
  type: FuelLogType
  date: string
  odometerReading: number
  quantity: number
  pricePerLiter: number
  fuelStation: string
  receiptNumber?: string
  notes?: string
}

// ==================== DRIVER BEHAVIOR MONITORING ====================

export type DrivingEventType =
  | 'harsh_braking'
  | 'rapid_acceleration'
  | 'over_speeding'
  | 'sharp_turn'
  | 'idle_engine'
  | 'seatbelt_violation'
  | 'phone_usage'
  | 'fatigue_detected'
  | 'lane_departure'
  | 'tailgating'

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface DrivingEvent {
  id: string
  driverId: string
  driverName: string
  vehicleId: string
  vehicleNumber: string
  routeId: string | null
  eventType: DrivingEventType
  severity: EventSeverity
  description: string
  location: {
    lat: number
    lng: number
    address: string
  }
  speed: number | null // km/h at time of event
  timestamp: string
  acknowledged: boolean
  acknowledgedAt: string | null
  acknowledgedBy: string | null
  notes: string | null
}

export interface BehaviorScore {
  driverId: string
  driverName: string
  overallScore: number // 0-100
  safetyScore: number // 0-100
  efficiencyScore: number // 0-100
  complianceScore: number // 0-100
  scoreGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  trend: 'improving' | 'stable' | 'declining'
  totalTrips: number
  totalEvents: number
  eventsByType: Record<DrivingEventType, number>
  lastUpdated: string
}

export interface DriverBehavior {
  driverId: string
  driverName: string
  photoUrl: string
  assignedVehicle: string | null
  assignedRoute: string | null
  behaviorScore: BehaviorScore
  recentEvents: DrivingEvent[]
  monthlyScores: Array<{
    month: string
    score: number
  }>
  achievements: string[]
  warnings: string[]
}

export const DRIVING_EVENT_TYPE_LABELS: Record<DrivingEventType, string> = {
  harsh_braking: 'Harsh Braking',
  rapid_acceleration: 'Rapid Acceleration',
  over_speeding: 'Over Speeding',
  sharp_turn: 'Sharp Turn',
  idle_engine: 'Idle Engine',
  seatbelt_violation: 'Seatbelt Violation',
  phone_usage: 'Phone Usage',
  fatigue_detected: 'Fatigue Detected',
  lane_departure: 'Lane Departure',
  tailgating: 'Tailgating',
}

export const EVENT_SEVERITY_LABELS: Record<EventSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const SCORE_GRADE_LABELS: Record<BehaviorScore['scoreGrade'], string> = {
  A: 'Excellent (90-100)',
  B: 'Good (80-89)',
  C: 'Average (70-79)',
  D: 'Below Average (60-69)',
  F: 'Poor (Below 60)',
}

export interface AcknowledgeEventRequest {
  eventId: string
  notes?: string
}

// ==================== PARENT REAL-TIME NOTIFICATIONS (ETA) ====================

export type ParentNotificationType =
  | 'trip_started'
  | 'approaching_stop'
  | 'arrived_at_stop'
  | 'student_boarded'
  | 'student_dropped'
  | 'eta_update'
  | 'delay_alert'
  | 'route_deviation'
  | 'emergency_alert'

export interface ETAUpdate {
  id: string
  routeId: string
  routeName: string
  vehicleId: string
  stopId: string
  stopName: string
  studentId: string
  studentName: string
  parentId: string
  parentPhone: string
  tripType: TripType
  estimatedArrival: string // ISO datetime
  currentETA: number // minutes
  previousETA: number | null // minutes
  etaChange: number | null // minutes (positive = delayed, negative = early)
  distanceAway: number // km
  trafficCondition: 'light' | 'moderate' | 'heavy'
  lastUpdated: string
}

export interface ParentNotification {
  id: string
  parentId: string
  parentName: string
  parentPhone: string
  parentEmail: string | null
  studentId: string
  studentName: string
  routeId: string
  routeName: string
  stopId: string
  stopName: string
  notificationType: ParentNotificationType
  title: string
  message: string
  eta: number | null // minutes
  vehicleLocation: {
    lat: number
    lng: number
  } | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  channel: 'sms' | 'whatsapp' | 'push' | 'email'
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read'
  sentAt: string | null
  deliveredAt: string | null
  readAt: string | null
  createdAt: string
}

export const PARENT_NOTIFICATION_TYPE_LABELS: Record<ParentNotificationType, string> = {
  trip_started: 'Trip Started',
  approaching_stop: 'Bus Approaching',
  arrived_at_stop: 'Bus Arrived',
  student_boarded: 'Student Boarded',
  student_dropped: 'Student Dropped Off',
  eta_update: 'ETA Update',
  delay_alert: 'Delay Alert',
  route_deviation: 'Route Deviation',
  emergency_alert: 'Emergency Alert',
}

export interface SendParentNotificationRequest {
  studentIds: string[]
  notificationType: ParentNotificationType
  title: string
  message: string
  channel: ParentNotification['channel']
  priority?: ParentNotification['priority']
}

export interface ETASubscription {
  id: string
  parentId: string
  studentId: string
  stopId: string
  notifyOnApproaching: boolean
  approachingThreshold: number // minutes before arrival
  notifyOnArrival: boolean
  notifyOnDelay: boolean
  delayThreshold: number // minutes of delay to trigger notification
  channels: ParentNotification['channel'][]
  isActive: boolean
}

// ==================== EMERGENCY SOS INTEGRATION ====================

export type SOSType =
  | 'medical_emergency'
  | 'accident'
  | 'breakdown'
  | 'security_threat'
  | 'fire'
  | 'student_missing'
  | 'other'

export type SOSStatus = 'active' | 'responding' | 'resolved' | 'false_alarm'
export type SOSPriority = 'low' | 'medium' | 'high' | 'critical'

export interface EmergencySOS {
  id: string
  vehicleId: string
  vehicleNumber: string
  routeId: string
  routeName: string
  driverId: string
  driverName: string
  driverPhone: string
  sosType: SOSType
  priority: SOSPriority
  status: SOSStatus
  description: string
  location: {
    lat: number
    lng: number
    address: string
  }
  studentsOnBoard: number
  studentIds: string[]
  triggeredAt: string
  triggeredBy: 'driver' | 'system' | 'admin'
  respondedAt: string | null
  resolvedAt: string | null
  resolvedBy: string | null
  resolutionNotes: string | null
  responders: SOSResponder[]
  timeline: SOSTimelineEvent[]
  notificationsSent: number
  parentsNotified: boolean
  schoolNotified: boolean
  emergencyServicesContacted: boolean
}

export interface SOSResponder {
  id: string
  name: string
  role: string
  phone: string
  assignedAt: string
  arrivedAt: string | null
  status: 'assigned' | 'en_route' | 'on_scene' | 'completed'
}

export interface SOSTimelineEvent {
  id: string
  timestamp: string
  event: string
  description: string
  performedBy: string | null
}

export interface SOSResponse {
  id: string
  sosId: string
  responderId: string
  responderName: string
  responderRole: string
  action: string
  notes: string | null
  timestamp: string
}

export const SOS_TYPE_LABELS: Record<SOSType, string> = {
  medical_emergency: 'Medical Emergency',
  accident: 'Accident',
  breakdown: 'Vehicle Breakdown',
  security_threat: 'Security Threat',
  fire: 'Fire',
  student_missing: 'Student Missing',
  other: 'Other Emergency',
}

export const SOS_STATUS_LABELS: Record<SOSStatus, string> = {
  active: 'Active',
  responding: 'Responding',
  resolved: 'Resolved',
  false_alarm: 'False Alarm',
}

export const SOS_PRIORITY_LABELS: Record<SOSPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export interface TriggerSOSRequest {
  vehicleId: string
  sosType: SOSType
  description: string
  priority?: SOSPriority
}

export interface UpdateSOSRequest {
  sosId: string
  status?: SOSStatus
  resolutionNotes?: string
  addResponder?: {
    name: string
    role: string
    phone: string
  }
}

export interface SOSResponseRequest {
  sosId: string
  action: string
  notes?: string
}

// ==================== MULTI-TRIP MANAGEMENT ====================

export type TripDirection = 'to_school' | 'from_school'
export type TripPeriod = 'morning' | 'afternoon' | 'evening' | 'special'

export interface Trip {
  id: string
  routeId: string
  routeName: string
  vehicleId: string
  vehicleNumber: string
  driverId: string
  driverName: string
  tripType: TripType // pickup or drop
  tripDirection: TripDirection
  tripPeriod: TripPeriod
  status: TripStatus
  scheduledStartTime: string // HH:mm
  scheduledEndTime: string // HH:mm
  actualStartTime: string | null
  actualEndTime: string | null
  startOdometer: number | null
  endOdometer: number | null
  totalStudentsExpected: number
  totalStudentsBoarded: number
  totalStudentsDropped: number
  currentStop: string | null
  nextStop: string | null
  stopsCompleted: number
  totalStops: number
  delayMinutes: number
  notes: string | null
  date: string
  createdAt: string
}

export interface TripSchedule {
  id: string
  routeId: string
  routeName: string
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  trips: Array<{
    tripPeriod: TripPeriod
    tripType: TripType
    startTime: string // HH:mm
    endTime: string // HH:mm
    isActive: boolean
  }>
  effectiveFrom: string
  effectiveTo: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MultiTrip {
  id: string
  date: string
  routeId: string
  routeName: string
  vehicleId: string
  vehicleNumber: string
  driverId: string
  driverName: string
  trips: Trip[]
  totalTripsScheduled: number
  totalTripsCompleted: number
  totalDistanceCovered: number // km
  totalStudentsTransported: number
  totalDelayMinutes: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'partially_completed'
  notes: string | null
}

export const TRIP_DIRECTION_LABELS: Record<TripDirection, string> = {
  to_school: 'To School',
  from_school: 'From School',
}

export const TRIP_PERIOD_LABELS: Record<TripPeriod, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  special: 'Special',
}

export const MULTI_TRIP_STATUS_LABELS: Record<MultiTrip['status'], string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  partially_completed: 'Partially Completed',
}

export interface CreateTripRequest {
  routeId: string
  vehicleId: string
  driverId: string
  tripType: TripType
  tripDirection: TripDirection
  tripPeriod: TripPeriod
  scheduledStartTime: string
  scheduledEndTime: string
  date: string
}

export interface UpdateTripRequest {
  tripId: string
  status?: TripStatus
  actualStartTime?: string
  actualEndTime?: string
  startOdometer?: number
  endOdometer?: number
  notes?: string
}

export interface CreateTripScheduleRequest {
  routeId: string
  dayOfWeek: number
  trips: Array<{
    tripPeriod: TripPeriod
    tripType: TripType
    startTime: string
    endTime: string
  }>
  effectiveFrom: string
  effectiveTo?: string
}

export interface TripBoardingRecord {
  id: string
  tripId: string
  studentId: string
  studentName: string
  stopId: string
  stopName: string
  action: 'boarded' | 'dropped'
  timestamp: string
  verifiedBy: 'rfid' | 'manual' | 'facial_recognition'
  parentNotified: boolean
}
