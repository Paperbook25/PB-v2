import { getActiveIntegration, getDecryptedCredentials, markIntegrationTested } from './integration.service.js'

// ============================================================================
// WhatsApp Service — send messages via Twilio or Gupshup
// ============================================================================

interface SendMessageParams {
  organizationId: string
  to: string       // Phone number with country code e.g. +919876543210
  message: string
  templateId?: string
}

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

// ============================================================================
// Send WhatsApp Message
// ============================================================================

export async function sendWhatsAppMessage(params: SendMessageParams): Promise<SendResult> {
  const integration = await getActiveIntegration(params.organizationId, 'whatsapp_api')
  if (!integration) {
    return { success: false, error: 'WhatsApp integration not configured or inactive' }
  }

  const creds = integration.decryptedCredentials
  const provider = integration.provider

  switch (provider) {
    case 'twilio':
      return sendViaTwilio(creds, params)
    case 'gupshup':
      return sendViaGupshup(creds, params)
    default:
      return { success: false, error: `Unsupported WhatsApp provider: ${provider}` }
  }
}

// ============================================================================
// Twilio WhatsApp
// ============================================================================

async function sendViaTwilio(
  creds: Record<string, string>,
  params: SendMessageParams
): Promise<SendResult> {
  const accountSid = creds.accountSid
  const authToken = creds.authToken
  const fromNumber = creds.fromNumber // e.g. whatsapp:+14155238886

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: 'Incomplete Twilio credentials (need accountSid, authToken, fromNumber)' }
  }

  const toWhatsApp = params.to.startsWith('whatsapp:') ? params.to : `whatsapp:${params.to}`
  const fromWhatsApp = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const body = new URLSearchParams({
      To: toWhatsApp,
      From: fromWhatsApp,
      Body: params.message,
    })

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    )

    const data: any = await res.json()

    if (res.ok && data.sid) {
      return { success: true, messageId: data.sid }
    }
    return { success: false, error: data.message || `Twilio error: ${res.status}` }
  } catch (err) {
    return { success: false, error: `Twilio request failed: ${String(err)}` }
  }
}

// ============================================================================
// Gupshup WhatsApp
// ============================================================================

async function sendViaGupshup(
  creds: Record<string, string>,
  params: SendMessageParams
): Promise<SendResult> {
  const apiKey = creds.apiKey
  const appName = creds.appName
  const sourceNumber = creds.sourceNumber

  if (!apiKey || !appName || !sourceNumber) {
    return { success: false, error: 'Incomplete Gupshup credentials (need apiKey, appName, sourceNumber)' }
  }

  try {
    const body = new URLSearchParams({
      channel: 'whatsapp',
      source: sourceNumber,
      destination: params.to.replace(/^\+/, ''),
      'message.type': 'text',
      'message.text': params.message,
      'src.name': appName,
    })

    const res = await fetch('https://api.gupshup.io/wa/api/v1/msg', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const data: any = await res.json()

    if (data.status === 'submitted') {
      return { success: true, messageId: data.messageId }
    }
    return { success: false, error: data.message || `Gupshup error: ${JSON.stringify(data)}` }
  } catch (err) {
    return { success: false, error: `Gupshup request failed: ${String(err)}` }
  }
}

// ============================================================================
// Test Connection
// ============================================================================

export async function testWhatsAppConnection(integrationId: string, organizationId: string) {
  let creds: Record<string, string>
  let provider: string

  try {
    creds = await getDecryptedCredentials(integrationId, organizationId)
    const integration = await (await import('../config/db.js')).prisma.integration.findFirst({
      where: { id: integrationId, organizationId },
    })
    provider = integration?.provider || 'twilio'
  } catch {
    return { success: false, message: 'Integration not found' }
  }

  try {
    if (provider === 'twilio') {
      const auth = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString('base64')
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}.json`,
        { headers: { 'Authorization': `Basic ${auth}` } }
      )
      if (res.ok) {
        await markIntegrationTested(integrationId, 'active')
        return { success: true, message: 'Twilio WhatsApp connection successful' }
      }
      await markIntegrationTested(integrationId, 'error')
      return { success: false, message: `Twilio returned ${res.status}` }
    }

    if (provider === 'gupshup') {
      const res = await fetch('https://api.gupshup.io/wa/api/v1/wallet/balance', {
        headers: { 'apikey': creds.apiKey },
      })
      if (res.ok) {
        await markIntegrationTested(integrationId, 'active')
        return { success: true, message: 'Gupshup WhatsApp connection successful' }
      }
      await markIntegrationTested(integrationId, 'error')
      return { success: false, message: `Gupshup returned ${res.status}` }
    }

    return { success: false, message: `Unsupported provider: ${provider}` }
  } catch (err) {
    await markIntegrationTested(integrationId, 'error')
    return { success: false, message: `Connection failed: ${String(err)}` }
  }
}
