import { prisma } from '../config/db.js'
import { Prisma } from '@prisma/client'

// ==================== Helpers ====================

function formatLedgerEntry(entry: any) {
  return {
    id: entry.id,
    date: entry.date,
    type: entry.type === 'ledger_credit' ? 'credit' : 'debit',
    category: entry.category,
    referenceId: entry.referenceId,
    referenceNumber: entry.referenceNumber,
    description: entry.description,
    amount: Number(entry.amount),
    balance: Number(entry.balance),
    createdAt: entry.createdAt,
  }
}

// ==================== Core ====================

export async function getLastBalance(schoolId: string): Promise<number> {
  const last = await prisma.ledgerEntry.findFirst({
    where: { organizationId: schoolId },
    orderBy: { createdAt: 'desc' },
    select: { balance: true },
  })
  return last ? Number(last.balance) : 0
}

export async function createLedgerEntry(
  schoolId: string,
  data: {
    type: 'credit' | 'debit'
    category: string
    referenceId?: string
    referenceNumber?: string
    description: string
    amount: number
  },
  tx?: Prisma.TransactionClient,
) {
  const execute = async (client: any) => {
    const last = await client.ledgerEntry.findFirst({
      where: { organizationId: schoolId },
      orderBy: { createdAt: 'desc' },
      select: { balance: true },
    })
    const lastBal = last ? Number(last.balance) : 0
    const newBalance = data.type === 'credit'
      ? lastBal + data.amount
      : lastBal - data.amount

    const entry = await client.ledgerEntry.create({
      data: {
        organizationId: schoolId,
        date: new Date(),
        type: data.type === 'credit' ? 'ledger_credit' : 'ledger_debit',
        category: data.category,
        referenceId: data.referenceId || null,
        referenceNumber: data.referenceNumber || null,
        description: data.description,
        amount: data.amount,
        balance: newBalance,
      },
    })

    return formatLedgerEntry(entry)
  }

  if (tx) {
    return execute(tx)
  }

  // Use serializable isolation to prevent concurrent balance reads
  return prisma.$transaction(execute, {
    isolationLevel: 'Serializable',
  })
}

// ==================== Queries ====================

export async function listLedgerEntries(schoolId: string, query: {
  page?: number
  limit?: number
  type?: string
  category?: string
  startDate?: string
  endDate?: string
}) {
  const page = query.page || 1
  const limit = query.limit || 20
  const where: any = {}
  where.organizationId = schoolId

  if (query.type) {
    where.type = query.type === 'credit' ? 'ledger_credit' : 'ledger_debit'
  }
  if (query.category) {
    where.category = query.category
  }
  if (query.startDate || query.endDate) {
    where.date = {}
    if (query.startDate) where.date.gte = new Date(query.startDate)
    if (query.endDate) where.date.lte = new Date(query.endDate + 'T23:59:59.999Z')
  }

  const [total, entries] = await Promise.all([
    prisma.ledgerEntry.count({ where }),
    prisma.ledgerEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: entries.map(formatLedgerEntry),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getLedgerEntryById(schoolId: string, id: string) {
  const entry = await prisma.ledgerEntry.findFirst({ where: { id, organizationId: schoolId } })
  if (!entry) return null
  return formatLedgerEntry(entry)
}

export async function getBalanceSummary(schoolId: string, query: { startDate?: string; endDate?: string }) {
  const where: any = {}
  where.organizationId = schoolId
  if (query.startDate || query.endDate) {
    where.date = {}
    if (query.startDate) where.date.gte = new Date(query.startDate)
    if (query.endDate) where.date.lte = new Date(query.endDate + 'T23:59:59.999Z')
  }

  const entries = await prisma.ledgerEntry.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    select: { type: true, amount: true, balance: true },
  })

  let totalCredits = 0
  let totalDebits = 0
  for (const e of entries) {
    if (e.type === 'ledger_credit') totalCredits += Number(e.amount)
    else totalDebits += Number(e.amount)
  }

  // Opening balance = first entry's balance - its amount (if credit) or + its amount (if debit)
  let openingBalance = 0
  if (entries.length > 0) {
    const first = entries[0]
    openingBalance = first.type === 'ledger_credit'
      ? Number(first.balance) - Number(first.amount)
      : Number(first.balance) + Number(first.amount)
  }

  const closingBalance = entries.length > 0 ? Number(entries[entries.length - 1].balance) : openingBalance

  return {
    openingBalance,
    totalCredits,
    totalDebits,
    closingBalance,
    netBalance: totalCredits - totalDebits,
  }
}
