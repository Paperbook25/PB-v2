import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import type {
  MarkDailyAttendanceInput, GetDailyAttendanceInput, GetStudentsInput,
  AttendanceHistoryInput, AttendanceReportInput, AttendanceSummaryInput,
  StudentAttendanceInput, MarkPeriodAttendanceInput, GetPeriodAttendanceInput,
  PeriodSummaryInput, UpdatePeriodDefinitionInput,
} from '../validators/attendance.validators.js'

// ==================== Enum Mappers ====================

const statusToDb: Record<string, string> = {
  present: 'att_present', absent: 'att_absent', late: 'att_late',
  half_day: 'att_half_day', excused: 'att_excused',
}
const statusFromDb: Record<string, string> = {
  att_present: 'present', att_absent: 'absent', att_late: 'late',
  att_half_day: 'half_day', att_excused: 'excused',
}

const periodTypeToDb: Record<string, string> = {
  class: 'period_class', break: 'period_break', lunch: 'period_lunch',
  assembly: 'period_assembly', activity: 'period_activity',
}
const periodTypeFromDb: Record<string, string> = {
  period_class: 'class', period_break: 'break', period_lunch: 'lunch',
  period_assembly: 'assembly', period_activity: 'activity',
}

function formatPeriod(p: any) {
  return {
    id: p.id,
    name: p.name,
    periodNumber: p.periodNumber,
    startTime: p.startTime,
    endTime: p.endTime,
    type: periodTypeFromDb[p.type] || p.type,
    isActive: p.isActive,
  }
}

// ==================== Helper: Resolve className/section to IDs ====================

async function resolveClassSection(schoolId: string, input: { classId?: string; sectionId?: string; className?: string; section?: string }) {
  let classId = input.classId
  let sectionId = input.sectionId

  if (!classId && input.className) {
    const cls = await prisma.class.findFirst({ where: { organizationId: schoolId, name: input.className } })
    if (cls) classId = cls.id
  }
  if (!sectionId && input.section && classId) {
    const sec = await prisma.section.findFirst({ where: { organizationId: schoolId, classId, name: input.section } })
    if (sec) sectionId = sec.id
  }

  return { classId, sectionId }
}

// ==================== Student Daily Attendance ====================

export async function getStudentsForAttendance(schoolId: string, input: GetStudentsInput) {
  const { classId, sectionId } = await resolveClassSection(schoolId, input)
  const students = await prisma.student.findMany({
    where: { organizationId: schoolId, classId, sectionId, status: 'active' },
    select: {
      id: true, firstName: true, lastName: true, rollNumber: true,
      admissionNumber: true, photoUrl: true,
    },
    orderBy: { rollNumber: 'asc' },
  })
  return {
    data: students.map(s => ({
      ...s,
      name: `${s.firstName} ${s.lastName}`.trim(),
    })),
  }
}

export async function markDailyAttendance(schoolId: string, input: MarkDailyAttendanceInput, markedBy: string) {
  // Resolve className/section to classId/sectionId if needed
  const { classId, sectionId } = await resolveClassSection(schoolId, input)
  if (!classId) throw AppError.badRequest('Class not found')
  if (!sectionId) throw AppError.badRequest('Section not found')

  const date = new Date(input.date)

  // Validate class & section exist
  const cls = await prisma.class.findFirst({ where: { id: classId, organizationId: schoolId } })
  if (!cls) throw AppError.notFound('Class not found')
  const section = await prisma.section.findFirst({ where: { id: sectionId, organizationId: schoolId } })
  if (!section) throw AppError.notFound('Section not found')

  // Compute counts
  const counts = { present: 0, absent: 0, late: 0, half_day: 0, excused: 0 }
  for (const r of input.records) {
    counts[r.status]++
  }

  // Upsert daily attendance
  const daily = await prisma.studentDailyAttendance.upsert({
    where: {
      date_classId_sectionId: { date, classId, sectionId },
    },
    create: {
      organizationId: schoolId,
      date,
      classId,
      sectionId,
      markedBy,
      totalStudents: input.records.length,
      presentCount: counts.present,
      absentCount: counts.absent,
      lateCount: counts.late,
      halfDayCount: counts.half_day,
      excusedCount: counts.excused,
    },
    update: {
      markedBy,
      totalStudents: input.records.length,
      presentCount: counts.present,
      absentCount: counts.absent,
      lateCount: counts.late,
      halfDayCount: counts.half_day,
      excusedCount: counts.excused,
    },
  })

  // Upsert individual records
  for (const r of input.records) {
    await prisma.studentAttendanceRecord.upsert({
      where: {
        dailyAttendanceId_studentId: {
          dailyAttendanceId: daily.id,
          studentId: r.studentId,
        },
      },
      create: {
        dailyAttendanceId: daily.id,
        studentId: r.studentId,
        status: statusToDb[r.status] as any,
        remarks: r.remarks || null,
      },
      update: {
        status: statusToDb[r.status] as any,
        remarks: r.remarks || null,
      },
    })
  }

  // Return { success, markedCount } as frontend expects
  return {
    success: true,
    markedCount: input.records.length,
  }
}

export async function getDailyAttendanceForDate(schoolId: string, input: GetDailyAttendanceInput) {
  const { classId, sectionId } = await resolveClassSection(schoolId, input)
  const date = input.date ? new Date(input.date) : new Date()
  const dateOnly = new Date(date.toISOString().split('T')[0])

  const where: any = { organizationId: schoolId, date: dateOnly }
  if (classId) where.classId = classId
  if (sectionId) where.sectionId = sectionId

  const records = await prisma.studentDailyAttendance.findMany({
    where,
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      records: {
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, rollNumber: true, admissionNumber: true },
          },
        },
        orderBy: { student: { rollNumber: 'asc' } },
      },
    },
  })

  // Frontend expects { data: ClassAttendance } with field names:
  // className, section, present, absent, late, halfDay, excused, records[]
  const formatted = records.map(r => ({
    id: r.id,
    date: r.date,
    classId: r.classId,
    className: r.class.name,
    sectionId: r.sectionId,
    section: r.section.name,
    sectionName: r.section.name,
    markedBy: r.markedBy,
    totalStudents: r.totalStudents,
    present: r.presentCount,
    absent: r.absentCount,
    late: r.lateCount,
    halfDay: r.halfDayCount,
    excused: r.excusedCount,
    // Keep old names too for backward compat
    presentCount: r.presentCount,
    absentCount: r.absentCount,
    lateCount: r.lateCount,
    halfDayCount: r.halfDayCount,
    excusedCount: r.excusedCount,
    records: r.records.map(rec => ({
      id: rec.id,
      studentId: rec.studentId,
      studentName: `${rec.student.firstName} ${rec.student.lastName}`.trim(),
      rollNumber: rec.student.rollNumber,
      admissionNumber: rec.student.admissionNumber,
      date: r.date,
      status: statusFromDb[rec.status] || rec.status,
      remarks: rec.remarks,
      markedBy: r.markedBy,
      markedAt: r.updatedAt || r.createdAt,
    })),
  }))

  // If filtering by specific class+section, return first result as singular object
  if (classId && sectionId && formatted.length <= 1) {
    return { data: formatted[0] || null }
  }

  return { data: formatted }
}

export async function getAttendanceHistory(schoolId: string, input: AttendanceHistoryInput) {
  const { classId, sectionId } = await resolveClassSection(schoolId, input)
  const page = parseInt(input.page || '1')
  const limit = parseInt(input.limit || '20')
  const skip = (page - 1) * limit

  // Frontend expects individual student AttendanceRecord[] items, not class-level summaries
  // Query StudentAttendanceRecord with filters
  const where: any = {}

  // Filter by class/section via the parent dailyAttendance
  const dailyWhere: any = { organizationId: schoolId }
  if (classId) dailyWhere.classId = classId
  if (sectionId) dailyWhere.sectionId = sectionId
  if (input.startDate && input.endDate) {
    dailyWhere.date = { gte: new Date(input.startDate), lte: new Date(input.endDate) }
  } else if (input.startDate) {
    dailyWhere.date = { gte: new Date(input.startDate) }
  } else if (input.endDate) {
    dailyWhere.date = { lte: new Date(input.endDate) }
  }
  if (Object.keys(dailyWhere).length > 0) {
    where.dailyAttendance = dailyWhere
  }

  // Filter by student
  if (input.studentId) {
    where.studentId = input.studentId
  }

  // Filter by status
  if (input.status && statusToDb[input.status]) {
    where.status = statusToDb[input.status]
  }

  const [records, total] = await Promise.all([
    prisma.studentAttendanceRecord.findMany({
      where,
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, rollNumber: true, admissionNumber: true },
        },
        dailyAttendance: {
          select: {
            date: true, markedBy: true, updatedAt: true,
            class: { select: { id: true, name: true } },
            section: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { dailyAttendance: { date: 'desc' } },
      skip,
      take: limit,
    }),
    prisma.studentAttendanceRecord.count({ where }),
  ])

  return {
    data: records.map(r => ({
      id: r.id,
      studentId: r.studentId,
      studentName: `${r.student.firstName} ${r.student.lastName}`.trim(),
      admissionNumber: r.student.admissionNumber,
      rollNumber: r.student.rollNumber,
      date: r.dailyAttendance.date,
      className: r.dailyAttendance.class.name,
      section: r.dailyAttendance.section.name,
      status: statusFromDb[r.status] || r.status,
      remarks: r.remarks,
      markedBy: r.dailyAttendance.markedBy,
      markedAt: r.dailyAttendance.updatedAt,
    })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getAttendanceReport(schoolId: string, input: AttendanceReportInput) {
  const { classId, sectionId } = await resolveClassSection(schoolId, input)

  // Frontend expects per-student reports: AttendanceReport[]
  // Each has: studentId, studentName, admissionNumber, className, section,
  // totalDays, presentDays, absentDays, lateDays, halfDays, excusedDays,
  // attendancePercentage, monthlyBreakdown[]

  const dailyWhere: any = { organizationId: schoolId }
  if (classId) dailyWhere.classId = classId
  if (sectionId) dailyWhere.sectionId = sectionId
  if (input.startDate && input.endDate) {
    dailyWhere.date = { gte: new Date(input.startDate), lte: new Date(input.endDate) }
  }

  // Get all individual records in the date range
  const records = await prisma.studentAttendanceRecord.findMany({
    where: {
      dailyAttendance: dailyWhere,
    },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true, admissionNumber: true },
        },
      dailyAttendance: {
        select: {
          date: true,
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
      },
    },
  })

  // Group by student
  const studentMap: Record<string, {
    studentId: string; studentName: string; admissionNumber: string;
    className: string; section: string;
    present: number; absent: number; late: number; halfDay: number; excused: number; total: number;
    monthly: Record<string, { present: number; absent: number; late: number; total: number }>
  }> = {}

  for (const r of records) {
    const sid = r.studentId
    if (!studentMap[sid]) {
      studentMap[sid] = {
        studentId: sid,
        studentName: `${r.student.firstName} ${r.student.lastName}`.trim(),
        admissionNumber: r.student.admissionNumber || '',
        className: r.dailyAttendance.class.name,
        section: r.dailyAttendance.section.name,
        present: 0, absent: 0, late: 0, halfDay: 0, excused: 0, total: 0,
        monthly: {},
      }
    }
    const s = studentMap[sid]
    const status = statusFromDb[r.status] || r.status
    s.total++
    if (status === 'present') s.present++
    else if (status === 'absent') s.absent++
    else if (status === 'late') s.late++
    else if (status === 'half_day') s.halfDay++
    else if (status === 'excused') s.excused++

    // Monthly breakdown
    const monthKey = r.dailyAttendance.date instanceof Date
      ? `${r.dailyAttendance.date.getFullYear()}-${String(r.dailyAttendance.date.getMonth() + 1).padStart(2, '0')}`
      : String(r.dailyAttendance.date).slice(0, 7)
    if (!s.monthly[monthKey]) {
      s.monthly[monthKey] = { present: 0, absent: 0, late: 0, total: 0 }
    }
    s.monthly[monthKey].total++
    if (status === 'present') s.monthly[monthKey].present++
    else if (status === 'absent') s.monthly[monthKey].absent++
    else if (status === 'late') s.monthly[monthKey].late++
  }

  const reportData = Object.values(studentMap).map(s => ({
    studentId: s.studentId,
    studentName: s.studentName,
    admissionNumber: s.admissionNumber,
    className: s.className,
    section: s.section,
    totalDays: s.total,
    presentDays: s.present,
    absentDays: s.absent,
    lateDays: s.late,
    halfDays: s.halfDay,
    excusedDays: s.excused,
    attendancePercentage: s.total > 0
      ? Math.round((s.present / s.total) * 100 * 100) / 100
      : 0,
    monthlyBreakdown: Object.entries(s.monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        present: data.present,
        absent: data.absent,
        late: data.late,
        total: data.total,
        percentage: data.total > 0
          ? Math.round((data.present / data.total) * 100 * 100) / 100
          : 0,
      })),
  }))

  return { data: reportData }
}

export async function getAttendanceSummary(schoolId: string, input: AttendanceSummaryInput) {
  const { classId, sectionId } = await resolveClassSection(schoolId, input)
  const now = new Date()
  const month = parseInt(input.month || String(now.getMonth() + 1))
  const year = parseInt(input.year || String(now.getFullYear()))

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  const where: any = { organizationId: schoolId, date: { gte: startDate, lte: endDate } }
  if (classId) where.classId = classId
  if (sectionId) where.sectionId = sectionId

  const records = await prisma.studentDailyAttendance.findMany({
    where,
    orderBy: { date: 'asc' },
  })

  // Frontend expects: totalStudents, averageAttendance, dailyData[]
  const totalStudents = records.length > 0 ? records[0].totalStudents : 0
  const totalPresent = records.reduce((acc, r) => acc + r.presentCount, 0)
  const totalAll = records.reduce((acc, r) => acc + r.totalStudents, 0)
  const averageAttendance = totalAll > 0
    ? Math.round((totalPresent / totalAll) * 100 * 100) / 100
    : 0

  return {
    data: {
      month,
      year,
      classId: classId || input.classId,
      sectionId: sectionId || input.sectionId,
      totalStudents,
      averageAttendance,
      totalDays: records.length,
      dailyData: records.map(r => ({
        date: r.date,
        present: r.presentCount,
        absent: r.absentCount,
        late: r.lateCount,
        totalStudents: r.totalStudents,
        attendancePercentage: r.totalStudents > 0
          ? Math.round((r.presentCount / r.totalStudents) * 100 * 100) / 100
          : 0,
      })),
      // Keep old name too
      dailySummary: records.map(r => ({
        date: r.date,
        totalStudents: r.totalStudents,
        presentCount: r.presentCount,
        absentCount: r.absentCount,
        lateCount: r.lateCount,
        halfDayCount: r.halfDayCount,
        excusedCount: r.excusedCount,
        attendancePercentage: r.totalStudents > 0
          ? Math.round((r.presentCount / r.totalStudents) * 100 * 100) / 100
          : 0,
      })),
    },
  }
}

export async function getStudentAttendanceHistory(schoolId: string, studentId: string, input: StudentAttendanceInput) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, organizationId: schoolId },
    include: {
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
  })
  if (!student) throw AppError.notFound('Student not found')

  const page = parseInt(input.page || '1')
  const limit = parseInt(input.limit || '20')
  const skip = (page - 1) * limit

  const where: any = { studentId }
  if (input.startDate || input.endDate) {
    where.dailyAttendance = {}
    if (input.startDate) where.dailyAttendance.date = { gte: new Date(input.startDate) }
    if (input.endDate) {
      where.dailyAttendance.date = {
        ...where.dailyAttendance.date,
        lte: new Date(input.endDate),
      }
    }
  }

  const [records, total] = await Promise.all([
    prisma.studentAttendanceRecord.findMany({
      where,
      include: {
        dailyAttendance: {
          select: {
            date: true, markedBy: true, updatedAt: true,
            class: { select: { name: true } },
            section: { select: { name: true } },
          },
        },
      },
      orderBy: { dailyAttendance: { date: 'desc' } },
      skip,
      take: limit,
    }),
    prisma.studentAttendanceRecord.count({ where }),
  ])

  // Compute summary
  const allRecords = await prisma.studentAttendanceRecord.findMany({
    where: { studentId },
    select: { status: true, dailyAttendance: { select: { date: true } } },
  })
  const totalDays = allRecords.length
  const presentDays = allRecords.filter(r => statusFromDb[r.status] === 'present').length
  const absentDays = allRecords.filter(r => statusFromDb[r.status] === 'absent').length
  const lateDays = allRecords.filter(r => statusFromDb[r.status] === 'late').length
  const attendancePercentage = totalDays > 0
    ? Math.round((presentDays / totalDays) * 100 * 100) / 100
    : 0

  // Monthly data
  const monthlyMap: Record<string, { present: number; absent: number; late: number; total: number }> = {}
  for (const r of allRecords) {
    const d = r.dailyAttendance.date instanceof Date ? r.dailyAttendance.date : new Date(r.dailyAttendance.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { present: 0, absent: 0, late: 0, total: 0 }
    monthlyMap[key].total++
    const st = statusFromDb[r.status] || r.status
    if (st === 'present') monthlyMap[key].present++
    else if (st === 'absent') monthlyMap[key].absent++
    else if (st === 'late') monthlyMap[key].late++
  }

  // Frontend expects StudentAttendanceView shape
  return {
    data: {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      className: student.class?.name || '',
      section: student.section?.name || '',
      academicYear: input.academicYear || '',
      summary: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage,
      },
      recentRecords: records.map(r => ({
        id: r.id,
        studentId,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        admissionNumber: student.admissionNumber || '',
        rollNumber: student.rollNumber || 0,
        date: r.dailyAttendance.date,
        status: statusFromDb[r.status] || r.status,
        remarks: r.remarks,
        markedBy: r.dailyAttendance.markedBy,
        markedAt: r.dailyAttendance.updatedAt,
        className: r.dailyAttendance.class.name,
        sectionName: r.dailyAttendance.section.name,
      })),
      monthlyData: Object.entries(monthlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, d]) => ({
          month,
          present: d.present,
          absent: d.absent,
          late: d.late,
          percentage: d.total > 0 ? Math.round((d.present / d.total) * 100 * 100) / 100 : 0,
        })),
    },
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getMyAttendance(schoolId: string, userId: string) {
  // Find the student linked to this user
  const user = await prisma.user.findFirst({ where: { id: userId, organizationId: schoolId } })
  if (!user || !user.studentId) throw AppError.notFound('No student record linked to this user')

  // Find student by admission number (studentId on User is like 'STU001')
  const student = await prisma.student.findFirst({
    where: {
      organizationId: schoolId,
      OR: [
        { admissionNumber: user.studentId },
        { id: user.studentId },
      ],
    },
    include: {
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
  })
  if (!student) throw AppError.notFound('Student not found')

  const records = await prisma.studentAttendanceRecord.findMany({
    where: { studentId: student.id },
    include: {
      dailyAttendance: {
        select: {
          date: true, markedBy: true, updatedAt: true,
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
      },
    },
    orderBy: { dailyAttendance: { date: 'desc' } },
    take: 30,
  })

  // Compute summary
  const allRecords = await prisma.studentAttendanceRecord.findMany({
    where: { studentId: student.id },
    select: { status: true, dailyAttendance: { select: { date: true } } },
  })
  const totalDays = allRecords.length
  const presentDays = allRecords.filter(r => statusFromDb[r.status] === 'present').length
  const absentDays = allRecords.filter(r => statusFromDb[r.status] === 'absent').length
  const lateDays = allRecords.filter(r => statusFromDb[r.status] === 'late').length

  // Monthly breakdown
  const monthlyMap: Record<string, { present: number; absent: number; late: number; total: number }> = {}
  for (const r of allRecords) {
    const d = r.dailyAttendance.date instanceof Date ? r.dailyAttendance.date : new Date(r.dailyAttendance.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { present: 0, absent: 0, late: 0, total: 0 }
    monthlyMap[key].total++
    const st = statusFromDb[r.status] || r.status
    if (st === 'present') monthlyMap[key].present++
    else if (st === 'absent') monthlyMap[key].absent++
    else if (st === 'late') monthlyMap[key].late++
  }

  return {
    data: {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      className: student.class?.name || '',
      section: student.section?.name || '',
      academicYear: '',
      summary: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage: totalDays > 0
          ? Math.round((presentDays / totalDays) * 100 * 100) / 100
          : 0,
      },
      recentRecords: records.map(r => ({
        id: r.id,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        admissionNumber: student.admissionNumber || '',
        rollNumber: student.rollNumber || 0,
        date: r.dailyAttendance.date,
        status: statusFromDb[r.status] || r.status,
        remarks: r.remarks,
        markedBy: r.dailyAttendance.markedBy,
        markedAt: r.dailyAttendance.updatedAt,
        className: r.dailyAttendance.class.name,
        sectionName: r.dailyAttendance.section.name,
      })),
      monthlyData: Object.entries(monthlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, d]) => ({
          month,
          present: d.present,
          absent: d.absent,
          late: d.late,
          percentage: d.total > 0 ? Math.round((d.present / d.total) * 100 * 100) / 100 : 0,
        })),
    },
  }
}

export async function getMyChildrenAttendance(schoolId: string, userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId, organizationId: schoolId } })
  if (!user) throw AppError.notFound('User not found')

  let childIds: string[] = []
  if (user.childIds) {
    try { childIds = JSON.parse(user.childIds) } catch { childIds = [] }
  }
  if (childIds.length === 0) {
    return { data: [] }
  }

  // childIds are user IDs — find linked students
  const childUsers = await prisma.user.findMany({
    where: { id: { in: childIds }, organizationId: schoolId },
    select: { studentId: true },
  })

  const studentAdmissionNumbers = childUsers
    .map(u => u.studentId)
    .filter((id): id is string => !!id)

  if (studentAdmissionNumbers.length === 0) {
    return { data: [] }
  }

  const students = await prisma.student.findMany({
    where: {
      organizationId: schoolId,
      OR: [
        { admissionNumber: { in: studentAdmissionNumbers } },
        { id: { in: studentAdmissionNumbers } },
      ],
    },
    include: {
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
  })

  const result: any[] = []
  for (const student of students) {
    const records = await prisma.studentAttendanceRecord.findMany({
      where: { studentId: student.id },
      include: {
        dailyAttendance: {
          select: {
            date: true, markedBy: true, updatedAt: true,
            class: { select: { name: true } },
            section: { select: { name: true } },
          },
        },
      },
      orderBy: { dailyAttendance: { date: 'desc' } },
      take: 30,
    })

    // Compute summary
    const allRecords = await prisma.studentAttendanceRecord.findMany({
      where: { studentId: student.id },
      select: { status: true, dailyAttendance: { select: { date: true } } },
    })
    const totalDays = allRecords.length
    const presentDays = allRecords.filter(r => statusFromDb[r.status] === 'present').length
    const absentDays = allRecords.filter(r => statusFromDb[r.status] === 'absent').length
    const lateDays = allRecords.filter(r => statusFromDb[r.status] === 'late').length

    result.push({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      className: student.class?.name || '',
      section: student.section?.name || '',
      academicYear: '',
      summary: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage: totalDays > 0
          ? Math.round((presentDays / totalDays) * 100 * 100) / 100
          : 0,
      },
      recentRecords: records.map(r => ({
        id: r.id,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        admissionNumber: student.admissionNumber || '',
        rollNumber: student.rollNumber || 0,
        date: r.dailyAttendance.date,
        status: statusFromDb[r.status] || r.status,
        remarks: r.remarks,
        markedBy: r.dailyAttendance.markedBy,
        markedAt: r.dailyAttendance.updatedAt,
        className: r.dailyAttendance.class.name,
        sectionName: r.dailyAttendance.section.name,
      })),
      monthlyData: [],
    })
  }

  return { data: result }
}

// ==================== Period Attendance ====================

export async function getPeriodDefinitions(schoolId: string) {
  const periods = await prisma.periodDefinition.findMany({
    where: { organizationId: schoolId },
    orderBy: { periodNumber: 'asc' },
  })
  return { data: periods.map(formatPeriod) }
}

export async function updatePeriodDefinition(schoolId: string, id: string, input: UpdatePeriodDefinitionInput) {
  const existing = await prisma.periodDefinition.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Period definition not found')

  const data: any = {}
  if (input.name !== undefined) data.name = input.name
  if (input.startTime !== undefined) data.startTime = input.startTime
  if (input.endTime !== undefined) data.endTime = input.endTime
  if (input.type !== undefined) data.type = periodTypeToDb[input.type] || input.type
  if (input.isActive !== undefined) data.isActive = input.isActive

  const updated = await prisma.periodDefinition.update({ where: { id }, data })
  return { data: formatPeriod(updated) }
}

export async function markPeriodAttendance(schoolId: string, input: MarkPeriodAttendanceInput) {
  const date = new Date(input.date)

  const period = await prisma.periodDefinition.findFirst({ where: { id: input.periodId, organizationId: schoolId } })
  if (!period) throw AppError.notFound('Period not found')

  const records = input.records.map(r => ({
    studentId: r.studentId,
    status: r.status,
    remarks: r.remarks || null,
  }))

  const attendance = await prisma.periodAttendance.upsert({
    where: {
      date_classId_sectionId_periodId: {
        date,
        classId: input.classId!,
        sectionId: input.sectionId!,
        periodId: input.periodId,
      },
    },
    create: {
      organizationId: schoolId,
      date,
      classId: input.classId!,
      sectionId: input.sectionId!,
      periodId: input.periodId,
      subjectId: input.subjectId || null,
      teacherId: input.teacherId || null,
      records,
    },
    update: {
      subjectId: input.subjectId || null,
      teacherId: input.teacherId || null,
      records,
    },
    include: {
      period: true,
      subject: { select: { id: true, name: true, code: true } },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
    },
  })

  return {
    success: true,
    markedCount: input.records.length,
    data: {
      id: attendance.id,
      date: attendance.date,
      classId: attendance.classId,
      className: attendance.class.name,
      sectionId: attendance.sectionId,
      sectionName: attendance.section.name,
      periodId: attendance.periodId,
      periodName: attendance.period.name,
      periodNumber: attendance.period.periodNumber,
      subjectId: attendance.subjectId,
      subjectName: attendance.subject?.name || null,
      teacherId: attendance.teacherId,
      records: attendance.records as any[],
    },
  }
}

export async function getPeriodAttendance(schoolId: string, input: GetPeriodAttendanceInput) {
  const { classId, sectionId } = await resolveClassSection(schoolId, input)
  const date = new Date(input.date)

  const where: any = { organizationId: schoolId, date }
  if (classId) where.classId = classId
  if (sectionId) where.sectionId = sectionId

  const records = await prisma.periodAttendance.findMany({
    where,
    include: {
      period: true,
      subject: { select: { id: true, name: true, code: true } },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
    },
    orderBy: { period: { periodNumber: 'asc' } },
  })

  return {
    data: records.map(r => ({
      id: r.id,
      date: r.date,
      classId: r.classId,
      className: r.class.name,
      sectionId: r.sectionId,
      sectionName: r.section.name,
      periodId: r.periodId,
      periodName: r.period.name,
      periodNumber: r.period.periodNumber,
      subjectId: r.subjectId,
      subjectName: r.subject?.name || null,
      teacherId: r.teacherId,
      records: r.records as any[],
    })),
  }
}

export async function getPeriodSummary(schoolId: string, input: PeriodSummaryInput) {
  const where: any = { organizationId: schoolId }

  // Filter records that contain this studentId
  if (input.startDate && input.endDate) {
    where.date = { gte: new Date(input.startDate), lte: new Date(input.endDate) }
  }

  const allRecords = await prisma.periodAttendance.findMany({
    where,
    include: {
      subject: { select: { id: true, name: true, code: true } },
      period: { select: { id: true, name: true, periodNumber: true } },
    },
    orderBy: { date: 'desc' },
  })

  // Filter and aggregate by subject for this student
  const subjectSummary: Record<string, { subjectId: string; subjectName: string; total: number; present: number; absent: number; late: number }> = {}

  for (const rec of allRecords) {
    const records = rec.records as any[]
    const studentRecord = records.find((r: any) => r.studentId === input.studentId)
    if (!studentRecord) continue

    const subjectKey = rec.subjectId || 'unknown'
    if (!subjectSummary[subjectKey]) {
      subjectSummary[subjectKey] = {
        subjectId: rec.subjectId || '',
        subjectName: rec.subject?.name || 'Unknown',
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
      }
    }

    subjectSummary[subjectKey].total++
    if (studentRecord.status === 'present') subjectSummary[subjectKey].present++
    else if (studentRecord.status === 'absent') subjectSummary[subjectKey].absent++
    else if (studentRecord.status === 'late') subjectSummary[subjectKey].late++
  }

  return {
    data: Object.values(subjectSummary).map(s => ({
      ...s,
      attendancePercentage: s.total > 0 ? Math.round((s.present / s.total) * 100 * 100) / 100 : 0,
    })),
  }
}
