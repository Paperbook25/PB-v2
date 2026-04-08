import { sendWhatsAppMessage } from './whatsapp.service.js'
import { sendSms } from './sms.service.js'

// ============================================================================
// Notification Dispatch — tries WhatsApp first, falls back to SMS
// Silently skips if no integration is configured (non-critical path)
// ============================================================================

export async function notifyByPhone(organizationId: string, phone: string, message: string): Promise<void> {
  if (!phone?.trim()) return

  try {
    const waResult = await sendWhatsAppMessage({ organizationId, to: phone, message })
    if (waResult.success) return

    // WhatsApp failed or not configured — try SMS
    const smsResult = await sendSms({ organizationId, to: phone, message })
    if (!smsResult.success) {
      console.warn(`[notify] Both WhatsApp and SMS failed for org=${organizationId}: WA=${waResult.error}, SMS=${smsResult.error}`)
    }
  } catch (err) {
    // Never crash the calling request — notifications are best-effort
    console.error(`[notify] Unexpected error for org=${organizationId}:`, err)
  }
}
