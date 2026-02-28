import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchMyFees,
  fetchMyChildrenFees,
  fetchMyPayments,
  fetchFeeTypes,
  createFeeType,
  updateFeeType,
  deleteFeeType,
  fetchFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  fetchStudentFees,
  fetchStudentFeesById,
  fetchPayments,
  collectPayment,
  fetchReceipt,
  deleteReceipt,
  fetchOutstandingDues,
  fetchOutstandingSummary,
  sendReminders,
  fetchExpenses,
  fetchExpense,
  createExpense,
  updateExpense,
  approveExpense,
  rejectExpense,
  markExpensePaid,
  deleteExpense,
  fetchLedger,
  fetchLedgerBalance,
  deleteLedgerEntry,
  fetchCollectionReport,
  fetchDueReport,
  fetchFinancialSummary,
  fetchFinanceStats,
  fetchInstallmentPlans,
  fetchInstallmentPlan,
  createInstallmentPlan,
  toggleInstallmentPlan,
  deleteInstallmentPlan,
  fetchDiscountRules,
  createDiscountRule,
  updateDiscountRule,
  toggleDiscountRule,
  deleteDiscountRule,
  fetchAppliedDiscounts,
  fetchConcessionRequests,
  createConcessionRequest,
  approveConcession,
  rejectConcession,
  fetchEscalationConfig,
  updateEscalationConfig,
  fetchReminderLogs,
  fetchOnlinePaymentConfig,
  updateOnlinePaymentConfig,
  fetchOnlinePaymentOrders,
  createPaymentOrder,
  fetchParentFeeDashboard,
} from '../api/finance.api'
import type {
  CreateFeeTypeRequest,
  UpdateFeeTypeRequest,
  FeeStructureFilters,
  CreateFeeStructureRequest,
  UpdateFeeStructureRequest,
  StudentFeeFilters,
  PaymentFilters,
  CollectPaymentRequest,
  OutstandingFilters,
  SendReminderRequest,
  ExpenseFilters,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ApproveExpenseRequest,
  RejectExpenseRequest,
  MarkExpensePaidRequest,
  LedgerFilters,
  CreateInstallmentPlanRequest,
  CreateDiscountRuleRequest,
  CreateConcessionRequest,
  UpdateEscalationConfigRequest,
  OnlinePaymentConfig,
  CreatePaymentOrderRequest,
} from '../types/finance.types'

// ==================== QUERY KEYS ====================

export const financeKeys = {
  all: ['finance'] as const,

  // User-scoped
  myFees: () => [...financeKeys.all, 'my-fees'] as const,
  myChildrenFees: () => [...financeKeys.all, 'my-children-fees'] as const,
  myPayments: () => [...financeKeys.all, 'my-payments'] as const,

  // Fee Types
  feeTypes: () => [...financeKeys.all, 'fee-types'] as const,

  // Fee Structures
  feeStructures: () => [...financeKeys.all, 'fee-structures'] as const,
  feeStructuresList: (filters: FeeStructureFilters) =>
    [...financeKeys.feeStructures(), filters] as const,

  // Student Fees
  studentFees: () => [...financeKeys.all, 'student-fees'] as const,
  studentFeesList: (filters: StudentFeeFilters) =>
    [...financeKeys.studentFees(), filters] as const,
  studentFeesById: (studentId: string) =>
    [...financeKeys.studentFees(), 'student', studentId] as const,

  // Payments
  payments: () => [...financeKeys.all, 'payments'] as const,
  paymentsList: (filters: PaymentFilters) =>
    [...financeKeys.payments(), filters] as const,
  receipt: (receiptNumber: string) =>
    [...financeKeys.payments(), 'receipt', receiptNumber] as const,

  // Outstanding
  outstanding: () => [...financeKeys.all, 'outstanding'] as const,
  outstandingList: (filters: OutstandingFilters) =>
    [...financeKeys.outstanding(), filters] as const,
  outstandingSummary: () => [...financeKeys.outstanding(), 'summary'] as const,

  // Expenses
  expenses: () => [...financeKeys.all, 'expenses'] as const,
  expensesList: (filters: ExpenseFilters) =>
    [...financeKeys.expenses(), filters] as const,
  expense: (id: string) => [...financeKeys.expenses(), id] as const,

  // Ledger
  ledger: () => [...financeKeys.all, 'ledger'] as const,
  ledgerList: (filters: LedgerFilters) =>
    [...financeKeys.ledger(), filters] as const,
  ledgerBalance: () => [...financeKeys.ledger(), 'balance'] as const,

  // Reports
  reports: () => [...financeKeys.all, 'reports'] as const,
  collectionReport: (dateFrom: string, dateTo: string) =>
    [...financeKeys.reports(), 'collection', dateFrom, dateTo] as const,
  dueReport: () => [...financeKeys.reports(), 'dues'] as const,
  financialSummary: (academicYear: string) =>
    [...financeKeys.reports(), 'summary', academicYear] as const,

  // Stats
  stats: () => [...financeKeys.all, 'stats'] as const,

  // Installment Plans
  installmentPlans: () => [...financeKeys.all, 'installment-plans'] as const,
  installmentPlansList: (academicYear?: string) =>
    [...financeKeys.installmentPlans(), academicYear] as const,
  installmentPlanDetail: (id: string) =>
    [...financeKeys.installmentPlans(), 'detail', id] as const,

  // Discount Rules
  discountRules: () => [...financeKeys.all, 'discount-rules'] as const,
  appliedDiscounts: (filters?: { studentId?: string; ruleId?: string }) =>
    [...financeKeys.all, 'applied-discounts', filters] as const,

  // Concession Requests
  concessions: () => [...financeKeys.all, 'concessions'] as const,
  concessionsList: (status?: string) =>
    [...financeKeys.concessions(), status] as const,

  // Escalation Config
  escalationConfig: () => [...financeKeys.all, 'escalation-config'] as const,
  reminderLogs: () => [...financeKeys.all, 'reminder-logs'] as const,
  reminderLogsList: (filters?: { channel?: string; status?: string }) =>
    [...financeKeys.reminderLogs(), filters] as const,

  // Online Payment
  onlinePaymentConfig: () => [...financeKeys.all, 'online-payment-config'] as const,
  onlinePaymentOrders: () => [...financeKeys.all, 'online-payment-orders'] as const,
  onlinePaymentOrdersList: (filters?: { status?: string }) =>
    [...financeKeys.onlinePaymentOrders(), filters] as const,

  // Parent Dashboard
  parentDashboard: () => [...financeKeys.all, 'parent-dashboard'] as const,
}

// ==================== USER-SCOPED HOOKS ====================

export function useMyFees() {
  return useQuery({
    queryKey: financeKeys.myFees(),
    queryFn: fetchMyFees,
  })
}

export function useMyChildrenFees() {
  return useQuery({
    queryKey: financeKeys.myChildrenFees(),
    queryFn: fetchMyChildrenFees,
  })
}

export function useMyPayments() {
  return useQuery({
    queryKey: financeKeys.myPayments(),
    queryFn: fetchMyPayments,
  })
}

// ==================== FEE TYPE HOOKS ====================

export function useFeeTypes() {
  return useQuery({
    queryKey: financeKeys.feeTypes(),
    queryFn: fetchFeeTypes,
  })
}

export function useCreateFeeType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFeeTypeRequest) => createFeeType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.feeTypes() })
    },
  })
}

export function useUpdateFeeType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeeTypeRequest }) =>
      updateFeeType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.feeTypes() })
    },
  })
}

export function useDeleteFeeType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteFeeType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.feeTypes() })
    },
  })
}

// ==================== FEE STRUCTURE HOOKS ====================

export function useFeeStructures(filters: FeeStructureFilters = {}) {
  return useQuery({
    queryKey: financeKeys.feeStructuresList(filters),
    queryFn: () => fetchFeeStructures(filters),
  })
}

export function useCreateFeeStructure() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFeeStructureRequest) => createFeeStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.feeStructures() })
    },
  })
}

export function useUpdateFeeStructure() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeeStructureRequest }) =>
      updateFeeStructure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.feeStructures() })
    },
  })
}

export function useDeleteFeeStructure() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteFeeStructure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.feeStructures() })
    },
  })
}

// ==================== STUDENT FEE HOOKS ====================

export function useStudentFees(filters: StudentFeeFilters = {}) {
  return useQuery({
    queryKey: financeKeys.studentFeesList(filters),
    queryFn: () => fetchStudentFees(filters),
  })
}

export function useStudentFeesById(studentId: string) {
  return useQuery({
    queryKey: financeKeys.studentFeesById(studentId),
    queryFn: () => fetchStudentFeesById(studentId),
    enabled: !!studentId,
  })
}

// ==================== PAYMENT HOOKS ====================

export function usePayments(filters: PaymentFilters = {}) {
  return useQuery({
    queryKey: financeKeys.paymentsList(filters),
    queryFn: () => fetchPayments(filters),
  })
}

export function useCollectPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CollectPaymentRequest) => collectPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.payments() })
      queryClient.invalidateQueries({ queryKey: financeKeys.studentFees() })
      // Also invalidate specific student fees query for immediate UI update
      if (variables.studentId) {
        queryClient.invalidateQueries({ queryKey: financeKeys.studentFeesById(variables.studentId) })
      }
      queryClient.invalidateQueries({ queryKey: financeKeys.outstanding() })
      queryClient.invalidateQueries({ queryKey: financeKeys.ledger() })
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() })
    },
  })
}

export function useReceipt(receiptNumber: string) {
  return useQuery({
    queryKey: financeKeys.receipt(receiptNumber),
    queryFn: () => fetchReceipt(receiptNumber),
    enabled: !!receiptNumber,
  })
}

export function useDeleteReceipt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (receiptNumber: string) => deleteReceipt(receiptNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.payments() })
      queryClient.invalidateQueries({ queryKey: financeKeys.studentFees() })
      queryClient.invalidateQueries({ queryKey: financeKeys.ledger() })
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() })
    },
  })
}

// ==================== OUTSTANDING HOOKS ====================

export function useOutstandingDues(filters: OutstandingFilters = {}) {
  return useQuery({
    queryKey: financeKeys.outstandingList(filters),
    queryFn: () => fetchOutstandingDues(filters),
  })
}

export function useOutstandingSummary() {
  return useQuery({
    queryKey: financeKeys.outstandingSummary(),
    queryFn: fetchOutstandingSummary,
  })
}

export function useSendReminders() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendReminderRequest) => sendReminders(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.outstanding() })
    },
  })
}

// ==================== EXPENSE HOOKS ====================

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey: financeKeys.expensesList(filters),
    queryFn: () => fetchExpenses(filters),
  })
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: financeKeys.expense(id),
    queryFn: () => fetchExpense(id),
    enabled: !!id,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses() })
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
      updateExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expense(variables.id) })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses() })
    },
  })
}

export function useApproveExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveExpenseRequest }) =>
      approveExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expense(variables.id) })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses() })
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() })
    },
  })
}

export function useRejectExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectExpenseRequest }) =>
      rejectExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expense(variables.id) })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses() })
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() })
    },
  })
}

export function useMarkExpensePaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: MarkExpensePaidRequest }) =>
      markExpensePaid(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expense(variables.id) })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses() })
      queryClient.invalidateQueries({ queryKey: financeKeys.ledger() })
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenses() })
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() })
    },
  })
}

// ==================== LEDGER HOOKS ====================

export function useLedger(filters: LedgerFilters = {}) {
  return useQuery({
    queryKey: financeKeys.ledgerList(filters),
    queryFn: () => fetchLedger(filters),
  })
}

export function useLedgerBalance() {
  return useQuery({
    queryKey: financeKeys.ledgerBalance(),
    queryFn: fetchLedgerBalance,
  })
}

export function useDeleteLedgerEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteLedgerEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.ledger() })
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() })
    },
  })
}

// ==================== REPORT HOOKS ====================

export function useCollectionReport(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: financeKeys.collectionReport(dateFrom, dateTo),
    queryFn: () => fetchCollectionReport(dateFrom, dateTo),
    enabled: !!dateFrom && !!dateTo,
  })
}

export function useDueReport() {
  return useQuery({
    queryKey: financeKeys.dueReport(),
    queryFn: fetchDueReport,
  })
}

export function useFinancialSummary(academicYear: string) {
  return useQuery({
    queryKey: financeKeys.financialSummary(academicYear),
    queryFn: () => fetchFinancialSummary(academicYear),
    enabled: !!academicYear,
  })
}

export function useFinanceStats() {
  return useQuery({
    queryKey: financeKeys.stats(),
    queryFn: fetchFinanceStats,
  })
}

// ==================== INSTALLMENT PLAN HOOKS ====================

export function useInstallmentPlans(academicYear?: string) {
  return useQuery({
    queryKey: financeKeys.installmentPlansList(academicYear),
    queryFn: () => fetchInstallmentPlans(academicYear),
  })
}

export function useInstallmentPlan(id: string) {
  return useQuery({
    queryKey: financeKeys.installmentPlanDetail(id),
    queryFn: () => fetchInstallmentPlan(id),
    enabled: !!id,
  })
}

export function useCreateInstallmentPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInstallmentPlanRequest) => createInstallmentPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.installmentPlans() })
    },
  })
}

export function useToggleInstallmentPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleInstallmentPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.installmentPlans() })
    },
  })
}

export function useDeleteInstallmentPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteInstallmentPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.installmentPlans() })
    },
  })
}

// ==================== DISCOUNT RULE HOOKS ====================

export function useDiscountRules() {
  return useQuery({
    queryKey: financeKeys.discountRules(),
    queryFn: fetchDiscountRules,
  })
}

export function useCreateDiscountRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDiscountRuleRequest) => createDiscountRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.discountRules() })
    },
  })
}

export function useUpdateDiscountRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDiscountRuleRequest> }) =>
      updateDiscountRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.discountRules() })
    },
  })
}

export function useToggleDiscountRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleDiscountRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.discountRules() })
    },
  })
}

export function useDeleteDiscountRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDiscountRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.discountRules() })
    },
  })
}

export function useAppliedDiscounts(filters: { studentId?: string; ruleId?: string } = {}) {
  return useQuery({
    queryKey: financeKeys.appliedDiscounts(filters),
    queryFn: () => fetchAppliedDiscounts(filters),
  })
}

// ==================== CONCESSION HOOKS ====================

export function useConcessionRequests(status?: string) {
  return useQuery({
    queryKey: financeKeys.concessionsList(status),
    queryFn: () => fetchConcessionRequests(status),
  })
}

export function useCreateConcession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateConcessionRequest) => createConcessionRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.concessions() })
    },
  })
}

export function useApproveConcession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => approveConcession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.concessions() })
      queryClient.invalidateQueries({ queryKey: financeKeys.studentFees() })
    },
  })
}

export function useRejectConcession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectConcession(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.concessions() })
    },
  })
}

// ==================== ESCALATION HOOKS ====================

export function useEscalationConfig() {
  return useQuery({
    queryKey: financeKeys.escalationConfig(),
    queryFn: fetchEscalationConfig,
  })
}

export function useUpdateEscalationConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateEscalationConfigRequest) => updateEscalationConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.escalationConfig() })
    },
  })
}

export function useReminderLogs(
  filters: { channel?: string; status?: string; page?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: financeKeys.reminderLogsList(filters),
    queryFn: () => fetchReminderLogs(filters),
  })
}

// ==================== ONLINE PAYMENT HOOKS ====================

export function useOnlinePaymentConfig() {
  return useQuery({
    queryKey: financeKeys.onlinePaymentConfig(),
    queryFn: fetchOnlinePaymentConfig,
  })
}

export function useUpdateOnlinePaymentConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<OnlinePaymentConfig>) => updateOnlinePaymentConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.onlinePaymentConfig() })
    },
  })
}

export function useOnlinePaymentOrders(
  filters: { status?: string; page?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: financeKeys.onlinePaymentOrdersList(filters),
    queryFn: () => fetchOnlinePaymentOrders(filters),
  })
}

export function useCreatePaymentOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentOrderRequest) => createPaymentOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.onlinePaymentOrders() })
    },
  })
}

// ==================== PARENT DASHBOARD HOOKS ====================

export function useParentFeeDashboard() {
  return useQuery({
    queryKey: financeKeys.parentDashboard(),
    queryFn: fetchParentFeeDashboard,
  })
}
