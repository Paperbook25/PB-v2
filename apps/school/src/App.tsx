import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from '@/components/ui/toaster'
import { PageLoader } from '@/components/ui/lazy-loader'
import { useAuthStore } from '@/stores/useAuthStore'
import { RoleProtectedRoute, ALL_ROLES } from '@/components/auth/RoleProtectedRoute'
import { setQueryClient } from '@/lib/prefetch'
import { TenantProvider, useTenant } from '@/context/TenantContext'
import { SchoolNotFoundPage } from '@/features/tenant/pages/SchoolNotFoundPage'
import { SchoolSuspendedPage } from '@/features/tenant/pages/SchoolSuspendedPage'
import { TenantLoadingPage } from '@/features/tenant/pages/TenantLoadingPage'

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <AppShell>{children}</AppShell>
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/apply" element={<LazyRoute><PublicApplicationPage /></LazyRoute>} />
          <Route path="/s/:slug" element={<LazyRoute><PublicSchoolPage /></LazyRoute>} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LazyRoute>
                  <RoleDashboard />
                </LazyRoute>
              </ProtectedRoute>
            }
          />

          {/* People (consolidated Students, Staff, Attendance) */}
          <Route
            path="/people"
            element={
              <RoleProtectedRoute allowedRoles={ALL_ROLES}>
                <LazyRoute><PeoplePage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Operations (consolidated Transport, Hostel, Assets) */}
          <Route
            path="/operations"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'transport_manager', 'accountant']}>
                <LazyRoute><OperationsPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          {/* Keep create PO as separate route under operations */}
          <Route
            path="/operations/assets/purchase-orders/new"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'accountant']}>
                <LazyRoute><CreatePurchaseOrderPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Students - Redirect to People module */}
          <Route
            path="/students"
            element={<Navigate to="/people?tab=students&subtab=list" replace />}
          />
          <Route
            path="/students/new"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><NewStudentPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/students/:id"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><StudentDetailPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/students/:id/edit"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><EditStudentPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Staff - Redirect to People module */}
          <Route
            path="/staff"
            element={<Navigate to="/people?tab=staff&subtab=list" replace />}
          />
          <Route
            path="/staff/new"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal']}>
                <LazyRoute><NewStaffPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          {/* Redirects from old staff routes to new People module URLs */}
          <Route
            path="/staff/attendance"
            element={<Navigate to="/people?tab=staff&subtab=attendance" replace />}
          />
          <Route
            path="/staff/leave"
            element={<Navigate to="/people?tab=staff&subtab=leave" replace />}
          />
          <Route
            path="/staff/salary"
            element={<Navigate to="/people?tab=staff&subtab=payroll" replace />}
          />
          <Route
            path="/staff/timetable"
            element={<Navigate to="/people?tab=staff&subtab=timetable" replace />}
          />
          <Route
            path="/staff/substitutions"
            element={<Navigate to="/people?tab=staff&subtab=substitutions" replace />}
          />
          <Route
            path="/staff/:id"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal']}>
                <LazyRoute><StaffDetailPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/staff/:id/edit"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal']}>
                <LazyRoute><EditStaffPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Attendance - Redirect to People module (except for student/parent My Attendance view) */}
          <Route
            path="/attendance"
            element={<Navigate to="/people?tab=attendance&subtab=mark" replace />}
          />
          {/* Redirects from old attendance routes to new People module URLs */}
          <Route
            path="/attendance/periods"
            element={<Navigate to="/people?tab=attendance&subtab=period" replace />}
          />
          <Route
            path="/attendance/alerts"
            element={<Navigate to="/people?tab=attendance&subtab=alerts" replace />}
          />
          <Route
            path="/attendance/late"
            element={<Navigate to="/people?tab=attendance&subtab=late" replace />}
          />
          <Route
            path="/attendance/notifications"
            element={<Navigate to="/people?tab=attendance&subtab=notifications" replace />}
          />
          <Route
            path="/attendance/biometric"
            element={<Navigate to="/people?tab=attendance&subtab=biometric" replace />}
          />
          {/* Keep /attendance/leave as separate route for parent/student */}
          <Route
            path="/attendance/leave"
            element={
              <RoleProtectedRoute allowedRoles={['parent', 'student']}>
                <LazyRoute><LeaveApplicationPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/attendance/*"
            element={<Navigate to="/people?tab=attendance" replace />}
          />

          {/* Admissions */}
          <Route
            path="/admissions"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal']}>
                <LazyRoute><AdmissionsMainPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admissions/new"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal']}>
                <LazyRoute><NewApplicationPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          {/* Redirects from old routes to new tab-based URLs */}
          <Route
            path="/admissions/pipeline"
            element={<Navigate to="/admissions?tab=pipeline" replace />}
          />
          <Route
            path="/admissions/entrance-exams"
            element={<Navigate to="/admissions?tab=entrance-exams" replace />}
          />
          <Route
            path="/admissions/waitlist"
            element={<Navigate to="/admissions?tab=waitlist" replace />}
          />
          <Route
            path="/admissions/communications"
            element={<Navigate to="/admissions?tab=communications" replace />}
          />
          <Route
            path="/admissions/payments"
            element={<Navigate to="/admissions?tab=payments" replace />}
          />
          <Route
            path="/admissions/analytics"
            element={<Navigate to="/admissions?tab=analytics" replace />}
          />
          <Route
            path="/admissions/:id"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal']}>
                <LazyRoute><ApplicationDetailPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Library */}
          <Route
            path="/library"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'librarian', 'teacher', 'student', 'parent']}>
                <LazyRoute><LibraryPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          {/* Redirects from old routes to new tab-based URLs */}
          <Route
            path="/library/scanner"
            element={<Navigate to="/library?tab=scanner" replace />}
          />
          <Route
            path="/library/reservations"
            element={<Navigate to="/library?tab=reservations" replace />}
          />
          <Route
            path="/library/reading"
            element={<Navigate to="/library?tab=history" replace />}
          />
          <Route
            path="/library/digital"
            element={<Navigate to="/library?tab=digital" replace />}
          />
          <Route
            path="/library/notifications"
            element={<Navigate to="/library?tab=fines" replace />}
          />
          <Route
            path="/library/*"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'librarian', 'teacher', 'student', 'parent']}>
                <LazyRoute><LibraryPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Transport - Redirect to Operations module */}
          <Route
            path="/transport"
            element={<Navigate to="/operations?tab=transport" replace />}
          />
          {/* Dedicated tracking page for parent/student access - keep as separate route */}
          <Route
            path="/transport/tracking"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'transport_manager', 'parent', 'student']}>
                <LazyRoute><TrackingPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          {/* Redirects from old transport routes to Operations module */}
          <Route
            path="/transport/vehicles"
            element={<Navigate to="/operations?tab=transport&subtab=vehicles" replace />}
          />
          <Route
            path="/transport/drivers"
            element={<Navigate to="/operations?tab=transport&subtab=drivers" replace />}
          />
          <Route
            path="/transport/stops"
            element={<Navigate to="/operations?tab=transport&subtab=stops" replace />}
          />
          <Route
            path="/transport/maintenance"
            element={<Navigate to="/operations?tab=transport&subtab=maintenance" replace />}
          />
          <Route
            path="/transport/notifications"
            element={<Navigate to="/operations?tab=transport&subtab=notifications" replace />}
          />
          <Route
            path="/transport/*"
            element={<Navigate to="/operations?tab=transport" replace />}
          />

          {/* Finance - Admin routes */}
          <Route
            path="/finance"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'accountant']}>
                <LazyRoute><FinancePage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/finance/installments"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'accountant']}>
                <LazyRoute><InstallmentPlansPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/finance/discounts"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'accountant']}>
                <LazyRoute><DiscountRulesPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/finance/concessions"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'accountant']}>
                <LazyRoute><ConcessionsPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/finance/escalation"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'accountant']}>
                <LazyRoute><EscalationPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/finance/online-payments"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'accountant']}>
                <LazyRoute><OnlinePaymentsPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          {/* Finance - Student/Parent fee dashboard */}
          <Route
            path="/finance/my-fees"
            element={
              <RoleProtectedRoute allowedRoles={['parent', 'student']}>
                <LazyRoute><ParentFeeDashboardPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/finance/*"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'accountant']}>
                <LazyRoute><FinancePage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Settings (includes General, Communication, Integrations sections) */}
          <Route
            path="/settings"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><SettingsPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/settings/*"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><SettingsPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Integrations - Redirect to Settings module */}
          <Route
            path="/integrations"
            element={<Navigate to="/settings?tab=integrations" replace />}
          />
          {/* Redirects from old integrations routes to Settings module */}
          <Route
            path="/integrations/sms"
            element={<Navigate to="/settings?tab=integrations&subtab=sms" replace />}
          />
          <Route
            path="/integrations/email"
            element={<Navigate to="/settings?tab=integrations&subtab=email" replace />}
          />
          <Route
            path="/integrations/payment"
            element={<Navigate to="/settings?tab=integrations&subtab=payment" replace />}
          />
          <Route
            path="/integrations/whatsapp"
            element={<Navigate to="/settings?tab=integrations&subtab=whatsapp" replace />}
          />
          <Route
            path="/integrations/biometric"
            element={<Navigate to="/settings?tab=integrations&subtab=biometric" replace />}
          />
          <Route
            path="/integrations/webhooks"
            element={<Navigate to="/settings?tab=integrations&subtab=webhooks" replace />}
          />
          <Route
            path="/integrations/api-keys"
            element={<Navigate to="/settings?tab=integrations&subtab=api-keys" replace />}
          />
          <Route
            path="/integrations/*"
            element={<Navigate to="/settings?tab=integrations" replace />}
          />

          {/* Exams */}
          <Route
            path="/exams"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher', 'student', 'parent']}>
                <LazyRoute><ExamsPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/exams/new"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><NewExamPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/exams/timetable"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher', 'student', 'parent']}>
                <LazyRoute><ExamTimetablePage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/exams/analytics"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher', 'student', 'parent']}>
                <LazyRoute><MarksAnalyticsPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/exams/progress"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher', 'student', 'parent']}>
                <LazyRoute><ProgressTrackingPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/exams/co-scholastic"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher', 'student', 'parent']}>
                <LazyRoute><CoScholasticPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/exams/question-papers"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher', 'student', 'parent']}>
                <LazyRoute><QuestionPapersPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/exams/:id/edit"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><EditExamPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/exams/:id"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher', 'student', 'parent']}>
                <LazyRoute><ExamDetailPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/exams/:id/marks"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><MarksEntryPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* LMS */}
          <Route
            path="/lms"
            element={
              <RoleProtectedRoute allowedRoles={ALL_ROLES}>
                <LazyRoute><LmsMainPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          {/* Redirects from old routes to new tab-based URLs */}
          <Route
            path="/lms/courses"
            element={<Navigate to="/lms?tab=courses" replace />}
          />
          <Route
            path="/lms/live-classes"
            element={<Navigate to="/lms?tab=live-classes" replace />}
          />
          <Route
            path="/lms/enrollments"
            element={<Navigate to="/lms?tab=enrollments" replace />}
          />
          <Route
            path="/lms/assignments"
            element={<Navigate to="/lms?tab=assignments" replace />}
          />
          <Route
            path="/lms/question-bank"
            element={<Navigate to="/lms?tab=question-bank" replace />}
          />
          {/* Keep detail routes as separate pages */}
          <Route
            path="/lms/courses/new"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><NewCoursePage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/lms/courses/:id"
            element={
              <RoleProtectedRoute allowedRoles={ALL_ROLES}>
                <LazyRoute><CourseDetailPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/lms/courses/:id/edit"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><EditCoursePage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/lms/courses/:id/learn"
            element={
              <RoleProtectedRoute allowedRoles={ALL_ROLES}>
                <LazyRoute><StudentCoursePage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/lms/*"
            element={
              <RoleProtectedRoute allowedRoles={ALL_ROLES}>
                <LazyRoute><LmsMainPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Hostel - Redirect to Operations module */}
          <Route
            path="/hostel"
            element={<Navigate to="/operations?tab=hostel" replace />}
          />
          {/* Redirects from old hostel routes to Operations module */}
          <Route
            path="/hostel/rooms"
            element={<Navigate to="/operations?tab=hostel&subtab=rooms" replace />}
          />
          <Route
            path="/hostel/allocations"
            element={<Navigate to="/operations?tab=hostel&subtab=allocations" replace />}
          />
          <Route
            path="/hostel/fees"
            element={<Navigate to="/operations?tab=hostel&subtab=fees" replace />}
          />
          <Route
            path="/hostel/mess"
            element={<Navigate to="/operations?tab=hostel&subtab=mess" replace />}
          />
          <Route
            path="/hostel/attendance"
            element={<Navigate to="/operations?tab=hostel&subtab=attendance" replace />}
          />
          <Route
            path="/hostel/*"
            element={<Navigate to="/operations?tab=hostel" replace />}
          />

          {/* Visitors */}
          <Route
            path="/visitors"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal']}>
                <LazyRoute><VisitorsMainPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          {/* Redirects from old routes to new tab-based URLs */}
          <Route
            path="/visitors/logs"
            element={<Navigate to="/visitors?tab=logs" replace />}
          />
          <Route
            path="/visitors/reports"
            element={<Navigate to="/visitors?tab=reports" replace />}
          />
          <Route
            path="/visitors/pre-approved"
            element={<Navigate to="/visitors?tab=preapproved" replace />}
          />
          <Route
            path="/visitors/*"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal']}>
                <LazyRoute><VisitorsMainPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Inventory - Redirect to Operations module (Assets tab) */}
          <Route
            path="/inventory"
            element={<Navigate to="/operations?tab=assets" replace />}
          />
          {/* Redirects from old inventory routes to Operations module */}
          <Route
            path="/inventory/assets"
            element={<Navigate to="/operations?tab=assets&subtab=assets" replace />}
          />
          <Route
            path="/inventory/stock"
            element={<Navigate to="/operations?tab=assets&subtab=stock" replace />}
          />
          <Route
            path="/inventory/purchase-orders"
            element={<Navigate to="/operations?tab=assets&subtab=purchase-orders" replace />}
          />
          <Route
            path="/inventory/vendors"
            element={<Navigate to="/operations?tab=assets&subtab=vendors" replace />}
          />
          {/* Keep create PO as separate route - redirect to new Operations path */}
          <Route
            path="/inventory/purchase-orders/new"
            element={<Navigate to="/operations/assets/purchase-orders/new" replace />}
          />
          <Route
            path="/inventory/*"
            element={<Navigate to="/operations?tab=assets" replace />}
          />

          {/* Alumni - Redirect to Management module */}
          <Route
            path="/alumni"
            element={<Navigate to="/management?tab=alumni" replace />}
          />
          {/* Redirects from old routes to Management module */}
          <Route
            path="/alumni/batches"
            element={<Navigate to="/management?tab=alumni&subtab=batches" replace />}
          />
          <Route
            path="/alumni/achievements"
            element={<Navigate to="/management?tab=alumni&subtab=achievements" replace />}
          />
          <Route
            path="/alumni/contributions"
            element={<Navigate to="/management?tab=alumni&subtab=contributions" replace />}
          />
          <Route
            path="/alumni/events"
            element={<Navigate to="/management?tab=alumni&subtab=events" replace />}
          />
          <Route
            path="/alumni/*"
            element={<Navigate to="/management?tab=alumni" replace />}
          />

          {/* Communication - Redirect to Settings module */}
          <Route
            path="/communication"
            element={<Navigate to="/settings?tab=communication" replace />}
          />
          {/* Keep separate routes for create pages */}
          <Route
            path="/communication/announcements/new"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><NewAnnouncementPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/communication/surveys/new"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><NewSurveyPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          {/* Redirects from old communication routes to Settings module */}
          <Route
            path="/communication/announcements"
            element={<Navigate to="/settings?tab=communication&subtab=announcements" replace />}
          />
          <Route
            path="/communication/messages"
            element={<Navigate to="/settings?tab=communication&subtab=messages" replace />}
          />
          <Route
            path="/communication/circulars"
            element={<Navigate to="/settings?tab=communication&subtab=circulars" replace />}
          />
          <Route
            path="/communication/surveys"
            element={<Navigate to="/settings?tab=communication&subtab=surveys" replace />}
          />
          <Route
            path="/communication/alerts"
            element={<Navigate to="/settings?tab=communication&subtab=emergency" replace />}
          />
          <Route
            path="/communication/events"
            element={<Navigate to="/settings?tab=communication&subtab=events" replace />}
          />
          <Route
            path="/communication/*"
            element={<Navigate to="/settings?tab=communication" replace />}
          />

          {/* Behavior & Discipline */}
          <Route
            path="/behavior"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><BehaviorMainPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          {/* Redirects from old routes to new tab-based URLs */}
          <Route
            path="/behavior/incidents"
            element={<Navigate to="/behavior?tab=incidents" replace />}
          />
          <Route
            path="/behavior/detentions"
            element={<Navigate to="/behavior?tab=detentions" replace />}
          />
          <Route
            path="/behavior/actions"
            element={<Navigate to="/behavior?tab=dashboard" replace />}
          />
          <Route
            path="/behavior/points"
            element={<Navigate to="/behavior?tab=dashboard" replace />}
          />
          <Route
            path="/behavior/*"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher']}>
                <LazyRoute><BehaviorMainPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Reports & Analytics */}
          <Route
            path="/reports"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'accountant']}>
                <LazyRoute><ReportsMainPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/reports/new"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'accountant']}>
                <LazyRoute><NewReportPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          {/* Redirects from old routes to new tab-based URLs */}
          <Route
            path="/reports/templates"
            element={<Navigate to="/reports?tab=templates" replace />}
          />
          <Route
            path="/reports/history"
            element={<Navigate to="/reports?tab=history" replace />}
          />
          <Route
            path="/reports/scheduled"
            element={<Navigate to="/reports?tab=scheduled" replace />}
          />
          <Route
            path="/reports/analytics"
            element={<Navigate to="/reports?tab=analytics" replace />}
          />
          <Route
            path="/reports/analytics/academic"
            element={<Navigate to="/reports?tab=analytics&subtab=academic" replace />}
          />
          <Route
            path="/reports/analytics/financial"
            element={<Navigate to="/reports?tab=analytics&subtab=financial" replace />}
          />
          <Route
            path="/reports/analytics/attendance"
            element={<Navigate to="/reports?tab=analytics&subtab=attendance" replace />}
          />
          <Route
            path="/reports/*"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'accountant']}>
                <LazyRoute><ReportsMainPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Management (consolidated Schedule, Docs, Alumni) */}
          <Route
            path="/management"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher', 'accountant']}>
                <LazyRoute><ManagementPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/management/*"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal', 'teacher', 'accountant']}>
                <LazyRoute><ManagementPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Calendar */}
          <Route
            path="/calendar"
            element={
              <RoleProtectedRoute allowedRoles={ALL_ROLES}>
                <LazyRoute><TimetablePage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/calendar/*"
            element={
              <RoleProtectedRoute allowedRoles={ALL_ROLES}>
                <LazyRoute><TimetablePage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          {/* Timetable - Redirect to Calendar */}
          <Route
            path="/timetable"
            element={<Navigate to="/calendar" replace />}
          />
          <Route
            path="/timetable/*"
            element={<Navigate to="/calendar" replace />}
          />

          {/* Parent Portal */}
          <Route
            path="/parent-portal"
            element={
              <RoleProtectedRoute allowedRoles={['parent', 'teacher', 'admin', 'principal']}>
                <LazyRoute><ParentPortalPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/parent-portal/*"
            element={
              <RoleProtectedRoute allowedRoles={['parent', 'teacher', 'admin', 'principal']}>
                <LazyRoute><ParentPortalPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* School Website Builder */}
          <Route
            path="/school-website"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'principal']}>
                <LazyRoute><SchoolWebsiteBuilderPage /></LazyRoute>
              </RoleProtectedRoute>
            }
          />

          {/* Documents - Redirect to Management module */}
          <Route
            path="/documents"
            element={<Navigate to="/management?tab=docs" replace />}
          />
          <Route
            path="/documents/*"
            element={<Navigate to="/management?tab=docs" replace />}
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </TenantGate>
    </QueryClientProvider>
    </TenantProvider>
  )
}
