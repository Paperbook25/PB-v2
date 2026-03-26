import { useState } from 'react'
import { Building } from 'lucide-react'
import { apiPut } from '@/lib/api-client'

interface ProfileProps {
  profile: {
    name: string
    logo: string | null
    city: string | null
    state: string | null
    phone: string | null
    email: string | null
    affiliationBoard: string | null
  }
}

export function SchoolProfileStep({ profile }: ProfileProps) {
  const [form, setForm] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    email: profile.email || '',
    address: '',
    city: profile.city || '',
    state: profile.state || '',
    pincode: '',
    principalName: '',
  })
  const [saved, setSaved] = useState(false)

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      await apiPut('/api/settings/school-profile', {
        name: form.name,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone,
        email: form.email,
        principalName: form.principalName,
      })
      setSaved(true)
    } catch {
      // Allow continuing even if save fails
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Building className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">School Profile</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Fill in your school's details. This information appears on reports and your school website.
      </p>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">School Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Principal Name</label>
            <input
              type="text"
              value={form.principalName}
              onChange={(e) => update('principalName', e.target.value)}
              placeholder="Principal's full name"
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder="Full school address"
            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => update('state', e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label>
            <input
              type="text"
              value={form.pincode}
              onChange={(e) => update('pincode', e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`mt-4 h-8 px-4 text-sm font-medium rounded-md transition-colors ${
          saved
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        {saved ? 'Saved!' : 'Save Profile'}
      </button>
    </div>
  )
}
