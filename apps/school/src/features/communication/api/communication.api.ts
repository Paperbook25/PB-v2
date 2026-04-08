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

// TODO: Backend endpoint may not exist yet — wired optimistically
export async function acknowledgeAnnouncement(id: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${API_BASE}/announcements/${id}/acknowledge`, {})
}

// ===== Conversations & Messages =====

const MSG_BASE = '/api/messaging'

export async function fetchConversations(
  filters: ConversationFilters = {}
): Promise<PaginatedResponse<Conversation>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  return apiGet<PaginatedResponse<Conversation>>(`${MSG_BASE}/conversations?${params}`)
}

export async function fetchMessages(
  conversationId: string,
  page = 1,
  limit = 50
): Promise<PaginatedResponse<Message>> {
  return apiGet<PaginatedResponse<Message>>(
    `${MSG_BASE}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
  )
}

export async function sendMessage(data: SendMessageRequest): Promise<{ data: Message }> {
  return apiPost<{ data: Message }>(
    `${MSG_BASE}/conversations/${data.conversationId}/messages`,
    { content: data.content }
  )
}

export async function createConversation(
  participantIds: string[],
  title?: string
): Promise<{ data: Conversation }> {
  return apiPost<{ data: Conversation }>(`${MSG_BASE}/conversations`, { participantIds, title })
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
  return apiPost<{ data: SurveyResponse }>(`${API_BASE}/surveys/${surveyId}/respond`, data)
}

export async function fetchSurveyResponses(
  surveyId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<SurveyResponse>> {
  const params = new URLSearchParams()
  params.set('page', page.toString())
  params.set('limit', limit.toString())

  return apiGet<PaginatedResponse<SurveyResponse>>(
    `${API_BASE}/surveys/${surveyId}/responses?${params.toString()}`
  )
}

// ===== Emergency Alerts =====
// TODO: Backend not implemented — emergency alerts return placeholders

export async function fetchEmergencyAlerts(
  _filters: EmergencyAlertFilters = {}
): Promise<PaginatedResponse<EmergencyAlert>> {
  return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } as PaginatedResponse<EmergencyAlert>
}

export async function fetchEmergencyAlert(_id: string): Promise<{ data: EmergencyAlert }> {
  return { data: {} as EmergencyAlert }
}

export async function createEmergencyAlert(
  _data: CreateEmergencyAlertRequest
): Promise<{ data: EmergencyAlert }> {
  return { data: {} as EmergencyAlert }
}

export async function updateEmergencyAlert(
  _id: string,
  _data: UpdateEmergencyAlertRequest
): Promise<{ data: EmergencyAlert }> {
  return { data: {} as EmergencyAlert }
}

export async function acknowledgeEmergencyAlert(
  _id: string,
  _data: { status?: 'safe' | 'need_help'; location?: string }
): Promise<{ success: boolean }> {
  return { success: false }
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
  return apiPost<{ success: boolean }>(`${API_BASE}/events/${id}/register`, {})
}

export async function cancelEventRegistration(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/events/${id}/register`)
}

// ===== Stats =====
export async function fetchCommunicationStats(): Promise<{ data: CommunicationStats }> {
  return apiGet<{ data: CommunicationStats }>(`${API_BASE}/stats`)
}

// ===== WhatsApp Business API =====
// TODO: Backend not implemented — WhatsApp integration returns placeholders

export async function fetchWhatsAppConfig(): Promise<{ data: WhatsAppConfig }> {
  return { data: {} as WhatsAppConfig }
}

export async function createWhatsAppConfig(
  _data: CreateWhatsAppConfigRequest
): Promise<{ data: WhatsAppConfig }> {
  return { data: {} as WhatsAppConfig }
}

export async function updateWhatsAppConfig(
  _data: UpdateWhatsAppConfigRequest
): Promise<{ data: WhatsAppConfig }> {
  return { data: {} as WhatsAppConfig }
}

export async function verifyWhatsAppConfig(): Promise<{ success: boolean; message: string }> {
  return { success: false, message: 'Feature coming soon' }
}

export async function fetchWhatsAppTemplates(
  _page = 1,
  _limit = 20
): Promise<PaginatedResponse<WhatsAppTemplate>> {
  return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } as PaginatedResponse<WhatsAppTemplate>
}

export async function fetchWhatsAppTemplate(_id: string): Promise<{ data: WhatsAppTemplate }> {
  return { data: {} as WhatsAppTemplate }
}

export async function createWhatsAppTemplate(
  _data: CreateWhatsAppTemplateRequest
): Promise<{ data: WhatsAppTemplate }> {
  return { data: {} as WhatsAppTemplate }
}

export async function deleteWhatsAppTemplate(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

export async function fetchWhatsAppMessages(
  _filters: WhatsAppFilters = {}
): Promise<PaginatedResponse<WhatsAppMessage>> {
  return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } as PaginatedResponse<WhatsAppMessage>
}

export async function sendWhatsAppMessage(
  _data: SendWhatsAppMessageRequest
): Promise<{ data: WhatsAppMessage[] }> {
  return { data: [] }
}

// ===== Voice Broadcasts =====
// TODO: Backend not implemented — voice broadcast system returns placeholders

export async function fetchVoiceRecordings(
  _filters: VoiceRecordingFilters = {}
): Promise<PaginatedResponse<VoiceRecording>> {
  return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } as PaginatedResponse<VoiceRecording>
}

export async function fetchVoiceRecording(_id: string): Promise<{ data: VoiceRecording }> {
  return { data: {} as VoiceRecording }
}

export async function createVoiceRecording(
  _data: CreateVoiceRecordingRequest
): Promise<{ data: VoiceRecording }> {
  return { data: {} as VoiceRecording }
}

export async function deleteVoiceRecording(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

export async function fetchVoiceBroadcasts(
  _filters: VoiceBroadcastFilters = {}
): Promise<PaginatedResponse<VoiceBroadcast>> {
  return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } as PaginatedResponse<VoiceBroadcast>
}

export async function fetchVoiceBroadcast(_id: string): Promise<{ data: VoiceBroadcast }> {
  return { data: {} as VoiceBroadcast }
}

export async function createVoiceBroadcast(
  _data: CreateVoiceBroadcastRequest
): Promise<{ data: VoiceBroadcast }> {
  return { data: {} as VoiceBroadcast }
}

export async function updateVoiceBroadcast(
  _id: string,
  _data: UpdateVoiceBroadcastRequest
): Promise<{ data: VoiceBroadcast }> {
  return { data: {} as VoiceBroadcast }
}

export async function deleteVoiceBroadcast(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

export async function startVoiceBroadcast(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

export async function cancelVoiceBroadcast(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

// ===== Push Notifications =====
// TODO: Backend not implemented — push notification system returns placeholders

export async function fetchNotificationHub(): Promise<{ data: NotificationHub }> {
  return { data: {} as NotificationHub }
}

export async function fetchPushSubscriptions(
  _filters: PushSubscriptionFilters = {}
): Promise<PaginatedResponse<PushSubscription>> {
  return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } as PaginatedResponse<PushSubscription>
}

export async function registerPushSubscription(
  _subscription: PushSubscriptionJSON
): Promise<{ data: PushSubscription }> {
  return { data: {} as PushSubscription }
}

export async function unregisterPushSubscription(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

export async function fetchPushNotifications(
  _filters: PushNotificationFilters = {}
): Promise<PaginatedResponse<PushNotification>> {
  return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } as PaginatedResponse<PushNotification>
}

export async function fetchPushNotification(_id: string): Promise<{ data: PushNotification }> {
  return { data: {} as PushNotification }
}

export async function createPushNotification(
  _data: CreatePushNotificationRequest
): Promise<{ data: PushNotification }> {
  return { data: {} as PushNotification }
}

export async function updatePushNotification(
  _id: string,
  _data: UpdatePushNotificationRequest
): Promise<{ data: PushNotification }> {
  return { data: {} as PushNotification }
}

export async function deletePushNotification(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

export async function sendPushNotification(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

// ===== Communication Analytics =====
// TODO: Backend not implemented — communication analytics returns placeholders

export async function fetchCommunicationAnalytics(
  _filters: AnalyticsFilters = {}
): Promise<{ data: CommunicationAnalytics }> {
  return { data: {} as CommunicationAnalytics }
}

export async function fetchMessageMetrics(
  _messageId: string
): Promise<{ data: MessageMetrics }> {
  return { data: {} as MessageMetrics }
}

export async function fetchOpenRate(
  _messageId: string
): Promise<{ data: OpenRate }> {
  return { data: {} as OpenRate }
}

export async function exportAnalyticsReport(
  _filters: AnalyticsFilters = {}
): Promise<{ data: { downloadUrl: string } }> {
  return { data: { downloadUrl: '' } }
}

// ===== A/B Testing =====
// TODO: Backend not implemented — A/B testing system returns placeholders

export async function fetchABTests(
  _filters: ABTestFilters = {}
): Promise<PaginatedResponse<ABTest>> {
  return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } as PaginatedResponse<ABTest>
}

export async function fetchABTest(_id: string): Promise<{ data: ABTest }> {
  return { data: {} as ABTest }
}

export async function createABTest(
  _data: CreateABTestRequest
): Promise<{ data: ABTest }> {
  return { data: {} as ABTest }
}

export async function updateABTest(
  _id: string,
  _data: UpdateABTestRequest
): Promise<{ data: ABTest }> {
  return { data: {} as ABTest }
}

export async function deleteABTest(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

export async function startABTest(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

export async function stopABTest(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

export async function selectABTestWinner(
  _id: string,
  _variantId: string
): Promise<{ success: boolean }> {
  return { success: false }
}

export async function fetchABTestResult(_id: string): Promise<{ data: TestResult }> {
  return { data: {} as TestResult }
}

// ===== Scheduled Messaging =====
// TODO: Backend not implemented — scheduled messaging system returns placeholders

export async function fetchScheduledMessages(
  _filters: ScheduledMessageFilters = {}
): Promise<PaginatedResponse<ScheduledMessage>> {
  return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } as PaginatedResponse<ScheduledMessage>
}

export async function fetchScheduledMessage(_id: string): Promise<{ data: ScheduledMessage }> {
  return { data: {} as ScheduledMessage }
}

export async function createScheduledMessage(
  _data: CreateScheduledMessageRequest
): Promise<{ data: ScheduledMessage }> {
  return { data: {} as ScheduledMessage }
}

export async function updateScheduledMessage(
  _id: string,
  _data: UpdateScheduledMessageRequest
): Promise<{ data: ScheduledMessage }> {
  return { data: {} as ScheduledMessage }
}

export async function deleteScheduledMessage(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

export async function cancelScheduledMessage(_id: string): Promise<{ success: boolean }> {
  return { success: false }
}

export async function rescheduleMessage(
  _id: string,
  _scheduledAt: string
): Promise<{ data: ScheduledMessage }> {
  return { data: {} as ScheduledMessage }
}

export async function fetchScheduleCalendar(
  _startDate: string,
  _endDate: string
): Promise<{ data: ScheduleCalendarView[] }> {
  return { data: [] }
}
