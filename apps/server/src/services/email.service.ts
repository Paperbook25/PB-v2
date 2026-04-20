import { env } from '../config/env.js'
import { prisma } from '../config/db.js'

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

// ============================================================================
// Email Config Resolution — reads from PlatformIntegration DB with 60s cache
// ============================================================================

interface EmailConfig {
  apiKey: string
  fromAddress: string
}

let _cachedConfig: EmailConfig | null = null
let _cacheAt = 0
const CACHE_TTL_MS = 60_000

async function resolveEmailConfig(): Promise<EmailConfig | null> {
  const now = Date.now()
  if (_cachedConfig && now - _cacheAt < CACHE_TTL_MS) return _cachedConfig

  try {
    // Look for any active email_service integration (resend or sendgrid)
    const integration = await prisma.platformIntegration.findFirst({
      where: { type: 'email_service', status: 'active' },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    })

    if (integration) {
      const { decryptPlatformCredentials } = await import('./platform-integration.service.js')
      const creds = decryptPlatformCredentials(integration.credentials as any)
      if (creds.apiKey) {
        _cachedConfig = {
          apiKey: creds.apiKey,
          fromAddress: creds.fromAddress || 'PaperBook <noreply@paperbook.app>',
        }
        _cacheAt = now
        return _cachedConfig
      }
    }
  } catch {
    // DB not available yet or error — fall through to env var
  }

  // Env var fallback
  if (env.RESEND_API_KEY) {
    _cachedConfig = {
      apiKey: env.RESEND_API_KEY,
      fromAddress: env.EMAIL_FROM || env.SMTP_FROM || 'PaperBook <noreply@paperbook.app>',
    }
    _cacheAt = now
    return _cachedConfig
  }

  _cachedConfig = null
  _cacheAt = 0
  return null
}

/** Force cache invalidation — call after saving a new email integration */
export function invalidateEmailConfigCache() {
  _cachedConfig = null
  _cacheAt = 0
}

// ============================================================================
// Event Toggle Check — reads from PlatformSettings (default: enabled)
// ============================================================================

export async function isEmailEventEnabled(event: string): Promise<boolean> {
  try {
    const setting = await prisma.platformSettings.findUnique({
      where: { key: `email.event.${event}` },
    })
    if (!setting) return true // default on
    return setting.value === 'true'
  } catch {
    return true // if DB error, default on
  }
}

// ============================================================================
// Email Log — fire-and-forget, never blocks sending
// ============================================================================

function logEmail(opts: {
  to: string
  subject: string
  template: string
  status: 'sent' | 'failed' | 'skipped'
  messageId?: string
  error?: string
  metadata?: Record<string, unknown>
}) {
  prisma.emailLog.create({
    data: {
      to: opts.to,
      subject: opts.subject,
      template: opts.template,
      status: opts.status,
      messageId: opts.messageId ?? null,
      error: opts.error ?? null,
      metadata: opts.metadata as any ?? undefined,
    },
  }).catch(() => {}) // never throw
}

// ============================================================================
// Core Send Function — Resend (primary) with SMTP fallback
// ============================================================================

export async function sendEmail(
  options: EmailOptions,
  template = 'unknown'
): Promise<{ sent: boolean; messageId?: string }> {
  const config = await resolveEmailConfig()
  const from = config?.fromAddress || env.EMAIL_FROM || env.SMTP_FROM || 'PaperBook <noreply@paperbook.app>'
  const toStr = Array.isArray(options.to) ? options.to[0] : options.to

  // Dev mode: log to console (unless config resolved with a real key)
  if (env.isDev && !config) {
    console.log('\n' + '='.repeat(60))
    console.log('[EMAIL] (dev mode — not actually sent)')
    console.log('='.repeat(60))
    console.log(`From:     ${from}`)
    console.log(`To:       ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`)
    console.log(`Subject:  ${options.subject}`)
    console.log(`Template: ${template}`)
    console.log('-'.repeat(60))
    console.log(options.text || options.html.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n').trim())
    console.log('='.repeat(60) + '\n')
    logEmail({ to: toStr, subject: options.subject, template, status: 'sent', messageId: `dev-${Date.now()}` })
    return { sent: true, messageId: `dev-${Date.now()}` }
  }

  // Production: Resend (via DB config or env var)
  if (config?.apiKey) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(config.apiKey)

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
        logEmail({ to: toStr, subject: options.subject, template, status: 'failed', error: String(error) })
        return { sent: false }
      }

      logEmail({ to: toStr, subject: options.subject, template, status: 'sent', messageId: data?.id })
      return { sent: true, messageId: data?.id }
    } catch (err: any) {
      console.error('[Email] Resend send failed:', err.message)
      logEmail({ to: toStr, subject: options.subject, template, status: 'failed', error: err.message })
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

      logEmail({ to: toStr, subject: options.subject, template, status: 'sent', messageId: info.messageId })
      return { sent: true, messageId: info.messageId }
    } catch (err: any) {
      console.error('[Email] SMTP send failed:', err.message)
      logEmail({ to: toStr, subject: options.subject, template, status: 'failed', error: err.message })
      return { sent: false }
    }
  }

  // No provider configured
  console.warn('[Email] No email provider configured. Add a Resend integration in Gravity Portal → Integrations.')
  logEmail({ to: toStr, subject: options.subject, template, status: 'failed', error: 'No email provider configured' })
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
          <td style="background:${BRAND_COLOR};padding:20px 32px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="vertical-align:middle;">
                  <img src="https://paperbook.app/favicon.svg" alt="${BRAND_NAME}" width="36" height="36"
                    style="display:inline-block;vertical-align:middle;border-radius:8px;background:#fff;padding:4px;margin-right:12px;" />
                  <span style="color:#ffffff;font-size:20px;font-weight:700;vertical-align:middle;">${BRAND_NAME}</span>
                </td>
              </tr>
              <tr>
                <td style="padding-top:4px;">
                  <p style="margin:0;color:rgba(255,255,255,0.8);font-size:12px;padding-left:48px;">School Management Platform</p>
                </td>
              </tr>
            </table>
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

// ---- OTP / Email Verification ----------------------------------------------

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

// ---- Lead Confirmation (sent immediately after website sign-up) -----------

export function leadConfirmationEmail(name: string, schoolName: string): EmailOptions {
  return {
    to: '',
    subject: `We received your request, ${name}!`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Thanks for reaching out!</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${name},</p>
      <p style="color:#374151;line-height:1.6;">We've received your interest in PaperBook for <strong>${schoolName}</strong>. Our team will review your details and reach out within 1 business day.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">What happens next?</p>
        <ul style="margin:8px 0 0;padding-left:20px;color:#166534;font-size:14px;">
          <li>Our team will review your school details</li>
          <li>You'll receive a personalised demo invitation</li>
          <li>We'll set up a 15-day free trial for your school</li>
        </ul>
      </div>
      <p style="color:#6b7280;font-size:13px;margin-top:20px;">Have questions? Reply to this email and we'll get back to you.</p>
    `),
    text: `Hi ${name}, we received your interest in PaperBook for ${schoolName}. Our team will reach out within 1 business day.`,
  }
}

// ---- Trial Activation (CRM → email with activation link) ------------------

export function trialActivationEmail(
  name: string,
  schoolName: string,
  activationUrl: string
): EmailOptions {
  return {
    to: '',
    subject: `Your 15-day free trial of PaperBook is ready`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Your trial is ready, ${name}!</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${name},</p>
      <p style="color:#374151;line-height:1.6;">Great news — your 15-day free trial of PaperBook for <strong>${schoolName}</strong> is ready to activate. Click the button below to set up your school:</p>
      ${ctaButton('Set Up My School', activationUrl)}
      <div style="background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:14px 18px;margin:20px 0;">
        <p style="margin:0;color:#854d0e;font-size:13px;"><strong>What's included in your trial:</strong></p>
        <ul style="margin:6px 0 0;padding-left:18px;color:#854d0e;font-size:13px;">
          <li>Unlimited students, staff, and parents</li>
          <li>Fee management & online payments</li>
          <li>Attendance, timetables & exam management</li>
          <li>Parent portal & mobile app</li>
          <li>Full support during your trial</li>
        </ul>
      </div>
      <p style="color:#6b7280;font-size:13px;">⏱ This setup link expires in <strong>7 days</strong>. If you have any trouble, reply to this email.</p>
    `),
    text: `Hi ${name}, your 15-day PaperBook trial for ${schoolName} is ready. Set up your school at: ${activationUrl} (link expires in 7 days)`,
  }
}

// ---- Trial Expiry Warning --------------------------------------------------

export function trialExpiryWarningEmail(
  name: string,
  schoolName: string,
  daysLeft: number
): EmailOptions {
  return {
    to: '',
    subject: `Your PaperBook trial expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Your trial is ending soon</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${name},</p>
      <p style="color:#374151;line-height:1.6;">Your PaperBook trial for <strong>${schoolName}</strong> expires in <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>. Upgrade now to keep your data and continue without interruption.</p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 18px;margin:20px 0;">
        <p style="margin:0;color:#9a3412;font-size:14px;">After your trial ends, your school account will be paused. Upgrade to reactivate instantly.</p>
      </div>
      ${ctaButton('Upgrade My Plan', `https://paperbook.app/#pricing`)}
      <p style="color:#6b7280;font-size:13px;">Questions? Reply to this email and our team will help you choose the right plan.</p>
    `),
    text: `Hi ${name}, your PaperBook trial for ${schoolName} expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Upgrade at https://paperbook.app/#pricing`,
  }
}

// ---- School Activated (after school setup is complete) --------------------

export function schoolActivatedEmail(
  name: string,
  schoolName: string,
  loginUrl: string
): EmailOptions {
  return {
    to: '',
    subject: `Your PaperBook school is live!`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">Your school is live! 🎉</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${name},</p>
      <p style="color:#374151;line-height:1.6;"><strong>${schoolName}</strong> is now live on PaperBook. You're all set to start managing your school.</p>
      ${ctaButton('Go to Dashboard', loginUrl)}
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;margin:20px 0;">
        <p style="margin:0 0 6px;color:#166534;font-size:14px;font-weight:600;">Quick start checklist:</p>
        <ul style="margin:0;padding-left:18px;color:#166534;font-size:13px;">
          <li>Add your classes and sections</li>
          <li>Import or add students</li>
          <li>Set up fee structures</li>
          <li>Invite your staff members</li>
        </ul>
      </div>
      <p style="color:#6b7280;font-size:13px;">Your school URL: <a href="${loginUrl}" style="color:${BRAND_COLOR};">${loginUrl}</a></p>
      <p style="color:#6b7280;font-size:13px;">Need help? Our support team is ready to assist you at any time.</p>
    `),
    text: `Hi ${name}, ${schoolName} is now live on PaperBook! Log in at: ${loginUrl}`,
  }
}
