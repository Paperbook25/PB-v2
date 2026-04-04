import { sendOverdueReminders, sendTrialExpiryWarnings } from '../services/admin-email.service.js'

/**
 * Run all periodic email notification jobs.
 */
export async function runEmailNotificationJobs() {
  console.log('[EmailNotifications] Running notification jobs...')

  try {
    const overdueResult = await sendOverdueReminders()
    console.log(`[EmailNotifications] Overdue reminders: ${overdueResult.sent}/${overdueResult.total}`)
  } catch (err) {
    console.error('[EmailNotifications] Overdue reminders failed:', err)
  }

  try {
    // Send warnings at 7 days, 3 days, and 1 day
    const warningResult = await sendTrialExpiryWarnings(7)
    console.log(`[EmailNotifications] Trial warnings: ${warningResult.sent}/${warningResult.total}`)
  } catch (err) {
    console.error('[EmailNotifications] Trial warnings failed:', err)
  }
}

/**
 * Schedule daily email notifications at 9 AM.
 */
export function scheduleEmailNotifications() {
  function scheduleNext() {
    const now = new Date()
    const next = new Date(now)
    next.setDate(next.getDate() + 1)
    next.setHours(9, 0, 0, 0) // 9 AM daily
    const delay = next.getTime() - now.getTime()

    setTimeout(async () => {
      await runEmailNotificationJobs()
      scheduleNext()
    }, delay)
  }

  scheduleNext()
  console.log('[EmailNotifications] Daily email notifications scheduled (9 AM)')
}
