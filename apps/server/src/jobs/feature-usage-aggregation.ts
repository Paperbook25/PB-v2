import { aggregateUsage } from '../services/admin-feature-usage.service.js'

// ---------------------------------------------------------------------------
// Daily Feature Usage Aggregation Job
// Processes audit logs into FeatureUsageAggregate table
// ---------------------------------------------------------------------------

const ONE_DAY_MS = 24 * 60 * 60 * 1000

/**
 * Run aggregation for yesterday's data (called daily).
 */
async function runDailyAggregation() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  console.log(`[FeatureUsageJob] Aggregating usage for ${yesterday.toISOString().split('T')[0]}...`)

  try {
    const result = await aggregateUsage(yesterday)
    console.log(`[FeatureUsageJob] Done — ${result.aggregated} entries aggregated`)
  } catch (err) {
    console.error('[FeatureUsageJob] Failed:', err)
  }
}

/**
 * Backfill: aggregate all historical audit log dates that haven't been processed yet.
 */
export async function backfillUsageAggregation() {
  const { prisma } = await import('../config/db.js')

  // Find the earliest audit log date
  const earliest = await prisma.auditLog.findFirst({
    where: { schoolId: { not: null } },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
  })

  if (!earliest) {
    console.log('[FeatureUsageJob] No audit logs to backfill')
    return { processed: 0 }
  }

  const startDate = new Date(earliest.createdAt)
  startDate.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let processed = 0
  const current = new Date(startDate)

  while (current < today) {
    try {
      const result = await aggregateUsage(new Date(current))
      if (result.aggregated > 0) processed++
    } catch (err) {
      console.error(`[FeatureUsageJob] Failed for ${current.toISOString().split('T')[0]}:`, err)
    }
    current.setDate(current.getDate() + 1)
  }

  console.log(`[FeatureUsageJob] Backfill complete — ${processed} days with data`)
  return { processed }
}

/**
 * Schedule the daily aggregation job.
 * Runs at midnight + 5 minutes to ensure the previous day's logs are complete.
 */
export function scheduleDailyAggregation() {
  // Calculate ms until next midnight + 5 min
  function msUntilNextRun(): number {
    const now = new Date()
    const next = new Date(now)
    next.setDate(next.getDate() + 1)
    next.setHours(0, 5, 0, 0) // 00:05 AM
    if (next.getTime() - now.getTime() > ONE_DAY_MS) {
      // Already past midnight, schedule for today's 00:05
      next.setDate(next.getDate() - 1)
    }
    return next.getTime() - now.getTime()
  }

  function scheduleNext() {
    const delay = msUntilNextRun()
    console.log(`[FeatureUsageJob] Next run in ${Math.round(delay / 60000)} minutes`)

    setTimeout(async () => {
      await runDailyAggregation()
      scheduleNext() // Schedule the next day
    }, delay)
  }

  scheduleNext()

  // Also run an initial aggregation for yesterday on startup (in case the server was down)
  setTimeout(() => runDailyAggregation(), 10_000)

  console.log('[FeatureUsageJob] Daily aggregation scheduled')
}
