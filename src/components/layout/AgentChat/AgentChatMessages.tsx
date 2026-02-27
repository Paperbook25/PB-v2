import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, User, Loader2, Wrench, AlertCircle } from 'lucide-react'
import type { ChatMessage } from '@/hooks/useAgentChat'

const STARTER_CHIPS = [
  'How many students are active?',
  'Show attendance summary',
  'What are the upcoming events?',
  'List fee collection this month',
]

interface AgentChatMessagesProps {
  messages: ChatMessage[]
  isLoading: boolean
  onStarterClick: (message: string) => void
}

function ToolIndicator({ toolName, status }: { toolName: string; status: 'running' | 'done' }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 py-0.5">
      {status === 'running' ? (
        <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
      ) : (
        <Wrench className="h-3 w-3 text-green-500" />
      )}
      <span className="font-mono">
        {toolName}
        {status === 'running' ? '...' : ' done'}
      </span>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-indigo-100 dark:bg-indigo-900/40'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Tool indicators */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-1 space-y-0.5">
            {message.toolCalls.map((tc, i) => (
              <ToolIndicator key={i} toolName={tc.toolName} status={tc.status} />
            ))}
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              isUser
                ? 'bg-indigo-600 text-white'
                : message.isError
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            }`}
          >
            {isUser ? (
              <p>{message.content}</p>
            ) : message.isError ? (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{message.content}</p>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-table:text-xs prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Streaming indicator */}
        {message.isStreaming && !message.content && message.toolCalls?.length === 0 && (
          <div className="flex items-center gap-1.5 px-3 py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
            <span className="text-xs text-gray-400">Thinking...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function AgentChatMessages({ messages, isLoading, onStarterClick }: AgentChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-3">
          <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Executive Assistant
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
          Ask me anything about students, staff, attendance, calendar, timetable, or finance.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {STARTER_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => onStarterClick(chip)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  )
}
