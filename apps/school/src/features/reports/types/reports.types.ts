// ==================== REPORT TYPES ====================

export type ReportCategory =
  | 'academic'
  | 'financial'
  | 'attendance'
  | 'library'
  | 'transport'
  | 'staff'
  | 'admission'
  | 'custom'

export type ReportFormat = 'pdf' | 'excel' | 'csv'

export type ReportStatus = 'draft' | 'generating' | 'ready' | 'failed' | 'scheduled'

export type ReportFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'donut' | 'table'

export type AggregationType = 'sum' | 'count' | 'average' | 'min' | 'max'

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'custom'

// ==================== REPORT DEFINITION ====================

export interface ReportField {
  id: string
  name: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean'
  aggregation?: AggregationType
  format?: string
}

export interface ReportFilter {
  field: string
  operator: 'equals' | 'notEquals' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in'
  value: string | number | boolean | string[] | number[]
}

export interface ReportSort {
  field: string
  direction: 'asc' | 'desc'
}

export interface ReportDefinition {
  id: string
  name: string
  description: string
  category: ReportCategory
  fields: ReportField[]
  filters: ReportFilter[]
  sorts: ReportSort[]
  groupBy?: string[]
  chartType?: ChartType
  createdBy: string
  createdAt: string
  updatedAt: string
  isSystem: boolean // System reports vs custom
}

// ==================== GENERATED REPORT ====================

export interface GeneratedReport {
  id: string
  definitionId: string
  name: string
  category: ReportCategory
  status: ReportStatus
  format: ReportFormat
  dateRange: {
    preset: DateRangePreset
    startDate: string
    endDate: string
  }
  generatedBy: string
  generatedAt: string
  fileUrl?: string
  fileSize?: string
  rowCount?: number
  error?: string
  expiresAt: string
}

// ==================== SCHEDULED REPORT ====================

export interface ScheduledReport {
  id: string
  definitionId: string
  reportName: string
  category: ReportCategory
  frequency: ReportFrequency
  format: ReportFormat
  recipients: string[] // email addresses
  nextRunAt: string
  lastRunAt?: string
  lastStatus?: ReportStatus
  isActive: boolean
  createdBy: string
  createdAt: string
}

// ==================== KPI & DASHBOARD ====================

export interface KPIMetric {
  id: string
  name: string
  value: number
  previousValue?: number
  change?: number
  changePercent?: number
  trend: 'up' | 'down' | 'stable'
  unit?: string
  format?: 'number' | 'currency' | 'percent'
  category: ReportCategory
  updatedAt: string
}

export interface DashboardWidget {
  id: string
  title: string
  type: ChartType | 'kpi' | 'list' | 'progress'
  category: ReportCategory
  data: unknown
  config: {
    width: 1 | 2 | 3 | 4
    height: 1 | 2
    colors?: string[]
  }
}

export interface Dashboard {
  id: string
  name: string
  description: string
  widgets: DashboardWidget[]
  isDefault: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

// ==================== ANALYTICS DATA ====================

export interface TrendDataPoint {
  date: string
  value: number
  label?: string
}

export interface ComparisonData {
  label: string
  current: number
  previous: number
  change: number
  changePercent: number
}

export interface DistributionData {
  label: string
  value: number
  percentage: number
  color?: string
}

export interface AnalyticsOverview {
  totalStudents: number
  totalStaff: number
  totalRevenue: number
  pendingFees: number
  attendanceRate: number
  passRate: number
  libraryUtilization: number
  admissionConversion: number
}

export interface AcademicAnalytics {
  overallPassRate: number
  averageScore: number
  topPerformers: { name: string; class: string; percentage: number }[]
  subjectWisePerformance: { subject: string; average: number; passRate: number }[]
  classWisePerformance: { class: string; average: number; passRate: number }[]
  termComparison: ComparisonData[]
  gradeDistribution: DistributionData[]
  trendData: TrendDataPoint[]
}

export interface FinancialAnalytics {
  totalCollection: number
  pendingAmount: number
  collectionRate: number
  monthlyCollection: TrendDataPoint[]
  feeTypeBreakdown: DistributionData[]
  classWiseCollection: { class: string; collected: number; pending: number }[]
  paymentModeDistribution: DistributionData[]
  defaulterCount: number
  concessionAmount: number
}

export interface AttendanceAnalytics {
  overallRate: number
  presentToday: number
  absentToday: number
  monthlyTrend: TrendDataPoint[]
  classWiseAttendance: { class: string; rate: number }[]
  dayWisePattern: { day: string; rate: number }[]
  chronicallyAbsent: number
  lateArrivals: number
}

// ==================== REPORT TEMPLATES ====================

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: ReportCategory
  thumbnail?: string
  fields: string[]
  defaultFilters: ReportFilter[]
  defaultChartType: ChartType
  isPopular: boolean
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface GenerateReportRequest {
  definitionId?: string
  templateId?: string
  name: string
  format: ReportFormat
  dateRange: {
    preset: DateRangePreset
    startDate?: string
    endDate?: string
  }
  filters?: ReportFilter[]
}

export interface CreateScheduledReportRequest {
  definitionId: string
  frequency: ReportFrequency
  format: ReportFormat
  recipients: string[]
  startDate?: string
}

export interface ReportFilters {
  category?: ReportCategory | 'all'
  status?: ReportStatus | 'all'
  search?: string
  page?: number
  limit?: number
}

// ==================== CONSTANTS ====================

export const REPORT_CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'financial', label: 'Financial' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'library', label: 'Library' },
  { value: 'transport', label: 'Transport' },
  { value: 'staff', label: 'Staff' },
  { value: 'admission', label: 'Admission' },
  { value: 'custom', label: 'Custom' },
]

export const REPORT_FORMATS: { value: ReportFormat; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
]

export const REPORT_FREQUENCIES: { value: ReportFrequency; label: string }[] = [
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisQuarter', label: 'This Quarter' },
  { value: 'lastQuarter', label: 'Last Quarter' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
]

export const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'donut', label: 'Donut Chart' },
  { value: 'table', label: 'Table' },
]

// ==================== CUSTOM REPORT BUILDER ====================

export type ReportBuilderFieldType = 'dimension' | 'measure' | 'filter' | 'calculated'

export type ReportBuilderOperator =
  | 'sum'
  | 'count'
  | 'avg'
  | 'min'
  | 'max'
  | 'countDistinct'
  | 'none'

export interface ReportBuilderField {
  id: string
  name: string
  label: string
  sourceTable: string
  sourceColumn: string
  dataType: 'string' | 'number' | 'date' | 'boolean'
  fieldType: ReportBuilderFieldType
  operator?: ReportBuilderOperator
  format?: string
  isRequired: boolean
  order: number
}

export interface ReportBuilderCalculation {
  id: string
  name: string
  formula: string
  resultType: 'number' | 'string' | 'date'
  description?: string
}

export interface ReportLayout {
  id: string
  name: string
  orientation: 'portrait' | 'landscape'
  pageSize: 'a4' | 'letter' | 'legal'
  margins: { top: number; right: number; bottom: number; left: number }
  headerHtml?: string
  footerHtml?: string
  showPageNumbers: boolean
  showGeneratedDate: boolean
}

export interface ReportBuilder {
  id: string
  name: string
  description: string
  category: ReportCategory
  dataSources: string[]
  selectedFields: ReportBuilderField[]
  calculations: ReportBuilderCalculation[]
  filters: ReportFilter[]
  sorts: ReportSort[]
  groupBy: string[]
  layout: ReportLayout
  chartConfig?: ChartConfig
  previewData?: unknown[]
  createdBy: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'published'
}

export interface CreateReportBuilderRequest {
  name: string
  description: string
  category: ReportCategory
  dataSources: string[]
  selectedFields: Omit<ReportBuilderField, 'id'>[]
  calculations?: Omit<ReportBuilderCalculation, 'id'>[]
  filters?: ReportFilter[]
  sorts?: ReportSort[]
  groupBy?: string[]
  layout?: Partial<ReportLayout>
  chartConfig?: Partial<ChartConfig>
}

export interface UpdateReportBuilderRequest extends Partial<CreateReportBuilderRequest> {
  status?: 'draft' | 'published'
}

export interface AvailableDataSource {
  id: string
  name: string
  label: string
  description: string
  availableFields: Omit<ReportBuilderField, 'id' | 'order'>[]
  category: ReportCategory
}

// ==================== DASHBOARD DESIGNER ====================

export type WidgetType =
  | 'kpi'
  | 'chart'
  | 'table'
  | 'list'
  | 'progress'
  | 'gauge'
  | 'map'
  | 'calendar'
  | 'text'

export type WidgetSize = 'small' | 'medium' | 'large' | 'full'

export interface WidgetPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface WidgetDataBinding {
  sourceType: 'api' | 'report' | 'static'
  sourceId?: string
  endpoint?: string
  refreshInterval?: number // seconds, 0 = manual only
  transformFunction?: string
}

export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  subtitle?: string
  position: WidgetPosition
  dataBinding: WidgetDataBinding
  chartType?: ChartType
  colors?: string[]
  thresholds?: { value: number; color: string; label?: string }[]
  showLegend?: boolean
  showLabels?: boolean
  animate?: boolean
  drillDownReportId?: string
}

export interface Widget {
  id: string
  config: WidgetConfig
  data: unknown
  lastUpdated: string
  error?: string
  isLoading: boolean
}

export interface DashboardDesigner {
  id: string
  name: string
  description: string
  layout: 'grid' | 'freeform'
  gridColumns: number
  gridRows: number
  widgets: Widget[]
  theme: 'light' | 'dark' | 'system'
  refreshInterval: number // global refresh in seconds
  isPublic: boolean
  sharedWith: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateDashboardDesignerRequest {
  name: string
  description: string
  layout?: 'grid' | 'freeform'
  gridColumns?: number
  gridRows?: number
  theme?: 'light' | 'dark' | 'system'
  isPublic?: boolean
}

export interface UpdateDashboardDesignerRequest extends Partial<CreateDashboardDesignerRequest> {
  widgets?: Omit<Widget, 'data' | 'lastUpdated' | 'error' | 'isLoading'>[]
  sharedWith?: string[]
}

export interface AddWidgetRequest {
  dashboardId: string
  config: Omit<WidgetConfig, 'id'>
}

export interface UpdateWidgetRequest {
  dashboardId: string
  widgetId: string
  config: Partial<WidgetConfig>
}

// ==================== PREDICTIVE ANALYTICS ====================

export type PredictiveModelType =
  | 'enrollment_forecast'
  | 'fee_collection'
  | 'attendance_prediction'
  | 'academic_performance'
  | 'dropout_risk'
  | 'resource_demand'

export type ModelStatus = 'training' | 'ready' | 'failed' | 'outdated'

export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very_high'

export interface ModelFeature {
  name: string
  importance: number
  description: string
}

export interface PredictiveModel {
  id: string
  name: string
  type: PredictiveModelType
  description: string
  status: ModelStatus
  accuracy: number
  lastTrainedAt: string
  trainingDataRange: { startDate: string; endDate: string }
  features: ModelFeature[]
  version: string
  createdBy: string
  createdAt: string
}

export interface Prediction {
  id: string
  modelId: string
  modelName: string
  targetEntity: string
  targetId?: string
  predictedValue: number
  confidenceLevel: ConfidenceLevel
  confidenceScore: number
  factors: { name: string; impact: number; direction: 'positive' | 'negative' }[]
  recommendations?: string[]
  generatedAt: string
  validUntil: string
}

export interface Forecast {
  id: string
  modelId: string
  modelName: string
  type: PredictiveModelType
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  dataPoints: ForecastDataPoint[]
  aggregatePrediction: number
  confidenceLevel: ConfidenceLevel
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  seasonalityDetected: boolean
  generatedAt: string
}

export interface ForecastDataPoint {
  date: string
  predictedValue: number
  lowerBound: number
  upperBound: number
  actualValue?: number
}

export interface GeneratePredictionRequest {
  modelId: string
  targetEntity: string
  targetId?: string
  parameters?: Record<string, unknown>
}

export interface GenerateForecastRequest {
  modelId: string
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  includeConfidenceIntervals?: boolean
}

export interface TrainModelRequest {
  modelId: string
  trainingDataRange?: { startDate: string; endDate: string }
  features?: string[]
}

// ==================== COMPARATIVE BENCHMARKING ====================

export type BenchmarkCategory =
  | 'academic'
  | 'financial'
  | 'operational'
  | 'enrollment'
  | 'staff'

export type BenchmarkScope = 'internal' | 'regional' | 'national' | 'custom'

export interface ComparisonMetric {
  id: string
  name: string
  description: string
  category: BenchmarkCategory
  unit: string
  format: 'number' | 'percent' | 'currency' | 'ratio'
  higherIsBetter: boolean
  industryStandard?: number
  topPerformerValue?: number
}

export interface PeerGroup {
  id: string
  name: string
  description: string
  criteria: PeerGroupCriteria
  memberCount: number
  createdBy: string
  createdAt: string
  isPublic: boolean
}

export interface PeerGroupCriteria {
  schoolType?: string[]
  boardAffiliation?: string[]
  studentCountRange?: { min: number; max: number }
  location?: { state?: string[]; city?: string[] }
  feesRange?: { min: number; max: number }
  establishedYearRange?: { min: number; max: number }
}

export interface Benchmark {
  id: string
  name: string
  description: string
  category: BenchmarkCategory
  scope: BenchmarkScope
  peerGroupId?: string
  metrics: BenchmarkMetricValue[]
  period: { startDate: string; endDate: string }
  participantCount: number
  lastUpdated: string
  createdBy: string
  createdAt: string
}

export interface BenchmarkMetricValue {
  metricId: string
  metricName: string
  yourValue: number
  peerAverage: number
  peerMedian: number
  peerMin: number
  peerMax: number
  percentileRank: number
  trend: 'improving' | 'declining' | 'stable'
  gap: number
  gapPercent: number
}

export interface BenchmarkComparison {
  benchmarkId: string
  benchmarkName: string
  comparedAt: string
  overallRank: number
  totalParticipants: number
  strengths: { metricName: string; percentileRank: number }[]
  improvements: { metricName: string; percentileRank: number; targetValue: number }[]
  recommendations: string[]
}

export interface CreateBenchmarkRequest {
  name: string
  description: string
  category: BenchmarkCategory
  scope: BenchmarkScope
  peerGroupId?: string
  metricIds: string[]
  period: { startDate: string; endDate: string }
}

export interface CreatePeerGroupRequest {
  name: string
  description: string
  criteria: PeerGroupCriteria
  isPublic?: boolean
}

// ==================== DATA VISUALIZATION LIBRARY ====================

export type VisualizationType =
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'bubble'
  | 'radar'
  | 'heatmap'
  | 'treemap'
  | 'funnel'
  | 'waterfall'
  | 'gauge'
  | 'sankey'
  | 'candlestick'
  | 'boxplot'

export type ColorPalette =
  | 'default'
  | 'vibrant'
  | 'pastel'
  | 'monochrome'
  | 'semantic'
  | 'accessible'
  | 'custom'

export interface ChartAxis {
  label?: string
  min?: number
  max?: number
  tickFormat?: string
  gridLines?: boolean
  position?: 'left' | 'right' | 'top' | 'bottom'
}

export interface ChartLegend {
  show: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
  orientation: 'horizontal' | 'vertical'
}

export interface ChartTooltip {
  enabled: boolean
  format?: string
  showSeriesName?: boolean
  showValue?: boolean
  showPercentage?: boolean
}

export interface ChartConfig {
  id: string
  type: VisualizationType
  title: string
  subtitle?: string
  xAxis?: ChartAxis
  yAxis?: ChartAxis
  legend: ChartLegend
  tooltip: ChartTooltip
  colorPalette: ColorPalette
  customColors?: string[]
  stacked?: boolean
  showValues?: boolean
  showTrend?: boolean
  animate?: boolean
  responsive?: boolean
  aspectRatio?: number
}

export interface DataSource {
  id: string
  name: string
  type: 'api' | 'database' | 'file' | 'manual'
  connectionString?: string
  endpoint?: string
  query?: string
  refreshSchedule?: string
  lastRefreshed?: string
  schema: DataSourceField[]
  sampleData?: unknown[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface DataSourceField {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object'
  nullable: boolean
  description?: string
}

export interface Visualization {
  id: string
  name: string
  description: string
  chartConfig: ChartConfig
  dataSourceId: string
  dataTransform?: DataTransform
  filters?: ReportFilter[]
  createdBy: string
  createdAt: string
  updatedAt: string
  isPublic: boolean
  tags: string[]
}

export interface DataTransform {
  groupBy?: string[]
  aggregations?: { field: string; operation: AggregationType; alias?: string }[]
  calculations?: { name: string; formula: string }[]
  pivotField?: string
  pivotValues?: string[]
  sortBy?: { field: string; direction: 'asc' | 'desc' }[]
  limit?: number
}

export interface CreateVisualizationRequest {
  name: string
  description: string
  chartConfig: Omit<ChartConfig, 'id'>
  dataSourceId: string
  dataTransform?: DataTransform
  filters?: ReportFilter[]
  isPublic?: boolean
  tags?: string[]
}

export interface UpdateVisualizationRequest extends Partial<CreateVisualizationRequest> {}

export interface VisualizationTemplate {
  id: string
  name: string
  description: string
  thumbnail: string
  chartConfig: Omit<ChartConfig, 'id'>
  sampleDataStructure: DataSourceField[]
  category: string
  isPopular: boolean
}

// ==================== REPORT SHARING ====================

export type SharePermission = 'view' | 'comment' | 'edit' | 'admin'

export type ExternalAccessType = 'link' | 'email' | 'embed' | 'api'

export type ShareStatus = 'active' | 'expired' | 'revoked'

export interface ShareRecipient {
  id: string
  type: 'user' | 'role' | 'email' | 'external'
  identifier: string
  name?: string
  permission: SharePermission
  addedAt: string
  addedBy: string
  lastAccessedAt?: string
}

export interface ExternalAccess {
  id: string
  type: ExternalAccessType
  accessUrl: string
  accessToken?: string
  password?: string
  expiresAt?: string
  maxViews?: number
  currentViews: number
  allowDownload: boolean
  allowPrint: boolean
  watermark?: string
  ipRestrictions?: string[]
  status: ShareStatus
  createdAt: string
  createdBy: string
}

export interface SharedReport {
  id: string
  reportType: 'generated' | 'builder' | 'dashboard' | 'visualization'
  reportId: string
  reportName: string
  description?: string
  recipients: ShareRecipient[]
  externalAccess?: ExternalAccess[]
  notifyOnView: boolean
  notifyOnComment: boolean
  comments: ShareComment[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ShareComment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
  updatedAt?: string
  parentCommentId?: string
  resolved: boolean
}

export interface CreateSharedReportRequest {
  reportType: 'generated' | 'builder' | 'dashboard' | 'visualization'
  reportId: string
  description?: string
  recipients?: Omit<ShareRecipient, 'id' | 'addedAt' | 'addedBy' | 'lastAccessedAt'>[]
  notifyOnView?: boolean
  notifyOnComment?: boolean
}

export interface CreateExternalAccessRequest {
  sharedReportId: string
  type: ExternalAccessType
  expiresAt?: string
  maxViews?: number
  password?: string
  allowDownload?: boolean
  allowPrint?: boolean
  watermark?: string
  ipRestrictions?: string[]
}

export interface AddRecipientRequest {
  sharedReportId: string
  type: 'user' | 'role' | 'email' | 'external'
  identifier: string
  name?: string
  permission: SharePermission
}

export interface AddCommentRequest {
  sharedReportId: string
  content: string
  parentCommentId?: string
}

export interface ShareAnalytics {
  sharedReportId: string
  totalViews: number
  uniqueViewers: number
  viewsByDate: { date: string; views: number }[]
  viewsByRecipient: { recipientId: string; recipientName: string; views: number }[]
  downloadCount: number
  printCount: number
  averageViewDuration: number
  lastViewedAt?: string
}

// ==================== REPORT BUILDER CONSTANTS ====================

export const REPORT_BUILDER_FIELD_TYPES: { value: ReportBuilderFieldType; label: string }[] = [
  { value: 'dimension', label: 'Dimension' },
  { value: 'measure', label: 'Measure' },
  { value: 'filter', label: 'Filter' },
  { value: 'calculated', label: 'Calculated' },
]

export const REPORT_BUILDER_OPERATORS: { value: ReportBuilderOperator; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sum', label: 'Sum' },
  { value: 'count', label: 'Count' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
  { value: 'countDistinct', label: 'Count Distinct' },
]

export const WIDGET_TYPES: { value: WidgetType; label: string }[] = [
  { value: 'kpi', label: 'KPI Card' },
  { value: 'chart', label: 'Chart' },
  { value: 'table', label: 'Data Table' },
  { value: 'list', label: 'List' },
  { value: 'progress', label: 'Progress Bar' },
  { value: 'gauge', label: 'Gauge' },
  { value: 'map', label: 'Map' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'text', label: 'Text Block' },
]

export const VISUALIZATION_TYPES: { value: VisualizationType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'donut', label: 'Donut Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'bubble', label: 'Bubble Chart' },
  { value: 'radar', label: 'Radar Chart' },
  { value: 'heatmap', label: 'Heat Map' },
  { value: 'treemap', label: 'Tree Map' },
  { value: 'funnel', label: 'Funnel Chart' },
  { value: 'waterfall', label: 'Waterfall Chart' },
  { value: 'gauge', label: 'Gauge Chart' },
  { value: 'sankey', label: 'Sankey Diagram' },
  { value: 'candlestick', label: 'Candlestick Chart' },
  { value: 'boxplot', label: 'Box Plot' },
]

export const COLOR_PALETTES: { value: ColorPalette; label: string; colors: string[] }[] = [
  { value: 'default', label: 'Default', colors: ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'] },
  { value: 'vibrant', label: 'Vibrant', colors: ['#f43f5e', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#6366f1'] },
  { value: 'pastel', label: 'Pastel', colors: ['#fca5a5', '#c4b5fd', '#a5f3fc', '#bbf7d0', '#fde68a', '#fecdd3'] },
  { value: 'monochrome', label: 'Monochrome', colors: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'] },
  { value: 'semantic', label: 'Semantic', colors: ['#22c55e', '#ef4444', '#eab308', '#3b82f6', '#6b7280', '#8b5cf6'] },
  { value: 'accessible', label: 'Accessible', colors: ['#0072B2', '#E69F00', '#009E73', '#D55E00', '#CC79A7', '#56B4E9'] },
  { value: 'custom', label: 'Custom', colors: [] },
]

export const SHARE_PERMISSIONS: { value: SharePermission; label: string; description: string }[] = [
  { value: 'view', label: 'View', description: 'Can view the report' },
  { value: 'comment', label: 'Comment', description: 'Can view and add comments' },
  { value: 'edit', label: 'Edit', description: 'Can view, comment, and edit' },
  { value: 'admin', label: 'Admin', description: 'Full access including sharing' },
]

export const PREDICTIVE_MODEL_TYPES: { value: PredictiveModelType; label: string; description: string }[] = [
  { value: 'enrollment_forecast', label: 'Enrollment Forecast', description: 'Predict future enrollment numbers' },
  { value: 'fee_collection', label: 'Fee Collection', description: 'Forecast fee collection patterns' },
  { value: 'attendance_prediction', label: 'Attendance Prediction', description: 'Predict attendance trends' },
  { value: 'academic_performance', label: 'Academic Performance', description: 'Predict student performance' },
  { value: 'dropout_risk', label: 'Dropout Risk', description: 'Identify students at risk of dropping out' },
  { value: 'resource_demand', label: 'Resource Demand', description: 'Forecast resource requirements' },
]

export const BENCHMARK_CATEGORIES: { value: BenchmarkCategory; label: string }[] = [
  { value: 'academic', label: 'Academic Performance' },
  { value: 'financial', label: 'Financial Metrics' },
  { value: 'operational', label: 'Operational Efficiency' },
  { value: 'enrollment', label: 'Enrollment & Retention' },
  { value: 'staff', label: 'Staff Metrics' },
]

export const BENCHMARK_SCOPES: { value: BenchmarkScope; label: string }[] = [
  { value: 'internal', label: 'Internal (Year-over-Year)' },
  { value: 'regional', label: 'Regional Comparison' },
  { value: 'national', label: 'National Benchmark' },
  { value: 'custom', label: 'Custom Peer Group' },
]
