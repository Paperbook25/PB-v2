// ==================== STATUS & TYPE UNIONS ====================

export type MessageStatus = 'sent' | 'delivered' | 'read'
export type MeetingStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type MeetingType = 'ptm' | 'academic' | 'disciplinary' | 'counseling' | 'other'
export type ConversationParticipantType = 'parent' | 'teacher' | 'admin' | 'principal'

// ==================== INTERFACES ====================

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderType: ConversationParticipantType
  senderAvatar?: string
  content: string
  attachments?: MessageAttachment[]
  status: MessageStatus
  createdAt: string
  readAt?: string
}

export interface MessageAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

export interface Conversation {
  id: string
  // Student context
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  // Participants
  participants: ConversationParticipant[]
  // Last message preview
  lastMessage?: string
  lastMessageAt?: string
  lastMessageSenderId?: string
  unreadCount: number
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface ConversationParticipant {
  id: string
  name: string
  type: ConversationParticipantType
  avatar?: string
}

export interface Meeting {
  id: string
  // Student context
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  // Participants
  parentId: string
  parentName: string
  teacherId: string
  teacherName: string
  // Meeting details
  type: MeetingType
  subject: string
  description?: string
  scheduledAt: string
  duration: number // minutes
  status: MeetingStatus
  // Location
  venue?: string
  meetingLink?: string
  // Notes
  parentNotes?: string
  teacherNotes?: string
  // Timestamps
  confirmedAt?: string
  completedAt?: string
  cancelledAt?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

export interface PTMSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  teacherId: string
  teacherName: string
  teacherSubject: string
  maxBookings: number
  currentBookings: number
  isAvailable: boolean
}

export interface ProgressReport {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  term: string
  academicYear: string
  overallGrade: string
  overallPercentage: number
  subjects: SubjectProgress[]
  teacherRemarks: string
  principalRemarks?: string
  attendance: {
    present: number
    absent: number
    percentage: number
  }
  behavior: {
    rating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement'
    remarks?: string
  }
  generatedAt: string
}

export interface SubjectProgress {
  subjectId: string
  subjectName: string
  teacherName: string
  grade: string
  percentage: number
  maxMarks: number
  obtainedMarks: number
  remarks?: string
}

export interface ParentPortalStats {
  totalMessages: number
  unreadMessages: number
  scheduledMeetings: number
  completedMeetings: number
  pendingAcknowledgements: number
}

// ==================== FILTER TYPES ====================

export interface ConversationFilters {
  studentId?: string
  search?: string
  page?: number
  limit?: number
}

export interface MessageFilters {
  conversationId: string
  page?: number
  limit?: number
}

export interface MeetingFilters {
  studentId?: string
  status?: MeetingStatus
  type?: MeetingType
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

// ==================== REQUEST TYPES ====================

export interface SendMessageRequest {
  conversationId: string
  content: string
  attachments?: File[]
}

export interface CreateConversationRequest {
  studentId: string
  participantIds: string[]
  initialMessage?: string
}

export interface ScheduleMeetingRequest {
  studentId: string
  teacherId: string
  type: MeetingType
  subject: string
  description?: string
  scheduledAt: string
  duration: number
  venue?: string
  meetingLink?: string
}

export interface BookPTMSlotRequest {
  slotId: string
  studentId: string
  parentNotes?: string
}

export interface UpdateMeetingRequest {
  subject?: string
  description?: string
  scheduledAt?: string
  duration?: number
  venue?: string
  meetingLink?: string
  parentNotes?: string
  teacherNotes?: string
}

// ==================== MOBILE APP FEATURES ====================

export type PushNotificationType =
  | 'attendance'
  | 'fee_reminder'
  | 'assignment'
  | 'exam'
  | 'announcement'
  | 'message'
  | 'transport'
  | 'event'
  | 'cafeteria'

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed'

export interface PushNotificationPreference {
  type: PushNotificationType
  enabled: boolean
  sound: boolean
  vibrate: boolean
}

export interface MobileAppConfig {
  id: string
  parentId: string
  deviceToken?: string
  deviceType: 'ios' | 'android'
  appVersion: string
  osVersion: string
  pushNotificationsEnabled: boolean
  notificationPreferences: PushNotificationPreference[]
  offlineModeEnabled: boolean
  lastSyncAt?: string
  biometricEnabled: boolean
  language: string
  createdAt: string
  updatedAt: string
}

export interface OfflineSyncData {
  id: string
  parentId: string
  syncType: 'messages' | 'attendance' | 'fees' | 'assignments' | 'events'
  data: Record<string, unknown>
  status: SyncStatus
  attempts: number
  lastAttemptAt?: string
  errorMessage?: string
  createdAt: string
  syncedAt?: string
}

export interface PushNotification {
  id: string
  parentId: string
  studentId?: string
  type: PushNotificationType
  title: string
  body: string
  data?: Record<string, unknown>
  read: boolean
  sentAt: string
  readAt?: string
}

// ==================== FEE PAYMENT HISTORY ====================

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'netbanking' | 'cheque' | 'wallet'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type FeeType = 'tuition' | 'transport' | 'library' | 'laboratory' | 'sports' | 'exam' | 'cafeteria' | 'other'

export interface PaymentHistory {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  parentId: string
  feeType: FeeType
  feeDescription: string
  amount: number
  discount?: number
  finalAmount: number
  paymentMethod: PaymentMethod
  transactionId?: string
  status: PaymentStatus
  dueDate: string
  paidAt?: string
  academicYear: string
  term: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentReceipt {
  id: string
  paymentId: string
  receiptNumber: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  parentName: string
  schoolName: string
  schoolAddress: string
  schoolLogo?: string
  feeDetails: FeeDetail[]
  totalAmount: number
  totalDiscount: number
  netAmount: number
  amountInWords: string
  paymentMethod: PaymentMethod
  transactionId?: string
  paidAt: string
  generatedAt: string
  generatedBy: string
  qrCode?: string
  digitalSignature?: string
}

export interface FeeDetail {
  feeType: FeeType
  description: string
  amount: number
  discount?: number
  netAmount: number
}

// ==================== ASSIGNMENT TRACKING ====================

export type AssignmentSubmissionStatus = 'not_started' | 'in_progress' | 'submitted' | 'late_submitted' | 'graded' | 'returned'

export interface AssignmentTracker {
  id: string
  studentId: string
  studentName: string
  assignmentId: string
  assignmentTitle: string
  subject: string
  teacherId: string
  teacherName: string
  description: string
  instructions?: string
  attachments?: AssignmentAttachment[]
  dueDate: string
  maxScore: number
  status: AssignmentSubmissionStatus
  submittedAt?: string
  score?: number
  feedback?: string
  submissionAttachments?: AssignmentAttachment[]
  isLate: boolean
  daysLate?: number
  createdAt: string
  updatedAt: string
}

export interface AssignmentAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
}

export interface SubmissionStatus {
  studentId: string
  totalAssignments: number
  submitted: number
  pending: number
  late: number
  graded: number
  averageScore?: number
  onTimeRate: number
}

// ==================== ATTENDANCE NOTIFICATIONS ====================

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'excused'
export type AttendanceNotificationType = 'check_in' | 'check_out' | 'absent' | 'late' | 'shortage_warning'

export interface AttendanceNotification {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  parentId: string
  type: AttendanceNotificationType
  status: AttendanceStatus
  date: string
  time?: string
  checkInTime?: string
  checkOutTime?: string
  markedBy?: string
  reason?: string
  attendancePercentage?: number
  shortageThreshold?: number
  message: string
  read: boolean
  sentAt: string
  readAt?: string
}

export interface AttendanceAlert {
  id: string
  studentId: string
  studentName: string
  parentId: string
  alertType: 'daily' | 'weekly_summary' | 'shortage_warning'
  attendanceData: {
    present: number
    absent: number
    late: number
    excused: number
    percentage: number
  }
  period: string
  threshold?: number
  message: string
  createdAt: string
}

// ==================== STUDENT LOCATION TRACKING ====================

export type VehicleStatus = 'on_route' | 'stopped' | 'at_school' | 'breakdown' | 'off_duty'
export type TripType = 'pickup' | 'drop'

export interface StudentLocation {
  id: string
  studentId: string
  studentName: string
  vehicleId: string
  vehicleNumber: string
  driverName: string
  driverPhone: string
  currentLocation: GeoLocation
  lastUpdated: string
  status: VehicleStatus
  tripType: TripType
  routeId: string
  routeName: string
  estimatedArrival?: string
  distanceFromSchool?: number
  distanceFromHome?: number
  speed?: number
}

export interface GeoLocation {
  latitude: number
  longitude: number
  address?: string
  landmark?: string
}

export interface TransportTracking {
  id: string
  studentId: string
  studentName: string
  parentId: string
  vehicleId: string
  vehicleNumber: string
  routeId: string
  routeName: string
  stopName: string
  stopOrder: number
  scheduledPickupTime: string
  scheduledDropTime: string
  tripType: TripType
  currentStatus: VehicleStatus
  currentLocation?: GeoLocation
  lastLocationUpdate?: string
  estimatedArrival?: string
  driverInfo: {
    id: string
    name: string
    phone: string
    avatar?: string
  }
  attendantInfo?: {
    id: string
    name: string
    phone: string
  }
  boardedAt?: string
  alightedAt?: string
  alerts: TransportAlert[]
}

export interface TransportAlert {
  id: string
  type: 'delay' | 'route_change' | 'breakdown' | 'emergency' | 'weather'
  message: string
  severity: 'info' | 'warning' | 'critical'
  createdAt: string
}

// ==================== EVENT MEDIA SHARING ====================

export type MediaType = 'photo' | 'video'
export type AlbumVisibility = 'public' | 'class_only' | 'participants_only'

export interface EventMedia {
  id: string
  eventId: string
  eventName: string
  type: MediaType
  url: string
  thumbnailUrl?: string
  title?: string
  description?: string
  uploadedBy: string
  uploadedByName: string
  uploadedAt: string
  size: number
  duration?: number // for videos, in seconds
  width?: number
  height?: number
  tags?: string[]
  likes: number
  likedByParent: boolean
  comments: MediaComment[]
  downloadable: boolean
}

export interface MediaComment {
  id: string
  mediaId: string
  parentId: string
  parentName: string
  parentAvatar?: string
  content: string
  createdAt: string
}

export interface PhotoAlbum {
  id: string
  eventId: string
  eventName: string
  eventDate: string
  title: string
  description?: string
  coverImageUrl?: string
  visibility: AlbumVisibility
  mediaCount: number
  photoCount: number
  videoCount: number
  totalSize: number
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  classes?: string[]
  participants?: string[]
}

export interface EventGallery {
  id: string
  eventId: string
  eventName: string
  eventDate: string
  eventType: string
  albums: PhotoAlbum[]
  totalMedia: number
  lastUpdated: string
}

// ==================== CAFETERIA ====================

export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner'
export type DietaryTag = 'vegetarian' | 'non_vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'nut_free'
export type TransactionType = 'credit' | 'debit' | 'refund'

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category: MealType
  dietaryTags: DietaryTag[]
  calories?: number
  allergens?: string[]
  imageUrl?: string
  available: boolean
}

export interface CafeteriaMenu {
  id: string
  date: string
  dayOfWeek: string
  meals: MealSchedule[]
  specialItems?: MenuItem[]
  announcements?: string[]
  createdAt: string
  updatedAt: string
}

export interface MealSchedule {
  mealType: MealType
  startTime: string
  endTime: string
  items: MenuItem[]
}

export interface CafeteriaBalance {
  id: string
  studentId: string
  studentName: string
  parentId: string
  currentBalance: number
  minimumBalance: number
  isLowBalance: boolean
  lastTopUpAmount?: number
  lastTopUpAt?: string
  lastTransactionAt?: string
  autoTopUpEnabled: boolean
  autoTopUpThreshold?: number
  autoTopUpAmount?: number
  monthlySpendingLimit?: number
  currentMonthSpending: number
  createdAt: string
  updatedAt: string
}

export interface CafeteriaTransaction {
  id: string
  studentId: string
  studentName: string
  parentId: string
  type: TransactionType
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string
  items?: PurchasedItem[]
  transactionAt: string
  paymentMethod?: PaymentMethod
  referenceNumber?: string
}

export interface PurchasedItem {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

// ==================== COMPLAINT/SUGGESTION ====================

export type ComplaintCategory =
  | 'academic'
  | 'infrastructure'
  | 'transport'
  | 'cafeteria'
  | 'staff_behavior'
  | 'safety'
  | 'fees'
  | 'other'

export type ComplaintStatus = 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'closed' | 'rejected'
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent'
export type SuggestionStatus = 'submitted' | 'under_review' | 'accepted' | 'implemented' | 'rejected'

export interface ParentComplaint {
  id: string
  parentId: string
  parentName: string
  studentId?: string
  studentName?: string
  studentClass?: string
  category: ComplaintCategory
  subject: string
  description: string
  attachments?: ComplaintAttachment[]
  priority: ComplaintPriority
  status: ComplaintStatus
  assignedTo?: string
  assignedToName?: string
  assignedAt?: string
  resolution?: string
  resolvedAt?: string
  resolvedBy?: string
  feedback?: ComplaintFeedback
  timeline: ComplaintTimelineEvent[]
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
}

export interface ComplaintAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
}

export interface ComplaintFeedback {
  rating: number // 1-5
  comment?: string
  submittedAt: string
}

export interface ComplaintTimelineEvent {
  id: string
  event: string
  description?: string
  performedBy: string
  performedByName: string
  timestamp: string
}

export interface Suggestion {
  id: string
  parentId: string
  parentName: string
  studentId?: string
  category: ComplaintCategory
  title: string
  description: string
  benefits?: string
  status: SuggestionStatus
  adminResponse?: string
  respondedBy?: string
  respondedAt?: string
  votes: number
  votedByParent: boolean
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
}

// ==================== EXTENDED FILTER TYPES ====================

export interface PaymentHistoryFilters {
  studentId?: string
  feeType?: FeeType
  status?: PaymentStatus
  academicYear?: string
  term?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface AssignmentTrackerFilters {
  studentId?: string
  subject?: string
  status?: AssignmentSubmissionStatus
  dueFrom?: string
  dueTo?: string
  page?: number
  limit?: number
}

export interface AttendanceNotificationFilters {
  studentId?: string
  type?: AttendanceNotificationType
  status?: AttendanceStatus
  dateFrom?: string
  dateTo?: string
  read?: boolean
  page?: number
  limit?: number
}

export interface EventMediaFilters {
  eventId?: string
  albumId?: string
  type?: MediaType
  tags?: string[]
  page?: number
  limit?: number
}

export interface CafeteriaMenuFilters {
  dateFrom?: string
  dateTo?: string
  mealType?: MealType
  dietaryTags?: DietaryTag[]
}

export interface ComplaintFilters {
  parentId?: string
  studentId?: string
  category?: ComplaintCategory
  status?: ComplaintStatus
  priority?: ComplaintPriority
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface SuggestionFilters {
  parentId?: string
  category?: ComplaintCategory
  status?: SuggestionStatus
  page?: number
  limit?: number
}

// ==================== EXTENDED REQUEST TYPES ====================

export interface UpdateMobileAppConfigRequest {
  deviceToken?: string
  pushNotificationsEnabled?: boolean
  notificationPreferences?: PushNotificationPreference[]
  offlineModeEnabled?: boolean
  biometricEnabled?: boolean
  language?: string
}

export interface TopUpBalanceRequest {
  studentId: string
  amount: number
  paymentMethod: PaymentMethod
}

export interface SubmitComplaintRequest {
  studentId?: string
  category: ComplaintCategory
  subject: string
  description: string
  attachments?: File[]
  priority?: ComplaintPriority
  isAnonymous?: boolean
}

export interface SubmitSuggestionRequest {
  studentId?: string
  category: ComplaintCategory
  title: string
  description: string
  benefits?: string
  isAnonymous?: boolean
}

export interface SubmitComplaintFeedbackRequest {
  rating: number
  comment?: string
}

export interface LikeMediaRequest {
  mediaId: string
  like: boolean
}

export interface CommentOnMediaRequest {
  mediaId: string
  content: string
}

export interface MarkNotificationReadRequest {
  notificationIds: string[]
}

export interface AssignmentSubmissionRequest {
  assignmentId: string
  studentId: string
  attachments?: File[]
  comments?: string
}
