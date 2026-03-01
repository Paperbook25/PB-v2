import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, BookOpen } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useTenant } from '@/context/TenantContext'
import { signIn } from '@/lib/auth-client'
import type { Role } from '@/types/common.types'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const tenant = useTenant()

  const schoolName = tenant.org?.name ?? tenant.slug ?? 'your school'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn.email({ email, password })

      if (result.error) {
        setError(result.error.message || 'Invalid email or password')
        setIsLoading(false)
        return
      }

      if (result.data?.user) {
        // Session cookie is now set. Fetch the user's school-level profile
        // (the server resolves the org membership role via schoolAuthMiddleware).
        try {
          const meRes = await fetch('/api/me', { credentials: 'include' })
          if (meRes.ok) {
            const me = await meRes.json()
            login({
              id: me.id,
              name: me.name,
              email: me.email,
              role: (me.role as Role) || 'teacher',
              avatar: result.data.user.image ?? undefined,
            })
          } else {
            // Fallback: use the data from signIn directly
            login({
              id: result.data.user.id,
              name: result.data.user.name,
              email: result.data.user.email,
              role: 'teacher',
              avatar: result.data.user.image ?? undefined,
            })
          }
        } catch {
          // Fallback
          login({
            id: result.data.user.id,
            name: result.data.user.name,
            email: result.data.user.email,
            role: 'teacher',
            avatar: result.data.user.image ?? undefined,
          })
        }
        setIsLoading(false)
        navigate('/')
        return
      }

      setError('Login failed. Please try again.')
      setIsLoading(false)
    } catch {
      setError('Unable to connect to the server. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb] p-4">
      <div className="w-full max-w-sm">
        {/* Logo & School Name */}
        <div className="flex flex-col items-center mb-8">
          {tenant.org?.logo ? (
            <img
              src={tenant.org.logo}
              alt={schoolName}
              className="h-12 w-12 rounded-lg object-cover mb-4"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white mb-4">
              <BookOpen className="h-5 w-5" />
            </div>
          )}
          <h1 className="text-xl font-semibold text-gray-900">
            Sign in to {schoolName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your credentials to access your account
          </p>
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
                placeholder="you@example.com"
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
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Google OAuth */}
        <div className="mt-4">
          <button
            type="button"
            onClick={async () => {
              await signIn.social({ provider: 'google', callbackURL: '/' })
            }}
            className="w-full h-10 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md border border-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Powered by */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Powered by{' '}
          <span className="font-medium text-gray-500">Paperbook</span>
        </p>
      </div>
    </div>
  )
}
