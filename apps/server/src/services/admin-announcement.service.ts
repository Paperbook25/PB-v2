import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { sendEmail } from './email.service.js'
import type { AnnouncementStatus, AnnouncementChannel, PlanTier } from '@prisma/client'

export async function listAnnouncements(query: {
  page?: number; limit?: number; status?: string
}) {
  const page = query.page || 1
  const limit = query.limit || 20
  const where: any = {}
  if (query.status) where.status = query.status

  const [total, announcements] = await Promise.all([
    prisma.platformAnnouncement.count({ where }),
    prisma.platformAnnouncement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: announcements.map(formatAnnouncement),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getAnnouncement(id: string) {
  const ann = await prisma.platformAnnouncement.findUnique({ where: { id } })
  if (!ann) throw AppError.notFound('Announcement not found')
  return formatAnnouncement(ann)
}

export async function createAnnouncement(input: {
  title: string; body: string; channel?: string
  targetPlans?: string[]; targetStatuses?: string[]
  scheduledAt?: string; createdBy?: string
}) {
  if (!input.title || !input.body) {
    throw AppError.badRequest('Title and body are required')
  }

  const ann = await prisma.platformAnnouncement.create({
    data: {
      title: input.title,
      body: input.body,
      channel: (input.channel || 'in_app') as AnnouncementChannel,
      status: input.scheduledAt ? 'ann_scheduled' : 'ann_draft',
      targetPlans: (input.targetPlans || []) as PlanTier[],
      targetStatuses: input.targetStatuses || [],
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      createdBy: input.createdBy || null,
    },
  })

  return formatAnnouncement(ann)
}

export async function updateAnnouncement(id: string, input: Record<string, any>) {
  const ann = await prisma.platformAnnouncement.findUnique({ where: { id } })
  if (!ann) throw AppError.notFound('Announcement not found')
  if (ann.status === 'ann_sent') throw AppError.badRequest('Cannot edit sent announcements')

  const data: any = {}
  if (input.title !== undefined) data.title = input.title
  if (input.body !== undefined) data.body = input.body
  if (input.channel !== undefined) data.channel = input.channel
  if (input.targetPlans !== undefined) data.targetPlans = input.targetPlans
  if (input.targetStatuses !== undefined) data.targetStatuses = input.targetStatuses
  if (input.scheduledAt !== undefined) {
    data.scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null
    data.status = input.scheduledAt ? 'ann_scheduled' : 'ann_draft'
  }

  const updated = await prisma.platformAnnouncement.update({ where: { id }, data })
  return formatAnnouncement(updated)
}

export async function sendAnnouncement(id: string) {
  const ann = await prisma.platformAnnouncement.findUnique({ where: { id } })
  if (!ann) throw AppError.notFound('Announcement not found')
  if (ann.status === 'ann_sent') throw AppError.badRequest('Already sent')

  // Find target schools
  const where: any = {}
  if (ann.targetPlans.length > 0) where.planTier = { in: ann.targetPlans }
  if (ann.targetStatuses.length > 0) where.status = { in: ann.targetStatuses }

  const schools = await prisma.schoolProfile.findMany({
    where,
    select: { id: true, name: true, email: true },
  })

  // Send emails if channel includes email
  if (ann.channel === 'email' || ann.channel === 'both') {
    for (const school of schools) {
      if (school.email) {
        sendEmail({
          to: school.email,
          subject: `[PaperBook] ${ann.title}`,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4f46e5;">${ann.title}</h2>
            <div>${ann.body}</div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">PaperBook Platform Announcement</p>
          </div>`,
          text: `${ann.title}\n\n${ann.body}`,
        }).catch((err) => console.error(`[Announcement] Email to ${school.email} failed:`, err))
      }
    }
  }

  await prisma.platformAnnouncement.update({
    where: { id },
    data: { status: 'ann_sent', sentAt: new Date() },
  })

  return { success: true, recipientCount: schools.length }
}

export async function deleteAnnouncement(id: string) {
  const ann = await prisma.platformAnnouncement.findUnique({ where: { id } })
  if (!ann) throw AppError.notFound('Announcement not found')
  await prisma.platformAnnouncement.delete({ where: { id } })
  return { success: true }
}

function formatAnnouncement(ann: any) {
  return {
    id: ann.id,
    title: ann.title,
    body: ann.body,
    channel: ann.channel,
    status: ann.status,
    targetPlans: ann.targetPlans,
    targetStatuses: ann.targetStatuses,
    scheduledAt: ann.scheduledAt?.toISOString() || null,
    sentAt: ann.sentAt?.toISOString() || null,
    createdBy: ann.createdBy,
    createdAt: ann.createdAt.toISOString(),
  }
}
