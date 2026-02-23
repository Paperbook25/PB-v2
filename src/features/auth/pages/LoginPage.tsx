import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/useAuthStore'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img src="/logo.svg" alt="PaperBook" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">PaperBook</h1>
          <p className="text-muted-foreground mt-1">School Management System</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@paperbook.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Quick demo login
              </p>

              {/* Staff Accounts */}
              <p className="text-xs text-muted-foreground mb-2">Staff</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {staffAccounts.map((account) => (
                  <Button
                    key={account.role}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleDemoLogin(account)}
                  >
                    {account.label}
                  </Button>
                ))}
              </div>

              {/* Student & Parent Accounts */}
              <p className="text-xs text-muted-foreground mb-2">Student / Parent</p>
              <div className="grid grid-cols-2 gap-2">
                {userAccounts.map((account) => (
                  <Button
                    key={account.role}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleDemoLogin(account)}
                  >
                    {account.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          {USE_MOCK_API ? 'Demo mode - No real authentication required' : 'Password: demo123'}
        </p>
      </div>
    </div>
  )
}
