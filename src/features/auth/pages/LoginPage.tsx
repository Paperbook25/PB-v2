import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, BookOpen } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { usePermissionStore } from '@/stores/usePermissionStore'
import type { Role } from '@/types/common.types'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

// Demo accounts for quick login
const staffAccounts = [
  { role: 'admin' as Role, name: 'Admin User', email: 'admin@paperbook.in', label: 'Admin' },
  { role: 'principal' as Role, name: 'Dr. Sharma', email: 'principal@paperbook.in', label: 'Principal' },
  { role: 'teacher' as Role, name: 'Priya Nair', email: 'teacher@paperbook.in', label: 'Teacher' },
  { role: 'accountant' as Role, name: 'Rahul Accounts', email: 'accounts@paperbook.in', label: 'Accountant' },
  { role: 'librarian' as Role, name: 'Meera Librarian', email: 'librarian@paperbook.in', label: 'Librarian' },
  { role: 'transport_manager' as Role, name: 'Vijay Transport', email: 'transport@paperbook.in', label: 'Transport' },
]

const userAccounts = [
  { role: 'student' as Role, name: 'Aarav Patel', email: 'student@paperbook.in', label: 'Student' },
  { role: 'parent' as Role, name: 'Rajesh Patel', email: 'parent@paperbook.in', label: 'Parent' },
]

const demoAccounts = [...staffAccounts, ...userAccounts]

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login, loginWithTokens } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (USE_MOCK_API) {
      // Mock login — load demo data dynamically
      await new Promise((resolve) => setTimeout(resolve, 500))
      const { demoStudent } = await import('@/mocks/data/students.data')
      const { demoTeacher } = await import('@/mocks/data/staff.data')

      const mockAccounts = [
        ...staffAccounts.map((a) =>
          a.role === 'teacher'
            ? { ...a, name: demoTeacher.name, staffId: demoTeacher.id }
            : a
        ),
        {
          ...userAccounts[0],
          name: demoStudent.name,
          studentId: demoStudent.id,
          class: demoStudent.class,
          section: demoStudent.section,
        },
        {
          ...userAccounts[1],
          name: demoStudent.parent.fatherName,
          childIds: [demoStudent.id],
        },
      ]

      const account = mockAccounts.find((a) => a.email === email) || mockAccounts[0]

      const id = 'staffId' in account
        ? (account as unknown as { staffId: string }).staffId
        : 'studentId' in account
          ? (account as unknown as { studentId: string }).studentId
          : account.role === 'parent'
            ? 'PAR001'
            : crypto.randomUUID()

      const userData: Parameters<typeof login>[0] = {
        id,
        name: account.name,
        email: account.email,
        role: account.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.name}`,
      }

      if ('studentId' in account) {
        const sa = account as unknown as { studentId: string; class: string; section: string }
        userData.studentId = sa.studentId
        userData.class = sa.class
        userData.section = sa.section
      }
      if ('childIds' in account) {
        userData.childIds = (account as unknown as { childIds: string[] }).childIds
      }

      login(userData)
      setIsLoading(false)
      navigate('/')
      return
    }

    // Real API login
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error || 'Invalid email or password')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      loginWithTokens(data.accessToken, data.refreshToken, {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role as Role,
        avatar: data.user.avatar,
        phone: data.user.phone,
        studentId: data.user.studentId,
        class: data.user.class,
        section: data.user.section,
        rollNumber: data.user.rollNumber,
        childIds: data.user.childIds,
      })

      // Store granular permissions from the backend
      usePermissionStore.getState().setPermissions(data.permissions || [])

      setIsLoading(false)
      navigate('/')
    } catch {
      setError('Unable to connect to the server. Please try again.')
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (account: (typeof demoAccounts)[0]) => {
    setEmail(account.email)
    setPassword('demo123')
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white mb-4">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Sign in to PaperBook</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your credentials to access your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@paperbook.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Continue'}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#f9fafb] px-3 text-gray-400 uppercase tracking-wide">or</span>
          </div>
        </div>

        {/* Demo Accounts */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">
            Demo Accounts
          </p>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => handleDemoLogin(account)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">{account.label}</span>
                <span className="text-xs text-gray-400">{account.email}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-400 mt-6">
          {USE_MOCK_API ? 'Demo mode -- no real authentication required' : 'Password: demo123'}
        </p>
      </div>
    </div>
  )
}
