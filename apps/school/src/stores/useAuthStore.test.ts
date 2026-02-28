import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './useAuthStore'
import type { User, Role } from '@/types/common.types'

describe('useAuthStore', () => {
  const mockUser: User = {
    id: 'user-1',
    name: 'Test Admin',
    email: 'admin@paperbook.in',
    role: 'admin',
    avatar: 'https://example.com/avatar.png',
  }

  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({ user: null, isAuthenticated: false })
  })

  describe('login', () => {
    it('should set user and isAuthenticated to true', () => {
      useAuthStore.getState().login(mockUser)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
    })
  })

  describe('logout', () => {
    it('should clear user and set isAuthenticated to false', () => {
      // First login
      useAuthStore.getState().login(mockUser)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Then logout
      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('hasPermission', () => {
    it('should return true for admin with wildcard permission', () => {
      useAuthStore.getState().login(mockUser)

      expect(useAuthStore.getState().hasPermission('anything')).toBe(true)
      expect(useAuthStore.getState().hasPermission('students')).toBe(true)
      expect(useAuthStore.getState().hasPermission('finance')).toBe(true)
    })

    it('should return false when not authenticated', () => {
      expect(useAuthStore.getState().hasPermission('dashboard')).toBe(false)
    })

    it('should return true for teacher with allowed permissions', () => {
      const teacherUser: User = { ...mockUser, role: 'teacher' }
      useAuthStore.getState().login(teacherUser)

      expect(useAuthStore.getState().hasPermission('dashboard')).toBe(true)
      expect(useAuthStore.getState().hasPermission('attendance')).toBe(true)
      expect(useAuthStore.getState().hasPermission('students.view')).toBe(true)
    })

    it('should return false for teacher with disallowed permissions', () => {
      const teacherUser: User = { ...mockUser, role: 'teacher' }
      useAuthStore.getState().login(teacherUser)

      expect(useAuthStore.getState().hasPermission('finance')).toBe(false)
      expect(useAuthStore.getState().hasPermission('settings')).toBe(false)
    })

    it('should return correct permissions for accountant', () => {
      const accountantUser: User = { ...mockUser, role: 'accountant' }
      useAuthStore.getState().login(accountantUser)

      expect(useAuthStore.getState().hasPermission('finance')).toBe(true)
      expect(useAuthStore.getState().hasPermission('dashboard')).toBe(true)
      expect(useAuthStore.getState().hasPermission('library')).toBe(false)
    })

    it('should return correct permissions for student', () => {
      const studentUser: User = { ...mockUser, role: 'student' }
      useAuthStore.getState().login(studentUser)

      expect(useAuthStore.getState().hasPermission('dashboard.student')).toBe(true)
      expect(useAuthStore.getState().hasPermission('library.view')).toBe(true)
      expect(useAuthStore.getState().hasPermission('finance')).toBe(false)
    })

    it('should return correct permissions for parent', () => {
      const parentUser: User = { ...mockUser, role: 'parent' }
      useAuthStore.getState().login(parentUser)

      expect(useAuthStore.getState().hasPermission('dashboard.parent')).toBe(true)
      expect(useAuthStore.getState().hasPermission('attendance.view')).toBe(true)
      expect(useAuthStore.getState().hasPermission('finance.view')).toBe(true)
      expect(useAuthStore.getState().hasPermission('settings')).toBe(false)
    })
  })

  describe('hasRole', () => {
    it('should return true when user has matching role', () => {
      useAuthStore.getState().login(mockUser)

      expect(useAuthStore.getState().hasRole(['admin'])).toBe(true)
      expect(useAuthStore.getState().hasRole(['admin', 'principal'])).toBe(true)
    })

    it('should return false when user does not have matching role', () => {
      useAuthStore.getState().login(mockUser)

      expect(useAuthStore.getState().hasRole(['teacher'])).toBe(false)
      expect(useAuthStore.getState().hasRole(['student', 'parent'])).toBe(false)
    })

    it('should return false when not authenticated', () => {
      expect(useAuthStore.getState().hasRole(['admin'])).toBe(false)
    })
  })
})
