import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, Check, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

interface ValidationData {
  schoolName: string
  contactName: string
  contactEmail: string
}

export function ActivationPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'loading' | 'valid' | 'error' | 'success'>('loading')
  const [validationData, setValidationData] = useState<ValidationData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [form, setForm] = useState({
    schoolName: '',
    adminName: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<{ slug: string; schoolName: string } | null>(null)

  useEffect(() => {
    if (!token) {
      setErrorMsg('No activation token found. Please use the link from your email.')
      setStatus('error')
      return
    }

    fetch(`/api/public/validate-activation?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          setErrorMsg(data.error || data.message || 'This activation link is invalid or has expired.')
          setStatus('error')
          return
        }
        setValidationData(data)
        setForm((f) => ({
          ...f,
          schoolName: data.schoolName || '',
          adminName: data.contactName || '',
        }))
        setStatus('valid')
      })
      .catch(() => {
        setErrorMsg('Unable to validate your activation link. Please try again.')
        setStatus('error')
      })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!form.schoolName.trim()) { setSubmitError('School name is required'); return }
    if (!form.adminName.trim()) { setSubmitError('Your name is required'); return }
    if (!form.password) { setSubmitError('Password is required'); return }
    if (form.password.length < 8) { setSubmitError('Password must be at least 8 characters'); return }
    if (form.password !== form.confirmPassword) { setSubmitError('Passwords do not match'); return }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/public/register-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: form.schoolName,
          adminName: form.adminName,
          adminEmail: validationData!.contactEmail,
          adminPassword: form.password,
          phone: form.phone,
          activationToken: token,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || data.message || 'Registration failed. Please try again.')
        return
      }
      setResult(data)
      setStatus('success')
    } catch {
      setSubmitError('Unable to connect to the server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb] p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white mb-3">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Activate your school</h1>
          <p className="text-sm text-gray-500 mt-1">Complete your account setup to get started</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {/* Loading */}
          {status === 'loading' && (
            <div className="flex flex-col items-center py-8 gap-3 text-gray-500">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
              <p className="text-sm">Validating your activation link…</p>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex flex-col items-center py-6 text-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Activation link invalid</h2>
                <p className="text-sm text-gray-500">{errorMsg}</p>
              </div>
              <p className="text-xs text-gray-400">
                Please contact our team at{' '}
                <a href="mailto:hello@paperbook.app" className="text-indigo-600 hover:underline">
                  hello@paperbook.app
                </a>{' '}
                to get a new link.
              </p>
            </div>
          )}

          {/* Form */}
          {status === 'valid' && validationData && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">School Name</label>
                <input
                  type="text"
                  value={form.schoolName}
                  onChange={(e) => setForm((f) => ({ ...f, schoolName: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={form.adminName}
                  onChange={(e) => setForm((f) => ({ ...f, adminName: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={validationData.contactEmail}
                  readOnly
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Re-enter your password"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Setting up your school…' : 'Activate School'}
                </button>
              </div>
            </form>
          )}

          {/* Success */}
          {status === 'success' && result && (
            <div className="text-center py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto mb-4">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Your school is live!</h2>
              <p className="text-sm text-gray-500 mb-1">
                <strong>{result.schoolName}</strong> has been activated successfully.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Your school URL:{' '}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">{result.slug}.paperbook.app</code>
              </p>
              <a
                href={`https://${result.slug}.paperbook.app/login`}
                className="flex items-center justify-center gap-2 w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Go to Dashboard →
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by <span className="font-medium text-gray-500">Paperbook</span>
        </p>
      </div>
    </div>
  )
}
