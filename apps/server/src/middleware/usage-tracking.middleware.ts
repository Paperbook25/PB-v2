import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/db.js'

// ---------------------------------------------------------------------------
// In-memory buffer for batching usage metrics to avoid per-request DB writes
// ---------------------------------------------------------------------------

interface UsageBuffer {
  apiCalls: Map<string, number>           // schoolId → count
  activeUsers: Map<string, Set<string>>   // schoolId → Set<userId>
}

const buffer: UsageBuffer = {
  apiCalls: new Map(),
  activeUsers: new Map(),
}

const FLUSH_INTERVAL = 60_000 // Flush every 60 seconds
const FLUSH_THRESHOLD = 200   // Or flush after 200 accumulated entries

let pendingEntries = 0

// ---------------------------------------------------------------------------
// Find-or-create a usage metric and update its value
// ---------------------------------------------------------------------------

async function upsertMetric(
  schoolId: string,
  metricType: string,
  recordedAt: Date,
  value: number,
  mode: 'increment' | 'set'
) {
  const existing = await prisma.usageMetric.findFirst({
    where: { schoolId, metricType, period: 'daily', recordedAt },
  })

  if (existing) {
    const newValue = mode === 'increment'
      ? Number(existing.value) + value
      : value
    await prisma.usageMetric.update({
      where: { id: existing.id },
      data: { value: newValue },
    })
  } else {
    await prisma.usageMetric.create({
      data: { schoolId, metricType, period: 'daily', value, recordedAt },
    })
  }
}

// ---------------------------------------------------------------------------
// Flush buffered metrics to the database
// ---------------------------------------------------------------------------

async function flushMetrics() {
  const apiCalls = new Map(buffer.apiCalls)
  const activeUsers = new Map(buffer.activeUsers)

  // Clear buffers immediately so new data doesn't get lost
  buffer.apiCalls.clear()
  buffer.activeUsers.clear()
  pendingEntries = 0

  if (apiCalls.size === 0 && activeUsers.size === 0) return

  const now = new Date()
  now.setHours(0, 0, 0, 0) // Normalize to day start for daily period

  const operations: Promise<void>[] = []

  for (const [schoolId, count] of apiCalls) {
    operations.push(upsertMetric(schoolId, 'api_calls', now, count, 'increment'))
  }

  for (const [schoolId, userSet] of activeUsers) {
    operations.push(upsertMetric(schoolId, 'active_users', now, userSet.size, 'set'))
  }

  try {
    await Promise.allSettled(operations)
  } catch (err) {
    console.error('[UsageTracking] Failed to flush metrics:', err)
  }
}

// Start the periodic flush interval
setInterval(flushMetrics, FLUSH_INTERVAL)

// Flush on process exit
process.on('SIGTERM', () => { flushMetrics() })
process.on('SIGINT', () => { flushMetrics() })

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function usageTrackingMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const schoolId = req.schoolId
  if (!schoolId) {
    next()
    return
  }

  // Track API call
  buffer.apiCalls.set(schoolId, (buffer.apiCalls.get(schoolId) || 0) + 1)

  // Track active user
  const userId = req.user?.userId
  if (userId) {
    if (!buffer.activeUsers.has(schoolId)) {
      buffer.activeUsers.set(schoolId, new Set())
    }
    buffer.activeUsers.get(schoolId)!.add(userId)
  }

  pendingEntries++

  // Flush if threshold reached
  if (pendingEntries >= FLUSH_THRESHOLD) {
    flushMetrics()
  }

  next()
}
