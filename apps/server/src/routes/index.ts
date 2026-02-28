import { Router } from 'express'
import { requireTenant } from '../middleware/tenant.middleware.js'
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
import adminRoutes from './admin/index.js'

const router = Router()

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
router.use('/school-website', requireTenant, websiteRoutes)
router.use('/public/school-website', websitePublicRouter) // Public endpoint — no tenant enforcement

// Super Admin Panel (better-auth protected — has its own auth)
router.use('/admin', adminRoutes)

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
