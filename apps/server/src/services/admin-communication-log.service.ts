import { prisma } from '../config/db.js'

export async function logCommunication(input: {
  schoolId?: string; schoolName?: string; channel: string; direction: string;
  subject?: string; content: string; fromAddress?: string; toAddress?: string;
  sentBy?: string; sentByName?: string; metadata?: string;
}) {
  return prisma.communicationLog.create({ data: input })
}

export async function listCommunicationLogs(filters: {
  schoolId?: string; channel?: string; direction?: string;
  page?: string; limit?: string;
}) {
  const page = parseInt(filters.page || '1')
  const limit = parseInt(filters.limit || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (filters.schoolId) where.schoolId = filters.schoolId
  if (filters.channel) where.channel = filters.channel
  if (filters.direction) where.direction = filters.direction

  const [data, total] = await Promise.all([
    prisma.communicationLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.communicationLog.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}
