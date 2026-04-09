import { Router } from 'express'
import * as behaviorController from '../controllers/behavior.controller.js'
import * as behaviorService from '../services/behavior.service.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All behavior routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal', 'teacher')
const strictAdmin = rbacMiddleware('admin', 'principal')

// ==================== Stats ====================
router.get('/stats', behaviorController.getBehaviorStats)

// ==================== Leaderboard ====================
router.get('/leaderboard', async (req, res, next) => {
  try {
    const data = await behaviorService.getBehaviorLeaderboard(req.schoolId!, req.query.limit ? Number(req.query.limit) : 10)
    res.json({ data })
  } catch (err) { next(err) }
})

// ==================== Behavior Points ====================
router.get('/points', adminRoles, async (req, res, next) => {
  try {
    const { studentId, type, page, limit } = req.query
    const result = await behaviorService.listBehaviorPoints(req.schoolId!, {
      studentId: studentId as string | undefined,
      type: type as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
})
router.post('/points', adminRoles, async (req, res, next) => {
  try {
    const data = await behaviorService.createBehaviorPoint(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})

// ==================== Disciplinary Actions ====================
router.get('/actions', adminRoles, async (req, res, next) => {
  try {
    const { studentId, actionType, page, limit } = req.query
    const result = await behaviorService.listDisciplinaryActions(req.schoolId!, {
      studentId: studentId as string | undefined,
      actionType: actionType as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
})
router.get('/actions/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await behaviorService.getDisciplinaryActionById(req.schoolId!, String(req.params.id))
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/actions', adminRoles, async (req, res, next) => {
  try {
    const data = await behaviorService.createDisciplinaryAction(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.put('/actions/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await behaviorService.updateDisciplinaryAction(req.schoolId!, String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/actions/:id/appeal', async (req, res, next) => {
  try {
    const data = await behaviorService.submitAppeal(req.schoolId!, req.params.id, req.body.appealText)
    res.json({ data })
  } catch (err) { next(err) }
})

// ==================== Detentions ====================
router.get('/detentions', adminRoles, async (req, res, next) => {
  try {
    const { studentId, status, date, page, limit } = req.query
    const result = await behaviorService.listDetentions(req.schoolId!, {
      studentId: studentId as string | undefined,
      status: status as string | undefined,
      date: date as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
})
router.post('/detentions', adminRoles, async (req, res, next) => {
  try {
    const data = await behaviorService.createDetention(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.put('/detentions/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await behaviorService.updateDetention(req.schoolId!, String(req.params.id), req.body)
    res.json({ data })
  } catch (err) { next(err) }
})
router.delete('/detentions/:id', strictAdmin, async (req, res, next) => {
  try {
    const result = await behaviorService.deleteDetention(req.schoolId!, String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
})

// ==================== Student-specific ====================
router.get('/students/:studentId/summary', async (req, res, next) => {
  try {
    const data = await behaviorService.getStudentBehaviorSummary(req.schoolId!, req.params.studentId)
    res.json({ data })
  } catch (err) { next(err) }
})
router.get('/student/:studentId', behaviorController.getStudentBehavior)

// ==================== Incidents (Records) ====================
router.get('/', behaviorController.listRecords)
router.get('/incidents', behaviorController.listRecords)
router.get('/incidents/:id', behaviorController.getRecord)
router.post('/incidents', adminRoles, behaviorController.createRecord)
router.put('/incidents/:id', adminRoles, behaviorController.updateRecord)
router.delete('/incidents/:id', strictAdmin, behaviorController.deleteRecord)
router.post('/incidents/:id/notify-parent', adminRoles, behaviorController.notifyParent)

router.get('/:id', behaviorController.getRecord)
router.post('/', adminRoles, behaviorController.createRecord)
router.patch('/:id', adminRoles, behaviorController.updateRecord)
router.delete('/:id', strictAdmin, behaviorController.deleteRecord)

export default router
