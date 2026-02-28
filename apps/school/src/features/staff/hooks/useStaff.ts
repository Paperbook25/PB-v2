import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchStaff,
  fetchStaffMember,
  createStaff,
  updateStaff,
  deleteStaff,
  fetchDailyAttendance,
  saveAttendance,
  fetchStaffAttendance,
  fetchAttendanceSummary,
  fetchLeaveBalance,
  fetchAllLeaveRequests,
  fetchStaffLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  fetchSalaryStructure,
  updateSalaryStructure,
  fetchSalarySlips,
  processMonthlySalary,
  markSalaryPaid,
  fetchStaffTimetable,
  fetchClassTimetable,
  createTimetableEntry,
  deleteTimetableEntry,
  fetchSubstitutions,
  createSubstitution,
  updateSubstitutionStatus,
  fetchPerformanceReviews,
  fetchStaffPerformanceReviews,
  createPerformanceReview,
  acknowledgeReview,
  fetchStaffPD,
  fetchAllPD,
  createPD,
  updatePD,
  deletePD,
  bulkImportStaff,
  // New imports for enhanced features
  fetchPayrollDeductions,
  createPayrollDeduction,
  updatePayrollDeduction,
  fetchEmployeeBenefits,
  createEmployeeBenefit,
  updateEmployeeBenefit,
  fetchLoanAdvances,
  createLoanAdvance,
  updateLoanAdvance,
  fetchTimeOffAccrual,
  adjustTimeOff,
  fetchOnboardingTasks,
  fetchOnboardingChecklists,
  fetchStaffOnboarding,
  createOnboardingChecklist,
  updateOnboardingTask,
  fetchExitInterviews,
  fetchStaffExitInterview,
  createExitInterview,
  updateExitInterview,
  updateClearanceStatus,
  fetchStaffSkills,
  createStaffSkill,
  updateStaffSkill,
  deleteStaffSkill,
  fetchCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  fetchCertificationExpiryAlerts,
  fetchSkillGaps,
  fetchSkillsMatrix,
  fetchWorkSchedulePreference,
  updateWorkSchedulePreference,
  requestScheduleChange,
  approveScheduleChange,
  fetchShiftSchedules,
  createShiftSchedule,
  updateShiftSchedule,
} from '../api/staff.api'
import type {
  StaffFilters,
  CreateStaffRequest,
  UpdateStaffRequest,
  BulkAttendanceRecord,
  CreateLeaveRequest,
  ProcessSalaryRequest,
  SalaryStructure,
  TimetableEntry,
  CreateSubstitutionRequest,
  CreatePerformanceReview,
  CreatePDRequest,
  ProfessionalDevelopment,
  PayrollDeduction,
  EmployeeBenefit,
  LoanAdvance,
  StaffSkill,
  Certification,
  WorkSchedulePreference,
  ShiftSchedule,
  ExitInterview,
} from '../types/staff.types'

// ==================== QUERY KEYS ====================

export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (filters: StaffFilters & { page?: number; limit?: number }) =>
    [...staffKeys.lists(), filters] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
  attendance: () => [...staffKeys.all, 'attendance'] as const,
  dailyAttendance: (date: string) => [...staffKeys.attendance(), 'daily', date] as const,
  staffAttendance: (staffId: string, month?: number, year?: number) =>
    [...staffKeys.attendance(), 'staff', staffId, month, year] as const,
  attendanceSummary: (staffId: string, month?: number, year?: number) =>
    [...staffKeys.attendance(), 'summary', staffId, month, year] as const,
  leave: () => [...staffKeys.all, 'leave'] as const,
  leaveBalance: (staffId: string, year?: number) => [...staffKeys.leave(), 'balance', staffId, year] as const,
  leaveRequests: (filters?: { status?: string; staffId?: string }) =>
    [...staffKeys.leave(), 'requests', filters] as const,
  staffLeaveRequests: (staffId: string) => [...staffKeys.leave(), 'staff', staffId] as const,
  salary: () => [...staffKeys.all, 'salary'] as const,
  salaryStructure: (staffId: string) => [...staffKeys.salary(), 'structure', staffId] as const,
  salarySlips: (staffId: string) => [...staffKeys.salary(), 'slips', staffId] as const,
  timetable: () => [...staffKeys.all, 'timetable'] as const,
  staffTimetable: (staffId: string) => [...staffKeys.timetable(), 'staff', staffId] as const,
  classTimetable: (cls: string, section: string) => [...staffKeys.timetable(), 'class', cls, section] as const,
  substitutions: (filters?: { date?: string; status?: string }) => [...staffKeys.all, 'substitutions', filters] as const,
  performanceReviews: (filters?: { staffId?: string; period?: string; year?: number }) =>
    [...staffKeys.all, 'performance-reviews', filters] as const,
  staffPerformanceReviews: (staffId: string) => [...staffKeys.all, 'performance-reviews', 'staff', staffId] as const,
  professionalDev: () => [...staffKeys.all, 'professional-development'] as const,
  staffPD: (staffId: string) => [...staffKeys.professionalDev(), 'staff', staffId] as const,
  allPD: (filters?: { type?: string; status?: string }) => [...staffKeys.professionalDev(), 'all', filters] as const,
  // New keys for enhanced features
  payrollDeductions: (staffId: string) => [...staffKeys.all, 'payroll-deductions', staffId] as const,
  benefits: (staffId: string) => [...staffKeys.all, 'benefits', staffId] as const,
  loans: (staffId: string) => [...staffKeys.all, 'loans', staffId] as const,
  timeOffAccrual: (staffId: string, year?: number) => [...staffKeys.all, 'time-off-accrual', staffId, year] as const,
  onboardingTasks: () => [...staffKeys.all, 'onboarding-tasks'] as const,
  onboardingChecklists: (filters?: { status?: string }) => [...staffKeys.all, 'onboarding', filters] as const,
  staffOnboarding: (staffId: string) => [...staffKeys.all, 'onboarding', 'staff', staffId] as const,
  exitInterviews: (filters?: { status?: string; separationType?: string }) => [...staffKeys.all, 'exit-interviews', filters] as const,
  staffExitInterview: (staffId: string) => [...staffKeys.all, 'exit-interview', 'staff', staffId] as const,
  skills: (staffId: string) => [...staffKeys.all, 'skills', staffId] as const,
  certifications: (staffId: string) => [...staffKeys.all, 'certifications', staffId] as const,
  certificationExpiryAlerts: () => [...staffKeys.all, 'certification-expiry-alerts'] as const,
  skillGaps: (staffId: string) => [...staffKeys.all, 'skill-gaps', staffId] as const,
  skillsMatrix: (filters?: { department?: string; skill?: string }) => [...staffKeys.all, 'skills-matrix', filters] as const,
  schedulePreference: (staffId: string) => [...staffKeys.all, 'schedule-preference', staffId] as const,
  shiftSchedules: (filters?: { week?: string; staffId?: string; department?: string }) => [...staffKeys.all, 'shift-schedules', filters] as const,
}

// ==================== STAFF CRUD HOOKS ====================

export function useStaffList(filters: StaffFilters & { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: staffKeys.list(filters),
    queryFn: () => fetchStaff(filters),
  })
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => fetchStaffMember(id),
    enabled: !!id,
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStaffRequest) => createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
    },
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffRequest }) => updateStaff(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
    },
  })
}

export function useDeleteStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
    },
  })
}

// ==================== ATTENDANCE HOOKS ====================

export function useDailyAttendance(date: string) {
  return useQuery({
    queryKey: staffKeys.dailyAttendance(date),
    queryFn: () => fetchDailyAttendance(date),
    enabled: !!date,
  })
}

export function useSaveAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ date, records }: { date: string; records: BulkAttendanceRecord[] }) =>
      saveAttendance(date, records),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.dailyAttendance(variables.date) })
      queryClient.invalidateQueries({ queryKey: staffKeys.attendance() })
    },
  })
}

export function useStaffAttendance(staffId: string, month?: number, year?: number) {
  return useQuery({
    queryKey: staffKeys.staffAttendance(staffId, month, year),
    queryFn: () => fetchStaffAttendance(staffId, month, year),
    enabled: !!staffId,
  })
}

export function useAttendanceSummary(staffId: string, month?: number, year?: number) {
  return useQuery({
    queryKey: staffKeys.attendanceSummary(staffId, month, year),
    queryFn: () => fetchAttendanceSummary(staffId, month, year),
    enabled: !!staffId,
  })
}

// ==================== LEAVE HOOKS ====================

export function useLeaveBalance(staffId: string, year?: number) {
  return useQuery({
    queryKey: staffKeys.leaveBalance(staffId, year),
    queryFn: () => fetchLeaveBalance(staffId, year),
    enabled: !!staffId,
  })
}

export function useAllLeaveRequests(filters: { status?: string; staffId?: string } = {}) {
  return useQuery({
    queryKey: staffKeys.leaveRequests(filters),
    queryFn: () => fetchAllLeaveRequests(filters),
  })
}

export function useStaffLeaveRequests(staffId: string) {
  return useQuery({
    queryKey: staffKeys.staffLeaveRequests(staffId),
    queryFn: () => fetchStaffLeaveRequests(staffId),
    enabled: !!staffId,
  })
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: CreateLeaveRequest }) =>
      createLeaveRequest(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.staffLeaveRequests(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.leaveRequests() })
    },
  })
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string
      data: { status: 'approved' | 'rejected'; rejectionReason?: string }
    }) => updateLeaveRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.leave() })
    },
  })
}

// ==================== SALARY HOOKS ====================

export function useSalaryStructure(staffId: string) {
  return useQuery({
    queryKey: staffKeys.salaryStructure(staffId),
    queryFn: () => fetchSalaryStructure(staffId),
    enabled: !!staffId,
  })
}

export function useUpdateSalaryStructure() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: Partial<SalaryStructure> }) =>
      updateSalaryStructure(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.salaryStructure(variables.staffId) })
    },
  })
}

export function useSalarySlips(staffId: string) {
  return useQuery({
    queryKey: staffKeys.salarySlips(staffId),
    queryFn: () => fetchSalarySlips(staffId),
    enabled: !!staffId,
  })
}

export function useProcessMonthlySalary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProcessSalaryRequest) => processMonthlySalary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.salary() })
    },
  })
}

export function useMarkSalaryPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slipId: string) => markSalaryPaid(slipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.salary() })
    },
  })
}

// ==================== TIMETABLE HOOKS ====================

export function useStaffTimetable(staffId: string) {
  return useQuery({
    queryKey: staffKeys.staffTimetable(staffId),
    queryFn: () => fetchStaffTimetable(staffId),
    enabled: !!staffId,
  })
}

export function useClassTimetable(cls: string, section: string) {
  return useQuery({
    queryKey: staffKeys.classTimetable(cls, section),
    queryFn: () => fetchClassTimetable(cls, section),
    enabled: !!cls && !!section,
  })
}

export function useCreateTimetableEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<TimetableEntry, 'id' | 'staffName'>) => createTimetableEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.timetable() })
    },
  })
}

export function useDeleteTimetableEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTimetableEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.timetable() })
    },
  })
}

// ==================== SUBSTITUTION HOOKS ====================

export function useSubstitutions(filters?: { date?: string; status?: string }) {
  return useQuery({
    queryKey: staffKeys.substitutions(filters),
    queryFn: () => fetchSubstitutions(filters),
  })
}

export function useCreateSubstitution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSubstitutionRequest) => createSubstitution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.substitutions() })
    },
  })
}

export function useUpdateSubstitutionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateSubstitutionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.substitutions() })
    },
  })
}

// ==================== PERFORMANCE REVIEW HOOKS ====================

export function usePerformanceReviews(filters?: { staffId?: string; period?: string; year?: number }) {
  return useQuery({
    queryKey: staffKeys.performanceReviews(filters),
    queryFn: () => fetchPerformanceReviews(filters),
  })
}

export function useStaffPerformanceReviews(staffId: string) {
  return useQuery({
    queryKey: staffKeys.staffPerformanceReviews(staffId),
    queryFn: () => fetchStaffPerformanceReviews(staffId),
    enabled: !!staffId,
  })
}

export function useCreatePerformanceReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePerformanceReview) => createPerformanceReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.performanceReviews() })
    },
  })
}

export function useAcknowledgeReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => acknowledgeReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.performanceReviews() })
    },
  })
}

// ==================== PROFESSIONAL DEVELOPMENT HOOKS ====================

export function useStaffPD(staffId: string) {
  return useQuery({
    queryKey: staffKeys.staffPD(staffId),
    queryFn: () => fetchStaffPD(staffId),
    enabled: !!staffId,
  })
}

export function useAllPD(filters?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: staffKeys.allPD(filters),
    queryFn: () => fetchAllPD(filters),
  })
}

export function useCreatePD() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: Omit<CreatePDRequest, 'staffId'> }) =>
      createPD(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.staffPD(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.allPD() })
    },
  })
}

export function useUpdatePD() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProfessionalDevelopment> }) => updatePD(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.professionalDev() })
    },
  })
}

export function useDeletePD() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePD(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.professionalDev() })
    },
  })
}

// ==================== BULK IMPORT HOOK ====================

export function useBulkImportStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rows: Record<string, string>[]) => bulkImportStaff(rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
    },
  })
}

// ==================== ADVANCED PAYROLL & BENEFITS HOOKS ====================

export function usePayrollDeductions(staffId: string) {
  return useQuery({
    queryKey: staffKeys.payrollDeductions(staffId),
    queryFn: () => fetchPayrollDeductions(staffId),
    enabled: !!staffId,
  })
}

export function useCreatePayrollDeduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: string
      data: Omit<PayrollDeduction, 'id' | 'staffId'>
    }) => createPayrollDeduction(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.payrollDeductions(variables.staffId) })
    },
  })
}

export function useUpdatePayrollDeduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      deductionId,
      data,
    }: {
      staffId: string
      deductionId: string
      data: Partial<PayrollDeduction>
    }) => updatePayrollDeduction(staffId, deductionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.payrollDeductions(variables.staffId) })
    },
  })
}

export function useEmployeeBenefits(staffId: string) {
  return useQuery({
    queryKey: staffKeys.benefits(staffId),
    queryFn: () => fetchEmployeeBenefits(staffId),
    enabled: !!staffId,
  })
}

export function useCreateEmployeeBenefit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: string
      data: Omit<EmployeeBenefit, 'id' | 'staffId'>
    }) => createEmployeeBenefit(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.benefits(variables.staffId) })
    },
  })
}

export function useUpdateEmployeeBenefit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      benefitId,
      data,
    }: {
      staffId: string
      benefitId: string
      data: Partial<EmployeeBenefit>
    }) => updateEmployeeBenefit(staffId, benefitId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.benefits(variables.staffId) })
    },
  })
}

export function useLoanAdvances(staffId: string) {
  return useQuery({
    queryKey: staffKeys.loans(staffId),
    queryFn: () => fetchLoanAdvances(staffId),
    enabled: !!staffId,
  })
}

export function useCreateLoanAdvance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: string
      data: Omit<LoanAdvance, 'id' | 'staffId' | 'paidInstallments' | 'remainingAmount' | 'deductions'>
    }) => createLoanAdvance(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.loans(variables.staffId) })
    },
  })
}

export function useUpdateLoanAdvance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      loanId,
      data,
    }: {
      staffId: string
      loanId: string
      data: Partial<LoanAdvance>
    }) => updateLoanAdvance(staffId, loanId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.loans(variables.staffId) })
    },
  })
}

// ==================== TIME-OFF ACCRUAL HOOKS ====================

export function useTimeOffAccrual(staffId: string, year?: number) {
  return useQuery({
    queryKey: staffKeys.timeOffAccrual(staffId, year),
    queryFn: () => fetchTimeOffAccrual(staffId, year),
    enabled: !!staffId,
  })
}

export function useAdjustTimeOff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: string
      data: { leaveType: string; amount: number; notes: string }
    }) => adjustTimeOff(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.timeOffAccrual(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.leaveBalance(variables.staffId) })
    },
  })
}

// ==================== ONBOARDING HOOKS ====================

export function useOnboardingTasks() {
  return useQuery({
    queryKey: staffKeys.onboardingTasks(),
    queryFn: fetchOnboardingTasks,
  })
}

export function useOnboardingChecklists(filters?: { status?: string }) {
  return useQuery({
    queryKey: staffKeys.onboardingChecklists(filters),
    queryFn: () => fetchOnboardingChecklists(filters),
  })
}

export function useStaffOnboarding(staffId: string) {
  return useQuery({
    queryKey: staffKeys.staffOnboarding(staffId),
    queryFn: () => fetchStaffOnboarding(staffId),
    enabled: !!staffId,
  })
}

export function useCreateOnboardingChecklist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: string
      data: { assignedHR: string; assignedManager: string }
    }) => createOnboardingChecklist(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.staffOnboarding(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.onboardingChecklists() })
    },
  })
}

export function useUpdateOnboardingTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      taskId,
      data,
    }: {
      staffId: string
      taskId: string
      data: { status: string; notes?: string; completedBy?: string }
    }) => updateOnboardingTask(staffId, taskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.staffOnboarding(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.onboardingChecklists() })
    },
  })
}

// ==================== EXIT INTERVIEW HOOKS ====================

export function useExitInterviews(filters?: { status?: string; separationType?: string }) {
  return useQuery({
    queryKey: staffKeys.exitInterviews(filters),
    queryFn: () => fetchExitInterviews(filters),
  })
}

export function useStaffExitInterview(staffId: string) {
  return useQuery({
    queryKey: staffKeys.staffExitInterview(staffId),
    queryFn: () => fetchStaffExitInterview(staffId),
    enabled: !!staffId,
  })
}

export function useCreateExitInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: string
      data: Omit<ExitInterview, 'id' | 'staffId' | 'staffName' | 'department' | 'designation' | 'joiningDate'>
    }) => createExitInterview(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.staffExitInterview(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.exitInterviews() })
    },
  })
}

export function useUpdateExitInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: Partial<ExitInterview> }) =>
      updateExitInterview(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.staffExitInterview(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.exitInterviews() })
    },
  })
}

export function useUpdateClearanceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      department,
      data,
    }: {
      staffId: string
      department: string
      data: { cleared: boolean; clearedBy: string; remarks?: string }
    }) => updateClearanceStatus(staffId, department, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.staffExitInterview(variables.staffId) })
    },
  })
}

// ==================== SKILLS & CERTIFICATIONS HOOKS ====================

export function useStaffSkills(staffId: string) {
  return useQuery({
    queryKey: staffKeys.skills(staffId),
    queryFn: () => fetchStaffSkills(staffId),
    enabled: !!staffId,
  })
}

export function useCreateStaffSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: string
      data: Omit<StaffSkill, 'id' | 'staffId'>
    }) => createStaffSkill(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.skills(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.skillsMatrix() })
    },
  })
}

export function useUpdateStaffSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      skillId,
      data,
    }: {
      staffId: string
      skillId: string
      data: Partial<StaffSkill>
    }) => updateStaffSkill(staffId, skillId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.skills(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.skillsMatrix() })
    },
  })
}

export function useDeleteStaffSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ staffId, skillId }: { staffId: string; skillId: string }) =>
      deleteStaffSkill(staffId, skillId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.skills(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.skillsMatrix() })
    },
  })
}

export function useCertifications(staffId: string) {
  return useQuery({
    queryKey: staffKeys.certifications(staffId),
    queryFn: () => fetchCertifications(staffId),
    enabled: !!staffId,
  })
}

export function useCreateCertification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: string
      data: Omit<Certification, 'id' | 'staffId' | 'status' | 'reminderSent'>
    }) => createCertification(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.certifications(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.certificationExpiryAlerts() })
    },
  })
}

export function useUpdateCertification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      certId,
      data,
    }: {
      staffId: string
      certId: string
      data: Partial<Certification>
    }) => updateCertification(staffId, certId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.certifications(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.certificationExpiryAlerts() })
    },
  })
}

export function useDeleteCertification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ staffId, certId }: { staffId: string; certId: string }) =>
      deleteCertification(staffId, certId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.certifications(variables.staffId) })
      queryClient.invalidateQueries({ queryKey: staffKeys.certificationExpiryAlerts() })
    },
  })
}

export function useCertificationExpiryAlerts() {
  return useQuery({
    queryKey: staffKeys.certificationExpiryAlerts(),
    queryFn: fetchCertificationExpiryAlerts,
  })
}

export function useSkillGaps(staffId: string) {
  return useQuery({
    queryKey: staffKeys.skillGaps(staffId),
    queryFn: () => fetchSkillGaps(staffId),
    enabled: !!staffId,
  })
}

export function useSkillsMatrix(filters?: { department?: string; skill?: string }) {
  return useQuery({
    queryKey: staffKeys.skillsMatrix(filters),
    queryFn: () => fetchSkillsMatrix(filters),
  })
}

// ==================== WORK SCHEDULE HOOKS ====================

export function useWorkSchedulePreference(staffId: string) {
  return useQuery({
    queryKey: staffKeys.schedulePreference(staffId),
    queryFn: () => fetchWorkSchedulePreference(staffId),
    enabled: !!staffId,
  })
}

export function useUpdateWorkSchedulePreference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: string
      data: Partial<WorkSchedulePreference>
    }) => updateWorkSchedulePreference(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.schedulePreference(variables.staffId) })
    },
  })
}

export function useRequestScheduleChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: string
      data: { preferredWorkMode: string; preferredShift: string; notes?: string }
    }) => requestScheduleChange(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.schedulePreference(variables.staffId) })
    },
  })
}

export function useApproveScheduleChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      approved,
      effectiveFrom,
    }: {
      staffId: string
      approved: boolean
      effectiveFrom?: string
    }) => approveScheduleChange(staffId, approved, effectiveFrom),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.schedulePreference(variables.staffId) })
    },
  })
}

export function useShiftSchedules(filters?: { week?: string; staffId?: string; department?: string }) {
  return useQuery({
    queryKey: staffKeys.shiftSchedules(filters),
    queryFn: () => fetchShiftSchedules(filters),
  })
}

export function useCreateShiftSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<ShiftSchedule, 'id' | 'createdAt'>) => createShiftSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.shiftSchedules() })
    },
  })
}

export function useUpdateShiftSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      scheduleId,
      data,
    }: {
      scheduleId: string
      data: Partial<ShiftSchedule>
    }) => updateShiftSchedule(scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.shiftSchedules() })
    },
  })
}
