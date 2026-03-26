import os from 'os'
import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

const startTime = Date.now()

export async function getStatus() {
  const uptime = Date.now() - startTime
  const memUsage = process.memoryUsage()

  // Test DB connection
  let dbStatus = 'connected'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    dbStatus = 'disconnected'
  }

  // Recent metrics for avg response time
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
  const recentMetrics = await prisma.healthMetric.findMany({
    where: { metricType: 'response_time_ms', recordedAt: { gte: fiveMinAgo } },
    select: { value: true },
  })
  const avgResponseTime = recentMetrics.length > 0
    ? Math.round(recentMetrics.reduce((s, m) => s + Number(m.value), 0) / recentMetrics.length)
    : 0

  // Recent error count
  const recentErrors = await prisma.healthMetric.findMany({
    where: { metricType: 'error_count', recordedAt: { gte: fiveMinAgo } },
    select: { value: true },
  })
  const errorCount = recentErrors.reduce((s, m) => s + Number(m.value), 0)

  // Active alerts count
  const activeAlerts = await prisma.systemAlert.count({ where: { isResolved: false } })

  return {
    uptime,
    uptimeFormatted: formatUptime(uptime),
    nodeVersion: process.version,
    platform: os.platform(),
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    },
    cpu: {
      loadAvg: os.loadavg().map((v) => Math.round(v * 100) / 100),
      cpus: os.cpus().length,
    },
    database: dbStatus,
    avgResponseTime,
    errorCount,
    activeAlerts,
  }
}

export async function getMetrics(query: { period?: string }) {
  const period = query.period || '24h'
  const since = new Date()

  switch (period) {
    case '1h': since.setHours(since.getHours() - 1); break
    case '24h': since.setHours(since.getHours() - 24); break
    case '7d': since.setDate(since.getDate() - 7); break
    case '30d': since.setDate(since.getDate() - 30); break
    default: since.setHours(since.getHours() - 24)
  }

  const metrics = await prisma.healthMetric.findMany({
    where: { recordedAt: { gte: since } },
    orderBy: { recordedAt: 'asc' },
  })

  const grouped: Record<string, Array<{ value: number; recordedAt: string }>> = {}
  for (const m of metrics) {
    if (!grouped[m.metricType]) grouped[m.metricType] = []
    grouped[m.metricType].push({ value: Number(m.value), recordedAt: m.recordedAt.toISOString() })
  }

  return grouped
}

export async function getAlerts() {
  const alerts = await prisma.systemAlert.findMany({
    orderBy: [{ isResolved: 'asc' }, { createdAt: 'desc' }],
    take: 50,
  })

  return alerts.map((a) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    message: a.message,
    threshold: a.threshold ? Number(a.threshold) : null,
    currentValue: a.currentValue ? Number(a.currentValue) : null,
    isResolved: a.isResolved,
    resolvedAt: a.resolvedAt?.toISOString() || null,
    resolvedBy: a.resolvedBy,
    createdAt: a.createdAt.toISOString(),
  }))
}

export async function resolveAlert(id: string, resolvedBy?: string) {
  const alert = await prisma.systemAlert.findUnique({ where: { id } })
  if (!alert) throw AppError.notFound('Alert not found')

  await prisma.systemAlert.update({
    where: { id },
    data: { isResolved: true, resolvedAt: new Date(), resolvedBy: resolvedBy || null },
  })
  return { success: true }
}

export async function createAlert(input: { type: string; severity: string; message: string }) {
  const alert = await prisma.systemAlert.create({
    data: { type: input.type, severity: input.severity, message: input.message },
  })
  return alert
}

function formatUptime(ms: number): string {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m`
}
