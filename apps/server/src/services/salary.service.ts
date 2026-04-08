import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

// ==================== Salary Structure ====================

export async function getSalaryStructure(schoolId: string, staffId: string) {
  const structure = await prisma.salaryStructure.findFirst({
    where: { organizationId: schoolId, staffId },
  })
  if (!structure) throw AppError.notFound('Salary structure not found for this staff member')
  return structure
}

export async function updateSalaryStructure(schoolId: string, staffId: string, input: Record<string, unknown>) {
  const basic = Number(input.basicSalary ?? 0)
  const hra = Number(input.hra ?? 0)
  const da = Number(input.da ?? 0)
  const ta = Number(input.ta ?? 0)
  const other = Number(input.otherAllowances ?? 0)
  const pfEmployee = Number(input.pfEmployee ?? Math.round(basic * 0.12))
  const pfEmployer = Number(input.pfEmployer ?? Math.round(basic * 0.12))
  const esi = Number(input.esi ?? 0)
  const tds = Number(input.tds ?? 0)
  const grossSalary = basic + hra + da + ta + other
  const netSalary = grossSalary - pfEmployee - esi - tds

  return prisma.salaryStructure.upsert({
    where: { staffId },
    update: {
      basicSalary: basic, hra, da, ta, otherAllowances: other,
      grossSalary, pfEmployee, pfEmployer, esi, tds, netSalary,
      effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom as string) : new Date(),
    },
    create: {
      organizationId: schoolId,
      staffId,
      basicSalary: basic, hra, da, ta, otherAllowances: other,
      grossSalary, pfEmployee, pfEmployer, esi, tds, netSalary,
      effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom as string) : new Date(),
    },
  })
}

// ==================== Salary Slips ====================

export async function getSalarySlips(
  schoolId: string,
  query: { staffId?: string; month?: number; year?: number; status?: string; page?: number; limit?: number }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.staffId) where.staffId = query.staffId
  if (query.month) where.month = query.month
  if (query.year) where.year = query.year
  if (query.status) where.status = query.status

  const [data, total] = await prisma.$transaction([
    prisma.salarySlip.findMany({ where, orderBy: [{ year: 'desc' }, { month: 'desc' }], skip, take: limit }),
    prisma.salarySlip.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function processMonthlySalary(schoolId: string, month: number, year: number) {
  // Get all staff with salary structures
  const structures = await prisma.salaryStructure.findMany({
    where: { organizationId: schoolId },
  })

  if (structures.length === 0) {
    throw AppError.badRequest('No salary structures found. Please set up salary structures for staff first.')
  }

  // Get additional deductions for this month
  const deductions = await prisma.payrollDeduction.findMany({
    where: { organizationId: schoolId, month, year },
  })

  const deductionsByStaff = deductions.reduce<Record<string, number>>((acc, d) => {
    acc[d.staffId] = (acc[d.staffId] ?? 0) + d.amount
    return acc
  }, {})

  // Fetch staff names
  const staffIds = structures.map((s) => s.staffId)
  const staffList = await prisma.staff.findMany({
    where: { id: { in: staffIds }, organizationId: schoolId },
    select: { id: true, firstName: true, lastName: true },
  })
  const staffNameMap = staffList.reduce<Record<string, string>>((acc, s) => {
    acc[s.id] = `${s.firstName} ${s.lastName}`.trim()
    return acc
  }, {})

  const slips = await prisma.$transaction(
    structures.map((structure) => {
      const extraDeductions = deductionsByStaff[structure.staffId] ?? 0
      const totalDeductions = structure.pfEmployee + structure.esi + structure.tds + extraDeductions
      const netSalary = structure.grossSalary - totalDeductions

      return prisma.salarySlip.upsert({
        where: {
          organizationId_staffId_month_year: {
            organizationId: schoolId,
            staffId: structure.staffId,
            month,
            year,
          },
        },
        update: {
          grossSalary: structure.grossSalary,
          totalDeductions,
          netSalary,
          breakdown: {
            earnings: {
              basic: structure.basicSalary,
              hra: structure.hra,
              da: structure.da,
              ta: structure.ta,
              other: structure.otherAllowances,
            },
            deductions: {
              pfEmployee: structure.pfEmployee,
              esi: structure.esi,
              tds: structure.tds,
              extra: extraDeductions,
            },
          },
        },
        create: {
          organizationId: schoolId,
          staffId: structure.staffId,
          staffName: staffNameMap[structure.staffId] ?? 'Unknown',
          month,
          year,
          grossSalary: structure.grossSalary,
          totalDeductions,
          netSalary,
          breakdown: {
            earnings: {
              basic: structure.basicSalary,
              hra: structure.hra,
              da: structure.da,
              ta: structure.ta,
              other: structure.otherAllowances,
            },
            deductions: {
              pfEmployee: structure.pfEmployee,
              esi: structure.esi,
              tds: structure.tds,
              extra: extraDeductions,
            },
          },
        },
      })
    })
  )

  return { processed: slips.length, month, year }
}

export async function markSalaryPaid(schoolId: string, slipId: string, paymentRef?: string) {
  const slip = await prisma.salarySlip.findFirst({
    where: { id: slipId, organizationId: schoolId },
  })
  if (!slip) throw AppError.notFound('Salary slip not found')
  if (slip.status === 'paid') throw AppError.badRequest('Salary is already marked as paid')

  return prisma.salarySlip.update({
    where: { id: slipId },
    data: { status: 'paid', paidDate: new Date(), paymentRef: paymentRef ?? null },
  })
}

// ==================== Payroll Deductions ====================

export async function getPayrollDeductions(
  schoolId: string,
  query: { staffId?: string; month?: number; year?: number }
) {
  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.staffId) where.staffId = query.staffId
  if (query.month) where.month = query.month
  if (query.year) where.year = query.year

  return prisma.payrollDeduction.findMany({ where, orderBy: { createdAt: 'desc' } })
}

export async function createPayrollDeduction(schoolId: string, input: Record<string, unknown>) {
  return prisma.payrollDeduction.create({
    data: {
      organizationId: schoolId,
      staffId: input.staffId as string,
      type: input.type as string,
      amount: Number(input.amount),
      description: (input.description as string) ?? null,
      month: Number(input.month),
      year: Number(input.year),
    },
  })
}

export async function updatePayrollDeduction(schoolId: string, id: string, input: Record<string, unknown>) {
  const existing = await prisma.payrollDeduction.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Payroll deduction not found')

  return prisma.payrollDeduction.update({
    where: { id },
    data: {
      type: (input.type as string) ?? existing.type,
      amount: input.amount !== undefined ? Number(input.amount) : existing.amount,
      description: input.description !== undefined ? (input.description as string) : existing.description,
    },
  })
}
