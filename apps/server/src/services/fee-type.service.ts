import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import type { CreateFeeTypeInput, UpdateFeeTypeInput } from '../validators/finance.validators.js'

// ==================== Enum Mapping ====================

const feeCategoryMap: Record<string, string> = {
  tuition: 'fee_tuition',
  development: 'fee_development',
  lab: 'fee_lab',
  library: 'fee_library',
  sports: 'fee_sports',
  computer: 'fee_computer',
  transport: 'fee_transport',
  examination: 'fee_examination',
  other: 'fee_other',
}

const feeCategoryReverse: Record<string, string> = Object.fromEntries(
  Object.entries(feeCategoryMap).map(([k, v]) => [v, k])
)

// ==================== Helpers ====================

function formatFeeType(ft: any) {
  return {
    id: ft.id,
    name: ft.name,
    category: feeCategoryReverse[ft.category] || ft.category,
    description: ft.description,
    isActive: ft.isActive,
    createdAt: ft.createdAt,
    updatedAt: ft.updatedAt,
  }
}

// ==================== CRUD ====================

export async function listFeeTypes(schoolId: string, query: {
  isActive?: string
  category?: string
}) {
  const where: any = { organizationId: schoolId }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true'
  }
  if (query.category && feeCategoryMap[query.category]) {
    where.category = feeCategoryMap[query.category]
  }

  const feeTypes = await prisma.feeType.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return { data: feeTypes.map(formatFeeType) }
}

export async function getFeeTypeById(schoolId: string, id: string) {
  const ft = await prisma.feeType.findFirst({ where: { id, organizationId: schoolId } })
  if (!ft) throw AppError.notFound('Fee type not found')
  return formatFeeType(ft)
}

export async function createFeeType(schoolId: string, input: CreateFeeTypeInput) {
  const category = feeCategoryMap[input.category]
  if (!category) throw AppError.badRequest('Invalid fee category')

  // Check unique constraint
  const existing = await prisma.feeType.findFirst({
    where: { name: input.name, category: category as any, organizationId: schoolId },
  })
  if (existing) throw AppError.conflict('A fee type with this name and category already exists')

  const ft = await prisma.feeType.create({
    data: {
      name: input.name,
      category: category as any,
      description: input.description || null,
      isActive: input.isActive !== undefined ? input.isActive : true,
      organizationId: schoolId,
    },
  })

  return formatFeeType(ft)
}

export async function updateFeeType(schoolId: string, id: string, input: UpdateFeeTypeInput) {
  const existing = await prisma.feeType.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Fee type not found')

  const data: any = {}
  if (input.name !== undefined) data.name = input.name
  if (input.category !== undefined) data.category = feeCategoryMap[input.category]
  if (input.description !== undefined) data.description = input.description
  if (input.isActive !== undefined) data.isActive = input.isActive

  // Check uniqueness if name or category changed
  if (data.name || data.category) {
    const checkName = data.name || existing.name
    const checkCat = data.category || existing.category
    const dup = await prisma.feeType.findFirst({
      where: { name: checkName, category: checkCat as any, organizationId: schoolId, NOT: { id } },
    })
    if (dup) throw AppError.conflict('A fee type with this name and category already exists')
  }

  const ft = await prisma.feeType.update({ where: { id }, data })
  return formatFeeType(ft)
}

export async function toggleFeeType(schoolId: string, id: string) {
  const existing = await prisma.feeType.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Fee type not found')

  const ft = await prisma.feeType.update({
    where: { id },
    data: { isActive: !existing.isActive },
  })
  return formatFeeType(ft)
}

export async function deleteFeeType(schoolId: string, id: string) {
  const existing = await prisma.feeType.findFirst({ where: { id, organizationId: schoolId } })
  if (!existing) throw AppError.notFound('Fee type not found')

  // Check if linked to any fee structures
  const structureCount = await prisma.feeStructure.count({ where: { feeTypeId: id, organizationId: schoolId } })
  if (structureCount > 0) {
    throw AppError.badRequest('Cannot delete fee type with linked fee structures')
  }

  await prisma.feeType.delete({ where: { id } })
  return { success: true }
}

export { feeCategoryMap, feeCategoryReverse }
