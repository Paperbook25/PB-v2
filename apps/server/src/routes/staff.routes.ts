import { Router } from 'express'
import * as staffController from '../controllers/staff.controller.js'
import * as salaryService from '../services/salary.service.js'
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

// ==================== Salary (static segment — before /:id) ====================

router.get('/salary-slips', adminPrincipal, async (req, res, next) => {
  try {
    const { staffId, month, year, status, page, limit } = req.query
    const result = await salaryService.getSalarySlips(req.schoolId!, {
      staffId: staffId as string | undefined,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      status: status as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
})
router.post('/salary/process', adminPrincipal, async (req, res, next) => {
  try {
    const { month, year } = req.body
    const result = await salaryService.processMonthlySalary(req.schoolId!, Number(month), Number(year))
    res.json(result)
  } catch (err) { next(err) }
})
router.patch('/salary-slips/:slipId/pay', adminPrincipal, async (req, res, next) => {
  try {
    const data = await salaryService.markSalaryPaid(req.schoolId!, req.params.slipId, req.body.paymentRef)
    res.json({ data })
  } catch (err) { next(err) }
})

// Payroll deductions (all staff)
router.get('/payroll-deductions', adminPrincipal, async (req, res, next) => {
  try {
    const { staffId, month, year } = req.query
    const data = await salaryService.getPayrollDeductions(req.schoolId!, {
      staffId: staffId as string | undefined,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
    })
    res.json({ data })
  } catch (err) { next(err) }
})

// Stubs for advanced features (benefits, loans, time-off)
router.get('/benefits', adminPrincipal, (_req, res) => res.json({ data: [] }))
router.get('/loans', adminPrincipal, (_req, res) => res.json({ data: [] }))
router.get('/time-off-accrual', adminPrincipal, (_req, res) => res.json({ data: [] }))

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

// Salary Structure (per-staff)
router.get('/:id/salary-structure', adminPrincipal, async (req, res, next) => {
  try {
    const data = await salaryService.getSalaryStructure(req.schoolId!, req.params.id)
    res.json({ data })
  } catch (err) { next(err) }
})
router.put('/:id/salary-structure', adminPrincipal, async (req, res, next) => {
  try {
    const data = await salaryService.updateSalaryStructure(req.schoolId!, req.params.id, req.body)
    res.json({ data })
  } catch (err) { next(err) }
})

// Salary slips (per-staff)
router.get('/:id/salary-slips', readRoles, async (req, res, next) => {
  try {
    const { month, year, status, page, limit } = req.query
    const result = await salaryService.getSalarySlips(req.schoolId!, {
      staffId: req.params.id,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      status: status as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
})

// Per-staff payroll deductions
router.get('/:id/payroll-deductions', adminPrincipal, async (req, res, next) => {
  try {
    const { month, year } = req.query
    const data = await salaryService.getPayrollDeductions(req.schoolId!, {
      staffId: req.params.id,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
    })
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/:id/payroll-deductions', adminPrincipal, async (req, res, next) => {
  try {
    const data = await salaryService.createPayrollDeduction(req.schoolId!, { ...req.body, staffId: req.params.id })
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.put('/:id/payroll-deductions/:deductionId', adminPrincipal, async (req, res, next) => {
  try {
    const data = await salaryService.updatePayrollDeduction(req.schoolId!, req.params.deductionId, req.body)
    res.json({ data })
  } catch (err) { next(err) }
})

// Per-staff stubs (benefits, loans, time-off)
router.get('/:id/benefits', readRoles, (_req, res) => res.json({ data: [] }))
router.post('/:id/benefits', adminPrincipal, (_req, res) => res.status(201).json({ data: {} }))
router.put('/:id/benefits/:benefitId', adminPrincipal, (_req, res) => res.json({ data: {} }))
router.get('/:id/loans', readRoles, (_req, res) => res.json({ data: [] }))
router.post('/:id/loans', adminPrincipal, (_req, res) => res.status(201).json({ data: {} }))
router.put('/:id/loans/:loanId', adminPrincipal, (_req, res) => res.json({ data: {} }))
router.get('/:id/time-off-accrual', readRoles, (_req, res) => res.json({ data: { accrued: 0, used: 0, balance: 0 } }))
router.post('/:id/time-off-accrual/adjust', adminPrincipal, (_req, res) => res.json({ data: {} }))

// Exit Interview
router.get('/:id/exit-interview', readRoles, staffController.getExitInterview)
router.post('/:id/exit-interview', adminPrincipal, validate(createExitInterviewSchema), audit, staffController.createExitInterview)
router.put('/:id/exit-interview', adminPrincipal, validate(updateExitInterviewSchema), audit, staffController.updateExitInterview)
router.patch('/:id/exit-interview/clearance/:department', adminPrincipal, validate(updateClearanceSchema), audit, staffController.updateClearance)

export default router
