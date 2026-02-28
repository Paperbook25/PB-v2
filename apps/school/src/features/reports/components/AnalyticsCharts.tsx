import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { chartColors, statusColors } from '@/lib/design-tokens'

const COLORS = chartColors

interface ChartCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ==================== BAR CHART ====================

interface BarChartData {
  label: string
  value: number
  [key: string]: string | number
}

interface SimpleBarChartProps {
  title: string
  data: BarChartData[]
  dataKey?: string
  xKey?: string
  color?: string
  height?: number
  className?: string
  formatValue?: (value: number) => string
}

export function SimpleBarChart({
  title,
  data,
  dataKey = 'value',
  xKey = 'label',
  color = chartColors[0],
  height = 300,
  className,
  formatValue,
}: SimpleBarChartProps) {
  return (
    <ChartCard title={title} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            tickFormatter={formatValue}
          />
          <Tooltip
            formatter={(value: number) => [formatValue ? formatValue(value) : value, '']}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ==================== LINE CHART ====================

interface LineChartData {
  label: string
  value: number
  [key: string]: string | number
}

interface SimpleLineChartProps {
  title: string
  data: LineChartData[]
  dataKey?: string
  xKey?: string
  color?: string
  height?: number
  className?: string
  formatValue?: (value: number) => string
}

export function SimpleLineChart({
  title,
  data,
  dataKey = 'value',
  xKey = 'label',
  color = chartColors[0],
  height = 300,
  className,
  formatValue,
}: SimpleLineChartProps) {
  return (
    <ChartCard title={title} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            tickFormatter={formatValue}
          />
          <Tooltip
            formatter={(value: number) => [formatValue ? formatValue(value) : value, '']}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ==================== AREA CHART ====================

interface AreaChartData {
  label: string
  value: number
  [key: string]: string | number
}

interface SimpleAreaChartProps {
  title: string
  data: AreaChartData[]
  dataKey?: string
  xKey?: string
  color?: string
  height?: number
  className?: string
  formatValue?: (value: number) => string
}

export function SimpleAreaChart({
  title,
  data,
  dataKey = 'value',
  xKey = 'label',
  color = chartColors[0],
  height = 300,
  className,
  formatValue,
}: SimpleAreaChartProps) {
  return (
    <ChartCard title={title} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            tickFormatter={formatValue}
          />
          <Tooltip
            formatter={(value: number) => [formatValue ? formatValue(value) : value, '']}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ==================== PIE CHART ====================

interface PieChartData {
  label: string
  value: number
  percentage: number
  color?: string
}

interface SimplePieChartProps {
  title: string
  data: PieChartData[]
  height?: number
  className?: string
  showLegend?: boolean
}

export function SimplePieChart({
  title,
  data,
  height = 300,
  className,
  showLegend = true,
}: SimplePieChartProps) {
  return (
    <ChartCard title={title} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            nameKey="label"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, entry: { payload?: PieChartData }) => [
              `${value.toLocaleString('en-IN')} (${entry.payload?.percentage?.toFixed(1) ?? 0}%)`,
              name,
            ]}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: 12 }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ==================== COMPARISON BAR CHART ====================

interface ComparisonData {
  label: string
  current: number
  previous: number
}

interface ComparisonBarChartProps {
  title: string
  data: ComparisonData[]
  height?: number
  className?: string
  formatValue?: (value: number) => string
}

export function ComparisonBarChart({
  title,
  data,
  height = 300,
  className,
  formatValue,
}: ComparisonBarChartProps) {
  return (
    <ChartCard title={title} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            tickLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            tickFormatter={formatValue}
          />
          <Tooltip
            formatter={(value: number) => [formatValue ? formatValue(value) : value]}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Legend />
          <Bar dataKey="current" name="Current" fill={chartColors[0]} radius={[4, 4, 0, 0]} />
          <Bar dataKey="previous" name="Previous" fill={statusColors.inactive} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ==================== HORIZONTAL BAR CHART ====================

interface HorizontalBarData {
  label: string
  value: number
  [key: string]: string | number
}

interface HorizontalBarChartProps {
  title: string
  data: HorizontalBarData[]
  dataKey?: string
  height?: number
  className?: string
  formatValue?: (value: number) => string
}

export function HorizontalBarChart({
  title,
  data,
  dataKey = 'value',
  height = 300,
  className,
  formatValue,
}: HorizontalBarChartProps) {
  return (
    <ChartCard title={title} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            tickLine={false}
            className="text-muted-foreground"
            tickFormatter={formatValue}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            width={75}
          />
          <Tooltip
            formatter={(value: number) => [formatValue ? formatValue(value) : value, '']}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Bar dataKey={dataKey} fill={chartColors[0]} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
