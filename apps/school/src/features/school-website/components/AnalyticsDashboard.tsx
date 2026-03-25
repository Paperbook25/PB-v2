import { useMemo } from 'react'
import { Eye, TrendingUp, BarChart3, FileText, Loader2 } from 'lucide-react'
import { useAnalyticsSummary } from '../api/analytics.api'

// ==================== Stat Card ====================

function StatCard({ label, value, icon: Icon, color }: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

// ==================== Simple SVG Line Chart ====================

function ViewsChart({ trend }: { trend: Array<{ date: string; views: number }> }) {
  const chartWidth = 800
  const chartHeight = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 50 }
  const innerW = chartWidth - padding.left - padding.right
  const innerH = chartHeight - padding.top - padding.bottom

  const { path, areaPath, maxViews, yTicks } = useMemo(() => {
    if (trend.length === 0) return { path: '', areaPath: '', maxViews: 0, yTicks: [] as number[] }

    const max = Math.max(...trend.map(t => t.views), 1)
    const stepX = innerW / Math.max(trend.length - 1, 1)

    const points = trend.map((t, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + innerH - (t.views / max) * innerH,
    }))

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const area = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`

    // Generate 4-5 y-axis ticks
    const ticks: number[] = []
    const step = Math.ceil(max / 4)
    for (let v = 0; v <= max; v += step) {
      ticks.push(v)
    }
    if (ticks[ticks.length - 1] < max) ticks.push(max)

    return { path: linePath, areaPath: area, maxViews: max, yTicks: ticks }
  }, [trend, innerW, innerH])

  if (trend.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
        No data yet. Views will appear as visitors browse your website.
      </div>
    )
  }

  // Show a subset of date labels to avoid overlap
  const labelInterval = Math.ceil(trend.length / 8)

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yTicks.map(v => {
        const y = padding.top + innerH - (v / maxViews) * innerH
        return (
          <g key={v}>
            <line
              x1={padding.left} y1={y}
              x2={chartWidth - padding.right} y2={y}
              stroke="#e5e7eb" strokeWidth={1}
            />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-gray-400" fontSize={11}>
              {v}
            </text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" opacity={0.3} />

      {/* Line */}
      <path d={path} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {trend.map((t, i) => {
        const stepX = innerW / Math.max(trend.length - 1, 1)
        const x = padding.left + i * stepX
        const y = padding.top + innerH - (t.views / maxViews) * innerH
        return (
          <circle key={i} cx={x} cy={y} r={3} fill="#3b82f6" stroke="white" strokeWidth={1.5} />
        )
      })}

      {/* X-axis date labels */}
      {trend.map((t, i) => {
        if (i % labelInterval !== 0 && i !== trend.length - 1) return null
        const stepX = innerW / Math.max(trend.length - 1, 1)
        const x = padding.left + i * stepX
        const label = new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        return (
          <text key={i} x={x} y={chartHeight - 5} textAnchor="middle" className="fill-gray-400" fontSize={10}>
            {label}
          </text>
        )
      })}

      {/* Gradient def */}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ==================== Top Pages Table ====================

function TopPagesTable({ pages }: { pages: Array<{ pageSlug: string; views: number; percentage: number }> }) {
  if (pages.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-6">No page data yet.</p>
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="text-left py-2 px-3 font-medium text-gray-600">Page</th>
          <th className="text-right py-2 px-3 font-medium text-gray-600">Views</th>
          <th className="text-right py-2 px-3 font-medium text-gray-600">Share</th>
          <th className="py-2 px-3 w-[120px]"></th>
        </tr>
      </thead>
      <tbody>
        {pages.map(p => (
          <tr key={p.pageSlug} className="border-b last:border-b-0 hover:bg-gray-50">
            <td className="py-2.5 px-3 font-medium text-gray-900">/{p.pageSlug}</td>
            <td className="py-2.5 px-3 text-right text-gray-600">{p.views.toLocaleString()}</td>
            <td className="py-2.5 px-3 text-right text-gray-500">{p.percentage}%</td>
            <td className="py-2.5 px-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${p.percentage}%` }}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ==================== Main Dashboard ====================

export function AnalyticsDashboard() {
  const { data: summary, isLoading } = useAnalyticsSummary()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const views7d = summary?.views7d ?? 0
  const views30d = summary?.views30d ?? 0
  const avgDaily = summary?.avgDailyViews ?? 0
  const topPage = summary?.topPage ?? '-'
  const topPages = summary?.topPages ?? []
  const trend = summary?.trend ?? []

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Views (7 days)"
          value={views7d.toLocaleString()}
          icon={Eye}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Views (30 days)"
          value={views30d.toLocaleString()}
          icon={TrendingUp}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          label="Avg Daily Views"
          value={avgDaily.toLocaleString()}
          icon={BarChart3}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          label="Top Page"
          value={topPage ? `/${topPage}` : '-'}
          icon={FileText}
          color="bg-green-100 text-green-600"
        />
      </div>

      {/* Line Chart */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Daily Views (Last 30 Days)</h3>
        <ViewsChart trend={trend} />
      </div>

      {/* Top Pages */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Top Pages</h3>
        <TopPagesTable pages={topPages} />
      </div>
    </div>
  )
}
