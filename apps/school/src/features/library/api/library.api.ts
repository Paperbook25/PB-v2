import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  Book,
  BookFilters,
  CreateBookRequest,
  UpdateBookRequest,
  IssuedBook,
  IssuedBookFilters,
  IssueBookRequest,
  Fine,
  FineFilters,
  UpdateFineRequest,
  LibraryStats,
  StudentForLibrary,
  BookReservation,
  CreateReservationRequest,
  ReadingRecord,
  StudentReadingReport,
  BookRecommendation,
  DigitalBook,
  DigitalBookFilters,
  OverdueNotification,
  NotificationConfig,
  BarcodeScanResult,
  RenewBookRequest,
  RenewBookResponse,
  // RFID Types
  RFIDTag,
  CreateRFIDTagRequest,
  UpdateRFIDTagRequest,
  RFIDGate,
  RFIDScan,
  RFIDScanFilters,
  // Inter-Library Loan Types
  PartnerLibrary,
  CreatePartnerLibraryRequest,
  UpdatePartnerLibraryRequest,
  InterLibraryLoan,
  CreateInterLibraryLoanRequest,
  UpdateInterLibraryLoanRequest,
  InterLibraryLoanFilters,
  // Reading Challenges / Gamification Types
  ReadingChallenge,
  CreateReadingChallengeRequest,
  UpdateReadingChallengeRequest,
  ChallengeProgress,
  Badge,
  StudentBadge,
  StudentGamificationProfile,
  Leaderboard,
  // Recommendation Types
  EnhancedBookRecommendation,
  ReadingPreference,
  UpdateReadingPreferenceRequest,
  RecommendationSettings,
  // E-Reader Types
  EReaderDevice,
  CreateEReaderDeviceRequest,
  UpdateEReaderDeviceRequest,
  AssignEReaderRequest,
  EReaderFilters,
  EBookLicense,
  CreateEBookLicenseRequest,
  UpdateEBookLicenseRequest,
  EBookLicenseFilters,
  EBookCheckout,
  EBookCheckoutRequest,
  EReaderSyncLog,
} from '../types/library.types'

const API_BASE = '/api/library'

// ==================== USER-SCOPED TYPES ====================

export interface ChildBooksData {
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  books: IssuedBook[]
}

export interface FinesSummary {
  totalFines: number
  pendingFines: number
  paidFines: number
}

export interface MyFinesResponse {
  fines: Fine[]
  summary: FinesSummary
}

// ==================== USER-SCOPED ENDPOINTS ====================

export async function fetchMyIssuedBooks(): Promise<{ data: IssuedBook[] }> {
  return apiGet(`${API_BASE}/my-books`)
}

export async function fetchMyChildrenBooks(): Promise<{ data: ChildBooksData[] }> {
  return apiGet(`${API_BASE}/my-children-books`)
}

export async function fetchMyLibraryFines(): Promise<{ data: MyFinesResponse }> {
  return apiGet(`${API_BASE}/my-fines`)
}

// ==================== BOOKS CRUD ====================

export async function fetchBooks(filters: BookFilters = {}): Promise<PaginatedResponse<Book>> {
  const params = new URLSearchParams()

  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.search) params.set('search', filters.search)
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.availability && filters.availability !== 'all') {
    params.set('availability', filters.availability)
  }

  return apiGet<PaginatedResponse<Book>>(`${API_BASE}/books?${params.toString()}`)
}

export async function fetchBook(id: string): Promise<{ data: Book }> {
  return apiGet<{ data: Book }>(`${API_BASE}/books/${id}`)
}

export async function createBook(data: CreateBookRequest): Promise<{ data: Book }> {
  return apiPost<{ data: Book }>(`${API_BASE}/books`, data)
}

export async function updateBook(id: string, data: UpdateBookRequest): Promise<{ data: Book }> {
  return apiPut<{ data: Book }>(`${API_BASE}/books/${id}`, data)
}

export async function deleteBook(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/books/${id}`)
}

// ==================== ISSUED BOOKS ====================

export async function fetchIssuedBooks(
  filters: IssuedBookFilters = {}
): Promise<PaginatedResponse<IssuedBook>> {
  const params = new URLSearchParams()

  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.search) params.set('search', filters.search)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)

  return apiGet<PaginatedResponse<IssuedBook>>(`${API_BASE}/issued?${params.toString()}`)
}

export async function issueBook(data: IssueBookRequest): Promise<{ data: IssuedBook }> {
  return apiPost<{ data: IssuedBook }>(`${API_BASE}/issue`, data)
}

export async function returnBook(
  issuedBookId: string
): Promise<{ data: IssuedBook; fine: Fine | null }> {
  return apiPost<{ data: IssuedBook; fine: Fine | null }>(`${API_BASE}/return/${issuedBookId}`)
}

export async function renewBook(
  issuedBookId: string,
  newDueDate?: string
): Promise<RenewBookResponse> {
  return apiPost<RenewBookResponse>(`${API_BASE}/renew/${issuedBookId}`, {
    issuedBookId,
    newDueDate,
  })
}

// ==================== FINES ====================

export async function fetchFines(filters: FineFilters = {}): Promise<PaginatedResponse<Fine>> {
  const params = new URLSearchParams()

  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.search) params.set('search', filters.search)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)

  return apiGet<PaginatedResponse<Fine>>(`${API_BASE}/fines?${params.toString()}`)
}

export async function updateFine(id: string, data: UpdateFineRequest): Promise<{ data: Fine }> {
  return apiPatch<{ data: Fine }>(`${API_BASE}/fines/${id}`, data)
}

export async function deleteFine(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/fines/${id}`)
}

// ==================== STATS & UTILITY ====================

export async function fetchLibraryStats(): Promise<{ data: LibraryStats }> {
  return apiGet<{ data: LibraryStats }>(`${API_BASE}/stats`)
}

export async function fetchAvailableStudents(
  search?: string
): Promise<{ data: StudentForLibrary[] }> {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiGet<{ data: StudentForLibrary[] }>(`${API_BASE}/students${params}`)
}

// ==================== RESERVATIONS ====================

export async function fetchReservations(
  filters: { search?: string; status?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<BookReservation>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.search) params.set('search', filters.search)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)

  return apiGet<PaginatedResponse<BookReservation>>(`${API_BASE}/reservations?${params.toString()}`)
}

export async function createReservation(data: CreateReservationRequest): Promise<{ data: BookReservation }> {
  return apiPost<{ data: BookReservation }>(`${API_BASE}/reservations`, data)
}

export async function cancelReservation(id: string): Promise<{ data: BookReservation }> {
  return apiPatch<{ data: BookReservation }>(`${API_BASE}/reservations/${id}/cancel`)
}

// ==================== READING HISTORY & RECOMMENDATIONS ====================

export async function fetchReadingHistory(
  filters: { studentId?: string; category?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<ReadingRecord>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)

  return apiGet<PaginatedResponse<ReadingRecord>>(`${API_BASE}/reading-history?${params.toString()}`)
}

export async function fetchStudentReadingReport(studentId: string): Promise<{ data: StudentReadingReport }> {
  return apiGet<{ data: StudentReadingReport }>(`${API_BASE}/reading-report/${studentId}`)
}

export async function fetchBookRecommendations(studentId: string): Promise<{ data: BookRecommendation[] }> {
  return apiGet<{ data: BookRecommendation[] }>(`${API_BASE}/recommendations/${studentId}`)
}

// ==================== DIGITAL LIBRARY ====================

export async function fetchDigitalBooks(
  filters: DigitalBookFilters = {}
): Promise<PaginatedResponse<DigitalBook>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.search) params.set('search', filters.search)
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.format && filters.format !== 'all') params.set('format', filters.format)

  return apiGet<PaginatedResponse<DigitalBook>>(`${API_BASE}/digital?${params.toString()}`)
}

export async function recordDigitalAccess(id: string): Promise<{ data: DigitalBook }> {
  return apiPost<{ data: DigitalBook }>(`${API_BASE}/digital/${id}/access`)
}

// ==================== OVERDUE NOTIFICATIONS ====================

export async function fetchOverdueNotifications(
  filters: { channel?: string; status?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<OverdueNotification>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.channel && filters.channel !== 'all') params.set('channel', filters.channel)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)

  return apiGet<PaginatedResponse<OverdueNotification>>(`${API_BASE}/notifications?${params.toString()}`)
}

export async function fetchNotificationConfig(): Promise<{ data: NotificationConfig }> {
  return apiGet<{ data: NotificationConfig }>(`${API_BASE}/notifications/config`)
}

export async function updateNotificationConfig(data: Partial<NotificationConfig>): Promise<{ data: NotificationConfig }> {
  return apiPut<{ data: NotificationConfig }>(`${API_BASE}/notifications/config`, data)
}

export async function sendOverdueNotification(
  issuedBookId: string,
  channel: string
): Promise<{ data: OverdueNotification }> {
  return apiPost<{ data: OverdueNotification }>(`${API_BASE}/notifications/send`, { issuedBookId, channel })
}

// ==================== BARCODE SCANNING ====================

export async function scanBarcode(isbn: string): Promise<{ data: BarcodeScanResult }> {
  return apiGet<{ data: BarcodeScanResult }>(`${API_BASE}/scan/${encodeURIComponent(isbn)}`)
}

// ==================== RFID TRACKING ====================

export async function fetchRFIDTags(
  filters: { bookId?: string; status?: string; search?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<RFIDTag>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.bookId) params.set('bookId', filters.bookId)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)

  return apiGet<PaginatedResponse<RFIDTag>>(`${API_BASE}/rfid/tags?${params.toString()}`)
}

export async function fetchRFIDTag(id: string): Promise<{ data: RFIDTag }> {
  return apiGet<{ data: RFIDTag }>(`${API_BASE}/rfid/tags/${id}`)
}

export async function createRFIDTag(data: CreateRFIDTagRequest): Promise<{ data: RFIDTag }> {
  return apiPost<{ data: RFIDTag }>(`${API_BASE}/rfid/tags`, data)
}

export async function updateRFIDTag(id: string, data: UpdateRFIDTagRequest): Promise<{ data: RFIDTag }> {
  return apiPatch<{ data: RFIDTag }>(`${API_BASE}/rfid/tags/${id}`, data)
}

export async function deleteRFIDTag(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/rfid/tags/${id}`)
}

export async function fetchRFIDGates(): Promise<{ data: RFIDGate[] }> {
  return apiGet<{ data: RFIDGate[] }>(`${API_BASE}/rfid/gates`)
}

export async function fetchRFIDScans(filters: RFIDScanFilters = {}): Promise<PaginatedResponse<RFIDScan>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.gateId) params.set('gateId', filters.gateId)
  if (filters.scanType && filters.scanType !== 'all') params.set('scanType', filters.scanType)
  if (filters.isAlert !== undefined) params.set('isAlert', String(filters.isAlert))
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)

  return apiGet<PaginatedResponse<RFIDScan>>(`${API_BASE}/rfid/scans?${params.toString()}`)
}

export async function simulateRFIDScan(tagId: string, gateId: string): Promise<{ data: RFIDScan }> {
  return apiPost<{ data: RFIDScan }>(`${API_BASE}/rfid/scan`, { tagId, gateId })
}

// ==================== INTER-LIBRARY LOANS ====================

export async function fetchPartnerLibraries(
  filters: { status?: string; search?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<PartnerLibrary>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)

  return apiGet<PaginatedResponse<PartnerLibrary>>(`${API_BASE}/ill/partners?${params.toString()}`)
}

export async function fetchPartnerLibrary(id: string): Promise<{ data: PartnerLibrary }> {
  return apiGet<{ data: PartnerLibrary }>(`${API_BASE}/ill/partners/${id}`)
}

export async function createPartnerLibrary(data: CreatePartnerLibraryRequest): Promise<{ data: PartnerLibrary }> {
  return apiPost<{ data: PartnerLibrary }>(`${API_BASE}/ill/partners`, data)
}

export async function updatePartnerLibrary(
  id: string,
  data: UpdatePartnerLibraryRequest
): Promise<{ data: PartnerLibrary }> {
  return apiPut<{ data: PartnerLibrary }>(`${API_BASE}/ill/partners/${id}`, data)
}

export async function deletePartnerLibrary(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/ill/partners/${id}`)
}

export async function fetchInterLibraryLoans(
  filters: InterLibraryLoanFilters = {}
): Promise<PaginatedResponse<InterLibraryLoan>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.direction && filters.direction !== 'all') params.set('direction', filters.direction)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.partnerLibraryId) params.set('partnerLibraryId', filters.partnerLibraryId)
  if (filters.search) params.set('search', filters.search)

  return apiGet<PaginatedResponse<InterLibraryLoan>>(`${API_BASE}/ill/loans?${params.toString()}`)
}

export async function fetchInterLibraryLoan(id: string): Promise<{ data: InterLibraryLoan }> {
  return apiGet<{ data: InterLibraryLoan }>(`${API_BASE}/ill/loans/${id}`)
}

export async function createInterLibraryLoan(
  data: CreateInterLibraryLoanRequest
): Promise<{ data: InterLibraryLoan }> {
  return apiPost<{ data: InterLibraryLoan }>(`${API_BASE}/ill/loans`, data)
}

export async function updateInterLibraryLoan(
  id: string,
  data: UpdateInterLibraryLoanRequest
): Promise<{ data: InterLibraryLoan }> {
  return apiPatch<{ data: InterLibraryLoan }>(`${API_BASE}/ill/loans/${id}`, data)
}

// ==================== READING CHALLENGES / GAMIFICATION ====================

export async function fetchReadingChallenges(
  filters: { status?: string; type?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<ReadingChallenge>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)

  return apiGet<PaginatedResponse<ReadingChallenge>>(`${API_BASE}/challenges?${params.toString()}`)
}

export async function fetchReadingChallenge(id: string): Promise<{ data: ReadingChallenge }> {
  return apiGet<{ data: ReadingChallenge }>(`${API_BASE}/challenges/${id}`)
}

export async function createReadingChallenge(
  data: CreateReadingChallengeRequest
): Promise<{ data: ReadingChallenge }> {
  return apiPost<{ data: ReadingChallenge }>(`${API_BASE}/challenges`, data)
}

export async function updateReadingChallenge(
  id: string,
  data: UpdateReadingChallengeRequest
): Promise<{ data: ReadingChallenge }> {
  return apiPatch<{ data: ReadingChallenge }>(`${API_BASE}/challenges/${id}`, data)
}

export async function deleteReadingChallenge(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/challenges/${id}`)
}

export async function fetchChallengeProgress(
  challengeId: string,
  filters: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<ChallengeProgress>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<ChallengeProgress>>(
    `${API_BASE}/challenges/${challengeId}/progress?${params.toString()}`
  )
}

export async function fetchStudentChallengeProgress(studentId: string): Promise<{ data: ChallengeProgress[] }> {
  return apiGet<{ data: ChallengeProgress[] }>(`${API_BASE}/challenges/student/${studentId}`)
}

export async function joinChallenge(challengeId: string, studentId: string): Promise<{ data: ChallengeProgress }> {
  return apiPost<{ data: ChallengeProgress }>(`${API_BASE}/challenges/${challengeId}/join`, { studentId })
}

export async function fetchBadges(
  filters: { category?: string; rarity?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<Badge>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.rarity && filters.rarity !== 'all') params.set('rarity', filters.rarity)

  return apiGet<PaginatedResponse<Badge>>(`${API_BASE}/badges?${params.toString()}`)
}

export async function fetchStudentBadges(studentId: string): Promise<{ data: StudentBadge[] }> {
  return apiGet<{ data: StudentBadge[] }>(`${API_BASE}/badges/student/${studentId}`)
}

export async function fetchStudentGamificationProfile(
  studentId: string
): Promise<{ data: StudentGamificationProfile }> {
  return apiGet<{ data: StudentGamificationProfile }>(`${API_BASE}/gamification/profile/${studentId}`)
}

export async function fetchLeaderboard(
  period: 'weekly' | 'monthly' | 'all_time' = 'weekly'
): Promise<{ data: Leaderboard }> {
  return apiGet<{ data: Leaderboard }>(`${API_BASE}/gamification/leaderboard?period=${period}`)
}

// ==================== BOOK RECOMMENDATIONS ====================

export async function fetchEnhancedRecommendations(
  studentId: string,
  filters: { source?: string; limit?: number } = {}
): Promise<{ data: EnhancedBookRecommendation[] }> {
  const params = new URLSearchParams()
  if (filters.source && filters.source !== 'all') params.set('source', filters.source)
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<{ data: EnhancedBookRecommendation[] }>(
    `${API_BASE}/recommendations/enhanced/${studentId}?${params.toString()}`
  )
}

export async function fetchReadingPreferences(studentId: string): Promise<{ data: ReadingPreference }> {
  return apiGet<{ data: ReadingPreference }>(`${API_BASE}/recommendations/preferences/${studentId}`)
}

export async function updateReadingPreferences(
  studentId: string,
  data: UpdateReadingPreferenceRequest
): Promise<{ data: ReadingPreference }> {
  return apiPut<{ data: ReadingPreference }>(`${API_BASE}/recommendations/preferences/${studentId}`, data)
}

export async function fetchRecommendationSettings(): Promise<{ data: RecommendationSettings }> {
  return apiGet<{ data: RecommendationSettings }>(`${API_BASE}/recommendations/settings`)
}

export async function updateRecommendationSettings(
  data: Partial<RecommendationSettings>
): Promise<{ data: RecommendationSettings }> {
  return apiPut<{ data: RecommendationSettings }>(`${API_BASE}/recommendations/settings`, data)
}

// ==================== E-READER INTEGRATION ====================

export async function fetchEReaderDevices(filters: EReaderFilters = {}): Promise<PaginatedResponse<EReaderDevice>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.deviceType && filters.deviceType !== 'all') params.set('deviceType', filters.deviceType)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.assignedToType && filters.assignedToType !== 'all') params.set('assignedToType', filters.assignedToType)
  if (filters.search) params.set('search', filters.search)

  return apiGet<PaginatedResponse<EReaderDevice>>(`${API_BASE}/ereader/devices?${params.toString()}`)
}

export async function fetchEReaderDevice(id: string): Promise<{ data: EReaderDevice }> {
  return apiGet<{ data: EReaderDevice }>(`${API_BASE}/ereader/devices/${id}`)
}

export async function createEReaderDevice(data: CreateEReaderDeviceRequest): Promise<{ data: EReaderDevice }> {
  return apiPost<{ data: EReaderDevice }>(`${API_BASE}/ereader/devices`, data)
}

export async function updateEReaderDevice(
  id: string,
  data: UpdateEReaderDeviceRequest
): Promise<{ data: EReaderDevice }> {
  return apiPatch<{ data: EReaderDevice }>(`${API_BASE}/ereader/devices/${id}`, data)
}

export async function deleteEReaderDevice(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/ereader/devices/${id}`)
}

export async function assignEReaderDevice(data: AssignEReaderRequest): Promise<{ data: EReaderDevice }> {
  return apiPost<{ data: EReaderDevice }>(`${API_BASE}/ereader/devices/assign`, data)
}

export async function unassignEReaderDevice(deviceId: string): Promise<{ data: EReaderDevice }> {
  return apiPost<{ data: EReaderDevice }>(`${API_BASE}/ereader/devices/${deviceId}/unassign`)
}

export async function syncEReaderDevice(deviceId: string): Promise<{ data: EReaderSyncLog }> {
  return apiPost<{ data: EReaderSyncLog }>(`${API_BASE}/ereader/devices/${deviceId}/sync`)
}

export async function fetchEBookLicenses(
  filters: EBookLicenseFilters = {}
): Promise<PaginatedResponse<EBookLicense>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.licenseType && filters.licenseType !== 'all') params.set('licenseType', filters.licenseType)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)

  return apiGet<PaginatedResponse<EBookLicense>>(`${API_BASE}/ereader/licenses?${params.toString()}`)
}

export async function fetchEBookLicense(id: string): Promise<{ data: EBookLicense }> {
  return apiGet<{ data: EBookLicense }>(`${API_BASE}/ereader/licenses/${id}`)
}

export async function createEBookLicense(data: CreateEBookLicenseRequest): Promise<{ data: EBookLicense }> {
  return apiPost<{ data: EBookLicense }>(`${API_BASE}/ereader/licenses`, data)
}

export async function updateEBookLicense(
  id: string,
  data: UpdateEBookLicenseRequest
): Promise<{ data: EBookLicense }> {
  return apiPatch<{ data: EBookLicense }>(`${API_BASE}/ereader/licenses/${id}`, data)
}

export async function deleteEBookLicense(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/ereader/licenses/${id}`)
}

export async function checkoutEBook(data: EBookCheckoutRequest): Promise<{ data: EBookCheckout }> {
  return apiPost<{ data: EBookCheckout }>(`${API_BASE}/ereader/checkout`, data)
}

export async function returnEBook(checkoutId: string): Promise<{ data: EBookCheckout }> {
  return apiPost<{ data: EBookCheckout }>(`${API_BASE}/ereader/checkout/${checkoutId}/return`)
}

export async function fetchEBookCheckouts(
  filters: { userId?: string; licenseId?: string; isActive?: boolean; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<EBookCheckout>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.userId) params.set('userId', filters.userId)
  if (filters.licenseId) params.set('licenseId', filters.licenseId)
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive))

  return apiGet<PaginatedResponse<EBookCheckout>>(`${API_BASE}/ereader/checkouts?${params.toString()}`)
}

export async function fetchEReaderSyncLogs(
  deviceId: string,
  filters: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<EReaderSyncLog>> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<EReaderSyncLog>>(
    `${API_BASE}/ereader/devices/${deviceId}/sync-logs?${params.toString()}`
  )
}
