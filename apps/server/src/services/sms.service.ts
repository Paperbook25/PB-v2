import { getActiveIntegration, getDecryptedCredentials, markIntegrationTested } from './integration.service.js'

// ============================================================================
// SMS Service — send SMS via Twilio or MSG91
// ============================================================================

interface SendSmsParams {
  organizationId: string
  to: string       // Phone number with country code e.g. +919876543210
  message: string
}

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

// ============================================================================
// Send SMS
// ============================================================================

export async function sendSms(params: SendSmsParams): Promise<SendResult> {
  const integration = await getActiveIntegration(params.organizationId, 'sms_gateway')
  if (!integration) {
    return { success: false, error: 'SMS integration not configured or inactive' }
  }

  const creds = integration.decryptedCredentials
  const provider = integration.provider

  switch (provider) {
    case 'twilio':
      return sendViaTwilio(creds, params)
    case 'msg91':
      return sendViaMsg91(creds, params)
    default:
      return { success: false, error: `Unsupported SMS provider: ${provider}` }
  }
}

// ============================================================================
// Twilio SMS
// ============================================================================

async function sendViaTwilio(
  creds: Record<string, string>,
  params: SendSmsParams
): Promise<SendResult> {
  const accountSid = creds.accountSid
  const authToken = creds.authToken
  const fromNumber = creds.fromNumber

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: 'Incomplete Twilio SMS credentials (need accountSid, authToken, fromNumber)' }
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const body = new URLSearchParams({
      To: params.to,
      From: fromNumber,
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
// MSG91 SMS
// ============================================================================

async function sendViaMsg91(
  creds: Record<string, string>,
  params: SendSmsParams
): Promise<SendResult> {
  const authKey = creds.authKey
  const senderId = creds.senderId
  const route = creds.route || '4' // transactional

  if (!authKey || !senderId) {
    return { success: false, error: 'Incomplete MSG91 credentials (need authKey, senderId)' }
  }

  try {
    const res = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: senderId,
        route,
        country: '91',
        sms: [{ message: params.message, to: [params.to.replace(/^\+91/, '')] }],
      }),
    })

    const data: any = await res.json()

    if (data.type === 'success') {
      return { success: true, messageId: data.request_id }
    }
    return { success: false, error: data.message || `MSG91 error: ${JSON.stringify(data)}` }
  } catch (err) {
    return { success: false, error: `MSG91 request failed: ${String(err)}` }
  }
}

// ============================================================================
// Test Connection
// ============================================================================

export async function testSmsConnection(integrationId: string, organizationId: string) {
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
        return { success: true, message: 'Twilio SMS connection successful' }
      }
      await markIntegrationTested(integrationId, 'error')
      return { success: false, message: `Twilio returned ${res.status}` }
    }

    if (provider === 'msg91') {
      // MSG91 doesn't have a simple health-check, try fetching balance
      const res = await fetch('https://control.msg91.com/api/balance.php?authkey=' + encodeURIComponent(creds.authKey) + '&type=1')
      if (res.ok) {
        await markIntegrationTested(integrationId, 'active')
        return { success: true, message: 'MSG91 connection successful' }
      }
      await markIntegrationTested(integrationId, 'error')
      return { success: false, message: `MSG91 returned ${res.status}` }
    }

    return { success: false, message: `Unsupported provider: ${provider}` }
  } catch (err) {
    await markIntegrationTested(integrationId, 'error')
    return { success: false, message: `Connection failed: ${String(err)}` }
  }
}
