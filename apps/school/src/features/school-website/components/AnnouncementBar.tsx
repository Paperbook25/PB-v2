import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface AnnouncementBarProps {
  text: string
  link?: string
  accentColor: string
}

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

export function AnnouncementBar({ text, link, accentColor }: AnnouncementBarProps) {
  const dismissKey = `pb-announce-${hashString(text)}`
  const [isDismissed, setIsDismissed] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(dismissKey)
    if (!dismissed) {
      setIsDismissed(false)
      setTimeout(() => setIsVisible(true), 100)
    }
  }, [dismissKey])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      setIsDismissed(true)
      localStorage.setItem(dismissKey, '1')
    }, 300)
  }

  if (isDismissed) return null

  return (
    <div
      className="w-full relative z-[60] transition-all duration-300 ease-out"
      style={{
        backgroundColor: accentColor,
        maxHeight: isVisible ? '52px' : '0px',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-2.5 gap-3">
        {/* Megaphone icon */}
        <svg className="h-4 w-4 text-white/90 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>

        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-white text-xs sm:text-sm font-semibold hover:underline underline-offset-2 tracking-wide uppercase">
            {text}
          </a>
        ) : (
          <span className="text-white text-xs sm:text-sm font-semibold tracking-wide uppercase">
            {text}
          </span>
        )}

        {link && (
          <span className="hidden sm:inline text-white/70 text-xs">→</span>
        )}

        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-4 sm:right-6 lg:right-8 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
