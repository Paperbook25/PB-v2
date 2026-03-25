import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Get Children for Parent User ====================

async function getStudentsByParentEmail(schoolId: string, parentEmail: string) {
  // Find students where the parent's guardianEmail matches the logged-in parent's email
  const students = await prisma.student.findMany({
    where: {
      organizationId: schoolId,
      status: 'active',
      parent: { guardianEmail: parentEmail },
    },
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      parent: true,
    },
  })
  return students
}

// ==================== Child Overview ====================

export async function getChildOverview(schoolId: string, parentEmail: string) {
  const students = await getStudentsByParentEmail(schoolId, parentEmail)
  if (students.length === 0) {
    throw AppError.notFound('No children found for this parent account')
  }

  const overviews = await Promise.all(
    students.map(async (student) => {
      // Attendance percentage (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const attendanceRecords = await prisma.studentAttendanceRecord.findMany({
        where: {
          studentId: student.id,
          organizationId: schoolId,
          dailyAttendance: { date: { gte: thirtyDaysAgo } },
        },
      })

      const totalDays = attendanceRecords.length
      const presentDays = attendanceRecords.filter(
        (r) => r.status === 'att_present' || r.status === 'att_late'
      ).length
      const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

      // Pending fees
      const pendingFees = await prisma.studentFee.findMany({
        where: {
          studentId: student.id,
          organizationId: schoolId,
          status: { in: ['fps_pending', 'fps_partial'] },
        },
        select: { totalAmount: true, paidAmount: true, dueDate: true },
      })

      const totalPending = pendingFees.reduce(
        (sum, f) => sum + (Number(f.totalAmount) - Number(f.paidAmount)),
        0
      )

      // Recent marks (last 5)
      const recentMarks = await prisma.studentMark.findMany({
        where: { studentId: student.id, organizationId: schoolId },
        include: {
          exam: { select: { name: true } },
          subject: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })

      return {
        student: {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          admissionNumber: student.admissionNumber,
          class: student.class.name,
          section: student.section.name,
          photoUrl: student.photoUrl,
        },
        attendancePercentage,
        totalPendingFees: totalPending,
        pendingFeeCount: pendingFees.length,
        recentMarks: recentMarks.map((m) => ({
          exam: m.exam.name,
          subject: m.subject.name,
          obtained: m.marksObtained,
          max: m.maxMarks,
          grade: m.grade,
        })),
      }
    })
  )

  return overviews
}

// ==================== Child Attendance ====================

export async function getChildAttendance(
  schoolId: string,
  studentId: string,
  query: { month?: number; year?: number }
) {
  const now = new Date()
  const month = query.month ?? now.getMonth() + 1
  const year = query.year ?? now.getFullYear()

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // Last day of month

  const records = await prisma.studentAttendanceRecord.findMany({
    where: {
      studentId,
      organizationId: schoolId,
      dailyAttendance: {
        date: { gte: startDate, lte: endDate },
      },
    },
    include: {
      dailyAttendance: { select: { date: true } },
    },
    orderBy: { dailyAttendance: { date: 'asc' } },
  })

  const summary = {
    total: records.length,
    present: records.filter((r) => r.status === 'att_present').length,
    absent: records.filter((r) => r.status === 'att_absent').length,
    late: records.filter((r) => r.status === 'att_late').length,
    excused: records.filter((r) => r.status === 'att_excused').length,
  }

  return {
    month,
    year,
    summary,
    records: records.map((r) => ({
      date: r.dailyAttendance.date,
      status: r.status,
      remarks: r.remarks,
    })),
  }
}

// ==================== Child Fees ====================

export async function getChildFees(schoolId: string, studentId: string) {
  const fees = await prisma.studentFee.findMany({
    where: { studentId, organizationId: schoolId },
    include: {
      payments: {
        where: { status: 'active' },
        orderBy: { collectedAt: 'desc' },
        select: {
          id: true,
          receiptNumber: true,
          amount: true,
          paymentMode: true,
          collectedAt: true,
        },
      },
    },
    orderBy: { dueDate: 'desc' },
  })

  const totalAmount = fees.reduce((sum, f) => sum + Number(f.totalAmount), 0)
  const paidAmount = fees.reduce((sum, f) => sum + Number(f.paidAmount), 0)
  const pendingAmount = totalAmount - paidAmount

  return {
    summary: {
      totalAmount,
      paidAmount,
      pendingAmount,
      totalFeeItems: fees.length,
    },
    fees,
  }
}

// ==================== Child Marks ====================

export async function getChildMarks(schoolId: string, studentId: string) {
  const marks = await prisma.studentMark.findMany({
    where: { studentId, organizationId: schoolId },
    include: {
      exam: { select: { id: true, name: true, academicYear: true, term: true } },
      subject: { select: { id: true, name: true } },
    },
    orderBy: [{ exam: { createdAt: 'desc' } }, { subject: { name: 'asc' } }],
  })

  // Group by exam
  const grouped: Record<string, { exam: { id: string; name: string; academicYear: string; term: string }; subjects: Array<{ subject: string; obtained: number; max: number; grade: string | null; isAbsent: boolean }> }> = {}

  for (const m of marks) {
    if (!grouped[m.examId]) {
      grouped[m.examId] = {
        exam: m.exam,
        subjects: [],
      }
    }
    grouped[m.examId].subjects.push({
      subject: m.subject.name,
      obtained: m.marksObtained,
      max: m.maxMarks,
      grade: m.grade,
      isAbsent: m.isAbsent,
    })
  }

  return Object.values(grouped)
}

// ==================== Announcements for Parents ====================

export async function getAnnouncements(schoolId: string) {
  const now = new Date()

  return prisma.announcement.findMany({
    where: {
      organizationId: schoolId,
      isPublished: true,
      targetAudience: { in: ['all', 'parents'] },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  })
}
