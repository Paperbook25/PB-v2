import { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowDownRight,
  Activity,
} from 'lucide-react'
import {
  useFormStats,
  useConversionFunnel,
  useFieldDropoffs,
  useFormTrends,
} from '../api/form-analytics.api'
import type { FunnelStep, FieldDropoff, FormTrendPoint } from '../api/form-analytics.api'

// ==================== Stat Card ====================

function StatCard({ label, value, icon: Icon, color, subtitle }: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  subtitle?: string
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
          {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

// ==================== Conversion Funnel Chart ====================

function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
        No funnel data yet. Data will appear as visitors interact with your forms.
      </div>
    )
  }

  const maxCount = Math.max(...steps.map(s => s.count), 1)

  // Color gradient from gray to green
  const colors = [
    'bg-gray-300',
    'bg-blue-300',
    'bg-blue-400',
    'bg-emerald-400',
    'bg-emerald-500',
  ]

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const widthPct = maxCount > 0 ? Math.max((step.count / maxCount) * 100, 4) : 4
        const prevStep = i > 0 ? steps[i - 1] : null
        const conversionFromPrev = prevStep && prevStep.count > 0
          ? Math.round((step.count / prevStep.count) * 100)
          : null

        return (
          <div key={step.step} className="group">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{step.step}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{step.count.toLocaleString()}</span>
                {conversionFromPrev !== null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    conversionFromPrev >= 50 ? 'bg-green-100 text-green-700' :
                    conversionFromPrev >= 20 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {conversionFromPrev}% of prev
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${colors[i] || colors[colors.length - 1]}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ==================== Field Drop-off Chart ====================

function FieldDropoffChart({ fields }: { fields: FieldDropoff[] }) {
  if (fields.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
        No field data yet. Data will appear as visitors interact with form fields.
      </div>
    )
  }

  // Sort by completion rate descending for a more readable chart
  const sorted = [...fields].sort((a, b) => b.completionRate - a.completionRate)

  return (
    <div className="space-y-2">
      {sorted.map((f) => (
        <div key={f.fieldName} className="group">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-gray-700 capitalize">
              {f.fieldName.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {f.completes}/{f.starts} completed
              </span>
              <span className={`font-semibold text-sm ${
                f.completionRate >= 70 ? 'text-green-600' :
                f.completionRate >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {f.completionRate}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                f.completionRate >= 70 ? 'bg-green-400' :
                f.completionRate >= 50 ? 'bg-yellow-400' :
                'bg-red-400'
              }`}
              style={{ width: `${Math.max(f.completionRate, 2)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ==================== Daily Trend Chart (SVG Line) ====================

function TrendChart({ trend }: { trend: FormTrendPoint[] }) {
  const chartWidth = 800
  const chartHeight = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 50 }
  const innerW = chartWidth - padding.left - padding.right
  const innerH = chartHeight - padding.top - padding.bottom

  const { path, areaPath, maxVal, yTicks } = useMemo(() => {
    if (trend.length === 0) return { path: '', areaPath: '', maxVal: 0, yTicks: [] as number[] }

    const max = Math.max(...trend.map(t => t.submissions), 1)
    const stepX = innerW / Math.max(trend.length - 1, 1)

    const points = trend.map((t, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + innerH - (t.submissions / max) * innerH,
    }))

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const area = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`

    const ticks: number[] = []
    const step = Math.ceil(max / 4)
    for (let v = 0; v <= max; v += step) ticks.push(v)
    if (ticks[ticks.length - 1] < max) ticks.push(max)

    return { path: linePath, areaPath: area, maxVal: max, yTicks: ticks }
  }, [trend, innerW, innerH])

  if (trend.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
        No submission data yet.
      </div>
    )
  }

  const labelInterval = Math.ceil(trend.length / 8)

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yTicks.map(v => {
        const y = padding.top + innerH - (v / maxVal) * innerH
        return (
          <g key={v}>
            <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="#e5e7eb" strokeWidth={1} />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-gray-400" fontSize={11}>{v}</text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#formTrendGrad)" opacity={0.3} />

      {/* Line */}
      <path d={path} fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {trend.map((t, i) => {
        const stepX = innerW / Math.max(trend.length - 1, 1)
        const x = padding.left + i * stepX
        const y = padding.top + innerH - (t.submissions / maxVal) * innerH
        return <circle key={i} cx={x} cy={y} r={3} fill="#10b981" stroke="white" strokeWidth={1.5} />
      })}

      {/* X-axis date labels */}
      {trend.map((t, i) => {
        if (i % labelInterval !== 0 && i !== trend.length - 1) return null
        const stepX = innerW / Math.max(trend.length - 1, 1)
        const x = padding.left + i * stepX
        const label = new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        return <text key={i} x={x} y={chartHeight - 5} textAnchor="middle" className="fill-gray-400" fontSize={10}>{label}</text>
      })}

      {/* Gradient def */}
      <defs>
        <linearGradient id="formTrendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ==================== Form Type Selector ====================

function FormTypeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { value: 'contact', label: 'Contact Form' },
    { value: 'admission', label: 'Admission Form' },
    { value: 'newsletter', label: 'Newsletter' },
  ]

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ==================== Main Dashboard ====================

export function FormAnalyticsDashboard() {
  const [formType, setFormType] = useState('contact')

  const { data: stats, isLoading: statsLoading } = useFormStats(formType)
  const { data: funnelData, isLoading: funnelLoading } = useConversionFunnel()
  const { data: dropoffData, isLoading: dropoffsLoading } = useFieldDropoffs(formType)
  const { data: trendData, isLoading: trendsLoading } = useFormTrends(formType)

  const isLoading = statsLoading || funnelLoading || dropoffsLoading || trendsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const funnel = funnelData?.funnel ?? []
  const fields = dropoffData?.fields ?? []
  const trend = trendData?.trend ?? []
  const totalSubmissions = stats?.totalCompletes ?? 0
  const completionRate = stats?.completionRate ?? 0
  const mostAbandoned = stats?.mostAbandonedField ?? null
  const uniqueSessions = stats?.uniqueSessions ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Form Analytics</h2>
          <p className="text-sm text-gray-500">Track form interactions, drop-offs, and conversion funnel</p>
        </div>
        <FormTypeSelector value={formType} onChange={setFormType} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Submissions (all time)"
          value={totalSubmissions.toLocaleString()}
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          label="Completion Rate"
          value={`${completionRate}%`}
          icon={TrendingUp}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Most Abandoned Field"
          value={mostAbandoned
            ? mostAbandoned.replace(/([A-Z])/g, ' $1').trim()
            : '-'}
          icon={AlertTriangle}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          label="Unique Sessions"
          value={uniqueSessions.toLocaleString()}
          icon={Activity}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ArrowDownRight className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Conversion Funnel</h3>
        </div>
        <FunnelChart steps={funnel} />
      </div>

      {/* Two-column: Drop-offs + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Drop-off */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Field Drop-offs</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Completion rate per field. Red bars indicate fields where more than half of users drop off.
          </p>
          <FieldDropoffChart fields={fields} />
        </div>

        {/* Daily Trend */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Daily Submissions (Last 30 Days)</h3>
          </div>
          <TrendChart trend={trend} />
        </div>
      </div>
    </div>
  )
}
