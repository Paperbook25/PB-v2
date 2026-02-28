import { Navigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Role } from '@/types/common.types'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: Role[]
  fallbackPath?: string
}

function UnauthorizedView({ allowedRoles }: { allowedRoles: Role[] }) {
  const { user } = useAuthStore()

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Your role: <span className="font-medium capitalize">{user?.role}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Required roles: <span className="font-medium capitalize">{allowedRoles.join(', ')}</span>
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function RoleProtectedRoute({
  children,
  allowedRoles,
  fallbackPath,
}: RoleProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuthStore()

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role authorization
  const isAuthorized = hasRole(allowedRoles)

  // Not authorized - show unauthorized view or redirect
  if (!isAuthorized) {
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />
    }
    return (
      <AppShell>
        <UnauthorizedView allowedRoles={allowedRoles} />
      </AppShell>
    )
  }

  // Authorized - render children
  return <AppShell>{children}</AppShell>
}

// Role groups for easier use
export const ADMIN_ROLES: Role[] = ['admin', 'principal']
export const STAFF_ROLES: Role[] = ['admin', 'principal', 'teacher', 'accountant', 'librarian', 'transport_manager']
export const TEACHING_ROLES: Role[] = ['admin', 'principal', 'teacher']
export const ALL_ROLES: Role[] = ['admin', 'principal', 'teacher', 'accountant', 'librarian', 'transport_manager', 'student', 'parent']
