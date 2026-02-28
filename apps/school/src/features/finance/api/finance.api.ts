import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  FeeType,
  CreateFeeTypeRequest,
  UpdateFeeTypeRequest,
  FeeStructure,
  CreateFeeStructureRequest,
  UpdateFeeStructureRequest,
  FeeStructureFilters,
  StudentFee,
  StudentFeeFilters,
  Payment,
  CollectPaymentRequest,
  PaymentFilters,
  Receipt,
  OutstandingDue,
  OutstandingFilters,
  SendReminderRequest,
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilters,
  ApproveExpenseRequest,
  RejectExpenseRequest,
  MarkExpensePaidRequest,
  LedgerEntry,
  LedgerFilters,
  LedgerBalance,
  CollectionReport,
  DueReport,
  FinancialSummary,
  FinanceStats,
  InstallmentPlan,
  CreateInstallmentPlanRequest,
  DiscountRule,
  CreateDiscountRuleRequest,
  AppliedDiscount,
  ConcessionRequest,
  CreateConcessionRequest,
  ReminderEscalationConfig,
  UpdateEscalationConfigRequest,
  ReminderLog,
  OnlinePaymentConfig,
  OnlinePaymentOrder,
  CreatePaymentOrderRequest,
  ParentFeeDashboard,
  // Multi-currency
  Currency,
  ExchangeRate,
  CreateExchangeRateRequest,
  UpdateExchangeRateRequest,
  CurrencyConversionRequest,
  CurrencyConversionResult,
  CurrencyCode,
  // Tax invoice
  TaxInvoice,
  CreateTaxInvoiceRequest,
  UpdateTaxInvoiceRequest,
  TaxInvoiceFilters,
  TaxSettings,
  // Financial year
  FinancialYear,
  YearEndClosing,
  StartYearEndClosingRequest,
  CreateFinancialYearRequest,
  FinancialYearTransition,
  // Budget
  Budget,
  BudgetCategory,
  BudgetVariance,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  BudgetFilters,
  BudgetVsActualReport,
  // Vendor payments
  Vendor,
  PaymentSchedule,
  VendorPayment,
  CreateVendorRequest,
  UpdateVendorRequest,
  CreatePaymentScheduleRequest,
  CreateVendorPaymentRequest,
  UpdateVendorPaymentRequest,
  VendorPaymentFilters,
  ProcessVendorPaymentRequest,
  // Scholarship
  ScholarshipScheme,
  ScholarshipBeneficiary,
  ScholarshipDisbursement,
  CreateScholarshipSchemeRequest,
  UpdateScholarshipSchemeRequest,
  AwardScholarshipRequest,
  CreateDisbursementRequest,
  ProcessDisbursementRequest,
  ScholarshipFilters,
  DisbursementFilters,
  ScholarshipSummary,
} from '../types/finance.types'

// ==================== USER-SCOPED TYPES ====================

export interface FeesSummary {
  totalFees: number
  totalPaid: number
  totalDiscount: number
  totalPending: number
}

export interface MyFeesResponse {
  fees: StudentFee[]
  summary: FeesSummary
}

export interface ChildFeesData {
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  fees: StudentFee[]
  summary: FeesSummary
}

const API_BASE = '/api/finance'

// ==================== USER-SCOPED ENDPOINTS ====================

export async function fetchMyFees(): Promise<{ data: MyFeesResponse }> {
  return apiGet(`${API_BASE}/my-fees`)
}

export async function fetchMyChildrenFees(): Promise<{ data: ChildFeesData[] }> {
  return apiGet(`${API_BASE}/my-children-fees`)
}

export async function fetchMyPayments(): Promise<{ data: Payment[] }> {
  return apiGet(`${API_BASE}/my-payments`)
}

// ==================== FEE TYPES ====================

export async function fetchFeeTypes(): Promise<{ data: FeeType[] }> {
  return apiGet<{ data: FeeType[] }>(`${API_BASE}/fee-types`)
}

export async function fetchFeeType(id: string): Promise<{ data: FeeType }> {
  return apiGet<{ data: FeeType }>(`${API_BASE}/fee-types/${id}`)
}

export async function createFeeType(data: CreateFeeTypeRequest): Promise<{ data: FeeType }> {
  return apiPost<{ data: FeeType }>(`${API_BASE}/fee-types`, data)
}

export async function updateFeeType(
  id: string,
  data: UpdateFeeTypeRequest
): Promise<{ data: FeeType }> {
  return apiPut<{ data: FeeType }>(`${API_BASE}/fee-types/${id}`, data)
}

export async function deleteFeeType(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/fee-types/${id}`)
}

// ==================== FEE STRUCTURES ====================

export async function fetchFeeStructures(
  filters: FeeStructureFilters = {}
): Promise<{ data: FeeStructure[] }> {
  const params = new URLSearchParams()

  if (filters.academicYear) params.set('academicYear', filters.academicYear)
  if (filters.feeTypeId) params.set('feeTypeId', filters.feeTypeId)
  if (filters.className) params.set('className', filters.className)
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive))

  return apiGet<{ data: FeeStructure[] }>(`${API_BASE}/fee-structures?${params.toString()}`)
}

export async function createFeeStructure(
  data: CreateFeeStructureRequest
): Promise<{ data: FeeStructure }> {
  return apiPost<{ data: FeeStructure }>(`${API_BASE}/fee-structures`, data)
}

export async function updateFeeStructure(
  id: string,
  data: UpdateFeeStructureRequest
): Promise<{ data: FeeStructure }> {
  return apiPut<{ data: FeeStructure }>(`${API_BASE}/fee-structures/${id}`, data)
}

export async function deleteFeeStructure(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/fee-structures/${id}`)
}

// ==================== STUDENT FEES ====================

export async function fetchStudentFees(
  filters: StudentFeeFilters = {}
): Promise<PaginatedResponse<StudentFee>> {
  const params = new URLSearchParams()

  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.academicYear) params.set('academicYear', filters.academicYear)
  if (filters.feeTypeId) params.set('feeTypeId', filters.feeTypeId)
  if (filters.className) params.set('className', filters.className)
  if (filters.section) params.set('section', filters.section)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<StudentFee>>(`${API_BASE}/student-fees?${params.toString()}`)
}

export async function fetchStudentFeesById(studentId: string): Promise<{ data: StudentFee[] }> {
  return apiGet<{ data: StudentFee[] }>(`${API_BASE}/students/${studentId}/fees`)
}

// ==================== PAYMENTS ====================

export async function fetchPayments(
  filters: PaymentFilters = {}
): Promise<PaginatedResponse<Payment>> {
  const params = new URLSearchParams()

  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.paymentMode && filters.paymentMode !== 'all')
    params.set('paymentMode', filters.paymentMode)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<Payment>>(`${API_BASE}/payments?${params.toString()}`)
}

export async function collectPayment(
  data: CollectPaymentRequest
): Promise<{ data: Receipt; payments: Payment[] }> {
  return apiPost<{ data: Receipt; payments: Payment[] }>(`${API_BASE}/payments/collect`, data)
}

export async function fetchReceipt(receiptNumber: string): Promise<{ data: Receipt }> {
  return apiGet<{ data: Receipt }>(`${API_BASE}/receipts/${receiptNumber}`)
}

export async function deleteReceipt(receiptNumber: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/receipts/${receiptNumber}`)
}

// ==================== OUTSTANDING DUES ====================

export async function fetchOutstandingDues(
  filters: OutstandingFilters = {}
): Promise<PaginatedResponse<OutstandingDue>> {
  const params = new URLSearchParams()

  if (filters.className) params.set('className', filters.className)
  if (filters.section) params.set('section', filters.section)
  if (filters.minDaysOverdue) params.set('minDaysOverdue', String(filters.minDaysOverdue))
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<OutstandingDue>>(`${API_BASE}/outstanding?${params.toString()}`)
}

export async function fetchOutstandingSummary(): Promise<{
  data: {
    totalOutstanding: number
    totalStudents: number
    averageOverdueDays: number
  }
}> {
  return apiGet<{
    data: {
      totalOutstanding: number
      totalStudents: number
      averageOverdueDays: number
    }
  }>(`${API_BASE}/outstanding/summary`)
}

export async function sendReminders(
  data: SendReminderRequest
): Promise<{ success: boolean; count: number }> {
  return apiPost<{ success: boolean; count: number }>(`${API_BASE}/reminders/send`, data)
}

// ==================== EXPENSES ====================

export async function fetchExpenses(
  filters: ExpenseFilters = {}
): Promise<PaginatedResponse<Expense>> {
  const params = new URLSearchParams()

  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<Expense>>(`${API_BASE}/expenses?${params.toString()}`)
}

export async function fetchExpense(id: string): Promise<{ data: Expense }> {
  return apiGet<{ data: Expense }>(`${API_BASE}/expenses/${id}`)
}

export async function createExpense(data: CreateExpenseRequest): Promise<{ data: Expense }> {
  return apiPost<{ data: Expense }>(`${API_BASE}/expenses`, data)
}

export async function updateExpense(
  id: string,
  data: UpdateExpenseRequest
): Promise<{ data: Expense }> {
  return apiPut<{ data: Expense }>(`${API_BASE}/expenses/${id}`, data)
}

export async function approveExpense(
  id: string,
  data: ApproveExpenseRequest = {}
): Promise<{ data: Expense }> {
  return apiPatch<{ data: Expense }>(`${API_BASE}/expenses/${id}/approve`, data)
}

export async function rejectExpense(
  id: string,
  data: RejectExpenseRequest
): Promise<{ data: Expense }> {
  return apiPatch<{ data: Expense }>(`${API_BASE}/expenses/${id}/reject`, data)
}

export async function markExpensePaid(
  id: string,
  data: MarkExpensePaidRequest = {}
): Promise<{ data: Expense }> {
  return apiPatch<{ data: Expense }>(`${API_BASE}/expenses/${id}/mark-paid`, data)
}

export async function deleteExpense(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/expenses/${id}`)
}

// ==================== LEDGER ====================

export async function fetchLedger(
  filters: LedgerFilters = {}
): Promise<PaginatedResponse<LedgerEntry>> {
  const params = new URLSearchParams()

  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<LedgerEntry>>(`${API_BASE}/ledger?${params.toString()}`)
}

export async function fetchLedgerBalance(): Promise<{ data: LedgerBalance }> {
  return apiGet<{ data: LedgerBalance }>(`${API_BASE}/ledger/balance`)
}

export async function deleteLedgerEntry(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/ledger/${id}`)
}

// ==================== REPORTS ====================

export async function fetchCollectionReport(
  dateFrom: string,
  dateTo: string
): Promise<{ data: CollectionReport }> {
  const params = new URLSearchParams()
  params.set('dateFrom', dateFrom)
  params.set('dateTo', dateTo)

  return apiGet<{ data: CollectionReport }>(`${API_BASE}/reports/collection?${params.toString()}`)
}

export async function fetchDueReport(): Promise<{ data: DueReport }> {
  return apiGet<{ data: DueReport }>(`${API_BASE}/reports/dues`)
}

export async function fetchFinancialSummary(
  academicYear: string
): Promise<{ data: FinancialSummary }> {
  return apiGet<{ data: FinancialSummary }>(`${API_BASE}/reports/summary?academicYear=${academicYear}`)
}

export async function fetchFinanceStats(): Promise<{ data: FinanceStats }> {
  return apiGet<{ data: FinanceStats }>(`${API_BASE}/stats`)
}

// ==================== INSTALLMENT PLANS ====================

export async function fetchInstallmentPlans(
  academicYear?: string
): Promise<{ data: InstallmentPlan[] }> {
  const params = new URLSearchParams()
  if (academicYear) params.set('academicYear', academicYear)

  return apiGet<{ data: InstallmentPlan[] }>(`${API_BASE}/installment-plans?${params.toString()}`)
}

export async function fetchInstallmentPlan(id: string): Promise<{ data: InstallmentPlan }> {
  return apiGet<{ data: InstallmentPlan }>(`${API_BASE}/installment-plans/${id}`)
}

export async function createInstallmentPlan(
  data: CreateInstallmentPlanRequest
): Promise<{ data: InstallmentPlan }> {
  return apiPost<{ data: InstallmentPlan }>(`${API_BASE}/installment-plans`, data)
}

export async function toggleInstallmentPlan(id: string): Promise<{ data: InstallmentPlan }> {
  return apiPatch<{ data: InstallmentPlan }>(`${API_BASE}/installment-plans/${id}/toggle`)
}

export async function deleteInstallmentPlan(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/installment-plans/${id}`)
}

// ==================== DISCOUNT RULES ====================

export async function fetchDiscountRules(): Promise<{ data: DiscountRule[] }> {
  return apiGet<{ data: DiscountRule[] }>(`${API_BASE}/discount-rules`)
}

export async function createDiscountRule(
  data: CreateDiscountRuleRequest
): Promise<{ data: DiscountRule }> {
  return apiPost<{ data: DiscountRule }>(`${API_BASE}/discount-rules`, data)
}

export async function updateDiscountRule(
  id: string,
  data: Partial<CreateDiscountRuleRequest>
): Promise<{ data: DiscountRule }> {
  return apiPut<{ data: DiscountRule }>(`${API_BASE}/discount-rules/${id}`, data)
}

export async function toggleDiscountRule(id: string): Promise<{ data: DiscountRule }> {
  return apiPatch<{ data: DiscountRule }>(`${API_BASE}/discount-rules/${id}/toggle`)
}

export async function deleteDiscountRule(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/discount-rules/${id}`)
}

export async function fetchAppliedDiscounts(
  filters: { studentId?: string; ruleId?: string } = {}
): Promise<{ data: AppliedDiscount[] }> {
  const params = new URLSearchParams()
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.ruleId) params.set('ruleId', filters.ruleId)

  return apiGet<{ data: AppliedDiscount[] }>(`${API_BASE}/applied-discounts?${params.toString()}`)
}

// ==================== CONCESSION REQUESTS ====================

export async function fetchConcessionRequests(
  status?: string
): Promise<{ data: ConcessionRequest[] }> {
  const params = new URLSearchParams()
  if (status && status !== 'all') params.set('status', status)

  return apiGet<{ data: ConcessionRequest[] }>(`${API_BASE}/concessions?${params.toString()}`)
}

export async function createConcessionRequest(
  data: CreateConcessionRequest
): Promise<{ data: ConcessionRequest }> {
  return apiPost<{ data: ConcessionRequest }>(`${API_BASE}/concessions`, data)
}

export async function approveConcession(id: string): Promise<{ data: ConcessionRequest }> {
  return apiPatch<{ data: ConcessionRequest }>(`${API_BASE}/concessions/${id}/approve`)
}

export async function rejectConcession(
  id: string,
  reason: string
): Promise<{ data: ConcessionRequest }> {
  return apiPatch<{ data: ConcessionRequest }>(`${API_BASE}/concessions/${id}/reject`, { reason })
}

// ==================== ESCALATION CONFIG ====================

export async function fetchEscalationConfig(): Promise<{ data: ReminderEscalationConfig }> {
  return apiGet<{ data: ReminderEscalationConfig }>(`${API_BASE}/escalation-config`)
}

export async function updateEscalationConfig(
  data: UpdateEscalationConfigRequest
): Promise<{ data: ReminderEscalationConfig }> {
  return apiPut<{ data: ReminderEscalationConfig }>(`${API_BASE}/escalation-config`, data)
}

export async function fetchReminderLogs(
  filters: { channel?: string; status?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<ReminderLog>> {
  const params = new URLSearchParams()
  if (filters.channel && filters.channel !== 'all') params.set('channel', filters.channel)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<ReminderLog>>(`${API_BASE}/reminder-logs?${params.toString()}`)
}

// ==================== ONLINE PAYMENT ====================

export async function fetchOnlinePaymentConfig(): Promise<{ data: OnlinePaymentConfig }> {
  return apiGet<{ data: OnlinePaymentConfig }>(`${API_BASE}/online-payment/config`)
}

export async function updateOnlinePaymentConfig(
  data: Partial<OnlinePaymentConfig>
): Promise<{ data: OnlinePaymentConfig }> {
  return apiPut<{ data: OnlinePaymentConfig }>(`${API_BASE}/online-payment/config`, data)
}

export async function fetchOnlinePaymentOrders(
  filters: { status?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<OnlinePaymentOrder>> {
  const params = new URLSearchParams()
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<OnlinePaymentOrder>>(`${API_BASE}/online-payment/orders?${params.toString()}`)
}

export async function createPaymentOrder(
  data: CreatePaymentOrderRequest
): Promise<{ data: OnlinePaymentOrder }> {
  return apiPost<{ data: OnlinePaymentOrder }>(`${API_BASE}/online-payment/orders`, data)
}

// ==================== PARENT DASHBOARD ====================

export async function fetchParentFeeDashboard(): Promise<{ data: ParentFeeDashboard }> {
  return apiGet<{ data: ParentFeeDashboard }>(`${API_BASE}/parent-dashboard`)
}

// ==================== MULTI-CURRENCY ====================

export async function fetchCurrencies(): Promise<{ data: Currency[] }> {
  return apiGet<{ data: Currency[] }>(`${API_BASE}/currencies`)
}

export async function fetchExchangeRates(
  baseCurrency?: CurrencyCode
): Promise<{ data: ExchangeRate[] }> {
  const params = new URLSearchParams()
  if (baseCurrency) params.set('baseCurrency', baseCurrency)

  return apiGet<{ data: ExchangeRate[] }>(`${API_BASE}/exchange-rates?${params.toString()}`)
}

export async function fetchExchangeRate(id: string): Promise<{ data: ExchangeRate }> {
  return apiGet<{ data: ExchangeRate }>(`${API_BASE}/exchange-rates/${id}`)
}

export async function createExchangeRate(
  data: CreateExchangeRateRequest
): Promise<{ data: ExchangeRate }> {
  return apiPost<{ data: ExchangeRate }>(`${API_BASE}/exchange-rates`, data)
}

export async function updateExchangeRate(
  id: string,
  data: UpdateExchangeRateRequest
): Promise<{ data: ExchangeRate }> {
  return apiPut<{ data: ExchangeRate }>(`${API_BASE}/exchange-rates/${id}`, data)
}

export async function deleteExchangeRate(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/exchange-rates/${id}`)
}

export async function convertCurrency(
  data: CurrencyConversionRequest
): Promise<{ data: CurrencyConversionResult }> {
  return apiPost<{ data: CurrencyConversionResult }>(`${API_BASE}/currency/convert`, data)
}

// ==================== TAX INVOICES ====================

export async function fetchTaxInvoices(
  filters: TaxInvoiceFilters = {}
): Promise<PaginatedResponse<TaxInvoice>> {
  const params = new URLSearchParams()

  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.customerId) params.set('customerId', filters.customerId)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<TaxInvoice>>(`${API_BASE}/tax-invoices?${params.toString()}`)
}

export async function fetchTaxInvoice(id: string): Promise<{ data: TaxInvoice }> {
  return apiGet<{ data: TaxInvoice }>(`${API_BASE}/tax-invoices/${id}`)
}

export async function createTaxInvoice(
  data: CreateTaxInvoiceRequest
): Promise<{ data: TaxInvoice }> {
  return apiPost<{ data: TaxInvoice }>(`${API_BASE}/tax-invoices`, data)
}

export async function updateTaxInvoice(
  id: string,
  data: UpdateTaxInvoiceRequest
): Promise<{ data: TaxInvoice }> {
  return apiPut<{ data: TaxInvoice }>(`${API_BASE}/tax-invoices/${id}`, data)
}

export async function issueTaxInvoice(id: string): Promise<{ data: TaxInvoice }> {
  return apiPatch<{ data: TaxInvoice }>(`${API_BASE}/tax-invoices/${id}/issue`)
}

export async function cancelTaxInvoice(
  id: string,
  reason: string
): Promise<{ data: TaxInvoice }> {
  return apiPatch<{ data: TaxInvoice }>(`${API_BASE}/tax-invoices/${id}/cancel`, { reason })
}

export async function fetchTaxSettings(): Promise<{ data: TaxSettings }> {
  return apiGet<{ data: TaxSettings }>(`${API_BASE}/tax-settings`)
}

export async function updateTaxSettings(
  data: Partial<TaxSettings>
): Promise<{ data: TaxSettings }> {
  return apiPut<{ data: TaxSettings }>(`${API_BASE}/tax-settings`, data)
}

// ==================== FINANCIAL YEAR ====================

export async function fetchFinancialYears(): Promise<{ data: FinancialYear[] }> {
  return apiGet<{ data: FinancialYear[] }>(`${API_BASE}/financial-years`)
}

export async function fetchFinancialYear(id: string): Promise<{ data: FinancialYear }> {
  return apiGet<{ data: FinancialYear }>(`${API_BASE}/financial-years/${id}`)
}

export async function fetchCurrentFinancialYear(): Promise<{ data: FinancialYear }> {
  return apiGet<{ data: FinancialYear }>(`${API_BASE}/financial-years/current`)
}

export async function createFinancialYear(
  data: CreateFinancialYearRequest
): Promise<{ data: FinancialYear }> {
  return apiPost<{ data: FinancialYear }>(`${API_BASE}/financial-years`, data)
}

export async function setActiveFinancialYear(id: string): Promise<{ data: FinancialYear }> {
  return apiPatch<{ data: FinancialYear }>(`${API_BASE}/financial-years/${id}/activate`)
}

// ==================== YEAR-END CLOSING ====================

export async function fetchYearEndClosing(
  financialYearId: string
): Promise<{ data: YearEndClosing }> {
  return apiGet<{ data: YearEndClosing }>(
    `${API_BASE}/financial-years/${financialYearId}/year-end-closing`
  )
}

export async function startYearEndClosing(
  data: StartYearEndClosingRequest
): Promise<{ data: YearEndClosing }> {
  return apiPost<{ data: YearEndClosing }>(
    `${API_BASE}/financial-years/${data.financialYearId}/year-end-closing/start`,
    data
  )
}

export async function completeYearEndClosingTask(
  financialYearId: string,
  taskId: string
): Promise<{ data: YearEndClosing }> {
  return apiPatch<{ data: YearEndClosing }>(
    `${API_BASE}/financial-years/${financialYearId}/year-end-closing/tasks/${taskId}/complete`
  )
}

export async function finalizeYearEndClosing(
  financialYearId: string
): Promise<{ data: YearEndClosing }> {
  return apiPost<{ data: YearEndClosing }>(
    `${API_BASE}/financial-years/${financialYearId}/year-end-closing/finalize`
  )
}

export async function transitionFinancialYear(
  fromYearId: string,
  toYearId: string
): Promise<{ data: FinancialYearTransition }> {
  return apiPost<{ data: FinancialYearTransition }>(
    `${API_BASE}/financial-years/transition`,
    { fromYearId, toYearId }
  )
}

// ==================== BUDGET ====================

export async function fetchBudgets(
  filters: BudgetFilters = {}
): Promise<PaginatedResponse<Budget>> {
  const params = new URLSearchParams()

  if (filters.financialYearId) params.set('financialYearId', filters.financialYearId)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.period && filters.period !== 'all') params.set('period', filters.period)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<Budget>>(`${API_BASE}/budgets?${params.toString()}`)
}

export async function fetchBudget(id: string): Promise<{ data: Budget }> {
  return apiGet<{ data: Budget }>(`${API_BASE}/budgets/${id}`)
}

export async function createBudget(data: CreateBudgetRequest): Promise<{ data: Budget }> {
  return apiPost<{ data: Budget }>(`${API_BASE}/budgets`, data)
}

export async function updateBudget(
  id: string,
  data: UpdateBudgetRequest
): Promise<{ data: Budget }> {
  return apiPut<{ data: Budget }>(`${API_BASE}/budgets/${id}`, data)
}

export async function submitBudgetForApproval(id: string): Promise<{ data: Budget }> {
  return apiPatch<{ data: Budget }>(`${API_BASE}/budgets/${id}/submit`)
}

export async function approveBudget(id: string): Promise<{ data: Budget }> {
  return apiPatch<{ data: Budget }>(`${API_BASE}/budgets/${id}/approve`)
}

export async function rejectBudget(
  id: string,
  reason: string
): Promise<{ data: Budget }> {
  return apiPatch<{ data: Budget }>(`${API_BASE}/budgets/${id}/reject`, { reason })
}

export async function deleteBudget(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/budgets/${id}`)
}

export async function fetchBudgetCategories(): Promise<{ data: BudgetCategory[] }> {
  return apiGet<{ data: BudgetCategory[] }>(`${API_BASE}/budget-categories`)
}

export async function fetchBudgetVariances(
  budgetId: string
): Promise<{ data: BudgetVariance[] }> {
  return apiGet<{ data: BudgetVariance[] }>(`${API_BASE}/budgets/${budgetId}/variances`)
}

export async function fetchBudgetVsActualReport(
  budgetId: string
): Promise<{ data: BudgetVsActualReport }> {
  return apiGet<{ data: BudgetVsActualReport }>(`${API_BASE}/budgets/${budgetId}/vs-actual`)
}

// ==================== VENDOR ====================

export async function fetchVendors(
  filters: { search?: string; isActive?: boolean } = {}
): Promise<{ data: Vendor[] }> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive))

  return apiGet<{ data: Vendor[] }>(`${API_BASE}/vendors?${params.toString()}`)
}

export async function fetchVendor(id: string): Promise<{ data: Vendor }> {
  return apiGet<{ data: Vendor }>(`${API_BASE}/vendors/${id}`)
}

export async function createVendor(data: CreateVendorRequest): Promise<{ data: Vendor }> {
  return apiPost<{ data: Vendor }>(`${API_BASE}/vendors`, data)
}

export async function updateVendor(
  id: string,
  data: UpdateVendorRequest
): Promise<{ data: Vendor }> {
  return apiPut<{ data: Vendor }>(`${API_BASE}/vendors/${id}`, data)
}

export async function deleteVendor(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/vendors/${id}`)
}

// ==================== PAYMENT SCHEDULES ====================

export async function fetchPaymentSchedules(
  vendorId?: string
): Promise<{ data: PaymentSchedule[] }> {
  const params = new URLSearchParams()
  if (vendorId) params.set('vendorId', vendorId)

  return apiGet<{ data: PaymentSchedule[] }>(
    `${API_BASE}/payment-schedules?${params.toString()}`
  )
}

export async function fetchPaymentSchedule(id: string): Promise<{ data: PaymentSchedule }> {
  return apiGet<{ data: PaymentSchedule }>(`${API_BASE}/payment-schedules/${id}`)
}

export async function createPaymentSchedule(
  data: CreatePaymentScheduleRequest
): Promise<{ data: PaymentSchedule }> {
  return apiPost<{ data: PaymentSchedule }>(`${API_BASE}/payment-schedules`, data)
}

export async function togglePaymentSchedule(id: string): Promise<{ data: PaymentSchedule }> {
  return apiPatch<{ data: PaymentSchedule }>(`${API_BASE}/payment-schedules/${id}/toggle`)
}

export async function deletePaymentSchedule(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/payment-schedules/${id}`)
}

// ==================== VENDOR PAYMENTS ====================

export async function fetchVendorPayments(
  filters: VendorPaymentFilters = {}
): Promise<PaginatedResponse<VendorPayment>> {
  const params = new URLSearchParams()

  if (filters.vendorId) params.set('vendorId', filters.vendorId)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<VendorPayment>>(
    `${API_BASE}/vendor-payments?${params.toString()}`
  )
}

export async function fetchVendorPayment(id: string): Promise<{ data: VendorPayment }> {
  return apiGet<{ data: VendorPayment }>(`${API_BASE}/vendor-payments/${id}`)
}

export async function createVendorPayment(
  data: CreateVendorPaymentRequest
): Promise<{ data: VendorPayment }> {
  return apiPost<{ data: VendorPayment }>(`${API_BASE}/vendor-payments`, data)
}

export async function updateVendorPayment(
  id: string,
  data: UpdateVendorPaymentRequest
): Promise<{ data: VendorPayment }> {
  return apiPut<{ data: VendorPayment }>(`${API_BASE}/vendor-payments/${id}`, data)
}

export async function approveVendorPayment(id: string): Promise<{ data: VendorPayment }> {
  return apiPatch<{ data: VendorPayment }>(`${API_BASE}/vendor-payments/${id}/approve`)
}

export async function rejectVendorPayment(
  id: string,
  reason: string
): Promise<{ data: VendorPayment }> {
  return apiPatch<{ data: VendorPayment }>(`${API_BASE}/vendor-payments/${id}/reject`, {
    reason,
  })
}

export async function processVendorPayment(
  id: string,
  data: ProcessVendorPaymentRequest
): Promise<{ data: VendorPayment }> {
  return apiPatch<{ data: VendorPayment }>(
    `${API_BASE}/vendor-payments/${id}/process`,
    data
  )
}

export async function cancelVendorPayment(
  id: string,
  reason?: string
): Promise<{ data: VendorPayment }> {
  return apiPatch<{ data: VendorPayment }>(`${API_BASE}/vendor-payments/${id}/cancel`, {
    reason,
  })
}

// ==================== SCHOLARSHIP SCHEMES ====================

export async function fetchScholarshipSchemes(
  filters: ScholarshipFilters = {}
): Promise<PaginatedResponse<ScholarshipScheme>> {
  const params = new URLSearchParams()

  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.academicYear) params.set('academicYear', filters.academicYear)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<ScholarshipScheme>>(
    `${API_BASE}/scholarship-schemes?${params.toString()}`
  )
}

export async function fetchScholarshipScheme(
  id: string
): Promise<{ data: ScholarshipScheme }> {
  return apiGet<{ data: ScholarshipScheme }>(`${API_BASE}/scholarship-schemes/${id}`)
}

export async function createScholarshipScheme(
  data: CreateScholarshipSchemeRequest
): Promise<{ data: ScholarshipScheme }> {
  return apiPost<{ data: ScholarshipScheme }>(`${API_BASE}/scholarship-schemes`, data)
}

export async function updateScholarshipScheme(
  id: string,
  data: UpdateScholarshipSchemeRequest
): Promise<{ data: ScholarshipScheme }> {
  return apiPut<{ data: ScholarshipScheme }>(`${API_BASE}/scholarship-schemes/${id}`, data)
}

export async function deleteScholarshipScheme(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`${API_BASE}/scholarship-schemes/${id}`)
}

// ==================== SCHOLARSHIP BENEFICIARIES ====================

export async function fetchScholarshipBeneficiaries(
  schemeId?: string
): Promise<{ data: ScholarshipBeneficiary[] }> {
  const params = new URLSearchParams()
  if (schemeId) params.set('schemeId', schemeId)

  return apiGet<{ data: ScholarshipBeneficiary[] }>(
    `${API_BASE}/scholarship-beneficiaries?${params.toString()}`
  )
}

export async function fetchScholarshipBeneficiary(
  id: string
): Promise<{ data: ScholarshipBeneficiary }> {
  return apiGet<{ data: ScholarshipBeneficiary }>(
    `${API_BASE}/scholarship-beneficiaries/${id}`
  )
}

export async function awardScholarship(
  data: AwardScholarshipRequest
): Promise<{ data: ScholarshipBeneficiary }> {
  return apiPost<{ data: ScholarshipBeneficiary }>(
    `${API_BASE}/scholarship-beneficiaries`,
    data
  )
}

export async function revokeScholarship(
  id: string,
  reason: string
): Promise<{ data: ScholarshipBeneficiary }> {
  return apiPatch<{ data: ScholarshipBeneficiary }>(
    `${API_BASE}/scholarship-beneficiaries/${id}/revoke`,
    { reason }
  )
}

// ==================== SCHOLARSHIP DISBURSEMENTS ====================

export async function fetchScholarshipDisbursements(
  filters: DisbursementFilters = {}
): Promise<PaginatedResponse<ScholarshipDisbursement>> {
  const params = new URLSearchParams()

  if (filters.schemeId) params.set('schemeId', filters.schemeId)
  if (filters.studentId) params.set('studentId', filters.studentId)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet<PaginatedResponse<ScholarshipDisbursement>>(
    `${API_BASE}/scholarship-disbursements?${params.toString()}`
  )
}

export async function fetchScholarshipDisbursement(
  id: string
): Promise<{ data: ScholarshipDisbursement }> {
  return apiGet<{ data: ScholarshipDisbursement }>(
    `${API_BASE}/scholarship-disbursements/${id}`
  )
}

export async function createDisbursement(
  data: CreateDisbursementRequest
): Promise<{ data: ScholarshipDisbursement }> {
  return apiPost<{ data: ScholarshipDisbursement }>(
    `${API_BASE}/scholarship-disbursements`,
    data
  )
}

export async function approveDisbursement(
  id: string
): Promise<{ data: ScholarshipDisbursement }> {
  return apiPatch<{ data: ScholarshipDisbursement }>(
    `${API_BASE}/scholarship-disbursements/${id}/approve`
  )
}

export async function processDisbursement(
  id: string,
  data: ProcessDisbursementRequest
): Promise<{ data: ScholarshipDisbursement }> {
  return apiPatch<{ data: ScholarshipDisbursement }>(
    `${API_BASE}/scholarship-disbursements/${id}/process`,
    data
  )
}

export async function holdDisbursement(
  id: string,
  reason: string
): Promise<{ data: ScholarshipDisbursement }> {
  return apiPatch<{ data: ScholarshipDisbursement }>(
    `${API_BASE}/scholarship-disbursements/${id}/hold`,
    { reason }
  )
}

export async function cancelDisbursement(
  id: string,
  reason: string
): Promise<{ data: ScholarshipDisbursement }> {
  return apiPatch<{ data: ScholarshipDisbursement }>(
    `${API_BASE}/scholarship-disbursements/${id}/cancel`,
    { reason }
  )
}

export async function fetchScholarshipSummary(): Promise<{ data: ScholarshipSummary }> {
  return apiGet<{ data: ScholarshipSummary }>(`${API_BASE}/scholarship-summary`)
}
