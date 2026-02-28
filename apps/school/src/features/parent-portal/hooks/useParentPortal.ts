import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchParentPortalStats,
  fetchConversations,
  fetchConversation,
  createConversation,
  fetchMessages,
  sendMessage,
  markMessageAsRead,
  markConversationAsRead,
  fetchMeetings,
  fetchMeeting,
  scheduleMeeting,
  updateMeeting,
  confirmMeeting,
  cancelMeeting,
  completeMeeting,
  deleteMeeting,
  fetchPTMSlots,
  bookPTMSlot,
  fetchProgressReports,
  fetchProgressReport,
} from '../api/parent-portal.api'
import type {
  ConversationFilters,
  MeetingFilters,
  ScheduleMeetingRequest,
  UpdateMeetingRequest,
  BookPTMSlotRequest,
  Conversation,
} from '../types/parent-portal.types'

// ==================== QUERY KEYS ====================

export const parentPortalKeys = {
  all: ['parent-portal'] as const,
  stats: (parentId?: string) => [...parentPortalKeys.all, 'stats', parentId] as const,
  conversations: () => [...parentPortalKeys.all, 'conversations'] as const,
  conversationList: (filters: ConversationFilters) => [...parentPortalKeys.conversations(), 'list', filters] as const,
  conversationDetail: (id: string) => [...parentPortalKeys.conversations(), 'detail', id] as const,
  messages: (convId: string) => [...parentPortalKeys.all, 'messages', convId] as const,
  messageList: (convId: string, page: number) => [...parentPortalKeys.messages(convId), 'list', page] as const,
  meetings: () => [...parentPortalKeys.all, 'meetings'] as const,
  meetingList: (filters: MeetingFilters) => [...parentPortalKeys.meetings(), 'list', filters] as const,
  meetingDetail: (id: string) => [...parentPortalKeys.meetings(), 'detail', id] as const,
  ptmSlots: (params: { teacherId?: string; date?: string }) => [...parentPortalKeys.all, 'ptm-slots', params] as const,
  progressReports: (studentId?: string) => [...parentPortalKeys.all, 'progress-reports', studentId] as const,
  progressReportDetail: (id: string) => [...parentPortalKeys.all, 'progress-report', id] as const,
}

// ==================== STATS ====================

export function useParentPortalStats(parentId?: string) {
  return useQuery({
    queryKey: parentPortalKeys.stats(parentId),
    queryFn: () => fetchParentPortalStats(parentId),
  })
}

// ==================== CONVERSATIONS ====================

export function useConversations(filters: ConversationFilters = {}) {
  return useQuery({
    queryKey: parentPortalKeys.conversationList(filters),
    queryFn: () => fetchConversations(filters),
  })
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: parentPortalKeys.conversationDetail(id),
    queryFn: () => fetchConversation(id),
    enabled: !!id,
  })
}

export function useCreateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof createConversation>[0]) => createConversation(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentPortalKeys.conversations() }),
  })
}

// ==================== MESSAGES ====================

export function useMessages(conversationId: string, page = 1) {
  return useQuery({
    queryKey: parentPortalKeys.messageList(conversationId, page),
    queryFn: () => fetchMessages(conversationId, page),
    enabled: !!conversationId,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: Parameters<typeof sendMessage>[1] }) =>
      sendMessage(conversationId, data),
    onSuccess: (_, { conversationId }) => {
      qc.invalidateQueries({ queryKey: parentPortalKeys.messages(conversationId) })
      qc.invalidateQueries({ queryKey: parentPortalKeys.conversations() })
    },
  })
}

export function useMarkMessageAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (messageId: string) => markMessageAsRead(messageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentPortalKeys.conversations() })
      qc.invalidateQueries({ queryKey: parentPortalKeys.stats() })
    },
  })
}

export function useMarkConversationAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => markConversationAsRead(conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentPortalKeys.conversations() })
      qc.invalidateQueries({ queryKey: parentPortalKeys.stats() })
    },
  })
}

// ==================== MEETINGS ====================

export function useMeetings(filters: MeetingFilters = {}) {
  return useQuery({
    queryKey: parentPortalKeys.meetingList(filters),
    queryFn: () => fetchMeetings(filters),
  })
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: parentPortalKeys.meetingDetail(id),
    queryFn: () => fetchMeeting(id),
    enabled: !!id,
  })
}

export function useScheduleMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof scheduleMeeting>[0]) => scheduleMeeting(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentPortalKeys.meetings() })
      qc.invalidateQueries({ queryKey: parentPortalKeys.stats() })
    },
  })
}

export function useUpdateMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMeetingRequest }) => updateMeeting(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentPortalKeys.meetings() }),
  })
}

export function useConfirmMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => confirmMeeting(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentPortalKeys.meetings() }),
  })
}

export function useCancelMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelMeeting(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentPortalKeys.meetings() })
      qc.invalidateQueries({ queryKey: parentPortalKeys.stats() })
    },
  })
}

export function useCompleteMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, teacherNotes }: { id: string; teacherNotes?: string }) => completeMeeting(id, teacherNotes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentPortalKeys.meetings() })
      qc.invalidateQueries({ queryKey: parentPortalKeys.stats() })
    },
  })
}

export function useDeleteMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMeeting(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentPortalKeys.meetings() })
      qc.invalidateQueries({ queryKey: parentPortalKeys.stats() })
    },
  })
}

// ==================== PTM SLOTS ====================

export function usePTMSlots(params: { teacherId?: string; date?: string; availableOnly?: boolean } = {}) {
  return useQuery({
    queryKey: parentPortalKeys.ptmSlots(params),
    queryFn: () => fetchPTMSlots(params),
  })
}

export function useBookPTMSlot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slotId, data }: { slotId: string; data: Parameters<typeof bookPTMSlot>[1] }) =>
      bookPTMSlot(slotId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentPortalKeys.all })
    },
  })
}

// ==================== PROGRESS REPORTS ====================

export function useProgressReports(studentId?: string) {
  return useQuery({
    queryKey: parentPortalKeys.progressReports(studentId),
    queryFn: () => fetchProgressReports(studentId),
  })
}

export function useProgressReport(id: string) {
  return useQuery({
    queryKey: parentPortalKeys.progressReportDetail(id),
    queryFn: () => fetchProgressReport(id),
    enabled: !!id,
  })
}
