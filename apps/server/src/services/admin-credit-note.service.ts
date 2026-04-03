import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

const statusFromDb: Record<string, string> = {
  cn_draft: 'draft', cn_issued: 'issued', cn_applied: 'applied', cn_cancelled: 'cancelled',
}

export async function listCreditNotes(filters: { schoolId?: string; status?: string; page?: string; limit?: string }) {
  const page = parseInt(filters.page || '1')
  const limit = parseInt(filters.limit || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (filters.schoolId) where.schoolId = filters.schoolId
  if (filters.status) where.status = `cn_${filters.status}`

  const [data, total] = await Promise.all([
    prisma.creditNote.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.creditNote.count({ where }),
  ])

  return {
    data: data.map(cn => ({
      id: cn.id, schoolId: cn.schoolId, invoiceId: cn.invoiceId,
      amount: Number(cn.amount), reason: cn.reason,
      status: statusFromDb[cn.status] || cn.status,
      issuedAt: cn.issuedAt, issuedBy: cn.issuedBy,
      appliedAt: cn.appliedAt, createdAt: cn.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function createCreditNote(input: {
  schoolId: string; invoiceId?: string; amount: number; reason: string;
}) {
  return prisma.creditNote.create({
    data: { schoolId: input.schoolId, invoiceId: input.invoiceId, amount: input.amount, reason: input.reason },
  })
}

export async function issueCreditNote(id: string, issuedBy: string) {
  return prisma.creditNote.update({
    where: { id },
    data: { status: 'cn_issued' as any, issuedAt: new Date(), issuedBy },
  })
}

export async function applyCreditNote(id: string) {
  const cn = await prisma.creditNote.findUnique({ where: { id } })
  if (!cn) throw AppError.notFound('Credit note not found')
  if (cn.status !== 'cn_issued') throw AppError.badRequest('Only issued credit notes can be applied')

  return prisma.creditNote.update({
    where: { id },
    data: { status: 'cn_applied' as any, appliedAt: new Date() },
  })
}

export async function cancelCreditNote(id: string) {
  return prisma.creditNote.update({
    where: { id },
    data: { status: 'cn_cancelled' as any },
  })
}
