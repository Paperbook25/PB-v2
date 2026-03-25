import { Router } from 'express'
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
import alumniRouter from './alumni.routes.js'
import clubRouter from './club.routes.js'
import facilityRouter from './facility.routes.js'
import scholarshipRouter from './scholarship.routes.js'
import emailCampaignRouter from './email-campaign.routes.js'
import { requireAddon } from '../middleware/addon.middleware.js'
import adminRoutes from './admin/index.js'

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

// Super Admin Panel (better-auth protected — has its own auth)
router.use('/admin', adminRoutes)

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
