import { Router } from 'express'
import * as workScheduleController from '../controllers/work-schedule.controller.js'
import * as encashmentController from '../controllers/leave-encashment.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

router.use(authMiddleware)

const adminPrincipal = rbacMiddleware('admin', 'principal')
const readRoles = rbacMiddleware('admin', 'principal', 'teacher')

// ==================== Work Schedules ====================

router.get('/schedules', readRoles, workScheduleController.listSchedules)
router.post('/schedules', adminPrincipal, workScheduleController.createSchedule)
router.put('/schedules/:id', adminPrincipal, workScheduleController.updateSchedule)
router.delete('/schedules/:id', adminPrincipal, workScheduleController.deleteSchedule)

// ==================== Leave Encashment ====================

router.get('/encashments', adminPrincipal, encashmentController.listEncashments)
router.post('/encashments/:staffId', readRoles, encashmentController.requestEncashment)
router.patch('/encashments/:id/process', adminPrincipal, encashmentController.processEncashment)

export default router
