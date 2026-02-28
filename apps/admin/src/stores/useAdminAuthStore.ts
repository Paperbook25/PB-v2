import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { signOut } from '@/lib/auth-client'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface AdminAuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isCheckingSession: boolean
  setUser: (user: AdminUser) => void
  logout: () => Promise<void>
  checkSession: () => Promise<boolean>
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isCheckingSession: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      logout: async () => {
        try {
          await signOut()
        } catch {
          // Even if server logout fails, clear local state so the user
          // is not stuck in a broken authenticated state.
        } finally {
          set({ user: null, isAuthenticated: false })
        }
      },

      checkSession: async () => {
        if (get().isCheckingSession) return get().isAuthenticated

        set({ isCheckingSession: true })
        try {
          const res = await fetch('/api/auth/get-session', {
            credentials: 'include',
          })

          if (!res.ok) {
            set({ user: null, isAuthenticated: false, isCheckingSession: false })
            return false
          }

          const data = await res.json()

          if (data?.user) {
            set({
              user: {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                avatar: data.user.image ?? data.user.avatar,
              },
              isAuthenticated: true,
              isCheckingSession: false,
            })
            return true
          }

          set({ user: null, isAuthenticated: false, isCheckingSession: false })
          return false
        } catch {
          set({ user: null, isAuthenticated: false, isCheckingSession: false })
          return false
        }
      },
    }),
    { name: 'paperbook-admin-auth' }
  )
)
