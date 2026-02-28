import { faker } from '@faker-js/faker'
import { staff } from './staff.data'

// ==================== TYPES ====================

export type LeaveType = 'EL' | 'CL' | 'SL' | 'PL'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type StaffAttendanceStatus = 'present' | 'absent' | 'half_day' | 'on_leave'

export interface LeaveBalance {
  staffId: string
  year: number
  EL: { total: number; used: number; available: number }
  CL: { total: number; used: number; available: number }
  SL: { total: number; used: number; available: number }
  PL: { total: number; used: number; available: number }
}

export interface LeaveRequest {
  id: string
  staffId: string
  staffName: string
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  numberOfDays: number
  appliedOn: string
  approvedBy?: string
  rejectionReason?: string
}

export interface StaffAttendanceRecord {
  id: string
  staffId: string
  date: string
  status: StaffAttendanceStatus
  checkInTime?: string
  checkOutTime?: string
}

export interface StaffAttendanceSummary {
  staffId: string
  month: number
  year: number
  totalWorkingDays: number
  present: number
  absent: number
  halfDay: number
  onLeave: number
  attendancePercentage: number
}

export interface SalaryStructure {
  staffId: string
  basic: number
  hra: number
  da: number
  conveyance: number
  specialAllowance: number
  grossSalary: number
  pf: number
  professionalTax: number
  tds: number
  totalDeductions: number
  netSalary: number
}

export interface SalarySlip {
  id: string
  staffId: string
  staffName: string
  month: number
  year: number
  earnings: {
    basic: number
    hra: number
    da: number
    conveyance: number
    allowances: number
    gross: number
  }
  deductions: {
    pf: number
    tax: number
    professionalTax: number
    lop: number
    total: number
  }
  netPayable: number
  status: 'generated' | 'paid'
  paidOn?: string
}

// ==================== MOCK DATA ====================

const LEAVE_REASONS = [
  'Personal work',
  'Family function',
  'Medical appointment',
  'Child not well',
  'Fever',
  'Family emergency',
  'Wedding in family',
  'Travel',
  'Home renovation',
  'Important personal work',
]

// Generate attendance records for the past 2 months
function generateAttendanceRecords(): StaffAttendanceRecord[] {
  const records: StaffAttendanceRecord[] = []
  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)

  for (const member of staff) {
    if (member.status !== 'active') continue

    const currentDate = new Date(startDate)
    while (currentDate <= today) {
      // Skip weekends
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const dateStr = currentDate.toISOString().split('T')[0]

        // Random attendance with high probability of present
        const status = faker.helpers.weightedArrayElement([
          { value: 'present' as const, weight: 85 },
          { value: 'absent' as const, weight: 5 },
          { value: 'half_day' as const, weight: 5 },
          { value: 'on_leave' as const, weight: 5 },
        ])

        records.push({
          id: faker.string.uuid(),
          staffId: member.id,
          date: dateStr,
          status,
          checkInTime: status === 'present' || status === 'half_day'
            ? `08:${faker.number.int({ min: 45, max: 59 })}:00`
            : undefined,
          checkOutTime: status === 'present'
            ? `17:${faker.number.int({ min: 0, max: 30 })}:00`
            : status === 'half_day'
              ? `13:${faker.number.int({ min: 0, max: 30 })}:00`
              : undefined,
        })
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  return records
}

// Generate leave requests
function generateLeaveRequests(): LeaveRequest[] {
  const requests: LeaveRequest[] = []
  const activeStaff = staff.filter((s) => s.status === 'active')

  // Generate some past leave requests (mix of approved/rejected)
  for (let i = 0; i < 25; i++) {
    const member = faker.helpers.arrayElement(activeStaff)
    const leaveType = faker.helpers.arrayElement(['EL', 'CL', 'SL', 'PL'] as LeaveType[])
    const startDate = faker.date.recent({ days: 60 })
    const numberOfDays = faker.number.int({ min: 1, max: 5 })
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + numberOfDays - 1)

    const status = faker.helpers.weightedArrayElement([
      { value: 'approved' as const, weight: 60 },
      { value: 'rejected' as const, weight: 20 },
      { value: 'cancelled' as const, weight: 10 },
      { value: 'pending' as const, weight: 10 },
    ])

    requests.push({
      id: faker.string.uuid(),
      staffId: member.id,
      staffName: member.name,
      type: leaveType,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      reason: faker.helpers.arrayElement(LEAVE_REASONS),
      status,
      numberOfDays,
      appliedOn: faker.date.recent({ days: 70 }).toISOString(),
      approvedBy: status === 'approved' ? 'Principal' : undefined,
      rejectionReason: status === 'rejected' ? 'Staff shortage during this period' : undefined,
    })
  }

  // Add a few pending requests
  for (let i = 0; i < 5; i++) {
    const member = faker.helpers.arrayElement(activeStaff)
    const leaveType = faker.helpers.arrayElement(['EL', 'CL', 'SL', 'PL'] as LeaveType[])
    const startDate = faker.date.soon({ days: 14 })
    const numberOfDays = faker.number.int({ min: 1, max: 3 })
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + numberOfDays - 1)

    requests.push({
      id: faker.string.uuid(),
      staffId: member.id,
      staffName: member.name,
      type: leaveType,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      reason: faker.helpers.arrayElement(LEAVE_REASONS),
      status: 'pending',
      numberOfDays,
      appliedOn: faker.date.recent({ days: 3 }).toISOString(),
    })
  }

  return requests.sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime())
}

// Generate leave balances
function generateLeaveBalances(): LeaveBalance[] {
  const balances: LeaveBalance[] = []
  const currentYear = new Date().getFullYear()

  for (const member of staff) {
    if (member.status === 'resigned') continue

    const elUsed = faker.number.int({ min: 0, max: 5 })
    const clUsed = faker.number.int({ min: 0, max: 4 })
    const slUsed = faker.number.int({ min: 0, max: 3 })
    const plUsed = faker.number.int({ min: 0, max: 2 })

    balances.push({
      staffId: member.id,
      year: currentYear,
      EL: { total: 12, used: elUsed, available: 12 - elUsed },
      CL: { total: 12, used: clUsed, available: 12 - clUsed },
      SL: { total: 10, used: slUsed, available: 10 - slUsed },
      PL: { total: 15, used: plUsed, available: 15 - plUsed },
    })
  }

  return balances
}

// Generate salary structures
function generateSalaryStructures(): SalaryStructure[] {
  const structures: SalaryStructure[] = []

  for (const member of staff) {
    const basic = Math.round(member.salary * 0.5)
    const hra = Math.round(basic * 0.4)
    const da = Math.round(basic * 0.2)
    const conveyance = 1600
    const specialAllowance = Math.max(0, member.salary - basic - hra - da - conveyance)
    const grossSalary = basic + hra + da + conveyance + specialAllowance
    const pf = Math.round(basic * 0.12)
    const professionalTax = 200
    const tds = Math.round(grossSalary * 0.1)
    const totalDeductions = pf + professionalTax + tds
    const netSalary = grossSalary - totalDeductions

    structures.push({
      staffId: member.id,
      basic,
      hra,
      da,
      conveyance,
      specialAllowance,
      grossSalary,
      pf,
      professionalTax,
      tds,
      totalDeductions,
      netSalary,
    })
  }

  return structures
}

// Generate salary slips for past months
function generateSalarySlips(): SalarySlip[] {
  const slips: SalarySlip[] = []
  const today = new Date()
  const structures = generateSalaryStructures()

  // Generate slips for the past 3 months
  for (let monthOffset = 1; monthOffset <= 3; monthOffset++) {
    const slipDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1)
    const month = slipDate.getMonth() + 1
    const year = slipDate.getFullYear()

    for (const member of staff) {
      if (member.status === 'resigned') continue

      const structure = structures.find((s) => s.staffId === member.id)
      if (!structure) continue

      const lopDays = faker.number.int({ min: 0, max: 2 })
      const perDaySalary = structure.grossSalary / 30
      const lopDeduction = Math.round(lopDays * perDaySalary)

      slips.push({
        id: faker.string.uuid(),
        staffId: member.id,
        staffName: member.name,
        month,
        year,
        earnings: {
          basic: structure.basic,
          hra: structure.hra,
          da: structure.da,
          conveyance: structure.conveyance,
          allowances: structure.specialAllowance,
          gross: structure.grossSalary,
        },
        deductions: {
          pf: structure.pf,
          tax: structure.tds,
          professionalTax: structure.professionalTax,
          lop: lopDeduction,
          total: structure.totalDeductions + lopDeduction,
        },
        netPayable: structure.netSalary - lopDeduction,
        status: 'paid',
        paidOn: new Date(year, month, faker.number.int({ min: 1, max: 5 })).toISOString(),
      })
    }
  }

  return slips
}

// Export generated data
export const staffAttendance: StaffAttendanceRecord[] = generateAttendanceRecords()
export const leaveRequests: LeaveRequest[] = generateLeaveRequests()
export const leaveBalances: LeaveBalance[] = generateLeaveBalances()
export const salaryStructures: SalaryStructure[] = generateSalaryStructures()
export const salarySlips: SalarySlip[] = generateSalarySlips()
