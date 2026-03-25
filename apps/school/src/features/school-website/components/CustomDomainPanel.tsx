import { useState } from 'react'
import { useDomains, useAddDomain, useVerifyDomain, useDeleteDomain } from '../api/domain.api'
import type { DomainMapping } from '../api/domain.api'
import { Globe, Plus, Trash2, RefreshCw, CheckCircle2, Clock, Copy, AlertCircle } from 'lucide-react'

function StatusBadge({ mapping }: { mapping: DomainMapping }) {
  if (mapping.isVerified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Verified
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  )
}

function DnsInstructions({ mapping }: { mapping: DomainMapping }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  if (mapping.isVerified) return null

  return (
    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm space-y-3">
      <p className="font-medium text-gray-700">DNS Configuration Required</p>

      {/* Step 1: TXT record for verification */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500 font-medium">Step 1: Add a TXT record to verify ownership</p>
        <div className="grid grid-cols-[80px_1fr] gap-2 text-xs">
          <span className="text-gray-500">Type</span>
          <span className="font-mono bg-white px-2 py-1 rounded border">TXT</span>
          <span className="text-gray-500">Name</span>
          <div className="flex items-center gap-1">
            <span className="font-mono bg-white px-2 py-1 rounded border flex-1 truncate">
              _paperbook-verify.{mapping.domain}
            </span>
            <button
              onClick={() => copyToClipboard(`_paperbook-verify.${mapping.domain}`, 'name')}
              className="p-1 hover:bg-gray-200 rounded"
              title="Copy"
            >
              <Copy className="h-3 w-3 text-gray-400" />
            </button>
            {copied === 'name' && <span className="text-green-600 text-[10px]">Copied!</span>}
          </div>
          <span className="text-gray-500">Value</span>
          <div className="flex items-center gap-1">
            <span className="font-mono bg-white px-2 py-1 rounded border flex-1 truncate">
              {mapping.verifyToken}
            </span>
            <button
              onClick={() => copyToClipboard(mapping.verifyToken, 'token')}
              className="p-1 hover:bg-gray-200 rounded"
              title="Copy"
            >
              <Copy className="h-3 w-3 text-gray-400" />
            </button>
            {copied === 'token' && <span className="text-green-600 text-[10px]">Copied!</span>}
          </div>
        </div>
      </div>

      {/* Step 2: CNAME record for routing */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500 font-medium">Step 2: Add a CNAME record to point to PaperBook</p>
        <div className="grid grid-cols-[80px_1fr] gap-2 text-xs">
          <span className="text-gray-500">Type</span>
          <span className="font-mono bg-white px-2 py-1 rounded border">CNAME</span>
          <span className="text-gray-500">Name</span>
          <span className="font-mono bg-white px-2 py-1 rounded border">{mapping.domain}</span>
          <span className="text-gray-500">Value</span>
          <div className="flex items-center gap-1">
            <span className="font-mono bg-white px-2 py-1 rounded border flex-1">
              cname.paperbook.app
            </span>
            <button
              onClick={() => copyToClipboard('cname.paperbook.app', 'cname')}
              className="p-1 hover:bg-gray-200 rounded"
              title="Copy"
            >
              <Copy className="h-3 w-3 text-gray-400" />
            </button>
            {copied === 'cname' && <span className="text-green-600 text-[10px]">Copied!</span>}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        DNS changes can take up to 48 hours to propagate. Click "Verify DNS" once records are added.
      </p>
    </div>
  )
}

export function CustomDomainPanel() {
  const { data: domains, isLoading } = useDomains()
  const addDomain = useAddDomain()
  const verifyDomain = useVerifyDomain()
  const deleteDomain = useDeleteDomain()

  const [newDomain, setNewDomain] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleAdd = () => {
    const trimmed = newDomain.trim()
    if (!trimmed) return
    addDomain.mutate(
      { domain: trimmed },
      {
        onSuccess: (mapping) => {
          setNewDomain('')
          setExpandedId(mapping.id)
        },
      }
    )
  }

  const handleVerify = (id: string) => {
    verifyDomain.mutate(id)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Remove this domain mapping? The domain will no longer point to your school website.')) return
    deleteDomain.mutate(id)
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Custom Domain</h3>
      <p className="text-xs text-gray-400 mb-4">
        Connect your own domain (e.g., www.myschool.edu) to your PaperBook website
      </p>

      {/* Add Domain Form */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="www.myschool.edu"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={addDomain.isPending || !newDomain.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <Plus className="h-4 w-4" />
          Add Domain
        </button>
      </div>

      {addDomain.isError && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {addDomain.error.message}
        </div>
      )}

      {/* Domain List */}
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading domains...</p>
      ) : !domains?.length ? (
        <p className="text-sm text-gray-400">No custom domains configured yet.</p>
      ) : (
        <div className="space-y-3">
          {domains.map((mapping) => (
            <div key={mapping.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{mapping.domain}</span>
                  <StatusBadge mapping={mapping} />
                </div>
                <div className="flex items-center gap-2">
                  {!mapping.isVerified && (
                    <>
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === mapping.id ? null : mapping.id)
                        }
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {expandedId === mapping.id ? 'Hide DNS' : 'Show DNS'}
                      </button>
                      <button
                        onClick={() => handleVerify(mapping.id)}
                        disabled={verifyDomain.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition"
                      >
                        <RefreshCw
                          className={`h-3 w-3 ${verifyDomain.isPending ? 'animate-spin' : ''}`}
                        />
                        Verify DNS
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(mapping.id)}
                    disabled={deleteDomain.isPending}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="Remove domain"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Verification result message */}
              {verifyDomain.isSuccess && verifyDomain.variables === mapping.id && (
                <div
                  className={`mt-2 text-xs px-3 py-2 rounded-lg ${
                    verifyDomain.data.verified
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {verifyDomain.data.message}
                </div>
              )}

              {/* DNS instructions (expanded) */}
              {expandedId === mapping.id && <DnsInstructions mapping={mapping} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
