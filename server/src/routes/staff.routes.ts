import { Router } from 'express'
import * as staffController from '../controllers/staff.controller.js'
import { authMiddleware, rbacMiddleware, validate, auditMiddleware } from '../middleware/index.js'
import {
  createStaffSchema, updateStaffSchema, createPDSchema, updatePDSchema,
  createReviewSchema, createStaffSkillSchema, updateStaffSkillSchema,
  createCertificationSchema, updateCertificationSchema,
  createOnboardingSchema, updateOnboardingTaskSchema,
  createExitInterviewSchema, updateExitInterviewSchema,
  updateClearanceSchema, bulkImportStaffSchema,
} from '../validators/staff.validators.js'

const router = Router()

// All staff routes require auth
router.use(authMiddleware)

const audit = auditMiddleware({ module: 'staff', entityType: 'staff' })
const adminPrincipal = rbacMiddleware('admin', 'principal')
const readRoles = rbacMiddleware('admin', 'principal', 'teacher')

// ==================== Static segment routes (before /:id) ====================

// Bulk operations
router.post('/bulk-import', adminPrincipal, validate(bulkImportStaffSchema), audit, staffController.bulkImport)
router.get('/export', adminPrincipal, staffController.exportStaff)

// Professional Development (all)
router.get('/professional-development', adminPrincipal, staffController.listAllPD)
router.put('/professional-development/:id', adminPrincipal, validate(updatePDSchema), audit, staffController.updatePD)
router.delete('/professional-development/:id', adminPrincipal, audit, staffController.deletePD)

// Performance Reviews (all)
router.get('/performance-reviews', adminPrincipal, staffController.listAllReviews)
router.post('/performance-reviews', adminPrincipal, validate(createReviewSchema), audit, staffController.createReview)
router.patch('/performance-reviews/:id/acknowledge', adminPrincipal, audit, staffController.acknowledgeReview)

// Onboarding (all)
router.get('/onboarding/tasks', adminPrincipal, staffController.listOnboardingTasks)
router.get('/onboarding', adminPrincipal, staffController.listOnboardingChecklists)

// Certifications & Skills (all)
router.get('/certifications/expiry-alerts', adminPrincipal, staffController.getExpiryAlerts)
router.get('/skills-matrix', adminPrincipal, staffController.getSkillsMatrix)

// Exit Interviews (all)
router.get('/exit-interviews', adminPrincipal, staffController.listExitInterviews)

// ==================== CRUD ====================

router.get('/', readRoles, staffController.listStaff)
router.post('/', adminPrincipal, validate(createStaffSchema), audit, staffController.createStaff)
router.get('/:id', readRoles, staffController.getStaff)
router.put('/:id', adminPrincipal, validate(updateStaffSchema), audit, staffController.updateStaff)
router.delete('/:id', adminPrincipal, audit, staffController.deleteStaff)

// ==================== Per-staff sub-resources ====================

// Professional Development
router.get('/:id/professional-development', readRoles, staffController.listStaffPD)
router.post('/:id/professional-development', adminPrincipal, validate(createPDSchema), audit, staffController.createPD)

// Performance Reviews
router.get('/:id/performance-reviews', readRoles, staffController.listStaffReviews)

// Skills
router.get('/:id/skills', readRoles, staffController.listStaffSkills)
router.post('/:id/skills', adminPrincipal, validate(createStaffSkillSchema), audit, staffController.addStaffSkill)
router.put('/:id/skills/:skillId', adminPrincipal, validate(updateStaffSkillSchema), audit, staffController.updateStaffSkill)
router.delete('/:id/skills/:skillId', adminPrincipal, audit, staffController.deleteStaffSkill)
router.get('/:id/skill-gaps', readRoles, staffController.getSkillGaps)

// Certifications
router.get('/:id/certifications', readRoles, staffController.listStaffCertifications)
router.post('/:id/certifications', adminPrincipal, validate(createCertificationSchema), audit, staffController.addCertification)
router.put('/:id/certifications/:certId', adminPrincipal, validate(updateCertificationSchema), audit, staffController.updateCertification)
router.delete('/:id/certifications/:certId', adminPrincipal, audit, staffController.deleteCertification)

// Onboarding
router.get('/:id/onboarding', readRoles, staffController.getStaffOnboarding)
router.post('/:id/onboarding', adminPrincipal, validate(createOnboardingSchema), audit, staffController.createOnboarding)
router.patch('/:id/onboarding/tasks/:taskId', adminPrincipal, validate(updateOnboardingTaskSchema), audit, staffController.updateOnboardingTask)

// Exit Interview
router.get('/:id/exit-interview', readRoles, staffController.getExitInterview)
router.post('/:id/exit-interview', adminPrincipal, validate(createExitInterviewSchema), audit, staffController.createExitInterview)
router.put('/:id/exit-interview', adminPrincipal, validate(updateExitInterviewSchema), audit, staffController.updateExitInterview)
router.patch('/:id/exit-interview/clearance/:department', adminPrincipal, validate(updateClearanceSchema), audit, staffController.updateClearance)

export default router
