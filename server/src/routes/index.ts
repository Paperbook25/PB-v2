import { Router } from 'express'
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

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/settings/users', userRoutes)
router.use('/settings/audit-log', auditRoutes)
router.use('/settings', settingsRoutes)
router.use('/students', studentExamRouter) // Exam-related student routes (marks, progress, report-card)
router.use('/students', studentRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/staff', staffAttendanceRoutes) // Must be before staffRoutes
router.use('/staff', staffRoutes)
router.use('/timetable', timetableRoutes)
router.use('/finance', financeRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/notifications', notificationRouter)

// Phase 6: Admissions, Exams, Question Bank
router.use('/admissions', admissionRoutes)
router.use('/public/admissions', admissionPublicRouter)
router.use('/exams', examRouter)
router.use('/grade-scales', gradeScaleRouter)
router.use('/report-cards', reportCardRouter)
router.use('/question-bank', questionBankRouter)
router.use('/online-exams', onlineExamRouter)

// Addon / License System
router.use('/addons', addonRoutes)

// Calendar view (Google Calendar-style)
router.use('/calendar', calendarRoutes)

// RBAC Permissions
router.use('/permissions', permissionRoutes)

// AI Timetable Planner
router.use('/ai-planner', aiPlannerRoutes)

// AI Agent Framework
router.use('/agents', agentRoutes)

// School Website Builder
router.use('/school-website', websiteRoutes)
router.use('/public/school-website', websitePublicRouter)

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
