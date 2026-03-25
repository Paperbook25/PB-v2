import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Sparkles, Globe, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { PageBuilder } from '../components/PageBuilder'
import { WebsiteSettingsPanel } from '../components/WebsiteSettingsPanel'
import { AIGenerateDialog } from '../components/AIGenerateDialog'
import { BlogManager } from '../components/BlogManager'
import { LeadDashboard } from '../components/LeadDashboard'
import { AnalyticsDashboard } from '../components/AnalyticsDashboard'
import { FormAnalyticsDashboard } from '../components/FormAnalyticsDashboard'
import { EmailCampaignManager } from '../components/EmailCampaignManager'
import { useSchoolWebsite } from '../hooks/useSchoolWebsite'
import type { TemplateStyle } from '../types/school-website.types'

const TEMPLATES: { value: TemplateStyle; label: string; description: string; preview: string }[] = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Traditional and formal — navy tones, serif headings, trusted school feel',
    preview: 'bg-gradient-to-br from-blue-900 to-blue-700',
  },
  {
    value: 'modern',
    label: 'Modern',
    description: 'Fresh and clean — card layouts, rounded corners, vibrant colors',
    preview: 'bg-gradient-to-br from-indigo-500 to-purple-500',
  },
  {
    value: 'minimal',
    label: 'Simple',
    description: 'Spacious and elegant — lots of whitespace, your content takes center stage',
    preview: 'bg-gradient-to-br from-gray-100 to-gray-300',
  },
]

type Tab = 'pages' | 'settings' | 'blog' | 'leads' | 'analytics' | 'form-analytics' | 'campaigns'

export function SchoolWebsiteBuilderPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') || 'pages') as Tab
  const setActiveTab = useCallback((tab: Tab) => {
    if (tab === 'pages') {
      // Default tab — remove ?tab param for clean URL
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ tab }, { replace: true })
    }
  }, [setSearchParams])
  const [showAIDialog, setShowAIDialog] = useState(false)
  const { currentPage, hasPages, isLoading } = useSchoolWebsite()

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingTemplate, setGeneratingTemplate] = useState<TemplateStyle | null>(null)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const qc = useQueryClient()

  const handlePickTemplate = useCallback(async (template: TemplateStyle) => {
    setIsGenerating(true)
    setGeneratingTemplate(template)
    setProgress(0)
    setStatusText('Getting ready...')

    try {
      const response = await fetch('/api/school-website/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pageSlug: 'home', template }),
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

      setProgress(100)
      setStatusText('Your website is ready!')

      // Refresh data
      qc.invalidateQueries({ queryKey: ['website-pages'] })
      qc.invalidateQueries({ queryKey: ['website-page'] })
    } catch {
      setStatusText('Something went wrong. Please try again.')
    } finally {
      // Small delay so user sees "ready" state
      setTimeout(() => {
        setIsGenerating(false)
        setGeneratingTemplate(null)
      }, 1500)
    }
  }, [qc])

  // Onboarding: pick a template → one click → done
  if (!isLoading && !hasPages) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-2xl w-full">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create Your School Website
          </h1>
          <p className="text-gray-500 mb-8">
            Pick a style and we'll build everything for you. You can edit it all later.
          </p>

          {!isGenerating ? (
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
              {TEMPLATES.map(t => (
                <button
                  key={t.value}
                  onClick={() => handlePickTemplate(t.value)}
                  className="group text-left border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  <div className={`h-28 ${t.preview} flex items-center justify-center`}>
                    <div className="w-16 h-10 bg-white/20 rounded-lg backdrop-blur-sm" />
                  </div>
                  <div className="p-3.5">
                    <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition">{t.label}</div>
                    <div className="text-xs text-gray-500 mt-1 leading-relaxed">{t.description}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="max-w-sm mx-auto space-y-4">
              <div className={`h-32 ${TEMPLATES.find(t => t.value === generatingTemplate)?.preview} rounded-2xl flex items-center justify-center`}>
                <Sparkles className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{statusText}</p>
              <p className="text-xs text-gray-400">This usually takes a few seconds</p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-8">
            All content is generated from your school profile
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Your School Website</h1>
          <p className="text-sm text-gray-500">Edit your pages and customize how your website looks</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/s/home"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            <Globe className="h-4 w-4" />
            Visit Website
          </a>
          <button
            onClick={() => setShowAIDialog(true)}
            disabled={!currentPage}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            Regenerate with AI
          </button>
        </div>
      </div>

      {/* Content — switched by sidebar ?tab= param */}
      {activeTab === 'pages' && <PageBuilder />}
      {activeTab === 'settings' && (
        <div className="p-6 bg-white border rounded-lg">
          <WebsiteSettingsPanel />
        </div>
      )}
      {activeTab === 'blog' && <BlogManager />}
      {activeTab === 'leads' && <LeadDashboard />}
      {activeTab === 'analytics' && <AnalyticsDashboard />}
      {activeTab === 'form-analytics' && <FormAnalyticsDashboard />}
      {activeTab === 'campaigns' && <EmailCampaignManager />}

      {/* AI Dialog (for regeneration after initial setup) */}
      {showAIDialog && currentPage && (
        <AIGenerateDialog
          pageSlug={currentPage.slug}
          onClose={() => setShowAIDialog(false)}
        />
      )}
    </div>
  )
}
