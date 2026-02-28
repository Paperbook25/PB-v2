import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchStudents,
  fetchStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  fetchStudentTimeline,
  fetchStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
  verifyStudentDocument,
  promoteStudents,
  fetchStudentSiblings,
  linkSibling,
  unlinkSibling,
  fetchStudentHealth,
  updateStudentHealth,
  fetchIDCardData,
  bulkImportStudents,
  exportStudents,
  sendParentMessage,
  fetchStudentHostelAllocation,
  fetchStudentAlumniRecord,
  // Portfolio & Skills
  fetchStudentPortfolio,
  updateStudentPortfolio,
  addStudentSkill,
  updateStudentSkill,
  deleteStudentSkill,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  // Learning Style
  fetchLearningStyleAssessments,
  createLearningStyleAssessment,
  fetchLearningPreferences,
  updateLearningPreferences,
  // Risk Indicators
  fetchStudentRiskProfile,
  createRiskIndicator,
  updateRiskIndicator,
  addRiskIntervention,
  updateRiskIntervention,
  fetchAtRiskStudents,
  // Graduation
  fetchGraduationProgress,
  updateGraduationProgress,
  fetchPromotionHistory,
  fetchGraduationDashboard,
  // Teacher Relationships
  fetchStudentTeacherRelationships,
  addStudentTeacherRelationship,
  updateStudentTeacherRelationship,
  fetchTeacherFeedback,
  createTeacherFeedback,
  fetchMentorship,
  updateMentorship,
  addMentorshipSession,
} from '../api/students.api'
import type {
  StudentFilters,
  CreateStudentRequest,
  UpdateStudentRequest,
  PromotionRequest,
  StudentHealthRecord,
  StudentPortfolio,
  StudentSkill,
  PortfolioItem,
  LearningStyleAssessment,
  LearningPreferences,
  RiskIndicator,
  RiskIntervention,
  StudentGraduationProgress,
  StudentTeacherRelationship,
  TeacherFeedback,
  MentorshipRecord,
} from '../types/student.types'

// ==================== QUERY KEYS ====================

export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters: StudentFilters) => [...studentKeys.lists(), filters] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
  timeline: (id: string) => [...studentKeys.all, 'timeline', id] as const,
  documents: (id: string) => [...studentKeys.all, 'documents', id] as const,
  siblings: (id: string) => [...studentKeys.all, 'siblings', id] as const,
  health: (id: string) => [...studentKeys.all, 'health', id] as const,
  idCard: (id: string) => [...studentKeys.all, 'id-card', id] as const,
  hostelAllocation: (id: string) => [...studentKeys.all, 'hostel-allocation', id] as const,
  alumniRecord: (id: string) => [...studentKeys.all, 'alumni-record', id] as const,
  // New keys for enhanced features
  portfolio: (id: string) => [...studentKeys.all, 'portfolio', id] as const,
  learningStyle: (id: string) => [...studentKeys.all, 'learning-style', id] as const,
  learningPreferences: (id: string) => [...studentKeys.all, 'learning-preferences', id] as const,
  riskProfile: (id: string) => [...studentKeys.all, 'risk-profile', id] as const,
  atRisk: (filters?: { level?: string; category?: string }) => [...studentKeys.all, 'at-risk', filters] as const,
  graduationProgress: (id: string) => [...studentKeys.all, 'graduation-progress', id] as const,
  promotionHistory: (id: string) => [...studentKeys.all, 'promotion-history', id] as const,
  graduationDashboard: (filters?: { class?: string; year?: string }) => [...studentKeys.all, 'graduation-dashboard', filters] as const,
  teacherRelationships: (id: string) => [...studentKeys.all, 'teacher-relationships', id] as const,
  teacherFeedback: (id: string, filters?: { term?: string; academicYear?: string }) => [...studentKeys.all, 'teacher-feedback', id, filters] as const,
  mentorship: (id: string) => [...studentKeys.all, 'mentorship', id] as const,
}

// ==================== QUERY HOOKS ====================

export function useStudents(filters: StudentFilters = {}) {
  return useQuery({
    queryKey: studentKeys.list(filters),
    queryFn: () => fetchStudents(filters),
  })
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => fetchStudent(id),
    enabled: !!id,
  })
}

export function useStudentTimeline(id: string) {
  return useQuery({
    queryKey: studentKeys.timeline(id),
    queryFn: () => fetchStudentTimeline(id),
    enabled: !!id,
  })
}

export function useStudentDocuments(id: string) {
  return useQuery({
    queryKey: studentKeys.documents(id),
    queryFn: () => fetchStudentDocuments(id),
    enabled: !!id,
  })
}

export function useStudentSiblings(id: string) {
  return useQuery({
    queryKey: studentKeys.siblings(id),
    queryFn: () => fetchStudentSiblings(id),
    enabled: !!id,
  })
}

export function useStudentHealth(id: string) {
  return useQuery({
    queryKey: studentKeys.health(id),
    queryFn: () => fetchStudentHealth(id),
    enabled: !!id,
  })
}

export function useIDCardData(id: string) {
  return useQuery({
    queryKey: studentKeys.idCard(id),
    queryFn: () => fetchIDCardData(id),
    enabled: !!id,
  })
}

// ==================== MUTATION HOOKS ====================

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStudentRequest) => createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentRequest }) =>
      updateStudent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
    },
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string
      data: { type: string; name: string; fileName: string; fileSize: number; mimeType: string }
    }) => uploadStudentDocument(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.documents(variables.studentId) })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, docId }: { studentId: string; docId: string }) =>
      deleteStudentDocument(studentId, docId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.documents(variables.studentId) })
    },
  })
}

export function useVerifyDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, docId }: { studentId: string; docId: string }) =>
      verifyStudentDocument(studentId, docId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.documents(variables.studentId) })
    },
  })
}

export function usePromoteStudents() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PromotionRequest) => promoteStudents(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}

export function useLinkSibling() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, siblingId }: { studentId: string; siblingId: string }) =>
      linkSibling(studentId, siblingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.siblings(variables.studentId) })
      queryClient.invalidateQueries({ queryKey: studentKeys.siblings(variables.siblingId) })
    },
  })
}

export function useUnlinkSibling() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, siblingId }: { studentId: string; siblingId: string }) =>
      unlinkSibling(studentId, siblingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.siblings(variables.studentId) })
      queryClient.invalidateQueries({ queryKey: studentKeys.siblings(variables.siblingId) })
    },
  })
}

export function useUpdateHealth() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StudentHealthRecord }) =>
      updateStudentHealth(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.health(variables.id) })
    },
  })
}

export function useBulkImport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rows: Record<string, string>[]) => bulkImportStudents(rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
    },
  })
}

export function useExportStudents() {
  return useMutation({
    mutationFn: (filters?: { class?: string; section?: string }) => exportStudents(filters),
  })
}

export function useSendParentMessage() {
  return useMutation({
    mutationFn: ({
      studentId,
      ...data
    }: {
      studentId: string
      channel: 'sms' | 'email' | 'whatsapp' | 'all'
      subject?: string
      message: string
    }) => sendParentMessage(studentId, data),
  })
}

// ==================== CROSS-MODULE HOOKS ====================

export function useStudentHostelAllocation(studentId: string) {
  return useQuery({
    queryKey: studentKeys.hostelAllocation(studentId),
    queryFn: () => fetchStudentHostelAllocation(studentId),
    enabled: !!studentId,
  })
}

export function useStudentAlumniRecord(studentId: string) {
  return useQuery({
    queryKey: studentKeys.alumniRecord(studentId),
    queryFn: () => fetchStudentAlumniRecord(studentId),
    enabled: !!studentId,
  })
}

// ==================== PORTFOLIO & SKILLS HOOKS ====================

export function useStudentPortfolio(studentId: string) {
  return useQuery({
    queryKey: studentKeys.portfolio(studentId),
    queryFn: () => fetchStudentPortfolio(studentId),
    enabled: !!studentId,
  })
}

export function useUpdateStudentPortfolio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: Partial<StudentPortfolio> }) =>
      updateStudentPortfolio(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.portfolio(variables.studentId) })
    },
  })
}

export function useAddStudentSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      skill,
    }: {
      studentId: string
      skill: Omit<StudentSkill, 'id' | 'studentId'>
    }) => addStudentSkill(studentId, skill),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.portfolio(variables.studentId) })
    },
  })
}

export function useUpdateStudentSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      skillId,
      data,
    }: {
      studentId: string
      skillId: string
      data: Partial<StudentSkill>
    }) => updateStudentSkill(studentId, skillId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.portfolio(variables.studentId) })
    },
  })
}

export function useDeleteStudentSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, skillId }: { studentId: string; skillId: string }) =>
      deleteStudentSkill(studentId, skillId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.portfolio(variables.studentId) })
    },
  })
}

export function useAddPortfolioItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      item,
    }: {
      studentId: string
      item: Omit<PortfolioItem, 'id' | 'studentId'>
    }) => addPortfolioItem(studentId, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.portfolio(variables.studentId) })
    },
  })
}

export function useUpdatePortfolioItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      itemId,
      data,
    }: {
      studentId: string
      itemId: string
      data: Partial<PortfolioItem>
    }) => updatePortfolioItem(studentId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.portfolio(variables.studentId) })
    },
  })
}

export function useDeletePortfolioItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, itemId }: { studentId: string; itemId: string }) =>
      deletePortfolioItem(studentId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.portfolio(variables.studentId) })
    },
  })
}

// ==================== LEARNING STYLE HOOKS ====================

export function useLearningStyleAssessments(studentId: string) {
  return useQuery({
    queryKey: studentKeys.learningStyle(studentId),
    queryFn: () => fetchLearningStyleAssessments(studentId),
    enabled: !!studentId,
  })
}

export function useCreateLearningStyleAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string
      data: Omit<LearningStyleAssessment, 'id' | 'studentId'>
    }) => createLearningStyleAssessment(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.learningStyle(variables.studentId) })
    },
  })
}

export function useLearningPreferences(studentId: string) {
  return useQuery({
    queryKey: studentKeys.learningPreferences(studentId),
    queryFn: () => fetchLearningPreferences(studentId),
    enabled: !!studentId,
  })
}

export function useUpdateLearningPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string
      data: Omit<LearningPreferences, 'studentId'>
    }) => updateLearningPreferences(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.learningPreferences(variables.studentId) })
    },
  })
}

// ==================== RISK INDICATORS HOOKS ====================

export function useStudentRiskProfile(studentId: string) {
  return useQuery({
    queryKey: studentKeys.riskProfile(studentId),
    queryFn: () => fetchStudentRiskProfile(studentId),
    enabled: !!studentId,
  })
}

export function useCreateRiskIndicator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string
      data: Omit<RiskIndicator, 'id' | 'studentId' | 'interventions'>
    }) => createRiskIndicator(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.riskProfile(variables.studentId) })
      queryClient.invalidateQueries({ queryKey: studentKeys.atRisk() })
    },
  })
}

export function useUpdateRiskIndicator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      indicatorId,
      data,
    }: {
      studentId: string
      indicatorId: string
      data: Partial<RiskIndicator>
    }) => updateRiskIndicator(studentId, indicatorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.riskProfile(variables.studentId) })
      queryClient.invalidateQueries({ queryKey: studentKeys.atRisk() })
    },
  })
}

export function useAddRiskIntervention() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      indicatorId,
      data,
    }: {
      studentId: string
      indicatorId: string
      data: Omit<RiskIntervention, 'id' | 'riskId'>
    }) => addRiskIntervention(studentId, indicatorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.riskProfile(variables.studentId) })
    },
  })
}

export function useUpdateRiskIntervention() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      indicatorId,
      interventionId,
      data,
    }: {
      studentId: string
      indicatorId: string
      interventionId: string
      data: Partial<RiskIntervention>
    }) => updateRiskIntervention(studentId, indicatorId, interventionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.riskProfile(variables.studentId) })
    },
  })
}

export function useAtRiskStudents(filters?: { level?: string; category?: string }) {
  return useQuery({
    queryKey: studentKeys.atRisk(filters),
    queryFn: () => fetchAtRiskStudents(filters),
  })
}

// ==================== GRADUATION & PROMOTION HOOKS ====================

export function useGraduationProgress(studentId: string) {
  return useQuery({
    queryKey: studentKeys.graduationProgress(studentId),
    queryFn: () => fetchGraduationProgress(studentId),
    enabled: !!studentId,
  })
}

export function useUpdateGraduationProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string
      data: Partial<StudentGraduationProgress>
    }) => updateGraduationProgress(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.graduationProgress(variables.studentId) })
      queryClient.invalidateQueries({ queryKey: studentKeys.graduationDashboard() })
    },
  })
}

export function usePromotionHistory(studentId: string) {
  return useQuery({
    queryKey: studentKeys.promotionHistory(studentId),
    queryFn: () => fetchPromotionHistory(studentId),
    enabled: !!studentId,
  })
}

export function useGraduationDashboard(filters?: { class?: string; year?: string }) {
  return useQuery({
    queryKey: studentKeys.graduationDashboard(filters),
    queryFn: () => fetchGraduationDashboard(filters),
  })
}

// ==================== TEACHER RELATIONSHIPS HOOKS ====================

export function useStudentTeacherRelationships(studentId: string) {
  return useQuery({
    queryKey: studentKeys.teacherRelationships(studentId),
    queryFn: () => fetchStudentTeacherRelationships(studentId),
    enabled: !!studentId,
  })
}

export function useAddStudentTeacherRelationship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string
      data: Omit<StudentTeacherRelationship, 'id' | 'studentId'>
    }) => addStudentTeacherRelationship(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.teacherRelationships(variables.studentId) })
    },
  })
}

export function useUpdateStudentTeacherRelationship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      relationshipId,
      data,
    }: {
      studentId: string
      relationshipId: string
      data: Partial<StudentTeacherRelationship>
    }) => updateStudentTeacherRelationship(studentId, relationshipId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.teacherRelationships(variables.studentId) })
    },
  })
}

export function useTeacherFeedback(
  studentId: string,
  filters?: { term?: string; academicYear?: string }
) {
  return useQuery({
    queryKey: studentKeys.teacherFeedback(studentId, filters),
    queryFn: () => fetchTeacherFeedback(studentId, filters),
    enabled: !!studentId,
  })
}

export function useCreateTeacherFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string
      data: Omit<TeacherFeedback, 'id' | 'studentId'>
    }) => createTeacherFeedback(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.teacherFeedback(variables.studentId) })
    },
  })
}

export function useMentorship(studentId: string) {
  return useQuery({
    queryKey: studentKeys.mentorship(studentId),
    queryFn: () => fetchMentorship(studentId),
    enabled: !!studentId,
  })
}

export function useUpdateMentorship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string
      data: Partial<MentorshipRecord>
    }) => updateMentorship(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.mentorship(variables.studentId) })
    },
  })
}

export function useAddMentorshipSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      session,
    }: {
      studentId: string
      session: MentorshipRecord['sessions'][0]
    }) => addMentorshipSession(studentId, session),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.mentorship(variables.studentId) })
    },
  })
}
