import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { useAdminAuthStore } from '../../../stores/useAdminAuthStore'
import {
  User,
  Lock,
  Shield,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
} from 'lucide-react'

interface PlatformSettings {
  platformName: string
  defaultTrialDuration: number
  defaultPlan: 'free' | 'starter' | 'professional' | 'enterprise'
  primaryColor: string
}

interface SecuritySettings {
  minPasswordLength: number
  sessionTimeoutHours: number
  require2FA: boolean
  maxLoginAttempts: number
}

const DEFAULT_PLATFORM: PlatformSettings = {
  platformName: 'PaperBook',
  defaultTrialDuration: 14,
  defaultPlan: 'free',
  primaryColor: '#6366f1',
}

const DEFAULT_SECURITY: SecuritySettings = {
  minPasswordLength: 8,
  sessionTimeoutHours: 168,
  require2FA: false,
  maxLoginAttempts: 5,
}

export function SettingsPage() {
  const user = useAdminAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const [settingsTab, setSettingsTab] = useState<'account' | 'platform' | 'security'>('account')

  // --- Fetch platform settings from backend ---
  const { data: platformSettings } = useQuery({
    queryKey: ['admin', 'platform-settings'],
    queryFn: adminApi.getPlatformSettings,
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Record<string, string>) => adminApi.updatePlatformSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'platform-settings'] })
    },
  })

  // --- Account state ---
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [accountSaving, setAccountSaving] = useState(false)
  const [accountSuccess, setAccountSuccess] = useState(false)
  const [accountError, setAccountError] = useState('')

  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // --- Platform state ---
  const [platformForm, setPlatformForm] = useState<PlatformSettings>(DEFAULT_PLATFORM)
  const [platformSaving, setPlatformSaving] = useState(false)
  const [platformSuccess, setPlatformSuccess] = useState(false)

  // --- Security state ---
  const [securityForm, setSecurityForm] = useState<SecuritySettings>(DEFAULT_SECURITY)
  const [securitySaving, setSecuritySaving] = useState(false)
  const [securitySuccess, setSecuritySuccess] = useState(false)

  // Sync form state when backend settings load
  useEffect(() => {
    if (platformSettings) {
      setPlatformForm({
        platformName: platformSettings['platform.name'] || DEFAULT_PLATFORM.platformName,
        defaultTrialDuration: Number(platformSettings['trial.defaultDuration']) || DEFAULT_PLATFORM.defaultTrialDuration,
        defaultPlan: (platformSettings['trial.defaultPlan'] as PlatformSettings['defaultPlan']) || DEFAULT_PLATFORM.defaultPlan,
        primaryColor: platformSettings['platform.primaryColor'] || DEFAULT_PLATFORM.primaryColor,
      })
      setSecurityForm({
        minPasswordLength: Number(platformSettings['security.minPasswordLength']) || DEFAULT_SECURITY.minPasswordLength,
        sessionTimeoutHours: Number(platformSettings['security.sessionTimeoutHours']) || DEFAULT_SECURITY.sessionTimeoutHours,
        require2FA: platformSettings['security.require2FA'] === 'true',
        maxLoginAttempts: Number(platformSettings['security.maxLoginAttempts']) || DEFAULT_SECURITY.maxLoginAttempts,
      })
    }
  }, [platformSettings])

  // --- Account handlers ---
  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccountSaving(true)
    setAccountSuccess(false)
    setAccountError('')

    try {
      const res = await fetch('/api/auth/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: accountForm.name }),
      })
      if (!res.ok) throw new Error('Failed to update account')
      setAccountSuccess(true)
      setTimeout(() => setAccountSuccess(false), 3000)
    } catch (err: any) {
      setAccountError(err.message || 'Failed to update account')
    } finally {
      setAccountSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordSuccess(false)
    setPasswordError('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      setPasswordSaving(false)
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      setPasswordSaving(false)
      return
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to change password')
      }
      setPasswordSuccess(true)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password')
    } finally {
      setPasswordSaving(false)
    }
  }

  // --- Platform handler ---
  const handlePlatformSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setPlatformSaving(true)
    try {
      await updateSettingsMutation.mutateAsync({
        'platform.name': platformForm.platformName,
        'trial.defaultDuration': String(platformForm.defaultTrialDuration),
        'trial.defaultPlan': platformForm.defaultPlan,
        'platform.primaryColor': platformForm.primaryColor,
      })
      setPlatformSuccess(true)
      setTimeout(() => setPlatformSuccess(false), 3000)
    } catch {
      // Error handled by mutation
    } finally {
      setPlatformSaving(false)
    }
  }

  // --- Security handler ---
  const handleSecuritySave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecuritySaving(true)
    try {
      await updateSettingsMutation.mutateAsync({
        'security.minPasswordLength': String(securityForm.minPasswordLength),
        'security.sessionTimeoutHours': String(securityForm.sessionTimeoutHours),
        'security.require2FA': String(securityForm.require2FA),
        'security.maxLoginAttempts': String(securityForm.maxLoginAttempts),
      })
      setSecuritySuccess(true)
      setTimeout(() => setSecuritySuccess(false), 3000)
    } catch {
      // Error handled by mutation
    } finally {
      setSecuritySaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your admin account and platform settings
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 border-b mb-6">
        {(['account', 'platform', 'security'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSettingsTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              settingsTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'account' ? 'Account' : tab === 'platform' ? 'Platform' : 'Security'}
          </button>
        ))}
      </div>

      {/* ==================== ACCOUNT TAB ==================== */}
      {settingsTab === 'account' && (
        <div className="space-y-6">
          {/* Admin Profile Card */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{user?.name || 'Admin'}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{user?.email || 'admin@paperbook.io'}</p>
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold capitalize text-primary">
                  {user?.role || 'super_admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Two-column grid for Account Info + Password */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Account Information */}
            <div className="rounded-lg border bg-card">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Account Information</h2>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Update your profile information
                </p>
              </div>
              <form onSubmit={handleAccountSave} className="space-y-4 px-6 py-5">
                {accountError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {accountError}
                  </div>
                )}
                {accountSuccess && (
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Account updated successfully
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={accountForm.email}
                    disabled
                    className="h-10 w-full rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email cannot be changed from this portal
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={accountSaving}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    {accountSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="rounded-lg border bg-card">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4.5 w-4.5 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Update your password for security
                </p>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4 px-6 py-5">
                {passwordError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Password changed successfully
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    required
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    required
                    placeholder="Minimum 8 characters"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    required
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    {passwordSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PLATFORM TAB ==================== */}
      {settingsTab === 'platform' && (
        <div className="max-w-2xl">
          <div className="rounded-lg border bg-card">
            <div className="border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Platform Settings</h2>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Configure platform-wide defaults and branding
              </p>
            </div>
            <form onSubmit={handlePlatformSave} className="space-y-4 px-6 py-5">
              {platformSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Platform settings saved successfully
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={platformForm.platformName}
                  onChange={(e) => setPlatformForm((p) => ({ ...p, platformName: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Default Trial Duration (days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={platformForm.defaultTrialDuration}
                  onChange={(e) => setPlatformForm((p) => ({ ...p, defaultTrialDuration: Number(e.target.value) }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Default Plan
                </label>
                <select
                  value={platformForm.defaultPlan}
                  onChange={(e) => setPlatformForm((p) => ({ ...p, defaultPlan: e.target.value as PlatformSettings['defaultPlan'] }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={platformForm.primaryColor}
                    onChange={(e) => setPlatformForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    placeholder="#6366f1"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <div
                    className="h-10 w-10 shrink-0 rounded-lg border border-input"
                    style={{ backgroundColor: platformForm.primaryColor }}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={platformSaving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {platformSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== SECURITY TAB ==================== */}
      {settingsTab === 'security' && (
        <div className="max-w-2xl">
          <div className="rounded-lg border bg-card">
            <div className="border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Security Settings</h2>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Configure authentication and security policies
              </p>
            </div>
            <form onSubmit={handleSecuritySave} className="space-y-4 px-6 py-5">
              {securitySuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Security settings saved successfully
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  min={6}
                  max={128}
                  value={securityForm.minPasswordLength}
                  onChange={(e) => setSecurityForm((p) => ({ ...p, minPasswordLength: Number(e.target.value) }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Session Timeout (hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={720}
                  value={securityForm.sessionTimeoutHours}
                  onChange={(e) => setSecurityForm((p) => ({ ...p, sessionTimeoutHours: Number(e.target.value) }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Default is 168 hours (7 days)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="require2fa"
                  checked={securityForm.require2FA}
                  onChange={(e) => setSecurityForm((p) => ({ ...p, require2FA: e.target.checked }))}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                />
                <label htmlFor="require2fa" className="text-sm font-medium text-foreground">
                  Require Two-Factor Authentication (2FA)
                </label>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={securityForm.maxLoginAttempts}
                  onChange={(e) => setSecurityForm((p) => ({ ...p, maxLoginAttempts: Number(e.target.value) }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Account locks after this many failed attempts
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={securitySaving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {securitySaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
