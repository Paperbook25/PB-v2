import { useState, useEffect } from 'react'
import { User, Mail, Phone, Lock, Eye, EyeOff, Camera, Shield } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthStore } from '@/stores/useAuthStore'
import { apiGet, apiPut, apiPost } from '@/lib/api-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

interface ProfileData {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  role: string
  createdAt: string
}

export function ProfilePage() {
  const { user, login } = useAuthStore()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  // Profile form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    apiGet<ProfileData>('/api/profile')
      .then((data) => {
        setProfile(data)
        setName(data.name)
        setPhone(data.phone || '')
      })
      .catch(() => {
        // Use local user data as fallback
        if (user) {
          setName(user.name)
        }
      })
      .finally(() => setLoading(false))
  }, [user])

  const handleSaveProfile = async () => {
    if (!name.trim()) { setProfileError('Name is required'); return }
    setSaving(true)
    setProfileError('')
    setSaved(false)
    try {
      await apiPut('/api/profile', { name: name.trim(), phone: phone.trim() || null })
      setSaved(true)
      // Update local auth store
      if (user) {
        login({ ...user, name: name.trim() })
      }
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!currentPassword) { setPasswordError('Current password is required'); return }
    if (!newPassword) { setPasswordError('New password is required'); return }
    if (newPassword.length < 8) { setPasswordError('New password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return }

    setChangingPassword(true)
    try {
      await apiPost('/api/profile/change-password', {
        currentPassword,
        newPassword,
      })
      setPasswordSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(''), 5000)
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const roleLabel = (role?: string) => {
    const map: Record<string, string> = {
      admin: 'School Admin',
      principal: 'Principal',
      teacher: 'Teacher',
      accountant: 'Accountant',
      librarian: 'Librarian',
      transport_manager: 'Transport Manager',
      student: 'Student',
      parent: 'Parent',
    }
    return role ? map[role] || role : 'User'
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="My Profile" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Profile' }]} />
        <div className="mt-6 animate-pulse space-y-4">
          <div className="h-32 bg-gray-100 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Manage your account details and security"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Profile' }]}
      />

      <div className="mt-6 max-w-2xl space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          {/* Avatar + Role */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar || user?.avatar} alt={name} />
                <AvatarFallback className="text-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{roleLabel(user?.role)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{profile?.email || user?.email}</p>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              Personal Information
            </h3>

            {profileError && (
              <div className="p-2.5 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800">{profileError}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setSaved(false); setProfileError('') }}
                    className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 pl-10 pr-3 py-2 text-sm text-gray-500 dark:text-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setSaved(false) }}
                    placeholder="Your phone number"
                    className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className={`h-9 px-4 text-sm font-medium rounded-md transition-colors ${
                saved
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50'
              }`}
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
            <Lock className="h-4 w-4 text-gray-400" />
            Change Password
          </h3>

          {passwordError && (
            <div className="p-2.5 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800 mb-4">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="p-2.5 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-100 dark:border-green-800 mb-4">{passwordSuccess}</div>
          )}

          <div className="space-y-4 max-w-sm">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError('') }}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 pr-10 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError('') }}
                  placeholder="Minimum 8 characters"
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 pr-10 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPw(!showNewPw)}
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError('') }}
                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="h-9 px-4 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
