import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminProtectedRoute } from './components/auth/AdminProtectedRoute'
import { AdminShell } from './components/layout/AdminShell'
import { Toaster } from '@/components/ui/toaster'
import { PageLoader } from '@/components/ui/lazy-loader'

// Eagerly load LoginPage for fast initial render
import { LoginPage } from './features/auth/pages/LoginPage'

// Lazy load all other pages for code splitting
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const SchoolsPage = lazy(() => import('./features/schools/pages/SchoolsPage').then(m => ({ default: m.SchoolsPage })))
const SchoolDetailPage = lazy(() => import('./features/schools/pages/SchoolDetailPage').then(m => ({ default: m.SchoolDetailPage })))
const AddonsPage = lazy(() => import('./features/addons/pages/AddonsPage').then(m => ({ default: m.AddonsPage })))
const UsersPage = lazy(() => import('./features/users/pages/UsersPage').then(m => ({ default: m.UsersPage })))
const UserDetailPage = lazy(() => import('./features/users/pages/UserDetailPage').then(m => ({ default: m.UserDetailPage })))
const AuditLogPage = lazy(() => import('./features/audit/pages/AuditLogPage').then(m => ({ default: m.AuditLogPage })))
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const SubscriptionsPage = lazy(() => import('./features/subscriptions/pages/SubscriptionsPage').then(m => ({ default: m.SubscriptionsPage })))
const BillingPage = lazy(() => import('./features/billing/pages/BillingPage').then(m => ({ default: m.BillingPage })))
const LeadsPage = lazy(() => import('./features/crm/pages/LeadsPage').then(m => ({ default: m.LeadsPage })))
const AnnouncementsPage = lazy(() => import('./features/announcements/pages/AnnouncementsPage').then(m => ({ default: m.AnnouncementsPage })))
const AnalyticsPage = lazy(() => import('./features/analytics/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })))
const UsagePage = lazy(() => import('./features/usage/pages/UsagePage').then(m => ({ default: m.UsagePage })))
const HealthPage = lazy(() => import('./features/health/pages/HealthPage').then(m => ({ default: m.HealthPage })))
const SecurityPage = lazy(() => import('./features/security/pages/SecurityPage').then(m => ({ default: m.SecurityPage })))
const SubscriptionDetailPage = lazy(() => import('./features/subscriptions/pages/SubscriptionDetailPage').then(m => ({ default: m.SubscriptionDetailPage })))
const InvoiceDetailPage = lazy(() => import('./features/billing/pages/InvoiceDetailPage').then(m => ({ default: m.InvoiceDetailPage })))
const LeadDetailPage = lazy(() => import('./features/crm/pages/LeadDetailPage').then(m => ({ default: m.LeadDetailPage })))
const TicketsPage = lazy(() => import('./features/tickets/pages/TicketsPage').then(m => ({ default: m.TicketsPage })))
const TicketDetailPage = lazy(() => import('./features/tickets/pages/TicketDetailPage').then(m => ({ default: m.TicketDetailPage })))
const CommunicationLogPage = lazy(() => import('./features/communication/pages/CommunicationLogPage').then(m => ({ default: m.CommunicationLogPage })))
const WebsiteManagementPage = lazy(() => import('./features/website/pages/WebsiteManagementPage').then(m => ({ default: m.WebsiteManagementPage })))
const IntegrationsPage = lazy(() => import('./features/integrations/pages/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })))

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AdminProtectedRoute />}>
              <Route element={<AdminShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="/schools" element={<SchoolsPage />} />
                <Route path="/schools/:id" element={<SchoolDetailPage />} />
                <Route path="/crm" element={<LeadsPage />} />
                <Route path="/crm/:id" element={<LeadDetailPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/tickets/:id" element={<TicketDetailPage />} />
                <Route path="/communications" element={<CommunicationLogPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/usage" element={<UsagePage />} />
                <Route path="/health" element={<HealthPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/website" element={<WebsiteManagementPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/addons" element={<AddonsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/:id" element={<UserDetailPage />} />
                <Route path="/audit" element={<AuditLogPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}
