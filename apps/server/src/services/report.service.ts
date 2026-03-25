import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { getCollectionReport } from './finance-reports.service.js'

// ==================== Helpers ====================

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// ==================== Student Report ====================

export async function getStudentReport(schoolId: string, studentId: string) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, organizationId: schoolId },
    include: { class: true, section: true },
  })
  if (!student) throw AppError.notFound('Student not found')

  // Attendance summary
  const attendanceRecords = await prisma.studentAttendanceRecord.findMany({
    where: { organizationId: schoolId, studentId },
  })
  const totalDays = attendanceRecords.length
  const presentDays = attendanceRecords.filter(
    r => r.status === 'att_present' || r.status === 'att_late'
  ).length
  const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  // Marks summary
  const marks = await prisma.studentMark.findMany({
    where: { studentId },
    include: {
      exam: { select: { name: true, type: true } },
    },
  })
  const totalMarksObtained = marks.reduce((sum, m) => sum + (Number(m.marksObtained) || 0), 0)
  const totalMaxMarks = marks.reduce((sum, m) => sum + (Number(m.maxMarks) || 0), 0)
  const avgMarksPercent = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0

  // Fee summary
  const fees = await prisma.studentFee.findMany({
    where: { organizationId: schoolId, studentId },
  })
  const totalFeeAmount = fees.reduce((sum, f) => sum + Number(f.totalAmount || 0), 0)
  const totalPaid = fees.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0)
  const totalDiscount = fees.reduce((sum, f) => sum + Number(f.discountAmount || 0), 0)
  const totalDue = totalFeeAmount - totalPaid - totalDiscount

  return {
    data: {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`.trim(),
        admissionNumber: student.admissionNumber,
        className: student.class.name,
        section: student.section.name,
      },
      attendance: {
        totalDays,
        presentDays,
        absentDays: totalDays - presentDays,
        attendancePercent,
      },
      marks: {
        totalExams: marks.length,
        totalMarksObtained,
        totalMaxMarks,
        avgMarksPercent,
        examWise: marks.map(m => ({
          examName: m.exam?.name || 'Unknown',
          marksObtained: Number(m.marksObtained),
          maxMarks: Number(m.maxMarks),
        })),
      },
      fees: {
        totalAmount: totalFeeAmount,
        totalPaid,
        totalDiscount,
        totalDue,
      },
    },
  }
}

// ==================== Class Report ====================

export async function getClassReport(schoolId: string, classId: string) {
  const cls = await prisma.class.findFirst({
    where: { id: classId, organizationId: schoolId },
  })
  if (!cls) throw AppError.notFound('Class not found')

  const students = await prisma.student.findMany({
    where: { organizationId: schoolId, classId, status: 'active' },
    select: { id: true },
  })
  const studentIds = students.map(s => s.id)
  const studentCount = studentIds.length

  // Average attendance
  let avgAttendance = 0
  if (studentCount > 0) {
    const attendanceRecords = await prisma.studentAttendanceRecord.findMany({
      where: { organizationId: schoolId, studentId: { in: studentIds } },
    })
    const totalRecords = attendanceRecords.length
    const presentRecords = attendanceRecords.filter(
      r => r.status === 'att_present' || r.status === 'att_late'
    ).length
    avgAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0
  }

  // Average marks
  let avgMarks = 0
  if (studentCount > 0) {
    const marks = await prisma.studentMark.findMany({
      where: { studentId: { in: studentIds } },
    })
    const totalObtained = marks.reduce((sum, m) => sum + (Number(m.marksObtained) || 0), 0)
    const totalMax = marks.reduce((sum, m) => sum + (Number(m.maxMarks) || 0), 0)
    avgMarks = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0
  }

  // Fee collection rate
  let feeCollectionRate = 0
  if (studentCount > 0) {
    const fees = await prisma.studentFee.findMany({
      where: { organizationId: schoolId, studentId: { in: studentIds } },
    })
    const totalAmount = fees.reduce((sum, f) => sum + Number(f.totalAmount || 0), 0)
    const totalPaid = fees.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0)
    feeCollectionRate = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0
  }

  return {
    data: {
      className: cls.name,
      studentCount,
      avgAttendancePercent: avgAttendance,
      avgMarksPercent: avgMarks,
      feeCollectionRate,
    },
  }
}

// ==================== Exam Report ====================

export async function getExamReport(schoolId: string, examId: string) {
  const exam = await prisma.exam.findFirst({
    where: { id: examId, organizationId: schoolId },
  })
  if (!exam) throw AppError.notFound('Exam not found')

  const marks = await prisma.studentMark.findMany({
    where: { examId },
    include: {
      student: { select: { firstName: true, lastName: true, admissionNumber: true } },
    },
  })

  const totalStudents = marks.length
  let passCount = 0
  let failCount = 0
  let totalPercent = 0
  const toppers: Array<{ name: string; admissionNumber: string; marksObtained: number; maxMarks: number; percent: number }> = []

  for (const m of marks) {
    const obtained = Number(m.marksObtained) || 0
    const max = Number(m.maxMarks) || 0
    const percent = max > 0 ? Math.round((obtained / max) * 100) : 0
    totalPercent += percent

    // Consider pass as >= 33%
    if (percent >= 33) {
      passCount++
    } else {
      failCount++
    }

    toppers.push({
      name: `${m.student?.firstName || ''} ${m.student?.lastName || ''}`.trim(),
      admissionNumber: m.student?.admissionNumber || '',
      marksObtained: obtained,
      maxMarks: max,
      percent,
    })
  }

  // Sort toppers by percent descending, take top 10
  toppers.sort((a, b) => b.percent - a.percent)
  const top10 = toppers.slice(0, 10)

  return {
    data: {
      examName: exam.name,
      totalStudents,
      passCount,
      failCount,
      passPercent: totalStudents > 0 ? Math.round((passCount / totalStudents) * 100) : 0,
      avgScore: totalStudents > 0 ? Math.round(totalPercent / totalStudents) : 0,
      toppers: top10,
    },
  }
}

// ==================== Attendance Report ====================

export async function getAttendanceReport(schoolId: string, query: {
  classId?: string
  startDate: string
  endDate: string
}) {
  const start = new Date(query.startDate)
  const end = new Date(query.endDate + 'T23:59:59.999Z')

  const studentWhere: any = { organizationId: schoolId, status: 'active' }
  if (query.classId) studentWhere.classId = query.classId

  const students = await prisma.student.findMany({
    where: studentWhere,
    select: { id: true, firstName: true, lastName: true, admissionNumber: true, class: { select: { name: true } } },
  })

  const studentIds = students.map(s => s.id)

  const attendanceRecords = await prisma.studentAttendanceRecord.findMany({
    where: {
      organizationId: schoolId,
      studentId: { in: studentIds },
      dailyAttendance: {
        date: { gte: startOfDay(start), lte: end },
      },
    },
  })

  // Group by student
  const recordsByStudent = new Map<string, typeof attendanceRecords>()
  for (const r of attendanceRecords) {
    const arr = recordsByStudent.get(r.studentId) || []
    arr.push(r)
    recordsByStudent.set(r.studentId, arr)
  }

  const report = students.map(s => {
    const records = recordsByStudent.get(s.id) || []
    const total = records.length
    const present = records.filter(r => r.status === 'att_present' || r.status === 'att_late').length
    return {
      studentId: s.id,
      name: `${s.firstName} ${s.lastName}`.trim(),
      admissionNumber: s.admissionNumber,
      className: s.class.name,
      totalDays: total,
      presentDays: present,
      absentDays: total - present,
      attendancePercent: total > 0 ? Math.round((present / total) * 100) : 0,
    }
  })

  return { data: report }
}

// ==================== Fee Collection Report (wrapper) ====================

export async function getFeeCollectionReport(schoolId: string, query: {
  startDate?: string
  endDate?: string
  academicYear?: string
}) {
  return getCollectionReport(schoolId, query)
}

// ==================== School Overview Report ====================

export async function getSchoolOverviewReport(schoolId: string) {
  const today = startOfDay(new Date())

  const [
    studentCount,
    staffCount,
    activeClasses,
    todayAttendance,
    feeAgg,
    paymentAgg,
  ] = await Promise.all([
    prisma.student.count({ where: { organizationId: schoolId, status: 'active' } }),
    prisma.staff.count({ where: { organizationId: schoolId, status: 'active' } }),
    prisma.class.count({ where: { organizationId: schoolId } }),
    prisma.studentDailyAttendance.findMany({
      where: { organizationId: schoolId, date: today },
    }),
    prisma.studentFee.aggregate({
      where: { organizationId: schoolId },
      _sum: { totalAmount: true, paidAmount: true, discountAmount: true },
    }),
    prisma.payment.aggregate({
      where: { organizationId: schoolId },
      _sum: { amount: true },
    }),
  ])

  const totalStudentsToday = todayAttendance.reduce((sum, r) => sum + r.totalStudents, 0)
  const presentToday = todayAttendance.reduce((sum, r) => sum + r.presentCount + r.lateCount, 0)
  const attendanceRate = totalStudentsToday > 0
    ? Math.round((presentToday / totalStudentsToday) * 100)
    : 0

  const totalFees = Number(feeAgg._sum.totalAmount || 0)
  const totalCollected = Number(paymentAgg._sum.amount || 0)
  const feeCollectionRate = totalFees > 0 ? Math.round((totalCollected / totalFees) * 100) : 0

  return {
    data: {
      studentCount,
      staffCount,
      activeClasses,
      attendanceRate,
      totalAttendanceToday: totalStudentsToday,
      presentToday,
      totalFees,
      totalCollected,
      feeCollectionRate,
    },
  }
}
