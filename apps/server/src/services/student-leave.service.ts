import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

const statusFromDb: Record<string, string> = {
  student_leave_pending: 'pending',
  student_leave_approved: 'approved',
  student_leave_rejected: 'rejected',
  student_leave_cancelled: 'cancelled',
}

const statusToDb: Record<string, string> = {
  pending: 'student_leave_pending',
  approved: 'student_leave_approved',
  rejected: 'student_leave_rejected',
  cancelled: 'student_leave_cancelled',
}

function formatLeaveRequest(r: any) {
  return {
    id: r.id,
    studentId: r.studentId,
    studentName: r.student ? `${r.student.firstName} ${r.student.lastName}`.trim() : undefined,
    admissionNumber: r.student?.admissionNumber,
    className: r.student?.class?.name,
    section: r.student?.section?.name,
    reason: r.reason,
    startDate: r.startDate,
    endDate: r.endDate,
    days: r.days,
    category: r.category,
    attachmentUrl: r.attachmentUrl,
    status: statusFromDb[r.status] || r.status,
    appliedBy: r.appliedBy,
    reviewedBy: r.reviewedBy,
    reviewRemarks: r.reviewRemarks,
    reviewedAt: r.reviewedAt,
    createdAt: r.createdAt,
  }
}

const studentInclude = {
  student: {
    select: {
      firstName: true, lastName: true, admissionNumber: true,
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
  },
}

// ==================== CRUD ====================

export async function createStudentLeaveRequest(
  schoolId: string,
  studentId: string,
  appliedBy: string,
  input: { reason: string; startDate: string; endDate: string; days: number; category?: string; attachmentUrl?: string }
) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, organizationId: schoolId },
  })
  if (!student) throw AppError.notFound('Student not found')

  const request = await prisma.studentLeaveRequest.create({
    data: {
      organizationId: schoolId,
      studentId,
      reason: input.reason,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      days: input.days,
      category: input.category || 'general',
      attachmentUrl: input.attachmentUrl,
      appliedBy,
    },
    include: studentInclude,
  })

  return { data: formatLeaveRequest(request) }
}

export async function listStudentLeaveRequests(
  schoolId: string,
  filters: { studentId?: string; status?: string; page?: string; limit?: string }
) {
  const page = parseInt(filters.page || '1')
  const limit = parseInt(filters.limit || '20')
  const skip = (page - 1) * limit

  const where: any = { organizationId: schoolId }
  if (filters.studentId) where.studentId = filters.studentId
  if (filters.status && statusToDb[filters.status]) where.status = statusToDb[filters.status]

  const [data, total] = await Promise.all([
    prisma.studentLeaveRequest.findMany({
      where,
      include: studentInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.studentLeaveRequest.count({ where }),
  ])

  return {
    data: data.map(formatLeaveRequest),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getMyChildrenLeaveRequests(schoolId: string, parentEmail: string) {
  const students = await prisma.student.findMany({
    where: { organizationId: schoolId, parent: { guardianEmail: parentEmail } },
    select: { id: true },
  })

  if (students.length === 0) return { data: [] }

  const requests = await prisma.studentLeaveRequest.findMany({
    where: { studentId: { in: students.map(s => s.id) }, organizationId: schoolId },
    include: studentInclude,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return { data: requests.map(formatLeaveRequest) }
}

export async function updateStudentLeaveRequest(
  id: string,
  reviewedBy: string,
  input: { status: string; reviewRemarks?: string }
) {
  const request = await prisma.studentLeaveRequest.findUnique({ where: { id } })
  if (!request) throw AppError.notFound('Leave request not found')

  if (request.status !== 'student_leave_pending') {
    throw AppError.badRequest('Can only review pending leave requests')
  }

  const dbStatus = statusToDb[input.status]
  if (!dbStatus || !['student_leave_approved', 'student_leave_rejected'].includes(dbStatus)) {
    throw AppError.badRequest('Status must be approved or rejected')
  }

  const updated = await prisma.studentLeaveRequest.update({
    where: { id },
    data: {
      status: dbStatus as any,
      reviewedBy,
      reviewRemarks: input.reviewRemarks || null,
      reviewedAt: new Date(),
    },
    include: studentInclude,
  })

  return { data: formatLeaveRequest(updated) }
}

export async function cancelStudentLeaveRequest(id: string, cancelledBy: string) {
  const request = await prisma.studentLeaveRequest.findUnique({ where: { id } })
  if (!request) throw AppError.notFound('Leave request not found')

  if (request.status !== 'student_leave_pending') {
    throw AppError.badRequest('Can only cancel pending leave requests')
  }

  const updated = await prisma.studentLeaveRequest.update({
    where: { id },
    data: { status: 'student_leave_cancelled' as any },
    include: studentInclude,
  })

  return { data: formatLeaveRequest(updated) }
}
