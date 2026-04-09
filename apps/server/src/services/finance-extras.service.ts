import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Concessions ====================

export async function listConcessions(
  schoolId: string,
  query: { page?: number; limit?: number; status?: string; studentId?: string }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.status) where.status = query.status
  if (query.studentId) where.studentId = query.studentId

  const [data, total] = await prisma.$transaction([
    prisma.concessionRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.concessionRequest.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function createConcession(schoolId: string, input: Record<string, unknown>) {
  return prisma.concessionRequest.create({
    data: {
      organizationId: schoolId,
      studentId: input.studentId as string,
      studentName: input.studentName as string,
      feeStructureId: (input.feeStructureId as string) ?? null,
      reason: input.reason as string,
      concessionType: (input.concessionType as string) ?? 'fixed',
      amount: Number(input.amount ?? 0),
      percentage: input.percentage ? Number(input.percentage) : null,
    },
  })
}

export async function approveConcession(
  schoolId: string,
  id: string,
  approvedBy: string,
  approvedByName: string,
  remarks?: string
) {
  const existing = await prisma.concessionRequest.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Concession request not found')
  if (existing.status !== 'pending') throw AppError.badRequest('Concession is not pending')

  return prisma.concessionRequest.update({
    where: { id },
    data: { status: 'approved', approvedBy, approvedByName, remarks: remarks ?? null },
  })
}

export async function rejectConcession(
  schoolId: string,
  id: string,
  remarks?: string
) {
  const existing = await prisma.concessionRequest.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Concession request not found')
  if (existing.status !== 'pending') throw AppError.badRequest('Concession is not pending')

  return prisma.concessionRequest.update({ where: { id }, data: { status: 'rejected', remarks: remarks ?? null } })
}

// ==================== Discount Rules ====================

export async function listDiscountRules(schoolId: string, query: { isActive?: boolean } = {}) {
  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.isActive !== undefined) where.isActive = query.isActive

  return prisma.discountRule.findMany({ where, orderBy: { createdAt: 'desc' } })
}

export async function createDiscountRule(schoolId: string, input: Record<string, unknown>) {
  return prisma.discountRule.create({
    data: {
      organizationId: schoolId,
      name: input.name as string,
      description: (input.description as string) ?? null,
      discountType: (input.discountType as string) ?? 'fixed',
      amount: Number(input.amount ?? 0),
      percentage: input.percentage ? Number(input.percentage) : null,
      applicableTo: (input.applicableTo as string) ?? 'all',
      classId: (input.classId as string) ?? null,
      feeTypeId: (input.feeTypeId as string) ?? null,
    },
  })
}

export async function updateDiscountRule(schoolId: string, id: string, input: Record<string, unknown>) {
  const existing = await prisma.discountRule.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Discount rule not found')

  const { organizationId: _org, ...safeInput } = input as any
  return prisma.discountRule.update({ where: { id }, data: safeInput })
}

export async function toggleDiscountRule(schoolId: string, id: string) {
  const existing = await prisma.discountRule.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Discount rule not found')

  return prisma.discountRule.update({ where: { id }, data: { isActive: !existing.isActive } })
}

export async function deleteDiscountRule(schoolId: string, id: string) {
  const existing = await prisma.discountRule.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Discount rule not found')

  await prisma.discountRule.delete({ where: { id } })
  return { success: true }
}

export async function listAppliedDiscounts(schoolId: string, query: { studentId?: string } = {}) {
  // Returns discount information derived from student fees that have discounts applied
  const where: Record<string, unknown> = {
    organizationId: schoolId,
    discountAmount: { gt: 0 },
  }
  if (query.studentId) where.studentId = query.studentId

  const fees = await prisma.studentFee.findMany({
    where,
    select: {
      id: true,
      studentId: true,
      discountAmount: true,
      createdAt: true,
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return fees
}

// ==================== Installment Plans ====================

export async function listInstallmentPlans(schoolId: string, query: { isActive?: boolean } = {}) {
  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.isActive !== undefined) where.isActive = query.isActive

  return prisma.installmentPlan.findMany({
    where,
    include: { installments: { orderBy: { installmentNumber: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getInstallmentPlan(schoolId: string, id: string) {
  const plan = await prisma.installmentPlan.findFirst({
    where: { id, organizationId: schoolId },
    include: { installments: { orderBy: { installmentNumber: 'asc' } } },
  })
  if (!plan) throw AppError.notFound('Installment plan not found')
  return plan
}

export async function createInstallmentPlan(
  schoolId: string,
  input: {
    name: string
    description?: string
    numberOfInstallments?: number
    installments?: Array<{ installmentNumber: number; percentage: number; dueMonth: number; dueDay?: number }>
  }
) {
  const numberOfInstallments = input.numberOfInstallments ?? input.installments?.length ?? 2

  return prisma.installmentPlan.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      description: input.description ?? null,
      numberOfInstallments,
      installments: input.installments
        ? {
            create: input.installments.map((s) => ({
              installmentNumber: s.installmentNumber,
              percentage: s.percentage,
              dueMonth: s.dueMonth,
              dueDay: s.dueDay ?? 10,
            })),
          }
        : undefined,
    },
    include: { installments: { orderBy: { installmentNumber: 'asc' } } },
  })
}

export async function toggleInstallmentPlan(schoolId: string, id: string) {
  const existing = await prisma.installmentPlan.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Installment plan not found')

  return prisma.installmentPlan.update({ where: { id }, data: { isActive: !existing.isActive } })
}

export async function deleteInstallmentPlan(schoolId: string, id: string) {
  const existing = await prisma.installmentPlan.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Installment plan not found')

  await prisma.installmentPlan.delete({ where: { id } })
  return { success: true }
}
