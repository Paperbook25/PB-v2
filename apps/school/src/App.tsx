import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { ModuleSidebar } from '@/components/layout/ModuleSidebar'
import { Toaster } from '@/components/ui/toaster'
import { PageLoader } from '@/components/ui/lazy-loader'
import { useAuthStore } from '@/stores/useAuthStore'
// ALL_ROLES kept for reference: ['admin', 'principal', 'teacher', 'accountant', 'librarian', 'transport_manager', 'student', 'parent']
import { setQueryClient } from '@/lib/prefetch'
import { TenantProvider, useTenant } from '@/context/TenantContext'
import { SchoolNotFoundPage } from '@/features/tenant/pages/SchoolNotFoundPage'
import { SchoolSuspendedPage } from '@/features/tenant/pages/SchoolSuspendedPage'
import { TenantLoadingPage } from '@/features/tenant/pages/TenantLoadingPage'
import type { Role } from '@/types/common.types'

// Eagerly load LoginPage for fast initial render
import { LoginPage } from '@/features/auth/pages/LoginPage'

// Lazy load all other pages for code splitting
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const StudentDashboard = lazy(() => import('@/features/dashboard/pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })))
const ParentDashboard = lazy(() => import('@/features/dashboard/pages/ParentDashboard').then(m => ({ default: m.ParentDashboard })))
const TeacherDashboard = lazy(() => import('@/features/dashboard/pages/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })))
const AccountantDashboard = lazy(() => import('@/features/dashboard/pages/AccountantDashboard').then(m => ({ default: m.AccountantDashboard })))
const LibrarianDashboard = lazy(() => import('@/features/dashboard/pages/LibrarianDashboard').then(m => ({ default: m.LibrarianDashboard })))
const TransportManagerDashboard = lazy(() => import('@/features/dashboard/pages/TransportManagerDashboard').then(m => ({ default: m.TransportManagerDashboard })))

// Students
const StudentsListPage = lazy(() => import('@/features/students/pages/StudentsListPage').then(m => ({ default: m.StudentsListPage })))
const StudentDetailPage = lazy(() => import('@/features/students/pages/StudentDetailPage').then(m => ({ default: m.StudentDetailPage })))
const NewStudentPage = lazy(() => import('@/features/students/pages/NewStudentPage').then(m => ({ default: m.NewStudentPage })))
const EditStudentPage = lazy(() => import('@/features/students/pages/EditStudentPage').then(m => ({ default: m.EditStudentPage })))

// Staff
const StaffPage = lazy(() => import('@/features/staff/pages/StaffPage').then(m => ({ default: m.StaffPage })))
const StaffDetailPage = lazy(() => import('@/features/staff/pages/StaffDetailPage').then(m => ({ default: m.StaffDetailPage })))
const NewStaffPage = lazy(() => import('@/features/staff/pages/NewStaffPage').then(m => ({ default: m.NewStaffPage })))
const EditStaffPage = lazy(() => import('@/features/staff/pages/EditStaffPage').then(m => ({ default: m.EditStaffPage })))

// Attendance
const AttendancePage = lazy(() => import('@/features/attendance/pages/AttendancePage').then(m => ({ default: m.AttendancePage })))
const LeaveApplicationPage = lazy(() => import('@/features/attendance/pages/LeaveApplicationPage').then(m => ({ default: m.LeaveApplicationPage })))

// Admissions
const AdmissionsMainPage = lazy(() => import('@/features/admissions/pages/AdmissionsMainPage').then(m => ({ default: m.AdmissionsMainPage })))
const ApplicationDetailPage = lazy(() => import('@/features/admissions/pages/ApplicationDetailPage').then(m => ({ default: m.ApplicationDetailPage })))
const NewApplicationPage = lazy(() => import('@/features/admissions/pages/NewApplicationPage').then(m => ({ default: m.NewApplicationPage })))
const PublicApplicationPage = lazy(() => import('@/features/admissions/pages/PublicApplicationPage').then(m => ({ default: m.PublicApplicationPage })))

// Library
const LibraryPage = lazy(() => import('@/features/library/pages/LibraryPage').then(m => ({ default: m.LibraryPage })))

// Transport
const TrackingPage = lazy(() => import('@/features/transport/pages/TrackingPage').then(m => ({ default: m.TrackingPage })))

// Finance
const FinancePage = lazy(() => import('@/features/finance/pages/FinancePage').then(m => ({ default: m.FinancePage })))
const InstallmentPlansPage = lazy(() => import('@/features/finance/pages/InstallmentPlansPage').then(m => ({ default: m.InstallmentPlansPage })))
const DiscountRulesPage = lazy(() => import('@/features/finance/pages/DiscountRulesPage').then(m => ({ default: m.DiscountRulesPage })))
const ConcessionsPage = lazy(() => import('@/features/finance/pages/ConcessionsPage').then(m => ({ default: m.ConcessionsPage })))
const EscalationPage = lazy(() => import('@/features/finance/pages/EscalationPage').then(m => ({ default: m.EscalationPage })))
const OnlinePaymentsPage = lazy(() => import('@/features/finance/pages/OnlinePaymentsPage').then(m => ({ default: m.OnlinePaymentsPage })))
const ParentFeeDashboardPage = lazy(() => import('@/features/finance/pages/ParentFeeDashboardPage').then(m => ({ default: m.ParentFeeDashboardPage })))

// Settings
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))

// Exams
const ExamsPage = lazy(() => import('@/features/exams/pages').then(m => ({ default: m.ExamsPage })))
const NewExamPage = lazy(() => import('@/features/exams/pages').then(m => ({ default: m.NewExamPage })))
const EditExamPage = lazy(() => import('@/features/exams/pages').then(m => ({ default: m.EditExamPage })))
const ExamDetailPage = lazy(() => import('@/features/exams/pages').then(m => ({ default: m.ExamDetailPage })))
const MarksEntryPage = lazy(() => import('@/features/exams/pages').then(m => ({ default: m.MarksEntryPage })))
const ExamTimetablePage = lazy(() => import('@/features/exams/pages/ExamTimetablePage').then(m => ({ default: m.ExamTimetablePage })))
const MarksAnalyticsPage = lazy(() => import('@/features/exams/pages/MarksAnalyticsPage').then(m => ({ default: m.MarksAnalyticsPage })))
const ProgressTrackingPage = lazy(() => import('@/features/exams/pages/ProgressTrackingPage').then(m => ({ default: m.ProgressTrackingPage })))
const CoScholasticPage = lazy(() => import('@/features/exams/pages/CoScholasticPage').then(m => ({ default: m.CoScholasticPage })))
const QuestionPapersPage = lazy(() => import('@/features/exams/pages/QuestionPapersPage').then(m => ({ default: m.QuestionPapersPage })))

// LMS
const LmsMainPage = lazy(() => import('@/features/lms/pages/LmsMainPage').then(m => ({ default: m.LmsMainPage })))
const NewCoursePage = lazy(() => import('@/features/lms/pages/NewCoursePage').then(m => ({ default: m.NewCoursePage })))
const CourseDetailPage = lazy(() => import('@/features/lms/pages/CourseDetailPage').then(m => ({ default: m.CourseDetailPage })))
const EditCoursePage = lazy(() => import('@/features/lms/pages/EditCoursePage').then(m => ({ default: m.EditCoursePage })))
const StudentCoursePage = lazy(() => import('@/features/lms/pages/StudentCoursePage').then(m => ({ default: m.StudentCoursePage })))

// Visitors
const VisitorsMainPage = lazy(() => import('@/features/visitors').then(m => ({ default: m.VisitorsMainPage })))

// Inventory
const CreatePurchaseOrderPage = lazy(() => import('@/features/inventory').then(m => ({ default: m.CreatePurchaseOrderPage })))

// Alumni
const AlumniMainPage = lazy(() => import('@/features/alumni').then(m => ({ default: m.AlumniMainPage })))

// Management
const ManagementPage = lazy(() => import('@/features/management').then(m => ({ default: m.ManagementPage })))

// Operations
const OperationsPage = lazy(() => import('@/features/operations').then(m => ({ default: m.OperationsPage })))

// People
const PeoplePage = lazy(() => import('@/features/people').then(m => ({ default: m.PeoplePage })))

// Communication
const NewAnnouncementPage = lazy(() => import('@/features/communication/pages/NewAnnouncementPage').then(m => ({ default: m.NewAnnouncementPage })))
const NewSurveyPage = lazy(() => import('@/features/communication/pages/NewSurveyPage').then(m => ({ default: m.NewSurveyPage })))

// Behavior
const BehaviorMainPage = lazy(() => import('@/features/behavior/pages/BehaviorMainPage').then(m => ({ default: m.BehaviorMainPage })))

// Reports
const ReportsMainPage = lazy(() => import('@/features/reports/pages/ReportsMainPage').then(m => ({ default: m.ReportsMainPage })))
const NewReportPage = lazy(() => import('@/features/reports/pages/NewReportPage').then(m => ({ default: m.NewReportPage })))

// Timetable
const TimetablePage = lazy(() => import('@/features/timetable').then(m => ({ default: m.TimetablePage })))

// Parent Portal
const ParentPortalPage = lazy(() => import('@/features/parent-portal').then(m => ({ default: m.ParentPortalPage })))

// Documents
const DocumentsPage = lazy(() => import('@/features/documents').then(m => ({ default: m.DocumentsPage })))

// School Website
const SchoolWebsiteBuilderPage = lazy(() => import('@/features/school-website/pages/SchoolWebsiteBuilderPage').then(m => ({ default: m.SchoolWebsiteBuilderPage })))
const PublicSchoolPage = lazy(() => import('@/features/school-website/pages/PublicSchoolPage').then(m => ({ default: m.PublicSchoolPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000,  // 15 minutes
      gcTime: 30 * 60 * 1000,     // 30 minutes cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Initialize prefetch utility with the query client
setQueryClient(queryClient)

function useSessionRefresh() {
  const { isAuthenticated, login, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/me', { credentials: 'include' })
      .then(async (res) => {
        if (res.ok) {
          const me = await res.json()
          login({ id: me.id, name: me.name, email: me.email, role: me.role })
        } else if (res.status === 401) {
          logout('session_expired')
        }
      })
      .catch(() => {}) // silent — use cached data
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

/** Single authenticated layout — ModuleSidebar handles all nav switching */
function AuthLayout() {
  const { isAuthenticated } = useAuthStore()
  useSessionRefresh()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppShell sidebar={<ModuleSidebar />}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  )
}

/** Role gate for use inside layout routes (no AppShell wrapping) */
function RoleGate({ allowedRoles, children }: { allowedRoles: Role[], children: React.ReactNode }) {
  const { hasRole } = useAuthStore()

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Role-based dashboard selector
function RoleDashboard() {
  const { user } = useAuthStore()

  if (user?.role === 'student') {
    return <StudentDashboard />
  }

  if (user?.role === 'parent') {
    return <ParentDashboard />
  }

  if (user?.role === 'teacher') {
    return <TeacherDashboard />
  }

  if (user?.role === 'accountant') {
    return <AccountantDashboard />
  }

  if (user?.role === 'librarian') {
    return <LibrarianDashboard />
  }

  if (user?.role === 'transport_manager') {
    return <TransportManagerDashboard />
  }

  // Default to admin/principal dashboard
  return <DashboardPage />
}

// Wrap component with Suspense for lazy loading
function LazyRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

/**
 * TenantGate: if a subdomain is present, gate the entire app on tenant resolution.
 * - Loading → show spinner
 * - Not found → show 404 page
 * - Suspended → show suspended page
 * - Valid → render children (the actual app)
 * - No subdomain (localhost) → render children directly (no tenant enforcement)
 */
function TenantGate({ children }: { children: React.ReactNode }) {
  const { slug, loading, notFound, suspended } = useTenant()

  // No subdomain → localhost / admin portal → no tenant gate
  if (!slug) return <>{children}</>

  if (loading) return <TenantLoadingPage />
  if (notFound) return <SchoolNotFoundPage />
  if (suspended) return <SchoolSuspendedPage />

  return <>{children}</>
}

export default function App() {
  return (
    <TenantProvider>
    <QueryClientProvider client={queryClient}>
      <TenantGate>
      <BrowserRouter>
        <Toaster />
        <Routes>
          {/* Public routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/apply" element={<LazyRoute><PublicApplicationPage /></LazyRoute>} />
          <Route path="/s/:slug" element={<LazyRoute><PublicSchoolPage /></LazyRoute>} />

          {/* ============================================
              Single authenticated layout — ModuleSidebar
              handles all nav context switching
              ============================================ */}
          <Route element={<AuthLayout />}>
            <Route path="/" element={<RoleDashboard />} />

            {/* People */}
            <Route path="/people" element={<PeoplePage />} />

            {/* Students */}
            <Route path="/students" element={<Navigate to="/people?tab=students&subtab=list" replace />} />
            <Route path="/students/new" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><NewStudentPage /></RoleGate>} />
            <Route path="/students/:id" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><StudentDetailPage /></RoleGate>} />
            <Route path="/students/:id/edit" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><EditStudentPage /></RoleGate>} />

            {/* Staff */}
            <Route path="/staff" element={<Navigate to="/people?tab=staff&subtab=list" replace />} />
            <Route path="/staff/new" element={<RoleGate allowedRoles={['admin', 'principal']}><NewStaffPage /></RoleGate>} />
            <Route path="/staff/attendance" element={<Navigate to="/people?tab=staff&subtab=attendance" replace />} />
            <Route path="/staff/leave" element={<Navigate to="/people?tab=staff&subtab=leave" replace />} />
            <Route path="/staff/salary" element={<Navigate to="/people?tab=staff&subtab=payroll" replace />} />
            <Route path="/staff/timetable" element={<Navigate to="/people?tab=staff&subtab=timetable" replace />} />
            <Route path="/staff/substitutions" element={<Navigate to="/people?tab=staff&subtab=substitutions" replace />} />
            <Route path="/staff/:id" element={<RoleGate allowedRoles={['admin', 'principal']}><StaffDetailPage /></RoleGate>} />
            <Route path="/staff/:id/edit" element={<RoleGate allowedRoles={['admin', 'principal']}><EditStaffPage /></RoleGate>} />

            {/* Attendance redirects */}
            <Route path="/attendance" element={<Navigate to="/people?tab=attendance&subtab=mark" replace />} />
            <Route path="/attendance/periods" element={<Navigate to="/people?tab=attendance&subtab=period" replace />} />
            <Route path="/attendance/alerts" element={<Navigate to="/people?tab=attendance&subtab=alerts" replace />} />
            <Route path="/attendance/late" element={<Navigate to="/people?tab=attendance&subtab=late" replace />} />
            <Route path="/attendance/notifications" element={<Navigate to="/people?tab=attendance&subtab=notifications" replace />} />
            <Route path="/attendance/biometric" element={<Navigate to="/people?tab=attendance&subtab=biometric" replace />} />
            <Route path="/attendance/leave" element={<RoleGate allowedRoles={['parent', 'student']}><LeaveApplicationPage /></RoleGate>} />
            <Route path="/attendance/*" element={<Navigate to="/people?tab=attendance" replace />} />

            {/* Admissions */}
            <Route path="/admissions" element={<RoleGate allowedRoles={['admin', 'principal']}><AdmissionsMainPage /></RoleGate>} />
            <Route path="/admissions/new" element={<RoleGate allowedRoles={['admin', 'principal']}><NewApplicationPage /></RoleGate>} />
            <Route path="/admissions/pipeline" element={<Navigate to="/admissions?tab=pipeline" replace />} />
            <Route path="/admissions/entrance-exams" element={<Navigate to="/admissions?tab=entrance-exams" replace />} />
            <Route path="/admissions/waitlist" element={<Navigate to="/admissions?tab=waitlist" replace />} />
            <Route path="/admissions/communications" element={<Navigate to="/admissions?tab=communications" replace />} />
            <Route path="/admissions/payments" element={<Navigate to="/admissions?tab=payments" replace />} />
            <Route path="/admissions/analytics" element={<Navigate to="/admissions?tab=analytics" replace />} />
            <Route path="/admissions/:id" element={<RoleGate allowedRoles={['admin', 'principal']}><ApplicationDetailPage /></RoleGate>} />

            {/* Finance */}
            <Route path="/finance" element={<RoleGate allowedRoles={['admin', 'principal', 'accountant']}><FinancePage /></RoleGate>} />
            <Route path="/finance/installments" element={<RoleGate allowedRoles={['admin', 'principal', 'accountant']}><InstallmentPlansPage /></RoleGate>} />
            <Route path="/finance/discounts" element={<RoleGate allowedRoles={['admin', 'principal', 'accountant']}><DiscountRulesPage /></RoleGate>} />
            <Route path="/finance/concessions" element={<RoleGate allowedRoles={['admin', 'principal', 'accountant']}><ConcessionsPage /></RoleGate>} />
            <Route path="/finance/escalation" element={<RoleGate allowedRoles={['admin', 'principal', 'accountant']}><EscalationPage /></RoleGate>} />
            <Route path="/finance/online-payments" element={<RoleGate allowedRoles={['admin', 'principal', 'accountant']}><OnlinePaymentsPage /></RoleGate>} />
            <Route path="/finance/my-fees" element={<RoleGate allowedRoles={['parent', 'student']}><ParentFeeDashboardPage /></RoleGate>} />
            <Route path="/finance/*" element={<RoleGate allowedRoles={['admin', 'principal', 'accountant']}><FinancePage /></RoleGate>} />

            {/* Library */}
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/library/scanner" element={<Navigate to="/library?tab=scanner" replace />} />
            <Route path="/library/reservations" element={<Navigate to="/library?tab=reservations" replace />} />
            <Route path="/library/reading" element={<Navigate to="/library?tab=history" replace />} />
            <Route path="/library/digital" element={<Navigate to="/library?tab=digital" replace />} />
            <Route path="/library/notifications" element={<Navigate to="/library?tab=fines" replace />} />
            <Route path="/library/*" element={<LibraryPage />} />

            {/* Exams */}
            <Route path="/exams" element={<ExamsPage />} />
            <Route path="/exams/new" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><NewExamPage /></RoleGate>} />
            <Route path="/exams/timetable" element={<ExamTimetablePage />} />
            <Route path="/exams/analytics" element={<MarksAnalyticsPage />} />
            <Route path="/exams/progress" element={<ProgressTrackingPage />} />
            <Route path="/exams/co-scholastic" element={<CoScholasticPage />} />
            <Route path="/exams/question-papers" element={<QuestionPapersPage />} />
            <Route path="/exams/:id/edit" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><EditExamPage /></RoleGate>} />
            <Route path="/exams/:id" element={<ExamDetailPage />} />
            <Route path="/exams/:id/marks" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><MarksEntryPage /></RoleGate>} />

            {/* LMS */}
            <Route path="/lms" element={<LmsMainPage />} />
            <Route path="/lms/courses" element={<Navigate to="/lms?tab=courses" replace />} />
            <Route path="/lms/live-classes" element={<Navigate to="/lms?tab=live-classes" replace />} />
            <Route path="/lms/enrollments" element={<Navigate to="/lms?tab=enrollments" replace />} />
            <Route path="/lms/assignments" element={<Navigate to="/lms?tab=assignments" replace />} />
            <Route path="/lms/question-bank" element={<Navigate to="/lms?tab=question-bank" replace />} />
            <Route path="/lms/courses/new" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><NewCoursePage /></RoleGate>} />
            <Route path="/lms/courses/:id" element={<CourseDetailPage />} />
            <Route path="/lms/courses/:id/edit" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><EditCoursePage /></RoleGate>} />
            <Route path="/lms/courses/:id/learn" element={<StudentCoursePage />} />
            <Route path="/lms/*" element={<LmsMainPage />} />

            {/* Visitors */}
            <Route path="/visitors" element={<RoleGate allowedRoles={['admin', 'principal']}><VisitorsMainPage /></RoleGate>} />
            <Route path="/visitors/logs" element={<Navigate to="/visitors?tab=logs" replace />} />
            <Route path="/visitors/reports" element={<Navigate to="/visitors?tab=reports" replace />} />
            <Route path="/visitors/pre-approved" element={<Navigate to="/visitors?tab=preapproved" replace />} />
            <Route path="/visitors/*" element={<RoleGate allowedRoles={['admin', 'principal']}><VisitorsMainPage /></RoleGate>} />

            {/* Operations */}
            <Route path="/operations" element={<RoleGate allowedRoles={['admin', 'principal', 'transport_manager', 'accountant']}><OperationsPage /></RoleGate>} />
            <Route path="/operations/assets/purchase-orders/new" element={<RoleGate allowedRoles={['admin', 'principal', 'accountant']}><CreatePurchaseOrderPage /></RoleGate>} />
            <Route path="/operations/*" element={<RoleGate allowedRoles={['admin', 'principal', 'transport_manager', 'accountant']}><OperationsPage /></RoleGate>} />

            {/* Management */}
            <Route path="/management" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher', 'accountant']}><ManagementPage /></RoleGate>} />
            <Route path="/management/*" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher', 'accountant']}><ManagementPage /></RoleGate>} />

            {/* Settings */}
            <Route path="/settings" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><SettingsPage /></RoleGate>} />
            <Route path="/settings/*" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><SettingsPage /></RoleGate>} />

            {/* Integrations redirects */}
            <Route path="/integrations" element={<Navigate to="/settings?tab=integrations" replace />} />
            <Route path="/integrations/sms" element={<Navigate to="/settings?tab=integrations&subtab=sms" replace />} />
            <Route path="/integrations/email" element={<Navigate to="/settings?tab=integrations&subtab=email" replace />} />
            <Route path="/integrations/payment" element={<Navigate to="/settings?tab=integrations&subtab=payment" replace />} />
            <Route path="/integrations/whatsapp" element={<Navigate to="/settings?tab=integrations&subtab=whatsapp" replace />} />
            <Route path="/integrations/biometric" element={<Navigate to="/settings?tab=integrations&subtab=biometric" replace />} />
            <Route path="/integrations/webhooks" element={<Navigate to="/settings?tab=integrations&subtab=webhooks" replace />} />
            <Route path="/integrations/api-keys" element={<Navigate to="/settings?tab=integrations&subtab=api-keys" replace />} />
            <Route path="/integrations/*" element={<Navigate to="/settings?tab=integrations" replace />} />

            {/* Transport redirects */}
            <Route path="/transport" element={<Navigate to="/operations?tab=transport" replace />} />
            <Route path="/transport/tracking" element={<RoleGate allowedRoles={['admin', 'principal', 'transport_manager', 'parent', 'student']}><TrackingPage /></RoleGate>} />
            <Route path="/transport/vehicles" element={<Navigate to="/operations?tab=transport&subtab=vehicles" replace />} />
            <Route path="/transport/drivers" element={<Navigate to="/operations?tab=transport&subtab=drivers" replace />} />
            <Route path="/transport/stops" element={<Navigate to="/operations?tab=transport&subtab=stops" replace />} />
            <Route path="/transport/maintenance" element={<Navigate to="/operations?tab=transport&subtab=maintenance" replace />} />
            <Route path="/transport/notifications" element={<Navigate to="/operations?tab=transport&subtab=notifications" replace />} />
            <Route path="/transport/*" element={<Navigate to="/operations?tab=transport" replace />} />

            {/* Hostel redirects */}
            <Route path="/hostel" element={<Navigate to="/operations?tab=hostel" replace />} />
            <Route path="/hostel/rooms" element={<Navigate to="/operations?tab=hostel&subtab=rooms" replace />} />
            <Route path="/hostel/allocations" element={<Navigate to="/operations?tab=hostel&subtab=allocations" replace />} />
            <Route path="/hostel/fees" element={<Navigate to="/operations?tab=hostel&subtab=fees" replace />} />
            <Route path="/hostel/mess" element={<Navigate to="/operations?tab=hostel&subtab=mess" replace />} />
            <Route path="/hostel/attendance" element={<Navigate to="/operations?tab=hostel&subtab=attendance" replace />} />
            <Route path="/hostel/*" element={<Navigate to="/operations?tab=hostel" replace />} />

            {/* Inventory redirects */}
            <Route path="/inventory" element={<Navigate to="/operations?tab=assets" replace />} />
            <Route path="/inventory/assets" element={<Navigate to="/operations?tab=assets&subtab=assets" replace />} />
            <Route path="/inventory/stock" element={<Navigate to="/operations?tab=assets&subtab=stock" replace />} />
            <Route path="/inventory/purchase-orders" element={<Navigate to="/operations?tab=assets&subtab=purchase-orders" replace />} />
            <Route path="/inventory/vendors" element={<Navigate to="/operations?tab=assets&subtab=vendors" replace />} />
            <Route path="/inventory/purchase-orders/new" element={<Navigate to="/operations/assets/purchase-orders/new" replace />} />
            <Route path="/inventory/*" element={<Navigate to="/operations?tab=assets" replace />} />

            {/* Alumni redirects */}
            <Route path="/alumni" element={<Navigate to="/management?tab=alumni" replace />} />
            <Route path="/alumni/batches" element={<Navigate to="/management?tab=alumni&subtab=batches" replace />} />
            <Route path="/alumni/achievements" element={<Navigate to="/management?tab=alumni&subtab=achievements" replace />} />
            <Route path="/alumni/contributions" element={<Navigate to="/management?tab=alumni&subtab=contributions" replace />} />
            <Route path="/alumni/events" element={<Navigate to="/management?tab=alumni&subtab=events" replace />} />
            <Route path="/alumni/*" element={<Navigate to="/management?tab=alumni" replace />} />

            {/* Communication redirects */}
            <Route path="/communication" element={<Navigate to="/settings?tab=communication" replace />} />
            <Route path="/communication/announcements/new" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><NewAnnouncementPage /></RoleGate>} />
            <Route path="/communication/surveys/new" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><NewSurveyPage /></RoleGate>} />
            <Route path="/communication/announcements" element={<Navigate to="/settings?tab=communication&subtab=announcements" replace />} />
            <Route path="/communication/messages" element={<Navigate to="/settings?tab=communication&subtab=messages" replace />} />
            <Route path="/communication/circulars" element={<Navigate to="/settings?tab=communication&subtab=circulars" replace />} />
            <Route path="/communication/surveys" element={<Navigate to="/settings?tab=communication&subtab=surveys" replace />} />
            <Route path="/communication/alerts" element={<Navigate to="/settings?tab=communication&subtab=emergency" replace />} />
            <Route path="/communication/events" element={<Navigate to="/settings?tab=communication&subtab=events" replace />} />
            <Route path="/communication/*" element={<Navigate to="/settings?tab=communication" replace />} />

            {/* Behavior */}
            <Route path="/behavior" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><BehaviorMainPage /></RoleGate>} />
            <Route path="/behavior/incidents" element={<Navigate to="/behavior?tab=incidents" replace />} />
            <Route path="/behavior/detentions" element={<Navigate to="/behavior?tab=detentions" replace />} />
            <Route path="/behavior/actions" element={<Navigate to="/behavior?tab=dashboard" replace />} />
            <Route path="/behavior/points" element={<Navigate to="/behavior?tab=dashboard" replace />} />
            <Route path="/behavior/*" element={<RoleGate allowedRoles={['admin', 'principal', 'teacher']}><BehaviorMainPage /></RoleGate>} />

            {/* Reports */}
            <Route path="/reports" element={<RoleGate allowedRoles={['admin', 'principal', 'accountant']}><ReportsMainPage /></RoleGate>} />
            <Route path="/reports/new" element={<RoleGate allowedRoles={['admin', 'principal', 'accountant']}><NewReportPage /></RoleGate>} />
            <Route path="/reports/templates" element={<Navigate to="/reports?tab=templates" replace />} />
            <Route path="/reports/history" element={<Navigate to="/reports?tab=history" replace />} />
            <Route path="/reports/scheduled" element={<Navigate to="/reports?tab=scheduled" replace />} />
            <Route path="/reports/analytics" element={<Navigate to="/reports?tab=analytics" replace />} />
            <Route path="/reports/analytics/academic" element={<Navigate to="/reports?tab=analytics&subtab=academic" replace />} />
            <Route path="/reports/analytics/financial" element={<Navigate to="/reports?tab=analytics&subtab=financial" replace />} />
            <Route path="/reports/analytics/attendance" element={<Navigate to="/reports?tab=analytics&subtab=attendance" replace />} />
            <Route path="/reports/*" element={<RoleGate allowedRoles={['admin', 'principal', 'accountant']}><ReportsMainPage /></RoleGate>} />

            {/* Calendar */}
            <Route path="/calendar" element={<TimetablePage />} />
            <Route path="/calendar/*" element={<TimetablePage />} />
            <Route path="/timetable" element={<Navigate to="/calendar" replace />} />
            <Route path="/timetable/*" element={<Navigate to="/calendar" replace />} />

            {/* Parent Portal */}
            <Route path="/parent-portal" element={<RoleGate allowedRoles={['parent', 'teacher', 'admin', 'principal']}><ParentPortalPage /></RoleGate>} />
            <Route path="/parent-portal/*" element={<RoleGate allowedRoles={['parent', 'teacher', 'admin', 'principal']}><ParentPortalPage /></RoleGate>} />

            {/* School Website Builder */}
            <Route path="/school-website" element={<RoleGate allowedRoles={['admin', 'principal']}><SchoolWebsiteBuilderPage /></RoleGate>} />

            {/* Documents redirects */}
            <Route path="/documents" element={<Navigate to="/management?tab=docs" replace />} />
            <Route path="/documents/*" element={<Navigate to="/management?tab=docs" replace />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </TenantGate>
    </QueryClientProvider>
    </TenantProvider>
  )
}
