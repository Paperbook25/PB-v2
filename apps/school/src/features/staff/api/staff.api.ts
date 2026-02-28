import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  Staff,
  StaffFilters,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffAttendanceRecord,
  StaffAttendanceSummary,
  BulkAttendanceRecord,
  LeaveBalance,
  LeaveRequest,
  CreateLeaveRequest,
  SalaryStructure,
  SalarySlip,
  ProcessSalaryRequest,
  StaffTimetable,
  ClassTimetable,
  TimetableEntry,
  Substitution,
  CreateSubstitutionRequest,
  PerformanceReview,
  CreatePerformanceReview,
  ProfessionalDevelopment,
  CreatePDRequest,
} from '../types/staff.types'

const API_BASE = '/api/staff'

// ==================== STAFF CRUD ====================

export async function fetchStaff(
  filters: StaffFilters & { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<Staff>> {
  const params = new URLSearchParams()

  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.search) params.set('search', filters.search)
  if (filters.department) params.set('department', filters.department)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)

  return apiGet<PaginatedResponse<Staff>>(`${API_BASE}?${params.toString()}`)
}

export async function fetchStaffMember(id: string): Promise<{ data: Staff }> {
  return apiGet<{ data: Staff }>(`${API_BASE}/${id}`)
}

export async function createStaff(data: CreateStaffRequest): Promise<{ data: Staff }> {
  return apiPost<{ data: Staff }>(API_BASE, data)
}

export async function updateStaff(id: string, data: UpdateStaffRequest): Promise<{ data: Staff }> {
  return apiPut<{ data: Staff }>(`${API_BASE}/${id}`, data)
}

export async function deleteStaff(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/${id}`)
}

// ==================== ATTENDANCE ====================

export async function fetchDailyAttendance(date: string): Promise<{ data: StaffAttendanceRecord[] }> {
  return apiGet<{ data: StaffAttendanceRecord[] }>(`${API_BASE}/attendance?date=${date}`)
}

export async function saveAttendance(
  date: string,
  records: BulkAttendanceRecord[]
): Promise<{ success: boolean; count: number }> {
  const recordsWithDate = records.map((r) => ({ ...r, date }))
  return apiPost<{ success: boolean; count: number }>(`${API_BASE}/attendance`, recordsWithDate)
}

export async function fetchStaffAttendance(
  staffId: string,
  month?: number,
  year?: number
): Promise<{ data: StaffAttendanceRecord[] }> {
  const params = new URLSearchParams()
  if (month) params.set('month', String(month))
  if (year) params.set('year', String(year))

  return apiGet<{ data: StaffAttendanceRecord[] }>(`${API_BASE}/${staffId}/attendance?${params.toString()}`)
}

export async function fetchAttendanceSummary(
  staffId: string,
  month?: number,
  year?: number
): Promise<{ data: StaffAttendanceSummary }> {
  const params = new URLSearchParams()
  if (month) params.set('month', String(month))
  if (year) params.set('year', String(year))

  return apiGet<{ data: StaffAttendanceSummary }>(`${API_BASE}/${staffId}/attendance/summary?${params.toString()}`)
}

// ==================== LEAVE ====================

export async function fetchLeaveBalance(staffId: string, year?: number): Promise<{ data: LeaveBalance }> {
  const params = year ? `?year=${year}` : ''
  return apiGet<{ data: LeaveBalance }>(`${API_BASE}/${staffId}/leave-balance${params}`)
}

export async function fetchAllLeaveRequests(
  filters: { status?: string; staffId?: string } = {}
): Promise<{ data: LeaveRequest[] }> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.staffId) params.set('staffId', filters.staffId)

  return apiGet<{ data: LeaveRequest[] }>(`${API_BASE}/leave-requests?${params.toString()}`)
}

export async function fetchStaffLeaveRequests(staffId: string): Promise<{ data: LeaveRequest[] }> {
  return apiGet<{ data: LeaveRequest[] }>(`${API_BASE}/${staffId}/leave-requests`)
}

export async function createLeaveRequest(
  staffId: string,
  data: CreateLeaveRequest
): Promise<{ data: LeaveRequest }> {
  return apiPost<{ data: LeaveRequest }>(`${API_BASE}/${staffId}/leave-requests`, data)
}

export async function updateLeaveRequest(
  requestId: string,
  data: { status: 'approved' | 'rejected'; rejectionReason?: string }
): Promise<{ data: LeaveRequest }> {
  return apiPatch<{ data: LeaveRequest }>(`${API_BASE}/leave-requests/${requestId}`, data)
}

// ==================== SALARY ====================

export async function fetchSalaryStructure(staffId: string): Promise<{ data: SalaryStructure }> {
  return apiGet<{ data: SalaryStructure }>(`${API_BASE}/${staffId}/salary-structure`)
}

export async function updateSalaryStructure(
  staffId: string,
  data: Partial<SalaryStructure>
): Promise<{ data: SalaryStructure }> {
  return apiPut<{ data: SalaryStructure }>(`${API_BASE}/${staffId}/salary-structure`, data)
}

export async function fetchSalarySlips(staffId: string): Promise<{ data: SalarySlip[] }> {
  return apiGet<{ data: SalarySlip[] }>(`${API_BASE}/${staffId}/salary-slips`)
}

export async function processMonthlySalary(
  data: ProcessSalaryRequest
): Promise<{ data: SalarySlip[]; message: string }> {
  return apiPost<{ data: SalarySlip[]; message: string }>('/api/salary/process', data)
}

export async function markSalaryPaid(slipId: string): Promise<{ data: SalarySlip }> {
  return apiPatch<{ data: SalarySlip }>(`${API_BASE}/salary-slips/${slipId}/pay`)
}

// ==================== TIMETABLE ====================

export async function fetchStaffTimetable(staffId: string): Promise<{ data: StaffTimetable }> {
  return apiGet<{ data: StaffTimetable }>(`${API_BASE}/${staffId}/timetable`)
}

export async function fetchClassTimetable(cls: string, section: string): Promise<{ data: ClassTimetable }> {
  return apiGet<{ data: ClassTimetable }>(`/api/timetable/class?class=${encodeURIComponent(cls)}&section=${encodeURIComponent(section)}`)
}

export async function createTimetableEntry(data: Omit<TimetableEntry, 'id' | 'staffName'>): Promise<{ data: TimetableEntry }> {
  return apiPost<{ data: TimetableEntry }>('/api/timetable', data)
}

export async function deleteTimetableEntry(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`/api/timetable/${id}`)
}

// ==================== SUBSTITUTIONS ====================

export async function fetchSubstitutions(filters?: { date?: string; status?: string }): Promise<{ data: Substitution[] }> {
  const params = new URLSearchParams()
  if (filters?.date) params.set('date', filters.date)
  if (filters?.status) params.set('status', filters.status)
  return apiGet<{ data: Substitution[] }>(`${API_BASE}/substitutions?${params}`)
}

export async function createSubstitution(data: CreateSubstitutionRequest): Promise<{ data: Substitution }> {
  return apiPost<{ data: Substitution }>(`${API_BASE}/substitutions`, data)
}

export async function updateSubstitutionStatus(id: string, status: string): Promise<{ data: Substitution }> {
  return apiPatch<{ data: Substitution }>(`${API_BASE}/substitutions/${id}`, { status })
}

// ==================== PERFORMANCE REVIEWS ====================

export async function fetchPerformanceReviews(filters?: { staffId?: string; period?: string; year?: number }): Promise<{ data: PerformanceReview[] }> {
  const params = new URLSearchParams()
  if (filters?.staffId) params.set('staffId', filters.staffId)
  if (filters?.period) params.set('period', filters.period)
  if (filters?.year) params.set('year', String(filters.year))
  return apiGet<{ data: PerformanceReview[] }>(`${API_BASE}/performance-reviews?${params}`)
}

export async function fetchStaffPerformanceReviews(staffId: string): Promise<{ data: PerformanceReview[] }> {
  return apiGet<{ data: PerformanceReview[] }>(`${API_BASE}/${staffId}/performance-reviews`)
}

export async function createPerformanceReview(data: CreatePerformanceReview): Promise<{ data: PerformanceReview }> {
  return apiPost<{ data: PerformanceReview }>(`${API_BASE}/performance-reviews`, data)
}

export async function acknowledgeReview(id: string): Promise<{ data: PerformanceReview }> {
  return apiPatch<{ data: PerformanceReview }>(`${API_BASE}/performance-reviews/${id}/acknowledge`)
}

// ==================== PROFESSIONAL DEVELOPMENT ====================

export async function fetchStaffPD(staffId: string): Promise<{ data: ProfessionalDevelopment[] }> {
  return apiGet<{ data: ProfessionalDevelopment[] }>(`${API_BASE}/${staffId}/professional-development`)
}

export async function fetchAllPD(filters?: { type?: string; status?: string }): Promise<{ data: ProfessionalDevelopment[] }> {
  const params = new URLSearchParams()
  if (filters?.type) params.set('type', filters.type)
  if (filters?.status) params.set('status', filters.status)
  return apiGet<{ data: ProfessionalDevelopment[] }>(`${API_BASE}/professional-development?${params}`)
}

export async function createPD(staffId: string, data: Omit<CreatePDRequest, 'staffId'>): Promise<{ data: ProfessionalDevelopment }> {
  return apiPost<{ data: ProfessionalDevelopment }>(`${API_BASE}/${staffId}/professional-development`, data)
}

export async function updatePD(id: string, data: Partial<ProfessionalDevelopment>): Promise<{ data: ProfessionalDevelopment }> {
  return apiPut<{ data: ProfessionalDevelopment }>(`${API_BASE}/professional-development/${id}`, data)
}

export async function deletePD(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/professional-development/${id}`)
}

// ==================== BULK IMPORT ====================

export async function bulkImportStaff(
  rows: Record<string, string>[]
): Promise<{ data: import('../types/staff.types').BulkImportStaffResult }> {
  return apiPost<{ data: import('../types/staff.types').BulkImportStaffResult }>(
    `${API_BASE}/bulk-import`,
    { rows }
  )
}

// ==================== EXPORT ====================

export async function exportStaff(
  filters?: { department?: string; status?: string }
): Promise<{ data: Record<string, string | number>[] }> {
  const params = new URLSearchParams()
  if (filters?.department) params.set('department', filters.department)
  if (filters?.status) params.set('status', filters.status)
  return apiGet<{ data: Record<string, string | number>[] }>(`${API_BASE}/export?${params}`)
}

// ==================== ADVANCED PAYROLL & BENEFITS ====================

import type {
  PayrollDeduction,
  EmployeeBenefit,
  LoanAdvance,
  TimeOffAccrual,
  OnboardingChecklist,
  OnboardingTask,
  ExitInterview,
  StaffSkill,
  Certification,
  CertificationExpiryAlert,
  SkillGap,
  WorkSchedulePreference,
  ShiftSchedule,
} from '../types/staff.types'

export async function fetchPayrollDeductions(staffId: string): Promise<{ data: PayrollDeduction[] }> {
  return apiGet<{ data: PayrollDeduction[] }>(`${API_BASE}/${staffId}/payroll-deductions`)
}

export async function createPayrollDeduction(
  staffId: string,
  data: Omit<PayrollDeduction, 'id' | 'staffId'>
): Promise<{ data: PayrollDeduction }> {
  return apiPost<{ data: PayrollDeduction }>(`${API_BASE}/${staffId}/payroll-deductions`, data)
}

export async function updatePayrollDeduction(
  staffId: string,
  deductionId: string,
  data: Partial<PayrollDeduction>
): Promise<{ data: PayrollDeduction }> {
  return apiPut<{ data: PayrollDeduction }>(`${API_BASE}/${staffId}/payroll-deductions/${deductionId}`, data)
}

export async function fetchEmployeeBenefits(staffId: string): Promise<{ data: EmployeeBenefit[] }> {
  return apiGet<{ data: EmployeeBenefit[] }>(`${API_BASE}/${staffId}/benefits`)
}

export async function createEmployeeBenefit(
  staffId: string,
  data: Omit<EmployeeBenefit, 'id' | 'staffId'>
): Promise<{ data: EmployeeBenefit }> {
  return apiPost<{ data: EmployeeBenefit }>(`${API_BASE}/${staffId}/benefits`, data)
}

export async function updateEmployeeBenefit(
  staffId: string,
  benefitId: string,
  data: Partial<EmployeeBenefit>
): Promise<{ data: EmployeeBenefit }> {
  return apiPut<{ data: EmployeeBenefit }>(`${API_BASE}/${staffId}/benefits/${benefitId}`, data)
}

export async function fetchLoanAdvances(staffId: string): Promise<{ data: LoanAdvance[] }> {
  return apiGet<{ data: LoanAdvance[] }>(`${API_BASE}/${staffId}/loans`)
}

export async function createLoanAdvance(
  staffId: string,
  data: Omit<LoanAdvance, 'id' | 'staffId' | 'paidInstallments' | 'remainingAmount' | 'deductions'>
): Promise<{ data: LoanAdvance }> {
  return apiPost<{ data: LoanAdvance }>(`${API_BASE}/${staffId}/loans`, data)
}

export async function updateLoanAdvance(
  staffId: string,
  loanId: string,
  data: Partial<LoanAdvance>
): Promise<{ data: LoanAdvance }> {
  return apiPut<{ data: LoanAdvance }>(`${API_BASE}/${staffId}/loans/${loanId}`, data)
}

// ==================== TIME-OFF ACCRUAL ====================

export async function fetchTimeOffAccrual(
  staffId: string,
  year?: number
): Promise<{ data: TimeOffAccrual[] }> {
  const params = year ? `?year=${year}` : ''
  return apiGet<{ data: TimeOffAccrual[] }>(`${API_BASE}/${staffId}/time-off-accrual${params}`)
}

export async function adjustTimeOff(
  staffId: string,
  data: { leaveType: string; amount: number; notes: string }
): Promise<{ data: TimeOffAccrual }> {
  return apiPost<{ data: TimeOffAccrual }>(`${API_BASE}/${staffId}/time-off-accrual/adjust`, data)
}

// ==================== ONBOARDING ====================

export async function fetchOnboardingTasks(): Promise<{ data: OnboardingTask[] }> {
  return apiGet<{ data: OnboardingTask[] }>(`${API_BASE}/onboarding/tasks`)
}

export async function fetchOnboardingChecklists(
  filters?: { status?: string }
): Promise<{ data: OnboardingChecklist[] }> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  return apiGet<{ data: OnboardingChecklist[] }>(`${API_BASE}/onboarding?${params}`)
}

export async function fetchStaffOnboarding(staffId: string): Promise<{ data: OnboardingChecklist | null }> {
  return apiGet<{ data: OnboardingChecklist | null }>(`${API_BASE}/${staffId}/onboarding`)
}

export async function createOnboardingChecklist(
  staffId: string,
  data: { assignedHR: string; assignedManager: string }
): Promise<{ data: OnboardingChecklist }> {
  return apiPost<{ data: OnboardingChecklist }>(`${API_BASE}/${staffId}/onboarding`, data)
}

export async function updateOnboardingTask(
  staffId: string,
  taskId: string,
  data: { status: string; notes?: string; completedBy?: string }
): Promise<{ data: OnboardingChecklist }> {
  return apiPatch<{ data: OnboardingChecklist }>(`${API_BASE}/${staffId}/onboarding/tasks/${taskId}`, data)
}

// ==================== EXIT INTERVIEW ====================

export async function fetchExitInterviews(
  filters?: { status?: string; separationType?: string }
): Promise<{ data: ExitInterview[] }> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.separationType) params.set('separationType', filters.separationType)
  return apiGet<{ data: ExitInterview[] }>(`${API_BASE}/exit-interviews?${params}`)
}

export async function fetchStaffExitInterview(staffId: string): Promise<{ data: ExitInterview | null }> {
  return apiGet<{ data: ExitInterview | null }>(`${API_BASE}/${staffId}/exit-interview`)
}

export async function createExitInterview(
  staffId: string,
  data: Omit<ExitInterview, 'id' | 'staffId' | 'staffName' | 'department' | 'designation' | 'joiningDate'>
): Promise<{ data: ExitInterview }> {
  return apiPost<{ data: ExitInterview }>(`${API_BASE}/${staffId}/exit-interview`, data)
}

export async function updateExitInterview(
  staffId: string,
  data: Partial<ExitInterview>
): Promise<{ data: ExitInterview }> {
  return apiPut<{ data: ExitInterview }>(`${API_BASE}/${staffId}/exit-interview`, data)
}

export async function updateClearanceStatus(
  staffId: string,
  department: string,
  data: { cleared: boolean; clearedBy: string; remarks?: string }
): Promise<{ data: ExitInterview }> {
  return apiPatch<{ data: ExitInterview }>(`${API_BASE}/${staffId}/exit-interview/clearance/${department}`, data)
}

// ==================== SKILLS MATRIX & CERTIFICATIONS ====================

export async function fetchStaffSkills(staffId: string): Promise<{ data: StaffSkill[] }> {
  return apiGet<{ data: StaffSkill[] }>(`${API_BASE}/${staffId}/skills`)
}

export async function createStaffSkill(
  staffId: string,
  data: Omit<StaffSkill, 'id' | 'staffId'>
): Promise<{ data: StaffSkill }> {
  return apiPost<{ data: StaffSkill }>(`${API_BASE}/${staffId}/skills`, data)
}

export async function updateStaffSkill(
  staffId: string,
  skillId: string,
  data: Partial<StaffSkill>
): Promise<{ data: StaffSkill }> {
  return apiPut<{ data: StaffSkill }>(`${API_BASE}/${staffId}/skills/${skillId}`, data)
}

export async function deleteStaffSkill(
  staffId: string,
  skillId: string
): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/${staffId}/skills/${skillId}`)
}

export async function fetchCertifications(staffId: string): Promise<{ data: Certification[] }> {
  return apiGet<{ data: Certification[] }>(`${API_BASE}/${staffId}/certifications`)
}

export async function createCertification(
  staffId: string,
  data: Omit<Certification, 'id' | 'staffId' | 'status' | 'reminderSent'>
): Promise<{ data: Certification }> {
  return apiPost<{ data: Certification }>(`${API_BASE}/${staffId}/certifications`, data)
}

export async function updateCertification(
  staffId: string,
  certId: string,
  data: Partial<Certification>
): Promise<{ data: Certification }> {
  return apiPut<{ data: Certification }>(`${API_BASE}/${staffId}/certifications/${certId}`, data)
}

export async function deleteCertification(
  staffId: string,
  certId: string
): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/${staffId}/certifications/${certId}`)
}

export async function fetchCertificationExpiryAlerts(): Promise<{ data: CertificationExpiryAlert[] }> {
  return apiGet<{ data: CertificationExpiryAlert[] }>(`${API_BASE}/certifications/expiry-alerts`)
}

export async function fetchSkillGaps(staffId: string): Promise<{ data: SkillGap[] }> {
  return apiGet<{ data: SkillGap[] }>(`${API_BASE}/${staffId}/skill-gaps`)
}

export async function fetchSkillsMatrix(
  filters?: { department?: string; skill?: string }
): Promise<{ data: { staffId: string; staffName: string; department: string; skills: StaffSkill[] }[] }> {
  const params = new URLSearchParams()
  if (filters?.department) params.set('department', filters.department)
  if (filters?.skill) params.set('skill', filters.skill)
  return apiGet(`${API_BASE}/skills-matrix?${params}`)
}

// ==================== WORK SCHEDULE PREFERENCES ====================

export async function fetchWorkSchedulePreference(staffId: string): Promise<{ data: WorkSchedulePreference | null }> {
  return apiGet<{ data: WorkSchedulePreference | null }>(`${API_BASE}/${staffId}/schedule-preference`)
}

export async function updateWorkSchedulePreference(
  staffId: string,
  data: Partial<WorkSchedulePreference>
): Promise<{ data: WorkSchedulePreference }> {
  return apiPut<{ data: WorkSchedulePreference }>(`${API_BASE}/${staffId}/schedule-preference`, data)
}

export async function requestScheduleChange(
  staffId: string,
  data: { preferredWorkMode: string; preferredShift: string; notes?: string }
): Promise<{ data: WorkSchedulePreference }> {
  return apiPost<{ data: WorkSchedulePreference }>(`${API_BASE}/${staffId}/schedule-preference/request`, data)
}

export async function approveScheduleChange(
  staffId: string,
  approved: boolean,
  effectiveFrom?: string
): Promise<{ data: WorkSchedulePreference }> {
  return apiPatch<{ data: WorkSchedulePreference }>(`${API_BASE}/${staffId}/schedule-preference/approve`, {
    approved,
    effectiveFrom,
  })
}

export async function fetchShiftSchedules(
  filters?: { week?: string; staffId?: string; department?: string }
): Promise<{ data: ShiftSchedule[] }> {
  const params = new URLSearchParams()
  if (filters?.week) params.set('week', filters.week)
  if (filters?.staffId) params.set('staffId', filters.staffId)
  if (filters?.department) params.set('department', filters.department)
  return apiGet<{ data: ShiftSchedule[] }>(`${API_BASE}/shift-schedules?${params}`)
}

export async function createShiftSchedule(
  data: Omit<ShiftSchedule, 'id' | 'createdAt'>
): Promise<{ data: ShiftSchedule }> {
  return apiPost<{ data: ShiftSchedule }>(`${API_BASE}/shift-schedules`, data)
}

export async function updateShiftSchedule(
  scheduleId: string,
  data: Partial<ShiftSchedule>
): Promise<{ data: ShiftSchedule }> {
  return apiPut<{ data: ShiftSchedule }>(`${API_BASE}/shift-schedules/${scheduleId}`, data)
}
