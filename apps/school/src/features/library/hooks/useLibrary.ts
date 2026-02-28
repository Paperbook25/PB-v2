import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchMyIssuedBooks,
  fetchMyChildrenBooks,
  fetchMyLibraryFines,
  fetchBooks,
  fetchBook,
  createBook,
  updateBook,
  deleteBook,
  fetchIssuedBooks,
  issueBook,
  returnBook,
  renewBook,
  fetchFines,
  updateFine,
  deleteFine,
  fetchLibraryStats,
  fetchAvailableStudents,
  fetchReservations,
  createReservation,
  cancelReservation,
  fetchReadingHistory,
  fetchStudentReadingReport,
  fetchBookRecommendations,
  fetchDigitalBooks,
  recordDigitalAccess,
  fetchOverdueNotifications,
  fetchNotificationConfig,
  updateNotificationConfig,
  sendOverdueNotification,
  scanBarcode,
} from '../api/library.api'
import type {
  BookFilters,
  CreateBookRequest,
  UpdateBookRequest,
  IssuedBookFilters,
  IssueBookRequest,
  FineFilters,
  UpdateFineRequest,
  CreateReservationRequest,
  DigitalBookFilters,
  NotificationConfig,
} from '../types/library.types'

// ==================== QUERY KEYS ====================

export const libraryKeys = {
  all: ['library'] as const,
  // User-scoped
  myBooks: () => [...libraryKeys.all, 'my-books'] as const,
  myChildrenBooks: () => [...libraryKeys.all, 'my-children-books'] as const,
  myFines: () => [...libraryKeys.all, 'my-fines'] as const,
  // Books
  books: () => [...libraryKeys.all, 'books'] as const,
  bookList: (filters: BookFilters) => [...libraryKeys.books(), 'list', filters] as const,
  bookDetail: (id: string) => [...libraryKeys.books(), 'detail', id] as const,
  issued: () => [...libraryKeys.all, 'issued'] as const,
  issuedList: (filters: IssuedBookFilters) => [...libraryKeys.issued(), 'list', filters] as const,
  fines: () => [...libraryKeys.all, 'fines'] as const,
  fineList: (filters: FineFilters) => [...libraryKeys.fines(), 'list', filters] as const,
  stats: () => [...libraryKeys.all, 'stats'] as const,
  students: (search?: string) => [...libraryKeys.all, 'students', search] as const,
  // New keys
  reservations: () => [...libraryKeys.all, 'reservations'] as const,
  reservationList: (filters: Record<string, unknown>) => [...libraryKeys.reservations(), 'list', filters] as const,
  readingHistory: () => [...libraryKeys.all, 'reading-history'] as const,
  readingHistoryList: (filters: Record<string, unknown>) => [...libraryKeys.readingHistory(), 'list', filters] as const,
  readingReport: (studentId: string) => [...libraryKeys.all, 'reading-report', studentId] as const,
  recommendations: (studentId: string) => [...libraryKeys.all, 'recommendations', studentId] as const,
  digitalBooks: () => [...libraryKeys.all, 'digital'] as const,
  digitalBookList: (filters: DigitalBookFilters) => [...libraryKeys.digitalBooks(), 'list', filters] as const,
  notifications: () => [...libraryKeys.all, 'notifications'] as const,
  notificationList: (filters: Record<string, unknown>) => [...libraryKeys.notifications(), 'list', filters] as const,
  notificationConfig: () => [...libraryKeys.all, 'notification-config'] as const,
  barcodeScan: (isbn: string) => [...libraryKeys.all, 'scan', isbn] as const,
}

// ==================== USER-SCOPED HOOKS ====================

export function useMyIssuedBooks() {
  return useQuery({
    queryKey: libraryKeys.myBooks(),
    queryFn: fetchMyIssuedBooks,
  })
}

export function useMyChildrenBooks() {
  return useQuery({
    queryKey: libraryKeys.myChildrenBooks(),
    queryFn: fetchMyChildrenBooks,
  })
}

export function useMyLibraryFines() {
  return useQuery({
    queryKey: libraryKeys.myFines(),
    queryFn: fetchMyLibraryFines,
  })
}

// ==================== BOOKS HOOKS ====================

export function useBooks(filters: BookFilters = {}) {
  return useQuery({
    queryKey: libraryKeys.bookList(filters),
    queryFn: () => fetchBooks(filters),
  })
}

export function useBook(id: string) {
  return useQuery({
    queryKey: libraryKeys.bookDetail(id),
    queryFn: () => fetchBook(id),
    enabled: !!id,
  })
}

export function useCreateBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBookRequest) => createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats() })
    },
  })
}

export function useUpdateBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookRequest }) => updateBook(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.bookDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats() })
    },
  })
}

export function useDeleteBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats() })
    },
  })
}

// ==================== ISSUED BOOKS HOOKS ====================

export function useIssuedBooks(filters: IssuedBookFilters = {}) {
  return useQuery({
    queryKey: libraryKeys.issuedList(filters),
    queryFn: () => fetchIssuedBooks(filters),
  })
}

export function useIssueBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IssueBookRequest) => issueBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.issued() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats() })
    },
  })
}

export function useReturnBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (issuedBookId: string) => returnBook(issuedBookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.issued() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.fines() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats() })
    },
  })
}

export function useRenewBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ issuedBookId, newDueDate }: { issuedBookId: string; newDueDate?: string }) =>
      renewBook(issuedBookId, newDueDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.issued() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.myBooks() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.myChildrenBooks() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats() })
    },
  })
}

// ==================== FINES HOOKS ====================

export function useFines(filters: FineFilters = {}) {
  return useQuery({
    queryKey: libraryKeys.fineList(filters),
    queryFn: () => fetchFines(filters),
  })
}

export function useUpdateFine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFineRequest }) => updateFine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.fines() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats() })
    },
  })
}

export function useDeleteFine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteFine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.fines() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.stats() })
    },
  })
}

// ==================== STATS & UTILITY HOOKS ====================

export function useLibraryStats() {
  return useQuery({
    queryKey: libraryKeys.stats(),
    queryFn: fetchLibraryStats,
  })
}

export function useAvailableStudents(search?: string) {
  return useQuery({
    queryKey: libraryKeys.students(search),
    queryFn: () => fetchAvailableStudents(search),
  })
}

// ==================== RESERVATION HOOKS ====================

export function useReservations(filters: { search?: string; status?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: libraryKeys.reservationList(filters),
    queryFn: () => fetchReservations(filters),
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateReservationRequest) => createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.reservations() })
      queryClient.invalidateQueries({ queryKey: libraryKeys.books() })
    },
  })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.reservations() })
    },
  })
}

// ==================== READING HISTORY HOOKS ====================

export function useReadingHistory(filters: { studentId?: string; category?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: libraryKeys.readingHistoryList(filters),
    queryFn: () => fetchReadingHistory(filters),
  })
}

export function useStudentReadingReport(studentId: string) {
  return useQuery({
    queryKey: libraryKeys.readingReport(studentId),
    queryFn: () => fetchStudentReadingReport(studentId),
    enabled: !!studentId,
  })
}

export function useBookRecommendations(studentId: string) {
  return useQuery({
    queryKey: libraryKeys.recommendations(studentId),
    queryFn: () => fetchBookRecommendations(studentId),
    enabled: !!studentId,
  })
}

// ==================== DIGITAL LIBRARY HOOKS ====================

export function useDigitalBooks(filters: DigitalBookFilters = {}) {
  return useQuery({
    queryKey: libraryKeys.digitalBookList(filters),
    queryFn: () => fetchDigitalBooks(filters),
  })
}

export function useRecordDigitalAccess() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recordDigitalAccess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.digitalBooks() })
    },
  })
}

// ==================== NOTIFICATION HOOKS ====================

export function useOverdueNotifications(filters: { channel?: string; status?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: libraryKeys.notificationList(filters),
    queryFn: () => fetchOverdueNotifications(filters),
  })
}

export function useNotificationConfig() {
  return useQuery({
    queryKey: libraryKeys.notificationConfig(),
    queryFn: fetchNotificationConfig,
  })
}

export function useUpdateNotificationConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<NotificationConfig>) => updateNotificationConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.notificationConfig() })
    },
  })
}

export function useSendOverdueNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ issuedBookId, channel }: { issuedBookId: string; channel: string }) =>
      sendOverdueNotification(issuedBookId, channel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.notifications() })
    },
  })
}

// ==================== BARCODE HOOKS ====================

export function useBarcodeScan(isbn: string) {
  return useQuery({
    queryKey: libraryKeys.barcodeScan(isbn),
    queryFn: () => scanBarcode(isbn),
    enabled: !!isbn && isbn.length >= 10,
  })
}
