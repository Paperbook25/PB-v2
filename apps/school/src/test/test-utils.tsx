import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/useAuthStore'
import type { User, Role } from '@/types/common.types'

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface WrapperProps {
  children: ReactNode
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string
  user?: User | null
}

/**
 * Custom render function that wraps components with all necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    initialRoute = '/',
    user = null,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Set up auth state if user is provided
  if (user) {
    useAuthStore.setState({ user, isAuthenticated: true })
  } else {
    useAuthStore.setState({ user: null, isAuthenticated: false })
  }

  // Set initial route
  window.history.pushState({}, 'Test page', initialRoute)

  const queryClient = createTestQueryClient()

  function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@paperbook.in',
    role: 'admin' as Role,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test',
    ...overrides,
  }
}

/**
 * Create mock users for each role
 */
export const mockUsers: Record<Role, User> = {
  admin: createMockUser({ role: 'admin', name: 'Admin User', email: 'admin@paperbook.in' }),
  principal: createMockUser({ role: 'principal', name: 'Principal User', email: 'principal@paperbook.in' }),
  teacher: createMockUser({ role: 'teacher', name: 'Teacher User', email: 'teacher@paperbook.in' }),
  accountant: createMockUser({ role: 'accountant', name: 'Accountant User', email: 'accountant@paperbook.in' }),
  librarian: createMockUser({ role: 'librarian', name: 'Librarian User', email: 'librarian@paperbook.in' }),
  transport_manager: createMockUser({ role: 'transport_manager', name: 'Transport Manager', email: 'transport@paperbook.in' }),
  student: createMockUser({ role: 'student', name: 'Student User', email: 'student@paperbook.in', studentId: 'STU001' } as User),
  parent: createMockUser({ role: 'parent', name: 'Parent User', email: 'parent@paperbook.in', childIds: ['STU001'] } as User),
}

/**
 * Reset auth store to initial state
 */
export function resetAuthStore() {
  useAuthStore.setState({ user: null, isAuthenticated: false })
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
