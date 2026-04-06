import { Router } from 'express'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'
import * as razorpayService from '../services/razorpay.service.js'

const router = Router()

// ==================== Authenticated Payment Endpoints ====================

// Create Razorpay order (parent/student initiates payment)
router.post(
  '/create-order',
  authMiddleware,
  rbacMiddleware('admin', 'principal', 'accountant', 'parent', 'student'),
  async (req, res, next) => {
    try {
      const result = await razorpayService.createRazorpayOrder({
        organizationId: req.user!.organizationId!,
        studentFeeId: req.body.studentFeeId,
        amount: req.body.amount,
        currency: req.body.currency,
        notes: req.body.notes,
      })
      res.json(result)
    } catch (err) { next(err) }
  }
)

// Verify payment after Razorpay checkout completes
router.post(
  '/verify',
  authMiddleware,
  rbacMiddleware('admin', 'principal', 'accountant', 'parent', 'student'),
  async (req, res, next) => {
    try {
      const result = await razorpayService.verifyRazorpayPayment({
        organizationId: req.user!.organizationId!,
        razorpayOrderId: req.body.razorpayOrderId,
        razorpayPaymentId: req.body.razorpayPaymentId,
        razorpaySignature: req.body.razorpaySignature,
        studentFeeId: req.body.studentFeeId,
        studentId: req.body.studentId,
      })
      res.json(result)
    } catch (err) { next(err) }
  }
)

// ==================== Webhook (no auth — Razorpay calls this) ====================

router.post('/webhook/:organizationId', async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string || ''
    const result = await razorpayService.handleRazorpayWebhook(
      req.params.organizationId,
      req.body,
      signature
    )
    res.json(result)
  } catch (err) { next(err) }
})

export default router
