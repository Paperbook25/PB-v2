import { useState } from 'react'
import { Users, Plus, Trash2, Send, Check } from 'lucide-react'
import { apiPost } from '@/lib/api-client'

interface InviteRow {
  email: string
  name: string
  role: string
  sent: boolean
}

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'principal', label: 'Principal' },
  { value: 'member', label: 'Teacher' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'librarian', label: 'Librarian' },
]

export function InviteTeamStep() {
  const [invites, setInvites] = useState<InviteRow[]>([
    { email: '', name: '', role: 'member', sent: false },
  ])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const addRow = () => {
    setInvites((prev) => [...prev, { email: '', name: '', role: 'member', sent: false }])
  }

  const removeRow = (idx: number) => {
    setInvites((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateRow = (idx: number, field: keyof InviteRow, value: string) => {
    setInvites((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
    setError('')
  }

  const sendInvites = async () => {
    const validInvites = invites.filter((r) => r.email.trim() && !r.sent)
    if (validInvites.length === 0) return

    setSending(true)
    setError('')

    for (const invite of validInvites) {
      try {
        await apiPost('/api/invitations/send', {
          email: invite.email.trim(),
          name: invite.name.trim() || undefined,
          role: invite.role,
        })
        setInvites((prev) =>
          prev.map((r) => r.email === invite.email ? { ...r, sent: true } : r)
        )
      } catch (err: any) {
        setError(err.message || `Failed to invite ${invite.email}`)
      }
    }

    setSending(false)
  }

  const allSent = invites.every((r) => r.sent || !r.email.trim())

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Invite Your Team</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Invite teachers, principals, and staff to your school. They'll receive an email to set up their account.
      </p>

      {error && (
        <div className="p-2.5 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 mb-3">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {invites.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="email"
              value={row.email}
              onChange={(e) => updateRow(i, 'email', e.target.value)}
              placeholder="Email"
              disabled={row.sent}
              className="flex h-9 flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
            <input
              type="text"
              value={row.name}
              onChange={(e) => updateRow(i, 'name', e.target.value)}
              placeholder="Name"
              disabled={row.sent}
              className="flex h-9 w-32 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
            <select
              value={row.role}
              onChange={(e) => updateRow(i, 'role', e.target.value)}
              disabled={row.sent}
              className="flex h-9 w-28 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent disabled:bg-gray-50"
            >
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {row.sent ? (
              <div className="text-green-600"><Check className="h-4 w-4" /></div>
            ) : invites.length > 1 ? (
              <button onClick={() => removeRow(i)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-4" />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="flex items-center gap-1 mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
      >
        <Plus className="h-3.5 w-3.5" /> Add another
      </button>

      <button
        onClick={sendInvites}
        disabled={sending || allSent}
        className={`mt-4 flex items-center gap-1.5 h-8 px-4 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
          allSent
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        {sending ? 'Sending...' : allSent ? (
          <><Check className="h-3.5 w-3.5" /> All invites sent</>
        ) : (
          <><Send className="h-3.5 w-3.5" /> Send Invitations</>
        )}
      </button>
    </div>
  )
}
