import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
const AuditLogPage = lazy(() => import('./features/audit/pages/AuditLogPage').then(m => ({ default: m.AuditLogPage })))
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))

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
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AdminProtectedRoute />}>
              <Route element={<AdminShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="/schools" element={<SchoolsPage />} />
                <Route path="/schools/:id" element={<SchoolDetailPage />} />
                <Route path="/addons" element={<AddonsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/audit" element={<AuditLogPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}
