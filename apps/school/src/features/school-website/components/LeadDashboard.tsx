import { useState } from 'react'
import {
  Users, UserPlus, MessageCircle, CheckCircle,
  ChevronDown, ChevronUp, Search, Filter,
  ExternalLink, Loader2,
} from 'lucide-react'
import {
  useContactSubmissions, useContactStats, useUpdateContact,
  type ContactSubmission, type ContactListQuery,
} from '../api/contact.api'

// ==================== Status Badge ====================

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

// ==================== Stat Card ====================

function StatCard({ label, value, icon: Icon, color }: {
  label: string
  value: number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

// ==================== Contact Inquiries Tab ====================

function ContactInquiriesTab() {
  const [query, setQuery] = useState<ContactListQuery>({ page: 1, limit: 20 })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading } = useContactSubmissions(query)
  const updateContact = useUpdateContact()

  const contacts = data?.data ?? []
  const pagination = data?.pagination

  const handleStatusChange = (id: string, status: string) => {
    updateContact.mutate({ id, status })
  }

  const handleSearch = () => {
    setQuery(prev => ({ ...prev, page: 1, search: searchInput || undefined }))
  }

  const handleSourceFilter = (source: string | undefined) => {
    setQuery(prev => ({ ...prev, page: 1, source }))
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name, email, or message..."
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="flex gap-1">
            {[
              { label: 'All', value: undefined },
              { label: 'Contact Form', value: 'website_contact' },
              { label: 'Admission Inquiry', value: 'website_admission_inquiry' },
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => handleSourceFilter(opt.value)}
                className={`px-3 py-1.5 text-xs rounded-full transition ${
                  query.source === opt.value
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1">
          {['new', 'contacted', 'converted', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => setQuery(prev => ({
                ...prev,
                page: 1,
                status: prev.status === s ? undefined : s,
              }))}
              className={`px-3 py-1.5 text-xs rounded-full transition ${
                query.status === s
                  ? STATUS_CONFIG[s]?.color || 'bg-gray-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No contact submissions found.
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 max-w-[200px]">Message</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <ContactRow
                  key={c.id}
                  contact={c}
                  isExpanded={expandedId === c.id}
                  onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setQuery(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setQuery(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== Contact Row ====================

function ContactRow({ contact, isExpanded, onToggle, onStatusChange }: {
  contact: ContactSubmission
  isExpanded: boolean
  onToggle: () => void
  onStatusChange: (id: string, status: string) => void
}) {
  const sourceLabel = contact.source === 'website_admission_inquiry' ? 'Admission' : 'Contact'
  const dateStr = new Date(contact.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <>
      <tr
        className="border-b hover:bg-gray-50 cursor-pointer transition"
        onClick={onToggle}
      >
        <td className="px-4 py-3 font-medium text-gray-900">{contact.name}</td>
        <td className="px-4 py-3 text-gray-600">{contact.email}</td>
        <td className="px-4 py-3 text-gray-600">{contact.phone || '-'}</td>
        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{contact.message}</td>
        <td className="px-4 py-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            contact.source === 'website_admission_inquiry'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {sourceLabel}
          </span>
        </td>
        <td className="px-4 py-3"><StatusBadge status={contact.status} /></td>
        <td className="px-4 py-3 text-gray-500 text-xs">{dateStr}</td>
        <td className="px-4 py-3">
          <button className="text-gray-400 hover:text-gray-600" onClick={e => { e.stopPropagation(); onToggle() }}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={8} className="px-4 py-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Full Message</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.message}</p>
              </div>
              {contact.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{contact.notes}</p>
                </div>
              )}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-gray-500">Change status:</span>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => onStatusChange(contact.id, key)}
                    className={`px-3 py-1 text-xs rounded-full transition ${
                      contact.status === key
                        ? cfg.color + ' font-medium ring-2 ring-offset-1 ring-gray-300'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ==================== Admission Applications Tab ====================

function AdmissionApplicationsTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-6 text-center">
        <ExternalLink className="h-8 w-8 text-gray-300 mx-auto mb-3" />
        <h3 className="font-medium text-gray-900 mb-1">Admission Applications</h3>
        <p className="text-sm text-gray-500 mb-4">
          Website admission applications are managed in the Admissions module.
          Filter by source "Website" to see leads that came through your school website.
        </p>
        <a
          href="/admissions"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
        >
          <ExternalLink className="h-4 w-4" />
          Go to Admissions
        </a>
      </div>
    </div>
  )
}

// ==================== Main Dashboard ====================

type LeadTab = 'contacts' | 'admissions'

export function LeadDashboard() {
  const [activeTab, setActiveTab] = useState<LeadTab>('contacts')
  const { data: stats, isLoading: statsLoading } = useContactStats()

  const totalLeads = stats?.total ?? 0
  const newThisWeek = stats?.byStatus?.new ?? 0
  const contacted = stats?.byStatus?.contacted ?? 0
  const converted = stats?.byStatus?.converted ?? 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Leads"
          value={totalLeads}
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="New"
          value={newThisWeek}
          icon={UserPlus}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          label="Contacted"
          value={contacted}
          icon={MessageCircle}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          label="Converted"
          value={converted}
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
        />
      </div>

      {/* Tab Switch */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 text-sm rounded-md transition ${
            activeTab === 'contacts'
              ? 'bg-white text-gray-900 font-medium shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Contact Inquiries
        </button>
        <button
          onClick={() => setActiveTab('admissions')}
          className={`px-4 py-2 text-sm rounded-md transition ${
            activeTab === 'admissions'
              ? 'bg-white text-gray-900 font-medium shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Admission Applications
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'contacts' && <ContactInquiriesTab />}
      {activeTab === 'admissions' && <AdmissionApplicationsTab />}
    </div>
  )
}
