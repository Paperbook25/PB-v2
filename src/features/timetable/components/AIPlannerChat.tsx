import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ChatMessage, QuickAction } from '../types/ai-planner.types'
import { AIPlannerPreview } from './AIPlannerPreview'

interface Props {
  messages: ChatMessage[]
  isStreaming: boolean
  isGenerating: boolean
  onSendMessage: (content: string) => void
  onQuickAction: (action: string) => void
  className?: string
}

export function AIPlannerChat({ messages, isStreaming, isGenerating, onSendMessage, onQuickAction, className }: Props) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isStreaming])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming || isGenerating) return
    onSendMessage(input)
    setInput('')
  }

  const handleQuickAction = (action: QuickAction) => {
    onQuickAction(action.action)
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">AI Timetable Planner</p>
              <p className="text-xs text-gray-500 mt-1">
                Generate schedules, check conflicts, and plan timetables with AI assistance.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
              <QuickActionChip label="Generate timetable" onClick={() => onQuickAction('Generate a timetable for this class')} />
              <QuickActionChip label="Check conflicts" onClick={() => onQuickAction('Check for scheduling conflicts')} />
              <QuickActionChip label="View schedule" onClick={() => onQuickAction('Show me the current schedule')} />
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[85%] rounded-lg px-3 py-2 text-sm',
              msg.role === 'user'
                ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-500/15 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            )}>
              {/* Message text */}
              {msg.content && (
                <div className="whitespace-pre-wrap text-[13px] leading-relaxed">{msg.content}</div>
              )}

              {/* Schedule preview */}
              {msg.schedule && (
                <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                  <AIPlannerPreview schedule={msg.schedule} />
                </div>
              )}

              {/* Quick actions */}
              {msg.quickActions && msg.quickActions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.quickActions.map((qa) => (
                    <QuickActionChip key={qa.label} label={qa.label} onClick={() => handleQuickAction(qa)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {(isStreaming || isGenerating) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
              <span className="text-xs text-gray-500">{isGenerating ? 'Generating schedule...' : 'Thinking...'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about schedules..."
            disabled={isStreaming || isGenerating}
            className="flex-1 h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming || isGenerating}
            className="h-9 w-9 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

function QuickActionChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 transition-colors"
    >
      {label}
    </button>
  )
}
