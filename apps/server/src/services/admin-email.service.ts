import { sendEmail } from './email.service.js'
import { prisma } from '../config/db.js'

// ==================== Email Templates ====================

function invoiceEmail(schoolName: string, invoiceNumber: string, amount: number, dueDate: string): { subject: string; html: string } {
  return {
    subject: `Invoice ${invoiceNumber} from PaperBook`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">PaperBook Invoice</h2>
        <p>Dear ${schoolName} Administrator,</p>
        <p>A new invoice has been generated for your school:</p>
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Invoice:</strong> ${invoiceNumber}</p>
          <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
          <p style="margin: 4px 0;"><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p>Please log in to your school portal to view the full invoice and make payment.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">PaperBook - School Management Platform</p>
      </div>
    `,
  }
}

function overdueReminderEmail(schoolName: string, invoiceNumber: string, amount: number, daysPastDue: number): { subject: string; html: string } {
  return {
    subject: `Payment Overdue — Invoice ${invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ef4444;">Payment Overdue</h2>
        <p>Dear ${schoolName} Administrator,</p>
        <p>This is a reminder that the following invoice is <strong>${daysPastDue} days past due</strong>:</p>
        <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="margin: 4px 0;"><strong>Invoice:</strong> ${invoiceNumber}</p>
          <p style="margin: 4px 0;"><strong>Amount Due:</strong> ₹${amount.toLocaleString('en-IN')}</p>
          <p style="margin: 4px 0;"><strong>Days Overdue:</strong> ${daysPastDue}</p>
        </div>
        <p>Please arrange payment at your earliest convenience to avoid service interruption.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">PaperBook - School Management Platform</p>
      </div>
    `,
  }
}

function trialExpiryEmail(schoolName: string, daysRemaining: number, planTier: string): { subject: string; html: string } {
  return {
    subject: `Your PaperBook trial expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Trial Expiring Soon</h2>
        <p>Dear ${schoolName} Administrator,</p>
        <p>Your PaperBook <strong>${planTier}</strong> trial will expire in <strong>${daysRemaining} day${daysRemaining === 1 ? '' : 's'}</strong>.</p>
        <p>To continue using all features without interruption, please upgrade your subscription.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://paperbook.app" style="background-color: #6366f1; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Upgrade Now
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">If you have questions, contact us at support@paperbook.app</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">PaperBook - School Management Platform</p>
      </div>
    `,
  }
}

function welcomeEmail(schoolName: string, adminName: string): { subject: string; html: string } {
  return {
    subject: `Welcome to PaperBook, ${schoolName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">Welcome to PaperBook!</h2>
        <p>Hi ${adminName},</p>
        <p>Your school <strong>${schoolName}</strong> has been set up on PaperBook. Here's what you can do next:</p>
        <ul style="line-height: 1.8;">
          <li>Add your staff and students</li>
          <li>Configure attendance policies</li>
          <li>Set up fee structures</li>
          <li>Explore LMS, Library, Transport modules</li>
        </ul>
        <p>Log in at your school portal to get started.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">PaperBook - School Management Platform</p>
      </div>
    `,
  }
}

// ==================== Notification Senders ====================

/**
 * Send invoice notification to a school.
 */
export async function sendInvoiceNotification(invoiceId: string) {
  const invoice = await prisma.platformInvoice.findUnique({
    where: { id: invoiceId },
    include: { school: { select: { name: true, email: true } } },
  })
  if (!invoice || !invoice.school.email) return { sent: false, reason: 'No invoice or email' }

  const template = invoiceEmail(
    invoice.school.name,
    invoice.invoiceNumber,
    Number(invoice.totalAmount),
    invoice.dueDate.toLocaleDateString()
  )

  const result = await sendEmail({
    to: invoice.school.email,
    subject: template.subject,
    html: template.html,
  })

  // Log to communication log
  await prisma.communicationLog.create({
    data: {
      schoolId: invoice.schoolId,
      channel: 'email',
      direction: 'outbound',
      subject: template.subject,
      content: `Invoice ${invoice.invoiceNumber} notification sent`,
      sentBy: 'System',
    },
  })

  return result
}

/**
 * Send overdue reminders for all unpaid invoices past due date.
 */
export async function sendOverdueReminders() {
  const now = new Date()
  const overdueInvoices = await prisma.platformInvoice.findMany({
    where: {
      status: 'inv_sent',
      dueDate: { lt: now },
    },
    include: { school: { select: { name: true, email: true } } },
  })

  let sent = 0
  for (const inv of overdueInvoices) {
    if (!inv.school.email) continue
    const daysPastDue = Math.ceil((now.getTime() - inv.dueDate.getTime()) / 86400000)
    const template = overdueReminderEmail(inv.school.name, inv.invoiceNumber, Number(inv.totalAmount), daysPastDue)

    const result = await sendEmail({ to: inv.school.email, ...template })
    if (result.sent) sent++

    await prisma.communicationLog.create({
      data: {
        schoolId: inv.schoolId,
        channel: 'email',
        direction: 'outbound',
        subject: template.subject,
        content: `Overdue reminder sent (${daysPastDue} days past due)`,
        sentBy: 'System',
      },
    })
  }

  console.log(`[EmailNotifications] Sent ${sent} overdue reminders`)
  return { sent, total: overdueInvoices.length }
}

/**
 * Send trial expiry warnings for trials expiring within given days.
 */
export async function sendTrialExpiryWarnings(daysThreshold: number = 7) {
  const now = new Date()
  const cutoff = new Date(now.getTime() + daysThreshold * 86400000)

  const expiringTrials = await prisma.platformSubscription.findMany({
    where: {
      status: 'sub_trial',
      trialEndsAt: { lte: cutoff, gt: now },
    },
    include: { school: { select: { name: true, email: true } } },
  })

  let sent = 0
  for (const sub of expiringTrials) {
    if (!sub.school.email || !sub.trialEndsAt) continue
    const daysRemaining = Math.max(1, Math.ceil((sub.trialEndsAt.getTime() - now.getTime()) / 86400000))
    const template = trialExpiryEmail(sub.school.name, daysRemaining, sub.planTier)

    const result = await sendEmail({ to: sub.school.email, ...template })
    if (result.sent) sent++

    await prisma.communicationLog.create({
      data: {
        schoolId: sub.schoolId,
        channel: 'email',
        direction: 'outbound',
        subject: template.subject,
        content: `Trial expiry warning sent (${daysRemaining} days remaining)`,
        sentBy: 'System',
      },
    })
  }

  console.log(`[EmailNotifications] Sent ${sent} trial expiry warnings`)
  return { sent, total: expiringTrials.length }
}

/**
 * Send welcome email to a newly created school.
 */
export async function sendWelcomeEmail(schoolId: string) {
  const school = await prisma.schoolProfile.findUnique({
    where: { id: schoolId },
    select: { name: true, email: true, principalName: true },
  })
  if (!school || !school.email) return { sent: false }

  const template = welcomeEmail(school.name, school.principalName || 'Admin')
  return sendEmail({ to: school.email, ...template })
}
