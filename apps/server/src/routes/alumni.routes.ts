import { Router } from 'express'
import * as alumniController from '../controllers/alumni.controller.js'
import * as alumniService from '../services/alumni.service.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All alumni routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Stats ====================
router.get('/stats', adminRoles, alumniController.getAlumniStats)
router.get('/batches/stats', adminRoles, alumniController.getAlumniStats)

// ==================== Achievements ====================
router.get('/achievements', adminRoles, alumniController.listAchievements)
router.post('/achievements', adminRoles, alumniController.createAchievement)
router.put('/achievements/:id', adminRoles, alumniController.updateAchievement)
router.patch('/achievements/:id/publish', adminRoles, alumniController.publishAchievement)
router.delete('/achievements/:id', adminRoles, alumniController.deleteAchievement)

// ==================== Contributions ====================
router.get('/contributions', adminRoles, async (req, res, next) => {
  try {
    const { alumniId, status, page, limit } = req.query
    const result = await alumniService.listContributions(req.schoolId!, {
      alumniId: alumniId as string | undefined,
      status: status as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
})
router.post('/contributions', adminRoles, async (req, res, next) => {
  try {
    const data = await alumniService.createContribution(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.patch('/contributions/:id/status', adminRoles, async (req, res, next) => {
  try {
    const data = await alumniService.updateContributionStatus(req.schoolId!, req.params.id, req.body.status)
    res.json({ data })
  } catch (err) { next(err) }
})
router.delete('/contributions/:id', adminRoles, async (req, res, next) => {
  try {
    const result = await alumniService.deleteContribution(req.schoolId!, req.params.id)
    res.json(result)
  } catch (err) { next(err) }
})

// ==================== Alumni Events ====================
router.get('/events', adminRoles, async (req, res, next) => {
  try {
    const { type, status, page, limit } = req.query
    const result = await alumniService.listAlumniEvents(req.schoolId!, {
      type: type as string | undefined,
      status: status as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
})
router.get('/events/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await alumniService.getAlumniEventById(req.schoolId!, req.params.id)
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/events', adminRoles, async (req, res, next) => {
  try {
    const data = await alumniService.createAlumniEvent(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.put('/events/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await alumniService.updateAlumniEvent(req.schoolId!, req.params.id, req.body)
    res.json({ data })
  } catch (err) { next(err) }
})
router.patch('/events/:id/status', adminRoles, async (req, res, next) => {
  try {
    const data = await alumniService.updateAlumniEventStatus(req.schoolId!, req.params.id, req.body.status)
    res.json({ data })
  } catch (err) { next(err) }
})
router.delete('/events/:id', adminRoles, async (req, res, next) => {
  try {
    const result = await alumniService.deleteAlumniEvent(req.schoolId!, req.params.id)
    res.json(result)
  } catch (err) { next(err) }
})
router.get('/events/:eventId/registrations', adminRoles, async (req, res, next) => {
  try {
    const data = await alumniService.getEventRegistrations(req.schoolId!, req.params.eventId)
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/events/:eventId/register', adminRoles, async (req, res, next) => {
  try {
    const data = await alumniService.registerForEvent(req.schoolId!, req.params.eventId, req.body.alumniId)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.delete('/events/:eventId/register/:alumniId', adminRoles, async (req, res, next) => {
  try {
    const result = await alumniService.cancelEventRegistration(req.schoolId!, req.params.eventId, req.params.alumniId)
    res.json(result)
  } catch (err) { next(err) }
})

// ==================== Graduation ====================
router.get('/eligible-for-graduation', adminRoles, async (req, res, next) => {
  try {
    const data = await alumniService.getEligibleForGraduation(req.schoolId!)
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/graduate', adminRoles, async (req, res, next) => {
  try {
    const data = await alumniService.graduateStudent(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.post('/graduate-batch', adminRoles, async (req, res, next) => {
  try {
    const { studentIds, batch } = req.body
    const result = await alumniService.graduateBatch(req.schoolId!, studentIds, batch)
    res.json(result)
  } catch (err) { next(err) }
})

// ==================== Batch ====================
router.get('/batch/:batch', adminRoles, alumniController.getAlumniByBatch)

// ==================== CRUD ====================
router.get('/', adminRoles, alumniController.listAlumni)
router.get('/:id', adminRoles, alumniController.getAlumni)
router.post('/', adminRoles, alumniController.createAlumni)
router.patch('/:id', adminRoles, alumniController.updateAlumni)
router.patch('/:id/verify', adminRoles, alumniController.verifyAlumni)
router.delete('/:id', adminRoles, alumniController.deleteAlumni)

export default router
