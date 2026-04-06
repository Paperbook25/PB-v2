import { Router } from 'express'
import * as parentPortalController from '../controllers/parent-portal.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All parent portal routes require auth + parent role
router.use(authMiddleware)
router.use(rbacMiddleware('parent', 'admin', 'principal'))

// ==================== Overview ====================
router.get('/overview', parentPortalController.getChildOverview)

// ==================== Attendance ====================
router.get('/attendance/:studentId', parentPortalController.getChildAttendance)

// ==================== Fees ====================
router.get('/fees/:studentId', parentPortalController.getChildFees)

// ==================== Marks ====================
router.get('/marks/:studentId', parentPortalController.getChildMarks)

// ==================== Announcements ====================
router.get('/announcements', parentPortalController.getAnnouncements)

// ==================== Online Fee Payment (Razorpay) ====================
router.post('/pay-fee', async (req, res, next) => {
  try {
    const { createRazorpayOrder } = await import('../services/razorpay.service.js')
    const result = await createRazorpayOrder({
      organizationId: req.user!.organizationId!,
      studentFeeId: req.body.studentFeeId,
      amount: req.body.amount,
    })
    res.json(result)
  } catch (err) { next(err) }
})

router.post('/verify-payment', async (req, res, next) => {
  try {
    const { verifyRazorpayPayment } = await import('../services/razorpay.service.js')
    const result = await verifyRazorpayPayment({
      organizationId: req.user!.organizationId!,
      razorpayOrderId: req.body.razorpayOrderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpaySignature: req.body.razorpaySignature,
      studentFeeId: req.body.studentFeeId,
      studentId: req.body.studentId,
    })
    res.json(result)
  } catch (err) { next(err) }
})

export default router
