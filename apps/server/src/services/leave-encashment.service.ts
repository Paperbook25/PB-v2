import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

const statusFromDb: Record<string, string> = {
  encash_pending: 'pending',
  encash_approved: 'approved',
  encash_rejected: 'rejected',
  encash_processed: 'processed',
}

// ==================== Leave Encashment ====================

export async function requestEncashment(schoolId: string, staffId: string, input: {
  leaveType: string; daysToEncash: number;
}) {
  const staff = await prisma.staff.findFirst({
    where: { id: staffId, organizationId: schoolId },
  })
  if (!staff) throw AppError.notFound('Staff not found')

  // Get current leave balance
  const academicYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true, organizationId: schoolId },
  })
  if (!academicYear) throw AppError.notFound('No active academic year')

  const balance = await prisma.leaveBalance.findUnique({
    where: { staffId_type_academicYearId: { staffId, type: input.leaveType as any, academicYearId: academicYear.id } },
  })

  const available = balance ? balance.total - balance.used : 0
  if (input.daysToEncash > available) {
    throw AppError.badRequest(`Cannot encash ${input.daysToEncash} days. Only ${available} days available.`)
  }

  // Calculate daily rate from salary
  const dailyRate = staff.salary ? staff.salary / 30 : 0
  if (dailyRate === 0) throw AppError.badRequest('Staff salary not set. Cannot calculate encashment.')

  const totalAmount = Math.round(dailyRate * input.daysToEncash)

  return prisma.leaveEncashment.create({
    data: {
      organizationId: schoolId,
      staffId,
      leaveType: input.leaveType as any,
      daysEncashed: input.daysToEncash,
      dailyRate,
      totalAmount,
    },
  })
}

export async function listEncashments(schoolId: string, filters: {
  staffId?: string; status?: string; page?: string; limit?: string;
}) {
  const page = parseInt(filters.page || '1')
  const limit = parseInt(filters.limit || '20')
  const skip = (page - 1) * limit

  const where: any = { organizationId: schoolId }
  if (filters.staffId) where.staffId = filters.staffId
  if (filters.status) where.status = `encash_${filters.status}`

  const [data, total] = await Promise.all([
    prisma.leaveEncashment.findMany({
      where,
      include: { staff: { select: { firstName: true, lastName: true, employeeId: true } } },
      orderBy: { requestedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.leaveEncashment.count({ where }),
  ])

  return {
    data: data.map(e => ({
      id: e.id,
      staffId: e.staffId,
      staffName: `${e.staff.firstName} ${e.staff.lastName}`.trim(),
      employeeId: e.staff.employeeId,
      leaveType: e.leaveType,
      daysEncashed: e.daysEncashed,
      dailyRate: e.dailyRate,
      totalAmount: e.totalAmount,
      status: statusFromDb[e.status] || e.status,
      requestedAt: e.requestedAt,
      processedBy: e.processedBy,
      processedAt: e.processedAt,
      remarks: e.remarks,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function processEncashment(id: string, processedBy: string, input: {
  status: 'approved' | 'rejected'; remarks?: string;
}) {
  const encashment = await prisma.leaveEncashment.findUnique({ where: { id } })
  if (!encashment) throw AppError.notFound('Encashment request not found')
  if (encashment.status !== 'encash_pending') throw AppError.badRequest('Only pending requests can be processed')

  const dbStatus = `encash_${input.status}` as any

  // If approved, deduct from leave balance
  if (input.status === 'approved') {
    const academicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true, organizationId: encashment.organizationId },
    })
    if (academicYear) {
      await prisma.leaveBalance.updateMany({
        where: { staffId: encashment.staffId, type: encashment.leaveType, academicYearId: academicYear.id },
        data: { used: { increment: encashment.daysEncashed } },
      })
    }
  }

  return prisma.leaveEncashment.update({
    where: { id },
    data: {
      status: dbStatus,
      processedBy,
      processedAt: new Date(),
      remarks: input.remarks,
    },
  })
}
