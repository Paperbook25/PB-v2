import { useState } from 'react'
import { useAdminAuthStore } from '../../../stores/useAdminAuthStore'
import {
  User,
  Lock,
  Shield,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail,
  Globe,
  Bell,
} from 'lucide-react'

export function SettingsPage() {
  const user = useAdminAuthStore((s) => s.user)

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your admin account and platform settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
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

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Admin Profile Card */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{user?.name || 'Admin'}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{user?.email || 'admin@paperbook.io'}</p>
              <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
                {user?.role || 'super_admin'}
              </span>
            </div>
          </div>

          {/* Platform Settings Placeholder */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Platform Settings
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Platform-wide configuration settings will be available in a future update. This will include:
            </p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                Security policies
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                Email templates
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Bell className="h-3 w-3" />
                Notification preferences
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                Branding & customization
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
