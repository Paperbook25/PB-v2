import { prisma } from '../config/db.js'

// ==================== Enum / Label Mappings ====================

const paymentModeLabels: Record<string, string> = {
  pm_cash: 'Cash',
  pm_upi: 'UPI',
  pm_online: 'Online',
  pm_bank_transfer: 'Bank Transfer',
  pm_cheque: 'Cheque',
  pm_dd: 'DD',
}

const paymentModeColors: Record<string, string> = {
  pm_upi: '#3b82f6',
  pm_cash: '#22c55e',
  pm_online: '#6d28d9',
  pm_bank_transfer: '#f59e0b',
  pm_cheque: '#64748b',
  pm_dd: '#ec4899',
}

const calendarTypeMap: Record<string, { type: string; priority: string }> = {
  exam: { type: 'exam', priority: 'high' },
  holiday: { type: 'holiday', priority: 'low' },
  ptm: { type: 'meeting', priority: 'medium' },
  sports: { type: 'event', priority: 'low' },
  cultural: { type: 'event', priority: 'low' },
  workshop: { type: 'event', priority: 'medium' },
  vacation: { type: 'holiday', priority: 'low' },
  other: { type: 'event', priority: 'low' },
}

const dayOfWeekMap: Record<number, string> = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
}

// ==================== Helpers ====================

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function monthLabel(d: Date): string {
  return d.toLocaleString('en-US', { month: 'short' })
}

// ==================== ADMIN / PRINCIPAL (11 endpoints) — REAL DATA ====================

export async function getStats(schoolId: string) {
  const today = startOfDay(new Date())
  const firstOfMonth = startOfMonth(new Date())

  const [
    totalStudents,
    totalStaff,
    totalCollected,
    pendingFees,
    todayAttendance,
    newAdmissions,
  ] = await Promise.all([
    prisma.student.count({ where: { organizationId: schoolId, status: 'active' } }),
    prisma.staff.count({ where: { organizationId: schoolId, status: 'active' } }),
    prisma.payment.aggregate({ where: { organizationId: schoolId }, _sum: { amount: true } }),
    prisma.studentFee.aggregate({
      where: { organizationId: schoolId, status: { in: ['fps_pending', 'fps_partial', 'fps_overdue'] } },
      _sum: { totalAmount: true, paidAmount: true, discountAmount: true },
    }),
    prisma.studentDailyAttendance.findMany({
      where: { organizationId: schoolId, date: today },
    }),
    prisma.student.count({
      where: { organizationId: schoolId, admissionDate: { gte: firstOfMonth }, status: 'active' },
    }),
  ])

  const totalPresent = todayAttendance.reduce((s, a) => s + a.presentCount, 0)
  const totalInAttendance = todayAttendance.reduce((s, a) => s + a.totalStudents, 0)
  const attendanceToday = totalInAttendance > 0
    ? Math.round((totalPresent / totalInAttendance) * 1000) / 10
    : 0

  const pendingAmount = Number(pendingFees._sum.totalAmount || 0)
    - Number(pendingFees._sum.paidAmount || 0)
    - Number(pendingFees._sum.discountAmount || 0)

  return {
    totalStudents,
    activeStudents: totalStudents,
    totalStaff,
    activeStaff: totalStaff,
    totalFeeCollected: Number(totalCollected._sum.amount || 0),
    pendingFees: pendingAmount,
    attendanceToday,
    newAdmissions,
  }
}

export async function getFeeCollection(schoolId: string) {
  const now = new Date()
  const months: { month: string; collected: number; pending: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const label = monthLabel(d)

    const [collected, pendingFees] = await Promise.all([
      prisma.payment.aggregate({
        where: { organizationId: schoolId, collectedAt: { gte: d, lt: nextMonth } },
        _sum: { amount: true },
      }),
      prisma.studentFee.aggregate({
        where: {
          organizationId: schoolId,
          status: { in: ['fps_pending', 'fps_partial', 'fps_overdue'] },
          dueDate: { gte: d, lt: nextMonth },
        },
        _sum: { totalAmount: true, paidAmount: true, discountAmount: true },
      }),
    ])

    const pendingAmount = Number(pendingFees._sum.totalAmount || 0)
      - Number(pendingFees._sum.paidAmount || 0)
      - Number(pendingFees._sum.discountAmount || 0)

    months.push({
      month: label,
      collected: Number(collected._sum.amount || 0),
      pending: Math.max(0, pendingAmount),
    })
  }

  return months
}

export async function getAttendance(schoolId: string) {
  const today = new Date()
  const days: { day: string; present: number; absent: number }[] = []
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateOnly = startOfDay(d)

    const records = await prisma.studentDailyAttendance.findMany({
      where: { organizationId: schoolId, date: dateOnly },
    })

    const totalPresent = records.reduce((s, r) => s + r.presentCount, 0)
    const totalStudents = records.reduce((s, r) => s + r.totalStudents, 0)

    days.push({
      day: dayLabels[d.getDay()],
      present: totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0,
      absent: totalStudents > 0 ? Math.round(((totalStudents - totalPresent) / totalStudents) * 100) : 0,
    })
  }

  return days
}

export async function getClassWiseStudents(schoolId: string) {
  const classes = await prisma.class.findMany({
    where: { organizationId: schoolId },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { students: true } } },
  })

  return classes.map((c) => ({
    name: c.name.replace('Class ', ''),
    students: c._count.students,
  }))
}

export async function getAnnouncements(schoolId: string) {
  const events = await prisma.calendarEvent.findMany({
    where: { organizationId: schoolId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return events.map((e) => {
    const mapped = calendarTypeMap[e.type] || calendarTypeMap.other
    return {
      id: e.id,
      title: e.title,
      content: e.description || '',
      priority: mapped.priority,
      createdAt: e.createdAt.toISOString(),
      createdBy: 'Administration',
    }
  })
}

export async function getEvents(schoolId: string) {
  const today = startOfDay(new Date())

  const events = await prisma.calendarEvent.findMany({
    where: { organizationId: schoolId, startDate: { gte: today } },
    orderBy: { startDate: 'asc' },
    take: 10,
  })

  return events.map((e) => {
    const mapped = calendarTypeMap[e.type] || calendarTypeMap.other
    return {
      id: e.id,
      title: e.title,
      date: e.startDate.toISOString(),
      type: mapped.type,
      description: e.description || '',
    }
  })
}

export async function getActivities(schoolId: string) {
  const logs = await prisma.auditLog.findMany({
    where: { schoolId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return logs.map((l) => ({
    id: l.id,
    action: l.action,
    description: l.description || `${l.action} on ${l.entityType}`,
    timestamp: l.createdAt.toISOString(),
    user: { name: l.userName || 'System', avatar: '' },
  }))
}

export async function getQuickStats(schoolId: string) {
  const today = new Date()
  const todayMonth = today.getMonth()
  const todayDay = today.getDate()

  // Birthdays today
  const allStudents = await prisma.student.findMany({
    where: { organizationId: schoolId, status: 'active', dateOfBirth: { not: null } },
    select: { dateOfBirth: true },
  })
  const todayBirthdays = allStudents.filter((s) => {
    if (!s.dateOfBirth) return false
    const dob = new Date(s.dateOfBirth)
    return dob.getMonth() === todayMonth && dob.getDate() === todayDay
  }).length

  const [pendingLeaveRequests, upcomingExams] = await Promise.all([
    prisma.leaveRequest.count({ where: { organizationId: schoolId, status: 'leave_pending' } }),
    prisma.calendarEvent.count({
      where: { organizationId: schoolId, type: 'exam', startDate: { gte: startOfDay(today) } },
    }),
  ])

  return {
    todayBirthdays,
    pendingLeaveRequests,
    overdueBooks: 0, // Library module not yet implemented
    upcomingExams,
  }
}

export async function getPaymentMethods(schoolId: string) {
  const payments = await prisma.payment.groupBy({
    by: ['paymentMode'],
    where: { organizationId: schoolId },
    _sum: { amount: true },
  })

  return payments.map((p) => ({
    name: paymentModeLabels[p.paymentMode] || p.paymentMode,
    value: Number(p._sum.amount || 0),
    color: paymentModeColors[p.paymentMode] || '#94a3b8',
  }))
}

export async function getFeeTransactions(schoolId: string) {
  const payments = await prisma.payment.findMany({
    where: { organizationId: schoolId },
    orderBy: { collectedAt: 'desc' },
    take: 10,
    include: {
      student: { include: { class: true, section: true } },
    },
  })

  return payments.map((p) => ({
    id: p.id,
    studentName: `${p.student.firstName} ${p.student.lastName}`,
    class: `${p.student.class?.name || ''}${p.student.section ? '-' + p.student.section.name : ''}`.replace('Class ', ''),
    amount: Number(p.amount),
    paymentMethod: paymentModeLabels[p.paymentMode] || p.paymentMode,
    timestamp: p.collectedAt.toISOString(),
    status: 'success' as const,
  }))
}

export async function getClassWiseCollection(schoolId: string) {
  const classes = await prisma.class.findMany({
    where: { organizationId: schoolId },
    orderBy: { sortOrder: 'asc' },
    include: {
      students: {
        where: { status: 'active' },
        select: { id: true },
      },
    },
  })

  const results = []
  for (const cls of classes) {
    const studentIds = cls.students.map((s) => s.id)
    if (studentIds.length === 0) continue

    const [collected, total] = await Promise.all([
      prisma.payment.aggregate({
        where: { organizationId: schoolId, studentId: { in: studentIds } },
        _sum: { amount: true },
      }),
      prisma.studentFee.aggregate({
        where: { organizationId: schoolId, studentId: { in: studentIds } },
        _sum: { totalAmount: true },
      }),
    ])

    const collectedAmt = Number(collected._sum.amount || 0)
    const targetAmt = Number(total._sum.totalAmount || 0)

    results.push({
      class: cls.name,
      collected: collectedAmt,
      target: targetAmt,
      percentage: targetAmt > 0 ? Math.round((collectedAmt / targetAmt) * 100) : 0,
    })
  }

  return results
}

// ==================== ACCOUNTANT (5 endpoints) — REAL DATA ====================

export async function getAccountantStats(schoolId: string) {
  const today = startOfDay(new Date())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const firstOfMonth = startOfMonth(new Date())
  const firstOfLastMonth = new Date(firstOfMonth)
  firstOfLastMonth.setMonth(firstOfLastMonth.getMonth() - 1)

  const [
    todayPayments,
    pendingFees,
    monthPayments,
    lastMonthPayments,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { organizationId: schoolId, collectedAt: { gte: today, lt: tomorrow } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.studentFee.aggregate({
      where: { organizationId: schoolId, status: { in: ['fps_pending', 'fps_partial', 'fps_overdue'] } },
      _sum: { totalAmount: true, paidAmount: true, discountAmount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { organizationId: schoolId, collectedAt: { gte: firstOfMonth } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { organizationId: schoolId, collectedAt: { gte: firstOfLastMonth, lt: firstOfMonth } },
      _sum: { amount: true },
    }),
  ])

  const totalPending = Number(pendingFees._sum.totalAmount || 0)
    - Number(pendingFees._sum.paidAmount || 0)
    - Number(pendingFees._sum.discountAmount || 0)
  const monthAmount = Number(monthPayments._sum.amount || 0)
  const lastMonthAmount = Number(lastMonthPayments._sum.amount || 0)
  const monthGrowth = lastMonthAmount > 0
    ? Math.round(((monthAmount - lastMonthAmount) / lastMonthAmount) * 100)
    : 0

  // Collection rate
  const totalFees = await prisma.studentFee.aggregate({ where: { organizationId: schoolId }, _sum: { totalAmount: true } })
  const totalCollected = await prisma.payment.aggregate({ where: { organizationId: schoolId }, _sum: { amount: true } })
  const totalFeeAmt = Number(totalFees._sum.totalAmount || 0)
  const collectionRate = totalFeeAmt > 0
    ? Math.round((Number(totalCollected._sum.amount || 0) / totalFeeAmt) * 100)
    : 0

  return {
    todayCollection: Number(todayPayments._sum.amount || 0),
    todayReceipts: todayPayments._count || 0,
    totalPending: Math.max(0, totalPending),
    studentsWithDues: pendingFees._count || 0,
    monthCollection: monthAmount,
    monthGrowth,
    collectionRate,
  }
}

export async function getTodayCollection(schoolId: string) {
  const today = startOfDay(new Date())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const payments = await prisma.payment.findMany({
    where: { organizationId: schoolId, collectedAt: { gte: today, lt: tomorrow } },
  })

  let total = 0
  let cash = 0
  let online = 0
  let cheque = 0

  for (const p of payments) {
    const amt = Number(p.amount)
    total += amt
    if (p.paymentMode === 'pm_cash') cash += amt
    else if (p.paymentMode === 'pm_cheque' || p.paymentMode === 'pm_dd') cheque += amt
    else online += amt // upi, online, bank_transfer
  }

  return {
    total,
    receipts: payments.length,
    cash,
    online,
    cheque,
  }
}

export async function getCollectionTrends(schoolId: string) {
  const today = new Date()
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const trends = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStart = startOfDay(d)
    const dateEnd = new Date(dateStart)
    dateEnd.setDate(dateEnd.getDate() + 1)

    const result = await prisma.payment.aggregate({
      where: { organizationId: schoolId, collectedAt: { gte: dateStart, lt: dateEnd } },
      _sum: { amount: true },
    })

    trends.push({
      day: dayLabels[d.getDay()],
      amount: Number(result._sum.amount || 0),
    })
  }

  return trends
}

export async function getPendingDues(schoolId: string) {
  const overdueFees = await prisma.studentFee.findMany({
    where: { organizationId: schoolId, status: { in: ['fps_overdue', 'fps_pending', 'fps_partial'] } },
    include: {
      student: { include: { class: true, section: true } },
    },
    orderBy: { totalAmount: 'desc' },
    take: 10,
  })

  const today = new Date()

  return overdueFees.map((f) => {
    const due = Number(f.totalAmount) - Number(f.paidAmount) - Number(f.discountAmount)
    const daysOverdue = f.dueDate
      ? Math.max(0, Math.floor((today.getTime() - new Date(f.dueDate).getTime()) / 86400000))
      : 0

    return {
      studentId: f.studentId,
      studentName: `${f.student.firstName} ${f.student.lastName}`,
      className: f.student.class?.name || '',
      section: f.student.section?.name || '',
      amount: Math.max(0, due),
      daysOverdue,
    }
  })
}

export async function getRecentTransactions(schoolId: string) {
  const payments = await prisma.payment.findMany({
    where: { organizationId: schoolId },
    orderBy: { collectedAt: 'desc' },
    take: 10,
    include: {
      student: true,
      studentFee: { include: { feeStructure: { include: { feeType: true } } } },
    },
  })

  return payments.map((p) => ({
    id: p.id,
    studentName: `${p.student.firstName} ${p.student.lastName}`,
    feeType: p.studentFee?.feeStructure?.feeType?.name || 'Fee',
    amount: Number(p.amount),
    mode: paymentModeLabels[p.paymentMode] || p.paymentMode,
    date: p.collectedAt.toISOString(),
  }))
}

// ==================== TEACHER (7 endpoints) — 5 REAL + 2 STUB ====================

async function resolveStaffFromUser(schoolId: string, userId: string) {
  return prisma.staff.findFirst({ where: { organizationId: schoolId, userId } })
}

function getTodayDayOfWeek(): string | null {
  const jsDay = new Date().getDay() // 0=Sun, 1=Mon...6=Sat
  return dayOfWeekMap[jsDay] || null // Sunday → null
}

export async function getTeacherStats(schoolId: string, userId: string) {
  const staff = await resolveStaffFromUser(schoolId, userId)
  if (!staff) {
    return {
      totalClasses: 0, classesToday: 0, attendanceMarked: 0,
      attendancePending: 0, leaveBalance: 0, averageClassStrength: 0,
      pendingMarksEntry: 0, upcomingPTMs: 0,
    }
  }

  const todayDow = getTodayDayOfWeek()
  const today = startOfDay(new Date())

  // All timetable entries for this teacher
  const allEntries = await prisma.timetableEntry.findMany({
    where: { organizationId: schoolId, teacherId: staff.id, subject: { isNot: null } },
    include: { timetable: { include: { class: true, section: true } } },
  })

  // Today's entries
  const todayEntries = todayDow
    ? allEntries.filter((e) => e.dayOfWeek === todayDow)
    : []

  // Unique classes this teacher teaches
  const uniqueClasses = new Set(allEntries.map((e) => `${e.timetable.classId}-${e.timetable.sectionId}`))

  // Attendance marked today for this teacher's classes
  const todayClassPairs = todayEntries.map((e) => ({
    classId: e.timetable.classId,
    sectionId: e.timetable.sectionId,
  }))
  const uniqueTodayPairs = [...new Map(todayClassPairs.map((p) => [`${p.classId}-${p.sectionId}`, p])).values()]

  let attendanceMarked = 0
  for (const pair of uniqueTodayPairs) {
    const count = await prisma.studentDailyAttendance.count({
      where: { organizationId: schoolId, date: today, classId: pair.classId, sectionId: pair.sectionId },
    })
    if (count > 0) attendanceMarked++
  }

  // Leave balance
  const currentYear = await prisma.academicYear.findFirst({ where: { organizationId: schoolId, isCurrent: true } })
  let leaveBalance = 0
  if (currentYear) {
    const balances = await prisma.leaveBalance.findMany({
      where: { organizationId: schoolId, staffId: staff.id, academicYearId: currentYear.id },
    })
    leaveBalance = balances.reduce((s, b) => s + (b.total - b.used), 0)
  }

  // Average class strength
  const classIds = [...new Set(allEntries.map((e) => e.timetable.classId))]
  const studentCount = classIds.length > 0
    ? await prisma.student.count({ where: { organizationId: schoolId, classId: { in: classIds }, status: 'active' } })
    : 0
  const avgStrength = uniqueClasses.size > 0 ? Math.round(studentCount / uniqueClasses.size) : 0

  // Upcoming PTMs
  const upcomingPTMs = await prisma.calendarEvent.count({
    where: { organizationId: schoolId, type: 'ptm', startDate: { gte: today } },
  })

  return {
    totalClasses: uniqueClasses.size,
    classesToday: todayEntries.length,
    attendanceMarked,
    attendancePending: uniqueTodayPairs.length - attendanceMarked,
    leaveBalance,
    averageClassStrength: avgStrength,
    pendingMarksEntry: 0, // Exams module not yet implemented
    upcomingPTMs,
  }
}

export async function getTeacherSchedule(schoolId: string, userId: string) {
  const staff = await resolveStaffFromUser(schoolId, userId)
  if (!staff) return []

  const todayDow = getTodayDayOfWeek()
  if (!todayDow) return []

  const entries = await prisma.timetableEntry.findMany({
    where: { organizationId: schoolId, teacherId: staff.id, dayOfWeek: todayDow as any },
    include: {
      period: true,
      subject: true,
      room: true,
      timetable: { include: { class: true, section: true } },
    },
    orderBy: { period: { periodNumber: 'asc' } },
  })

  return entries.map((e) => {
    const periodType = e.period.type
    let type: 'lecture' | 'free' | 'extra' | 'duty' = 'lecture'
    if (periodType === 'period_break' || periodType === 'period_lunch') type = 'free'
    else if (periodType === 'period_activity') type = 'extra'
    else if (periodType === 'period_assembly') type = 'duty'

    return {
      period: e.period.periodNumber,
      time: `${e.period.startTime} - ${e.period.endTime}`,
      subject: e.subject?.name || 'Free Period',
      class: `${e.timetable.class.name}-${e.timetable.section.name}`,
      room: e.room?.name || '-',
      type,
    }
  })
}

export async function getTeacherClasses(schoolId: string, userId: string) {
  const staff = await resolveStaffFromUser(schoolId, userId)
  if (!staff) return []

  const todayDow = getTodayDayOfWeek()
  const today = startOfDay(new Date())

  // Get all entries for this teacher to find unique class-section-subject combos
  const entries = await prisma.timetableEntry.findMany({
    where: { organizationId: schoolId, teacherId: staff.id, subject: { isNot: null } },
    include: {
      subject: true,
      timetable: { include: { class: true, section: true } },
    },
  })

  // Unique class-section-subject combos
  const seen = new Map<string, typeof entries[0]>()
  for (const e of entries) {
    const key = `${e.timetable.classId}-${e.timetable.sectionId}-${e.subjectId}`
    if (!seen.has(key)) seen.set(key, e)
  }

  const results = []
  for (const [, e] of seen) {
    const studentCount = await prisma.student.count({
      where: { organizationId: schoolId, classId: e.timetable.classId, sectionId: e.timetable.sectionId, status: 'active' },
    })

    // Check if attendance marked today for this class-section
    const attRecord = await prisma.studentDailyAttendance.findFirst({
      where: { organizationId: schoolId, date: today, classId: e.timetable.classId, sectionId: e.timetable.sectionId },
    })

    results.push({
      class: `${e.timetable.class.name}-${e.timetable.section.name}`,
      subject: e.subject?.name || '',
      students: studentCount,
      attendanceToday: attRecord ? 'marked' : 'pending',
      presentToday: attRecord?.presentCount || 0,
      absentToday: attRecord?.absentCount || 0,
    })
  }

  return results
}

export async function getTeacherTasks(schoolId: string) {
  // STUB — Exams/Homework modules not yet implemented
  return []
}

export async function getStrugglingStudents(schoolId: string, userId: string) {
  const staff = await resolveStaffFromUser(schoolId, userId)
  if (!staff) return []

  // Find teacher's classes
  const entries = await prisma.timetableEntry.findMany({
    where: { organizationId: schoolId, teacherId: staff.id, subject: { isNot: null } },
    include: { timetable: true },
  })

  const classSectionPairs = [...new Map(
    entries.map((e) => [`${e.timetable.classId}-${e.timetable.sectionId}`, { classId: e.timetable.classId, sectionId: e.timetable.sectionId }])
  ).values()]

  if (classSectionPairs.length === 0) return []

  // Get students in these classes
  const students = await prisma.student.findMany({
    where: {
      organizationId: schoolId,
      status: 'active',
      OR: classSectionPairs.map((p) => ({ classId: p.classId, sectionId: p.sectionId })),
    },
    include: { class: true, section: true, attendanceRecords: true },
  })

  // Calculate attendance % per student and filter <75%
  const struggling = []
  for (const s of students) {
    const total = s.attendanceRecords.length
    if (total === 0) continue
    const present = s.attendanceRecords.filter((r) => r.status === 'att_present' || r.status === 'att_late').length
    const pct = Math.round((present / total) * 100)
    if (pct < 75) {
      struggling.push({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        class: `${s.class?.name || ''}-${s.section?.name || ''}`,
        alertType: 'attendance',
        issue: 'Low attendance this month',
        value: `${pct}%`,
      })
    }
  }

  return struggling.slice(0, 10)
}

export async function getPendingGrades(schoolId: string) {
  // STUB — Exams module not yet implemented
  return []
}

// ==================== PARENT (3 endpoints) — 2 REAL + 1 STUB ====================

async function resolveStudentForParent(schoolId: string, userId: string, studentId?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return null

  let childIds: string[] = []
  if (user.childIds) {
    try { childIds = JSON.parse(user.childIds) } catch { /* ignore */ }
  }

  if (childIds.length === 0) return null

  // childIds are user IDs — find linked students
  const childUsers = await prisma.user.findMany({
    where: { id: { in: childIds } },
    select: { studentId: true },
  })

  const validStudentIds = childUsers.map((u) => u.studentId).filter(Boolean) as string[]

  if (studentId && validStudentIds.includes(studentId)) {
    return studentId
  }

  // Return first child's studentId if no specific one requested
  return validStudentIds[0] || null
}

export async function getChildTimetable(schoolId: string, userId: string, studentId?: string) {
  const resolvedStudentId = await resolveStudentForParent(schoolId, userId, studentId)
  if (!resolvedStudentId) return []

  const student = await prisma.student.findUnique({
    where: { id: resolvedStudentId },
    select: { classId: true, sectionId: true },
  })
  if (!student || !student.classId || !student.sectionId) return []

  const todayDow = getTodayDayOfWeek()
  if (!todayDow) return []

  const timetable = await prisma.timetable.findFirst({
    where: { organizationId: schoolId, classId: student.classId, sectionId: student.sectionId, status: 'tt_published' },
  })
  if (!timetable) return []

  const entries = await prisma.timetableEntry.findMany({
    where: { organizationId: schoolId, timetableId: timetable.id, dayOfWeek: todayDow as any },
    include: {
      period: true,
      subject: true,
      room: true,
      teacher: true,
    },
    orderBy: { period: { periodNumber: 'asc' } },
  })

  return entries.map((e) => ({
    period: e.period.periodNumber,
    time: `${e.period.startTime} - ${e.period.endTime}`,
    subject: e.subject?.name || e.period.name,
    teacherName: e.teacher ? `${e.teacher.firstName} ${e.teacher.lastName}` : '',
    room: e.room?.name || '',
  }))
}

export async function getChildAssignments(schoolId: string) {
  // STUB — LMS/Homework module not yet implemented
  return []
}

export async function getChildTeachers(schoolId: string, userId: string, studentId?: string) {
  const resolvedStudentId = await resolveStudentForParent(schoolId, userId, studentId)
  if (!resolvedStudentId) return []

  const student = await prisma.student.findUnique({
    where: { id: resolvedStudentId },
    select: { classId: true, sectionId: true },
  })
  if (!student || !student.classId || !student.sectionId) return []

  const timetable = await prisma.timetable.findFirst({
    where: { organizationId: schoolId, classId: student.classId, sectionId: student.sectionId, status: 'tt_published' },
  })
  if (!timetable) return []

  const entries = await prisma.timetableEntry.findMany({
    where: { organizationId: schoolId, timetableId: timetable.id, teacherId: { not: null }, subjectId: { not: null } },
    include: { teacher: true, subject: true },
  })

  // Distinct teachers with their subjects
  const teacherMap = new Map<string, { id: string; name: string; subject: string; email: string }>()
  for (const e of entries) {
    if (!e.teacher || !e.subject) continue
    if (!teacherMap.has(e.teacher.id)) {
      teacherMap.set(e.teacher.id, {
        id: e.teacher.id,
        name: `${e.teacher.firstName} ${e.teacher.lastName}`,
        subject: e.subject.name,
        email: e.teacher.email,
      })
    }
  }

  return [...teacherMap.values()]
}

// ==================== LIBRARIAN (5 endpoints) — ALL STUB ====================

export async function getLibrarianStats(schoolId: string) {
  return {
    totalBooks: 8500,
    totalTitles: 3200,
    issuedBooks: 342,
    activeMembers: 215,
    overdueBooks: 18,
    overdueMembers: 12,
    pendingReservations: 7,
  }
}

export async function getCirculationStats(schoolId: string) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days.map((day) => ({
    day,
    issued: Math.floor(Math.random() * 20) + 5,
    returned: Math.floor(Math.random() * 17) + 3,
  }))
}

export async function getOverdueBooks(schoolId: string) {
  return []
}

export async function getPendingReservations(schoolId: string) {
  return []
}

export async function getLibraryActivity(schoolId: string) {
  return []
}

// ==================== TRANSPORT MANAGER (5 endpoints) — ALL STUB ====================

export async function getTransportStats(schoolId: string) {
  return {
    totalVehicles: 18,
    activeVehicles: 15,
    activeRoutes: 12,
    totalStudents: 520,
    maintenanceDue: 2,
    totalDrivers: 18,
    availableDrivers: 15,
  }
}

export async function getFleetStatus(schoolId: string) {
  return []
}

export async function getMaintenanceAlerts(schoolId: string) {
  return []
}

export async function getRoutePerformance(schoolId: string) {
  return []
}

export async function getDriverStatus(schoolId: string) {
  return []
}

// ==================== STUDENT (3 endpoints) — ALL STUB ====================

export async function getStudentCourses(schoolId: string) {
  return []
}

export async function getStudentAssignments(schoolId: string) {
  return []
}

export async function getStudentTransport(schoolId: string) {
  return null
}

// ==================== NOTIFICATIONS (3 endpoints) — ALL STUB ====================

const staticNotifications = [
  {
    id: 'n1',
    title: 'Welcome to PaperBook',
    message: 'Your school management system is set up and ready to use.',
    type: 'system' as const,
    read: false,
    createdAt: new Date().toISOString(),
  },
]

export async function getNotifications(schoolId: string) {
  return staticNotifications
}

export async function markNotificationRead(schoolId: string, id: string) {
  const n = staticNotifications.find((n) => n.id === id)
  if (n) n.read = true
  return { success: true }
}

export async function markAllNotificationsRead(schoolId: string) {
  staticNotifications.forEach((n) => (n.read = true))
  return { success: true }
}
