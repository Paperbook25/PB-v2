import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard, MessageSquare, Mail, MessageCircle, Share2,
  CheckCircle, XCircle, AlertCircle, Loader2, Plus, Edit2, Trash2, X, Eye, EyeOff, Zap,
} from 'lucide-react'
import { adminApi } from '../../../lib/api'

interface Integration {
  id: string
  type: string
  name: string
  provider: string
  credentials: Record<string, string>
  settings: Record<string, unknown> | null
  status: 'active' | 'inactive' | 'error'
  isDefault: boolean
  lastTestedAt: string | null
  createdAt: string
  updatedAt: string
}

const INTEGRATION_TYPES = [
  { key: 'payment_gateway', label: 'Payment Gateway', icon: CreditCard, description: 'Collect subscription and invoice payments from schools' },
  { key: 'sms_gateway', label: 'SMS Gateway', icon: MessageSquare, description: 'Send SMS for OTPs, billing reminders, and alerts' },
  { key: 'email_service', label: 'Email Service', icon: Mail, description: 'Transactional emails for invoices, onboarding, and notifications' },
  { key: 'whatsapp_api', label: 'WhatsApp API', icon: MessageCircle, description: 'WhatsApp notifications for billing and platform updates' },
  { key: 'social_media', label: 'Social Media', icon: Share2, description: 'Connect LinkedIn, Facebook, and Twitter/X for one-click blog post sharing' },
]

const PROVIDERS: Record<string, { label: string; fields: { key: string; label: string; secret?: boolean; placeholder?: string }[] }> = {
  razorpay: {
    label: 'Razorpay',
    fields: [
      { key: 'keyId', label: 'Key ID' },
      { key: 'keySecret', label: 'Key Secret', secret: true },
      { key: 'webhookSecret', label: 'Webhook Secret', secret: true },
    ],
  },
  twilio: {
    label: 'Twilio',
    fields: [
      { key: 'accountSid', label: 'Account SID' },
      { key: 'authToken', label: 'Auth Token', secret: true },
      { key: 'fromNumber', label: 'From Number' },
    ],
  },
  msg91: {
    label: 'MSG91',
    fields: [
      { key: 'apiKey', label: 'API Key', secret: true },
      { key: 'senderId', label: 'Sender ID' },
    ],
  },
  resend: {
    label: 'Resend',
    fields: [
      { key: 'apiKey', label: 'API Key', secret: true, placeholder: 're_...' },
      { key: 'fromAddress', label: 'From Address (e.g. PaperBook <noreply@paperbook.app>)' },
    ],
  },
  sendgrid: {
    label: 'SendGrid',
    fields: [
      { key: 'apiKey', label: 'API Key', secret: true },
      { key: 'fromEmail', label: 'From Email' },
      { key: 'fromName', label: 'From Name' },
    ],
  },
  gupshup: {
    label: 'Gupshup',
    fields: [
      { key: 'apiKey', label: 'API Key', secret: true },
      { key: 'appName', label: 'App Name' },
    ],
  },
  linkedin: {
    label: 'LinkedIn (Company Page)',
    fields: [
      { key: 'accessToken', label: 'Access Token', secret: true },
      { key: 'organizationUrn', label: 'Organization URN (urn:li:organization:...)' },
    ],
  },
  facebook: {
    label: 'Facebook (Page)',
    fields: [
      { key: 'pageId', label: 'Page ID' },
      { key: 'pageAccessToken', label: 'Page Access Token', secret: true },
    ],
  },
  twitter: {
    label: 'Twitter / X',
    fields: [
      { key: 'apiKey', label: 'API Key' },
      { key: 'apiSecret', label: 'API Secret', secret: true },
      { key: 'accessToken', label: 'Access Token' },
      { key: 'accessTokenSecret', label: 'Access Token Secret', secret: true },
    ],
  },
}

const TYPE_PROVIDERS: Record<string, string[]> = {
  payment_gateway: ['razorpay'],
  sms_gateway: ['twilio', 'msg91'],
  email_service: ['resend', 'sendgrid'],
  whatsapp_api: ['twilio', 'gupshup'],
  social_media: ['linkedin', 'facebook', 'twitter'],
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    active: { icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200', label: 'Active' },
    inactive: { icon: AlertCircle, color: 'text-gray-500 bg-gray-50 border-gray-200', label: 'Inactive' },
    error: { icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200', label: 'Error' },
  }[status] || { icon: AlertCircle, color: 'text-gray-500 bg-gray-50 border-gray-200', label: status }

  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

function IntegrationForm({ type, integration, onClose }: {
  type: string
  integration: Integration | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const providers = TYPE_PROVIDERS[type] || []
  const [provider, setProvider] = useState(integration?.provider || providers[0] || '')
  const [name, setName] = useState(integration?.name || '')
  const [isDefault, setIsDefault] = useState(integration?.isDefault || false)
  const [credentials, setCredentials] = useState<Record<string, string>>(integration?.credentials || {})
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')

  const saveMut = useMutation({
    mutationFn: (data: any) => integration
      ? adminApi.updatePlatformIntegration(integration.id, data)
      : adminApi.createPlatformIntegration(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'platform-integrations'] })
      onClose()
    },
    onError: (err: any) => setError(err.message || 'Failed to save'),
  })

  const handleSubmit = () => {
    if (!name.trim()) { setError('Name is required'); return }
    if (!provider) { setError('Select a provider'); return }
    const fields = PROVIDERS[provider]?.fields || []
    for (const field of fields) {
      if (!credentials[field.key]) { setError(`${field.label} is required`); return }
    }
    setError('')
    saveMut.mutate({ type, name, provider, credentials, isDefault })
  }

  const providerFields = PROVIDERS[provider]?.fields || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{integration ? 'Edit Integration' : 'Add Integration'}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Razorpay Production"
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {providers.length > 1 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Provider</label>
              <select
                value={provider}
                onChange={e => { setProvider(e.target.value); setCredentials({}) }}
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {providers.map(p => (
                  <option key={p} value={p}>{PROVIDERS[p]?.label || p}</option>
                ))}
              </select>
            </div>
          )}

          {providerFields.map(field => (
            <div key={field.key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{field.label}</label>
              <div className="relative">
                <input
                  type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                  value={credentials[field.key] || ''}
                  onChange={e => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder || (field.secret ? '••••••••••••••••••••' : '')}
                  className="h-9 w-full rounded-lg border bg-background px-3 pr-9 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {field.secret && (
                  <button
                    type="button"
                    onClick={() => setShowSecrets(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecrets[field.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="rounded" />
            <span className="text-foreground">Set as default for this integration type</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saveMut.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saveMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {integration ? 'Save Changes' : 'Add Integration'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function IntegrationsPage() {
  const qc = useQueryClient()
  const [selectedType, setSelectedType] = useState('payment_gateway')
  const [formOpen, setFormOpen] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({})

  const integrationsQuery = useQuery({
    queryKey: ['admin', 'platform-integrations', selectedType],
    queryFn: () => adminApi.listPlatformIntegrations(selectedType),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deletePlatformIntegration(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'platform-integrations'] }),
  })

  const handleTest = async (id: string) => {
    setTestingId(id)
    try {
      const result = await adminApi.testPlatformIntegration(id)
      setTestResults(prev => ({ ...prev, [id]: result }))
      qc.invalidateQueries({ queryKey: ['admin', 'platform-integrations'] })
    } catch (err: any) {
      setTestResults(prev => ({ ...prev, [id]: { success: false, message: err.message || 'Test failed' } }))
    } finally {
      setTestingId(null)
    }
  }

  const openCreate = () => {
    setEditingIntegration(null)
    setFormOpen(true)
  }

  const integrations: Integration[] = integrationsQuery.data || []
  const currentTypeInfo = INTEGRATION_TYPES.find(t => t.key === selectedType)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Configure PaperBook's own API keys for payments, SMS, email, WhatsApp, and social media
        </p>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 border-b pb-0">
        {INTEGRATION_TYPES.map(type => {
          const Icon = type.icon
          return (
            <button
              key={type.key}
              onClick={() => setSelectedType(type.key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                selectedType === type.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {type.label}
            </button>
          )
        })}
      </div>

      {/* Type description + Add button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{currentTypeInfo?.description}</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Integration
        </button>
      </div>

      {/* Integration Cards */}
      {integrationsQuery.isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-lg border bg-card">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : integrations.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border bg-card">
          {currentTypeInfo && (() => { const Icon = currentTypeInfo.icon; return <Icon className="h-10 w-10 text-muted-foreground/30" /> })()}
          <p className="mt-3 text-sm text-muted-foreground">No integrations configured yet</p>
          <button onClick={openCreate} className="mt-3 text-sm text-primary hover:underline">
            Add your first integration
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {integrations.map(integration => {
            const providerInfo = PROVIDERS[integration.provider]
            const testResult = testResults[integration.id]
            return (
              <div key={integration.id} className="rounded-lg border bg-card p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{integration.name}</h3>
                      {integration.isDefault && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{providerInfo?.label || integration.provider}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={integration.status} />
                    <button onClick={() => { setEditingIntegration(integration); setFormOpen(true) }} className="rounded p-1 hover:bg-muted">
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => deleteMut.mutate(integration.id)} className="rounded p-1 hover:bg-muted">
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Masked credentials */}
                {providerInfo?.fields && (
                  <div className="space-y-1.5">
                    {providerInfo.fields.map(field => (
                      <div key={field.key} className="flex items-center gap-2 text-xs">
                        <span className="w-28 shrink-0 text-muted-foreground">{field.label}:</span>
                        <span className="font-mono text-foreground/70">
                          {integration.credentials[field.key] || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Last tested */}
                {integration.lastTestedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last tested: {new Date(integration.lastTestedAt).toLocaleString('en-IN')}
                  </p>
                )}

                {/* Test result */}
                {testResult && (
                  <div className={`flex items-center gap-2 rounded-md p-2.5 text-xs ${
                    testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {testResult.success ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {testResult.message}
                  </div>
                )}

                {/* Actions */}
                <button
                  onClick={() => handleTest(integration.id)}
                  disabled={testingId === integration.id}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
                >
                  {testingId === integration.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                  Test Connection
                </button>
              </div>
            )
          })}
        </div>
      )}

      {formOpen && (
        <IntegrationForm
          type={selectedType}
          integration={editingIntegration}
          onClose={() => { setFormOpen(false); setEditingIntegration(null) }}
        />
      )}
    </div>
  )
}
