import { Role } from '@/types/common.types'

// ===== Announcements =====
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent'
export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived'
export type AnnouncementTargetType = 'all' | 'role' | 'class' | 'section' | 'individual'

export interface AnnouncementTarget {
  type: AnnouncementTargetType
  roles?: Role[]
  classIds?: string[]
  sectionIds?: string[]
  userIds?: string[]
}

export interface Announcement {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  status: AnnouncementStatus
  target: AnnouncementTarget
  attachments: AnnouncementAttachment[]
  publishedAt?: string
  scheduledAt?: string
  expiresAt?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  viewCount: number
  acknowledgementRequired: boolean
  acknowledgements: AnnouncementAcknowledgement[]
}

export interface AnnouncementAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface AnnouncementAcknowledgement {
  userId: string
  userName: string
  acknowledgedAt: string
}

export interface CreateAnnouncementRequest {
  title: string
  content: string
  priority: AnnouncementPriority
  target: AnnouncementTarget
  attachments?: Omit<AnnouncementAttachment, 'id'>[]
  scheduledAt?: string
  expiresAt?: string
  acknowledgementRequired?: boolean
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {
  status?: AnnouncementStatus
}

export interface AnnouncementFilters {
  search?: string
  priority?: AnnouncementPriority
  status?: AnnouncementStatus
  targetType?: AnnouncementTargetType
  page?: number
  limit?: number
}

// ===== Messages (Two-way Communication) =====
export type MessageStatus = 'sent' | 'delivered' | 'read'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: Role
  senderAvatar?: string
  content: string
  attachments: MessageAttachment[]
  status: MessageStatus
  createdAt: string
  readAt?: string
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface Conversation {
  id: string
  participants: ConversationParticipant[]
  type: 'direct' | 'group'
  title?: string // For group conversations
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface ConversationParticipant {
  userId: string
  userName: string
  userRole: Role
  userAvatar?: string
  joinedAt: string
  lastReadAt?: string
}

export interface SendMessageRequest {
  conversationId?: string // If existing conversation
  recipientIds?: string[] // For new conversation
  content: string
  attachments?: Omit<MessageAttachment, 'id'>[]
}

export interface ConversationFilters {
  search?: string
  type?: 'direct' | 'group'
  page?: number
  limit?: number
}

// ===== Circulars =====
export type CircularStatus = 'draft' | 'published' | 'archived'

export interface Circular {
  id: string
  referenceNumber: string
  title: string
  content: string
  category: string
  status: CircularStatus
  target: AnnouncementTarget
  attachments: CircularAttachment[]
  publishedAt?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  downloadCount: number
}

export interface CircularAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface CreateCircularRequest {
  title: string
  content: string
  category: string
  target: AnnouncementTarget
  attachments?: Omit<CircularAttachment, 'id'>[]
}

export interface UpdateCircularRequest extends Partial<CreateCircularRequest> {
  status?: CircularStatus
}

export interface CircularFilters {
  search?: string
  category?: string
  status?: CircularStatus
  page?: number
  limit?: number
}

// ===== Surveys & Feedback =====
export type SurveyStatus = 'draft' | 'active' | 'closed' | 'archived'
export type QuestionType = 'text' | 'textarea' | 'single_choice' | 'multiple_choice' | 'rating' | 'scale'

export interface SurveyQuestion {
  id: string
  question: string
  type: QuestionType
  options?: string[] // For choice questions
  required: boolean
  order: number
}

export interface Survey {
  id: string
  title: string
  description: string
  status: SurveyStatus
  target: AnnouncementTarget
  questions: SurveyQuestion[]
  startsAt: string
  endsAt: string
  anonymous: boolean
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  responseCount: number
  totalTargeted: number
}

export interface SurveyResponse {
  id: string
  surveyId: string
  respondentId?: string // null if anonymous
  respondentName?: string
  answers: SurveyAnswer[]
  submittedAt: string
}

export interface SurveyAnswer {
  questionId: string
  value: string | string[] | number
}

export interface CreateSurveyRequest {
  title: string
  description: string
  target: AnnouncementTarget
  questions: Omit<SurveyQuestion, 'id'>[]
  startsAt: string
  endsAt: string
  anonymous?: boolean
}

export interface UpdateSurveyRequest extends Partial<CreateSurveyRequest> {
  status?: SurveyStatus
}

export interface SurveyFilters {
  search?: string
  status?: SurveyStatus
  page?: number
  limit?: number
}

export interface SubmitSurveyResponseRequest {
  surveyId: string
  answers: Omit<SurveyAnswer, 'questionId'> & { questionId: string }[]
}

// ===== Emergency Alerts =====
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency'
export type AlertStatus = 'active' | 'resolved' | 'cancelled'

export interface EmergencyAlert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  status: AlertStatus
  target: AnnouncementTarget
  channels: AlertChannel[]
  instructions?: string
  resolvedAt?: string
  resolvedBy?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  acknowledgements: AlertAcknowledgement[]
}

export type AlertChannel = 'app' | 'sms' | 'email' | 'push'

export interface AlertAcknowledgement {
  userId: string
  userName: string
  acknowledgedAt: string
  location?: string
  status?: 'safe' | 'need_help'
}

export interface CreateEmergencyAlertRequest {
  title: string
  message: string
  severity: AlertSeverity
  target: AnnouncementTarget
  channels: AlertChannel[]
  instructions?: string
}

export interface UpdateEmergencyAlertRequest {
  status?: AlertStatus
  instructions?: string
}

export interface EmergencyAlertFilters {
  search?: string
  severity?: AlertSeverity
  status?: AlertStatus
  page?: number
  limit?: number
}

// ===== Events =====
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
export type EventType = 'academic' | 'sports' | 'cultural' | 'meeting' | 'holiday' | 'other'

export interface Event {
  id: string
  title: string
  description: string
  type: EventType
  status: EventStatus
  target: AnnouncementTarget
  venue: string
  startsAt: string
  endsAt: string
  registrationRequired: boolean
  registrationDeadline?: string
  maxAttendees?: number
  attachments: EventAttachment[]
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  registrations: EventRegistration[]
}

export interface EventAttachment {
  id: string
  name: string
  url: string
  type: string
}

export interface EventRegistration {
  userId: string
  userName: string
  userRole: Role
  registeredAt: string
  attended?: boolean
  attendedAt?: string
}

export interface CreateEventRequest {
  title: string
  description: string
  type: EventType
  target: AnnouncementTarget
  venue: string
  startsAt: string
  endsAt: string
  registrationRequired?: boolean
  registrationDeadline?: string
  maxAttendees?: number
  attachments?: Omit<EventAttachment, 'id'>[]
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: EventStatus
}

export interface EventFilters {
  search?: string
  type?: EventType
  status?: EventStatus
  page?: number
  limit?: number
}

// ===== Communication Stats =====
export interface CommunicationStats {
  announcements: {
    total: number
    published: number
    draft: number
    scheduled: number
  }
  messages: {
    totalConversations: number
    unreadCount: number
    sentToday: number
  }
  circulars: {
    total: number
    published: number
    totalDownloads: number
  }
  surveys: {
    active: number
    totalResponses: number
    pendingResponses: number
  }
  alerts: {
    active: number
    resolvedThisMonth: number
  }
  events: {
    upcoming: number
    totalRegistrations: number
  }
}

// ===== WhatsApp Business API Integration =====
export type WhatsAppConfigStatus = 'active' | 'inactive' | 'pending_verification'
export type WhatsAppMessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
export type WhatsAppTemplateStatus = 'approved' | 'pending' | 'rejected'
export type WhatsAppTemplateCategory = 'utility' | 'marketing' | 'authentication'

export interface WhatsAppConfig {
  id: string
  businessAccountId: string
  phoneNumberId: string
  phoneNumber: string
  displayName: string
  status: WhatsAppConfigStatus
  webhookUrl: string
  accessToken?: string // Masked in response
  verifiedAt?: string
  createdAt: string
  updatedAt: string
  dailyMessageLimit: number
  messagesUsedToday: number
}

export interface WhatsAppTemplate {
  id: string
  name: string
  language: string
  category: WhatsAppTemplateCategory
  status: WhatsAppTemplateStatus
  components: WhatsAppTemplateComponent[]
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  usageCount: number
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'footer' | 'buttons'
  format?: 'text' | 'image' | 'video' | 'document'
  text?: string
  parameters?: WhatsAppTemplateParameter[]
  buttons?: WhatsAppTemplateButton[]
}

export interface WhatsAppTemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'video' | 'document'
  placeholder: string
  example?: string
}

export interface WhatsAppTemplateButton {
  type: 'quick_reply' | 'url' | 'phone_number'
  text: string
  url?: string
  phoneNumber?: string
}

export interface WhatsAppMessage {
  id: string
  templateId?: string
  templateName?: string
  recipientPhone: string
  recipientName?: string
  recipientUserId?: string
  messageType: 'template' | 'text' | 'media'
  content: string
  mediaUrl?: string
  status: WhatsAppMessageStatus
  errorMessage?: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  createdAt: string
  cost?: number
}

export interface CreateWhatsAppConfigRequest {
  businessAccountId: string
  phoneNumberId: string
  phoneNumber: string
  displayName: string
  accessToken: string
  webhookUrl?: string
}

export interface UpdateWhatsAppConfigRequest {
  displayName?: string
  accessToken?: string
  webhookUrl?: string
  status?: WhatsAppConfigStatus
}

export interface CreateWhatsAppTemplateRequest {
  name: string
  language: string
  category: WhatsAppTemplateCategory
  components: Omit<WhatsAppTemplateComponent, 'parameters'>[]
}

export interface SendWhatsAppMessageRequest {
  templateId?: string
  recipientPhones: string[]
  recipientUserIds?: string[]
  messageType: 'template' | 'text'
  content?: string
  templateParameters?: Record<string, string>[]
}

export interface WhatsAppFilters {
  search?: string
  status?: WhatsAppMessageStatus
  templateId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// ===== Voice Broadcasts =====
export type VoiceBroadcastStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'failed'
export type VoiceRecordingStatus = 'processing' | 'ready' | 'failed'
export type CallStatus = 'pending' | 'ringing' | 'answered' | 'completed' | 'failed' | 'no_answer' | 'busy'

export interface VoiceRecording {
  id: string
  name: string
  description?: string
  audioUrl: string
  duration: number // in seconds
  fileSize: number // in bytes
  format: 'mp3' | 'wav' | 'ogg'
  status: VoiceRecordingStatus
  transcription?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface VoiceBroadcast {
  id: string
  name: string
  description?: string
  recordingId: string
  recording?: VoiceRecording
  target: AnnouncementTarget
  status: VoiceBroadcastStatus
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  totalRecipients: number
  callsSent: number
  callsAnswered: number
  callsFailed: number
  averageCallDuration: number
  retryAttempts: number
  maxRetries: number
  callResults: VoiceCallResult[]
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface VoiceCallResult {
  recipientId: string
  recipientName: string
  recipientPhone: string
  status: CallStatus
  duration: number
  attempts: number
  lastAttemptAt: string
  answeredAt?: string
  errorMessage?: string
}

export interface CreateVoiceRecordingRequest {
  name: string
  description?: string
  audioFile?: File // For file upload
  audioUrl?: string // For URL reference
}

export interface CreateVoiceBroadcastRequest {
  name: string
  description?: string
  recordingId: string
  target: AnnouncementTarget
  scheduledAt?: string
  maxRetries?: number
}

export interface UpdateVoiceBroadcastRequest {
  name?: string
  description?: string
  recordingId?: string
  target?: AnnouncementTarget
  scheduledAt?: string
  maxRetries?: number
  status?: VoiceBroadcastStatus
}

export interface VoiceBroadcastFilters {
  search?: string
  status?: VoiceBroadcastStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface VoiceRecordingFilters {
  search?: string
  status?: VoiceRecordingStatus
  page?: number
  limit?: number
}

// ===== Push Notification Hub =====
export type PushNotificationStatus = 'draft' | 'scheduled' | 'sent' | 'failed'
export type PushPlatform = 'web' | 'android' | 'ios' | 'all'
export type PushPriority = 'low' | 'normal' | 'high'

export interface PushSubscription {
  id: string
  userId: string
  userName: string
  userRole: Role
  endpoint: string
  platform: PushPlatform
  deviceName?: string
  browserInfo?: string
  expiresAt?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastActiveAt: string
}

export interface PushNotification {
  id: string
  title: string
  body: string
  icon?: string
  image?: string
  badge?: string
  url?: string
  data?: Record<string, unknown>
  target: AnnouncementTarget
  platforms: PushPlatform[]
  priority: PushPriority
  status: PushNotificationStatus
  scheduledAt?: string
  sentAt?: string
  ttl?: number // Time to live in seconds
  totalRecipients: number
  delivered: number
  clicked: number
  failed: number
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface NotificationHub {
  id: string
  totalSubscriptions: number
  activeSubscriptions: number
  platformBreakdown: {
    web: number
    android: number
    ios: number
  }
  notificationsSentToday: number
  notificationsSentThisMonth: number
  averageDeliveryRate: number
  averageClickRate: number
  recentNotifications: PushNotification[]
}

export interface CreatePushNotificationRequest {
  title: string
  body: string
  icon?: string
  image?: string
  url?: string
  data?: Record<string, unknown>
  target: AnnouncementTarget
  platforms: PushPlatform[]
  priority?: PushPriority
  scheduledAt?: string
  ttl?: number
}

export interface UpdatePushNotificationRequest {
  title?: string
  body?: string
  icon?: string
  image?: string
  url?: string
  data?: Record<string, unknown>
  target?: AnnouncementTarget
  platforms?: PushPlatform[]
  priority?: PushPriority
  scheduledAt?: string
  status?: PushNotificationStatus
}

export interface PushNotificationFilters {
  search?: string
  status?: PushNotificationStatus
  platform?: PushPlatform
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface PushSubscriptionFilters {
  search?: string
  platform?: PushPlatform
  isActive?: boolean
  page?: number
  limit?: number
}

// ===== Communication Analytics =====
export type MetricPeriod = 'hour' | 'day' | 'week' | 'month' | 'year'
export type ChannelType = 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app' | 'voice'

export interface OpenRate {
  messageId: string
  messageType: ChannelType
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalBounced: number
  totalUnsubscribed: number
  openRate: number // percentage
  clickRate: number // percentage
  bounceRate: number // percentage
  opensByHour: Record<number, number> // hour (0-23) -> count
  opensByDevice: {
    mobile: number
    desktop: number
    tablet: number
  }
  firstOpenAt?: string
  lastOpenAt?: string
}

export interface MessageMetrics {
  id: string
  channelType: ChannelType
  messageId: string
  messageTitle: string
  sentAt: string
  totalRecipients: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
  averageReadTime?: number // in seconds
  linkClicks: LinkClickMetric[]
}

export interface LinkClickMetric {
  url: string
  label?: string
  clicks: number
  uniqueClicks: number
}

export interface CommunicationAnalytics {
  id: string
  period: MetricPeriod
  startDate: string
  endDate: string
  summary: {
    totalMessagesSent: number
    totalDelivered: number
    totalOpened: number
    totalClicked: number
    averageOpenRate: number
    averageClickRate: number
    averageDeliveryRate: number
  }
  channelBreakdown: ChannelMetrics[]
  topPerformingMessages: MessageMetrics[]
  engagementTrend: EngagementDataPoint[]
  audienceInsights: AudienceInsights
}

export interface ChannelMetrics {
  channel: ChannelType
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  deliveryRate: number
  openRate: number
  clickRate: number
  cost?: number
}

export interface EngagementDataPoint {
  date: string
  sent: number
  delivered: number
  opened: number
  clicked: number
}

export interface AudienceInsights {
  mostEngagedRoles: { role: Role; engagementRate: number }[]
  bestSendTimes: { hour: number; dayOfWeek: number; engagementRate: number }[]
  devicePreferences: { device: string; percentage: number }[]
  locationBreakdown: { location: string; count: number }[]
}

export interface AnalyticsFilters {
  period?: MetricPeriod
  channelType?: ChannelType
  startDate?: string
  endDate?: string
  messageId?: string
}

// ===== Template A/B Testing =====
export type ABTestStatus = 'draft' | 'running' | 'completed' | 'cancelled'
export type TestMetricType = 'open_rate' | 'click_rate' | 'conversion_rate' | 'response_rate'

export interface TestVariant {
  id: string
  name: string
  label: string // e.g., 'A', 'B', 'C'
  subject?: string
  content: string
  previewText?: string
  sampleSize: number
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
    openRate: number
    clickRate: number
    conversionRate: number
  }
  isWinner: boolean
  isControl: boolean
}

export interface TestResult {
  testId: string
  winningVariantId: string
  winningVariantLabel: string
  statisticalSignificance: number // percentage
  confidenceLevel: number // percentage
  improvement: number // percentage improvement over control
  sampleSizeReached: boolean
  resultsReliable: boolean
  completedAt: string
  recommendations: string[]
}

export interface ABTest {
  id: string
  name: string
  description?: string
  channelType: ChannelType
  status: ABTestStatus
  primaryMetric: TestMetricType
  variants: TestVariant[]
  target: AnnouncementTarget
  samplePercentage: number // percentage of audience for test
  winnerPercentage: number // percentage of audience for winner rollout
  autoSelectWinner: boolean
  minimumSampleSize: number
  confidenceThreshold: number // e.g., 95 for 95% confidence
  testDuration: number // in hours
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  result?: TestResult
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface CreateABTestRequest {
  name: string
  description?: string
  channelType: ChannelType
  primaryMetric: TestMetricType
  variants: Omit<TestVariant, 'id' | 'metrics' | 'isWinner' | 'sampleSize'>[]
  target: AnnouncementTarget
  samplePercentage: number
  winnerPercentage?: number
  autoSelectWinner?: boolean
  minimumSampleSize?: number
  confidenceThreshold?: number
  testDuration?: number
  scheduledAt?: string
}

export interface UpdateABTestRequest {
  name?: string
  description?: string
  variants?: Omit<TestVariant, 'id' | 'metrics' | 'isWinner' | 'sampleSize'>[]
  target?: AnnouncementTarget
  samplePercentage?: number
  winnerPercentage?: number
  autoSelectWinner?: boolean
  minimumSampleSize?: number
  confidenceThreshold?: number
  testDuration?: number
  scheduledAt?: string
  status?: ABTestStatus
}

export interface ABTestFilters {
  search?: string
  status?: ABTestStatus
  channelType?: ChannelType
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// ===== Scheduled Messaging =====
export type ScheduleStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled'
export type ScheduleRecurrence = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

export interface MessageSchedule {
  scheduledAt: string
  timezone: string
  recurrence: ScheduleRecurrence
  recurrenceRule?: string // RRULE format for custom recurrence
  endDate?: string
  occurrences?: number
  nextRunAt?: string
  lastRunAt?: string
  runCount: number
}

export interface ScheduledMessage {
  id: string
  name: string
  description?: string
  channelType: ChannelType
  messageType: 'announcement' | 'reminder' | 'notification' | 'campaign'
  subject?: string
  content: string
  templateId?: string
  target: AnnouncementTarget
  schedule: MessageSchedule
  status: ScheduleStatus
  priority: 'low' | 'normal' | 'high'
  attachments: ScheduledMessageAttachment[]
  metadata?: Record<string, unknown>
  deliveryReport?: ScheduledMessageDeliveryReport
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface ScheduledMessageAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface ScheduledMessageDeliveryReport {
  totalRecipients: number
  sent: number
  delivered: number
  failed: number
  opened: number
  clicked: number
  lastUpdatedAt: string
}

export interface CreateScheduledMessageRequest {
  name: string
  description?: string
  channelType: ChannelType
  messageType: 'announcement' | 'reminder' | 'notification' | 'campaign'
  subject?: string
  content: string
  templateId?: string
  target: AnnouncementTarget
  scheduledAt: string
  timezone?: string
  recurrence?: ScheduleRecurrence
  recurrenceRule?: string
  endDate?: string
  occurrences?: number
  priority?: 'low' | 'normal' | 'high'
  attachments?: Omit<ScheduledMessageAttachment, 'id'>[]
  metadata?: Record<string, unknown>
}

export interface UpdateScheduledMessageRequest {
  name?: string
  description?: string
  subject?: string
  content?: string
  templateId?: string
  target?: AnnouncementTarget
  scheduledAt?: string
  timezone?: string
  recurrence?: ScheduleRecurrence
  recurrenceRule?: string
  endDate?: string
  occurrences?: number
  priority?: 'low' | 'normal' | 'high'
  attachments?: Omit<ScheduledMessageAttachment, 'id'>[]
  metadata?: Record<string, unknown>
  status?: ScheduleStatus
}

export interface ScheduledMessageFilters {
  search?: string
  status?: ScheduleStatus
  channelType?: ChannelType
  messageType?: 'announcement' | 'reminder' | 'notification' | 'campaign'
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface ScheduleCalendarView {
  date: string
  scheduledMessages: {
    id: string
    name: string
    channelType: ChannelType
    scheduledAt: string
    status: ScheduleStatus
  }[]
}
