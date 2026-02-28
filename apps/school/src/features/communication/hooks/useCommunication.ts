import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAnnouncements,
  fetchAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  acknowledgeAnnouncement,
  fetchConversations,
  fetchMessages,
  sendMessage,
  fetchCirculars,
  fetchCircular,
  createCircular,
  updateCircular,
  deleteCircular,
  fetchSurveys,
  fetchSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  submitSurveyResponse,
  fetchSurveyResponses,
  fetchEmergencyAlerts,
  fetchEmergencyAlert,
  createEmergencyAlert,
  updateEmergencyAlert,
  acknowledgeEmergencyAlert,
  fetchEvents,
  fetchEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  fetchCommunicationStats,
} from '../api/communication.api'
import {
  AnnouncementFilters,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  ConversationFilters,
  SendMessageRequest,
  CircularFilters,
  CreateCircularRequest,
  UpdateCircularRequest,
  SurveyFilters,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  SubmitSurveyResponseRequest,
  EmergencyAlertFilters,
  CreateEmergencyAlertRequest,
  UpdateEmergencyAlertRequest,
  EventFilters,
  CreateEventRequest,
  UpdateEventRequest,
} from '../types/communication.types'

// ===== Query Keys =====
export const communicationKeys = {
  all: ['communication'] as const,
  stats: () => [...communicationKeys.all, 'stats'] as const,
  // Announcements
  announcements: () => [...communicationKeys.all, 'announcements'] as const,
  announcementList: (filters: AnnouncementFilters) =>
    [...communicationKeys.announcements(), 'list', filters] as const,
  announcementDetail: (id: string) =>
    [...communicationKeys.announcements(), 'detail', id] as const,
  // Conversations
  conversations: () => [...communicationKeys.all, 'conversations'] as const,
  conversationList: (filters: ConversationFilters) =>
    [...communicationKeys.conversations(), 'list', filters] as const,
  messages: (conversationId: string) =>
    [...communicationKeys.conversations(), 'messages', conversationId] as const,
  // Circulars
  circulars: () => [...communicationKeys.all, 'circulars'] as const,
  circularList: (filters: CircularFilters) =>
    [...communicationKeys.circulars(), 'list', filters] as const,
  circularDetail: (id: string) =>
    [...communicationKeys.circulars(), 'detail', id] as const,
  // Surveys
  surveys: () => [...communicationKeys.all, 'surveys'] as const,
  surveyList: (filters: SurveyFilters) =>
    [...communicationKeys.surveys(), 'list', filters] as const,
  surveyDetail: (id: string) =>
    [...communicationKeys.surveys(), 'detail', id] as const,
  surveyResponses: (surveyId: string) =>
    [...communicationKeys.surveys(), 'responses', surveyId] as const,
  // Alerts
  alerts: () => [...communicationKeys.all, 'alerts'] as const,
  alertList: (filters: EmergencyAlertFilters) =>
    [...communicationKeys.alerts(), 'list', filters] as const,
  alertDetail: (id: string) =>
    [...communicationKeys.alerts(), 'detail', id] as const,
  // Events
  events: () => [...communicationKeys.all, 'events'] as const,
  eventList: (filters: EventFilters) =>
    [...communicationKeys.events(), 'list', filters] as const,
  eventDetail: (id: string) =>
    [...communicationKeys.events(), 'detail', id] as const,
}

// ===== Stats Hook =====
export function useCommunicationStats() {
  return useQuery({
    queryKey: communicationKeys.stats(),
    queryFn: fetchCommunicationStats,
  })
}

// ===== Announcements Hooks =====
export function useAnnouncements(filters: AnnouncementFilters = {}) {
  return useQuery({
    queryKey: communicationKeys.announcementList(filters),
    queryFn: () => fetchAnnouncements(filters),
  })
}

export function useAnnouncement(id: string) {
  return useQuery({
    queryKey: communicationKeys.announcementDetail(id),
    queryFn: () => fetchAnnouncement(id),
    enabled: !!id,
  })
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAnnouncementRequest) => createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementRequest }) =>
      updateAnnouncement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.announcementDetail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useAcknowledgeAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => acknowledgeAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() })
    },
  })
}

// ===== Conversations & Messages Hooks =====
export function useConversations(filters: ConversationFilters = {}) {
  return useQuery({
    queryKey: communicationKeys.conversationList(filters),
    queryFn: () => fetchConversations(filters),
  })
}

export function useMessages(conversationId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: communicationKeys.messages(conversationId),
    queryFn: () => fetchMessages(conversationId, page, limit),
    enabled: !!conversationId,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendMessageRequest) => sendMessage(data),
    onSuccess: (_, variables) => {
      if (variables.conversationId) {
        queryClient.invalidateQueries({
          queryKey: communicationKeys.messages(variables.conversationId),
        })
      }
      queryClient.invalidateQueries({ queryKey: communicationKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

// ===== Circulars Hooks =====
export function useCirculars(filters: CircularFilters = {}) {
  return useQuery({
    queryKey: communicationKeys.circularList(filters),
    queryFn: () => fetchCirculars(filters),
  })
}

export function useCircular(id: string) {
  return useQuery({
    queryKey: communicationKeys.circularDetail(id),
    queryFn: () => fetchCircular(id),
    enabled: !!id,
  })
}

export function useCreateCircular() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCircularRequest) => createCircular(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.circulars() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useUpdateCircular() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCircularRequest }) =>
      updateCircular(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.circularDetail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: communicationKeys.circulars() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useDeleteCircular() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCircular(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.circulars() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

// ===== Surveys Hooks =====
export function useSurveys(filters: SurveyFilters = {}) {
  return useQuery({
    queryKey: communicationKeys.surveyList(filters),
    queryFn: () => fetchSurveys(filters),
  })
}

export function useSurvey(id: string) {
  return useQuery({
    queryKey: communicationKeys.surveyDetail(id),
    queryFn: () => fetchSurvey(id),
    enabled: !!id,
  })
}

export function useCreateSurvey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSurveyRequest) => createSurvey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.surveys() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useUpdateSurvey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSurveyRequest }) =>
      updateSurvey(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.surveyDetail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: communicationKeys.surveys() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useDeleteSurvey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSurvey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.surveys() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useSubmitSurveyResponse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      surveyId,
      data,
    }: {
      surveyId: string
      data: SubmitSurveyResponseRequest
    }) => submitSurveyResponse(surveyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.surveyDetail(variables.surveyId),
      })
      queryClient.invalidateQueries({
        queryKey: communicationKeys.surveyResponses(variables.surveyId),
      })
    },
  })
}

export function useSurveyResponses(surveyId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: communicationKeys.surveyResponses(surveyId),
    queryFn: () => fetchSurveyResponses(surveyId, page, limit),
    enabled: !!surveyId,
  })
}

// ===== Emergency Alerts Hooks =====
export function useEmergencyAlerts(filters: EmergencyAlertFilters = {}) {
  return useQuery({
    queryKey: communicationKeys.alertList(filters),
    queryFn: () => fetchEmergencyAlerts(filters),
  })
}

export function useEmergencyAlert(id: string) {
  return useQuery({
    queryKey: communicationKeys.alertDetail(id),
    queryFn: () => fetchEmergencyAlert(id),
    enabled: !!id,
  })
}

export function useCreateEmergencyAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEmergencyAlertRequest) => createEmergencyAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.alerts() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useUpdateEmergencyAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmergencyAlertRequest }) =>
      updateEmergencyAlert(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.alertDetail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: communicationKeys.alerts() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useAcknowledgeEmergencyAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { status?: 'safe' | 'need_help'; location?: string }
    }) => acknowledgeEmergencyAlert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.alerts() })
    },
  })
}

// ===== Events Hooks =====
export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: communicationKeys.eventList(filters),
    queryFn: () => fetchEvents(filters),
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: communicationKeys.eventDetail(id),
    queryFn: () => fetchEvent(id),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEventRequest) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.events() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventRequest }) =>
      updateEvent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.eventDetail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: communicationKeys.events() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.events() })
      queryClient.invalidateQueries({ queryKey: communicationKeys.stats() })
    },
  })
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => registerForEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.events() })
    },
  })
}

export function useCancelEventRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelEventRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.events() })
    },
  })
}
