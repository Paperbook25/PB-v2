import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  staff,
  type Staff,
  timetableEntries,
  type TimetableEntry,
  substitutions,
  type SubstitutionRecord,
  performanceReviews,
  type PerformanceReviewRecord,
  professionalDevelopments,
  type PDRecord,
} from '../data/staff.data'
import {
  staffAttendance,
  leaveRequests,
  leaveBalances,
  salaryStructures,
  salarySlips,
  type StaffAttendanceRecord,
  type LeaveRequest,
  type SalarySlip,
} from '../data/staff-hr.data'

// Helper to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

export const staffHandlers = [
  // Create staff
  http.post('/api/staff', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as Partial<Staff>

    const joiningYear = new Date().getFullYear()
    const count = staff.length + 1

    const newStaff: Staff = {
      id: generateId(),
      employeeId: `EMP${joiningYear}${String(count).padStart(4, '0')}`,
      name: body.name || '',
      email: body.email || '',
      phone: body.phone || '',
      dateOfBirth: body.dateOfBirth || '',
      gender: body.gender || 'male',
      department: body.department || '',
      designation: body.designation || 'Teacher',
      joiningDate: body.joiningDate || new Date().toISOString(),
      photoUrl: body.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.name?.replace(/\s/g, '')}&backgroundColor=b6e3f4`,
      qualification: body.qualification || [],
      specialization: body.specialization || '',
      salary: body.salary || 30000,
      address: body.address || { street: '', city: '', state: '', pincode: '' },
      status: 'active',
    }

    staff.unshift(newStaff)

    return HttpResponse.json({ data: newStaff }, { status: 201 })
  }),

  // Update staff
  http.put('/api/staff/:id', async ({ params, request }) => {
    await mockDelay('read')
    const staffIndex = staff.findIndex((s) => s.id === params.id)

    if (staffIndex === -1) {
      return HttpResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const body = await request.json() as Partial<Staff>
    const updatedStaff = {
      ...staff[staffIndex],
      ...body,
    }

    staff[staffIndex] = updatedStaff

    return HttpResponse.json({ data: updatedStaff })
  }),

  // Delete staff
  http.delete('/api/staff/:id', async ({ params }) => {
    await mockDelay('read')
    const staffIndex = staff.findIndex((s) => s.id === params.id)

    if (staffIndex === -1) {
      return HttpResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    staff.splice(staffIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== ATTENDANCE HANDLERS ====================

  // Get attendance for a specific date
  http.get('/api/staff/attendance', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const date = url.searchParams.get('date')

    if (!date) {
      return HttpResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const records = staffAttendance.filter((a) => a.date === date)
    return HttpResponse.json({ data: records })
  }),

  // Save attendance records
  http.post('/api/staff/attendance', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as StaffAttendanceRecord[]

    body.forEach((record) => {
      const existingIndex = staffAttendance.findIndex(
        (a) => a.staffId === record.staffId && a.date === record.date
      )

      if (existingIndex >= 0) {
        staffAttendance[existingIndex] = { ...staffAttendance[existingIndex], ...record }
      } else {
        staffAttendance.push({
          ...record,
          id: record.id || generateId(),
        })
      }
    })

    return HttpResponse.json({ success: true, count: body.length })
  }),

  // Get staff's attendance history
  http.get('/api/staff/:id/attendance', async ({ params, request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const month = url.searchParams.get('month')
    const year = url.searchParams.get('year')

    let records = staffAttendance.filter((a) => a.staffId === params.id)

    if (month && year) {
      records = records.filter((a) => {
        const date = new Date(a.date)
        return date.getMonth() + 1 === parseInt(month) && date.getFullYear() === parseInt(year)
      })
    }

    return HttpResponse.json({ data: records })
  }),

  // Get staff attendance summary
  http.get('/api/staff/:id/attendance/summary', async ({ params, request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const month = parseInt(url.searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()))

    const records = staffAttendance.filter((a) => {
      const date = new Date(a.date)
      return (
        a.staffId === params.id &&
        date.getMonth() + 1 === month &&
        date.getFullYear() === year
      )
    })

    const totalWorkingDays = 22 // Approximate
    const present = records.filter((r) => r.status === 'present').length
    const absent = records.filter((r) => r.status === 'absent').length
    const halfDay = records.filter((r) => r.status === 'half_day').length
    const onLeave = records.filter((r) => r.status === 'on_leave').length

    return HttpResponse.json({
      data: {
        staffId: params.id,
        month,
        year,
        totalWorkingDays,
        present,
        absent,
        halfDay,
        onLeave,
        attendancePercentage: Math.round(((present + halfDay * 0.5) / totalWorkingDays) * 100),
      },
    })
  }),

  // ==================== LEAVE HANDLERS ====================

  // Get staff's leave balance
  http.get('/api/staff/:id/leave-balance', async ({ params, request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()))

    let balance = leaveBalances.find((b) => b.staffId === params.id && b.year === year)

    // Create default balance if not exists
    if (!balance) {
      balance = {
        staffId: params.id as string,
        year,
        EL: { total: 12, used: 0, available: 12 },
        CL: { total: 12, used: 0, available: 12 },
        SL: { total: 10, used: 0, available: 10 },
        PL: { total: 15, used: 0, available: 15 },
      }
      leaveBalances.push(balance)
    }

    return HttpResponse.json({ data: balance })
  }),

  // Get all leave requests (for admin)
  http.get('/api/staff/leave-requests', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const staffId = url.searchParams.get('staffId')

    let filtered = [...leaveRequests]

    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.status === status)
    }

    if (staffId) {
      filtered = filtered.filter((r) => r.staffId === staffId)
    }

    // Sort by applied date descending
    filtered.sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  // Get staff's leave requests
  http.get('/api/staff/:id/leave-requests', async ({ params }) => {
    await mockDelay('read')
    const requests = leaveRequests.filter((r) => r.staffId === params.id)
    return HttpResponse.json({ data: requests })
  }),

  // Create leave request
  http.post('/api/staff/:id/leave-requests', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as {
      type: 'EL' | 'CL' | 'SL' | 'PL'
      startDate: string
      endDate: string
      reason: string
    }

    const staffMember = staff.find((s) => s.id === params.id)
    if (!staffMember) {
      return HttpResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    // Calculate number of days
    const start = new Date(body.startDate)
    const end = new Date(body.endDate)
    const numberOfDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const newRequest: LeaveRequest = {
      id: generateId(),
      staffId: params.id as string,
      staffName: staffMember.name,
      type: body.type,
      startDate: body.startDate,
      endDate: body.endDate,
      reason: body.reason,
      status: 'pending',
      numberOfDays,
      appliedOn: new Date().toISOString(),
    }

    leaveRequests.unshift(newRequest)

    return HttpResponse.json({ data: newRequest }, { status: 201 })
  }),

  // Approve/reject leave request
  http.patch('/api/staff/leave-requests/:id', async ({ params, request }) => {
    await mockDelay('read')
    const body = await request.json() as {
      status: 'approved' | 'rejected'
      rejectionReason?: string
    }

    const requestIndex = leaveRequests.findIndex((r) => r.id === params.id)
    if (requestIndex === -1) {
      return HttpResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    const leaveRequest = leaveRequests[requestIndex]
    const updatedRequest: LeaveRequest = {
      ...leaveRequest,
      status: body.status,
      approvedBy: body.status === 'approved' ? 'Current User' : undefined,
      rejectionReason: body.rejectionReason,
    }

    leaveRequests[requestIndex] = updatedRequest

    // Update leave balance if approved
    if (body.status === 'approved') {
      const balanceIndex = leaveBalances.findIndex(
        (b) => b.staffId === leaveRequest.staffId && b.year === new Date().getFullYear()
      )
      if (balanceIndex >= 0) {
        const balance = leaveBalances[balanceIndex]
        const leaveType = leaveRequest.type
        balance[leaveType].used += leaveRequest.numberOfDays
        balance[leaveType].available -= leaveRequest.numberOfDays
      }
    }

    return HttpResponse.json({ data: updatedRequest })
  }),

  // ==================== SALARY HANDLERS ====================

  // Get staff's salary structure
  http.get('/api/staff/:id/salary-structure', async ({ params }) => {
    await mockDelay('read')
    let structure = salaryStructures.find((s) => s.staffId === params.id)

    if (!structure) {
      const staffMember = staff.find((s) => s.id === params.id)
      if (!staffMember) {
        return HttpResponse.json({ error: 'Staff not found' }, { status: 404 })
      }

      // Create default salary structure
      const basic = Math.round(staffMember.salary * 0.5)
      const hra = Math.round(basic * 0.4)
      const da = Math.round(basic * 0.2)
      const conveyance = 1600
      const specialAllowance = staffMember.salary - basic - hra - da - conveyance
      const gross = staffMember.salary
      const pf = Math.round(basic * 0.12)
      const professionalTax = 200
      const tds = Math.round(staffMember.salary * 0.1)
      const totalDeductions = pf + professionalTax + tds
      const net = gross - totalDeductions

      structure = {
        staffId: params.id as string,
        basic,
        hra,
        da,
        conveyance,
        specialAllowance: Math.max(0, specialAllowance),
        grossSalary: gross,
        pf,
        professionalTax,
        tds,
        totalDeductions,
        netSalary: net,
      }

      salaryStructures.push(structure)
    }

    return HttpResponse.json({ data: structure })
  }),

  // Update salary structure
  http.put('/api/staff/:id/salary-structure', async ({ params, request }) => {
    await mockDelay('read')
    const body = await request.json() as {
      basic: number
      hra: number
      da: number
      conveyance: number
      specialAllowance: number
      pf: number
      professionalTax: number
      tds: number
    }

    const structureIndex = salaryStructures.findIndex((s) => s.staffId === params.id)

    const grossSalary = body.basic + body.hra + body.da + body.conveyance + body.specialAllowance
    const totalDeductions = body.pf + body.professionalTax + body.tds
    const netSalary = grossSalary - totalDeductions

    const structure = {
      staffId: params.id as string,
      ...body,
      grossSalary,
      totalDeductions,
      netSalary,
    }

    if (structureIndex >= 0) {
      salaryStructures[structureIndex] = structure
    } else {
      salaryStructures.push(structure)
    }

    return HttpResponse.json({ data: structure })
  }),

  // Get salary slips
  http.get('/api/staff/:id/salary-slips', async ({ params }) => {
    await mockDelay('read')
    const slips = salarySlips.filter((s) => s.staffId === params.id)
    return HttpResponse.json({ data: slips })
  }),

  // Process monthly salary (bulk)
  http.post('/api/salary/process', async ({ request }) => {
    await mockDelay('heavy')
    const body = await request.json() as {
      month: number
      year: number
      staffIds?: string[]
    }

    const targetStaff = body.staffIds
      ? staff.filter((s) => body.staffIds!.includes(s.id) && s.status === 'active')
      : staff.filter((s) => s.status === 'active')

    const processedSlips: SalarySlip[] = []

    for (const member of targetStaff) {
      // Check if already processed
      const exists = salarySlips.find(
        (s) => s.staffId === member.id && s.month === body.month && s.year === body.year
      )
      if (exists) continue

      // Get salary structure
      let structure = salaryStructures.find((s) => s.staffId === member.id)
      if (!structure) {
        const basic = Math.round(member.salary * 0.5)
        const hra = Math.round(basic * 0.4)
        const da = Math.round(basic * 0.2)
        const conveyance = 1600
        const specialAllowance = Math.max(0, member.salary - basic - hra - da - conveyance)
        const gross = member.salary
        const pf = Math.round(basic * 0.12)
        const professionalTax = 200
        const tds = Math.round(member.salary * 0.1)

        structure = {
          staffId: member.id,
          basic,
          hra,
          da,
          conveyance,
          specialAllowance,
          grossSalary: gross,
          pf,
          professionalTax,
          tds,
          totalDeductions: pf + professionalTax + tds,
          netSalary: gross - (pf + professionalTax + tds),
        }
        salaryStructures.push(structure)
      }

      // Calculate LOP deductions based on attendance
      const attendanceRecords = staffAttendance.filter((a) => {
        const date = new Date(a.date)
        return (
          a.staffId === member.id &&
          date.getMonth() + 1 === body.month &&
          date.getFullYear() === body.year
        )
      })

      const absentDays = attendanceRecords.filter((a) => a.status === 'absent').length
      const perDaySalary = structure.grossSalary / 30
      const lopDeduction = Math.round(absentDays * perDaySalary)

      const slip: SalarySlip = {
        id: generateId(),
        staffId: member.id,
        staffName: member.name,
        month: body.month,
        year: body.year,
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
        status: 'generated',
      }

      salarySlips.push(slip)
      processedSlips.push(slip)
    }

    return HttpResponse.json({
      data: processedSlips,
      message: `Processed salary for ${processedSlips.length} staff members`,
    })
  }),

  // Mark salary as paid
  http.patch('/api/staff/salary-slips/:id/pay', async ({ params }) => {
    await mockDelay('read')
    const slipIndex = salarySlips.findIndex((s) => s.id === params.id)

    if (slipIndex === -1) {
      return HttpResponse.json({ error: 'Salary slip not found' }, { status: 404 })
    }

    salarySlips[slipIndex] = {
      ...salarySlips[slipIndex],
      status: 'paid',
      paidOn: new Date().toISOString(),
    }

    return HttpResponse.json({ data: salarySlips[slipIndex] })
  }),

  // ==================== TIMETABLE HANDLERS ====================

  // Get staff timetable
  http.get('/api/staff/:id/timetable', async ({ params }) => {
    await mockDelay('read')
    const staffMember = staff.find((s) => s.id === params.id)
    if (!staffMember) {
      return HttpResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    const entries = timetableEntries.filter((e) => e.staffId === params.id)
    return HttpResponse.json({
      data: {
        staffId: params.id,
        staffName: staffMember.name,
        entries,
        totalPeriodsPerWeek: entries.length,
      },
    })
  }),

  // Get class timetable
  http.get('/api/timetable/class', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const cls = url.searchParams.get('class')
    const section = url.searchParams.get('section')

    if (!cls || !section) {
      return HttpResponse.json({ error: 'Class and section required' }, { status: 400 })
    }

    const entries = timetableEntries.filter((e) => e.class === cls && e.section === section)
    return HttpResponse.json({
      data: { class: cls, section, entries },
    })
  }),

  // Create/update timetable entry
  http.post('/api/timetable', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as Partial<TimetableEntry>

    const staffMember = staff.find((s) => s.id === body.staffId)
    if (!staffMember) {
      return HttpResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    const entry: TimetableEntry = {
      id: generateId(),
      staffId: body.staffId || '',
      staffName: staffMember.name,
      day: body.day || 'Monday',
      periodNumber: body.periodNumber || 1,
      subject: body.subject || '',
      class: body.class || '',
      section: body.section || '',
      room: body.room,
    }

    timetableEntries.push(entry)
    return HttpResponse.json({ data: entry }, { status: 201 })
  }),

  // Delete timetable entry
  http.delete('/api/timetable/:id', async ({ params }) => {
    await mockDelay('read')
    const index = timetableEntries.findIndex((e) => e.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    timetableEntries.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== SUBSTITUTION HANDLERS ====================

  // Get substitutions
  http.get('/api/staff/substitutions', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const status = url.searchParams.get('status')

    let filtered = [...substitutions]

    if (date) {
      filtered = filtered.filter((s) => s.date === date)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((s) => s.status === status)
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  // Create substitution
  http.post('/api/staff/substitutions', async ({ request }) => {
    await mockDelay('read')
    const body = await request.json() as {
      date: string
      absentStaffId: string
      substituteStaffId: string
      periodNumber: number
      class: string
      section: string
      subject: string
      reason?: string
    }

    const absentStaff = staff.find((s) => s.id === body.absentStaffId)
    const substituteStaff = staff.find((s) => s.id === body.substituteStaffId)

    if (!absentStaff || !substituteStaff) {
      return HttpResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    const sub: SubstitutionRecord = {
      id: generateId(),
      date: body.date,
      absentStaffId: body.absentStaffId,
      absentStaffName: absentStaff.name,
      substituteStaffId: body.substituteStaffId,
      substituteStaffName: substituteStaff.name,
      periodNumber: body.periodNumber,
      class: body.class,
      section: body.section,
      subject: body.subject,
      status: 'assigned',
      reason: body.reason,
      createdAt: new Date().toISOString(),
    }

    substitutions.unshift(sub)
    return HttpResponse.json({ data: sub }, { status: 201 })
  }),

  // Update substitution status
  http.patch('/api/staff/substitutions/:id', async ({ params, request }) => {
    await mockDelay('read')
    const body = await request.json() as { status: SubstitutionRecord['status'] }

    const index = substitutions.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Substitution not found' }, { status: 404 })
    }

    substitutions[index] = { ...substitutions[index], status: body.status }
    return HttpResponse.json({ data: substitutions[index] })
  }),

  // ==================== PERFORMANCE REVIEW HANDLERS ====================

  // Get all performance reviews
  http.get('/api/staff/performance-reviews', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const staffId = url.searchParams.get('staffId')
    const period = url.searchParams.get('period')
    const year = url.searchParams.get('year')

    let filtered = [...performanceReviews]

    if (staffId) {
      filtered = filtered.filter((r) => r.staffId === staffId)
    }

    if (period) {
      filtered = filtered.filter((r) => r.period === period)
    }

    if (year) {
      filtered = filtered.filter((r) => r.year === parseInt(year))
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  // Get staff performance reviews
  http.get('/api/staff/:id/performance-reviews', async ({ params }) => {
    await mockDelay('read')
    const reviews = performanceReviews.filter((r) => r.staffId === params.id)
    return HttpResponse.json({ data: reviews })
  }),

  // Create performance review
  http.post('/api/staff/performance-reviews', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as {
      staffId: string
      period: PerformanceReviewRecord['period']
      year: number
      ratings: { category: string; rating: number; comment?: string }[]
      strengths: string
      areasOfImprovement: string
      goals: string
    }

    const staffMember = staff.find((s) => s.id === body.staffId)
    if (!staffMember) {
      return HttpResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    const overallRating = Number(
      (body.ratings.reduce((sum, r) => sum + r.rating, 0) / body.ratings.length).toFixed(1)
    )

    const review: PerformanceReviewRecord = {
      id: generateId(),
      staffId: body.staffId,
      staffName: staffMember.name,
      reviewerId: 'current-user',
      reviewerName: 'Current User',
      period: body.period,
      year: body.year,
      ratings: body.ratings,
      overallRating,
      strengths: body.strengths,
      areasOfImprovement: body.areasOfImprovement,
      goals: body.goals,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    }

    performanceReviews.unshift(review)
    return HttpResponse.json({ data: review }, { status: 201 })
  }),

  // Acknowledge performance review
  http.patch('/api/staff/performance-reviews/:id/acknowledge', async ({ params }) => {
    await mockDelay('read')
    const index = performanceReviews.findIndex((r) => r.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    performanceReviews[index] = {
      ...performanceReviews[index],
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: performanceReviews[index] })
  }),

  // ==================== PROFESSIONAL DEVELOPMENT HANDLERS ====================

  // Get staff professional development records
  http.get('/api/staff/:id/professional-development', async ({ params }) => {
    await mockDelay('read')
    const records = professionalDevelopments.filter((pd) => pd.staffId === params.id)
    return HttpResponse.json({ data: records })
  }),

  // Get all professional development records
  http.get('/api/staff/professional-development', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')

    let filtered = [...professionalDevelopments]

    if (type && type !== 'all') {
      filtered = filtered.filter((pd) => pd.type === type)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((pd) => pd.status === status)
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return HttpResponse.json({ data: filtered })
  }),

  // Create professional development record
  http.post('/api/staff/:id/professional-development', async ({ params, request }) => {
    await mockDelay('read')
    const body = await request.json() as Omit<PDRecord, 'id' | 'staffId' | 'createdAt'>

    const staffMember = staff.find((s) => s.id === params.id)
    if (!staffMember) {
      return HttpResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    const record: PDRecord = {
      id: generateId(),
      staffId: params.id as string,
      ...body,
      createdAt: new Date().toISOString(),
    }

    professionalDevelopments.unshift(record)
    return HttpResponse.json({ data: record }, { status: 201 })
  }),

  // Update professional development record
  http.put('/api/staff/professional-development/:id', async ({ params, request }) => {
    await mockDelay('read')
    const body = await request.json() as Partial<PDRecord>

    const index = professionalDevelopments.findIndex((pd) => pd.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    professionalDevelopments[index] = { ...professionalDevelopments[index], ...body }
    return HttpResponse.json({ data: professionalDevelopments[index] })
  }),

  // Delete professional development record
  http.delete('/api/staff/professional-development/:id', async ({ params }) => {
    await mockDelay('read')
    const index = professionalDevelopments.findIndex((pd) => pd.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    professionalDevelopments.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== BULK IMPORT HANDLER ====================

  http.post('/api/staff/bulk-import', async ({ request }) => {
    await mockDelay('heavy')
    const body = await request.json() as { rows: Record<string, string>[] }
    const rows = body.rows || []

    const result = {
      total: rows.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ row: number; field: string; message: string }>,
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 1

      // Simulate validation - check for required fields
      if (!row.name?.trim()) {
        result.errors.push({ row: rowNum, field: 'name', message: 'Name is required' })
        result.failed++
        continue
      }
      if (!row.email?.trim()) {
        result.errors.push({ row: rowNum, field: 'email', message: 'Email is required' })
        result.failed++
        continue
      }

      // Simulate some random failures for realistic testing
      if (Math.random() < 0.05) {
        result.errors.push({ row: rowNum, field: 'email', message: 'Duplicate email address' })
        result.failed++
        continue
      }

      // Create the staff member
      const joiningYear = new Date().getFullYear()
      const count = staff.length + 1

      const newStaff: Staff = {
        id: generateId(),
        employeeId: `EMP${joiningYear}${String(count).padStart(4, '0')}`,
        name: row.name.trim(),
        email: row.email.trim(),
        phone: row.phone?.trim() || '',
        dateOfBirth: row.dateOfBirth || '1990-01-01',
        gender: (row.gender?.toLowerCase() === 'female' ? 'female' : 'male') as 'male' | 'female',
        department: row.department || 'Administration',
        designation: row.designation || 'Teacher',
        joiningDate: row.joiningDate || new Date().toISOString().split('T')[0],
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name.trim())}&background=random`,
        qualification: row.qualification ? row.qualification.split(',').map(q => q.trim()) : [],
        specialization: row.specialization || '',
        salary: row.salary ? parseFloat(row.salary) : 30000,
        address: {
          street: row.street || '',
          city: row.city || 'Delhi',
          state: row.state || 'Delhi',
          pincode: row.pincode || '110001',
        },
        status: 'active',
      }

      staff.push(newStaff)
      result.successful++
    }

    return HttpResponse.json({ data: result })
  }),

  // ==================== EXPORT HANDLER ====================

  http.get('/api/staff/export', async ({ request }) => {
    await mockDelay('heavy')
    const url = new URL(request.url)
    const departmentFilter = url.searchParams.get('department')
    const statusFilter = url.searchParams.get('status')

    let filtered = staff.filter((s) => s.status === 'active')
    if (departmentFilter) filtered = filtered.filter((s) => s.department === departmentFilter)
    if (statusFilter) filtered = filtered.filter((s) => s.status === statusFilter)

    const exportData = filtered.map((s) => ({
      employeeId: s.employeeId,
      name: s.name,
      email: s.email,
      phone: s.phone,
      dateOfBirth: s.dateOfBirth,
      gender: s.gender,
      department: s.department,
      designation: s.designation,
      joiningDate: s.joiningDate,
      qualification: Array.isArray(s.qualification) ? s.qualification.join(', ') : s.qualification,
      specialization: s.specialization,
      salary: s.salary,
      address: `${s.address.street}, ${s.address.city}, ${s.address.state} - ${s.address.pincode}`,
      status: s.status,
    }))

    return HttpResponse.json({ data: exportData })
  }),

  // ==================== PAYROLL DEDUCTIONS ====================

  http.get('/api/staff/:id/payroll-deductions', async ({ params }) => {
    await mockDelay('read')
    const staffMember = staff.find((s) => s.id === params.id)
    if (!staffMember) {
      return HttpResponse.json({ error: 'Staff not found' }, { status: 404 })
    }
    return HttpResponse.json({
      data: [
        { id: generateId(), staffId: params.id, type: 'pf', name: 'Provident Fund', amount: 12, isPercentage: true, percentageOf: 'basic', effectiveFrom: '2024-04-01', isRecurring: true, status: 'active' },
        { id: generateId(), staffId: params.id, type: 'professional_tax', name: 'Professional Tax', amount: 200, isPercentage: false, effectiveFrom: '2024-04-01', isRecurring: true, status: 'active' },
      ],
    })
  }),

  http.post('/api/staff/:id/payroll-deductions', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { id: generateId(), staffId: params.id, ...body } }, { status: 201 })
  }),

  http.put('/api/staff/:id/payroll-deductions/:deductionId', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { id: params.deductionId, staffId: params.id, ...body } })
  }),

  // ==================== EMPLOYEE BENEFITS ====================

  http.get('/api/staff/:id/benefits', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({
      data: [
        { id: generateId(), staffId: params.id, type: 'health_insurance', name: 'Group Health Insurance', provider: 'ICICI Lombard', coverageAmount: 500000, employerContribution: 1500, employeeContribution: 500, startDate: '2024-04-01', status: 'active' },
      ],
    })
  }),

  http.post('/api/staff/:id/benefits', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { id: generateId(), staffId: params.id, ...body } }, { status: 201 })
  }),

  http.put('/api/staff/:id/benefits/:benefitId', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { id: params.benefitId, staffId: params.id, ...body } })
  }),

  // ==================== LOAN ADVANCES ====================

  http.get('/api/staff/:id/loans', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({ data: [] })
  }),

  http.post('/api/staff/:id/loans', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const loan = {
      id: generateId(),
      staffId: params.id,
      ...body,
      paidInstallments: 0,
      remainingAmount: body.amount,
      deductions: [],
      status: 'approved',
    }
    return HttpResponse.json({ data: loan }, { status: 201 })
  }),

  http.put('/api/staff/:id/loans/:loanId', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { id: params.loanId, staffId: params.id, ...body } })
  }),

  // ==================== TIME-OFF ACCRUAL ====================

  http.get('/api/staff/:id/time-off-accrual', async ({ params, request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const year = parseInt(url.searchParams.get('year') || '2024')
    return HttpResponse.json({
      data: [
        { staffId: params.id, leaveType: 'EL', year, accrued: 15, used: 5, carriedForward: 3, forfeited: 0, available: 13, history: [] },
        { staffId: params.id, leaveType: 'CL', year, accrued: 12, used: 4, carriedForward: 0, forfeited: 0, available: 8, history: [] },
        { staffId: params.id, leaveType: 'SL', year, accrued: 10, used: 2, carriedForward: 0, forfeited: 0, available: 8, history: [] },
      ],
    })
  }),

  http.post('/api/staff/:id/time-off-accrual/adjust', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({
      data: { staffId: params.id, leaveType: body.leaveType, year: 2024, accrued: 15, used: 5, carriedForward: 3, forfeited: 0, available: 13 + body.amount, history: [] },
    })
  }),

  // ==================== ONBOARDING ====================

  http.get('/api/staff/onboarding/tasks', async () => {
    await mockDelay('read')
    return HttpResponse.json({
      data: [
        { id: '1', category: 'documentation', name: 'Submit ID proof', description: 'Upload government-issued ID', assignedTo: 'employee', dueInDays: 3, isMandatory: true, order: 1 },
        { id: '2', category: 'documentation', name: 'Submit bank details', description: 'Provide bank account information', assignedTo: 'employee', dueInDays: 3, isMandatory: true, order: 2 },
        { id: '3', category: 'access', name: 'Create email account', description: 'Set up official email', assignedTo: 'it', dueInDays: 1, isMandatory: true, order: 3 },
        { id: '4', category: 'training', name: 'Complete orientation', description: 'Attend orientation session', assignedTo: 'hr', dueInDays: 7, isMandatory: true, order: 4 },
        { id: '5', category: 'equipment', name: 'Issue ID card', description: 'Create and issue employee ID', assignedTo: 'admin', dueInDays: 5, isMandatory: true, order: 5 },
      ],
    })
  }),

  http.get('/api/staff/onboarding', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const checklists = staff.slice(0, 3).map(s => ({
      id: generateId(),
      staffId: s.id,
      staffName: s.name,
      joiningDate: s.joiningDate,
      status: 'in_progress',
      assignedHR: 'HR Manager',
      assignedManager: 'Department Head',
      tasks: [
        { taskId: '1', taskName: 'Submit ID proof', category: 'documentation', assignedTo: 'employee', status: 'completed', dueDate: '2024-01-10', completedDate: '2024-01-08' },
        { taskId: '2', taskName: 'Submit bank details', category: 'documentation', assignedTo: 'employee', status: 'completed', dueDate: '2024-01-10' },
        { taskId: '3', taskName: 'Create email account', category: 'access', assignedTo: 'it', status: 'in_progress', dueDate: '2024-01-08' },
      ],
      progress: 67,
      startDate: s.joiningDate,
      targetCompletionDate: '2024-01-15',
    }))
    return HttpResponse.json({ data: status ? checklists.filter(c => c.status === status) : checklists })
  }),

  http.get('/api/staff/:id/onboarding', async ({ params }) => {
    await mockDelay('read')
    const staffMember = staff.find((s) => s.id === params.id)
    if (!staffMember) {
      return HttpResponse.json({ data: null })
    }
    return HttpResponse.json({
      data: {
        id: generateId(),
        staffId: params.id,
        staffName: staffMember.name,
        joiningDate: staffMember.joiningDate,
        status: 'completed',
        assignedHR: 'HR Manager',
        assignedManager: 'Department Head',
        tasks: [],
        progress: 100,
        startDate: staffMember.joiningDate,
        targetCompletionDate: '2024-01-15',
        actualCompletionDate: '2024-01-14',
      },
    })
  }),

  http.post('/api/staff/:id/onboarding', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const staffMember = staff.find((s) => s.id === params.id)
    return HttpResponse.json({
      data: {
        id: generateId(),
        staffId: params.id,
        staffName: staffMember?.name || '',
        ...body,
        status: 'in_progress',
        tasks: [],
        progress: 0,
        startDate: new Date().toISOString(),
        targetCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }, { status: 201 })
  }),

  http.patch('/api/staff/:id/onboarding/tasks/:taskId', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { taskId: params.taskId, ...body, completedDate: body.status === 'completed' ? new Date().toISOString() : undefined } })
  }),

  // ==================== EXIT INTERVIEW ====================

  http.get('/api/staff/exit-interviews', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const resignedStaff = staff.filter(s => s.status === 'resigned').slice(0, 3)
    const interviews = resignedStaff.map(s => ({
      id: generateId(),
      staffId: s.id,
      staffName: s.name,
      department: s.department,
      designation: s.designation,
      joiningDate: s.joiningDate,
      lastWorkingDate: new Date().toISOString(),
      separationType: 'resignation',
      interviewDate: new Date().toISOString(),
      interviewedBy: 'HR Manager',
      ratings: [],
      reasonForLeaving: ['Better opportunity', 'Career growth'],
      wouldRecommend: true,
      wouldRejoin: true,
      suggestions: 'More training opportunities',
      bestPart: 'Work culture',
      improvements: 'Better facilities',
      handoverStatus: 'completed',
      clearanceStatus: [],
      fnfStatus: 'pending',
      isConfidential: true,
      status: 'completed',
    }))
    return HttpResponse.json({ data: status ? interviews.filter(i => i.status === status) : interviews })
  }),

  http.get('/api/staff/:id/exit-interview', async ({ params }) => {
    await mockDelay('read')
    const staffMember = staff.find((s) => s.id === params.id)
    if (!staffMember || staffMember.status !== 'resigned') {
      return HttpResponse.json({ data: null })
    }
    return HttpResponse.json({
      data: {
        id: generateId(),
        staffId: params.id,
        staffName: staffMember.name,
        department: staffMember.department,
        designation: staffMember.designation,
        joiningDate: staffMember.joiningDate,
        lastWorkingDate: new Date().toISOString(),
        separationType: 'resignation',
        status: 'scheduled',
      },
    })
  }),

  http.post('/api/staff/:id/exit-interview', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    const staffMember = staff.find((s) => s.id === params.id)
    return HttpResponse.json({
      data: {
        id: generateId(),
        staffId: params.id,
        staffName: staffMember?.name || '',
        department: staffMember?.department || '',
        designation: staffMember?.designation || '',
        joiningDate: staffMember?.joiningDate || '',
        ...body,
      },
    }, { status: 201 })
  }),

  http.put('/api/staff/:id/exit-interview', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { id: generateId(), staffId: params.id, ...body } })
  }),

  http.patch('/api/staff/:id/exit-interview/clearance/:department', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { department: params.department, clearedDate: new Date().toISOString(), ...body } })
  }),

  // ==================== SKILLS & CERTIFICATIONS ====================

  http.get('/api/staff/:id/skills', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({
      data: [
        { id: generateId(), staffId: params.id, skillName: 'Mathematics', category: 'domain', proficiency: 'expert', yearsOfExperience: 10, selfAssessed: false, verifiedBy: 'Principal', verifiedDate: '2024-01-01' },
        { id: generateId(), staffId: params.id, skillName: 'Python', category: 'technical', proficiency: 'intermediate', yearsOfExperience: 3, selfAssessed: true },
        { id: generateId(), staffId: params.id, skillName: 'Public Speaking', category: 'soft', proficiency: 'advanced', yearsOfExperience: 8, selfAssessed: true },
      ],
    })
  }),

  http.post('/api/staff/:id/skills', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { id: generateId(), staffId: params.id, ...body } }, { status: 201 })
  }),

  http.put('/api/staff/:id/skills/:skillId', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { id: params.skillId, staffId: params.id, ...body } })
  }),

  http.delete('/api/staff/:id/skills/:skillId', async () => {
    await mockDelay('write')
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/staff/:id/certifications', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({
      data: [
        { id: generateId(), staffId: params.id, name: 'B.Ed', issuingOrganization: 'University of Delhi', issueDate: '2015-06-15', doesNotExpire: true, status: 'active', category: 'teaching', reminderSent: false },
        { id: generateId(), staffId: params.id, name: 'First Aid Certified', issuingOrganization: 'Red Cross', issueDate: '2023-01-15', expiryDate: '2025-01-15', doesNotExpire: false, status: 'active', category: 'safety', reminderSent: false },
      ],
    })
  }),

  http.post('/api/staff/:id/certifications', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { id: generateId(), staffId: params.id, status: 'active', reminderSent: false, ...body } }, { status: 201 })
  }),

  http.put('/api/staff/:id/certifications/:certId', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { id: params.certId, staffId: params.id, ...body } })
  }),

  http.delete('/api/staff/:id/certifications/:certId', async () => {
    await mockDelay('write')
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/staff/certifications/expiry-alerts', async () => {
    await mockDelay('read')
    const alerts = staff.slice(0, 5).map((s, i) => ({
      staffId: s.id,
      staffName: s.name,
      certificationId: generateId(),
      certificationName: ['First Aid', 'Fire Safety', 'Child Protection'][i % 3],
      expiryDate: new Date(Date.now() + (i * 10 + 5) * 24 * 60 * 60 * 1000).toISOString(),
      daysUntilExpiry: i * 10 + 5,
      status: i < 2 ? 'expiring_soon' : 'upcoming',
    }))
    return HttpResponse.json({ data: alerts })
  }),

  http.get('/api/staff/:id/skill-gaps', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({
      data: [
        { staffId: params.id, requiredSkill: 'Digital Teaching Tools', currentProficiency: 'beginner', requiredProficiency: 'intermediate', gap: 1, priority: 'high', recommendedTraining: 'EdTech Workshop' },
        { staffId: params.id, requiredSkill: 'Student Assessment', currentProficiency: 'intermediate', requiredProficiency: 'advanced', gap: 1, priority: 'medium' },
      ],
    })
  }),

  http.get('/api/staff/skills-matrix', async () => {
    await mockDelay('read')
    const matrix = staff.slice(0, 10).map(s => ({
      staffId: s.id,
      staffName: s.name,
      department: s.department,
      skills: [
        { skillName: 'Teaching', category: 'domain', proficiency: 'expert' },
        { skillName: 'Communication', category: 'soft', proficiency: 'advanced' },
      ],
    }))
    return HttpResponse.json({ data: matrix })
  }),

  // ==================== WORK SCHEDULE PREFERENCES ====================

  http.get('/api/staff/:id/schedule-preference', async ({ params }) => {
    await mockDelay('read')
    return HttpResponse.json({
      data: {
        staffId: params.id,
        preferredWorkMode: 'on_site',
        currentWorkMode: 'on_site',
        preferredShift: 'morning',
        currentShift: 'morning',
        preferredWorkingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        flexibleHours: false,
        preferredStartTime: '08:00',
        preferredEndTime: '16:00',
        remoteCapable: true,
        equipmentAtHome: true,
        approvalStatus: 'approved',
      },
    })
  }),

  http.put('/api/staff/:id/schedule-preference', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { staffId: params.id, ...body } })
  }),

  http.post('/api/staff/:id/schedule-preference/request', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { staffId: params.id, ...body, approvalStatus: 'pending' } })
  }),

  http.patch('/api/staff/:id/schedule-preference/approve', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({
      data: {
        staffId: params.id,
        approvalStatus: body.approved ? 'approved' : 'rejected',
        approvedBy: 'Admin',
        approvalDate: new Date().toISOString(),
        effectiveFrom: body.effectiveFrom,
      },
    })
  }),

  http.get('/api/staff/shift-schedules', async () => {
    await mockDelay('read')
    const schedules = staff.slice(0, 5).map(s => ({
      id: generateId(),
      staffId: s.id,
      staffName: s.name,
      week: '2024-W05',
      schedules: [
        { day: 'Monday', shift: 'morning', workMode: 'on_site', startTime: '08:00', endTime: '16:00', isOverride: false },
        { day: 'Tuesday', shift: 'morning', workMode: 'on_site', startTime: '08:00', endTime: '16:00', isOverride: false },
        { day: 'Wednesday', shift: 'morning', workMode: 'on_site', startTime: '08:00', endTime: '16:00', isOverride: false },
        { day: 'Thursday', shift: 'morning', workMode: 'on_site', startTime: '08:00', endTime: '16:00', isOverride: false },
        { day: 'Friday', shift: 'morning', workMode: 'on_site', startTime: '08:00', endTime: '16:00', isOverride: false },
      ],
      status: 'active',
      createdBy: 'Admin',
      createdAt: new Date().toISOString(),
    }))
    return HttpResponse.json({ data: schedules })
  }),

  http.post('/api/staff/shift-schedules', async ({ request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { id: generateId(), createdAt: new Date().toISOString(), ...body } }, { status: 201 })
  }),

  http.put('/api/staff/shift-schedules/:scheduleId', async ({ params, request }) => {
    await mockDelay('write')
    const body = await request.json() as any
    return HttpResponse.json({ data: { id: params.scheduleId, ...body } })
  }),
]
