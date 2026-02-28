// Visitor Types

export type IdType = 'aadhaar' | 'driving_license' | 'passport' | 'voter_id' | 'other'
export type VisitPurpose = 'meeting' | 'delivery' | 'parent_visit' | 'vendor' | 'interview' | 'other'
export type VisitStatus = 'active' | 'completed' | 'expired' | 'cancelled'
export type HostType = 'staff' | 'student'

export const ID_TYPE_LABELS: Record<IdType, string> = {
  aadhaar: 'Aadhaar Card',
  driving_license: 'Driving License',
  passport: 'Passport',
  voter_id: 'Voter ID',
  other: 'Other',
}

export const VISIT_PURPOSE_LABELS: Record<VisitPurpose, string> = {
  meeting: 'Meeting',
  delivery: 'Delivery',
  parent_visit: 'Parent Visit',
  vendor: 'Vendor',
  interview: 'Interview',
  other: 'Other',
}

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

export const HOST_TYPE_LABELS: Record<HostType, string> = {
  staff: 'Staff',
  student: 'Student',
}

export interface Visitor {
  id: string
  name: string
  phone: string
  email?: string
  idType: IdType
  idNumber: string
  photo?: string
  company?: string
  vehicleNumber?: string
  address?: string
  createdAt: string
}

export interface CreateVisitorRequest {
  name: string
  phone: string
  email?: string
  idType: IdType
  idNumber: string
  company?: string
  vehicleNumber?: string
  address?: string
}

export interface VisitorPass {
  id: string
  visitorId: string
  visitorName: string
  visitorPhone: string
  visitorCompany?: string
  passNumber: string
  purpose: VisitPurpose
  purposeDetails: string
  hostType: HostType
  hostId: string
  hostName: string
  hostDepartment?: string
  checkInTime: string
  checkOutTime?: string
  expectedDuration: number // minutes
  status: VisitStatus
  badge?: string
  belongings?: string[]
  vehicleNumber?: string
  createdAt: string
}

export interface CreateVisitorPassRequest {
  visitorId?: string
  visitorName: string
  visitorPhone: string
  visitorIdType: IdType
  visitorIdNumber: string
  visitorCompany?: string
  vehicleNumber?: string
  purpose: VisitPurpose
  purposeDetails: string
  hostType: HostType
  hostId: string
  hostName: string
  hostDepartment?: string
  expectedDuration: number
  belongings?: string[]
}

export interface PreApprovedVisitor {
  id: string
  visitorId: string
  visitorName: string
  visitorPhone: string
  visitorCompany?: string
  validFrom: string
  validUntil: string
  purpose: string
  approvedBy: string
  approvedByName: string
  maxVisits: number
  usedVisits: number
  status: 'active' | 'expired' | 'revoked'
  createdAt: string
}

export interface CreatePreApprovedRequest {
  visitorId?: string
  visitorName: string
  visitorPhone: string
  visitorCompany?: string
  validFrom: string
  validUntil: string
  purpose: string
  maxVisits: number
}

export interface VisitorStats {
  todayVisitors: number
  activeVisitors: number
  completedToday: number
  avgVisitDuration: number
  peakHour: string
  weeklyTotal: number
  monthlyTotal: number
  preApprovedActive: number
}

export interface VisitorReport {
  date: string
  totalVisitors: number
  byPurpose: Record<VisitPurpose, number>
  avgDuration: number
  peakHours: { hour: number; count: number }[]
}
