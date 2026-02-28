// ==================== BOOK TYPES ====================

export type BookCategory =
  | 'Fiction'
  | 'Non-Fiction'
  | 'Science'
  | 'Mathematics'
  | 'History'
  | 'Literature'
  | 'Reference'
  | 'Biography'
  | 'Technology'
  | 'Arts'

export interface Book {
  id: string
  isbn: string
  title: string
  author: string
  category: BookCategory
  publisher: string
  publicationYear: number
  totalCopies: number
  availableCopies: number
  description: string
  coverUrl: string
  location: string // shelf location
  addedAt: string
}

export interface CreateBookRequest {
  isbn: string
  title: string
  author: string
  category: BookCategory
  publisher: string
  publicationYear: number
  totalCopies: number
  description?: string
  coverUrl?: string
  location: string
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {}

export interface BookFilters {
  search?: string
  category?: BookCategory | 'all'
  availability?: 'all' | 'available' | 'unavailable'
  page?: number
  limit?: number
}

// ==================== ISSUED BOOK TYPES ====================

export type IssuedBookStatus = 'issued' | 'returned' | 'overdue'

export interface RenewalRecord {
  renewedAt: string
  previousDueDate: string
  newDueDate: string
  renewedBy: string
}

export interface IssuedBook {
  id: string
  bookId: string
  bookTitle: string
  bookIsbn: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  issueDate: string
  dueDate: string
  returnDate?: string
  status: IssuedBookStatus
  renewalCount: number
  renewalHistory: RenewalRecord[]
}

export interface RenewBookRequest {
  issuedBookId: string
  newDueDate: string
}

export interface RenewBookResponse {
  data: IssuedBook
  message: string
}

export interface IssueBookRequest {
  bookId: string
  studentId: string
  dueDate: string
}

export interface ReturnBookRequest {
  issuedBookId: string
}

export const MAX_RENEWALS = 2 // Maximum number of times a book can be renewed
export const RENEWAL_DAYS = 14 // Number of days to extend due date on renewal

export interface IssuedBookFilters {
  search?: string
  status?: IssuedBookStatus | 'all'
  page?: number
  limit?: number
}

// ==================== FINE TYPES ====================

export type FineStatus = 'pending' | 'paid' | 'waived'

export interface Fine {
  id: string
  issuedBookId: string
  bookId: string
  bookTitle: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  overdueDays: number
  amount: number // Rs 5 per day
  status: FineStatus
  createdAt: string
  paidAt?: string
  waivedAt?: string
  waivedReason?: string
}

export interface UpdateFineRequest {
  status: 'paid' | 'waived'
  waivedReason?: string
}

export interface FineFilters {
  search?: string
  status?: FineStatus | 'all'
  page?: number
  limit?: number
}

// ==================== LIBRARY STATS ====================

export interface LibraryStats {
  totalBooks: number
  availableBooks: number
  issuedBooks: number
  overdueBooks: number
  totalFines: number
  pendingFinesAmount: number
  totalStudentsWithBooks: number
}

// ==================== STUDENT FOR DROPDOWN ====================

export interface StudentForLibrary {
  id: string
  name: string
  className: string
  section: string
  rollNumber: string
  admissionNumber: string
}

// ==================== RESERVATION TYPES ====================

export type ReservationStatus = 'active' | 'fulfilled' | 'cancelled' | 'expired'

export interface BookReservation {
  id: string
  bookId: string
  bookTitle: string
  bookIsbn: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  reservedAt: string
  expiresAt: string
  status: ReservationStatus
  queuePosition: number
  fulfilledAt?: string
  cancelledAt?: string
}

export interface CreateReservationRequest {
  bookId: string
  studentId: string
}

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  active: 'Active',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

// ==================== READING HISTORY TYPES ====================

export interface ReadingRecord {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  bookCategory: BookCategory
  issueDate: string
  returnDate: string
  daysToRead: number
  rating?: number // 1-5 star rating by student
}

export interface StudentReadingReport {
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  totalBooksRead: number
  averageDaysToRead: number
  averageRating: number
  favoriteCategory: BookCategory
  categoryBreakdown: { category: BookCategory; count: number }[]
  monthlyBreakdown: { month: string; count: number }[]
  recentBooks: ReadingRecord[]
}

export interface BookRecommendation {
  bookId: string
  bookTitle: string
  bookAuthor: string
  bookCategory: BookCategory
  coverUrl: string
  reason: string
  matchScore: number // 0-100
}

// ==================== DIGITAL LIBRARY TYPES ====================

export type DigitalFormat = 'pdf' | 'epub' | 'audiobook'

export interface DigitalBook {
  id: string
  bookId?: string // linked physical book, if any
  title: string
  author: string
  category: BookCategory
  format: DigitalFormat
  fileSize: string
  coverUrl: string
  description: string
  totalAccesses: number
  addedAt: string
  downloadUrl: string
}

export interface DigitalBookFilters {
  search?: string
  category?: BookCategory | 'all'
  format?: DigitalFormat | 'all'
  page?: number
  limit?: number
}

export const DIGITAL_FORMAT_LABELS: Record<DigitalFormat, string> = {
  pdf: 'PDF',
  epub: 'ePub',
  audiobook: 'Audiobook',
}

// ==================== OVERDUE NOTIFICATION TYPES ====================

export type NotificationChannel = 'sms' | 'email' | 'whatsapp' | 'in_app'
export type NotificationStatus = 'sent' | 'delivered' | 'failed' | 'pending'

export interface OverdueNotification {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  parentName: string
  parentPhone: string
  parentEmail: string
  bookTitle: string
  dueDate: string
  overdueDays: number
  fineAmount: number
  channel: NotificationChannel
  status: NotificationStatus
  sentAt: string
  message: string
}

export interface NotificationConfig {
  autoSendEnabled: boolean
  channels: NotificationChannel[]
  sendAfterDays: number
  repeatEveryDays: number
  maxReminders: number
  messageTemplate: string
}

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  sms: 'SMS',
  email: 'Email',
  whatsapp: 'WhatsApp',
  in_app: 'In-App',
}

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed',
  pending: 'Pending',
}

// ==================== BARCODE/QR TYPES ====================

export interface BarcodeScanResult {
  isbn: string
  book: Book | null
  found: boolean
}

// ==================== CONSTANTS ====================

export const BOOK_CATEGORIES: BookCategory[] = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Mathematics',
  'History',
  'Literature',
  'Reference',
  'Biography',
  'Technology',
  'Arts',
]

export const FINE_RATE_PER_DAY = 5 // Rs 5 per day

export const DEFAULT_LOAN_DAYS = 14

export const BOOKS_PER_PAGE = 12

export const ISSUED_BOOKS_PER_PAGE = 10

export const FINES_PER_PAGE = 10

// ==================== RFID TRACKING TYPES ====================

export type RFIDTagStatus = 'active' | 'inactive' | 'damaged' | 'lost'

export interface RFIDTag {
  id: string
  tagId: string // RFID chip unique identifier
  bookId: string
  bookTitle: string
  bookIsbn: string
  status: RFIDTagStatus
  assignedAt: string
  lastScannedAt?: string
  lastScannedLocation?: string
}

export interface CreateRFIDTagRequest {
  tagId: string
  bookId: string
}

export interface UpdateRFIDTagRequest {
  status?: RFIDTagStatus
}

export type RFIDGateLocation = 'main_entrance' | 'exit_gate' | 'reading_room' | 'reference_section'
export type RFIDGateStatus = 'online' | 'offline' | 'maintenance'

export interface RFIDGate {
  id: string
  name: string
  location: RFIDGateLocation
  status: RFIDGateStatus
  lastPing: string
  totalScansToday: number
  alertsToday: number
}

export type RFIDScanType = 'checkout' | 'return' | 'security_alert' | 'inventory'

export interface RFIDScan {
  id: string
  tagId: string
  bookId: string
  bookTitle: string
  gateId: string
  gateName: string
  scanType: RFIDScanType
  scannedAt: string
  studentId?: string
  studentName?: string
  isAlert: boolean
  alertReason?: string
}

export interface RFIDScanFilters {
  gateId?: string
  scanType?: RFIDScanType | 'all'
  isAlert?: boolean
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export const RFID_TAG_STATUS_LABELS: Record<RFIDTagStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  damaged: 'Damaged',
  lost: 'Lost',
}

export const RFID_GATE_LOCATION_LABELS: Record<RFIDGateLocation, string> = {
  main_entrance: 'Main Entrance',
  exit_gate: 'Exit Gate',
  reading_room: 'Reading Room',
  reference_section: 'Reference Section',
}

export const RFID_SCAN_TYPE_LABELS: Record<RFIDScanType, string> = {
  checkout: 'Checkout',
  return: 'Return',
  security_alert: 'Security Alert',
  inventory: 'Inventory Scan',
}

// ==================== INTER-LIBRARY LOAN TYPES ====================

export type PartnerLibraryStatus = 'active' | 'inactive' | 'suspended'

export interface PartnerLibrary {
  id: string
  name: string
  code: string // Short unique code for the library
  address: string
  city: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  status: PartnerLibraryStatus
  totalLoansReceived: number
  totalLoansSent: number
  agreementStartDate: string
  agreementEndDate: string
  createdAt: string
}

export interface CreatePartnerLibraryRequest {
  name: string
  code: string
  address: string
  city: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  agreementStartDate: string
  agreementEndDate: string
}

export interface UpdatePartnerLibraryRequest extends Partial<CreatePartnerLibraryRequest> {
  status?: PartnerLibraryStatus
}

export type InterLibraryLoanStatus =
  | 'requested'
  | 'approved'
  | 'in_transit'
  | 'received'
  | 'issued_to_patron'
  | 'returned_by_patron'
  | 'returning'
  | 'completed'
  | 'cancelled'
  | 'overdue'

export type InterLibraryLoanDirection = 'incoming' | 'outgoing'

export interface InterLibraryLoan {
  id: string
  direction: InterLibraryLoanDirection
  partnerLibraryId: string
  partnerLibraryName: string
  bookTitle: string
  bookAuthor: string
  bookIsbn: string
  requestedBy: string // Student or staff name
  requestedById: string
  requestedAt: string
  status: InterLibraryLoanStatus
  approvedAt?: string
  approvedBy?: string
  shippedAt?: string
  receivedAt?: string
  issuedAt?: string
  dueDate?: string
  returnedAt?: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  notes?: string
  trackingNumber?: string
}

export interface CreateInterLibraryLoanRequest {
  direction: InterLibraryLoanDirection
  partnerLibraryId: string
  bookTitle: string
  bookAuthor: string
  bookIsbn: string
  requestedById: string
  notes?: string
}

export interface UpdateInterLibraryLoanRequest {
  status: InterLibraryLoanStatus
  trackingNumber?: string
  notes?: string
  cancellationReason?: string
  dueDate?: string
}

export interface InterLibraryLoanFilters {
  direction?: InterLibraryLoanDirection | 'all'
  status?: InterLibraryLoanStatus | 'all'
  partnerLibraryId?: string
  search?: string
  page?: number
  limit?: number
}

export const INTER_LIBRARY_LOAN_STATUS_LABELS: Record<InterLibraryLoanStatus, string> = {
  requested: 'Requested',
  approved: 'Approved',
  in_transit: 'In Transit',
  received: 'Received',
  issued_to_patron: 'Issued to Patron',
  returned_by_patron: 'Returned by Patron',
  returning: 'Returning',
  completed: 'Completed',
  cancelled: 'Cancelled',
  overdue: 'Overdue',
}

// ==================== READING CHALLENGES / GAMIFICATION TYPES ====================

export type ChallengeType = 'books_count' | 'pages_count' | 'category_diversity' | 'streak' | 'time_based'
export type ChallengeStatus = 'draft' | 'active' | 'completed' | 'cancelled'
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface ReadingChallenge {
  id: string
  title: string
  description: string
  type: ChallengeType
  difficulty: ChallengeDifficulty
  targetValue: number // e.g., 10 books, 500 pages, 5 categories
  rewardPoints: number
  badgeId?: string
  badgeName?: string
  startDate: string
  endDate: string
  status: ChallengeStatus
  targetAudience: 'all' | 'class' | 'section'
  targetClass?: string
  targetSection?: string
  participantCount: number
  completionCount: number
  createdAt: string
  createdBy: string
}

export interface CreateReadingChallengeRequest {
  title: string
  description: string
  type: ChallengeType
  difficulty: ChallengeDifficulty
  targetValue: number
  rewardPoints: number
  badgeId?: string
  startDate: string
  endDate: string
  targetAudience: 'all' | 'class' | 'section'
  targetClass?: string
  targetSection?: string
}

export interface UpdateReadingChallengeRequest extends Partial<CreateReadingChallengeRequest> {
  status?: ChallengeStatus
}

export interface ChallengeProgress {
  id: string
  challengeId: string
  challengeTitle: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  currentValue: number
  targetValue: number
  percentComplete: number
  isCompleted: boolean
  completedAt?: string
  pointsEarned: number
  badgeEarned?: string
  lastUpdatedAt: string
}

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type BadgeCategory = 'reading' | 'challenge' | 'streak' | 'special' | 'achievement'

export interface Badge {
  id: string
  name: string
  description: string
  iconUrl: string
  category: BadgeCategory
  rarity: BadgeRarity
  pointValue: number
  criteria: string
  totalAwarded: number
  createdAt: string
}

export interface StudentBadge {
  id: string
  badgeId: string
  badgeName: string
  badgeIconUrl: string
  badgeRarity: BadgeRarity
  studentId: string
  studentName: string
  earnedAt: string
  challengeId?: string
  challengeTitle?: string
}

export interface StudentGamificationProfile {
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  totalPoints: number
  currentLevel: number
  pointsToNextLevel: number
  totalBooksRead: number
  currentStreak: number
  longestStreak: number
  badgesEarned: StudentBadge[]
  activeChallenges: ChallengeProgress[]
  completedChallenges: ChallengeProgress[]
  rank: number
  rankTitle: string
}

export interface Leaderboard {
  period: 'weekly' | 'monthly' | 'all_time'
  entries: LeaderboardEntry[]
  updatedAt: string
}

export interface LeaderboardEntry {
  rank: number
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  points: number
  booksRead: number
  badgeCount: number
  avatarUrl?: string
}

export const CHALLENGE_TYPE_LABELS: Record<ChallengeType, string> = {
  books_count: 'Books Read',
  pages_count: 'Pages Read',
  category_diversity: 'Category Diversity',
  streak: 'Reading Streak',
  time_based: 'Time-Based',
}

export const CHALLENGE_DIFFICULTY_LABELS: Record<ChallengeDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
}

export const BADGE_RARITY_LABELS: Record<BadgeRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

export const RANK_TITLES: Record<number, string> = {
  1: 'Novice Reader',
  2: 'Bookworm',
  3: 'Page Turner',
  4: 'Story Seeker',
  5: 'Literature Lover',
  6: 'Book Champion',
  7: 'Reading Master',
  8: 'Library Legend',
  9: 'Book Sage',
  10: 'Grand Bibliophile',
}

// ==================== BOOK RECOMMENDATION ENGINE TYPES ====================

export type RecommendationSource =
  | 'reading_history'
  | 'category_preference'
  | 'similar_readers'
  | 'trending'
  | 'new_arrivals'
  | 'teacher_recommended'
  | 'curriculum'

export interface EnhancedBookRecommendation {
  bookId: string
  bookTitle: string
  bookAuthor: string
  bookCategory: BookCategory
  coverUrl: string
  availableCopies: number
  matchScore: number // 0-100
  source: RecommendationSource
  reason: string
  similarReaders?: number // Number of similar readers who read this
  averageRating?: number
  totalRatings?: number
}

export interface ReadingPreference {
  id: string
  studentId: string
  favoriteCategories: BookCategory[]
  favoriteAuthors: string[]
  preferredDifficulty: 'easy' | 'medium' | 'advanced'
  preferredLength: 'short' | 'medium' | 'long'
  interests: string[] // Keywords like "adventure", "mystery", "science"
  excludedCategories: BookCategory[]
  updatedAt: string
}

export interface UpdateReadingPreferenceRequest {
  favoriteCategories?: BookCategory[]
  favoriteAuthors?: string[]
  preferredDifficulty?: 'easy' | 'medium' | 'advanced'
  preferredLength?: 'short' | 'medium' | 'long'
  interests?: string[]
  excludedCategories?: BookCategory[]
}

export interface RecommendationSettings {
  enablePersonalized: boolean
  enableTrending: boolean
  enableNewArrivals: boolean
  enableTeacherRecommended: boolean
  enableCurriculumBased: boolean
  maxRecommendations: number
  refreshIntervalHours: number
}

export const RECOMMENDATION_SOURCE_LABELS: Record<RecommendationSource, string> = {
  reading_history: 'Based on Your Reading History',
  category_preference: 'Based on Your Preferences',
  similar_readers: 'Readers Like You Also Enjoyed',
  trending: 'Trending Now',
  new_arrivals: 'New Arrivals',
  teacher_recommended: 'Teacher Recommended',
  curriculum: 'Curriculum Related',
}

// ==================== E-READER INTEGRATION TYPES ====================

export type EReaderDeviceType = 'kindle' | 'kobo' | 'nook' | 'generic_epub' | 'school_tablet'
export type EReaderDeviceStatus = 'active' | 'inactive' | 'lost' | 'maintenance'

export interface EReaderDevice {
  id: string
  deviceId: string // Device serial number or unique ID
  deviceType: EReaderDeviceType
  deviceName: string
  assignedToId?: string
  assignedToName?: string
  assignedToType?: 'student' | 'staff'
  assignedAt?: string
  status: EReaderDeviceStatus
  lastSyncAt?: string
  batteryLevel?: number
  storageUsedMb?: number
  storageTotalMb?: number
  firmwareVersion?: string
  registeredAt: string
  notes?: string
}

export interface CreateEReaderDeviceRequest {
  deviceId: string
  deviceType: EReaderDeviceType
  deviceName: string
  storageTotalMb?: number
  firmwareVersion?: string
  notes?: string
}

export interface UpdateEReaderDeviceRequest {
  deviceName?: string
  status?: EReaderDeviceStatus
  assignedToId?: string
  assignedToType?: 'student' | 'staff'
  firmwareVersion?: string
  notes?: string
}

export interface AssignEReaderRequest {
  deviceId: string
  assignedToId: string
  assignedToType: 'student' | 'staff'
}

export type EBookLicenseType = 'single_user' | 'multi_user' | 'site_license' | 'perpetual'
export type EBookLicenseStatus = 'active' | 'expired' | 'suspended' | 'pending'

export interface EBookLicense {
  id: string
  digitalBookId: string
  digitalBookTitle: string
  licenseType: EBookLicenseType
  licenseKey: string
  maxConcurrentUsers: number
  currentActiveUsers: number
  purchaseDate: string
  expiryDate?: string
  status: EBookLicenseStatus
  vendor: string
  purchasePrice: number
  notes?: string
}

export interface CreateEBookLicenseRequest {
  digitalBookId: string
  licenseType: EBookLicenseType
  licenseKey: string
  maxConcurrentUsers: number
  purchaseDate: string
  expiryDate?: string
  vendor: string
  purchasePrice: number
  notes?: string
}

export interface UpdateEBookLicenseRequest {
  licenseType?: EBookLicenseType
  maxConcurrentUsers?: number
  expiryDate?: string
  status?: EBookLicenseStatus
  notes?: string
}

export interface EBookCheckout {
  id: string
  licenseId: string
  digitalBookId: string
  digitalBookTitle: string
  userId: string
  userName: string
  userType: 'student' | 'staff'
  deviceId?: string
  deviceName?: string
  checkedOutAt: string
  expiresAt: string
  returnedAt?: string
  isActive: boolean
}

export interface EBookCheckoutRequest {
  licenseId: string
  userId: string
  userType: 'student' | 'staff'
  deviceId?: string
  durationDays?: number
}

export interface EReaderSyncLog {
  id: string
  deviceId: string
  deviceName: string
  syncedAt: string
  booksDownloaded: number
  booksRemoved: number
  readingProgressSynced: number
  status: 'success' | 'partial' | 'failed'
  errorMessage?: string
}

export interface EReaderFilters {
  deviceType?: EReaderDeviceType | 'all'
  status?: EReaderDeviceStatus | 'all'
  assignedToType?: 'student' | 'staff' | 'all'
  search?: string
  page?: number
  limit?: number
}

export interface EBookLicenseFilters {
  licenseType?: EBookLicenseType | 'all'
  status?: EBookLicenseStatus | 'all'
  search?: string
  page?: number
  limit?: number
}

export const EREADER_DEVICE_TYPE_LABELS: Record<EReaderDeviceType, string> = {
  kindle: 'Amazon Kindle',
  kobo: 'Kobo',
  nook: 'Barnes & Noble Nook',
  generic_epub: 'Generic ePub Reader',
  school_tablet: 'School Tablet',
}

export const EREADER_DEVICE_STATUS_LABELS: Record<EReaderDeviceStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  lost: 'Lost',
  maintenance: 'Under Maintenance',
}

export const EBOOK_LICENSE_TYPE_LABELS: Record<EBookLicenseType, string> = {
  single_user: 'Single User',
  multi_user: 'Multi User',
  site_license: 'Site License',
  perpetual: 'Perpetual',
}

export const EBOOK_LICENSE_STATUS_LABELS: Record<EBookLicenseStatus, string> = {
  active: 'Active',
  expired: 'Expired',
  suspended: 'Suspended',
  pending: 'Pending Activation',
}
