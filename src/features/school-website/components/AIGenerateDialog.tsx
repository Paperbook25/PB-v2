import { useState, useCallback } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useQueryClient } from '@tanstack/react-query'
import type { TemplateStyle } from '../types/school-website.types'

interface AIGenerateDialogProps {
  pageSlug: string
  onClose: () => void
}

const TEMPLATES: { value: TemplateStyle; label: string; description: string }[] = [
  { value: 'classic', label: 'Classic', description: 'Traditional and formal — great for established schools' },
  { value: 'modern', label: 'Modern', description: 'Fresh and clean — great for progressive schools' },
  { value: 'minimal', label: 'Simple', description: 'Clean and spacious — lets your content shine' },
]

export function AIGenerateDialog({ pageSlug, onClose }: AIGenerateDialogProps) {
  const [template, setTemplate] = useState<TemplateStyle>('classic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const qc = useQueryClient()

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setProgress(0)
    setStatusText('Getting ready...')
    setError(null)

    try {
      const token = useAuthStore.getState().accessToken
      const response = await fetch('/api/school-website/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ pageSlug, template }),
      })

      if (!response.ok) throw new Error(`Request failed: ${response.status}`)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const chunk = JSON.parse(data)
            if (chunk.type === 'progress') {
              setProgress(chunk.progress || 0)
              setStatusText(chunk.content || '')
            }
          } catch { /* skip */ }
        }
      }

      // Invalidate queries to refresh page data
      qc.invalidateQueries({ queryKey: ['website-pages'] })
      qc.invalidateQueries({ queryKey: ['website-page'] })

      setProgress(100)
      setStatusText('Your website is ready!')

      setTimeout(() => onClose(), 1500)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [pageSlug, template, onClose, qc])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Build with AI</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isGenerating ? (
          <>
            <p className="text-sm text-gray-600 mb-5">
              Pick a style and we'll create all the content for your school website automatically. You can edit everything afterwards.
            </p>

            <div className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700">Choose a style</label>
              <div className="space-y-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTemplate(t.value)}
                    className={`w-full p-3.5 border-2 rounded-xl text-left transition ${
                      template === t.value ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900">{t.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="px-5 py-2.5 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center gap-2 font-medium"
              >
                <Sparkles className="h-4 w-4" />
                Build My Website
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4 py-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">{statusText}</p>
            <p className="text-xs text-gray-400 text-center">This usually takes a few seconds</p>
          </div>
        )}
      </div>
    </div>
  )
}
