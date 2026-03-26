import { Router } from 'express'
import * as settingsCtrl from '../controllers/settings.controller.js'
import { authMiddleware, rbacMiddleware, validate, auditMiddleware } from '../middleware/index.js'
import {
  updateSchoolProfileSchema,
  createAcademicYearSchema,
  updateAcademicYearSchema,
  createClassSchema,
  updateClassSchema,
  createSubjectSchema,
  updateSubjectSchema,
  updateNotificationPreferencesSchema,
  updateBackupConfigSchema,
  updateThemeConfigSchema,
  createCalendarEventSchema,
  updateCalendarEventSchema,
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
} from '../validators/settings.validators.js'

const router = Router()

// All settings routes require auth + at minimum admin/principal/teacher role
router.use(authMiddleware)
router.use(rbacMiddleware('admin', 'principal', 'teacher'))

// ==================== SCHOOL PROFILE ====================

const profileAudit = auditMiddleware({ module: 'settings', entityType: 'school_profile' })

router.get('/school-profile', settingsCtrl.getSchoolProfile)
router.put(
  '/school-profile',
  rbacMiddleware('admin', 'principal'),
  validate(updateSchoolProfileSchema),
  profileAudit,
  settingsCtrl.updateSchoolProfile
)

// ==================== ACADEMIC YEARS ====================

const yearAudit = auditMiddleware({ module: 'settings', entityType: 'academic_year' })

router.get('/academic-years', settingsCtrl.listAcademicYears)
router.post(
  '/academic-years',
  rbacMiddleware('admin', 'principal'),
  validate(createAcademicYearSchema),
  yearAudit,
  settingsCtrl.createAcademicYear
)
router.put(
  '/academic-years/:id',
  rbacMiddleware('admin', 'principal'),
  validate(updateAcademicYearSchema),
  yearAudit,
  settingsCtrl.updateAcademicYear
)
router.delete(
  '/academic-years/:id',
  rbacMiddleware('admin', 'principal'),
  yearAudit,
  settingsCtrl.deleteAcademicYear
)
router.patch(
  '/academic-years/:id/set-current',
  rbacMiddleware('admin', 'principal'),
  yearAudit,
  settingsCtrl.setCurrentAcademicYear
)

// ==================== CLASSES ====================

const classAudit = auditMiddleware({ module: 'settings', entityType: 'class' })

router.get('/classes', settingsCtrl.listClasses)
router.post(
  '/classes',
  rbacMiddleware('admin', 'principal'),
  validate(createClassSchema),
  classAudit,
  settingsCtrl.createClass
)
router.put(
  '/classes/:id',
  rbacMiddleware('admin', 'principal'),
  validate(updateClassSchema),
  classAudit,
  settingsCtrl.updateClass
)
router.delete(
  '/classes/:id',
  rbacMiddleware('admin', 'principal'),
  classAudit,
  settingsCtrl.deleteClass
)

// ==================== SUBJECTS ====================

const subjectAudit = auditMiddleware({ module: 'settings', entityType: 'subject' })

router.get('/subjects', settingsCtrl.listSubjects)
router.post(
  '/subjects',
  rbacMiddleware('admin', 'principal'),
  validate(createSubjectSchema),
  subjectAudit,
  settingsCtrl.createSubject
)
router.put(
  '/subjects/:id',
  rbacMiddleware('admin', 'principal'),
  validate(updateSubjectSchema),
  subjectAudit,
  settingsCtrl.updateSubject
)
router.delete(
  '/subjects/:id',
  rbacMiddleware('admin', 'principal'),
  subjectAudit,
  settingsCtrl.deleteSubject
)

// ==================== NOTIFICATIONS ====================

const notifAudit = auditMiddleware({ module: 'settings', entityType: 'notification_preferences' })

router.get('/notifications', settingsCtrl.getNotificationPreferences)
router.put(
  '/notifications',
  rbacMiddleware('admin', 'principal'),
  validate(updateNotificationPreferencesSchema),
  notifAudit,
  settingsCtrl.updateNotificationPreferences
)

// ==================== BACKUP ====================

const backupAudit = auditMiddleware({ module: 'settings', entityType: 'backup_config' })

router.get('/backup', rbacMiddleware('admin'), settingsCtrl.getBackupConfig)
router.put(
  '/backup',
  rbacMiddleware('admin'),
  validate(updateBackupConfigSchema),
  backupAudit,
  settingsCtrl.updateBackupConfig
)
router.post(
  '/backup/trigger',
  rbacMiddleware('admin'),
  backupAudit,
  settingsCtrl.triggerBackup
)

// ==================== THEME ====================

const themeAudit = auditMiddleware({ module: 'settings', entityType: 'theme_config' })

router.get('/theme', settingsCtrl.getThemeConfig)
router.put(
  '/theme',
  rbacMiddleware('admin', 'principal'),
  validate(updateThemeConfigSchema),
  themeAudit,
  settingsCtrl.updateThemeConfig
)

// ==================== CALENDAR ====================

const calendarAudit = auditMiddleware({ module: 'settings', entityType: 'calendar_event' })

router.get('/calendar', settingsCtrl.listCalendarEvents)
router.post(
  '/calendar',
  rbacMiddleware('admin', 'principal'),
  validate(createCalendarEventSchema),
  calendarAudit,
  settingsCtrl.createCalendarEvent
)
router.put(
  '/calendar/:id',
  rbacMiddleware('admin', 'principal'),
  validate(updateCalendarEventSchema),
  calendarAudit,
  settingsCtrl.updateCalendarEvent
)
router.delete(
  '/calendar/:id',
  rbacMiddleware('admin', 'principal'),
  calendarAudit,
  settingsCtrl.deleteCalendarEvent
)

// ==================== EMAIL TEMPLATES ====================

const templateAudit = auditMiddleware({ module: 'settings', entityType: 'email_template' })

router.get('/email-templates', settingsCtrl.listEmailTemplates)
router.get('/email-templates/:id', settingsCtrl.getEmailTemplate)
router.post(
  '/email-templates',
  rbacMiddleware('admin', 'principal'),
  validate(createEmailTemplateSchema),
  templateAudit,
  settingsCtrl.createEmailTemplate
)
router.put(
  '/email-templates/:id',
  rbacMiddleware('admin', 'principal'),
  validate(updateEmailTemplateSchema),
  templateAudit,
  settingsCtrl.updateEmailTemplate
)
router.delete(
  '/email-templates/:id',
  rbacMiddleware('admin', 'principal'),
  templateAudit,
  settingsCtrl.deleteEmailTemplate
)

export default router
