import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'

interface InviteDetails {
  id: string
  email: string
  role: string | null
  status: string
  expired: boolean
  schoolName: string
  schoolLogo: string | null
}

export function AcceptInvitePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [invite, setInvite] = useState<InviteDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    fetch(`/api/public/invite-details/${token}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setInvite(data)
        } else {
          setError('This invitation link is invalid or has expired.')
        }
      })
      .catch(() => setError('Unable to load invitation details.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/public/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || data.message || 'Failed to accept invitation')
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Unable to connect to the server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <div className="text-gray-400 text-sm">Loading invitation...</div>
      </div>
    )
  }

  if (!token || (!invite && !success)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb] p-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-sm text-gray-500 mb-6">{error || 'This invitation link is invalid or has expired.'}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Go to login
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb] p-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto mb-4">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">You're all set!</h1>
          <p className="text-sm text-gray-500 mb-6">
            Your account has been created. You can now log in to <strong>{invite?.schoolName}</strong>.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    )
  }

  if (invite?.status !== 'pending' || invite?.expired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb] p-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 mx-auto mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            {invite?.status === 'accepted' ? 'Already Accepted' : 'Invitation Expired'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {invite?.status === 'accepted'
              ? 'This invitation has already been accepted. You can log in now.'
              : 'This invitation has expired. Please ask your school admin to send a new one.'}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Go to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb] p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          {invite.schoolLogo ? (
            <img src={invite.schoolLogo} alt={invite.schoolName} className="h-12 w-12 rounded-lg object-cover mb-3" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white mb-3">
              <BookOpen className="h-5 w-5" />
            </div>
          )}
          <h1 className="text-xl font-semibold text-gray-900">Join {invite.schoolName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            You've been invited as <span className="font-medium text-gray-700">{invite.role || 'member'}</span>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={invite.email}
                disabled
                className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError('') }}
                placeholder="Enter your full name"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Create Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Minimum 8 characters"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Setting up...' : 'Accept & Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by <span className="font-medium text-gray-500">Paperbook</span>
        </p>
      </div>
    </div>
  )
}
