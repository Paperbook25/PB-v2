// ==================== FEE TYPE ENUMS ====================

export type FeeCategory =
  | 'tuition'
  | 'development'
  | 'lab'
  | 'library'
  | 'sports'
  | 'computer'
  | 'transport'
  | 'examination'
  | 'other'

export type FeeFrequency = 'monthly' | 'quarterly' | 'half_yearly' | 'annual' | 'one_time'

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'dd' | 'online'

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'waived'

export type ExpenseCategory =
  | 'salary'
  | 'utilities'
  | 'maintenance'
  | 'supplies'
  | 'infrastructure'
  | 'events'
  | 'other'

export type ExpenseStatus = 'pending_approval' | 'approved' | 'rejected' | 'paid'

export type LedgerEntryType = 'credit' | 'debit'

// ==================== FEE TYPE ====================

export interface FeeType {
  id: string
  name: string
  category: FeeCategory
  description?: string
  isActive: boolean
  createdAt: string
}

export interface CreateFeeTypeRequest {
  name: string
  category: FeeCategory
  description?: string
}

export interface UpdateFeeTypeRequest extends Partial<CreateFeeTypeRequest> {
  isActive?: boolean
}

// ==================== FEE STRUCTURE ====================

export interface FeeStructure {
  id: string
  feeTypeId: string
  feeTypeName: string
  academicYear: string
  applicableClasses: string[]
  amount: number
  frequency: FeeFrequency
  dueDay: number // Day of month when fee is due
  isOptional: boolean
  isActive: boolean
  createdAt: string
}

export interface CreateFeeStructureRequest {
  feeTypeId: string
  academicYear: string
  applicableClasses: string[]
  amount: number
  frequency: FeeFrequency
  dueDay?: number
  isOptional?: boolean
}

export interface UpdateFeeStructureRequest extends Partial<CreateFeeStructureRequest> {
  isActive?: boolean
}

export interface FeeStructureFilters {
  academicYear?: string
  feeTypeId?: string
  className?: string
  isActive?: boolean
}

// ==================== STUDENT FEE ====================

export interface StudentFee {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  admissionNumber: string
  feeStructureId: string
  feeTypeId: string
  feeTypeName: string
  academicYear: string
  totalAmount: number
  paidAmount: number
  discountAmount: number
  dueDate: string
  status: PaymentStatus
  createdAt: string
}

export interface StudentFeeFilters {
  studentId?: string
  academicYear?: string
  feeTypeId?: string
  className?: string
  section?: string
  status?: PaymentStatus | 'all'
  search?: string
  page?: number
  limit?: number
}

// ==================== PAYMENT ====================

export interface Payment {
  id: string
  receiptNumber: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  admissionNumber: string
  studentFeeId: string
  feeTypeName: string
  amount: number
  paymentMode: PaymentMode
  transactionRef?: string
  remarks?: string
  collectedBy: string
  collectedAt: string
}

export interface CollectPaymentRequest {
  studentId: string
  payments: {
    studentFeeId: string
    amount: number
  }[]
  paymentMode: PaymentMode
  transactionRef?: string
  remarks?: string
}

export interface PaymentFilters {
  studentId?: string
  dateFrom?: string
  dateTo?: string
  paymentMode?: PaymentMode | 'all'
  search?: string
  page?: number
  limit?: number
}

// ==================== RECEIPT ====================

export interface Receipt {
  id: string
  receiptNumber: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  admissionNumber: string
  payments: {
    feeTypeName: string
    amount: number
  }[]
  totalAmount: number
  paymentMode: PaymentMode
  transactionRef?: string
  remarks?: string
  generatedBy: string
  generatedAt: string
}

// ==================== OUTSTANDING DUES ====================

export interface OutstandingDue {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  admissionNumber: string
  parentPhone: string
  parentEmail: string
  totalDue: number
  daysOverdue: number
  oldestDueDate: string
  feeBreakdown: {
    feeTypeName: string
    amount: number
    dueDate: string
  }[]
  lastReminderSentAt?: string
}

export interface OutstandingFilters {
  className?: string
  section?: string
  minDaysOverdue?: number
  search?: string
  page?: number
  limit?: number
}

export interface SendReminderRequest {
  studentIds: string[]
  method: 'sms' | 'email' | 'both'
  message?: string
}

// ==================== EXPENSE ====================

export interface Expense {
  id: string
  expenseNumber: string
  category: ExpenseCategory
  description: string
  amount: number
  vendorName?: string
  invoiceNumber?: string
  invoiceDate?: string
  status: ExpenseStatus
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  paidAt?: string
  paidBy?: string
  paymentRef?: string
}

export interface CreateExpenseRequest {
  category: ExpenseCategory
  description: string
  amount: number
  vendorName?: string
  invoiceNumber?: string
  invoiceDate?: string
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {}

export interface ExpenseFilters {
  category?: ExpenseCategory | 'all'
  status?: ExpenseStatus | 'all'
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface ApproveExpenseRequest {
  remarks?: string
}

export interface RejectExpenseRequest {
  reason: string
}

export interface MarkExpensePaidRequest {
  paymentRef?: string
}

// ==================== LEDGER ====================

export interface LedgerEntry {
  id: string
  date: string
  type: LedgerEntryType
  category: string
  referenceId: string
  referenceNumber: string
  description: string
  amount: number
  balance: number
}

export interface LedgerFilters {
  type?: LedgerEntryType | 'all'
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface LedgerBalance {
  openingBalance: number
  totalCredits: number
  totalDebits: number
  closingBalance: number
  asOfDate: string
}

// ==================== REPORTS ====================

export interface CollectionReport {
  dateRange: { from: string; to: string }
  totalCollected: number
  byPaymentMode: Record<PaymentMode, number>
  byFeeType: { feeTypeName: string; amount: number }[]
  byClass: { className: string; amount: number }[]
  dailyCollections: { date: string; amount: number }[]
}

export interface DueReport {
  totalOutstanding: number
  totalStudentsWithDues: number
  byClass: { className: string; amount: number; count: number }[]
  byAgeingBucket: { bucket: string; amount: number; count: number }[]
  topDefaulters: OutstandingDue[]
}

export interface FinancialSummary {
  academicYear: string
  totalFeeExpected: number
  totalCollected: number
  totalPending: number
  totalExpenses: number
  netBalance: number
  collectionRate: number
  monthlyTrend: { month: string; collected: number; expenses: number }[]
}

// ==================== STATS ====================

export interface FinanceStats {
  totalCollected: number
  totalPending: number
  thisMonthCollection: number
  collectionRate: number
  pendingExpenseApprovals: number
  overdueStudentsCount: number
}

// ==================== CONSTANTS ====================

export const FEE_CATEGORIES: FeeCategory[] = [
  'tuition',
  'development',
  'lab',
  'library',
  'sports',
  'computer',
  'transport',
  'examination',
  'other',
]

export const FEE_CATEGORY_LABELS: Record<FeeCategory, string> = {
  tuition: 'Tuition Fee',
  development: 'Development Fee',
  lab: 'Lab Fee',
  library: 'Library Fee',
  sports: 'Sports Fee',
  computer: 'Computer Fee',
  transport: 'Transport Fee',
  examination: 'Examination Fee',
  other: 'Other',
}

export const FEE_FREQUENCIES: FeeFrequency[] = [
  'monthly',
  'quarterly',
  'half_yearly',
  'annual',
  'one_time',
]

export const FEE_FREQUENCY_LABELS: Record<FeeFrequency, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: 'Half Yearly',
  annual: 'Annual',
  one_time: 'One Time',
}

export const PAYMENT_MODES: PaymentMode[] = [
  'cash',
  'upi',
  'bank_transfer',
  'cheque',
  'dd',
  'online',
]

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  dd: 'Demand Draft',
  online: 'Online',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  partial: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
  waived: 'Waived',
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'salary',
  'utilities',
  'maintenance',
  'supplies',
  'infrastructure',
  'events',
  'other',
]

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  salary: 'Salary',
  utilities: 'Utilities',
  maintenance: 'Maintenance',
  supplies: 'Supplies',
  infrastructure: 'Infrastructure',
  events: 'Events',
  other: 'Other',
}

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  paid: 'Paid',
}

// ==================== INSTALLMENT PLANS / EMI ====================

export interface InstallmentPlan {
  id: string
  name: string
  feeStructureId: string
  feeTypeName: string
  totalAmount: number
  numberOfInstallments: number
  installments: Installment[]
  isActive: boolean
  academicYear: string
  applicableClasses: string[]
  createdAt: string
}

export interface Installment {
  id: string
  installmentNumber: number
  amount: number
  dueDate: string
  status: PaymentStatus
  paidAmount: number
  paidDate?: string
}

export interface CreateInstallmentPlanRequest {
  feeStructureId: string
  name: string
  numberOfInstallments: number
  installmentDates: string[]
}

// ==================== DISCOUNT & SCHOLARSHIP RULES ====================

export type DiscountType = 'percentage' | 'fixed_amount'
export type DiscountApplicability = 'sibling' | 'scholarship' | 'merit' | 'staff_ward' | 'early_bird' | 'custom'

export interface DiscountRule {
  id: string
  name: string
  type: DiscountType
  value: number
  applicability: DiscountApplicability
  applicableFeeTypes: string[]
  applicableClasses: string[]
  maxDiscount?: number
  minPercentage?: number
  isActive: boolean
  academicYear: string
  description?: string
  createdAt: string
}

export interface CreateDiscountRuleRequest {
  name: string
  type: DiscountType
  value: number
  applicability: DiscountApplicability
  applicableFeeTypes: string[]
  applicableClasses: string[]
  maxDiscount?: number
  minPercentage?: number
  description?: string
}

export interface AppliedDiscount {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  discountRuleId: string
  discountRuleName: string
  feeTypeName: string
  originalAmount: number
  discountAmount: number
  finalAmount: number
  appliedAt: string
  appliedBy: string
}

// ==================== FEE CONCESSION WORKFLOW ====================

export type ConcessionStatus = 'pending' | 'approved' | 'rejected' | 'expired'

export interface ConcessionRequest {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  section: string
  admissionNumber: string
  parentName: string
  feeTypes: string[]
  concessionType: DiscountType
  concessionValue: number
  reason: string
  supportingDocuments?: string[]
  status: ConcessionStatus
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  validFrom: string
  validTo: string
  totalConcessionAmount: number
}

export interface CreateConcessionRequest {
  studentId: string
  feeTypes: string[]
  concessionType: DiscountType
  concessionValue: number
  reason: string
  validFrom: string
  validTo: string
}

export interface UpdateConcessionRequest {
  status: ConcessionStatus
  rejectionReason?: string
}

// ==================== AUTO-REMINDER ESCALATION ====================

export type ReminderChannel = 'sms' | 'email' | 'whatsapp'

export interface ReminderEscalationRule {
  id: string
  name: string
  daysAfterDue: number
  channel: ReminderChannel
  recipient: 'parent' | 'student' | 'principal'
  messageTemplate: string
  isActive: boolean
}

export interface ReminderEscalationConfig {
  enabled: boolean
  rules: ReminderEscalationRule[]
}

export interface ReminderLog {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  channel: ReminderChannel
  recipient: string
  message: string
  escalationLevel: number
  daysOverdue: number
  sentAt: string
  status: 'sent' | 'delivered' | 'failed'
  amount: number
}

export interface UpdateEscalationConfigRequest {
  enabled: boolean
  rules: Omit<ReminderEscalationRule, 'id'>[]
}

// ==================== ONLINE PAYMENT PORTAL ====================

export interface OnlinePaymentConfig {
  gateway: 'razorpay' | 'paytm' | 'stripe' | 'none'
  isEnabled: boolean
  testMode: boolean
  merchantId?: string
  apiKey?: string
}

export interface OnlinePaymentOrder {
  id: string
  orderId: string
  studentId: string
  studentName: string
  amount: number
  feeIds: string[]
  gateway: string
  status: 'created' | 'processing' | 'completed' | 'failed'
  paymentLink?: string
  transactionId?: string
  createdAt: string
  completedAt?: string
}

export interface CreatePaymentOrderRequest {
  studentId: string
  feeIds: string[]
  gateway: string
}

// ==================== PARENT FINANCIAL DASHBOARD ====================

export interface ParentFeeDashboard {
  children: ChildFeeOverview[]
  totalPending: number
  totalPaid: number
  upcomingDues: UpcomingDue[]
  recentPayments: Payment[]
  downloadableReceipts: ReceiptSummary[]
}

export interface ChildFeeOverview {
  studentId: string
  studentName: string
  className: string
  section: string
  totalFees: number
  paidAmount: number
  pendingAmount: number
  discountAmount: number
  paymentPercentage: number
  fees: StudentFee[]
}

export interface UpcomingDue {
  feeTypeName: string
  studentName: string
  amount: number
  dueDate: string
  daysUntilDue: number
}

export interface ReceiptSummary {
  receiptNumber: string
  date: string
  amount: number
  studentName: string
}

// ==================== CONSTANTS ====================

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  percentage: 'Percentage',
  fixed_amount: 'Fixed Amount',
}

export const DISCOUNT_APPLICABILITY_LABELS: Record<DiscountApplicability, string> = {
  sibling: 'Sibling Discount',
  scholarship: 'Scholarship',
  merit: 'Merit Based',
  staff_ward: 'Staff Ward',
  early_bird: 'Early Bird',
  custom: 'Custom',
}

export const CONCESSION_STATUS_LABELS: Record<ConcessionStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
}

export const REMINDER_CHANNEL_LABELS: Record<ReminderChannel, string> = {
  sms: 'SMS',
  email: 'Email',
  whatsapp: 'WhatsApp',
}

export const ACADEMIC_YEARS = ['2024-25', '2023-24', '2022-23']

export const CLASSES = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
]

export const SECTIONS = ['A', 'B', 'C', 'D']

export const FEES_PER_PAGE = 10
export const PAYMENTS_PER_PAGE = 10
export const EXPENSES_PER_PAGE = 10
export const LEDGER_PER_PAGE = 20

// ==================== MULTI-CURRENCY SUPPORT ====================

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD' | 'AUD' | 'CAD'

export interface Currency {
  id: string
  code: CurrencyCode
  name: string
  symbol: string
  decimalPlaces: number
  isBaseCurrency: boolean
  isActive: boolean
  createdAt: string
}

export interface ExchangeRate {
  id: string
  fromCurrency: CurrencyCode
  toCurrency: CurrencyCode
  rate: number
  effectiveDate: string
  expiryDate?: string
  source: 'manual' | 'api' | 'bank'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateExchangeRateRequest {
  fromCurrency: CurrencyCode
  toCurrency: CurrencyCode
  rate: number
  effectiveDate: string
  expiryDate?: string
  source?: 'manual' | 'api' | 'bank'
}

export interface UpdateExchangeRateRequest extends Partial<CreateExchangeRateRequest> {
  isActive?: boolean
}

export interface CurrencyConversionRequest {
  amount: number
  fromCurrency: CurrencyCode
  toCurrency: CurrencyCode
}

export interface CurrencyConversionResult {
  originalAmount: number
  convertedAmount: number
  fromCurrency: CurrencyCode
  toCurrency: CurrencyCode
  exchangeRate: number
  conversionDate: string
}

// ==================== TAX INVOICE / GST / VAT ====================

export type TaxType = 'GST' | 'VAT' | 'CGST' | 'SGST' | 'IGST' | 'CESS'
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled' | 'void'

export interface GSTDetails {
  gstin: string
  gstRate: number
  cgstRate: number
  sgstRate: number
  igstRate: number
  cessRate?: number
  hsnCode?: string
  sacCode?: string
  placeOfSupply: string
  isInterState: boolean
}

export interface TaxLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxType: TaxType
  taxRate: number
  taxAmount: number
  hsnCode?: string
  sacCode?: string
}

export interface TaxInvoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  status: InvoiceStatus
  // Customer details
  customerId: string
  customerName: string
  customerAddress: string
  customerGstin?: string
  customerEmail?: string
  customerPhone?: string
  // Seller details
  sellerName: string
  sellerAddress: string
  sellerGstin: string
  // Line items
  lineItems: TaxLineItem[]
  // Amounts
  subtotal: number
  totalTaxAmount: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  cessAmount: number
  discountAmount: number
  totalAmount: number
  amountInWords: string
  // Currency
  currency: CurrencyCode
  exchangeRate?: number
  // References
  referenceType: 'fee_payment' | 'miscellaneous' | 'service'
  referenceId?: string
  receiptNumber?: string
  // Metadata
  notes?: string
  termsAndConditions?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
}

export interface CreateTaxInvoiceRequest {
  customerId: string
  customerName: string
  customerAddress: string
  customerGstin?: string
  customerEmail?: string
  customerPhone?: string
  lineItems: Omit<TaxLineItem, 'id'>[]
  dueDate: string
  currency?: CurrencyCode
  referenceType: 'fee_payment' | 'miscellaneous' | 'service'
  referenceId?: string
  receiptNumber?: string
  notes?: string
  termsAndConditions?: string
  discountAmount?: number
}

export interface UpdateTaxInvoiceRequest {
  status?: InvoiceStatus
  dueDate?: string
  notes?: string
  termsAndConditions?: string
}

export interface TaxInvoiceFilters {
  status?: InvoiceStatus | 'all'
  customerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface TaxSettings {
  defaultTaxType: TaxType
  defaultGstRate: number
  isInterStateDefault: boolean
  sellerGstin: string
  sellerName: string
  sellerAddress: string
  invoicePrefix: string
  invoiceStartNumber: number
  termsAndConditions: string
  bankDetails: string
}

// ==================== FINANCIAL YEAR & YEAR-END CLOSING ====================

export type FinancialYearStatus = 'active' | 'closing' | 'closed' | 'archived'

export interface FinancialYear {
  id: string
  name: string // e.g., "2024-25"
  startDate: string
  endDate: string
  status: FinancialYearStatus
  openingBalance: number
  closingBalance?: number
  totalRevenue?: number
  totalExpenses?: number
  netIncome?: number
  isCurrentYear: boolean
  createdAt: string
  closedAt?: string
  closedBy?: string
}

export interface YearEndClosingTask {
  id: string
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  order: number
  isRequired: boolean
  completedAt?: string
  completedBy?: string
  errorMessage?: string
}

export interface YearEndClosing {
  id: string
  financialYearId: string
  financialYearName: string
  status: 'not_started' | 'in_progress' | 'completed' | 'failed'
  tasks: YearEndClosingTask[]
  // Financial summary
  openingBalance: number
  totalCredits: number
  totalDebits: number
  closingBalance: number
  // Revenue & Expense summary
  totalFeeCollected: number
  totalExpensesPaid: number
  totalDiscountsGiven: number
  totalOutstandingDues: number
  // Audit trail
  initiatedBy?: string
  initiatedAt?: string
  completedAt?: string
  completedBy?: string
  notes?: string
}

export interface StartYearEndClosingRequest {
  financialYearId: string
  notes?: string
}

export interface CreateFinancialYearRequest {
  name: string
  startDate: string
  endDate: string
  openingBalance: number
}

export interface FinancialYearTransition {
  fromYearId: string
  toYearId: string
  closingBalance: number
  carryForwardItems: {
    outstandingDues: number
    pendingExpenses: number
    advancePayments: number
  }
}

// ==================== BUDGET PLANNING & VARIANCE TRACKING ====================

export type BudgetStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'closed'
export type BudgetPeriod = 'monthly' | 'quarterly' | 'half_yearly' | 'annual'
export type VarianceType = 'favorable' | 'unfavorable' | 'on_target'

export interface BudgetCategory {
  id: string
  name: string
  code: string
  parentCategoryId?: string
  description?: string
  isExpense: boolean
  isActive: boolean
  createdAt: string
}

export interface BudgetLineItem {
  id: string
  categoryId: string
  categoryName: string
  categoryCode: string
  budgetedAmount: number
  actualAmount: number
  variance: number
  variancePercentage: number
  varianceType: VarianceType
  notes?: string
}

export interface Budget {
  id: string
  name: string
  description?: string
  financialYearId: string
  financialYearName: string
  period: BudgetPeriod
  periodStart: string
  periodEnd: string
  status: BudgetStatus
  // Amounts
  totalBudgeted: number
  totalActual: number
  totalVariance: number
  variancePercentage: number
  // Line items
  lineItems: BudgetLineItem[]
  // Revenue budget
  budgetedRevenue: number
  actualRevenue: number
  revenueVariance: number
  // Expense budget
  budgetedExpenses: number
  actualExpenses: number
  expenseVariance: number
  // Approval workflow
  createdBy: string
  createdAt: string
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
}

export interface BudgetVariance {
  id: string
  budgetId: string
  budgetName: string
  categoryId: string
  categoryName: string
  periodStart: string
  periodEnd: string
  budgetedAmount: number
  actualAmount: number
  variance: number
  variancePercentage: number
  varianceType: VarianceType
  explanation?: string
  actionTaken?: string
  reportedAt: string
  reportedBy?: string
}

export interface CreateBudgetRequest {
  name: string
  description?: string
  financialYearId: string
  period: BudgetPeriod
  periodStart: string
  periodEnd: string
  lineItems: {
    categoryId: string
    budgetedAmount: number
    notes?: string
  }[]
  budgetedRevenue: number
}

export interface UpdateBudgetRequest {
  name?: string
  description?: string
  status?: BudgetStatus
  lineItems?: {
    categoryId: string
    budgetedAmount: number
    notes?: string
  }[]
}

export interface BudgetFilters {
  financialYearId?: string
  status?: BudgetStatus | 'all'
  period?: BudgetPeriod | 'all'
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface BudgetVsActualReport {
  budgetId: string
  budgetName: string
  periodStart: string
  periodEnd: string
  categories: {
    categoryId: string
    categoryName: string
    budgeted: number
    actual: number
    variance: number
    variancePercentage: number
    varianceType: VarianceType
  }[]
  summary: {
    totalBudgeted: number
    totalActual: number
    totalVariance: number
    variancePercentage: number
    utilizationRate: number
  }
}

// ==================== VENDOR PAYMENT SCHEDULING ====================

export type VendorPaymentStatus = 'scheduled' | 'pending_approval' | 'approved' | 'processing' | 'paid' | 'failed' | 'cancelled'
export type PaymentFrequency = 'one_time' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'annually'

export interface Vendor {
  id: string
  name: string
  code: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  gstin?: string
  panNumber?: string
  bankName?: string
  bankAccountNumber?: string
  bankIfscCode?: string
  paymentTerms?: number // days
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PaymentSchedule {
  id: string
  vendorId: string
  vendorName: string
  vendorCode: string
  description: string
  frequency: PaymentFrequency
  amount: number
  currency: CurrencyCode
  startDate: string
  endDate?: string
  nextPaymentDate: string
  dayOfMonth?: number // For monthly payments
  dayOfWeek?: number // For weekly payments
  totalScheduledPayments: number
  completedPayments: number
  remainingPayments: number
  totalAmountScheduled: number
  totalAmountPaid: number
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface VendorPayment {
  id: string
  paymentNumber: string
  vendorId: string
  vendorName: string
  vendorCode: string
  scheduleId?: string
  // Payment details
  amount: number
  currency: CurrencyCode
  exchangeRate?: number
  amountInBaseCurrency: number
  // Dates
  scheduledDate: string
  dueDate: string
  paidDate?: string
  // Status
  status: VendorPaymentStatus
  // Invoice reference
  invoiceNumber?: string
  invoiceDate?: string
  invoiceAmount?: number
  // Payment method
  paymentMode: PaymentMode
  bankReference?: string
  chequeNumber?: string
  chequeDate?: string
  // Deductions
  tdsRate?: number
  tdsAmount?: number
  otherDeductions?: number
  netPayableAmount: number
  // Approval
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  // Processing
  processedBy?: string
  processedAt?: string
  failureReason?: string
  // Notes
  description?: string
  notes?: string
  // Audit
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateVendorRequest {
  name: string
  code: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  gstin?: string
  panNumber?: string
  bankName?: string
  bankAccountNumber?: string
  bankIfscCode?: string
  paymentTerms?: number
}

export interface UpdateVendorRequest extends Partial<CreateVendorRequest> {
  isActive?: boolean
}

export interface CreatePaymentScheduleRequest {
  vendorId: string
  description: string
  frequency: PaymentFrequency
  amount: number
  currency?: CurrencyCode
  startDate: string
  endDate?: string
  dayOfMonth?: number
  dayOfWeek?: number
}

export interface CreateVendorPaymentRequest {
  vendorId: string
  scheduleId?: string
  amount: number
  currency?: CurrencyCode
  scheduledDate: string
  dueDate: string
  invoiceNumber?: string
  invoiceDate?: string
  invoiceAmount?: number
  paymentMode: PaymentMode
  tdsRate?: number
  description?: string
  notes?: string
}

export interface UpdateVendorPaymentRequest {
  status?: VendorPaymentStatus
  scheduledDate?: string
  dueDate?: string
  paymentMode?: PaymentMode
  notes?: string
}

export interface VendorPaymentFilters {
  vendorId?: string
  status?: VendorPaymentStatus | 'all'
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface ProcessVendorPaymentRequest {
  paymentMode: PaymentMode
  bankReference?: string
  chequeNumber?: string
  chequeDate?: string
  notes?: string
}

// ==================== SCHOLARSHIP DISBURSEMENT TRACKING ====================

export type ScholarshipType = 'merit' | 'need_based' | 'sports' | 'cultural' | 'government' | 'private' | 'staff_ward' | 'other'
export type DisbursementStatus = 'pending' | 'approved' | 'disbursed' | 'partially_disbursed' | 'on_hold' | 'cancelled'
export type DisbursementFrequency = 'one_time' | 'monthly' | 'quarterly' | 'half_yearly' | 'annual'

export interface ScholarshipScheme {
  id: string
  name: string
  code: string
  type: ScholarshipType
  description?: string
  // Eligibility criteria
  eligibilityCriteria?: string
  minPercentage?: number
  incomeLimit?: number
  applicableClasses: string[]
  // Benefit details
  benefitType: 'percentage' | 'fixed_amount'
  benefitValue: number
  maxBenefitAmount?: number
  applicableFeeTypes: string[]
  // Duration
  academicYear: string
  validFrom: string
  validTo: string
  // Funding
  fundingSource: 'school' | 'government' | 'trust' | 'corporate' | 'individual'
  sponsorName?: string
  totalBudget?: number
  utilizedBudget?: number
  availableBudget?: number
  maxBeneficiaries?: number
  currentBeneficiaries?: number
  // Status
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ScholarshipBeneficiary {
  id: string
  schemeId: string
  schemeName: string
  schemeCode: string
  scholarshipType: ScholarshipType
  // Student details
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  admissionNumber: string
  // Award details
  awardDate: string
  awardedBy: string
  approvalReference?: string
  // Benefit details
  benefitType: 'percentage' | 'fixed_amount'
  benefitValue: number
  totalAwardAmount: number
  disbursedAmount: number
  pendingAmount: number
  // Duration
  validFrom: string
  validTo: string
  disbursementFrequency: DisbursementFrequency
  // Status
  status: DisbursementStatus
  // Notes
  notes?: string
  // Audit
  createdAt: string
  updatedAt: string
}

export interface ScholarshipDisbursement {
  id: string
  disbursementNumber: string
  beneficiaryId: string
  schemeId: string
  schemeName: string
  // Student details
  studentId: string
  studentName: string
  studentClass: string
  admissionNumber: string
  // Disbursement details
  scheduledDate: string
  disbursementDate?: string
  amount: number
  feeTypeId?: string
  feeTypeName?: string
  // Status
  status: DisbursementStatus
  // Applied to fees
  appliedToFeeId?: string
  appliedToReceiptNumber?: string
  // Processing
  processedBy?: string
  processedAt?: string
  // Bank transfer details (for direct transfers)
  paymentMode?: 'fee_adjustment' | 'bank_transfer' | 'cheque'
  bankReference?: string
  // Approval
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  onHoldReason?: string
  // Notes
  notes?: string
  // Audit
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateScholarshipSchemeRequest {
  name: string
  code: string
  type: ScholarshipType
  description?: string
  eligibilityCriteria?: string
  minPercentage?: number
  incomeLimit?: number
  applicableClasses: string[]
  benefitType: 'percentage' | 'fixed_amount'
  benefitValue: number
  maxBenefitAmount?: number
  applicableFeeTypes: string[]
  academicYear: string
  validFrom: string
  validTo: string
  fundingSource: 'school' | 'government' | 'trust' | 'corporate' | 'individual'
  sponsorName?: string
  totalBudget?: number
  maxBeneficiaries?: number
}

export interface UpdateScholarshipSchemeRequest extends Partial<CreateScholarshipSchemeRequest> {
  isActive?: boolean
}

export interface AwardScholarshipRequest {
  schemeId: string
  studentId: string
  awardDate: string
  totalAwardAmount: number
  validFrom: string
  validTo: string
  disbursementFrequency: DisbursementFrequency
  approvalReference?: string
  notes?: string
}

export interface CreateDisbursementRequest {
  beneficiaryId: string
  scheduledDate: string
  amount: number
  feeTypeId?: string
  paymentMode?: 'fee_adjustment' | 'bank_transfer' | 'cheque'
  notes?: string
}

export interface ProcessDisbursementRequest {
  paymentMode: 'fee_adjustment' | 'bank_transfer' | 'cheque'
  appliedToFeeId?: string
  bankReference?: string
  notes?: string
}

export interface ScholarshipFilters {
  type?: ScholarshipType | 'all'
  academicYear?: string
  status?: 'active' | 'inactive' | 'all'
  page?: number
  limit?: number
}

export interface DisbursementFilters {
  schemeId?: string
  studentId?: string
  status?: DisbursementStatus | 'all'
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface ScholarshipSummary {
  totalSchemes: number
  activeSchemes: number
  totalBeneficiaries: number
  totalBudget: number
  totalDisbursed: number
  totalPending: number
  byType: {
    type: ScholarshipType
    count: number
    amount: number
  }[]
  byClass: {
    className: string
    beneficiaries: number
    amount: number
  }[]
}

// ==================== ADDITIONAL CONSTANTS ====================

export const CURRENCY_CODES: CurrencyCode[] = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD']

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  AED: 'UAE Dirham',
  SGD: 'Singapore Dollar',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
}

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SGD: 'S$',
  AUD: 'A$',
  CAD: 'C$',
}

export const TAX_TYPES: TaxType[] = ['GST', 'VAT', 'CGST', 'SGST', 'IGST', 'CESS']

export const TAX_TYPE_LABELS: Record<TaxType, string> = {
  GST: 'Goods and Services Tax',
  VAT: 'Value Added Tax',
  CGST: 'Central GST',
  SGST: 'State GST',
  IGST: 'Integrated GST',
  CESS: 'Cess',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  issued: 'Issued',
  paid: 'Paid',
  cancelled: 'Cancelled',
  void: 'Void',
}

export const FINANCIAL_YEAR_STATUS_LABELS: Record<FinancialYearStatus, string> = {
  active: 'Active',
  closing: 'Closing in Progress',
  closed: 'Closed',
  archived: 'Archived',
}

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  active: 'Active',
  closed: 'Closed',
}

export const BUDGET_PERIOD_LABELS: Record<BudgetPeriod, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: 'Half Yearly',
  annual: 'Annual',
}

export const VENDOR_PAYMENT_STATUS_LABELS: Record<VendorPaymentStatus, string> = {
  scheduled: 'Scheduled',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  processing: 'Processing',
  paid: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

export const PAYMENT_FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  one_time: 'One Time',
  weekly: 'Weekly',
  bi_weekly: 'Bi-Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
}

export const SCHOLARSHIP_TYPE_LABELS: Record<ScholarshipType, string> = {
  merit: 'Merit Based',
  need_based: 'Need Based',
  sports: 'Sports',
  cultural: 'Cultural',
  government: 'Government',
  private: 'Private/Corporate',
  staff_ward: 'Staff Ward',
  other: 'Other',
}

export const DISBURSEMENT_STATUS_LABELS: Record<DisbursementStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  disbursed: 'Disbursed',
  partially_disbursed: 'Partially Disbursed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
}

export const DISBURSEMENT_FREQUENCY_LABELS: Record<DisbursementFrequency, string> = {
  one_time: 'One Time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: 'Half Yearly',
  annual: 'Annual',
}
