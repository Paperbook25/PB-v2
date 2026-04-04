import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireTenant } from '../middleware/tenant.middleware.js'
import { schoolAuthMiddleware } from '../middleware/school-auth.middleware.js'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import auditRoutes from './audit.routes.js'
import settingsRoutes from './settings.routes.js'
import studentRoutes from './student.routes.js'
import staffAttendanceRoutes from './staff-attendance.routes.js'
import staffRoutes from './staff.routes.js'
import attendanceRoutes from './attendance.routes.js'
import timetableRoutes from './timetable.routes.js'
import financeRoutes from './finance.routes.js'
import dashboardRoutes, { notificationRouter } from './dashboard.routes.js'
import admissionRoutes, { admissionPublicRouter } from './admission.routes.js'
import { examRouter, gradeScaleRouter, reportCardRouter, studentExamRouter } from './exam.routes.js'
import { questionBankRouter, onlineExamRouter } from './question-bank.routes.js'
import addonRoutes from './addon.routes.js'
import calendarRoutes from './calendar.routes.js'
import permissionRoutes from './permission.routes.js'
import aiPlannerRoutes from './ai-planner.routes.js'
import agentRoutes from './agent.routes.js'
import websiteRoutes, { websitePublicRouter } from './school-website.routes.js'
import blogRouter, { blogPublicRouter } from './blog.routes.js'
import { contactRouter, contactPublicRouter } from './contact.routes.js'
import { formAnalyticsRouter, formAnalyticsPublicRouter } from './form-analytics.routes.js'
import { chatbotPublicRouter } from './chatbot.routes.js'
import domainRouter from './domain.routes.js'
import communicationRoutes from './communication.routes.js'
import reportRoutes from './report.routes.js'
import leaveRoutes from './leave.routes.js'
import libraryRouter from './library.routes.js'
import transportRouter from './transport.routes.js'
import documentRouter from './document.routes.js'
import visitorRouter from './visitor.routes.js'
import complaintRouter from './complaint.routes.js'
import inventoryRouter from './inventory.routes.js'
import hostelRouter from './hostel.routes.js'
import behaviorRouter from './behavior.routes.js'
import lmsRouter from './lms.routes.js'
import parentPortalRouter from './parent-portal.routes.js'
import messagingRouter from './messaging.routes.js'
import studentLeaveRouter from './student-leave.routes.js'
import workScheduleRouter from './work-schedule.routes.js'
import alumniRouter from './alumni.routes.js'
import clubRouter from './club.routes.js'
import facilityRouter from './facility.routes.js'
import scholarshipRouter from './scholarship.routes.js'
import emailCampaignRouter from './email-campaign.routes.js'
import { requireAddon } from '../middleware/addon.middleware.js'
import { usageTrackingMiddleware } from '../middleware/usage-tracking.middleware.js'
import subscriptionRoutes from './subscription.routes.js'
import adminRoutes from './admin/index.js'
import onboardingRoutes from './onboarding.routes.js'
import invitationRoutes from './invitation.routes.js'
import profileRoutes from './profile.routes.js'
import { registerSchool } from '../controllers/onboarding.controller.js'
import { acceptInvitation, getInviteDetails } from '../controllers/invitation.controller.js'

const router = Router()

// --- Session endpoint (returns current user with school-level role) ---
router.get('/me', schoolAuthMiddleware, (req, res) => {
  res.json({
    id: req.user!.userId,
    email: req.user!.email,
    name: req.user!.name,
    role: req.user!.role,
    organizationId: req.user!.organizationId,
  })
})

// --- Public / unscoped routes (no tenant enforcement) ---
router.use('/auth', authRoutes)

// Public registration & invitation endpoints (NOT under /auth/* to avoid better-auth interception)
router.post('/public/register-school', registerSchool)
router.post('/public/accept-invite', acceptInvitation)
router.get('/public/invite-details/:id', getInviteDetails)

// Public branding config (for school app to customize appearance)
router.get('/public/branding', async (_req, res, next) => {
  try {
    const { getBrandingConfig } = await import('../services/admin-platform-settings.service.js')
    res.json(await getBrandingConfig())
  } catch (err) { next(err) }
})

// Dynamic sitemap.xml
router.get('/public/sitemap.xml', async (_req, res, next) => {
  try {
    const { generateSitemap } = await import('../services/admin-website.service.js')
    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.send(await generateSitemap())
  } catch (err) { next(err) }
})

// Public website data (pricing, contact, blog, team — for marketing site)
router.get('/public/website', async (_req, res, next) => {
  try {
    const { getPublicWebsiteData } = await import('../services/admin-website.service.js')
    res.json(await getPublicWebsiteData())
  } catch (err) { next(err) }
})

router.get('/public/blog', async (req, res, next) => {
  try {
    const { getPublicBlogList } = await import('../services/admin-website.service.js')
    res.json(await getPublicBlogList(req.query as any))
  } catch (err) { next(err) }
})

router.get('/public/blog/:slug', async (req, res, next) => {
  try {
    const { getPublicBlogPost } = await import('../services/admin-website.service.js')
    res.json(await getPublicBlogPost(String(req.params.slug)))
  } catch (err) { next(err) }
})

// --- Public login (for landing page → redirect to school subdomain) ---
// This lives under /public/* because /auth/* is intercepted by better-auth handler
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many login attempts. Try again later.' } })
router.post('/public/login', loginLimiter, async (req, res, next) => {
  try {
    const { login } = await import('../services/auth.service.js')
    const jwt = await import('jsonwebtoken')
    const { env } = await import('../config/env.js')
    const result = await login(req.body, req.headers['user-agent'], req.ip)

    // Create a short-lived login token for cross-subdomain auto-login
    const loginToken = jwt.default.sign(
      { userId: result.user.id, email: result.user.email },
      env.JWT_SECRET,
      { expiresIn: '60s' }
    )

    res.json({ ...result, loginToken })
  } catch (err) {
    next(err)
  }
})

// --- Auto-login endpoint (validates one-time token, creates better-auth session, redirects) ---
router.get('/public/auto-login', async (req, res) => {
  try {
    const jwt = await import('jsonwebtoken')
    const crypto = await import('crypto')
    const { env } = await import('../config/env.js')
    const { prisma } = await import('../config/db.js')

    const token = req.query.token as string
    const redirect = (req.query.redirect as string) || '/'

    if (!token) {
      return res.redirect('/login')
    }

    // Verify the one-time login token
    let payload: { userId: string; email: string }
    try {
      payload = jwt.default.verify(token, env.JWT_SECRET) as { userId: string; email: string }
    } catch {
      return res.redirect('/login?error=expired')
    }

    // Find the BetterAuthUser
    const user = await prisma.betterAuthUser.findUnique({
      where: { email: payload.email },
    })
    if (!user) {
      return res.redirect('/login?error=notfound')
    }

    // Create a better-auth session directly in the DB
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const sessionId = crypto.randomBytes(16).toString('hex')
    await prisma.betterAuthSession.create({
      data: {
        id: sessionId,
        token: sessionToken,
        userId: user.id,
        expiresAt,
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      },
    })

    // Set the better-auth session cookie on the parent domain
    res.cookie('better-auth.session_token', sessionToken, {
      domain: `.${env.APP_DOMAIN}`,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: expiresAt,
    })

    res.redirect(redirect)
  } catch (err) {
    console.error('[Auto-login] Error:', err)
    res.redirect('/login?error=failed')
  }
})

// --- Public lead signup (for PB marketing website → Gravity CRM) ---
const leadSignupLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: 'Too many signup attempts. Please try again later.' } })
router.post('/public/lead-signup', leadSignupLimiter, async (req, res, next) => {
  try {
    const { prisma } = await import('../config/db.js')
    const { schoolName, contactName, contactEmail, contactPhone, city, state, source, message, expectedPlan } = req.body

    if (!schoolName || !contactName || !contactEmail) {
      return res.status(400).json({ error: 'schoolName, contactName, and contactEmail are required' })
    }

    // Check for duplicate lead by email
    const existing = await prisma.lead.findFirst({
      where: { contactEmail },
    })
    if (existing) {
      return res.status(200).json({ success: true, message: 'Already registered', leadId: existing.id })
    }

    // Create lead in Gravity CRM
    const lead = await prisma.lead.create({
      data: {
        schoolName,
        contactName,
        contactEmail,
        contactPhone: contactPhone || null,
        city: city || null,
        state: state || null,
        source: source || 'website',
        expectedPlan: expectedPlan || null,
        status: 'lead_new',
        notes: message || null,
      },
    })

    // Auto-create first activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'note',
        content: `Lead signed up via website form. ${message ? `Message: ${message}` : ''}`.trim(),
        createdBy: null,
      },
    })

    res.status(201).json({ success: true, leadId: lead.id })
  } catch (err) {
    next(err)
  }
})

// --- User profile (authenticated, no tenant required) ---
router.use('/profile', profileRoutes)

// --- Platform announcements (for school app to fetch) ---
router.get('/platform-announcements', requireTenant, async (req, res, next) => {
  try {
    const { prisma } = await import('../config/db.js')
    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { id: req.schoolId },
      select: { planTier: true, status: true },
    })
    if (!schoolProfile) return res.json({ data: [] })

    const announcements = await prisma.platformAnnouncement.findMany({
      where: {
        status: 'ann_sent',
        OR: [
          { targetPlans: { isEmpty: true } },
          { targetPlans: { has: schoolProfile.planTier } },
        ],
      },
      orderBy: { sentAt: 'desc' },
      take: 10,
      select: { id: true, title: true, body: true, channel: true, sentAt: true },
    })

    res.json({ data: announcements })
  } catch (err) { next(err) }
})

// --- Usage tracking for all tenant-scoped routes ---
router.use(usageTrackingMiddleware)

// --- School-facing routes (tenant enforcement required) ---
router.use('/users', requireTenant, userRoutes)
router.use('/settings/users', requireTenant, userRoutes)
router.use('/settings/audit-log', requireTenant, auditRoutes)
router.use('/settings', requireTenant, settingsRoutes)
router.use('/students', requireTenant, studentExamRouter) // Exam-related student routes (marks, progress, report-card)
router.use('/students', requireTenant, studentRoutes)
router.use('/attendance', requireTenant, attendanceRoutes)
router.use('/staff', requireTenant, staffAttendanceRoutes) // Must be before staffRoutes
router.use('/staff', requireTenant, staffRoutes)
router.use('/timetable', requireTenant, timetableRoutes)
router.use('/finance', requireTenant, financeRoutes)
router.use('/dashboard', requireTenant, dashboardRoutes)
router.use('/notifications', requireTenant, notificationRouter)

// Phase 6: Admissions, Exams, Question Bank
router.use('/admissions', requireTenant, admissionRoutes)
router.use('/public/admissions', admissionPublicRouter) // Public endpoint — no tenant enforcement
router.use('/exams', requireTenant, examRouter)
router.use('/grade-scales', requireTenant, gradeScaleRouter)
router.use('/report-cards', requireTenant, reportCardRouter)
router.use('/question-bank', requireTenant, questionBankRouter)
router.use('/online-exams', requireTenant, onlineExamRouter)

// Addon / License System
router.use('/addons', requireTenant, addonRoutes)

// Subscription / Plan Management
router.use('/subscription', requireTenant, subscriptionRoutes)

// Calendar view (Google Calendar-style)
router.use('/calendar', requireTenant, calendarRoutes)

// RBAC Permissions
router.use('/permissions', requireTenant, permissionRoutes)

// AI Timetable Planner
router.use('/ai-planner', requireTenant, aiPlannerRoutes)

// AI Agent Framework
router.use('/agents', requireTenant, agentRoutes)

// School Website Builder
router.use('/school-website', requireTenant, requireAddon('school-website'), websiteRoutes)
router.use('/public/school-website', websitePublicRouter) // Public endpoint — no tenant enforcement

// Blog / News CMS
router.use('/blog', requireTenant, blogRouter)
router.use('/public/blog', blogPublicRouter) // Public endpoint — no tenant enforcement

// Custom Domain Management
router.use('/domains', requireTenant, domainRouter)

// Communication (Announcements + Circulars)
router.use('/communication', requireTenant, communicationRoutes)

// Reports (aggregated data)
router.use('/reports', requireTenant, reportRoutes)

// Leave Management (staff)
router.use('/leave', requireTenant, leaveRoutes)

// Library Management
router.use('/library', requireTenant, requireAddon('library'), libraryRouter)

// Transport Management
router.use('/transport', requireTenant, requireAddon('transport'), transportRouter)

// School Documents
router.use('/documents', requireTenant, requireAddon('documents'), documentRouter)

// Visitor Management
router.use('/visitors', requireTenant, requireAddon('visitors'), visitorRouter)

// Complaints / Grievances
router.use('/complaints', requireTenant, requireAddon('complaints'), complaintRouter)

// Inventory / Assets
router.use('/inventory', requireTenant, requireAddon('operations'), inventoryRouter)

// Hostel Management
router.use('/hostel', requireTenant, requireAddon('hostel'), hostelRouter)

// Behavior Records
router.use('/behavior', requireTenant, requireAddon('behavior'), behaviorRouter)

// LMS (Learning Management System)
router.use('/lms', requireTenant, requireAddon('lms'), lmsRouter)

// Parent Portal
router.use('/parent-portal', requireTenant, parentPortalRouter)

// Messaging
router.use('/messaging', requireTenant, messagingRouter)

// Student Leave Requests
router.use('/student-leave', requireTenant, studentLeaveRouter)

// Work Schedules & Leave Encashment
router.use('/staff-management', requireTenant, workScheduleRouter)

// Alumni Management
router.use('/alumni', requireTenant, requireAddon('alumni'), alumniRouter)

// Clubs & Activities
router.use('/clubs', requireTenant, requireAddon('clubs'), clubRouter)

// Facilities Management
router.use('/facilities', requireTenant, requireAddon('operations'), facilityRouter)

// Scholarships
router.use('/scholarships', requireTenant, requireAddon('scholarships'), scholarshipRouter)

// Contact Submissions
router.use('/contact', requireTenant, contactRouter)
router.use('/public/contact', contactPublicRouter) // Public endpoint — no tenant enforcement

// Form Analytics (conversion funnel tracking)
router.use('/form-analytics', requireTenant, formAnalyticsRouter)
router.use('/public/form-analytics', formAnalyticsPublicRouter) // Public endpoint — no tenant enforcement

// Chatbot (public, rate limited)
router.use('/public/chat', chatbotPublicRouter) // Public endpoint — no tenant enforcement

// Email Campaigns / Drip System
router.use('/email-campaigns', requireTenant, emailCampaignRouter)

// Onboarding Wizard & Setup Checklist
router.use('/onboarding', requireTenant, onboardingRoutes)

// Staff Invitations
router.use('/invitations', requireTenant, invitationRoutes)

// Super Admin Panel (better-auth protected — has its own auth)
router.use('/admin', adminRoutes)

// Health check — tests DB connectivity for proper liveness probing
router.get('/health', async (_req, res) => {
  try {
    const { prisma } = await import('../config/db.js')
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected', timestamp: new Date().toISOString() })
  }
})

export default router
