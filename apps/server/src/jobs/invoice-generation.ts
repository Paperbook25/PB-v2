import { prisma } from '../config/db.js'

/**
 * Generate invoices for active subscriptions whose nextBillingDate has passed.
 */
export async function generateRecurringInvoices() {
  const now = new Date()

  // Find subscriptions due for billing
  const dueSubs = await prisma.platformSubscription.findMany({
    where: {
      status: 'sub_active',
      nextBillingDate: { lte: now },
    },
    include: {
      school: { select: { id: true, name: true } },
    },
  })

  if (dueSubs.length === 0) {
    console.log('[InvoiceGeneration] No subscriptions due for billing')
    return { generated: 0 }
  }

  let generated = 0

  for (const sub of dueSubs) {
    try {
      // Generate invoice number: INV-YYYYMM-XXXX
      const monthStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
      const count = await prisma.platformInvoice.count({
        where: { invoiceNumber: { startsWith: `INV-${monthStr}` } },
      })
      const invoiceNumber = `INV-${monthStr}-${String(count + 1).padStart(4, '0')}`

      // Calculate billing period
      const periodStart = sub.currentPeriodStart || now
      const periodEnd = calculateNextDate(now, sub.billingCycle)

      // Create invoice
      await prisma.platformInvoice.create({
        data: {
          invoiceNumber,
          schoolId: sub.schoolId,
          subscriptionId: sub.id,
          status: 'inv_draft',
          subtotal: sub.amount,
          taxAmount: 0,
          taxRate: 0,
          discount: 0,
          totalAmount: sub.amount,
          dueDate: new Date(now.getTime() + 15 * 86400000), // 15 days from now
          billingPeriodStart: periodStart,
          billingPeriodEnd: periodEnd,
          lineItems: JSON.stringify([{
            description: `${capitalize(sub.planTier)} Plan - ${capitalize(sub.billingCycle)} Subscription`,
            quantity: 1,
            unitPrice: Number(sub.amount),
            amount: Number(sub.amount),
          }]),
        },
      })

      // Advance the next billing date
      await prisma.platformSubscription.update({
        where: { id: sub.id },
        data: {
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          nextBillingDate: periodEnd,
        },
      })

      // Audit log
      await prisma.auditLog.create({
        data: {
          userName: 'System',
          userRole: 'admin',
          action: 'create',
          module: 'billing',
          entityType: 'PlatformInvoice',
          entityId: invoiceNumber,
          entityName: invoiceNumber,
          description: `Auto-generated invoice ${invoiceNumber} for ${sub.school.name}`,
        },
      })

      generated++
      console.log(`[InvoiceGeneration] Created ${invoiceNumber} for ${sub.school.name}`)
    } catch (err) {
      console.error(`[InvoiceGeneration] Failed for subscription ${sub.id}:`, err)
    }
  }

  console.log(`[InvoiceGeneration] Generated ${generated} invoices`)
  return { generated, total: dueSubs.length }
}

function calculateNextDate(from: Date, cycle: string): Date {
  const next = new Date(from)
  switch (cycle) {
    case 'monthly': next.setMonth(next.getMonth() + 1); break
    case 'quarterly': next.setMonth(next.getMonth() + 3); break
    case 'semi_annual': next.setMonth(next.getMonth() + 6); break
    case 'annual': next.setFullYear(next.getFullYear() + 1); break
    default: next.setMonth(next.getMonth() + 1); break
  }
  return next
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}
