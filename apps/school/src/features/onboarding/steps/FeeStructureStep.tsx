import { useState } from 'react'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { apiPost } from '@/lib/api-client'

interface FeeItem {
  name: string
  amount: string
}

const PRESETS: FeeItem[] = [
  { name: 'Tuition Fee', amount: '5000' },
  { name: 'Development Fee', amount: '2000' },
  { name: 'Lab Fee', amount: '1000' },
  { name: 'Library Fee', amount: '500' },
]

export function FeeStructureStep() {
  const [fees, setFees] = useState<FeeItem[]>([
    { name: 'Tuition Fee', amount: '' },
    { name: 'Development Fee', amount: '' },
  ])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const addFee = () => {
    setFees((prev) => [...prev, { name: '', amount: '' }])
    setSaved(false)
  }

  const removeFee = (idx: number) => {
    setFees((prev) => prev.filter((_, i) => i !== idx))
    setSaved(false)
  }

  const updateFee = (idx: number, field: keyof FeeItem, value: string) => {
    setFees((prev) => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f))
    setSaved(false)
  }

  const applyPresets = () => {
    setFees(PRESETS.map((p) => ({ ...p })))
    setSaved(false)
  }

  const handleSave = async () => {
    const validFees = fees.filter((f) => f.name.trim() && f.amount)
    if (validFees.length === 0) return
    setSaving(true)
    try {
      await apiPost('/api/onboarding/quick-setup-fees', {
        feeTypes: validFees.map((f) => ({
          name: f.name.trim(),
          amount: Number(f.amount),
        })),
      })
      setSaved(true)
    } catch {
      // Allow continuing
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Fee Structure</h3>
        </div>
        <button
          onClick={applyPresets}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Use presets
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Define the fee types your school charges. You can customize these later.
      </p>

      <div className="space-y-2">
        {fees.map((fee, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={fee.name}
              onChange={(e) => updateFee(i, 'name', e.target.value)}
              placeholder="Fee name"
              className="flex h-9 flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
              <input
                type="number"
                value={fee.amount}
                onChange={(e) => updateFee(i, 'amount', e.target.value)}
                placeholder="Amount"
                className="flex h-9 w-28 rounded-md border border-gray-300 bg-white pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
            {fees.length > 1 && (
              <button
                onClick={() => removeFee(i)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addFee}
        className="flex items-center gap-1 mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
      >
        <Plus className="h-3.5 w-3.5" /> Add fee type
      </button>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`mt-4 h-8 px-4 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
          saved
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Fee Types'}
      </button>
    </div>
  )
}
