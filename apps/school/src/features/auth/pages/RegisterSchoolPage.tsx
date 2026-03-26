import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ArrowRight, ArrowLeft, Check, Eye, EyeOff, School, User, CreditCard } from 'lucide-react'

const STEPS = ['School Info', 'Admin Account', 'Plan', 'Done']

const BOARDS = [
  { value: 'CBSE', label: 'CBSE' },
  { value: 'ICSE', label: 'ICSE' },
  { value: 'State', label: 'State Board' },
  { value: 'IB', label: 'IB' },
  { value: 'Other', label: 'Other' },
]

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry',
]

interface FormData {
  schoolName: string
  city: string
  state: string
  affiliationBoard: string
  institutionType: string
  adminName: string
  adminEmail: string
  adminPassword: string
  phone: string
}

export function RegisterSchoolPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [result, setResult] = useState<{ slug: string; schoolName: string } | null>(null)

  const [form, setForm] = useState<FormData>({
    schoolName: '',
    city: '',
    state: '',
    affiliationBoard: 'CBSE',
    institutionType: 'school',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    phone: '',
  })

  const updateForm = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!form.schoolName.trim()) { setError('School name is required'); return false }
      if (form.schoolName.trim().length < 3) { setError('School name must be at least 3 characters'); return false }
    }
    if (step === 1) {
      if (!form.adminName.trim()) { setError('Your name is required'); return false }
      if (!form.adminEmail.trim()) { setError('Email is required'); return false }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) { setError('Invalid email address'); return false }
      if (!form.adminPassword) { setError('Password is required'); return false }
      if (form.adminPassword.length < 8) { setError('Password must be at least 8 characters'); return false }
    }
    return true
  }

  const handleNext = async () => {
    if (!validateStep()) return

    if (step === 2) {
      // Submit registration
      setIsLoading(true)
      setError('')
      try {
        const res = await fetch('/api/public/register-school', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || data.message || 'Registration failed')
          setIsLoading(false)
          return
        }
        setResult(data)
        setStep(3)
      } catch {
        setError('Unable to connect to the server. Please try again.')
      } finally {
        setIsLoading(false)
      }
      return
    }

    setStep((s) => s + 1)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb] p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white mb-3">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Register your school</h1>
          <p className="text-sm text-gray-500 mt-1">Get started with PaperBook in minutes</p>
        </div>

        {/* Progress indicator */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.slice(0, 3).map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  i < step ? 'bg-indigo-600 text-white' :
                  i === step ? 'bg-indigo-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {label}
                </span>
                {i < 2 && <div className={`w-8 h-0.5 ${i < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 mb-4">
              {error}
            </div>
          )}

          {/* Step 0: School Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <School className="h-5 w-5" />
                <h2 className="font-semibold">School Information</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">School Name *</label>
                <input
                  type="text"
                  value={form.schoolName}
                  onChange={(e) => updateForm('schoolName', e.target.value)}
                  placeholder="e.g., Delhi Public School"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                    placeholder="Mumbai"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => updateForm('state', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    <option value="">Select state</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Board</label>
                  <select
                    value={form.affiliationBoard}
                    onChange={(e) => updateForm('affiliationBoard', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    {BOARDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution Type</label>
                  <select
                    value={form.institutionType}
                    onChange={(e) => updateForm('institutionType', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    <option value="school">School (K-12)</option>
                    <option value="preschool">Pre-school</option>
                    <option value="college">College</option>
                    <option value="coaching">Coaching Institute</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Admin Account */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <User className="h-5 w-5" />
                <h2 className="font-semibold">Admin Account</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
                <input
                  type="text"
                  value={form.adminName}
                  onChange={(e) => updateForm('adminName', e.target.value)}
                  placeholder="John Doe"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) => updateForm('adminEmail', e.target.value)}
                  placeholder="admin@school.com"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.adminPassword}
                    onChange={(e) => updateForm('adminPassword', e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 2: Plan Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <CreditCard className="h-5 w-5" />
                <h2 className="font-semibold">Choose Your Plan</h2>
              </div>

              <div className="border-2 border-indigo-600 rounded-lg p-4 bg-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Free Plan</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Perfect to get started</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">₹0</div>
                    <div className="text-xs text-gray-500">forever</div>
                  </div>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> Up to 50 students</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> Up to 10 staff</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> School website</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> Basic reports</li>
                </ul>
                <div className="mt-3 text-xs text-indigo-600 font-medium">14-day trial of all features included</div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 opacity-70">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Starter</h3>
                    <p className="text-xs text-gray-500">For growing schools</p>
                  </div>
                  <div className="text-sm text-gray-500">Coming soon</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 opacity-70">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Professional</h3>
                    <p className="text-xs text-gray-500">For large institutions</p>
                  </div>
                  <div className="text-sm text-gray-500">Coming soon</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && result && (
            <div className="text-center py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto mb-4">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Your school is ready!</h2>
              <p className="text-sm text-gray-500 mb-1">
                <strong>{result.schoolName}</strong> has been created successfully.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Your school URL: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{result.slug}.paperbook.app</code>
              </p>
              <button
                onClick={() => {
                  const appDomain = import.meta.env.VITE_APP_DOMAIN || 'paperbook.local'
                  const hostname = window.location.hostname
                  // In dev on localhost, stay on localhost (tenant middleware falls back to default org)
                  // In production or if already on a subdomain domain, redirect to the school's subdomain
                  if (hostname === 'localhost' || hostname === '127.0.0.1') {
                    navigate('/login')
                  } else {
                    const port = window.location.port ? `:${window.location.port}` : ''
                    const protocol = window.location.protocol
                    window.location.href = `${protocol}//${result.slug}.${appDomain}${port}/login`
                  }
                }}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Log in to your school
              </button>
            </div>
          )}

          {/* Navigation buttons */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              {step > 0 ? (
                <button
                  onClick={() => { setStep((s) => s - 1); setError('') }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-1.5 h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : step === 2 ? 'Create School' : 'Next'}
                {!isLoading && step < 2 && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Login link */}
        {step < 3 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </button>
          </p>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by <span className="font-medium text-gray-500">Paperbook</span>
        </p>
      </div>
    </div>
  )
}
