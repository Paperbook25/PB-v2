import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  Conversation,
  Message,
  Meeting,
  PTMSlot,
  ProgressReport,
  ParentPortalStats,
  ConversationFilters,
  MeetingFilters,
  SendMessageRequest,
  ScheduleMeetingRequest,
  UpdateMeetingRequest,
  BookPTMSlotRequest,
  // Mobile App
  MobileAppConfig,
  UpdateMobileAppConfigRequest,
  OfflineSyncData,
  PushNotificationType,
  PushNotification,
  // Fee Payment
  PaymentHistoryFilters,
  PaymentHistory,
  PaymentReceipt,
  // Assignment Tracking
  AssignmentTrackerFilters,
  AssignmentTracker,
  SubmissionStatus,
  AssignmentSubmissionRequest,
  // Attendance Notifications
  AttendanceNotificationFilters,
  AttendanceNotification,
  AttendanceAlert,
  // Transport Tracking
  StudentLocation,
  TransportTracking,
  TransportAlert,
  // Event Media
  EventGallery,
  PhotoAlbum,
  EventMediaFilters,
  EventMedia,
  MediaComment,
  // Cafeteria
  CafeteriaMenuFilters,
  CafeteriaMenu,
  CafeteriaBalance,
  TopUpBalanceRequest,
  CafeteriaTransaction,
  // Complaints & Suggestions
  ComplaintFilters,
  ParentComplaint,
  SubmitComplaintRequest,
  SubmitComplaintFeedbackRequest,
  SuggestionFilters,
  Suggestion,
  SubmitSuggestionRequest,
} from '../types/parent-portal.types'

const API_BASE = '/api/parent-portal'

// ==================== STATS ====================

export async function fetchParentPortalStats(parentId?: string): Promise<{ data: ParentPortalStats }> {
  const params = new URLSearchParams()
  if (parentId) params.set('parentId', parentId)
  return apiGet(`${API_BASE}/stats?${params}`)
}

// ==================== CONVERSATIONS ====================

export async function fetchConversations(
  filters: ConversationFilters = {}
): Promise<PaginatedResponse<Conversation>> {
  const params = new URLSearchParams()
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet(`${API_BASE}/conversations?${params}`)
}

export async function fetchConversation(id: string): Promise<{ data: Conversation }> {
  return apiGet(`${API_BASE}/conversations/${id}`)
}

export async function createConversation(data: {
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  participants: Conversation['participants']
  senderId: string
  senderName: string
  senderType: string
  initialMessage?: string
}): Promise<{ data: Conversation }> {
  return apiPost(`${API_BASE}/conversations`, data)
}

// ==================== MESSAGES ====================

export async function fetchMessages(
  conversationId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Message>> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))

  return apiGet(`${API_BASE}/conversations/${conversationId}/messages?${params}`)
}

export async function sendMessage(
  conversationId: string,
  data: {
    senderId: string
    senderName: string
    senderType: string
    senderAvatar?: string
    content: string
  }
): Promise<{ data: Message }> {
  return apiPost(`${API_BASE}/conversations/${conversationId}/messages`, data)
}

export async function markMessageAsRead(messageId: string): Promise<{ success: boolean }> {
  return apiPatch(`${API_BASE}/messages/${messageId}/read`)
}

export async function markConversationAsRead(conversationId: string): Promise<{ success: boolean }> {
  return apiPatch(`${API_BASE}/conversations/${conversationId}/read`)
}

// ==================== MEETINGS ====================

export async function fetchMeetings(
  filters: MeetingFilters = {}
): Promise<PaginatedResponse<Meeting>> {
  const params = new URLSearchParams()
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.status) params.set('status', filters.status)
  if (filters.type) params.set('type', filters.type)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet(`${API_BASE}/meetings?${params}`)
}

export async function fetchMeeting(id: string): Promise<{ data: Meeting }> {
  return apiGet(`${API_BASE}/meetings/${id}`)
}

export async function scheduleMeeting(data: ScheduleMeetingRequest & {
  studentName?: string
  studentClass?: string
  studentSection?: string
  parentId?: string
  parentName?: string
  teacherName?: string
}): Promise<{ data: Meeting }> {
  return apiPost(`${API_BASE}/meetings`, data)
}

export async function updateMeeting(
  id: string,
  data: UpdateMeetingRequest
): Promise<{ data: Meeting }> {
  return apiPut(`${API_BASE}/meetings/${id}`, data)
}

export async function confirmMeeting(id: string): Promise<{ data: Meeting }> {
  return apiPatch(`${API_BASE}/meetings/${id}/confirm`)
}

export async function cancelMeeting(
  id: string,
  reason?: string
): Promise<{ data: Meeting }> {
  return apiPatch(`${API_BASE}/meetings/${id}/cancel`, { reason })
}

export async function completeMeeting(
  id: string,
  teacherNotes?: string
): Promise<{ data: Meeting }> {
  return apiPatch(`${API_BASE}/meetings/${id}/complete`, { teacherNotes })
}

export async function deleteMeeting(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/meetings/${id}`)
}

// ==================== PTM SLOTS ====================

export async function fetchPTMSlots(params: {
  teacherId?: string
  date?: string
  availableOnly?: boolean
}): Promise<{ data: PTMSlot[] }> {
  const searchParams = new URLSearchParams()
  if (params.teacherId) searchParams.set('teacherId', params.teacherId)
  if (params.date) searchParams.set('date', params.date)
  if (params.availableOnly) searchParams.set('availableOnly', 'true')

  return apiGet(`${API_BASE}/ptm-slots?${searchParams}`)
}

export async function bookPTMSlot(
  slotId: string,
  data: BookPTMSlotRequest & {
    studentName?: string
    studentClass?: string
    studentSection?: string
    parentId?: string
    parentName?: string
  }
): Promise<{ data: Meeting }> {
  return apiPost(`${API_BASE}/ptm-slots/${slotId}/book`, data)
}

// ==================== PROGRESS REPORTS ====================

export async function fetchProgressReports(
  studentId?: string
): Promise<{ data: ProgressReport[] }> {
  const params = new URLSearchParams()
  if (studentId) params.set('studentId', studentId)

  return apiGet(`${API_BASE}/progress-reports?${params}`)
}

export async function fetchProgressReport(id: string): Promise<{ data: ProgressReport }> {
  return apiGet(`${API_BASE}/progress-reports/${id}`)
}

// ==================== MOBILE APP CONFIG ====================

export async function fetchMobileAppConfig(parentId: string): Promise<{ data: MobileAppConfig }> {
  return apiGet(`${API_BASE}/mobile/config?parentId=${parentId}`)
}

export async function updateMobileAppConfig(
  parentId: string,
  data: UpdateMobileAppConfigRequest
): Promise<{ data: MobileAppConfig }> {
  return apiPatch(`${API_BASE}/mobile/config?parentId=${parentId}`, data)
}

export async function registerDeviceToken(
  parentId: string,
  deviceToken: string,
  deviceType: 'ios' | 'android'
): Promise<{ success: boolean }> {
  return apiPost(`${API_BASE}/mobile/device-token`, { parentId, deviceToken, deviceType })
}

export async function fetchOfflineSyncData(parentId: string): Promise<{ data: OfflineSyncData[] }> {
  return apiGet(`${API_BASE}/mobile/sync?parentId=${parentId}`)
}

export async function syncOfflineData(data: OfflineSyncData[]): Promise<{ data: OfflineSyncData[] }> {
  return apiPost(`${API_BASE}/mobile/sync`, { items: data })
}

export async function fetchPushNotifications(
  parentId: string,
  params?: { read?: boolean; type?: PushNotificationType; page?: number; limit?: number }
): Promise<PaginatedResponse<PushNotification>> {
  const searchParams = new URLSearchParams()
  searchParams.set('parentId', parentId)
  if (params?.read !== undefined) searchParams.set('read', String(params.read))
  if (params?.type) searchParams.set('type', params.type)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))
  return apiGet(`${API_BASE}/mobile/notifications?${searchParams}`)
}

export async function markNotificationsRead(
  notificationIds: string[]
): Promise<{ success: boolean }> {
  return apiPatch(`${API_BASE}/mobile/notifications/read`, { notificationIds })
}

// ==================== FEE PAYMENT HISTORY ====================

export async function fetchPaymentHistory(
  filters: PaymentHistoryFilters = {}
): Promise<PaginatedResponse<PaymentHistory>> {
  const params = new URLSearchParams()
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.feeType) params.set('feeType', filters.feeType)
  if (filters.status) params.set('status', filters.status)
  if (filters.academicYear) params.set('academicYear', filters.academicYear)
  if (filters.term) params.set('term', filters.term)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet(`${API_BASE}/payments?${params}`)
}

export async function fetchPaymentDetail(id: string): Promise<{ data: PaymentHistory }> {
  return apiGet(`${API_BASE}/payments/${id}`)
}

export async function fetchPaymentReceipt(paymentId: string): Promise<{ data: PaymentReceipt }> {
  return apiGet(`${API_BASE}/payments/${paymentId}/receipt`)
}

export async function downloadPaymentReceipt(paymentId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/payments/${paymentId}/receipt/download`)
  if (!response.ok) throw new Error('Failed to download receipt')
  return response.blob()
}

// ==================== ASSIGNMENT TRACKING ====================

export async function fetchAssignmentTrackers(
  filters: AssignmentTrackerFilters = {}
): Promise<PaginatedResponse<AssignmentTracker>> {
  const params = new URLSearchParams()
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.subject) params.set('subject', filters.subject)
  if (filters.status) params.set('status', filters.status)
  if (filters.dueFrom) params.set('dueFrom', filters.dueFrom)
  if (filters.dueTo) params.set('dueTo', filters.dueTo)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet(`${API_BASE}/assignments?${params}`)
}

export async function fetchAssignmentTracker(id: string): Promise<{ data: AssignmentTracker }> {
  return apiGet(`${API_BASE}/assignments/${id}`)
}

export async function fetchSubmissionStatus(studentId: string): Promise<{ data: SubmissionStatus }> {
  return apiGet(`${API_BASE}/assignments/status?studentId=${studentId}`)
}

export async function submitAssignment(
  data: AssignmentSubmissionRequest
): Promise<{ data: AssignmentTracker }> {
  return apiPost(`${API_BASE}/assignments/submit`, data)
}

// ==================== ATTENDANCE NOTIFICATIONS ====================

export async function fetchAttendanceNotifications(
  filters: AttendanceNotificationFilters = {}
): Promise<PaginatedResponse<AttendanceNotification>> {
  const params = new URLSearchParams()
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.type) params.set('type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.read !== undefined) params.set('read', String(filters.read))
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet(`${API_BASE}/attendance/notifications?${params}`)
}

export async function fetchAttendanceNotification(id: string): Promise<{ data: AttendanceNotification }> {
  return apiGet(`${API_BASE}/attendance/notifications/${id}`)
}

export async function markAttendanceNotificationRead(id: string): Promise<{ success: boolean }> {
  return apiPatch(`${API_BASE}/attendance/notifications/${id}/read`)
}

export async function fetchAttendanceAlerts(studentId: string): Promise<{ data: AttendanceAlert[] }> {
  return apiGet(`${API_BASE}/attendance/alerts?studentId=${studentId}`)
}

// ==================== STUDENT LOCATION TRACKING ====================

export async function fetchStudentLocation(studentId: string): Promise<{ data: StudentLocation }> {
  return apiGet(`${API_BASE}/transport/location?studentId=${studentId}`)
}

export async function fetchTransportTracking(studentId: string): Promise<{ data: TransportTracking }> {
  return apiGet(`${API_BASE}/transport/tracking?studentId=${studentId}`)
}

export async function subscribeToLocationUpdates(
  studentId: string
): Promise<{ subscriptionId: string }> {
  return apiPost(`${API_BASE}/transport/location/subscribe`, { studentId })
}

export async function unsubscribeFromLocationUpdates(
  subscriptionId: string
): Promise<{ success: boolean }> {
  return apiPost(`${API_BASE}/transport/location/unsubscribe`, { subscriptionId })
}

export async function fetchTransportAlerts(studentId: string): Promise<{ data: TransportAlert[] }> {
  return apiGet(`${API_BASE}/transport/alerts?studentId=${studentId}`)
}

// ==================== EVENT MEDIA SHARING ====================

export async function fetchEventGalleries(params?: {
  studentId?: string
  page?: number
  limit?: number
}): Promise<PaginatedResponse<EventGallery>> {
  const searchParams = new URLSearchParams()
  if (params?.studentId) searchParams.set('studentId', params.studentId)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))

  return apiGet(`${API_BASE}/events/galleries?${searchParams}`)
}

export async function fetchPhotoAlbums(eventId: string): Promise<{ data: PhotoAlbum[] }> {
  return apiGet(`${API_BASE}/events/${eventId}/albums`)
}

export async function fetchPhotoAlbum(albumId: string): Promise<{ data: PhotoAlbum }> {
  return apiGet(`${API_BASE}/events/albums/${albumId}`)
}

export async function fetchEventMedia(
  filters: EventMediaFilters = {}
): Promise<PaginatedResponse<EventMedia>> {
  const params = new URLSearchParams()
  if (filters.eventId) params.set('eventId', filters.eventId)
  if (filters.albumId) params.set('albumId', filters.albumId)
  if (filters.type) params.set('type', filters.type)
  if (filters.tags?.length) params.set('tags', filters.tags.join(','))
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet(`${API_BASE}/events/media?${params}`)
}

export async function fetchMediaDetail(mediaId: string): Promise<{ data: EventMedia }> {
  return apiGet(`${API_BASE}/events/media/${mediaId}`)
}

export async function likeMedia(mediaId: string, like: boolean): Promise<{ data: EventMedia }> {
  return apiPost(`${API_BASE}/events/media/${mediaId}/like`, { like })
}

export async function commentOnMedia(
  mediaId: string,
  content: string
): Promise<{ data: MediaComment }> {
  return apiPost(`${API_BASE}/events/media/${mediaId}/comments`, { content })
}

export async function deleteMediaComment(
  mediaId: string,
  commentId: string
): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/events/media/${mediaId}/comments/${commentId}`)
}

export async function downloadMedia(mediaId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/events/media/${mediaId}/download`)
  if (!response.ok) throw new Error('Failed to download media')
  return response.blob()
}

// ==================== CAFETERIA ====================

export async function fetchCafeteriaMenus(
  filters: CafeteriaMenuFilters = {}
): Promise<{ data: CafeteriaMenu[] }> {
  const params = new URLSearchParams()
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.mealType) params.set('mealType', filters.mealType)
  if (filters.dietaryTags?.length) params.set('dietaryTags', filters.dietaryTags.join(','))

  return apiGet(`${API_BASE}/cafeteria/menus?${params}`)
}

export async function fetchCafeteriaMenuForDate(date: string): Promise<{ data: CafeteriaMenu }> {
  return apiGet(`${API_BASE}/cafeteria/menus/${date}`)
}

export async function fetchCafeteriaBalance(studentId: string): Promise<{ data: CafeteriaBalance }> {
  return apiGet(`${API_BASE}/cafeteria/balance?studentId=${studentId}`)
}

export async function topUpCafeteriaBalance(
  data: TopUpBalanceRequest
): Promise<{ data: CafeteriaBalance }> {
  return apiPost(`${API_BASE}/cafeteria/balance/topup`, data)
}

export async function fetchCafeteriaTransactions(
  studentId: string,
  params?: { page?: number; limit?: number; dateFrom?: string; dateTo?: string }
): Promise<PaginatedResponse<CafeteriaTransaction>> {
  const searchParams = new URLSearchParams()
  searchParams.set('studentId', studentId)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom)
  if (params?.dateTo) searchParams.set('dateTo', params.dateTo)

  return apiGet(`${API_BASE}/cafeteria/transactions?${searchParams}`)
}

export async function updateCafeteriaSettings(
  studentId: string,
  settings: {
    autoTopUpEnabled?: boolean
    autoTopUpThreshold?: number
    autoTopUpAmount?: number
    monthlySpendingLimit?: number
  }
): Promise<{ data: CafeteriaBalance }> {
  return apiPatch(`${API_BASE}/cafeteria/settings?studentId=${studentId}`, settings)
}

// ==================== COMPLAINTS & SUGGESTIONS ====================

export async function fetchComplaints(
  filters: ComplaintFilters = {}
): Promise<PaginatedResponse<ParentComplaint>> {
  const params = new URLSearchParams()
  if (filters.parentId) params.set('parentId', filters.parentId)
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.category) params.set('category', filters.category)
  if (filters.status) params.set('status', filters.status)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet(`${API_BASE}/complaints?${params}`)
}

export async function fetchComplaint(id: string): Promise<{ data: ParentComplaint }> {
  return apiGet(`${API_BASE}/complaints/${id}`)
}

export async function submitComplaint(
  data: SubmitComplaintRequest
): Promise<{ data: ParentComplaint }> {
  return apiPost(`${API_BASE}/complaints`, data)
}

export async function updateComplaint(
  id: string,
  data: Partial<SubmitComplaintRequest>
): Promise<{ data: ParentComplaint }> {
  return apiPut(`${API_BASE}/complaints/${id}`, data)
}

export async function submitComplaintFeedback(
  complaintId: string,
  data: SubmitComplaintFeedbackRequest
): Promise<{ data: ParentComplaint }> {
  return apiPost(`${API_BASE}/complaints/${complaintId}/feedback`, data)
}

export async function fetchSuggestions(
  filters: SuggestionFilters = {}
): Promise<PaginatedResponse<Suggestion>> {
  const params = new URLSearchParams()
  if (filters.parentId) params.set('parentId', filters.parentId)
  if (filters.category) params.set('category', filters.category)
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet(`${API_BASE}/suggestions?${params}`)
}

export async function fetchSuggestion(id: string): Promise<{ data: Suggestion }> {
  return apiGet(`${API_BASE}/suggestions/${id}`)
}

export async function submitSuggestion(
  data: SubmitSuggestionRequest
): Promise<{ data: Suggestion }> {
  return apiPost(`${API_BASE}/suggestions`, data)
}

export async function voteSuggestion(
  suggestionId: string,
  vote: boolean
): Promise<{ data: Suggestion }> {
  return apiPost(`${API_BASE}/suggestions/${suggestionId}/vote`, { vote })
}
