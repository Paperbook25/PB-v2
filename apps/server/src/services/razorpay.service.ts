import crypto from 'crypto'
import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { getActiveIntegration, markIntegrationTested } from './integration.service.js'

// ============================================================================
// Razorpay Service — creates orders, verifies payments, handles webhooks
// ============================================================================

interface RazorpayCredentials {
  keyId: string
  keySecret: string
}

interface CreateOrderParams {
  organizationId: string
  studentFeeId: string
  amount: number // in paise (INR smallest unit)
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

interface VerifyPaymentParams {
  organizationId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
  studentFeeId: string
  studentId: string
}

// ============================================================================
// Razorpay API calls
// ============================================================================

async function getRazorpayCredentials(organizationId: string): Promise<RazorpayCredentials> {
  const integration = await getActiveIntegration(organizationId, 'payment_gateway', 'razorpay')
  if (!integration) {
    throw AppError.badRequest('Razorpay integration not configured or inactive. Please set up Razorpay in Settings > Integrations.')
  }
  const creds = integration.decryptedCredentials
  if (!creds.keyId || !creds.keySecret) {
    throw AppError.badRequest('Razorpay credentials incomplete. Please update Key ID and Key Secret.')
  }
  return { keyId: creds.keyId, keySecret: creds.keySecret }
}

async function razorpayRequest(creds: RazorpayCredentials, method: string, path: string, body?: any): Promise<any> {
  const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64')
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data: any = await res.json()
  if (!res.ok) {
    throw AppError.badRequest(`Razorpay API error: ${data.error?.description || JSON.stringify(data)}`)
  }
  return data
}

// ============================================================================
// Create Order
// ============================================================================

export async function createRazorpayOrder(params: CreateOrderParams) {
  const creds = await getRazorpayCredentials(params.organizationId)

  // Verify the student fee exists and has outstanding balance
  const studentFee = await prisma.studentFee.findFirst({
    where: { id: params.studentFeeId, organizationId: params.organizationId },
    include: { student: { select: { id: true, firstName: true, lastName: true } } },
  })
  if (!studentFee) throw AppError.notFound('Student fee not found')

  const outstanding = Number(studentFee.totalAmount) - Number(studentFee.paidAmount) - Number(studentFee.discountAmount)
  if (outstanding <= 0) throw AppError.badRequest('No outstanding amount for this fee')

  // Amount in paise
  const amountPaise = params.amount || Math.round(outstanding * 100)
  if (amountPaise > outstanding * 100) {
    throw AppError.badRequest('Payment amount exceeds outstanding balance')
  }

  const receipt = params.receipt || `rcpt_${studentFee.id.substring(0, 8)}_${Date.now()}`
  const currency = params.currency || 'INR'

  const order = await razorpayRequest(creds, 'POST', '/orders', {
    amount: amountPaise,
    currency,
    receipt,
    notes: {
      studentFeeId: params.studentFeeId,
      studentId: studentFee.studentId,
      organizationId: params.organizationId,
      studentName: `${studentFee.student.firstName} ${studentFee.student.lastName}`,
      ...params.notes,
    },
  })

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: creds.keyId, // Frontend needs this to open checkout
    studentFeeId: params.studentFeeId,
    studentName: `${studentFee.student.firstName} ${studentFee.student.lastName}`,
  }
}

// ============================================================================
// Verify Payment
// ============================================================================

export async function verifyRazorpayPayment(params: VerifyPaymentParams) {
  const creds = await getRazorpayCredentials(params.organizationId)

  // Verify signature
  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`
  const expectedSignature = crypto
    .createHmac('sha256', creds.keySecret)
    .update(body)
    .digest('hex')

  if (expectedSignature !== params.razorpaySignature) {
    throw AppError.badRequest('Payment verification failed — invalid signature')
  }

  // Fetch payment details from Razorpay
  const payment = await razorpayRequest(creds, 'GET', `/payments/${params.razorpayPaymentId}`)

  if (payment.status !== 'captured' && payment.status !== 'authorized') {
    throw AppError.badRequest(`Payment not successful. Status: ${payment.status}`)
  }

  // Record payment in database
  const amountInRupees = payment.amount / 100
  const receiptNumber = `ON-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const recorded = await prisma.payment.create({
    data: {
      organizationId: params.organizationId,
      studentId: params.studentId,
      studentFeeId: params.studentFeeId,
      amount: amountInRupees,
      paymentMode: 'pm_online',
      transactionRef: params.razorpayPaymentId,
      receiptNumber,
      collectedBy: 'Online Payment (Razorpay)',
      remarks: `Razorpay Order: ${params.razorpayOrderId}`,
    },
  })

  // Update student fee paid amount
  await prisma.studentFee.update({
    where: { id: params.studentFeeId },
    data: {
      paidAmount: { increment: amountInRupees },
    },
  })

  // Check if fully paid and update status
  const updatedFee = await prisma.studentFee.findUnique({ where: { id: params.studentFeeId } })
  if (updatedFee) {
    const remaining = Number(updatedFee.totalAmount) - Number(updatedFee.paidAmount) - Number(updatedFee.discountAmount)
    if (remaining <= 0) {
      await prisma.studentFee.update({
        where: { id: params.studentFeeId },
        data: { status: 'fps_paid' },
      })
    } else {
      await prisma.studentFee.update({
        where: { id: params.studentFeeId },
        data: { status: 'fps_partial' },
      })
    }
  }

  return {
    success: true,
    paymentId: recorded.id,
    receiptNumber: recorded.receiptNumber,
    amount: amountInRupees,
    transactionRef: params.razorpayPaymentId,
  }
}

// ============================================================================
// Webhook Handler
// ============================================================================

export async function handleRazorpayWebhook(organizationId: string, webhookBody: any, webhookSignature: string, webhookSecret?: string) {
  // Verify webhook signature if secret is configured
  if (webhookSecret) {
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(webhookBody))
      .digest('hex')

    if (expectedSig !== webhookSignature) {
      throw AppError.unauthorized('Invalid webhook signature')
    }
  }

  const event = webhookBody.event
  const payload = webhookBody.payload

  if (event === 'payment.captured') {
    const paymentEntity = payload.payment.entity
    const notes = paymentEntity.notes || {}

    // Only process if we have our metadata
    if (notes.studentFeeId && notes.studentId) {
      // Check if already processed
      const existing = await prisma.payment.findFirst({
        where: { transactionRef: paymentEntity.id },
      })
      if (existing) {
        return { processed: false, reason: 'already recorded' }
      }

      // Record payment
      const amountInRupees = paymentEntity.amount / 100
      const receiptNumber = `WH-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      await prisma.payment.create({
        data: {
          organizationId: notes.organizationId || organizationId,
          studentId: notes.studentId,
          studentFeeId: notes.studentFeeId,
          amount: amountInRupees,
          paymentMode: 'pm_online',
          transactionRef: paymentEntity.id,
          receiptNumber,
          collectedBy: 'Razorpay Webhook',
          remarks: `Auto-captured via webhook. Order: ${paymentEntity.order_id}`,
        },
      })

      await prisma.studentFee.update({
        where: { id: notes.studentFeeId },
        data: { paidAmount: { increment: amountInRupees } },
      })

      return { processed: true, paymentId: paymentEntity.id }
    }
  }

  return { processed: false, reason: `Unhandled event: ${event}` }
}

// ============================================================================
// Test Connection
// ============================================================================

export async function testRazorpayConnection(integrationId: string, organizationId: string) {
  const integration = await getActiveIntegration(organizationId, 'payment_gateway', 'razorpay')
  if (!integration) {
    // Try to get by ID even if inactive
    const { getDecryptedCredentials } = await import('./integration.service.js')
    const creds = await getDecryptedCredentials(integrationId, organizationId)
    try {
      const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64')
      const res = await fetch('https://api.razorpay.com/v1/payments?count=1', {
        headers: { 'Authorization': `Basic ${auth}` },
      })
      if (res.ok) {
        await markIntegrationTested(integrationId, 'active')
        return { success: true, message: 'Razorpay connection successful' }
      }
      await markIntegrationTested(integrationId, 'error')
      return { success: false, message: `Razorpay returned ${res.status}` }
    } catch (err) {
      await markIntegrationTested(integrationId, 'error')
      return { success: false, message: `Connection failed: ${String(err)}` }
    }
  }

  try {
    const creds = integration.decryptedCredentials as unknown as RazorpayCredentials
    await razorpayRequest(creds, 'GET', '/payments?count=1')
    await markIntegrationTested(integrationId, 'active')
    return { success: true, message: 'Razorpay connection successful' }
  } catch (err) {
    await markIntegrationTested(integrationId, 'error')
    return { success: false, message: String(err) }
  }
}
