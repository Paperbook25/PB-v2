import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, resetAuthStore, mockUsers } from '@/test/test-utils'
import { RoleProtectedRoute, ADMIN_ROLES, STAFF_ROLES, ALL_ROLES } from './RoleProtectedRoute'

// Mock AppShell to simplify testing
vi.mock('@/components/layout/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div data-testid="app-shell">{children}</div>,
}))

describe('RoleProtectedRoute', () => {
  beforeEach(() => {
    resetAuthStore()
  })

  describe('when user is not authenticated', () => {
    it('should redirect to login page', () => {
      renderWithProviders(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div>Protected Content</div>
        </RoleProtectedRoute>,
        { user: null }
      )

      // Should redirect to /login
      expect(window.location.pathname).toBe('/login')
    })
  })

  describe('when user is authenticated but not authorized', () => {
    it('should show unauthorized view when role is not allowed', () => {
      renderWithProviders(
        <RoleProtectedRoute allowedRoles={['admin', 'principal']}>
          <div>Protected Content</div>
        </RoleProtectedRoute>,
        { user: mockUsers.student }
      )

      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(screen.getByText(/You don't have permission/)).toBeInTheDocument()
    })

    it('should display the user role in unauthorized view', () => {
      renderWithProviders(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div>Protected Content</div>
        </RoleProtectedRoute>,
        { user: mockUsers.teacher }
      )

      expect(screen.getByText(/teacher/i)).toBeInTheDocument()
    })

    it('should display required roles in unauthorized view', () => {
      renderWithProviders(
        <RoleProtectedRoute allowedRoles={['admin', 'principal']}>
          <div>Protected Content</div>
        </RoleProtectedRoute>,
        { user: mockUsers.student }
      )

      expect(screen.getByText(/admin, principal/i)).toBeInTheDocument()
    })

    it('should redirect to fallbackPath if provided', () => {
      renderWithProviders(
        <RoleProtectedRoute allowedRoles={['admin']} fallbackPath="/dashboard">
          <div>Protected Content</div>
        </RoleProtectedRoute>,
        { user: mockUsers.student, initialRoute: '/admin-page' }
      )

      expect(window.location.pathname).toBe('/dashboard')
    })
  })

  describe('when user is authenticated and authorized', () => {
    it('should render children for admin', () => {
      renderWithProviders(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div>Protected Content</div>
        </RoleProtectedRoute>,
        { user: mockUsers.admin }
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should render children when user has one of multiple allowed roles', () => {
      renderWithProviders(
        <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
          <div>Protected Content</div>
        </RoleProtectedRoute>,
        { user: mockUsers.teacher }
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should render within AppShell', () => {
      renderWithProviders(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div>Protected Content</div>
        </RoleProtectedRoute>,
        { user: mockUsers.admin }
      )

      expect(screen.getByTestId('app-shell')).toBeInTheDocument()
    })
  })

  describe('role group constants', () => {
    it('ADMIN_ROLES should contain admin and principal', () => {
      expect(ADMIN_ROLES).toContain('admin')
      expect(ADMIN_ROLES).toContain('principal')
      expect(ADMIN_ROLES).toHaveLength(2)
    })

    it('STAFF_ROLES should contain all staff roles', () => {
      expect(STAFF_ROLES).toContain('admin')
      expect(STAFF_ROLES).toContain('principal')
      expect(STAFF_ROLES).toContain('teacher')
      expect(STAFF_ROLES).toContain('accountant')
      expect(STAFF_ROLES).toContain('librarian')
      expect(STAFF_ROLES).toContain('transport_manager')
      expect(STAFF_ROLES).not.toContain('student')
      expect(STAFF_ROLES).not.toContain('parent')
    })

    it('ALL_ROLES should contain all 8 roles', () => {
      expect(ALL_ROLES).toHaveLength(8)
      expect(ALL_ROLES).toContain('admin')
      expect(ALL_ROLES).toContain('student')
      expect(ALL_ROLES).toContain('parent')
    })
  })
})
