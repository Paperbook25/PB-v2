import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../../config/db.js'
import { sendEmail, isEmailEventEnabled, invalidateEmailConfigCache } from '../../services/email.service.js'

const router = Router()

// ============================================================================
// GET /admin/email/stats
// Overview stats for the Email Management page
// ============================================================================
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [totalSent, totalFailed, todaySent, byTemplate] = await Promise.all([
      prisma.emailLog.count({ where: { status: 'sent', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.emailLog.count({ where: { status: 'failed', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.emailLog.count({
        where: { status: 'sent', createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      prisma.emailLog.groupBy({
        by: ['template'],
        _count: { id: true },
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),
    ])

    // Per-template fail rates
    const failCounts = await prisma.emailLog.groupBy({
      by: ['template'],
      _count: { id: true },
      where: { status: 'failed', createdAt: { gte: thirtyDaysAgo } },
    })
    const failMap: Record<string, number> = {}
    for (const r of failCounts) failMap[r.template] = r._count.id

    const successRate = totalSent + totalFailed > 0
      ? Math.round((totalSent / (totalSent + totalFailed)) * 100)
      : 100

    // Last 5 failures
    const recentFailures = await prisma.emailLog.findMany({
      where: { status: 'failed' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, to: true, subject: true, template: true, error: true, createdAt: true },
    })

    res.json({
      data: {
        totalSent,
        totalFailed,
        todaySent,
        successRate,
        byTemplate: byTemplate.map(r => ({
          template: r.template,
          count: r._count.id,
          failCount: failMap[r.template] || 0,
          failRate: r._count.id > 0 ? Math.round(((failMap[r.template] || 0) / r._count.id) * 100) : 0,
        })),
        recentFailures,
      },
    })
  } catch (err) { next(err) }
})

// ============================================================================
// GET /admin/email/logs
// Paginated email log entries
// ============================================================================
router.get('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Number(req.query.limit) || 25)
    const skip = (page - 1) * limit

    const where: any = {}
    if (req.query.status) where.status = req.query.status
    if (req.query.template) where.template = req.query.template
    if (req.query.search) {
      where.OR = [
        { to: { contains: String(req.query.search), mode: 'insensitive' } },
        { subject: { contains: String(req.query.search), mode: 'insensitive' } },
      ]
    }
    if (req.query.from || req.query.to) {
      where.createdAt = {}
      if (req.query.from) where.createdAt.gte = new Date(String(req.query.from))
      if (req.query.to) where.createdAt.lte = new Date(String(req.query.to))
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.emailLog.count({ where }),
    ])

    res.json({
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

// ============================================================================
// GET /admin/email/config
// Active email integration (masked) + all event toggle states
// ============================================================================
router.get('/config', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Active email integration
    const integration = await prisma.platformIntegration.findFirst({
      where: { type: 'email_service', status: 'active' },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    })

    // All event toggle states
    const settings = await prisma.platformSettings.findMany({
      where: { key: { startsWith: 'email.event.' } },
    })
    const events: Record<string, boolean> = {}
    for (const s of settings) {
      const key = s.key.replace('email.event.', '')
      events[key] = s.value === 'true'
    }

    res.json({
      data: {
        hasActiveIntegration: !!integration,
        provider: integration?.provider || null,
        fromAddress: integration ? '(configured)' : null,
        lastTestedAt: integration?.lastTestedAt || null,
        events,
      },
    })
  } catch (err) { next(err) }
})

// ============================================================================
// PUT /admin/email/events
// Bulk upsert event toggle states
// ============================================================================
router.put('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { events } = req.body as { events: Record<string, boolean> }
    if (!events || typeof events !== 'object') {
      return res.status(400).json({ error: 'events object is required' })
    }

    const updates = Object.entries(events).map(([key, enabled]) =>
      prisma.platformSettings.upsert({
        where: { key: `email.event.${key}` },
        create: {
          key: `email.event.${key}`,
          value: String(enabled),
          description: `Email event toggle for ${key}`,
          updatedBy: req.user?.userId || 'admin',
        },
        update: {
          value: String(enabled),
          updatedBy: req.user?.userId || 'admin',
        },
      })
    )

    await prisma.$transaction(updates)
    res.json({ success: true, updated: Object.keys(events).length })
  } catch (err) { next(err) }
})

// ============================================================================
// POST /admin/email/test
// Send a real test email using the active integration
// ============================================================================
router.post('/test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { to } = req.body
    if (!to || typeof to !== 'string') {
      return res.status(400).json({ error: 'to email address is required' })
    }

    // Invalidate cache so we always use the latest config
    invalidateEmailConfigCache()

    const result = await sendEmail(
      {
        to,
        subject: 'PaperBook Email Test — it works!',
        html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:40px;">
          <div style="max-width:500px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <h2 style="color:#6366f1;margin:0 0 16px;">Email Test Successful!</h2>
            <p style="color:#374151;">This is a test email from Gravity Portal to confirm your Resend integration is working correctly.</p>
            <p style="color:#6b7280;font-size:13px;margin-top:24px;">Sent from: PaperBook Gravity Portal</p>
          </div>
        </body></html>`,
        text: 'PaperBook email test — if you received this, your email integration is working!',
      },
      'test'
    )

    if (result.sent) {
      res.json({ success: true, message: `Test email sent to ${to}`, messageId: result.messageId })
    } else {
      res.status(500).json({ success: false, message: 'Failed to send test email. Check your integration configuration.' })
    }
  } catch (err) { next(err) }
})

// ============================================================================
// DELETE /admin/email/logs
// Clear email logs older than 90 days
// ============================================================================
router.delete('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const result = await prisma.emailLog.deleteMany({ where: { createdAt: { lt: cutoff } } })
    res.json({ success: true, deleted: result.count })
  } catch (err) { next(err) }
})

export default router
