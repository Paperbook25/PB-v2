// Hostel Types

export type HostelType = 'boys' | 'girls'
export type RoomType = 'single' | 'double' | 'triple' | 'dormitory'
export type RoomStatus = 'available' | 'full' | 'maintenance'
export type AllocationStatus = 'active' | 'vacated' | 'transferred'
export type HostelFeeType = 'room_rent' | 'mess_fee' | 'deposit' | 'laundry' | 'other'
export type HostelFeeStatus = 'pending' | 'paid' | 'overdue'
export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner'
export type HostelAttendanceStatus = 'present' | 'absent' | 'leave' | 'late'

export const HOSTEL_TYPE_LABELS: Record<HostelType, string> = {
  boys: 'Boys Hostel',
  girls: 'Girls Hostel',
}

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
  dormitory: 'Dormitory',
}

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Available',
  full: 'Full',
  maintenance: 'Under Maintenance',
}

export const ALLOCATION_STATUS_LABELS: Record<AllocationStatus, string> = {
  active: 'Active',
  vacated: 'Vacated',
  transferred: 'Transferred',
}

export const HOSTEL_FEE_TYPE_LABELS: Record<HostelFeeType, string> = {
  room_rent: 'Room Rent',
  mess_fee: 'Mess Fee',
  deposit: 'Security Deposit',
  laundry: 'Laundry',
  other: 'Other',
}

export const HOSTEL_FEE_STATUS_LABELS: Record<HostelFeeStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  overdue: 'Overdue',
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snacks: 'Snacks',
  dinner: 'Dinner',
}

export const ATTENDANCE_STATUS_LABELS: Record<HostelAttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  leave: 'On Leave',
  late: 'Late',
}

export interface Hostel {
  id: string
  name: string
  type: HostelType
  capacity: number
  occupancy: number
  wardenId: string
  wardenName: string
  floors: number
  address: string
  contactNumber: string
  email: string
  amenities: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateHostelRequest {
  name: string
  type: HostelType
  capacity: number
  wardenId: string
  floors: number
  address: string
  contactNumber: string
  email: string
  amenities: string[]
}

export interface Room {
  id: string
  hostelId: string
  hostelName: string
  roomNumber: string
  floor: number
  type: RoomType
  capacity: number
  occupancy: number
  amenities: string[]
  status: RoomStatus
  monthlyRent: number
  createdAt: string
}

export interface CreateRoomRequest {
  hostelId: string
  roomNumber: string
  floor: number
  type: RoomType
  capacity: number
  amenities: string[]
  monthlyRent: number
}

export interface RoomAllocation {
  id: string
  roomId: string
  roomNumber: string
  hostelId: string
  hostelName: string
  studentId: string
  studentName: string
  class: string
  section: string
  bedNumber: number
  startDate: string
  endDate?: string
  status: AllocationStatus
  createdAt: string
}

export interface CreateAllocationRequest {
  roomId: string
  studentId: string
  studentName: string
  class: string
  section: string
  bedNumber: number
  startDate: string
}

export interface HostelFee {
  id: string
  studentId: string
  studentName: string
  roomNumber: string
  hostelName: string
  feeType: HostelFeeType
  amount: number
  month: string
  dueDate: string
  paidDate?: string
  status: HostelFeeStatus
  transactionId?: string
  createdAt: string
}

export interface CreateHostelFeeRequest {
  studentId: string
  feeType: HostelFeeType
  amount: number
  month: string
  dueDate: string
}

export interface MessMenu {
  id: string
  hostelId: string
  hostelName: string
  dayOfWeek: number
  mealType: MealType
  items: string[]
  specialDiet?: string
  updatedAt: string
}

export interface UpdateMessMenuRequest {
  hostelId: string
  dayOfWeek: number
  mealType: MealType
  items: string[]
  specialDiet?: string
}

export interface HostelAttendance {
  id: string
  studentId: string
  studentName: string
  roomNumber: string
  hostelName: string
  date: string
  checkIn?: string
  checkOut?: string
  status: HostelAttendanceStatus
  remarks?: string
  markedBy: string
  createdAt: string
}

export interface MarkAttendanceRequest {
  studentId: string
  date: string
  status: HostelAttendanceStatus
  checkIn?: string
  checkOut?: string
  remarks?: string
}

export interface HostelStats {
  totalHostels: number
  totalRooms: number
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  totalStudents: number
  pendingFees: number
  pendingFeesAmount: number
  todayPresent: number
  todayAbsent: number
}
