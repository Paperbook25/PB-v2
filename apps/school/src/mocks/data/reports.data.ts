import { faker } from '@faker-js/faker'
import type {
  ReportDefinition,
  GeneratedReport,
  ScheduledReport,
  ReportTemplate,
  KPIMetric,
  Dashboard,
  DashboardWidget,
  AnalyticsOverview,
  AcademicAnalytics,
  FinancialAnalytics,
  AttendanceAnalytics,
  TrendDataPoint,
  DistributionData,
  ReportCategory,
  ReportStatus,
  ReportFormat,
  ChartType,
} from '@/features/reports/types/reports.types'

// ==================== HELPERS ====================

function generateId(): string {
  return faker.string.uuid()
}

function getRandomCategory(): ReportCategory {
  return faker.helpers.arrayElement([
    'academic',
    'financial',
    'attendance',
    'library',
    'transport',
    'staff',
    'admission',
  ])
}

function generateTrendData(days: number): TrendDataPoint[] {
  const data: TrendDataPoint[] = []
  const baseValue = faker.number.int({ min: 50, max: 100 })

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      value: baseValue + faker.number.int({ min: -15, max: 15 }),
    })
  }
  return data
}

function generateMonthlyTrendData(months: number): TrendDataPoint[] {
  const data: TrendDataPoint[] = []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      value: faker.number.int({ min: 100000, max: 500000 }),
      label: monthNames[date.getMonth()],
    })
  }
  return data
}

// ==================== REPORT TEMPLATES ====================

export const reportTemplates: ReportTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Student Performance Report',
    description: 'Comprehensive report of student academic performance across all subjects',
    category: 'academic',
    fields: ['studentName', 'class', 'section', 'subjects', 'totalMarks', 'percentage', 'grade', 'rank'],
    defaultFilters: [],
    defaultChartType: 'bar',
    isPopular: true,
  },
  {
    id: 'tpl-2',
    name: 'Fee Collection Summary',
    description: 'Summary of fee collection with pending amounts and payment modes',
    category: 'financial',
    fields: ['class', 'totalStudents', 'totalFees', 'collected', 'pending', 'collectionRate'],
    defaultFilters: [],
    defaultChartType: 'bar',
    isPopular: true,
  },
  {
    id: 'tpl-3',
    name: 'Attendance Analysis',
    description: 'Daily and monthly attendance analysis by class and section',
    category: 'attendance',
    fields: ['class', 'section', 'totalStudents', 'present', 'absent', 'attendanceRate'],
    defaultFilters: [],
    defaultChartType: 'line',
    isPopular: true,
  },
  {
    id: 'tpl-4',
    name: 'Library Usage Report',
    description: 'Book circulation statistics and library usage patterns',
    category: 'library',
    fields: ['totalBooks', 'issuedBooks', 'overdueBooks', 'popularBooks', 'activeReaders'],
    defaultFilters: [],
    defaultChartType: 'pie',
    isPopular: false,
  },
  {
    id: 'tpl-5',
    name: 'Transport Route Analysis',
    description: 'Route efficiency, vehicle utilization, and student distribution',
    category: 'transport',
    fields: ['routeName', 'vehicleNumber', 'capacity', 'occupied', 'stops', 'distance'],
    defaultFilters: [],
    defaultChartType: 'bar',
    isPopular: false,
  },
  {
    id: 'tpl-6',
    name: 'Staff Attendance & Leave',
    description: 'Staff attendance patterns and leave utilization',
    category: 'staff',
    fields: ['staffName', 'department', 'designation', 'workingDays', 'leaves', 'attendanceRate'],
    defaultFilters: [],
    defaultChartType: 'table',
    isPopular: false,
  },
  {
    id: 'tpl-7',
    name: 'Admission Funnel Report',
    description: 'Admission pipeline analysis from inquiry to enrollment',
    category: 'admission',
    fields: ['stage', 'count', 'conversionRate', 'avgDaysInStage'],
    defaultFilters: [],
    defaultChartType: 'bar',
    isPopular: true,
  },
  {
    id: 'tpl-8',
    name: 'Exam Results Analysis',
    description: 'Detailed exam results with subject-wise breakdown',
    category: 'academic',
    fields: ['examName', 'class', 'subject', 'totalStudents', 'passed', 'failed', 'average', 'highest', 'lowest'],
    defaultFilters: [],
    defaultChartType: 'bar',
    isPopular: true,
  },
  {
    id: 'tpl-9',
    name: 'Fee Defaulters List',
    description: 'List of students with pending fees beyond due date',
    category: 'financial',
    fields: ['studentName', 'class', 'feeType', 'dueDate', 'pendingAmount', 'daysOverdue'],
    defaultFilters: [],
    defaultChartType: 'table',
    isPopular: true,
  },
  {
    id: 'tpl-10',
    name: 'Class Wise Strength',
    description: 'Student strength distribution across classes and sections',
    category: 'academic',
    fields: ['class', 'section', 'boys', 'girls', 'total', 'capacity', 'vacancy'],
    defaultFilters: [],
    defaultChartType: 'bar',
    isPopular: false,
  },
]

// ==================== REPORT DEFINITIONS ====================

export const reportDefinitions: ReportDefinition[] = reportTemplates.map((tpl, index) => ({
  id: `def-${index + 1}`,
  name: tpl.name,
  description: tpl.description,
  category: tpl.category,
  fields: tpl.fields.map((f) => ({
    id: f,
    name: f,
    label: f.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
    type: f.includes('amount') || f.includes('total') || f.includes('count') ? 'number' : 'string',
  })),
  filters: tpl.defaultFilters,
  sorts: [],
  chartType: tpl.defaultChartType,
  createdBy: 'System',
  createdAt: faker.date.past({ years: 1 }).toISOString(),
  updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  isSystem: true,
}))

// ==================== GENERATED REPORTS ====================

function createGeneratedReport(index: number): GeneratedReport {
  const definition = faker.helpers.arrayElement(reportDefinitions)
  const status = faker.helpers.arrayElement(['ready', 'ready', 'ready', 'generating', 'failed']) as ReportStatus
  const format = faker.helpers.arrayElement(['pdf', 'excel', 'csv']) as ReportFormat

  const generatedAt = faker.date.recent({ days: 30 })
  const expiresAt = new Date(generatedAt)
  expiresAt.setDate(expiresAt.getDate() + 7)

  return {
    id: generateId(),
    definitionId: definition.id,
    name: definition.name,
    category: definition.category,
    status,
    format,
    dateRange: {
      preset: faker.helpers.arrayElement(['thisMonth', 'lastMonth', 'thisQuarter', 'last30days']),
      startDate: faker.date.recent({ days: 60 }).toISOString(),
      endDate: faker.date.recent({ days: 1 }).toISOString(),
    },
    generatedBy: faker.person.fullName(),
    generatedAt: generatedAt.toISOString(),
    fileUrl: status === 'ready' ? `/reports/download/${generateId()}.${format}` : undefined,
    fileSize: status === 'ready' ? `${faker.number.int({ min: 50, max: 500 })} KB` : undefined,
    rowCount: status === 'ready' ? faker.number.int({ min: 50, max: 1000 }) : undefined,
    error: status === 'failed' ? 'Report generation timed out' : undefined,
    expiresAt: expiresAt.toISOString(),
  }
}

export const generatedReports: GeneratedReport[] = Array.from({ length: 25 }, (_, i) =>
  createGeneratedReport(i)
)

// ==================== SCHEDULED REPORTS ====================

function createScheduledReport(index: number): ScheduledReport {
  const definition = faker.helpers.arrayElement(reportDefinitions)
  const frequency = faker.helpers.arrayElement(['daily', 'weekly', 'monthly']) as ScheduledReport['frequency']

  const nextRun = new Date()
  if (frequency === 'daily') nextRun.setDate(nextRun.getDate() + 1)
  else if (frequency === 'weekly') nextRun.setDate(nextRun.getDate() + 7)
  else nextRun.setMonth(nextRun.getMonth() + 1)

  return {
    id: generateId(),
    definitionId: definition.id,
    reportName: definition.name,
    category: definition.category,
    frequency,
    format: faker.helpers.arrayElement(['pdf', 'excel']) as ReportFormat,
    recipients: [faker.internet.email(), faker.internet.email()],
    nextRunAt: nextRun.toISOString(),
    lastRunAt: faker.date.recent({ days: 7 }).toISOString(),
    lastStatus: 'ready',
    isActive: faker.datatype.boolean({ probability: 0.8 }),
    createdBy: faker.person.fullName(),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  }
}

export const scheduledReports: ScheduledReport[] = Array.from({ length: 10 }, (_, i) =>
  createScheduledReport(i)
)

// ==================== KPI METRICS ====================

export const kpiMetrics: KPIMetric[] = [
  {
    id: 'kpi-1',
    name: 'Total Students',
    value: 1245,
    previousValue: 1180,
    change: 65,
    changePercent: 5.5,
    trend: 'up',
    format: 'number',
    category: 'academic',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kpi-2',
    name: 'Fee Collection',
    value: 4525000,
    previousValue: 4200000,
    change: 325000,
    changePercent: 7.7,
    trend: 'up',
    unit: 'INR',
    format: 'currency',
    category: 'financial',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kpi-3',
    name: 'Attendance Rate',
    value: 92.5,
    previousValue: 91.2,
    change: 1.3,
    changePercent: 1.4,
    trend: 'up',
    unit: '%',
    format: 'percent',
    category: 'attendance',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kpi-4',
    name: 'Pending Fees',
    value: 875000,
    previousValue: 950000,
    change: -75000,
    changePercent: -7.9,
    trend: 'down',
    unit: 'INR',
    format: 'currency',
    category: 'financial',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kpi-5',
    name: 'Pass Rate',
    value: 94.2,
    previousValue: 92.8,
    change: 1.4,
    changePercent: 1.5,
    trend: 'up',
    unit: '%',
    format: 'percent',
    category: 'academic',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kpi-6',
    name: 'New Admissions',
    value: 156,
    previousValue: 142,
    change: 14,
    changePercent: 9.9,
    trend: 'up',
    format: 'number',
    category: 'admission',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kpi-7',
    name: 'Library Books Issued',
    value: 324,
    previousValue: 298,
    change: 26,
    changePercent: 8.7,
    trend: 'up',
    format: 'number',
    category: 'library',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kpi-8',
    name: 'Staff Attendance',
    value: 96.8,
    previousValue: 97.1,
    change: -0.3,
    changePercent: -0.3,
    trend: 'stable',
    unit: '%',
    format: 'percent',
    category: 'staff',
    updatedAt: new Date().toISOString(),
  },
]

// ==================== ANALYTICS DATA ====================

export function getAnalyticsOverview(): AnalyticsOverview {
  return {
    totalStudents: 1245,
    totalStaff: 85,
    totalRevenue: 4525000,
    pendingFees: 875000,
    attendanceRate: 92.5,
    passRate: 94.2,
    libraryUtilization: 78.5,
    admissionConversion: 68.2,
  }
}

export function getAcademicAnalytics(): AcademicAnalytics {
  return {
    overallPassRate: 94.2,
    averageScore: 72.5,
    topPerformers: [
      { name: 'Priya Sharma', class: '10-A', percentage: 98.5 },
      { name: 'Rahul Verma', class: '10-B', percentage: 97.2 },
      { name: 'Ananya Gupta', class: '12-A', percentage: 96.8 },
      { name: 'Vikram Singh', class: '10-A', percentage: 96.5 },
      { name: 'Sneha Patel', class: '12-B', percentage: 95.9 },
    ],
    subjectWisePerformance: [
      { subject: 'Mathematics', average: 68.5, passRate: 89.2 },
      { subject: 'English', average: 75.2, passRate: 96.5 },
      { subject: 'Science', average: 71.8, passRate: 92.1 },
      { subject: 'Social Studies', average: 78.4, passRate: 97.8 },
      { subject: 'Hindi', average: 82.1, passRate: 98.2 },
      { subject: 'Computer Science', average: 74.6, passRate: 94.5 },
    ],
    classWisePerformance: [
      { class: 'Class 1', average: 85.2, passRate: 99.5 },
      { class: 'Class 2', average: 83.8, passRate: 99.2 },
      { class: 'Class 3', average: 81.5, passRate: 98.8 },
      { class: 'Class 4', average: 79.2, passRate: 98.1 },
      { class: 'Class 5', average: 76.8, passRate: 97.5 },
      { class: 'Class 6', average: 74.5, passRate: 96.2 },
      { class: 'Class 7', average: 72.1, passRate: 95.1 },
      { class: 'Class 8', average: 70.8, passRate: 93.8 },
      { class: 'Class 9', average: 68.5, passRate: 91.2 },
      { class: 'Class 10', average: 72.4, passRate: 94.5 },
      { class: 'Class 11', average: 69.2, passRate: 90.8 },
      { class: 'Class 12', average: 74.1, passRate: 95.2 },
    ],
    termComparison: [
      { label: 'Term 1', current: 72.5, previous: 70.2, change: 2.3, changePercent: 3.3 },
      { label: 'Term 2', current: 74.8, previous: 71.5, change: 3.3, changePercent: 4.6 },
    ],
    gradeDistribution: [
      { label: 'A+ (90-100)', value: 125, percentage: 10.0, color: '#22c55e' },
      { label: 'A (80-89)', value: 245, percentage: 19.7, color: '#84cc16' },
      { label: 'B+ (70-79)', value: 312, percentage: 25.1, color: '#eab308' },
      { label: 'B (60-69)', value: 285, percentage: 22.9, color: '#f97316' },
      { label: 'C (50-59)', value: 198, percentage: 15.9, color: '#ef4444' },
      { label: 'Below 50', value: 80, percentage: 6.4, color: '#dc2626' },
    ],
    trendData: generateTrendData(30),
  }
}

export function getFinancialAnalytics(): FinancialAnalytics {
  return {
    totalCollection: 4525000,
    pendingAmount: 875000,
    collectionRate: 83.8,
    monthlyCollection: generateMonthlyTrendData(12),
    feeTypeBreakdown: [
      { label: 'Tuition Fee', value: 2850000, percentage: 63.0, color: '#3b82f6' },
      { label: 'Transport Fee', value: 650000, percentage: 14.4, color: '#22c55e' },
      { label: 'Activity Fee', value: 425000, percentage: 9.4, color: '#eab308' },
      { label: 'Lab Fee', value: 350000, percentage: 7.7, color: '#ef4444' },
      { label: 'Library Fee', value: 150000, percentage: 3.3, color: '#8b5cf6' },
      { label: 'Other', value: 100000, percentage: 2.2, color: '#6b7280' },
    ],
    classWiseCollection: [
      { class: 'Class 1-5', collected: 1250000, pending: 180000 },
      { class: 'Class 6-8', collected: 1450000, pending: 220000 },
      { class: 'Class 9-10', collected: 1125000, pending: 275000 },
      { class: 'Class 11-12', collected: 700000, pending: 200000 },
    ],
    paymentModeDistribution: [
      { label: 'Online', value: 2850000, percentage: 63.0, color: '#3b82f6' },
      { label: 'Cash', value: 950000, percentage: 21.0, color: '#22c55e' },
      { label: 'Cheque', value: 525000, percentage: 11.6, color: '#eab308' },
      { label: 'Bank Transfer', value: 200000, percentage: 4.4, color: '#8b5cf6' },
    ],
    defaulterCount: 145,
    concessionAmount: 325000,
  }
}

export function getAttendanceAnalytics(): AttendanceAnalytics {
  return {
    overallRate: 92.5,
    presentToday: 1152,
    absentToday: 93,
    monthlyTrend: [
      { date: '2024-01', value: 91.2, label: 'Jan' },
      { date: '2024-02', value: 92.5, label: 'Feb' },
      { date: '2024-03', value: 90.8, label: 'Mar' },
      { date: '2024-04', value: 88.5, label: 'Apr' },
      { date: '2024-05', value: 85.2, label: 'May' },
      { date: '2024-06', value: 0, label: 'Jun' }, // Summer break
      { date: '2024-07', value: 93.1, label: 'Jul' },
      { date: '2024-08', value: 94.2, label: 'Aug' },
      { date: '2024-09', value: 92.8, label: 'Sep' },
      { date: '2024-10', value: 91.5, label: 'Oct' },
      { date: '2024-11', value: 93.2, label: 'Nov' },
      { date: '2024-12', value: 92.5, label: 'Dec' },
    ],
    classWiseAttendance: [
      { class: 'Class 1', rate: 95.2 },
      { class: 'Class 2', rate: 94.8 },
      { class: 'Class 3', rate: 94.1 },
      { class: 'Class 4', rate: 93.5 },
      { class: 'Class 5', rate: 93.2 },
      { class: 'Class 6', rate: 92.8 },
      { class: 'Class 7', rate: 92.1 },
      { class: 'Class 8', rate: 91.5 },
      { class: 'Class 9', rate: 90.2 },
      { class: 'Class 10', rate: 91.8 },
      { class: 'Class 11', rate: 89.5 },
      { class: 'Class 12', rate: 92.5 },
    ],
    dayWisePattern: [
      { day: 'Monday', rate: 94.2 },
      { day: 'Tuesday', rate: 93.8 },
      { day: 'Wednesday', rate: 93.5 },
      { day: 'Thursday', rate: 92.1 },
      { day: 'Friday', rate: 90.8 },
      { day: 'Saturday', rate: 88.5 },
    ],
    chronicallyAbsent: 28,
    lateArrivals: 45,
  }
}

// ==================== DASHBOARD ====================

const academicWidgets: DashboardWidget[] = [
  {
    id: 'w-1',
    title: 'Overall Pass Rate',
    type: 'kpi',
    category: 'academic',
    data: { value: 94.2, change: 1.4, trend: 'up' },
    config: { width: 1, height: 1 },
  },
  {
    id: 'w-2',
    title: 'Grade Distribution',
    type: 'pie',
    category: 'academic',
    data: getAcademicAnalytics().gradeDistribution,
    config: { width: 2, height: 2 },
  },
  {
    id: 'w-3',
    title: 'Subject Performance',
    type: 'bar',
    category: 'academic',
    data: getAcademicAnalytics().subjectWisePerformance,
    config: { width: 2, height: 2 },
  },
]

const financialWidgets: DashboardWidget[] = [
  {
    id: 'w-4',
    title: 'Collection Rate',
    type: 'kpi',
    category: 'financial',
    data: { value: 83.8, change: 2.1, trend: 'up' },
    config: { width: 1, height: 1 },
  },
  {
    id: 'w-5',
    title: 'Monthly Collection Trend',
    type: 'area',
    category: 'financial',
    data: getFinancialAnalytics().monthlyCollection,
    config: { width: 3, height: 2 },
  },
  {
    id: 'w-6',
    title: 'Fee Type Breakdown',
    type: 'donut',
    category: 'financial',
    data: getFinancialAnalytics().feeTypeBreakdown,
    config: { width: 2, height: 2 },
  },
]

export const dashboards: Dashboard[] = [
  {
    id: 'dash-1',
    name: 'Executive Dashboard',
    description: 'High-level overview for school administrators',
    widgets: [...academicWidgets.slice(0, 2), ...financialWidgets.slice(0, 2)],
    isDefault: true,
    createdBy: 'System',
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 7 }).toISOString(),
  },
  {
    id: 'dash-2',
    name: 'Academic Analytics',
    description: 'Detailed academic performance metrics',
    widgets: academicWidgets,
    isDefault: false,
    createdBy: 'Admin',
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 14 }).toISOString(),
  },
  {
    id: 'dash-3',
    name: 'Financial Overview',
    description: 'Fee collection and financial metrics',
    widgets: financialWidgets,
    isDefault: false,
    createdBy: 'Accountant',
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 5 }).toISOString(),
  },
]
