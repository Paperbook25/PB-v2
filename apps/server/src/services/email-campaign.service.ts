import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { sendEmail } from './email.service.js'

// ==================== Types ====================

interface ListQuery {
  page?: number
  limit?: number
  status?: string
  search?: string
}

interface CampaignInput {
  name: string
  description?: string
  trigger?: string
  targetAudience?: string
}

interface StepInput {
  subject: string
  body: string
  delayDays?: number
  sortOrder?: number
}

// ==================== List Campaigns ====================

export async function listCampaigns(schoolId: string, query: ListQuery) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }
  if (query.status) where.status = query.status
  if (query.search) {
    where.name = { contains: query.search, mode: 'insensitive' }
  }

  const [data, total] = await Promise.all([
    prisma.emailCampaign.findMany({
      where,
      include: {
        _count: { select: { steps: true, logs: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.emailCampaign.count({ where }),
  ])

  // Get aggregated log stats per campaign
  const campaignIds = data.map((c) => c.id)
  const logStats = campaignIds.length
    ? await prisma.emailCampaignLog.groupBy({
        by: ['campaignId', 'status'],
        where: { campaignId: { in: campaignIds } },
        _count: true,
      })
    : []

  const statsMap = new Map<string, Record<string, number>>()
  for (const row of logStats) {
    if (!statsMap.has(row.campaignId)) statsMap.set(row.campaignId, {})
    statsMap.get(row.campaignId)![row.status] = row._count
  }

  const campaigns = data.map((c) => ({
    ...c,
    stepsCount: c._count.steps,
    logsCount: c._count.logs,
    stats: statsMap.get(c.id) ?? {},
  }))

  return {
    data: campaigns,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Get Campaign By ID ====================

export async function getCampaignById(schoolId: string, id: string) {
  const campaign = await prisma.emailCampaign.findFirst({
    where: { id, organizationId: schoolId },
    include: {
      steps: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!campaign) throw AppError.notFound('Campaign not found')

  // Get log stats
  const logStats = await prisma.emailCampaignLog.groupBy({
    by: ['status'],
    where: { campaignId: id },
    _count: true,
  })

  const stats: Record<string, number> = {}
  for (const row of logStats) {
    stats[row.status] = row._count
  }

  return { ...campaign, stats }
}

// ==================== Create Campaign ====================

export async function createCampaign(schoolId: string, input: CampaignInput) {
  return prisma.emailCampaign.create({
    data: {
      organizationId: schoolId,
      name: input.name,
      description: input.description,
      trigger: input.trigger ?? 'manual',
      targetAudience: input.targetAudience ?? 'all',
    },
  })
}

// ==================== Update Campaign ====================

export async function updateCampaign(schoolId: string, id: string, input: Partial<CampaignInput>) {
  const existing = await prisma.emailCampaign.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Campaign not found')

  return prisma.emailCampaign.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.trigger !== undefined && { trigger: input.trigger }),
      ...(input.targetAudience !== undefined && { targetAudience: input.targetAudience }),
    },
  })
}

// ==================== Delete Campaign ====================

export async function deleteCampaign(schoolId: string, id: string) {
  const existing = await prisma.emailCampaign.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw AppError.notFound('Campaign not found')

  await prisma.emailCampaign.delete({ where: { id } })
  return { success: true }
}

// ==================== Add Step ====================

export async function addStep(schoolId: string, campaignId: string, input: StepInput) {
  const campaign = await prisma.emailCampaign.findFirst({
    where: { id: campaignId, organizationId: schoolId },
    include: { _count: { select: { steps: true } } },
  })
  if (!campaign) throw AppError.notFound('Campaign not found')

  return prisma.emailCampaignStep.create({
    data: {
      campaignId,
      subject: input.subject,
      body: input.body,
      delayDays: input.delayDays ?? 0,
      sortOrder: input.sortOrder ?? campaign._count.steps,
    },
  })
}

// ==================== Update Step ====================

export async function updateStep(schoolId: string, stepId: string, input: Partial<StepInput>) {
  const step = await prisma.emailCampaignStep.findFirst({
    where: { id: stepId },
    include: { campaign: { select: { organizationId: true } } },
  })
  if (!step || step.campaign.organizationId !== schoolId) {
    throw AppError.notFound('Step not found')
  }

  return prisma.emailCampaignStep.update({
    where: { id: stepId },
    data: {
      ...(input.subject !== undefined && { subject: input.subject }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.delayDays !== undefined && { delayDays: input.delayDays }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
    },
  })
}

// ==================== Delete Step ====================

export async function deleteStep(schoolId: string, stepId: string) {
  const step = await prisma.emailCampaignStep.findFirst({
    where: { id: stepId },
    include: { campaign: { select: { organizationId: true } } },
  })
  if (!step || step.campaign.organizationId !== schoolId) {
    throw AppError.notFound('Step not found')
  }

  await prisma.emailCampaignStep.delete({ where: { id: stepId } })
  return { success: true }
}

// ==================== Activate Campaign ====================

export async function activateCampaign(schoolId: string, id: string) {
  const campaign = await prisma.emailCampaign.findFirst({
    where: { id, organizationId: schoolId },
    include: { _count: { select: { steps: true } } },
  })
  if (!campaign) throw AppError.notFound('Campaign not found')
  if (campaign._count.steps === 0) {
    throw AppError.badRequest('Campaign must have at least one step before activation')
  }

  return prisma.emailCampaign.update({
    where: { id },
    data: { status: 'active' },
  })
}

// ==================== Pause Campaign ====================

export async function pauseCampaign(schoolId: string, id: string) {
  const campaign = await prisma.emailCampaign.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!campaign) throw AppError.notFound('Campaign not found')

  return prisma.emailCampaign.update({
    where: { id },
    data: { status: 'paused' },
  })
}

// ==================== Execute Campaign (Manual Send) ====================

export async function executeCampaign(schoolId: string, id: string) {
  const campaign = await prisma.emailCampaign.findFirst({
    where: { id, organizationId: schoolId, status: 'active' },
    include: { steps: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!campaign) throw AppError.notFound('Active campaign not found')
  if (campaign.steps.length === 0) {
    throw AppError.badRequest('Campaign has no steps to execute')
  }

  // For manual campaigns, send the first step immediately to all pending logs
  const firstStep = campaign.steps[0]
  const pendingLogs = await prisma.emailCampaignLog.findMany({
    where: { campaignId: id, status: 'pending', stepId: null },
  })

  let sentCount = 0
  let failedCount = 0

  for (const log of pendingLogs) {
    try {
      const result = await sendEmail({
        to: log.recipientEmail,
        subject: firstStep.subject,
        html: firstStep.body.replace(/\{\{name\}\}/g, log.recipientName || 'there'),
      })

      await prisma.emailCampaignLog.update({
        where: { id: log.id },
        data: {
          stepId: firstStep.id,
          status: result.sent ? 'sent' : 'failed',
          sentAt: result.sent ? new Date() : undefined,
          error: result.sent ? undefined : 'Email delivery failed',
        },
      })

      if (result.sent) sentCount++
      else failedCount++
    } catch (err: any) {
      await prisma.emailCampaignLog.update({
        where: { id: log.id },
        data: {
          stepId: firstStep.id,
          status: 'failed',
          error: err.message || 'Unknown error',
        },
      })
      failedCount++
    }
  }

  // Mark completed if no more pending
  const remainingPending = await prisma.emailCampaignLog.count({
    where: { campaignId: id, status: 'pending' },
  })
  if (remainingPending === 0 && pendingLogs.length > 0) {
    await prisma.emailCampaign.update({
      where: { id },
      data: { status: 'completed' },
    })
  }

  return { sent: sentCount, failed: failedCount, total: pendingLogs.length }
}

// ==================== Get Campaign Stats ====================

export async function getCampaignStats(schoolId: string, id: string) {
  const campaign = await prisma.emailCampaign.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!campaign) throw AppError.notFound('Campaign not found')

  const logStats = await prisma.emailCampaignLog.groupBy({
    by: ['status'],
    where: { campaignId: id },
    _count: true,
  })

  const stats: Record<string, number> = {
    pending: 0,
    sent: 0,
    failed: 0,
    opened: 0,
    clicked: 0,
  }
  for (const row of logStats) {
    stats[row.status] = row._count
  }

  const total = Object.values(stats).reduce((a, b) => a + b, 0)

  return { ...stats, total }
}

// ==================== Process Trigger ====================

export async function processTrigger(
  schoolId: string,
  trigger: string,
  recipientEmail: string,
  recipientName?: string
) {
  // Find all active campaigns matching this trigger
  const campaigns = await prisma.emailCampaign.findMany({
    where: {
      organizationId: schoolId,
      trigger,
      status: 'active',
    },
    include: {
      steps: { orderBy: { sortOrder: 'asc' }, take: 1 },
    },
  })

  if (campaigns.length === 0) return

  for (const campaign of campaigns) {
    const firstStep = campaign.steps[0]
    if (!firstStep) continue

    // Create a log entry
    const log = await prisma.emailCampaignLog.create({
      data: {
        campaignId: campaign.id,
        stepId: firstStep.id,
        recipientEmail,
        recipientName,
        status: 'pending',
      },
    })

    // Send the first step immediately if delayDays is 0
    if (firstStep.delayDays === 0) {
      try {
        const result = await sendEmail({
          to: recipientEmail,
          subject: firstStep.subject,
          html: firstStep.body.replace(/\{\{name\}\}/g, recipientName || 'there'),
        })

        await prisma.emailCampaignLog.update({
          where: { id: log.id },
          data: {
            status: result.sent ? 'sent' : 'failed',
            sentAt: result.sent ? new Date() : undefined,
            error: result.sent ? undefined : 'Email delivery failed',
          },
        })
      } catch (err: any) {
        await prisma.emailCampaignLog.update({
          where: { id: log.id },
          data: {
            status: 'failed',
            error: err.message || 'Unknown error',
          },
        })
      }
    }
  }
}
