import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchTimetableStats,
  fetchPeriodDefinitions,
  updatePeriodDefinition,
  fetchSubjects,
  fetchRooms,
  fetchTimetables,
  fetchTimetable,
  createTimetable,
  updateTimetable,
  publishTimetable,
  deleteTimetable,
  createTimetableEntry,
  deleteTimetableEntry,
  fetchTeacherTimetable,
  fetchRoomTimetable,
  fetchSubstitutions,
  createSubstitution,
  approveSubstitution,
  rejectSubstitution,
  deleteSubstitution,
} from '../api/timetable.api'
import type {
  TimetableFilters,
  SubstitutionFilters,
  CreateTimetableRequest,
  CreateTimetableEntryRequest,
  CreateSubstitutionRequest,
  UpdatePeriodDefinitionRequest,
  Timetable,
} from '../types/timetable.types'

// ==================== QUERY KEYS ====================

export const timetableKeys = {
  all: ['timetable'] as const,
  stats: () => [...timetableKeys.all, 'stats'] as const,
  periods: () => [...timetableKeys.all, 'periods'] as const,
  subjects: () => [...timetableKeys.all, 'subjects'] as const,
  rooms: () => [...timetableKeys.all, 'rooms'] as const,
  timetables: () => [...timetableKeys.all, 'timetables'] as const,
  timetableList: (filters: TimetableFilters) => [...timetableKeys.timetables(), 'list', filters] as const,
  timetableDetail: (id: string) => [...timetableKeys.timetables(), 'detail', id] as const,
  teacherTimetable: (teacherId: string) => [...timetableKeys.all, 'teacher', teacherId] as const,
  roomTimetable: (roomId: string) => [...timetableKeys.all, 'room', roomId] as const,
  substitutions: () => [...timetableKeys.all, 'substitutions'] as const,
  substitutionList: (filters: SubstitutionFilters) => [...timetableKeys.substitutions(), 'list', filters] as const,
}

// ==================== STATS ====================

export function useTimetableStats() {
  return useQuery({
    queryKey: timetableKeys.stats(),
    queryFn: fetchTimetableStats,
  })
}

// ==================== PERIOD DEFINITIONS ====================

export function usePeriodDefinitions() {
  return useQuery({
    queryKey: timetableKeys.periods(),
    queryFn: fetchPeriodDefinitions,
  })
}

export function useUpdatePeriodDefinition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePeriodDefinitionRequest }) =>
      updatePeriodDefinition(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.periods() }),
  })
}

// ==================== SUBJECTS ====================

export function useSubjects() {
  return useQuery({
    queryKey: timetableKeys.subjects(),
    queryFn: fetchSubjects,
  })
}

// ==================== ROOMS ====================

export function useRooms() {
  return useQuery({
    queryKey: timetableKeys.rooms(),
    queryFn: fetchRooms,
  })
}

// ==================== TIMETABLES ====================

export function useTimetables(filters: TimetableFilters = {}) {
  return useQuery({
    queryKey: timetableKeys.timetableList(filters),
    queryFn: () => fetchTimetables(filters),
  })
}

export function useTimetable(id: string) {
  return useQuery({
    queryKey: timetableKeys.timetableDetail(id),
    queryFn: () => fetchTimetable(id),
    enabled: !!id,
  })
}

export function useCreateTimetable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTimetableRequest) => createTimetable(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.timetables() }),
  })
}

export function useUpdateTimetable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Timetable> }) => updateTimetable(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.timetables() }),
  })
}

export function usePublishTimetable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => publishTimetable(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: timetableKeys.timetables() })
      qc.invalidateQueries({ queryKey: timetableKeys.stats() })
    },
  })
}

export function useDeleteTimetable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTimetable(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: timetableKeys.timetables() })
      qc.invalidateQueries({ queryKey: timetableKeys.stats() })
    },
  })
}

// ==================== TIMETABLE ENTRIES ====================

export function useCreateTimetableEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ timetableId, data }: { timetableId: string; data: Omit<CreateTimetableEntryRequest, 'timetableId'> }) =>
      createTimetableEntry(timetableId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.timetables() }),
  })
}

export function useDeleteTimetableEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTimetableEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.timetables() }),
  })
}

// ==================== TEACHER TIMETABLE ====================

export function useTeacherTimetable(teacherId: string) {
  return useQuery({
    queryKey: timetableKeys.teacherTimetable(teacherId),
    queryFn: () => fetchTeacherTimetable(teacherId),
    enabled: !!teacherId,
  })
}

// ==================== ROOM TIMETABLE ====================

export function useRoomTimetable(roomId: string) {
  return useQuery({
    queryKey: timetableKeys.roomTimetable(roomId),
    queryFn: () => fetchRoomTimetable(roomId),
    enabled: !!roomId,
  })
}

// ==================== SUBSTITUTIONS ====================

export function useSubstitutions(filters: SubstitutionFilters = {}) {
  return useQuery({
    queryKey: timetableKeys.substitutionList(filters),
    queryFn: () => fetchSubstitutions(filters),
  })
}

export function useCreateSubstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSubstitutionRequest) => createSubstitution(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: timetableKeys.substitutions() })
      qc.invalidateQueries({ queryKey: timetableKeys.stats() })
    },
  })
}

export function useApproveSubstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => approveSubstitution(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: timetableKeys.substitutions() })
      qc.invalidateQueries({ queryKey: timetableKeys.stats() })
    },
  })
}

export function useRejectSubstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rejectSubstitution(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.substitutions() }),
  })
}

export function useDeleteSubstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSubstitution(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: timetableKeys.substitutions() })
      qc.invalidateQueries({ queryKey: timetableKeys.stats() })
    },
  })
}
