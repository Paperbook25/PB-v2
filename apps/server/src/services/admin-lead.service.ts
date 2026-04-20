import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { env } from '../config/env.js'
import jwt from 'jsonwebtoken'
import type { LeadStatus, LeadSource, PlanTier } from '@prisma/client'

const PIPELINE_ORDER: LeadStatus[] = [
  'lead_new', 'lead_contacted', 'lead_qualified', 'lead_demo',
  'lead_proposal', 'lead_negotiation', 'lead_won', 'lead_lost',
]

export async function listLeads(query: {
  page?: number; limit?: number; status?: string; source?: string; search?: string; assignedTo?: string
}) {
  const page = query.page || 1
  const limit = query.limit || 50
  const where: any = {}

  if (query.status) where.status = query.status
  if (query.source) where.source = query.source
  if (query.assignedTo) where.assignedTo = query.assignedTo
  if (query.search) {
    where.OR = [
      { schoolName: { contains: query.search, mode: 'insensitive' } },
      { contactName: { contains: query.search, mode: 'insensitive' } },
      { contactEmail: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    data: leads.map(formatLead),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getLead(id: string) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  })
  if (!lead) throw AppError.notFound('Lead not found')

  return {
    ...formatLead(lead),
    activities: lead.activities.map((a) => ({
      id: a.id,
      type: a.type,
      content: a.content,
      createdBy: a.createdBy,
      metadata: a.metadata,
      createdAt: a.createdAt.toISOString(),
    })),
  }
}

export async function createLead(input: {
  schoolName: string; contactName: string; contactEmail: string; contactPhone?: string
  city?: string; state?: string; source?: string; expectedRevenue?: number
  expectedPlan?: string; assignedTo?: string; notes?: string
}) {
  if (!input.schoolName || !input.contactName || !input.contactEmail) {
    throw AppError.badRequest('School name, contact name, and email are required')
  }

  const lead = await prisma.lead.create({
    data: {
      schoolName: input.schoolName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone || null,
      city: input.city || null,
      state: input.state || null,
      source: (input.source || 'website') as LeadSource,
      expectedRevenue: input.expectedRevenue || null,
      expectedPlan: input.expectedPlan as PlanTier || null,
      assignedTo: input.assignedTo || null,
      notes: input.notes || null,
      status: 'lead_new',
    },
  })

  return formatLead(lead)
}

export async function updateLead(id: string, input: Record<string, any>) {
  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) throw AppError.notFound('Lead not found')

  const data: any = {}
  const allowed = ['schoolName', 'contactName', 'contactEmail', 'contactPhone', 'city', 'state', 'source', 'expectedRevenue', 'expectedPlan', 'assignedTo', 'notes', 'nextFollowUp', 'lostReason']
  for (const key of allowed) {
    if (input[key] !== undefined) {
      if (key === 'nextFollowUp' && input[key]) data[key] = new Date(input[key])
      else data[key] = input[key]
    }
  }

  const updated = await prisma.lead.update({ where: { id }, data })
  return formatLead(updated)
}

export async function updateLeadStatus(id: string, newStatus: string, userId?: string) {
  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) throw AppError.notFound('Lead not found')

  const oldStatus = lead.status

  await prisma.$transaction([
    prisma.lead.update({
      where: { id },
      data: { status: newStatus as LeadStatus },
    }),
    prisma.leadActivity.create({
      data: {
        leadId: id,
        type: 'status_change',
        content: `Status changed from ${oldStatus.replace('lead_', '')} to ${newStatus.replace('lead_', '')}`,
        createdBy: userId || null,
        metadata: { oldStatus, newStatus },
      },
    }),
  ])

  return { success: true }
}

export async function addLeadActivity(leadId: string, input: {
  type: string; content: string; createdBy?: string
}) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) throw AppError.notFound('Lead not found')

  const activity = await prisma.leadActivity.create({
    data: {
      leadId,
      type: input.type,
      content: input.content,
      createdBy: input.createdBy || null,
    },
  })

  return activity
}

export async function sendActivationLink(leadId: string, sentByName: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) throw AppError.notFound('Lead not found')
  if (lead.status === 'lead_won') throw AppError.badRequest('This lead already has an active school')

  const appDomain = env.APP_DOMAIN || 'paperbook.app'
  const token = jwt.sign(
    { leadId: lead.id, contactEmail: lead.contactEmail, contactName: lead.contactName, schoolName: lead.schoolName },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  const activationUrl = `https://app.${appDomain}/activate?token=${token}`

  // Send email fire-and-forget
  ;(async () => {
    const { isEmailEventEnabled, sendEmail, trialActivationEmail } = await import('./email.service.js')
    if (await isEmailEventEnabled('trial_activation')) {
      const emailOpts = trialActivationEmail(lead.contactName, lead.schoolName, activationUrl)
      emailOpts.to = lead.contactEmail
      sendEmail(emailOpts, 'trial_activation').catch(() => {})
    }
  })()

  // Log activity
  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      type: 'email',
      content: `Trial activation link sent to ${lead.contactEmail} by ${sentByName}`,
      createdBy: sentByName,
    },
  })

  return { sent: true, sentTo: lead.contactEmail }
}

export async function deleteLead(id: string) {
  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) throw AppError.notFound('Lead not found')
  await prisma.lead.delete({ where: { id } })
  return { success: true }
}

export async function getPipelineView() {
  const leads = await prisma.lead.findMany({
    where: { status: { not: 'lead_lost' } },
    orderBy: { updatedAt: 'desc' },
  })

  const pipeline: Record<string, any[]> = {}
  for (const stage of PIPELINE_ORDER) {
    pipeline[stage] = leads.filter((l) => l.status === stage).map(formatLead)
  }

  // Stats
  const totalLeads = await prisma.lead.count()
  const wonLeads = await prisma.lead.count({ where: { status: 'lead_won' } })
  const lostLeads = await prisma.lead.count({ where: { status: 'lead_lost' } })
  const activeLeads = totalLeads - wonLeads - lostLeads
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0
  const totalExpectedRevenue = leads
    .filter((l) => l.status !== 'lead_lost' && l.status !== 'lead_won')
    .reduce((sum, l) => sum + Number(l.expectedRevenue || 0), 0)

  return {
    pipeline,
    stats: {
      totalLeads,
      activeLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      totalExpectedRevenue: Math.round(totalExpectedRevenue),
    },
  }
}

function formatLead(lead: any) {
  return {
    id: lead.id,
    schoolName: lead.schoolName,
    contactName: lead.contactName,
    contactEmail: lead.contactEmail,
    contactPhone: lead.contactPhone,
    city: lead.city,
    state: lead.state,
    status: lead.status,
    source: lead.source,
    expectedRevenue: lead.expectedRevenue ? Number(lead.expectedRevenue) : null,
    expectedPlan: lead.expectedPlan,
    assignedTo: lead.assignedTo,
    notes: lead.notes,
    tags: (lead.tags as string[]) || [],
    lostReason: lead.lostReason,
    convertedSchoolId: lead.convertedSchoolId,
    nextFollowUp: lead.nextFollowUp?.toISOString() || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }
}
