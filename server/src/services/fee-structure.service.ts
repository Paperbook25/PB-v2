import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { feeCategoryReverse } from './fee-type.service.js'
import type { CreateFeeStructureInput, UpdateFeeStructureInput, AssignFeeStructureInput } from '../validators/finance.validators.js'

// ==================== Enum Mapping ====================

const frequencyMap: Record<string, string> = {
  monthly: 'freq_monthly',
  quarterly: 'freq_quarterly',
  half_yearly: 'freq_half_yearly',
  annual: 'freq_annual',
  one_time: 'freq_one_time',
}

const frequencyReverse: Record<string, string> = Object.fromEntries(
  Object.entries(frequencyMap).map(([k, v]) => [v, k])
)

// ==================== Helpers ====================

function formatFeeStructure(fs: any) {
  return {
    id: fs.id,
    feeTypeId: fs.feeTypeId,
    feeType: fs.feeType ? {
      id: fs.feeType.id,
      name: fs.feeType.name,
      category: feeCategoryReverse[fs.feeType.category] || fs.feeType.category,
    } : undefined,
    academicYear: fs.academicYear,
    applicableClasses: fs.applicableClasses,
    amount: Number(fs.amount),
    frequency: frequencyReverse[fs.frequency] || fs.frequency,
    dueDay: fs.dueDay,
    isOptional: fs.isOptional,
    isActive: fs.isActive,
    createdAt: fs.createdAt,
    updatedAt: fs.updatedAt,
  }
}

function computeDueDate(frequency: string, dueDay: number, academicYear: string): Date {
  // Parse year from academic year (e.g., "2024-25" -> 2024)
  const year = parseInt(academicYear.split('-')[0], 10) || new Date().getFullYear()
  const day = Math.min(dueDay, 28)

  switch (frequency) {
    case 'freq_monthly':
      // Next month from now
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth() + 1, day)
    case 'freq_quarterly':
      // Start of next quarter in academic year (April-based)
      return new Date(year, 6, day) // July
    case 'freq_half_yearly':
      return new Date(year, 9, day) // October
    case 'freq_annual':
      return new Date(year, 3, day) // April (start of academic year)
    case 'freq_one_time':
      return new Date(year, 3, day) // April
    default:
      return new Date(year, 3, day)
  }
}

const feeStructureInclude = {
  feeType: true,
}

// ==================== CRUD ====================

export async function listFeeStructures(query: {
  academicYear?: string
  feeTypeId?: string
  className?: string
  isActive?: string
  page?: number
  limit?: number
}) {
  const page = query.page || 1
  const limit = query.limit || 20
  const where: any = {}

  if (query.academicYear) where.academicYear = query.academicYear
  if (query.feeTypeId) where.feeTypeId = query.feeTypeId
  if (query.isActive !== undefined) where.isActive = query.isActive === 'true'

  const [total, structures] = await Promise.all([
    prisma.feeStructure.count({ where }),
    prisma.feeStructure.findMany({
      where,
      include: feeStructureInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  let data = structures.map(formatFeeStructure)

  // Filter by className in memory (JSON column)
  if (query.className) {
    data = data.filter((fs: any) =>
      Array.isArray(fs.applicableClasses) && fs.applicableClasses.includes(query.className)
    )
  }

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getFeeStructureById(id: string) {
  const fs = await prisma.feeStructure.findUnique({
    where: { id },
    include: feeStructureInclude,
  })
  if (!fs) throw AppError.notFound('Fee structure not found')
  return formatFeeStructure(fs)
}

export async function createFeeStructure(input: CreateFeeStructureInput) {
  // Verify fee type exists
  const feeType = await prisma.feeType.findUnique({ where: { id: input.feeTypeId } })
  if (!feeType) throw AppError.badRequest('Fee type not found')

  const frequency = frequencyMap[input.frequency]
  if (!frequency) throw AppError.badRequest('Invalid fee frequency')

  const fs = await prisma.feeStructure.create({
    data: {
      feeTypeId: input.feeTypeId,
      academicYear: input.academicYear,
      applicableClasses: input.applicableClasses,
      amount: input.amount,
      frequency: frequency as any,
      dueDay: input.dueDay || 10,
      isOptional: input.isOptional || false,
      isActive: input.isActive !== undefined ? input.isActive : true,
    },
    include: feeStructureInclude,
  })

  return formatFeeStructure(fs)
}

export async function updateFeeStructure(id: string, input: UpdateFeeStructureInput) {
  const existing = await prisma.feeStructure.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Fee structure not found')

  const data: any = {}
  if (input.feeTypeId !== undefined) {
    const feeType = await prisma.feeType.findUnique({ where: { id: input.feeTypeId } })
    if (!feeType) throw AppError.badRequest('Fee type not found')
    data.feeTypeId = input.feeTypeId
  }
  if (input.academicYear !== undefined) data.academicYear = input.academicYear
  if (input.applicableClasses !== undefined) data.applicableClasses = input.applicableClasses
  if (input.amount !== undefined) data.amount = input.amount
  if (input.frequency !== undefined) data.frequency = frequencyMap[input.frequency]
  if (input.dueDay !== undefined) data.dueDay = input.dueDay
  if (input.isOptional !== undefined) data.isOptional = input.isOptional
  if (input.isActive !== undefined) data.isActive = input.isActive

  const fs = await prisma.feeStructure.update({
    where: { id },
    data,
    include: feeStructureInclude,
  })

  return formatFeeStructure(fs)
}

export async function toggleFeeStructure(id: string) {
  const existing = await prisma.feeStructure.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Fee structure not found')

  const fs = await prisma.feeStructure.update({
    where: { id },
    data: { isActive: !existing.isActive },
    include: feeStructureInclude,
  })

  return formatFeeStructure(fs)
}

export async function deleteFeeStructure(id: string) {
  const existing = await prisma.feeStructure.findUnique({ where: { id } })
  if (!existing) throw AppError.notFound('Fee structure not found')

  const feeCount = await prisma.studentFee.count({ where: { feeStructureId: id } })
  if (feeCount > 0) {
    throw AppError.badRequest('Cannot delete fee structure with assigned student fees')
  }

  await prisma.feeStructure.delete({ where: { id } })
  return { success: true }
}

export async function assignFeeStructure(id: string, input: AssignFeeStructureInput) {
  const fs = await prisma.feeStructure.findUnique({
    where: { id },
    include: { feeType: true },
  })
  if (!fs) throw AppError.notFound('Fee structure not found')

  let studentIds: string[] = []

  if (input.studentIds && input.studentIds.length > 0) {
    // Use provided student IDs
    studentIds = input.studentIds
  } else {
    // Find students in applicable classes
    const classNames = fs.applicableClasses as string[]
    if (!classNames || classNames.length === 0) {
      throw AppError.badRequest('No applicable classes defined for this fee structure')
    }

    const classes = await prisma.class.findMany({
      where: { name: { in: classNames } },
      select: { id: true },
    })
    const classIds = classes.map((c) => c.id)

    const whereClause: any = { classId: { in: classIds }, status: 'active' }
    if (input.className) {
      const cls = await prisma.class.findFirst({ where: { name: input.className } })
      if (cls) whereClause.classId = cls.id
    }
    if (input.sectionName && input.className) {
      const cls = await prisma.class.findFirst({ where: { name: input.className } })
      if (cls) {
        const section = await prisma.section.findFirst({
          where: { classId: cls.id, name: input.sectionName },
        })
        if (section) whereClause.sectionId = section.id
      }
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      select: { id: true },
    })
    studentIds = students.map((s) => s.id)
  }

  if (studentIds.length === 0) {
    return { created: 0, skipped: 0 }
  }

  const dueDate = computeDueDate(fs.frequency, fs.dueDay, fs.academicYear)
  let created = 0
  let skipped = 0

  for (const studentId of studentIds) {
    // Check if already assigned
    const existing = await prisma.studentFee.findFirst({
      where: { studentId, feeStructureId: id },
    })
    if (existing) {
      skipped++
      continue
    }

    await prisma.studentFee.create({
      data: {
        studentId,
        feeStructureId: id,
        feeTypeId: fs.feeTypeId,
        academicYear: fs.academicYear,
        totalAmount: fs.amount,
        paidAmount: 0,
        discountAmount: 0,
        dueDate,
        status: 'fps_pending',
      },
    })
    created++
  }

  return { created, skipped }
}

export { frequencyMap, frequencyReverse }
