// Primary tab types for People module
export type PrimaryTab = 'students' | 'staff' | 'attendance' | 'behavior'

// Students sub-tab types
export type StudentSubTab = 'dashboard' | 'list' | 'documents' | 'health' | 'promotions' | 'idcards'

// Staff sub-tab types (existing from StaffPage)
export type StaffSubTab = 'list' | 'attendance' | 'leave' | 'payroll' | 'timetable' | 'substitutions'

// Staff nested tab types
export type StaffAttendanceNestedTab = 'mark' | 'reports'
export type StaffLeaveNestedTab = 'pending' | 'all'
export type StaffPayrollNestedTab = 'process' | 'structure' | 'history'
export type StaffTimetableNestedTab = 'class' | 'teacher'

// Attendance sub-tab types (existing from AttendancePage)
export type AttendanceSubTab = 'mark' | 'period' | 'reports' | 'leave' | 'alerts' | 'late' | 'notifications' | 'biometric'

// Behavior sub-tab types
export type BehaviorSubTab = 'dashboard' | 'incidents' | 'detentions'

// Tab configuration types
export interface TabConfig<T extends string = string> {
  value: T
  label: string
  icon?: string
  roles?: string[]
}

// Props for tab components
export interface StudentsTabProps {
  subTab: StudentSubTab
  onSubTabChange: (tab: StudentSubTab) => void
}

export interface StaffTabProps {
  subTab: StaffSubTab
  nestedTab: string
  onSubTabChange: (tab: StaffSubTab) => void
  onNestedTabChange: (tab: string) => void
}

export interface AttendanceTabProps {
  subTab: AttendanceSubTab
  onSubTabChange: (tab: AttendanceSubTab) => void
}

export interface BehaviorTabProps {
  subTab: BehaviorSubTab
  onSubTabChange: (tab: BehaviorSubTab) => void
}
