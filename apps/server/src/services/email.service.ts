import { env } from '../config/env.js'

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

// ============================================================================
// Core Send Function — Resend (primary) with SMTP fallback
// ============================================================================

export async function sendEmail(options: EmailOptions): Promise<{ sent: boolean; messageId?: string }> {
  const from = env.EMAIL_FROM || env.SMTP_FROM || 'PaperBook <noreply@paperbook.app>'

  // Dev mode: log to console (unless RESEND_API_KEY is explicitly set)
  if (env.isDev && !env.RESEND_API_KEY) {
    console.log('\n' + '='.repeat(60))
    console.log('[EMAIL] (dev mode — not actually sent)')
    console.log('='.repeat(60))
    console.log(`From:    ${from}`)
    console.log(`To:      ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log('-'.repeat(60))
    console.log(options.text || options.html.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n').trim())
    console.log('='.repeat(60) + '\n')
    return { sent: true, messageId: `dev-${Date.now()}` }
  }

  // Production: Resend
  if (env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(env.RESEND_API_KEY)

      const { data, error } = await resend.emails.send({
        from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        ...(options.replyTo ? { replyTo: options.replyTo } : {}),
      })

      if (error) {
        console.error('[Email] Resend error:', error)
        return { sent: false }
      }

      return { sent: true, messageId: data?.id }
    } catch (err: any) {
      console.error('[Email] Resend send failed:', err.message)
      return { sent: false }
    }
  }

  // Fallback: SMTP via nodemailer (legacy)
  if (env.SMTP_HOST) {
    try {
      const nodemailer = await import('nodemailer' as string) as any
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT || 587),
        secure: Number(env.SMTP_PORT) === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      })

      const info = await transporter.sendMail({
        from: `PaperBook <${env.SMTP_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      return { sent: true, messageId: info.messageId }
    } catch (err: any) {
      console.error('[Email] SMTP send failed:', err.message)
      return { sent: false }
    }
  }

  // No email provider configured — log warning
  console.warn('[Email] No email provider configured. Set RESEND_API_KEY in environment.')
  return { sent: false }
}

// ============================================================================
// Email Templates
// ============================================================================

const BRAND_COLOR = '#6366f1'
const BRAND_NAME = 'PaperBook'

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:${BRAND_COLOR};padding:24px 32px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${BRAND_NAME}</p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;">School Management Platform</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f3f4f6;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
              © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.<br>
              You're receiving this because you have an account on ${BRAND_NAME}.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function ctaButton(text: string, url: string): string {
  return `<p style="text-align:center;margin:28px 0;">
    <a href="${url}" style="background:${BRAND_COLOR};color:#ffffff;padding:13px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">${text}</a>
  </p>
  <p style="text-align:center;margin-top:12px;font-size:12px;color:#9ca3af;">
    Or copy this link: <a href="${url}" style="color:${BRAND_COLOR};word-break:break-all;">${url}</a>
  </p>`
}

// ---- Password Reset --------------------------------------------------------

export function passwordResetEmail(name: string, resetLink: string): EmailOptions {
  return {
    to: '',
    subject: 'Reset Your PaperBook Password',
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Reset Your Password</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${name || 'there'},</p>
      <p style="color:#374151;line-height:1.6;">We received a request to reset your PaperBook password. Click the button below to create a new one:</p>
      ${ctaButton('Reset Password', resetLink)}
      <p style="color:#6b7280;font-size:13px;margin-top:24px;">⏱ This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
    `),
    text: `Hi ${name || 'there'}, reset your PaperBook password here: ${resetLink} (expires in 1 hour)`,
  }
}

// ---- Welcome / Registration ------------------------------------------------

export function welcomeEmail(name: string, schoolName: string, loginLink: string): EmailOptions {
  return {
    to: '',
    subject: `Welcome to PaperBook — ${schoolName} is live!`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Welcome to PaperBook! 🎉</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${name},</p>
      <p style="color:#374151;line-height:1.6;"><strong>${schoolName}</strong> is now set up on PaperBook. You can log in and start managing your school right away.</p>
      ${ctaButton('Go to Dashboard', loginLink)}
      <p style="color:#6b7280;font-size:13px;margin-top:24px;">Need help getting started? Reach out to our support team anytime.</p>
    `),
    text: `Welcome to PaperBook! ${schoolName} is now live. Log in at: ${loginLink}`,
  }
}

// ---- Staff Invitation ------------------------------------------------------

export function staffInvitationEmail(
  inviteeName: string,
  inviterName: string,
  schoolName: string,
  role: string,
  acceptLink: string
): EmailOptions {
  return {
    to: '',
    subject: `You've been invited to join ${schoolName} on PaperBook`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">You're Invited!</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${inviteeName || 'there'},</p>
      <p style="color:#374151;line-height:1.6;"><strong>${inviterName}</strong> has invited you to join <strong>${schoolName}</strong> on PaperBook as a <strong>${role}</strong>.</p>
      ${ctaButton('Accept Invitation', acceptLink)}
      <p style="color:#6b7280;font-size:13px;margin-top:24px;">This invitation expires in <strong>7 days</strong>. If you weren't expecting this, you can ignore this email.</p>
    `),
    text: `Hi ${inviteeName}, you've been invited to join ${schoolName} on PaperBook as ${role}. Accept here: ${acceptLink}`,
  }
}

// ---- Fee Reminder ----------------------------------------------------------

export function feeReminderEmail(
  parentName: string,
  studentName: string,
  className: string,
  feeDetails: { feeType: string; amount: number; dueDate: string }[],
  schoolName: string,
  paymentLink: string
): EmailOptions {
  const totalDue = feeDetails.reduce((s, f) => s + f.amount, 0)
  const feeRows = feeDetails.map(f =>
    `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;">${f.feeType}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;">₹${f.amount.toLocaleString('en-IN')}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;">${f.dueDate}</td>
    </tr>`
  ).join('')

  return {
    to: '',
    subject: `Fee Reminder — ${studentName} (${className}) | ${schoolName}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Fee Payment Reminder</h2>
      <p style="color:#374151;line-height:1.6;">Dear ${parentName || 'Parent'},</p>
      <p style="color:#374151;line-height:1.6;">This is a friendly reminder about pending fee payments for <strong>${studentName}</strong> (${className}) at <strong>${schoolName}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#6b7280;font-weight:600;">Fee Type</th>
            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#6b7280;font-weight:600;">Amount</th>
            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#6b7280;font-weight:600;">Due Date</th>
          </tr>
        </thead>
        <tbody>${feeRows}</tbody>
        <tfoot>
          <tr style="background:#f9fafb;">
            <td style="padding:10px 12px;font-weight:700;color:#111827;">Total Due</td>
            <td style="padding:10px 12px;font-weight:700;color:#dc2626;" colspan="2">₹${totalDue.toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>
      ${ctaButton('Pay Now', paymentLink)}
      <p style="color:#6b7280;font-size:13px;">For queries, please contact the school accounts office.</p>
    `),
    text: `Dear ${parentName}, reminder for ${studentName} (${className}) at ${schoolName}. Total due: ₹${totalDue.toLocaleString('en-IN')}. Pay at: ${paymentLink}`,
  }
}

// ---- Payment Receipt -------------------------------------------------------

export function paymentReceiptEmail(
  parentName: string,
  studentName: string,
  amount: number,
  receiptNumber: string,
  schoolName: string
): EmailOptions {
  return {
    to: '',
    subject: `Payment Confirmed — Receipt ${receiptNumber} | ${schoolName}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Payment Confirmed ✓</h2>
      <p style="color:#374151;line-height:1.6;">Dear ${parentName || 'Parent'},</p>
      <p style="color:#374151;line-height:1.6;">We've received your payment of <strong>₹${amount.toLocaleString('en-IN')}</strong> for <strong>${studentName}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#6b7280;font-size:13px;width:40%;">Receipt Number</td><td style="padding:10px 16px;font-weight:600;color:#111827;">${receiptNumber}</td></tr>
        <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Student</td><td style="padding:10px 16px;color:#374151;">${studentName}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Amount Paid</td><td style="padding:10px 16px;font-weight:700;color:#16a34a;">₹${amount.toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">School</td><td style="padding:10px 16px;color:#374151;">${schoolName}</td></tr>
      </table>
      <p style="color:#6b7280;font-size:13px;">Please keep this receipt for your records. Contact the school accounts office for any queries.</p>
    `),
    text: `Payment confirmed: ₹${amount.toLocaleString('en-IN')} for ${studentName}. Receipt: ${receiptNumber}. School: ${schoolName}.`,
  }
}

// ---- OTP / Email Verification (for future use) -----------------------------

export function otpEmail(name: string, otp: string, purpose: 'verify' | 'login' = 'verify'): EmailOptions {
  const purposeText = purpose === 'login' ? 'sign in to' : 'verify your email on'
  return {
    to: '',
    subject: `Your PaperBook verification code: ${otp}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Verification Code</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${name || 'there'},</p>
      <p style="color:#374151;line-height:1.6;">Use this code to ${purposeText} PaperBook:</p>
      <div style="text-align:center;margin:28px 0;">
        <span style="background:#f3f4f6;border:2px dashed #d1d5db;color:#111827;font-size:36px;font-weight:700;letter-spacing:12px;padding:16px 24px;border-radius:12px;display:inline-block;">${otp}</span>
      </div>
      <p style="color:#6b7280;font-size:13px;text-align:center;">⏱ This code expires in <strong>10 minutes</strong>. Never share it with anyone.</p>
    `),
    text: `Your PaperBook verification code is: ${otp} (expires in 10 minutes)`,
  }
}
