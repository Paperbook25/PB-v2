import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import { PaginatedResponse } from '@/types/common.types'
import {
  Announcement,
  AnnouncementFilters,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  Circular,
  CircularFilters,
  CreateCircularRequest,
  UpdateCircularRequest,
  Conversation,
  ConversationFilters,
  Message,
  SendMessageRequest,
  Survey,
  SurveyFilters,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  SurveyResponse,
  SubmitSurveyResponseRequest,
  EmergencyAlert,
  EmergencyAlertFilters,
  CreateEmergencyAlertRequest,
  UpdateEmergencyAlertRequest,
  Event,
  EventFilters,
  CreateEventRequest,
  UpdateEventRequest,
  CommunicationStats,
  // WhatsApp types
  WhatsAppConfig,
  WhatsAppTemplate,
  WhatsAppMessage,
  WhatsAppFilters,
  CreateWhatsAppConfigRequest,
  UpdateWhatsAppConfigRequest,
  CreateWhatsAppTemplateRequest,
  SendWhatsAppMessageRequest,
  // Voice broadcast types
  VoiceRecording,
  VoiceBroadcast,
  VoiceBroadcastFilters,
  VoiceRecordingFilters,
  CreateVoiceRecordingRequest,
  CreateVoiceBroadcastRequest,
  UpdateVoiceBroadcastRequest,
  // Push notification types
  PushSubscription,
  PushNotification,
  NotificationHub,
  PushNotificationFilters,
  PushSubscriptionFilters,
  CreatePushNotificationRequest,
  UpdatePushNotificationRequest,
  // Analytics types
  CommunicationAnalytics,
  MessageMetrics,
  OpenRate,
  AnalyticsFilters,
  // A/B Testing types
  ABTest,
  TestResult,
  ABTestFilters,
  CreateABTestRequest,
  UpdateABTestRequest,
  // Scheduled messaging types
  ScheduledMessage,
  ScheduledMessageFilters,
  CreateScheduledMessageRequest,
  UpdateScheduledMessageRequest,
  ScheduleCalendarView,
} from '../types/communication.types'

const API_BASE = '/api/communication'

// ===== Announcements =====
export async function fetchAnnouncements(
  filters: AnnouncementFilters = {}
): Promise<PaginatedResponse<Announcement>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<Announcement>>(
    `${API_BASE}/announcements?${params.toString()}`
  )
}

export async function fetchAnnouncement(id: string): Promise<{ data: Announcement }> {
  return apiGet<{ data: Announcement }>(`${API_BASE}/announcements/${id}`)
}

export async function createAnnouncement(
  data: CreateAnnouncementRequest
): Promise<{ data: Announcement }> {
  return apiPost<{ data: Announcement }>(`${API_BASE}/announcements`, data)
}

export async function updateAnnouncement(
  id: string,
  data: UpdateAnnouncementRequest
): Promise<{ data: Announcement }> {
  return apiPut<{ data: Announcement }>(`${API_BASE}/announcements/${id}`, data)
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/announcements/${id}`)
}

export async function acknowledgeAnnouncement(id: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/announcements/${id}/acknowledge`)
}

// ===== Conversations & Messages =====
export async function fetchConversations(
  filters: ConversationFilters = {}
): Promise<PaginatedResponse<Conversation>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.type) params.set('type', filters.type)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<Conversation>>(
    `${API_BASE}/conversations?${params.toString()}`
  )
}

export async function fetchMessages(
  conversationId: string,
  page = 1,
  limit = 50
): Promise<PaginatedResponse<Message>> {
  return apiGet<PaginatedResponse<Message>>(
    `${API_BASE}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
  )
}

export async function sendMessage(data: SendMessageRequest): Promise<{ data: Message }> {
  return apiPost<{ data: Message }>(`${API_BASE}/messages`, data)
}

// ===== Circulars =====
export async function fetchCirculars(
  filters: CircularFilters = {}
): Promise<PaginatedResponse<Circular>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.category) params.set('category', filters.category)
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<Circular>>(
    `${API_BASE}/circulars?${params.toString()}`
  )
}

export async function fetchCircular(id: string): Promise<{ data: Circular }> {
  return apiGet<{ data: Circular }>(`${API_BASE}/circulars/${id}`)
}

export async function createCircular(
  data: CreateCircularRequest
): Promise<{ data: Circular }> {
  return apiPost<{ data: Circular }>(`${API_BASE}/circulars`, data)
}

export async function updateCircular(
  id: string,
  data: UpdateCircularRequest
): Promise<{ data: Circular }> {
  return apiPut<{ data: Circular }>(`${API_BASE}/circulars/${id}`, data)
}

export async function deleteCircular(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/circulars/${id}`)
}

// ===== Surveys =====
export async function fetchSurveys(
  filters: SurveyFilters = {}
): Promise<PaginatedResponse<Survey>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<Survey>>(
    `${API_BASE}/surveys?${params.toString()}`
  )
}

export async function fetchSurvey(id: string): Promise<{ data: Survey }> {
  return apiGet<{ data: Survey }>(`${API_BASE}/surveys/${id}`)
}

export async function createSurvey(data: CreateSurveyRequest): Promise<{ data: Survey }> {
  return apiPost<{ data: Survey }>(`${API_BASE}/surveys`, data)
}

export async function updateSurvey(
  id: string,
  data: UpdateSurveyRequest
): Promise<{ data: Survey }> {
  return apiPut<{ data: Survey }>(`${API_BASE}/surveys/${id}`, data)
}

export async function deleteSurvey(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/surveys/${id}`)
}

export async function submitSurveyResponse(
  surveyId: string,
  data: SubmitSurveyResponseRequest
): Promise<{ data: SurveyResponse }> {
  return apiPost<{ data: SurveyResponse }>(
    `${API_BASE}/surveys/${surveyId}/responses`,
    data
  )
}

export async function fetchSurveyResponses(
  surveyId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<SurveyResponse>> {
  return apiGet<PaginatedResponse<SurveyResponse>>(
    `${API_BASE}/surveys/${surveyId}/responses?page=${page}&limit=${limit}`
  )
}

// ===== Emergency Alerts =====
export async function fetchEmergencyAlerts(
  filters: EmergencyAlertFilters = {}
): Promise<PaginatedResponse<EmergencyAlert>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.severity) params.set('severity', filters.severity)
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<EmergencyAlert>>(
    `${API_BASE}/alerts?${params.toString()}`
  )
}

export async function fetchEmergencyAlert(id: string): Promise<{ data: EmergencyAlert }> {
  return apiGet<{ data: EmergencyAlert }>(`${API_BASE}/alerts/${id}`)
}

export async function createEmergencyAlert(
  data: CreateEmergencyAlertRequest
): Promise<{ data: EmergencyAlert }> {
  return apiPost<{ data: EmergencyAlert }>(`${API_BASE}/alerts`, data)
}

export async function updateEmergencyAlert(
  id: string,
  data: UpdateEmergencyAlertRequest
): Promise<{ data: EmergencyAlert }> {
  return apiPut<{ data: EmergencyAlert }>(`${API_BASE}/alerts/${id}`, data)
}

export async function acknowledgeEmergencyAlert(
  id: string,
  data: { status?: 'safe' | 'need_help'; location?: string }
): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/alerts/${id}/acknowledge`, data)
}

// ===== Events =====
export async function fetchEvents(
  filters: EventFilters = {}
): Promise<PaginatedResponse<Event>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.type) params.set('type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<Event>>(
    `${API_BASE}/events?${params.toString()}`
  )
}

export async function fetchEvent(id: string): Promise<{ data: Event }> {
  return apiGet<{ data: Event }>(`${API_BASE}/events/${id}`)
}

export async function createEvent(data: CreateEventRequest): Promise<{ data: Event }> {
  return apiPost<{ data: Event }>(`${API_BASE}/events`, data)
}

export async function updateEvent(
  id: string,
  data: UpdateEventRequest
): Promise<{ data: Event }> {
  return apiPut<{ data: Event }>(`${API_BASE}/events/${id}`, data)
}

export async function deleteEvent(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/events/${id}`)
}

export async function registerForEvent(id: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/events/${id}/register`)
}

export async function cancelEventRegistration(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/events/${id}/register`)
}

// ===== Stats =====
export async function fetchCommunicationStats(): Promise<{ data: CommunicationStats }> {
  return apiGet<{ data: CommunicationStats }>(`${API_BASE}/stats`)
}

// ===== WhatsApp Business API =====
export async function fetchWhatsAppConfig(): Promise<{ data: WhatsAppConfig }> {
  return apiGet<{ data: WhatsAppConfig }>(`${API_BASE}/whatsapp/config`)
}

export async function createWhatsAppConfig(
  data: CreateWhatsAppConfigRequest
): Promise<{ data: WhatsAppConfig }> {
  return apiPost<{ data: WhatsAppConfig }>(`${API_BASE}/whatsapp/config`, data)
}

export async function updateWhatsAppConfig(
  data: UpdateWhatsAppConfigRequest
): Promise<{ data: WhatsAppConfig }> {
  return apiPut<{ data: WhatsAppConfig }>(`${API_BASE}/whatsapp/config`, data)
}

export async function verifyWhatsAppConfig(): Promise<{ success: boolean; message: string }> {
  return apiPost<{ success: boolean; message: string }>(`${API_BASE}/whatsapp/config/verify`)
}

export async function fetchWhatsAppTemplates(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<WhatsAppTemplate>> {
  return apiGet<PaginatedResponse<WhatsAppTemplate>>(
    `${API_BASE}/whatsapp/templates?page=${page}&limit=${limit}`
  )
}

export async function fetchWhatsAppTemplate(id: string): Promise<{ data: WhatsAppTemplate }> {
  return apiGet<{ data: WhatsAppTemplate }>(`${API_BASE}/whatsapp/templates/${id}`)
}

export async function createWhatsAppTemplate(
  data: CreateWhatsAppTemplateRequest
): Promise<{ data: WhatsAppTemplate }> {
  return apiPost<{ data: WhatsAppTemplate }>(`${API_BASE}/whatsapp/templates`, data)
}

export async function deleteWhatsAppTemplate(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/whatsapp/templates/${id}`)
}

export async function fetchWhatsAppMessages(
  filters: WhatsAppFilters = {}
): Promise<PaginatedResponse<WhatsAppMessage>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.templateId) params.set('templateId', filters.templateId)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<WhatsAppMessage>>(
    `${API_BASE}/whatsapp/messages?${params.toString()}`
  )
}

export async function sendWhatsAppMessage(
  data: SendWhatsAppMessageRequest
): Promise<{ data: WhatsAppMessage[] }> {
  return apiPost<{ data: WhatsAppMessage[] }>(`${API_BASE}/whatsapp/messages`, data)
}

// ===== Voice Broadcasts =====
export async function fetchVoiceRecordings(
  filters: VoiceRecordingFilters = {}
): Promise<PaginatedResponse<VoiceRecording>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<VoiceRecording>>(
    `${API_BASE}/voice/recordings?${params.toString()}`
  )
}

export async function fetchVoiceRecording(id: string): Promise<{ data: VoiceRecording }> {
  return apiGet<{ data: VoiceRecording }>(`${API_BASE}/voice/recordings/${id}`)
}

export async function createVoiceRecording(
  data: CreateVoiceRecordingRequest
): Promise<{ data: VoiceRecording }> {
  return apiPost<{ data: VoiceRecording }>(`${API_BASE}/voice/recordings`, data)
}

export async function deleteVoiceRecording(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/voice/recordings/${id}`)
}

export async function fetchVoiceBroadcasts(
  filters: VoiceBroadcastFilters = {}
): Promise<PaginatedResponse<VoiceBroadcast>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<VoiceBroadcast>>(
    `${API_BASE}/voice/broadcasts?${params.toString()}`
  )
}

export async function fetchVoiceBroadcast(id: string): Promise<{ data: VoiceBroadcast }> {
  return apiGet<{ data: VoiceBroadcast }>(`${API_BASE}/voice/broadcasts/${id}`)
}

export async function createVoiceBroadcast(
  data: CreateVoiceBroadcastRequest
): Promise<{ data: VoiceBroadcast }> {
  return apiPost<{ data: VoiceBroadcast }>(`${API_BASE}/voice/broadcasts`, data)
}

export async function updateVoiceBroadcast(
  id: string,
  data: UpdateVoiceBroadcastRequest
): Promise<{ data: VoiceBroadcast }> {
  return apiPut<{ data: VoiceBroadcast }>(`${API_BASE}/voice/broadcasts/${id}`, data)
}

export async function deleteVoiceBroadcast(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/voice/broadcasts/${id}`)
}

export async function startVoiceBroadcast(id: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/voice/broadcasts/${id}/start`)
}

export async function cancelVoiceBroadcast(id: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/voice/broadcasts/${id}/cancel`)
}

// ===== Push Notifications =====
export async function fetchNotificationHub(): Promise<{ data: NotificationHub }> {
  return apiGet<{ data: NotificationHub }>(`${API_BASE}/push/hub`)
}

export async function fetchPushSubscriptions(
  filters: PushSubscriptionFilters = {}
): Promise<PaginatedResponse<PushSubscription>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.platform) params.set('platform', filters.platform)
  if (filters.isActive !== undefined) params.set('isActive', filters.isActive.toString())
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<PushSubscription>>(
    `${API_BASE}/push/subscriptions?${params.toString()}`
  )
}

export async function registerPushSubscription(
  subscription: PushSubscriptionJSON
): Promise<{ data: PushSubscription }> {
  return apiPost<{ data: PushSubscription }>(`${API_BASE}/push/subscriptions`, subscription)
}

export async function unregisterPushSubscription(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/push/subscriptions/${id}`)
}

export async function fetchPushNotifications(
  filters: PushNotificationFilters = {}
): Promise<PaginatedResponse<PushNotification>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.platform) params.set('platform', filters.platform)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<PushNotification>>(
    `${API_BASE}/push/notifications?${params.toString()}`
  )
}

export async function fetchPushNotification(id: string): Promise<{ data: PushNotification }> {
  return apiGet<{ data: PushNotification }>(`${API_BASE}/push/notifications/${id}`)
}

export async function createPushNotification(
  data: CreatePushNotificationRequest
): Promise<{ data: PushNotification }> {
  return apiPost<{ data: PushNotification }>(`${API_BASE}/push/notifications`, data)
}

export async function updatePushNotification(
  id: string,
  data: UpdatePushNotificationRequest
): Promise<{ data: PushNotification }> {
  return apiPut<{ data: PushNotification }>(`${API_BASE}/push/notifications/${id}`, data)
}

export async function deletePushNotification(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/push/notifications/${id}`)
}

export async function sendPushNotification(id: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/push/notifications/${id}/send`)
}

// ===== Communication Analytics =====
export async function fetchCommunicationAnalytics(
  filters: AnalyticsFilters = {}
): Promise<{ data: CommunicationAnalytics }> {
  const params = new URLSearchParams()
  if (filters.period) params.set('period', filters.period)
  if (filters.channelType) params.set('channelType', filters.channelType)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)

  return apiGet<{ data: CommunicationAnalytics }>(
    `${API_BASE}/analytics?${params.toString()}`
  )
}

export async function fetchMessageMetrics(
  messageId: string
): Promise<{ data: MessageMetrics }> {
  return apiGet<{ data: MessageMetrics }>(`${API_BASE}/analytics/messages/${messageId}`)
}

export async function fetchOpenRate(
  messageId: string
): Promise<{ data: OpenRate }> {
  return apiGet<{ data: OpenRate }>(`${API_BASE}/analytics/messages/${messageId}/open-rate`)
}

export async function exportAnalyticsReport(
  filters: AnalyticsFilters = {}
): Promise<{ data: { downloadUrl: string } }> {
  const params = new URLSearchParams()
  if (filters.period) params.set('period', filters.period)
  if (filters.channelType) params.set('channelType', filters.channelType)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)

  return apiPost<{ data: { downloadUrl: string } }>(
    `${API_BASE}/analytics/export?${params.toString()}`
  )
}

// ===== A/B Testing =====
export async function fetchABTests(
  filters: ABTestFilters = {}
): Promise<PaginatedResponse<ABTest>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.channelType) params.set('channelType', filters.channelType)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<ABTest>>(
    `${API_BASE}/ab-tests?${params.toString()}`
  )
}

export async function fetchABTest(id: string): Promise<{ data: ABTest }> {
  return apiGet<{ data: ABTest }>(`${API_BASE}/ab-tests/${id}`)
}

export async function createABTest(
  data: CreateABTestRequest
): Promise<{ data: ABTest }> {
  return apiPost<{ data: ABTest }>(`${API_BASE}/ab-tests`, data)
}

export async function updateABTest(
  id: string,
  data: UpdateABTestRequest
): Promise<{ data: ABTest }> {
  return apiPut<{ data: ABTest }>(`${API_BASE}/ab-tests/${id}`, data)
}

export async function deleteABTest(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/ab-tests/${id}`)
}

export async function startABTest(id: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/ab-tests/${id}/start`)
}

export async function stopABTest(id: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/ab-tests/${id}/stop`)
}

export async function selectABTestWinner(
  id: string,
  variantId: string
): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/ab-tests/${id}/select-winner`, { variantId })
}

export async function fetchABTestResult(id: string): Promise<{ data: TestResult }> {
  return apiGet<{ data: TestResult }>(`${API_BASE}/ab-tests/${id}/result`)
}

// ===== Scheduled Messaging =====
export async function fetchScheduledMessages(
  filters: ScheduledMessageFilters = {}
): Promise<PaginatedResponse<ScheduledMessage>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.channelType) params.set('channelType', filters.channelType)
  if (filters.messageType) params.set('messageType', filters.messageType)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return apiGet<PaginatedResponse<ScheduledMessage>>(
    `${API_BASE}/scheduled?${params.toString()}`
  )
}

export async function fetchScheduledMessage(id: string): Promise<{ data: ScheduledMessage }> {
  return apiGet<{ data: ScheduledMessage }>(`${API_BASE}/scheduled/${id}`)
}

export async function createScheduledMessage(
  data: CreateScheduledMessageRequest
): Promise<{ data: ScheduledMessage }> {
  return apiPost<{ data: ScheduledMessage }>(`${API_BASE}/scheduled`, data)
}

export async function updateScheduledMessage(
  id: string,
  data: UpdateScheduledMessageRequest
): Promise<{ data: ScheduledMessage }> {
  return apiPut<{ data: ScheduledMessage }>(`${API_BASE}/scheduled/${id}`, data)
}

export async function deleteScheduledMessage(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/scheduled/${id}`)
}

export async function cancelScheduledMessage(id: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/scheduled/${id}/cancel`)
}

export async function rescheduleMessage(
  id: string,
  scheduledAt: string
): Promise<{ data: ScheduledMessage }> {
  return apiPost<{ data: ScheduledMessage }>(`${API_BASE}/scheduled/${id}/reschedule`, {
    scheduledAt,
  })
}

export async function fetchScheduleCalendar(
  startDate: string,
  endDate: string
): Promise<{ data: ScheduleCalendarView[] }> {
  return apiGet<{ data: ScheduleCalendarView[] }>(
    `${API_BASE}/scheduled/calendar?startDate=${startDate}&endDate=${endDate}`
  )
}
