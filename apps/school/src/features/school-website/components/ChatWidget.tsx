import { useState, useRef, useEffect, useCallback } from 'react'

interface ChatMessage {
  role: 'user' | 'bot'
  text: string
  timestamp: string
}

interface ChatWidgetProps {
  primaryColor: string
  accentColor: string
  schoolName: string
}

export function ChatWidget({ primaryColor, accentColor, schoolName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: "Hi! I'm here to help. Ask me about admissions, fees, facilities, or anything else!",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'How do I apply for admission?',
    'What are the school fees?',
    'What facilities do you have?',
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      setMessages((prev) => [
        ...prev,
        { role: 'user', text: trimmed, timestamp: new Date().toISOString() },
      ])
      setInput('')
      setIsTyping(true)
      setSuggestedQuestions([])

      try {
        const res = await fetch('/api/public/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ message: trimmed }),
        })
        const data = await res.json()
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: data.data?.answer || "Sorry, I couldn't understand that.",
            timestamp: new Date().toISOString(),
          },
        ])
        if (data.data?.suggestedQuestions) {
          setSuggestedQuestions(data.data.suggestedQuestions)
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: 'Sorry, something went wrong. Please try again.',
            timestamp: new Date().toISOString(),
          },
        ])
      } finally {
        setIsTyping(false)
      }
    },
    []
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Chat animation styles */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatSlideDown {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(16px) scale(0.95); }
        }
        @keyframes chatPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        .chat-panel-enter {
          animation: chatSlideUp 0.25s ease-out forwards;
        }
        .chat-panel-exit {
          animation: chatSlideDown 0.2s ease-in forwards;
        }
      `}</style>

      {/* ====== CHAT PANEL ====== */}
      {isOpen && (
        <div
          className="chat-panel-enter fixed z-50 bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden
            bottom-0 right-0 w-full h-full
            sm:bottom-[88px] sm:right-6 sm:w-[360px] sm:h-[520px] sm:rounded-2xl"
          role="dialog"
          aria-modal="true"
          aria-label={`Chat with ${schoolName}`}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {schoolName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{schoolName}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-white/70 text-xs">Online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                  style={
                    msg.role === 'user'
                      ? {
                          backgroundColor: primaryColor,
                          color: 'white',
                          borderRadius: '18px 18px 4px 18px',
                        }
                      : {
                          backgroundColor: '#f3f4f6',
                          color: '#1f2937',
                          borderRadius: '18px 18px 18px 4px',
                        }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3 flex items-center gap-1"
                  style={{
                    backgroundColor: '#f3f4f6',
                    borderRadius: '18px 18px 18px 4px',
                  }}
                >
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="w-2 h-2 rounded-full bg-gray-400"
                      style={{
                        animation: `typingBounce 1s ease-in-out ${dot * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested questions */}
            {suggestedQuestions.length > 0 && !isTyping && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-100"
                    style={{
                      borderColor: `${primaryColor}30`,
                      color: primaryColor,
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleSubmit} className="shrink-0 px-3 py-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 transition-shadow"
                style={{ '--tw-ring-color': `${primaryColor}40` } as React.CSSProperties}
                disabled={isTyping}
                maxLength={500}
                aria-label="Chat message"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all shrink-0 disabled:opacity-40"
                style={{ backgroundColor: primaryColor }}
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====== FLOATING CHAT BUTTON ====== */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed z-50 shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:shadow-xl hover:scale-105 group"
        style={{
          backgroundColor: accentColor,
          bottom: '88px',
          right: '24px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {/* Pulsing indicator dot */}
        {!isOpen && (
          <span
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
            style={{
              backgroundColor: '#10b981',
              animation: 'chatPulse 2s ease-in-out infinite',
            }}
          />
        )}

        {isOpen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75 0 1.71.44 3.32 1.212 4.725L2.25 21.75l5.025-1.212A9.706 9.706 0 0012 21.75c5.385 0 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z"
            />
          </svg>
        )}
      </button>
    </>
  )
}
