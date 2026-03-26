import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, ChevronRight, X, Sparkles } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api-client'
import { useState } from 'react'

interface ChecklistItem {
  key: string
  label: string
  done: boolean
  link: string
}

interface ChecklistData {
  items: ChecklistItem[]
  completed: number
  total: number
  dismissed: boolean
}

export function SetupChecklist() {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['onboarding', 'checklist'],
    queryFn: () => apiGet<ChecklistData>('/api/onboarding/checklist'),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading || !data || data.dismissed || dismissed) return null
  if (data.completed === data.total) return null

  const progress = Math.round((data.completed / data.total) * 100)

  const handleDismiss = async () => {
    setDismissed(true)
    try {
      await apiPost('/api/onboarding/skip')
    } catch {
      // Ignore
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-900">Setup Checklist</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {data.completed}/{data.total}
          </span>
        </div>
        <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600" title="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-4">
        <div
          className="h-1.5 bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Items */}
      <div className="space-y-1">
        {data.items.map((item) => (
          <button
            key={item.key}
            onClick={() => !item.done && navigate(item.link)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              item.done
                ? 'opacity-60'
                : 'hover:bg-gray-50 cursor-pointer'
            }`}
          >
            {item.done ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-gray-300 shrink-0" />
            )}
            <span className={`text-sm flex-1 ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
              {item.label}
            </span>
            {!item.done && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
          </button>
        ))}
      </div>
    </div>
  )
}
