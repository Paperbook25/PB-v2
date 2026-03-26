import { env } from '../config/env.js'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email. In dev mode, logs to console. In production, uses SMTP.
 * Configure SMTP via env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
export async function sendEmail(options: EmailOptions): Promise<{ sent: boolean; messageId?: string }> {
  const from = env.SMTP_FROM || 'noreply@paperbook.app'

  if (env.isDev || !env.SMTP_HOST) {
    // Dev mode: log to console
    console.log('\n' + '='.repeat(60))
    console.log('[EMAIL] (dev mode - not actually sent)')
    console.log('='.repeat(60))
    console.log(`From: ${from}`)
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log('-'.repeat(60))
    console.log(options.text || options.html.replace(/<[^>]*>/g, ''))
    console.log('='.repeat(60) + '\n')
    return { sent: true, messageId: `dev-${Date.now()}` }
  }

  // Production: use SMTP via nodemailer (dynamic import)
  try {
    const nodemailer = await import('nodemailer' as string) as any
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT || 587),
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })

    const info = await transporter.sendMail({
      from: `PaperBook <${from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    return { sent: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('[Email] Send failed:', error.message)
    return { sent: false }
  }
}

// ==================== Email Templates ====================

export function passwordResetEmail(name: string, resetLink: string): EmailOptions {
  return {
    to: '', // caller sets this
    subject: 'Reset Your PaperBook Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">Reset Your Password</h2>
        <p>Hi ${name || 'there'},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">PaperBook - School Management Platform</p>
      </div>
    `,
    text: `Hi ${name || 'there'}, reset your password here: ${resetLink} (expires in 1 hour)`,
  }
}

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
    `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.feeType}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.amount.toLocaleString('en-IN')}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.dueDate}</td></tr>`
  ).join('')

  return {
    to: '', // caller sets this
    subject: `Fee Reminder - ${studentName} (${className}) | ${schoolName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">${schoolName}</h2>
        <p>Dear ${parentName || 'Parent'},</p>
        <p>This is a friendly reminder about pending fee payments for <strong>${studentName}</strong> (${className}).</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 8px; text-align: left;">Fee Type</th>
              <th style="padding: 8px; text-align: left;">Amount</th>
              <th style="padding: 8px; text-align: left;">Due Date</th>
            </tr>
          </thead>
          <tbody>${feeRows}</tbody>
          <tfoot>
            <tr style="font-weight: bold;">
              <td style="padding: 8px;">Total Due</td>
              <td style="padding: 8px;" colspan="2">${totalDue.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${paymentLink}" style="background-color: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Pay Now
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">For queries, contact the school accounts office.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">${schoolName} - Powered by PaperBook</p>
      </div>
    `,
    text: `Dear ${parentName}, reminder for ${studentName} (${className}) - Total due: ${totalDue}. Pay at: ${paymentLink}`,
  }
}
